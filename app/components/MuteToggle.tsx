"use client";

import { useEffect, useState } from "react";
import { isMuted, setMuted } from "../lib/sounds";

export default function MuteToggle() {
  const [muted, setMutedState] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("arcade-muted");
    const m = saved === "true";
    setMutedState(m);
    setMuted(m);
  }, []);

  function toggle() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    localStorage.setItem("arcade-muted", String(next));
  }

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-arcade-card border border-arcade-border hover:border-arcade-purple/40 transition-colors text-arcade-muted hover:text-white"
      title={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.08" />
        </svg>
      )}
    </button>
  );
}
