"use client";
import Image from "next/image";


import React from "react";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
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
    <div className="group flex flex-col h-full bg-transparent rounded-none border-b border-stone-200 dark:border-stone-800 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden pb-4">
      
      {showImage && (
        <Link href={`/articles/${article.slug || article.id}`} className="block relative w-full aspect-[16/10] mb-4 shrink-0 overflow-hidden bg-stone-100 dark:bg-stone-900">
          <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" fill />
        </Link>
      )}

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="flex flex-col min-h-0 px-1">
          {/* Category & Date Row */}
          <div className="flex items-center space-x-2 mb-2 text-[10px] uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400 w-full overflow-hidden">
            <span className="truncate shrink-0 max-w-[50%]">{article.category || "समाचार"}</span>
            <span className="text-stone-300 shrink-0">|</span>
            <span className="text-stone-400 font-sans truncate shrink min-w-0">{cleanDate}</span>
          </div>

          {/* Title */}
          <Link href={`/articles/${article.slug || article.id}`} className="block group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors duration-200 min-h-0">
            <h4 className="font-medium font-serif text-base sm:text-lg leading-snug text-stone-900 dark:text-stone-100 line-clamp-3 mb-3">
              {title}
            </h4>
          </Link>
        </div>

        {/* Bottom Metadata Row */}
        <div className="flex items-center justify-between text-xs text-stone-400 font-sans mt-auto pt-3 px-1">
          <span className="truncate pr-3 font-medium text-stone-500 flex-1 min-w-0 uppercase tracking-widest">
            {article.author || "युवाक्षर"}
          </span>
          <span className="shrink-0 flex items-center text-stone-400 font-medium">
            <ReadingTime time={article.readTime} />
          </span>
        </div>
      </div>
    </div>
  );
}
