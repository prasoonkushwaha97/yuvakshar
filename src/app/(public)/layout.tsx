import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import GlobalCreateSheet from '@/components/layout/GlobalCreateSheet';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      {children}
      <Footer />
      <MobileBottomNav />
      <GlobalCreateSheet />
    </>
  );
}
