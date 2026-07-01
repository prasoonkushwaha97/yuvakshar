"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, GripHorizontal, ArrowRight } from "lucide-react";

export default function EditorialQueuePage() {
  const [columns] = useState([
    { id: "draft", title: "Drafts" },
    { id: "pending", title: "Pending Review" },
    { id: "review", title: "Under Review" },
    { id: "fact-check", title: "Fact Check" },
    { id: "ready", title: "Ready" },
    { id: "published", title: "Published" },
  ]);

  // Dummy fallback data for articles in various states
  const [articles] = useState([
    { id: "doc-1", title: "The Evolution of Digital Hindi Journalism", author: "Rahul Sharma", column: "draft", source: "Staff" },
    { id: "doc-2", title: "Understanding the New Budget 2026", author: "Priya Singh", column: "pending", source: "Public Submission" },
    { id: "doc-3", title: "Climate Change: Local Impact", author: "Amit Patel", column: "review", source: "Guest" },
    { id: "doc-4", title: "Tech Trends for Next Year", author: "Rahul Sharma", column: "ready", source: "Staff" },
  ]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 lg:-m-8">
      
      {/* Header & Controls */}
      <div className="border-b border-slate-200 dark:border-slate-800 p-6 shrink-0 bg-white dark:bg-[#0F172A] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white">Editorial Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Manage the complete publishing workflow</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="सामग्री खोजें..."
              className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900">
            <Filter className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> New Article
          </button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50/50 dark:bg-slate-950 p-6">
        <div className="flex h-full gap-6 min-w-max pb-4">
          
          {columns.map(col => {
            const colArticles = articles.filter(a => a.column === col.id);
            
            return (
              <div key={col.id} className="w-80 flex flex-col h-full bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between shrink-0">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    {col.title}
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">
                      {colArticles.length}
                    </span>
                  </h3>
                  <GripHorizontal className="w-4 h-4 text-slate-400 cursor-grab" />
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {colArticles.map(article => (
                    <Link 
                      href={`/admin/editorial/${article.id}`} 
                      key={article.id}
                      className="block bg-white dark:bg-[#1E293B] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          article.source === 'Staff' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          article.source === 'Guest' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {article.source}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-tight">
                        {article.title}
                      </h4>
                      
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {article.author.charAt(0)}
                        </div>
                        <span className="truncate">{article.author}</span>
                      </div>
                    </Link>
                  ))}
                  
                  {colArticles.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-sm text-slate-400">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
        </div>
      </div>
      
    </div>
  );
}

export const dynamic = 'force-dynamic';
