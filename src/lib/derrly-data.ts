export type Agent = {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  outputs: string[];
};

export const AGENTS: Agent[] = [
  {
    id: "executive-producer",
    name: "Executive Producer",
    role: "Coordinates the studio",
    responsibilities: [
      "Translates your idea into a project brief",
      "Assigns work to every other agent",
      "Tracks milestones and blockers",
    ],
    outputs: ["Project brief", "Production schedule", "Status reports"],
  },
  {
    id: "creative-director",
    name: "Creative Director",
    role: "Owns the creative vision",
    responsibilities: [
      "Defines the genre, tone, and pillars",
      "Approves art direction and references",
      "Reviews work for consistency",
    ],
    outputs: ["Vision doc", "Mood boards", "Art bible"],
  },
  {
    id: "world-architect",
    name: "World Architect",
    role: "Builds the universe",
    responsibilities: [
      "Designs maps, regions, and biomes",
      "Authors lore and history",
      "Plans points of interest",
    ],
    outputs: ["World map", "Region briefs", "Lore wiki"],
  },
  {
    id: "narrative-designer",
    name: "Narrative Designer",
    role: "Writes the story",
    responsibilities: [
      "Plots the main arc",
      "Writes side stories and branching choices",
      "Maintains tone and voice",
    ],
    outputs: ["Story outline", "Scene scripts", "Branching graph"],
  },
  {
    id: "npc-designer",
    name: "NPC Designer",
    role: "Brings characters to life",
    responsibilities: [
      "Designs characters and factions",
      "Writes personalities and motivations",
      "Generates dialogue",
    ],
    outputs: ["Character sheets", "Dialogue trees", "Faction relations"],
  },
  {
    id: "quest-designer",
    name: "Quest Designer",
    role: "Designs the play loop",
    responsibilities: [
      "Plans quests and side missions",
      "Tunes pacing and rewards",
      "Connects quests to the world",
    ],
    outputs: ["Quest log", "Reward tables", "Quest dependency graph"],
  },
  {
    id: "gameplay-engineer",
    name: "Gameplay Engineer",
    role: "Builds the systems",
    responsibilities: [
      "Implements combat, movement, abilities",
      "Wires inputs and feedback",
      "Optimizes feel",
    ],
    outputs: ["Gameplay scripts", "Ability definitions", "Input maps"],
  },
  {
    id: "economy-designer",
    name: "Economy Designer",
    role: "Tunes the numbers",
    responsibilities: [
      "Designs currencies and items",
      "Balances drops and progression",
      "Prevents exploits",
    ],
    outputs: ["Loot tables", "Progression curves", "Price lists"],
  },
  {
    id: "multiplayer-engineer",
    name: "Multiplayer Engineer",
    role: "Designs the netcode",
    responsibilities: [
      "Plans authority and replication",
      "Designs matchmaking and lobbies",
      "Hardens against cheating",
    ],
    outputs: ["Net topology", "Replication spec", "Matchmaking flows"],
  },
  {
    id: "ui-designer",
    name: "UI Designer",
    role: "Designs the interface",
    responsibilities: [
      "Designs HUDs, menus, and screens",
      "Defines visual hierarchy",
      "Accessibility audits",
    ],
    outputs: ["UI mockups", "Component library", "Accessibility report"],
  },
  {
    id: "performance-engineer",
    name: "Performance Engineer",
    role: "Keeps it fast",
    responsibilities: [
      "Profiles CPU, GPU, memory",
      "Recommends optimizations",
      "Sets perf budgets per platform",
    ],
    outputs: ["Profile reports", "Optimization tasks", "Perf budget"],
  },
  {
    id: "balance-specialist",
    name: "Balance Specialist",
    role: "Tunes difficulty",
    responsibilities: [
      "Simulates encounters and metas",
      "Adjusts numbers to keep games fair",
      "Flags dominant strategies",
    ],
    outputs: ["Balance reports", "Tuning patches", "Meta projections"],
  },
  {
    id: "qa-tester",
    name: "QA Tester",
    role: "Plays the game first",
    responsibilities: [
      "Runs scripted and exploratory tests",
      "Files bugs with reproduction steps",
      "Verifies fixes",
    ],
    outputs: ["Test runs", "Bug reports", "Regression suite"],
  },
  {
    id: "game-builder",
    name: "Game Builder",
    role: "Ships the build",
    responsibilities: [
      "Compiles assets and code",
      "Packages for target platforms",
      "Manages versions and rollbacks",
    ],
    outputs: ["Build artifacts", "Release notes", "Version history"],
  },
];

export type FAQ = { q: string; a: string };

export const FAQS: FAQ[] = [
  {
    q: "What exactly does Derrly do?",
    a: "Derrly is an autonomous AI game studio. You describe a game in plain English and a coordinated team of specialist agents — producer, creative director, world architect, gameplay engineer, QA — designs, writes, tests, and assembles it for you.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Derrly is conversation-first. If you can describe what you want, the studio can build toward it. Engineers can still dive into outputs at any layer.",
  },
  {
    q: "What kinds of games can it make?",
    a: "RPGs, roguelikes, shooters, sandboxes, simulators, multiplayer arenas, narrative adventures. Anything that can be described as a system of mechanics, content, and rules.",
  },
  {
    q: "Who owns what Derrly creates?",
    a: "You do. Every world, character, quest, line of dialogue, and build artifact your studio generates belongs to your account.",
  },
  {
    q: "How is testing handled?",
    a: "Every build runs through QA, Performance, Balance, and Accessibility agents before it reaches you. You see the report alongside the build.",
  },
  {
    q: "Can I work with my team?",
    a: "Studios on the team plan support shared projects, role-based access, and reviewer comments on agent outputs.",
  },
  {
    q: "Is my data private?",
    a: "Your prompts and project data are encrypted in transit and at rest. We never train shared models on private project content.",
  },
  {
    q: "Can I export or self-host my game?",
    a: "Yes. Builds are exportable, and the underlying world data, scripts, and assets can be downloaded from any project.",
  },
];

export type Pipeline = { step: string; agent: string; output: string };

export const PIPELINE: Pipeline[] = [
  { step: "01", agent: "You", output: "A spoken idea" },
  { step: "02", agent: "Executive Producer", output: "Project brief" },
  { step: "03", agent: "Creative Director", output: "Vision and pillars" },
  { step: "04", agent: "World Architect", output: "Map and lore" },
  { step: "05", agent: "Gameplay Team", output: "Systems and content" },
  { step: "06", agent: "QA Team", output: "Tested build" },
  { step: "07", agent: "Game Builder", output: "Playable game" },
];

export const CREATES = [
  "Worlds", "Maps", "NPCs", "Quests", "Stories", "Dialogue",
  "Economies", "Multiplayer systems", "UI systems", "Save systems",
  "Tutorials", "Cutscenes", "Soundscapes", "Playable builds",
];

export type Project = {
  id: string;
  title: string;
  genre: string;
  blurb: string;
  author: string;
};

export const SHOWCASE: Project[] = [
  { id: "umbra", title: "Umbra Reach", genre: "Co-op horror", blurb: "Six investigators, one collapsing cathedral, infinite ways to die.", author: "Studio Foglight" },
  { id: "neon-haul", title: "Neon Haul", genre: "Trucker roguelike", blurb: "Smuggle cargo across a rain-soaked freeway state.", author: "Vanta Garage" },
  { id: "kelp", title: "Kelp Court", genre: "Underwater RPG", blurb: "Negotiate with sentient kelp colonies to inherit the reef.", author: "Tideborne" },
  { id: "after-school", title: "After School Detectives", genre: "Cozy mystery", blurb: "Four kids, twelve suspects, one missing bus driver.", author: "Hometown Pixel" },
  { id: "vanguard", title: "Vanguard Protocol", genre: "Tactical shooter", blurb: "Squad-based extraction in a frozen orbital ring.", author: "Penumbra Labs" },
  { id: "garden", title: "Garden Witch", genre: "Spellcraft sim", blurb: "Brew weather, broker peace, run a quiet cottage.", author: "Soft Lantern" },
];

export type Tier = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

export const TIERS: Tier[] = [
  {
    name: "Hobbyist",
    price: "$0",
    cadence: "forever",
    blurb: "Make something for the joy of it.",
    features: [
      "1 active project",
      "Up to 6 agents in the studio",
      "Public showcase",
      "Community support",
    ],
    cta: "Start free",
  },
  {
    name: "Studio",
    price: "$32",
    cadence: "per month",
    blurb: "For serious solo and small-team builds.",
    features: [
      "Unlimited projects",
      "All 14 agents",
      "Private projects",
      "Build exports",
      "Priority compute",
    ],
    cta: "Start a studio",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual",
    blurb: "For publishers and large studios.",
    features: [
      "SSO and audit logs",
      "Shared team workspaces",
      "Custom agent personas",
      "Dedicated capacity",
      "SLA and support engineer",
    ],
    cta: "Talk to us",
  },
];

export type RoadmapItem = { quarter: string; title: string; status: "Shipping" | "In progress" | "Planned" };

export const ROADMAP: RoadmapItem[] = [
  { quarter: "Q2 2026", title: "Conversational studio + multi-agent orchestration", status: "Shipping" },
  { quarter: "Q3 2026", title: "Live playable WebGL builds in browser", status: "In progress" },
  { quarter: "Q3 2026", title: "Voice input and persistent project memory", status: "In progress" },
  { quarter: "Q4 2026", title: "Team workspaces and reviewer comments", status: "Planned" },
  { quarter: "Q4 2026", title: "Marketplace for agent personas and packs", status: "Planned" },
  { quarter: "Q1 2027", title: "Self-host export with engine adapters", status: "Planned" },
];
