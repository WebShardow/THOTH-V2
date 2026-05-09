'use client';

import { type FormEvent, useEffect, useState } from 'react';
import PageHeader from '@/components/admin/page-header';

type MenuItem = {
  id: string;
  label: string;
  url: string;
  order: number;
  isExternal: boolean;
  isVisible: boolean;
  showInNavbar: boolean;
  showInSidebar: boolean;
  showInFooter: boolean;
};

type FormData = {
  label: string;
  url: string;
  isExternal: boolean;
  showInNavbar: boolean;
  showInSidebar: boolean;
  showInFooter: boolean;
};

const emptyForm: FormData = {
  label: '',
  url: '',
  isExternal: false,
  showInNavbar: true,
  showInSidebar: false,
  showInFooter: false,
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setFetching(true);
    try {
      const res = await fetch('/api/menu-items');
      setItems(await res.json());
    } catch { setError('โหลดข้อมูลไม่ได้'); }
    finally { setFetching(false); }
  }

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.label || !form.url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm(emptyForm);
      flash('เพิ่มเมนูสำเร็จ');
      fetchItems();
    } catch { setError('เพิ่มเมนูไม่ได้'); }
    finally { setLoading(false); }
  }

  async function handleUpdate(id: string) {
    setLoading(true);
    try {
      await fetch(`/api/menu-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      flash('อัปเดตสำเร็จ');
      fetchItems();
    } catch { setError('อัปเดตไม่ได้'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`ลบเมนู "${label}" ใช่หรือไม่?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
      flash('ลบสำเร็จ');
      fetchItems();
    } catch { setError('ลบไม่ได้'); }
    finally { setLoading(false); }
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    const idx = items.findIndex((i) => i.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === items.length - 1) return;
    const newItems = [...items];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    setItems(newItems);
    // save new orders
    await Promise.all(
      newItems.map((item, i) =>
        fetch(`/api/menu-items/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: i }),
        })
      )
    );
  }

  async function toggleField(id: string, field: keyof MenuItem, currentVal: boolean) {
     await fetch(`/api/menu-items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !currentVal }),
    });
    fetchItems();
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        moduleName="Navigation"
        title="Menu Management"
        description="จัดการรายการเมนูและตำแหน่งที่แสดงผล (Header, Navigation, Footer)"
        recordCount={items.length}
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
              <p className="text-sm text-slate-500">Loading menu items...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add Form */}
            <section className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-8 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)]">
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-indigo-600">Add New Menu Item</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">ชื่อเมนู</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm((s) => ({ ...s, label: e.target.value }))}
                    placeholder="เช่น Projects, Contact"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>
                <div className="flex-[2] min-w-[250px]">
                  <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">URL</label>
                  <input
                    type="text"
                    value={form.url}
                    onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))}
                    placeholder="เช่น /staff หรือ /about หรือ https://..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 items-center border-t border-slate-100 pt-4">
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={form.showInNavbar} onChange={(e) => setForm((s) => ({ ...s, showInNavbar: e.target.checked }))} className="h-4 w-4 rounded text-sky-600" />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-sky-600 transition-colors">Header</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={form.showInSidebar} onChange={(e) => setForm((s) => ({ ...s, showInSidebar: e.target.checked }))} className="h-4 w-4 rounded text-sky-600" />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-sky-600 transition-colors">Context Nav</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={form.showInFooter} onChange={(e) => setForm((s) => ({ ...s, showInFooter: e.target.checked }))} className="h-4 w-4 rounded text-sky-600" />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-sky-600 transition-colors">Footer</span>
                    </label>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer opacity-60">
                      <input type="checkbox" checked={form.isExternal} onChange={(e) => setForm((s) => ({ ...s, isExternal: e.target.checked }))} className="h-4 w-4 rounded text-slate-400" />
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">External Link</span>
                    </label>
                    <button type="submit" disabled={loading} className="rounded-xl bg-emerald-600 px-8 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-lg shadow-emerald-100 uppercase tracking-widest">
                      + Add Menu
                    </button>
                </div>
              </div>
            </form>
          </section>

            {/* Menu List */}
            <section className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)] overflow-hidden">
              <div className="flex items-center justify-between px-8 py-4 border-b border-white/40 bg-gradient-to-r from-white/10 to-transparent">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Configuration Matrix</h3>
              <div className="flex gap-4 text-[10px] font-black text-slate-400">
                 <span className="w-10 text-center uppercase tracking-tighter">Nav</span>
                 <span className="w-10 text-center uppercase tracking-tighter">Side</span>
                 <span className="w-10 text-center uppercase tracking-tighter">Foot</span>
                 <span className="w-16"></span>
              </div>
            </div>

            {fetching ? (
              <div className="py-20 text-center text-sm text-slate-400">⏳ กำลังโหลดรายการเมนู...</div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center text-sm text-slate-400">
                <p className="text-5xl mb-4 opacity-10">🧭</p>
                <p className="font-bold uppercase tracking-widest">No Menu Items Found</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <li key={item.id} className="group px-5 py-4 hover:bg-slate-50 transition-colors">
                    {editingId === item.id ? (
                      <div className="space-y-4 py-2 border-2 border-dashed border-indigo-200 rounded-xl p-4 bg-indigo-50/30">
                        <div className="flex flex-wrap gap-3">
                          <input
                            value={editForm.label}
                            onChange={(e) => setEditForm((s) => ({ ...s, label: e.target.value }))}
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm"
                            placeholder="Menu Label"
                          />
                          <input
                            value={editForm.url}
                            onChange={(e) => setEditForm((s) => ({ ...s, url: e.target.value }))}
                            className="flex-[2] rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm"
                            placeholder="URL / Path"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                           <div className="flex gap-4">
                              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                <input type="checkbox" checked={editForm.showInNavbar} onChange={(e) => setEditForm((s) => ({ ...s, showInNavbar: e.target.checked }))} /> Navbar
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                <input type="checkbox" checked={editForm.showInSidebar} onChange={(e) => setEditForm((s) => ({ ...s, showInSidebar: e.target.checked }))} /> Sidebar
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                <input type="checkbox" checked={editForm.showInFooter} onChange={(e) => setEditForm((s) => ({ ...s, showInFooter: e.target.checked }))} /> Footer
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 italic ml-2">
                                <input type="checkbox" checked={editForm.isExternal} onChange={(e) => setEditForm((s) => ({ ...s, isExternal: e.target.checked }))} /> Ext
                              </label>
                           </div>
                           <div className="flex gap-2">
                             <button onClick={() => handleUpdate(item.id)} className="rounded-lg bg-indigo-600 px-6 py-2 text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-indigo-100">Update</button>
                             <button onClick={() => setEditingId(null)} className="rounded-lg bg-white border border-slate-200 px-6 py-2 text-xs font-bold text-slate-400 uppercase">Cancel</button>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-6">
                        {/* Reorder */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <button onClick={() => handleMove(item.id, 'up')} disabled={idx === 0} className="text-slate-300 hover:text-sky-500 disabled:opacity-10 text-xs transition-colors p-1">â–²</button>
                          <button onClick={() => handleMove(item.id, 'down')} disabled={idx === items.length - 1} className="text-slate-300 hover:text-sky-500 disabled:opacity-10 text-xs transition-colors p-1">â–¼</button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className={`text-md font-black tracking-tight ${item.isVisible ? 'text-slate-800' : 'text-slate-300 line-through'}`}>{item.label}</span>
                            {item.isExternal && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">â†— Link</span>}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate font-medium mt-0.5 select-all">{item.url}</p>
                        </div>

                        {/* Config Toggles */}
                        <div className="flex gap-4 shrink-0 px-2">
                           <button onClick={() => toggleField(item.id, 'showInNavbar', item.showInNavbar)} className={`w-10 h-6 rounded-full transition-all flex items-center justify-center text-[10px] font-black ${item.showInNavbar ? 'bg-sky-500 text-white shadow-md shadow-sky-100' : 'bg-slate-100 text-slate-300'}`}>HEAD</button>
                           <button onClick={() => toggleField(item.id, 'showInSidebar', item.showInSidebar)} className={`w-10 h-6 rounded-full transition-all flex items-center justify-center text-[10px] font-black ${item.showInSidebar ? 'bg-indigo-500 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-300'}`}>CTX</button>
                           <button onClick={() => toggleField(item.id, 'showInFooter', item.showInFooter)} className={`w-10 h-6 rounded-full transition-all flex items-center justify-center text-[10px] font-black ${item.showInFooter ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' : 'bg-slate-100 text-slate-300'}`}>FOOT</button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4 border-l border-slate-100 pl-4">
                          <button onClick={() => toggleField(item.id, 'isVisible', item.isVisible)} className={`rounded-xl p-2.5 transition-colors ${item.isVisible ? 'text-slate-400 hover:text-sky-600 hover:bg-sky-50' : 'text-rose-500 bg-rose-50'}`} title={item.isVisible ? 'ซ่อนเมนูนี้' : 'แสดงเมนูนี้'}>{item.isVisible ? '👁️' : '🕶️'}</button>
                          <button onClick={() => {
                              setEditingId(item.id);
                              setEditForm({
                                label: item.label,
                                url: item.url,
                                isExternal: item.isExternal,
                                showInNavbar: item.showInNavbar,
                                showInSidebar: item.showInSidebar,
                                showInFooter: item.showInFooter
                              });
                            }} className="rounded-xl p-2.5 text-amber-500 hover:bg-amber-50" title="แก้ไขข้อมูล">✎</button>
                          <button onClick={() => handleDelete(item.id, item.label)} className="rounded-xl p-2.5 text-rose-500 hover:bg-rose-50" title="ลบ">🗑️</button>
                        </div>
                      </div>
                    )}
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