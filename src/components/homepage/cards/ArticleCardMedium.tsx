"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import MetaInfo from "../shared/MetaInfo";
import { formatDisplayDate } from "@/utils/date";
import { getArticleUrl } from "@/utils/routes";
import { getArticleImage, handleImageError } from "@/utils/imageHelper";

interface ArticleCardMediumProps {
  article: any;
  showImage?: boolean;
}

export default function ArticleCardMedium({ article, showImage = true }: ArticleCardMediumProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || article.title_hi || "");
  const imageUrl = getArticleImage(article);
  const cleanDate = formatDisplayDate(article.date);

  return (
    <div className="group flex flex-col h-full bg-white dark:bg-zinc-900/40 rounded-2xl p-3 border border-slate-200/60 dark:border-zinc-800/50 hover:border-[#f97316]/30 dark:hover:border-[#f97316]/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      
      {showImage && (
        <Link href={getArticleUrl(article)} className="block relative w-full aspect-[16/10] mb-3 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900">
          <Image src={imageUrl} alt={title} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-500 ease-out" loading="lazy" fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px" />
        </Link>
      )}

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="flex flex-col min-h-0 px-0.5">
          {/* Category Row */}
          <div className="flex items-center mb-1.5 text-[11px] uppercase tracking-wider font-bold text-[#F97316] w-full overflow-hidden">
            <span className="truncate">{article.category || "समाचार"}</span>
          </div>

          {/* Title */}
          <Link href={getArticleUrl(article)} className="block min-h-0">
            <h4 className="font-bold font-serif text-base sm:text-[17px] leading-[1.5] text-slate-900 dark:text-zinc-100 line-clamp-3 mb-2.5">
              {title}
            </h4>
          </Link>
        </div>

        {/* Bottom Metadata Row */}
        <div className="mt-auto pt-2.5 border-t border-slate-100/80 dark:border-zinc-800/60">
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
