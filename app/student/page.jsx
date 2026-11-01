'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BrandEmblem from '@/components/BrandEmblem';
import { Button } from '@/components/ui/Button';
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [grievanceItems, setGrievanceItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const [sessionRes, notificationsRes, grievancesRes] = await Promise.allSettled([
          fetch('/api/auth/session', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/student/notifications?limit=5', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/student/grievances?limit=5', { credentials: 'include' }).then(r => r.json()),
        ]);

        const session = sessionRes.status === 'fulfilled' ? sessionRes.value : null;
        const notifications = notificationsRes.status === 'fulfilled' ? notificationsRes.value : { items: [] };
        const grievances = grievancesRes.status === 'fulfilled' ? grievancesRes.value : { items: [], pagination: {} };

        if (!session || !session.authenticated) {
          router.push('/login');
          return;
        }

        setStats(grievances.pagination);
        setGrievanceItems(grievances.items || []);
        setNotifications(notifications.items || []);
      } catch {
        setError('Unable to load dashboard. Please refresh and try again.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-navy">
        <Nav />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-slate-400">Loading your dashboard...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-navy">
        <Nav />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-400">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-navy">
      <Nav />
      <main className="flex-grow">
        <section className="px-6 md:px-12 py-10 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Welcome back, <span className="text-cyan-400">{stats?.user?.name || 'Student'}</span>
                </h1>
                <p className="text-slate-400 mt-2">
                  You have <span className="text-cyan-400 font-medium">{stats?.total || 0}</span> open grievance(s).
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/student/grievances/new">
                  <Button size="lg">
                    <FileText size={18} />
                    New Grievance
                  </Button>
                </Link>
                <Link href="/student/grievances">
                  <Button variant="outline" size="lg">
                    <Eye size={18} />
                    View All
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-12 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <span className="text-sm text-slate-400 uppercase tracking-wider">Total</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                  <span className="text-sm text-slate-400 uppercase tracking-wider">In Progress</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {grievanceItems.filter(i => i.status !== 'RESOLVED').length || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <span className="text-sm text-slate-400 uppercase tracking-wider">Resolved</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {grievanceItems.filter(i => i.status === 'RESOLVED').length || 0}
                </p>
              </div>
            </div>
          </div>
        </section>

        {unreadCount > 0 && (
          <section className="px-6 md:px-12 py-8 md:py-12 border-y border-white/10 bg-white/5">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
                <span className="text-sm font-medium text-amber-400">{unreadCount} unread notification(s)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n._id} className={`rounded-xl border p-4 ${n.read ? 'border-white/10 bg-white/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{n.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{n.body}</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${n.read ? 'bg-white/5 text-slate-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {n.read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}