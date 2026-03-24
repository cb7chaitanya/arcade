"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CANVAS_H,
  CANVAS_W,
  createInitialState,
  keyDown,
  keyUp,
  mouseClick,
  mouseMove,
  render,
  tick,
  type BreakoutState,
} from "./breakout";

export default function BreakoutPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<BreakoutState>(createInitialState());
  const rafRef = useRef<number | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) render(ctx, stateRef.current);
  }, []);

  // Game loop
  useEffect(() => {
    let last = 0;
    const TICK_MS = 1000 / 60; // 60 fps target

    function loop(time: number) {
      rafRef.current = requestAnimationFrame(loop);
      if (time - last < TICK_MS) return;
      last = time;

      const prev = stateRef.current;
      const next = tick(prev);
      stateRef.current = next;

      if (next.score !== prev.score) setScore(next.score);
      if (next.lives !== prev.lives) setLives(next.lives);
      if (next.gameOver && !prev.gameOver) setGameOver(true);
      if (next.won && !prev.won) setWon(true);

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
      if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) {
        e.preventDefault();
      }
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

  // Mouse
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const x = (e.clientX - rect.left) * scaleX;
      stateRef.current = mouseMove(stateRef.current, x);
    }
    function onClick() {
      stateRef.current = mouseClick(stateRef.current);
    }

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  const restart = useCallback(() => {
    stateRef.current = createInitialState();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
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

      <div className="bg-arcade-card border border-arcade-purple/30 rounded-lg p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-arcade-purple/10 rounded-lg flex items-center justify-center text-2xl">
            🧱
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-arcade-purple">
              Breakout
            </h1>
            <p className="text-arcade-muted text-sm">
              Mouse or Arrow keys — Space to launch
            </p>
          </div>
        </div>

        {/* Score bar */}
        <div className="flex items-center justify-between mb-4 px-1 text-sm uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="text-arcade-muted">
              Score: <span className="text-arcade-purple font-bold">{score}</span>
            </span>
            <span className="text-arcade-muted">
              Lives: <span className="text-arcade-pink font-bold">{lives}</span>
            </span>
          </div>
          {(gameOver || won) && (
            <button
              onClick={restart}
              className="px-4 py-1.5 bg-arcade-purple/15 border border-arcade-purple/40 rounded text-arcade-purple text-xs uppercase tracking-widest hover:bg-arcade-purple/25 transition-colors"
            >
              Restart
            </button>
          )}
        </div>

        {/* Canvas */}
        <div className="relative max-w-[480px] mx-auto">
          <div className="relative border border-arcade-border rounded-lg overflow-hidden scanlines">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="block w-full h-auto cursor-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
