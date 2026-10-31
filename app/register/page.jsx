'use client';

import Link from 'next/link';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const rollNumber = formData.get('rollNumber');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unable to create account');
        setLoading(false);
        return;
      }

      router.push('/');
    } catch {
      setError('Unable to create account. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-navy">
      <Nav />

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Shield size={18} />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">Resolve<span className="text-cyan-400">X</span></span>
          </div>
          <p className="text-slate-400 text-sm mb-10 text-center">Create your student account</p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

            <form noValidate className="space-y-5" onSubmit={handleSubmit}>
              <FormField label="Full name" name="name" type="text" placeholder="e.g. Aryan Singh" />
              <FormField
                label="College email"
  name="email"
                type="email"
                placeholder="name@mnnit.ac.in"
                helper="Must be an MNNIT Allahabad email address"
              />
              <FormField label="Roll number" name="rollNumber" type="text" placeholder="e.g. 220001" helper="Your official roll number" />
              <FormField label="Password" name="password" type="password" helper="At least 8 characters" />
              <FormField label="Confirm password" name="confirmPassword" type="password" />
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  id="terms"
                  className="mt-0.5 rounded border-white/20 text-cyan-500 focus:ring-cyan-500 bg-transparent border"
                />
                <label htmlFor="terms" className="text-sm text-slate-300 leading-relaxed cursor-pointer select-none">
                  I agree to the{' '}
                  <Link href="#" className="text-cyan-400 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:rounded">terms of use</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-cyan-400 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:rounded">privacy policy</Link>
                </label>
              {loading && <span className="sr-only">Creating account...</span>}
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                Create account
              </Button>
            </form>
            <p className="text-sm text-slate-500 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:rounded">
                Sign in
              </Link>
            </p>
          </div>
        </main>
    </div>
  );
}