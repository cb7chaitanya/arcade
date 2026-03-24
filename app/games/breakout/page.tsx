"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import GameOverModal from "../../components/GameOverModal";
import {
  playBrickBreak,
  playGameOver,
  playLaunch,
  playLoseLife,
  playPaddleHit,
  playWallBounce,
  playWin,
} from "../../lib/sounds";
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
  const [submitted, setSubmitted] = useState(false);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) render(ctx, stateRef.current);
  }, []);

  useEffect(() => {
    let last = 0;
    const TICK_MS = 1000 / 60;

    function loop(time: number) {
      rafRef.current = requestAnimationFrame(loop);
      if (time - last < TICK_MS) return;
      last = time;

      const prev = stateRef.current;
      const next = tick(prev);
      stateRef.current = next;

      // Sound: ball launch
      if (prev.ballOnPaddle && !next.ballOnPaddle) playLaunch();
      // Sound: brick break vs paddle hit vs wall bounce
      if (next.score > prev.score) {
        setScore(next.score);
        playBrickBreak(next.score - prev.score);
      }
      if (
        next.score === prev.score &&
        !next.ballOnPaddle &&
        prev.ballVY > 0 && next.ballVY < 0
      ) playPaddleHit();
      if (
        next.score === prev.score &&
        !next.ballOnPaddle &&
        Math.sign(prev.ballVX) !== Math.sign(next.ballVX) &&
        next.ballVX !== 0
      ) playWallBounce();

      if (next.lives < prev.lives) {
        setLives(next.lives);
        playLoseLife();
      } else if (next.lives !== prev.lives) {
        setLives(next.lives);
      }
      if (next.gameOver && !prev.gameOver) {
        setGameOver(true);
        playGameOver();
      }
      if (next.won && !prev.won) {
        setWon(true);
        playWin();
      }

      draw();
    }

    rafRef.current = requestAnimationFrame(loop);
    draw();

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

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
          <span className="text-2xl">🧱</span>
          <h1 className="font-pixel text-sm uppercase tracking-wider text-arcade-purple neon-glow">
            Breakout
          </h1>
        </div>
        <p className="text-arcade-muted text-[9px] font-pixel uppercase tracking-wider hidden sm:block">
          Mouse / Arrows
        </p>
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-6 mb-4 font-pixel text-[9px] uppercase tracking-wider">
        <span className="text-arcade-muted">
          Score <span className="text-arcade-purple">{score}</span>
        </span>
        <span className="text-arcade-muted">
          Lives{" "}
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={`inline-block w-2 h-2 rounded-full mx-0.5 ${
                i < lives ? "bg-arcade-pink" : "bg-arcade-border"
              }`}
            />
          ))}
        </span>
      </div>

      {/* Canvas container */}
      <div className="relative max-w-[480px] mx-auto">
        <div className="relative border-2 border-arcade-border rounded-xl overflow-hidden crt-screen scanlines">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="block w-full h-auto cursor-none"
          />
        </div>

        {/* Game over / win modal */}
        <GameOverModal
          show={gameOver || won}
          title={won ? "You Win!" : "Game Over"}
          score={score}
          game="breakout"
          color="purple"
          submitted={submitted}
          onSubmitted={() => setSubmitted(true)}
          onRestart={restart}
        />
      </div>
    </div>
  );
}
