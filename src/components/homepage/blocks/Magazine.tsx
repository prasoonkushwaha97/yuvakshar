"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import MagazineShowcaseCard from "../cards/MagazineCard";

/**
 * Premium Magazine Showcase Section
 *
 * Displays published magazine issues in a premium editorial layout.
 * Desktop: 3 covers · Tablet: 2 covers · Mobile: horizontal swipe
 *
 * Future-ready: supports featured issue, editor's pick, premium badges,
 * and archived issue collections without restructuring.
 */
export default function Magazine() {
  const { magazines } = useCms();

  const publishedMags = (magazines ?? []).filter(
    (m: any) => m.status === "Published" || !m.status
  );

  if (publishedMags.length === 0) return null;

  // Show up to 4 covers on the homepage (1 featured, 3 recent)
  const showcaseMags = publishedMags.slice(0, 4);

  return (
    <section className="w-full py-14 lg:py-20 bg-[#F5F4EF] dark:bg-[#1A1814] transition-colors duration-300 border-t border-stone-200/60 dark:border-stone-800/40">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        {/* ── Section Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 lg:mb-16">
          <div className="space-y-2">
            {/* Section Kicker */}
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[3px] bg-[#f97316] rounded-full" />
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#f97316]">
                Magazine
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
              पत्रिका
            </h2>

            {/* Subtitle */}
            <p className="text-sm md:text-base font-serif text-stone-500 dark:text-stone-400 max-w-md">
              युवाक्षर के नवीनतम अंक पढ़ें
            </p>
          </div>

          {/* View All Link */}
          <Link
            href="/magazine"
            className="group flex items-center space-x-1.5 text-xs font-sans font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 hover:text-[#f97316] transition-colors duration-300 shrink-0 self-start sm:self-auto"
          >
            <span>सभी अंक देखें</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
          </Link>
        </div>

        {/* 📚 Magazine Covers Showcase 📚 */}
        {/* Desktop: 1 large left, up to 3 right | Tablet: 2 cols | Mobile: horizontal scroll */}

        {/* Desktop + Tablet Grid (hidden on mobile) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Featured Magazine (Left Side on Desktop) */}
          {showcaseMags.length > 0 && (
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <MagazineShowcaseCard
                magazine={showcaseMags[0]}
                featured={true}
              />
            </div>
          )}

          {/* Recent Magazines (Right Side on Desktop) */}
          {showcaseMags.length > 1 && (
            <div className="lg:col-span-7 grid grid-cols-2 lg:grid-cols-3 gap-6">
              {showcaseMags.slice(1).map((mag: any) => (
                <MagazineShowcaseCard
                  key={mag.id}
                  magazine={mag}
                  featured={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile: Horizontal swipe carousel (visible only on mobile) */}
        <div className="sm:hidden -mx-4 px-4">
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mb-4" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {showcaseMags.map((mag: any, idx: number) => (
              <div
                key={mag.id}
                className="snap-center shrink-0 first:pl-0 last:pr-4"
                style={{ width: "75vw", maxWidth: "280px" }}
              >
                <MagazineShowcaseCard
                  magazine={mag}
                  featured={idx === 0}
                />
              </div>
            ))}
          </div>

          {/* Scroll indicator dots */}
          {showcaseMags.length > 1 && (
            <div className="flex justify-center space-x-1.5 pt-5">
              {showcaseMags.map((_: any, idx: number) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    idx === 0
                      ? "bg-[#f97316]"
                      : "bg-stone-300 dark:bg-stone-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
