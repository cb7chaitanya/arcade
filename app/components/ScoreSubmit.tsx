"use client";

import { useState } from "react";
import { useUser } from "./UserProvider";

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
  },
  cyan: {
    border: "border-arcade-cyan/40",
    bg: "bg-arcade-cyan/15",
    hoverBg: "hover:bg-arcade-cyan/25",
    text: "text-arcade-cyan",
  },
  purple: {
    border: "border-arcade-purple/40",
    bg: "bg-arcade-purple/15",
    hoverBg: "hover:bg-arcade-purple/25",
    text: "text-arcade-purple",
  },
};

export default function ScoreSubmit({ game, score, color, onSubmitted }: ScoreSubmitProps) {
  const { username } = useUser();
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const c = colorStyles[color];

  async function handleSubmit() {
    if (!username) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, game, score }),
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

  if (!username) return null;

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
    <div className={`mt-4 p-4 border ${c.border} rounded-lg bg-arcade-darker`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-arcade-muted text-xs uppercase tracking-widest">
            Submit score as
          </p>
          <p className="text-white text-sm font-bold mt-0.5">{username}</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={status === "submitting"}
          className={`px-4 py-2 ${c.bg} border ${c.border} rounded ${c.text} text-xs uppercase tracking-widest ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {status === "submitting" ? "Submitting..." : "Submit Score"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
      )}
    </div>
  );
}
