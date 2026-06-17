import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { hasAnyRole } from '@/lib/rbacService';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';

export default async function EditorialLayout({ children }: { children: ReactNode }) {
  // Server-side authorization check for the Editorial workspace
  const isAuthorized = await hasAnyRole(['editor_in_chief', 'managing_editor', 'editor', 'fact_checker']);
  
  if (!isAuthorized) {
    redirect('/unauthorized');
  }

  return (
    <DashboardLayout role="editorial">
      {children}
    </DashboardLayout>
  );
}
