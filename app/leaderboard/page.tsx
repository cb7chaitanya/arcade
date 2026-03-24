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

const colorMap: Record<string, {
  tab: string;
  activeTab: string;
  rank: string;
  border: string;
  glow: string;
}> = {
  green: {
    tab: "text-arcade-muted hover:text-arcade-green",
    activeTab: "text-arcade-green border-arcade-green",
    rank: "text-arcade-green",
    border: "border-arcade-green/30",
    glow: "neon-glow-green",
  },
  cyan: {
    tab: "text-arcade-muted hover:text-arcade-cyan",
    activeTab: "text-arcade-cyan border-arcade-cyan",
    rank: "text-arcade-cyan",
    border: "border-arcade-cyan/30",
    glow: "neon-glow-cyan",
  },
  purple: {
    tab: "text-arcade-muted hover:text-arcade-purple",
    activeTab: "text-arcade-purple border-arcade-purple",
    rank: "text-arcade-purple",
    border: "border-arcade-purple/30",
    glow: "neon-glow",
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-arcade-muted hover:text-white font-pixel text-[9px] uppercase tracking-widest mb-8 transition-colors"
      >
        <span>&larr;</span>
        <span>Games</span>
      </Link>

      <div className="mb-8">
        <h1 className={`font-pixel text-lg uppercase tracking-wider ${c.rank} ${c.glow} mb-2`}>
          Leaderboard
        </h1>
        <p className="text-arcade-muted text-xs">
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
              className={`px-4 py-3 font-pixel text-[8px] uppercase tracking-widest transition-all border-b-2 ${
                isActive
                  ? `${gc.activeTab}`
                  : `${gc.tab} border-transparent`
              }`}
            >
              <span className="mr-1.5">{game.emoji}</span>
              {game.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className={`bg-arcade-card border ${c.border} rounded-xl overflow-hidden`}>
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_5rem_7rem] gap-4 px-4 py-3 border-b border-arcade-border font-pixel text-[7px] uppercase tracking-widest text-arcade-muted">
          <span>Rank</span>
          <span>Player</span>
          <span className="text-right">Score</span>
          <span className="text-right hidden sm:block">Date</span>
        </div>

        {loading ? (
          <div className="px-4 py-16 text-center">
            <p className="font-pixel text-[9px] text-arcade-muted uppercase tracking-wider animate-pulse">
              Loading...
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="font-pixel text-[9px] text-arcade-muted uppercase tracking-wider mb-3">
              No scores yet
            </p>
            <Link
              href={`/games/${activeGame}`}
              className={`neon-btn neon-btn-${activeConfig.color}`}
            >
              Play {activeConfig.label}
            </Link>
          </div>
        ) : (
          <div>
            {entries.slice(0, 20).map((entry, i) => (
              <div
                key={`${entry.username}-${entry.date}`}
                className={`grid grid-cols-[3rem_1fr_5rem_7rem] gap-4 px-4 py-3 items-center transition-colors hover:bg-arcade-darker/50 ${
                  i !== Math.min(entries.length, 20) - 1 ? "border-b border-arcade-border/30" : ""
                } ${i < 3 ? "bg-arcade-darker/30" : ""}`}
              >
                <span className={`font-pixel text-[10px] ${i < 3 ? c.rank : "text-arcade-muted"}`}>
                  {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}`}
                </span>
                <span className="text-sm text-white truncate">
                  {entry.username}
                </span>
                <span className="font-pixel text-[10px] text-right text-white">
                  {entry.score.toLocaleString()}
                </span>
                <span className="text-[10px] text-arcade-muted text-right hidden sm:block">
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
