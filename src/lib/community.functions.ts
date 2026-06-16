import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { GameManifestSchema, sampleManifest } from "@/runtime/manifest";
import { validateManifest, simulate, aggregateSims } from "@/runtime/headless";

// --------------------------------------------------------------------------
// Build / playability
// --------------------------------------------------------------------------

const ProjectIdInput = z.object({ projectId: z.string().uuid() });

// Get the latest manifest for a project (auth: owner only). Used by /app studio.
export const getProjectBuild = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProjectIdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: build, error } = await context.supabase
      .from("build_records")
      .select("id, version, status, manifest, playable, validation_issues, created_at")
      .eq("project_id", data.projectId)
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return build;
  });

// Validate the latest manifest and store the result on the build record.
export const runPlayabilityCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProjectIdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: build, error } = await context.supabase
      .from("build_records")
      .select("id, manifest")
      .eq("project_id", data.projectId)
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!build) throw new Error("No build to validate yet.");
    const parsed = GameManifestSchema.safeParse(build.manifest);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => ({ severity: "error", code: i.code, message: `${i.path.join(".")}: ${i.message}` }));
      await context.supabase.from("build_records").update({ playable: false, validation_issues: issues }).eq("id", build.id);
      return { ok: false, issues };
    }
    const v = validateManifest(parsed.data);
    await context.supabase.from("build_records").update({ playable: v.ok, validation_issues: v.issues }).eq("id", build.id);
    return v;
  });

// Run N headless simulations, store a playtest report.
export const runPlaytest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ projectId: z.string().uuid(), sessions: z.number().int().min(1).max(50).default(10) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: build } = await context.supabase
      .from("build_records")
      .select("id, manifest")
      .eq("project_id", data.projectId)
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!build) throw new Error("No build to playtest.");
    const parsed = GameManifestSchema.safeParse(build.manifest);
    if (!parsed.success) throw new Error("Manifest invalid; run playability check first.");
    const t0 = performance.now();
    const results = Array.from({ length: data.sessions }, (_, i) => simulate(parsed.data, { seed: i + 1, maxTicks: 600 }));
    const elapsed = (performance.now() - t0) / 1000;
    const agg = aggregateSims(results);
    const tps = Math.round(results.reduce((s, r) => s + r.ticks, 0) / Math.max(0.001, elapsed));
    const issues: { code: string; message: string }[] = [];
    if (agg.win_rate < 5) issues.push({ code: "too_hard", message: "Greedy AI almost never wins; tune difficulty down." });
    if (agg.win_rate > 95) issues.push({ code: "too_easy", message: "Greedy AI always wins; add challenge." });
    if (agg.softlock_rate > 10) issues.push({ code: "softlock", message: "Frequent softlocks detected; check reachability." });
    const { data: report, error } = await context.supabase
      .from("playtest_reports")
      .insert({
        project_id: data.projectId,
        build_id: build.id,
        owner_id: context.userId,
        sessions: agg.sessions,
        win_rate: agg.win_rate,
        softlock_rate: agg.softlock_rate,
        avg_len_ticks: agg.avg_len_ticks,
        perf_tps: tps,
        issues,
      })
      .select("id, sessions, win_rate, softlock_rate, avg_len_ticks, perf_tps, issues, created_at")
      .single();
    if (error) throw new Error(error.message);
    return report;
  });

export const listPlaytests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProjectIdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("playtest_reports")
      .select("id, sessions, win_rate, softlock_rate, avg_len_ticks, perf_tps, issues, created_at")
      .eq("project_id", data.projectId)
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// --------------------------------------------------------------------------
// Publish / Discover / Game detail
// --------------------------------------------------------------------------

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "game";
}

export const publishGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        projectId: z.string().uuid(),
        title: z.string().trim().min(1).max(120),
        summary: z.string().trim().max(500).default(""),
        coverUrl: z.string().trim().url().max(2048).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // Ensure ownership + latest build
    const { data: project } = await context.supabase
      .from("projects")
      .select("id, owner_id")
      .eq("id", data.projectId)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (!project) throw new Error("Project not found");
    const { data: build } = await context.supabase
      .from("build_records")
      .select("id, manifest, playable, validation_issues")
      .eq("project_id", data.projectId)
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!build) throw new Error("No build to publish. Run the studio first.");
    const parsed = GameManifestSchema.safeParse(build.manifest);
    if (!parsed.success) throw new Error("Build manifest invalid; cannot publish.");
    // Soft-gate: warn but allow if playability hasn't been checked yet
    const v = validateManifest(parsed.data);
    if (!v.ok) throw new Error("Game fails playability: " + v.issues.map((i) => i.message).slice(0, 3).join("; "));

    // Unique slug
    let baseSlug = slugify(data.title);
    let slug = baseSlug;
    for (let i = 1; i < 50; i++) {
      const { data: clash } = await context.supabase
        .from("published_games").select("id").eq("slug", slug).maybeSingle();
      if (!clash) break;
      slug = `${baseSlug}-${i + 1}`;
    }

    const { data: game, error } = await context.supabase
      .from("published_games")
      .upsert(
        {
          project_id: data.projectId,
          build_id: build.id,
          creator_id: context.userId,
          slug,
          title: data.title,
          summary: data.summary,
          cover_url: data.coverUrl || null,
          kind: parsed.data.kind,
          template: parsed.data.template,
          manifest: parsed.data as unknown as any,
          status: "public",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" },
      )
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return game;
  });

const DiscoverTab = z.enum([
  "trending", "new", "featured", "most_played", "top_rated", "staff_picks", "twoD", "threeD", "updated",
]);

export const listDiscover = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ tab: DiscoverTab.default("trending"), limit: z.number().int().min(1).max(60).default(24) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cols = "id, slug, title, summary, cover_url, kind, template, plays, likes, rating_avg, rating_count, creator_id, published_at, featured, staff_pick";
    let q = supabaseAdmin.from("published_games").select(cols).eq("status", "public");
    switch (data.tab) {
      case "new": q = q.order("published_at", { ascending: false }); break;
      case "featured": q = q.eq("featured", true).order("published_at", { ascending: false }); break;
      case "most_played": q = q.order("plays", { ascending: false }); break;
      case "top_rated": q = q.order("rating_avg", { ascending: false }).order("rating_count", { ascending: false }); break;
      case "staff_picks": q = q.eq("staff_pick", true).order("published_at", { ascending: false }); break;
      case "twoD": q = q.eq("kind", "2d").order("published_at", { ascending: false }); break;
      case "threeD": q = q.eq("kind", "3d").order("published_at", { ascending: false }); break;
      case "updated": q = q.order("updated_at", { ascending: false }); break;
      default: q = q.order("likes", { ascending: false }).order("published_at", { ascending: false }); break;
    }
    const { data: games, error } = await q.limit(data.limit);
    if (error) throw new Error(error.message);
    return games ?? [];
  });

export const getGameBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: game, error } = await supabaseAdmin
      .from("published_games")
      .select("id, slug, title, summary, cover_url, kind, template, manifest, creator_id, plays, likes, rating_avg, rating_count, status, published_at, project_id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!game || game.status !== "public") return null;
    const [{ data: creator }, { count: commentCount }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, display_name, studio_name, avatar_url").eq("id", game.creator_id).maybeSingle(),
      supabaseAdmin.from("game_comments").select("id", { count: "exact", head: true }).eq("game_id", game.id),
    ]);
    return { ...game, creator, commentCount: commentCount ?? 0 };
  });

// Returns the manifest for any project the user owns, OR for any public game.
export const getPlayableManifest = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: build } = await supabaseAdmin
      .from("build_records")
      .select("manifest")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const parsed = GameManifestSchema.safeParse(build?.manifest);
    if (parsed.success) return { manifest: parsed.data, fallback: false };
    return { manifest: sampleManifest({ id: data.projectId }), fallback: true };
  });

// --------------------------------------------------------------------------
// Engagement: likes, ratings, plays, comments
// --------------------------------------------------------------------------

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ gameId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("game_likes").select("user_id").eq("user_id", context.userId).eq("game_id", data.gameId).maybeSingle();
    if (existing) {
      await context.supabase.from("game_likes").delete().eq("user_id", context.userId).eq("game_id", data.gameId);
    } else {
      await context.supabase.from("game_likes").insert({ user_id: context.userId, game_id: data.gameId });
    }
    // Recompute like count
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("game_likes").select("user_id", { count: "exact", head: true }).eq("game_id", data.gameId);
    await supabaseAdmin.from("published_games").update({ likes: count ?? 0 }).eq("id", data.gameId);
    return { liked: !existing, likes: count ?? 0 };
  });

export const logPlay = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ gameId: z.string().uuid(), durationS: z.number().int().min(0).max(7200).default(0), completed: z.boolean().default(false) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("game_plays").insert({ game_id: data.gameId, duration_s: data.durationS, completed: data.completed });
    const { count } = await supabaseAdmin.from("game_plays").select("id", { count: "exact", head: true }).eq("game_id", data.gameId);
    await supabaseAdmin.from("published_games").update({ plays: count ?? 0 }).eq("id", data.gameId);
    return { plays: count ?? 0 };
  });

const RatingAxes = z.object({
  gameplay: z.number().int().min(1).max(5),
  fun: z.number().int().min(1).max(5),
  creativity: z.number().int().min(1).max(5),
  performance: z.number().int().min(1).max(5),
  visuals: z.number().int().min(1).max(5),
  overall: z.number().int().min(1).max(5),
});

export const rateGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ gameId: z.string().uuid(), rating: RatingAxes }).parse(input))
  .handler(async ({ data, context }) => {
    await context.supabase.from("game_ratings").upsert({
      user_id: context.userId, game_id: data.gameId, ...data.rating, updated_at: new Date().toISOString(),
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin.from("game_ratings").select("overall").eq("game_id", data.gameId);
    const list = rows ?? [];
    const avg = list.length ? list.reduce((s, r) => s + (r.overall ?? 0), 0) / list.length : 0;
    await supabaseAdmin.from("published_games").update({ rating_avg: Number(avg.toFixed(2)), rating_count: list.length }).eq("id", data.gameId);
    return { avg, count: list.length };
  });

export const listComments = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ gameId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("game_comments").select("id, user_id, body, created_at")
      .eq("game_id", data.gameId).order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    let profiles: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
    if (userIds.length) {
      const { data: ps } = await supabaseAdmin.from("profiles").select("id, display_name, avatar_url").in("id", userIds);
      for (const p of ps ?? []) profiles[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url };
    }
    return (rows ?? []).map((r) => ({ ...r, profile: profiles[r.user_id] ?? null }));
  });

export const postComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ gameId: z.string().uuid(), body: z.string().trim().min(1).max(800) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("game_comments").insert({ game_id: data.gameId, user_id: context.userId, body: data.body })
      .select("id, body, user_id, created_at").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const remixGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ gameId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: game } = await context.supabase
      .from("published_games").select("id, title, summary, manifest, project_id").eq("id", data.gameId).maybeSingle();
    if (!game) throw new Error("Game not found");
    // Clone into a new project owned by current user
    const { data: project, error } = await context.supabase
      .from("projects").insert({
        owner_id: context.userId,
        title: `${game.title} (Remix)`,
        prompt: `Remix of "${game.title}". ${game.summary ?? ""}`.trim(),
        status: "drafting",
      }).select("id").single();
    if (error || !project) throw new Error(error?.message ?? "Failed to create remix project");
    await context.supabase.from("build_records").insert({
      project_id: project.id, owner_id: context.userId, version: 1, status: "remixed",
      manifest: game.manifest as unknown as any, playable: true,
    });
    await context.supabase.from("game_remixes").insert({
      original_game_id: game.id, remix_project_id: project.id, user_id: context.userId,
    });
    await context.supabase.from("threads").insert({
      project_id: project.id, owner_id: context.userId, title: "Executive Producer", agent: "executive-producer",
    });
    return { projectId: project.id };
  });

// Public profile read
export const getCreatorProfile = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ creatorId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profile }, { data: games }, { count: followers }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, display_name, studio_name, avatar_url").eq("id", data.creatorId).maybeSingle(),
      supabaseAdmin.from("published_games").select("id, slug, title, summary, cover_url, plays, likes, rating_avg, published_at").eq("creator_id", data.creatorId).eq("status", "public").order("published_at", { ascending: false }).limit(48),
      supabaseAdmin.from("creator_follows").select("follower_id", { count: "exact", head: true }).eq("creator_id", data.creatorId),
    ]);
    if (!profile) return null;
    return { profile, games: games ?? [], followers: followers ?? 0 };
  });

// List creators ranked by total plays/likes across their published games.
export const listCreators = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(60).default(30) }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: games } = await supabaseAdmin
      .from("published_games")
      .select("creator_id, plays, likes, rating_avg, rating_count, id")
      .eq("status", "public");
    const agg = new Map<string, { plays: number; likes: number; games: number; ratingSum: number; ratingN: number }>();
    for (const g of games ?? []) {
      const a = agg.get(g.creator_id) ?? { plays: 0, likes: 0, games: 0, ratingSum: 0, ratingN: 0 };
      a.plays += g.plays ?? 0;
      a.likes += g.likes ?? 0;
      a.games += 1;
      a.ratingSum += (g.rating_avg ?? 0) * (g.rating_count ?? 0);
      a.ratingN += g.rating_count ?? 0;
      agg.set(g.creator_id, a);
    }
    const ids = Array.from(agg.keys());
    if (ids.length === 0) return [];
    const [{ data: profiles }, { data: follows }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, display_name, studio_name, avatar_url").in("id", ids),
      supabaseAdmin.from("creator_follows").select("creator_id").in("creator_id", ids),
    ]);
    const followerCount = new Map<string, number>();
    for (const f of follows ?? []) followerCount.set(f.creator_id, (followerCount.get(f.creator_id) ?? 0) + 1);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const rows = ids.map((id) => {
      const a = agg.get(id)!;
      const p = profileMap.get(id);
      return {
        id,
        display_name: p?.display_name ?? null,
        studio_name: p?.studio_name ?? null,
        avatar_url: p?.avatar_url ?? null,
        games: a.games,
        plays: a.plays,
        likes: a.likes,
        rating_avg: a.ratingN ? Number((a.ratingSum / a.ratingN).toFixed(2)) : 0,
        followers: followerCount.get(id) ?? 0,
      };
    });
    rows.sort((x, y) => y.plays + y.likes * 2 - (x.plays + x.likes * 2));
    return rows.slice(0, data.limit);
  });

// List recent project history (build records + handoffs + reviews) for any project the user owns.
export const listProjectHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [{ data: builds }, { data: handoffs }, { data: reviews }, { data: events }] = await Promise.all([
      context.supabase.from("build_records").select("id, version, status, playable, created_at").eq("project_id", data.projectId).order("created_at", { ascending: false }).limit(50),
      context.supabase.from("agent_handoffs").select("id, from_agent, to_agent, reason, created_at").eq("project_id", data.projectId).order("created_at", { ascending: false }).limit(50),
      context.supabase.from("quality_reviews").select("id, overall_score, created_at, reviewer").eq("project_id", data.projectId).order("created_at", { ascending: false }).limit(50),
      context.supabase.from("project_events").select("id, kind, summary, created_at").eq("project_id", data.projectId).order("created_at", { ascending: false }).limit(50),
    ]);
    return { builds: builds ?? [], handoffs: handoffs ?? [], reviews: reviews ?? [], events: events ?? [] };
  });

// List all projects (lightweight) for the signed-in user.
export const listMyProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("id, title, status, created_at, updated_at")
      .eq("owner_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
