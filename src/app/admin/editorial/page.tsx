"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, AlertCircle, Edit3, Eye, FileText } from "lucide-react";
import { getAdminEditorialQueue, updateArticleStatus } from "@/lib/actions/editorialActions";
import Image from "next/image";

export default function EditorialQueuePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "submitted", "revision_requested", "draft", "scheduled", "published", "rejected"
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQueue();
  }, [filter]);

  const fetchQueue = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await getAdminEditorialQueue(filter === "all" ? undefined : filter);
    if (error) {
      setError(error);
    } else {
      setArticles(data);
    }
    setLoading(false);
  };

  const filters = [
    { id: "all", label: "All" },
    { id: "submitted", label: "Pending (Submitted)" },
    { id: "revision_requested", label: "Revision Required" },
    { id: "draft", label: "Drafts" },
    { id: "scheduled", label: "Scheduled" },
    { id: "published", label: "Published" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 lg:-m-8">
      
      {/* Header & Controls */}
      <div className="border-b border-slate-200 dark:border-slate-800 p-6 shrink-0 bg-white dark:bg-[#0F172A] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white">Admin Editorial Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Review, edit, and publish articles.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by title or author..."
              className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EA580C]"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0D1527] text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#EA580C]"
          >
            {filters.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0A0F1D] p-6">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading queue...</td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No articles found matching the current filter.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {article.image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0">
                            <Image src={article.image} alt="" fill className="object-cover" />
                          </div>
                        )}
                        <span className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                          {article.title || "Untitled"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                          {article.authorProfile?.avatar_url && (
                            <Image src={article.authorProfile.avatar_url} alt="" fill className="object-cover" />
                          )}
                        </div>
                        <span>{article.authorProfile?.name || article.author || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {article.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md font-bold uppercase">
                        {article.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(article.created_at || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/workspace/articles/new?id=${article.id}&mode=admin`}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-[#EA580C] transition-colors"
                          title="Edit & Publish"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
