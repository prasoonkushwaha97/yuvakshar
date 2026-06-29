"use client";

import React from "react";
import { useCms } from "@/store/CmsContext";
import SectionTitle from "../shared/SectionTitle";
import ArticleCardLarge from "../cards/ArticleCardLarge";
import ArticleCardMedium from "../cards/ArticleCardMedium";

interface CategoryBlockProps {
  categoryName: string; // Hindi name matching category field, e.g. "शिक्षा", "साहित्य"
  englishName?: string;  // English fallback title
  limit?: number;
}

export default function CategoryBlock({ categoryName, englishName, limit = 4 }: CategoryBlockProps) {
  const { articles } = useCms();

  const categoryArticles = articles
    .filter((art: any) => art.status === "Published" || art.status === "Approved" || !art.status)
    .filter(
      (art: any) => 
        art.category?.trim().toLowerCase() === categoryName.toLowerCase() ||
        (englishName && art.category?.trim().toLowerCase() === englishName.toLowerCase())
    );

  // If no articles match this category, hide the block entirely
  if (categoryArticles.length === 0) return null;

  const featured = categoryArticles[0];
  const secondary = categoryArticles.slice(1, limit + 1);

  return (
    <div className="w-full py-4">
      {/* Category Section Header */}
      <SectionTitle title={categoryName} link={`/category/${encodeURIComponent(categoryName)}`} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: 1 Featured Story */}
        <div className="lg:col-span-6 flex">
          <ArticleCardLarge article={featured} />
        </div>

        {/* Right Column: 4 Secondary Stories */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {secondary.map((art: any) => (
            <ArticleCardMedium key={art.id} article={art} showImage={true} />
          ))}
          {/* Fill empty grid blocks if count is low to keep newspaper density */}
          {secondary.length === 0 && (
            <div className="col-span-2 py-8 text-center text-xs text-gray-400 dark:text-gray-600 font-serif">
              शीघ्र ही और लेख प्रकाशित किए जाएंगे।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
