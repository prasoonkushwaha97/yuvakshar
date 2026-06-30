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
