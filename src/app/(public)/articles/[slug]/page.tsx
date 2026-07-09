import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticleById } from "@/lib/actions/articleActions";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { stripMarkdown } from "@/lib/markdown";
import SectionContainer from "@/components/homepage/layout/SectionContainer";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import MetaInfo from "@/components/homepage/shared/MetaInfo";
import ArticleActions from "@/components/articles/ArticleActions";
import CommentSection from "@/components/articles/CommentSection";
import ArticleContent from "@/components/articles/ArticleContent";
import RelatedArticles from "@/components/articles/RelatedArticles";
import { getRelatedArticlesForInfiniteScroll } from "@/lib/actions/articleActions";
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


  const relatedArticles = await getRelatedArticlesForInfiniteScroll([article.id], article.categories?.id, 8);

  return (
    <div className="w-full min-h-screen bg-[#FDFCF7] dark:bg-[#0B0F19] text-[#111111] dark:text-[#E2E8F0] font-sans transition-colors duration-300">
      <ArticleContent article={article as any} />
      <RelatedArticles articles={relatedArticles} />
    </div>
  );
}

