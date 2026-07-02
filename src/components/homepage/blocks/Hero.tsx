"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCms } from "@/store/CmsContext";
import { stripMarkdown } from "@/lib/markdown";
import { getArticleUrl } from "@/utils/routes";

export default function Hero() {
  const { articles } = useCms();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter published / featured articles for the slide
  const slides = articles
    ? [...articles]
        .filter((art: any) => art.status === "Published" || art.status === "Approved" || !art.status)
        .slice(0, 5)
    : [];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Autoplay
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const currentArticle = slides[currentIndex];

  // Right Column: editorial items proxy (3 items)
  const remaining = articles ? [...articles].filter((art: any) => art.id !== currentArticle.id) : [];
  const editorialStack = [
    { title: "कविता", article: remaining[0] || currentArticle },
    { title: "संपादकीय विचार", article: remaining[1] || currentArticle },
    { title: "साक्षात्कार", article: remaining[2] || currentArticle }
  ].filter(item => item.article);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans">
      
      {/* LEFT COLUMN: HERO SLIDER (70% width -> 8 cols) */}
      <div className="lg:col-span-8 relative h-[380px] sm:h-[450px] lg:h-[480px] rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] group bg-stone-100 dark:bg-stone-900 border border-gray-150 dark:border-gray-850">
        
        {/* Mobile Category Badge (Top Left Corner) */}
        <div className="absolute top-4 left-4 z-20 md:hidden">
          <span className="bg-[#f97316]/95 text-white text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
            {currentArticle.category || "मुख्य समाचार"}
          </span>
        </div>

        {/* Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentArticle.id}
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image src={currentArticle.coverImage || currentArticle.cover_image || currentArticle.image || "/images/placeholder-news.jpg"} alt={currentArticle.title} className="w-full h-full object-cover object-center brightness-[0.85] contrast-100 hover:scale-105 transition-transform duration-[10000ms] ease-out" loading="eager" fill />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-25% to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Full Card Click Overlay */}
        <Link 
          href={getArticleUrl(currentArticle)}
          className="absolute inset-0 z-10"
          aria-label={stripMarkdown(currentArticle.title || currentArticle.title_hi || "")}
        />

        {/* Bottom Left Content Area - padded to prevent dot indicator overlap on mobile */}
        <div className="absolute bottom-0 left-0 z-20 p-6 md:p-8 lg:p-10 pr-20 md:pr-8 lg:pr-10 text-white w-full max-w-3xl pointer-events-none">
          {/* Category Badge - visible on Desktop/Tablet inside content area */}
          <div className="hidden md:block mb-2">
            <span className="bg-stone-100/90 text-stone-855 dark:bg-stone-800/90 dark:text-stone-250 text-xs font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
              {currentArticle.category || "मुख्य समाचार"}
            </span>
          </div>

          {/* Headline - reduced font size and clamped to 2 lines on mobile */}
          <h2 className="text-[17px] md:text-3xl lg:text-4xl font-serif font-black leading-tight drop-shadow mb-3 mt-2 md:mt-8 line-clamp-2 md:line-clamp-none">
            {stripMarkdown(currentArticle.title || currentArticle.title_hi || "")}
          </h2>

          {/* Author • Publication Date */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-sans text-stone-250 uppercase tracking-widest mb-4">
            <span>{currentArticle.author || "युवाक्षर डेस्क"}</span>
            <span>•</span>
            <span>
              {currentArticle.published_at 
                ? new Date(currentArticle.published_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })
                : currentArticle.created_at
                  ? new Date(currentArticle.created_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })
                  : ""
              }
            </span>
          </div>

          {/* Subtitle / summary snippet - hidden on mobile */}
          <p className="hidden md:block text-stone-300 dark:text-stone-400 text-xs md:text-sm lg:text-base leading-relaxed line-clamp-2 max-w-2xl font-serif font-normal">
            {stripMarkdown(currentArticle.summary || currentArticle.summary_hi || currentArticle.content || "")}
          </p>
        </div>

        {/* SLIDER NAVIGATION BUTTONS (Visible on hover) */}
        {slides.length > 1 && (
          <>
            <button onClick={prevSlide} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur border border-white/20 dark:border-white/10 items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black dark:hover:bg-slate-900 transition-all duration-300 z-30 cursor-pointer" aria-label="Previous slide">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextSlide} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur border border-white/20 dark:border-white/10 items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black dark:hover:bg-slate-900 transition-all duration-300 z-30 cursor-pointer" aria-label="Next slide">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* BOTTOM DOT INDICATORS - reduced size on mobile */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 right-4 md:bottom-5 md:right-5 z-25 flex space-x-2">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentIndex(idx)} className={`w-1.5 h-1 md:w-2.5 md:h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-[#f97316] w-4 md:w-6" : "bg-white/40"}`} aria-label={`Go to slide ${idx + 1}`} />
            ))}
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: EDITORIAL STACK (30% width -> 4 cols) */}
      <div className="lg:col-span-4 flex flex-col justify-between gap-4 h-full">
        {editorialStack.map(({ title: sectionTitle, article }) => {
          const title = stripMarkdown(article.title || article.title_hi || "");
          const imageUrl = article.coverImage || article.cover_image || article.image || "/images/placeholder-news.jpg";

          return (
            <div 
              key={article.id}
              className="group/card flex items-center gap-4 bg-white dark:bg-[#0E1322] p-4 rounded-3xl border border-gray-150/80 dark:border-gray-850/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-[#f97316]/30 transition-all duration-300 flex-1 min-h-[120px]"
            >
              {/* Thumbnail */}
              <Link 
                href={getArticleUrl(article)}
                className="block relative w-20 h-20 shrink-0 overflow-hidden bg-gray-55 dark:bg-gray-900 rounded-2xl border border-gray-150/60 dark:border-gray-850/60"
              >
                <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" loading="lazy" fill />
              </Link>

              {/* Details */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center space-x-1.5 text-xs tracking-widest font-sans font-medium text-stone-500 dark:text-stone-400 mb-2">
                  <span className="uppercase">{sectionTitle}</span>
                </div>

                <Link 
                  href={getArticleUrl(article)}
                  className="block group-hover/card:text-[#f97316] transition-colors duration-250"
                >
                  <h4 className="font-serif text-base lg:text-lg leading-snug text-stone-800 dark:text-stone-200 line-clamp-2 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                    {title}
                  </h4>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
