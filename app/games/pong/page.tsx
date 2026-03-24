"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import GameOverModal from "../../components/GameOverModal";
import {
  playGameOver,
  playPaddleHit,
  playScorePoint,
  playWallBounce,
  playWin,
} from "../../lib/sounds";
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
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) render(ctx, stateRef.current);
  }, []);

  useEffect(() => {
    function loop(time: number) {
      rafRef.current = requestAnimationFrame(loop);

      const dt = lastRef.current ? time - lastRef.current : 16;
      lastRef.current = time;

      const prev = stateRef.current;
      const next = tick(prev, dt);
      stateRef.current = next;

      // Sound: paddle hits (ballVX sign flip)
      if (prev.ballVX < 0 && next.ballVX > 0) playPaddleHit();
      if (prev.ballVX > 0 && next.ballVX < 0) playPaddleHit();
      // Sound: wall bounce (ballVY sign flip, ballVX same)
      if (
        Math.sign(prev.ballVY) !== Math.sign(next.ballVY) &&
        Math.sign(prev.ballVX) === Math.sign(next.ballVX) &&
        next.ballVY !== 0
      ) playWallBounce();

      if (next.playerScore > prev.playerScore) {
        setPlayerScore(next.playerScore);
        playScorePoint();
      } else if (next.playerScore !== prev.playerScore) {
        setPlayerScore(next.playerScore);
      }
      if (next.aiScore > prev.aiScore) {
        setAiScore(next.aiScore);
        playScorePoint();
      } else if (next.aiScore !== prev.aiScore) {
        setAiScore(next.aiScore);
      }
      if (next.winner !== null && prev.winner === null) {
        setWinner(next.winner);
        if (next.winner === "player") playWin();
        else playGameOver();
      }
      if (next.started && !prev.started) setStarted(true);

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
          <span className="text-2xl">🏓</span>
          <h1 className="font-pixel text-sm uppercase tracking-wider text-arcade-cyan neon-glow-cyan">
            Pong
          </h1>
        </div>
        <p className="text-arcade-muted text-[9px] font-pixel uppercase tracking-wider hidden sm:block">
          W/S or Arrows
        </p>
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-6 mb-4 font-pixel text-[9px] uppercase tracking-wider">
        <span className="text-arcade-muted">
          You <span className="text-arcade-cyan">{playerScore}</span>
        </span>
        <span className="text-arcade-muted">-</span>
        <span className="text-arcade-muted">
          AI <span className="text-arcade-pink">{aiScore}</span>
        </span>
        <span className="text-arcade-muted ml-auto hidden sm:inline">First to 5</span>
      </div>

      {/* Canvas container */}
      <div className="relative max-w-[600px] mx-auto">
        <div className="relative border-2 border-arcade-border rounded-xl overflow-hidden crt-screen scanlines">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="block w-full h-auto"
          />
        </div>

        {/* Game over modal */}
        <GameOverModal
          show={winner !== null}
          title={winner === "player" ? "You Win!" : "AI Wins"}
          subtitle={`${playerScore} - ${aiScore}`}
          score={playerScore}
          game="pong"
          color="cyan"
          submitted={submitted}
          onSubmitted={() => setSubmitted(true)}
          onRestart={restart}
        />

        {/* Start hint */}
        {!started && !winner && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10">
            <p className="font-pixel text-[10px] text-arcade-cyan neon-glow-cyan uppercase tracking-wider animate-pulse">
              Press W/S to start
            </p>
          </div>
        )}

        {/* Player labels */}
        <div className="flex justify-between mt-3 px-2 font-pixel text-[8px] uppercase tracking-widest text-arcade-muted">
          <span>Player</span>
          <span>AI</span>
        </div>
      </div>
    </div>
  );
}
