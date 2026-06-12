import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createGroq, GROQ_MODEL } from "@/lib/groq.server";
import { AGENTS } from "@/lib/derrly-data";
import type { Database } from "@/integrations/supabase/types";

type Body = {
  messages?: UIMessage[];
  threadId?: string;
};

function systemPromptForAgent(agent: string | null) {
  const a = AGENTS.find((x) => x.id === agent);
  const base =
    "You are part of Derrly, an autonomous AI game studio of 14 specialist agents. Be concrete, opinionated, and concise. Always speak in the voice of your role. Reference the project brief when present.";
  if (!a) return base;
  return `${base}\n\nYou are the ${a.name} (${a.role}). Your responsibilities: ${a.responsibilities.join("; ")}. Your outputs: ${a.outputs.join(", ")}.`;
}

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

        // verify thread ownership + fetch agent
        const { data: thread, error: threadErr } = await supabase
          .from("threads")
          .select("id, agent, owner_id")
          .eq("id", threadId)
          .maybeSingle();
        if (threadErr || !thread || thread.owner_id !== userId) {
          return new Response("Forbidden", { status: 403 });
        }

        // persist the latest user message
        const last = messages[messages.length - 1];
        if (last?.role === "user") {
          const text = last.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          await supabase.from("messages").insert({
            thread_id: threadId,
            owner_id: userId,
            role: "user",
            content: text,
            parts: last.parts as unknown as Database["public"]["Tables"]["messages"]["Insert"]["parts"],
            ai_message_id: last.id ?? null,
          });
        }

        let groq;
        try {
          groq = createGroq();
        } catch (e) {
          return new Response((e as Error).message, { status: 500 });
        }

        const result = streamText({
          model: groq(GROQ_MODEL),
          system: systemPromptForAgent(thread.agent),
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            const assistant = finalMessages[finalMessages.length - 1];
            if (!assistant || assistant.role !== "assistant") return;
            const text = assistant.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            await supabase.from("messages").insert({
              thread_id: threadId,
              owner_id: userId,
              role: "assistant",
              content: text,
              parts: assistant.parts as unknown as Database["public"]["Tables"]["messages"]["Insert"]["parts"],
              model: GROQ_MODEL,
              ai_message_id: assistant.id ?? null,
            });
            await supabase
              .from("threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          },
        });
      },
    },
  },
});
