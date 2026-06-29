"use client";

import React from "react";
import Link from "next/link";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { stripMarkdown } from "@/lib/markdown";
import { Clock, Calendar, ArrowRight } from "lucide-react";

export default function TopStories() {
  const { locale } = useLanguage();
  const { articles } = useCms();

  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  if (published.length === 0) return null;

  // Main Hero Story (to exclude)
  const heroStory = published.find((a: any) => a.hero || a.isFeatured) || published[0];

  // Remaining articles
  const remaining = published.filter((a: any) => a.id !== heroStory.id);

  // Top Stories: Next 8 articles
  const topStories = remaining.slice(0, 8);

  if (topStories.length === 0) return null;

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-150 dark:border-gray-850 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#f97316]" />
          <h2 className="font-serif font-black text-lg md:text-xl text-gray-900 dark:text-white uppercase tracking-tight">
            {locale === "hi" ? "मुख्य समाचार" : "Top Stories"}
          </h2>
        </div>
      </div>

      {/* Responsive layout: Swipe on mobile, Grid on tablet/desktop */}
      <div className="flex sm:grid sm:grid-cols-2 gap-6 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none">
        {topStories.map((art: any) => {
          const title = stripMarkdown(art.title || art.title_hi || "");
          const summary = stripMarkdown(art.summary || art.summary_hi || art.content || "");
          const imageUrl = art.coverImage || art.cover_image || art.image || "/images/placeholder-news.jpg";

          const dateStr = art.published_at 
            ? new Date(art.published_at).toLocaleDateString("hi-IN", { year: "numeric", month: "short", day: "numeric" })
            : art.created_at
              ? new Date(art.created_at).toLocaleDateString("hi-IN", { year: "numeric", month: "short", day: "numeric" })
              : "";

          const readTimeVal = art.content
            ? Math.max(1, Math.ceil(art.content.split(/\s+/).length / 150))
            : 2;

          return (
            <div 
              key={art.id} 
              className="group flex flex-col w-[85vw] sm:w-auto shrink-0 sm:shrink bg-white dark:bg-[#0E1322] rounded-3xl overflow-hidden border border-gray-150/80 dark:border-gray-850/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:border-[#f97316]/30 transition-all duration-300 snap-start"
            >
              {/* Image Section */}
              <Link 
                href={`/articles/${art.slug || art.id}`} 
                className="block relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-850 shrink-0"
              >
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-[#f97316] text-white text-[9px] font-sans font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {art.category || "समाचार"}
                  </span>
                </div>
              </Link>

              {/* Text Section */}
              <div className="flex-1 flex flex-col p-5">
                {/* Meta details */}
                <div className="flex items-center space-x-2 text-[9px] font-sans font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  <span>{dateStr}</span>
                  <span>•</span>
                  <span>{readTimeVal} मिनट पठन</span>
                </div>

                {/* Title */}
                <Link href={`/articles/${art.slug || art.id}`} className="block hover:text-[#f97316] transition-colors duration-250 mb-2">
                  <h3 className="text-base md:text-lg font-bold font-serif leading-snug text-gray-900 dark:text-white line-clamp-2">
                    {title}
                  </h3>
                </Link>

                {/* Summary */}
                <p className="text-gray-550 dark:text-gray-400 text-xs md:text-sm leading-relaxed mb-4 font-serif line-clamp-2">
                  {summary}
                </p>

                {/* Author Info & Link */}
                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between">
                  <span className="text-xs text-gray-650 dark:text-gray-300 font-sans font-semibold">
                    {art.author || "युवाक्षर डेस्क"}
                  </span>
                  <Link 
                    href={`/articles/${art.slug || art.id}`}
                    className="inline-flex items-center space-x-1 text-[10px] font-bold text-[#f97316] hover:text-[#ea580c] transition-colors"
                  >
                    <span>आगे पढ़ें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
