import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Send, Loader2, Check, Circle, FileText, Brain, Radio, Gauge, MessagesSquare, FlaskConical, Hammer, AlertTriangle, ArrowRight } from "lucide-react";
import { getProject, getStudioWorkspace, listMessages, reviewArtifact, askProject } from "@/lib/studio.functions";
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
  const queryClient = useQueryClient();
  const workspace = useQuery({
    queryKey: ["studio-workspace", projectId],
    queryFn: () => fetchWorkspace({ data: { projectId } }),
  });

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => void queryClient.invalidateQueries({ queryKey: ["studio-workspace", projectId] }), 400);
    };
    const channel = supabase
      .channel(`studio:${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_activities", filter: `project_id=eq.${projectId}` },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${projectId}` },
        () => queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      )
      .subscribe();
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);


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
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Executive Producer
              </p>
              <h1 className="mt-1 font-display text-3xl text-foreground">
                {project.data?.title ?? "Project"}
              </h1>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border hairline px-3 py-1 text-xs text-muted-foreground">
              <span
                className={`size-1.5 rounded-full ${workspace.data?.run?.status === "running" ? "animate-pulse bg-foreground" : "bg-muted-foreground"}`}
              />
              {workspace.data?.run?.status === "running"
                ? "Studio working"
                : (project.data?.status ?? "Ready")}
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
            {workspace.isError || existing.isError
              ? "The studio could not be loaded."
              : "Opening the studio…"}
          </div>
        )}
      </section>

      <StudioPanel projectId={projectId} workspace={workspace.data} />
    </div>
  );
}

function StudioPanel({
  projectId,
  workspace,
}: {
  projectId: string;
  workspace: Awaited<ReturnType<typeof getStudioWorkspace>> | undefined;
}) {
  const activities = workspace?.activities ?? [];
  const artifacts = workspace?.artifacts ?? [];
  const memory = workspace?.memory ?? [];
  const events = workspace?.events ?? [];
  const handoffs = workspace?.handoffs ?? [];
  const quality = workspace?.quality ?? [];
  const intelligence = workspace?.intelligence;
  const build = workspace?.build;
  const agentMessages = workspace?.agentMessages ?? [];
  const averageQuality = quality.length ? Math.round(quality.reduce((sum, item) => sum + item.score, 0) / quality.length) : 0;
  const overallAxes = (() => {
    const breakdown = intelligence?.quality_breakdown as { axes?: Record<string, number> } | null | undefined;
    return breakdown?.axes ?? null;
  })();
  return (
    <aside className="min-w-0 bg-surface/40">
      <Tabs defaultValue="overview" className="sticky top-14">
        <div className="overflow-x-auto border-b hairline px-3 py-3">
          <TabsList className="inline-flex min-w-max">
            <TabsTrigger value="overview"><Gauge /> Overview</TabsTrigger>
            <TabsTrigger value="activity"><Radio /> Timeline</TabsTrigger>
            <TabsTrigger value="war-room"><MessagesSquare /> War Room</TabsTrigger>
            <TabsTrigger value="quality"><FlaskConical /> Quality</TabsTrigger>
            <TabsTrigger value="prototype"><Hammer /> Build</TabsTrigger>
            <TabsTrigger value="knowledge"><Brain /> Knowledge</TabsTrigger>
            <TabsTrigger value="artifacts"><FileText /> Artifacts</TabsTrigger>
            <TabsTrigger value="memory"><Brain /> Memory</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5">
          <SectionLabel>Project intelligence</SectionLabel>
          {intelligence ? <>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border hairline bg-hairline">
              <ScoreCell label="Project health" score={intelligence.health_score} />
              <ScoreCell label="Progress" score={intelligence.progress_percent} />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-foreground">{intelligence.current_state}</p>
            <IntelligenceList icon={AlertTriangle} label="Biggest risks" items={asStrings(intelligence.biggest_risks)} />
            <IntelligenceList icon={Circle} label="Missing systems" items={asStrings(intelligence.missing_systems)} />
            <IntelligenceList icon={ArrowRight} label="Recommended next" items={asStrings(intelligence.recommended_actions)} />
          </> : <EmptyText>Run the studio once to generate an evidence-based health assessment.</EmptyText>}
        </TabsContent>
        <TabsContent
          value="activity"
          className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5"
        >
          <div aria-live="polite">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Studio activity
            </p>
            {(events.length || activities.length) ? (
              <ol className="mt-5 space-y-5">
                {(events.length ? events.map((event) => ({ ...event, agent: event.actor, status: "completed" })) : activities).map((activity) => {
                  const agent = AGENTS.find((item) => item.id === activity.agent);
                  return (
                    <li key={activity.id} className="grid grid-cols-[18px_1fr] gap-3">
                      <span className="mt-0.5 text-muted-foreground">
                        {activity.status === "completed" ? (
                          <Check className="size-4" />
                        ) : (
                          <Circle className="size-3 animate-pulse fill-current" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {agent?.name ?? activity.agent}
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                          {activity.summary}
                        </p>
                        <time className="mt-1 block text-[10px] uppercase tracking-widest text-muted-foreground">{formatTime(activity.created_at)}</time>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Your studio is ready. Give the Executive Producer a direction to begin.
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="war-room" className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5">
          <SectionLabel>Studio meeting</SectionLabel>
          {agentMessages.length || handoffs.length ? (
            <ol className="mt-5 space-y-4">
              {agentMessages.map((msg) => (
                <li key={msg.id} className="rounded-lg border hairline p-3">
                  <p className="text-xs font-medium text-foreground">
                    {agentName(msg.from_agent)}
                    {msg.to_agent ? <> <ArrowRight className="mx-1 inline size-3" /> {agentName(msg.to_agent)}</> : null}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{msg.body}</p>
                  <span className="mt-2 inline-block rounded-full border hairline px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{msg.kind}</span>
                </li>
              ))}
              {handoffs.map((handoff) => (
                <li key={handoff.id} className="border-l-2 hairline pl-4">
                  <p className="text-xs font-medium text-foreground">{agentName(handoff.from_agent)} <ArrowRight className="mx-1 inline size-3" /> {agentName(handoff.to_agent)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{handoffText(handoff)}</p>
                  <span className="mt-2 inline-block rounded-full border hairline px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{handoff.status.replaceAll("_", " ")}</span>
                </li>
              ))}
            </ol>
          ) : <EmptyText>Agent discussions, reviews, and revisions will appear during production.</EmptyText>}
        </TabsContent>
        <TabsContent value="quality" className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5">
          <SectionLabel>Generation quality</SectionLabel>
          {quality.length ? (
            <>
              <div className="mt-4 rounded-xl border hairline p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Overall project score</p>
                <p className="mt-2 font-display text-5xl text-foreground">{averageQuality}%</p>
              </div>
              {overallAxes ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {Object.entries(overallAxes).map(([axis, score]) => (
                    <div key={axis} className="rounded-lg border hairline p-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{axis}</p>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="font-display text-2xl text-foreground">{score}</span>
                        <div className="ml-2 h-1.5 flex-1 overflow-hidden rounded-full bg-hairline">
                          <div className="h-full bg-foreground" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <ul className="mt-4 divide-y hairline">
                {quality.map((item) => (
                  <li key={item.id} className="py-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium capitalize text-foreground">{item.discipline}</p>
                      <strong className="font-display text-2xl font-normal">{item.score}%</strong>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : <EmptyText>Rubric scores appear after QA reviews the production package.</EmptyText>}
        </TabsContent>
        <TabsContent value="prototype" className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5">
          <SectionLabel>Prototype center</SectionLabel>
          {build ? <><div className="mt-4 flex items-center justify-between rounded-xl border hairline p-4"><div><p className="text-sm font-medium text-foreground">Build v{build.version}</p><p className="mt-1 text-xs text-muted-foreground">Design specification</p></div><span className="rounded-full border hairline px-2 py-1 text-[10px] uppercase tracking-widest">{build.status}</span></div><BuildSection title="Gameplay overview" content={build.gameplay_overview} /><BuildSection title="Core loop" content={build.core_loop} /><BuildSection title="World overview" content={build.world_overview} /><BuildSection title="Quest overview" content={build.quest_overview} /></> : <EmptyText>The Game Builder has not produced a build specification yet.</EmptyText>}
        </TabsContent>
        <TabsContent value="knowledge" className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5">
          <KnowledgePanel projectId={projectId} />
        </TabsContent>

        <TabsContent
          value="artifacts"
          className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Approved deliverables
          </p>
          {artifacts.length ? (
            <div className="mt-4 space-y-3">
              {artifacts.map((artifact) => (
                <ArtifactItem key={artifact.id} projectId={projectId} artifact={artifact} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Artifacts appear here as specialists complete and review their work.
            </p>
          )}
        </TabsContent>
        <TabsContent value="memory" className="m-0 max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Shared project state
          </p>
          {memory.length ? (
            <ul className="mt-4 divide-y hairline">
              {memory.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {AGENTS.find((a) => a.id === item.source_agent)?.name ?? item.source_agent} · v
                    {item.version}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function KnowledgePanel({ projectId }: { projectId: string }) {
  const ask = useServerFn(askProject);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const mutation = useMutation({
    mutationFn: (question: string) => ask({ data: { projectId, question } }),
    onSuccess: (res) => setAnswer(res.answer),
  });
  return (
    <div>
      <SectionLabel>Project knowledge base</SectionLabel>
      <p className="mt-3 text-sm text-muted-foreground">Ask anything about your game. The assistant searches every approved artifact and memory.</p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); if (q.trim()) mutation.mutate(q.trim()); }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What factions exist in my game?"
          className="flex-1 rounded-md border hairline bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <Button type="submit" disabled={mutation.isPending || !q.trim()}>
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Ask"}
        </Button>
      </form>
      {mutation.isError ? <p className="mt-3 text-xs text-destructive">Could not get an answer. Try again.</p> : null}
      {answer ? (
        <div className="prose prose-sm mt-5 max-w-none text-foreground">
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}


const SectionLabel = ({ children }: { children: React.ReactNode }) => <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{children}</p>;
const EmptyText = ({ children }: { children: React.ReactNode }) => <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{children}</p>;
const asStrings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const formatTime = (value: string) => new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const agentName = (id: string) => AGENTS.find((agent) => agent.id === id)?.name ?? id.replaceAll("-", " ");

function ScoreCell({ label, score }: { label: string; score: number }) {
  return <div className="bg-background p-4"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-2 font-display text-4xl text-foreground">{score}%</p></div>;
}

function IntelligenceList({ icon: Icon, label, items }: { icon: typeof Circle; label: string; items: string[] }) {
  if (!items.length) return null;
  return <div className="mt-5"><p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground"><Icon className="size-3" />{label}</p><ul className="mt-2 space-y-2">{items.map((item) => <li key={item} className="text-sm leading-relaxed text-foreground">{item}</li>)}</ul></div>;
}

function handoffText(handoff: { request_type: string; context: unknown; response: string | null }) {
  if (handoff.response) return handoff.response;
  if (handoff.context && typeof handoff.context === "object" && !Array.isArray(handoff.context)) {
    const context = handoff.context as Record<string, unknown>;
    const detail = context.instruction ?? context.critique ?? context.objective ?? context.artifact;
    if (typeof detail === "string") return detail;
  }
  return `${handoff.request_type.replaceAll("_", " ")} shared with the next specialist.`;
}

function BuildSection({ title, content }: { title: string; content: string }) {
  return <details className="border-b hairline py-4"><summary className="cursor-pointer text-sm font-medium text-foreground">{title}</summary><div className="prose prose-sm mt-3 max-w-none text-muted-foreground"><ReactMarkdown>{content}</ReactMarkdown></div></details>;
}

type StudioArtifact = NonNullable<Awaited<ReturnType<typeof getStudioWorkspace>>>["artifacts"][number];

function ArtifactItem({ projectId, artifact }: { projectId: string; artifact: StudioArtifact }) {
  const review = useServerFn(reviewArtifact);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (decision: "approved" | "revision_requested") => review({ data: { projectId, artifactId: artifact.id, decision, comment: decision === "revision_requested" ? "Please revise this deliverable based on the latest project direction." : "" } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio-workspace", projectId] }),
  });
  const markdown = artifact.content && typeof artifact.content === "object" && !Array.isArray(artifact.content) && typeof artifact.content.markdown === "string" ? artifact.content.markdown : artifact.summary;
  return <details className="group border-b hairline pb-3"><summary className="cursor-pointer list-none py-2"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-foreground">{artifact.title}</p><p className="mt-1 text-xs text-muted-foreground">{agentName(artifact.produced_by)} · {artifact.review_status.replaceAll("_", " ")}</p></div><span className="rounded-full border hairline px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">v{artifact.version}</span></div></summary><div className="prose prose-sm mt-2 max-w-none text-sm leading-relaxed text-foreground"><ReactMarkdown>{markdown}</ReactMarkdown></div><div className="mt-4 flex gap-2"><Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate("revision_requested")}>Request revision</Button><Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate("approved")}><Check /> Approve</Button></div></details>;
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
          const original = init?.body ? JSON.parse(init.body as string) : {};
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
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
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
                    <ReactMarkdown>
                      {text || (busy ? "Coordinating the studio…" : "")}
                    </ReactMarkdown>
                  </div>
                </li>
              );
            })}
            {busy && messages[messages.length - 1]?.role === "user" && (
              <li className="text-sm text-muted-foreground">
                <Loader2 className="inline size-3 animate-spin" /> Executive Producer is
                coordinating the studio…
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

      <form onSubmit={submit} className="border-t hairline bg-background p-4">
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
