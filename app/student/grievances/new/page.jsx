'use client';

import Link from 'next/link';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BrandEmblem from '@/components/BrandEmblem';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/FormField';
import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function NewGrievance() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'hostel',
  });

  const CATEGORIES = [
    { value: 'hostel', label: 'Hostel' },
    { value: 'mess', label: 'Mess' },
    { value: 'academics', label: 'Academics' },
    { value: 'facilities', label: 'Facilities' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const res = await fetch('/api/student/grievances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed to submit grievance. Please try again.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect after a brief delay, or clear on next render
    const timer = setTimeout(() => {
      router.push(`/student/grievances/${data.id}`);
    }, 1500);

    // Store the timer so we can clear it on unmount
    return () => clearTimeout(timer);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-navy">
      <Nav />
      <main className="flex-grow">
        <section className="px-6 md:px-12 py-10 md:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <Link href="/student/grievances">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={16} />
                  Back to grievances
                </Button>
              </Link>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Submit a grievance
              </h1>
              <p className="text-slate-400 mt-2 max-w-xl mx-auto">
                Share your concerns — we record every submission in a tamper-evident audit trail.
              </p>
            </div>

            {success && (
              <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-4 text-sm text-emerald-400">
                <CheckCircle size={18} className="inline mr-2" />
                Your grievance has been submitted. Redirecting you to the details page...
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-4 text-sm text-red-400">
                <AlertCircle size={18} className="inline mr-2" />
                {error}
              </div>
            )}

            <div className="max-w-2xl mx-auto bg-white/5 rounded-2xl border border-white/10 p-8 md:p-10">
              <form noValidate className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    label="Title *"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Wi-Fi outage in Block C"
                    required
                    autoComplete="off"
                  />
                  <FormField
                    label="Category *"
                    name="category"
                    as="select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </FormField>
                </div>

                <FormField
                  label="Description *"
                  name="description"
                  as="textarea"
                  value={formData.description}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Describe the issue in detail — what happened, when, and what you need resolved."
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Grievance'}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}