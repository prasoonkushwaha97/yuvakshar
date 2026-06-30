import { supabase } from "@/lib/supabaseClient";

export interface AuditLog {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  actor_id?: string;
  actor_name?: string;
  action: string;
  timestamp: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class SupabaseAuditRepository {
  async getLogs(limit: number = 100): Promise<AuditLog[]> {
    
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
    return data as AuditLog[];
  }

  async appendLog(log: Partial<AuditLog>): Promise<AuditLog> {
    
    const { data, error } = await supabase
      .from("audit_logs")
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data as AuditLog;
  }
}
