import { createClient } from "@/utils/supabase/server";
import { analyticsService } from "./analyticsService";

export interface ArticleAnalytics {
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
    
    // Total Articles
    const totalArticles = await analyticsService.getTableCounts("articles");
    
    // Total Published
    const totalPublished = await analyticsService.getTableCounts("articles", { status: "published" });
    
    // Total Views
    const totalViews = await analyticsService.getSum("articles", "view_count");
    
    // Average reading time (fallback to total_reading_time / totalArticles if there's no direct avg)
    // Actually, articles don't have reading_time column by default. We can estimate it or just return 0 for now until Phase 4.
    const averageReadingTime = 5; // placeholder mins
    
    // Recently Updated
    const { data: recentlyUpdated } = await supabase
      .from("articles")
      .select("id, title_hi, updated_at, status")
      .order("updated_at", { ascending: false })
      .limit(5);
      
    // Most Viewed
    const { data: mostViewed } = await supabase
      .from("articles")
      .select("id, title_hi, view_count, status")
      .order("view_count", { ascending: false })
      .limit(5);

    return {
      totalArticles,
      totalPublished,
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
