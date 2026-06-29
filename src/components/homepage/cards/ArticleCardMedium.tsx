"use client";

import React from "react";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import CategoryBadge from "../shared/CategoryBadge";
import ReadingTime from "../shared/ReadingTime";

import { formatDisplayDate } from "@/utils/date";

interface ArticleCardMediumProps {
  article: any;
  showImage?: boolean;
}

export default function ArticleCardMedium({ article, showImage = true }: ArticleCardMediumProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || article.title_hi || "");
  const imageUrl = article.coverImage || article.cover_image || article.image || "/images/placeholder-news.jpg";
  const cleanDate = formatDisplayDate(article.date);

  return (
    <div className="group flex gap-4 bg-white dark:bg-[#0E1322] p-4 rounded-3xl border border-gray-150/80 dark:border-gray-850/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:border-[#f97316]/30 transition-all duration-300">
      {showImage && (
        <Link href={`/articles/${article.slug || article.id}`} className="block relative w-20 h-20 shrink-0 overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-150/60 dark:border-gray-850/60">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }}
            loading="lazy"
          />
        </Link>
      )}

      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1 text-[9px] uppercase tracking-wider font-bold text-[#f97316]">
          <span>{article.category}</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-400 font-sans">{cleanDate}</span>
        </div>

        <Link href={`/articles/${article.slug || article.id}`} className="block group-hover:text-[#f97316] transition-colors duration-200">
          <h4 className="font-bold font-serif text-[14px] leading-snug text-gray-900 dark:text-gray-150 line-clamp-2">
            {title}
          </h4>
        </Link>

        <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-gray-400 font-sans">
          <span>{article.author}</span>
          <span>•</span>
          <ReadingTime time={article.readTime} />
        </div>
      </div>
    </div>
  );
}
