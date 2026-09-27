import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays } from "lucide-react";

const posts = [
  {
    slug: "prepare-fields-before-rain",
    title: "Prepare your field before the next rain",
    text: "Drainage, spraying, and harvest tips before a wet spell.",
    position: "object-left",
  },
  {
    slug: "rainy-day-crop-care",
    title: "Rainy-day crop care: avoid waterlogging",
    text: "Simple checks that protect roots and young plants.",
    position: "object-center",
  },
  {
    slug: "smart-irrigation-basics",
    title: "Smart irrigation for changing weather",
    text: "Use soil moisture and the forecast together.",
    position: "object-right",
  },
];

export function FarmBlogSection() {
  return (
    <section className="bg-[#081d3e] px-4 py-10 text-white lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-300">
              Learn for your farm
            </p>
            <h2 className="mt-1 text-3xl font-extrabold">Weather & agriculture guides</h2>
            <p className="mt-2 text-sm text-white/70">
              Practical topics to help farmers plan through changing weather.
            </p>
          </div>
          <Link
            to="/alerts"
            className="rounded-xl border border-white/25 px-4 py-2 text-sm font-bold hover:bg-white/10"
          >
            See farm advice
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="overflow-hidden rounded-3xl bg-white text-foreground shadow-xl shadow-black/20"
            >
              <img
                src="/images/agri-blog-panorama.png"
                alt="Indian farmer and crop field"
                className={`h-44 w-full object-cover ${post.position}`}
              />
              <div className="p-5">
                <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <CalendarDays className="size-4 text-primary" />
                  Farm guide
                </p>
                <h3 className="mt-3 text-xl font-extrabold leading-7">{post.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.text}</p>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-primary"
                >
                  Read guide <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
