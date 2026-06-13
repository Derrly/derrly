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

      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            The studio
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
            Fourteen specialists.
            <br />
            You talk to <em className="italic">one</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            You will never message these agents directly. The Executive Producer routes your
            request, dispatches the right specialists, brokers handoffs, requests reviews, and
            returns one unified answer.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border hairline bg-surface px-4 py-2 text-sm text-foreground">
            <MessageSquare className="size-4" />
            You → Derrly. Derrly → the studio.
          </div>
        </div>
      </section>

      <Section className="bg-surface">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Automatic handoffs
        </p>
        <h2 className="mt-3 font-display text-3xl text-foreground md:text-4xl">
          How work moves between specialists.
        </h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border hairline bg-border md:grid-cols-3">
          {HANDOFFS.map(([from, to, payload]) => (
            <li key={`${from}-${to}`} className="bg-background p-5">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">{from}</span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">{to}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">passes {payload}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          The roster
        </p>
        <h2 className="mt-3 font-display text-3xl text-foreground md:text-4xl">
          Every role on the team.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-16 rounded-2xl border hairline bg-foreground p-8 text-background md:p-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-70">
            Remember
          </p>
          <p className="mt-3 font-display text-3xl leading-snug md:text-4xl">
            You never message a specialist.
            <br />
            You message Derrly. Derrly does the rest.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
          >
            Open the studio
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>
    </>
  );
}
