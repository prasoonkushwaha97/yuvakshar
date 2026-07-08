import React from "react";
import { Users, FileText, MessageSquare, Eye, Bell, Activity, Clock, FileEdit, CheckCircle, AlertCircle } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    usersRes, 
    publishedArticlesRes, 
    pendingArticlesRes, 
    draftArticlesRes,
    communityRes
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabaseAdmin.from('community_posts').select('*', { count: 'exact', head: true })
  ]);

  const stats = [
    { label: "Published Articles", value: publishedArticlesRes.count || 0, icon: CheckCircle, link: "/admin/articles?status=published" },
    { label: "Pending Review", value: pendingArticlesRes.count || 0, icon: Clock, link: "/admin/articles?status=pending" },
    { label: "Drafts", value: draftArticlesRes.count || 0, icon: FileEdit, link: "/admin/articles?status=draft" },
    { label: "Total Users", value: usersRes.count || 0, icon: Users, link: "/admin/users" },
    { label: "Views Today", value: "14.2K", icon: Eye, link: "/admin/analytics" }, // Mocked until analytics table exists
    { label: "Community Posts", value: communityRes.count || 0, icon: MessageSquare, link: "/admin/community" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">Good morning. Here is what's happening across Yuvakshar today.</p>
        </div>
        <Link 
          href="/admin/articles/new" 
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          New Article
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Link href={stat.link} key={idx} className="group p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/50 rounded-xl transition-all shadow-sm hover:shadow-md block">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 group-hover:bg-primary/5 dark:group-hover:bg-primary/10 rounded-lg transition-colors">
                <stat.icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Articles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Articles</h2>
            <Link href="/admin/articles" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {/* Empty state / placeholder for recent articles feed */}
            <div className="p-8 text-center text-slate-500 text-sm">
              <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No recent articles found.</p>
            </div>
          </div>
        </div>

        {/* System Status & Notifications */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Status</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-medium">Core Services</span>
                </div>
                <span className="text-sm text-slate-500">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium">Media Pipeline</span>
                </div>
                <span className="text-sm text-slate-500">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium">Search Index</span>
                </div>
                <span className="text-sm text-slate-500">Operational</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Notifications</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
               <div className="text-center py-6 text-slate-500 text-sm">
                  <Bell className="w-6 h-6 mx-auto mb-2 opacity-20" />
                  <p>All caught up.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
