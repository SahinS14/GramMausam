import { INDIA, geographyService } from "@/services/geography-service";
import type { RegionMeta } from "@/types/geography";
import type {
  Advisory,
  CurrentLocationWeather,
  DailyWeatherUpdate,
  RainfallIntelligence,
} from "@/types/monsoon";

/**
 * Rainfall/model access boundary. The backend owns feature engineering and
 * prediction; the browser only requests named Panchayat records.
 */
const resolve = (regionOrId?: RegionMeta | string): RegionMeta => {
  if (!regionOrId) return INDIA;
  if (typeof regionOrId === "string") return geographyService.getRegion(regionOrId) ?? INDIA;
  return regionOrId;
};

export const monsoonService = {
  async getCurrentLocationWeather(
    latitude: number,
    longitude: number,
    signal?: AbortSignal,
  ): Promise<CurrentLocationWeather> {
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    const response = await fetch(
      `${apiBase}/current-weather?latitude=${latitude}&longitude=${longitude}&days=5`,
      { signal },
    );
    if (!response.ok) throw new Error("Current weather is unavailable");
    const payload = (await response.json()) as {
      location: { label: string };
      current: Omit<DailyWeatherUpdate, "date" | "etMm">;
      forecast: DailyWeatherUpdate[];
    };
    return {
      locationLabel: payload.location.label,
      current: payload.current,
      weather: payload.forecast,
    };
  },
  getRainfallIntelligence(region?: RegionMeta | string): RainfallIntelligence {
    const selected = resolve(region);
    const chain = geographyService.getAncestors(selected);
    const inDhanbad = chain.some(
      (item) => item.level === "district" && item.id === "dhanbad--jharkhand",
    );
    const coverage =
      selected.id === "dhanbad--jharkhand" || inDhanbad ? "available" : "unavailable";

    if (coverage === "unavailable") {
      return {
        state: "unsupported",
        locationId: selected.id,
        coverage,
        modelName: "Ridge Residual",
        modelVersion: "Ridge_Residual_v1",
        target: "Panchayat rainfall",
        history: [],
        message: "Model data is not currently available for this location.",
      };
    }
    if (selected.level !== "panchayat") {
      return {
        state: "empty",
        locationId: selected.id,
        coverage,
        modelName: "Ridge Residual",
        modelVersion: "Ridge_Residual_v1",
        target: "Panchayat rainfall",
        history: [],
        message: "Select a Panchayat in Dhanbad to request localized rainfall intelligence.",
      };
    }
    return {
      state: "loading",
      locationId: selected.id,
      coverage,
      modelName: "Ridge Residual",
      modelVersion: "Ridge_Residual_v1",
      target: "Panchayat rainfall",
      history: [],
      message: "Loading Dhanbad Panchayat rainfall data.",
    };
  },

  async getPanchayatHistory(
    region?: RegionMeta | string,
    signal?: AbortSignal,
  ): Promise<RainfallIntelligence> {
    const pending = this.getRainfallIntelligence(region);
    if (pending.coverage === "unavailable" || !region || typeof region === "string") return pending;
    if (region.level !== "panchayat" || !region.code) return pending;
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    try {
      const response = await fetch(
        `${apiBase}/panchayats/${encodeURIComponent(region.code)}/history?days=30`,
        { signal },
      );
      if (!response.ok) throw new Error(`Model API returned ${response.status}`);
      const historical = (await response.json()) as RainfallIntelligence;
      const forecastResponse = await fetch(
        `${apiBase}/panchayats/${encodeURIComponent(region.code)}/forecast?days=5`,
        { signal },
      );
      if (!forecastResponse.ok) return historical;
      const live = (await forecastResponse.json()) as {
        source: string;
        forecast: Array<{
          date: string;
          referenceRainfallMm: number;
          predictedRainfallMm: number;
          temperatureC: number;
          humidityPercent: number;
          windSpeedMs: number;
          etMm: number;
          advisories: Advisory[];
        }>;
      };
      const first = live.forecast[0];
      if (!first) return historical;
      return {
        ...historical,
        values: {
          date: first.date,
          referenceMm: first.referenceRainfallMm,
          predictedMm: first.predictedRainfallMm,
          differenceMm: first.predictedRainfallMm - first.referenceRainfallMm,
        },
        advisories: first.advisories,
        weather: live.forecast.map((day): DailyWeatherUpdate => ({
          date: day.date,
          rainfallMm: day.predictedRainfallMm,
          temperatureC: day.temperatureC,
          humidityPercent: day.humidityPercent,
          windSpeedMs: day.windSpeedMs,
          etMm: day.etMm,
        })),
        history: [
          ...historical.history,
          ...live.forecast.map((day) => ({
            date: day.date,
            referenceMm: day.referenceRainfallMm,
            predictedMm: day.predictedRainfallMm,
          })),
        ],
        message: `Live 5-day prototype forecast via ${live.source}. Panchayat values are model downscaled.`,
      };
    } catch (cause) {
      if (signal?.aborted) throw cause;
      return {
        ...pending,
        state: "error",
        message: "Dhanbad model API is unavailable. Start the FastAPI service on port 8000.",
      };
    }
  },
};
