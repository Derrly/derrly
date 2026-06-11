# Derrly AI — Staged Rebuild Plan

This is a multi-turn build. Trying to ship "everything" at once produces placeholders; instead I'll deliver in 4 milestones, each one shippable and reviewable.

## Design system (locked across all milestones)

- Pure black `#000`, pure white `#fff`, soft grays. No gradients, no neon.
- Display font: **Instrument Serif** for editorial headlines + **Inter Tight** for UI/body.
- Generous whitespace, large type, thin hairline borders (`oklch` low-chroma).
- Inspiration: OpenAI / Linear / Vercel / Apple.
- Replace shadcn token defaults in `src/styles.css` with the black/white system.

## Milestone 1 — Foundation + Marketing Site (this turn)

- Enable **Lovable Cloud** (powers auth + DB for later milestones).
- Replace static HTML route with proper TanStack routes. Move old HTML to `/legacy` for reference only.
- New design tokens in `src/styles.css`.
- Routes + per-route SEO metadata:
  - `/` — Hero, What Is Derrly, How It Works (pipeline), Meet The AI Team, What Derrly Creates, Automated Testing, Showcase teaser, Pricing teaser, FAQ teaser, CTA.
  - `/agents` — Full agent roster (14 agents as cards with role/responsibilities/outputs).
  - `/pricing` — Free / Studio / Enterprise.
  - `/faq` — Searchable accordion.
  - `/showcase` — Featured projects grid (seeded content).
  - `/roadmap` — Quarterly timeline.
- Sticky top nav + footer with sitemap/legal links.
- Subtle motion via Framer Motion (already not installed — will add).

## Milestone 2 — Auth + Chat Skeleton

- Email/password + Google sign-in via Lovable Cloud.
- `/auth` page; protected `/app/*` routes via `_authenticated` layout.
- Threaded chat at `/app/$threadId` backed by `threads` + `messages` tables.
- Real streaming via Lovable AI Gateway (`google/gemini-3-flash-preview`) with a system prompt that role-plays Derrly's Executive Producer.
- AI Elements composer + message rendering.

## Milestone 3 — Multi-Agent Orchestration

- Tool-calling loop: Executive Producer delegates to other agents as AI SDK tools (Creative Director, World Architect, etc.).
- Live agent activity panel in the chat sidebar showing each agent's status/task.
- Persist agent steps as message parts.

## Milestone 4 — Project Workspace

- `/app/projects/$projectId` with tabs: Overview, World, Characters, Quests, Gameplay, Economy, Testing, Builds, Version History.
- Structured outputs from the agents populate these tabs.

## Out of scope (explicitly deferred)

- Actually generating playable games / WebGL builds.
- Voice input, file uploads, image uploads in chat (Milestone 2+ candidates).
- Real deployment pipeline, multiplayer netcode, save systems — these are *what the agents discuss producing*, not features of the Lovable app itself.
- 95+ Lighthouse claims — I'll build for quality but won't fabricate audit numbers.

## Technical notes

- TanStack Start file-based routes under `src/routes/`.
- Each route file gets its own `head()` with unique title/description/OG.
- Marketing pages are public SSR; app pages live under `_authenticated/`.
- Old `src/derrly.html` kept at `/legacy` only as visual reference, removed in Milestone 4.

---

**Approving this plan kicks off Milestone 1 only.** Milestones 2–4 are separate turns. Reply "go" to start M1, or tell me what to change.
