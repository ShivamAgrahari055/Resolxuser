import { Shield } from 'lucide-react';

export default function BrandEmblem({ size = 40, className = '' }) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }} aria-label="ResolveX brand emblem">
      {/* Hexagon chain emblem: geometric interconnected hexagons forming a shield-like chain */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <defs>
          <linearGradient id="emblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id="emblemGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Outer hexagon chain links */}
        <g stroke="url(#emblemGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#emblemGlow)" opacity="0.9">
          <path d="M4 16 L10 7 L18 7 L24 16 L18 25 L10 25 Z" />
          <path d="M10 7 L16 3 L22 7" />
          <path d="M10 25 L16 29 L22 25" />
        </g>
        {/* Center vertical link (chain) */}
        <path d="M16 8 L16 24" stroke="url(#emblemGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        {/* Inner nodes */}
        <circle cx="10" cy="7" r="1.6" fill="#22d3ee" />
        <circle cx="22" cy="7" r="1.6" fill="#6366f1" />
        <circle cx="10" cy="25" r="1.6" fill="#6366f1" />
        <circle cx="22" cy="25" r="1.6" fill="#22d3ee" />
        <circle cx="16" cy="16" r="2.2" fill="url(#emblemGrad)" />
      </svg>
      {/* Subtle badge glow */}
      <div className="absolute inset-0 rounded-full blur-[20px] opacity-30 animate-pulse-slow bg-cyan-500 pointer-events-none" />
    </div>
  );
}

// Logomark-only variant (hexagon chain, no outer ring)
export function HexagonMark({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="markGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <g stroke="url(#markGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M4 16 L10 7 L18 7 L24 16 L18 25 L10 25 Z" />
        <path d="M10 7 L16 3 L22 7" />
        <path d="M10 25 L16 29 L22 25" />
        <path d="M16 8 L16 24" opacity="0.6" />
      </g>
      <circle cx="16" cy="16" r="2" fill="url(#markGrad)" />
    </svg>
  );
}