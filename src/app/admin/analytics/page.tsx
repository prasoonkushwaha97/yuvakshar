"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Download, Calendar, Users, FileText, ShieldAlert, Bell, LayoutTemplate, MessageSquare } from "lucide-react";
import { globalAnalyticsEngine } from "../../../domains/platform/analytics/services/analyticsEngine";
import { GlobalAnalytics } from "../../../domains/platform/analytics/types/analytics";

export default function AnalyticsCenter() {
  const [metrics, setMetrics] = useState<GlobalAnalytics | null>(null);
  const [dateRange, setDateRange] = useState("Month");
  const [activeDomain, setActiveDomain] = useState<"editorial" | "contributors" | "community" | "homepage" | "security" | "notifications">("editorial");

  useEffect(() => {
    globalAnalyticsEngine.getExecutiveMetrics(dateRange).then(setMetrics);
  }, [dateRange]);

  if (!metrics) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 lg:-m-8 bg-slate-50 dark:bg-slate-950">
      
      {/* Top Toolbar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Publishing Intelligence
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="Today">Today</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
            <option value="Year">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Navigation */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shrink-0 overflow-y-auto hidden md:block">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Analytics Domains</h3>
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => setActiveDomain("editorial")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeDomain === 'editorial' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <FileText className="w-4 h-4" /> Editorial
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveDomain("contributors")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeDomain === 'contributors' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <Users className="w-4 h-4" /> Contributors
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveDomain("community")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeDomain === 'community' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <MessageSquare className="w-4 h-4" /> Community
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveDomain("homepage")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeDomain === 'homepage' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <LayoutTemplate className="w-4 h-4" /> Homepage
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveDomain("security")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeDomain === 'security' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <ShieldAlert className="w-4 h-4" /> Security
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveDomain("notifications")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeDomain === 'notifications' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <Bell className="w-4 h-4" /> Notifications
              </button>
            </li>
          </ul>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-white dark:bg-[#0F172A] overflow-y-auto p-6 lg:p-8">
          
          <div className="max-w-5xl mx-auto">
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeDomain} Intelligence</h3>
              <p className="text-sm text-slate-500">Event-driven metrics for the {dateRange.toLowerCase()} period.</p>
            </div>

            {/* Dynamic Grid based on Domain */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {activeDomain === "editorial" && (
                <>
                  <MetricCard title="Articles Published" value={metrics.editorial.articlesPublishedCount} trend="+12%" />
                  <MetricCard title="Pending Review" value={metrics.editorial.pendingReviewCount} isWarning={metrics.editorial.pendingReviewCount > 10} />
                  <MetricCard title="Avg Review Time" value={`${metrics.editorial.averageReviewTimeHours}h`} />
                  <MetricCard title="Avg Publish Time" value={`${metrics.editorial.averagePublishTimeHours}h`} />
                </>
              )}

              {activeDomain === "contributors" && (
                <>
                  <MetricCard title="Total Submissions" value={metrics.contributors.totalSubmissions} trend="+5%" />
                  <MetricCard title="Accepted" value={metrics.contributors.acceptedCount} />
                  <MetricCard title="Rejected" value={metrics.contributors.rejectedCount} />
                  <MetricCard title="Revision Requested" value={metrics.contributors.revisionRequestedCount} />
                </>
              )}

              {activeDomain === "community" && (
                <>
                  <MetricCard title="Active Users" value={metrics.community.activeUsersCount} trend="+2%" />
                  <MetricCard title="Total Reports" value={metrics.community.totalReports} />
                  <MetricCard title="Avg Moderation Time" value={`${metrics.community.averageModerationTimeHours}h`} />
                </>
              )}

              {activeDomain === "homepage" && (
                <>
                  <MetricCard title="Featured Articles" value={metrics.homepage.featuredArticlesCount} />
                  <MetricCard title="Manual Sections" value={metrics.homepage.manualSectionsCount} />
                  <MetricCard title="Automatic Sections" value={metrics.homepage.automaticSectionsCount} />
                </>
              )}

              {activeDomain === "security" && (
                <>
                  <MetricCard title="Active Sessions" value={metrics.security.activeSessionsCount} />
                  <MetricCard title="Failed Logins" value={metrics.security.failedLoginsCount} isWarning={metrics.security.failedLoginsCount > 20} />
                  <MetricCard title="High Risk Events" value={metrics.security.highRiskEventsCount} isWarning={metrics.security.highRiskEventsCount > 0} />
                </>
              )}

              {activeDomain === "notifications" && (
                <>
                  <MetricCard title="Sent" value={metrics.notifications.sentCount} />
                  <MetricCard title="Delivered" value={metrics.notifications.deliveredCount} />
                  <MetricCard title="Failed" value={metrics.notifications.failedCount} isWarning={metrics.notifications.failedCount > 10} />
                  <MetricCard title="Delivery Rate" value={`${Math.round((metrics.notifications.deliveredCount / metrics.notifications.sentCount) * 100)}%`} />
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, isWarning }: { title: string, value: string | number, trend?: string, isWarning?: boolean }) {
  return (
    <div className={`bg-slate-50 dark:bg-slate-900 border ${isWarning ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-6 shadow-sm`}>
      <h4 className="text-sm font-medium text-slate-500 mb-2">{title}</h4>
      <div className="flex items-end justify-between">
         <span className={`text-3xl font-bold ${isWarning ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{value}</span>
         {trend && (
           <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-lg">
             <TrendingUp className="w-3 h-3 mr-1" /> {trend}
           </span>
         )}
      </div>
    </div>
  );
}
