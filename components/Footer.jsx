import Link from 'next/link';
import { Shield, Mail, Github, Globe } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: ['How it works', 'Submit a grievance', 'Track status', 'FAQ'],
  College: ['MNNIT Allahabad', 'Hostels', 'Mess', 'Academics', 'Facilities'],
  Legal: ['Privacy', 'Terms', 'Accessibility', 'Audit policy'],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-navy/90 backdrop-blur-md">
      <div className="px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <Shield size={18} />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white">Resolve<span className="text-cyan-400">X</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              A grievance redressal portal for MNNIT Allahabad students — transparent, auditable,
              and student-first.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2 text-sm">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-slate-400 hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:rounded">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 md:pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-500">
            ResolveX Phase 1 — Visual prototype. No real data is stored or transmitted.
          </p>
          <div className="flex items-center gap-5 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2" aria-label="Contact email">
              <Mail size={16} />
              support@resolx.edu
            </a>
            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
              <span className="text-slate-400">MNNIT Allahabad</span>
              <span className="text-cyan-400">•</span>
              <span className="text-slate-400">India</span>
            </div>
            <div className="flex items-center gap-2">
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors" aria-label="Website">
                <Globe size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}