# Derrly V21 — Self-Improving Autonomous Game Studio

Build on the V20 foundation (intelligence/quality/events tables already exist). V21 closes the loop so the studio runs autonomously after a goal is set.

## Outcomes
- User submits a goal; studio plans, generates, critiques, revises, and approves without manual prompts.
- Every artifact has a multi-axis score; weak scores trigger revisions automatically.
- A live War Room shows agent conversations and handoffs in real time.
- Project Knowledge Base is searchable in natural language.

## Phases

### 1. Executive Producer 2.0 (orchestrator upgrade)
- Refactor `studio-orchestrator.server.ts` into a state machine: `plan → assign → generate → review → revise → approve`.
- Producer emits structured `tasks` (assignee, deliverable, acceptance criteria) and tracks them in a new `studio_tasks` table.
- Producer-authored user-facing status updates posted to the project timeline.

### 2. Autonomous improvement loops
- New `runReviewCycle` server fn: after any artifact is produced, fan out to reviewer agents (QA, Balance, Creative Director) using AI SDK tool calls with `stopWhen: stepCountIs(50)`.
- If aggregate quality < threshold (default 80), Producer auto-spawns a revision task. Max 3 cycles per artifact, then escalate to user.

### 3. Quality Score Engine
- Extend `quality_reviews` with axes: creativity, gameplay, replayability, clarity, balance, feasibility, enjoyment (0–100 each).
- Add `computeProjectQuality` aggregator → writes to `project_intelligence.quality_breakdown` JSONB.
- New Quality tab visual: radar chart + per-artifact scorecards.

### 4. Project Health dashboard
- Extend `project_intelligence` with: completion_pct, risk_items[], missing_features[], tech_debt_notes[], test_coverage_pct.
- Overview tab gets a Health card with Recommended Actions buttons that enqueue tasks.

### 5. Studio War Room (realtime)
- Add `agent_messages` table (project_id, from_agent, to_agent, kind: critique|approval|revision|decision, body, created_at).
- Enable Supabase realtime on `agent_messages`, `agent_handoffs`, `project_events`.
- War Room tab subscribes and renders a chat-style transcript with agent avatars.

### 6. Playable Prototype Pipeline
- Producer emits a `build_manifest` artifact with sections: Gameplay Preview, Core Loop, World Overview, NPC Showcase, Quest Showcase, Systems Overview.
- New Prototype tab renders the manifest as navigable cards with copy/export.

### 7. Memory Evolution
- New `user_preferences` table (favorite_genres, design_patterns, tone). Producer reads it at plan time.
- After project completion, post-mortem agent writes lessons into `project_memory` with `category='lesson'`.

### 8. Knowledge Base
- New Knowledge tab: full-text search (Postgres `tsvector`) across `project_artifacts.content`, `project_memory.body`, `agent_messages.body`.
- Natural-language Q&A: `askProject` server fn embeds query, ranks artifacts, answers via Lovable AI.

### 9. Community Intelligence
- Showcase page: list public projects, "Remix" button clones project + intelligence + key artifacts under new owner.
- Templates registry seeded from highest-quality public projects.

### 10. Production readiness pass
- Audit every route; fix broken links, empty states, loading skeletons, mobile breakpoints.
- Add error boundaries to every `_authenticated` route.

### 11. Premium visual polish
- Restrict palette to pure black/white/soft gray; remove residual accent colors except for status semantics (green/amber/red).
- Tighten type scale, increase whitespace, Linear-style command palette (`⌘K`).

## Technical details

**New tables**
- `studio_tasks(id, project_id, assignee_agent, title, deliverable, acceptance_criteria, status, parent_artifact_id, created_at, updated_at)`
- `agent_messages(id, project_id, from_agent, to_agent, kind, body, created_at)`
- `user_preferences(user_id PK, favorite_genres[], design_patterns jsonb, tone, updated_at)`
- All with GRANTs + RLS scoped to project owner.

**Realtime**
- `ALTER PUBLICATION supabase_realtime ADD TABLE agent_messages, agent_handoffs, project_events, studio_tasks;`

**Orchestrator**
- Single durable run loop in `studio-orchestrator.server.ts` using AI SDK `streamText` + tools (`assignTask`, `submitArtifact`, `reviewArtifact`, `requestRevision`, `approveArtifact`, `postMessage`).
- Persisted to `studio_runs.state` so runs are resumable.

**Search**
- Generated `tsvector` columns + GIN indexes on artifact/memory/message bodies.

## Out of scope (defer)
- Multiplayer real-time collab between human users.
- Engine export (Unity/Unreal codegen).
- Billing/usage metering changes.

## Risks
- AI cost: review loops 3-5x generation cost. Mitigate with per-project run cap + threshold tuning.
- Latency: long autonomous runs need streaming progress; rely on existing `project_events` feed.

Approve to proceed and I'll implement in this order: 1 → 3 → 2 → 5 → 4 → 6 → 7 → 8 → 11 → 10 → 9.
