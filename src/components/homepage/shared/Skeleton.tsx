"use client";

import React from "react";

export function BaseSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-800 animate-pulse rounded-sm ${className}`} />
  );
}

export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full py-6">
      {/* Left Updates Timeline */}
      <div className="lg:col-span-3 space-y-4">
        <BaseSkeleton className="h-6 w-1/2 mb-4" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <BaseSkeleton className="h-3 w-1/4" />
            <BaseSkeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      {/* Center Featured Story */}
      <div className="lg:col-span-6 space-y-4">
        <BaseSkeleton className="aspect-[16/9] w-full" />
        <BaseSkeleton className="h-3 w-12" />
        <BaseSkeleton className="h-8 w-3/4" />
        <BaseSkeleton className="h-4 w-full" />
        <BaseSkeleton className="h-4 w-full" />
        <div className="flex space-x-3 pt-3">
          <BaseSkeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <BaseSkeleton className="h-3 w-1/4" />
            <BaseSkeleton className="h-3 w-1/6" />
          </div>
        </div>
      </div>
      {/* Right Editor's Picks */}
      <div className="lg:col-span-3 space-y-4">
        <BaseSkeleton className="h-6 w-1/2 mb-4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <BaseSkeleton className="w-16 h-16 shrink-0" />
            <div className="space-y-2 flex-1">
              <BaseSkeleton className="h-4 w-full" />
              <BaseSkeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="space-y-4 w-full py-4">
      <BaseSkeleton className="h-8 w-1/4 mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Story */}
        <div className="lg:col-span-6 space-y-3">
          <BaseSkeleton className="aspect-[16/10] w-full" />
          <BaseSkeleton className="h-3 w-12" />
          <BaseSkeleton className="h-6 w-3/4" />
          <BaseSkeleton className="h-4 w-full" />
          <BaseSkeleton className="h-3 w-1/3" />
        </div>
        {/* 4 Small Lists */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 border border-gray-150 dark:border-gray-800 p-3 rounded-md">
              <BaseSkeleton className="h-3 w-12" />
              <BaseSkeleton className="h-5 w-full" />
              <BaseSkeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VideoSkeleton() {
  return (
    <div className="space-y-4 w-full py-6">
      <BaseSkeleton className="h-8 w-1/4 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <BaseSkeleton className="aspect-video w-full" />
            <BaseSkeleton className="h-5 w-3/4" />
            <BaseSkeleton className="h-3.5 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MagazineSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 items-center">
      <div className="md:col-span-4 flex justify-center">
        <BaseSkeleton className="w-[200px] h-[280px] shadow-lg" />
      </div>
      <div className="md:col-span-8 space-y-4">
        <BaseSkeleton className="h-4 w-24" />
        <BaseSkeleton className="h-10 w-2/3" />
        <BaseSkeleton className="h-4 w-full" />
        <BaseSkeleton className="h-4 w-5/6" />
        <div className="flex space-x-3 pt-4">
          <BaseSkeleton className="h-10 w-32" />
          <BaseSkeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

export function OpinionSkeleton() {
  return (
    <div className="space-y-4 w-full py-4">
      <BaseSkeleton className="h-8 w-1/4 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center text-center p-6 border border-gray-150 dark:border-gray-800 rounded-md">
            <BaseSkeleton className="w-16 h-16 rounded-full mb-3" />
            <BaseSkeleton className="h-4 w-1/2 mb-1" />
            <BaseSkeleton className="h-3 w-1/3 mb-4" />
            <BaseSkeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}


export function AuthorsSkeleton() {
  return (
    <div className="py-4">
      <BaseSkeleton className="h-8 w-1/4 mb-4" />
      <div className="flex space-x-6 overflow-x-auto py-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 bg-white dark:bg-black p-3 border border-gray-150 dark:border-gray-800 rounded-lg min-w-[200px]">
            <BaseSkeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-grow">
              <BaseSkeleton className="h-4 w-3/4" />
              <BaseSkeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewsletterSkeleton() {
  return (
    <div className="bg-[#111] dark:bg-[#1A1A1A] p-8 rounded-lg space-y-4">
      <BaseSkeleton className="h-4 w-24 bg-gray-700" />
      <BaseSkeleton className="h-8 w-1/3 bg-gray-700" />
      <BaseSkeleton className="h-4 w-2/3 bg-gray-700" />
      <div className="flex flex-col sm:flex-row gap-3 max-w-md pt-2">
        <BaseSkeleton className="h-10 flex-grow bg-gray-700" />
        <BaseSkeleton className="h-10 w-28 bg-gray-700" />
      </div>
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="space-y-4 w-full py-4">
      <BaseSkeleton className="h-8 w-1/4 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border border-gray-150 dark:border-gray-800 rounded-md space-y-3">
            <BaseSkeleton className="h-3 w-12" />
            <BaseSkeleton className="h-12 w-full" />
            <div className="flex justify-between items-center pt-2">
              <BaseSkeleton className="h-6 w-16" />
              <BaseSkeleton className="h-4 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
