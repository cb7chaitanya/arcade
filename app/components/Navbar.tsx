"use client";

import Link from "next/link";
import MuteToggle from "./MuteToggle";
import { useUser } from "./UserProvider";

export default function Navbar() {
  const { username } = useUser();

  return (
    <nav className="border-b border-arcade-border bg-arcade-darker/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-arcade-purple/15 border border-arcade-purple/30 flex items-center justify-center group-hover:bg-arcade-purple/25 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all">
            <span className="text-lg leading-none">🕹️</span>
          </div>
          <span className="font-pixel text-xs sm:text-sm tracking-wider uppercase neon-glow group-hover:text-arcade-purple transition-colors">
            Arcade
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-[10px] font-pixel uppercase tracking-wider text-arcade-muted hover:text-arcade-purple hover:neon-glow transition-all hidden sm:block"
          >
            Games
          </Link>
          <Link
            href="/leaderboard"
            className="text-[10px] font-pixel uppercase tracking-wider text-arcade-muted hover:text-arcade-cyan hover:neon-glow-cyan transition-all hidden sm:block"
          >
            Scores
          </Link>
          <div className="h-4 w-px bg-arcade-border hidden sm:block" />
          {username && (
            <span className="text-arcade-cyan text-[10px] font-pixel uppercase tracking-wider truncate max-w-[100px] neon-glow-cyan">
              {username}
            </span>
          )}
          <MuteToggle />
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arcade-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-arcade-green" />
            </span>
            <span className="text-arcade-green text-[10px] font-pixel uppercase hidden sm:inline">
              Live
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
