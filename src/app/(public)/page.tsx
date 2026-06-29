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
import Sidebar from "@/components/homepage/layout/Sidebar";
import SectionContainer from "@/components/homepage/layout/SectionContainer";

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
        <div className="w-full h-24 bg-gray-105 dark:bg-gray-900 border-b border-gray-150 animate-pulse" />
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 space-y-8">
          <HeroSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <CategorySkeleton />
              <OpinionSkeleton />
            </div>
            <div className="lg:col-span-4">
              <SidebarSkeleton />
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

  // --- LAYOUT ENGINE ---
  // Select active sections from preview states or database layouts
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
        return <EditorialPicks />;
      case "latestnews":
        return <LatestNews />;
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
        return <CategoryBlock categoryName={catName} limit={artLimit} />;
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
          {activeDbSections.map((sec: any) => {
            const type = (sec.section_type || sec.type || "").toLowerCase().replace(/_/, "").trim();
            const isFullWidth = ["hero", "topstories", "editorialpicks", "latestnews", "breakingticker", "trending", "videos", "magazine", "newsletter"].includes(type);

            if (isFullWidth) {
              return (
                <SectionContainer key={sec.id} bgClassName={type === "videos" ? "bg-[#111] border-y-0" : ""}>
                  <SectionErrorBoundary>
                    {renderDbSection(sec)}
                  </SectionErrorBoundary>
                </SectionContainer>
              );
            }

            return (
              <SectionContainer key={sec.id}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                    <SectionErrorBoundary>
                      {renderDbSection(sec)}
                    </SectionErrorBoundary>
                  </div>
                  <div className="lg:col-span-4 border-l-0 lg:border-l border-gray-150 dark:border-gray-850 pl-0 lg:pl-6">
                    <SectionErrorBoundary>
                      <Sidebar />
                    </SectionErrorBoundary>
                  </div>
                </div>
              </SectionContainer>
            );
          })}
        </div>
      ) : (
        // Standard Premium Editorial default structure (Fallback when database homepage_layouts is empty)
        <>
          {/* Main Newspaper Hero section */}
          <SectionContainer>
            <SectionErrorBoundary>
              <Hero />
            </SectionErrorBoundary>
          </SectionContainer>

          {/* Top Stories */}
          <SectionContainer bgClassName="bg-white dark:bg-[#0A0A0A]">
            <SectionErrorBoundary>
              <TopStories />
            </SectionErrorBoundary>
          </SectionContainer>

          {/* Latest News Feed */}
          <SectionContainer bgClassName="bg-white dark:bg-[#0A0A0A]">
            <SectionErrorBoundary>
              <LatestNews />
            </SectionErrorBoundary>
          </SectionContainer>

          {/* Editorial Picks */}
          <SectionContainer bgClassName="bg-white dark:bg-[#0A0A0A]">
            <SectionErrorBoundary>
              <EditorialPicks />
            </SectionErrorBoundary>
          </SectionContainer>

          {/* Opinion Column */}
          <SectionContainer bgClassName="bg-white dark:bg-[#0A0A0A]">
            <SectionErrorBoundary>
              <Opinion />
            </SectionErrorBoundary>
          </SectionContainer>

          {/* Magazine Spotlight */}
          <SectionContainer bgClassName="bg-white dark:bg-[#0A0A0A]">
            <SectionErrorBoundary>
              <Magazine />
            </SectionErrorBoundary>
          </SectionContainer>

          {/* Videos Block */}
          <SectionContainer id="videos-section" bgClassName="bg-[#111] border-y-0 text-white">
            <SectionErrorBoundary>
              <Videos />
            </SectionErrorBoundary>
          </SectionContainer>

          {/* Categories */}
          <SectionContainer bgClassName="bg-white dark:bg-[#0A0A0A]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SectionErrorBoundary>
                <CategoryBlock categoryName="राजनीति" englishName="politics" />
              </SectionErrorBoundary>
              <SectionErrorBoundary>
                <CategoryBlock categoryName="शिक्षा" englishName="education" />
              </SectionErrorBoundary>
            </div>
          </SectionContainer>

          {/* Authors Block */}
          <SectionContainer bgClassName="bg-white dark:bg-[#0A0A0A]">
            <SectionErrorBoundary>
              <Authors />
            </SectionErrorBoundary>
          </SectionContainer>

          {/* Newsletter Box */}
          <SectionContainer bgClassName="bg-white dark:bg-[#0A0A0A]">
            <SectionErrorBoundary>
              <Newsletter />
            </SectionErrorBoundary>
          </SectionContainer>
        </>
      )}

    </div>
  );
}
