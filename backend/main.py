"""Dhanbad Panchayat rainfall downscaling API.

This service exposes the trained Ridge residual model and the historical
Dhanbad data catalogue.  Historical endpoints are explicitly labelled as
historical validation data; live forecasts must be supplied through /predict
from an authorised operational forecast provider.
"""
from __future__ import annotations

from datetime import date
import json
from pathlib import Path
from typing import Literal
from urllib.parse import urlencode
from urllib.request import urlopen

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "master_dataset_v2.csv"
MODEL_PATH = ROOT / "ml" / "models" / "Ridge_residual.joblib"
BLOCKS_PATH = ROOT / "frontend" / "geo-monsoon-pulse" / "public" / "geo" / "blocks" / "dhanbad--jharkhand.json"

FEATURES = [
    "TEMPERATURE", "HUMIDITY", "WIND", "ET", "ELEVATION", "SLOPE", "LANDCOVER",
    "MONTH", "DAY_OF_YEAR", "SIN_DOY", "COS_DOY", "MONSOON_FLAG",
    "REFERENCE_RAINFALL", "LOG_REFERENCE_RAINFALL", "REFERENCE_RAIN_EVENT",
]

app = FastAPI(title="Dhanbad Panchayat Downscaling API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ForecastInput(BaseModel):
    gpcode: str = Field(pattern=r"^\d+$")
    valid_date: date
    reference_rainfall_mm: float = Field(ge=0)
    temperature_c: float = Field(ge=-30, le=60)
    humidity_percent: float = Field(ge=0, le=100)
    wind_speed_ms: float = Field(ge=0, le=80)
    et_mm: float = Field(ge=0, le=30)
    source: str = "Operational forecast"


def _features(frame: pd.DataFrame) -> pd.DataFrame:
    result = frame.copy()
    result["DATE"] = pd.to_datetime(result["DATE"])
    result["MONTH"] = result["DATE"].dt.month
    result["DAY_OF_YEAR"] = result["DATE"].dt.dayofyear
    result["SIN_DOY"] = np.sin(2 * np.pi * result["DAY_OF_YEAR"] / 365.25)
    result["COS_DOY"] = np.cos(2 * np.pi * result["DAY_OF_YEAR"] / 365.25)
    result["MONSOON_FLAG"] = result["MONTH"].isin([6, 7, 8, 9]).astype(int)
    result["LOG_REFERENCE_RAINFALL"] = np.log1p(np.maximum(0, result["REFERENCE_RAINFALL"]))
    result["REFERENCE_RAIN_EVENT"] = (result["REFERENCE_RAINFALL"] >= 0.1).astype(float)
    return result


def _predict(frame: pd.DataFrame) -> np.ndarray:
    model = get_model()
    residual = model.predict(_features(frame)[FEATURES].values)
    return np.clip(frame["REFERENCE_RAINFALL"].to_numpy() + residual, 0, None)


_data: pd.DataFrame | None = None
_model = None


def get_data() -> pd.DataFrame:
    global _data
    if _data is None:
        if not DATA_PATH.exists():
            raise RuntimeError(f"Dataset missing: {DATA_PATH}")
        _data = pd.read_csv(DATA_PATH, parse_dates=["DATE"], dtype={"GPCODE": str})
    return _data


def get_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise RuntimeError(f"Model missing: {MODEL_PATH}")
        _model = joblib.load(MODEL_PATH)
    return _model


def advisory(predicted: float, wind: float, month: int) -> list[dict[str, str]]:
    """Prototype safety rules; replace with KVK-reviewed crop-stage rules before deployment."""
    items: list[dict[str, str]] = []
    if predicted >= 65:
        items.append({"severity": "high", "title": "Heavy rainfall risk", "message": "Ensure field drainage; postpone fertiliser and pesticide application; protect harvested produce."})
    elif predicted >= 15:
        items.append({"severity": "medium", "title": "Useful rainfall expected", "message": "Check drainage before irrigation and avoid pesticide spraying during rainfall."})
    elif predicted < 2 and month in [6, 7, 8, 9]:
        items.append({"severity": "medium", "title": "Short dry spell", "message": "Inspect soil moisture and plan need-based irrigation where available."})
    if wind >= 10:
        items.append({"severity": "high", "title": "Strong wind risk", "message": "Avoid spraying; secure nursery structures and support vulnerable crops."})
    if not items:
        items.append({"severity": "low", "title": "No threshold alert", "message": "Continue normal field monitoring. Advisory rules require KVK validation before farmer deployment."})
    return items


def get_block_locations() -> dict[str, tuple[float, float]]:
    """Returns block name -> (latitude, longitude) from the checked-in LGD map."""
    raw = json.loads(BLOCKS_PATH.read_text(encoding="utf-8"))
    return {
        feature["properties"]["name"]: (
            float(feature["properties"]["labelLat"]),
            float(feature["properties"]["labelLon"]),
        )
        for feature in raw["features"]
    }


def public_forecast(block: str, days: int) -> list[dict[str, float | str]]:
    """Fetches a no-auth public forecast at the official block map label point."""
    location = get_block_locations().get(block)
    if location is None:
        raise HTTPException(404, f"No mapped location for block {block}")
    lat, lon = location
    query = urlencode({
        "latitude": lat,
        "longitude": lon,
        "daily": "precipitation_sum,temperature_2m_mean,relative_humidity_2m_mean,wind_speed_10m_max,et0_fao_evapotranspiration",
        "timezone": "Asia/Kolkata",
        "forecast_days": days,
    })
    try:
        with urlopen(f"https://api.open-meteo.com/v1/forecast?{query}", timeout=20) as response:
            daily = json.load(response)["daily"]
    except Exception as exc:
        raise HTTPException(502, "Public forecast provider is unavailable") from exc
    return [
        {
            "date": daily["time"][i],
            "referenceRainfallMm": float(daily["precipitation_sum"][i] or 0),
            "temperatureC": float(daily["temperature_2m_mean"][i] or 0),
            "humidityPercent": float(daily["relative_humidity_2m_mean"][i] or 0),
            "windSpeedMs": float(daily["wind_speed_10m_max"][i] or 0) / 3.6,
            "etMm": float(daily["et0_fao_evapotranspiration"][i] or 0),
        }
        for i in range(len(daily["time"]))
    ]


@app.get("/api/v1/current-weather")
def current_weather(latitude: float, longitude: float, days: int = 5):
    """No-auth public weather for the visitor's browser location; never downscaled."""
    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180) or not 1 <= days <= 7:
        raise HTTPException(422, "Invalid coordinates or forecast days")
    query = urlencode({
        "latitude": latitude, "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
        "daily": "precipitation_sum,temperature_2m_mean,relative_humidity_2m_mean,wind_speed_10m_max,et0_fao_evapotranspiration",
        "timezone": "auto", "forecast_days": days,
    })
    try:
        with urlopen(f"https://api.open-meteo.com/v1/forecast?{query}", timeout=20) as response:
            payload = json.load(response)
    except Exception as exc:
        raise HTTPException(502, "Public forecast provider is unavailable") from exc
    daily = payload["daily"]
    current = payload["current"]
    return {
        "source": "Open-Meteo public weather forecast (not IMD)",
        "location": {"label": f"Current location ({latitude:.3f}°, {longitude:.3f}°)", "latitude": latitude, "longitude": longitude},
        "current": {"temperatureC": float(current["temperature_2m"] or 0), "humidityPercent": float(current["relative_humidity_2m"] or 0), "rainfallMm": float(current["precipitation"] or 0), "windSpeedMs": float(current["wind_speed_10m"] or 0) / 3.6, "weatherCode": int(current["weather_code"] or 0)},
        "forecast": [{"date": daily["time"][i], "rainfallMm": float(daily["precipitation_sum"][i] or 0), "temperatureC": float(daily["temperature_2m_mean"][i] or 0), "humidityPercent": float(daily["relative_humidity_2m_mean"][i] or 0), "windSpeedMs": float(daily["wind_speed_10m_max"][i] or 0) / 3.6, "etMm": float(daily["et0_fao_evapotranspiration"][i] or 0)} for i in range(len(daily["time"]))],
    }


@app.get("/health")
def health():
    data = get_data()
    get_model()
    return {"status": "ok", "district": "Dhanbad", "panchayats": int(data.GPCODE.nunique()), "model": "Ridge_Residual"}


@app.get("/api/v1/panchayats")
def panchayats():
    data = get_data()
    rows = data[["GPCODE", "GPNAME", "BLOCK"]].drop_duplicates().sort_values(["BLOCK", "GPNAME"])
    return {"items": [{"gpcode": r.GPCODE, "name": r.GPNAME, "block": r.BLOCK} for r in rows.itertuples(index=False)]}


@app.get("/api/v1/panchayats/{gpcode}/history")
def history(gpcode: str, days: int = 30):
    if not 1 <= days <= 365:
        raise HTTPException(422, "days must be between 1 and 365")
    gp = get_data().loc[lambda d: d.GPCODE == gpcode].copy().sort_values("DATE")
    if gp.empty:
        raise HTTPException(404, "Unknown Dhanbad GPCODE")
    gp = gp.tail(days)
    predicted = _predict(gp)
    latest = gp.iloc[-1]
    latest_predicted = float(predicted[-1])
    return {
        "state": "success",
        "coverage": "available",
        "modelName": "Ridge Residual",
        "modelVersion": "Ridge_Residual_v1",
        "target": "Panchayat rainfall",
        "message": "Historical model validation data through 2024-12-31; not a live forecast.",
        "panchayat": {"gpcode": gpcode, "name": latest.GPNAME, "block": latest.BLOCK},
        "values": {
            "date": latest.DATE.strftime("%Y-%m-%d"),
            "referenceMm": round(float(latest.REFERENCE_RAINFALL), 2),
            "predictedMm": round(latest_predicted, 2),
            "differenceMm": round(latest_predicted - float(latest.REFERENCE_RAINFALL), 2),
            "observedMm": None if pd.isna(latest.RAINFALL) else round(float(latest.RAINFALL), 2),
        },
        "history": [
            {"date": r.DATE.strftime("%Y-%m-%d"), "referenceMm": round(float(r.REFERENCE_RAINFALL), 2), "predictedMm": round(float(p), 2), "observedMm": None if pd.isna(r.RAINFALL) else round(float(r.RAINFALL), 2)}
            for r, p in zip(gp.itertuples(index=False), predicted)
        ],
    }


@app.post("/api/v1/predict")
def predict(payload: ForecastInput):
    meta = get_data().loc[lambda d: d.GPCODE == payload.gpcode, ["GPCODE", "GPNAME", "BLOCK", "ELEVATION", "SLOPE", "LANDCOVER"]].drop_duplicates()
    if meta.empty:
        raise HTTPException(404, "Unknown Dhanbad GPCODE")
    row = meta.iloc[0]
    frame = pd.DataFrame([{
        "DATE": pd.Timestamp(payload.valid_date), "REFERENCE_RAINFALL": payload.reference_rainfall_mm,
        "TEMPERATURE": payload.temperature_c, "HUMIDITY": payload.humidity_percent,
        "WIND": payload.wind_speed_ms, "ET": payload.et_mm,
        "ELEVATION": row.ELEVATION, "SLOPE": row.SLOPE, "LANDCOVER": row.LANDCOVER,
    }])
    rainfall = float(_predict(frame)[0])
    return {
        "panchayat": {"gpcode": payload.gpcode, "name": row.GPNAME, "block": row.BLOCK},
        "validDate": str(payload.valid_date), "source": payload.source,
        "referenceRainfallMm": round(payload.reference_rainfall_mm, 2),
        "predictedRainfallMm": round(rainfall, 2),
        "advisoryStatus": "prototype_rules_require_kvk_validation",
        "advisories": advisory(rainfall, payload.wind_speed_ms, payload.valid_date.month),
    }


@app.get("/api/v1/panchayats/{gpcode}/forecast")
def forecast(gpcode: str, days: int = 5):
    """Public-source 1–7 day block forecast downscaled to one Panchayat."""
    if not 1 <= days <= 7:
        raise HTTPException(422, "days must be between 1 and 7")
    meta = get_data().loc[lambda d: d.GPCODE == gpcode, ["GPCODE", "GPNAME", "BLOCK", "ELEVATION", "SLOPE", "LANDCOVER"]].drop_duplicates()
    if meta.empty:
        raise HTTPException(404, "Unknown Dhanbad GPCODE")
    row = meta.iloc[0]
    weather = public_forecast(str(row.BLOCK), days)
    frame = pd.DataFrame([{
        "DATE": item["date"], "REFERENCE_RAINFALL": item["referenceRainfallMm"],
        "TEMPERATURE": item["temperatureC"], "HUMIDITY": item["humidityPercent"],
        "WIND": item["windSpeedMs"], "ET": item["etMm"],
        "ELEVATION": row.ELEVATION, "SLOPE": row.SLOPE, "LANDCOVER": row.LANDCOVER,
    } for item in weather])
    predicted = _predict(frame)
    forecasts = []
    for item, value in zip(weather, predicted):
        forecasts.append({
            "date": item["date"], "referenceRainfallMm": round(float(item["referenceRainfallMm"]), 2),
            "predictedRainfallMm": round(float(value), 2),
            "temperatureC": round(float(item["temperatureC"]), 1),
            "humidityPercent": round(float(item["humidityPercent"]), 1),
            "windSpeedMs": round(float(item["windSpeedMs"]), 1),
            "etMm": round(float(item["etMm"]), 2),
            "advisories": advisory(float(value), float(item["windSpeedMs"]), pd.Timestamp(item["date"]).month),
        })
    return {
        "state": "success", "source": "Open-Meteo public weather forecast (not IMD)",
        "model": "Ridge_Residual", "advisoryStatus": "prototype_rules_require_kvk_validation",
        "panchayat": {"gpcode": gpcode, "name": row.GPNAME, "block": row.BLOCK},
        "forecast": forecasts,
    }
