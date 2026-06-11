import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { SHOWCASE } from "@/lib/derrly-data";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "Showcase — Derrly" },
      {
        name: "description",
        content: "Featured projects built end-to-end by Derrly's autonomous AI game studio.",
      },
      { property: "og:title", content: "Showcase — built with Derrly" },
      {
        property: "og:description",
        content: "Real games shipped through the Derrly pipeline.",
      },
    ],
  }),
  component: ShowcasePage,
});

function ShowcasePage() {
  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Showcase
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
            Built with Derrly.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Hand-picked projects from independent studios, solo developers, and weekend
            hackers — all assembled, tested, and shipped by the Derrly studio.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col rounded-2xl border hairline p-6 transition-colors hover:bg-surface"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border hairline bg-background">
                <div className="grid h-full place-items-center bg-surface">
                  <span className="font-display text-5xl text-foreground/70">
                    {p.title.split(" ").map((w) => w[0]).join("")}
                  </span>
                </div>
              </div>
              <p className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">
                {p.genre}
              </p>
              <h3 className="mt-2 font-display text-2xl text-foreground">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.blurb}</p>
              <p className="mt-6 text-xs text-muted-foreground">by {p.author}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
