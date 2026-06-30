"use client";

import React, { useState } from "react";
import { Plus, GripVertical, Settings2, Trash2, Link as LinkIcon, Lock } from "lucide-react";

export default function NavigationBuilder() {
  const [navItems] = useState([
    { id: "n1", title: "Home", url: "/", visibility: "public" },
    { id: "n2", title: "Current Affairs", url: "/current-affairs", visibility: "public" },
    { id: "n3", title: "Magazine", url: "/magazine", visibility: "public", badge: "New" },
    { id: "n4", title: "Community", url: "/community", visibility: "registered" },
    { id: "n5", title: "Contributor Portal", url: "/contribute", visibility: "public" },
  ]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 dark:text-white">Navigation Builder</h1>
          <p className="text-slate-500 mt-1">Manage header, footer, and mobile menus</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" /> Add Link
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
        
        {/* Menu Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-1 bg-slate-50/50 dark:bg-slate-900/50">
          <button className="flex-1 py-2 text-sm font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl shadow-sm">Header Menu</button>
          <button className="flex-1 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Footer Menu</button>
          <button className="flex-1 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Mobile Drawer</button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {navItems.map((item, _i) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl group cursor-move hover:border-primary transition-colors">
                
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                      {item.badge && (
                        <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.visibility === 'registered' && (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <span className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <LinkIcon className="w-3 h-3" /> {item.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2.5 px-6 rounded-xl">
              Save Navigation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
