import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Database, MapPinned, Sprout, Waves } from "lucide-react";

const stages = [
  {
    icon: Database,
    number: "01",
    title: "Block weather input",
    text: "Reference rainfall, temperature, humidity, wind and evapotranspiration provide the coarse weather picture.",
  },
  {
    icon: MapPinned,
    number: "02",
    title: "Panchayat context",
    text: "Elevation, slope, land cover and seasonal timing describe what makes each local area different.",
  },
  {
    icon: Waves,
    number: "03",
    title: "Ridge Residual model",
    text: "The model learns the local rainfall adjustment instead of simply repeating the block forecast.",
  },
  {
    icon: Sprout,
    number: "04",
    title: "Farm-ready output",
    text: "The system presents Panchayat rainfall estimates and weather-linked farm guidance.",
  },
];
const facts = [
  ["Coverage", "Dhanbad District, Jharkhand · 10 blocks"],
  ["Model", "Ridge Residual"],
  ["Prediction target", "Panchayat rainfall"],
  ["Operational use", "Planning support, not an official warning"],
];

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "How it works — GramMausam" },
      {
        name: "description",
        content: "How GramMausam downscales block weather to Panchayat rainfall estimates.",
      },
    ],
  }),
  component: () => (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#071b3a] px-4 py-14 text-white lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(58,132,210,.45),transparent_32rem),radial-gradient(circle_at_10%_100%,rgba(34,129,103,.3),transparent_26rem)]" />
        <div className="relative mx-auto max-w-[1400px]">
          <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-emerald-300">
            How GramMausam works
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">
            From block weather to Panchayat-level decisions.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            GramMausam uses a Ridge Residual machine-learning model to add local geographic and
            weather context to a broader block-level forecast.
          </p>
          <div className="mt-8 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-mono text-xs font-bold text-white backdrop-blur">
            REFERENCE WEATHER <span className="text-white/70">→</span> LOCAL FEATURES{" "}
            <span className="text-white/70">→</span> RIDGE RESIDUAL{" "}
            <span className="text-white/70">→</span> PANCHAYAT FORECAST
          </div>
        </div>
      </section>
      <section className="bg-background px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex items-center gap-3">
            <BarChart3 className="size-6 text-emerald-300" />
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-primary">
                The workflow
              </p>
              <h2 className="text-2xl font-extrabold">Four structured stages</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stages.map(({ icon: Icon, number, title, text }) => (
              <article
                className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-primary/10"
                key={number}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-emerald-300/15 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-sm font-bold text-muted-foreground">
                    {number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-extrabold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-muted/35 px-4 py-10 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <article className="rounded-3xl border border-border bg-card p-7">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-300">
              What makes it local?
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">
              A block forecast is not copied unchanged.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              The model uses Panchayat terrain and surface information alongside weather variables
              to learn a residual adjustment. This is why the final Panchayat value can be higher or
              lower than the block forecast.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Tile title="Weather" text="Rainfall, temperature, humidity, wind, ET" />
              <Tile title="Terrain" text="Elevation and slope" />
              <Tile title="Surface" text="Land cover" />
              <Tile title="Time" text="Seasonal feature engineering" />
            </div>
          </article>
          <article className="rounded-3xl border border-emerald-300/25 bg-emerald-300/10 p-7">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-primary">
              Judge-ready transparency
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">
              What the product does—and does not claim.
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-foreground/80">
              <li>✓ Shows the block input, ML adjustment and Panchayat output separately.</li>
              <li>✓ Labels public weather forecast sources and ML-generated results clearly.</li>
              <li>✓ Supports rainfall interpretation and farm planning.</li>
              <li>✕ Does not replace official severe-weather warnings or KVK validation.</li>
            </ul>
          </article>
        </div>
      </section>
      <section className="border-t border-border bg-card px-4 py-8 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(([label, value]) => (
            <div className="border-l border-emerald-300/40 pl-4" key={label}>
              <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  ),
});

function Tile({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-extrabold text-primary">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
