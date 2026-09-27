import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CloudRain,
  Droplets,
  Leaf,
  Megaphone,
  Sprout,
  SunMedium,
  Wind,
} from "lucide-react";
import { ProductPage } from "@/components/pages/product-page";

const advice = [
  {
    icon: CloudRain,
    title: "Before expected rain",
    text: "Prepare fields and protect crops from heavy rainfall.",
    color: "border-l-blue-500",
  },
  {
    icon: Droplets,
    title: "After rainfall",
    text: "Check field condition and prevent waterlogging.",
    color: "border-l-emerald-500",
  },
  {
    icon: SunMedium,
    title: "During a dry spell",
    text: "Plan irrigation and manage soil moisture efficiently.",
    color: "border-l-amber-500",
  },
  {
    icon: Wind,
    title: "When winds are strong",
    text: "Protect young plants and farm infrastructure.",
    color: "border-l-violet-500",
  },
];
const impacts = [
  "Delay spraying",
  "Normal operations",
  "Good for field work",
  "Check drainage",
  "Monitor soil moisture",
];

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Farm Advice — GramMausam" },
      {
        name: "description",
        content: "Practical agricultural weather guidance for Dhanbad Panchayat farmers.",
      },
    ],
  }),
  component: FarmAdvicePage,
});

type LiveForecast = {
  predictedRainfallMm: number;
  temperatureC: number;
  advisories: { title: string; message: string }[];
};
function FarmAdvicePage() {
  const [selected, setSelected] = useState<{ code: string; name: string }>();
  const [live, setLive] = useState<LiveForecast>();
  useEffect(() => {
    const raw = localStorage.getItem("grammausam-selected-panchayat");
    if (!raw) return;
    try {
      const item = JSON.parse(raw) as { code: string; name: string };
      setSelected(item);
      fetch(
        `http://127.0.0.1:8000/api/v1/panchayats/${encodeURIComponent(item.code)}/forecast?days=5`,
      )
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((r: { forecast: LiveForecast[] }) => setLive(r.forecast[0]))
        .catch(() => undefined);
    } catch {
      /* ignore */
    }
  }, []);
  const headline = live?.advisories?.[0]?.title ?? "Check weather before spraying.";
  return (
    <ProductPage
      eyebrow={live ? "Live ML forecast → farm action" : "Today's farm advisory"}
      title={selected ? `Farm advice for ${selected.name}` : "Plan field work with the weather"}
      description={
        live
          ? "This guidance is generated from the current Panchayat-adjusted model forecast."
          : "General weather-aware guidance. Select a Dhanbad Panchayat on the dashboard for its live, localised advisory."
      }
    >
      {live && (
        <div className="mb-5 grid gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-primary">ML Panchayat output</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">
              {live.predictedRainfallMm.toFixed(1)} mm
            </p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase text-primary">Temperature</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">
              {live.temperatureC.toFixed(1)}°C
            </p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase text-primary">Model advisory</p>
            <p className="mt-1 text-sm font-extrabold text-primary">{headline}</p>
          </div>
        </div>
      )}
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-card shadow-xl shadow-primary/10">
        <img
          src="/images/farm-advice-hero.png"
          alt="Jharkhand farm under changing monsoon weather"
          className="absolute inset-y-0 right-0 h-full w-[56%] object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-card/10" />
        <div className="relative grid gap-5 p-6 md:grid-cols-[1.3fr_.8fr] md:p-8">
          <div>
            <p className="eyebrow">Today's farm advisory</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              Weather may affect field activities.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Check your Panchayat forecast before spraying, fertilising, irrigation or harvest
              work.
            </p>
            <div className="mt-5 flex flex-wrap gap-5">
              <Stat icon={CloudRain} value="Live" label="Panchayat rain" />
              <Stat icon={CalendarDays} value="5 days" label="Planning window" />
              <Stat icon={Leaf} value="Farm" label="Action guidance" />
            </div>
          </div>
          <aside className="glass-card self-center rounded-2xl bg-[#ecf6ff]/85 p-5">
            <div className="flex items-center gap-2 text-primary">
              <Megaphone className="size-5" />
              <p className="text-[10px] font-extrabold uppercase">Recommended action</p>
            </div>
            <h3 className="mt-2 text-xl font-extrabold">Check weather before spraying.</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Clear field drainage channels</li>
              <li>• Protect harvested produce</li>
              <li>• Reschedule work if rain is likely</li>
            </ul>
            <Link
              to="/"
              className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground"
            >
              Open live forecast
            </Link>
          </aside>
        </div>
      </section>
      <section className="mt-5 grid gap-3 md:grid-cols-4">
        {advice.map(({ icon: Icon, title, text, color }) => (
          <article className={`glass-card border-l-4 ${color} rounded-2xl p-5`} key={title}>
            <Icon className="size-8 text-primary" />
            <h2 className="mt-3 font-extrabold">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{text}</p>
          </article>
        ))}
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.8fr]">
        <article className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
              <Sprout className="size-5 text-primary" />
            </span>
            <div>
              <p className="eyebrow">Detailed guidance</p>
              <h2 className="font-extrabold">Before expected rain</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_.8fr]">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "Clear field drains and channels to avoid waterlogging.",
                "Postpone pesticide or fertiliser application.",
                "Protect harvested produce in covered, dry storage.",
                "Inspect bunds and field boundaries.",
                "Avoid heavy machinery in wet fields.",
              ].map((text) => (
                <li className="flex gap-2" key={text}>
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {text}
                </li>
              ))}
            </ul>
            <img
              src="/images/farm-advice-hero.png"
              alt="Water managed farm field"
              className="h-36 w-full rounded-xl object-cover"
            />
          </div>
        </article>
        <article className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            <div>
              <h2 className="font-extrabold">5-day farm impact</h2>
              <p className="text-xs text-muted-foreground">Guidance changes with forecast</p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-border">
            {impacts.map((item, index) => (
              <div className="flex items-center justify-between py-3 text-sm" key={item}>
                <span className="font-bold">Day {index + 1}</span>
                <span className="text-muted-foreground">Weather update</span>
                <span className="rounded-lg bg-muted px-2 py-1 text-xs font-bold text-primary">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-secondary/40 bg-secondary/15 p-4 text-sm leading-6 text-secondary-foreground">
        <Leaf className="mt-0.5 size-5 shrink-0" />
        <p>
          <strong>Important:</strong> These are general planning recommendations. For severe
          weather, pest outbreaks, or crop-specific decisions, follow official advisories and
          consult local agricultural experts.
        </p>
      </aside>
    </ProductPage>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof CloudRain;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-5 text-primary" />
      <div>
        <p className="font-extrabold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
