"use client";

import React, { useState } from "react";
import { ArrowLeft, Save, Image as ImageIcon, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ArticleEditor({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Article saved as draft");
    // TODO: Connect to backend article creation using the requested existing editor
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <Link href="/founder/articles" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-sm font-medium text-slate-400">
            {isNew ? "Drafting New Article" : "Editing Article"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          <div className="group relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
            <ImageIcon className="w-8 h-8 text-slate-400 mb-2 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-slate-500 group-hover:text-primary transition-colors">Add Cover Image</span>
          </div>

          <input 
            type="text" 
            placeholder="Article Title..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 px-0 py-2 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
          />

          {/* Placeholder for the Rich Text Editor */}
          <textarea 
            placeholder="Tell your story..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[500px] text-lg leading-relaxed bg-transparent border-0 focus:ring-0 px-0 py-4 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
