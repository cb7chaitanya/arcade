"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CANVAS_SIZE,
  createInitialState,
  handleKey,
  render,
  tick,
  type SnakeState,
} from "./snake";

const TICK_MS = 110;

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<SnakeState>(createInitialState());
  const loopRef = useRef<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  // Load persisted high score
  useEffect(() => {
    const saved = localStorage.getItem("snake-highscore");
    if (saved) {
      const n = parseInt(saved, 10);
      stateRef.current.highScore = n;
      setHighScore(n);
    }
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) render(ctx, stateRef.current);
  }, []);

  // Game loop
  useEffect(() => {
    let last = 0;

    function loop(time: number) {
      loopRef.current = requestAnimationFrame(loop);
      if (time - last < TICK_MS) return;
      last = time;

      const prev = stateRef.current;
      const next = tick(prev);
      stateRef.current = next;

      if (next.score !== prev.score) setScore(next.score);
      if (next.highScore !== prev.highScore) {
        setHighScore(next.highScore);
        localStorage.setItem("snake-highscore", String(next.highScore));
      }
      if (next.gameOver && !prev.gameOver) setGameOver(true);

      draw();
    }

    loopRef.current = requestAnimationFrame(loop);
    draw(); // initial frame

    return () => {
      if (loopRef.current !== null) cancelAnimationFrame(loopRef.current);
    };
  }, [draw]);

  // Keyboard input
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      const next = handleKey(stateRef.current, e.key);
      stateRef.current = next;
      if (next.started && !started) setStarted(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started]);

  const restart = useCallback(() => {
    const hs = stateRef.current.highScore;
    stateRef.current = { ...createInitialState(), highScore: hs };
    setScore(0);
    setGameOver(false);
    setStarted(false);
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

      <div className="bg-arcade-card border border-arcade-green/30 rounded-lg p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-arcade-green/10 rounded-lg flex items-center justify-center text-2xl">
            🐍
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-arcade-green">
              Snake
            </h1>
            <p className="text-arcade-muted text-sm">Arrow keys or WASD to move</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="flex items-center justify-between mb-4 px-1 text-sm uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="text-arcade-muted">
              Score: <span className="text-arcade-green font-bold">{score}</span>
            </span>
            <span className="text-arcade-muted">
              Best: <span className="text-arcade-yellow font-bold">{highScore}</span>
            </span>
          </div>
          {gameOver && (
            <button
              onClick={restart}
              className="px-4 py-1.5 bg-arcade-green/15 border border-arcade-green/40 rounded text-arcade-green text-xs uppercase tracking-widest hover:bg-arcade-green/25 transition-colors"
            >
              Restart
            </button>
          )}
        </div>

        {/* Canvas */}
        <div className="relative max-w-[400px] mx-auto">
          <div className="relative border border-arcade-border rounded-lg overflow-hidden scanlines">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="block w-full h-auto"
            />
          </div>

          {/* Controls hint (mobile) */}
          <p className="text-center text-arcade-muted text-xs uppercase tracking-widest mt-4 sm:hidden">
            Use a keyboard to play
          </p>
        </div>
      </div>
    </div>
  );
}
