"use client";

import React, { Suspense } from "react";
import ChaupalDesktopSidebar from "@/components/chaupal/layout/ChaupalDesktopSidebar";
import ChaupalMobileBottomNav from "@/components/chaupal/layout/ChaupalMobileBottomNav";
import ChaupalRightSidebar from "@/components/chaupal/layout/ChaupalRightSidebar";
import { useCms } from "@/store/CmsContext";

export default function ChaupalLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useCms();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16]">
      <div className="max-w-[1280px] mx-auto flex justify-center lg:justify-between px-0 sm:px-4 lg:px-8">
        
        {/* Left Navigation (Hidden on Mobile/Tablet) */}
        <ChaupalDesktopSidebar />

        {/* Main Feed / Content Area */}
        <main className="w-full max-w-[680px] flex-1 pb-24 md:pb-8 border-x-0 sm:border-x border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] min-h-screen shadow-sm shadow-slate-200/20 dark:shadow-none">
          <Suspense fallback={
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]"></div>
            </div>
          }>
            {children}
          </Suspense>
        </main>

        {/* Right Sidebar (Hidden below 1280px) */}
        <ChaupalRightSidebar />

      </div>

      {/* Mobile Navigation */}
      <ChaupalMobileBottomNav currentUserId={currentUser?.id} />
    </div>
  );
}
