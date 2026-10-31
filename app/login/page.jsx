'use client';

import Link from 'next/link';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      router.push('/');
    } catch {
      setError('Unable to sign in. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-navy">
      <Nav />

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Brand lockup */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Shield size={18} />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">Resolve<span className="text-cyan-400">X</span></span>
          </div>
          <p className="text-slate-400 text-sm mb-10 text-center">Sign in to your account</p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

            <form noValidate className="space-y-5" onSubmit={handleSubmit}>
              <FormField
                label="Email address"
  name="email"
                type="email"
                placeholder="name@mnnit.ac.in"
                helper="Use your college email address"
              />
              <FormField label="Password" name="password" type="password" helper="At least 8 characters" />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                  <input type="checkbox" className="rounded border-white/20 text-cyan-500 focus:ring-cyan-500 bg-transparent border" />
                  Remember me
                </label>
                <Link href="#" className="text-sm text-cyan-400 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:rounded">Forgot password?</Link>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                Sign in
              </Button>
              {loading && <span className="sr-only">Signing in...</span>}
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-brand-navy px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" size="md" className="w-full" disabled>
                Google
              </Button>
              <Button variant="outline" size="md" className="w-full" disabled>
                College SSO
              </Button>
            </div>
            <p className="text-sm text-slate-500 text-center">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:rounded">
                Register
              </Link>
            </p>
          </div>
        </main>
    </div>
  );
}