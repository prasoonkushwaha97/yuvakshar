"use client";
import Image from "next/image";


import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/store/LanguageContext";

interface MagazineCardProps {
  magazine: any;
}

export default function MagazineCard({ magazine }: MagazineCardProps) {
  const { locale } = useLanguage();
  if (!magazine) return null;

  const imageUrl = magazine.coverImage || "/images/placeholder-news.jpg";

  return (
    <div className="group flex flex-col bg-white dark:bg-[#0A0A0A] border border-gray-150 dark:border-gray-850 p-4 rounded-lg hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 w-full">
      {/* 3D-effect book cover container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-md group-hover:shadow-lg transition-shadow mb-4 flex items-center justify-center rounded-sm">
        <Image src={imageUrl} alt={magazine.issue} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500" loading="lazy" fill />
        {/* Hover Read Indicator Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <Link
            href={`/magazine`}
            className="flex items-center space-x-1 bg-[#f97316] text-white px-4 py-2 rounded-full text-xs font-bold font-sans shadow-md transform scale-90 group-hover:scale-100 transition-transform duration-300"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{locale === "hi" ? "पढ़ें" : "Read"}</span>
          </Link>
        </div>
      </div>

      {/* Info details */}
      <div className="text-center">
        <h4 className="font-serif font-black text-sm text-gray-900 dark:text-gray-200 line-clamp-1 mb-1">
          {magazine.issue}
        </h4>
        <span className="text-[10px] text-gray-400 font-sans uppercase font-bold tracking-widest">
          {magazine.month} {magazine.year || "2025"}
        </span>
      </div>
    </div>
  );
}
