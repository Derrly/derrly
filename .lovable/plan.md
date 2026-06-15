# Derrly V20 — Autonomous Game Studio OS

## Product direction

Preserve Derrly’s current editorial black-and-white design system, typography, navigation, auth flow, and one-conversation model. The product will evolve around a single principle: the user directs an Executive Producer while the studio’s planning, specialist work, reviews, revisions, approvals, builds, and evidence remain visible and inspectable.

This will be delivered as staged, working milestones rather than placeholder screens. Each milestone ends with route, workflow, responsive, and regression testing.

## Milestone 1 — Studio command center

- Upgrade `/app` into a portfolio-level studio dashboard.
- Show each project’s health score, production progress, active agent, build status, QA status, last revision, latest activity, and last-updated time.
- Add project search, status filters, safe deletion, and realtime status refresh.
- Upgrade `/app/projects/$projectId` into the project command center with clear surfaces for:
  - Overview and project health
  - Studio timeline
  - Project intelligence
  - War Room
  - Quality
  - Prototype Center
  - Artifacts and memory
- Keep the Executive Producer conversation primary, while making studio operations visible beside it.
- Fix current onboarding, stale-run, metadata, mobile layout, and conversion/navigation defects encountered in the audit.

## Milestone 2 — Project intelligence and studio health

- Generate and persist a structured intelligence snapshot after each studio run:
  - current state
  - biggest risks
  - missing systems
  - incomplete content
  - recommended next actions
- Derive project health from evidence rather than a decorative percentage. The score will combine production completion, quality reviews, unresolved QA findings, blocked tasks, and build readiness.
- Show score provenance and the timestamp/run that produced it.
- Let recommended actions prefill a new Executive Producer instruction rather than silently executing work.

## Milestone 3 — War Room, reviews, and approval chains

- Surface real agent handoffs as a meeting-style feed using existing activities and handoffs.
- Show agent discussions, review requests, revision instructions, responses, approvals, and blocked work with timestamps and run context.
- Add artifact-level human actions: approve, request revision, and comment.
- Preserve immutable review history and show the full approval chain from specialist output through QA and Executive Producer sign-off.
- Add run history and task-graph views so users can inspect prior production cycles.

## Milestone 4 — Generation quality system

- Add structured quality reviews for gameplay, story, quests, progression, economy, multiplayer, world, NPCs, and technical feasibility when applicable.
- Score only disciplines present in the project; do not fabricate scores for irrelevant systems.
- Store rubric-level scores, findings, reviewer, evidence, and run association.
- Calculate an explainable overall project score from applicable dimensions.
- Replace the current single implicit revision with bounded revision cycles, visible QA findings, re-review, and an explicit pass/fail outcome.
- Failed or interrupted runs must end in a recoverable failed state with a clear user-facing reason.

## Milestone 5 — Prototype Center

- Create a dedicated project Prototype Center that presents:
  - build preview
  - gameplay overview
  - core-loop preview
  - world overview
  - quest overview
  - build versions and build logs
- Treat the current Game Builder markdown as a specification until an actual runnable browser prototype exists; never label a document as playable.
- Add a structured build manifest and readiness state.
- Support downloadable project packages/artifacts and a safe preview surface for generated browser prototypes.
- Keep prototype generation bounded to browser-safe assets and code that can be validated before previewing.

## Milestone 6 — Smart memory

- Version project decisions correctly: new approved decisions supersede prior versions while preserving history.
- Retrieve memory by project, category, recency, and task relevance instead of injecting every memory row into every model call.
- Add user preference memory for genres, tone, design tendencies, and recurring constraints, with controls to inspect and remove remembered preferences.
- Use previous-project knowledge only when the user opts to reuse or remix it.
- Show why a memory was used in a run.

## Milestone 7 — Community ecosystem

- Replace static showcase claims with real, opt-in public projects.
- Add public project detail pages with approved summaries, quality evidence, selected artifacts, and creator attribution.
- Add Featured, Trending, Community Templates, Remix, and Clone flows.
- Preserve lineage on cloned/remixed projects and copy only explicitly shareable data.
- Keep private projects and private memory inaccessible through strict ownership and publication rules.

## Milestone 8 — Performance and scale

- Add per-project concurrency protection so duplicate studio runs cannot overlap.
- Bound project, message, activity, artifact, and memory queries with pagination or lazy detail loading.
- Debounce realtime refreshes and stop full workspace refetch waterfalls during active runs.
- Add model timeouts, output budgets, retries for recoverable failures, and durable phase/error updates.
- Parallelize only dependency-independent specialist work while preserving the task graph.
- Add query indexes based on measured access patterns and verify plans.
- Measure Lighthouse and browser performance after implementation; optimize toward 95+ without claiming a score that was not achieved.

## Milestone 9 — Trust and transparency

- Show concise agent reasoning summaries, never hidden chain-of-thought.
- Record QA findings, revisions, approvals, build logs, model/run provenance, duration, and failure evidence.
- Add artifact version comparison and export.
- Add user-action audit events for approvals, revision requests, publishing, cloning, and deletion.
- Resolve the current backend security-linter warnings and re-run security checks after schema changes.

## Milestone 10 — Final polish and release validation

- Review every public, auth, dashboard, profile, project, showcase, pricing, and error screen at mobile, tablet, and desktop breakpoints.
- Standardize loading, empty, error, blocked, active, completed, and failed states.
- Verify keyboard access, focus behavior, labels, live-region announcements, contrast, and reduced-motion behavior.
- Remove duplicate metadata and verify page titles, descriptions, canonical behavior, sitemap, and public-share metadata.
- Keep the existing Derrly visual language; improve hierarchy and information density without redesigning unrelated pages.

## Data and security model

Schema additions will be introduced through reviewed migrations with explicit grants and row-level access rules:

- `project_intelligence`: health, state, risks, gaps, recommendations, evidence, run version
- `quality_reviews` and `quality_findings`: rubric scores, findings, disposition, reviewer, run/artifact links
- `artifact_reviews`: human comments, approvals, revision requests, resolution history
- `build_records`: manifest, platform, readiness, preview/export references, logs, version
- `project_events`: durable timeline and user/agent audit evidence
- project publication and lineage fields for public showcase, templates, clone, and remix
- user preference memory with private per-user access

Existing owner-scoped access remains the default. Public reads expose only explicitly published safe fields. Privileged operations remain server-authorized; no role or trust decision will be stored client-side.

## AI and orchestration architecture

- Keep AI work server-side and preserve the Executive Producer as the only user-facing agent.
- Split planning, specialist production, review, revision, intelligence, and build phases into durable run states.
- Stream progress through persisted activities/events rather than holding one opaque request open until every specialist finishes.
- Enforce dependency order, allow safe parallel branches, cap revision cycles, and make every failure resumable.
- Use structured outputs for plans, intelligence, quality rubrics, and build manifests; use markdown only for human-readable artifacts.
- Capture concise reasoning summaries and evidence, not private model chain-of-thought.

## Verification matrix

- Automated unit tests for validation, health calculations, quality aggregation, memory selection, run-state transitions, clone/remix rules, and failure recovery.
- Integration tests for authenticated server functions, ownership isolation, project creation, run concurrency, reviews, exports, publication, cloning, and realtime event persistence.
- Browser tests for every route, primary button, form, tab, filter, navigation path, sign-in/sign-out flow, project workflow, review workflow, prototype workflow, and public showcase flow.
- Responsive checks at 375×812, 768×1024, 1280×720, and 1536×864.
- Accessibility checks for keyboard-only operation, focus order, semantic headings, labels, announcements, and contrast.
- Performance profiling for public first load, dashboard navigation, project workspace render, active-run realtime traffic, and database query latency.
- Dependency, backend linter, and security scans before completion.

## Delivery order and acceptance

1. Command center + intelligence
2. War Room + reviews + quality
3. Prototype Center + build evidence
4. Smart memory
5. Community + remix/clone
6. Performance, trust, and complete QA

A milestone is complete only when its data is real, its actions work, its evidence is inspectable, and its relevant automated and browser tests pass. Actual Lighthouse scores and playable-build capability will be reported from measured output, not asserted in advance.