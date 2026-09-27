import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Cloud,
  CloudRain,
  Droplets,
  Leaf,
  MapPin,
  ThermometerSun,
  Wind,
} from "lucide-react";
import { ProductPage } from "@/components/pages/product-page";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

const previewDays = [
  { day: "Today", note: "Select Panchayat", icon: CloudRain },
  { day: "Day 2", note: "Live forecast", icon: Cloud },
  { day: "Day 3", note: "Live forecast", icon: Cloud },
  { day: "Day 4", note: "Live forecast", icon: CloudRain },
  { day: "Day 5", note: "Live forecast", icon: Cloud },
];

export const Route = createFileRoute("/predictions")({
  head: () => ({
    meta: [
      { title: "5-Day Forecast — GramMausam" },
      { name: "description", content: "Panchayat-level five-day rainfall forecast for Dhanbad." },
    ],
  }),
  component: ForecastPage,
});

type ForecastDay = {
  date: string;
  predictedRainfallMm: number;
  temperatureC: number;
  humidityPercent: number;
  windSpeedMs: number;
};
function ForecastPage() {
  const [selected, setSelected] = useState<{ code: string; name: string }>();
  const [forecast, setForecast] = useState<ForecastDay[]>();
  useEffect(() => {
    const saved = localStorage.getItem("grammausam-selected-panchayat");
    if (!saved) return;
    try {
      const item = JSON.parse(saved) as { code: string; name: string };
      setSelected(item);
      fetch(`${apiBase}/panchayats/${encodeURIComponent(item.code)}/forecast?days=5`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((r: { forecast: ForecastDay[] }) => setForecast(r.forecast))
        .catch(() => undefined);
    } catch {
      /* ignore invalid storage */
    }
  }, []);
  const shownDays =
    forecast?.map((item, index) => ({
      day:
        index === 0
          ? "Today"
          : new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(
              new Date(`${item.date}T12:00:00`),
            ),
      note: `${item.humidityPercent.toFixed(0)}% humidity`,
      icon: item.predictedRainfallMm >= 2 ? CloudRain : Cloud,
      rain: item.predictedRainfallMm,
      temp: item.temperatureC,
    })) ?? previewDays.map((item) => ({ ...item, rain: undefined, temp: undefined }));
  return (
    <ProductPage
      eyebrow="5-day Panchayat forecast"
      title={
        selected ? `Weather forecast for ${selected.name}` : "Weather forecast for your Panchayat"
      }
      description={
        selected
          ? "Live Panchayat-adjusted rainfall forecast with temperature, humidity and wind."
          : "Select a Dhanbad Panchayat on the dashboard to load its live Panchayat-adjusted rainfall, temperature, humidity and wind forecast."
      }
    >
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-card shadow-xl shadow-primary/10">
        <img
          src="/images/farm-advice-hero.png"
          alt="Fields in Dhanbad under changing weather"
          className="absolute inset-y-0 right-0 h-full w-[62%] object-cover object-right opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-card/10" />
        <div className="relative p-6 md:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-primary">
            Dhanbad model coverage
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl">
            A clearer five-day view for field decisions.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Live values appear after selecting Jharkhand → Dhanbad → Block → Panchayat. The cards
            below keep the same decision-ready format used by the forecast dashboard.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/20"
          >
            <MapPin className="size-4" />
            Choose location and view forecast
          </Link>
        </div>
      </section>
      <section className="mt-5 grid gap-3 md:grid-cols-5">
        {shownDays.map(({ day, note, icon: Icon, rain, temp }, index) => (
          <article
            key={day}
            className={`glass-card rounded-2xl p-4 ${index === 0 ? "border-primary/60 bg-[#edf6ff]" : ""}`}
          >
            <p className="text-sm font-extrabold">{day}</p>
            <p className="mt-1 text-[10px] font-bold text-muted-foreground">
              {index === 0 ? "Current day" : "Upcoming day"}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <Icon className="size-10 text-primary stroke-[1.5]" />
              <p className="text-2xl font-extrabold">
                {temp === undefined ? "—" : `${temp.toFixed(0)}°`}
              </p>
            </div>
            <p className="mt-4 border-t border-border pt-3 text-sm font-bold text-primary">
              {rain === undefined ? "—" : rain.toFixed(1)} mm
            </p>
            <p className="mt-1 text-[10px] font-medium text-muted-foreground">{note}</p>
            <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[9px] text-muted-foreground">
              <span>
                <Droplets className="mx-auto size-3 text-primary" />
                rain
              </span>
              <span>
                <Wind className="mx-auto size-3 text-primary" />
                wind
              </span>
              <span>
                <ThermometerSun className="mx-auto size-3 text-primary" />
                temp
              </span>
            </div>
          </article>
        ))}
      </section>
      <section className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_1fr_1fr]">
        <Panel
          icon={BarChart3}
          title="Expected rainfall"
          text="A five-day rainfall graph is displayed after the Panchayat forecast loads."
        />
        <Panel
          icon={ThermometerSun}
          title="Temperature trend"
          text="Daily temperature is supplied with the public weather forecast."
        />
        <Panel
          icon={Wind}
          title="Humidity and wind"
          text="Humidity and wind support practical farm decisions and advisory rules."
        />
      </section>
      <section className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <article className="glass-card rounded-2xl p-6">
          <p className="eyebrow">Local rainfall adjustment</p>
          <h2 className="mt-1 text-xl font-extrabold">From Block forecast to Panchayat estimate</h2>
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] gap-3 text-center">
            <Step label="Block forecast" value="Rainfall input" />
            <span className="self-center text-2xl text-primary">→</span>
            <Step label="Panchayat estimate" value="Model output" />
          </div>
        </article>
        <article className="glass-card rounded-2xl p-6">
          <p className="eyebrow">Daily farm impact</p>
          <h2 className="mt-1 text-xl font-extrabold">Weather-aware planning</h2>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Tip title="Rain" text="Plan spraying" />
            <Tip title="Dry" text="Check moisture" />
            <Tip title="Wind" text="Protect crops" />
          </div>
        </article>
      </section>
    </ProductPage>
  );
}

function Panel({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BarChart3;
  title: string;
  text: string;
}) {
  return (
    <article className="glass-card min-h-44 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-primary" />
        <h2 className="font-extrabold">{title}</h2>
      </div>
      <div className="mt-5 flex h-14 items-end gap-2 border-b border-border px-2">
        {[35, 60, 24, 78, 45].map((height, i) => (
          <span
            key={i}
            className="flex-1 rounded-t bg-primary/70"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{text}</p>
    </article>
  );
}
function Step({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-extrabold">{value}</p>
    </div>
  );
}
function Tip({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl bg-muted p-3 text-center">
      <Leaf className="mx-auto size-4 text-primary" />
      <p className="mt-1 text-xs font-extrabold">{title}</p>
      <p className="text-[10px] text-muted-foreground">{text}</p>
    </div>
  );
}
