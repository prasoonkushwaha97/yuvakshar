"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import MetaInfo from "../shared/MetaInfo";
import { formatDisplayDate } from "@/utils/date";
import { getArticleUrl } from "@/utils/routes";

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
        <Link href={getArticleUrl(article)} className="block relative w-full aspect-[16/10] mb-4 shrink-0 overflow-hidden bg-stone-100 dark:bg-stone-900">
          <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" fill />
        </Link>
      )}

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="flex flex-col min-h-0 px-1">
          {/* Category Row */}
          <div className="flex items-center mb-2 text-[10px] uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400 w-full overflow-hidden">
            <span className="truncate">{article.category || "समाचार"}</span>
          </div>

          {/* Title */}
          <Link href={getArticleUrl(article)} className="block group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors duration-200 min-h-0">
            <h4 className="font-medium font-serif text-base sm:text-lg leading-snug text-stone-900 dark:text-stone-100 line-clamp-3 mb-3">
              {title}
            </h4>
          </Link>
        </div>

        {/* Bottom Metadata Row */}
        <div className="mt-auto pt-3 px-1 border-t border-stone-100 dark:border-stone-800/80">
          <MetaInfo
            articleId={article.id}
            slug={article.slug}
            author={article.profiles?.name || article.author || "युवाक्षर डेस्क"}
            authorProfile={article.profiles || article.authorProfile}
            date={article.date}
            showActions={false}
          />
        </div>
      </div>
    </div>
  );
}
