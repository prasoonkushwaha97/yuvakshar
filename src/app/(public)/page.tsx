"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { getSectionsForLayout } from "@/lib/actions/homepageCmsActions";

// Skeletons
import { 
  HeroSkeleton, 
  CategorySkeleton, 
  VideoSkeleton, 
  MagazineSkeleton, 
  OpinionSkeleton, 
  SidebarSkeleton 
} from "@/components/homepage/shared/Skeleton";

// Layout
import AppHeader from "@/components/layout/AppHeader";
import HomepageSidebar from "@/components/homepage/layout/HomepageSidebar";
import SectionContainer from "@/components/homepage/layout/SectionContainer";
import PartnerSection from "@/components/homepage/PartnerSection";

// Blocks
import Hero from "@/components/homepage/blocks/Hero";
import BreakingTicker from "@/components/homepage/blocks/BreakingTicker";
import Trending from "@/components/homepage/blocks/Trending";
import CategoryBlock from "@/components/homepage/blocks/CategoryBlock";
import Opinion from "@/components/homepage/blocks/Opinion";
import Videos from "@/components/homepage/blocks/Videos";
import Magazine from "@/components/homepage/blocks/Magazine";
import Authors from "@/components/homepage/blocks/Authors";
import Community from "@/components/homepage/blocks/Community";
import Newsletter from "@/components/homepage/blocks/Newsletter";
import Popular from "@/components/homepage/blocks/Popular";
import TopStories from "@/components/homepage/blocks/TopStories";
import EditorialPicks from "@/components/homepage/blocks/EditorialPicks";
import LatestNews from "@/components/homepage/blocks/LatestNews";

// Error Boundary for Individual Layout Sections
class SectionErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Gracefully handle section render errors in production
  }

  render() {
    if (this.state.hasError) return null; // Gracefully hide only the failed section
    return this.props.children;
  }
}

export default function Home() {
  const { locale } = useLanguage();
  const { articles, homepageSections } = useCms();
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

  if (!isMounted || previewLoading) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-[#0A0A0A] pb-16 font-sans">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-4 lg:pt-6 pb-10 lg:pb-14">
          
          {/* Main 70/30 Hero Skeleton Deck */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[460px] lg:h-[calc(100vh-160px)] max-h-[620px] w-full">
            
            {/* Left Main Hero Slide Placeholder */}
            <div className="lg:col-span-8 bg-gray-100 dark:bg-[#0E1322] rounded-3xl animate-pulse flex flex-col justify-end p-6 md:p-8 lg:p-10">
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded-full mb-3" />
              <div className="w-full lg:w-3/4 h-8 bg-gray-200 dark:bg-gray-800 rounded-full mb-4" />
              <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-800 rounded-full mb-6" />
              <div className="flex gap-4">
                <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
                <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
              </div>
            </div>

            {/* Right Stacked Editorial Cards Placeholders */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4 h-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 bg-gray-100 dark:bg-[#0E1322] rounded-3xl animate-pulse p-4 flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl shrink-0" />
                  <div className="flex-grow">
                    <div className="w-16 h-3 bg-gray-200 dark:bg-gray-800 rounded-full mb-2" />
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full mb-2" />
                    <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

          </div>

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

  // --- LAYOUT ENGINE ---
  const activeDbSections = previewSections 
    ? previewSections.filter((sec: any) => sec.is_visible !== false)
    : Array.isArray(homepageSections)
      ? homepageSections.filter((sec: any) => sec.is_visible !== false && sec.visible !== false && sec.active !== false)
      : [];

  const hasDbConfig = activeDbSections.length > 0;

  const renderDbSection = (section: any) => {
    const type = (section.section_type || section.type || "").toLowerCase().replace(/_/, "").trim();
    const catName = section.category_name || section.category || "";
    const artLimit = section.article_count || section.limit || 4;

    switch (type) {
      case "hero":
        return <Hero />;
      case "topstories":
        return <TopStories />;
      case "editorialpicks":
        return <EditorialPicks excludeIds={finalExcludesBeforeEditorial} />;
      case "latestnews":
        return <LatestNews excludeIds={excludeIdsForLatest} />;
      case "breakingticker":
        return <BreakingTicker />;
      case "trending":
        return <Trending />;
      case "opinion":
        return <Opinion />;
      case "videos":
        return <Videos />;
      case "magazine":
        return <Magazine />;
      case "community":
        return <Community />;
      case "newsletter":
        return <Newsletter />;
      case "popular":
        return <Popular />;
      case "categoryblock":
        return <CategoryBlock categoryName={catName} limit={artLimit} excludeIds={excludeIdsForCategories} />;
      case "authors":
        return <Authors />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#0A0A0A] text-[#111] dark:text-[#F5F5F5] pb-16 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* 2. Dynamic or Fallback static layout content */}
      {hasDbConfig ? (
        <div className="w-full animate-fade-in">
          {/* 1. Render Hero full-width at the top */}
          {activeDbSections
            .filter((sec: any) => (sec.section_type || sec.type || "").toLowerCase().replace(/_/, "").trim() === "hero")
            .map((sec: any) => (
              <SectionContainer key={sec.id} noTopPadding={true}>
                <SectionErrorBoundary>
                  {renderDbSection(sec)}
                </SectionErrorBoundary>
              </SectionContainer>
            ))}

          {/* 2. Render all subsequent non-hero sections in a single unified split column layout */}
          {activeDbSections.filter((sec: any) => (sec.section_type || sec.type || "").toLowerCase().replace(/_/, "").trim() !== "hero").length > 0 && (
            <SectionContainer bgClassName="bg-white dark:bg-[#0A0A0A]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left content stream */}
                <div className="lg:col-span-8 space-y-12 lg:space-y-16">
                  {activeDbSections
                    .filter((sec: any) => (sec.section_type || sec.type || "").toLowerCase().replace(/_/, "").trim() !== "hero")
                    .map((sec: any) => (
                      <div key={sec.id} className="w-full">
                        <SectionErrorBoundary>
                          {renderDbSection(sec)}
                        </SectionErrorBoundary>
                      </div>
                    ))}
                </div>

                {/* Right single sticky Sidebar */}
                <div className="lg:col-span-4 border-l-0 lg:border-l border-gray-150/80 dark:border-gray-850/80 pl-0 lg:pl-6 sticky top-20 self-start">
                  <SectionErrorBoundary>
                    <HomepageSidebar />
                  </SectionErrorBoundary>
                </div>

              </div>
            </SectionContainer>
          )}
        </div>
      ) : (
        // Standard Premium Editorial default structure (Fallback when database homepage_layouts is empty)
        <>
          {/* Main Newspaper Hero section */}
          <SectionContainer noTopPadding={true}>
            <SectionErrorBoundary>
              <Hero />
            </SectionErrorBoundary>
          </SectionContainer>

          {/* Unified Two-Column continuous layout for all content sections */}
          <SectionContainer bgClassName="bg-white dark:bg-[#0A0A0A]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Main content feeds */}
              <div className="lg:col-span-8 space-y-12 lg:space-y-16">
                
                {/* Top Stories (8 articles) */}
                <SectionErrorBoundary>
                  <TopStories />
                </SectionErrorBoundary>

                {/* Latest News Feed (10 articles) */}
                <SectionErrorBoundary>
                  <LatestNews excludeIds={excludeIdsForLatest} />
                </SectionErrorBoundary>

                {/* Category highlights ordered dynamically */}
                <SectionErrorBoundary>
                  <CategoryBlock categoryName="राजनीति" englishName="politics" limit={4} excludeIds={excludeIdsForCategories} />
                </SectionErrorBoundary>
                
                <SectionErrorBoundary>
                  <CategoryBlock categoryName="समाज" englishName="society" limit={4} excludeIds={afterPoliticsExcludes} />
                </SectionErrorBoundary>

                <SectionErrorBoundary>
                  <CategoryBlock categoryName="अर्थव्यवस्था" englishName="economy" limit={4} excludeIds={afterSocietyExcludes} />
                </SectionErrorBoundary>

                <SectionErrorBoundary>
                  <CategoryBlock categoryName="शिक्षा" englishName="education" limit={4} excludeIds={afterEconomyExcludes} />
                </SectionErrorBoundary>

                <SectionErrorBoundary>
                  <CategoryBlock categoryName="विज्ञान" englishName="science" limit={4} excludeIds={afterEducationExcludes} />
                </SectionErrorBoundary>

                <SectionErrorBoundary>
                  <CategoryBlock categoryName="संस्कृति" englishName="culture" limit={4} excludeIds={afterScienceExcludes} />
                </SectionErrorBoundary>

                <SectionErrorBoundary>
                  <CategoryBlock categoryName="पर्यावरण" englishName="environment" limit={4} excludeIds={afterCultureExcludes} />
                </SectionErrorBoundary>

                <SectionErrorBoundary>
                  <CategoryBlock categoryName="खेल" englishName="sports" limit={4} excludeIds={afterEnvExcludes} />
                </SectionErrorBoundary>

                {/* Editorial Picks */}
                <SectionErrorBoundary>
                  <EditorialPicks excludeIds={finalExcludesBeforeEditorial} />
                </SectionErrorBoundary>

                {/* Videos Block */}
                <div id="videos-section" className="w-full bg-[#111] dark:bg-[#1A1A1A] p-6 md:p-8 rounded-3xl border border-gray-850 text-white">
                  <SectionErrorBoundary>
                    <Videos />
                  </SectionErrorBoundary>
                </div>

                {/* Magazine Spotlight */}
                <SectionErrorBoundary>
                  <Magazine />
                </SectionErrorBoundary>

                {/* Authors Block */}
                <SectionErrorBoundary>
                  <Authors />
                </SectionErrorBoundary>

              </div>

              {/* RIGHT COLUMN: Sidebar (Rendered exactly once) */}
              <div className="lg:col-span-4 border-l-0 lg:border-l border-gray-150/80 dark:border-gray-850/80 pl-0 lg:pl-6 sticky top-20 self-start">
                <SectionErrorBoundary>
                  <HomepageSidebar />
                </SectionErrorBoundary>
              </div>

            </div>
          </SectionContainer>
        </>
      )}

      <PartnerSection />
    </div>
  );
}
