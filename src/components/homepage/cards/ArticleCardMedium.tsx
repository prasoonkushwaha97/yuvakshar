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
    <div className="group flex flex-col h-full bg-white dark:bg-[#0E1322] p-4 rounded-3xl border border-gray-150/80 dark:border-gray-850/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:border-[#f97316]/30 transition-all duration-300 overflow-hidden">
      
      {showImage && (
        <Link href={`/articles/${article.slug || article.id}`} className="block relative w-full aspect-[16/10] mb-4 shrink-0 overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-150/60 dark:border-gray-850/60">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }}
            loading="lazy"
          />
        </Link>
      )}

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="flex flex-col min-h-0">
          {/* Category & Date Row */}
          <div className="flex items-center space-x-2 mb-2 text-[10px] uppercase tracking-wider font-bold text-[#f97316] w-full overflow-hidden">
            <span className="truncate shrink-0 max-w-[50%]">{article.category || "समाचार"}</span>
            <span className="text-gray-300 shrink-0">•</span>
            <span className="text-gray-400 font-sans truncate shrink min-w-0">{cleanDate}</span>
          </div>

          {/* Title */}
          <Link href={`/articles/${article.slug || article.id}`} className="block group-hover:text-[#f97316] transition-colors duration-200 min-h-0">
            <h4 className="font-bold font-serif text-[15px] sm:text-[16px] leading-snug text-gray-900 dark:text-gray-150 line-clamp-3 mb-3">
              {title}
            </h4>
          </Link>
        </div>

        {/* Bottom Metadata Row */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-sans mt-auto border-t border-gray-100 dark:border-gray-800/60 pt-3">
          <span className="truncate pr-3 font-medium text-gray-500 dark:text-gray-400 flex-1 min-w-0">
            {article.author || "युवाक्षर"}
          </span>
          <span className="shrink-0 flex items-center text-gray-400">
            <ReadingTime time={article.readTime} />
          </span>
        </div>
      </div>
    </div>
  );
}
