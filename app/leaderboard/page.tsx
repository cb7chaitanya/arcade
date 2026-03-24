"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface Entry {
  username: string;
  game: string;
  score: number;
  date: string;
}

const GAMES = [
  { id: "snake", label: "Snake", emoji: "🐍", color: "green" },
  { id: "pong", label: "Pong", emoji: "🏓", color: "cyan" },
  { id: "breakout", label: "Breakout", emoji: "🧱", color: "purple" },
] as const;

type GameId = (typeof GAMES)[number]["id"];

const colorMap: Record<string, { tab: string; activeTab: string; rank: string; border: string }> = {
  green: {
    tab: "text-arcade-muted hover:text-arcade-green",
    activeTab: "text-arcade-green border-arcade-green",
    rank: "text-arcade-green",
    border: "border-arcade-green/30",
  },
  cyan: {
    tab: "text-arcade-muted hover:text-arcade-cyan",
    activeTab: "text-arcade-cyan border-arcade-cyan",
    rank: "text-arcade-cyan",
    border: "border-arcade-cyan/30",
  },
  purple: {
    tab: "text-arcade-muted hover:text-arcade-purple",
    activeTab: "text-arcade-purple border-arcade-purple",
    rank: "text-arcade-purple",
    border: "border-arcade-purple/30",
  },
};

export default function LeaderboardPage() {
  const [activeGame, setActiveGame] = useState<GameId>("snake");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async (game: GameId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?game=${game}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // silently fail for in-memory store
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchScores(activeGame);
  }, [activeGame, fetchScores]);

  const activeConfig = GAMES.find((g) => g.id === activeGame)!;
  const c = colorMap[activeConfig.color];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-arcade-muted hover:text-white text-sm uppercase tracking-widest mb-8 transition-colors"
      >
        <span>&larr;</span>
        <span>Back to Games</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider neon-glow mb-2">
          Leaderboard
        </h1>
        <p className="text-arcade-muted text-sm">
          Top scores across all games
        </p>
      </div>

      {/* Game tabs */}
      <div className="flex gap-1 mb-6 border-b border-arcade-border">
        {GAMES.map((game) => {
          const gc = colorMap[game.color];
          const isActive = activeGame === game.id;
          return (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`px-4 py-3 text-xs uppercase tracking-widest transition-colors border-b-2 ${
                isActive
                  ? gc.activeTab
                  : `${gc.tab} border-transparent`
              }`}
            >
              <span className="mr-2">{game.emoji}</span>
              {game.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className={`bg-arcade-card border ${c.border} rounded-lg overflow-hidden`}>
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_5rem_8rem] gap-4 px-4 py-3 border-b border-arcade-border text-[10px] uppercase tracking-widest text-arcade-muted">
          <span>Rank</span>
          <span>Player</span>
          <span className="text-right">Score</span>
          <span className="text-right hidden sm:block">Date</span>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-arcade-muted text-sm">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-arcade-muted text-sm mb-1">No scores yet</p>
            <p className="text-arcade-muted text-xs">
              Play{" "}
              <Link href={`/games/${activeGame}`} className={`${c.rank} hover:underline`}>
                {activeConfig.label}
              </Link>{" "}
              and be the first!
            </p>
          </div>
        ) : (
          <div>
            {entries.slice(0, 20).map((entry, i) => (
              <div
                key={`${entry.username}-${entry.date}`}
                className={`grid grid-cols-[3rem_1fr_5rem_8rem] gap-4 px-4 py-3 items-center ${
                  i !== entries.length - 1 ? "border-b border-arcade-border/50" : ""
                } ${i < 3 ? "bg-arcade-darker/50" : ""}`}
              >
                <span
                  className={`text-sm font-bold ${i < 3 ? c.rank : "text-arcade-muted"}`}
                >
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <span className="text-sm text-white truncate">
                  {entry.username}
                </span>
                <span className="text-sm font-bold text-right text-white">
                  {entry.score.toLocaleString()}
                </span>
                <span className="text-xs text-arcade-muted text-right hidden sm:block">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
