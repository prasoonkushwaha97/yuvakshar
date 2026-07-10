"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Notification = {
  id: string;
  type: string;
  priority: 'Low' | 'Normal' | 'Urgent';
  category: 'Editorial' | 'Community' | 'Security' | 'System' | 'Marketing' | 'AI';
  title: string;
  message: string;
  recipient_id: string;
  trigger_event_id: string | null;
  status: string;
  is_read: boolean;
  created_at: string;
};

export async function getAdminNotifications(filter: "all" | "unread" | "read" = "all", search: string = "") {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { data: [], error: "Unauthorized" };

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (filter === "unread") {
      query = query.eq("is_read", false);
    } else if (filter === "read") {
      query = query.eq("is_read", true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching notifications:", error);
      return { data: [], error: error.message };
    }

    return { data: data as Notification[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("recipient_id", authData.user.id);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", authData.user.id)
      .eq("is_read", false);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteNotification(id: string) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("recipient_id", authData.user.id);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
