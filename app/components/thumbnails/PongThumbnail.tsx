export default function PongThumbnail() {
  return (
    <div className="w-full h-full flex items-center justify-center thumbnail-scene">
      <svg viewBox="0 0 160 100" className="w-4/5 h-4/5">
        {/* Center dashed line */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect
            key={i}
            x="79"
            y={i * 10 + 2}
            width="2"
            height="6"
            fill="rgba(6,182,212,0.2)"
            rx="0.5"
          />
        ))}

        {/* Left paddle */}
        <rect x="10" y="30" width="4" height="24" rx="2" fill="#06b6d4" opacity="0.9" />

        {/* Right paddle */}
        <rect x="146" y="46" width="4" height="24" rx="2" fill="#06b6d4" opacity="0.6" />

        {/* Ball */}
        <rect x="88" y="42" width="5" height="5" rx="1" fill="white" opacity="0.95" />

        {/* Ball trail */}
        <rect x="82" y="39" width="4" height="4" rx="1" fill="white" opacity="0.15" />
        <rect x="76" y="36" width="3" height="3" rx="1" fill="white" opacity="0.08" />

        {/* Score */}
        <text x="60" y="18" fill="rgba(6,182,212,0.35)" fontSize="12" fontFamily="monospace" fontWeight="bold">3</text>
        <text x="92" y="18" fill="rgba(6,182,212,0.35)" fontSize="12" fontFamily="monospace" fontWeight="bold">5</text>
      </svg>
    </div>
  );
}
