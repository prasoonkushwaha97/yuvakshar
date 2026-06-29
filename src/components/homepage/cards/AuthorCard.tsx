"use client";

import React, { useState } from "react";
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

  return (
    <div className="flex items-center space-x-3 bg-white dark:bg-[#0A0A0A] p-3 border border-gray-150 dark:border-gray-850 rounded-lg min-w-[220px] shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:border-[#f97316]/30 transition-all duration-200">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800 bg-gray-50">
        <img
          src={finalAvatar}
          alt={authorName}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar"; }}
        />
      </div>

      {/* Profile Details */}
      <div className="flex-1 min-w-0">
        <h5 className="font-bold text-xs text-gray-900 dark:text-gray-200 truncate font-serif" title={authorName}>
          {authorName}
        </h5>
        <p className="text-[9px] text-gray-400 font-sans tracking-wide uppercase font-bold mt-0.5">
          {role} • {articleCount} {locale === "hi" ? "लेख" : "articles"}
        </p>
      </div>

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
