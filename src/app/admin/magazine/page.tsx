import React from "react";
import Image from "next/image";
import { getMagazineIssues } from "@/lib/actions/magazineActions";
import { hasPermission } from "@/lib/rbacService";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateIssueModal from "@/components/founder/magazine/CreateIssueModal";

export const dynamic = "force-dynamic";

export default async function MagazineDashboard() {
  const canAccess = await hasPermission("manage_system");
  if (!canAccess) redirect("/admin/unauthorized");

  const issues = await getMagazineIssues();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Magazine Issues</h1>
          <p className="text-slate-500 mt-1">Manage digital editions, compile articles, and publish issues.</p>
        </div>
        <CreateIssueModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {issues?.map(issue => (
          <div key={issue.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 relative overflow-hidden">
              {issue.cover_image ? (
                 <Image src={issue.cover_image} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" fill />
              ) : (
                "No Cover"
              )}
              <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 text-xs rounded-md font-medium shadow-sm ${
                    issue.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/90 dark:text-white' :
                    issue.status === 'draft' ? 'bg-slate-100 text-slate-700 dark:bg-slate-600/90 dark:text-white' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-500/90 dark:text-white'
                  }`}>
                    {issue.status.replace('_', ' ').toUpperCase()}
                  </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">{issue.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Vol {issue.volume} &bull; Issue {issue.issue_number}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <Link href={`/admin/magazine/builder/${issue.id}`} className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1">
                  Open Builder <span aria-hidden="true">&rarr;</span>
                </Link>
                <span className="text-xs text-slate-400 font-medium">{new Date(issue.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {issues.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Magazine Issues</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">Create your first digital edition to start building the magazine layout.</p>
        </div>
      )}
    </div>
  );
}
