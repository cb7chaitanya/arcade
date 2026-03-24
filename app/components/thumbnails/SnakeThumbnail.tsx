export default function SnakeThumbnail() {
  // Snake body segments as a winding path
  const segments = [
    { x: 6, y: 5 },
    { x: 7, y: 5 },
    { x: 8, y: 5 },
    { x: 8, y: 6 },
    { x: 8, y: 7 },
    { x: 7, y: 7 },
    { x: 6, y: 7 },
    { x: 5, y: 7 },
    { x: 5, y: 8 },
    { x: 5, y: 9 },
    { x: 6, y: 9 },
    { x: 7, y: 9 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center thumbnail-scene">
      <svg viewBox="0 0 14 14" className="w-3/4 h-3/4">
        {/* Grid dots */}
        {Array.from({ length: 14 }, (_, y) =>
          Array.from({ length: 14 }, (_, x) => (
            <rect
              key={`${x}-${y}`}
              x={x + 0.45}
              y={y + 0.45}
              width="0.1"
              height="0.1"
              fill="rgba(34,197,94,0.08)"
            />
          ))
        )}

        {/* Snake body */}
        {segments.map((seg, i) => (
          <rect
            key={i}
            x={seg.x}
            y={seg.y}
            width="1"
            height="1"
            rx="0.15"
            fill={i === segments.length - 1 ? "#22c55e" : "#22c55e"}
            opacity={0.4 + (i / segments.length) * 0.6}
          />
        ))}

        {/* Snake head — last segment, slightly larger feel */}
        <rect
          x={segments[segments.length - 1].x}
          y={segments[segments.length - 1].y}
          width="1"
          height="1"
          rx="0.2"
          fill="#4ade80"
        />
        {/* Eyes */}
        <rect
          x={segments[segments.length - 1].x + 0.55}
          y={segments[segments.length - 1].y + 0.2}
          width="0.25"
          height="0.25"
          rx="0.05"
          fill="#0a0a0f"
        />

        {/* Food */}
        <rect x="10" y="4" width="1" height="1" rx="0.2" fill="#ef4444" opacity="0.9" />
        {/* Food glow */}
        <rect x="10" y="4" width="1" height="1" rx="0.2" fill="#ef4444" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}
