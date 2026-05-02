import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { prisma } from "@/lib/prisma";
import {
  FolderOpen,
  Users,
  FileText,
  BookOpen,
  Menu,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch all counts in parallel
  const [
    projectCount,
    staffCount,
    pageCount,
    postCount,
    categoryCount,
    latestProjects,
    latestPages,
    featuredStaff,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.staffMember.count(),
    prisma.page.count(),
    prisma.post.count(),
    prisma.category.count(),
    prisma.project.findMany({
      select: { id: true, title: true, updatedAt: true, isPublished: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.page.findMany({
      select: { id: true, title: true, slug: true, updatedAt: true, isPublished: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.staffMember.findMany({
      select: { id: true, name: true, role: true, featured: true },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: 5,
    }),
  ]);

  const stats = [
    {
      label: "Projects",
      value: projectCount,
      href: "/admin/projects",
      icon: FolderOpen,
      tone: "from-cyan-400 via-sky-500 to-indigo-500",
    },
    {
      label: "Staff Members",
      value: staffCount,
      href: "/admin/staff",
      icon: Users,
      tone: "from-indigo-500 via-violet-500 to-fuchsia-500",
    },
    {
      label: "Pages",
      value: pageCount,
      href: "/admin/pages",
      icon: FileText,
      tone: "from-emerald-400 via-teal-500 to-cyan-500",
    },
    {
      label: "Posts",
      value: postCount,
      href: "/admin/posts",
      icon: BookOpen,
      tone: "from-amber-400 via-orange-500 to-rose-500",
    },
    {
      label: "Categories",
      value: categoryCount,
      href: "/admin/categories",
      icon: Menu,
      tone: "from-fuchsia-400 via-pink-500 to-rose-500",
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminHeader
        title="System Overview"
        subtitle="Your content engine is ready. Manage structured modules here and serve your consumer applications through stable APIs."
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          {/* Stats Grid */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          {/* Content Overview */}
          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            {/* Recent Projects */}
            <article className="glass-card p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-label text-slate-400">Content Module</p>
                  <h2 className="mt-2 heading-md text-slate-900">Recent Projects</h2>
                </div>
                <a
                  href="/admin/projects"
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  View All
                </a>
              </div>
              <div className="space-y-3">
                {latestProjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 py-6 text-sm text-slate-500">
                    No projects yet. Use the Projects module to publish the first item.
                  </div>
                ) : (
                  latestProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/55 px-4 py-3 backdrop-blur"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{project.title}</p>
                        <p className="text-xs text-slate-500">
                          Updated {new Date(project.updatedAt).toLocaleString("en-US")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          project.isPublished
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {project.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </article>

            {/* CMS Info Card */}
            <article className="glass-card p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
              <p className="text-label text-cyan-300/80">Headless Architecture</p>
              <h2 className="mt-2 heading-md text-white">How THOTH V2 Works</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  Manage content in the admin dashboard
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  Content served via REST API endpoints
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  Consume in any frontend application
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  No middleware - pure Next.js architecture
                </li>
              </ul>
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-label text-slate-400">API Endpoints</p>
                <p className="mt-3 text-sm leading-6 text-slate-200 font-mono">
                  GET /api/projects<br />
                  GET /api/pages<br />
                  GET /api/posts<br />
                  GET /api/categories
                </p>
              </div>
            </article>
          </section>

          {/* Latest Pages & Staff */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Latest Pages */}
            <article className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-label text-slate-400">Content Entries</p>
                  <h2 className="mt-2 heading-md text-slate-900">Latest Pages</h2>
                </div>
                <a
                  href="/admin/pages"
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  View All
                </a>
              </div>
              <div className="space-y-3">
                {latestPages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 py-6 text-sm text-slate-500">
                    No pages available yet.
                  </div>
                ) : (
                  latestPages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/55 px-4 py-3 backdrop-blur"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{page.title}</p>
                        <p className="text-xs text-slate-500">
                          /{page.slug} • Updated{" "}
                          {new Date(page.updatedAt).toLocaleString("en-US")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          page.isPublished
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {page.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </article>

            {/* Staff Directory */}
            <article className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-label text-slate-400">Team</p>
                  <h2 className="mt-2 heading-md text-slate-900">Featured Staff</h2>
                </div>
                <a
                  href="/admin/staff"
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  View All
                </a>
              </div>
              <div className="space-y-3">
                {featuredStaff.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 py-6 text-sm text-slate-500">
                    No staff members added yet.
                  </div>
                ) : (
                  featuredStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/55 px-4 py-3 backdrop-blur"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{staff.name}</p>
                        <p className="text-xs text-slate-500">{staff.role}</p>
                      </div>
                      {staff.featured && (
                        <div className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-600">
                          Featured
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
