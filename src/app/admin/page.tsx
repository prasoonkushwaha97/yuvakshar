import React from "react";
import { Users, FileText, MessageSquare, BookOpen } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [usersRes, articlesRes, communityRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('community_posts').select('*', { count: 'exact', head: true })
  ]);

  const totalUsers = usersRes.count || 0;
  const totalArticles = articlesRes.count || 0;
  const totalPosts = communityRes.count || 0;

  const statCards = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Total Articles", value: totalArticles, icon: FileText, color: "text-emerald-500" },
    { label: "Community Posts", value: totalPosts, icon: MessageSquare, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Admin Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards?.map((stat, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-full bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
