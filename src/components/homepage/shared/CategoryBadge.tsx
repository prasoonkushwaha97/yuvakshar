"use client";

import React from "react";
import { useLanguage } from "@/store/LanguageContext";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export default function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const { locale } = useLanguage();

  // Translation mapping for category badges
  const categoryTranslations: Record<string, Record<string, string>> = {
    hi: {
      "news": "समाचार",
      "analysis": "विश्लेषण",
      "special": "विशेष लेख",
      "opinion": "विचार",
      "literature": "साहित्य",
      "history": "इतिहास",
      "environment": "पर्यावरण",
      "education": "शिक्षा",
      "science": "विज्ञान",
      "technology": "तकनीक",
      "culture": "संस्कृति",
      "video": "वीडियो"
    },
    en: {
      "समाचार": "News",
      "विश्लेषण": "Analysis",
      "विशेष लेख": "Special Article",
      "विचार": "Opinion",
      "साहित्य": "Literature",
      "इतिहास": "History",
      "पर्यावरण": "Environment",
      "शिक्षा": "Education",
      "विज्ञान": "Science",
      "तकनीक": "Technology",
      "संस्कृति": "Culture",
      "वीडियो": "Video"
    }
  };

  const displayCategory = (() => {
    const cleanCat = category.toLowerCase().trim();
    if (locale === "hi") {
      return categoryTranslations.hi[cleanCat] || category;
    } else {
      return categoryTranslations.en[category] || categoryTranslations.en[cleanCat] || category;
    }
  })();

  return (
    <span className={`inline-block bg-[#f97316]/10 text-[#f97316] font-sans font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-sm border border-[#f97316]/20 select-none ${className}`}>
      {displayCategory}
    </span>
  );
}
