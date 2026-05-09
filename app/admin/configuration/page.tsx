'use client';

import { type FormEvent, useEffect, useState } from 'react';
import PageHeader from '@/components/admin/page-header';

type SiteConfig = {
  id: string;
  siteName: string;
  domain: string;
  language: string;
  timezone: string;
  footerCopyright: string;
  discordUrl: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  privacyUrl: string;
  termsUrl: string;
  cookiePolicyUrl: string;
};

const initialState: Omit<SiteConfig, 'id'> = {
  siteName: '',
  domain: '',
  language: '',
  timezone: '',
  footerCopyright: '',
  discordUrl: '',
  githubUrl: '',
  twitterUrl: '',
  linkedinUrl: '',
  privacyUrl: '',
  termsUrl: '',
  cookiePolicyUrl: '',
};

export default function ConfigurationPage() {
  const [form, setForm] = useState<Omit<SiteConfig, 'id'>>(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    try {
      const res = await fetch('/api/site-config');
      const data = await res.json();
      setForm({
        siteName: data.siteName || '',
        domain: data.domain || '',
        language: data.language || '',
        timezone: data.timezone || '',
        footerCopyright: data.footerCopyright || '',
        discordUrl: data.discordUrl || '',
        githubUrl: data.githubUrl || '',
        twitterUrl: data.twitterUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        privacyUrl: data.privacyUrl || '',
        termsUrl: data.termsUrl || '',
        cookiePolicyUrl: data.cookiePolicyUrl || '',
      });
      setError(null);
    } catch {
      setError('ไม่สามารถโหลดการตั้งค่าได้');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSuccess(null);

    try {
      const res = await fetch('/api/site-config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'เกิดข้อผิดพลาด');
      }

      setSuccess('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        moduleName="Configuration"
        title="Website Settings"
        description="ตั้งค่ามาตรฐานของเว็บไซต์"
        recordCount="System Configuration"
      />

      {/* Alerts */}
      {(error || success) && (
        <div className="shrink-0 border-b border-white/30 px-8 py-3 bg-gradient-to-b from-white/10 to-transparent">
          {error && (
            <div className="rounded-xl border border-red-300/50 bg-red-50/80 backdrop-blur-sm px-4 py-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-300/50 bg-emerald-50/80 backdrop-blur-sm px-4 py-3 text-sm text-emerald-700">
              ✅ {success}
            </div>
          )}
        </div>
      )}

      {/* Main Content - Scrollable */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-8 py-6">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
              <p className="text-sm text-slate-500">Loading configuration...</p>
            </div>
          </div>
        ) : (
          <section className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-8 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)] max-w-2xl">
            <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-indigo-600">General Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">ชื่อเว็บไซต์</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              type="text"
              value={form.siteName || ''}
              required
              onChange={(e) => setForm((s) => ({ ...s, siteName: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">โดเมน</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              type="text"
              value={form.domain || ''}
              placeholder="example.com"
              onChange={(e) => setForm((s) => ({ ...s, domain: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">ภาษา</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={form.language || ''}
                onChange={(e) => setForm((s) => ({ ...s, language: e.target.value }))}
              >
                <option value="th">ไทย (th)</option>
                <option value="en">English (en)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">เขตเวลา</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                type="text"
                value={form.timezone || ''}
                placeholder="Asia/Bangkok"
                onChange={(e) => setForm((s) => ({ ...s, timezone: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Copyright Footer</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              type="text"
              value={form.footerCopyright || ''}
              placeholder="© 2024 Your Site"
              onChange={(e) => setForm((s) => ({ ...s, footerCopyright: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Privacy Policy URL</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                type="text"
                value={form.privacyUrl || ''}
                placeholder="/p/privacy"
                onChange={(e) => setForm((s) => ({ ...s, privacyUrl: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Terms of Service URL</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                type="text"
                value={form.termsUrl || ''}
                placeholder="/p/terms"
                onChange={(e) => setForm((s) => ({ ...s, termsUrl: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Cookie Policy URL</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                type="text"
                value={form.cookiePolicyUrl || ''}
                placeholder="/p/cookie-policy"
                onChange={(e) => setForm((s) => ({ ...s, cookiePolicyUrl: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">GitHub URL</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                type="text"
                value={form.githubUrl || ''}
                placeholder="https://github.com/..."
                onChange={(e) => setForm((s) => ({ ...s, githubUrl: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Twitter (X) URL</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                type="text"
                value={form.twitterUrl || ''}
                placeholder="https://twitter.com/..."
                onChange={(e) => setForm((s) => ({ ...s, twitterUrl: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">LinkedIn URL</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              type="text"
              value={form.linkedinUrl || ''}
              placeholder="https://linkedin.com/in/..."
              onChange={(e) => setForm((s) => ({ ...s, linkedinUrl: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Discord URL (Community)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              type="text"
              value={form.discordUrl || ''}
              placeholder="https://discord.gg/..."
              onChange={(e) => setForm((s) => ({ ...s, discordUrl: e.target.value }))}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-sm uppercase tracking-wider"
            >
              {saving ? 'บันทึกการตั้งค่า...' : 'บันทึกการตั้งค่าทั้งหมด'}
            </button>
          </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}