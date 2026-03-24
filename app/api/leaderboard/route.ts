export const dynamic = "force-dynamic";

export interface LeaderboardEntry {
  username: string;
  game: string;
  score: number;
  date: string;
}

const scores: LeaderboardEntry[] = [];

const VALID_GAMES = new Set(["snake", "pong", "breakout"]);
const MAX_ENTRIES_PER_GAME = 50;
const USERNAME_MAX_LEN = 16;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get("game");

  let filtered = scores;
  if (game && VALID_GAMES.has(game)) {
    filtered = scores.filter((s) => s.game === game);
  }

  // Return sorted descending by score
  const sorted = [...filtered].sort((a, b) => b.score - a.score);

  return Response.json(sorted);
}

export async function POST(request: Request) {
  let body: { username?: string; game?: string; score?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { username, game, score } = body;

  if (
    typeof username !== "string" ||
    username.trim().length === 0 ||
    username.trim().length > USERNAME_MAX_LEN
  ) {
    return Response.json(
      { error: `Username must be 1-${USERNAME_MAX_LEN} characters` },
      { status: 400 },
    );
  }

  if (typeof game !== "string" || !VALID_GAMES.has(game)) {
    return Response.json(
      { error: `Game must be one of: ${[...VALID_GAMES].join(", ")}` },
      { status: 400 },
    );
  }

  if (typeof score !== "number" || !Number.isFinite(score) || score < 0) {
    return Response.json(
      { error: "Score must be a non-negative number" },
      { status: 400 },
    );
  }

  const entry: LeaderboardEntry = {
    username: username.trim(),
    game,
    score,
    date: new Date().toISOString(),
  };

  scores.push(entry);

  // Cap per-game entries — keep only the top N
  const gameEntries = scores
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.game === game)
    .sort((a, b) => b.s.score - a.s.score);

  if (gameEntries.length > MAX_ENTRIES_PER_GAME) {
    const toRemove = new Set(
      gameEntries.slice(MAX_ENTRIES_PER_GAME).map(({ i }) => i),
    );
    // Remove from end to preserve indices
    for (let i = scores.length - 1; i >= 0; i--) {
      if (toRemove.has(i)) scores.splice(i, 1);
    }
  }

  return Response.json(entry, { status: 201 });
}
