"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { stripMarkdown } from "@/lib/markdown";
import { Clock, Calendar, ChevronDown } from "lucide-react";

export default function LatestNews() {
  const { locale } = useLanguage();
  const { articles } = useCms();
  const [visibleCount, setVisibleCount] = useState(6);

  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  if (published.length === 0) return null;

  // Main Hero Story (to exclude)
  const heroStory = published.find((a: any) => a.hero || a.isFeatured) || published[0];

  // Remaining articles
  const remaining = published.filter((a: any) => a.id !== heroStory.id);

  // Latest News: Starts after Top Stories (index 4 onwards)
  const feedArticles = remaining.slice(4);

  if (feedArticles.length === 0) return null;

  const visibleArticles = feedArticles.slice(0, visibleCount);
  const hasMore = feedArticles.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-150 dark:border-gray-850 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#f97316]" />
          <h2 className="font-serif font-black text-lg md:text-xl text-gray-900 dark:text-white uppercase tracking-tight">
            {locale === "hi" ? "ताजा समाचार" : "Latest News"}
          </h2>
        </div>
      </div>

      {/* Feed List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {visibleArticles.map((art: any) => {
          const title = stripMarkdown(art.title || art.title_hi || "");
          const summary = stripMarkdown(art.summary || art.summary_hi || art.content || "");
          const imageUrl = art.coverImage || art.cover_image || art.image || "/images/placeholder-news.jpg";

          const dateStr = art.published_at 
            ? new Date(art.published_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })
            : art.created_at
              ? new Date(art.created_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })
              : "";

          const readTimeVal = art.content
            ? Math.max(1, Math.ceil(art.content.split(/\s+/).length / 150))
            : 2;

          return (
            <div 
              key={art.id} 
              className="group flex flex-col sm:flex-row gap-4 bg-white dark:bg-[#0E1322] p-4 rounded-xl border border-gray-150 dark:border-gray-850 shadow-sm hover:shadow-md hover:border-[#f97316]/30 transition-all duration-300"
            >
              {/* Thumbnail */}
              <Link 
                href={`/articles/${art.slug || art.id}`} 
                className="block relative w-full sm:w-32 h-44 sm:h-32 shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-850"
              >
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </Link>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  {/* Category & Date */}
                  <div className="flex items-center space-x-2 text-[9px] font-sans font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                    <span className="text-[#f97316]">{art.category || "समाचार"}</span>
                    <span>•</span>
                    <span>{dateStr}</span>
                  </div>

                  {/* Title */}
                  <Link href={`/articles/${art.slug || art.id}`} className="block hover:text-[#f97316] transition-colors duration-250 mb-2">
                    <h3 className="text-sm md:text-base font-bold font-serif leading-snug text-gray-900 dark:text-white line-clamp-2">
                      {title}
                    </h3>
                  </Link>

                  {/* Summary */}
                  <p className="text-gray-550 dark:text-gray-450 text-xs leading-relaxed line-clamp-2 font-serif mb-2">
                    {summary}
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-sans border-t border-gray-100 dark:border-gray-850 pt-2 mt-2">
                  <span className="font-semibold text-gray-650 dark:text-gray-300">{art.author || "युवाक्षर डेस्क"}</span>
                  <span>{readTimeVal} मिनट पठन</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={handleLoadMore}
            className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-gray-100 hover:bg-[#f97316]/10 text-gray-700 hover:text-[#f97316] dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-[#f97316]/30 font-sans text-xs font-bold rounded-full transition-all duration-300 cursor-pointer shadow-sm"
          >
            <span>{locale === "hi" ? "और अधिक लेख लोड करें" : "Load More Articles"}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
