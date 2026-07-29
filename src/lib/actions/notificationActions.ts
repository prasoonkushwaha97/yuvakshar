"use server";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export type NotificationType = "success" | "info" | "warning" | "error";
export type NotificationCategory = "articles" | "magazine" | "community" | "contact" | "users" | "system" | "banners" | "settings";
export type NotificationPriority = "low" | "medium" | "high" | "critical";

export type NotificationRecord = {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  created_at: string;
  created_by?: string | null;
  target_role?: string | null;
  target_user?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  action_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
};

/**
 * Fetch Admin Notifications with filters, search, and sorting
 */
export async function getAdminNotifications(options?: {
  filter?: "all" | "unread" | "read";
  category?: string;
  priority?: string;
  search?: string;
  limit?: number;
  sort?: "newest" | "oldest";
}) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("notifications")
      .select("*");

    if (options?.filter === "unread") {
      query = query.eq("is_read", false);
    } else if (options?.filter === "read") {
      query = query.eq("is_read", true);
    }

    if (options?.category && options.category !== "all") {
      query = query.eq("category", options.category);
    }

    if (options?.priority && options.priority !== "all") {
      query = query.eq("priority", options.priority);
    }

    if (options?.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      query = query.or(`title.ilike.${term},description.ilike.${term}`);
    }

    const isAscending = options?.sort === "oldest";
    query = query.order("created_at", { ascending: isAscending });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    let { data, error } = await query;

    if ((!data || data.length === 0) && !error) {
      let adminQuery = supabaseAdmin
        .from("notifications")
        .select("*");

      if (options?.filter === "unread") {
        adminQuery = adminQuery.eq("is_read", false);
      } else if (options?.filter === "read") {
        adminQuery = adminQuery.eq("is_read", true);
      }

      if (options?.category && options.category !== "all") {
        adminQuery = adminQuery.eq("category", options.category);
      }

      if (options?.priority && options.priority !== "all") {
        adminQuery = adminQuery.eq("priority", options.priority);
      }

      if (options?.search && options.search.trim()) {
        const term = `%${options.search.trim()}%`;
        adminQuery = adminQuery.or(`title.ilike.${term},description.ilike.${term}`);
      }

      adminQuery = adminQuery.order("created_at", { ascending: isAscending });

      if (options?.limit) {
        adminQuery = adminQuery.limit(options.limit);
      }

      const adminRes = await adminQuery;
      if (adminRes.data && adminRes.data.length > 0) {
        data = adminRes.data;
      }
    }

    return { success: true, data: (data as NotificationRecord[]) || [], error: null };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "सूचनाएँ प्राप्त करने में त्रुटि।";
    console.error("Error in getAdminNotifications:", err);
    return { success: false, data: [] as NotificationRecord[], error: errorMessage };
  }
}

/**
 * Fetch Unread Notification Count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const supabase = await createClient();
    let { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);

    if (error || count === null || count === 0) {
      const adminRes = await supabaseAdmin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);
      if (adminRes.count !== null) {
        count = adminRes.count;
      }
    }

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string) {
  try {
    const supabase = await createClient();
    let { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      await supabaseAdmin
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id);
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "त्रुटि हुई।";
    return { success: false, error: errorMessage };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  try {
    const supabase = await createClient();
    let { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("is_read", false);

    if (error) {
      await supabaseAdmin
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("is_read", false);
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "त्रुटि हुई।";
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string) {
  try {
    const supabase = await createClient();
    let { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      await supabaseAdmin
        .from("notifications")
        .delete()
        .eq("id", id);
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "त्रुटि हुई।";
    return { success: false, error: errorMessage };
  }
}

/**
 * Clear all read notifications
 */
export async function clearReadNotifications() {
  try {
    const supabase = await createClient();
    let { error } = await supabase
      .from("notifications")
      .delete()
      .eq("is_read", true);

    if (error) {
      await supabaseAdmin
        .from("notifications")
        .delete()
        .eq("is_read", true);
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "त्रुटि हुई।";
    return { success: false, error: errorMessage };
  }
}

/**
 * Central Auto Notification Event Emitter
 */
export async function createSystemNotification(payload: {
  title: string;
  description: string;
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  target_role?: string;
  target_user?: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  created_by?: string;
}) {
  try {
    const supabase = await createClient();
    const notificationData = {
      title: payload.title,
      description: payload.description,
      type: payload.type || "info",
      category: payload.category || "system",
      priority: payload.priority || "medium",
      target_role: payload.target_role || "all",
      target_user: payload.target_user || null,
      entity_type: payload.entity_type || null,
      entity_id: payload.entity_id || null,
      action_url: payload.action_url || null,
      created_by: payload.created_by || null,
      is_read: false,
    };

    let { error } = await supabase
      .from("notifications")
      .insert(notificationData);

    if (error) {
      const adminRes = await supabaseAdmin
        .from("notifications")
        .insert(notificationData);
      error = adminRes.error;
    }

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "सूचना बनाने में त्रुटि।";
    console.error("Exception in createSystemNotification:", err);
    return { success: false, error: errorMessage };
  }
}

// Backward compatibility wrappers
export async function createNotification(
  recipient_id: string,
  type: string,
  title: string,
  message: string,
  priority: any = "medium",
  category: any = "system"
) {
  return createSystemNotification({
    title,
    description: message,
    type: type as any,
    category: category as any,
    priority: priority as any,
    target_user: recipient_id,
  });
}

export async function createInternalNotification(
  userId: string,
  eventType: string,
  title: string,
  message: string,
  linkUrl?: string
) {
  return createSystemNotification({
    title,
    description: message,
    type: eventType as any,
    target_user: userId,
    action_url: linkUrl,
  });
}
