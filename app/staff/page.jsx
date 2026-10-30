'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { FileText, Shield, ArrowRight, UserCheck } from 'lucide-react';

export default function StaffDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    Promise.all([fetch('/api/auth/session').then(r=>r.json()), fetch('/api/staff/grievances?limit=5').then(r=>r.json())])
      .then(([s,g]) => { if(!s.authenticated||s.user?.role!=='STAFF'){router.push('/login');return;} setUser(s.user); if(g.error)setError(g.error);else setData(g); })
      .catch(()=>setError('Unable to load dashboard.'))
      .finally(()=>setLoading(false));
  }, [router]);

  if(loading)return<div className="min-h-screen flex items-center justify-center bg-brand-navy text-slate-400">Loading...</div>;
  if(error)return<div className="min-h-screen flex items-center justify-center bg-brand-navy text-red-400">{error}</div>;

  const s=data?.stats||{grandTotal:0,submitted:0,underReview:0,assigned:0,inProgress:0,resolved:0,escalated:0,unassigned:0};

  return(
    <div className="min-h-screen flex flex-col bg-brand-navy">
      <Nav />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div><span className="px-3 py-1 text-xs font-semibold text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 rounded-full inline-flex items-center gap-1.5 mb-2"><Shield size={14} /> Staff Portal</span><h1 className="text-3xl font-bold text-white">Redressal Control Center</h1><p className="text-slate-400 mt-1">Welcome back, <span className="text-cyan-400 font-medium">{user?.name}</span>.</p></div>
            <div className="flex gap-3"><Link href="/staff/grievances"><Button size="lg"><FileText size={18} /> Queue</Button></Link><Link href="/staff/grievances?assigned=unassigned"><Button variant="outline" size="lg"><UserCheck size={18} /> Unassigned ({s.unassigned})</Button></Link></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><span className="text-xs uppercase text-slate-400">Total</span><p className="text-3xl font-bold text-white mt-1">{s.grandTotal}</p></div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"><span className="text-xs uppercase text-amber-400">Pending</span><p className="text-3xl font-bold text-amber-300 mt-1">{s.submitted+s.underReview}</p></div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5"><span className="text-xs uppercase text-cyan-400">Active</span><p className="text-3xl font-bold text-cyan-300 mt-1">{s.assigned+s.inProgress}</p></div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5"><span className="text-xs uppercase text-red-400">Escalated</span><p className="text-3xl font-bold text-red-300 mt-1">{s.escalated}</p></div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 col-span-2 md:col-span-1"><span className="text-xs uppercase text-emerald-400">Resolved</span><p className="text-3xl font-bold text-emerald-300 mt-1">{s.resolved}</p></div>
          </div>
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-white">Recent Submissions</h2><Link href="/staff/grievances" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">View Queue <ArrowRight size={16} /></Link></div>
            {(!data?.items||data.items.length===0)?<div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-slate-400">No grievances yet.</div>:<div className="space-y-3">{data.items.map((i)=><Link key={i.id} href={`/staff/grievances/${i.id}`} className="block rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-5 group"><div className="space-y-1"><span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{i.status}</span><h3 className="text-lg font-semibold text-white group-hover:text-cyan-400">{i.title}</h3></div><div className="flex items-center gap-4 text-sm text-slate-400"><span>Student: {i.student?.name||'Unknown'}</span><ArrowRight size={18} className="text-slate-500 group-hover:text-cyan-400" /></div></Link>)}</div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}