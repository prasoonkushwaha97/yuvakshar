"use client";

import React, { useEffect, useState } from "react";
import { getSystemMetrics } from "@/lib/actions/systemActions";
import { Activity, Users, ShieldAlert, FileText, CheckSquare, Settings2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function SystemOperationsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const data = await getSystemMetrics();
        setMetrics(data);
      } catch (err) {
        toast.error("Failed to fetch system metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 animate-pulse flex items-center space-x-2">
          <Settings2 className="w-5 h-5 animate-spin" />
          <span>Loading operations data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
            <Settings2 className="w-6 h-6 mr-3 text-primary" />
            System Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry and overview of platform activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Users Metric */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Users className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Users</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white relative z-10">
            {metrics?.totalUsers.toLocaleString()}
          </div>
        </div>

        {/* Roles Metric */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldAlert className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Roles Assigned</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white relative z-10">
            {metrics?.activeRolesAssigned.toLocaleString()}
          </div>
        </div>

        {/* Audit Metric */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Audit Events</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white relative z-10">
            {metrics?.auditEvents.toLocaleString()}
          </div>
        </div>

        {/* Published Articles Metric */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <FileText className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Published Articles</span>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white relative z-10">
            {metrics?.publishedArticles.toLocaleString()}
          </div>
        </div>

        {/* Pending Reviews Metric */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CheckSquare className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Pending Reviews</span>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white relative z-10">
            {metrics?.pendingReviews.toLocaleString()}
          </div>
        </div>

        {/* Open Reports Metric */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <BarChart3 className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Open Moderation Reports</span>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white relative z-10">
            {metrics?.openReports.toLocaleString()}
          </div>
        </div>

      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
