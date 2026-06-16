import { useEffect, useRef, useState } from "react";
import type { GameManifest } from "./manifest";
import { TILE_SIZE } from "./manifest";

// Lightweight 2D top-down runtime. Canvas-based. No external deps.

type RuntimeState = {
  px: number; py: number; // tile-space float
  hp: number;
  score: number;
  collected: Set<string>;
  enemies: { id: string; x: number; y: number; hp: number; damage: number; cooldown: number }[];
  status: "playing" | "won" | "lost" | "paused";
  startedAt: number;
  invuln: number;
};

type Props = { manifest: GameManifest; onEnd?: (r: { win: boolean; durationMs: number }) => void };

export function GameRuntime({ manifest, onEnd }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  const stateRef = useRef<RuntimeState>(initState(manifest));
  const keysRef = useRef<Set<string>>(new Set());

  // Reset when manifest changes
  useEffect(() => { stateRef.current = initState(manifest); setTick((n) => n + 1); }, [manifest]);

  // Input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      if (e.code === "KeyP") {
        const s = stateRef.current;
        if (s.status === "playing") s.status = "paused";
        else if (s.status === "paused") s.status = "playing";
        setTick((n) => n + 1);
      }
      if (e.code === "KeyR") restart();
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  function restart() {
    stateRef.current = initState(manifest);
    setTick((n) => n + 1);
  }

  // Game loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      if (s.status === "playing") step(manifest, s, keysRef.current, dt);
      draw(canvasRef.current, manifest, s);
      if (s.status === "won" || s.status === "lost") {
        if (onEnd) onEnd({ win: s.status === "won", durationMs: now - s.startedAt });
      } else {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [manifest, tick, onEnd]);

  const cssWidth = manifest.world.width * TILE_SIZE;
  const cssHeight = manifest.world.height * TILE_SIZE;
  const s = stateRef.current;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between text-xs font-mono text-muted-foreground">
        <span>{manifest.title}</span>
        <span>HP {s.hp} · Score {s.score} · {manifest.world.width}×{manifest.world.height}</span>
      </div>
      <div className="relative overflow-hidden rounded-lg border hairline bg-black" style={{ width: cssWidth, height: cssHeight, maxWidth: "100%" }}>
        <canvas
          ref={canvasRef}
          width={cssWidth}
          height={cssHeight}
          style={{ display: "block", imageRendering: "pixelated", width: "100%", height: "100%" }}
        />
        {(s.status === "paused" || s.status === "won" || s.status === "lost") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-white">
            <div className="font-display text-3xl">
              {s.status === "won" ? "You won" : s.status === "lost" ? "You died" : "Paused"}
            </div>
            <button onClick={restart} className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black">
              {s.status === "paused" ? "Resume / Restart" : "Play again"}
            </button>
          </div>
        )}
      </div>
      <div className="max-w-xl text-center text-xs text-muted-foreground">
        {manifest.ui.objective} · Move: WASD / Arrows · Pause: P · Restart: R
      </div>
    </div>
  );
}

function initState(m: GameManifest): RuntimeState {
  return {
    px: m.world.spawn.x + 0.5,
    py: m.world.spawn.y + 0.5,
    hp: m.entities.find((e) => e.kind === "player")?.hp ?? 3,
    score: 0,
    collected: new Set(),
    enemies: m.entities
      .filter((e) => e.kind === "enemy")
      .map((e) => ({ id: e.id, x: e.x + 0.5, y: e.y + 0.5, hp: e.hp ?? 2, damage: e.damage ?? 1, cooldown: 0 })),
    status: "playing",
    startedAt: performance.now(),
    invuln: 0,
  };
}

function step(m: GameManifest, s: RuntimeState, keys: Set<string>, dt: number) {
  const player = m.entities.find((e) => e.kind === "player")!;
  const speed = player.speed ?? 4;
  let dx = 0, dy = 0;
  if (keys.has("KeyW") || keys.has("ArrowUp")) dy -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) dy += 1;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) dx -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) dx += 1;
  if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
  tryMove(m, s, dx * speed * dt, dy * speed * dt);

  // Tile hazards
  const tile = m.world.tiles[Math.floor(s.py)]?.[Math.floor(s.px)];
  s.invuln = Math.max(0, s.invuln - dt);
  if (tile === 2 && s.invuln === 0) { s.hp -= 1; s.invuln = 0.8; }

  // Pickups
  for (const e of m.entities) {
    if (e.collectible && !s.collected.has(e.id)) {
      if (Math.abs(s.px - (e.x + 0.5)) < 0.6 && Math.abs(s.py - (e.y + 0.5)) < 0.6) {
        s.collected.add(e.id);
        s.score += 10;
      }
    }
  }

  // Enemies wander; damage on touch
  for (const en of s.enemies) {
    en.cooldown = Math.max(0, en.cooldown - dt);
    if (Math.random() < 0.02) {
      const dxs = (Math.random() - 0.5) * 0.6;
      const dys = (Math.random() - 0.5) * 0.6;
      const nx = en.x + dxs, ny = en.y + dys;
      if (m.world.tiles[Math.floor(ny)]?.[Math.floor(nx)] !== 1) { en.x = nx; en.y = ny; }
    }
    if (Math.abs(en.x - s.px) < 0.7 && Math.abs(en.y - s.py) < 0.7 && s.invuln === 0) {
      s.hp -= en.damage;
      s.invuln = 0.8;
    }
  }

  // Win/Lose
  let won = true;
  for (const w of m.rules.win) {
    if (w.type === "reach_goal") {
      const g = m.entities.find((e) => e.kind === "goal");
      if (!g || Math.abs(s.px - (g.x + 0.5)) > 0.6 || Math.abs(s.py - (g.y + 0.5)) > 0.6) won = false;
    }
    if (w.type === "collect_all") {
      const total = m.entities.filter((e) => e.collectible).length;
      if (s.collected.size < total) won = false;
    }
    if (w.type === "defeat_all" && s.enemies.length > 0) won = false;
    if (w.type === "score" && s.score < w.threshold) won = false;
  }
  if (won) s.status = "won";
  if (s.hp <= 0) s.status = "lost";
}

function tryMove(m: GameManifest, s: RuntimeState, dx: number, dy: number) {
  const nxX = s.px + dx;
  if (m.world.tiles[Math.floor(s.py)]?.[Math.floor(nxX)] !== 1) s.px = clamp(nxX, 0.3, m.world.width - 0.3);
  const nyY = s.py + dy;
  if (m.world.tiles[Math.floor(nyY)]?.[Math.floor(s.px)] !== 1) s.py = clamp(nyY, 0.3, m.world.height - 0.3);
}

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

function draw(canvas: HTMLCanvasElement | null, m: GameManifest, s: RuntimeState) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const T = TILE_SIZE;
  ctx.fillStyle = m.world.palette.floor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < m.world.height; y++) {
    for (let x = 0; x < m.world.width; x++) {
      const t = m.world.tiles[y][x];
      if (t === 1) { ctx.fillStyle = m.world.palette.wall; ctx.fillRect(x * T, y * T, T, T); }
      else if (t === 2) { ctx.fillStyle = m.world.palette.hazard; ctx.fillRect(x * T, y * T, T, T); }
      ctx.strokeStyle = m.world.palette.grid;
      ctx.strokeRect(x * T + 0.5, y * T + 0.5, T - 1, T - 1);
    }
  }
  // Static entities
  for (const e of m.entities) {
    if (e.kind === "player" || e.kind === "enemy") continue;
    if (e.collectible && s.collected.has(e.id)) continue;
    drawSprite(ctx, e.sprite, e.color, e.x * T + T / 2, e.y * T + T / 2, T * 0.7);
  }
  // Enemies
  for (const en of s.enemies) drawSprite(ctx, "circle", "#a3e635", en.x * T, en.y * T, T * 0.7);
  // Player
  const pe = m.entities.find((e) => e.kind === "player")!;
  const flash = s.invuln > 0 && Math.floor(performance.now() / 80) % 2 === 0;
  drawSprite(ctx, pe.sprite, flash ? "#ffffff" : pe.color, s.px * T, s.py * T, T * 0.8);
}

function drawSprite(ctx: CanvasRenderingContext2D, kind: string, color: string, cx: number, cy: number, size: number) {
  ctx.fillStyle = color;
  if (kind === "square") {
    ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
  } else if (kind === "diamond") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size / 2);
    ctx.lineTo(cx + size / 2, cy);
    ctx.lineTo(cx, cy + size / 2);
    ctx.lineTo(cx - size / 2, cy);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
