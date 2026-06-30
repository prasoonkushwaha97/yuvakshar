"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Clock, FileText, CheckCircle2, AlertCircle, Edit3 } from "lucide-react";

export default function ContributorDashboard() {
  const [submissions] = useState<any[]>([]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "draft": return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold uppercase">Draft</span>;
      case "submitted": return <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold uppercase">Submitted</span>;
      case "under_review": return <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-xs font-bold uppercase">Under Review</span>;
      case "revision_requested": return <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Revision Requested</span>;
      case "accepted": return <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-bold uppercase">Accepted</span>;
      case "published": return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Published</span>;
      case "rejected": return <span className="bg-slate-800 text-white px-2 py-1 rounded-md text-xs font-bold uppercase">Declined</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 dark:text-white">My Submissions</h1>
          <p className="text-slate-500 mt-1">Manage your drafts and track editorial progress</p>
        </div>
        <Link 
          href="/contribute/new"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" /> New Submission
        </Link>
      </div>

      {/* Metrics / Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Submissions</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">12</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-1">Published</p>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">8</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
          <p className="text-amber-700 dark:text-amber-400 text-sm font-medium mb-1">Under Review</p>
          <p className="text-3xl font-black text-amber-700 dark:text-amber-400">1</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
          <p className="text-red-700 dark:text-red-400 text-sm font-medium mb-1">Action Required</p>
          <p className="text-3xl font-black text-red-700 dark:text-red-400">1</p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
           <h3 className="font-bold text-slate-900 dark:text-white">Recent Submissions</h3>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {submissions.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No submissions yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">
                You haven't submitted any articles yet. Start writing and share your story with the world.
              </p>
              <Link 
                href="/contribute/new"
                className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2 px-6 rounded-xl hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Start Writing
              </Link>
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                 
                 <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                     {getStatusBadge(sub.status)}
                     <span className="text-sm text-slate-500 flex items-center gap-1">
                       <Clock className="w-3.5 h-3.5" /> {sub.updatedAt}
                     </span>
                   </div>
                   <h4 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                     {sub.title}
                   </h4>
                 </div>

                 <div className="flex items-center gap-4">
                   {sub.messages > 0 && (
                     <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                       {sub.messages} Editor Message{sub.messages > 1 ? 's' : ''}
                     </span>
                   )}
                   <Link 
                     href={`/contribute/submission/${sub.id}`}
                     className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
                   >
                     {sub.status === "revision_requested" ? (
                       <><Edit3 className="w-4 h-4" /> Edit & Reply</>
                     ) : (
                       <><FileText className="w-4 h-4" /> View Details</>
                     )}
                   </Link>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}
