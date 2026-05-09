import Link from "next/link";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  tone: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ label, value, href, icon: Icon, tone, trend }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-[1.75rem] border border-white/35 bg-white/70 shadow-[0_20px_55px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-[0_25px_65px_-28px_rgba(79,70,229,0.35)]"
    >
      <div className={`h-1.5 bg-gradient-to-r ${tone}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
              {label}
            </p>
            <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              {value.toLocaleString()}
            </p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${tone} bg-opacity-10`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500 transition-colors group-hover:text-slate-700">
            Open module
          </p>
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
