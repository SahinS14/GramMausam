import { ShieldCheck } from "lucide-react";
import type { Advisory } from "@/types/monsoon";

export function AlertsList({ advisories = [] }: { advisories?: Advisory[] }) {
  return (
    <section aria-labelledby="alerts-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">ML forecast → farm action</p>
          <h2 id="alerts-title" className="section-title">
            Farm advice for your Panchayat
          </h2>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1.5 text-[10px] font-extrabold uppercase text-secondary-foreground">
          Forecast-driven
        </span>
      </div>
      {advisories.length > 0 ? (
        <div className="grid overflow-hidden rounded-md border border-border bg-card md:grid-cols-2">
          {advisories.map((item) => (
            <article className="p-5" key={`${item.severity}-${item.title}`}>
              <p className="metric-label">{item.severity} priority · model forecast</p>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.message}</p>
            </article>
          ))}
        </div>
      ) : (
        <div
          className="scientific-panel grid min-h-48 place-items-center px-5 py-8 text-center"
          role="status"
        >
          <div className="max-w-lg">
            <ShieldCheck className="mx-auto size-5 text-primary" />
            <p className="metric-label mt-3">Select a Dhanbad Panchayat</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Farm advice appears after a Panchayat forecast is retrieved. It is guidance, not an
              official warning.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
