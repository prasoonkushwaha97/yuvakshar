import React from "react";
import Link from "next/link";
import UserIdentity from "@/components/shared/UserIdentity";
import ReadingTime from "./ReadingTime";
import ViewCounter from "./ViewCounter";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";

import { formatDisplayDate } from "@/utils/date";
import { Profile } from "@/store/types";

interface MetaInfoProps {
  articleId: string;
  slug?: string;
  author: string;
  authorProfile?: Profile;
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
  authorProfile,
  date,
  readTime,
  views,
  title,
  showActions = true,
  className = ""
}: MetaInfoProps) {
  const cleanDate = formatDisplayDate(date);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-150 dark:border-gray-800/80 pt-3 mt-auto font-sans w-full ${className}`}>
      {/* Left: Author avatar & Date */}
      <div className="flex items-center space-x-2">
        <UserIdentity 
          user={authorProfile || { name: author }} 
          variant="inline" 
          showAvatar={true} 
          showUsername={false} 
          showRole={false} 
          showBadge={false} 
        />
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
