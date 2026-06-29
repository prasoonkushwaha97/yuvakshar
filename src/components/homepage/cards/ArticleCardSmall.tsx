"use client";

import React from "react";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import ReadingTime from "../shared/ReadingTime";

interface ArticleCardSmallProps {
  article: any;
  showThumbnail?: boolean;
  indexNumber?: number;
  className?: string;
}

export default function ArticleCardSmall({
  article,
  showThumbnail = true,
  indexNumber,
  className = ""
}: ArticleCardSmallProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || "");
  const imageUrl = article.coverImage || article.image || "/images/placeholder-news.jpg";
  const cleanDate = article.date ? article.date.split(",")[0] : "";

  return (
    <div className={`group flex gap-3 py-3 border-b border-gray-100 dark:border-gray-850 last:border-0 ${className}`}>
      {indexNumber !== undefined && (
        <span className="text-xl font-bold text-gray-300 dark:text-gray-700 font-sans w-6 text-right shrink-0 select-none">
          {indexNumber}
        </span>
      )}

      {showThumbnail && (
        <Link href={`/editorial?id=${article.id}`} className="block relative w-16 h-16 shrink-0 overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-sm border border-gray-150 dark:border-gray-850">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }}
            loading="lazy"
          />
        </Link>
      )}

      <div className="flex-grow min-w-0">
        <div className="flex items-center space-x-2 text-[9px] uppercase tracking-wider font-extrabold text-[#f97316] mb-1">
          <span>{article.category}</span>
          <span className="text-gray-350 dark:text-gray-600">•</span>
          <span>{cleanDate}</span>
        </div>

        <Link href={`/editorial?id=${article.id}`} className="block group-hover:text-[#f97316] transition-colors duration-250">
          <h4 className="font-bold font-serif text-[13.5px] leading-snug text-gray-900 dark:text-gray-200 line-clamp-2">
            {title}
          </h4>
        </Link>

        <div className="flex items-center space-x-2.5 mt-1 text-[10px] text-gray-400 font-sans">
          <span>{article.author}</span>
          <span>•</span>
          <ReadingTime time={article.readTime} />
        </div>
      </div>
    </div>
  );
}
