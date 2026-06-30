"use client";

import React, { useState } from "react";
import { ArrowLeft, Save, Image as ImageIcon, Settings, Check, List } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createArticle, updateArticle, updateArticleStatus } from "@/lib/actions/articleActions";
import EditorSettingsSidebar from "./EditorSettingsSidebar";

export default function EditorClient({ article, isNew, reviewNotes }: { article: any, isNew: boolean, reviewNotes: any[] }) {
  const [title, setTitle] = useState(article?.title_hi || "");
  const [content, setContent] = useState(article?.content || "");
  const [status, setStatus] = useState(article?.status || "draft");
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isNew) {
        await createArticle({ title_hi: title, content: content, status: "draft" });
        toast.success("Draft created successfully. Redirecting...");
        window.location.href = "/admin/articles";
      } else {
        await updateArticle(article.id, { title_hi: title, content: content });
        toast.success("Changes saved successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save article");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (isNew) return toast.error("Save draft first before changing status");
    try {
      await updateArticleStatus(article.id, newStatus as any);
      setStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Invalid workflow transition");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Header */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <Link href="/admin/articles" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="text-sm font-medium text-slate-400">
              {isNew ? "Drafting New Article" : "Editing Article"}
            </div>
            {!isNew && (
              <select 
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 ml-4 outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="fact_check">Fact Check</option>
                <option value="editor_review">Editor Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 rounded-full transition-colors ${showSidebar ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              title="Toggle Sidebar"
            >
              <List className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div className="w-full max-w-3xl space-y-6">
            <div className="group relative w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
              <ImageIcon className="w-8 h-8 text-slate-400 mb-2 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-slate-500 group-hover:text-primary transition-colors">Add Cover Image</span>
            </div>

            <input 
              type="text" 
              placeholder="लेख का शीर्षक..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 px-0 py-2 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />

            <textarea 
              placeholder="अपनी कहानी लिखें..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[500px] text-lg leading-relaxed bg-transparent border-0 focus:ring-0 px-0 py-4 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none outline-none"
            />
          </div>
        </div>
      </div>

      {showSidebar && !isNew && article && (
        <EditorSettingsSidebar articleId={article.id} initialNotes={reviewNotes} />
      )}
    </div>
  );
}
