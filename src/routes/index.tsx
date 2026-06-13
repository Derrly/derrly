import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Sparkle,
  ShieldCheck,
  Gauge,
  Eye,
  Lock,
  FileText,
  Download,
  MessageSquare,
  GitBranch,
  Database,
  ArrowRight,
  Check,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/site/Section";
import { AGENTS, FAQS, PIPELINE, SHOWCASE, TIERS } from "@/lib/derrly-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Derrly — Build entire games through conversation" },
      {
        name: "description",
        content:
          "Describe a game and Derrly's AI studio designs, builds, tests, and ships it. The first autonomous AI game studio.",
      },
      { property: "og:title", content: "Derrly — Build entire games through conversation" },
      {
        property: "og:description",
        content: "An autonomous AI studio that designs, builds, tests, and ships your game.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <OneConversation />
      <HowItWorks />
      <ArtifactGallery />
      <Memory />
      <Timeline />
      <Testing />
      <AgentsPreview />
      <ShowcasePreview />
      <PricingPreview />
      <FAQPreview />
      <CTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-[0.35]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-28 md:pt-40 md:pb-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border hairline bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="inline-block size-1.5 rounded-full bg-foreground" />
            One conversation. A full studio behind it.
          </div>
          <h1 className="font-display text-5xl leading-[1.02] text-foreground md:text-8xl">
            Build entire games
            <br />
            through <em className="italic">conversation</em>.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Describe a game in plain English. An autonomous studio of specialist agents designs it,
            writes it, builds it, and tests it — orchestrated for you by a single Executive Producer.
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
              to="/showcase"
              className="inline-flex items-center gap-2 rounded-full border hairline px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              See what people are making
            </Link>
          </div>
        </div>

        {/* Hero prompt + agent feed */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border hairline bg-card shadow-[0_30px_80px_-40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2 border-b hairline px-4 py-3">
              <span className="size-2 rounded-full bg-muted-foreground/40" />
              <span className="size-2 rounded-full bg-muted-foreground/40" />
              <span className="size-2 rounded-full bg-muted-foreground/40" />
              <span className="ml-2 text-xs text-muted-foreground">
                derrly · flooded-tokyo · run 03
              </span>
            </div>
            <div className="grid md:grid-cols-[1fr_320px]">
              <div className="p-8">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  You
                </p>
                <p className="mt-3 font-display text-2xl leading-snug text-foreground md:text-3xl">
                  &ldquo;A multiplayer zombie survival game set in a flooded Tokyo, with a weather
                  system that affects horde behavior.&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkle className="size-4" />
                  Executive Producer dispatched 9 specialists
                </div>
              </div>
              <aside className="border-t hairline bg-surface p-6 md:border-l md:border-t-0">
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Live studio activity
                </p>
                <ul className="space-y-3 text-sm">
                  {[
                    ["Creative Director", "vision approved"],
                    ["World Architect", "12 districts drafted"],
                    ["NPC Designer", "23 survivors written"],
                    ["Gameplay Engineer", "horde AI wired"],
                    ["QA Tester", "balance review running"],
                  ].map(([who, what]) => (
                    <li key={who} className="flex items-start gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground" />
                      <span>
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

function TrustStrip() {
  const items = [
    { icon: FileText, label: "You own everything", sub: "Worlds, code, characters, builds." },
    { icon: Lock, label: "Private by default", sub: "Your prompts never train shared models." },
    { icon: Download, label: "Exportable artifacts", sub: "Every deliverable is yours to take." },
    {
      icon: ShieldCheck,
      label: "Reviewed before you see it",
      sub: "QA, performance, balance gates.",
    },
  ];
  return (
    <section className="border-t hairline bg-surface">
      <div className="mx-auto grid max-w-7xl gap-px overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="bg-surface p-6">
            <i.icon className="size-5 text-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">{i.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{i.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function OneConversation() {
  return (
    <Section>
      <div className="grid items-start gap-16 md:grid-cols-[1fr_1.1fr]">
        <SectionHeader
          eyebrow="The core principle"
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
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            What you see
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-xl border hairline bg-background p-4">
            <MessageSquare className="size-4 text-foreground" />
            <p className="text-sm text-foreground">
              &ldquo;Continue my zombie survival game. Make the weather rougher.&rdquo;
            </p>
          </div>
          <p className="mt-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            What happens behind it
          </p>
          <ol className="mt-4 space-y-2 text-sm">
            {[
              ["Executive Producer", "loads project memory, scopes the change"],
              ["World Architect", "revises storm system parameters"],
              ["Gameplay Engineer", "retunes horde aggression curves"],
              ["Balance Specialist", "simulates 200 encounters, flags 2 spikes"],
              ["QA Tester", "re-runs scenarios, approves the patch"],
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

function HowItWorks() {
  return (
    <Section className="bg-surface">
      <SectionHeader
        eyebrow="How it works"
        title={<>From a sentence to a playable build.</>}
        description="A pipeline you can watch in real time. Every step has an owner and an output."
      />
      <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl border hairline bg-border md:grid-cols-7">
        {PIPELINE.map((p) => (
          <li key={p.step} className="bg-background p-6">
            <p className="font-mono text-xs text-muted-foreground">{p.step}</p>
            <p className="mt-3 text-sm font-medium text-foreground">{p.agent}</p>
            <p className="mt-1 text-sm text-muted-foreground">{p.output}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const ARTIFACTS = [
  {
    type: "Game Design Document",
    by: "Creative Director",
    title: "Flooded Tokyo — Vision",
    excerpt:
      "Pillars: dread, cooperation, weather as antagonist. Players survive in waterlogged districts where the storm dictates pacing. The horde is not the threat — the storm is. Combat is a punctuation mark inside larger weather acts.",
    meta: ["3 pillars", "11 references", "v2 — approved"],
  },
  {
    type: "World Map",
    by: "World Architect",
    title: "12 districts, 4 tidal zones",
    excerpt:
      "Shibuya Crossing (submerged), Ueno Park (refugee camp), Akihabara (signal tower), Tsukiji (food cache). Tidal zones reshape every 18 minutes. Safe routes are calculated from the storm vector.",
    meta: ["12 regions", "38 POIs", "tidal sim"],
  },
  {
    type: "Character Database",
    by: "NPC Designer",
    title: "23 survivors",
    excerpt:
      "Aiko Tanaka — former JR train operator. Knows the tunnel network. Trusts no one over 40. Joins party at Ueno. Branching dialogue gated on player faction standing with the Refugee Council.",
    meta: ["23 NPCs", "6 factions", "dialogue trees"],
  },
  {
    type: "Quest Tree",
    by: "Quest Designer",
    title: "6 main + 14 optional",
    excerpt:
      "Main arc: The Signal — 6 quests across 3 acts. Critical path branches at Act 2 based on whether the player saves the Tsukiji food cache. Optional arcs unlock based on faction reputation.",
    meta: ["20 quests", "3 acts", "2 endings"],
  },
  {
    type: "Systems Blueprint",
    by: "Gameplay Engineer",
    title: "Weather-driven horde AI",
    excerpt:
      "Horde aggression scales with barometric pressure. Storm intensity ∈ [0,1] modulates spawn cadence, group cohesion, and aggression range. Netcode reconciles weather state at 4 Hz; combat state at 30 Hz.",
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

function ArtifactGallery() {
  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader
          eyebrow="Real artifacts, not slides"
          title={<>Every project ships with deliverables you can open.</>}
          description="A representative slice from a single project. Each artifact is produced by a specialist, reviewed by the studio, and versioned."
        />
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ARTIFACTS.map((a) => (
          <article
            key={a.title}
            className="flex flex-col rounded-2xl border hairline bg-background p-6 transition-colors hover:bg-surface"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border hairline px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {a.type}
              </span>
              <span className="text-xs text-muted-foreground">by {a.by}</span>
            </div>
            <h3 className="mt-4 font-display text-2xl text-foreground">{a.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
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
            title={
              <>
                Pick up exactly where you left off.
              </>
            }
            description={
              <>
                Say <em>&ldquo;continue my zombie survival game&rdquo;</em> and Derrly remembers every
                decision, every character, every revision. Memory is per-project, private, and yours.
              </>
            }
          />
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-full border hairline px-5 py-2.5 text-sm font-medium hover:bg-background"
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
        eyebrow="Studio timeline"
        title={<>Every action, every revision, on the record.</>}
        description="The studio is transparent on purpose. You can scrub the entire run from prompt to approval."
      />
      <div className="mt-12 overflow-hidden rounded-2xl border hairline">
        <ol>
          {TIMELINE.map((e, i) => (
            <li
              key={e.t}
              className={`grid grid-cols-[80px_180px_1fr] items-start gap-4 px-6 py-4 text-sm ${
                i !== TIMELINE.length - 1 ? "border-b hairline" : ""
              }`}
            >
              <span className="font-mono text-xs text-muted-foreground">{e.t}</span>
              <span className="font-medium text-foreground">{e.who}</span>
              <span className="text-muted-foreground">{e.what}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <GitBranch className="size-3.5" /> Version history retained per project
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" /> Every revision is signed by the agent that made it
        </span>
      </div>
    </Section>
  );
}

function Testing() {
  const agents = [
    {
      icon: ShieldCheck,
      name: "QA Tester",
      what: "Runs scripted and exploratory tests, files reproducible bugs.",
    },
    {
      icon: Gauge,
      name: "Performance Engineer",
      what: "Profiles CPU, GPU, memory. Holds the perf budget.",
    },
    {
      icon: Sparkle,
      name: "Balance Specialist",
      what: "Simulates encounters and metas. Patches dominant strategies.",
    },
    {
      icon: Eye,
      name: "Accessibility Agent",
      what: "Audits contrast, captions, motor input, and reading level.",
    },
  ];
  return (
    <Section className="bg-surface">
      <SectionHeader
        eyebrow="Automated review"
        title={<>Nothing reaches you without sign-off.</>}
        description="Four specialist agents gate every build. Failed gates trigger automatic revisions before you ever see the output."
      />
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border hairline bg-border sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((a) => (
          <div key={a.name} className="bg-background p-6">
            <a.icon className="size-5 text-foreground" />
            <p className="mt-4 font-medium text-foreground">{a.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{a.what}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function AgentsPreview() {
  const featured = AGENTS.slice(0, 6);
  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader
          eyebrow="The studio"
          title={<>The specialists behind your single chat.</>}
          description="You will never message them directly. They are listed so you know who is doing the work."
        />
        <Link
          to="/agents"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
        >
          See the full roster <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border hairline bg-border sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((a) => (
          <div key={a.id} className="bg-background p-6">
            <p className="font-display text-2xl text-foreground">{a.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{a.role}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-foreground/80">
              {a.responsibilities.slice(0, 2).map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ShowcasePreview() {
  return (
    <Section className="bg-surface">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader eyebrow="Showcase" title={<>What people are making.</>} />
        <Link
          to="/showcase"
          className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          Browse all <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SHOWCASE.slice(0, 3).map((p) => (
          <article
            key={p.id}
            className="group rounded-2xl border hairline bg-background p-6 transition-colors hover:bg-surface"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.genre}</p>
            <h3 className="mt-3 font-display text-2xl text-foreground">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
            <p className="mt-6 text-xs text-muted-foreground">by {p.author}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function PricingPreview() {
  return (
    <Section>
      <SectionHeader eyebrow="Pricing" title={<>One studio. Three plans.</>} align="center" />
      <div className="mx-auto mt-12 grid max-w-5xl gap-px overflow-hidden rounded-2xl border hairline bg-border md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col p-8 ${t.featured ? "bg-foreground text-background" : "bg-background"}`}
          >
            <p className="text-xs font-medium uppercase tracking-widest opacity-70">{t.name}</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-5xl">{t.price}</span>
              <span className="text-sm opacity-70">{t.cadence}</span>
            </div>
            <p className="mt-3 text-sm opacity-80">{t.blurb}</p>
            <ul className="mt-6 flex-1 space-y-2 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-current opacity-60" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/pricing"
              className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 ${
                t.featured ? "bg-background text-foreground" : "bg-foreground text-background"
              }`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FAQPreview() {
  return (
    <Section className="bg-surface">
      <div className="grid gap-16 md:grid-cols-[1fr_2fr]">
        <SectionHeader eyebrow="FAQ" title={<>Common questions.</>} />
        <div className="divide-y hairline border-y hairline">
          {FAQS.slice(0, 4).map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-medium text-foreground">
                {f.q}
                <span className="mt-1 size-5 shrink-0 rounded-full border hairline text-center text-sm leading-4 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
          <div className="pt-6">
            <Link
              to="/faq"
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              See all questions <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

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
