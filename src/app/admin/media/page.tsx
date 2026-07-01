"use client";

import React, { useState } from "react";
import { Upload, FolderPlus, Search, Filter, Image as ImageIcon, FileText, Video, HardDrive, FileImage } from "lucide-react";

// Using Lucide icons for UI representation
export default function MediaLibrary() {
  const [view, setView] = useState<"grid" | "list">("grid");

  const folders = [
    { id: "f1", name: "Elections 2024", count: 124 },
    { id: "f2", name: "Editorials", count: 56 },
    { id: "f3", name: "Sports", count: 89 },
  ];

  const assets = [
    { id: "a1", name: "pm-rally-delhi.jpg", type: "image", size: "2.4 MB", date: "2 hours ago", resolution: "2400x1600" },
    { id: "a2", name: "budget-summary.pdf", type: "document", size: "1.1 MB", date: "Yesterday", resolution: "-" },
    { id: "a3", name: "cricket-finals.jpg", type: "image", size: "3.8 MB", date: "3 days ago", resolution: "4000x3000" },
    { id: "a4", name: "interview-clip.mp4", type: "video", size: "45 MB", date: "1 week ago", resolution: "1080p" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 lg:-m-8">
      
      {/* Top Toolbar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-primary" /> Media Library
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="एसेट्स, टैग्स या ऑल्ट टेक्स्ट खोजें..." 
              className="pl-9 pr-4 py-2 w-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button className="flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Filter className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>
          <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold py-2 px-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <FolderPlus className="w-4 h-4" /> New Folder
          </button>
          <button className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-xl hover:bg-primary/90 transition-colors">
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Folders */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Library</h3>
          
          <ul className="space-y-1 mb-8">
            <li>
              <button className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white">
                <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary" /> All Assets</span>
                <span className="text-xs text-slate-500">1,248</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors">
                <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Images</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors">
                <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Videos</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Documents</span>
              </button>
            </li>
          </ul>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Folders</h3>
          <ul className="space-y-1">
            {folders.map(folder => (
              <li key={folder.id}>
                <button className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors group">
                  <span className="flex items-center gap-2"><FolderPlus className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" /> {folder.name}</span>
                  <span className="text-xs text-slate-500">{folder.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Center Canvas - Grid */}
        <div className="flex-1 bg-white dark:bg-black p-6 overflow-y-auto">
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Assets</h3>
            <div className="text-sm text-slate-500 font-medium bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              Showing 4 of 1,248
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            
            {assets.map(asset => (
              <div key={asset.id} className="group relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-primary transition-colors cursor-pointer bg-slate-50 dark:bg-slate-900">
                
                {/* fallback Thumbnail */}
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                  {asset.type === 'image' ? <FileImage className="w-12 h-12 text-slate-300 dark:text-slate-600" /> : 
                   asset.type === 'video' ? <Video className="w-12 h-12 text-slate-300 dark:text-slate-600" /> : 
                   <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600" />}
                   
                   <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md uppercase tracking-wider">
                     {asset.type}
                   </div>
                </div>

                <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={asset.name}>{asset.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-slate-500 font-medium">{asset.size}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{asset.resolution}</p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            ))}

            {/* Dropzone fallbackup */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center aspect-square hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-primary transition-colors cursor-pointer group">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary mb-2 transition-colors" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Drop files here</p>
              <p className="text-xs text-slate-400 mt-1">or click to browse</p>
            </div>

          </div>

        </div>

        {/* Right Sidebar - Details (fallbacked as showing details for the first asset) */}
        <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] flex flex-col shrink-0 overflow-y-auto hidden lg:flex">
          
          {/* Asset Preview */}
          <div className="aspect-video bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
             <FileImage className="w-16 h-16 text-slate-300 dark:text-slate-700" />
          </div>

          <div className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-4">pm-rally-delhi.jpg</h3>
            
            <div className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Alt Text</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                  rows={2}
                  defaultValue="Prime Minister addressing rally in Delhi"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Caption</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Photographer Credit</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  defaultValue="PTI"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">File Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Dimensions</span><span className="font-medium text-slate-900 dark:text-white">2400 x 1600</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Size</span><span className="font-medium text-slate-900 dark:text-white">2.4 MB</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium text-slate-900 dark:text-white">image/jpeg</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Uploaded</span><span className="font-medium text-slate-900 dark:text-white">2 hours ago</span></div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button className="text-sm font-bold text-red-600 hover:text-red-700">Delete Asset</button>
                <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold px-4 py-2 rounded-xl">Save Details</button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
