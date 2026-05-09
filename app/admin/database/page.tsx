'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

type BootstrapStatus = {
  hasDatabaseUrl: boolean;
  canConnect: boolean;
  schemaReady: boolean;
  needsSetup: boolean;
  message: string;
};

export default function DatabaseAdmin() {
  const [status, setStatus] = useState<BootstrapStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchStatus();
  }, []);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch('/api/system/bootstrap', { cache: 'no-store' });
      const payload = (await res.json()) as BootstrapStatus | { error?: string };
      if (!res.ok) throw new Error('error' in payload ? payload.error : 'Failed to inspect bootstrap state');
      setStatus(payload as BootstrapStatus);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    { label: 'DATABASE_URL configured', value: status?.hasDatabaseUrl ?? false },
    { label: 'Database reachable', value: status?.canConnect ?? false },
    { label: 'Schema applied', value: status?.schemaReady ?? false },
    { label: 'Admin setup pending', value: status?.needsSetup ?? false },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">System Bootstrap</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Database and install status</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Database connection details should be configured as deployment environment variables, not written through the admin UI. This screen helps operators understand what is missing during first install.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
              {error}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <article key={card.label} className="rounded-[1.25rem] border border-white/35 bg-white/72 p-5 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">{card.label}</p>
                <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${card.value ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {card.value ? 'Ready' : 'Pending'}
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[1.25rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Current status</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Bootstrap guidance</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {loading ? 'Checking environment and schema status...' : status?.message ?? 'No status available.'}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void fetchStatus()}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                >
                  Refresh status
                </button>
                <Link href="/setup" className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100">
                  Open setup
                </Link>
              </div>
            </article>

            <article className="rounded-[1.25rem] border border-white/35 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-slate-100 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.65)]">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300/80">Standard deployment flow</p>
              <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-300">
                <li>Set `DATABASE_URL` in the host environment.</li>
                <li>Apply the schema with `npx prisma db push` or `npx prisma migrate deploy`.</li>
                <li>Confirm the status on this page.</li>
                <li>Create the first admin account from `/setup`.</li>
              </ol>
              <div className="mt-6 rounded-[1rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm leading-6 text-slate-200">
                  Editing database credentials inside the CMS is intentionally avoided because most production environments expect these values at the host or container layer.
                </p>
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
