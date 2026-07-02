import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticleById } from "@/lib/actions/articleActions";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getProfileUrl } from "@/utils/routes";
import { stripMarkdown } from "@/lib/markdown";
import SectionContainer from "@/components/homepage/layout/SectionContainer";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import MetaInfo from "@/components/homepage/shared/MetaInfo";
import ArticleActions from "@/components/articles/ArticleActions";
import CommentSection from "@/components/articles/CommentSection";

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
    const cleanSlug = decodeURIComponent(resolvedParams.slug || "");
    let article = await getArticleBySlug(cleanSlug);
    if (!article) {
      article = await getArticleById(cleanSlug);
    }

    if (!article) {
      return {
        title: "युवाक्षर | लेख उपलब्ध नहीं है",
        description: "यह लेख मौजूद नहीं है या हटा दिया गया है।",
      };
    }

    const titleStr = stripMarkdown(article.title_hi || article.title_en || "युवाक्षर लेख");
    const summaryStr = stripMarkdown(article.summary_hi || article.summary_en || "युवाक्षर का एक विचारणीय आलेख।");
    const ogImg = article.cover_image || "/yuvakshar_logo_official.png";

    return {
      title: `${titleStr} | युवाक्षर`,
      description: summaryStr.slice(0, 160),
      openGraph: {
        title: titleStr,
        description: summaryStr,
        images: [{ url: ogImg, width: 1200, height: 630, alt: titleStr }],
        type: "article",
        publishedTime: article.published_at || article.created_at,
        authors: [article.profiles?.name || "युवाक्षर लेखक"],
      },
      twitter: {
        card: "summary_large_image",
        title: titleStr,
        description: summaryStr.slice(0, 200),
        images: [ogImg],
      }
    };
  } catch (err) {
    console.error("Metadata generation error:", err);
    return { title: "युवाक्षर" };
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const cleanSlug = decodeURIComponent(resolvedParams.slug || "");
  
  // Try fetching by slug, fallback to ID
  let article = await getArticleBySlug(cleanSlug);
  if (!article) {
    article = await getArticleById(cleanSlug);
  }

  if (!article) {
    notFound();
  }

  // Increment views in background
  supabase
    .rpc("increment_article_views", { article_id: article.id })
    .then(({ error }) => {
      if (error) console.warn("Failed to increment views:", error.message);
    });

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
      
      <SectionContainer>
        <div className="w-full lg:w-[92vw] lg:max-w-[1200px] mx-auto pt-6">
          
          <article className="w-full bg-white dark:bg-[#0E1322] border border-gray-150 dark:border-gray-850 p-6 md:p-10 rounded-xl shadow-sm">
            
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
              <p className="text-base text-gray-655 dark:text-gray-400 font-serif leading-relaxed italic border-l-4 border-gray-300 dark:border-gray-700 pl-4 mb-6">
                {stripMarkdown(article.summary_hi)}
              </p>
            )}

            {/* Unified Editorial Metadata */}
            <div className="border-t border-b border-gray-100 dark:border-gray-850 py-4 mb-6">
              <MetaInfo
                articleId={article.id}
                slug={article.slug}
                author={article.profiles?.name || "युवाक्षर डेस्क"}
                authorProfile={article.profiles}
                date={article.published_at || article.created_at || ""}
                updatedAt={article.updated_at}
                showActions={false}
              />
            </div>

            {/* Cover Image */}
            {article?.cover_image && (
              <div className="relative rounded-lg overflow-hidden mb-8 border border-gray-150 dark:border-gray-850 aspect-[16/9] bg-gray-100 dark:bg-gray-900">
                <Image 
                  src={article.cover_image} 
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            )}

            {/* Inner Wrapper to limit reading line length of text-based elements */}
            <div className="max-w-3xl mx-auto w-full">
              {/* Main Content Body (Rich Markdown rendering) */}
              <div className="font-serif leading-relaxed text-lg text-gray-855 dark:text-gray-200">
                <ContentRenderer content={article?.content || ""} />
              </div>

              {/* Public interact panel bottom */}
              <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-855 flex items-center justify-between text-xs text-gray-455 font-sans">
                <div className="flex flex-wrap gap-1">
                  {article?.tags?.slice(0, 3)?.map((tag: string) => (
                    <span key={tag} className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">
                      #{tag}
                    </span>
                  ))}
                </div>

                <ArticleActions articleId={article.id} slug={article.slug} title={title} />
              </div>

              {/* Comment Section Sprint 2 */}
              <CommentSection articleId={article.id} />
            </div>

          </article>

        </div>
      </SectionContainer>

    </div>
  );
}
