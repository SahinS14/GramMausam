import type { StyleSpecification } from "maplibre-gl";
import type { Bounds } from "@/types/geography";

/**
 * OpenFreeMap is browser-accessible without an API key. The previous OSM tile
 * endpoint returns an access-denied response to the deployed dashboard.
 */
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/** Boundary-only fallback keeps geographic selection usable without any tile provider. */
export const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {},
  layers: [
    { id: "basemap-background", type: "background", paint: { "background-color": "#edf1f2" } },
  ],
};

export const INDIA_BOUNDS: Bounds = [
  [68.1, 6.5],
  [97.42, 35.7],
];
export const DEFAULT_CENTER: [number, number] = [82.8, 22.0];
export const DEFAULT_ZOOM = 3.8;
export const MAX_BOUNDS: Bounds = [
  [64.0, 4.0],
  [100.0, 38.5],
];
export const MIN_ZOOM = 3.2;
/** How long to wait for the primary style before switching to the fallback. */
export const STYLE_TIMEOUT_MS = 12000;
export const POINT_ZOOM = { block: 11, panchayat: 13.5 } as const;
export const LABEL_FONT = ["Noto Sans Regular"];
