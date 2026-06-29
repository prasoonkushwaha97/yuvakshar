"use client";

import React from "react";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import CategoryBadge from "../shared/CategoryBadge";
import ReadingTime from "../shared/ReadingTime";

interface ArticleCardMediumProps {
  article: any;
  showImage?: boolean;
}

export default function ArticleCardMedium({ article, showImage = true }: ArticleCardMediumProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || "");
  const imageUrl = article.coverImage || article.image || "/images/placeholder-news.jpg";
  const cleanDate = article.date ? article.date.split(",")[0] : "";

  return (
    <div className="group flex gap-3.5 bg-white dark:bg-[#0A0A0A] p-3 rounded-lg border border-gray-150 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      {showImage && (
        <Link href={`/editorial?id=${article.id}`} className="block relative w-20 h-20 shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-900 rounded-sm border border-gray-100 dark:border-gray-850">
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

        <Link href={`/editorial?id=${article.id}`} className="block group-hover:text-[#f97316] transition-colors duration-200">
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
