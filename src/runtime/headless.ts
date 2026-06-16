// Headless validator + simulator used for playability checks and AI playtests.
// Pure logic, no DOM. Runs on the Worker.

import type { GameManifest, Entity } from "./manifest";

export type ValidationIssue = {
  severity: "error" | "warn";
  code: string;
  message: string;
};

export function validateManifest(m: GameManifest): { ok: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  // 1. tile grid matches declared dims
  if (m.world.tiles.length !== m.world.height)
    issues.push({ severity: "error", code: "world_height_mismatch", message: "world.tiles rows do not match world.height" });
  for (const row of m.world.tiles)
    if (row.length !== m.world.width) {
      issues.push({ severity: "error", code: "world_width_mismatch", message: "world.tiles row width mismatch" });
      break;
    }

  // 2. spawn inside bounds and on a floor tile
  const { x: sx, y: sy } = m.world.spawn;
  if (sx < 0 || sy < 0 || sx >= m.world.width || sy >= m.world.height)
    issues.push({ severity: "error", code: "spawn_out_of_bounds", message: "spawn outside world bounds" });
  else if (m.world.tiles[sy]?.[sx] === 1)
    issues.push({ severity: "error", code: "spawn_in_wall", message: "spawn lands on a wall tile" });

  // 3. exactly one player
  const players = m.entities.filter((e) => e.kind === "player");
  if (players.length !== 1)
    issues.push({ severity: "error", code: "player_count", message: `expected 1 player, got ${players.length}` });

  // 4. all entities in bounds, not in walls
  for (const e of m.entities) {
    if (e.x < 0 || e.y < 0 || e.x >= m.world.width || e.y >= m.world.height)
      issues.push({ severity: "error", code: "entity_oob", message: `entity ${e.id} out of bounds` });
    else if (m.world.tiles[e.y]?.[e.x] === 1)
      issues.push({ severity: "warn", code: "entity_in_wall", message: `entity ${e.id} inside a wall` });
  }

  // 5. win conditions satisfiable
  for (const w of m.rules.win) {
    if (w.type === "reach_goal" && !m.entities.some((e) => e.kind === "goal"))
      issues.push({ severity: "error", code: "no_goal", message: "win=reach_goal but no goal entity" });
    if (w.type === "collect_all" && !m.entities.some((e) => e.collectible))
      issues.push({ severity: "error", code: "no_collectibles", message: "win=collect_all but no collectible items" });
    if (w.type === "defeat_all" && !m.entities.some((e) => e.kind === "enemy"))
      issues.push({ severity: "error", code: "no_enemies", message: "win=defeat_all but no enemies" });
  }

  // 6. flood-fill reachability from spawn — make sure win-entities are reachable
  const reach = floodReach(m, sx, sy);
  const winEntities = m.entities.filter(
    (e) => e.kind === "goal" || e.collectible || e.kind === "enemy",
  );
  for (const e of winEntities) {
    if (!reach[e.y]?.[e.x])
      issues.push({ severity: "error", code: "unreachable", message: `entity ${e.id} unreachable from spawn` });
  }

  return { ok: !issues.some((i) => i.severity === "error"), issues };
}

function floodReach(m: GameManifest, sx: number, sy: number): boolean[][] {
  const W = m.world.width, H = m.world.height;
  const r: boolean[][] = Array.from({ length: H }, () => Array(W).fill(false));
  const stack: [number, number][] = [[sx, sy]];
  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    if (r[y][x]) continue;
    if (m.world.tiles[y][x] === 1) continue;
    r[y][x] = true;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return r;
}

// ---------------- Headless simulator (greedy player) ----------------

export type SimResult = {
  win: boolean;
  softlock: boolean;
  ticks: number;
  deaths: number;
};

export function simulate(m: GameManifest, opts?: { maxTicks?: number; seed?: number }): SimResult {
  const maxTicks = opts?.maxTicks ?? 600;
  const rng = mulberry32(opts?.seed ?? 1);
  const player = m.entities.find((e) => e.kind === "player")!;
  const state = {
    px: player.x,
    py: player.y,
    hp: player.hp ?? 3,
    collected: new Set<string>(),
    enemies: m.entities.filter((e) => e.kind === "enemy").map((e) => ({ ...e })),
    score: 0,
  };
  const goal = m.entities.find((e) => e.kind === "goal");
  const collectibles = m.entities.filter((e) => e.collectible);

  let lastChange = 0;
  let prevSig = "";
  let deaths = 0;

  for (let t = 0; t < maxTicks; t++) {
    // Greedy target: nearest uncollected, else goal, else random
    const target = greedyTarget(state, collectibles, goal, rng);
    const [dx, dy] = stepTowards(state.px, state.py, target.x, target.y, rng);
    const nx = state.px + dx, ny = state.py + dy;
    if (m.world.tiles[ny]?.[nx] === 0 || m.world.tiles[ny]?.[nx] === 2) {
      state.px = nx; state.py = ny;
      if (m.world.tiles[ny][nx] === 2) { state.hp -= 1; }
    }

    // Collect
    for (const c of collectibles)
      if (!state.collected.has(c.id) && c.x === state.px && c.y === state.py) {
        state.collected.add(c.id);
        state.score += 10;
      }

    // Enemies wander, deal damage on touch
    for (const en of state.enemies) {
      const choices: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const [edx, edy] = choices[Math.floor(rng() * 4)];
      const enx = en.x + edx, eny = en.y + edy;
      if (m.world.tiles[eny]?.[enx] === 0) { en.x = enx; en.y = eny; }
      if (en.x === state.px && en.y === state.py) { state.hp -= en.damage ?? 1; deaths += 1; }
    }

    // Win checks
    let won = true;
    for (const w of m.rules.win) {
      if (w.type === "reach_goal" && goal && (state.px !== goal.x || state.py !== goal.y)) won = false;
      if (w.type === "collect_all" && state.collected.size < collectibles.length) won = false;
      if (w.type === "defeat_all" && state.enemies.length > 0) won = false;
      if (w.type === "score" && state.score < w.threshold) won = false;
    }
    if (won) return { win: true, softlock: false, ticks: t + 1, deaths };

    // Lose
    if (state.hp <= 0) return { win: false, softlock: false, ticks: t + 1, deaths };

    // Softlock detection: state signature unchanged for 200 ticks
    const sig = `${state.px},${state.py},${state.collected.size},${state.hp}`;
    if (sig === prevSig) {
      if (t - lastChange > 200) return { win: false, softlock: true, ticks: t + 1, deaths };
    } else {
      lastChange = t;
      prevSig = sig;
    }
  }
  return { win: false, softlock: false, ticks: maxTicks, deaths };
}

function greedyTarget(
  state: { px: number; py: number; collected: Set<string> },
  collectibles: Entity[],
  goal: Entity | undefined,
  rng: () => number,
): { x: number; y: number } {
  const remaining = collectibles.filter((c) => !state.collected.has(c.id));
  const pool = remaining.length ? remaining : goal ? [goal] : [];
  if (!pool.length) return { x: state.px + (rng() < 0.5 ? 1 : -1), y: state.py };
  let best = pool[0];
  let bestD = Infinity;
  for (const p of pool) {
    const d = Math.abs(p.x - state.px) + Math.abs(p.y - state.py);
    if (d < bestD) { bestD = d; best = p; }
  }
  return { x: best.x, y: best.y };
}

function stepTowards(px: number, py: number, tx: number, ty: number, rng: () => number): [number, number] {
  const dx = Math.sign(tx - px);
  const dy = Math.sign(ty - py);
  if (dx !== 0 && dy !== 0) return rng() < 0.5 ? [dx, 0] : [0, dy];
  if (dx !== 0) return [dx, 0];
  if (dy !== 0) return [0, dy];
  return [0, 0];
}

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function aggregateSims(results: SimResult[]) {
  const n = results.length || 1;
  const wins = results.filter((r) => r.win).length;
  const softlocks = results.filter((r) => r.softlock).length;
  const avgTicks = Math.round(results.reduce((s, r) => s + r.ticks, 0) / n);
  return {
    sessions: n,
    win_rate: Number(((wins / n) * 100).toFixed(2)),
    softlock_rate: Number(((softlocks / n) * 100).toFixed(2)),
    avg_len_ticks: avgTicks,
  };
}
