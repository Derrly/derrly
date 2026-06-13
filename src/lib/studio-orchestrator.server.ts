import { generateText, Output, type UIMessage } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createGroq, GROQ_MODEL } from "@/lib/groq.server";
import { AGENTS } from "@/lib/derrly-data";
import type { Database, Json } from "@/integrations/supabase/types";

type StudioClient = SupabaseClient<Database>;

const specialistIds = AGENTS.filter((agent) => agent.id !== "executive-producer").map(
  (agent) => agent.id,
);

const artifactByAgent: Record<string, { type: string; title: string; category: string }> = {
  "creative-director": { type: "game-design-document", title: "Game Design Document", category: "vision" },
  "world-architect": { type: "world-map", title: "World & Region Blueprint", category: "world" },
  "narrative-designer": { type: "story-bible", title: "Narrative Bible", category: "story" },
  "npc-designer": { type: "character-database", title: "Character Database", category: "npcs" },
  "quest-designer": { type: "quest-tree", title: "Quest & Progression Tree", category: "quests" },
  "gameplay-engineer": { type: "systems-blueprint", title: "Gameplay Systems Blueprint", category: "systems" },
  "economy-designer": { type: "economy-model", title: "Economy & Progression Model", category: "systems" },
  "multiplayer-engineer": { type: "multiplayer-architecture", title: "Multiplayer Architecture", category: "systems" },
  "ui-designer": { type: "interface-system", title: "Interface & Accessibility System", category: "systems" },
  "performance-engineer": { type: "performance-report", title: "Performance Budget", category: "testing" },
  "balance-specialist": { type: "balance-report", title: "Balance Review", category: "testing" },
  "qa-tester": { type: "qa-report", title: "QA Report", category: "testing" },
  "game-builder": { type: "playable-build", title: "Playable Build Specification", category: "assets" },
};

const PlanSchema = z.object({
  brief: z.string(),
  userSummary: z.string(),
  tasks: z.array(
    z.object({
      agent: z.enum(specialistIds as [string, ...string[]]),
      objective: z.string(),
      dependsOn: z.array(z.string()),
    }),
  ),
});

const ReviewSchema = z.object({
  approved: z.boolean(),
  critique: z.string(),
  revisionTarget: z.string(),
  revisionInstruction: z.string(),
});

function agentPrompt(agentId: string) {
  const agent = AGENTS.find((item) => item.id === agentId);
  if (!agent) return "You are a specialist in an autonomous game studio.";
  return `You are Derrly's ${agent.name}. ${agent.role}. Your responsibilities are: ${agent.responsibilities.join("; ")}. Produce concrete, implementation-ready work. Read all shared project memory, respect upstream decisions, identify assumptions, and explicitly describe what downstream agents need.`;
}

function messageText(message: UIMessage) {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

async function must<T>(promise: PromiseLike<{ data: T; error: { message: string } | null }>) {
  const result = await promise;
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function runAutonomousStudio({
  supabase,
  projectId,
  userId,
  projectTitle,
  projectPrompt,
  messages,
}: {
  supabase: StudioClient;
  projectId: string;
  userId: string;
  projectTitle: string;
  projectPrompt: string | null;
  messages: UIMessage[];
}) {
  const groq = createGroq();
  const latestRequest = messageText(messages[messages.length - 1]);
  const existingMemory = await must(
    supabase
      .from("project_memory")
      .select("category, title, content, source_agent, version")
      .eq("project_id", projectId)
      .eq("status", "approved")
      .order("updated_at", { ascending: true }),
  );
  const memoryContext = existingMemory.length
    ? JSON.stringify(existingMemory)
    : "No prior approved project memory exists.";

  const planResult = await generateText({
    model: groq(GROQ_MODEL),
    output: Output.object({ schema: PlanSchema }),
    system: "You are Derrly's Executive Producer. Convert the request into a concise project brief and a dependency-aware production task graph. Select only agents whose expertise is genuinely required. Always include creative-director, qa-tester, and game-builder. Put reviewers after the work they review. Never ask the user to manage specialists.",
    prompt: `Project: ${projectTitle}\nOriginal pitch: ${projectPrompt ?? ""}\nLatest direction: ${latestRequest}\nShared memory: ${memoryContext}`,
  });
  const plan = planResult.output;
  if (!plan) throw new Error("The Executive Producer could not create a production plan.");

  const run = await must(
    supabase
      .from("studio_runs")
      .insert({
        project_id: projectId,
        owner_id: userId,
        status: "running",
        phase: "production",
        task_graph: plan.tasks as unknown as Json,
      })
      .select("id")
      .single(),
  );

  await must(
    supabase.from("project_memory").insert({
      project_id: projectId,
      owner_id: userId,
      category: "brief",
      title: "Executive production brief",
      content: { brief: plan.brief, request: latestRequest },
      source_agent: "executive-producer",
      status: "approved",
    }),
  );
  await must(
    supabase.from("agent_activities").insert({
      project_id: projectId,
      run_id: run.id,
      owner_id: userId,
      agent: "executive-producer",
      activity_type: "planning",
      status: "completed",
      summary: "Created the project brief and production task graph",
      details: { taskCount: plan.tasks.length },
      sequence: 0,
      completed_at: new Date().toISOString(),
    }),
  );

  const outputs = new Map<string, string>();
  for (const [index, task] of plan.tasks.entries()) {
    const agent = AGENTS.find((item) => item.id === task.agent);
    const activity = await must(
      supabase
        .from("agent_activities")
        .insert({
          project_id: projectId,
          run_id: run.id,
          owner_id: userId,
          agent: task.agent,
          activity_type: task.agent === "qa-tester" ? "review" : task.agent === "game-builder" ? "build" : "working",
          status: "active",
          summary: task.objective,
          details: { dependencies: task.dependsOn },
          sequence: index + 1,
        })
        .select("id")
        .single(),
    );

    const dependencyOutputs = task.dependsOn
      .map((dependency) => `${dependency}: ${outputs.get(dependency) ?? "See shared memory"}`)
      .join("\n\n");
    for (const dependency of task.dependsOn) {
      await must(
        supabase.from("agent_handoffs").insert({
          project_id: projectId,
          run_id: run.id,
          owner_id: userId,
          from_agent: dependency,
          to_agent: task.agent,
          request_type: "context",
          status: "accepted",
          context: { objective: task.objective },
          response: "Context incorporated into specialist work.",
          resolved_at: new Date().toISOString(),
        }),
      );
    }

    const generated = await generateText({
      model: groq(GROQ_MODEL),
      system: agentPrompt(task.agent),
      prompt: `PROJECT BRIEF\n${plan.brief}\n\nYOUR ASSIGNMENT\n${task.objective}\n\nAPPROVED SHARED MEMORY\n${memoryContext}\n\nUPSTREAM HANDOFFS\n${dependencyOutputs || "None — establish the foundation for downstream specialists."}\n\nReturn a polished deliverable in markdown.`,
    });
    const output = generated.text;
    outputs.set(task.agent, output);
    const artifact = artifactByAgent[task.agent] ?? {
      type: "studio-output",
      title: `${agent?.name ?? "Specialist"} Deliverable`,
      category: "decision",
    };
    const memory = await must(
      supabase
        .from("project_memory")
        .insert({
          project_id: projectId,
          owner_id: userId,
          category: artifact.category,
          title: artifact.title,
          content: { markdown: output },
          source_agent: task.agent,
          status: task.agent === "qa-tester" ? "review" : "approved",
        })
        .select("id")
        .single(),
    );
    await must(
      supabase.from("project_artifacts").insert({
        project_id: projectId,
        run_id: run.id,
        owner_id: userId,
        artifact_type: artifact.type,
        title: artifact.title,
        summary: task.objective,
        content: { markdown: output },
        produced_by: task.agent,
        review_status: task.agent === "qa-tester" ? "in_review" : "approved",
      }),
    );
    await must(
      supabase
        .from("agent_activities")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", activity.id),
    );
    for (const nextTask of plan.tasks.filter((candidate) => candidate.dependsOn.includes(task.agent))) {
      await must(
        supabase.from("agent_handoffs").insert({
          project_id: projectId,
          run_id: run.id,
          owner_id: userId,
          from_agent: task.agent,
          to_agent: nextTask.agent,
          request_type: "output",
          output_memory_id: memory.id,
          status: "sent",
          context: { artifact: artifact.title },
        }),
      );
    }
  }

  const reviewTargets = [...outputs.entries()].filter(
    ([agent]) => agent !== "qa-tester" && agent !== "game-builder",
  );
  const reviewResult = await generateText({
    model: groq(GROQ_MODEL),
    output: Output.object({ schema: ReviewSchema }),
    system: "You are Derrly's QA Tester and Balance Specialist conducting a cross-discipline gate review. Approve only coherent, feasible work with consistent dependencies. If revision is needed, name the responsible agent and give one concrete correction.",
    prompt: `Brief: ${plan.brief}\n\nDeliverables:\n${reviewTargets.map(([agent, output]) => `${agent}:\n${output}`).join("\n\n")}`,
  });
  const review = reviewResult.output;
  if (review && !review.approved && outputs.has(review.revisionTarget)) {
    await must(
      supabase.from("agent_handoffs").insert({
        project_id: projectId,
        run_id: run.id,
        owner_id: userId,
        from_agent: "qa-tester",
        to_agent: review.revisionTarget,
        request_type: "revision",
        status: "revision_requested",
        context: { critique: review.critique, instruction: review.revisionInstruction },
      }),
    );
    const revision = await generateText({
      model: groq(GROQ_MODEL),
      system: agentPrompt(review.revisionTarget),
      prompt: `Revise your deliverable in response to this review.\nCritique: ${review.critique}\nRequired correction: ${review.revisionInstruction}\nPrevious deliverable:\n${outputs.get(review.revisionTarget)}`,
    });
    outputs.set(review.revisionTarget, revision.text);
    await must(
      supabase.from("project_memory").insert({
        project_id: projectId,
        owner_id: userId,
        category: "revision",
        title: `${review.revisionTarget} approved revision`,
        content: { markdown: revision.text, critique: review.critique },
        source_agent: review.revisionTarget,
        status: "approved",
      }),
    );
    await must(
      supabase.from("agent_activities").insert({
        project_id: projectId,
        run_id: run.id,
        owner_id: userId,
        agent: review.revisionTarget,
        activity_type: "revision",
        status: "completed",
        summary: review.revisionInstruction,
        sequence: plan.tasks.length + 1,
        completed_at: new Date().toISOString(),
      }),
    );
  }

  await must(
    supabase
      .from("studio_runs")
      .update({
        status: "completed",
        phase: "approved",
        revision_count: review && !review.approved ? 1 : 0,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id),
  );
  await must(
    supabase
      .from("projects")
      .update({ status: "ready" })
      .eq("id", projectId),
  );
  await must(
    supabase.from("agent_activities").insert({
      project_id: projectId,
      run_id: run.id,
      owner_id: userId,
      agent: "executive-producer",
      activity_type: "approval",
      status: "completed",
      summary: "Cross-discipline review complete — production package approved",
      sequence: plan.tasks.length + 2,
      completed_at: new Date().toISOString(),
    }),
  );

  const completedAgents = plan.tasks
    .map((task) => AGENTS.find((agent) => agent.id === task.agent)?.name ?? task.agent)
    .join(", ");
  return `## Production cycle approved\n\n${plan.userSummary}\n\n**Studio team deployed:** ${completedAgents}.\n\nI created ${plan.tasks.length} specialist deliverables, coordinated their handoffs, ran a cross-discipline review${review && !review.approved ? ", completed one revision cycle," : ""} and approved the unified production package. Open **Artifacts** to inspect the work or tell me what you want changed next.`;
}