"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  BookOpen,
  Users,
  Menu,
  Settings,
  Image,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Projects", href: "/admin/projects", icon: <FolderOpen className="w-5 h-5" /> },
  { label: "Pages", href: "/admin/pages", icon: <FileText className="w-5 h-5" /> },
  { label: "Posts", href: "/admin/posts", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Categories", href: "/admin/categories", icon: <Menu className="w-5 h-5" /> },
  { label: "Staff", href: "/admin/staff", icon: <Users className="w-5 h-5" /> },
  { label: "Media", href: "/admin/media", icon: <Image className="w-5 h-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="h-full glass-panel border-r border-white/30 flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-sm">THOTH</h1>
                <p className="text-xs text-slate-500">CMS v2</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-lg">T</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                }`}
              >
                <span className={isActive ? "text-white" : "text-slate-500"}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        {!collapsed && (
          <div className="p-4 border-t border-white/20">
            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs font-medium text-slate-600 mb-1">Headless API</p>
              <p className="text-[10px] text-slate-400">/api/{"{resource}"}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
