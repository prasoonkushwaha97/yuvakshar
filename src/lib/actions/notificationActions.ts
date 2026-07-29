"use server";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType     = "success" | "info" | "warning" | "error";
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

/** Alias for backward compat */
export type Notification = NotificationRecord;

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch notifications visible to the logged-in staff member.
 * Always uses supabaseAdmin so RLS does not block (RLS is applied at Supabase level).
 * Supports: filter, category, priority, search, sort, limit, offset (pagination).
 */
export async function getAdminNotifications(options?: {
  filter?: "all" | "unread" | "read";
  category?: string;
  priority?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "newest" | "oldest";
}) {
  try {
    let query = supabaseAdmin
      .from("notifications")
      .select("*", { count: "exact" });

    // Priority ordering: critical first, then newest
    if (options?.sort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else {
      // Sort critical → high → medium → low, then by date desc
      query = query
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
    }

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

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, data: [] as NotificationRecord[], count: 0, error: error.message };
    }

    return {
      success: true,
      data: (data as NotificationRecord[]) ?? [],
      count: count ?? 0,
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "सूचनाएँ प्राप्त करने में त्रुटि।";
    console.error("Exception in getAdminNotifications:", err);
    return { success: false, data: [] as NotificationRecord[], count: 0, error: msg };
  }
}

/**
 * Latest N notifications for the dashboard widget (no filter)
 */
export async function getRecentNotifications(limit = 5): Promise<NotificationRecord[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data as NotificationRecord[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * Unread notification count (for sidebar badge)
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Mark a single notification as read */
export async function markNotificationAsRead(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("markNotificationAsRead error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "त्रुटि हुई।" };
  }
}

/** Mark all unread notifications as read */
export async function markAllNotificationsAsRead() {
  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("is_read", false);

    if (error) {
      console.error("markAllNotificationsAsRead error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "त्रुटि हुई।" };
  }
}

/** Delete a single notification */
export async function deleteNotification(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("deleteNotification error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "त्रुटि हुई।" };
  }
}

/** Delete all read notifications */
export async function clearReadNotifications() {
  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("is_read", true);

    if (error) {
      console.error("clearReadNotifications error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "त्रुटि हुई।" };
  }
}

// ─── Core Emitter ─────────────────────────────────────────────────────────────

/**
 * Central notification creator — always uses supabaseAdmin to bypass RLS on insert.
 * Called by notificationService.ts typed helpers.
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
    const notificationData = {
      title:       payload.title,
      description: payload.description,
      type:        payload.type        ?? "info",
      category:    payload.category    ?? "system",
      priority:    payload.priority    ?? "medium",
      target_role: payload.target_role ?? "all",
      target_user: payload.target_user ?? null,
      entity_type: payload.entity_type ?? null,
      entity_id:   payload.entity_id   ?? null,
      action_url:  payload.action_url  ?? null,
      created_by:  payload.created_by  ?? null,
      is_read:     false,
    };

    const { error } = await supabaseAdmin
      .from("notifications")
      .insert(notificationData);

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "सूचना बनाने में त्रुटि।";
    console.error("Exception in createSystemNotification:", err);
    return { success: false, error: msg };
  }
}

// ─── Backward Compatibility Wrappers ─────────────────────────────────────────

export async function createNotification(
  recipient_id: string,
  type: string,
  title: string,
  message: string,
  priority: NotificationPriority = "medium",
  category: NotificationCategory = "system"
) {
  return createSystemNotification({
    title,
    description: message,
    type: type as NotificationType,
    category,
    priority,
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
    type: eventType as NotificationType,
    target_user: userId,
    action_url: linkUrl,
  });
}
