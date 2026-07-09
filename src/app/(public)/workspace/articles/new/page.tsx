"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FileText, Send, CheckCircle2, Tags, AlertCircle } from "lucide-react";
import { submitContributorArticle } from "@/lib/actions/contributeActions";
import { getArticleById } from "@/lib/actions/articleActions";
import { useRouter, useSearchParams } from "next/navigation";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor").then(mod => ({ default: mod.RichTextEditor })),
  { ssr: false, loading: () => <div className="min-h-[500px] border border-[#E7E2D8] dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 animate-pulse" /> }
);
const MediaUploader = dynamic(() => import("@/components/media/MediaUploader"), { ssr: false });

export default function ContributorSubmissionPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isAdminEdit = mode === "admin";

  useEffect(() => {
    if (articleId) {
      setIsLoading(true);
      getArticleById(articleId).then((data) => {
        if (data) {
          setInitialData(data);
          setEditorContent(data.content || "");
          setCoverImage(data.cover_image || "");
        } else {
          setErrorMsg("लेख नहीं मिला (Article not found)");
        }
        setIsLoading(false);
      });
    }
  }, [articleId]);

  // Auto-save logic
  useEffect(() => {
    if (!editorContent || editorContent === initialData?.content) return;
    if (isSubmitted || isSubmitting || isDrafting) return;

    const handler = setTimeout(() => {
      if (formRef.current) {
        handleAction(true, true);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(handler);
  }, [editorContent, isSubmitted, isSubmitting, isDrafting, initialData]);

  const handleAction = async (isDraft: boolean, silent: boolean = false) => {
    if (!formRef.current) return;
    
    if (!silent) {
      if (!isDraft && !coverImage) {
        setErrorMsg("कृपया लेख के लिए एक मुख्य छवि (Featured Image) अपलोड करें।");
        return;
      }
      if (isDraft) setIsDrafting(true);
      else setIsSubmitting(true);
      setErrorMsg("");
    }

    const formData = new FormData(formRef.current);
    // Explicitly append editor content if not captured by hidden input
    if (!formData.get("content")) {
      formData.append("content", editorContent);
    }
    if (coverImage) {
      formData.append("cover_image", coverImage);
    }

    const result = await submitContributorArticle(formData, isDraft);

    if (!silent) {
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        if (isDraft) {
          router.push("/workspace/articles");
        } else {
          setIsSubmitted(true);
        }
      }
      setIsDrafting(false);
      setIsSubmitting(false);
    } else {
      // Silent auto-save update
      if (result.success && !articleId && result.data?.id) {
         window.history.replaceState(null, '', `?id=${result.data.id}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction(false);
  };

  return (
    <div className="text-[#1E1E1E] dark:text-slate-200">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 border-b border-[#E7E2D8] dark:border-slate-800 pb-4">
          <h1 className="text-2xl md:text-3xl font-serif font-black font-hindi tracking-tight text-slate-900 dark:text-white mb-2">
            {articleId ? (isAdminEdit ? "लेख संपादित करें (Admin Edit)" : "लेख संपादित करें") : "नया लेख प्रस्तुत करें"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-hindi text-sm">
            समीक्षा और प्रकाशन के लिए अपना नवीनतम लेख ड्राफ्ट सबमिट करें।
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-10 text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 font-hindi">
              आपका लेख सफलतापूर्वक प्रेषित कर दिया गया है!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 font-hindi leading-relaxed">
              संपादकीय दल आपके लेख की समीक्षा करेगा। आप अपने कार्यक्षेत्र (Dashboard) में इसकी स्थिति को ट्रैक कर सकते हैं।
            </p>
            <Link 
              href="/workspace/articles"
              className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-3 px-8 rounded-xl hover:border-[#EA580C] hover:text-[#EA580C] transition-colors font-hindi"
            >
              कार्यक्षेत्र पर वापस जाएँ
            </Link>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-[#0D1527] border border-[#E7E2D8] dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
            
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-hindi flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {isLoading ? (
              <div className="py-12 text-center text-slate-500 font-hindi">
                डेटा लोड हो रहा है... (Loading data...)
              </div>
            ) : (
              <>
                {articleId && <input type="hidden" name="id" value={articleId} />}
                {isAdminEdit && <input type="hidden" name="mode" value="admin" />}
                <input type="hidden" name="content" value={editorContent} />

                {isAdminEdit && (
                  <div className="space-y-2 mb-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">
                      प्रकाशन पहचान (Publish As) <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="publishAs"
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] outline-none font-hindi"
                      defaultValue=""
                    >
                      <option value="">मूल लेखक (Original Author)</option>
                      <option value="युवाक्षर संपादकीय">युवाक्षर संपादकीय</option>
                      <option value="संपादकीय मंडल">संपादकीय मंडल</option>
                      <option value="Guest Author">Guest Author</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-2 font-hindi">
                      यदि आप मूल लेखक के नाम से प्रकाशित करना चाहते हैं, तो 'मूल लेखक' चुनें।
                    </p>
                  </div>
                )}

            <div className="grid md:grid-cols-3 gap-6">
              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">
                  लेख का शीर्षक (Title) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="title"
                    required
                    defaultValue={initialData?.title_hi || initialData?.title_en || initialData?.title || ""}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] focus:border-transparent outline-none transition-all font-hindi font-serif text-lg"
                    placeholder="आकर्षक और सटीक शीर्षक लिखें"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">
                  श्रेणी (Category) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tags className="h-5 w-5 text-slate-400" />
                  </div>
                  <select 
                    name="category"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] focus:border-transparent outline-none transition-all font-hindi appearance-none"
                    defaultValue={initialData?.categories?.slug || ""}
                  >
                    <option value="" disabled>श्रेणी चुनें</option>
                    <option value="politics">राजनीति (Politics)</option>
                    <option value="society">समाज (Society)</option>
                    <option value="science">विज्ञान (Science)</option>
                    <option value="culture">संस्कृति (Culture)</option>
                    <option value="opinion">विचार (Opinion)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Featured Image */}
              <div className="md:col-span-3">
                <MediaUploader 
                  label="मुख्य छवि (Featured Image) *"
                  value={coverImage}
                  onChange={(url) => setCoverImage(url)}
                  aspectRatio="aspect-[21/9]"
                />
              </div>

            {/* Content (Rich Text Editor) */}
            <div className="space-y-2 mt-6 md:col-span-3">
              <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">
                लेख सामग्री (Content) <span className="text-red-500">*</span>
              </label>
              <RichTextEditor 
                content={editorContent} 
                onChange={setEditorContent} 
              />
            </div>
            </div>

            {/* SEO Settings Accordion */}
            <div className="border border-[#E7E2D8] dark:border-slate-700 rounded-xl overflow-hidden mt-6">
              <details className="group">
                <summary className="flex items-center justify-between p-4 font-bold font-hindi cursor-pointer bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white">
                  एसईओ सेटिंग्स (SEO Settings)
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="p-5 border-t border-[#E7E2D8] dark:border-slate-700 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">SEO Title</label>
                    <input type="text" name="meta_title" defaultValue={initialData?.meta_title || ""} placeholder="Custom title for search engines..." className="w-full px-4 py-2 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] outline-none font-hindi" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">Meta Description</label>
                    <textarea name="meta_description" defaultValue={initialData?.meta_description || ""} placeholder="Short description for search results..." rows={3} className="w-full px-4 py-2 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] outline-none font-hindi" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">URL Slug</label>
                    <input type="text" name="slug" defaultValue={initialData?.slug || ""} placeholder="custom-article-url" className="w-full px-4 py-2 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] outline-none font-hindi" />
                  </div>
                </div>
              </details>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#E7E2D8] dark:border-slate-800">
              <button 
                type="submit"
                disabled={isSubmitting || isDrafting || !editorContent.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-[#EA580C] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#C2410C] disabled:bg-[#ea590c7e] disabled:cursor-not-allowed transition-colors font-hindi shadow-md hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? "भेजा जा रहा है..." : (isAdminEdit ? "सहेजें और प्रकाशित करें (Save & Publish)" : "समीक्षा के लिए भेजें (Submit for Review)")}
              </button>
              <button 
                type="button"
                onClick={() => handleAction(true)}
                disabled={isSubmitting || isDrafting || !editorContent.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-6 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-hindi"
              >
                {isDrafting ? "सहेजा जा रहा है..." : "ड्राफ्ट सहेजें (Save as Draft)"}
              </button>
            </div>
            
            </>
            )}
            
          </form>
        )}
      </div>
    </div>
  );
}
