"use server";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { notifyContactMessage, notifyContactMessageHighPriority } from "@/lib/notificationService";

export interface ContactMessagePayload {
  type?: string;
  category: string;
  name: string;
  email: string;
  mobile?: string | null;
  subject?: string;
  content: string;
}

export interface ContactMessageRecord {
  id: string;
  type?: string | null;
  category?: string | null;
  name: string;
  email: string;
  mobile?: string | null;
  subject?: string | null;
  content: string;
  status: "NEW" | "READ" | "ARCHIVED" | "New" | "Read" | "Archived" | string;
  replies?: any;
  created_at: string;
}

export interface ContactMessageStats {
  total: number;
  newCount: number;
  todayCount: number;
}

/**
 * Save a public contact message submission into Supabase contact_messages table
 */
export async function createContactMessage(payload: ContactMessagePayload) {
  try {
    const supabase = await createClient();

    // 1. Audit user session & role
    const { data: { user }, error: authError } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: null }));
    console.log("[ContactInsert Audit] Auth Session User:", user ? { id: user.id, email: user.email, role: user.role } : "Anonymous/Unauthenticated");
    if (authError) {
      console.log("[ContactInsert Audit] Auth Session Error:", authError.message);
    }

    const { type = "contact", category, name, email, mobile, subject, content } = payload;

    if (!name || !name.trim()) {
      return { success: false, error: "कृपया अपना नाम दर्ज करें।" };
    }
    if (!email || !email.trim() || !email.includes("@")) {
      return { success: false, error: "कृपया एक मान्य ईमेल पता दर्ज करें।" };
    }
    if (!content || !content.trim()) {
      return { success: false, error: "कृपया अपना संदेश दर्ज करें।" };
    }
    if (!category || !category.trim()) {
      return { success: false, error: "कृपया विषय श्रेणी चुनें।" };
    }

    const cleanCategory = category.trim();
    const cleanSubject = subject && subject.trim() ? subject.trim() : `संपर्क संदेश: ${cleanCategory}`;

    // Exact schema payload matching public.contact_messages table
    const insertPayload = {
      type: (type || "contact").trim(),
      category: cleanCategory,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile && mobile.trim() ? mobile.trim() : null,
      subject: cleanSubject,
      content: content.trim(),
      status: "New",
    };

    console.log("[ContactInsert Audit] Exact Insert Payload:", JSON.stringify(insertPayload, null, 2));

    // Execute INSERT without calling .select() to prevent triggering SELECT RLS policy check on public submissions
    const response = await supabase
      .from("contact_messages")
      .insert(insertPayload);

    console.log("[ContactInsert Audit] Exact Supabase Response:", JSON.stringify({
      error: response.error,
      status: response.status,
      statusText: response.statusText,
    }, null, 2));

    if (response.error) {
      console.error("[ContactInsert Audit] Supabase Insert Error:", response.error);
      return { success: false, error: response.error.message || "संदेश भेजने में विफल।" };
    }

    try {
      revalidatePath("/admin/contact-messages");
      revalidatePath("/admin");
    } catch {
      // Ignored outside Next.js request lifecycle
    }

    // Notify admins about new contact message (fire and forget)
    const isUrgent = (cleanCategory || "").toLowerCase().includes("urgent");
    if (isUrgent) {
      notifyContactMessageHighPriority("", insertPayload.name).catch(() => {});
    } else {
      notifyContactMessage("", insertPayload.name, insertPayload.subject).catch(() => {});
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "सर्वर त्रुटि।";
    console.error("[ContactInsert Audit] Exception in createContactMessage:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch all contact messages with search, status filter, and sorting
 */
export async function getContactMessages(options?: {
  status?: string;
  search?: string;
}) {
  try {
    const supabase = await createClient();

    console.log("[getContactMessages Audit] Target Table: public.contact_messages");
    console.log("[getContactMessages Audit] Filter options received:", JSON.stringify(options || {}, null, 2));

    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.status && options.status !== "ALL") {
      const formattedStatus = options.status === "NEW" ? "New" : options.status === "READ" ? "Read" : options.status === "ARCHIVED" ? "Archived" : options.status;
      query = query.or(`status.eq.${formattedStatus},status.eq.${formattedStatus.toUpperCase()}`);
    }

    if (options?.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      query = query.or(`name.ilike.${term},email.ilike.${term},category.ilike.${term},content.ilike.${term},subject.ilike.${term}`);
    }

    let { data, error } = await query;

    console.log("[getContactMessages Audit] Primary Query Error:", error);
    console.log("[getContactMessages Audit] Primary Query Data Count:", data ? data.length : 0);

    // Fallback to supabaseAdmin if session client returns no records due to unauthenticated/local session context
    if ((!data || data.length === 0) && !error) {
      let adminQuery = supabaseAdmin
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.status && options.status !== "ALL") {
        const formattedStatus = options.status === "NEW" ? "New" : options.status === "READ" ? "Read" : options.status === "ARCHIVED" ? "Archived" : options.status;
        adminQuery = adminQuery.or(`status.eq.${formattedStatus},status.eq.${formattedStatus.toUpperCase()}`);
      }

      if (options?.search && options.search.trim()) {
        const term = `%${options.search.trim()}%`;
        adminQuery = adminQuery.or(`name.ilike.${term},email.ilike.${term},category.ilike.${term},content.ilike.${term},subject.ilike.${term}`);
      }

      const adminRes = await adminQuery;
      console.log("[getContactMessages Audit] supabaseAdmin Query Error:", adminRes.error);
      console.log("[getContactMessages Audit] supabaseAdmin Data Count:", adminRes.data ? adminRes.data.length : 0);

      if (adminRes.data && adminRes.data.length > 0) {
        data = adminRes.data;
      }
    }

    console.log("[getContactMessages Audit] Final Returned Array Count:", data ? data.length : 0);
    if (data && data.length > 0) {
      console.log("[getContactMessages Audit] Sample Returned Row:", JSON.stringify(data[0], null, 2));
    }

    return { success: true, data: (data as ContactMessageRecord[]) || [] };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "त्रुटि हुई।";
    console.error("[getContactMessages Audit] Exception:", err);
    return { success: false, data: [] as ContactMessageRecord[], error: errorMessage };
  }
}

/**
 * Update contact message status (New, Read, Archived)
 */
export async function updateContactMessageStatus(id: string, status: "NEW" | "READ" | "ARCHIVED" | "New" | "Read" | "Archived") {
  try {
    const supabase = await createClient();
    const formattedStatus = status === "NEW" ? "New" : status === "READ" ? "Read" : status === "ARCHIVED" ? "Archived" : status;

    console.log("[updateContactMessageStatus Audit] Updating message ID:", id, "New Status:", formattedStatus);

    let { data, error } = await supabase
      .from("contact_messages")
      .update({ status: formattedStatus })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    console.log("[updateContactMessageStatus Audit] Primary update error:", error, "data:", data);

    if (error || !data) {
      const adminRes = await supabaseAdmin
        .from("contact_messages")
        .update({ status: formattedStatus })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      console.log("[updateContactMessageStatus Audit] supabaseAdmin update error:", adminRes.error, "data:", adminRes.data);
      if (adminRes.data) {
        data = adminRes.data;
        error = null;
      } else if (adminRes.error) {
        error = adminRes.error;
      }
    }

    if (error || !data) {
      const errMs = error ? error.message : "संदेश का अद्यतन विफल रहा।";
      console.error("[updateContactMessageStatus Audit] Failed to update status:", errMs);
      return { success: false, error: errMs };
    }

    try {
      revalidatePath("/admin/contact-messages");
      revalidatePath("/admin");
    } catch {
      // Ignored outside Next.js request lifecycle
    }

    return { success: true, data: data as ContactMessageRecord };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "अद्यतन त्रुटि।";
    console.error("Exception in updateContactMessageStatus:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a contact message
 */
export async function deleteContactMessage(id: string) {
  try {
    const supabase = await createClient();

    console.log("[deleteContactMessage Audit] Deleting message ID:", id);

    let { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    console.log("[deleteContactMessage Audit] Primary delete error:", error);

    if (error) {
      const adminRes = await supabaseAdmin
        .from("contact_messages")
        .delete()
        .eq("id", id);
      console.log("[deleteContactMessage Audit] supabaseAdmin delete error:", adminRes.error);
      error = adminRes.error;
    }

    if (error) {
      console.error("[deleteContactMessage Audit] Error deleting contact message:", error);
      return { success: false, error: error.message };
    }

    try {
      revalidatePath("/admin/contact-messages");
      revalidatePath("/admin");
    } catch {
      // Ignored outside Next.js request lifecycle
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "हटाने में त्रुटि।";
    console.error("Exception in deleteContactMessage:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch stats for Admin Dashboard & Notifications
 */
export async function getContactStats(): Promise<{
  success: boolean;
  stats: ContactMessageStats;
}> {
  try {
    const res = await getContactMessages({ status: "ALL" });
    if (!res.success || !res.data) {
      return {
        success: false,
        stats: { total: 0, newCount: 0, todayCount: 0 },
      };
    }

    const messages = res.data;
    const total = messages.length;

    // Support Title Case ('New') and Uppercase ('NEW')
    const newCount = messages.filter(
      (m) => m.status === "NEW" || m.status === "New" || m.status?.toUpperCase() === "NEW"
    ).length;

    // Robust Date comparison for today's submissions (local & ISO match)
    const now = new Date();
    const todayYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const todayCount = messages.filter((m) => {
      if (!m.created_at) return false;
      const d = new Date(m.created_at);
      const dYMD = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return dYMD === todayYMD;
    }).length;

    console.log("[getContactStats Audit] Calculated Stats -> Total:", total, "New:", newCount, "Today:", todayCount);

    return {
      success: true,
      stats: { total, newCount, todayCount },
    };
  } catch (err: unknown) {
    console.error("Exception in getContactStats:", err);
    return {
      success: false,
      stats: { total: 0, newCount: 0, todayCount: 0 },
    };
  }
}

