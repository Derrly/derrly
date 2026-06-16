import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listDiscover } from "@/lib/community.functions";
import { Section } from "@/components/site/Section";

const TABS = [
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
  { id: "featured", label: "Featured" },
  { id: "most_played", label: "Most Played" },
  { id: "top_rated", label: "Top Rated" },
  { id: "staff_picks", label: "Staff Picks" },
  { id: "twoD", label: "2D" },
  { id: "threeD", label: "3D" },
  { id: "updated", label: "Updated" },
] as const;

type Tab = typeof TABS[number]["id"];

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Games — Derrly" },
      { name: "description", content: "Play games built by Derrly's autonomous AI game studio. Trending, new releases, staff picks, and more." },
      { property: "og:title", content: "Discover Games — Derrly" },
      { property: "og:description", content: "Browse and play AI-built games from the Derrly community." },
    ],
  }),
  component: DiscoverPage,
});

type Game = {
  id: string; slug: string; title: string; summary: string; cover_url: string | null;
  kind: string; template: string; plays: number; likes: number;
  rating_avg: number; rating_count: number; published_at: string;
};

function DiscoverPage() {
  const [tab, setTab] = useState<Tab>("trending");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchList = useServerFn(listDiscover);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchList({ data: { tab, limit: 24 } })
      .then((rows) => alive && setGames(rows as Game[]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [tab, fetchList]);

  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Community</p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">Discover.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Play games created by people and AI, end-to-end. Like, rate, remix.
          </p>
        </div>
      </section>

      <Section>
        <div className="-mx-1 mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border hairline px-4 py-1.5 text-sm transition-colors ${
                tab === t.id ? "bg-foreground text-background" : "hover:bg-muted/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading…</div>
        ) : games.length === 0 ? (
          <div className="rounded-2xl border hairline p-12 text-center text-muted-foreground">
            No games here yet. Be the first to publish.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <Link
                key={g.id}
                to="/g/$slug"
                params={{ slug: g.slug }}
                className="group flex flex-col overflow-hidden rounded-2xl border hairline bg-background transition-colors hover:bg-muted/20"
              >
                <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                  {g.cover_url ? (
                    <img src={g.cover_url} alt={g.title} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center font-display text-4xl text-muted-foreground/40">
                      {g.title.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>{g.kind} · {g.template}</span>
                    <span>{g.rating_avg > 0 ? `★ ${g.rating_avg.toFixed(1)}` : "Unrated"}</span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl">{g.title}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{g.summary || "No description yet."}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>♥ {g.likes}</span>
                    <span>▶ {g.plays}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
