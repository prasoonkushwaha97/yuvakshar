import { supabase } from "@/lib/supabaseClient";

export interface SecurityEvent {
  id: string;
  user_id?: string;
  event_type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  scopes: string[];
  created_by: string;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
}

export class SupabaseSecurityRepository {
  async getEvents(limit: number = 100): Promise<SecurityEvent[]> {
    
    const { data, error } = await supabase
      .from("security_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching security events:", error);
      return [];
    }
    return data as SecurityEvent[];
  }

  async appendEvent(event: Partial<SecurityEvent>): Promise<SecurityEvent> {
    
    const { data, error } = await supabase
      .from("security_events")
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data as SecurityEvent;
  }

  async getApiKeys(): Promise<ApiKey[]> {
    
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching API keys:", error);
      return [];
    }
    return data as ApiKey[];
  }
}
