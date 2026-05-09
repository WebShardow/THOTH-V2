'use client';

import { type ChangeEvent, useEffect, useMemo, useState } from 'react';

type ExtensionManifest = {
  id: string;
  name: string;
  version: string;
  apiVersion: string;
  description?: string;
  author?: string;
  capabilities?: string[];
};

type ExtensionState = {
  enabled: boolean;
  installedAt: string;
  updatedAt: string;
  lastValidatedAt: string | null;
};

type ExtensionItem = {
  directoryName: string;
  status: 'ready' | 'invalid';
  errors: string[];
  manifest: ExtensionManifest | null;
  state: ExtensionState | null;
};

type ExtensionsResponse = {
  apiVersion: string;
  installMode: string;
  extensionsDir: string;
  items: ExtensionItem[];
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Operation failed';
}

function formatDate(value?: string | null) {
  if (!value) return 'Not yet';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function ModuleAdmin() {
  const [data, setData] = useState<ExtensionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/modules', { cache: 'no-store' });
      const payload = (await res.json()) as ExtensionsResponse;
      if (!res.ok) throw new Error(payload && 'error' in payload ? String((payload as { error?: string }).error) : 'Failed to fetch extensions');
      setData(payload);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleInstall(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setInstalling(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        body: formData,
      });
      const payload = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(payload.error || 'Install failed');
      setSuccess(payload.message || 'Extension installed successfully.');
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setInstalling(false);
      e.target.value = '';
    }
  }

  async function runAction(id: string, action: 'enable' | 'disable' | 'validate' | 'uninstall') {
    setPendingId(id);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = `/api/admin/modules/${encodeURIComponent(id)}`;
      const res = await fetch(endpoint, action === 'uninstall'
        ? { method: 'DELETE' }
        : {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
          });

      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error || 'Operation failed');

      const labels: Record<typeof action, string> = {
        enable: 'Extension enabled.',
        disable: 'Extension disabled.',
        validate: 'Extension validated.',
        uninstall: 'Extension uninstalled.',
      };

      setSuccess(labels[action]);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  const items = data?.items ?? [];
  const readyCount = useMemo(() => items.filter((item) => item.status === 'ready').length, [items]);
  const enabledCount = useMemo(() => items.filter((item) => item.state?.enabled).length, [items]);
  const canWrite = data?.installMode === 'filesystem-write';

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">System Extensions</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Extensions</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Keep optional capabilities isolated from the framework core. Each package lives in its own runtime directory, has its own manifest, and can be validated or removed without touching the base CMS.
            </p>
          </div>
          <label className={`inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_35px_-22px_rgba(99,102,241,0.65)] transition-all hover:-translate-y-0.5 ${installing || !canWrite ? 'opacity-60' : ''}`}>
            <span>{installing ? 'Installing...' : 'Upload ZIP Package'}</span>
            <span>+</span>
            <input type="file" accept=".zip" onChange={handleInstall} disabled={installing || !canWrite} className="hidden" />
          </label>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[1.25rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Runtime model</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Core stays lean</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                <li>Extensions install into `extensions/`, never into the core `modules/` directory.</li>
                <li>Every package must include `extension.json` and declare a matching API version.</li>
                <li>Lifecycle state is tracked separately, so disable and validate do not mutate framework code.</li>
                <li>Manual filesystem install remains the safest production path for self-hosted users.</li>
              </ul>
            </article>

            <article className="rounded-[1.25rem] border border-white/35 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-slate-100 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.65)]">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300/80">Registry status</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Ready</p>
                  <p className="mt-2 text-3xl font-black text-white">{readyCount}</p>
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Enabled</p>
                  <p className="mt-2 text-3xl font-black text-white">{enabledCount}</p>
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Install mode</p>
                  <p className="mt-2 text-sm font-bold text-slate-100">{data?.installMode ?? 'loading...'}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-300">
                Registry path: <span className="font-mono text-slate-100">{data?.extensionsDir ?? 'loading...'}</span>
              </p>
            </article>
          </section>

          {(error || success) && (
            <div className={`rounded-xl px-5 py-4 text-sm font-bold ${error ? 'border border-rose-200 bg-rose-50 text-rose-700' : 'border border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {error ?? success}
            </div>
          )}

          <section className="rounded-[1.25rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Installed packages</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Extension registry</h2>
              </div>
            </div>

            {loading && <p className="mt-6 text-sm text-slate-500">Loading extensions...</p>}

            {!loading && items.length === 0 && (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white/50 px-4 py-6 text-sm text-slate-500">
                No extensions are installed yet.
              </div>
            )}

            <div className="mt-6 space-y-3">
              {items.map((item) => {
                const id = item.manifest?.id ?? item.directoryName;
                const disabled = pendingId === id;
                const enabled = item.state?.enabled ?? false;

                return (
                  <div key={item.directoryName} className="rounded-[1rem] border border-white/30 bg-white/55 p-4 backdrop-blur">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{item.manifest?.name ?? item.directoryName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.manifest?.id ?? item.directoryName} • v{item.manifest?.version ?? 'unknown'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${item.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {item.status === 'ready' ? 'Ready' : 'Needs attention'}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${enabled ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                          {enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {item.manifest?.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.manifest.description}</p>
                    )}

                    {item.manifest?.capabilities?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.manifest.capabilities.map((capability) => (
                          <span key={capability} className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-bold text-slate-600">
                            {capability}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-3 text-xs text-slate-500 md:grid-cols-3">
                      <div>
                        <p className="font-bold uppercase tracking-[0.18em] text-slate-400">Installed</p>
                        <p className="mt-1 text-sm text-slate-700">{formatDate(item.state?.installedAt)}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-[0.18em] text-slate-400">Updated</p>
                        <p className="mt-1 text-sm text-slate-700">{formatDate(item.state?.updatedAt)}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-[0.18em] text-slate-400">Validated</p>
                        <p className="mt-1 text-sm text-slate-700">{formatDate(item.state?.lastValidatedAt)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={disabled || item.status !== 'ready' || enabled}
                        onClick={() => void runAction(id, 'enable')}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Enable
                      </button>
                      <button
                        type="button"
                        disabled={disabled || item.status !== 'ready' || !enabled}
                        onClick={() => void runAction(id, 'disable')}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Disable
                      </button>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => void runAction(id, 'validate')}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Validate
                      </button>
                      <button
                        type="button"
                        disabled={disabled || !canWrite}
                        onClick={() => void runAction(id, 'uninstall')}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Uninstall
                      </button>
                    </div>

                    {item.errors.length > 0 && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {item.errors.join(' ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
