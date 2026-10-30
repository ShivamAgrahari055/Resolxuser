'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Button ,Input} from '@/components/ui/Button';
import { Shield, ArrowRight } from 'lucide-react';

export default function StaffGrievanceDetails() {
  const router = useRouter();
  const sp = useSearchParams();
  const { id } = sp;
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/session').then((r) => r.json()),
      fetch('/api/staff/grievances/' + id).then((r) => r.json()),
    ])
      .then(([s, g]) => {
        if (!s.authenticated || s.user?.role !== 'STAFF') { router.push('/login'); return; }
        setUser(s.user);
        if (g.error) { setError(g.error); }
        else { setGrievance(g.grievance); setStatus(g.grievance?.status || ''); }
      })
      .catch(() => setError('Unable to load.'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-navy text-slate-400">Loading grievance...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-brand-navy text-red-400">{error}</div>;
  if (!grievance) return <div className="min-h-screen flex items-center justify-center bg-brand-navy text-red-404">Grievance not found.</div>;

  const statusMap = {
    SUBMITTED: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    UNDER_REVIEW: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    ASSIGNED: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    RESOLVED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    ESCALATED: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-navy">
      <Nav />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h1 className="text-2xl font-bold text-white">{grievance.title}</h1>
            <p className="text-slate-400 mt-1">#{grievance.id}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div><span className="text-xs uppercase tracking-wider text-slate-400">Status</span><span className="text-sm font-medium {statusMap[grievance.status || '']} rounded px-2 py-0.5>{grievance.status?.replace('_', ' ') || ''}</span></div>
              <div><span className="text-xs uppercase tracking-wider text-slate-400">Category</span><span className="text-sm text-slate-300">{grievance?.category || ''}</span></div>
              <div><span className="text-xs uppercase tracking-wider text-slate-400">Assigned</span><span className="text-sm font-medium text-slate-300">{grievance.assignedTo ? grievance.assignedTo.name : 'Unassigned'}</span></div>
              <div><span className="text-xs uppercase tracking-wider text-slate-400">Student</span><span className="text-sm font-medium text-slate-300">{grievance.student?.name || 'Unknown'}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><span className="text-xs uppercase tracking-wider text-slate-400">Submitted</span><span className="text-sm text-slate-300">{grievance.createdAt ? grievance.createdAt.toLocaleDateString() : 'N/A'}</span></div>
              <div><span className="text-xs uppercase tracking-wider text-slate-400">Version</span><span className="text-sm text-slate-300">{grievance.version || 1}</span></div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <h2 className="text-semibold text-white mb-3">Activity Timeline</h2>
              <p className="text-sm text-slate-400 mb-3">Audit events</p>
              <div className="space-y-2" style={{ maxHeight: '180px', overflow: 'auto' }}>
                <div className="p-3 rounded-md border border-white/10 text-xs text-slate-400">No audit events loaded</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}