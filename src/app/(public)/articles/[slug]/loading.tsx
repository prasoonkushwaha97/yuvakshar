import React from "react";
import SectionContainer from "@/components/homepage/layout/SectionContainer";
import { BaseSkeleton, SidebarSkeleton } from "@/components/homepage/shared/Skeleton";

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-[#FDFCF7] dark:bg-[#0B0F19] pt-6 pb-16 font-sans">
      <SectionContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Skeleton (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0E1322] border border-gray-150 dark:border-gray-850 p-6 md:p-10 rounded-xl shadow-sm">
            
            {/* Category Pill */}
            <BaseSkeleton className="w-24 h-6 rounded-full mb-4" />
            
            {/* Title */}
            <div className="space-y-3 mb-6">
              <BaseSkeleton className="w-full h-10" />
              <BaseSkeleton className="w-5/6 h-10" />
            </div>
            
            {/* Summary */}
            <div className="space-y-2 pl-4 border-l-4 border-gray-300 dark:border-gray-700 mb-6">
              <BaseSkeleton className="w-full h-4" />
              <BaseSkeleton className="w-4/5 h-4" />
            </div>
            
            {/* Author Profile */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-gray-100 dark:border-gray-850 py-4 mb-6">
              <div className="flex items-center space-x-3">
                <BaseSkeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-2">
                  <BaseSkeleton className="w-32 h-4" />
                  <BaseSkeleton className="w-24 h-3" />
                </div>
              </div>
              <div className="flex gap-4">
                <BaseSkeleton className="w-16 h-4" />
                <BaseSkeleton className="w-16 h-4" />
                <BaseSkeleton className="w-16 h-4" />
              </div>
            </div>
            
            {/* Hero Image */}
            <BaseSkeleton className="w-full aspect-[16/9] rounded-xl mb-8" />
            
            {/* Paragraphs */}
            <div className="space-y-6">
              <div className="space-y-3">
                <BaseSkeleton className="w-full h-4" />
                <BaseSkeleton className="w-full h-4" />
                <BaseSkeleton className="w-11/12 h-4" />
                <BaseSkeleton className="w-full h-4" />
                <BaseSkeleton className="w-4/5 h-4" />
              </div>
              <div className="space-y-3">
                <BaseSkeleton className="w-full h-4" />
                <BaseSkeleton className="w-10/12 h-4" />
                <BaseSkeleton className="w-full h-4" />
                <BaseSkeleton className="w-5/6 h-4" />
              </div>
              <div className="w-full aspect-[21/9] rounded-lg my-6" /> {/* Inner Image Skeleton */}
              <div className="space-y-3">
                <BaseSkeleton className="w-full h-4" />
                <BaseSkeleton className="w-full h-4" />
                <BaseSkeleton className="w-9/12 h-4" />
              </div>
            </div>
            
          </div>
          
          {/* Sidebar Skeleton (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <SidebarSkeleton />
          </aside>
          
        </div>
      </SectionContainer>
    </div>
  );
}
