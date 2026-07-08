"use client";

import React, { Suspense } from "react";
import ChaupalDesktopSidebar from "@/components/chaupal/layout/ChaupalDesktopSidebar";

import { useCms } from "@/store/CmsContext";
import SkeletonLoader from "@/components/chaupal/shared/SkeletonLoader";

export default function ChaupalLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useCms();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16]">
      <div className="max-w-[1280px] mx-auto flex justify-center gap-6 lg:gap-8 px-0 sm:px-4 lg:px-8">
        
        {/* Left Navigation */}
        <ChaupalDesktopSidebar />

        {/* Main Feed / Content Area */}
        <main className="w-full max-w-[960px] flex-1 pb-24 md:pb-8 border-x border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] min-h-screen shadow-sm shadow-slate-200/20 dark:shadow-none">
          <Suspense fallback={
            <div className="flex flex-col gap-4 px-0 sm:px-6 py-6">
              <SkeletonLoader type="feed-card" count={3} />
            </div>
          }>
            {children}
          </Suspense>
        </main>

      </div>

    </div>
  );
}
