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
    <div className={`group flex gap-3.5 p-2 rounded-xl bg-transparent hover:bg-stone-50 dark:hover:bg-zinc-900/50 border-b border-slate-100/80 dark:border-zinc-800/60 last:border-b-0 hover:-translate-y-0.5 transition-all duration-200 ${className}`}>
      {indexNumber !== undefined && (
        <span className="text-lg font-black text-slate-400 dark:text-zinc-600 font-sans w-6 text-right shrink-0 select-none">
          {indexNumber}
        </span>
      )}

      {showThumbnail && (
        <Link href={getArticleUrl(article)} className="block relative w-16 h-16 shrink-0 overflow-hidden bg-slate-100 dark:bg-zinc-900 rounded-lg">
          <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-500 ease-out" loading="lazy" fill sizes="64px" />
        </Link>
      )}

      <div className="flex-grow min-w-0">
        <div className="flex items-center text-[10px] uppercase tracking-wider font-extrabold text-[#F97316] mb-1">
          <span>{article.category}</span>
        </div>

        <Link href={getArticleUrl(article)} className="block min-h-0">
          <h4 className="font-bold font-serif text-[14px] leading-[1.5] text-slate-900 dark:text-zinc-100 line-clamp-2">
            {title}
          </h4>
        </Link>

        <div className="mt-1">
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
