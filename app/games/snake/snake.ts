// ---------------------------------------------------------------------------
// Snake game engine — pure logic, no DOM/React dependencies
// ---------------------------------------------------------------------------

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface Point {
  x: number;
  y: number;
}

export interface SnakeState {
  snake: Point[];
  food: Point;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  highScore: number;
  gameOver: boolean;
  started: boolean;
}

// Grid is measured in cells, not pixels
export const GRID_SIZE = 20;
export const CELL_SIZE = 20; // px per cell
export const CANVAS_SIZE = GRID_SIZE * CELL_SIZE; // 400px

// Colors
const COLOR_BG = "#06060a";
const COLOR_GRID = "rgba(34,197,94,0.04)";
const COLOR_SNAKE_HEAD = "#4ade80";
const COLOR_SNAKE_BODY = "#22c55e";
const COLOR_FOOD = "#ef4444";
const COLOR_FOOD_GLOW = "rgba(239,68,68,0.25)";
const COLOR_TEXT = "#e4e4e7";
const COLOR_MUTED = "#71717a";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

const OPPOSITE: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export function createInitialState(): SnakeState {
  const center = Math.floor(GRID_SIZE / 2);
  const snake: Point[] = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
  return {
    snake,
    food: randomFood(snake),
    direction: "RIGHT",
    nextDirection: "RIGHT",
    score: 0,
    highScore: 0,
    gameOver: false,
    started: false,
  };
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
  w: "UP",
  s: "DOWN",
  a: "LEFT",
  d: "RIGHT",
};

export function handleKey(state: SnakeState, key: string): SnakeState {
  const dir = KEY_MAP[key];
  if (!dir) return state;
  // Prevent 180° reversal
  if (dir === OPPOSITE[state.direction]) return state;
  return { ...state, nextDirection: dir, started: true };
}

// ---------------------------------------------------------------------------
// Tick — advance the game by one step
// ---------------------------------------------------------------------------

export function tick(state: SnakeState): SnakeState {
  if (state.gameOver || !state.started) return state;

  const { snake, food, nextDirection, score, highScore } = state;
  const head = snake[snake.length - 1];
  const dir = nextDirection;

  // Compute new head
  const newHead: Point = { ...head };
  switch (dir) {
    case "UP":
      newHead.y -= 1;
      break;
    case "DOWN":
      newHead.y += 1;
      break;
    case "LEFT":
      newHead.x -= 1;
      break;
    case "RIGHT":
      newHead.x += 1;
      break;
  }

  // Wall collision
  if (
    newHead.x < 0 ||
    newHead.x >= GRID_SIZE ||
    newHead.y < 0 ||
    newHead.y >= GRID_SIZE
  ) {
    return { ...state, direction: dir, gameOver: true };
  }

  // Self collision (skip tail — it will move away unless eating)
  const ate = newHead.x === food.x && newHead.y === food.y;
  const bodyToCheck = ate ? snake : snake.slice(1);
  if (bodyToCheck.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    return { ...state, direction: dir, gameOver: true };
  }

  const newSnake = [...snake, newHead];
  if (!ate) newSnake.shift();

  const newScore = ate ? score + 1 : score;
  const newHigh = Math.max(newScore, highScore);
  const newFood = ate ? randomFood(newSnake) : food;

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction: dir,
    nextDirection: dir,
    score: newScore,
    highScore: newHigh,
    gameOver: false,
    started: true,
  };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

export function render(ctx: CanvasRenderingContext2D, state: SnakeState) {
  const { snake, food, score, gameOver, started } = state;

  // Background
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Grid lines
  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(CANVAS_SIZE, pos);
    ctx.stroke();
  }

  // Food glow
  ctx.fillStyle = COLOR_FOOD_GLOW;
  const glowSize = CELL_SIZE * 2;
  ctx.beginPath();
  ctx.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    glowSize / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Food
  ctx.fillStyle = COLOR_FOOD;
  roundRect(ctx, food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, 4);

  // Snake
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i];
    const isHead = i === snake.length - 1;
    const alpha = 0.4 + (i / snake.length) * 0.6;
    ctx.fillStyle = isHead ? COLOR_SNAKE_HEAD : COLOR_SNAKE_BODY;
    ctx.globalAlpha = isHead ? 1 : alpha;
    roundRect(ctx, seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 4);
    ctx.globalAlpha = 1;
  }

  // Head eyes
  if (snake.length > 0) {
    const head = snake[snake.length - 1];
    ctx.fillStyle = COLOR_BG;
    const cx = head.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = head.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.beginPath();
    ctx.arc(cx + 3, cy - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3, cy + 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Overlays
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";

  if (!started) {
    drawOverlay(ctx, "SNAKE", "Press arrow keys to start");
  } else if (gameOver) {
    drawOverlay(ctx, "GAME OVER", `Score: ${score}`);
  }
}

function drawOverlay(ctx: CanvasRenderingContext2D, title: string, subtitle: string) {
  // Dim background
  ctx.fillStyle = "rgba(6,6,10,0.75)";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.textAlign = "center";

  ctx.fillStyle = COLOR_TEXT;
  ctx.font = "bold 24px monospace";
  ctx.fillText(title, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 10);

  ctx.fillStyle = COLOR_MUTED;
  ctx.font = "14px monospace";
  ctx.fillText(subtitle, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 16);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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
