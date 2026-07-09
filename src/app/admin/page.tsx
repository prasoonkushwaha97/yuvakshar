import React from "react";
import { Users, FileText, MessageSquare, BookOpen, AlertTriangle, Clock, CheckCircle, PenTool } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    publishedArticlesRes, 
    submittedArticlesRes, 
    draftArticlesRes,
    priorityArticlesRes,
    magazineRes,
    usersRes
  ] = await Promise.all([
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).in('status', ['submitted', 'revision_requested']),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('priority', 'urgent'),
    supabaseAdmin.from('magazine_issues').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
  ]);

  const stats = [
    { label: "Published Articles", value: publishedArticlesRes.count || 0, icon: CheckCircle, link: "/admin/articles?tab=published" },
    { label: "Pending Review", value: submittedArticlesRes.count || 0, icon: Clock, link: "/admin/articles?tab=pending" },
    { label: "Drafts", value: draftArticlesRes.count || 0, icon: PenTool, link: "/admin/articles?tab=drafts" },
    { label: "Priority Assignments", value: priorityArticlesRes.count || 0, icon: AlertTriangle, link: "/admin/articles?tab=priority", color: "text-red-500" },
    { label: "Magazine Issues", value: magazineRes.count || 0, icon: BookOpen, link: "/admin/magazine" },
    { label: "Total Users", value: usersRes.count || 0, icon: Users, link: "/admin/users" },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-4 md:p-6">
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
  );
}
