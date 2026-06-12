"use client";

import React, { useState } from "react";
import { Bookmark, Trash2, BookOpen } from "lucide-react";
import { useCms, Profile } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";

interface BookmarksTabProps {
  currentUser: Profile;
}

export default function BookmarksTab({ currentUser }: BookmarksTabProps) {
  const cms = useCms();
  const bookmarksKey = `yuvakshar_bookmarks_${currentUser?.id || "anonymous"}`;

  const getBookmarks = (): string[] => {
    if (typeof window === "undefined") return [];
    const val = localStorage.getItem(bookmarksKey);
    if (val) {
      return JSON.parse(val);
    } else {
      // Preseed with latest 2 articles if empty
      const sampleIds = cms.articles.slice(0, 2).map(a => a.id);
      localStorage.setItem(bookmarksKey, JSON.stringify(sampleIds));
      return sampleIds;
    }
  };

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarks());

  const bookmarkedArticles = cms.articles.filter(art => bookmarkedIds.includes(art.id));

  const removeBookmark = (id: string) => {
    const updated = bookmarkedIds.filter(x => x !== id);
    setBookmarkedIds(updated);
    localStorage.setItem(bookmarksKey, JSON.stringify(updated));
    alert("लेख बुकमार्क से हटा दिया गया!");
  };

  return (
    <div className="space-y-6">
      {bookmarkedArticles.length > 0 ? (
        <div className="space-y-4">
          {bookmarkedArticles.map(art => (
            <GlassCard key={art.id} glow="none" className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border border-slate-200/60 dark:border-slate-800">
              <div className="flex gap-4 items-center">
                <img 
                  src={art.image || "/yuvakshar_logo.jpg"} 
                  alt={art.title} 
                  className="w-24 h-16 object-cover rounded-lg shadow-sm shrink-0 border border-slate-200 dark:border-slate-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/yuvakshar_logo.jpg";
                  }}
                />
                <div className="space-y-1 font-serif text-xs">
                  <span className="text-[9px] text-primary uppercase font-bold tracking-wide">{art.category}</span>
                  <h4 className="font-bold text-slate-800 dark:text-white leading-snug line-clamp-1">{art.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span>जारी: {art.publishDate || art.created_at?.split("T")[0]}</span>
                    <span>•</span>
                    <span>लेखक: {art.author || "युवाक्षर डेस्क"}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-850">
                <Link 
                  href={`/article/${art.slug}`}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary/95 rounded-xl text-[10px] font-bold transition-all text-center flex items-center gap-1 font-serif"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>लेख पढ़ें</span>
                </Link>
                <button 
                  onClick={() => removeBookmark(art.id)}
                  className="px-4 py-2 bg-slate-100 hover:bg-red-500/10 dark:bg-slate-800 text-slate-500 hover:text-red-500 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center flex items-center gap-1 font-serif"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>हटाएँ</span>
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard glow="none" className="p-10 text-center flex flex-col items-center justify-center space-y-4 border border-dashed border-slate-300 dark:border-slate-800">
          <Bookmark className="w-12 h-12 text-primary/30 animate-pulse" />
          <div className="space-y-1 max-w-sm">
            <h4 className="font-serif font-bold text-slate-800 dark:text-white text-xs">कोई बुकमार्क उपलब्ध नहीं है</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-serif">आलेखों को पढ़ते समय उन्हें बाद में पढ़ने के लिए बुकमार्क करें।</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
