'use client';

import Link from 'next/link';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams, useSearchParams } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BrandEmblem from '@/components/BrandEmblem';
import { Button } from '@/components/ui/Button';
import { FileText, Clock, User, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function GrievanceDetail() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grievance, setGrievance] = useState(null);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      setGrievance(null);

      try {
        const [gRes, nRes] = await Promise.all([
          fetch(`/api/student/grievances/${params.id}`, { credentials: 'include' }),
          fetch(`/api/student/notifications?limit=10`, { credentials: 'include' }),
        ]);

        if (!gRes.ok) {
          if (gRes.status === 404) {
            setError('Grievance not found or you do not have access to it.');
          } else {
            setError('Failed to load grievance.');
          }
          setLoading(false);
          return;
        }

        const [gData, nData] = await Promise.all([gRes.json(), nRes.json()]);
        if (!cancelled) {
          setGrievance(gData);
          setNotifications(nData.items || []);
          setActivity(gData.activity || []);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load grievance. Please try again.');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [params.id]);

  if (loading && !grievance) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-navy">
        <Nav />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-slate-400">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !grievance) {
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

  if (!grievance) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-navy">
        <Nav />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white">Grievance not found</h2>
            <p className="text-slate-400 mt-2">This grievance may have been deleted, or you do not have access to it.</p>
            <Button onClick={() => router.push('/student/grievances')}>
              <ArrowLeft size={16} />
              Back to all grievances
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusConfig = {
    SUBMITTED: { label: 'Submitted', color: 'text-slate-400', badge: 'bg-slate-500/10' },
    UNDER_REVIEW: { label: 'Under Review', color: 'text-indigo-400', badge: 'bg-indigo-500/10' },
    ASSIGNED: { label: 'Assigned', color: 'text-indigo-400', badge: 'bg-indigo-500/10' },
    IN_PROGRESS: { label: 'In Progress', color: 'text-cyan-400', badge: 'bg-cyan-500/10' },
    RESOLVED: { label: 'Resolved', color: 'text-emerald-400', badge: 'bg-emerald-500/10' },
    ESCALATED: { label: 'Escalated', color: 'text-red-400', badge: 'bg-red-500/10' },
  };

  const status = statusConfig[grievance.status] || { label: grievance.status, color: 'text-slate-400', badge: 'bg-slate-500/10' };

  return (
    <div className="min-h-screen flex flex-col bg-brand-navy">
      <Nav />
      <main className="flex-grow">
        <section className="px-6 md:px-12 py-10 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Link href="/student/grievances">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={16} />
                  Back to grievances
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${status.badge}`}>
                    {status.label}
                  </span>
                  <h1 className="text-3xl font-bold text-white mt-3">{grievance.title}</h1>
                  <p className="text-slate-400 mt-2">{grievance.description}</p>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <span className="flex items-center gap-2 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      {grievance.category}
                    </span>
                    <span className="flex items-center gap-2 text-slate-400">
                      <User size={14} />
                      Student ID: {grievance.studentId?.slice(0, 8)}
                    </span>
                    <span className="flex items-center gap-2 text-slate-400">
                      <Clock size={14} />
                      Submitted {new Date(grievance.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">Activity Timeline</h2>
                {activity.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p>No activity recorded yet.</p>
                  </div>
                ) : (
                  <div className="relative max-w-3xl mx-auto">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
                    <div className="space-y-6">
                      {activity.map((event, i) => (
                        <div key={event._id || i} className="relative flex gap-4 pl-12 pb-6">
                          <div className={`absolute left-0 top-2 w-4 h-4 rounded-full border-2 ${
                            event.eventType === 'status_changed' ? 'bg-cyan-400 border-cyan-400' :
                            'bg-white border-white'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-white text-sm">{event.eventType}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {event.eventType === 'status_changed' ? `Status changed from ${event.statusFrom} to ${event.statusTo}` :
                               `Actor: ${event.actorId} (${event.actorRole})`}
                              {' '}
                              <span className="text-xs">{new Date(event.timestamp).toLocaleString()}</span>
                            </p>
                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <p className="text-xs text-slate-500 mt-1">
                                {JSON.stringify(event.metadata).slice(0, 100)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}