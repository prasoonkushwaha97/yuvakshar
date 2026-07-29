"use client";

import React from "react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import ArticleCardMedium from "../cards/ArticleCardMedium";
import SectionContainer from "../layout/SectionContainer";
import { isPublishedWithinDays, getArticleTimestamp } from "@/utils/date";

interface LatestNewsProps {
  excludeIds?: string[];
}

export default function LatestNews({ excludeIds = [] }: LatestNewsProps) {
  const { locale } = useLanguage();
  const { articles } = useCms();

  // Initial local articles from CmsContext
  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  // Filter out hero/featured excluded articles AND articles older than 5 days
  // Sort descending by publication date (newest first)
  const visibleArticles = published
    .filter((a: any) => !excludeIds.includes(a.id))
    .filter((a: any) => isPublishedWithinDays(a, 5))
    .sort((a: any, b: any) => getArticleTimestamp(b) - getArticleTimestamp(a));

  if (visibleArticles.length === 0) return null;

  return (
    <SectionContainer bgClassName="bg-[#FAFAF9] dark:bg-[#1C1917]">
      <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-150 dark:border-gray-850 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500" />
          <h2 className="font-serif font-medium text-lg md:text-xl text-stone-900 dark:text-stone-100 uppercase tracking-widest">
            {locale === "hi" ? "हाल ही में प्रकाशित" : "Recently Published"}
          </h2>
        </div>
      </div>

      {/* Feed List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-4">
        {visibleArticles.map((art: any) => (
          <ArticleCardMedium key={art.id} article={art} />
        ))}
      </div>
      </div>
    </SectionContainer>
  );
}
