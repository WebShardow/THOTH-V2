"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
  isExternal?: boolean;
  baseColor: string;
  activeColor: string;
}

export function NavLink({ href, label, isExternal, baseColor, activeColor }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`text-sm font-bold tracking-tight transition-all relative group ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
      style={{ color: baseColor }}
    >
      {label}
      <span 
        className={`absolute -bottom-1 left-0 h-0.5 transition-all group-hover:w-full ${isActive ? 'w-full' : 'w-0'}`} 
        style={{ backgroundColor: activeColor }} 
      />
    </Link>
  );
}

export function SidebarLink({ href, label, activeColor }: { href: string; label: string; activeColor: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-black/5 ring-1 ring-black/5' : 'hover:bg-black/5'}`}
    >
      <div 
        className={`h-1.5 w-1.5 rounded-full transition-all group-hover:scale-150 ${isActive ? 'scale-150' : ''}`} 
        style={{ backgroundColor: isActive ? activeColor : '#cbd5e1' }} 
      />
      <span className={`text-sm font-bold transition-colors ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
        {label}
      </span>
    </Link>
  );
}
