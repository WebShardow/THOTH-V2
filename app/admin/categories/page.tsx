'use client';

import { type FormEvent, useEffect, useState } from 'react';
import PageHeader from '@/components/admin/page-header';

type Category = {
  id: string;
  name: string;
  _count?: { projects: number };
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setFetching(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch {
      setError('ไม่สามารถโหลดหมวดหมู่ได้');
    } finally {
      setFetching(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (!res.ok) throw new Error('ไม่สามารถสร้างหมวดหมู่ได้');
      setNewCategoryName('');
      showSuccess('เพิ่มหมวดหมู่สำเร็จ');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCategory.name.trim() }),
      });
      if (!res.ok) throw new Error('ไม่สามารถอัปเดตหมวดหมู่ได้');
      setEditingCategory(null);
      showSuccess('อัปเดตหมวดหมู่สำเร็จ');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`ต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('ไม่สามารถลบหมวดหมู่ได้');
      showSuccess('ลบหมวดหมู่สำเร็จ');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        moduleName="Content"
        title="Category Management"
        description="เพิ่ม แก้ไข หรือลบหมวดหมู่ผลงาน"
        recordCount={categories.length}
      />

      {/* Alerts */}
      {(error || successMsg) && (
        <div className="shrink-0 border-b border-white/30 px-8 py-3 bg-gradient-to-b from-white/10 to-transparent">
          {error && (
            <div className="rounded-xl border border-red-300/50 bg-red-50/80 backdrop-blur-sm px-4 py-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl border border-emerald-300/50 bg-emerald-50/80 backdrop-blur-sm px-4 py-3 text-sm text-emerald-700">
              ✅ {successMsg}
            </div>
          )}
        </div>
      )}

      {/* Main Content - Scrollable */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-8 py-6">
        {fetching ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
              <p className="text-sm text-slate-500">Loading categories...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add Category Card */}
            <section className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-8 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)]">
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-indigo-600">Add New Category</h3>
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="ชื่อหมวดหมู่ใหม่..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
              <button type="submit" disabled={loading} className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-lg shadow-emerald-100">+ ADD</button>
            </form>
          </section>

            {/* Category Tree List */}
            <section className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)] overflow-hidden h-fit">
              <div className="flex items-center justify-between px-8 py-4 border-b border-white/40 bg-gradient-to-r from-white/10 to-transparent">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">All Categories</h3>
              <span className="rounded-full bg-white border px-3 py-0.5 text-[10px] font-black text-slate-400 tracking-widest">{categories.length} CATEGORIES</span>
            </div>

            {fetching ? (
              <div className="flex items-center gap-2 py-10 justify-center text-sm text-slate-400">⏳ กำลังโหลด...</div>
            ) : categories.length === 0 ? (
              <div className="py-20 text-center text-sm text-slate-400">
                <p className="text-4xl mb-3 opacity-20">📂</p>
                <p>ยังไม่มีหมวดหมู่ เพิ่มหมวดหมู่แรกได้เลย</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {categories.map((category, index) => (
                  <li key={category.id} className="group hover:bg-slate-50 transition-colors">
                    <div className="flex items-center py-4 px-5 gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-lg opacity-40 shrink-0 select-none">{index === categories.length - 1 ? '└' : '├'}</span>
                        {editingCategory?.id === category.id ? (
                          <form onSubmit={handleUpdate} className="flex flex-1 items-center gap-2">
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              autoFocus
                              required
                            />
                            <div className="flex gap-1.5">
                               <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-tighter shadow-md">SAVE</button>
                               <button type="button" onClick={() => setEditingCategory(null)} className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 uppercase tracking-tighter">Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-bold text-slate-800 truncate">{category.name}</span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">ID: {index + 1}</span>
                          </div>
                        )}
                      </div>

                      {editingCategory?.id !== category.id && (
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => setEditingCategory(category)} className="rounded-lg bg-white p-2 text-amber-500 border border-slate-100 hover:bg-amber-50 shadow-sm" title="แก้ไข">✎</button>
                          <button onClick={() => handleDelete(category.id, category.name)} className="rounded-lg bg-white p-2 text-rose-500 border border-slate-100 hover:bg-rose-50 shadow-sm" title="ลบ">🗑</button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          </div>
        )}
      </main>
    </div>
  );
  }
