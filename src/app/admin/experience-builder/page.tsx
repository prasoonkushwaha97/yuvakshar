"use client";

import React from "react";
import Link from "next/link";
import { Plus, Layout, Settings } from "lucide-react";

export default function ExperienceBuilderList() {
  const experiences = [
    { id: "exp-1", name: "Main Homepage", type: "homepage", status: "published", updated: "2 hours ago" },
    { id: "exp-2", name: "Diwali Special Campaign", type: "landing_page", status: "draft", updated: "Yesterday" },
    { id: "exp-3", name: "About Us", type: "static_page", status: "published", updated: "1 month ago" },
    { id: "exp-4", name: "National News Category", type: "category_page", status: "published", updated: "3 days ago" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8">
      
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 dark:text-white">Experience Builder</h1>
          <p className="text-slate-500 mt-1">Manage dynamic pages, layouts, and public experiences</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" /> New Experience
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Experience Cards */}
        {experiences.map(exp => (
          <div key={exp.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-lg transition-shadow group">
            
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                exp.type === 'homepage' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                exp.type === 'landing_page' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {exp.type.replace("_", " ")}
              </span>
              <span className={`w-2 h-2 rounded-full ${exp.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{exp.name}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mb-6">
              Last updated {exp.updated}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Link 
                href={`/admin/experience-builder/${exp.id}`}
                className="flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors"
              >
                <Layout className="w-4 h-4" /> Builder
              </Link>
              <button className="flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </button>
            </div>
            
          </div>
        ))}

      </div>

    </div>
  );
}

export const dynamic = 'force-dynamic';
