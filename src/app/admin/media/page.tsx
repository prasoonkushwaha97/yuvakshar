"use client";

import React, { useState } from "react";
import { Upload, Folder, Search, Image as ImageIcon, FileText, Video, HardDrive, FileImage, Trash2, LayoutGrid, List as ListIcon, Database } from "lucide-react";
import MediaUploadModal from "@/components/media/MediaUploadModal";

export default function MediaLibrary() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string>("all");

  const folders = [
    { id: "articles", name: "Articles", count: 1240 },
    { id: "authors", name: "Authors", count: 56 },
    { id: "avatars", name: "Avatars", count: 890 },
    { id: "magazine", name: "Magazine", count: 45 },
    { id: "community", name: "Community", count: 3200 },
    { id: "banners", name: "Banners", count: 12 },
    { id: "logos", name: "Logos", count: 8 },
    { id: "misc", name: "Misc", count: 154 },
  ];

  const assets = [
    { id: "a1", name: "pm-rally-delhi.jpg", type: "image", size: "2.4 MB", date: "2 hours ago", resolution: "2400x1600", folder: "articles" },
    { id: "a2", name: "author-rahul.jpg", type: "image", size: "1.1 MB", date: "Yesterday", resolution: "800x800", folder: "authors" },
    { id: "a3", name: "cricket-finals.jpg", type: "image", size: "3.8 MB", date: "3 days ago", resolution: "4000x3000", folder: "articles" },
    { id: "a4", name: "interview-clip.mp4", type: "video", size: "45 MB", date: "1 week ago", resolution: "1080p", folder: "misc" },
  ];

  const filteredAssets = activeFolder === "all" ? assets : assets.filter(a => a.folder === activeFolder);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 lg:-m-8">
      
      {isUploadModalOpen && (
        <MediaUploadModal 
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSelect={(url) => {
             console.log("Selected URL: ", url);
             setIsUploadModalOpen(false);
          }}
        />
      )}

      {/* Top Toolbar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-primary" /> Media Library
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="pl-9 pr-4 py-2 w-64 bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-primary focus:bg-white dark:focus:bg-[#0A0F1D] outline-none transition-colors"
            />
          </div>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
             <button onClick={() => setView('grid')} className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                <LayoutGrid className="w-4 h-4" />
             </button>
             <button onClick={() => setView('list')} className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                <ListIcon className="w-4 h-4" />
             </button>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>
          <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-primary text-white font-medium py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm">
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Folders */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A]/50 flex flex-col shrink-0 hidden md:flex">
          
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Library</h3>
            <ul className="space-y-1 mb-8">
              <li>
                <button onClick={() => setActiveFolder('all')} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeFolder === 'all' ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 border border-transparent'}`}>
                  <span className="flex items-center gap-2"><ImageIcon className={`w-4 h-4 ${activeFolder === 'all' ? 'text-primary' : ''}`} /> All Assets</span>
                  <span className="text-xs text-slate-500">5,605</span>
                </button>
              </li>
            </ul>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Storage Folders</h3>
            <ul className="space-y-1">
              {folders.map(folder => (
                <li key={folder.id}>
                  <button onClick={() => setActiveFolder(folder.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${activeFolder === folder.id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}>
                    <span className="flex items-center gap-2"><Folder className={`w-4 h-4 ${activeFolder === folder.id ? 'text-primary' : 'text-slate-400 group-hover:text-primary transition-colors'}`} /> {folder.name}</span>
                    <span className={`text-xs ${activeFolder === folder.id ? 'text-primary' : 'text-slate-500'}`}>{folder.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Database className="w-4 h-4" /> Storage Usage</h3>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 mb-2">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>45 GB used</span>
              <span>100 GB total</span>
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-white dark:bg-black p-6 overflow-y-auto">
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{activeFolder === 'all' ? 'Recent Uploads' : activeFolder}</h3>
            <div className="text-sm text-slate-500 font-medium bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              Showing {filteredAssets.length} assets
            </div>
          </div>

          {view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAssets.map(asset => (
                <div key={asset.id} className="group relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-primary transition-colors cursor-pointer bg-slate-50 dark:bg-slate-900">
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
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Folder</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        {asset.type === 'image' ? <FileImage className="w-4 h-4 text-slate-400" /> : <Video className="w-4 h-4 text-slate-400" />}
                        {asset.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500 capitalize">{asset.type}</td>
                      <td className="px-4 py-3 text-slate-500 capitalize">{asset.folder}</td>
                      <td className="px-4 py-3 text-slate-500">{asset.size}</td>
                      <td className="px-4 py-3 text-slate-500">{asset.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
