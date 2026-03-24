"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CANVAS_H,
  CANVAS_W,
  createInitialState,
  keyDown,
  keyUp,
  render,
  tick,
  type PongState,
} from "./pong";

export default function PongPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<PongState>(createInitialState());
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) render(ctx, stateRef.current);
  }, []);

  // Game loop — uses delta time so speed is frame-rate independent
  useEffect(() => {
    function loop(time: number) {
      rafRef.current = requestAnimationFrame(loop);

      const dt = lastRef.current ? time - lastRef.current : 16;
      lastRef.current = time;

      const prev = stateRef.current;
      const next = tick(prev, dt);
      stateRef.current = next;

      if (next.playerScore !== prev.playerScore) setPlayerScore(next.playerScore);
      if (next.aiScore !== prev.aiScore) setAiScore(next.aiScore);
      if (next.winner !== prev.winner) setWinner(next.winner);

      draw();
    }

    rafRef.current = requestAnimationFrame(loop);
    draw();

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  // Keyboard
  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
      stateRef.current = keyDown(stateRef.current, e.key);
    }
    function onUp(e: KeyboardEvent) {
      stateRef.current = keyUp(stateRef.current, e.key);
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const restart = useCallback(() => {
    stateRef.current = createInitialState();
    lastRef.current = 0;
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    draw();
  }, [draw]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-arcade-muted hover:text-white text-sm uppercase tracking-widest mb-8 transition-colors"
      >
        <span>&larr;</span>
        <span>Back to Games</span>
      </Link>

      <div className="bg-arcade-card border border-arcade-cyan/30 rounded-lg p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-arcade-cyan/10 rounded-lg flex items-center justify-center text-2xl">
            🏓
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-arcade-cyan">
              Pong
            </h1>
            <p className="text-arcade-muted text-sm">
              W/S or Arrow keys — first to 5 wins
            </p>
          </div>
        </div>

        {/* Score bar */}
        <div className="flex items-center justify-between mb-4 px-1 text-sm uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="text-arcade-muted">
              You: <span className="text-arcade-cyan font-bold">{playerScore}</span>
            </span>
            <span className="text-arcade-muted">
              AI: <span className="text-arcade-pink font-bold">{aiScore}</span>
            </span>
          </div>
          {winner && (
            <button
              onClick={restart}
              className="px-4 py-1.5 bg-arcade-cyan/15 border border-arcade-cyan/40 rounded text-arcade-cyan text-xs uppercase tracking-widest hover:bg-arcade-cyan/25 transition-colors"
            >
              Restart
            </button>
          )}
        </div>

        {/* Canvas */}
        <div className="relative max-w-[600px] mx-auto">
          <div className="relative border border-arcade-border rounded-lg overflow-hidden scanlines">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="block w-full h-auto"
            />
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-3 px-2 text-[10px] uppercase tracking-widest text-arcade-muted">
            <span>Player</span>
            <span>AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
