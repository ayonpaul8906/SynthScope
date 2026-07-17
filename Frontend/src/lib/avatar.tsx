import React from "react";

export function getPremiumAvatar(name: string) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    ["#e0c088", "#8c6f37"], // Champagne / Bronze
    ["#38bdf8", "#0369a1"], // Cyber Blue / Steel
    ["#818cf8", "#4338ca"], // Indigo / Navy
    ["#c084fc", "#6b21a8"], // Platinum Purple
    ["#f472b6", "#be185d"], // Muted Rose
    ["#34d399", "#065f46"], // Seafoam / Dark Teal
  ];
  const [c1, c2] = colors[hash % colors.length];

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full rounded-inherit">
      <defs>
        <linearGradient id={`grad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#grad-${hash})`} />
      <rect width="100" height="100" fill="rgba(255,255,255,0.02)" />
      <circle
        cx="50"
        cy="50"
        r="24"
        fill="rgba(255, 255, 255, 0.12)"
        style={{ backdropFilter: "blur(4px)" }}
      />
      <text
        x="50%"
        y="52%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="24"
        fontWeight="700"
        fontFamily='"Plus Jakarta Sans", "Inter", sans-serif'
        letterSpacing="-0.03em"
      >
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </text>
    </svg>
  );
}

export function PremiumAvatar({ name, className = "" }: { name: string; className?: string }) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    ["#e0c088", "#8c6f37"],
    ["#38bdf8", "#0369a1"],
    ["#818cf8", "#4338ca"],
    ["#c084fc", "#6b21a8"],
    ["#f472b6", "#be185d"],
    ["#34d399", "#065f46"],
  ];
  const [c1, c2] = colors[hash % colors.length];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center font-display rounded-xl border border-white/10 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.3)`,
      }}
    >
      <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-[0.5px]" />
      <span className="relative z-10 text-white font-bold tracking-tight text-xs sm:text-sm animate-fade-in">
        {initials}
      </span>
    </div>
  );
}
