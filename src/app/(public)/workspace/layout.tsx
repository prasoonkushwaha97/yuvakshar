"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCms } from "@/store/CmsContext";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useCms();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not logged in, redirect to login page with return URL
    if (currentUser === null) {
      router.push(`/login?redirect_to=${encodeURIComponent(pathname)}`);
    }
  }, [currentUser, router, pathname]);

  if (!currentUser) return null; // Prevent flicker

  const isEditorPage = pathname.includes('/articles/new') || pathname.includes('/articles/submission/');

  if (isEditorPage) {
    return (
      <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#0B0F19] pt-0">
        <div className="w-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#0B0F19] pt-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
        
        {/* Main Editor Content Area */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
