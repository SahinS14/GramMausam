export type { Bounds, RegionLevel, RegionMeta, RegionSelection } from "@/types/geography";

export type DataState = "loading" | "success" | "empty" | "unsupported" | "error";

export interface RainfallPoint {
  date: string;
  referenceMm?: number;
  predictedMm?: number;
  observedMm?: number;
  cumulativeMm?: number;
}

export interface RainfallValues {
  referenceMm?: number;
  predictedMm?: number;
  differenceMm?: number;
  observedMm?: number;
  date?: string;
}

export interface Advisory {
  severity: "low" | "medium" | "high";
  title: string;
  message: string;
}

export interface DailyWeatherUpdate {
  date: string;
  rainfallMm: number;
  temperatureC: number;
  humidityPercent: number;
  windSpeedMs: number;
  etMm: number;
}

export interface CurrentLocationWeather {
  locationLabel: string;
  weather: DailyWeatherUpdate[];
  current: Omit<DailyWeatherUpdate, "date" | "etMm">;
}

export interface RainfallIntelligence {
  state: DataState;
  locationId: string;
  coverage: "available" | "unavailable";
  modelName: "Ridge Residual";
  modelVersion: "Ridge_Residual_v1";
  target: "Panchayat rainfall";
  values?: RainfallValues;
  advisories?: Advisory[];
  weather?: DailyWeatherUpdate[];
  history: RainfallPoint[];
  message: string;
}
