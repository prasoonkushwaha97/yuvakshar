"use client";

import React from "react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import SectionTitle from "../shared/SectionTitle";
import EditorialCard from "../cards/EditorialCard";

export default function Opinion() {
  const { locale } = useLanguage();
  const { articles } = useCms();

  // Filter articles with opinion/editorial content
  const opinionArticles = articles
    .filter((a: any) => a.status === "Published" || a.status === "Approved" || !a.status)
    .filter((a: any) => a.category === "विश्लेषण" || a.category === "विचार" || a.authorRole)
    .slice(0, 4);

  if (opinionArticles.length === 0) return null;

  return (
    <div className="w-full py-0.5">
      {/* Title */}
      <SectionTitle 
        title={locale === "hi" ? "संपादकीय एवं विचार" : "Opinions & Editorial"} 
        link="/category/विचार" 
      />

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {opinionArticles.map((art: any) => (
          <EditorialCard key={art.id} article={art} />
        ))}
      </div>
    </div>
  );
}
