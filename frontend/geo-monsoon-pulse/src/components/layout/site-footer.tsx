import { CloudRainWind } from "lucide-react";

const projectFacts = [
  { label: "Project", value: "SIH 2026", mono: true },
  { label: "Team", value: "TEAM_AAGAZ · Silicon University" },
  { label: "Coverage", value: "Dhanbad, Jharkhand" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-deep-panel text-header-foreground" aria-labelledby="footer-brand">
      <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-7 md:grid-cols-[1.4fr_1.5fr_auto] md:items-center lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/10">
            <CloudRainWind className="size-5 text-secondary" />
          </span>
          <div>
            <h2 id="footer-brand" className="text-base font-extrabold">
              GramMausam
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-wide text-header-foreground/60">
              Dhanbad Panchayat weather
            </p>
          </div>
          <p className="ml-3 hidden max-w-48 border-l border-white/15 pl-4 text-xs leading-5 text-header-foreground/65 lg:block">
            Local rainfall intelligence for stronger farm decisions.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-5">
          {projectFacts.map(({ label, value, ...fact }) => (
            <div key={label}>
              <dt className="text-[9px] font-bold uppercase text-header-foreground/50">{label}</dt>
              <dd className={`mt-1 text-xs font-semibold ${"mono" in fact ? "font-mono" : ""}`}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-4 text-xs font-medium text-header-foreground/65 md:justify-end">
          <span>About</span>
          <span>Data sources</span>
          <span>Disclaimer</span>
        </div>
      </div>
    </footer>
  );
}
