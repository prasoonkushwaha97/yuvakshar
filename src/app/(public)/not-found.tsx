"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Home, 
  ArrowLeft, 
  Sparkles, 
  ChevronRight,
  Compass,
  Tag
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import SectionContainer from "@/components/homepage/layout/SectionContainer";
import SectionTitle from "@/components/homepage/shared/SectionTitle";
import ArticleCardMedium from "@/components/homepage/cards/ArticleCardMedium";
import { getArticleUrl } from "@/utils/routes";

const CATEGORY_ACCENT_COLORS = [
  "#f97316", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#6366f1", // indigo
];

export default function NotFoundPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { articles, categories } = useCms();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/");
    }
  };

  // 1. Filter published articles with valid slugs
  const publishedArticles = (articles || []).filter(
    (art: any) =>
      (art.status === "Published" || art.status === "Approved" || !art.status) &&
      art.slug &&
      art.slug !== "null" &&
      art.slug !== "undefined"
  );

  // 2. Count published articles per category ID / category Name
  const categoryCounts: Record<string, number> = {};
  publishedArticles.forEach((art: any) => {
    const catId = art.category_id || art.categories?.id;
    const catName = art.category || art.categories?.name;
    if (catId) categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
    if (catName) categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
  });

  // 3. Filter active database categories with > 0 published articles & valid slug
  const activeCategories = (categories || []).filter((cat: any) => {
    if (!cat.slug || cat.slug === "null" || cat.slug === "undefined") return false;
    const count =
      (cat.id ? categoryCounts[cat.id] : 0) ||
      (cat.name ? categoryCounts[cat.name] : 0) ||
      0;
    return count > 0;
  });

  // 4. Filter Editorial Picks using is_editor_pick
  const editorialPicks = publishedArticles
    .filter((a: any) => a.is_editor_pick)
    .sort((a: any, b: any) => (a.editor_pick_order ?? 0) - (b.editor_pick_order ?? 0))
    .slice(0, 4);

  const finalEditorial =
    editorialPicks.length >= 2
      ? editorialPicks
      : publishedArticles.slice(0, 4);

  // 5. Latest articles excluding editorial picks
  const latestArticles = publishedArticles
    .filter((a: any) => !finalEditorial.some((ed: any) => ed.id === a.id))
    .slice(0, 6);

  return (
    <div className="w-full bg-[#FAFAF9] dark:bg-[#0c0f17] text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Hero Editorial Section */}
      <section className="relative w-full border-b border-gray-200 dark:border-gray-800 bg-gradient-to-b from-orange-50/40 via-white to-[#FAFAF9] dark:from-slate-950 dark:via-[#0c0f17] dark:to-[#0c0f17] pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Subtle Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-orange-400/10 via-amber-500/15 to-orange-400/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <Image
              src="/yuvakshar_logo_official.png"
              alt="युवाक्षर"
              width={160}
              height={45}
              className="w-[120px] sm:w-[150px] md:w-[160px] h-auto object-contain drop-shadow-sm dark:brightness-110"
              priority
              unoptimized
            />

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-orange-100/80 dark:bg-orange-950/60 text-[#ea580c] border border-orange-200 dark:border-orange-900/60 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>404 • पृष्ठ उपलब्ध नहीं है</span>
              </span>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h1 className="font-serif font-black text-3xl md:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-[1.25] tracking-tight">
              यह पृष्ठ उपलब्ध नहीं है
            </h1>
            <p className="font-serif text-base md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              संभव है यह पृष्ठ हटाया गया हो, स्थानांतरित कर दिया गया हो या दर्ज किया गया URL गलत हो।
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="युवाक्षर पर समाचार, लेख या विषय खोजें..."
                className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 focus:border-[#ea580c] dark:border-slate-800 dark:focus:border-[#ea580c] text-slate-900 dark:text-white placeholder-slate-400 font-sans text-sm md:text-base shadow-lg transition-all outline-none"
              />
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <button
                type="submit"
                className="absolute right-2.5 px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-sans font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>खोजें</span>
              </button>
            </form>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/"
              className="px-6 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-sans font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Home className="w-4 h-4" />
              <span>मुखपृष्ठ पर जाएँ</span>
            </Link>

            <button
              onClick={handleGoBack}
              type="button"
              className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-sans font-bold text-sm shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-[#ea580c]" />
              <span>पिछले पृष्ठ पर जाएँ</span>
            </button>
          </div>
        </div>
      </section>

      {/* Database Categories Grid */}
      {activeCategories.length > 0 && (
        <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-10">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
              <h2 className="font-serif font-black text-lg md:text-xl text-gray-900 dark:text-white uppercase tracking-tight">
                श्रेणियाँ ({activeCategories.length})
              </h2>
            </div>
            <Link
              href="/categories"
              className="text-xs font-bold font-sans text-[#ea580c] hover:underline flex items-center gap-1"
            >
              <span>सभी श्रेणियाँ</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {activeCategories.map((cat: any, idx: number) => {
              const accentColor =
                CATEGORY_ACCENT_COLORS[idx % CATEGORY_ACCENT_COLORS.length];
              const articleCount =
                (cat.id ? categoryCounts[cat.id] : 0) ||
                (cat.name ? categoryCounts[cat.name] : 0) ||
                0;

              return (
                <Link
                  key={cat.id || cat.slug}
                  href={`/category/${encodeURIComponent(cat.slug)}`}
                  className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-gray-800 hover:border-[#ea580c]/50 dark:hover:border-[#ea580c]/50 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center space-y-2"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-[#ea580c] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] font-sans font-medium text-slate-400 dark:text-slate-500 block">
                      {articleCount} लेख
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Editorial Picks Section */}
      {finalEditorial.length > 0 && (
        <SectionContainer bgClassName="bg-[#FAFAF9] dark:bg-[#1C1917]">
          <div className="w-full">
            <SectionTitle title="संपादकीय चयन" link="/admin/articles/editorial-picks" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {finalEditorial.map((art: any) => (
                <ArticleCardMedium key={art.id} article={art} showImage={true} />
              ))}
            </div>
          </div>
        </SectionContainer>
      )}

      {/* Latest Articles Section ("पढ़ते रहें") */}
      {latestArticles.length > 0 && (
        <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-12">
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
              <h2 className="font-serif font-black text-lg md:text-xl text-gray-900 dark:text-white uppercase tracking-tight">
                नवीनतम लेख — पढ़ते रहें
              </h2>
            </div>
            <Link
              href="/current-affairs"
              className="text-xs font-bold font-sans text-[#ea580c] hover:underline flex items-center gap-1"
            >
              <span>सभी समाचार देखें</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {latestArticles.map((art: any) => (
              <ArticleCardMedium key={art.id} article={art} showImage={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
