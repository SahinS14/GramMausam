import type { StyleSpecification } from "maplibre-gl";
import type { Bounds } from "@/types/geography";

/**
 * A lightweight raster basemap is more robust than a remote vector style on
 * restricted/mobile networks. OpenFreeMap's Natural Earth tiles are public,
 * CORS-enabled, and do not require an API key.
 */
export const MAP_STYLE_URL: StyleSpecification = {
  version: 8,
  sources: {
    naturalEarth: {
      type: "raster",
      tiles: ["https://tiles.openfreemap.org/natural_earth/ne2sr/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    { id: "basemap-background", type: "background", paint: { "background-color": "#edf1f2" } },
    { id: "natural-earth-basemap", type: "raster", source: "naturalEarth" },
  ],
};

/** Boundary-only fallback keeps geographic selection usable if tiles are unavailable. */
export const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
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
