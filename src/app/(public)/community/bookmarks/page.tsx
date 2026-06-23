"use client";

import React, { useState, useEffect } from "react";
import { 
  Bookmark, 
  Trash2, 
  BookOpen, 
  FileText, 
  ArrowRight,
  BookmarkCheck,
  FolderOpen
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { fetchPosts, CommunityPost } from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";

export default function BookmarksPage() {
  const { articles, currentUser } = useCms();
  const [activeTab, setActiveTab] = useState<"articles" | "posts">("articles");
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedItems = async () => {
    setLoading(true);
    try {
      // 1. Load bookmarked article IDs from localStorage
      if (typeof window !== "undefined") {
        const savedArts = localStorage.getItem("yuvakshar_bookmarks");
        if (savedArts) {
          setSavedArticleIds(JSON.parse(savedArts));
        }
      }

      // 2. Load bookmarked community posts
      const allPosts = await fetchPosts();
      // Simulating some saved posts in localStorage key yuvakshar_c_post_bookmarks
      if (typeof window !== "undefined") {
        const savedPostsKeys = localStorage.getItem("yuvakshar_c_post_bookmarks");
        if (savedPostsKeys) {
          const ids: string[] = JSON.parse(savedPostsKeys);
          setSavedPosts(allPosts.filter(p => ids.includes(p.id)));
        } else {
          // Preseed one saved post if empty for demo
          const defaultSaved = allPosts.slice(0, 1);
          setSavedPosts(defaultSaved);
          localStorage.setItem("yuvakshar_c_post_bookmarks", JSON.stringify(defaultSaved?.map(p => p.id)));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedItems();
  }, []);

  const handleRemoveArticle = (id: string) => {
    const updated = savedArticleIds.filter(artId => artId !== id);
    setSavedArticleIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("yuvakshar_bookmarks", JSON.stringify(updated));
    }
    alert("लेख को आपकी लाइब्रेरी से हटा दिया गया है।");
  };

  const handleRemovePost = (id: string) => {
    const updated = savedPosts.filter(p => p.id !== id);
    setSavedPosts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("yuvakshar_c_post_bookmarks", JSON.stringify(updated?.map(p => p.id)));
    }
    alert("पोस्ट को आपकी लाइब्रेरी से हटा दिया गया है।");
  };

  // Filter actual articles from CMS store
  const savedArticlesList = articles.filter(art => savedArticleIds.includes(art.id));

  return (
    <div className="space-y-6 text-[#0F172A] dark:text-slate-200">
      
      {/* Header bar */}
      <div className="bg-white dark:bg-[#0F172A]/35 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex items-center space-x-2 text-primary font-bold text-xs font-serif font-hindi">
        <FolderOpen className="w-5 h-5" />
        <span>मेरी लाइब्रेरी (Saved Bookmarks)</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 w-fit">
        {[
          { id: "articles", name: "सहेजे गए लेख (Articles)" },
          { id: "posts", name: "सहेजे गए संवाद (Posts)" }
        ]?.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-hindi ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-500"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-450 animate-pulse font-serif">
            लाइब्रेरी लोड की जा रही है...
          </div>
        ) : activeTab === "articles" ? (
          // Saved Articles
          savedArticlesList.length > 0 ? (
            savedArticlesList?.map(art => (
              <GlassCard key={art.id} className="p-4 border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between gap-4">
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <Link href={`/editorial?id=${art.id}`} className="block text-xs font-bold text-slate-800 dark:text-white hover:text-primary font-hindi truncate">
                      {art.title}
                    </Link>
                    <span className="block text-[9px] text-slate-400 font-serif">श्रेणी: {art.category} | समय: {art.readTime}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleRemoveArticle(art.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/editorial?id=${art.id}`}
                    className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="py-20 text-center text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl font-serif text-xs flex flex-col items-center gap-1">
              <Bookmark className="w-7 h-7 text-slate-300" />
              <span className="font-hindi mt-1">आपने कोई लेख बुकमार्क नहीं किया है।</span>
              <Link href="/" className="text-primary hover:underline text-[10px] font-bold mt-1 font-hindi">लेख पढ़ना शुरू करें →</Link>
            </div>
          )
        ) : (
          // Saved Community Posts
          savedPosts.length > 0 ? (
            savedPosts?.map(p => (
              <GlassCard key={p.id} className="p-4 border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between gap-4">
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5 font-hindi">
                    <Link href={`/community/discussion/thread/${p.id}`} className="block text-xs font-bold text-slate-800 dark:text-white hover:text-primary truncate">
                      {p.title || p.content}
                    </Link>
                    <span className="block text-[9px] text-slate-400 font-serif">लेखक: {p.user_name} | दिनांक: {new Date(p.created_at).toLocaleDateString("hi-IN")}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleRemovePost(p.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/community/discussion/thread/${p.id}`}
                    className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="py-20 text-center text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl font-serif text-xs flex flex-col items-center gap-1">
              <Bookmark className="w-7 h-7 text-slate-300" />
              <span className="font-hindi mt-1">आपने कोई कम्युनिटी पोस्ट बुकमार्क नहीं की है।</span>
            </div>
          )
        )}
      </div>

    </div>
  );
}
