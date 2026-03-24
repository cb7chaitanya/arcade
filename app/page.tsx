import GameCard from "./components/GameCard";
import SnakeThumbnail from "./components/thumbnails/SnakeThumbnail";
import PongThumbnail from "./components/thumbnails/PongThumbnail";
import BreakoutThumbnail from "./components/thumbnails/BreakoutThumbnail";

const games = [
  {
    title: "Snake",
    description:
      "Guide the snake to eat food and grow longer. Don't hit the walls or yourself!",
    href: "/games/snake",
    color: "green" as const,
    thumbnail: <SnakeThumbnail />,
    tags: ["Classic", "1P"],
  },
  {
    title: "Pong",
    description:
      "The classic paddle game. First to 5 points wins. Can you beat the AI?",
    href: "/games/pong",
    color: "cyan" as const,
    thumbnail: <PongThumbnail />,
    tags: ["Classic", "vs AI"],
  },
  {
    title: "Breakout",
    description:
      "Smash all the bricks with your ball and paddle. How many levels can you clear?",
    href: "/games/breakout",
    color: "purple" as const,
    thumbnail: <BreakoutThumbnail />,
    tags: ["Classic", "1P"],
  },
];

export default function Home() {
  return (
    <div className="dot-grid min-h-full">
      {/* Hero section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          {/* Decorative stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[
              { x: "10%", y: "20%", delay: "0s", size: "2px" },
              { x: "85%", y: "15%", delay: "1.2s", size: "2px" },
              { x: "70%", y: "60%", delay: "0.5s", size: "1.5px" },
              { x: "25%", y: "70%", delay: "2s", size: "1.5px" },
              { x: "50%", y: "10%", delay: "0.8s", size: "2px" },
              { x: "90%", y: "45%", delay: "1.5s", size: "1px" },
              { x: "5%", y: "50%", delay: "2.5s", size: "1px" },
            ].map((star, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: star.x,
                  top: star.y,
                  width: star.size,
                  height: star.size,
                  animation: `twinkle 3s ease-in-out ${star.delay} infinite`,
                }}
              />
            ))}
          </div>

          <div className="relative">
            <p className="font-pixel text-[9px] text-arcade-muted uppercase tracking-[0.3em] mb-6">
              Browser-Based Retro Gaming
            </p>

            <h1 className="font-pixel text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider mb-6 neon-glow marquee-flicker">
              Arcade
            </h1>

            <p className="text-arcade-muted text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Classic games, reimagined for the browser. Pick a game and start
              playing — no downloads, no installs.
            </p>

            <div className="mt-8 flex items-center justify-center gap-6 font-pixel text-[8px] uppercase tracking-widest text-arcade-muted">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arcade-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-arcade-green" />
                </span>
                <span>{games.length} games live</span>
              </div>
              <div className="h-3 w-px bg-arcade-border" />
              <span>Free to play</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-arcade-border to-transparent" />
      </section>

      {/* Games section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-pixel text-[10px] uppercase tracking-widest text-arcade-muted">
            All Games
          </h2>
          <div className="h-px flex-1 bg-arcade-border" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.href} {...game} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-px bg-gradient-to-r from-transparent via-arcade-border to-transparent mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel text-[8px] uppercase tracking-widest text-arcade-muted">
          <span>Insert Coin to Continue</span>
          <span className="text-arcade-purple/40">
            Next.js + Tailwind
          </span>
        </div>
      </footer>
    </div>
  );
}
