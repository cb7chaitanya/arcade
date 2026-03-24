import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-arcade-border bg-arcade-darker/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-arcade-purple/15 border border-arcade-purple/30 flex items-center justify-center group-hover:bg-arcade-purple/25 transition-colors">
            <span className="text-lg leading-none">🕹️</span>
          </div>
          <span className="text-xl font-bold tracking-widest uppercase neon-glow group-hover:text-arcade-purple transition-colors">
            Arcade
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-arcade-muted hover:text-white transition-colors hidden sm:block"
          >
            Games
          </Link>
          <Link
            href="/leaderboard"
            className="text-xs uppercase tracking-widest text-arcade-muted hover:text-white transition-colors hidden sm:block"
          >
            Leaderboard
          </Link>
          <div className="h-4 w-px bg-arcade-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arcade-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-arcade-green" />
            </span>
            <span className="text-arcade-green text-xs font-mono uppercase tracking-wider">
              Online
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
