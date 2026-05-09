'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/page-header';

type Category = {
  id: string;
  name: string;
};

type ProjectInput = {
  title: string;
  description: string;
  categoryId: string;
  date: string;
  thumbnail: string;
  gallery: string;
  videoLink: string;
  projectUrl: string;
  toolsUsed: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  category: Category;
  date: string;
  thumbnail: string;
  gallery: string[];
  videoLink?: string;
  projectUrl?: string;
  toolsUsed: string[];
};

const initialState: ProjectInput = {
  title: '',
  description: '',
  categoryId: '',
  date: new Date().toISOString().split('T')[0],
  thumbnail: '',
  gallery: '',
  videoLink: '',
  projectUrl: '',
  toolsUsed: '',
};

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function ProjectsAdminPage() {
  const [form, setForm] = useState<ProjectInput>(initialState);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const galleryArray = useMemo(
    () =>
      form.gallery
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [form.gallery]
  );

  const toolsArray = useMemo(
    () =>
      form.toolsUsed
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [form.toolsUsed]
  );

  useEffect(() => {
    void refresh();
    void fetchCategories();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
      setError(null);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch {
      setError('Failed to load categories');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description,
      categoryId: form.categoryId,
      date: form.date,
      thumbnail: form.thumbnail,
      gallery: galleryArray,
      videoLink: form.videoLink,
      projectUrl: form.projectUrl,
      toolsUsed: toolsArray,
    };

    try {
      const endpoint = editingId ? `/api/projects/${editingId}` : '/api/projects';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to save project');
      }

      setForm(initialState);
      setEditingId(null);
      setError(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      await refresh();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
      <PageHeader
        moduleName="Content Module"
        title="Projects"
        description="Create and maintain project records here with a familiar form-based workflow that does not require markdown knowledge."
        recordCount={projects.length}
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="mb-5">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Editor</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{editingId ? 'Update project' : 'Create new project'}</h2>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <input className="w-full rounded-xl border px-3 py-3 outline-none" type="text" value={form.title} required onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                <select className="w-full rounded-xl border px-3 py-3 outline-none" required value={form.categoryId} onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
                <input className="w-full rounded-xl border px-3 py-3 outline-none" type="date" required value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Thumbnail URL</label>
                <input className="w-full rounded-xl border px-3 py-3 outline-none" type="text" value={form.thumbnail} onChange={(e) => setForm((s) => ({ ...s, thumbnail: e.target.value }))} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Project Summary</label>
                <p className="mb-2 text-xs text-slate-500">Write this as normal text. You do not need markdown or HTML.</p>
                <textarea className="min-h-[220px] w-full rounded-xl border px-3 py-3 outline-none" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="Describe the project in a clear, reader-friendly way." />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Gallery URLs (comma separated)</label>
                <input className="w-full rounded-xl border px-3 py-3 outline-none" type="text" value={form.gallery} onChange={(e) => setForm((s) => ({ ...s, gallery: e.target.value }))} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Video Link</label>
                  <input className="w-full rounded-xl border px-3 py-3 outline-none" type="text" value={form.videoLink} onChange={(e) => setForm((s) => ({ ...s, videoLink: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Project URL</label>
                  <input className="w-full rounded-xl border px-3 py-3 outline-none" type="text" value={form.projectUrl} onChange={(e) => setForm((s) => ({ ...s, projectUrl: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tools Used (comma separated)</label>
                <input className="w-full rounded-xl border px-3 py-3 outline-none" type="text" value={form.toolsUsed} onChange={(e) => setForm((s) => ({ ...s, toolsUsed: e.target.value }))} />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={loading} className="rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-[0_18px_35px_-22px_rgba(99,102,241,0.65)] transition-all hover:-translate-y-0.5 disabled:opacity-50">
                  {loading ? 'Processing...' : editingId ? 'Update Project' : 'Publish Project'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setForm(initialState); setError(null); }} className="rounded-2xl border border-white/40 bg-white/70 px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur transition-all hover:bg-white">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Library</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Project records</h2>
              </div>
            </div>

            {loading && <p className="text-sm text-slate-500">Loading...</p>}
            {!loading && projects.length === 0 && <p className="text-sm text-slate-500">No projects have been created yet.</p>}

            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="rounded-[1.5rem] border border-white/30 bg-white/55 p-4 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-slate-900">{project.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{project.category.name} • {new Date(project.date).toLocaleDateString('en-US')}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button className="rounded-xl border border-white/30 bg-white/80 px-3 py-2 text-xs font-bold text-amber-700 shadow-sm hover:bg-amber-50" onClick={() => {
                        setEditingId(project.id);
                        setForm({
                          title: project.title || '',
                          description: project.description || '',
                          categoryId: project.category.id,
                          date: project.date.split('T')[0],
                          thumbnail: project.thumbnail || '',
                          gallery: project.gallery.join(', '),
                          videoLink: project.videoLink || '',
                          projectUrl: project.projectUrl || '',
                          toolsUsed: project.toolsUsed.join(', '),
                        });
                      }}>
                        Edit
                      </button>
                      <button className="rounded-xl border border-white/30 bg-white/80 px-3 py-2 text-xs font-bold text-rose-600 shadow-sm hover:bg-rose-50" onClick={() => void handleDelete(project.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{stripHtml(project.description) || 'No description provided.'}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
