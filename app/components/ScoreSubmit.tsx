"use client";

import { useState } from "react";
import { useUser } from "./UserProvider";

interface ScoreSubmitProps {
  game: string;
  score: number;
  color: "green" | "cyan" | "purple";
  onSubmitted?: () => void;
  compact?: boolean;
}

export default function ScoreSubmit({ game, score, color, onSubmitted, compact }: ScoreSubmitProps) {
  const { username } = useUser();
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const btnClass = `neon-btn neon-btn-${color} w-full`;

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
    if (compact) return null;
    return (
      <div className="mt-4 p-4 border border-arcade-border rounded-lg bg-arcade-darker text-center">
        <p className="text-arcade-green text-[9px] font-pixel uppercase tracking-wider">
          Score submitted!
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div>
        <button
          onClick={handleSubmit}
          disabled={status === "submitting"}
          className={btnClass}
        >
          {status === "submitting" ? "Saving..." : "Submit Score"}
        </button>
        {status === "error" && (
          <p className="text-red-400 text-[9px] font-pixel mt-2">{errorMsg}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border border-arcade-border rounded-lg bg-arcade-darker">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-arcade-muted text-[9px] font-pixel uppercase tracking-wider">
            Submit as
          </p>
          <p className="text-white text-sm font-bold mt-0.5">{username}</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={status === "submitting"}
          className={`neon-btn neon-btn-${color}`}
        >
          {status === "submitting" ? "..." : "Submit"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-400 text-[9px] font-pixel mt-2">{errorMsg}</p>
      )}
    </div>
  );
}
