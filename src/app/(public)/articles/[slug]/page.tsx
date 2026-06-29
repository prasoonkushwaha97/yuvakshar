import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticleById } from "@/lib/actions/articleActions";
import { stripMarkdown } from "@/lib/markdown";
import AppHeader from "@/components/layout/AppHeader";
import NewspaperFooter from "@/components/homepage/layout/NewspaperFooter";
import Sidebar from "@/components/homepage/layout/Sidebar";
import SectionContainer from "@/components/homepage/layout/SectionContainer";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { Calendar, Clock, Eye, Share2, Bookmark, Award, MessageSquare } from "lucide-react";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic SEO Metadata Generator
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    if (!params) {
      return { title: "युवाक्षर | लेख उपलब्ध नहीं है" };
    }
    const resolvedParams = await params;
    if (!resolvedParams || !resolvedParams.slug || typeof resolvedParams.slug !== "string") {
      return { title: "युवाक्षर | लेख उपलब्ध नहीं है" };
    }
    const slug = decodeURIComponent(resolvedParams.slug).trim();
    if (!slug) {
      return { title: "युवाक्षर | लेख उपलब्ध नहीं है" };
    }

    let article = null;
    try {
      article = await getArticleBySlug(slug);
      if (!article) {
        article = await getArticleById(slug);
      }
    } catch (queryErr) {
      console.error("Failed to query article in generateMetadata:", queryErr);
    }

    if (!article) {
      return {
        title: "युवाक्षर | लेख उपलब्ध नहीं है"
      };
    }

    const title = stripMarkdown(article?.title_hi || "");
    const desc = stripMarkdown(article?.summary_hi || article?.content || "").substring(0, 160);

    return {
      title: `${title} | युवाक्षर`,
      description: desc,
      openGraph: {
        title,
        description: desc,
        type: "article",
        publishedTime: article?.published_at || article?.created_at,
        images: article?.cover_image ? [{ url: article.cover_image }] : []
      }
    };
  } catch (metaErr) {
    console.error("Exception in generateMetadata:", metaErr);
    return { title: "युवाक्षर" };
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  if (!params) {
    return notFound();
  }
  
  const resolvedParams = await params;
  if (!resolvedParams || !resolvedParams.slug || typeof resolvedParams.slug !== "string") {
    return notFound();
  }

  const slug = decodeURIComponent(resolvedParams.slug).trim();
  if (!slug) {
    return notFound();
  }

  let article = null;
  try {
    article = await getArticleBySlug(slug);
    if (!article) {
      article = await getArticleById(slug);
    }
  } catch (err) {
    console.error(`Failed to fetch article for slug "${slug}" in ArticleDetailPage:`, err);
  }

  if (!article) {
    return notFound();
  }

  const title = stripMarkdown(article?.title_hi || "");
  const dateStr = article?.published_at 
    ? new Date(article.published_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })
    : article?.created_at
      ? new Date(article.created_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })
      : "";
  
  const readTimeStr = article?.content
    ? `${Math.max(1, Math.ceil(article.content.split(/\s+/).length / 150))} मिनट पठन`
    : "2 मिनट पठन";

  return (
    <div className="w-full min-h-screen bg-[#FDFCF7] dark:bg-[#0B0F19] text-[#111111] dark:text-[#E2E8F0] font-sans pb-16 transition-colors duration-300">
      
      {/* 1. Header Navigation */}
      <AppHeader />

      <SectionContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
          
          {/* LEFT: Main article content panel (8 cols) */}
          <article className="lg:col-span-8 bg-white dark:bg-[#0E1322] border border-gray-150 dark:border-gray-850 p-6 md:p-10 rounded-xl shadow-sm">
            
            {/* Category Breadcrumbs Tag */}
            {article?.categories && (
              <div className="mb-4">
                <span className="bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 px-3 py-1 rounded-full text-xs font-sans font-black uppercase tracking-wider">
                  {article.categories.name_hi || ""}
                </span>
              </div>
            )}

            {/* Article Main Headline */}
            <h1 className="font-serif font-black text-2xl md:text-4xl text-gray-900 dark:text-white leading-tight mb-4 tracking-tight">
              {title}
            </h1>

            {/* Article Short Summary */}
            {article?.summary_hi && (
              <p className="text-base text-gray-650 dark:text-gray-400 font-serif leading-relaxed italic border-l-4 border-gray-300 dark:border-gray-700 pl-4 mb-6">
                {stripMarkdown(article.summary_hi)}
              </p>
            )}

            {/* Author Profile and Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-gray-100 dark:border-gray-850 py-4 mb-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={article?.profiles?.avatar_url || "/images/default-avatar.png"} 
                  alt={article?.profiles?.name || "युवाक्षर लेखक"}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-800"
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {article?.profiles?.name || "युवाक्षर डेस्क"}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-sans tracking-wide">संपादकीय स्तंभकार</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs text-gray-450 dark:text-gray-500 font-sans">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dateStr}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{readTimeStr}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{article?.view_count || 120} व्यूज</span>
                </span>
              </div>
            </div>

            {/* Cover Image */}
            {article?.cover_image && (
              <div className="relative rounded-lg overflow-hidden mb-8 border border-gray-150 dark:border-gray-850 aspect-[16/9] bg-gray-100 dark:bg-gray-900">
                <img 
                  src={article.cover_image} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Main Content Body (Rich Markdown rendering) */}
            <div className="font-serif leading-relaxed text-lg text-gray-850 dark:text-gray-200">
              <ContentRenderer content={article?.content || ""} />
            </div>

            {/* Public interact panel bottom */}
            <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between text-xs text-gray-450 font-sans">
              <div className="flex flex-wrap gap-1">
                {article?.tags?.slice(0, 3)?.map((tag: string) => (
                  <span key={tag} className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <button className="p-2 bg-gray-55 dark:bg-gray-900 rounded-full hover:text-[#f97316] transition-colors cursor-pointer" title="बुकमार्क (Requires Login)">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-55 dark:bg-gray-900 rounded-full hover:text-[#f97316] transition-colors cursor-pointer" title="साझा करें">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </article>

          {/* RIGHT: Sidebar panel (4 cols) */}
          <div className="lg:col-span-4 border-l-0 lg:border-l border-gray-150 dark:border-gray-850 pl-0 lg:pl-6 space-y-8">
            <Sidebar />
          </div>

        </div>
      </SectionContainer>

      <NewspaperFooter />
    </div>
  );
}
