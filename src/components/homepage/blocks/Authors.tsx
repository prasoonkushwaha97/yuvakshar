"use client";

import React from "react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import SectionTitle from "../shared/SectionTitle";
import UserIdentity from "@/components/shared/UserIdentity";

export default function Authors() {
  const { locale } = useLanguage();
  const { articles, users } = useCms();

  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  // Extract author names & count their articles
  const authorCounts: Record<string, number> = {};
  published.forEach((art: any) => {
    if (art.author) {
      authorCounts[art.author] = (authorCounts[art.author] || 0) + 1;
    }
  });

  const authorNames = Object.keys(authorCounts);

  if (authorNames.length === 0) return null;

  return (
    <div className="w-full py-0.5">
      {/* Title */}
      <SectionTitle 
        title={locale === "hi" ? "हमारे लेखक और योगदानकर्ता" : "Our Authors & Contributors"} 
        link="/community" 
      />

      {/* Horizontal List */}
      <div className="flex space-x-4 overflow-x-auto py-2 scrollbar-none">
        {authorNames.map((name) => {
          const userObj = (users || []).find((u: any) => u.name === name || u.username === name || u.slug === name);
          return (
            <div key={name} className="min-w-[250px] shrink-0 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
              <UserIdentity 
                user={userObj || { name: name, username: name }} 
                variant="card" 
              />
              <div className="mt-3 text-sm text-slate-500 font-medium border-t border-slate-100 dark:border-slate-800 pt-3">
                {authorCounts[name]} प्रकाशित लेख
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
