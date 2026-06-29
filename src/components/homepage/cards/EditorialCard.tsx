"use client";

import React from "react";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";

interface EditorialCardProps {
  article: any;
}

export default function EditorialCard({ article }: EditorialCardProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || article.title_hi || "");
  const summary = stripMarkdown(article.summary || article.summary_hi || article.content || "");
  const authorAvatar = article.authorAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(article.author || "User")}`;
  const authorRole = article.authorRole || "वरिष्ठ स्तंभकार";

  return (
    <div className="group flex flex-col items-center text-center bg-white dark:bg-[#0A0A0A] p-6 rounded-lg border border-gray-150 dark:border-gray-850 hover:shadow-[0_8px_20px_-6px_rgba(249,115,22,0.1)] hover:border-[#f97316]/40 transition-all duration-300">
      {/* Columnist Avatar */}
      <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-gray-100 dark:border-gray-800 group-hover:border-[#f97316] transition-colors shrink-0 bg-gray-50">
        <img
          src={authorAvatar}
          alt={article.author}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar"; }}
        />
      </div>

      {/* Columnist Metadata */}
      <span className="font-extrabold text-sm text-gray-850 dark:text-gray-200 block mb-0.5">
        {article.author}
      </span>
      <span className="text-[10px] text-gray-400 font-sans uppercase font-bold tracking-widest block mb-4">
        {authorRole}
      </span>

      {/* Column Title */}
      <Link href={`/articles/${article.slug || article.id}`} className="block flex-grow group-hover:text-[#f97316] transition-colors">
        <h4 className="font-serif font-black text-[15px] leading-snug text-gray-900 dark:text-gray-150 line-clamp-3 mb-3">
          "{title}"
        </h4>
      </Link>

      <p className="text-gray-500 dark:text-gray-400 text-xs font-serif line-clamp-2 leading-relaxed mb-4">
        {summary}
      </p>

      {/* Link to Read */}
      <Link
        href={`/articles/${article.slug || article.id}`}
        className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#f97316] hover:text-[#EA580C] mt-auto hover:underline"
      >
        कॉलम पढ़ें
      </Link>
    </div>
  );
}
