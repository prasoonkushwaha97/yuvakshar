"use client";

import React from "react";
import { Search, Shield, Filter, FileText, CheckCircle } from "lucide-react";

export default function ModeratorDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
            <Shield className="w-6 h-6 mr-3 text-primary" />
            Moderator Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review community flags, moderate articles, and maintain platform standards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric Cards */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-slate-500">Pending Flags</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">12</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <Filter className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-slate-500">Articles to Review</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">8</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-slate-500">Resolved Today</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">24</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center mt-6">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Moderation Queue</h3>
        <p className="text-slate-500 max-w-lg mx-auto">
          The queue pipeline is currently being migrated to this unified dashboard. Please continue using the legacy administration panel for immediate moderation tasks.
        </p>
      </div>
    </div>
  );
}
