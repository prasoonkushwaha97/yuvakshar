"use client";

import React from "react";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";
import { formatDisplayDate } from "@/utils/date";
import UserIdentity from "@/components/shared/UserIdentity";
import { Profile } from "@/store/types";

interface MetaInfoProps {
  articleId?: string;
  slug?: string;
  author: string;
  authorProfile?: Partial<Profile> | null;
  date: string;
  title?: string;
  showActions?: boolean;
  className?: string;
}

export default function MetaInfo({
  articleId,
  slug,
  author,
  authorProfile,
  date,
  title,
  showActions = false,
  className = ""
}: MetaInfoProps) {
  const cleanDate = formatDisplayDate(date);

  // We construct a minimal fallback user to pass to UserIdentity
  // UserIdentity will automatically resolve the full profile from CmsContext
  const initialUser = authorProfile || { name: author };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 text-xs text-slate-550 dark:text-slate-400 font-sans w-full ${className}`}>
      {/* Left: Author & Date Block */}
      <div className="flex items-center space-x-2">
        <UserIdentity 
          user={initialUser} 
          variant="inline"
          showAvatar={true}
          showBadge={true}
          className="text-slate-700 dark:text-slate-350"
        />
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span>{cleanDate}</span>
      </div>

      {/* Right: Actions */}
      {showActions && articleId && (
        <div className="flex items-center space-x-1 border-l border-slate-200 dark:border-slate-800 pl-2 ml-auto shrink-0">
          <BookmarkButton articleId={articleId} />
          <ShareButton articleId={articleId} slug={slug} title={title || ""} />
        </div>
      )}
    </div>
  );
}

