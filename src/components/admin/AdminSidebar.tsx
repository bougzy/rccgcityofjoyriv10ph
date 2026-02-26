'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils/cn';
import { adminNavLinks } from '@/lib/constants/navigation';
import type { UserRole } from '@/types';
import {
  Sun, Moon, LogOut, Menu, X, ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const userRole = (session?.user as { role?: string })?.role as UserRole | undefined;

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Filter nav links based on user role
  const visibleLinks = adminNavLinks.filter((link) => {
    if (!link.roles) return true;
    if (!userRole) return false;
    return link.roles.includes(userRole);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo section */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-slate-700">
        <Image
          src="/img/Rccg_logo.png"
          alt="RCCG Logo"
          width={40}
          height={40}
          className="rounded-full shrink-0"
        />
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              RCCG Admin
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              City of Joy
            </p>
          </div>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:text-primary-light'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
              )}
              title={collapsed ? link.label : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-4 space-y-1">
        {/* User info */}
        {!collapsed && session?.user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{session.user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{userRole?.replace('-', ' ')}</p>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors w-full"
          title={collapsed ? 'Toggle theme' : undefined}
        >
          {mounted ? (resolvedTheme === 'dark' ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />) : <div className="w-5 h-5 shrink-0" />}
          {!collapsed && <span>{mounted && resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:block border-t border-slate-200 dark:border-slate-700 px-3 py-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 z-40 h-full w-[260px] glass-sidebar transform transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:block h-screen sticky top-0 glass-sidebar transition-all duration-300 shrink-0',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
