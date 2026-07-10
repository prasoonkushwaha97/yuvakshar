import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser, hasAnyRole } from '@/lib/rbacService';
import AdminSidebar from '@/components/layout/AdminSidebar';
import GlobalSearch from '@/components/layout/GlobalSearch';
import MobileHeader from '@/components/layout/MobileHeader';

export const metadata = {
  title: 'Yuvakshar Admin',
  description: 'Administration Panel',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/admin/login');
  }

  // Ensure they have at least one valid backend role
  // Any role except standard 'reader' is allowed in some capacity
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor', 'moderator', 'sub_editor', 'author', 'contributor']);
  
  if (!isAuthorized) {
    redirect('/unauthorized');
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-primary/20 selection:text-primary">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <MobileHeader />
        
        <header className="hidden md:flex h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-4">
             <GlobalSearch />
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-sm font-bold text-primary hover:underline">
              View Site ↗
            </a>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
