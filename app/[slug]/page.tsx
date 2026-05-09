import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/page-data";
import { getSiteConfig } from "@/lib/site-config-data";
import { getAllMenuItems, type MenuItem } from "@/lib/menu-data";
import { NavLink, SidebarLink } from "@/components/nav-link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  
  const [page, config, menuItems] = await Promise.all([
    getPageBySlug(slug),
    getSiteConfig(),
    getAllMenuItems(),
  ]);

  if (!page || !page.isPublished) {
    notFound();
  }

  const visibleMenu = menuItems.filter((m: MenuItem) => m.isVisible);
  const navbarMenu = visibleMenu.filter((m: MenuItem) => m.showInNavbar);
  const sidebarMenu = visibleMenu.filter((m: MenuItem) => m.showInSidebar);
  const footerMenu = visibleMenu.filter((m: MenuItem) => m.showInFooter);

  const navPosition =
    config.navStyle === "fixed" ? "fixed top-0 left-0 right-0 z-50"
    : config.navStyle === "sticky" ? "sticky top-0 z-50"
    : "relative";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: config.bgColor, color: config.textColor, fontFamily: config.fontFamily }}>
      
      {/* ── Navbar ── */}
      <header className={`${navPosition} shadow-sm border-b border-black/5`} style={{ backgroundColor: config.navBgColor }}>
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {config.logoUrl && <img src={config.logoUrl} alt={config.logoAlt} className="h-8 w-auto object-contain" />}
            {config.showLogoText && <span className="text-xl font-black tracking-tighter uppercase" style={{ color: config.navTextColor }}>{config.siteName}</span>}
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navbarMenu.map((item) => (
              <NavLink
                key={item.id}
                href={item.url}
                label={item.label}
                isExternal={item.isExternal}
                baseColor={config.navTextColor}
                activeColor={config.primaryColor}
              />
            ))}
            <Link href="/" className="text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border opacity-50 hover:opacity-100 transition-all ml-4" style={{ borderColor: config.navTextColor, color: config.navTextColor }}>← Back Home</Link>
          </nav>
        </div>
      </header>

      {config.navStyle === "fixed" && <div className="h-[73px]" />}

      <div className={`flex flex-1 mx-auto w-full max-w-7xl px-6 py-16 gap-12 ${config.showSidebar && config.sidebarPosition === 'right' ? 'flex-col md:flex-row-reverse' : 'flex-col md:flex-row'}`}>
        
        {/* Sidebar */}
        {config.showSidebar && (
          <aside className="w-full md:w-64 shrink-0 space-y-8">
             <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Selection</h4>
               <nav className="flex flex-col gap-1">
                  {sidebarMenu.map((item) => (
                    <SidebarLink
                      key={item.id}
                      href={item.url}
                      label={item.label}
                      activeColor={config.primaryColor}
                    />
                  ))}
               </nav>
             </div>
          </aside>
        )}

        {/* Dynamic Content */}
        <main className="flex-1 min-w-0">
          <article className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase">
             <header className="mb-12 border-b-2 pb-6" style={{ borderColor: config.primaryColor + '15' }}>
               <h1 className="text-5xl" style={{ color: config.textColor }}>{page.title}</h1>
               <time className="text-[10px] font-bold opacity-30 mt-2 uppercase tracking-widest">{new Date(page.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</time>
             </header>
             <div className="dynamic-content" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
          </article>
        </main>
      </div>

      <footer className="mt-auto py-20 px-6 border-t border-black/5" style={{ backgroundColor: config.footerBgColor }}>
        <div className="mx-auto max-w-7xl flex flex-col items-center">
            {/* Footer Menu */}
            <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-12">
               {footerMenu.map(item => (
                 <Link key={item.id} href={item.url} className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity" style={{ color: config.footerTextColor }}>
                   {item.label}
                 </Link>
               ))}
            </nav>
            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40" style={{ color: config.footerTextColor }}>{config.footerCopyright}</p>
        </div>
      </footer>
    </div>
  );
}
