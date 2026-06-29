"use client";

import React from "react";
import { Eye } from "lucide-react";
import { useLanguage } from "@/store/LanguageContext";

interface ViewCounterProps {
  views?: number | string;
  className?: string;
}

export default function ViewCounter({ views = 0, className = "" }: ViewCounterProps) {
  const { locale } = useLanguage();

  const formattedViews = (() => {
    const v = typeof views === "string" ? parseInt(views) || 0 : views;
    if (v >= 1000) {
      const kVal = (v / 1000).toFixed(1);
      return `${kVal}k`;
    }
    return v.toString();
  })();

  return (
    <span className={`inline-flex items-center text-[11px] text-gray-400 dark:text-gray-500 font-sans ${className}`}>
      <Eye className="w-3.5 h-3.5 mr-1" />
      <span>
        {formattedViews} {locale === "hi" ? "व्यूज़" : "views"}
      </span>
    </span>
  );
}
