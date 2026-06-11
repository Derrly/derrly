import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { ROADMAP } from "@/lib/derrly-data";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — Derrly" },
      {
        name: "description",
        content:
          "Where Derrly is going next: live WebGL builds, voice input, team workspaces, and a marketplace.",
      },
      { property: "og:title", content: "Roadmap — Derrly" },
      {
        property: "og:description",
        content: "Public roadmap for the world's first autonomous AI game studio.",
      },
    ],
  }),
  component: RoadmapPage,
});

const STATUS_COLORS: Record<string, string> = {
  Shipping: "bg-foreground text-background",
  "In progress": "border hairline text-foreground",
  Planned: "text-muted-foreground border hairline",
};

function RoadmapPage() {
  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Roadmap
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
            What we are building next.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A public, opinionated plan. Dates are intent, not commitments.
          </p>
        </div>
      </section>

      <Section>
        <ol className="relative mx-auto max-w-3xl border-l hairline pl-8">
          {ROADMAP.map((r, i) => (
            <li key={i} className="relative mb-12 last:mb-0">
              <span className="absolute -left-[37px] top-2 size-2.5 rounded-full bg-foreground ring-4 ring-background" />
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {r.quarter}
              </p>
              <h3 className="mt-2 font-display text-2xl text-foreground md:text-3xl">
                {r.title}
              </h3>
              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[r.status]}`}
              >
                {r.status}
              </span>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
