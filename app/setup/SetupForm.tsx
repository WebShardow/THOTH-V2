'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type BootstrapStatus = {
  hasDatabaseUrl: boolean;
  canConnect: boolean;
  schemaReady: boolean;
  needsSetup: boolean;
  message: string;
};

export default function SetupForm({ bootstrap }: { bootstrap: BootstrapStatus }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const readyForSetup = bootstrap.hasDatabaseUrl && bootstrap.canConnect && bootstrap.schemaReady;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!readyForSetup) {
      setError('Database is not ready yet. Please complete the bootstrap steps below first.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      router.push('/admin/change-password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center py-10">
        <div className="grid w-full gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Bootstrap status</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Initial Setup</h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The CMS should be installable even before the database is fully prepared. This page tells operators exactly what is missing instead of crashing during the first deployment.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                { label: 'DATABASE_URL configured', value: bootstrap.hasDatabaseUrl },
                { label: 'Database reachable', value: bootstrap.canConnect },
                { label: 'Schema applied', value: bootstrap.schemaReady },
                { label: 'Admin account required', value: bootstrap.needsSetup },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-sm font-bold text-slate-200">{item.label}</span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${item.value ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {item.value ? 'ready' : 'pending'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 text-sm leading-6 text-cyan-100">
              {bootstrap.message}
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p className="font-bold uppercase tracking-[0.2em] text-slate-400">Standard install flow</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Set `DATABASE_URL` in the hosting environment.</li>
                <li>Run `npx prisma db push` or `npx prisma migrate deploy`.</li>
                <li>Refresh this page.</li>
                <li>Create the first admin account.</li>
              </ol>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-black text-white">Create the first administrator</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              This account is only available when the database connection and schema are ready.
            </p>

            {error && (
              <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Username</label>
                <input
                  id="setup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superadmin"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                  minLength={3}
                  autoComplete="username"
                  disabled={!readyForSetup || loading}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Email (for verification)</label>
                <input
                  id="setup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                  autoComplete="email"
                  disabled={!readyForSetup || loading}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
                <input
                  id="setup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={!readyForSetup || loading}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Confirm password</label>
                <input
                  id="setup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Type the password again"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={!readyForSetup || loading}
                />
              </div>

              <button
                id="setup-submit"
                type="submit"
                disabled={loading || !readyForSetup}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create admin account'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
