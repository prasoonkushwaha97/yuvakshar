"use client";

import React from "react";
import ReadingTime from "./ReadingTime";
import ViewCounter from "./ViewCounter";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";

interface MetaInfoProps {
  articleId: string;
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
  author,
  date,
  readTime,
  views,
  title,
  showActions = true,
  className = ""
}: MetaInfoProps) {
  const cleanDate = date ? date.split(",")[0] : "";
  const initial = author ? author.charAt(0).toUpperCase() : "U";

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-150 dark:border-gray-800/80 pt-3 mt-auto font-sans w-full ${className}`}>
      {/* Left: Author avatar & Date */}
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 text-[#111] dark:text-[#FFF] flex items-center justify-center text-[9px] font-extrabold uppercase shrink-0">
          {initial}
        </div>
        <span className="font-extrabold text-gray-700 dark:text-gray-300 hover:text-[#f97316] transition-colors">{author}</span>
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
            <ShareButton articleId={articleId} title={title} />
          </div>
        )}
      </div>
    </div>
  );
}
