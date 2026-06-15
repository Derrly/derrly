import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, FileText, Map as MapIcon, Users, Layers, ShieldCheck } from "lucide-react";
import { Section } from "@/components/site/Section";
import { SHOWCASE } from "@/lib/derrly-data";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "Showcase — Derrly" },
      {
        name: "description",
        content:
          "Real projects built end-to-end by Derrly's autonomous AI game studio. See the artifacts each run produced.",
      },
      { property: "og:title", content: "Showcase — built with Derrly" },
      {
        property: "og:description",
        content: "Real games shipped through the Derrly pipeline, with the artifacts to prove it.",
      },
    ],
  }),
  component: ShowcasePage,
});

// Per-project proof: what the studio actually produced.
const PROOF: Record<
  string,
  { runtime: string; revisions: number; counts: { regions: number; npcs: number; quests: number; systems: number }; status: string }
> = {
  umbra: {
    runtime: "1h 04m",
    revisions: 4,
    counts: { regions: 9, npcs: 18, quests: 14, systems: 7 },
    status: "Approved for build",
  },
  "neon-haul": {
    runtime: "47m",
    revisions: 2,
    counts: { regions: 6, npcs: 11, quests: 22, systems: 5 },
    status: "Approved for build",
  },
  kelp: {
    runtime: "1h 22m",
    revisions: 5,
    counts: { regions: 8, npcs: 27, quests: 17, systems: 9 },
    status: "Approved for build",
  },
  "after-school": {
    runtime: "39m",
    revisions: 2,
    counts: { regions: 4, npcs: 12, quests: 9, systems: 4 },
    status: "Approved for build",
  },
  vanguard: {
    runtime: "1h 11m",
    revisions: 3,
    counts: { regions: 7, npcs: 14, quests: 19, systems: 8 },
    status: "Approved for build",
  },
  garden: {
    runtime: "52m",
    revisions: 2,
    counts: { regions: 5, npcs: 16, quests: 13, systems: 6 },
    status: "Approved for build",
  },
};

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
            Hand-picked projects from independent studios, solo developers, and weekend hackers —
            all assembled, reviewed, and shipped by the Derrly studio.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-px overflow-hidden rounded-2xl border hairline bg-border md:grid-cols-2">
          {SHOWCASE.map((p) => {
            const proof = PROOF[p.id];
            return (
              <article key={p.id} className="bg-background p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {p.genre}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border hairline px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <ShieldCheck className="size-3" />
                    {proof.status}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-3xl text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>

                <dl className="mt-6 grid grid-cols-4 gap-px overflow-hidden rounded-xl border hairline bg-border text-sm">
                  <Stat icon={MapIcon} label="Regions" value={proof.counts.regions} />
                  <Stat icon={Users} label="NPCs" value={proof.counts.npcs} />
                  <Stat icon={FileText} label="Quests" value={proof.counts.quests} />
                  <Stat icon={Layers} label="Systems" value={proof.counts.systems} />
                </dl>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <span>Run time {proof.runtime}</span>
                  <span>{proof.revisions} revisions</span>
                  <span>by {p.author}</span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-2xl border hairline bg-foreground p-8 text-background md:p-10">
          <p className="font-display text-2xl md:text-3xl">
            Your project is the next one in this list.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
          >
            Open the studio
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </Section>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-background p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 font-display text-2xl text-foreground">{value}</p>
    </div>
  );
}
