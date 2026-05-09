"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RichTextEditor from "@/components/admin/rich-text-editor";

type Category = {
  id: string;
  name: string;
};

type PostData = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string;
  category?: Category;
  tags: string[];
  isPublished: boolean;
  featured: boolean;
  createdAt: string;
};

const emptyForm = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImage: "",
  categoryId: "",
  tags: [] as string[],
  isPublished: true,
  featured: false,
};

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function PostsAdmin() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refreshData();
  }, []);

  async function refreshData() {
    setLoading(true);
    try {
      const [postsRes, catsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/categories')
      ]);
      const postsData = await postsRes.json();
      const catsData = await catsRes.json();
      setPosts(postsData);
      setCategories(catsData);
      setError(null);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/posts/${editingId}` : '/api/posts';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save post');
      }

      setEditingId(null);
      setFormData(emptyForm);
      setTagInput("");
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await refreshData();
    } catch {
      setError('Failed to delete post');
    }
  }

  function startEdit(post: PostData) {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || "",
      categoryId: post.categoryId || "",
      tags: post.tags || [],
      isPublished: post.isPublished,
      featured: post.featured,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAddTag() {
    if (!tagInput.trim()) return;
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
    }
    setTagInput("");
  }

  function removeTag(tagToRemove: string) {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-orange-500">Blog Module</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Posts</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Manage blog articles, news, and updates. Posts can be categorized and tagged to help readers find content across your site.
            </p>
          </div>
          <div className="rounded-2xl border border-white/40 bg-white/70 px-5 py-3 text-sm text-slate-600 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)] backdrop-blur">
            Total posts: <span className="font-black text-slate-900">{posts.length}</span>
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
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Article Editor</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{editingId ? 'Update article' : 'Write new article'}</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">Post Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData({ 
                          ...formData, 
                          title, 
                          slug: editingId ? formData.slug : title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      placeholder="The future of headless CMS..."
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">Slug (URL Path)</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 font-mono text-xs outline-none focus:border-orange-400"
                      placeholder="future-of-headless-cms"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-orange-400"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">Cover Image URL</label>
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-orange-400"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Excerpt (Summary)</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  placeholder="A brief summary of the article for list views..."
                />
              </div>

              <RichTextEditor
                label="Article Content"
                value={formData.content}
                onChange={(content) => setFormData((current) => ({ ...current, content }))}
                placeholder="Start writing your amazing article here..."
                minHeight={400}
              />

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 rounded-lg bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-orange-900">✕</button>
                    </span>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="rounded-lg border border-slate-200 bg-white/50 px-3 py-1 text-xs outline-none focus:border-orange-400"
                      placeholder="Add tag..."
                    />
                    <button type="button" onClick={handleAddTag} className="text-xs font-bold text-orange-600">Add</button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-orange-600"
                    />
                    Publish live
                  </label>
                  <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-orange-600"
                    />
                    Featured post
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData(emptyForm);
                        setTagInput("");
                        setError(null);
                      }}
                      className="rounded-2xl border border-white/40 bg-white/70 px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur transition-all hover:bg-white"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    disabled={saving}
                    className="rounded-2xl bg-gradient-to-r from-orange-400 via-red-500 to-rose-600 px-8 py-3 text-sm font-bold text-white shadow-[0_18px_35px_-22px_rgba(249,115,22,0.65)] transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Post' : 'Publish Article'}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/35 bg-white/72 p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Library</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Article list</h2>
              </div>
            </div>

            {loading && <p className="text-sm text-slate-500">Loading articles...</p>}
            {!loading && posts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/40 p-10 text-center text-sm text-slate-400">
                No articles found in the database.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="group relative flex flex-col rounded-[1.5rem] border border-white/30 bg-white/55 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {post.category && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{post.category.name}</span>
                        )}
                        {post.featured && (
                          <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-orange-600">Featured</span>
                        )}
                      </div>
                      <p className="mt-1 font-bold leading-tight text-slate-900 line-clamp-1">{post.title}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-400">/{post.slug}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${post.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {post.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  {post.coverImage && (
                    <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                      <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600">{post.excerpt || stripHtml(post.content)}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="rounded-md border border-slate-100 bg-white/50 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">#{tag}</span>
                    ))}
                    {post.tags.length > 3 && <span className="text-[9px] text-slate-400">+{post.tags.length - 3}</span>}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200/60 pt-4 mt-5">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(post)} className="rounded-xl border border-white/30 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-orange-50 hover:text-orange-700">
                        Edit
                      </button>
                      <button onClick={() => void handleDelete(post.id)} className="rounded-xl border border-white/30 bg-white/80 px-3 py-2 text-xs font-bold text-rose-600 shadow-sm hover:bg-rose-50">
                        Delete
                      </button>
                    </div>
                    <Link href={`/blog/${post.slug}`} target="_blank" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                      View
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
