import React from "react";
import { BaseSkeleton } from "@/components/homepage/shared/Skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0A0F1D] pb-20">
      {/* Cover Skeleton */}
      <BaseSkeleton className="w-full h-48 md:h-64 lg:h-80" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-24 z-10">
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-10 items-start">
          <div className="w-full xl:w-2/3">
            {/* Identity Card Skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <BaseSkeleton className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shrink-0" />
                <div className="flex-1 w-full space-y-3">
                  <BaseSkeleton className="h-8 w-2/3 md:w-1/2" />
                  <BaseSkeleton className="h-5 w-1/3 md:w-1/4" />
                  <BaseSkeleton className="h-16 w-full mt-4" />
                </div>
              </div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="mt-8">
              <BaseSkeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
          
          {/* Sidebar Skeleton */}
          <div className="hidden xl:block xl:w-1/3 pt-6 w-full">
            <BaseSkeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        </div>
        
        {/* Tabs Skeleton */}
        <div className="mt-12 flex space-x-4 overflow-x-auto pb-2">
          {[...Array(6)].map((_, i) => (
            <BaseSkeleton key={i} className="h-10 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="mt-8 space-y-6">
          <BaseSkeleton className="h-40 w-full rounded-2xl" />
          <BaseSkeleton className="h-40 w-full rounded-2xl" />
          <BaseSkeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
