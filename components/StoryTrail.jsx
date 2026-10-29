'use client';

import { useState, useRef, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import { ChevronRight, Clock, UserCheck, FileCheck } from 'lucide-react';

// Scroll-linked visual narrative of the grievance lifecycle
const STEPS = [
  {
    title: 'Submit',
    icon: <FileCheck size={22} strokeWidth={2} />,
    body: 'Log in with your college email and file a grievance under hostel, mess, academics, facilities, or other.',
    time: '2 min',
  },
  {
    title: 'Acknowledge',
    icon: <Clock size={22} strokeWidth={2} />,
    body: 'You receive a unique reference ID and an immediate acknowledgement. Your case enters the tracking queue.',
    time: 'Instant',
  },
  {
    title: 'Review',
    icon: <UserCheck size={22} strokeWidth={2} />,
    body: 'Authorized staff review, categorize, and assign the grievance to the right department with a clear owner.',
    time: '1–2 days',
  },
  {
    title: 'Resolve',
    icon: <ChevronRight size={22} strokeWidth={2} />,
    body: 'The assigned team investigates and acts. You are notified at each status change until resolution.',
    time: 'Varies',
  },
];

export default function StoryTrail() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll-linked progress: highlight step based on scroll position within the section
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Section is visible between top entering bottom of viewport and top leaving top of viewport
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
      const index = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
      setActiveIndex(index);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative py-20 md:py-32 overflow-hidden">
      {/* Decorative grid dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_transparent_25%,rgba(34,211,238,0.06)_26%,rgba(34,211,238,0.06)_27%,transparent_28%)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16 md:mb-24 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How a grievance moves</h2>
          <p className="text-slate-400 max-w-xl mx-auto">From submission to resolution, every step is tracked and auditable.</p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Connector line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-white/10 rounded-full" />

          {STEPS.map((step, index) => {
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex;
            return (
              <div key={step.title} className="relative mb-20 md:mb-0 lg:mb-0 flex flex-col lg:flex-row lg:items-center gap-6" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Connector segments */}
                {index > 0 && (
                  <div className="absolute left-1/2 -translate-x-1/2 h-[calc(50%+40px)] w-0.5 bg-white/10" />
                )}
                {index < STEPS.length - 1 && (
                  <div className="absolute left-1/2 -translate-x-1/2 h-[calc(50%+40px)] w-0.5 bg-white/10" />
                )}

                {/* Step node */}
                <div className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 ${isActive ? 'ring-4 ring-cyan-500/30 scale-110' : ''} ${isCompleted ? 'bg-cyan-500 text-brand-navy border-cyan-500' : 'bg-white/5 border border-white/20 text-slate-400'}`}>
                  {step.icon}
                </div>

                {/* Content */}
                <div className={`w-full lg:w-1/2 px-6 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'} animate-fade-in`} style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-white/5 border border-white/10 text-cyan-400">
                    {step.time}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}