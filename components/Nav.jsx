'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HexagonMark } from './BrandEmblem';
import { Button } from './ui/Button';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Login', href: '/login' },
  { name: 'Register', href: '/register' },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-brand-navy/90 backdrop-blur-md border-b border-white/10 shadow-premium' : 'bg-transparent'}`}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="ResolveX home"
        >
          <HexagonMark size={30} className="group-hover:animate-float transition-transform duration-500" />
          <span className="text-xl font-bold tracking-tighter text-white">Resolve<span className="text-cyan-400">X</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-slate-300 hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy rounded px-2 py-1.5"
              aria-current={link.href === '/' ? 'page' : undefined}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
            Log in
          </Button>
          <Button size="sm" onClick={() => router.push('/register')}>
            Get started
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden bg-brand-navy/95 backdrop-blur-md border-b border-white/10">
          <div className="px-6 py-4 space-y-3">
            {LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-slate-300 hover:text-cyan-400 py-3 rounded-xl hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 space-y-2">
              <Button variant="outline" fullWidth onClick={() => router.push('/login')}>
                Log in
              </Button>
              <Button fullWidth onClick={() => router.push('/register')}>
                Get started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}