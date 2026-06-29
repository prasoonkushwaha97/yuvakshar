"use client";

import React from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "@/store/LanguageContext";

interface ReadingTimeProps {
  time?: string | number;
  className?: string;
}

export default function ReadingTime({ time = "5", className = "" }: ReadingTimeProps) {
  const { locale } = useLanguage();

  const cleanTime = typeof time === "number" ? time.toString() : time.replace(/[^0-9]/g, "");
  const numTime = parseInt(cleanTime) || 5;

  return (
    <span className={`inline-flex items-center text-[11px] text-gray-400 dark:text-gray-500 font-sans ${className}`}>
      <Clock className="w-3 h-3 mr-1" />
      <span>
        {numTime} {locale === "hi" ? "मिनट" : "min"}
      </span>
    </span>
  );
}
