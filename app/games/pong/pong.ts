// ---------------------------------------------------------------------------
// Pong game engine — pure logic, no DOM/React dependencies
// ---------------------------------------------------------------------------

export const CANVAS_W = 600;
export const CANVAS_H = 400;

const PADDLE_W = 12;
const PADDLE_H = 72;
const PADDLE_OFFSET = 20; // distance from edge
const PADDLE_SPEED = 6;

const BALL_SIZE = 10;
const BALL_SPEED_INITIAL = 5;
const BALL_SPEED_INCREMENT = 0.3; // speed up after each rally
const BALL_MAX_SPEED = 9;

const WIN_SCORE = 5;

// AI settings — difficulty scales with how far the AI is behind
const AI_BASE_REACTION = 0.03; // lerp factor at easiest
const AI_MAX_REACTION = 0.09; // lerp factor at hardest
const AI_BASE_ERROR = 30; // max random offset (px) at easiest
const AI_MIN_ERROR = 6; // max random offset (px) at hardest
const AI_SPEED_CAP = 4.5; // max px/frame the paddle can move

// Colors
const COLOR_BG = "#06060a";
const COLOR_LINE = "rgba(6,182,212,0.12)";
const COLOR_PADDLE = "#06b6d4";
const COLOR_BALL = "#ffffff";
const COLOR_BALL_TRAIL = "rgba(255,255,255,0.08)";
const COLOR_TEXT = "#e4e4e7";
const COLOR_MUTED = "#71717a";
const COLOR_CYAN = "#06b6d4";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PongState {
  playerY: number;
  aiY: number;
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  ballSpeed: number;
  playerScore: number;
  aiScore: number;
  winner: "player" | "ai" | null;
  paused: boolean; // brief pause after a point
  pauseTimer: number;
  started: boolean;
  keysDown: Set<string>;
  trail: { x: number; y: number }[];
  aiError: number; // random offset applied to AI's predicted target
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

function launchBall(towardsPlayer: boolean): Pick<PongState, "ballX" | "ballY" | "ballVX" | "ballVY" | "ballSpeed"> {
  const angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // -30° to +30°
  const dir = towardsPlayer ? -1 : 1;
  return {
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H / 2,
    ballVX: Math.cos(angle) * BALL_SPEED_INITIAL * dir,
    ballVY: Math.sin(angle) * BALL_SPEED_INITIAL,
    ballSpeed: BALL_SPEED_INITIAL,
  };
}

export function createInitialState(): PongState {
  return {
    playerY: CANVAS_H / 2 - PADDLE_H / 2,
    aiY: CANVAS_H / 2 - PADDLE_H / 2,
    ...launchBall(false),
    playerScore: 0,
    aiScore: 0,
    winner: null,
    paused: false,
    pauseTimer: 0,
    started: false,
    keysDown: new Set(),
    trail: [],
    aiError: 0,
  };
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

const UP_KEYS = new Set(["ArrowUp", "w", "W"]);
const DOWN_KEYS = new Set(["ArrowDown", "s", "S"]);

export function keyDown(state: PongState, key: string): PongState {
  if (UP_KEYS.has(key) || DOWN_KEYS.has(key)) {
    const next = new Set(state.keysDown);
    next.add(key);
    return { ...state, keysDown: next, started: true };
  }
  return state;
}

export function keyUp(state: PongState, key: string): PongState {
  if (state.keysDown.has(key)) {
    const next = new Set(state.keysDown);
    next.delete(key);
    return { ...state, keysDown: next };
  }
  return state;
}

// ---------------------------------------------------------------------------
// AI — predict where the ball will arrive at the AI paddle's x position
// ---------------------------------------------------------------------------

function predictBallY(bx: number, by: number, vx: number, vy: number): number {
  // Only predict when ball is moving towards AI
  if (vx <= 0) return CANVAS_H / 2;

  const targetX = CANVAS_W - PADDLE_OFFSET - PADDLE_W - BALL_SIZE / 2;
  const dx = targetX - bx;
  if (dx <= 0) return by;

  const ticks = dx / vx;
  let futureY = by + vy * ticks;

  // Simulate wall bounces
  const min = BALL_SIZE / 2;
  const max = CANVAS_H - BALL_SIZE / 2;
  const range = max - min;

  // Normalize into the bounce cycle
  futureY -= min;
  if (range > 0) {
    const cycles = Math.floor(futureY / range);
    futureY = futureY - cycles * range;
    if (futureY < 0) futureY = -futureY;
    // If odd cycle, reflect
    if (cycles % 2 !== 0) futureY = range - futureY;
  }
  futureY += min;

  return clamp(futureY, min, max);
}

/** Returns a difficulty factor 0..1 based on how far AI is behind */
function aiDifficulty(playerScore: number, aiScore: number): number {
  const deficit = playerScore - aiScore; // positive = AI is losing
  // Scale from 0 (AI leading by 3+) to 1 (AI trailing by 3+)
  return clamp((deficit + 3) / 6, 0, 1);
}

// ---------------------------------------------------------------------------
// Tick
// ---------------------------------------------------------------------------

export function tick(state: PongState, dt: number): PongState {
  if (!state.started || state.winner) return state;

  // Handle post-score pause
  if (state.paused) {
    const remaining = state.pauseTimer - dt;
    if (remaining > 0) return { ...state, pauseTimer: remaining };
    // Resume — launch ball towards last scorer's opponent
    const towardsPlayer = state.aiScore > (state.playerScore > 0 ? state.playerScore - 1 : 0);
    return {
      ...state,
      ...launchBall(!towardsPlayer),
      paused: false,
      pauseTimer: 0,
      trail: [],
    };
  }

  let { playerY, aiY, ballX, ballY, ballVX, ballVY, ballSpeed, playerScore, aiScore, trail } = state;

  // --- Player paddle movement ---
  const keys = state.keysDown;
  let moveDir = 0;
  for (const k of keys) {
    if (UP_KEYS.has(k)) moveDir -= 1;
    if (DOWN_KEYS.has(k)) moveDir += 1;
  }
  playerY = clamp(playerY + moveDir * PADDLE_SPEED, 0, CANVAS_H - PADDLE_H);

  // --- AI paddle movement (predictive) ---
  let aiError = state.aiError;
  const diff = aiDifficulty(playerScore, aiScore);
  const reaction = AI_BASE_REACTION + (AI_MAX_REACTION - AI_BASE_REACTION) * diff;
  const errorRange = AI_BASE_ERROR - (AI_BASE_ERROR - AI_MIN_ERROR) * diff;

  let aiTarget: number;
  if (ballVX > 0) {
    // Ball heading toward AI — predict landing Y
    const predicted = predictBallY(ballX, ballY, ballVX, ballVY);
    aiTarget = predicted + aiError - PADDLE_H / 2;
  } else {
    // Ball heading away — drift toward center
    aiTarget = CANVAS_H / 2 - PADDLE_H / 2;
    // Pick a new random error for next approach
    aiError = (Math.random() - 0.5) * 2 * errorRange;
  }

  const aiDelta = clamp((aiTarget - aiY) * reaction, -AI_SPEED_CAP, AI_SPEED_CAP);
  aiY = clamp(aiY + aiDelta, 0, CANVAS_H - PADDLE_H);

  // --- Ball trail ---
  trail = [...trail, { x: ballX, y: ballY }].slice(-12);

  // --- Ball movement ---
  ballX += ballVX;
  ballY += ballVY;

  // Top/bottom wall bounce
  if (ballY - BALL_SIZE / 2 <= 0) {
    ballY = BALL_SIZE / 2;
    ballVY = Math.abs(ballVY);
  } else if (ballY + BALL_SIZE / 2 >= CANVAS_H) {
    ballY = CANVAS_H - BALL_SIZE / 2;
    ballVY = -Math.abs(ballVY);
  }

  // --- Paddle collision ---
  // Player paddle (left)
  const pLeft = PADDLE_OFFSET;
  const pRight = PADDLE_OFFSET + PADDLE_W;
  if (
    ballVX < 0 &&
    ballX - BALL_SIZE / 2 <= pRight &&
    ballX + BALL_SIZE / 2 >= pLeft &&
    ballY >= playerY &&
    ballY <= playerY + PADDLE_H
  ) {
    ballX = pRight + BALL_SIZE / 2;
    const hit = (ballY - (playerY + PADDLE_H / 2)) / (PADDLE_H / 2); // -1 to 1
    const angle = hit * (Math.PI / 3); // max 60°
    ballSpeed = Math.min(ballSpeed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
    ballVX = Math.cos(angle) * ballSpeed;
    ballVY = Math.sin(angle) * ballSpeed;
  }

  // AI paddle (right)
  const aLeft = CANVAS_W - PADDLE_OFFSET - PADDLE_W;
  const aRight = CANVAS_W - PADDLE_OFFSET;
  if (
    ballVX > 0 &&
    ballX + BALL_SIZE / 2 >= aLeft &&
    ballX - BALL_SIZE / 2 <= aRight &&
    ballY >= aiY &&
    ballY <= aiY + PADDLE_H
  ) {
    ballX = aLeft - BALL_SIZE / 2;
    const hit = (ballY - (aiY + PADDLE_H / 2)) / (PADDLE_H / 2);
    const angle = hit * (Math.PI / 3);
    ballSpeed = Math.min(ballSpeed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
    ballVX = -Math.cos(angle) * ballSpeed;
    ballVY = Math.sin(angle) * ballSpeed;
  }

  // --- Scoring ---
  let winner: "player" | "ai" | null = state.winner;
  let paused = false;
  let pauseTimer = 0;

  if (ballX < 0) {
    // AI scores
    aiScore += 1;
    winner = aiScore >= WIN_SCORE ? "ai" : null;
    paused = !winner;
    pauseTimer = 800;
    ballX = CANVAS_W / 2;
    ballY = CANVAS_H / 2;
    ballVX = 0;
    ballVY = 0;
    trail = [];
  } else if (ballX > CANVAS_W) {
    // Player scores
    playerScore += 1;
    winner = playerScore >= WIN_SCORE ? "player" : null;
    paused = !winner;
    pauseTimer = 800;
    ballX = CANVAS_W / 2;
    ballY = CANVAS_H / 2;
    ballVX = 0;
    ballVY = 0;
    trail = [];
  }

  return {
    ...state,
    playerY,
    aiY,
    ballX,
    ballY,
    ballVX,
    ballVY,
    ballSpeed,
    playerScore,
    aiScore,
    winner,
    paused,
    pauseTimer,
    trail,
    aiError,
  };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

export function render(ctx: CanvasRenderingContext2D, state: PongState) {
  const { playerY, aiY, ballX, ballY, playerScore, aiScore, winner, started, trail } = state;

  // Background
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Center dashed line
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = COLOR_LINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2, 0);
  ctx.lineTo(CANVAS_W / 2, CANVAS_H);
  ctx.stroke();
  ctx.setLineDash([]);

  // Center circle
  ctx.beginPath();
  ctx.arc(CANVAS_W / 2, CANVAS_H / 2, 40, 0, Math.PI * 2);
  ctx.strokeStyle = COLOR_LINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Scores
  ctx.fillStyle = COLOR_CYAN;
  ctx.globalAlpha = 0.25;
  ctx.font = "bold 64px monospace";
  ctx.textAlign = "center";
  ctx.fillText(String(playerScore), CANVAS_W / 2 - 60, 80);
  ctx.fillText(String(aiScore), CANVAS_W / 2 + 60, 80);
  ctx.globalAlpha = 1;

  // Paddles
  ctx.fillStyle = COLOR_PADDLE;
  roundRect(ctx, PADDLE_OFFSET, playerY, PADDLE_W, PADDLE_H, 4);
  ctx.fillStyle = COLOR_PADDLE;
  ctx.globalAlpha = 0.7;
  roundRect(ctx, CANVAS_W - PADDLE_OFFSET - PADDLE_W, aiY, PADDLE_W, PADDLE_H, 4);
  ctx.globalAlpha = 1;

  // Ball trail
  for (let i = 0; i < trail.length; i++) {
    const t = trail[i];
    const alpha = (i / trail.length) * 0.3;
    const size = BALL_SIZE * (0.3 + (i / trail.length) * 0.7);
    ctx.fillStyle = COLOR_BALL_TRAIL;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(t.x, t.y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Ball
  ctx.fillStyle = COLOR_BALL;
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  // Overlays
  if (!started) {
    drawOverlay(ctx, "PONG", "Press W/S or Arrow keys to start");
  } else if (winner) {
    const label = winner === "player" ? "YOU WIN!" : "AI WINS";
    drawOverlay(ctx, label, `${playerScore} - ${aiScore}`);
  }
}

function drawOverlay(ctx: CanvasRenderingContext2D, title: string, subtitle: string) {
  ctx.fillStyle = "rgba(6,6,10,0.75)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = "center";
  ctx.fillStyle = COLOR_TEXT;
  ctx.font = "bold 28px monospace";
  ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 12);

  ctx.fillStyle = COLOR_MUTED;
  ctx.font = "14px monospace";
  ctx.fillText(subtitle, CANVAS_W / 2, CANVAS_H / 2 + 16);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
