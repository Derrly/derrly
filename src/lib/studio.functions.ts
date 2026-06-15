import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// --- profile ---
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, display_name, studio_name, avatar_url")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const UpdateProfile = z.object({
  displayName: z.string().trim().min(1).max(80),
  studioName: z.string().trim().max(100),
  avatarUrl: z.union([z.string().trim().url().max(2048), z.literal("")]),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateProfile.parse(input))
  .handler(async ({ data, context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .upsert({
        id: context.userId,
        display_name: data.displayName,
        studio_name: data.studioName || null,
        avatar_url: data.avatarUrl || null,
      })
      .select("id, display_name, studio_name, avatar_url")
      .single();
    if (error) throw new Error(error.message);
    return profile;
  });

// --- projects ---
export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("id, title, prompt, status, updated_at")
      .eq("owner_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const projects = data ?? [];
    const ids = projects.map((project) => project.id);
    if (!ids.length) return [];
    const [intelligence, runs, activities, builds] = await Promise.all([
      context.supabase.from("project_intelligence").select("project_id, health_score, progress_percent, created_at").in("project_id", ids).order("created_at", { ascending: false }),
      context.supabase.from("studio_runs").select("project_id, status, phase, revision_count, completed_at, created_at").in("project_id", ids).order("created_at", { ascending: false }),
      context.supabase.from("agent_activities").select("project_id, agent, status, summary, created_at").in("project_id", ids).order("created_at", { ascending: false }).limit(150),
      context.supabase.from("build_records").select("project_id, status, version, created_at").in("project_id", ids).order("created_at", { ascending: false }),
    ]);
    const aggregateError = intelligence.error ?? runs.error ?? activities.error ?? builds.error;
    if (aggregateError) throw new Error(aggregateError.message);
    return projects.map((project) => ({
      ...project,
      intelligence: intelligence.data?.find((item) => item.project_id === project.id) ?? null,
      run: runs.data?.find((item) => item.project_id === project.id) ?? null,
      activity: activities.data?.find((item) => item.project_id === project.id) ?? null,
      build: builds.data?.find((item) => item.project_id === project.id) ?? null,
    }));
  });

const CreateProject = z.object({
  title: z.string().min(1).max(120),
  prompt: z.string().min(1).max(4000),
});

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateProject.parse(input))
  .handler(async ({ data, context }) => {
    const { data: project, error } = await context.supabase
      .from("projects")
      .insert({
        owner_id: context.userId,
        title: data.title,
        prompt: data.prompt,
        status: "drafting",
      })
      .select("id")
      .single();
    if (error || !project) throw new Error(error?.message ?? "Failed to create project");

    const { error: threadError } = await context.supabase.from("threads").insert({
      project_id: project.id,
      owner_id: context.userId,
      title: "Executive Producer",
      agent: "executive-producer",
    });
    if (threadError) {
      await context.supabase.from("projects").delete().eq("id", project.id);
      throw new Error(threadError.message);
    }

    return { id: project.id };
  });

export const getProject = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: project, error } = await context.supabase
      .from("projects")
      .select("id, title, prompt, status, created_at, updated_at")
      .eq("id", data.projectId)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!project) throw new Error("Project not found");
    return project;
  });

// --- threads ---
export const getStudioWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [threadResult, activityResult, artifactResult, runResult, memoryResult, handoffResult, intelligenceResult, qualityResult, buildResult, reviewResult, eventResult, messagesResult] =
      await Promise.all([
        context.supabase
          .from("threads")
          .select("id")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .eq("agent", "executive-producer")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
        context.supabase
          .from("agent_activities")
          .select("id, agent, activity_type, status, summary, created_at, completed_at")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(80),
        context.supabase
          .from("project_artifacts")
          .select(
            "id, artifact_type, title, summary, content, produced_by, version, review_status, updated_at",
          )
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("updated_at", { ascending: false }),
        context.supabase
          .from("studio_runs")
          .select("id, status, phase, revision_count, started_at, completed_at")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        context.supabase
          .from("project_memory")
          .select("id, category, title, source_agent, version, status, updated_at")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("updated_at", { ascending: false })
          .limit(40),
        context.supabase
          .from("agent_handoffs")
          .select("id, from_agent, to_agent, request_type, status, context, response, created_at, resolved_at")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(80),
        context.supabase
          .from("project_intelligence")
          .select("id, health_score, progress_percent, completion_percent, current_state, biggest_risks, missing_systems, incomplete_content, recommended_actions, quality_breakdown, tech_debt_notes, test_coverage_percent, evidence, created_at")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        context.supabase
          .from("quality_reviews")
          .select("id, discipline, score, status, summary, findings, evidence, reviewer_agent, created_at")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(40),
        context.supabase
          .from("build_records")
          .select("id, version, status, gameplay_overview, core_loop, world_overview, quest_overview, manifest, preview_url, logs, created_at")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        context.supabase
          .from("artifact_reviews")
          .select("id, artifact_id, decision, comment, created_at")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(80),
        context.supabase
          .from("project_events")
          .select("id, actor_type, actor, event_type, summary, details, created_at")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(100),
        context.supabase
          .from("agent_messages")
          .select("id, from_agent, to_agent, kind, body, created_at")
          .eq("project_id", data.projectId)
          .eq("owner_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(80),
      ]);

    const error =
      threadResult.error ??
      activityResult.error ??
      artifactResult.error ??
      runResult.error ??
      memoryResult.error ?? handoffResult.error ?? intelligenceResult.error ?? qualityResult.error ?? buildResult.error ?? reviewResult.error ?? eventResult.error ?? messagesResult.error;
    if (error) throw new Error(error.message);
    if (!threadResult.data) throw new Error("Executive Producer conversation not found");

    return {
      threadId: threadResult.data.id,
      activities: activityResult.data ?? [],
      artifacts: artifactResult.data ?? [],
      run: runResult.data,
      memory: memoryResult.data ?? [],
      handoffs: handoffResult.data ?? [],
      intelligence: intelligenceResult.data,
      quality: qualityResult.data ?? [],
      build: buildResult.data,
      reviews: reviewResult.data ?? [],
      events: eventResult.data ?? [],
      agentMessages: (messagesResult.data ?? []).slice().reverse(),
    };
  });


// --- messages ---
export const listMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("thread_id", data.threadId)
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (rows ?? []).reverse();
  });

const ReviewArtifact = z.object({
  projectId: z.string().uuid(),
  artifactId: z.string().uuid(),
  decision: z.enum(["approved", "revision_requested"]),
  comment: z.string().trim().max(1000).default(""),
});

export const reviewArtifact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReviewArtifact.parse(input))
  .handler(async ({ data, context }) => {
    const { data: artifact, error: artifactError } = await context.supabase
      .from("project_artifacts")
      .select("id, run_id, title")
      .eq("id", data.artifactId)
      .eq("project_id", data.projectId)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (artifactError || !artifact) throw new Error(artifactError?.message ?? "Artifact not found");
    const [review, update, event] = await Promise.all([
      context.supabase.from("artifact_reviews").insert({ project_id: data.projectId, artifact_id: artifact.id, run_id: artifact.run_id, owner_id: context.userId, reviewer_id: context.userId, decision: data.decision, comment: data.comment }),
      context.supabase.from("project_artifacts").update({ review_status: data.decision }).eq("id", artifact.id).eq("owner_id", context.userId),
      context.supabase.from("project_events").insert({ project_id: data.projectId, run_id: artifact.run_id, owner_id: context.userId, actor_type: "user", actor: "project-owner", event_type: data.decision, summary: `${data.decision === "approved" ? "Approved" : "Requested revision for"} ${artifact.title}`, details: { comment: data.comment } }),
    ]);
    const error = review.error ?? update.error ?? event.error;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { count, error: runError } = await context.supabase
      .from("studio_runs")
      .select("id", { count: "exact", head: true })
      .eq("project_id", data.projectId)
      .eq("owner_id", context.userId)
      .in("status", ["planning", "running", "reviewing", "revising"]);
    if (runError) throw new Error(runError.message);
    if ((count ?? 0) > 0) throw new Error("Wait for the active production cycle to finish before deleting this project.");
    const { error } = await context.supabase
      .from("projects")
      .delete()
      .eq("id", data.projectId)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --- user preferences (cross-project memory) ---
export const getUserPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_preferences")
      .select("favorite_genres, design_patterns, tone, notes, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const UpdatePrefs = z.object({
  favoriteGenres: z.array(z.string().trim().min(1).max(40)).max(20),
  tone: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
});

export const updateUserPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdatePrefs.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_preferences")
      .upsert({
        user_id: context.userId,
        favorite_genres: data.favoriteGenres,
        tone: data.tone || null,
        notes: data.notes || null,
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --- knowledge base Q&A ---
export const askProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ projectId: z.string().uuid(), question: z.string().trim().min(2).max(500) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const [memory, artifacts] = await Promise.all([
      context.supabase
        .from("project_memory")
        .select("title, category, content, source_agent")
        .eq("project_id", data.projectId)
        .eq("owner_id", context.userId)
        .eq("status", "approved")
        .order("updated_at", { ascending: false })
        .limit(30),
      context.supabase
        .from("project_artifacts")
        .select("title, summary, content, produced_by")
        .eq("project_id", data.projectId)
        .eq("owner_id", context.userId)
        .order("updated_at", { ascending: false })
        .limit(20),
    ]);
    if (memory.error) throw new Error(memory.error.message);
    if (artifacts.error) throw new Error(artifacts.error.message);

    const knowledgeText = [
      ...(memory.data ?? []).map((m) => {
        const md = m.content && typeof m.content === "object" && !Array.isArray(m.content) && typeof (m.content as Record<string, unknown>).markdown === "string"
          ? ((m.content as Record<string, unknown>).markdown as string)
          : JSON.stringify(m.content);
        return `# ${m.title} (${m.category}, by ${m.source_agent})\n${md.slice(0, 1500)}`;
      }),
      ...(artifacts.data ?? []).map((a) => {
        const md = a.content && typeof a.content === "object" && !Array.isArray(a.content) && typeof (a.content as Record<string, unknown>).markdown === "string"
          ? ((a.content as Record<string, unknown>).markdown as string)
          : a.summary ?? "";
        return `# ${a.title} (artifact, by ${a.produced_by})\n${md.slice(0, 1500)}`;
      }),
    ].join("\n\n").slice(0, 28_000);

    const { generateText: gen } = await import("ai");
    const { createGroq, GROQ_MODEL } = await import("@/lib/groq.server");
    const groq = createGroq();
    const result = await gen({
      model: groq(GROQ_MODEL),
      system:
        "You are Derrly's project knowledge assistant. Answer the user's question using ONLY the supplied project knowledge. If something is not covered, say so. Be concise and structured.",
      prompt: `QUESTION: ${data.question}\n\nPROJECT KNOWLEDGE:\n${knowledgeText || "No knowledge has been generated for this project yet."}`,
      abortSignal: AbortSignal.timeout(20_000),
      maxOutputTokens: 1200,
    });
    return { answer: result.text };
  });

