import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Section, SectionHeader } from "@/components/site/Section";
import { TIERS, FAQS } from "@/lib/derrly-data";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Derrly" },
      {
        name: "description",
        content:
          "Simple pricing for Derrly's autonomous AI game studio. Free to start, scale when you ship.",
      },
      { property: "og:title", content: "Pricing — Derrly" },
      {
        property: "og:description",
        content: "Three plans. Hobbyist, Studio, Enterprise.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32 md:pb-24 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Pricing
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
            Pay for the studio. Keep the games.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Start free. Move to a paid plan when you want privacy, more agents, or exportable
            builds.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-px overflow-hidden rounded-2xl border hairline bg-border md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col p-10 ${
                t.featured ? "bg-foreground text-background" : "bg-background"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-widest opacity-70">
                {t.name}
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-6xl">{t.price}</span>
                <span className="text-sm opacity-70">{t.cadence}</span>
              </div>
              <p className="mt-3 text-sm opacity-80">{t.blurb}</p>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 opacity-80" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/"
                className={`mt-10 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 ${
                  t.featured ? "bg-background text-foreground" : "bg-foreground text-background"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-surface">
        <SectionHeader eyebrow="Pricing FAQ" title={<>What you might be wondering.</>} />
        <div className="mt-10 divide-y hairline border-y hairline">
          {FAQS.slice(0, 5).map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-medium">
                {f.q}
                <span className="mt-1 size-5 shrink-0 rounded-full border hairline text-center text-sm leading-4 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
