"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Clock, FileText, CheckCircle2, AlertCircle, Edit3, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function ArticlesDashboardClient({ initialSubmissions, error }: { initialSubmissions: any[], error?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = searchParams.get("tab") || "drafts";

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch(s) {
      case "draft": return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">ड्राफ्ट (Draft)</span>;
      case "submitted": return <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">प्रेषित (Submitted)</span>;
      case "under_review": return <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">समीक्षाधीन (Under Review)</span>;
      case "revision_requested": return <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 font-hindi"><AlertCircle className="w-3 h-3"/> संशोधन आवश्यक (Revision Needed)</span>;
      case "scheduled": return <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">निर्धारित (Scheduled)</span>;
      case "published": return <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 font-hindi"><CheckCircle2 className="w-3 h-3"/> प्रकाशित (Published)</span>;
      case "rejected": return <span className="bg-slate-800 dark:bg-slate-700 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">अस्वीकृत (Rejected)</span>;
      default: return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">{status}</span>;
    }
  };

  const tabs = [
    { id: "drafts", label: "Drafts" },
    { id: "submitted", label: "Submitted" },
    { id: "revision_requested", label: "Revision Required" },
    { id: "scheduled", label: "Scheduled" },
    { id: "published", label: "Published" },
    { id: "rejected", label: "Rejected" },
  ];

  const filteredSubs = initialSubmissions.filter((s: any) => {
    const status = s.status?.toLowerCase() || "draft";
    if (tab === "drafts") return status === "draft";
    if (tab === "submitted") return status === "submitted" || status === "under_review";
    if (tab === "revision_requested") return status === "revision_requested";
    if (tab === "scheduled") return status === "scheduled";
    if (tab === "published") return status === "published" || status === "accepted";
    if (tab === "rejected") return status === "rejected";
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
          My Articles
        </h2>
        <Link 
          href="/workspace/articles/new"
          className="hidden lg:inline-flex items-center gap-2 bg-[#EA580C] text-white font-bold py-2.5 px-6 rounded-xl hover:bg-[#C2410C] transition-colors font-hindi shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" /> नया लेख
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar space-x-1 border-b border-gray-200 dark:border-gray-800 mb-6 pb-px">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => router.push(`${pathname}?tab=${t.id}`)}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              tab === t.id 
                ? "border-[#EA580C] text-[#EA580C]" 
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-hindi flex gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-[#0D1527] border border-[#E7E2D8] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-[#E7E2D8] dark:divide-slate-800/80">
          {filteredSubs.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-[#E7E2D8] dark:border-slate-700">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-2 font-hindi">
                कोई लेख नहीं (No Articles)
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm leading-relaxed mb-6">
                इस श्रेणी में कोई लेख नहीं मिला।
              </p>
            </div>
          ) : (
            filteredSubs.map((sub: any) => (
              <div key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(sub.status)}
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> {new Date(sub.updated_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold font-serif text-slate-900 dark:text-white line-clamp-1 font-hindi">
                      {sub.title || sub.english_title || "Untitled Article"}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <Link 
                      href={`/workspace/articles/submission/${sub.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0A0F1D] border border-[#E7E2D8] dark:border-slate-700 hover:border-[#EA580C] dark:hover:border-[#EA580C] hover:text-[#EA580C] dark:hover:text-[#EA580C] rounded-lg text-sm font-bold transition-colors font-hindi"
                    >
                      {sub.status?.toLowerCase() === "revision_requested" || sub.status?.toLowerCase() === "draft" ? (
                        <><Edit3 className="w-4 h-4" /> संपादित करें (Edit)</>
                      ) : (
                        <><FileText className="w-4 h-4" /> विवरण (View)</>
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
