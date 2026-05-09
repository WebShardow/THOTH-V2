'use client';

import { type FormEvent, useEffect, useState, useRef } from 'react';
import PageHeader from '@/components/admin/page-header';

type ThemeConfig = {
  logoUrl: string;
  logoAlt: string;
  showLogoText: boolean;
  siteName: string;
  navStyle: string;
  navBgColor: string;
  navTextColor: string;
  showHero: boolean;
  heroStyle: string;
  heroHeading: string;
  heroSubheading: string;
  heroBgColor: string;
  heroTextColor: string;
  heroImageUrl: string;
  heroBtnLabel: string;
  heroBtnColor: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  fontFamily: string;
  layoutStyle: string;
  showSidebar: boolean;
  sidebarPosition: string;
  footerCopyright: string;
  footerBgColor: string;
  footerTextColor: string;
};

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter (Modern)' },
  { value: "'Kanit', sans-serif", label: 'Kanit (Modern Thai)' },
  { value: "'Prompt', sans-serif", label: 'Prompt (Minimal Thai)' },
  { value: "'Sarabun', sans-serif", label: 'Sarabun (Formal Thai)' },
  { value: "'Chakra Petch', sans-serif", label: 'Chakra Petch (Tech Thai)' },
  { value: "system-ui", label: 'System Default' },
];

const defaultTheme: ThemeConfig = {
  logoUrl: '',
  logoAlt: 'Logo',
  showLogoText: true,
  siteName: 'My Site',
  navStyle: 'fixed',
  navBgColor: '#ffffff',
  navTextColor: '#0f172a',
  showHero: true,
  heroStyle: 'centered',
  heroHeading: 'สวัสดี จินตอบนอกแบบ',
  heroSubheading: 'ดูผลงานสร้างสรรค์ของฉันได้ล่าง',
  heroBgColor: '#f8fafc',
  heroTextColor: '#0f172a',
  heroImageUrl: '',
  heroBtnLabel: 'ดูผลงาน',
  heroBtnColor: '#0ea5e9',
  primaryColor: '#0ea5e9',
  accentColor: '#f59e0b',
  bgColor: '#ffffff',
  textColor: '#1e293b',
  fontFamily: 'Inter, sans-serif',
  layoutStyle: 'grid',
  showSidebar: false,
  sidebarPosition: 'left',
  footerCopyright: '© 2024 My Portfolio',
  footerBgColor: '#f8fafc',
  footerTextColor: '#64748b',
};

export default function DesignPage() {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [saved, setSaved] = useState<ThemeConfig>(defaultTheme);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/site-config')
      .then((r) => r.json())
      .then((data) => {
        const t = { ...defaultTheme, ...data };
        setTheme(t);
        setSaved(t);
      })
      .catch(() => setError('ไม่สามารถโหลดข้อมูลได้'))
      .finally(() => setFetching(false));
  }, []);

  const isDirty = JSON.stringify(theme) !== JSON.stringify(saved);

  function set<K extends keyof ThemeConfig>(key: K, val: ThemeConfig[K]) {
    setTheme((prev) => ({ ...prev, [key]: val }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, target: 'logoUrl' | 'heroImageUrl') {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(target);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set(target, data.url);
    } catch (err) {
      setError('อัปโหลดล้มเหลว');
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });
      if (!res.ok) throw new Error();
      setSaved(theme);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('บันทึกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="flex flex-1 items-center justify-center">กำลังโหลด...</div>;

  return (
    <div className="flex flex-1 flex-col overflow-hidden h-full">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">Design Module</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Website Theme</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Customize colors, fonts, layout, and design elements for your website with a live preview.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {success && <span className="text-xs font-black text-emerald-600 animate-bounce">บันทึกสำเร็จ!</span>}
            {isDirty && <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest px-2 py-1 bg-amber-50 rounded">ยังไม่ได้บันทึก</span>}
            <button
              onClick={handleSave}
              disabled={loading || !isDirty}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {loading ? '...' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar Settings */}
          <div className="w-96 shrink-0 overflow-y-auto border-r bg-white p-6 scrollbar-thin">
            {error && <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 font-bold border border-rose-100 font-sans">{error}</div>}
            
            <div className="space-y-10 pb-20">
              {/* Logo & Header */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">1. Header & Logo</h3>
                <div className="space-y-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/50">
                  <div>
                    <label className="text-xs font-bold text-slate-700">ชื่อเว็บไซต์</label>
                    <input type="text" value={theme.siteName} onChange={(e) => set('siteName', e.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => logoInputRef.current?.click()} className="h-16 w-16 overflow-hidden rounded-xl border bg-white shadow-sm hover:ring-2 hover:ring-indigo-500">
                      {theme.logoUrl ? <img src={theme.logoUrl} className="h-full w-full object-contain" alt="Logo" /> : <span className="text-xs text-slate-400">Logo</span>}
                    </button>
                    <div className="flex-1">
                       <p className="text-[10px] text-slate-400">แนะนำโปรแกรมใส่ (SVG/PNG)</p>
                       <input ref={logoInputRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                       {uploading === 'logoUrl' && <p className="text-[10px] font-bold text-indigo-500">กำลังอัปโหลด...</p>}
                       {theme.logoUrl && <button onClick={() => set('logoUrl', '')} className="text-[10px] text-rose-500 font-bold">ลบ</button>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <ColorPicker label="Navbar BG" value={theme.navBgColor} onChange={(v: string) => set('navBgColor', v)} />
                     <ColorPicker label="Navbar Text" value={theme.navTextColor} onChange={(v: string) => set('navTextColor', v)} />
                  </div>
                </div>
              </section>

              {/* Hero Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">2. Hero Section</h3>
                   <input type="checkbox" checked={theme.showHero} onChange={(e) => set('showHero', e.target.checked)} className="h-4 w-4 rounded text-indigo-600 border-slate-300" />
                </div>
                {theme.showHero && (
                   <div className="space-y-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/50">
                      <div className="aspect-[16/6] w-full overflow-hidden rounded-xl border bg-white relative group">
                        {theme.heroImageUrl ? <img src={theme.heroImageUrl} className="h-full w-full object-cover" alt="Hero" /> : <div className="flex h-full items-center justify-center text-xs text-slate-300">Hero Image</div>}
                        <button onClick={() => heroInputRef.current?.click()} className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">CHANGE IMAGE</button>
                        <input ref={heroInputRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'heroImageUrl')} />
                      </div>
                      <TextField label="Heading" value={theme.heroHeading} onChange={(v: string) => set('heroHeading', v)} />
                      <TextField label="Subheading" value={theme.heroSubheading} onChange={(v: string) => set('heroSubheading', v)} />
                      <div className="grid grid-cols-2 gap-3">
                        <ColorPicker label="Hero BG" value={theme.heroBgColor} onChange={(v: string) => set('heroBgColor', v)} />
                        <ColorPicker label="Hero Text" value={theme.heroTextColor} onChange={(v: string) => set('heroTextColor', v)} />
                      </div>
                   </div>
                )}
              </section>

              {/* Sidebar Configuration */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">3. Main Sidebar</h3>
                   <input type="checkbox" checked={theme.showSidebar} onChange={(e) => set('showSidebar', e.target.checked)} className="h-4 w-4 rounded text-indigo-600 border-slate-300" />
                </div>
                {theme.showSidebar && (
                  <div className="space-y-4 rounded-xl bg-indigo-50/50 p-4 ring-1 ring-indigo-200/50">
                     <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tighter">ตำแหน่งเมนูข้าง</p>
                     <div className="flex gap-2">
                        {['left', 'right'].map(pos => (
                          <button
                            key={pos}
                            onClick={() => set('sidebarPosition', pos as 'left' | 'right')}
                            className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-widest border transition-all ${theme.sidebarPosition === pos ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                          >
                            {pos}
                          </button>
                        ))}
                     </div>
                  </div>
                )}
              </section>

              <section className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">4. Colors & Font</h3>
                 <div className="space-y-6 rounded-xl bg-slate-50 p-6 ring-1 ring-slate-200/50">
                    <div className="grid grid-cols-2 gap-4">
                       <ColorPicker label="Background" value={theme.bgColor} onChange={(v: string) => set('bgColor', v)} />
                       <ColorPicker label="Primary Color" value={theme.primaryColor} onChange={(v: string) => set('primaryColor', v)} />
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200/50">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">เลือกฟอนต์ (Typography)</label>
                       <select 
                         value={theme.fontFamily} 
                         onChange={(e) => set('fontFamily', e.target.value)} 
                         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                         style={{ fontFamily: theme.fontFamily }}
                       >
                          {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                       </select>
                    </div>
                 </div>
              </section>

              {/* Footer Settings Section */}
              <section className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">5. Footer Settings</h3>
                 <div className="space-y-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/50">
                    <TextField label="Copyright" value={theme.footerCopyright} onChange={(v: string) => set('footerCopyright', v)} />
                    <div className="grid grid-cols-2 gap-3">
                       <ColorPicker label="Footer BG" value={theme.footerBgColor} onChange={(v: string) => set('footerBgColor', v)} />
                       <ColorPicker label="Footer Text" value={theme.footerTextColor} onChange={(v: string) => set('footerTextColor', v)} />
                    </div>
                 </div>
              </section>
            </div>
          </div>

          <div className="flex-1 bg-slate-100 p-8 flex flex-col items-center">
             <div className="mb-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest self-start font-sans">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Desktop Preview
             </div>
             
             <div className="w-full max-w-4xl flex-1 overflow-hidden rounded-xl border bg-white shadow-2xl relative flex flex-col">
                <nav className="z-10 flex items-center justify-between px-6 py-4 shadow-sm shrink-0" style={{ backgroundColor: theme.navBgColor, color: theme.navTextColor, fontFamily: theme.fontFamily }}>
                   <div className="flex items-center gap-2">
                       {theme.logoUrl && <img src={theme.logoUrl} className="h-5 w-auto object-contain" alt="L" />}
                       {theme.showLogoText && <span className="text-sm font-black uppercase">{theme.siteName}</span>}
                   </div>
                   <div className="flex gap-4 text-[10px] font-bold opacity-60"><span>HOME</span><span>WORKS</span><span>ABOUT</span></div>
                </nav>

                <div className={`flex flex-1 overflow-hidden h-full ${theme.sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-1 overflow-y-auto h-full scrollbar-none" style={{ backgroundColor: theme.bgColor, fontFamily: theme.fontFamily, color: theme.textColor }}>
                         {theme.showHero && (
                            <div className="relative py-16 px-8 flex flex-col items-center text-center" style={{ backgroundColor: theme.heroBgColor, color: theme.heroTextColor }}>
                               {theme.heroImageUrl && <img src={theme.heroImageUrl} className="absolute inset-0 h-full w-full object-cover opacity-30" alt="H" />}
                               <div className="relative z-10 max-w-lg">
                                 <h2 className="text-3xl font-black leading-tight mb-4">{theme.heroHeading}</h2>
                                 <p className="text-[11px] opacity-70 mb-6">{theme.heroSubheading}</p>
                                 <button className="rounded-xl px-8 py-2 text-[10px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: theme.heroBtnColor }}>{theme.heroBtnLabel}</button>
                               </div>
                            </div>
                         )}
                         <div className="p-10 text-center text-xs opacity-20 italic">CMS Content Preview Area</div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="mt-1 flex items-center gap-2 overflow-hidden rounded-lg border bg-white p-1">
         <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-6 w-8 cursor-pointer rounded border-none p-0" />
         <span className="text-[10px] font-mono font-bold text-slate-400">{value.toUpperCase()}</span>
      </div>
    </div>
  );
}

