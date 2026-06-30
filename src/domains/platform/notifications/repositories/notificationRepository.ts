import { supabase } from "@/lib/supabaseClient";
import { NotificationPayload, NotificationPreference } from "../types/notifications";

export class SupabaseNotificationRepository {
  async getNotifications(userId: string): Promise<NotificationPayload[]> {
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
    return data as NotificationPayload[];
  }

  async createNotification(notification: Partial<NotificationPayload>): Promise<NotificationPayload> {
    
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data as NotificationPayload;
  }

  async markAsRead(id: string): Promise<void> {
    
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) throw error;
  }

  async getPreferences(userId: string): Promise<NotificationPreference | null> {
    
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching notification preferences:", error);
      return null;
    }
    return data as NotificationPreference;
  }

  async updatePreferences(userId: string, prefs: Partial<NotificationPreference>): Promise<NotificationPreference> {
    
    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: userId, ...prefs })
      .select()
      .single();

    if (error) throw error;
    return data as NotificationPreference;
  }
}
