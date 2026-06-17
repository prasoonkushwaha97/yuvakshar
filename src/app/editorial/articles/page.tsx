import React from "react";
import { getArticles } from "@/lib/actions/articleActions";
import { getCategories } from "@/lib/actions/categoryActions";
import { contentAnalyticsService } from "@/lib/contentAnalyticsService";
import ArticleManager from "@/components/founder/articles/ArticleManager";

export const dynamic = 'force-dynamic';

export default async function ArticlesPage({
  searchParams
}: {
  searchParams: { page?: string; limit?: string; sortBy?: string; sortOrder?: string; status?: string; search?: string }
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit) : 10;
  
  const filters = {
    status: searchParams.status,
    search: searchParams.search
  };
  
  const options = {
    page,
    limit,
    sortBy: searchParams.sortBy || 'created_at',
    sortOrder: (searchParams.sortOrder || 'desc') as 'asc' | 'desc'
  };

  const [articlesResponse, stats, categories] = await Promise.all([
    getArticles(filters, options),
    contentAnalyticsService.getArticleAnalytics(),
    getCategories()
  ]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <ArticleManager 
        initialArticles={articlesResponse.data}
        totalCount={articlesResponse.count}
        currentPage={page}
        currentLimit={limit}
        stats={stats}
        categories={categories}
      />
    </div>
  );
}
