"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

export default function AdminModerationPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
            <ShieldAlert className="w-6 h-6 mr-3 text-primary" />
            User Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and moderate community behavior and user accounts.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Moderation Interface Pipeline</h3>
        <p className="text-slate-500 max-w-lg mx-auto">
          This modular workspace is currently being provisioned. Features from the legacy monolithic dashboard will be incrementally migrated here.
        </p>
      </div>
    </div>
  );
}
