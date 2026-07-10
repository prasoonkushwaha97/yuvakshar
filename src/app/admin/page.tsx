import React from "react";
import { Users, FileText, MessageSquare, BookOpen, AlertTriangle, Clock, CheckCircle, PenTool, LayoutDashboard, FolderTree, ImageIcon, Bell, Settings, Edit3, XCircle, Archive, Star, UserPlus } from "lucide-react";
import { dashboardAnalyticsService } from "@/lib/dashboardAnalyticsService";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const data = await dashboardAnalyticsService.getDashboardStats();

  const stats = [
    { label: "Published Articles", value: data.publishedArticles, icon: CheckCircle, link: "/admin/articles?tab=published", color: "text-green-500" },
    { label: "Drafts", value: data.draftArticles, icon: PenTool, link: "/admin/articles?tab=drafts" },
    { label: "Pending Review", value: data.pendingReview, icon: Clock, link: "/admin/articles?tab=pending", color: "text-orange-500" },
    { label: "Needs Revision", value: data.needsRevision, icon: Edit3, link: "/admin/articles?tab=revision" },
    { label: "Rejected", value: data.rejectedArticles, icon: XCircle, link: "/admin/articles?tab=rejected", color: "text-red-500" },
    { label: "Archived", value: data.archivedArticles, icon: Archive, link: "/admin/articles?tab=archived" },
    { label: "Featured Articles", value: data.featuredArticles, icon: Star, link: "/admin/articles?featured=true", color: "text-yellow-500" },
    { label: "Priority Assignments", value: data.priorityAssignments, icon: AlertTriangle, link: "/admin/articles?tab=priority", color: "text-red-600" },
    { label: "Magazine Issues", value: data.magazineIssues, icon: BookOpen, link: "/admin/magazine", color: "text-indigo-500" },
    { label: "Editorial Team", value: data.editorialTeamMembers, icon: Users, link: "/admin/users", color: "text-blue-500" },
    { label: "Community Users", value: data.communityUsers, icon: MessageSquare, link: "/admin/users" },
    { label: "Total Users", value: data.totalUsers, icon: UserPlus, link: "/admin/users", color: "text-purple-500" },
  ];

  const menuItems = [
    { name: "Articles", href: "/admin/articles", icon: FileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { name: "Categories", href: "/admin/categories", icon: FolderTree, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { name: "Magazine", href: "/admin/magazine", icon: BookOpen, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { name: "Chaupaal", href: "/admin/community", icon: MessageSquare, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    { name: "Users", href: "/admin/users", icon: Users, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
    { name: "Media", href: "/admin/media", icon: ImageIcon, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { name: "Settings", href: "/admin/cms/settings", icon: Settings, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-900/20" },
  ];

  return (
    <>
    {/* MOBILE MENU (App Drawer Style) */}
    <div className="md:hidden flex flex-col h-[calc(100vh-14px)]">
      <div className="px-6 py-8">
        <h1 className="text-3xl font-serif font-black text-primary tracking-tight">Yuvakshar<span className="text-slate-800 dark:text-white">Admin</span></h1>
        <p className="text-slate-500 mt-2 text-sm">Select an app to manage content.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 px-6 pb-20">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform">
              <div className={`p-4 rounded-full ${item.bg} ${item.color}`}>
                <Icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>

    {/* DESKTOP DASHBOARD */}
    <div className="hidden md:block space-y-10 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Editorial Dashboard</h1>
          <p className="text-slate-500 mt-1">Good morning. Here is the current state of the newsroom.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/admin/articles/new" 
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            New Article
          </Link>
          <Link 
            href="/admin/media" 
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Media Library
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.link} key={idx} className="group p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/50 rounded-xl transition-all shadow-sm hover:shadow-md block">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500'} group-hover:bg-primary/10 transition-colors`}>
                  <Icon className={`w-6 h-6 group-hover:text-primary transition-colors`} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</h3>
              <p className="text-slate-500 font-medium">{stat.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
    </>
  );
}
