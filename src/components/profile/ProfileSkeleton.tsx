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
            {/* Floating Identity Skeleton */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <BaseSkeleton className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-[#FAFAF9] dark:border-[#0A0F1D] shrink-0" />
                <BaseSkeleton className="h-10 w-48 rounded-full" />
              </div>
              <div className="space-y-3 pt-2">
                <BaseSkeleton className="h-8 w-1/2" />
                <BaseSkeleton className="h-4 w-1/4" />
                <BaseSkeleton className="h-14 w-full max-w-2xl" />
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
