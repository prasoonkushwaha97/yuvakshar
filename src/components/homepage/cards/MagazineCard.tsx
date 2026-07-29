"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { getMagazineReadUrl } from "@/utils/routes";

interface MagazineShowcaseCardProps {
  magazine: any;
  /** Whether this is the primary/featured position */
  featured?: boolean;
}

/**
 * Premium magazine showcase card — displays a realistic magazine cover
 * with editorial metadata, hover lift, and CTA.
 */
export default function MagazineShowcaseCard({ magazine, featured = false }: MagazineShowcaseCardProps) {
  if (!magazine) return null;

  const imageUrl = magazine.coverImage || "/images/placeholder-news.jpg";
  const readUrl = getMagazineReadUrl(magazine);
  const issueLabel = magazine.edition || magazine.issue || "नवीनतम अंक";
  const monthYear = `${magazine.month || ""}${magazine.year ? ` ${magazine.year}` : ""}`;

  return (
    <Link
      href={readUrl}
      className="group flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F5F4EF] dark:focus-visible:ring-offset-[#1A1814] rounded-2xl transition-all w-full"
      aria-label={`${issueLabel} - ${monthYear} अभी पढ़ें`}
    >
      {/* Cover Container - realistic magazine proportions (A4 ~ 1:1.414) */}
      <div className={`relative w-full mx-auto mb-5 ${featured ? 'max-w-[280px] sm:max-w-[320px]' : 'max-w-[200px] sm:max-w-[220px]'}`}>
        {/* Soft premium drop shadow */}
        <div className="absolute inset-x-4 bottom-0 h-8 bg-black/20 dark:bg-black/50 blur-xl rounded-full transform translate-y-2 group-hover:translate-y-4 group-hover:blur-2xl transition-all duration-500" />
        
        {/* Cover */}
        <div className="relative aspect-[1/1.414] w-full overflow-hidden rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] group-hover:-translate-y-2 transition-all duration-500 bg-stone-100 dark:bg-stone-900 ring-1 ring-black/5 dark:ring-white/10">
          {/* Magazine Spine Highlight (subtle left edge highlight to mimic binding) */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-r from-white/40 to-transparent z-10" />
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-black/20 z-10 mix-blend-multiply" />
          
          <Image
            src={imageUrl}
            alt={`${issueLabel} कवर`}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            loading={featured ? "eager" : "lazy"}
            sizes={featured ? "(max-width: 768px) 280px, 320px" : "(max-width: 768px) 200px, 220px"}
          />
          
          {/* Subtle overlay gradient on hover indicating read action */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
             <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-center">
                <span className="bg-[#f97316] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> अभी पढ़ें
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-1.5 px-2 flex flex-col items-center">
        {/* Issue Title */}
        <h4 className={`font-serif font-bold text-stone-900 dark:text-stone-100 leading-[1.5] line-clamp-1 ${featured ? 'text-lg md:text-xl' : 'text-base'}`}>
          अंक: {issueLabel}
        </h4>

        {/* Month / Year */}
        {monthYear.trim() && (
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">
            {monthYear}
          </p>
        )}

        {/* Theme (if available) */}
        {magazine.theme && (
          <p className="text-xs font-serif text-stone-400 dark:text-stone-500 italic mt-1">
            {magazine.theme}
          </p>
        )}
      </div>
    </Link>
  );
}
