'use client';

import { useEffect, useState } from 'react';

type AutomationConfig = {
  provider: string;
  apiKeyConfigured: boolean;
};

type CampaignRun = {
  id: string;
  status: string;
  slug: string | null;
  error: string | null;
  ranAt: string;
};

type Campaign = {
  id: string;
  name: string;
  topic: string;
  systemPrompt: string;
  slugPrefix: string;
  model: string;
  timezone: string;
  scheduleTime: string;
  publishAsPublished: boolean;
  isEnabled: boolean;
  nextRunAt: string | null;
  lastResult: string | null;
  runs: CampaignRun[];
};

const initialCampaign = {
  name: '',
  topic: '',
  systemPrompt: '',
  slugPrefix: 'daily-post',
  model: 'gemini-2.5-flash',
  timezone: 'Asia/Bangkok',
  scheduleTime: '09:00',
  publishAsPublished: false,
  isEnabled: true,
};

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function AutomationPage() {
  const [config, setConfig] = useState<AutomationConfig | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [form, setForm] = useState(initialCampaign);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const [configRes, campaignsRes] = await Promise.all([
        fetch('/api/admin/automation/config', { cache: 'no-store' }),
        fetch('/api/admin/automation/campaigns', { cache: 'no-store' }),
      ]);
      const configPayload = await configRes.json();
      const campaignPayload = await campaignsRes.json();
      if (!configRes.ok) throw new Error(configPayload.error || 'Failed to load automation config');
      if (!campaignsRes.ok) throw new Error(campaignPayload.error || 'Failed to load campaigns');
      setConfig(configPayload);
      setCampaigns(campaignPayload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automation');
    } finally {
      setLoading(false);
    }
  }

  async function saveApiKey() {
    setSavingKey(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/automation/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to save API key');
      setMessage('AI Studio key saved successfully.');
      setApiKey('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setSavingKey(false);
    }
  }

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/automation/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to create campaign');
      setMessage('Campaign created successfully.');
      setForm(initialCampaign);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleCampaign(campaign: Campaign) {
    setBusyId(campaign.id);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/automation/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...campaign, isEnabled: !campaign.isEnabled }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to update campaign');
      setMessage('Campaign updated.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
    } finally {
      setBusyId(null);
    }
  }

  async function runNow(id: string) {
    setBusyId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/automation/campaigns/${id}/run`, { method: 'POST' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to run campaign');
      setMessage(`Generated page /${payload.page.slug}`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run campaign');
    } finally {
      setBusyId(null);
    }
  }

  async function removeCampaign(id: string) {
    if (!confirm('Delete this campaign?')) return;
    setBusyId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/automation/campaigns/${id}`, { method: 'DELETE' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to delete campaign');
      setMessage('Campaign deleted.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">Automation</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">AI Auto Post</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Store the user's AI Studio key, define evergreen topics, and let the CMS create new page entries on a daily schedule without hardwiring frontend logic into the core.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          {(error || message) && (
            <div className={`rounded-xl px-5 py-4 text-sm font-bold ${error ? 'border border-rose-200 bg-rose-50 text-rose-700' : 'border border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {error ?? message}
            </div>
          )}

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[1.25rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Provider setup</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Google AI Studio key</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                The key is encrypted before it is stored. The CMS only uses it when generating content from your scheduled campaigns.
              </p>
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Status: <span className="font-bold text-slate-900">{loading ? 'Loading...' : config?.apiKeyConfigured ? 'Configured' : 'Not configured'}</span>
              </div>
              <div className="mt-4 space-y-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste the user's AI Studio API key"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300"
                />
                <button
                  type="button"
                  onClick={() => void saveApiKey()}
                  disabled={savingKey || !apiKey.trim()}
                  className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {savingKey ? 'Saving...' : 'Save AI key'}
                </button>
              </div>
            </article>

            <article className="rounded-[1.25rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Create campaign</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Daily content rule</h2>
              <form onSubmit={createCampaign} className="mt-5 grid gap-4 md:grid-cols-2">
                <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300" placeholder="Campaign name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300" placeholder="Slug prefix" value={form.slugPrefix} onChange={(e) => setForm((s) => ({ ...s, slugPrefix: e.target.value }))} />
                <input className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300" placeholder="Topic or editorial theme" value={form.topic} onChange={(e) => setForm((s) => ({ ...s, topic: e.target.value }))} />
                <textarea className="md:col-span-2 min-h-32 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300" placeholder="Optional system prompt or writing guidance" value={form.systemPrompt} onChange={(e) => setForm((s) => ({ ...s, systemPrompt: e.target.value }))} />
                <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300" placeholder="Model" value={form.model} onChange={(e) => setForm((s) => ({ ...s, model: e.target.value }))} />
                <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300" placeholder="Timezone" value={form.timezone} onChange={(e) => setForm((s) => ({ ...s, timezone: e.target.value }))} />
                <input type="time" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300" value={form.scheduleTime} onChange={(e) => setForm((s) => ({ ...s, scheduleTime: e.target.value }))} />
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={form.publishAsPublished} onChange={(e) => setForm((s) => ({ ...s, publishAsPublished: e.target.checked }))} />
                  Publish generated pages immediately
                </label>
                <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={form.isEnabled} onChange={(e) => setForm((s) => ({ ...s, isEnabled: e.target.checked }))} />
                  Enable this campaign after saving
                </label>
                <button type="submit" disabled={submitting} className="md:col-span-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60">
                  {submitting ? 'Creating...' : 'Create campaign'}
                </button>
              </form>
            </article>
          </section>

          <section className="rounded-[1.25rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Campaigns</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Automation queue</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {campaigns.length === 0 && !loading && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 px-4 py-6 text-sm text-slate-500">
                  No automation campaigns yet.
                </div>
              )}

              {campaigns.map((campaign) => (
                <article key={campaign.id} className="rounded-[1rem] border border-white/30 bg-white/55 p-5 backdrop-blur">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">{campaign.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{campaign.topic}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${campaign.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {campaign.isEnabled ? 'Enabled' : 'Paused'}
                      </span>
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-700">{campaign.model}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <div>
                      <p className="font-bold text-slate-900">Next run</p>
                      <p>{formatDate(campaign.nextRunAt)}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Target slug prefix</p>
                      <p>{campaign.slugPrefix}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Schedule</p>
                      <p>Daily at {campaign.scheduleTime} ({campaign.timezone})</p>
                    </div>
                  </div>

                  {campaign.lastResult && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      {campaign.lastResult}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => void runNow(campaign.id)} disabled={busyId === campaign.id} className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60">Run now</button>
                    <button type="button" onClick={() => void toggleCampaign(campaign)} disabled={busyId === campaign.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60">{campaign.isEnabled ? 'Pause' : 'Enable'}</button>
                    <button type="button" onClick={() => void removeCampaign(campaign.id)} disabled={busyId === campaign.id} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">Delete</button>
                  </div>

                  {campaign.runs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {campaign.runs.map((run) => (
                        <div key={run.id} className="rounded-lg border border-slate-200 bg-white/70 px-3 py-3 text-xs text-slate-600">
                          <span className="font-bold text-slate-900">{run.status}</span> · {formatDate(run.ranAt)} {run.slug ? `· /${run.slug}` : ''} {run.error ? `· ${run.error}` : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
