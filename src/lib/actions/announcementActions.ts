"use server";

import { supabase } from "@/lib/supabaseClient";
import { hasAnyRole } from "@/lib/rbacService";
import { logGovernanceAction } from "./governanceAuditActions";

export async function getAnnouncements() {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin']);
  if (!isAuthorized) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Failed to fetch announcements:", error);
    return [];
  }
  
  return data;
}

export async function createAnnouncement(
  title: string,
  content: string,
  status: 'draft' | 'published',
  isPinned: boolean,
  expiresAt: string | null
) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor', 'moderator']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  if (!isAuthorized) throw new Error("Only Founders can create platform announcements.");
  if (!isAuthorized) throw new Error("Only Founders can create platform announcements.");

  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  if (!authData?.user) throw new Error("Unauthenticated");

  const { data, error } = await supabase
    .from('announcements')
    .insert([{
      title,
      content,
      status,
      is_pinned: isPinned,
      expires_at: expiresAt || null,
      published_at: status === 'published' ? new Date().toISOString() : null,
      created_by: authData.user.id
    }])
    .select('id')
    .single();

  if (error || !data) {
    console.error("Failed to create announcement:", error);
    throw new Error("Database error while creating announcement");
  }

  // Log Audit
  await logGovernanceAction(
    `announcement_created`,
    'announcement',
    data.id,
    { title, status, isPinned }
  );

  return true;
}

export async function updateAnnouncementStatus(id: string, newStatus: 'draft' | 'published' | 'archived') {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor', 'moderator']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  if (!isAuthorized) throw new Error("Unauthorized");
  if (!isAuthorized) throw new Error("Unauthorized");

  const updatePayload: any = { status: newStatus };
  if (newStatus === 'published') {
    updatePayload.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('announcements')
    .update(updatePayload)
    .eq('id', id);

  if (error) throw new Error("Failed to update announcement");

  await logGovernanceAction(
    `announcement_status_updated`,
    'announcement',
    id,
    { newStatus }
  );

  return true;
}
