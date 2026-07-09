"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCms } from "@/store/CmsContext";
import { stripMarkdown } from "@/lib/markdown";
import { getArticleUrl, resolveAuthorFromUsers } from "@/utils/routes";
import SectionContainer from "../layout/SectionContainer";

export default function Hero() {
  const { articles, users } = useCms();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter published / featured articles for the slide
  const slides = articles
    ? [...articles]
        .filter((art) => art.status === "Published" || art.status === "Approved" || !art.status)
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

  const currentArticle = slides.length > 0 ? slides[currentIndex] : null;

  const { profile: resolvedAuthor, href: authorProfileUrl, name: resolvedAuthorName } = React.useMemo(() => {
    const authorName = currentArticle?.profiles?.name || currentArticle?.author || "युवाक्षर डेस्क";
    const authorProfile = currentArticle?.profiles || currentArticle?.authorProfile;
    const resolved = resolveAuthorFromUsers(authorName, authorProfile, users);
    return { ...resolved, name: authorName };
  }, [currentArticle?.profiles, currentArticle?.author, currentArticle?.authorProfile, users]);

  if (!currentArticle) return null;

  // Right Column: editorial items proxy (3 items)
  const remaining = articles ? [...articles].filter((art) => art.id !== currentArticle.id) : [];
  const editorialStack = [
    { title: "कविता", article: remaining[0] || currentArticle },
    { title: "संपादकीय विचार", article: remaining[1] || currentArticle },
    { title: "साक्षात्कार", article: remaining[2] || currentArticle }
  ].filter(item => item.article);

  return (
    <SectionContainer bgClassName="bg-transparent" noTopPadding>
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans">
        
        {/* LEFT COLUMN: HERO SLIDER (70% width -> 8 cols) */}
        <div className="lg:col-span-8 relative h-[420px] md:h-[480px] lg:h-[480px] rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] group bg-stone-100 dark:bg-stone-900 border border-gray-150 dark:border-gray-850">
          
          {/* Category Badge - Unified for all viewports at top-left */}
          <div className="absolute top-5 left-5 md:top-6 md:left-6 lg:top-8 lg:left-8 z-30">
            <span className="bg-[#f97316] text-white text-[11px] md:text-xs font-sans font-bold uppercase tracking-widest px-4 py-1.5 md:py-2 rounded-lg shadow-md">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 via-40% to-transparent/10" />
            </motion.div>
          </AnimatePresence>

          {/* Full Card Click Overlay */}
          <Link 
            href={getArticleUrl(currentArticle)}
            className="absolute inset-0 z-10"
            aria-label={stripMarkdown(currentArticle.title || currentArticle.title_hi || "")}
          />

          {/* Bottom Left Content Area */}
          <div className="absolute bottom-0 left-0 z-20 p-6 pb-10 md:p-8 md:pb-12 lg:p-10 lg:pb-14 pr-12 md:pr-16 text-white w-full pointer-events-none flex flex-col justify-end">

            {/* Headline - Significantly larger on mobile/tablet */}
            <h2 className="text-[32px] md:text-[40px] lg:text-[44px] font-serif font-bold leading-[1.2] drop-shadow-xl mb-4 md:mb-5 line-clamp-3 md:line-clamp-none w-full max-w-[85%] md:max-w-[80%] pointer-events-auto">
              {stripMarkdown(currentArticle.title || currentArticle.title_hi || "")}
            </h2>

            {/* Author Block */}
            <div className="flex flex-wrap items-center gap-3 text-sm md:text-base font-sans text-stone-200 pointer-events-auto">
              {authorProfileUrl ? (
                <Link 
                  href={authorProfileUrl} 
                  aria-label={`View ${resolvedAuthorName}'s profile`}
                  className="hover:text-primary transition-colors font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center gap-2"
                >
                  {resolvedAuthor?.avatar_url && (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden bg-stone-800 border border-stone-600 shrink-0">
                      <Image src={resolvedAuthor.avatar_url} alt="Author" width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="text-[15px] md:text-base">{resolvedAuthorName}</span>
                  {resolvedAuthor?.verified && (
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 00-1.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
              ) : (
                <span className="font-bold flex items-center gap-2">
                  <span className="text-[15px] md:text-base">{resolvedAuthorName}</span>
                </span>
              )}
              <span className="text-stone-400">•</span>
              <span className="text-stone-300">
                {currentArticle.published_at 
                  ? new Date(currentArticle.published_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })
                  : currentArticle.created_at
                    ? new Date(currentArticle.created_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })
                    : ""
                }
              </span>
            </div>

            {/* Subtitle / summary snippet - hidden on mobile */}
            <p className="hidden md:block text-stone-300 dark:text-stone-400 text-sm lg:text-base leading-relaxed line-clamp-2 max-w-[85%] md:max-w-[75%] font-serif font-normal mt-4">
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

          {/* BOTTOM DOT INDICATORS */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-30 flex space-x-2">
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
    </SectionContainer>
  );
}
