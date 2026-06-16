import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getCreatorProfile } from "@/lib/community.functions";

export const Route = createFileRoute("/u/$creatorId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Creator — Derrly" },
      { name: "description", content: "Games and stats from a Derrly creator." },
    ],
  }),
  component: CreatorPage,
});

type Game = { id: string; slug: string; title: string; summary: string; cover_url: string | null; plays: number; likes: number; rating_avg: number };

function CreatorPage() {
  const { creatorId } = Route.useParams();
  const fetchCreator = useServerFn(getCreatorProfile);
  const [data, setData] = useState<{ profile: { display_name: string | null; studio_name: string | null; avatar_url: string | null }; games: Game[]; followers: number } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetchCreator({ data: { creatorId } }).then((d) => (d ? setData(d as any) : setMissing(true)));
  }, [creatorId, fetchCreator]);

  if (missing) return <div className="py-20 text-center text-muted-foreground">Creator not found.</div>;
  if (!data) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;

  const totalPlays = data.games.reduce((s, g) => s + g.plays, 0);
  const totalLikes = data.games.reduce((s, g) => s + g.likes, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/discover" className="text-sm text-muted-foreground hover:text-foreground">← Discover</Link>
          <Link to="/" className="font-display">Derrly</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-end gap-6">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/30 to-accent/30 font-display text-4xl text-muted-foreground">
            {data.profile.avatar_url ? <img src={data.profile.avatar_url} alt="" className="size-full object-cover" /> : (data.profile.display_name?.slice(0, 1) ?? "?")}
          </div>
          <div>
            <h1 className="font-display text-4xl">{data.profile.display_name ?? "Unknown"}</h1>
            {data.profile.studio_name && <p className="text-sm text-muted-foreground">{data.profile.studio_name}</p>}
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>{data.games.length} games</span>
              <span>{data.followers} followers</span>
              <span>{totalLikes} likes</span>
              <span>{totalPlays} plays</span>
            </div>
          </div>
        </div>

        <h2 className="mt-12 font-display text-2xl">Published games</h2>
        {data.games.length === 0 ? (
          <div className="mt-6 rounded-2xl border hairline p-10 text-center text-muted-foreground">No games published yet.</div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.games.map((g) => (
              <Link key={g.id} to="/g/$slug" params={{ slug: g.slug }} className="flex flex-col overflow-hidden rounded-2xl border hairline hover:bg-muted/20">
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-accent/20" />
                <div className="p-5">
                  <h3 className="font-display text-xl">{g.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.summary}</p>
                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    <span>♥ {g.likes}</span>
                    <span>▶ {g.plays}</span>
                    <span>★ {g.rating_avg > 0 ? g.rating_avg.toFixed(1) : "—"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
