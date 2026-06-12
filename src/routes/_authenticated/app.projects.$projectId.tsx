import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowLeft, Plus, Send, Loader2 } from "lucide-react";
import {
  getProject,
  listThreads,
  createThread,
  listMessages,
} from "@/lib/studio.functions";
import { supabase } from "@/integrations/supabase/client";
import { AGENTS } from "@/lib/derrly-data";

export const Route = createFileRoute("/_authenticated/app/projects/$projectId")({
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const fetchProject = useServerFn(getProject);
  const fetchThreads = useServerFn(listThreads);
  const fetchMessages = useServerFn(listMessages);
  const makeThread = useServerFn(createThread);
  const qc = useQueryClient();

  const project = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject({ data: { projectId } }),
  });
  const threads = useQuery({
    queryKey: ["threads", projectId],
    queryFn: () => fetchThreads({ data: { projectId } }),
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeId && threads.data && threads.data.length > 0) {
      setActiveId(threads.data[0].id);
    }
  }, [threads.data, activeId]);

  const existing = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => fetchMessages({ data: { threadId: activeId! } }),
    enabled: !!activeId,
  });

  const initialMessages: UIMessage[] = useMemo(
    () =>
      (existing.data ?? []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        parts: [{ type: "text", text: m.content }],
      })),
    [existing.data],
  );

  const handleAddAgent = async (agent: { id: string; name: string }) => {
    const { id } = await makeThread({
      data: { projectId, title: agent.name, agent: agent.id },
    });
    await qc.invalidateQueries({ queryKey: ["threads", projectId] });
    setActiveId(id);
  };

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-[1400px] grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="border-b hairline lg:border-b-0 lg:border-r">
        <div className="p-4">
          <Link
            to="/app"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" />
            All projects
          </Link>
          <h2 className="mt-4 font-display text-xl text-foreground">
            {project.data?.title ?? "Project"}
          </h2>
          <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
            {project.data?.prompt}
          </p>
        </div>

        <div className="px-4 pb-4">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Threads
          </p>
          <ul className="space-y-0.5">
            {threads.data?.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveId(t.id)}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                    activeId === t.id
                      ? "bg-foreground text-background"
                      : "text-foreground/80 hover:bg-surface"
                  }`}
                >
                  {t.title}
                </button>
              </li>
            ))}
          </ul>

          <p className="mb-2 mt-6 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Add an agent
          </p>
          <ul className="space-y-0.5">
            {AGENTS.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => handleAddAgent(a)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                >
                  <span>{a.name}</span>
                  <Plus className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        {activeId && existing.isSuccess ? (
          <ChatWindow
            key={activeId}
            threadId={activeId}
            initialMessages={initialMessages}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
            {threads.isLoading ? "Loading studio…" : "Pick a thread to start."}
          </div>
        )}
      </section>
    </div>
  );
}

function ChatWindow({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: UIMessage[];
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const headers = new Headers(init?.headers);
          if (data.session?.access_token) {
            headers.set("Authorization", `Bearer ${data.session.access_token}`);
          }
          headers.set("Content-Type", "application/json");
          const original = init?.body
            ? JSON.parse(init.body as string)
            : {};
          return fetch(input, {
            ...init,
            headers,
            body: JSON.stringify({ ...original, threadId }),
          });
        },
      }),
    [threadId],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);

  const busy = status === "submitted" || status === "streaming";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    sendMessage({ text: t });
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Start the conversation. The agent is briefed and waiting.
            </p>
          )}
          <ul className="space-y-6">
            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              if (m.role === "user") {
                return (
                  <li key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-foreground px-4 py-2.5 text-sm text-background">
                      {text}
                    </div>
                  </li>
                );
              }
              return (
                <li key={m.id} className="text-foreground">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Agent
                  </p>
                  <div className="whitespace-pre-wrap text-base leading-relaxed">
                    {text || (busy ? "Thinking…" : "")}
                  </div>
                </li>
              );
            })}
            {busy && messages[messages.length - 1]?.role === "user" && (
              <li className="text-sm text-muted-foreground">
                <Loader2 className="inline size-3 animate-spin" /> Agent is thinking…
              </li>
            )}
            {error && (
              <li className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error.message}
              </li>
            )}
          </ul>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="border-t hairline bg-background p-4"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border hairline bg-card p-2 focus-within:ring-2 focus-within:ring-foreground">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e);
              }
            }}
            rows={1}
            placeholder="Talk to the agent…"
            className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-40"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
      </form>
    </>
  );
}
