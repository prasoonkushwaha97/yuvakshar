import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { hasAnyRole } from '@/lib/rbacService';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';

export default async function AuthorLayout({ children }: { children: ReactNode }) {
  // Server-side authorization check for the Author workspace
  const isAuthor = await hasAnyRole(['founder', 'co_founder', 'author']);
  
  if (!isAuthor) {
    redirect('/unauthorized');
  }

  return (
    <DashboardLayout role="author">
      {children}
    </DashboardLayout>
  );
}
