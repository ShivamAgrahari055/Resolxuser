'use client';
import { useState, useEffect, useRef } from 'react';


export function useInView({ threshold = 0.12, rootMargin = '-10% 0px -10% 0px', once = true } = {}) {
  const ref = useRef(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [inView, setInView] = useState(reduced);
  const [hasTriggered, setHasTriggered] = useState(reduced);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once && !hasTriggered) setHasTriggered(true);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView, hasTriggered };
}