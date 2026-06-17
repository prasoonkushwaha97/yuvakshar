import { createClient } from "@/utils/supabase/server";

/**
 * Base Analytics Service for Yuvakshar CMS
 * Provides generic analytics functions across modules.
 */
export const analyticsService = {
  
  /**
   * Get generic aggregated counts for a table
   */
  async getTableCounts(tableName: string, filters: Record<string, any> = {}) {
    const supabase = await createClient();
    
    let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
    
    // Apply basic equality filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { count, error } = await query;
    if (error) {
      console.error(`Error fetching count for ${tableName}:`, error);
      return 0;
    }
    
    return count || 0;
  },

  /**
   * Sum a specific numeric column in a table
   */
  async getSum(tableName: string, columnName: string, filters: Record<string, any> = {}) {
    const supabase = await createClient();
    
    // Using a remote RPC function is preferred for sum/aggregation to avoid pulling data.
    // As a fallback (if no RPC exists), we fetch the column. For production with huge rows, an RPC is mandatory.
    let query = supabase.from(tableName).select(columnName);
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error || !data) {
      console.error(`Error calculating sum for ${tableName}.${columnName}:`, error);
      return 0;
    }

    return data.reduce((acc: number, row: any) => acc + (Number(row[columnName]) || 0), 0);
  }
};
