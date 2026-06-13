import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Section } from "@/components/site/Section";
import { AGENTS } from "@/lib/derrly-data";

const HANDOFFS: Array<[string, string, string]> = [
  ["Executive Producer", "Creative Director", "brief"],
  ["Creative Director", "World Architect", "pillars + tone"],
  ["World Architect", "Narrative Designer", "regions + lore"],
  ["Narrative Designer", "NPC Designer", "story beats"],
  ["NPC Designer", "Quest Designer", "characters + factions"],
  ["Quest Designer", "Gameplay Engineer", "quest graph"],
  ["Gameplay Engineer", "Economy Designer", "systems"],
  ["Economy Designer", "QA Tester", "balance model"],
  ["QA Tester", "Game Builder", "approved package"],
];

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents — Derrly" },
      {
        name: "description",
        content: "Meet the 14 specialist AI agents that make up Derrly's autonomous game studio.",
      },
      { property: "og:title", content: "The Derrly studio — 14 agents" },
      {
        property: "og:description",
        content: "Every specialist your project needs, from Executive Producer to QA Tester.",
      },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            The studio
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
            Fourteen specialists.
            <br />
            You talk to one.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Your Executive Producer coordinates the full studio. Every specialist has a defined
            role, shares project memory, reviews connected work, and produces structured outputs
            automatically.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((a, i) => (
            <article key={a.id} className="rounded-2xl border hairline p-6">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-2xl text-foreground">{a.name}</p>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.role}</p>

              <p className="mt-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Responsibilities
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
                {a.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" />
                    {r}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Outputs
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.outputs.map((o) => (
                  <span key={o} className="rounded-full border hairline px-2.5 py-1 text-xs">
                    {o}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
