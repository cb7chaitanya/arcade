"use client";

import { useState } from "react";

interface ScoreSubmitProps {
  game: string;
  score: number;
  color: "green" | "cyan" | "purple";
  onSubmitted?: () => void;
}

const colorStyles = {
  green: {
    border: "border-arcade-green/40",
    bg: "bg-arcade-green/15",
    hoverBg: "hover:bg-arcade-green/25",
    text: "text-arcade-green",
    ring: "focus:ring-arcade-green/40",
    inputBorder: "border-arcade-green/30 focus:border-arcade-green/60",
  },
  cyan: {
    border: "border-arcade-cyan/40",
    bg: "bg-arcade-cyan/15",
    hoverBg: "hover:bg-arcade-cyan/25",
    text: "text-arcade-cyan",
    ring: "focus:ring-arcade-cyan/40",
    inputBorder: "border-arcade-cyan/30 focus:border-arcade-cyan/60",
  },
  purple: {
    border: "border-arcade-purple/40",
    bg: "bg-arcade-purple/15",
    hoverBg: "hover:bg-arcade-purple/25",
    text: "text-arcade-purple",
    ring: "focus:ring-arcade-purple/40",
    inputBorder: "border-arcade-purple/30 focus:border-arcade-purple/60",
  },
};

export default function ScoreSubmit({ game, score, color, onSubmitted }: ScoreSubmitProps) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const c = colorStyles[color];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, game, score }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setStatus("done");
      onSubmitted?.();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit");
    }
  }

  if (status === "done") {
    return (
      <div className={`mt-4 p-4 border ${c.border} rounded-lg bg-arcade-darker text-center`}>
        <p className={`${c.text} text-sm uppercase tracking-widest font-bold`}>
          Score submitted!
        </p>
        <p className="text-arcade-muted text-xs mt-1">
          Check the leaderboard to see your ranking
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-4 p-4 border ${c.border} rounded-lg bg-arcade-darker`}
    >
      <p className="text-arcade-muted text-xs uppercase tracking-widest mb-3">
        Submit your score to the leaderboard
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter name"
          maxLength={16}
          className={`flex-1 px-3 py-2 bg-arcade-card border ${c.inputBorder} rounded text-sm text-white placeholder:text-arcade-muted outline-none focus:ring-1 ${c.ring} transition-colors`}
        />
        <button
          type="submit"
          disabled={!username.trim() || status === "submitting"}
          className={`px-4 py-2 ${c.bg} border ${c.border} rounded ${c.text} text-xs uppercase tracking-widest ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {status === "submitting" ? "..." : "Submit"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
      )}
    </form>
  );
}
