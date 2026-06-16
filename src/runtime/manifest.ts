import { z } from "zod";

// V23 GameManifest — minimal schema that a 2D runtime can boot.
// Coordinates are in tile units. World is a single-scene tile grid.

export const TILE_SIZE = 32;

export const EntitySchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["player", "npc", "enemy", "item", "prop", "goal"]),
  x: z.number().int(),
  y: z.number().int(),
  sprite: z.string().default("circle"), // shape name rendered by canvas
  color: z.string().default("#7dd3fc"),
  hp: z.number().int().positive().optional(),
  damage: z.number().int().nonnegative().optional(),
  speed: z.number().nonnegative().optional(),
  ai: z.enum(["idle", "patrol", "chase", "wander"]).optional(),
  dialog: z.string().max(280).optional(),
  collectible: z.boolean().optional(),
});
export type Entity = z.infer<typeof EntitySchema>;

export const ControlsSchema = z.object({
  scheme: z.enum(["wasd", "arrows", "touch"]).default("wasd"),
  actions: z
    .object({
      attack: z.string().default("Space"),
      interact: z.string().default("KeyE"),
    })
    .default({ attack: "Space", interact: "KeyE" }),
});

export const RulesSchema = z.object({
  win: z
    .array(
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("reach_goal") }),
        z.object({ type: z.literal("collect_all") }),
        z.object({ type: z.literal("defeat_all") }),
        z.object({ type: z.literal("score"), threshold: z.number().int().positive() }),
      ]),
    )
    .min(1),
  lose: z
    .array(
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("player_dies") }),
        z.object({ type: z.literal("time_out"), seconds: z.number().int().positive() }),
      ]),
    )
    .default([{ type: "player_dies" }]),
});

export const WorldSchema = z.object({
  width: z.number().int().min(8).max(64),
  height: z.number().int().min(8).max(64),
  // tile codes: 0 floor, 1 wall, 2 hazard
  tiles: z.array(z.array(z.number().int().min(0).max(2))),
  spawn: z.object({ x: z.number().int(), y: z.number().int() }),
  palette: z
    .object({
      floor: z.string().default("#0f172a"),
      wall: z.string().default("#334155"),
      hazard: z.string().default("#7f1d1d"),
      grid: z.string().default("#1e293b"),
    })
    .default({ floor: "#0f172a", wall: "#334155", hazard: "#7f1d1d", grid: "#1e293b" }),
});

export const UISchema = z
  .object({
    hud: z.array(z.enum(["hp", "score", "time", "objective"])).default(["hp", "score", "objective"]),
    objective: z.string().max(140).default("Survive and reach the goal."),
  })
  .default({ hud: ["hp", "score", "objective"], objective: "Survive and reach the goal." });

export const GameManifestSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  id: z.string(),
  title: z.string().min(1).max(120),
  kind: z.enum(["2d"]).default("2d"), // 3d reserved for a later phase
  template: z
    .enum(["topdown", "platformer", "puzzle", "td", "roguelike"])
    .default("topdown"),
  description: z.string().max(500).default(""),
  world: WorldSchema,
  entities: z.array(EntitySchema).min(1),
  controls: ControlsSchema.default({ scheme: "wasd", actions: { attack: "Space", interact: "KeyE" } }),
  rules: RulesSchema,
  ui: UISchema,
});
export type GameManifest = z.infer<typeof GameManifestSchema>;

// A built-in sample manifest used as a fallback so /play always boots.
export function sampleManifest(opts: { id: string; title?: string }): GameManifest {
  const W = 16, H = 12;
  const tiles: number[][] = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x) => {
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) return 1;
      if ((x === 6 && y === 5) || (x === 6 && y === 6)) return 1;
      if (x === 9 && y === 8) return 2;
      return 0;
    }),
  );
  return GameManifestSchema.parse({
    id: opts.id,
    title: opts.title ?? "Untitled Game",
    template: "topdown",
    description: "A small demo: reach the goal, dodge the hazard, collect the gem.",
    world: { width: W, height: H, tiles, spawn: { x: 2, y: 2 } },
    entities: [
      { id: "player", kind: "player", x: 2, y: 2, sprite: "circle", color: "#fbbf24", hp: 3, speed: 4 },
      { id: "gem", kind: "item", x: 12, y: 3, sprite: "diamond", color: "#22d3ee", collectible: true },
      { id: "slime", kind: "enemy", x: 11, y: 9, sprite: "circle", color: "#a3e635", hp: 2, damage: 1, ai: "wander", speed: 1.5 },
      { id: "goal", kind: "goal", x: 13, y: 10, sprite: "square", color: "#34d399" },
    ],
    rules: { win: [{ type: "reach_goal" }, { type: "collect_all" }], lose: [{ type: "player_dies" }] },
    ui: { hud: ["hp", "score", "objective"], objective: "Grab the gem, then reach the green goal." },
  });
}
