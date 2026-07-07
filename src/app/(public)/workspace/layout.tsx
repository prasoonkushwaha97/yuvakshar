"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCms } from "@/store/CmsContext";
import { ArrowLeft } from "lucide-react";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, openAuthModal } = useCms();
  const router = useRouter();

  useEffect(() => {
    // If not logged in, wait a tick to ensure client hydration and then pop modal
    if (currentUser === null) {
      openAuthModal();
      router.push("/");
    }
  }, [currentUser, openAuthModal, router]);

  if (!currentUser) return null; // Prevent flicker

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#0B0F19] pt-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
        
        {/* Minimal Navigation */}
        <div className="mb-6">
          <Link 
            href={`/u/${currentUser.username}`}
            className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>प्रोफ़ाइल पर वापस जाएँ (Back to Profile)</span>
          </Link>
        </div>

        {/* Main Editor Content Area */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
