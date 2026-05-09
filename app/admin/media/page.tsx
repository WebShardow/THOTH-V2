"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/admin/page-header";

type MediaItem = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
};

export default function MediaAdmin() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setMedia(data);
    } catch {
      setError("Failed to fetch media");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      fetchMedia();
    } catch {
      setError("อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("คุณต้องการลบสื่อนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchMedia();
    } catch {
      setError("ลบไม่สำเร็จ");
    }
  }

  function copyToClipboard(url: string) {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    alert("คัดลอก URL เรียบร้อยแล้ว: " + fullUrl);
  }

  function formatSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        moduleName="Asset Management"
        title="Media Library"
        description="Manage image library for content management across the website"
        recordCount={media.length}
      />

      {/* Main Content - Scrollable */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-8 py-6">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
              <p className="text-sm text-slate-500">Loading media library...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upload Section */}
            <section className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-8 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)]">
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-indigo-600">Upload New Images</h3>
              <label className="group relative overflow-hidden">
                 <div className={`px-10 py-5 rounded-3xl bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:translate-y-[-2px] cursor-pointer flex items-center gap-4 w-fit ${uploading ? 'opacity-50 animate-pulse' : ''}`}>
                    <span>{uploading ? "Uploading..." : "Upload New Image"}</span>
                    <span className="text-xl">✨</span>
                 </div>
                 <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
            </section>

            {/* Gallery Grid */}
            <section className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-8 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)]">
              <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-indigo-600">Gallery ({media.length})</h3>
              {media.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="text-6xl mb-6 opacity-20">🖼️</div>
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">No images in media library</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
         {media.map((item) => (
            <div key={item.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
               {/* Preview */}
               <div className="relative aspect-square overflow-hidden bg-slate-50 border-b border-slate-50">
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <button onClick={() => copyToClipboard(item.url)} className="p-3 bg-white rounded-2xl text-indigo-600 hover:scale-110 transition-transform shadow-lg" title="Copy URL">🔗</button>
                     <button onClick={() => handleDelete(item.id)} className="p-3 bg-white rounded-2xl text-rose-500 hover:scale-110 transition-transform shadow-lg" title="Delete">🗑️</button>
                  </div>
               </div>
               {/* Details */}
               <div className="p-5 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest truncate opacity-80" title={item.name}>{item.name}</p>
                  <div className="flex items-center justify-between text-[8px] font-bold opacity-30 uppercase tracking-widest">
                     <span>{formatSize(item.size)}</span>
                     <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
               </div>
            </div>
         ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {error && (
        <div className="fixed bottom-10 right-10 bg-rose-600 text-white px-10 py-5 rounded-3xl shadow-3xl font-black text-xs uppercase tracking-widest animate-bounce">
           ⚠️ {error}
           <button onClick={() => setError(null)} className="ml-5 opacity-50 font-bold hover:opacity-100">✕</button>
        </div>
      )}
    </div>
  );
}
