"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="admin-header px-8 py-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-label text-indigo-500">Headless CMS Dashboard</p>
          <h1 className="mt-3 heading-xl text-slate-900">{title}</h1>
          {subtitle && (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2.5 rounded-xl hover:bg-white/60 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold">
              {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {session?.user?.role}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="border-slate-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
