"use client";

import React from "react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import SectionTitle from "../shared/SectionTitle";
import AuthorCard from "../cards/AuthorCard";

export default function Authors() {
  const { locale } = useLanguage();
  const { articles } = useCms();

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
        link="/authors" 
      />

      {/* Horizontal List */}
      <div className="flex space-x-4 overflow-x-auto py-2 scrollbar-none">
        {authorNames.map((name) => (
          <AuthorCard 
            key={name} 
            authorName={name} 
            articleCount={authorCounts[name]} 
            role={name === "युवाक्षर डेस्क" ? "संपादकीय मंडल" : "स्तंभकार"}
          />
        ))}
      </div>
    </div>
  );
}
