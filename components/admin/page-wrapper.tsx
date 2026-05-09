'use client';

import React from 'react';

interface AdminPageWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  error?: string | null;
  success?: string | null;
  isLoading?: boolean;
}

export default function AdminPageWrapper({
  title,
  subtitle,
  children,
  headerAction,
  error,
  success,
  isLoading = false,
}: AdminPageWrapperProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 py-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {headerAction && <div className="flex items-center gap-3">{headerAction}</div>}
      </header>

      {/* Alerts */}
      {(error || success) && (
        <div className="shrink-0 border-b border-slate-100 px-8 py-3">
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              ✅ {success}
            </div>
          )}
        </div>
      )}

      {/* Main Content - Scrollable */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
              <p className="text-sm text-slate-500">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        )}
      </main>
    </div>
  );
}
