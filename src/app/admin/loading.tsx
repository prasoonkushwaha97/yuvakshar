import React from "react";
import { PenTool } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardLoading() {
  const menuItems = Array(7).fill(0);
  const stats = Array(12).fill(0);

  return (
    <>
      {/* MOBILE MENU SKELETON */}
      <div className="md:hidden flex flex-col h-[calc(100vh-14px)] animate-pulse">
        <div className="px-6 py-8">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-2"></div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-64"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 px-6 pb-20">
          {menuItems.map((_, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800 h-32">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP DASHBOARD SKELETON */}
      <div className="hidden md:block space-y-10 max-w-7xl mx-auto p-4 md:p-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64 mb-2"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-96"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-slate-200 dark:bg-slate-800 h-10 w-32 rounded-lg"></div>
            <div className="bg-slate-100 dark:bg-slate-800/50 h-10 w-32 rounded-lg"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stats.map((_, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm h-36 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800"></div>
              </div>
              <div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
