import { Activity, CloudRain, Database, GitCompareArrows } from "lucide-react";
import type { RainfallIntelligence } from "@/types/monsoon";

export function WeatherSummary({ data }: { data: RainfallIntelligence }) {
  const localChange = data.values?.differenceMm;
  const items = [
    {
      label: "Block forecast",
      value: data.values?.referenceMm === undefined ? "—" : `${data.values.referenceMm} mm`,
      note: "Rain expected nearby",
      icon: Database,
    },
    {
      label: "Your Panchayat",
      value: data.values?.predictedMm === undefined ? "—" : `${data.values.predictedMm} mm`,
      note: "Local rainfall estimate",
      icon: CloudRain,
    },
    {
      label: "Local change",
      value:
        localChange === undefined
          ? "—"
          : `${localChange > 0 ? "+" : ""}${localChange.toFixed(1)} mm`,
      note: "Compared with block forecast",
      icon: GitCompareArrows,
    },
    {
      label: "Forecast",
      value: data.state === "success" ? "Ready" : "Loading",
      note: "Next 5 days",
      icon: Activity,
    },
  ];
  return (
    <section aria-labelledby="conditions-title">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="eyebrow">Today’s local forecast</p>
          <h2 id="conditions-title" className="section-title">
            Will it rain near you?
          </h2>
        </div>
        <p className="max-w-56 text-right text-xs text-muted-foreground">
          Choose a Panchayat to update this view
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ label, value, note, icon: Icon }) => (
          <div
            className="glass-card rounded-2xl p-4 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            key={label}
          >
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase text-muted-foreground">
              <Icon className="size-4 text-primary" />
              {label}
            </div>
            <p className="font-mono text-xl font-semibold text-foreground">{value}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
