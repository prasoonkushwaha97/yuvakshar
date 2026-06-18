import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { hasAnyRole } from '@/lib/rbacService';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side authorization check for the Admin workspace
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'admin', 'moderator']);
  
  if (!isAuthorized) {
    redirect('/unauthorized');
  }

  return (
    <DashboardLayout role="admin">
      {children}
    </DashboardLayout>
  );
}
