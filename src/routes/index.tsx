import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  GitBranch,
  ShieldCheck,
  Database,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/site/Section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Derrly — The autonomous AI game studio" },
      {
        name: "description",
        content:
          "Describe a game. An autonomous studio of AI specialists designs, writes, builds, and tests it. You only talk to one Executive Producer.",
      },
      { property: "og:title", content: "Derrly — The autonomous AI game studio" },
      {
        property: "og:description",
        content:
          "One conversation. A full studio behind it. Real artifacts, reviewed before you see them.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <OneConversation />
      <Artifacts />
      <Timeline />
      <Memory />
      <CTA />
    </>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b hairline">
      <div className="absolute inset-0 grid-bg opacity-[0.3]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-24 md:pt-40 md:pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border hairline bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="inline-block size-1.5 rounded-full bg-foreground" />
            One conversation. A full studio behind it.
          </div>
          <h1 className="font-display text-5xl leading-[1.02] text-foreground md:text-8xl">
            The autonomous
            <br />
            <em className="italic">AI game studio</em>.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Describe a game. Specialist agents design it, write it, build it, and test it —
            orchestrated by one Executive Producer. You never manage them.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Open the studio
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              to="/agents"
              className="inline-flex items-center gap-2 rounded-full border hairline px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              See the 14 specialists
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border hairline bg-card shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-2 border-b hairline px-4 py-3">
              <span className="size-2 rounded-full bg-muted-foreground/40" />
              <span className="size-2 rounded-full bg-muted-foreground/40" />
              <span className="size-2 rounded-full bg-muted-foreground/40" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                derrly · flooded-tokyo · run 03
              </span>
            </div>
            <div className="grid md:grid-cols-[1fr_320px]">
              <div className="p-8">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  You
                </p>
                <p className="mt-3 font-display text-2xl leading-snug text-foreground md:text-3xl">
                  &ldquo;A multiplayer zombie survival game set in a flooded Tokyo, with a
                  weather system that affects horde behavior.&rdquo;
                </p>
                <p className="mt-6 text-sm text-muted-foreground">
                  Executive Producer dispatched 9 specialists · 1m 16s elapsed
                </p>
              </div>
              <aside className="border-t hairline bg-surface p-6 md:border-l md:border-t-0">
                <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Live studio activity
                </p>
                <ul className="space-y-3 text-sm">
                  {[
                    ["00:09", "Creative Director", "vision approved"],
                    ["00:21", "World Architect", "12 districts drafted"],
                    ["00:34", "NPC Designer", "23 survivors written"],
                    ["00:47", "Gameplay Engineer", "horde AI wired"],
                    ["01:08", "QA Tester", "balance review running"],
                  ].map(([t, who, what]) => (
                    <li key={who} className="grid grid-cols-[42px_1fr] items-start gap-3">
                      <span className="font-mono text-[11px] text-muted-foreground">{t}</span>
                      <span className="leading-snug">
                        <span className="font-medium text-foreground">{who}</span>{" "}
                        <span className="text-muted-foreground">{what}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── One conversation ───────────────────────── */

function OneConversation() {
  return (
    <Section>
      <div className="grid items-start gap-16 md:grid-cols-[1fr_1.1fr]">
        <SectionHeader
          eyebrow="The principle"
          title={
            <>
              You never manage agents.
              <br />
              You only talk to Derrly.
            </>
          }
          description="Other tools make you stitch together a dozen chatbots. Derrly is one interface. The Executive Producer routes work, shares context, requests reviews, and resolves conflicts between specialists — automatically."
        />
        <div className="rounded-2xl border hairline bg-surface p-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            You said
          </p>
          <div className="mt-3 rounded-xl border hairline bg-background p-4 text-sm text-foreground">
            &ldquo;Continue my zombie survival game. Make the weather rougher.&rdquo;
          </div>
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            What the studio did
          </p>
          <ol className="mt-3 space-y-2 text-sm">
            {[
              ["Executive Producer", "loaded project memory, scoped the change"],
              ["World Architect", "revised storm system parameters"],
              ["Gameplay Engineer", "retuned horde aggression curves"],
              ["Balance Specialist", "simulated 200 encounters, flagged 2 spikes"],
              ["QA Tester", "re-ran scenarios, approved the patch"],
            ].map(([who, what]) => (
              <li
                key={who}
                className="flex items-start gap-3 rounded-lg border hairline bg-background px-3 py-2"
              >
                <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span>
                  <span className="font-medium text-foreground">{who}</span>{" "}
                  <span className="text-muted-foreground">{what}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────────── Artifacts ───────────────────────── */

const ARTIFACTS = [
  {
    type: "Game Design Document",
    by: "Creative Director",
    title: "Flooded Tokyo — Vision",
    excerpt:
      "Pillars: dread, cooperation, weather as antagonist. Players survive in waterlogged districts where the storm dictates pacing. The horde is not the threat — the storm is.",
    meta: ["3 pillars", "11 references", "v2 approved"],
  },
  {
    type: "World Map",
    by: "World Architect",
    title: "12 districts · 4 tidal zones",
    excerpt:
      "Shibuya Crossing (submerged), Ueno Park (refugee camp), Akihabara (signal tower), Tsukiji (food cache). Tidal zones reshape every 18 minutes; safe routes derive from the storm vector.",
    meta: ["12 regions", "38 POIs", "tidal sim"],
  },
  {
    type: "Character Database",
    by: "NPC Designer",
    title: "23 survivors",
    excerpt:
      "Aiko Tanaka — former JR train operator. Knows the tunnel network. Trusts no one over 40. Joins at Ueno. Branching dialogue gated on Refugee Council reputation.",
    meta: ["23 NPCs", "6 factions", "dialogue trees"],
  },
  {
    type: "Quest Tree",
    by: "Quest Designer",
    title: "6 main · 14 optional",
    excerpt:
      "Main arc — The Signal: 6 quests across 3 acts. Critical path branches at Act 2 based on whether the player saves the Tsukiji food cache. Optional arcs unlock on faction reputation.",
    meta: ["20 quests", "3 acts", "2 endings"],
  },
  {
    type: "Systems Blueprint",
    by: "Gameplay Engineer",
    title: "Weather-driven horde AI",
    excerpt:
      "Horde aggression scales with barometric pressure. Storm intensity ∈ [0,1] modulates spawn cadence, group cohesion, and aggression range. Netcode reconciles weather at 4 Hz; combat at 30 Hz.",
    meta: ["systems graph", "netcode plan", "input maps"],
  },
  {
    type: "QA Report",
    by: "QA Tester",
    title: "Pre-release sign-off",
    excerpt:
      "0 blockers. 4 minor (logged). p99 frametime 9.2 ms on target HW. Balance: 1 dominant strategy flagged in Act 2 — patched by Economy Designer in revision 3. Approved for build.",
    meta: ["0 blockers", "99 fps p99", "revision 3"],
  },
];

function Artifacts() {
  return (
    <Section className="bg-surface">
      <SectionHeader
        eyebrow="Real artifacts, not slides"
        title={<>Every project ships deliverables you can open.</>}
        description="A slice from a single project. Each artifact is produced by a specialist, reviewed by the studio, versioned, and yours to export."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ARTIFACTS.map((a) => (
          <article
            key={a.title}
            className="flex flex-col rounded-2xl border hairline bg-background p-6"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border hairline px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {a.type}
              </span>
              <span className="text-xs text-muted-foreground">by {a.by}</span>
            </div>
            <h3 className="mt-4 font-display text-2xl text-foreground">{a.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {a.excerpt}
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {a.meta.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-foreground/[0.04] px-2 py-0.5 text-[11px] text-foreground/70"
                >
                  {m}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ───────────────────────── Timeline ───────────────────────── */

const TIMELINE = [
  { t: "00:00", who: "You", what: "Described a multiplayer zombie survival game in flooded Tokyo." },
  { t: "00:02", who: "Executive Producer", what: "Brief drafted. 9 specialists dispatched." },
  { t: "00:09", who: "Creative Director", what: "Vision approved — weather is the antagonist." },
  { t: "00:21", who: "World Architect", what: "12 districts, 4 tidal zones, storm vector model." },
  { t: "00:34", who: "NPC Designer", what: "23 survivors written with branching dialogue." },
  { t: "00:47", who: "Gameplay Engineer", what: "Horde AI wired to barometric pressure." },
  { t: "01:02", who: "Balance Specialist", what: "Flagged Act 2 dominant strategy. Revision requested." },
  { t: "01:08", who: "Economy Designer", what: "Loot table rebalanced. Revision 3 produced." },
  { t: "01:14", who: "QA Tester", what: "0 blockers. p99 9.2 ms. Approved for build." },
  { t: "01:16", who: "Game Builder", what: "Production package assembled. Ready for review." },
];

function Timeline() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Studio feed"
        title={<>Every action, every revision, on the record.</>}
        description="The studio is transparent on purpose. Scrub the entire run from prompt to approval — see who did what, and why."
      />
      <div className="mt-12 overflow-hidden rounded-2xl border hairline">
        <ol>
          {TIMELINE.map((e, i) => (
            <li
              key={e.t}
              className={`grid grid-cols-[80px_1fr] gap-4 px-6 py-4 text-sm sm:grid-cols-[80px_200px_1fr] ${
                i !== TIMELINE.length - 1 ? "border-b hairline" : ""
              }`}
            >
              <span className="font-mono text-xs text-muted-foreground">{e.t}</span>
              <span className="font-medium text-foreground sm:col-auto">{e.who}</span>
              <span className="col-span-2 text-muted-foreground sm:col-auto">{e.what}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <GitBranch className="size-3.5" /> Version history retained per project
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" /> Every revision signed by the agent that made it
        </span>
      </div>
    </Section>
  );
}

/* ───────────────────────── Memory ───────────────────────── */

function Memory() {
  const remembers = [
    "Vision pillars and tone",
    "Every NPC, faction, and relationship",
    "Active and completed quests",
    "World geography and lore",
    "Systems and balance decisions",
    "Every revision and why it happened",
    "QA history and known issues",
    "Your stylistic preferences",
  ];
  return (
    <Section className="bg-surface">
      <div className="grid items-start gap-16 md:grid-cols-[1.1fr_1fr]">
        <div>
          <SectionHeader
            eyebrow="Project memory"
            title={<>Pick up exactly where you left off.</>}
            description={
              <>
                Say <em>&ldquo;continue my zombie survival game&rdquo;</em> and Derrly remembers
                every decision, every character, every revision. Memory is per-project, private,
                and yours.
              </>
            }
          />
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-full border hairline bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            <Database className="size-4" />
            Start a project
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-2xl border hairline bg-border sm:grid-cols-2">
          {remembers.map((r) => (
            <li key={r} className="flex items-center gap-3 bg-background px-5 py-4 text-sm">
              <Check className="size-4 text-foreground" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ───────────────────────── CTA ───────────────────────── */

function CTA() {
  return (
    <Section className="bg-foreground text-background">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-5xl leading-[1.05] md:text-7xl">
          Your studio is waiting.
        </h2>
        <p className="mt-6 text-lg opacity-80">
          One conversation. Real artifacts. Reviewed before you see them.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
          >
            Open the studio
            <ArrowUpRight className="size-4" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-background/30 px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-background/10"
          >
            See pricing
          </Link>
        </div>
      </div>
    </Section>
  );
}
