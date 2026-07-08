"use client";

import React, { useState } from "react";
import { ArrowLeft, Save, Settings, Check, Clock, Globe, Calendar, Image as ImageIcon, Tag, User, Hash, Lock, CheckCircle, Activity, Link as LinkIcon, Bold, Italic, Underline, Strikethrough, Highlighter, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, CheckSquare, Quote, Minus, Code, Terminal, Table, ImagePlus, Images, Type, MousePointer2, Play, Share2, Share, Music, Video, FileText as FileTextIcon, FileCode, Smile, Undo, Redo, Maximize, Focus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createArticle, updateArticle, updateArticleStatus } from "@/lib/actions/articleActions";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditorClient({ article, isNew, reviewNotes }: { article: any, isNew: boolean, reviewNotes: any[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title_hi || "");
  const [content, setContent] = useState(article?.content || "");
  const [status, setStatus] = useState(article?.status || "draft");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());
  
  // Right Panel Metadata
  const [author, setAuthor] = useState(article?.author_id || "");
  const [category, setCategory] = useState(article?.category_id || "");
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [coverImage, setCoverImage] = useState(article?.cover_image || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [seoTitle, setSeoTitle] = useState(article?.meta_title || "");
  const [seoDesc, setSeoDesc] = useState(article?.meta_description || "");
  const [visibility, setVisibility] = useState(article?.access_level || "public");

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      if (isNew) {
        await createArticle({ title_hi: title, content: content, status: "draft" });
        toast.success("Draft created successfully. Redirecting...");
        router.push("/admin/articles");
      } else {
        await updateArticle(article.id, { 
            title_hi: title, 
            content: content,
            cover_image: coverImage,
            slug: slug,
            meta_title: seoTitle,
            meta_description: seoDesc,
            access_level: visibility,
            tags: tags
        });
        toast.success("Changes saved successfully");
        setLastSaved(new Date());
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save article");
    } finally {
      setIsSaving(false);
    }
  };

  const toolbarGroups = [
    [
      { icon: Type, label: "Heading" },
      { icon: Bold, label: "Bold (Cmd+B)" },
      { icon: Italic, label: "Italic (Cmd+I)" },
      { icon: Underline, label: "Underline (Cmd+U)" },
      { icon: Strikethrough, label: "Strike" },
      { icon: Highlighter, label: "Highlight" },
    ],
    [
      { icon: AlignLeft, label: "Align Left" },
      { icon: AlignCenter, label: "Align Center" },
      { icon: AlignRight, label: "Align Right" },
    ],
    [
      { icon: List, label: "Bullet List" },
      { icon: ListOrdered, label: "Numbered List" },
      { icon: CheckSquare, label: "Checklist" },
    ],
    [
      { icon: Quote, label: "Blockquote" },
      { icon: Minus, label: "Divider" },
      { icon: Code, label: "Inline Code" },
      { icon: Terminal, label: "Code Block" },
      { icon: Table, label: "Table" },
    ],
    [
      { icon: ImagePlus, label: "Image" },
      { icon: Images, label: "Gallery" },
      { icon: LinkIcon, label: "Link" },
      { icon: MousePointer2, label: "Button" },
    ],
    [
      { icon: Play, label: "YouTube" },
      { icon: Share2, label: "Instagram" },
      { icon: Share, label: "Twitter/X" },
      { icon: Music, label: "Audio" },
      { icon: Video, label: "Video" },
      { icon: FileTextIcon, label: "PDF" },
      { icon: FileCode, label: "HTML Embed" },
    ],
    [
      { icon: Smile, label: "Emoji" },
      { icon: Undo, label: "Undo (Cmd+Z)" },
      { icon: Redo, label: "Redo (Cmd+Y)" },
      { icon: Maximize, label: "Fullscreen" },
      { icon: Focus, label: "Focus Mode" },
    ]
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-slate-950 overflow-hidden">
      
      {/* Left Pane: Distraction-Free Editor */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800">
        
        {/* Minimal Editor Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/admin/articles" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-400">
                {isNew ? "Drafting New Article" : "Editing Article"}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    {lastSaved ? `Autosaved ${lastSaved.toLocaleTimeString()}` : 'Unsaved changes'}
                </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
               Preview
             </button>
             <button 
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
              {isNew ? 'Create Draft' : 'Update'}
            </button>
          </div>
        </div>

        {/* Extensive Toolbar */}
        <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800/50 flex flex-wrap gap-x-4 gap-y-2 shrink-0 bg-slate-50/50 dark:bg-[#0F172A]/50">
           {toolbarGroups.map((group, idx) => (
               <div key={idx} className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-4 last:border-0 last:pr-0">
                   {group.map((tool, i) => (
                       <button key={i} title={tool.label} className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">
                           <tool.icon className="w-4 h-4" />
                       </button>
                   ))}
               </div>
           ))}
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 xl:px-24 flex justify-center pb-32">
          <div className="w-full max-w-3xl space-y-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article Title..."
              className="w-full text-4xl lg:text-5xl font-serif font-black bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none overflow-hidden"
            />
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your story here..."
              className="w-full h-full min-h-[500px] text-lg lg:text-xl leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Right Pane: Publishing Panel */}
      <div className="w-80 bg-slate-50 dark:bg-[#0F172A] overflow-y-auto flex-shrink-0">
        <div className="p-6 space-y-8">
            
            {/* Status & Visibility */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Publishing</h3>
                
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Status</label>
                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary"
                        >
                            <option value="draft">Draft</option>
                            <option value="in_review">In Review</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Visibility</label>
                        <select 
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary"
                        >
                            <option value="public">Public (Everyone)</option>
                            <option value="private">Private (Only Me)</option>
                            <option value="members">Members Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Publish Date</label>
                        <input type="datetime-local" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    Featured Image
                    <button className="text-primary hover:underline lowercase">Replace</button>
                </h3>
                
                <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors group">
                    {coverImage ? (
                        <Image src={coverImage} alt="Cover" width={400} height={225} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-4">
                            <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-primary transition-colors" />
                            <span className="text-xs font-medium text-slate-500">Upload from Device<br/>or Media Library</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Classification */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classification</h3>
                
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Author</label>
                        <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary">
                            <option>Current User</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Category</label>
                        <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary">
                            <option>Select Category...</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Tags</label>
                        <input type="text" placeholder="Add tags separated by comma..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
                    </div>
                </div>
            </div>

            {/* SEO & Meta */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> SEO Data</h3>
                
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">URL Slug</label>
                        <input type="text" value={slug} onChange={(e)=>setSlug(e.target.value)} placeholder="custom-url-slug" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Meta Title</label>
                        <input type="text" value={seoTitle} onChange={(e)=>setSeoTitle(e.target.value)} placeholder="SEO Title" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Meta Description</label>
                        <textarea rows={3} value={seoDesc} onChange={(e)=>setSeoDesc(e.target.value)} placeholder="Brief description for search engines..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary resize-none"></textarea>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
