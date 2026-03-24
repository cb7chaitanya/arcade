"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import GameOverModal from "../../components/GameOverModal";
import { playEat, playGameOver } from "../../lib/sounds";
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
  const [submitted, setSubmitted] = useState(false);

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

  useEffect(() => {
    let last = 0;

    function loop(time: number) {
      loopRef.current = requestAnimationFrame(loop);
      if (time - last < TICK_MS) return;
      last = time;

      const prev = stateRef.current;
      const next = tick(prev);
      stateRef.current = next;

      if (next.score > prev.score) {
        setScore(next.score);
        playEat();
      }
      if (next.highScore !== prev.highScore) {
        setHighScore(next.highScore);
        localStorage.setItem("snake-highscore", String(next.highScore));
      }
      if (next.gameOver && !prev.gameOver) {
        setGameOver(true);
        playGameOver();
      }

      draw();
    }

    loopRef.current = requestAnimationFrame(loop);
    draw();

    return () => {
      if (loopRef.current !== null) cancelAnimationFrame(loopRef.current);
    };
  }, [draw]);

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
    setSubmitted(false);
    draw();
  }, [draw]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-arcade-muted hover:text-white font-pixel text-[9px] uppercase tracking-widest mb-8 transition-colors"
      >
        <span>&larr;</span>
        <span>Games</span>
      </Link>

      {/* Game header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐍</span>
          <h1 className="font-pixel text-sm uppercase tracking-wider text-arcade-green neon-glow-green">
            Snake
          </h1>
        </div>
        <p className="text-arcade-muted text-[9px] font-pixel uppercase tracking-wider hidden sm:block">
          Arrow keys / WASD
        </p>
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-6 mb-4 font-pixel text-[9px] uppercase tracking-wider">
        <span className="text-arcade-muted">
          Score <span className="text-arcade-green">{score}</span>
        </span>
        <span className="text-arcade-muted">
          Best <span className="text-arcade-yellow">{highScore}</span>
        </span>
      </div>

      {/* Canvas container */}
      <div className="relative max-w-[400px] mx-auto">
        <div className="relative border-2 border-arcade-border rounded-xl overflow-hidden crt-screen scanlines">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="block w-full h-auto"
          />
        </div>

        {/* Game over modal */}
        <GameOverModal
          show={gameOver}
          title="Game Over"
          score={score}
          game="snake"
          color="green"
          submitted={submitted}
          onSubmitted={() => setSubmitted(true)}
          onRestart={restart}
        />

        {/* Start hint */}
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10">
            <p className="font-pixel text-[10px] text-arcade-green neon-glow-green uppercase tracking-wider animate-pulse">
              Press arrow keys to start
            </p>
          </div>
        )}

        <p className="text-center text-arcade-muted text-[8px] font-pixel uppercase tracking-widest mt-4 sm:hidden">
          Keyboard required
        </p>
      </div>
    </div>
  );
}
