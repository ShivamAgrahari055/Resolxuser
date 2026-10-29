'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BrandEmblem from '@/components/BrandEmblem';
import { Button } from '@/components/ui/Button';
import { FileText, Search, Filter, ArrowLeft, Clock } from 'lucide-react';

export default function GrievanceList() {
  const router = useRouter();
  const [grievances, setGrievances] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'ESCALATED', label: 'Escalated' },
  ];

  const CATEGORY_OPTIONS = [
    { value: '', label: 'All categories' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'mess', label: 'Mess' },
    { value: 'academics', label: 'Academics' },
    { value: 'facilities', label: 'Facilities' },
    { value: 'other', label: 'Other' },
  ];

  const loadGrievances = (page = 1, searchText = search, status = statusFilter, category = categoryFilter) => {
    const params = new URLSearchParams();
    if (page > 1) params.append('page', page);
    if (searchText) params.append('search', searchText);
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    params.append('limit', 10);

    fetch(`/api/student/grievances?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setGrievances(data.items || []);
        setPagination(data.pagination || null);
      })
      .catch(() => setError('Failed to load grievances. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGrievances(1);
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;
      const bottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 200;
      if (bottom && pagination?.hasNext) {
        setCurrentPage(p => p + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pagination, loading]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (loading && grievances.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-navy">
        <Nav />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-slate-400">Loading your grievances...</div>
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
            <div className="flex items-center gap-3">
              <Link href="/student">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={16} />
                  Back to dashboard
                </Button>
              </Link>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white">My Grievances</h1>
              <p className="text-slate-400 mt-2">Track and manage your submitted grievances.</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10">
              <div className="grid md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Search grievances</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={search}
                      onChange={handleSearch}
                      placeholder="Search by title, description, or category..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-auto px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-auto px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>}

            {grievances.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">No grievances found</h3>
                <p className="text-slate-400 mt-1">Submit your first grievance to get started.</p>
                <Link href="/student/grievances/new">
                  <Button>
                    <FileText size={18} />
                    New Grievance
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {grievances.map((g) => (
                    <Link key={g._id} href={`/student/grievances/${g._id}`}>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-cyan-500/40 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{g.title}</h3>
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{g.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400">{g.category}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                g.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' :
                                g.status === 'ESCALATED' ? 'bg-red-500/10 text-red-400' :
                                g.status === 'ASSIGNED' || g.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400' :
                                'bg-slate-500/10 text-slate-400'
                              }`}>
                                {g.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">
                              <Clock size={14} /> {new Date(g.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-slate-500">Ref #{g._id.slice(0, 8).toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {pagination && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-slate-400">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasPrev}
                        onClick={() => setCurrentPage(p => p - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasNext}
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}