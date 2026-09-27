# Dhanbad operational API

Run from the repository root:

```bash
python3 -m uvicorn backend.main:app --reload --port 8000
```

Open `http://127.0.0.1:8000/docs` for the interactive API documentation.

`/api/v1/panchayats/{gpcode}/history` returns historical validation data from the
project dataset. `GET /api/v1/panchayats/{gpcode}/forecast` fetches a 1–7 day
no-auth public weather forecast at the Panchayat's block label point and applies
the Ridge residual downscaling model. `POST /api/v1/predict` accepts a forecast
payload from any future authorised provider. Public forecast results are not IMD
forecasts. Crop advisories are prototype safety rules and must be replaced by
KVK-reviewed crop/stage rules before use.
