import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Plus, Loader2 } from "lucide-react";
import { listProjects, createProject } from "@/lib/studio.functions";

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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Your studio
      </p>
      <h1 className="mt-4 font-display text-5xl text-foreground md:text-6xl">
        What are we building today?
      </h1>

      <form
        onSubmit={handleCreate}
        className="mt-10 rounded-2xl border hairline bg-card p-6"
      >
        <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Project title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Umbra Reach"
          className="mt-2 w-full bg-transparent text-2xl font-display text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <label className="mt-6 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
          One-sentence pitch
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="A multiplayer zombie survival game set in a flooded Tokyo, with a weather system that affects horde behavior."
          className="mt-2 w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={busy || !title.trim() || !prompt.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Spin up studio
          </button>
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
        <h2 className="font-display text-2xl text-foreground">Recent projects</h2>
        {projects.isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : projects.data && projects.data.length > 0 ? (
          <ul className="mt-6 divide-y hairline border-y hairline">
            {projects.data.map((p) => (
              <li key={p.id}>
                <Link
                  to="/app/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="group flex items-center justify-between py-5 transition-colors hover:bg-surface"
                >
                  <div className="min-w-0 pr-6">
                    <p className="font-display text-xl text-foreground">{p.title}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{p.prompt}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="rounded-full border hairline px-2.5 py-1 text-xs uppercase tracking-widest text-muted-foreground">
                      {p.status}
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            ))}
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
