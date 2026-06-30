"use client";
import Image from "next/image";


import React from "react";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import ReadingTime from "../shared/ReadingTime";

import { formatDisplayDate } from "@/utils/date";

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

  const title = stripMarkdown(article.title || article.title_hi || "");
  const imageUrl = article.coverImage || article.cover_image || article.image || "/images/placeholder-news.jpg";
  const cleanDate = formatDisplayDate(article.date);

  return (
    <div className={`group flex gap-4 py-4 border-b border-gray-100/70 dark:border-gray-850/70 last:border-0 ${className}`}>
      {indexNumber !== undefined && (
        <span className="text-lg font-black text-gray-300 dark:text-gray-700 font-sans w-6 text-right shrink-0 select-none">
          {indexNumber}
        </span>
      )}

      {showThumbnail && (
        <Link href={`/articles/${article.slug || article.id}`} className="block relative w-16 h-16 shrink-0 overflow-hidden bg-gray-55 dark:bg-gray-900 rounded-xl border border-gray-150/60 dark:border-gray-850/60">
          <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" fill />
        </Link>
      )}

      <div className="flex-grow min-w-0">
        <div className="flex items-center space-x-2 text-[9px] uppercase tracking-wider font-extrabold text-[#f97316] mb-1">
          <span>{article.category}</span>
          <span className="text-gray-350 dark:text-gray-600">•</span>
          <span>{cleanDate}</span>
        </div>

        <Link href={`/articles/${article.slug || article.id}`} className="block group-hover:text-[#f97316] transition-colors duration-250">
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
