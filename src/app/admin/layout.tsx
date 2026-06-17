import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { hasAnyRole } from '@/lib/rbacService';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side authorization check for the Admin workspace
  // Allowed roles: founder, co_founder, super_admin, admin
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  
  if (!isAuthorized) {
    // Redirect unauthorized users away from the admin workspace
    redirect('/unauthorized');
  }

  return (
    <DashboardLayout role="admin">
      {children}
    </DashboardLayout>
  );
}
