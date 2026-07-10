import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import GlobalCreateSheet from '@/components/layout/GlobalCreateSheet';
import { getCategories } from '@/lib/actions/categoryActions';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <>
      <AppHeader categories={categories} />
      {children}
      <Footer />
      <MobileBottomNav />
      <GlobalCreateSheet />
    </>
  );
}
