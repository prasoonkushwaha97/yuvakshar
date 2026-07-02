"use client";

import React from "react";
import Link from "next/link";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";
import { formatDisplayDate } from "@/utils/date";
import { getProfileUrl } from "@/utils/routes";
import { useCms } from "@/store/CmsContext";
import { Profile } from "@/store/types";

interface MetaInfoProps {
  articleId?: string;
  slug?: string;
  author: string;
  authorProfile?: Partial<Profile> | any;
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
  const { users } = useCms();

  const resolvedUser = React.useMemo(() => {
    if (authorProfile && (authorProfile.username || authorProfile.id || authorProfile.slug)) {
      return authorProfile;
    }
    if (users && author) {
      const found = users.find((u) => u.name === author || (u as any).full_name === author);
      if (found) return found;
    }
    return authorProfile || null;
  }, [authorProfile, author, users]);

  const profileHref = React.useMemo(() => {
    if (resolvedUser) {
      return getProfileUrl(resolvedUser) || "/u/user";
    }
    if (author) {
      const fallbackSlug = author.toLowerCase().replace(/[^a-z0-9_.-]/g, '-').replace(/[-_.]+/g, '-').replace(/^-+|-+$/g, '');
      return `/u/${fallbackSlug || "unknown"}`;
    }
    return "/u/user";
  }, [resolvedUser, author]);

  const authorName = resolvedUser?.name || author || "युवाक्षर डेस्क";
  const avatarUrl = resolvedUser?.avatar_url || null;
  const isVerified = resolvedUser?.verified || false;

  const cleanDate = formatDisplayDate(date);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 text-xs text-slate-550 dark:text-slate-400 font-sans w-full ${className}`}>
      {/* Left: Clickable Author & Date Block */}
      <div className="flex items-center space-x-2">
        <Link 
          href={profileHref} 
          aria-label={`View ${authorName}'s profile`}
          className="group flex items-center space-x-1.5 text-slate-700 dark:text-slate-350 hover:text-primary transition-colors font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1 -mx-1 py-0.5"
        >
          {avatarUrl && (
            <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
              <img 
                src={avatarUrl} 
                alt={authorName} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          <span>{authorName}</span>
          {isVerified && (
            <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </Link>
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
