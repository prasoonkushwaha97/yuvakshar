"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { getSectionsForLayout } from "@/lib/actions/homepageCmsActions";

// Skeletons
import { HeroSkeleton, CategorySkeleton } from "@/components/homepage/shared/Skeleton";

// Layout

// Blocks
import Hero from "@/components/homepage/blocks/Hero";
import CategoryBlock from "@/components/homepage/blocks/CategoryBlock";
import Magazine from "@/components/homepage/blocks/Magazine";
import TopStories from "@/components/homepage/blocks/TopStories";
import EditorialPicks from "@/components/homepage/blocks/EditorialPicks";
import LatestNews from "@/components/homepage/blocks/LatestNews";
import InfiniteArticleFeed from "@/components/homepage/blocks/InfiniteArticleFeed";

// Error Boundary for Individual Layout Sections
class SectionErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: any, _errorInfo: any) {
    // Gracefully handle section render errors in production
  }

  render() {
    if (this.state.hasError) return null; // Gracefully hide only the failed section
    return this.props.children;
  }
}

function HomeContent() {
  const { locale } = useLanguage();
  const { articles, homepageSections, authLoading, cmsDataLoading } = useCms();
  const searchParams = useSearchParams();

  // Dynamic Preview states
  const [isMounted, setIsMounted] = useState(false);
  const [previewSections, setPreviewSections] = useState<any[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isPreview = searchParams.get("preview") === "true";
    const layoutId = searchParams.get("layout_id");
    
    if (isPreview && layoutId) {
      loadPreviewLayout(layoutId);
    }
  }, [searchParams]);

  const loadPreviewLayout = async (layoutId: string) => {
    setPreviewLoading(true);
    try {
      const data = await getSectionsForLayout(layoutId);
      setPreviewSections(data);
    } catch (err) {
      console.error("Failed to load preview sections:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (!isMounted || previewLoading || authLoading || cmsDataLoading) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-[#0A0A0A] pb-4 font-sans">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-4 lg:pt-6 pb-10 lg:pb-14 space-y-12">
          <HeroSkeleton />
          <CategorySkeleton />
        </div>
      </div>
    );
  }

  // Check if articles are loaded
  const publishedArticles = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  const hasData = publishedArticles.length > 0;

  if (!hasData) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-[#0A0A0A] pb-16 font-sans">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 text-center border border-gray-150 dark:border-gray-850 rounded-lg my-12 bg-gray-50 dark:bg-gray-900">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-gray-300 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V6.125c0-.621.504-1.125 1.125-1.125H11.25M12 7.5v6" />
          </svg>
          <h2 className="text-2xl font-serif font-black mb-2 text-gray-800 dark:text-gray-200">लेख शीघ्र प्रकाशित किए जाएंगे</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">युवाक्षर संपादकीय कक्ष में विमर्श जारी है। जल्द ही ताज़ा खबरें और बौद्धिक विचार यहाँ उपलब्ध होंगे।</p>
        </div>
      </div>
    );
  }

  // --- DYNAMIC DEDUPLICATION GATHERING ---
  const sliderArticles = publishedArticles.slice(0, 3);
  const remainingAfterHeroSlider = publishedArticles.filter((a: any) => !sliderArticles.map((sa: any) => sa.id).includes(a.id));
  
  const getArticleByCategory = (catKeywords: string[], fallbackIdx: number) => {
    const matched = remainingAfterHeroSlider.find((a: any) => 
      catKeywords.some(keyword => 
        (a.category || "").toLowerCase().includes(keyword) || 
        (a.category_hi || "").toLowerCase().includes(keyword)
      )
    );
    return matched || remainingAfterHeroSlider[fallbackIdx] || publishedArticles[fallbackIdx] || null;
  };

  const politicsArticle = getArticleByCategory(["राजनीति", "politics"], 0);
  const economyArticle = getArticleByCategory(["अर्थव्यवस्था", "economy", "business", "व्यवसाय"], 1);
  const techArticle = getArticleByCategory(["तकनीक", "tech", "science", "विज्ञान"], 2);

  const heroExcludedIds = [
    ...sliderArticles.map((a: any) => a.id),
    politicsArticle?.id,
    economyArticle?.id,
    techArticle?.id
  ].filter(Boolean) as string[];

  const remainingForTopStories = publishedArticles.filter((a: any) => !heroExcludedIds.includes(a.id));
  const topStoriesArticles = remainingForTopStories.slice(0, 8);
  const topStoriesIds = topStoriesArticles.map((a: any) => a.id);
  const excludeIdsForLatest = [...new Set([...heroExcludedIds, ...topStoriesIds])];

  const latestNewsArticles = publishedArticles
    .filter((a: any) => !excludeIdsForLatest.includes(a.id))
    .slice(0, 10);
  const latestNewsIds = latestNewsArticles.map((a: any) => a.id);
  const excludeIdsForCategories = [...new Set([...excludeIdsForLatest, ...latestNewsIds])];

  const getCategoryArticles = (keywords: string[], excludes: string[]) => {
    return publishedArticles
      .filter((a: any) => !excludes.includes(a.id))
      .filter((a: any) => 
        keywords.some(keyword => 
          (a.category || "").toLowerCase().includes(keyword) || 
          (a.category_hi || "").toLowerCase().includes(keyword)
        )
      )
      .slice(0, 4);
  };

  const politicsCatArticles = getCategoryArticles(["राजनीति", "politics"], excludeIdsForCategories);
  const politicsCatIds = politicsCatArticles.map((a: any) => a.id);
  const afterPoliticsExcludes = [...excludeIdsForCategories, ...politicsCatIds];

  const societyCatArticles = getCategoryArticles(["समाज", "society"], afterPoliticsExcludes);
  const societyCatIds = societyCatArticles.map((a: any) => a.id);
  const afterSocietyExcludes = [...afterPoliticsExcludes, ...societyCatIds];

  const economyCatArticles = getCategoryArticles(["अर्थव्यवस्था", "economy", "business", "व्यवसाय"], afterSocietyExcludes);
  const economyCatIds = economyCatArticles.map((a: any) => a.id);
  const afterEconomyExcludes = [...afterSocietyExcludes, ...economyCatIds];

  const educationCatArticles = getCategoryArticles(["शिक्षा", "education"], afterEconomyExcludes);
  const educationCatIds = educationCatArticles.map((a: any) => a.id);
  const afterEducationExcludes = [...afterEconomyExcludes, ...educationCatIds];

  const scienceCatArticles = getCategoryArticles(["विज्ञान", "science", "तकनीक", "tech"], afterEducationExcludes);
  const scienceCatIds = scienceCatArticles.map((a: any) => a.id);
  const afterScienceExcludes = [...afterEducationExcludes, ...scienceCatIds];

  const cultureCatArticles = getCategoryArticles(["संस्कृति", "culture", "art", "कला"], afterScienceExcludes);
  const cultureCatIds = cultureCatArticles.map((a: any) => a.id);
  const afterCultureExcludes = [...afterScienceExcludes, ...cultureCatIds];

  const envCatArticles = getCategoryArticles(["पर्यावरण", "environment"], afterCultureExcludes);
  const envCatIds = envCatArticles.map((a: any) => a.id);
  const afterEnvExcludes = [...afterCultureExcludes, ...envCatIds];

  const sportsCatArticles = getCategoryArticles(["खेल", "sports"], afterEnvExcludes);
  const sportsCatIds = sportsCatArticles.map((a: any) => a.id);
  const finalExcludesBeforeEditorial = [...afterEnvExcludes, ...sportsCatIds];

  // --- LAYOUT ENGINE NORMALIZATION & REGISTRY ---
  const extractNormalizedType = (section: any): string => {
    let raw = section?.section_type || section?.type || section?.section || "";
    if (!raw && section?.id) {
      const idStr = String(section.id);
      raw = idStr.replace(/^sec[-_]?/i, "").replace(/[-_]?\d+$/g, "");
    }
    return String(raw)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  const activeDbSections = previewSections 
    ? previewSections.filter((sec: any) => sec.is_visible !== false)
    : Array.isArray(homepageSections)
      ? homepageSections.filter((sec: any) => sec.is_visible !== false && sec.visible !== false && sec.active !== false)
      : [];

  const renderDbSection = (section: any) => {
    const normalizedType = extractNormalizedType(section);
    const catName = section.category_name || section.category || section.title || "";
    const artLimit = section.article_count || section.limit || 4;

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Homepage Engine] Section Loaded -> ID: "${section.id}", Type: "${section.type || section.section_type}", Normalized: "${normalizedType}", Visible: ${section.is_visible !== false}`);
    }

    switch (normalizedType) {
      case "hero":
        return <Hero />;
      case "topstories":
      case "topstory":
      case "top":
        return <TopStories />;
      case "editorial":
      case "editorialpicks":
      case "editorialpick":
      case "editorpick":
      case "editorpicks":
      case "editorspick":
      case "editorspicks":
        return <EditorialPicks excludeIds={finalExcludesBeforeEditorial} />;
      case "latestnews":
      case "latestnew":
      case "latest":
        return <LatestNews excludeIds={excludeIdsForLatest} />;
      case "magazine":
      case "magazines":
        return <Magazine />;
      case "categoryblock":
      case "category":
        if (!catName || catName.trim() === "") return null;
        return <CategoryBlock categoryName={catName} limit={artLimit} excludeIds={excludeIdsForCategories} />;
      case "breakingticker":
      case "trending":
      case "opinion":
      case "community":
      case "popular":
      case "authors":
      case "videos":
      case "video":
        // Recognised section types that are planned but not yet implemented.
        // Return null silently — no warning, no broken UI.
        return null;
      default: {
        // Fallback fuzzy matchers for safe resilience
        if (normalizedType.includes("editorial") || normalizedType.includes("editor")) {
          return <EditorialPicks excludeIds={finalExcludesBeforeEditorial} />;
        }
        if (normalizedType.includes("hero")) {
          return <Hero />;
        }
        if (normalizedType.includes("latest")) {
          return <LatestNews excludeIds={excludeIdsForLatest} />;
        }
        if (normalizedType.includes("magazine")) {
          return <Magazine />;
        }
        if (normalizedType.includes("category")) {
          return <CategoryBlock categoryName={catName || "विविध"} limit={artLimit} excludeIds={excludeIdsForCategories} />;
        }

        // Log to console only — never render debug UI to the page.
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[Homepage Engine] Skipping unknown section -> ID: "${section.id}", Type: "${section.type || section.section_type}", Normalized: "${normalizedType}". Reason: No component registered for this type.`);
        }
        return null;
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAF9] dark:bg-[#1C1917] text-[#292524] dark:text-[#E7E5E4] pb-2 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* Official Google Site Name JSON-LD WebSite Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://yuvakshar.tech",
            "name": "युवाक्षर",
            "alternateName": [
              "Yuvakshar",
              "Yuvakshar Tech"
            ]
          })
        }}
      />
      
      {/* Unified Homepage Layout Pipeline (Strict Ordering) */}
      
      {/* CMS Driven Layout Pipeline */}
      {activeDbSections.length > 0 ? (
        activeDbSections.map((section: any, idx: number) => (
          <SectionErrorBoundary key={section.id || idx}>
            {renderDbSection(section)}
          </SectionErrorBoundary>
        ))
      ) : (
        <>
          <SectionErrorBoundary><Hero /></SectionErrorBoundary>
          <SectionErrorBoundary><EditorialPicks excludeIds={finalExcludesBeforeEditorial} /></SectionErrorBoundary>
          <SectionErrorBoundary><LatestNews excludeIds={excludeIdsForLatest} /></SectionErrorBoundary>
          <SectionErrorBoundary><Magazine /></SectionErrorBoundary>
        </>
      )}

      {/* Infinite Article Feed — begins after all homepage sections */}
      <InfiniteArticleFeed
        allArticles={publishedArticles}
        excludeIds={finalExcludesBeforeEditorial}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
