"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/store/LanguageContext";

interface AuthorCardProps {
  authorName: string;
  articleCount?: number;
  avatarUrl?: string;
  role?: string;
}

export default function AuthorCard({
  authorName,
  articleCount = 5,
  avatarUrl,
  role = "स्तंभकार"
}: AuthorCardProps) {
  const { locale } = useLanguage();
  const [following, setFollowing] = useState(false);

  const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(authorName)}`;
  const authorSlug = authorName
    ? encodeURIComponent(authorName.toLowerCase().trim().replace(/\s+/g, "-"))
    : "desk";

  return (
    <div className="flex items-center space-x-3 bg-white dark:bg-[#0E1322] p-3.5 border border-gray-150/80 dark:border-gray-850/80 rounded-3xl min-w-[220px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:border-[#f97316]/30 transition-all duration-300">
      <Link href={`/profile/${authorSlug}`} className="flex items-center space-x-3 flex-1 min-w-0 group/author cursor-pointer">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800 bg-gray-50 group-hover/author:border-[#f97316]">
          <img
            src={finalAvatar}
            alt={authorName}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar"; }}
          />
        </div>

        {/* Profile Details */}
        <div className="flex-1 min-w-0">
          <h5 className="font-bold text-xs text-gray-900 dark:text-gray-200 truncate font-serif group-hover/author:text-[#f97316] transition-colors" title={authorName}>
            {authorName}
          </h5>
          <p className="text-[9px] text-gray-400 font-sans tracking-wide uppercase font-bold mt-0.5">
            {role} • {articleCount} {locale === "hi" ? "लेख" : "articles"}
          </p>
        </div>
      </Link>

      {/* Action Button */}
      <button
        onClick={() => setFollowing(!following)}
        className={`px-2.5 py-1 text-[9px] font-sans font-extrabold rounded-full transition-all active:scale-95 border cursor-pointer whitespace-nowrap ${
          following
            ? "bg-gray-100 border-gray-250 text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-450 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
            : "bg-[#f97316] border-[#f97316] text-white hover:bg-[#EA580C]"
        }`}
      >
        {following
          ? (locale === "hi" ? "फॉलोइंग" : "Following")
          : (locale === "hi" ? "फॉलो करें" : "Follow")
        }
      </button>
    </div>
  );
}
