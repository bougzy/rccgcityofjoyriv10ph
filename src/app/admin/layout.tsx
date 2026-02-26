'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import HierarchySwitcher from '@/components/admin/HierarchySwitcher';
import { HierarchyProvider } from '@/lib/contexts/HierarchyContext';
import Spinner from '@/components/ui/Spinner';
import { User } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <HierarchyProvider provinceId="">
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 mesh-gradient">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top header bar */}
            <header className="sticky top-0 z-30 glass border-b border-white/20 dark:border-white/5 px-4 lg:px-6 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Left side: HierarchySwitcher */}
                <div className="flex-1 min-w-0 pl-10 lg:pl-0">
                  <HierarchySwitcher />
                </div>

                {/* Right side: User info */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {session?.user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {session?.user?.email || ''}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={18} className="text-primary dark:text-primary-light" />
                  </div>
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
    </HierarchyProvider>
  );
}
