import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPlayableManifest } from "@/lib/community.functions";
import { GameRuntime } from "@/runtime/GameRuntime";
import type { GameManifest } from "@/runtime/manifest";

export const Route = createFileRoute("/play/$projectId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Play — Derrly" },
      { name: "description", content: "Play a game built by Derrly's autonomous AI studio." },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const { projectId } = Route.useParams();
  const fetchManifest = useServerFn(getPlayableManifest);
  const [manifest, setManifest] = useState<GameManifest | null>(null);
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchManifest({ data: { projectId } })
      .then((res) => { if (alive) { setManifest(res.manifest as GameManifest); setFallback(res.fallback); } })
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [projectId, fetchManifest]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-xl">Derrly</Link>
          <Link to="/discover" className="text-sm text-muted-foreground hover:text-foreground">Discover →</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        {error && <div className="rounded-lg border hairline bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
        {!manifest && !error && <div className="py-20 text-center text-muted-foreground">Loading game…</div>}
        {manifest && (
          <>
            {fallback && (
              <div className="mb-4 rounded-lg border hairline bg-muted/40 p-3 text-xs text-muted-foreground">
                Showing a demo manifest because this project hasn't produced a playable build yet.
              </div>
            )}
            <GameRuntime manifest={manifest} />
          </>
        )}
      </main>
    </div>
  );
}
