'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useNavigate } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Shield, ArrowLeft, ArrowRight, Filter, Search, Loader2 } from 'lucide-react';

export default function StaffGrievancesList() {
  const router = useRouter();
  const sp = useSearchParams();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    Promise.all([fetch('/api/auth/session').then(r=>r.json()), fetch('/api/staff/grievances?' + sp.toString()).then(r=>r.json())])
      .then(([s,g]) => { if(!s.authenticated||s.user?.role!=='STAFF'){router.push('/login');return;} setUser(s.user); if(g.error)setError(g.error);else setGrievances(g.items); })
      .catch(()=>setError('Unable to load.'))
      .finally(()=>setLoading(false));
  }, [sp.toString(), router]);

  if(loading)return<div className="min-h-screen flex items-center justify-center bg-brand-navy text-slate-400">Loading...</div>;
  if(error)return<div className="min-h-screen flex items-center justify-center bg-brand-navy text-red-400">{error}</div>;

  return(
    <div className="min-h-screen flex flex-col bg-brand-navy">
      <Nav />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div><span className="px-3 py-1 text-xs font-semibold text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 rounded-full inline-flex items-center gap-1.5 mb-2"><Shield size={14} /> Grievance Queue</span><h1 className="text-3xl font-bold text-white">Grievance Queue</h1></div>
            <div><Link href="/staff"><Button variant="outline" size="lg"><ArrowLeft size={18} /> Back</Button></Link></div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div><Input placeholder="Search..." className="w-full rounded-md border border-white/30 bg-white/5 px-3 py-2 text-sm" /></div>
              <div>
                <select className="w-full rounded-md border border-white/30 bg-white/5 px-3 py-2 text-sm">
                  <option value="">Status</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
              <div>
                <select className="w-full rounded-md border border-white/30 bg-white/5 px-3 py-2 text-sm">
                  <option value="">Category</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
              <div>
                <select className="w-full rounded-md border border-white/30 bg-white/5 px-3 py-2 text-sm">
                  <option value="">Assignment</option>
                  <option value="me">Assigned to Me</option>
                </select>
              </div>
              <div></div>
            </div>
          </div>
          {(!grievances||grievances.length===0)?<div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-slate-400">No grievances found.</div>:<div className="space-y-3">{grievances.map((g)=><Link key={g.id} href={`/staff/grievances/${g.id}`} className="block rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-4 group"><div className="flex flex-col md:flex-row md:items-center justify-between gap-3"><div className="space-y-1"><span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{g.status}</span><h3 className="text-lg font-semibold text-white group-hover:text-cyan-400">{g.title}</h3></div><div className="flex items-center gap-3 text-sm text-slate-400"><span>Student: {g.student?.name||'Unknown'}</span><ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400" /></div></div></Link>)}</div>}
          <div className="mt-8 pt-8 border-t border-white/10 text-sm text-slate-400">Loading pagination...</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
