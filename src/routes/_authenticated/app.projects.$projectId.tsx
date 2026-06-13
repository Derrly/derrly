import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Send, Loader2, Check, Circle, FileText, Brain, Radio } from "lucide-react";
import { getProject, getStudioWorkspace, listMessages } from "@/lib/studio.functions";
import { supabase } from "@/integrations/supabase/client";
import { AGENTS } from "@/lib/derrly-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/app/projects/$projectId")({
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const fetchProject = useServerFn(getProject);
  const fetchWorkspace = useServerFn(getStudioWorkspace);
  const fetchMessages = useServerFn(listMessages);

  const project = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject({ data: { projectId } }),
  });
  const workspace = useQuery({
    queryKey: ["studio-workspace", projectId],
    queryFn: () => fetchWorkspace({ data: { projectId } }),
    refetchInterval: 2500,
  });

  const existing = useQuery({
    queryKey: ["messages", workspace.data?.threadId],
    queryFn: () => {
      const threadId = workspace.data?.threadId;
      if (!threadId) throw new Error("Executive Producer conversation not found");
      return fetchMessages({ data: { threadId } });
    },
    enabled: Boolean(workspace.data?.threadId),
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

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-[1600px] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="flex min-h-[70dvh] min-w-0 flex-col border-b hairline xl:border-b-0 xl:border-r">
        <header className="border-b hairline px-5 py-4 md:px-8">
          <Link
            to="/app"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" />
            All projects
          </Link>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Executive Producer</p>
              <h1 className="mt-1 font-display text-3xl text-foreground">
            {project.data?.title ?? "Project"}
              </h1>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border hairline px-3 py-1 text-xs text-muted-foreground">
              <span className={`size-1.5 rounded-full ${workspace.data?.run?.status === "running" ? "animate-pulse bg-foreground" : "bg-muted-foreground"}`} />
              {workspace.data?.run?.status === "running" ? "Studio working" : project.data?.status ?? "Ready"}
            </span>
          </div>
        </header>
        {workspace.data?.threadId && existing.isSuccess ? (
          <ChatWindow
            key={workspace.data.threadId}
            projectId={projectId}
            threadId={workspace.data.threadId}
            initialRequest={project.data?.prompt ?? ""}
            initialMessages={initialMessages}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
            {workspace.isError || existing.isError ? "The studio could not be loaded." : "Opening the studio…"}
          </div>
        )}
      </section>

      <StudioPanel workspace={workspace.data} />
    </div>
  );
}

function StudioPanel({ workspace }: { workspace: Awaited<ReturnType<typeof getStudioWorkspace>> | undefined }) {
  const activities = workspace?.activities ?? [];
  const artifacts = workspace?.artifacts ?? [];
  const memory = workspace?.memory ?? [];
  return (
    <aside className="min-w-0 bg-surface/40">
      <Tabs defaultValue="activity" className="sticky top-14">
        <div className="border-b hairline px-4 py-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity"><Radio /> Live</TabsTrigger>
            <TabsTrigger value="artifacts"><FileText /> Artifacts</TabsTrigger>
            <TabsTrigger value="memory"><Brain /> Memory</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="activity" className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5">
          <div aria-live="polite">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Studio activity</p>
            {activities.length ? (
              <ol className="mt-5 space-y-5">
                {activities.map((activity) => {
                  const agent = AGENTS.find((item) => item.id === activity.agent);
                  return (
                    <li key={activity.id} className="grid grid-cols-[18px_1fr] gap-3">
                      <span className="mt-0.5 text-muted-foreground">
                        {activity.status === "completed" ? <Check className="size-4" /> : <Circle className="size-3 animate-pulse fill-current" />}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{agent?.name ?? activity.agent}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{activity.summary}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : <p className="mt-4 text-sm text-muted-foreground">Your studio is ready. Give the Executive Producer a direction to begin.</p>}
          </div>
        </TabsContent>
        <TabsContent value="artifacts" className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Approved deliverables</p>
          {artifacts.length ? <div className="mt-4 space-y-3">{artifacts.map((artifact) => (
            <details key={artifact.id} className="group border-b hairline pb-3">
              <summary className="cursor-pointer list-none py-2">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-sm font-medium text-foreground">{artifact.title}</p><p className="mt-1 text-xs text-muted-foreground">{AGENTS.find((a) => a.id === artifact.produced_by)?.name ?? artifact.produced_by}</p></div>
                  <span className="rounded-full border hairline px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">v{artifact.version}</span>
                </div>
              </summary>
              <div className="prose prose-sm mt-2 max-w-none text-sm leading-relaxed text-foreground [&_h1]:font-display [&_h2]:font-display [&_h3]:font-medium [&_li]:my-1 [&_p]:my-2">
                <ReactMarkdown>{artifact.content && typeof artifact.content === "object" && !Array.isArray(artifact.content) && typeof artifact.content.markdown === "string" ? artifact.content.markdown : artifact.summary}</ReactMarkdown>
              </div>
            </details>
          ))}</div> : <p className="mt-4 text-sm text-muted-foreground">Artifacts appear here as specialists complete and review their work.</p>}
        </TabsContent>
        <TabsContent value="memory" className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Shared project state</p>
          {memory.length ? <ul className="mt-4 divide-y hairline">{memory.map((item) => (
            <li key={item.id} className="py-3">
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-foreground">{item.title}</p><span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.category}</span></div>
              <p className="mt-1 text-xs text-muted-foreground">{AGENTS.find((a) => a.id === item.source_agent)?.name ?? item.source_agent} · v{item.version}</p>
            </li>
          ))}</ul> : null}
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function ChatWindow({
  projectId,
  threadId,
  initialRequest,
  initialMessages,
}: {
  projectId: string;
  threadId: string;
  initialRequest: string;
  initialMessages: UIMessage[];
}) {
  const queryClient = useQueryClient();
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
    onFinish: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["studio-workspace", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      ]);
    },
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startedInitialRun = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (startedInitialRun.current || initialMessages.length > 0 || !initialRequest.trim()) return;
    startedInitialRun.current = true;
    void sendMessage({ text: initialRequest.trim() });
  }, [initialMessages.length, initialRequest, sendMessage]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    await sendMessage({ text: t });
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
                    Executive Producer
                  </p>
                  <div className="prose max-w-none text-base leading-relaxed text-foreground prose-headings:font-display prose-p:my-3 prose-li:my-1">
                    <ReactMarkdown>{text || (busy ? "Coordinating the studio…" : "")}</ReactMarkdown>
                  </div>
                </li>
              );
            })}
            {busy && messages[messages.length - 1]?.role === "user" && (
              <li className="text-sm text-muted-foreground">
                <Loader2 className="inline size-3 animate-spin" /> Executive Producer is coordinating the studio…
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
          <Button
            type="submit"
            size="icon"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="shrink-0 rounded-full"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </form>
    </>
  );
}
