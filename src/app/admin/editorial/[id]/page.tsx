"use client";

import React, { useState } from "react";
import { UniversalEditor } from "@/domains/editorial/components/UniversalEditor";
import { ContentDocument } from "@/domains/editorial/types/schema";
import { 
  Save, 
  Settings, 
  History, 
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Eye,
  Monitor,
  Tablet,
  Smartphone
} from "lucide-react";

export default function EditorialWorkspace() {
  const [activeTab, setActiveTab] = useState<"settings" | "timeline" | "comments">("settings");
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  // Dummy initial document
  const [document, setDocument] = useState<ContentDocument>({
    schemaVersion: 1,
    id: "draft-123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "user-1",
    blocks: [
      {
        id: "b1",
        type: "heading",
        order: 0,
        content: { text: "The Future of Digital Publishing", level: 2 }
      },
      {
        id: "b2",
        type: "paragraph",
        order: 1,
        content: { text: "Yuvakshar is evolving into a modern content ecosystem powered by a universal block engine." }
      }
    ]
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 lg:-m-8">
      
      {/* Center Panel: Editor */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0F172A]">
        {/* Editor Toolbar */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
           <div className="flex items-center gap-4">
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
             <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
             <span className="text-sm text-slate-500 flex items-center gap-1">
               <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Saved automatically
             </span>
           </div>
           
           <div className="flex items-center gap-3">
             <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 px-3 py-1.5">
               Preview
             </button>
             <button className="bg-primary text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
               Publish
             </button>
           </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <div className={`mx-auto transition-all duration-300 ${
            previewMode === 'mobile' ? 'max-w-sm border-x border-slate-200 dark:border-slate-800 shadow-2xl h-full' : 
            previewMode === 'tablet' ? 'max-w-2xl border-x border-slate-200 dark:border-slate-800 shadow-xl h-full' : 
            'max-w-4xl'
          }`}>
            <UniversalEditor 
              initialDocument={document} 
              onChange={setDocument} 
            />
          </div>
        </div>
      </div>

      {/* Right Panel: Settings & Meta */}
      <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col shrink-0">
        
        {/* Right Panel Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-1 shrink-0">
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-900'}`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button 
            onClick={() => setActiveTab("timeline")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'timeline' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-900'}`}
          >
            <History className="w-4 h-4" /> Timeline
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {activeTab === "settings" && (
            <div className="space-y-6">
              
              {/* Publishing Validation Warnings */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl p-3">
                <h4 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Pre-flight Validation
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-4 list-disc">
                  <li>Featured Image is missing</li>
                  <li>Meta Description is too short</li>
                  <li>Category not selected</li>
                </ul>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Workflow Status</label>
                <select className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option>Draft</option>
                  <option>Pending Review</option>
                  <option>Under Review</option>
                  <option>Ready to Publish</option>
                </select>
              </div>

              {/* Featured Image */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Featured Image</label>
                <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                  <span className="text-sm font-medium text-slate-500">Upload Image</span>
                </div>
              </div>

              {/* Assignments */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Assignments</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Author</span>
                    <span className="font-medium text-slate-900 dark:text-white">Rahul Sharma</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Editor</span>
                    <span className="font-medium text-primary hover:underline cursor-pointer">Assign...</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-4">
               {/* Timeline items fallback */}
               <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                 
                 <div className="relative">
                   <div className="absolute -left-[21px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950"></div>
                   <p className="text-sm font-medium text-slate-900 dark:text-white">Draft Created</p>
                   <p className="text-xs text-slate-500 mt-0.5">Today at 10:42 AM by Rahul Sharma</p>
                 </div>

                 <div className="relative">
                   <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-950"></div>
                   <p className="text-sm font-medium text-slate-900 dark:text-white">Submitted for Review</p>
                   <p className="text-xs text-slate-500 mt-0.5">Today at 2:15 PM by Rahul Sharma</p>
                 </div>

               </div>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
