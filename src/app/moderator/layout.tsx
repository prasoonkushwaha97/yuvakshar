import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { hasAnyRole } from '@/lib/rbacService';

export default async function ModeratorLayout({ children }: { children: ReactNode }) {
  // Server-side authorization check for the Moderator workspace
  // Allowed roles: founder, co_founder, super_admin, admin, editor_in_chief, moderator
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin', 'editor_in_chief', 'moderator']);
  
  if (!isAuthorized) {
    // Redirect unauthorized users away from the moderator workspace
    redirect('/unauthorized');
  }

  return (
    <div className="moderator-workspace-layout min-h-screen bg-background">
      {children}
    </div>
  );
}
