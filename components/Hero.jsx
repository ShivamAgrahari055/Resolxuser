'use client';

import { ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { useInView } from '../hooks/useInView';

// Original architectural illustration inspired by MNNIT Allahabad campus landmarks
// (clock tower, academic blocks, greenery) — no external image dependency.
export default function Hero() {
  const { ref: inViewRef } = useInView({ once: true });
  const staggered = [0.15, 0.3, 0.45];

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden" ref={inViewRef}>
      {/* Background: campus architectural illustration */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-indigo-950/90 to-brand-navy" />
        {/* Campus illustration SVG */}
        <div
          className="absolute inset-0 opacity-40 md:opacity-60 animate-zoom-bg"
          style={{ transformOrigin: 'center' }}
        >
          <svg width="100%" height="100%" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" role="img" aria-label="MNNIT Allahabad campus illustration">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="buildingGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <filter id="softBlur" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="1" />
              </filter>
            </defs>

            {/* Sky */}
            <rect width="1200" height="320" fill="url(#skyGrad)" />

            {/* Sun */}
            <circle cx="980" cy="90" r="40" fill="#fbbf24" opacity="0.9" filter="url(#softBlur)" />

            {/* Distant hills */}
            <path d="M0 320 Q300 260 600 320 T1200 320 V700 H0 Z" fill="#0f172a" opacity="0.6" />

            {/* Trees / greenery */}
            <g fill="#14b8a6" opacity="0.35">
              <circle cx="120" cy="300" r="34" />
              <circle cx="200" cy="310" r="38" />
              <circle cx="900" cy="290" r="32" />
              <circle cx="980" cy="300" r="36" />
              <circle cx="1100" cy="295" r="30" />
            </g>

            {/* Clock tower (MNNIT-inspired) */}
            <g filter="url(#softBlur)">
              <rect x="520" y="120" width="160" height="360" fill="url(#buildingGrad)" />
              <rect x="535" y="120" width="130" height="70" fill="#475569" />
              <circle cx="600" cy="155" r="22" fill="none" stroke="#22d3ee" strokeWidth="3" opacity="0.9" />
              <path d="M600 133 L600 177 M578 155 L622 155" stroke="#22d3ee" strokeWidth="3" opacity="0.9" />
              <rect x="545" y="200" width="20" height="60" fill="#0f172a" />
              <rect x="635" y="200" width="20" height="60" fill="#0f172a" />
              <rect x="545" y="280" width="20" height="60" fill="#0f172a" />
              <rect x="635" y="280" width="20" height="60" fill="#0f172a" />
              <rect x="545" y="360" width="20" height="60" fill="#0f172a" />
              <rect x="635" y="360" width="20" height="60" fill="#0f172a" />
              <rect x="555" y="440" width="110" height="40" fill="#0f172a" />
            </g>

            {/* Academic block wings */}
            <g fill="#334155" opacity="0.85">
              <rect x="200" y="220" width="260" height="200" />
              <rect x="230" y="240" width="40" height="40" fill="#0f172a" />
              <rect x="330" y="240" width="40" height="40" fill="#0f172a" />
              <rect x="430" y="240" width="40" height="40" fill="#0f172a" />
              <rect x="740" y="220" width="260" height="200" />
              <rect x="770" y="240" width="40" height="40" fill="#0f172a" />
              <rect x="870" y="240" width="40" height="40" fill="#0f172a" />
              <rect x="970" y="240" width="40" height="40" fill="#0f172a" />
              <rect x="200" y="420" width="260" height="60" fill="#1e293b" />
              <rect x="740" y="420" width="260" height="60" fill="#1e293b" />
            </g>

            {/* Library/central building in front */}
            <g filter="url(#softBlur)">
              <rect x="400" y="300" width="400" height="180" fill="#475569" />
              <rect x="420" y="320" width="60" height="90" fill="#0f172a" />
              <rect x="560" y="320" width="60" height="90" fill="#0f172a" />
              <rect x="720" y="320" width="60" height="90" fill="#0f172a" />
              <rect x="420" y="440" width="360" height="20" fill="#0f172a" />
            </g>

            {/* Foreground lawn */}
            <path d="M0 560 Q600 540 1200 560 V700 H0 Z" fill="#064e3b" opacity="0.4" />
          </svg>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-brand-navy/70" />
        {/* Vignette */}
        <div className="vignette" />
        {/* Grain */}
        <div className="grain" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-12 text-center max-w-5xl mx-auto pb-20 md:pb-32">
        <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-cyan-300 uppercase tracking-wider animate-fade-in`} style={{ animationDelay: `${staggered[0]}s` }}>
          <ShieldCheck size={14} />
          College Grievance Redressal
        </div>

        <h1
          className="text-5xl md:text-7xl font-extrabold text-white text-balance leading-tight mb-6 md:mb-8 animate-fade-in"
          style={{ animationDelay: `${staggered[0]}s` }}
        >
          Your voice. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Resolved.</span>
        </h1>

        <p
          className="text-lg md:text-xl text-slate-300 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in"
          style={{ animationDelay: `${staggered[1]}s` }}
        >
          A secure, transparent portal for MNNIT Allahabad students to raise hostel, mess, academic,
          and facilities grievances — and for staff to track, assign, and resolve them with full
          audit accountability.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: `${staggered[2]}s` }}>
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Register as Student <ArrowRight size={20} />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Staff Login <Mail size={20} />
            </Button>
          </Link>
        </div>

        {/* Trust pill */}
        <div className="mt-12 md:mt-16 flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: `${staggered[2]}s` }}>
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-slow" />
          <span className="text-xs text-slate-400 uppercase tracking-widest">End-to-end audit trail • SHA-256 hash chain</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in flex flex-col items-center gap-2" style={{ animationDelay: `${staggered[2]}s` }}>
        <span className="text-xs text-slate-500 uppercase tracking-widest">Scroll to explore</span>
        <div className="w-1.5 h-6 rounded-full border border-white/30 flex items-center justify-center">
          <div className="w-1 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}