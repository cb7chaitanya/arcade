import Link from "next/link";

export const metadata = {
  title: "Pong | Arcade",
};

export default function PongPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-arcade-muted hover:text-white text-sm uppercase tracking-widest mb-8 transition-colors"
      >
        <span>←</span>
        <span>Back to Games</span>
      </Link>

      <div className="bg-arcade-card border border-arcade-cyan/30 rounded-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-arcade-cyan/10 rounded-lg flex items-center justify-center text-2xl">
            🏓
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-arcade-cyan">
              Pong
            </h1>
            <p className="text-arcade-muted text-sm">W/S or Arrow keys to move paddle</p>
          </div>
        </div>

        {/* Game canvas placeholder */}
        <div className="relative aspect-video max-w-lg mx-auto bg-arcade-darker border border-arcade-border rounded-lg flex items-center justify-center scanlines overflow-hidden">
          <div className="relative z-10 text-center">
            <p className="text-arcade-cyan text-lg font-bold uppercase tracking-wider mb-2">
              Coming Soon
            </p>
            <p className="text-arcade-muted text-sm">
              Game canvas will render here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
