"use client";

import Link from "next/link";
import ScoreSubmit from "./ScoreSubmit";

interface GameOverModalProps {
  show: boolean;
  title: string;
  subtitle?: string;
  score: number;
  game: string;
  color: "green" | "cyan" | "purple";
  submitted: boolean;
  onSubmitted: () => void;
  onRestart: () => void;
}

const colorStyles = {
  green: {
    border: "border-arcade-green/40",
    title: "text-arcade-green neon-glow-green",
    btn: "neon-btn neon-btn-green",
    scoreBg: "bg-arcade-green/10",
    scoreText: "text-arcade-green",
    scoreBorder: "border-arcade-green/30",
  },
  cyan: {
    border: "border-arcade-cyan/40",
    title: "text-arcade-cyan neon-glow-cyan",
    btn: "neon-btn neon-btn-cyan",
    scoreBg: "bg-arcade-cyan/10",
    scoreText: "text-arcade-cyan",
    scoreBorder: "border-arcade-cyan/30",
  },
  purple: {
    border: "border-arcade-purple/40",
    title: "text-arcade-purple neon-glow",
    btn: "neon-btn neon-btn-purple",
    scoreBg: "bg-arcade-purple/10",
    scoreText: "text-arcade-purple",
    scoreBorder: "border-arcade-purple/30",
  },
};

export default function GameOverModal({
  show,
  title,
  subtitle,
  score,
  game,
  color,
  submitted,
  onSubmitted,
  onRestart,
}: GameOverModalProps) {
  if (!show) return null;

  const c = colorStyles[color];

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
      <div
        className={`modal-enter bg-arcade-card border ${c.border} rounded-xl p-6 sm:p-8 max-w-xs w-full mx-4 text-center`}
      >
        {/* Title */}
        <h2 className={`font-pixel text-sm sm:text-base uppercase tracking-wider ${c.title} mb-2`}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-arcade-muted text-xs mb-4">{subtitle}</p>
        )}

        {/* Score display */}
        <div
          className={`${c.scoreBg} border ${c.scoreBorder} rounded-lg py-3 px-4 mb-5`}
        >
          <p className="text-arcade-muted text-[9px] font-pixel uppercase tracking-wider mb-1">
            Final Score
          </p>
          <p className={`font-pixel text-2xl ${c.scoreText}`}>
            {score.toLocaleString()}
          </p>
        </div>

        {/* Score submit */}
        {score > 0 && !submitted && (
          <div className="mb-4">
            <ScoreSubmit
              game={game}
              score={score}
              color={color}
              onSubmitted={onSubmitted}
              compact
            />
          </div>
        )}
        {submitted && (
          <p className="text-arcade-muted text-[9px] font-pixel uppercase tracking-wider mb-4">
            Score saved!
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button onClick={onRestart} className={c.btn}>
            Play Again
          </button>
          <Link
            href="/"
            className="neon-btn neon-btn-purple text-center"
          >
            Back to Games
          </Link>
        </div>
      </div>
    </div>
  );
}
