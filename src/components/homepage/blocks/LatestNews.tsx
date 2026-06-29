"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { ChevronDown } from "lucide-react";
import ArticleCardMedium from "../cards/ArticleCardMedium";

interface LatestNewsProps {
  excludeIds?: string[];
}

export default function LatestNews({ excludeIds = [] }: LatestNewsProps) {
  const { locale } = useLanguage();
  const { articles } = useCms();
  const [visibleCount, setVisibleCount] = useState(10);

  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  if (published.length === 0) return null;

  // Filter out any articles rendered in Hero or TopStories
  const feedArticles = published.filter((a: any) => !excludeIds.includes(a.id));

  if (feedArticles.length === 0) return null;

  const visibleArticles = feedArticles.slice(0, visibleCount);
  const hasMore = feedArticles.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
        {visibleArticles.map((art: any) => (
          <ArticleCardMedium key={art.id} article={art} />
        ))}
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
