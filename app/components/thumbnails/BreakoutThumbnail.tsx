export default function BreakoutThumbnail() {
  const brickColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#a855f7"];

  return (
    <div className="w-full h-full flex items-center justify-center thumbnail-scene">
      <svg viewBox="0 0 120 100" className="w-4/5 h-4/5">
        {/* Brick rows */}
        {brickColors.map((color, row) =>
          Array.from({ length: 8 }, (_, col) => {
            // Remove a few bricks to show destruction
            const missing =
              (row === 5 && (col === 2 || col === 5 || col === 6)) ||
              (row === 4 && (col === 3 || col === 7)) ||
              (row === 3 && col === 4);
            if (missing) return null;

            return (
              <rect
                key={`${row}-${col}`}
                x={col * 14 + 4}
                y={row * 7 + 8}
                width="12"
                height="5"
                rx="0.8"
                fill={color}
                opacity={0.7 + row * 0.04}
              />
            );
          })
        )}

        {/* Ball */}
        <circle cx="75" cy="72" r="2.5" fill="white" opacity="0.95" />
        {/* Ball trail */}
        <circle cx="72" cy="75" r="2" fill="white" opacity="0.12" />
        <circle cx="69" cy="78" r="1.5" fill="white" opacity="0.06" />

        {/* Paddle */}
        <rect x="45" y="90" width="24" height="4" rx="2" fill="#a855f7" opacity="0.9" />

        {/* Particle debris near broken bricks */}
        <rect x="38" y="42" width="1.5" height="1.5" fill="#06b6d4" opacity="0.4" transform="rotate(15 38 42)" />
        <rect x="98" y="35" width="1" height="1" fill="#22c55e" opacity="0.3" transform="rotate(30 98 35)" />
        <rect x="60" y="30" width="1.2" height="1.2" fill="#eab308" opacity="0.35" transform="rotate(45 60 30)" />
      </svg>
    </div>
  );
}
