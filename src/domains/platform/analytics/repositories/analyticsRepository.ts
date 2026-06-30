import { supabase } from "@/lib/supabaseClient";

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  path?: string;
  session_id?: string;
  user_id?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export class SupabaseAnalyticsRepository {
  async getEvents(limit: number = 100): Promise<AnalyticsEvent[]> {
    
    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching analytics events:", error);
      return [];
    }
    return data as AnalyticsEvent[];
  }

  async appendEvent(event: Partial<AnalyticsEvent>): Promise<AnalyticsEvent> {
    
    const { data, error } = await supabase
      .from("analytics_events")
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data as AnalyticsEvent;
  }
}
