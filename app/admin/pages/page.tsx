"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RichTextEditor from "@/components/admin/rich-text-editor";

type PageData = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
};

const emptyForm = {
  title: "",
  slug: "",
  content: "",
  isPublished: true,
};

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function PagesAdmin() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPages();
  }, []);

  async function fetchPages() {
    setLoading(true);
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      setPages(data);
      setError(null);
    } catch {
      setError('Failed to load pages');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/pages/${editingId}` : '/api/pages';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      setEditingId(null);
      setFormData(emptyForm);
      await fetchPages();
    } catch {
      setError('Failed to save page');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page?')) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await fetchPages();
    } catch {
      setError('Failed to delete page');
    }
  }

  function startEdit(page: PageData) {
    setEditingId(page.id);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">Content Module</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Pages</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Write and manage document-style content for reusable pages. Authors can format text visually without writing HTML or markdown by hand.
            </p>
          </div>
          <div className="rounded-2xl border border-white/40 bg-white/70 px-5 py-3 text-sm text-slate-600 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)] backdrop-blur">
            Total pages: <span className="font-black text-slate-900">{pages.length}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <section className="rounded-[2rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Editor</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{editingId ? 'Update page' : 'Create new page'}</h2>
              </div>
              <div className="text-sm text-slate-500">Tip: use short slugs and clear page titles.</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Page Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border px-3 py-3 outline-none"
                    placeholder="About, Services, Contact"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Page Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full rounded-xl border px-3 py-3 font-mono outline-none"
                    placeholder="about, services, contact"
                  />
                </div>
              </div>

              <RichTextEditor
                label="Page Content"
                value={formData.content}
                onChange={(content) => setFormData((current) => ({ ...current, content }))}
                placeholder="Write your page content here. You can create headings, paragraphs, bullet lists, quotes, and links just like a normal document editor."
                minHeight={320}
              />

              <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  Publish immediately
                </label>

                <div className="flex items-center gap-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData(emptyForm);
                        setError(null);
                      }}
                      className="rounded-2xl border border-white/40 bg-white/70 px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur transition-all hover:bg-white"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    disabled={saving}
                    className="rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-[0_18px_35px_-22px_rgba(99,102,241,0.65)] transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Page'}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Library</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Page records</h2>
              </div>
            </div>

            {loading && <p className="text-sm text-slate-500">Loading pages...</p>}
            {!loading && pages.length === 0 && <p className="text-sm text-slate-500">No pages created yet.</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {pages.map((page) => (
                <article key={page.id} className="rounded-[1.5rem] border border-white/30 bg-white/55 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/70">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{page.title}</p>
                      <p className="mt-1 text-xs text-slate-500">/{page.slug}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${page.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{stripHtml(page.content) || 'No content yet.'}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/60 pt-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(page)} className="rounded-xl border border-white/30 bg-white/80 px-3 py-2 text-xs font-bold text-amber-700 shadow-sm hover:bg-amber-50">
                        Edit
                      </button>
                      <button onClick={() => void handleDelete(page.id)} className="rounded-xl border border-white/30 bg-white/80 px-3 py-2 text-xs font-bold text-rose-600 shadow-sm hover:bg-rose-50">
                        Delete
                      </button>
                    </div>
                    <Link href={`/${page.slug}`} target="_blank" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                      Open
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
