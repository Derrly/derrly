import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getGameBySlug, toggleLike, logPlay, rateGame, listComments, postComment, remixGame,
} from "@/lib/community.functions";
import { GameRuntime } from "@/runtime/GameRuntime";
import type { GameManifest } from "@/runtime/manifest";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/g/$slug")({
  ssr: false, // runtime needs window; loader-fed SEO not feasible without splitting fetch
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Derrly` },
      { name: "description", content: "Play this AI-built game on Derrly." },
      { property: "og:title", content: `${params.slug} — Derrly` },
    ],
  }),
  component: GameDetail,
});

type Game = {
  id: string; slug: string; title: string; summary: string; cover_url: string | null;
  kind: string; template: string; manifest: GameManifest; creator_id: string;
  plays: number; likes: number; rating_avg: number; rating_count: number;
  status: string; project_id: string;
  creator: { id: string; display_name: string | null; studio_name: string | null; avatar_url: string | null } | null;
  commentCount: number;
};
type Comment = { id: string; user_id: string; body: string; created_at: string; profile: { display_name: string | null; avatar_url: string | null } | null };

function GameDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const fetchGame = useServerFn(getGameBySlug);
  const like = useServerFn(toggleLike);
  const play = useServerFn(logPlay);
  const rate = useServerFn(rateGame);
  const fetchComments = useServerFn(listComments);
  const post = useServerFn(postComment);
  const remix = useServerFn(remixGame);

  const [game, setGame] = useState<Game | null>(null);
  const [playing, setPlaying] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const [score, setScore] = useState(4);

  useEffect(() => {
    fetchGame({ data: { slug } }).then((g) => g ? setGame(g as unknown as Game) : navigate({ to: "/discover" }));
  }, [slug, fetchGame, navigate]);

  useEffect(() => {
    if (!game) return;
    fetchComments({ data: { gameId: game.id } }).then((c) => setComments(c as Comment[]));
  }, [game?.id, fetchComments]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  if (!game) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;

  async function handlePlay() {
    setPlaying(true);
    if (game) await play({ data: { gameId: game.id, durationS: 0, completed: false } });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/discover" className="text-sm text-muted-foreground hover:text-foreground">← Discover</Link>
          <Link to="/" className="font-display">Derrly</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h1 className="font-display text-5xl">{game.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              by {game.creator?.display_name ?? "Unknown"} · {game.kind} · {game.template}
            </p>

            <div className="mt-6 rounded-2xl border hairline bg-card p-4">
              {playing ? (
                <GameRuntime manifest={game.manifest} onEnd={({ win, durationMs }) => {
                  play({ data: { gameId: game.id, durationS: Math.round(durationMs / 1000), completed: win } });
                }} />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-20">
                  <button onClick={handlePlay} className="rounded-full bg-foreground px-8 py-3 text-lg font-medium text-background">
                    ▶ Play Game
                  </button>
                  <p className="text-xs text-muted-foreground">Runs in your browser. No downloads.</p>
                </div>
              )}
            </div>

            <p className="mt-6 text-base text-muted-foreground">{game.summary || "No description provided."}</p>

            <section className="mt-10">
              <h2 className="font-display text-2xl">Comments ({comments.length})</h2>
              {me ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!body.trim()) return;
                    const c = await post({ data: { gameId: game.id, body } });
                    setComments((prev) => [{ ...(c as Comment), profile: null }, ...prev]);
                    setBody("");
                  }}
                  className="mt-4 flex gap-2"
                >
                  <input
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Share your thoughts…"
                    className="flex-1 rounded-lg border hairline bg-background px-3 py-2 text-sm"
                  />
                  <button type="submit" className="rounded-lg bg-foreground px-4 py-2 text-sm text-background">Post</button>
                </form>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  <Link to="/auth" className="underline">Sign in</Link> to comment, rate, and remix.
                </p>
              )}
              <ul className="mt-6 space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-lg border hairline p-4">
                    <div className="text-xs text-muted-foreground">
                      {c.profile?.display_name ?? "Player"} · {new Date(c.created_at).toLocaleString()}
                    </div>
                    <div className="mt-1 text-sm">{c.body}</div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border hairline p-5">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div><div className="font-display text-xl">{game.plays}</div><div className="text-muted-foreground">Plays</div></div>
                <div><div className="font-display text-xl">{game.likes}</div><div className="text-muted-foreground">Likes</div></div>
                <div><div className="font-display text-xl">{game.rating_avg > 0 ? game.rating_avg.toFixed(1) : "—"}</div><div className="text-muted-foreground">Rating</div></div>
              </div>
            </div>

            {me && (
              <div className="rounded-2xl border hairline p-5">
                <button
                  onClick={async () => {
                    const res = await like({ data: { gameId: game.id } });
                    setGame((g) => g ? { ...g, likes: res.likes } : g);
                  }}
                  className="w-full rounded-lg border hairline px-4 py-2 text-sm hover:bg-muted/40"
                >
                  ♥ Like
                </button>
                <div className="mt-4">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Quick rating</label>
                  <input type="range" min={1} max={5} value={score} onChange={(e) => setScore(Number(e.target.value))} className="mt-2 w-full" />
                  <button
                    onClick={async () => {
                      const r = await rate({ data: { gameId: game.id, rating: { gameplay: score, fun: score, creativity: score, performance: score, visuals: score, overall: score } } });
                      setGame((g) => g ? { ...g, rating_avg: Number((r.avg ?? 0).toFixed(2)), rating_count: r.count } : g);
                    }}
                    className="mt-2 w-full rounded-lg bg-foreground py-2 text-sm text-background"
                  >
                    Submit {score}/5
                  </button>
                </div>
                <button
                  onClick={async () => {
                    const res = await remix({ data: { gameId: game.id } });
                    navigate({ to: "/app/projects/$projectId", params: { projectId: res.projectId } });
                  }}
                  className="mt-4 w-full rounded-lg border hairline px-4 py-2 text-sm hover:bg-muted/40"
                >
                  ⤴ Remix
                </button>
              </div>
            )}

            <Link
              to="/u/$creatorId"
              params={{ creatorId: game.creator_id }}
              className="block rounded-2xl border hairline p-5 hover:bg-muted/20"
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Creator</div>
              <div className="mt-1 font-display text-lg">{game.creator?.display_name ?? "Unknown"}</div>
              {game.creator?.studio_name && (
                <div className="text-xs text-muted-foreground">{game.creator.studio_name}</div>
              )}
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
