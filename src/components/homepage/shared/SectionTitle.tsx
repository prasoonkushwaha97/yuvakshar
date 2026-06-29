"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/store/LanguageContext";

interface SectionTitleProps {
  title: string;
  link?: string;
  className?: string;
}

export default function SectionTitle({ title, link, className = "" }: SectionTitleProps) {
  const { locale } = useLanguage();

  return (
    <div className={`flex justify-between items-end mb-6 pb-2.5 border-b-2 border-gray-900 dark:border-gray-800 ${className}`}>
      <div className="flex items-center space-x-3.5">
        <span className="w-1.5 h-6 bg-[#f97316]" />
        <h2 className="text-xl md:text-2xl font-black font-serif uppercase tracking-tight text-[#111] dark:text-[#F5F5F5]">
          {title}
        </h2>
      </div>

      {link && (
        <Link
          href={link}
          className="text-xs font-bold font-sans uppercase tracking-widest text-[#f97316] hover:text-[#EA580C] hover:underline flex items-center transition-all group"
        >
          <span>{locale === "hi" ? "सभी देखें" : "View All"}</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5 transform group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}
