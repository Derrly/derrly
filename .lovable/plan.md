# Derrly V23 — Universal Playable Engine + Community Hub

V21 closed the autonomous studio loop (orchestrator, war room, quality axes, knowledge Q&A). V23 makes the *output* a real, playable, publishable artifact and opens a community surface around it. This plan is scoped to what's realistically buildable in-browser on the current TanStack + Cloud stack — no native engines, no real multiplayer netcode beyond presence/lobby.

## Scope guardrails (read first)

In:
- A single **browser runtime** that boots any generated game from a JSON `game_manifest` (2D-first; 3D = Three.js scenes with limited templates).
- **Playability gate**: orchestrator cannot mark a project shippable until the runtime validates the manifest end-to-end.
- **AI playtest loop**: headless simulation of the manifest produces bug/softlock/balance reports that feed back into the existing revision cycle.
- **Publish → Community Hub** (Discover, profiles, likes, comments, ratings, remix).
- **Studio dashboard** consolidating health/agents/tasks/timeline already in DB.

Out (explicitly):
- Real-time multiplayer netcode, voice, matchmaking. We ship "multiplayer-ready" lobbies + presence only; gameplay sync is a future phase.
- Native exports (Unity/Unreal/mobile).
- User-uploaded binary assets at scale (we generate sprites/textures via existing imagegen; no upload pipeline yet).
- Anti-cheat, moderation queues beyond a simple report flag.

## Phase A — Universal Game Runtime (`src/runtime/`)

A new `src/runtime/` package with a single entry `<GameRuntime manifest={...} />`.

**Manifest schema** (`src/runtime/manifest.ts`, Zod):
```
GameManifest {
  id, title, kind: '2d' | '3d',
  template: 'platformer'|'topdown'|'puzzle'|'td'|'roguelike'|'fps'|'thirdperson'|'racing',
  world: { tiles?, scenes[], spawn },
  entities: [{ id, kind:'player'|'npc'|'enemy'|'item'|'prop', sprite|model, stats, ai? }],
  controls: { scheme: 'wasd'|'arrows'|'touch'|'pointer', actions },
  rules: { win[], lose[], scoring },
  ui: { hud[], menus[] },
  save: { slots, fields[] },
  audio?: { bgm?, sfx[] }
}
```

**2D engine**: thin canvas/PixiJS-style loop we write ourselves (no new heavy dep) — tilemap renderer, sprite entities, AABB collision, input map, simple FSM AI. ~600 LoC across `runtime/2d/{loop,render,physics,input,ai}.ts`.

**3D engine**: `three` (already viable on Worker SSR-skipped client route) with a handful of template scenes (FPS controller, third-person orbit, racing track-on-rails). Lazy-loaded only when `kind==='3d'`.

**Shared**: save/load to `localStorage` keyed by `project_id`, pause/resume, win/lose overlay, settings menu, FPS counter.

**Route**: `src/routes/play.$projectId.tsx` (public) — fetches latest approved `build_records.manifest`, mounts `<GameRuntime>`, fullscreen toggle, share button. SSR off for this route.

## Phase B — Playability Gate (orchestrator)

Extend `studio-orchestrator.server.ts`:
- New tool `buildPlayableManifest` the Game Builder agent must call; output validated against the Zod manifest schema.
- New `playabilityCheck` step (server-side, no DOM): runs the manifest through a **headless validator** in `src/runtime/headless.ts` — verifies spawn reachable, win condition satisfiable, no orphan entities, controls bound, save fields serializable.
- Result written to `build_records` with `playable: boolean`, `issues: jsonb`.
- If `playable=false` OR any check fails → auto-spawn revision task (reuses existing 3-cycle loop). Project status cannot advance to `shippable` without `playable=true`.

## Phase C — AI Playtest Automation

`src/lib/playtest.server.ts` — given a manifest, runs N simulated sessions:
- Random-policy + goal-directed agents step the headless engine for up to K ticks.
- Records: reached_win, softlock_detected (no state change for T ticks), avg_session_len, deaths, dps balance, perf (ticks/sec).
- Aggregated into a `playtest_reports` row; below-threshold scores create `studio_tasks` with `kind='balance_fix'` or `'softlock_fix'` routed to Gameplay Engineer.

New table `playtest_reports` (project_id, build_id, sessions, win_rate, softlock_rate, avg_len_ticks, perf_tps, issues jsonb, created_at) with standard RLS/GRANTs.

## Phase D — Community Hub

**New tables** (all with GRANTs + RLS):
- `published_games` (project_id PK, slug unique, title, summary, cover_url, kind, template, manifest jsonb, creator_id, plays bigint, likes bigint, rating_avg, rating_count, published_at, status: 'public'|'unlisted'|'taken_down')
- `game_likes` (user_id, game_id, created_at) — unique pair
- `game_favorites` (user_id, game_id, created_at)
- `game_ratings` (user_id, game_id, gameplay, fun, creativity, performance, visuals, overall) — unique pair
- `game_comments` (id, game_id, user_id, body, created_at, parent_id nullable)
- `game_plays` (id, game_id, user_id nullable, started_at, duration_s, completed bool) — for "Most Played"
- `creator_follows` (follower_id, creator_id) — unique pair
- `game_remixes` (original_id, remix_project_id, user_id, created_at)
- `game_reports` (id, game_id, reporter_id, reason, created_at) — moderation flag

**Routes**:
- `/discover` — tabs: Trending / New / Featured / Most Played / Top Rated / Staff Picks / Multiplayer / 2D / 3D / Updated. Server fn `listDiscover({ tab, page })` with SQL-ranked queries (trending = likes/age decay).
- `/g/$slug` — game detail: cover, play button, ratings, comments, remix, report.
- `/u/$handle` — creator profile (games, followers, plays, likes).
- `/play/$projectId` — runtime (above).

**Publish flow**: from project detail, "Publish" button → server fn `publishGame` requires `playable=true` + `quality>=80` + user confirmation → inserts `published_games` row, generates slug, marks project public.

**Remix**: `remixGame` server fn clones `projects` row + latest approved artifacts + manifest into new project owned by current user, links via `game_remixes`.

## Phase E — Studio Dashboard

New tab on `/app/projects/$projectId` (extends existing page): **Dashboard** card showing
- Project Health (from `project_intelligence.health`)
- Build Health (latest `build_records.playable` + issue count)
- QA Health (latest `playtest_reports` win/softlock rates)
- Agent Status (active `studio_tasks` grouped by agent)
- Timeline (last 20 `project_events`)
- Recommendations (top 3 from intelligence)
- Version History (`build_records` list with "play this version")

Reuses existing realtime channels; no new subscriptions.

## Phase F — Live Studio Polish

The War Room transcript already exists. Add per-agent **status pills** in a sticky header driven by `agent_handoffs` latest-per-agent: `Executive Producer: creating brief…`, etc. Pure presentational; no schema change.

## Implementation order

1. Manifest schema + headless validator (Phase A foundations + B gate). No UI yet.
2. 2D runtime + `/play/$projectId` route. Test with a hand-written manifest.
3. Orchestrator wiring: Game Builder emits manifest; playability gate blocks shipping.
4. Playtest harness + `playtest_reports` + revision task creation.
5. Community schema migration (one migration, all tables + GRANTs + RLS + realtime publication where needed).
6. `/discover`, `/g/$slug`, publish flow, likes/ratings/comments.
7. Remix + creator profiles + follows.
8. Studio Dashboard tab + status pills.
9. 3D template runtimes (lazy `three`).
10. End-to-end pass: generate → playtest → publish → discover → remix.

## Technical notes

- All new server logic uses `createServerFn` + `requireSupabaseAuth` (except public reads on Discover, which use admin-elevated public fns with safe-column projection).
- Realtime added for `game_comments`, `playtest_reports`, `build_records`.
- `three` and any heavy 3D code is dynamically imported inside the 3D runtime module so 2D-only sessions don't pay the cost.
- No service-role key ever touched in client-reachable code; `client.server` imported only inside handler bodies.
- All new public-schema tables follow the CREATE → GRANT → RLS → POLICY order.

## Out of scope (called out so we don't silently expand)

Real multiplayer netcode, native exports, asset upload pipeline, payments/monetization, moderation review queue UI, full localization. Multiplayer surfaces in this phase are lobby/presence-only stubs labeled "coming soon" on the game card.

## Risk

The biggest risk is the runtime being too thin to make generated games actually fun. Mitigation: ship platformer + top-down + puzzle templates first (highest hit-rate from LLM-authored manifests); 3D templates land last and stay narrow (FPS arena, racing rails, third-person sandbox).
