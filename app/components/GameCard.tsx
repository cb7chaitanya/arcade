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
    border: "border-arcade-purple/15 hover:border-arcade-purple/60",
    text: "text-arcade-purple",
    btnBg: "bg-arcade-purple",
    glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25),0_0_60px_rgba(168,85,247,0.1)]",
    ping: "bg-arcade-purple",
    tagBorder: "border-arcade-purple/20",
  },
  pink: {
    border: "border-arcade-pink/15 hover:border-arcade-pink/60",
    text: "text-arcade-pink",
    btnBg: "bg-arcade-pink",
    glow: "group-hover:shadow-[0_0_30px_rgba(236,72,153,0.25),0_0_60px_rgba(236,72,153,0.1)]",
    ping: "bg-arcade-pink",
    tagBorder: "border-arcade-pink/20",
  },
  cyan: {
    border: "border-arcade-cyan/15 hover:border-arcade-cyan/60",
    text: "text-arcade-cyan",
    btnBg: "bg-arcade-cyan",
    glow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.25),0_0_60px_rgba(6,182,212,0.1)]",
    ping: "bg-arcade-cyan",
    tagBorder: "border-arcade-cyan/20",
  },
  green: {
    border: "border-arcade-green/15 hover:border-arcade-green/60",
    text: "text-arcade-green",
    btnBg: "bg-arcade-green",
    glow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.25),0_0_60px_rgba(34,197,94,0.1)]",
    ping: "bg-arcade-green",
    tagBorder: "border-arcade-green/20",
  },
  yellow: {
    border: "border-arcade-yellow/15 hover:border-arcade-yellow/60",
    text: "text-arcade-yellow",
    btnBg: "bg-arcade-yellow",
    glow: "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.25),0_0_60px_rgba(234,179,8,0.1)]",
    ping: "bg-arcade-yellow",
    tagBorder: "border-arcade-yellow/20",
  },
  orange: {
    border: "border-arcade-orange/15 hover:border-arcade-orange/60",
    text: "text-arcade-orange",
    btnBg: "bg-arcade-orange",
    glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.25),0_0_60px_rgba(249,115,22,0.1)]",
    ping: "bg-arcade-orange",
    tagBorder: "border-arcade-orange/20",
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
        className={`relative bg-arcade-card border ${c.border} rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 ${c.glow}`}
      >
        {/* Thumbnail area */}
        <div className="relative aspect-[4/3] bg-arcade-darker overflow-hidden scanlines">
          <div className="absolute inset-0 flex items-center justify-center">
            {thumbnail}
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50">
            <div className="relative">
              <div
                className={`absolute inset-0 rounded-full ${c.ping} opacity-0 group-hover:opacity-100 play-ping`}
              />
              <div
                className={`relative w-14 h-14 rounded-full ${c.btnBg} flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300`}
              >
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
          <h3
            className={`font-pixel text-[11px] uppercase tracking-wider ${c.text} mb-2`}
          >
            {title}
          </h3>

          <p className="text-arcade-muted text-xs leading-relaxed mb-3">
            {description}
          </p>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[9px] font-pixel uppercase tracking-wider text-arcade-muted bg-arcade-darker border ${c.tagBorder} px-2 py-1 rounded`}
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
