import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkle, ShieldCheck, Gauge, Eye, Lock, FileText, Download } from "lucide-react";
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
      <HowItWorks />
      <AgentsPreview />
      <LiveExample />
      <Testing />
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
            Private beta — invites going out weekly
          </div>
          <h1 className="font-display text-5xl leading-[1.02] text-foreground md:text-8xl">
            Build entire games
            <br />
            through <em className="italic">conversation</em>.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Describe a game in plain English. Fourteen specialist AI agents design it, write it,
            build it, and test it — then hand you a playable build.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get access
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
              <span className="ml-2 text-xs text-muted-foreground">studio · new project</span>
            </div>
            <div className="grid md:grid-cols-[1fr_320px]">
              <div className="p-8">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Prompt
                </p>
                <p className="mt-3 font-display text-2xl leading-snug text-foreground md:text-3xl">
                  &ldquo;A multiplayer zombie survival game set in a flooded Tokyo, with a
                  weather system that affects horde behavior.&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkle className="size-4" />
                  Studio assembling in 14 roles
                </div>
              </div>
              <aside className="border-t hairline bg-surface p-6 md:border-l md:border-t-0">
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Live activity
                </p>
                <ul className="space-y-3 text-sm">
                  {[
                    ["Executive Producer", "drafted brief"],
                    ["Creative Director", "defined pillars"],
                    ["World Architect", "drawing flooded map"],
                    ["Gameplay Engineer", "wiring horde AI"],
                    ["QA Tester", "queued"],
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
    { icon: Download, label: "Exportable builds", sub: "Take your game with you, any time." },
    { icon: ShieldCheck, label: "Reviewed before you see it", sub: "QA, perf, balance, a11y agents sign off." },
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

function HowItWorks() {
  return (
    <Section>
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

function AgentsPreview() {
  const featured = AGENTS.slice(0, 6);
  return (
    <Section className="bg-surface">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader
          eyebrow="The studio"
          title={<>Fourteen specialists. One shared brief.</>}
          description="Each agent has a job, an output, and a place in the pipeline."
        />
        <Link
          to="/agents"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
        >
          See all 14 agents <ArrowUpRight className="size-4" />
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

function LiveExample() {
  return (
    <Section>
      <SectionHeader
        eyebrow="A real project"
        title={<><em>Umbra Reach</em> — from one prompt.</>}
        description="Six investigators, one collapsing cathedral, infinite ways to die. Every project ships with the same nine artifacts."
      />
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border hairline bg-border md:grid-cols-3">
        {[
          { k: "Vision document", v: "Pillars, references, tone, scope." },
          { k: "Gameplay loop", v: "Core verbs, pacing, reward cadence." },
          { k: "World design", v: "12 zones, 38 named rooms, 4 boss arenas." },
          { k: "Character database", v: "23 named NPCs with full dialogue trees." },
          { k: "Quest structure", v: "6 main + 14 optional, fully wired." },
          { k: "Economy design", v: "Faith currency, ritual exchange rates." },
          { k: "Technical plan", v: "Systems, netcode, save layer." },
          { k: "QA report", v: "0 blockers, 4 nits, 99fps at p99." },
          { k: "Version history", v: "Every change, every agent, every build." },
        ].map(({ k, v }) => (
          <div key={k} className="bg-background p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {k}
            </p>
            <p className="mt-3 text-base text-foreground">{v}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Testing() {
  const agents = [
    { icon: ShieldCheck, name: "QA Tester", what: "Runs scripted and exploratory tests, files reproducible bugs." },
    { icon: Gauge, name: "Performance Engineer", what: "Profiles CPU, GPU, memory. Holds the perf budget." },
    { icon: Sparkle, name: "Balance Specialist", what: "Simulates encounters and metas. Patches dominant strategies." },
    { icon: Eye, name: "Accessibility Agent", what: "Audits contrast, captions, motor input, and reading level." },
  ];
  return (
    <Section className="bg-surface">
      <SectionHeader
        eyebrow="Automated review"
        title={<>Every build is reviewed before you see it.</>}
        description="Four specialist agents sign off on every release. Nothing ships without them."
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

function ShowcasePreview() {
  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader
          eyebrow="Showcase"
          title={<>What people are making.</>}
        />
        <Link
          to="/showcase"
          className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          Browse all <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SHOWCASE.slice(0, 3).map((p) => (
          <article key={p.id} className="group rounded-2xl border hairline p-6 transition-colors hover:bg-surface">
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
    <Section className="bg-surface">
      <SectionHeader
        eyebrow="Pricing"
        title={<>One studio. Three plans.</>}
        align="center"
      />
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
    <Section>
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
          Describe a game. Watch fourteen agents go to work.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
          >
            Get access
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
