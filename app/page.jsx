import Hero from '@/components/Hero';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { FeatureGrid } from '@/components/FeatureCard';
import StoryTrail from '@/components/StoryTrail';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Shield, BarChart3, Users, Lock } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: <Shield size={20} strokeWidth={2} />, label: 'End-to-end encryption' },
  { icon: <BarChart3 size={20} strokeWidth={2} />, label: 'Tamper-evident audit log' },
  { icon: <Users size={20} strokeWidth={2} />, label: 'Role-based access control' },
  { icon: <Lock size={20} strokeWidth={2} />, label: 'College-domain verification' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-navy text-slate-100">
      <Nav />

      <main className="flex-grow">
        <Hero />

        {/* Process section */}
        <section className="py-20 md:py-32 border-y border-white/10 bg-white/5">
          <div className="px-6 md:px-12 max-w-6xl mx-auto">
            <div className="text-center mb-16 md:mb-24 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
                From complaint to resolution
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
                ResolveX follows a clear, predictable lifecycle so every grievance gets attention —
                and every action leaves a trace.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`relative rounded-2xl p-8 border border-white/10 bg-white/5 animate-fade-in`} style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-6 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <span className="text-xl font-bold">{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Step {i + 1}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {i === 0 ? 'Student submits a grievance with category and description.' : i === 1 ? 'Staff reviews, assigns, and tracks ownership.' : 'Resolution with status updates and audit record.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-32">
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16 md:mb-20 animate-fade-in">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-balance">Built for trust</h2>
                <p className="text-slate-400">Four pillars that keep the redressal process honest.</p>
              </div>
            </div>
            <FeatureGrid />
          </div>
        </section>

        {/* StoryTrail */}
        <StoryTrail />

        {/* Trust & security */}
        <section className="py-20 md:py-32 border-y border-white/10 bg-white/5">
          <div className="px-6 md:px-12 max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Security you can verify</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Every action is cryptographically recorded so nothing can be altered or denied.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_ITEMS.map((item, i) => (
                <div key={item.label} className="rounded-xl p-6 border border-white/10 bg-white/8 hover:border-cyan-500/40 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.icon}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32">
          <div className="px-6 md:px-12 max-w-4xl mx-auto">
            <div className="relative rounded-3xl p-10 md:p-16 border border-white/10 bg-gradient-to-br from-brand-indigo/40 to-brand-navy overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mt-32 -mr-32" />
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to make your voice heard?</h2>
                <p className="text-slate-300 mb-8 max-w-lg mx-auto">Register with your college email and submit your first grievance in under two minutes.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register">
                    <Button size="lg">Register as Student</Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" size="lg">Learn more</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}