"use client";

import React from "react";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import CategoryBadge from "../shared/CategoryBadge";
import MetaInfo from "../shared/MetaInfo";

interface ArticleCardLargeProps {
  article: any;
}

export default function ArticleCardLarge({ article }: ArticleCardLargeProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || "");
  const summary = stripMarkdown(article.summary || article.content || "");
  const imageUrl = article.coverImage || article.image || "/images/placeholder-news.jpg";

  return (
    <div className="group flex flex-col w-full h-full bg-white dark:bg-[#0A0A0A] rounded-lg overflow-hidden border border-gray-150 dark:border-gray-850 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] transition-all duration-300">
      {/* Image Block */}
      <Link href={`/editorial?id=${article.id}`} className="block relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-850 shrink-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }}
          loading="lazy"
        />
        <div className="absolute top-3 left-3 z-10">
          <CategoryBadge category={article.category} />
        </div>
      </Link>

      {/* Content Block */}
      <div className="flex-1 flex flex-col p-5">
        <Link href={`/editorial?id=${article.id}`} className="block group-hover:text-[#f97316] transition-colors duration-200">
          <h3 className="text-xl font-bold font-serif leading-[1.3] text-gray-900 dark:text-gray-150 mb-2.5 line-clamp-2">
            {title}
          </h3>
        </Link>

        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed mb-4 font-serif line-clamp-3">
          {summary}
        </p>

        <MetaInfo
          articleId={article.id}
          author={article.author || "युवाक्षर डेस्क"}
          date={article.date || ""}
          readTime={article.readTime}
          views={article.views}
          title={title}
          showActions={true}
        />
      </div>
    </div>
  );
}
