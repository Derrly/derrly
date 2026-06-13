import { createFileRoute } from "@tanstack/react-router";
import { type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { runAutonomousStudio } from "@/lib/studio-orchestrator.server";

type Body = {
  messages?: UIMessage[];
  threadId?: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const { messages, threadId } = body;
        if (!Array.isArray(messages) || !threadId) {
          return new Response("messages and threadId are required", { status: 400 });
        }
        const latestClientMessage = messages[messages.length - 1];
        if (!latestClientMessage || latestClientMessage.role !== "user") {
          return new Response("A user message is required", { status: 400 });
        }

        const auth = request.headers.get("authorization") ?? "";
        if (!auth.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = auth.slice("Bearer ".length);

        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });

        const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
        if (claimsErr || !claims?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = claims.claims.sub;

        // Only the project's permanent Executive Producer conversation is user-facing.
        const { data: thread, error: threadErr } = await supabase
          .from("threads")
          .select("id, agent, owner_id, project_id, projects(title, prompt)")
          .eq("id", threadId)
          .maybeSingle();
        if (
          threadErr ||
          !thread ||
          thread.owner_id !== userId ||
          thread.agent !== "executive-producer"
        ) {
          return new Response("Forbidden", { status: 403 });
        }

        const text = latestClientMessage.parts
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("")
          .trim();
        if (!text || text.length > 4000) {
          return new Response("Message must be between 1 and 4000 characters", { status: 400 });
        }
        const { error: userMessageError } = await supabase.from("messages").insert({
          thread_id: threadId,
          owner_id: userId,
          role: "user",
          content: text,
          parts: [{ type: "text", text }],
          ai_message_id: latestClientMessage.id ?? null,
        });
        if (userMessageError) {
          return new Response("Could not save your message", { status: 500 });
        }

        const { data: canonicalRows, error: canonicalError } = await supabase
          .from("messages")
          .select("id, role, content, parts")
          .eq("thread_id", threadId)
          .eq("owner_id", userId)
          .order("created_at", { ascending: true });
        if (canonicalError) {
          return new Response("Could not load the conversation", { status: 500 });
        }
        const canonicalMessages: UIMessage[] = (canonicalRows ?? []).map((row) => ({
          id: row.id,
          role: row.role as "user" | "assistant" | "system",
          parts: [{ type: "text", text: row.content }],
        }));

        try {
          const projects = thread.projects;
          const project = Array.isArray(projects) ? projects[0] : projects;
          const summary = await runAutonomousStudio({
            supabase,
            projectId: thread.project_id,
            userId,
            projectTitle: project?.title ?? "Untitled game",
            projectPrompt: project?.prompt ?? null,
            messages: canonicalMessages,
          });
          const assistantId = crypto.randomUUID();
          const assistantParts = [{ type: "text" as const, text: summary }];
          const { error: assistantError } = await supabase.from("messages").insert({
            thread_id: threadId,
            owner_id: userId,
            role: "assistant",
            content: summary,
            parts: assistantParts,
            model: "derrly-orchestrator-v1",
            ai_message_id: assistantId,
          });
          if (assistantError) throw new Error(assistantError.message);
          const { error: threadUpdateError } = await supabase
            .from("threads")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", threadId);
          if (threadUpdateError) throw new Error(threadUpdateError.message);

          const stream = new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "start", messageId: assistantId })}\n\n`,
                ),
              );
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text-start", id: "summary" })}\n\n`,
                ),
              );
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text-delta", id: "summary", delta: summary })}\n\n`,
                ),
              );
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text-end", id: "summary" })}\n\n`),
              );
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "finish" })}\n\n`));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            },
          });
          return new Response(stream, {
            headers: {
              "content-type": "text/event-stream",
              "cache-control": "no-cache",
              "x-vercel-ai-ui-message-stream": "v1",
            },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Studio orchestration failed";
          await supabase
            .from("projects")
            .update({ status: "needs-attention" })
            .eq("id", thread.project_id);
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
