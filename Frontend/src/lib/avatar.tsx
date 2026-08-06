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
  const avatars = [
    "/avatars/m1.jpg",
    "/avatars/m2.jpg",
    "/avatars/m3.jpg",
    "/avatars/m4.jpg",
    "/avatars/w1.jpg",
    "/avatars/w2.jpg",
    "/avatars/w3.jpg",
    "/avatars/w4.jpg",
  ];
  const selectedAvatar = avatars[hash % avatars.length];

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center rounded-xl border border-white/15 shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-black/50 ${className}`}
    >
      <img
        src={selectedAvatar}
        alt={name}
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
      />
      <div className="absolute inset-0 border border-[#deb896]/20 rounded-xl pointer-events-none" />
    </div>
  );
}
