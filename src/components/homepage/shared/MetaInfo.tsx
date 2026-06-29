import React from "react";
import Link from "next/link";
import ReadingTime from "./ReadingTime";
import ViewCounter from "./ViewCounter";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";

import { formatDisplayDate } from "@/utils/date";

interface MetaInfoProps {
  articleId: string;
  slug?: string;
  author: string;
  date: string;
  readTime?: string | number;
  views?: number | string;
  title: string;
  showActions?: boolean;
  className?: string;
}

export default function MetaInfo({
  articleId,
  slug,
  author,
  date,
  readTime,
  views,
  title,
  showActions = true,
  className = ""
}: MetaInfoProps) {
  const cleanDate = formatDisplayDate(date);
  const initial = author ? author.charAt(0).toUpperCase() : "U";
  const authorSlug = author
    ? encodeURIComponent(author.toLowerCase().trim().replace(/\s+/g, "-"))
    : "desk";

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-150 dark:border-gray-800/80 pt-3 mt-auto font-sans w-full ${className}`}>
      {/* Left: Author avatar & Date */}
      <div className="flex items-center space-x-2">
        <Link href={`/authors/${authorSlug}`} className="flex items-center space-x-2 group/author cursor-pointer">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 text-[#111] dark:text-[#FFF] flex items-center justify-center text-[9px] font-extrabold uppercase shrink-0 group-hover/author:border group-hover/author:border-[#f97316]/50">
            {initial}
          </div>
          <span className="font-extrabold text-gray-700 dark:text-gray-300 group-hover/author:text-[#f97316] transition-colors">{author}</span>
        </Link>
        <span className="text-gray-350 dark:text-gray-600">•</span>
        <span>{cleanDate}</span>
      </div>

      {/* Right: Stats & Actions */}
      <div className="flex items-center space-x-3 ml-auto">
        <ReadingTime time={readTime} />
        {views !== undefined && (
          <>
            <span className="text-gray-350 dark:text-gray-600">•</span>
            <ViewCounter views={views} />
          </>
        )}

        {showActions && (
          <div className="flex items-center space-x-1 border-l border-gray-200 dark:border-gray-800 pl-2">
            <BookmarkButton articleId={articleId} />
            <ShareButton articleId={articleId} slug={slug} title={title} />
          </div>
        )}
      </div>
    </div>
  );
}
