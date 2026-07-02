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
  updatedAt?: string;
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
  updatedAt,
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

  const profileHref = resolvedUser ? getProfileUrl(resolvedUser) : null;
  const authorName = resolvedUser?.name || author || "युवाक्षर डेस्क";

  const cleanDate = formatDisplayDate(date);
  const cleanUpdatedDate = updatedAt ? formatDisplayDate(updatedAt) : "";

  const showUpdated = React.useMemo(() => {
    if (!updatedAt || !date) return false;
    try {
      const pubTime = new Date(date).getTime();
      const updTime = new Date(updatedAt).getTime();
      if (isNaN(pubTime) || isNaN(updTime)) return false;
      // Meaningfully updated if updated_at is at least 10 minutes after publication/creation
      return (updTime - pubTime) > 10 * 60000;
    } catch (e) {
      return false;
    }
  }, [date, updatedAt]);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 text-xs text-slate-550 dark:text-slate-400 font-sans w-full ${className}`}>
      {/* Left: Author & Date */}
      <div className="flex items-center space-x-2">
        {profileHref ? (
          <Link href={profileHref} className="hover:text-primary transition-colors font-bold">
            {authorName}
          </Link>
        ) : (
          <span className="font-bold text-slate-700 dark:text-slate-300">{authorName}</span>
        )}
        <span>•</span>
        <span>{cleanDate}</span>
        {showUpdated && cleanUpdatedDate && (
          <>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-400">अद्यतन: {cleanUpdatedDate}</span>
          </>
        )}
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

