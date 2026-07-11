"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Globe } from "lucide-react";

export default function EditorSettingsSidebar({ articleId, initialNotes = [], article = {} }: { articleId: string, initialNotes: any[], article?: any }) {
  const [activeTab, setActiveTab] = useState<'seo'>('seo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SEO State
  const [seoData, setSeoData] = useState({
    meta_title: article?.meta_title || "",
    meta_description: article?.meta_description || "",
    canonical_url: article?.canonical_url || "",
    og_image: article?.og_image || "",
  });

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Assuming a save action exists, mocked for now
      toast.success("SEO settings saved");
    } catch(err) {
      toast.error("Failed to save SEO settings");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('seo')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors text-primary border-b-2 border-primary bg-primary/5`}
        >
          <Globe className="w-4 h-4" /> SEO
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSaveSeo} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Title</label>
            <input 
              type="text" 
              value={seoData.meta_title}
              onChange={e => setSeoData({...seoData, meta_title: e.target.value})}
              className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 outline-none focus:ring-1 focus:ring-primary"
              placeholder="SEO Title (60 chars max)"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Description</label>
            <textarea 
              value={seoData.meta_description}
              onChange={e => setSeoData({...seoData, meta_description: e.target.value})}
              className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
              placeholder="SEO Description (160 chars max)"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Canonical URL</label>
            <input 
              type="url" 
              value={seoData.canonical_url}
              onChange={e => setSeoData({...seoData, canonical_url: e.target.value})}
              className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium py-2 rounded-lg transition-colors text-sm"
          >
            Save SEO Settings
          </button>
        </form>
      </div>
    </div>
  );
}
