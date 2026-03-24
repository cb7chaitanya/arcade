import Link from "next/link";

export interface GameCardProps {
  title: string;
  description: string;
  href: string;
  color: "purple" | "pink" | "cyan" | "green" | "yellow" | "orange";
  thumbnail: React.ReactNode;
  tags?: string[];
}

const colorMap = {
  purple: {
    border: "border-arcade-purple/20 hover:border-arcade-purple/50",
    text: "text-arcade-purple",
    btnBg: "bg-arcade-purple",
    btnHover: "group-hover:bg-arcade-purple",
    glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
    ping: "bg-arcade-purple",
  },
  pink: {
    border: "border-arcade-pink/20 hover:border-arcade-pink/50",
    text: "text-arcade-pink",
    btnBg: "bg-arcade-pink",
    btnHover: "group-hover:bg-arcade-pink",
    glow: "group-hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]",
    ping: "bg-arcade-pink",
  },
  cyan: {
    border: "border-arcade-cyan/20 hover:border-arcade-cyan/50",
    text: "text-arcade-cyan",
    btnBg: "bg-arcade-cyan",
    btnHover: "group-hover:bg-arcade-cyan",
    glow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
    ping: "bg-arcade-cyan",
  },
  green: {
    border: "border-arcade-green/20 hover:border-arcade-green/50",
    text: "text-arcade-green",
    btnBg: "bg-arcade-green",
    btnHover: "group-hover:bg-arcade-green",
    glow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]",
    ping: "bg-arcade-green",
  },
  yellow: {
    border: "border-arcade-yellow/20 hover:border-arcade-yellow/50",
    text: "text-arcade-yellow",
    btnBg: "bg-arcade-yellow",
    btnHover: "group-hover:bg-arcade-yellow",
    glow: "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]",
    ping: "bg-arcade-yellow",
  },
  orange: {
    border: "border-arcade-orange/20 hover:border-arcade-orange/50",
    text: "text-arcade-orange",
    btnBg: "bg-arcade-orange",
    btnHover: "group-hover:bg-arcade-orange",
    glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]",
    ping: "bg-arcade-orange",
  },
};

export default function GameCard({
  title,
  description,
  href,
  color,
  thumbnail,
  tags,
}: GameCardProps) {
  const c = colorMap[color];

  return (
    <Link href={href} className="group block">
      <div
        className={`relative bg-arcade-card border ${c.border} rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 ${c.glow}`}
      >
        {/* Thumbnail area */}
        <div className="relative aspect-[4/3] bg-arcade-darker overflow-hidden scanlines">
          <div className="absolute inset-0 flex items-center justify-center">
            {thumbnail}
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
            <div className="relative">
              {/* Ping ring */}
              <div
                className={`absolute inset-0 rounded-full ${c.ping} opacity-0 group-hover:opacity-100 play-ping`}
              />
              {/* Button */}
              <div
                className={`relative w-14 h-14 rounded-full ${c.btnBg} flex items-center justify-center shadow-lg`}
              >
                {/* Play triangle */}
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-white ml-0.5"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Card info */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className={`text-base font-bold uppercase tracking-wider ${c.text}`}
            >
              {title}
            </h3>
          </div>

          <p className="text-arcade-muted text-sm leading-relaxed mb-3">
            {description}
          </p>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-widest text-arcade-muted bg-arcade-darker px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
