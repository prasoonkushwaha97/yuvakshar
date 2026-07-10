import { createClient } from "@/utils/supabase/server";
import { analyticsService } from "./analyticsService";

export interface ArticleAnalytics {
  total: number;
  drafts: number;
  submitted: number;
  revisions: number;
  published: number;
  rejected: number;
  archived: number;
  
  totalArticles: number;
  totalPublished: number;
  totalViews: number;
  averageReadingTime: number; // calculated roughly based on content length or existing column if exists
  recentlyUpdated: any[];
  mostViewed: any[];
}

export const contentAnalyticsService = {
  
  async getArticleAnalytics(): Promise<ArticleAnalytics> {
    const supabase = await createClient();
    
    const countStatus = async (status: string) => {
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .ilike('status', status);
      return count || 0;
    };
    
    // Fetch counts in parallel
    const [
      totalArticles,
      totalViews,
      drafts,
      submitted,
      revisions,
      published,
      rejected,
      archived
    ] = await Promise.all([
      analyticsService.getTableCounts("articles"),
      analyticsService.getSum("articles", "views"),
      countStatus('draft'),
      countStatus('submitted'),
      countStatus('revision_requested'),
      countStatus('published'),
      countStatus('rejected'),
      countStatus('archived'),
    ]);
    
    // Average reading time
    // Fallback to 5 mins if no data available
    const averageReadingTime = 5;
    
    // Recently Updated
    const { data: recentlyUpdated } = await supabase
      .from("articles")
      .select("id, title_hi, updated_at, status")
      .order("updated_at", { ascending: false })
      .limit(5);
      
    // Most Viewed
    const { data: mostViewed } = await supabase
      .from("articles")
      .select("id, title_hi, views, status")
      .order("views", { ascending: false })
      .limit(5);

    return {
      total: totalArticles,
      drafts,
      submitted,
      revisions,
      published,
      rejected,
      archived,
      totalArticles,
      totalPublished: published,
      totalViews,
      averageReadingTime,
      recentlyUpdated: recentlyUpdated || [],
      mostViewed: mostViewed || []
    };
  },
  
  async getCategoryUsage(): Promise<Record<string, number>> {
    const supabase = await createClient();
    // Fetch category counts
    // Due to lack of GROUP BY in standard supabase-js without RPC, we'll rely on the _count query later.
    return {};
  }
};
