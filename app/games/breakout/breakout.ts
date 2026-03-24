// ---------------------------------------------------------------------------
// Breakout game engine — pure logic, no DOM/React dependencies
// ---------------------------------------------------------------------------

export const CANVAS_W = 480;
export const CANVAS_H = 600;

// Paddle
const PADDLE_W = 80;
const PADDLE_H = 12;
const PADDLE_Y = CANVAS_H - 40;
const PADDLE_SPEED = 7;
const PADDLE_RADIUS = 6;

// Ball
const BALL_R = 6;
const BALL_SPEED_INITIAL = 5;
const BALL_SPEED_MAX = 8;
const BALL_SPEED_INCREMENT = 0.15;

// Bricks
const BRICK_ROWS = 7;
const BRICK_COLS = 10;
const BRICK_W = 42;
const BRICK_H = 16;
const BRICK_PAD = 4;
const BRICK_OFFSET_X = (CANVAS_W - BRICK_COLS * (BRICK_W + BRICK_PAD) + BRICK_PAD) / 2;
const BRICK_OFFSET_Y = 60;

const ROW_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#a855f7", "#ec4899"];
const ROW_POINTS = [7, 6, 5, 4, 3, 2, 1]; // top rows worth more

// Colors
const COLOR_BG = "#06060a";
const COLOR_PADDLE = "#a855f7";
const COLOR_BALL = "#ffffff";
const COLOR_TEXT = "#e4e4e7";
const COLOR_MUTED = "#71717a";

// Particle
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Brick {
  row: number;
  col: number;
  alive: boolean;
}

export interface BreakoutState {
  paddleX: number;
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  ballSpeed: number;
  ballOnPaddle: boolean;
  bricks: Brick[];
  score: number;
  lives: number;
  gameOver: boolean;
  won: boolean;
  started: boolean;
  keysDown: Set<string>;
  mouseX: number | null;
  particles: Particle[];
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

function buildBricks(): Brick[] {
  const bricks: Brick[] = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({ row, col, alive: true });
    }
  }
  return bricks;
}

export function createInitialState(): BreakoutState {
  return {
    paddleX: CANVAS_W / 2 - PADDLE_W / 2,
    ballX: CANVAS_W / 2,
    ballY: PADDLE_Y - BALL_R,
    ballVX: 0,
    ballVY: 0,
    ballSpeed: BALL_SPEED_INITIAL,
    ballOnPaddle: true,
    bricks: buildBricks(),
    score: 0,
    lives: 3,
    gameOver: false,
    won: false,
    started: false,
    keysDown: new Set(),
    mouseX: null,
    particles: [],
  };
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

const LEFT_KEYS = new Set(["ArrowLeft", "a", "A"]);
const RIGHT_KEYS = new Set(["ArrowRight", "d", "D"]);
const LAUNCH_KEYS = new Set([" ", "ArrowUp", "w", "W"]);

export function keyDown(state: BreakoutState, key: string): BreakoutState {
  const next = new Set(state.keysDown);
  next.add(key);

  // Launch ball
  if (LAUNCH_KEYS.has(key) && state.ballOnPaddle && !state.gameOver && !state.won) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 6); // slight random
    return {
      ...state,
      keysDown: next,
      ballOnPaddle: false,
      ballVX: Math.cos(angle) * state.ballSpeed,
      ballVY: Math.sin(angle) * state.ballSpeed,
      started: true,
    };
  }

  return { ...state, keysDown: next };
}

export function keyUp(state: BreakoutState, key: string): BreakoutState {
  if (state.keysDown.has(key)) {
    const next = new Set(state.keysDown);
    next.delete(key);
    return { ...state, keysDown: next };
  }
  return state;
}

export function mouseMove(state: BreakoutState, x: number): BreakoutState {
  return { ...state, mouseX: x };
}

export function mouseClick(state: BreakoutState): BreakoutState {
  if (state.ballOnPaddle && !state.gameOver && !state.won) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 6);
    return {
      ...state,
      ballOnPaddle: false,
      ballVX: Math.cos(angle) * state.ballSpeed,
      ballVY: Math.sin(angle) * state.ballSpeed,
      started: true,
    };
  }
  return state;
}

// ---------------------------------------------------------------------------
// Tick
// ---------------------------------------------------------------------------

export function tick(state: BreakoutState): BreakoutState {
  if (state.gameOver || state.won) return state;

  let {
    paddleX, ballX, ballY, ballVX, ballVY, ballSpeed,
    ballOnPaddle, bricks, score, lives, particles, mouseX,
  } = state;

  // --- Paddle movement ---
  if (mouseX !== null) {
    paddleX = mouseX - PADDLE_W / 2;
  } else {
    let dir = 0;
    for (const k of state.keysDown) {
      if (LEFT_KEYS.has(k)) dir -= 1;
      if (RIGHT_KEYS.has(k)) dir += 1;
    }
    paddleX += dir * PADDLE_SPEED;
  }
  paddleX = clamp(paddleX, 0, CANVAS_W - PADDLE_W);

  // --- Ball stuck on paddle ---
  if (ballOnPaddle) {
    ballX = paddleX + PADDLE_W / 2;
    ballY = PADDLE_Y - BALL_R;
    return {
      ...state,
      paddleX,
      ballX,
      ballY,
      particles: tickParticles(particles),
    };
  }

  // --- Ball movement ---
  ballX += ballVX;
  ballY += ballVY;

  // Side walls
  if (ballX - BALL_R <= 0) {
    ballX = BALL_R;
    ballVX = Math.abs(ballVX);
  } else if (ballX + BALL_R >= CANVAS_W) {
    ballX = CANVAS_W - BALL_R;
    ballVX = -Math.abs(ballVX);
  }

  // Top wall
  if (ballY - BALL_R <= 0) {
    ballY = BALL_R;
    ballVY = Math.abs(ballVY);
  }

  // --- Paddle collision ---
  if (
    ballVY > 0 &&
    ballY + BALL_R >= PADDLE_Y &&
    ballY + BALL_R <= PADDLE_Y + PADDLE_H + 4 &&
    ballX >= paddleX - BALL_R &&
    ballX <= paddleX + PADDLE_W + BALL_R
  ) {
    ballY = PADDLE_Y - BALL_R;
    const hit = (ballX - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2); // -1 to 1
    const angle = hit * (Math.PI / 3); // max ±60°
    ballSpeed = Math.min(ballSpeed + BALL_SPEED_INCREMENT, BALL_SPEED_MAX);
    ballVX = Math.sin(angle) * ballSpeed;
    ballVY = -Math.cos(angle) * ballSpeed;
  }

  // --- Bottom — lose life ---
  let gameOver = false;
  if (ballY - BALL_R > CANVAS_H) {
    lives -= 1;
    if (lives <= 0) {
      gameOver = true;
    } else {
      ballOnPaddle = true;
      ballX = paddleX + PADDLE_W / 2;
      ballY = PADDLE_Y - BALL_R;
      ballVX = 0;
      ballVY = 0;
      ballSpeed = BALL_SPEED_INITIAL;
    }
  }

  // --- Brick collisions ---
  let newBricks = bricks;
  let bricksChanged = false;

  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i];
    if (!b.alive) continue;

    const bx = BRICK_OFFSET_X + b.col * (BRICK_W + BRICK_PAD);
    const by = BRICK_OFFSET_Y + b.row * (BRICK_H + BRICK_PAD);

    if (
      ballX + BALL_R > bx &&
      ballX - BALL_R < bx + BRICK_W &&
      ballY + BALL_R > by &&
      ballY - BALL_R < by + BRICK_H
    ) {
      // First hit only
      if (!bricksChanged) {
        newBricks = bricks.map((br) => ({ ...br }));
        bricksChanged = true;
      }
      newBricks[i].alive = false;
      score += ROW_POINTS[b.row];

      // Determine bounce direction
      const overlapLeft = (ballX + BALL_R) - bx;
      const overlapRight = (bx + BRICK_W) - (ballX - BALL_R);
      const overlapTop = (ballY + BALL_R) - by;
      const overlapBottom = (by + BRICK_H) - (ballY - BALL_R);
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapLeft || minOverlap === overlapRight) {
        ballVX = -ballVX;
      } else {
        ballVY = -ballVY;
      }

      // Spawn particles
      const color = ROW_COLORS[b.row];
      for (let p = 0; p < 6; p++) {
        particles.push({
          x: bx + BRICK_W / 2,
          y: by + BRICK_H / 2,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 20 + Math.random() * 10,
          color,
        });
      }

      break; // one brick per frame
    }
  }

  // Check win
  const won = newBricks.every((b) => !b.alive);

  return {
    ...state,
    paddleX,
    ballX,
    ballY,
    ballVX,
    ballVY,
    ballSpeed,
    ballOnPaddle,
    bricks: newBricks,
    score,
    lives,
    gameOver,
    won,
    particles: tickParticles(particles),
  };
}

function tickParticles(particles: Particle[]): Particle[] {
  const next: Particle[] = [];
  for (const p of particles) {
    if (p.life <= 0) continue;
    next.push({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.15, // gravity
      life: p.life - 1,
    });
  }
  return next;
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

export function render(ctx: CanvasRenderingContext2D, state: BreakoutState) {
  const {
    paddleX, ballX, ballY, bricks, score, lives,
    gameOver, won, started, ballOnPaddle, particles,
  } = state;

  // Background
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // --- Bricks ---
  for (const b of bricks) {
    if (!b.alive) continue;
    const bx = BRICK_OFFSET_X + b.col * (BRICK_W + BRICK_PAD);
    const by = BRICK_OFFSET_Y + b.row * (BRICK_H + BRICK_PAD);
    ctx.fillStyle = ROW_COLORS[b.row];
    roundRect(ctx, bx, by, BRICK_W, BRICK_H, 3);

    // Highlight on top edge
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(bx + 2, by + 1, BRICK_W - 4, 2);
  }

  // --- Particles ---
  for (const p of particles) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = clamp(p.life / 20, 0, 1);
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;

  // --- Paddle ---
  ctx.fillStyle = COLOR_PADDLE;
  roundRect(ctx, paddleX, PADDLE_Y, PADDLE_W, PADDLE_H, PADDLE_RADIUS);
  // Paddle highlight
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(paddleX + 4, PADDLE_Y + 2, PADDLE_W - 8, 3);

  // --- Ball ---
  ctx.fillStyle = COLOR_BALL;
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  // Ball glow
  ctx.fillStyle = "rgba(168,85,247,0.2)";
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_R * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // --- HUD inside canvas ---
  // Lives as dots
  for (let i = 0; i < lives; i++) {
    ctx.fillStyle = COLOR_PADDLE;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(20 + i * 18, CANVAS_H - 14, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Score top-right
  ctx.fillStyle = COLOR_MUTED;
  ctx.font = "12px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`SCORE: ${score}`, CANVAS_W - 12, 20);
  ctx.textAlign = "left";

  // --- Overlays ---
  if (!started) {
    drawOverlay(ctx, "BREAKOUT", ballOnPaddle ? "Press Space or Click to launch" : "");
  } else if (won) {
    drawOverlay(ctx, "YOU WIN!", `Score: ${score}`);
  } else if (gameOver) {
    drawOverlay(ctx, "GAME OVER", `Score: ${score}`);
  } else if (ballOnPaddle) {
    // Mid-game re-launch prompt
    ctx.fillStyle = COLOR_MUTED;
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Press Space or Click to launch", CANVAS_W / 2, PADDLE_Y + 40);
    ctx.textAlign = "left";
  }
}

function drawOverlay(ctx: CanvasRenderingContext2D, title: string, subtitle: string) {
  ctx.fillStyle = "rgba(6,6,10,0.75)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = "center";
  ctx.fillStyle = COLOR_TEXT;
  ctx.font = "bold 28px monospace";
  ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 12);

  if (subtitle) {
    ctx.fillStyle = COLOR_MUTED;
    ctx.font = "14px monospace";
    ctx.fillText(subtitle, CANVAS_W / 2, CANVAS_H / 2 + 16);
  }
  ctx.textAlign = "left";
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
