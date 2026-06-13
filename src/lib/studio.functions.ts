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

// --- projects ---
export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("id, title, prompt, status, updated_at")
      .eq("owner_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
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

    const { error: memoryError } = await context.supabase.from("project_memory").insert({
      project_id: project.id,
      owner_id: context.userId,
      category: "brief",
      title: "Original game pitch",
      content: { prompt: data.prompt },
      source_agent: "executive-producer",
      status: "approved",
    });
    if (memoryError) throw new Error(memoryError.message);

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
export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: threads, error } = await context.supabase
      .from("threads")
      .select("id, title, agent, updated_at")
      .eq("project_id", data.projectId)
      .eq("owner_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return threads ?? [];
  });

export const getStudioWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [threadResult, activityResult, artifactResult, runResult, memoryResult] =
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
          .select("id, artifact_type, title, summary, content, produced_by, version, review_status, updated_at")
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
      ]);

    const error =
      threadResult.error ??
      activityResult.error ??
      artifactResult.error ??
      runResult.error ??
      memoryResult.error;
    if (error) throw new Error(error.message);
    if (!threadResult.data) throw new Error("Executive Producer conversation not found");

    return {
      threadId: threadResult.data.id,
      activities: activityResult.data ?? [],
      artifacts: artifactResult.data ?? [],
      run: runResult.data,
      memory: memoryResult.data ?? [],
    };
  });

const CreateThread = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(120),
  agent: z.string().nullable().optional(),
});

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateThread.parse(input))
  .handler(async ({ data, context }) => {
    const { data: thread, error } = await context.supabase
      .from("threads")
      .insert({
        project_id: data.projectId,
        owner_id: context.userId,
        title: data.title,
        agent: data.agent ?? null,
      })
      .select("id")
      .single();
    if (error || !thread) throw new Error(error?.message ?? "Failed to create thread");
    return { id: thread.id };
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
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const RenameThread = z.object({
  threadId: z.string().uuid(),
  title: z.string().min(1).max(120),
});

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RenameThread.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("threads")
      .update({ title: data.title })
      .eq("id", data.threadId)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("threads")
      .delete()
      .eq("id", data.threadId)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("projects")
      .delete()
      .eq("id", data.projectId)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
