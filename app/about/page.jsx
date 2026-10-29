import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Shield, Mail, Globe, Users, BarChart3 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-navy text-slate-100">
      <Nav />

      <main className="flex-grow">
        {/* Page hero */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 to-brand-navy pointer-events-none" />
          <div className="grain" style={{ opacity: 0.08 }} />
          <div className="relative z-10 px-6 md:px-12 max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-cyan-300 uppercase tracking-wider animate-fade-in">
              <Shield size={14} />
              About ResolveX
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white text-balance mt-6 md:mt-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              A transparent redressal system
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mt-6 md:mt-8 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Built for MNNIT Allahabad students to raise, track, and resolve grievances with
              full accountability and a verifiable audit trail.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-32 border-y border-white/10 bg-white/5">
          <div className="px-6 md:px-12 max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
              <div className="animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why ResolveX exists</h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  College life should be focused on learning — not on chasing down who is
                  responsible for a broken hostel light, a mess issue, or an academic concern.
                  ResolveX gives students a single, trusted channel to raise grievances and
                  holds staff accountable to act on them.
                </p>
                <p className="text-slate-400 leading-relaxed mb-8">
                  Every submission receives a reference ID, a clear owner, and a timestamped
                  history — so progress is visible and nothing falls through the cracks.
                </p>
                <div className="flex gap-4">
                  <Link href="/register"><Button>Get started</Button></Link>
                  <Link href="#" className="text-sm text-cyan-400 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:rounded">Read the policy</Link>
                </div>
              </div>
              <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12 shadow-premium relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -mr-24 -mt-24" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-400 shrink-0">
                        <Shield size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Verified identity</h3>
                        <p className="text-sm text-slate-400">College-domain email registration keeps the community safe.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 shrink-0">
                        <BarChart3 size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Owned workflow</h3>
                        <p className="text-sm text-slate-400">Each grievance has an assigned owner and a status timeline.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-400 shrink-0">
                        <Mail size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Status alerts</h3>
                        <p className="text-sm text-slate-400">Get notified when your grievance moves forward.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-32">
          <div className="px-6 md:px-12 max-w-6xl mx-auto">
            <div className="text-center mb-16 md:mb-20 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our commitments</h2>
              <p className="text-slate-400 max-w-xl mx-auto">What guides everything we build.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Transparency', body: 'Every grievance is traceable from submission to resolution.' },
                { title: 'Accountability', body: 'Staff actions are logged and auditable — no anonymous decisions.' },
                { title: 'Accessibility', body: 'Keyboard-navigable, high-contrast, and mobile-friendly.' },
              ].map((item, i) => (
                <div key={item.title} className="rounded-2xl p-8 border border-white/10 bg-white/5 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}