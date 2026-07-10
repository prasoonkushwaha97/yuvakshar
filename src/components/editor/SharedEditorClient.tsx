"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Settings, Check, Clock, Globe, Calendar, Image as ImageIcon, Tag, User, Hash, Lock, CheckCircle, Activity, Link as LinkIcon, Bold, Italic, Underline, Strikethrough, Highlighter, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, CheckSquare, Quote, Minus, Code, Terminal, Table, ImagePlus, Images, Type, MousePointer2, Play, Share2, Share, Music, Video, FileText as FileTextIcon, FileCode, Smile, Undo, Redo, Maximize, Focus, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createArticle, updateArticle, updateArticleStatus } from "@/lib/actions/articleActions";
import { submitContributorArticle } from "@/lib/actions/contributeActions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import ArticleContent from "@/components/articles/ArticleContent";
import { Monitor, Smartphone, LayoutTemplate } from "lucide-react";
import MediaUploader from "@/components/media/MediaUploader";

export default function EditorClient({ article, isNew, reviewNotes, isEditorialRole = false }: { article: any, isNew: boolean, reviewNotes: any[], isEditorialRole?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title_hi || "");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);
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

  // Mobile State
  const [isPublishSheetOpen, setIsPublishSheetOpen] = useState(false);

  // Preview State
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const mockPreviewArticle = {
    ...article,
    id: article?.id || 'preview-id',
    title_hi: title,
    content: content,
    cover_image: coverImage,
    tags: tags,
    slug: slug || 'preview-slug',
    published_at: article?.published_at || new Date().toISOString(),
    created_at: article?.created_at || new Date().toISOString(),
    categories: article?.categories || { id: category, name_hi: 'Preview Category' },
    profiles: article?.profiles || { id: author, name: 'Preview Author' }
  };

  const handleSave = async (e?: React.FormEvent, customStatus?: string) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const saveStatus = customStatus || status;
    
    try {
      if (isEditorialRole) {
        if (isNew) {
          await createArticle({ title_hi: title, content: content, status: saveStatus as any });
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
              tags: tags,
              status: saveStatus as any
          });
          toast.success("Changes saved successfully");
          setLastSaved(new Date());
          if (customStatus) setStatus(customStatus);
        }
      } else {
        // Contributor Flow
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (coverImage) formData.append("cover_image", coverImage);
        if (category) formData.append("category", category);
        if (!isNew && article?.id) formData.append("id", article.id);
        
        const isDraft = saveStatus === "draft";
        const result = await submitContributorArticle(formData, isDraft);
        
        if (result.error) {
          throw new Error(result.error);
        } else {
          toast.success(isDraft ? "Draft saved successfully" : "Article submitted for review");
          setLastSaved(new Date());
          if (customStatus) setStatus(customStatus);
          
          if (isNew && result.data?.id) {
            router.push(`/workspace/articles/submission/${result.data.id}`);
          } else if (!isDraft) {
             router.push("/workspace/articles");
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save article");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#FDFCF7] dark:bg-[#0B0F19] lg:overflow-hidden relative">
        {/* Preview Header */}
        <div className="sticky top-0 z-20 h-14 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 border-b border-slate-200 dark:border-slate-800 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 lg:gap-4">
            <button onClick={() => setIsPreviewMode(false)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Editor
            </button>
          </div>
          
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Desktop Preview"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Mobile Preview"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 overflow-y-auto w-full h-[calc(100vh-4rem-3.5rem)]">
          {previewDevice === 'desktop' ? (
             <div className="w-full">
               <ArticleContent article={mockPreviewArticle as any} isPreview={true} />
             </div>
          ) : (
             <div className="py-10 flex justify-center min-h-full bg-slate-100 dark:bg-slate-900/50">
               <div className="w-full max-w-[390px] bg-[#FDFCF7] dark:bg-[#0B0F19] shadow-2xl overflow-y-auto border-[12px] border-slate-900 dark:border-black rounded-[3rem] aspect-[9/19] flex flex-col relative">
                  {/* iPhone notch mock */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 dark:bg-black w-32 mx-auto rounded-b-xl z-50"></div>
                  <div className="mt-6 flex-1">
                    <ArticleContent article={mockPreviewArticle as any} isPreview={true} />
                  </div>
               </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-white dark:bg-slate-950 lg:overflow-hidden relative">
      
      {/* Main Pane: Editor */}
      <div className="flex-1 flex flex-col min-w-0 lg:border-r border-slate-200 dark:border-slate-800 lg:overflow-y-auto lg:h-[calc(100vh-4rem)]">
        
        {/* Editor Header (Sticky on Mobile) */}
        <div className="sticky top-0 z-20 h-14 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 lg:gap-4">
            <Link href="/admin/articles" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 -ml-1">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col lg:flex-row lg:items-center gap-0 lg:gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                {isNew ? "New Draft" : "Edit Article"}
                </span>
                <span className="hidden lg:inline text-slate-300 dark:text-slate-600">•</span>
                <span className="text-[10px] lg:text-xs text-slate-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 hidden lg:block" />
                    {lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Unsaved'}
                </span>
            </div>
          </div>
           <div className="flex items-center gap-2 lg:gap-3">
             <button 
                onClick={() => setIsPublishSheetOpen(true)}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full"
             >
                <SlidersHorizontal className="w-4 h-4" />
             </button>
             <button 
                onClick={() => setIsPreviewMode(true)}
                className="hidden lg:flex text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium items-center gap-1.5">
               <LayoutTemplate className="w-4 h-4" />
               Preview
             </button>
             
             {!isEditorialRole ? (
               <div className="hidden lg:flex items-center gap-2">
                  <button 
                    onClick={() => handleSave(undefined, "draft")}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 lg:px-4 lg:py-1.5 rounded-full lg:rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button 
                    onClick={() => handleSave(undefined, "submitted")}
                    disabled={isSaving || !content.trim()}
                    className="flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white px-3 py-1.5 lg:px-4 lg:py-1.5 rounded-full lg:rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving && status === "submitted" ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4 hidden lg:block" />}
                    Submit for Review
                  </button>
               </div>
             ) : (
               <button 
                onClick={() => handleSave()}
                disabled={isSaving}
                className="flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-3 py-1.5 lg:px-4 lg:py-1.5 rounded-full lg:rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4 hidden lg:block" />}
                {isNew ? 'Save' : 'Update'}
              </button>
             )}
          </div>
        </div>



        {/* Editor Canvas */}
        <div className="flex-1 px-4 lg:px-8 py-8 flex flex-col pb-32 w-full">
          <div className="w-full space-y-6">
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              rows={1}
              placeholder="Article Title..."
              className="w-full text-4xl lg:text-5xl font-serif font-black bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none leading-normal py-2 overflow-hidden"
            />
            
            <div className="w-full">
                <RichTextEditor 
                  content={content}
                  onChange={(md) => setContent(md)}
                />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Right Pane: Publishing Panel */}
      <div className="hidden lg:block w-[300px] bg-slate-50 dark:bg-[#0F172A] overflow-y-auto flex-shrink-0 lg:h-[calc(100vh-4rem)]">
        <div className="p-6 space-y-8">
            
            {/* Status & Visibility */}
            {isEditorialRole && (
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
                              <option value="submitted">Pending Review</option>
                              <option value="revision_requested">Needs Revision</option>
                              <option value="published">Published</option>
                              <option value="rejected">Rejected</option>
                              <option value="archived">Archived</option>
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
            )}

            {/* Featured Image */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    Featured Image
                </h3>
                
                <MediaUploader 
                  label=""
                  value={coverImage}
                  onChange={(url) => setCoverImage(url)}
                  aspectRatio="aspect-video"
                />
            </div>

            {/* Classification */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classification</h3>
                
                <div className="space-y-3">
                    {isEditorialRole && (
                      <div>
                          <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Author</label>
                          <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary">
                              <option>Current User</option>
                          </select>
                      </div>
                    )}

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary">
                            <option value="">Select Category...</option>
                            <option value="politics">Politics</option>
                            <option value="society">Society</option>
                            <option value="science">Science</option>
                            <option value="culture">Culture</option>
                            <option value="opinion">Opinion</option>
                        </select>
                    </div>

                    {isEditorialRole && (
                      <div>
                          <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Tags</label>
                          <input type="text" placeholder="Add tags separated by comma..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
                      </div>
                    )}
                </div>
            </div>

            {/* SEO & Meta */}
            {isEditorialRole && (
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
            )}

        </div>
      </div>

      {/* Mobile Bottom Sheet: Publishing Panel */}
      {isPublishSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setIsPublishSheetOpen(false)}
          ></div>
          
          {/* Sheet Content */}
          <div className="relative w-full max-h-[85vh] bg-white dark:bg-[#0F172A] rounded-t-2xl shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Handle & Header */}
            <div className="sticky top-0 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Publish Settings
              </h2>
              <button 
                onClick={() => setIsPublishSheetOpen(false)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Sheet Body (Reusing the Desktop Fields but structured for Mobile) */}
            <div className="p-4 space-y-6 pb-20">
                {/* Status & Visibility */}
                {isEditorialRole && (
                  <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Publishing</h3>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Status</label>
                              <select 
                                  value={status}
                                  onChange={(e) => setStatus(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none"
                              >
                                  <option value="draft">Draft</option>
                                  <option value="submitted">Pending Review</option>
                                  <option value="revision_requested">Needs Revision</option>
                                  <option value="published">Published</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="archived">Archived</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Visibility</label>
                              <select 
                                  value={visibility}
                                  onChange={(e) => setVisibility(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none"
                              >
                                  <option value="public">Public</option>
                                  <option value="private">Private</option>
                                  <option value="members">Members</option>
                              </select>
                          </div>
                      </div>
                  </div>
                )}

                {/* Featured Image */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Featured Image</h3>
                    <MediaUploader 
                      label=""
                      value={coverImage}
                      onChange={(url) => setCoverImage(url)}
                      aspectRatio="aspect-video"
                    />
                </div>

                {/* Classification */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classification</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none">
                                <option value="">Select Category...</option>
                                <option value="politics">Politics</option>
                                <option value="society">Society</option>
                                <option value="science">Science</option>
                                <option value="culture">Culture</option>
                                <option value="opinion">Opinion</option>
                            </select>
                        </div>
                        {isEditorialRole && (
                          <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Tags</label>
                              <input type="text" placeholder="Add tags separated by comma..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none" />
                          </div>
                        )}
                    </div>
                </div>

                {/* SEO */}
                {isEditorialRole && (
                  <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> SEO Data</h3>
                      <div className="space-y-3">
                          <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 block">URL Slug</label>
                              <input type="text" value={slug} onChange={(e)=>setSlug(e.target.value)} placeholder="custom-url-slug" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none" />
                          </div>
                          <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Meta Title</label>
                              <input type="text" value={seoTitle} onChange={(e)=>setSeoTitle(e.target.value)} placeholder="SEO Title" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none" />
                          </div>
                          <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Meta Description</label>
                              <textarea rows={3} value={seoDesc} onChange={(e)=>setSeoDesc(e.target.value)} placeholder="Brief description..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none resize-none"></textarea>
                          </div>
                      </div>
                  </div>
                )}
            </div>
            
            {/* Fixed Bottom Actions for Sheet */}
            <div className="sticky bottom-0 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
               <button 
                  onClick={() => setIsPublishSheetOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
               >
                  Cancel
               </button>
               {isEditorialRole ? (
                 <button 
                    onClick={(e) => { setIsPublishSheetOpen(false); handleSave(e); }}
                    className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium flex justify-center items-center gap-2"
                 >
                    <Save className="w-4 h-4" /> Save
                 </button>
               ) : (
                 <>
                   <button 
                      onClick={(e) => { setIsPublishSheetOpen(false); handleSave(undefined, "draft"); }}
                      className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium flex justify-center items-center gap-2"
                   >
                      Draft
                   </button>
                   <button 
                      onClick={(e) => { setIsPublishSheetOpen(false); handleSave(undefined, "submitted"); }}
                      className="flex-1 py-2.5 bg-[#EA580C] text-white rounded-xl font-medium flex justify-center items-center gap-2"
                   >
                      Submit
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
