import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listCreators } from "@/lib/community.functions";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/creators")({
  head: () => ({
    meta: [
      { title: "Creators — Derrly" },
      { name: "description", content: "Discover game creators on Derrly. Follow studios building with AI." },
      { property: "og:title", content: "Creators — Derrly" },
      { property: "og:description", content: "Browse creators publishing AI-built games on Derrly." },
    ],
  }),
  component: CreatorsPage,
});

type Creator = {
  id: string;
  display_name: string | null;
  studio_name: string | null;
  avatar_url: string | null;
  games: number;
  plays: number;
  likes: number;
  rating_avg: number;
  followers: number;
};

function CreatorsPage() {
  const [rows, setRows] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchList = useServerFn(listCreators);

  useEffect(() => {
    let alive = true;
    fetchList({ data: { limit: 48 } })
      .then((r) => alive && setRows(r as Creator[]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [fetchList]);

  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Community</p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">Creators.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Studios and solo builders shipping games with Derrly's autonomous AI studio.
          </p>
        </div>
      </section>

      <Section>
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border hairline p-12 text-center text-muted-foreground">
            No creators yet. Publish a game to be the first.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((c) => {
              const name = c.studio_name || c.display_name || "Anonymous";
              return (
                <Link
                  key={c.id}
                  to="/u/$creatorId"
                  params={{ creatorId: c.id }}
                  className="group flex items-center gap-4 rounded-2xl border hairline p-5 transition-colors hover:bg-muted/20"
                >
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-display text-xl">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt={name} className="size-full object-cover" />
                    ) : (
                      <span>{name.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-lg">{name}</div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{c.games} {c.games === 1 ? "game" : "games"}</span>
                      <span>▶ {c.plays.toLocaleString()}</span>
                      <span>♥ {c.likes.toLocaleString()}</span>
                      <span>{c.followers} followers</span>
                      {c.rating_avg > 0 && <span>★ {c.rating_avg.toFixed(1)}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
