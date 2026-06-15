import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Plus, Loader2, X, Activity, Hammer, ShieldCheck } from "lucide-react";

import { listProjects, createProject } from "@/lib/studio.functions";
import { Button } from "@/components/ui/button";

const EXAMPLES = [
  {
    title: "Umbra Reach",
    prompt:
      "A co-op stealth heist game set in a brutalist megacity where shadows are a resource you can spend.",
  },
  {
    title: "Tide of Kyoto",
    prompt:
      "A multiplayer zombie survival game in a flooded Tokyo with a weather system that shapes horde behavior.",
  },
  {
    title: "Glassmaker",
    prompt:
      "A cozy single-player crafting sim where you blow glass instruments and tune a haunted village's music.",
  },
];

export const Route = createFileRoute("/_authenticated/app/")({
  component: Dashboard,
});

function Dashboard() {
  const list = useServerFn(listProjects);
  const create = useServerFn(createProject);
  const navigate = useNavigate();
  const router = useRouter();

  const projects = useQuery({
    queryKey: ["projects"],
    queryFn: () => list(),
  });

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const visibleProjects = (projects.data ?? []).filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const { id } = await create({ data: { title: title.trim(), prompt: prompt.trim() } });
      setTitle("");
      setPrompt("");
      await router.invalidate();
      navigate({ to: "/app/projects/$projectId", params: { projectId: id } });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <OnboardingCard />
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Your studio
      </p>

      <h1 className="mt-4 font-display text-5xl text-foreground md:text-6xl">
        What are we building today?
      </h1>

      <form onSubmit={handleCreate} className="mt-10 rounded-2xl border hairline bg-card p-6">
        <label
          htmlFor="project-title"
          className="block text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          Project title
        </label>
        <input
          id="project-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Umbra Reach"
          className="mt-2 w-full bg-transparent text-2xl font-display text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <label
          htmlFor="project-pitch"
          className="mt-6 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          One-sentence pitch
        </label>
        <textarea
          id="project-pitch"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="A multiplayer zombie survival game set in a flooded Tokyo, with a weather system that affects horde behavior."
          className="mt-2 w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <div className="mt-4 flex justify-end">
          <Button
            type="submit"
            disabled={busy || !title.trim() || !prompt.trim()}
            className="rounded-full px-5"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Spin up studio
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Need a spark?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.title}
              type="button"
              onClick={() => {
                setTitle(ex.title);
                setPrompt(ex.prompt);
              }}
              className="rounded-full border hairline px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {ex.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Portfolio command</p>
            <h2 className="mt-2 font-display text-3xl text-foreground">Active productions</h2>
          </div>
          <label className="w-full sm:w-64">
            <span className="sr-only">Search projects</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search productions…" className="h-9 w-full rounded-full border hairline bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </label>
        </div>
        {projects.isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : visibleProjects.length > 0 ? (
          <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border hairline bg-hairline lg:grid-cols-2">
            {visibleProjects.map((p) => {
              const health = p.intelligence?.health_score ?? (p.status === "ready" ? 75 : 20);
              const progress = p.intelligence?.progress_percent ?? (p.status === "ready" ? 100 : 10);
              return <li key={p.id} className="bg-background">
                <Link
                  to="/app/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="group block p-5 transition-colors hover:bg-surface"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display text-2xl text-foreground">{p.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.prompt}</p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t hairline pt-4 text-xs sm:grid-cols-4">
                    <Metric icon={Activity} label="Health" value={`${health}%`} />
                    <Metric icon={Circle} label="Agent" value={p.activity?.status === "active" ? p.activity.agent.replaceAll("-", " ") : "Standing by"} />
                    <Metric icon={Hammer} label="Build" value={p.build?.status ?? "Pending"} />
                    <Metric icon={ShieldCheck} label="QA" value={p.run?.phase === "approved" ? "Approved" : p.run?.status ?? "Pending"} />
                  </div>
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full bg-foreground" style={{ width: `${progress}%` }} /></div>
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">{progress}% production complete · {p.run?.revision_count ?? 0} revisions</p>
                </Link>
              </li>;
            })}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            No projects yet. Describe one above to assemble your first studio.
          </p>
        )}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return <div className="min-w-0"><p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground"><Icon className="size-3" />{label}</p><p className="mt-1 truncate capitalize text-foreground">{value}</p></div>;
}

const STEPS = [
  { n: "01", t: "Describe a game", d: "One sentence pitch is enough. The Executive Producer briefs the studio." },
  { n: "02", t: "Watch agents collaborate", d: "Design, World, Narrative, Gameplay, QA and Builder work in parallel — live." },
  { n: "03", t: "Review artifacts", d: "Every deliverable lands in the workspace with version history." },
  { n: "04", t: "Continue later", d: "Projects persist. Return any time and keep iterating with the studio." },
];

function OnboardingCard() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    setHidden(localStorage.getItem("derrly.onboarded") === "1");
  }, []);
  if (hidden) return null;
  return (
    <div className="relative mb-10 rounded-2xl border hairline bg-surface/50 p-6">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          localStorage.setItem("derrly.onboarded", "1");
          setHidden(true);
        }}
        className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Welcome to Derrly
      </p>
      <h2 className="mt-2 font-display text-2xl text-foreground">How the studio works</h2>
      <ol className="mt-5 grid gap-4 md:grid-cols-4">
        {STEPS.map((s) => (
          <li key={s.n}>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground">{s.n}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{s.t}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
