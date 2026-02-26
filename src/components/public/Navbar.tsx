'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, X, ChevronDown, Sun, Moon, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  {
    label: 'Ministries',
    children: [
      { href: '/ministries', label: 'All Ministries' },
      { href: '/yaya', label: 'YAYA' },
      { href: '/events', label: 'Events' },
    ],
  },
  { href: '/sermons', label: 'Sermons' },
  {
    label: 'Community',
    children: [
      { href: '/prayers', label: 'Prayer Wall' },
      { href: '/testimonies', label: 'Testimonies' },
      { href: '/devotionals', label: 'Devotionals' },
    ],
  },
  { href: '/giving', label: 'Giving' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex items-center justify-between h-16" suppressHydrationWarning>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/Rccg_logo.png" alt="RCCG Logo" width={40} height={40} className="rounded-full" />
            <div className="hidden sm:block">
              <p className="font-bold text-primary dark:text-primary-light text-sm leading-tight">RCCG City Of Joy</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Rivers Province 10</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1" suppressHydrationWarning>
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === link.label ? null : link.label)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      link.children.some((c) => c.href === pathname)
                        ? 'text-primary dark:text-primary-light bg-blue-50 dark:bg-blue-900/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    {link.label}
                    <ChevronDown size={14} className={cn('transition-transform', dropdownOpen === link.label && 'rotate-180')} />
                  </button>
                  {dropdownOpen === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-48 rounded-lg glass py-1 shadow-lg">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setDropdownOpen(null)}
                          className={cn(
                            'block px-4 py-2 text-sm transition-colors',
                            pathname === child.href
                              ? 'text-primary dark:text-primary-light bg-blue-50 dark:bg-blue-900/20'
                              : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-primary dark:text-primary-light bg-blue-50 dark:bg-blue-900/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {link.label}
                </Link>
              )
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="ml-2 p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 dark:text-slate-400 dark:hover:text-primary-light dark:hover:bg-slate-800 transition-colors"
            >
              {mounted ? (resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />) : <div className="w-[18px] h-[18px]" />}
            </button>

            {/* Sign In */}
            <Link
              href="/login"
              className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
            >
              <LogIn size={16} />
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-slate-500 hover:text-primary transition-colors"
            >
              {mounted ? (resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />) : <div className="w-[18px] h-[18px]" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-primary transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/50 dark:border-slate-700/50">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {link.label}
                  </p>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'block pl-6 pr-3 py-2 text-sm rounded-lg transition-colors',
                        pathname === child.href
                          ? 'text-primary dark:text-primary-light bg-blue-50 dark:bg-blue-900/20'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-3 py-2 text-sm rounded-lg transition-colors',
                    pathname === link.href
                      ? 'text-primary dark:text-primary-light bg-blue-50 dark:bg-blue-900/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {link.label}
                </Link>
              )
            )}

            {/* Sign In link */}
            <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
              >
                <LogIn size={16} />
                Sign In / Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
