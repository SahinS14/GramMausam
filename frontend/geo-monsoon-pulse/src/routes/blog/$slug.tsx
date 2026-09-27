import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Leaf } from "lucide-react";

const articles: Record<string, { title: string; intro: string; tips: string[] }> = {
  "prepare-fields-before-rain": {
    title: "Prepare your field before the next rain",
    intro: "A little preparation before rainfall can prevent crop loss and make field work safer.",
    tips: [
      "Clear field drains and outlet channels.",
      "Postpone pesticide and fertiliser application.",
      "Move harvested produce to covered storage.",
      "Inspect bunds and field boundaries.",
    ],
  },
  "rainy-day-crop-care": {
    title: "Rainy-day crop care: avoid waterlogging",
    intro:
      "Standing water can stress roots, especially in young crops. Inspect fields soon after prolonged rain.",
    tips: [
      "Remove standing water from low-lying patches.",
      "Check roots and leaves for rot or disease symptoms.",
      "Avoid heavy machinery on saturated soil.",
      "Monitor weather updates before the next field task.",
    ],
  },
  "smart-irrigation-basics": {
    title: "Smart irrigation for changing weather",
    intro:
      "Irrigation works best when it follows soil conditions and the next few days of weather, not a fixed schedule.",
    tips: [
      "Check soil moisture below the top layer.",
      "Avoid irrigation if useful rain is expected.",
      "Water early morning or evening when possible.",
      "Use only the amount needed by the crop stage.",
    ],
  },
};

export const Route = createFileRoute("/blog/$slug")({ component: BlogDetail });
function BlogDetail() {
  const { slug } = Route.useParams();
  const article = articles[slug] ?? articles["prepare-fields-before-rain"];
  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <img
          src="/images/agri-blog-panorama.png"
          alt="Indian farm weather guidance"
          className="mt-6 h-72 w-full rounded-3xl object-cover"
        />
        <p className="mt-8 text-[11px] font-extrabold uppercase tracking-wide text-primary">
          GramMausam farm guide
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{article.title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{article.intro}</p>
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Leaf className="size-5 text-primary" />
            <h2 className="text-xl font-extrabold">Practical steps</h2>
          </div>
          <ul className="mt-5 space-y-4">
            {article.tips.map((tip) => (
              <li className="flex gap-3 text-sm leading-6 text-muted-foreground" key={tip}>
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-8 rounded-2xl border border-secondary/40 bg-secondary/15 p-4 text-sm leading-6 text-secondary-foreground">
          <strong>Remember:</strong> This is general guidance. Check official warnings and consult
          local agricultural experts for crop-specific decisions.
        </p>
      </article>
    </main>
  );
}
