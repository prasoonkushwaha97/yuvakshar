import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser, hasAnyRole } from '@/lib/rbacService';
import AdminSidebar from '@/components/layout/AdminSidebar';

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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-64 max-w-full hidden md:block">
               <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl px-4 py-2 text-sm text-slate-500 flex items-center gap-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  Search (Cmd+K)
               </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-sm font-bold text-primary hover:underline">
              View Site ↗
            </a>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
