import { type ReactNode } from 'react';

interface PageHeaderProps {
  moduleName: string;
  title: string;
  description: string;
  recordCount: number | ReactNode;
}

export default function PageHeader({
  moduleName,
  title,
  description,
  recordCount,
}: PageHeaderProps) {
  return (
    <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">
            {moduleName}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            {description}
          </p>
        </div>
        <div className="rounded-2xl border border-white/40 bg-white/70 px-5 py-3 text-sm text-slate-600 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)] backdrop-blur">
          Total records: <span className="font-black text-slate-900">{recordCount}</span>
        </div>
      </div>
    </header>
  );
}
