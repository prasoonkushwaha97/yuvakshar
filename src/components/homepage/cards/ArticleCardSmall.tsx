"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import MetaInfo from "../shared/MetaInfo";
import { formatDisplayDate } from "@/utils/date";
import { getArticleUrl } from "@/utils/routes";

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
        <Link href={getArticleUrl(article)} className="block relative w-16 h-16 shrink-0 overflow-hidden bg-gray-55 dark:bg-gray-900 rounded-xl border border-gray-150/60 dark:border-gray-850/60">
          <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" fill />
        </Link>
      )}

      <div className="flex-grow min-w-0">
        <div className="flex items-center text-[9px] uppercase tracking-wider font-extrabold text-[#f97316] mb-1">
          <span>{article.category}</span>
        </div>

        <Link href={getArticleUrl(article)} className="block group-hover:text-[#f97316] transition-colors duration-250">
          <h4 className="font-bold font-serif text-[13.5px] leading-snug text-gray-900 dark:text-gray-200 line-clamp-2">
            {title}
          </h4>
        </Link>

        <div className="mt-1">
          <MetaInfo
            articleId={article.id}
            slug={article.slug}
            author={article.author || "युवाक्षर डेस्क"}
            authorProfile={article.authorProfile}
            date={article.date}
            showActions={false}
          />
        </div>
      </div>
    </div>
  );
}
