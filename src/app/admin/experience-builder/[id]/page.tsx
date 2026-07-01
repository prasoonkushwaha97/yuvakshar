"use client";

import React, { useState } from "react";
import { GripVertical, Settings2, Trash2, Monitor, Tablet, Smartphone, Save, Calendar, Layout } from "lucide-react";

export default function ExperienceBuilderCanvas() {
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  // Dummy Sections based on the generic ExperienceEngine
  const [sections] = useState([
    { id: "s1", type: "Hero Section", layout: "Classic Focus", content: "Editorial Picks" },
    { id: "s2", type: "Latest News Grid", layout: "Masonry 4-Col", content: "Latest from Database" },
    { id: "s3", type: "Partner Block", layout: "Carousel", content: "Active Partners" },
  ]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 lg:-m-8">
      
      {/* Top Toolbar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-4 flex items-center justify-between shrink-0">
        
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-slate-900 dark:text-white">Main Homepage</h2>
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">Published</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Device Toggles */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
             <button onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
               <Monitor className="w-4 h-4" />
             </button>
             <button onClick={() => setPreviewMode("tablet")} className={`p-1.5 rounded-md transition-colors ${previewMode === 'tablet' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
               <Tablet className="w-4 h-4" />
             </button>
             <button onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
               <Smartphone className="w-4 h-4" />
             </button>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900">
               <Calendar className="w-4 h-4" /> Schedule
             </button>
             <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors">
               <Save className="w-4 h-4" /> Save Draft
             </button>
             <button className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
               Publish Changes
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar (Sections & Blocks) */}
        <div className="w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Add Section</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium hover:border-primary transition-colors flex flex-col items-center gap-2 text-slate-600 dark:text-slate-300">
                <Layout className="w-5 h-5 text-primary" /> Hero
              </button>
              <button className="p-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium hover:border-primary transition-colors flex flex-col items-center gap-2 text-slate-600 dark:text-slate-300">
                <GripVertical className="w-5 h-5 text-emerald-500" /> Grid
              </button>
              {/* More buttons */}
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Current Structure</h3>
            <div className="space-y-2">
              {sections.map(section => (
                <div key={section.id} className="group flex items-center justify-between p-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl cursor-move hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{section.type}</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{section.layout}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button className="p-1 text-slate-400 hover:text-blue-500"><Settings2 className="w-4 h-4" /></button>
                    <button className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-slate-100 dark:bg-black overflow-y-auto p-8 flex justify-center">
          
          <div className={`transition-all duration-300 bg-white dark:bg-[#0F172A] min-h-[800px] border border-slate-200 dark:border-slate-800 shadow-2xl relative ${
            previewMode === 'mobile' ? 'w-[375px] rounded-3xl overflow-hidden' : 
            previewMode === 'tablet' ? 'w-[768px] rounded-2xl' : 
            'w-full max-w-[1200px] rounded-2xl'
          }`}>
            
            {/* fallback Visual Render of Sections */}
            <div className="p-10 space-y-8 pointer-events-none opacity-50">
               <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                <h2 className="text-2xl font-black text-slate-400">Hero Render Container</h2>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="h-40 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                   <h2 className="font-bold text-slate-400">Latest (Col 1)</h2>
                 </div>
                 <div className="h-40 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                   <h2 className="font-bold text-slate-400">Latest (Col 2)</h2>
                 </div>
               </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar (Contextual Settings) */}
        <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 overflow-y-auto shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" /> Section Settings
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Layout Preset</label>
              <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                <option>Classic Newspaper</option>
                <option>Modern Magazine</option>
                <option>Hero Focus</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Content Source</label>
              <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                <option>Latest Articles</option>
                <option>Category: Politics</option>
                <option>Category: Tech</option>
                <option>Editorial Picks</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Item Count</label>
              <input type="number" defaultValue={6} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
