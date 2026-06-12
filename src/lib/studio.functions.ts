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

    // seed default thread
    await context.supabase.from("threads").insert({
      project_id: project.id,
      owner_id: context.userId,
      title: "Executive Producer",
      agent: "executive-producer",
    });

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
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return threads ?? [];
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
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
