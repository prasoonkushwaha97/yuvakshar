import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/rbacService';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';

export default async function FounderLayout({ children }: { children: ReactNode }) {
  // Server-side authorization check for the Founder workspace
  const isFounder = await hasRole('founder');
  
  if (!isFounder) {
    // Redirect unauthorized users away from the founder workspace
    redirect('/unauthorized');
  }

  return (
    <DashboardLayout role="founder">
      {children}
    </DashboardLayout>
  );
}
