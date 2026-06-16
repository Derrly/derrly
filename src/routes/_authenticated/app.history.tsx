import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyProjects, listProjectHistory } from "@/lib/community.functions";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/_authenticated/app/history")({
  component: HistoryPage,
});

type Project = { id: string; title: string; status: string; updated_at: string };
type History = {
  builds: { id: string; version: number; status: string; playable: boolean | null; created_at: string }[];
  handoffs: { id: string; from_agent: string; to_agent: string; request_type: string | null; created_at: string }[];
  reviews: { id: string; overall_score: number | null; reviewer: string | null; created_at: string }[];
  events: { id: string; kind: string; summary: string | null; created_at: string }[];
};

function fmt(ts: string) {
  return new Date(ts).toLocaleString();
}

function HistoryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchProjects = useServerFn(listMyProjects);
  const fetchHistory = useServerFn(listProjectHistory);

  useEffect(() => {
    fetchProjects()
      .then((rows) => {
        const list = rows as Project[];
        setProjects(list);
        if (list[0]) setActive(list[0].id);
      })
      .finally(() => setLoading(false));
  }, [fetchProjects]);

  useEffect(() => {
    if (!active) return;
    setHistory(null);
    fetchHistory({ data: { projectId: active } }).then((h) => setHistory(h as History));
  }, [active, fetchHistory]);

  // Merge into a unified timeline
  const timeline = history
    ? [
        ...history.builds.map((b) => ({ ts: b.created_at, kind: "Build", label: `v${b.version} · ${b.status}${b.playable === false ? " · not playable" : b.playable ? " · playable" : ""}` })),
        ...history.handoffs.map((h) => ({ ts: h.created_at, kind: "Handoff", label: `${h.from_agent} → ${h.to_agent}${h.request_type ? ` — ${h.request_type}` : ""}` })),
        ...history.reviews.map((r) => ({ ts: r.created_at, kind: "QA", label: `${r.reviewer ?? "Reviewer"} · score ${r.overall_score ?? "—"}` })),
        ...history.events.map((e) => ({ ts: e.created_at, kind: e.kind, label: e.summary ?? e.kind })),
      ].sort((a, b) => +new Date(b.ts) - +new Date(a.ts))
    : [];

  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Studio</p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl">Project history.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Revisions, agent decisions, QA reviews, and build milestones across your projects.
          </p>
        </div>
      </section>

      <Section>
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border hairline p-12 text-center text-muted-foreground">
            No projects yet. <Link to="/app" className="underline">Start one in the studio.</Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="rounded-2xl border hairline p-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActive(p.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    active === p.id ? "bg-foreground text-background" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="truncate font-medium">{p.title}</div>
                  <div className={`text-[10px] uppercase tracking-widest ${active === p.id ? "text-background/70" : "text-muted-foreground"}`}>
                    {p.status} · {fmt(p.updated_at)}
                  </div>
                </button>
              ))}
            </aside>

            <div className="rounded-2xl border hairline p-6">
              {!history ? (
                <div className="py-12 text-center text-muted-foreground">Loading timeline…</div>
              ) : timeline.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No history recorded yet.</div>
              ) : (
                <ol className="relative space-y-4 border-l hairline pl-6">
                  {timeline.map((e, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[29px] top-1.5 inline-block size-2 rounded-full bg-foreground" />
                      <div className="flex items-baseline gap-3">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{e.kind}</span>
                        <span className="text-xs text-muted-foreground">{fmt(e.ts)}</span>
                      </div>
                      <div className="mt-1 text-sm">{e.label}</div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
