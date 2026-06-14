import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/rbacService';
import FounderSidebar from './Sidebar';

export default async function FounderLayout({ children }: { children: ReactNode }) {
  // Server-side authorization check for the Founder workspace
  const isFounder = await hasRole('founder');
  
  if (!isFounder) {
    // Redirect unauthorized users away from the founder workspace
    redirect('/unauthorized');
  }

  return (
    <div className="founder-workspace-layout min-h-screen bg-background flex flex-col md:flex-row">
      <FounderSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="hidden md:flex w-full h-16 border-b border-border items-center px-6 shrink-0 bg-card">
          <h1 className="text-xl font-semibold">Workspace Console</h1>
        </header>

        {/* Workspace Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
