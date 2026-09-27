import { ArrowDown, Database, MapPin, SlidersHorizontal } from "lucide-react";
import { DataStatePanel } from "@/components/scientific/data-state";
import type { RainfallIntelligence } from "@/types/monsoon";

const UNAVAILABLE_DATA: RainfallIntelligence = {
  state: "empty",
  locationId: "unselected",
  coverage: "unavailable",
  modelName: "Ridge Residual",
  modelVersion: "Ridge_Residual_v1",
  target: "Panchayat rainfall",
  history: [],
  message: "Select a supported Panchayat to request rainfall intelligence.",
};

type PredictionPanelProps = {
  data?: RainfallIntelligence;
  /** Keeps the panel safe while an older preview module is being hot-replaced. */
  predictions?: RainfallIntelligence;
};

export function PredictionPanel({ data, predictions }: PredictionPanelProps) {
  const intelligence = data ?? predictions ?? UNAVAILABLE_DATA;
  const reference = intelligence.values?.referenceMm;
  const predicted = intelligence.values?.predictedMm;
  const difference = intelligence.values?.differenceMm;
  return (
    <section aria-labelledby="prediction-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">ML downscaling output</p>
          <h2 id="prediction-title" className="section-title">
            From block weather to your Panchayat
          </h2>
        </div>
        <span className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-extrabold uppercase text-primary-foreground">
          Ridge Residual model
        </span>
      </div>
      {intelligence.state !== "success" ? (
        <DataStatePanel
          state={intelligence.state}
          title={
            intelligence.state === "unsupported"
              ? "Choose a Dhanbad Panchayat"
              : "Prediction unavailable"
          }
          message={
            intelligence.state === "unsupported"
              ? "This prototype is trained only for Dhanbad, Jharkhand. Return to Home and select: Jharkhand → Dhanbad → Block → Panchayat (example: Baghmara → BAGDAHA)."
              : intelligence.message
          }
        />
      ) : (
        <div className="scientific-panel grid overflow-hidden lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <Metric
            icon={Database}
            label="Block forecast"
            value={reference === undefined ? "—" : `${reference} mm`}
            note="Weather forecast for nearby area"
          />
          <ArrowDown className="m-auto size-4 rotate-0 text-muted-foreground lg:-rotate-90" />
          <Metric
            icon={SlidersHorizontal}
            label="ML local adjustment"
            value="Terrain + weather"
            note="Model uses local terrain and weather features"
          />
          <ArrowDown className="m-auto size-4 rotate-0 text-muted-foreground lg:-rotate-90" />
          <Metric
            icon={MapPin}
            label="Your Panchayat · ML output"
            value={predicted === undefined ? "—" : `${predicted} mm`}
            note={
              difference === undefined
                ? "Choose a Panchayat"
                : `${difference > 0 ? "+" : ""}${difference.toFixed(1)} mm model adjustment from block forecast`
            }
          />
        </div>
      )}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Database;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="p-5">
      <Icon className="size-4 text-primary" />
      <p className="metric-label mt-4">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
