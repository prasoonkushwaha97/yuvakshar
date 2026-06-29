"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Helper to verify editor/admin permission
async function verifyEditorialPermission() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { allowed: false, error: "Unauthorized access" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return { allowed: false, error: "Profile not found" };

  const allowedRoles = ["founder", "admin", "editor"];
  if (!allowedRoles.includes(profile.role)) {
    return { allowed: false, error: "Insufficient editorial permissions" };
  }

  return { allowed: true, userId: user.id };
}

// 2. Fetch Editions
export async function getEditions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_editions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching editions:", error);
    return [];
  }
  return data || [];
}

// 3. Fetch Layouts for specific Edition
export async function getLayoutsForEdition(editionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_layouts")
    .select("*")
    .eq("edition_id", editionId)
    .order("version", { ascending: false });

  if (error) {
    console.error("Error fetching layouts:", error);
    return [];
  }
  return data || [];
}

// 4. Fetch Sections for specific Layout Version
export async function getSectionsForLayout(layoutId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*, homepage_section_articles(*)")
    .eq("homepage_layout_id", layoutId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching layout sections:", error);
    return [];
  }
  return data || [];
}

// 5. Create new Layout version draft (Immutable revisions)
export async function createLayoutDraft(editionId: string, name: string, sections: any[]) {
  const perm = await verifyEditorialPermission();
  if (!perm.allowed) return { success: false, error: perm.error };

  const supabase = await createClient();

  // Find latest version number
  const { data: latest } = await supabase
    .from("homepage_layouts")
    .select("version")
    .eq("edition_id", editionId)
    .order("version", { ascending: false })
    .limit(1);

  const nextVersion = latest && latest[0] ? latest[0].version + 1 : 1;

  // Insert within transaction (using separate inserts, but we could wrap in RPC if strict rollbacks are needed)
  const { data: layout, error: layoutError } = await supabase
    .from("homepage_layouts")
    .insert({
      edition_id: editionId,
      name: `${name} (v${nextVersion})`,
      status: "Draft",
      version: nextVersion,
      is_published: false,
      created_by: perm.userId,
      updated_by: perm.userId
    })
    .select()
    .single();

  if (layoutError || !layout) {
    return { success: false, error: layoutError?.message || "Failed to create layout draft" };
  }

  // Insert sections
  const sectionInserts = sections.map((sec, idx) => ({
    homepage_layout_id: layout.id,
    section_type: sec.section_type || sec.type,
    title: sec.title,
    subtitle: sec.subtitle,
    category: sec.category,
    layout_variant: sec.layout_variant || "standard",
    display_order: idx,
    article_limit: sec.article_limit || sec.limit || 4,
    is_visible: sec.is_visible !== false,
    feature_flag: sec.feature_flag || "enabled",
    configuration_json: sec.configuration_json || sec.configuration || {},
    private_notes: sec.private_notes || "",
    created_by: perm.userId,
    updated_by: perm.userId
  }));

  const { error: sectionsError } = await supabase
    .from("homepage_sections")
    .insert(sectionInserts);

  if (sectionsError) {
    // Delete the layout draft since sections failed
    await supabase.from("homepage_layouts").delete().eq("id", layout.id);
    return { success: false, error: "Failed to save sections details: " + sectionsError.message };
  }

  // Audit log
  await supabase.from("homepage_audit_logs").insert({
    action_type: "Layout Created",
    details: `Created layout version ${layout.version} for edition ${editionId}`,
    performed_by: perm.userId
  });

  return { success: true, layoutId: layout.id };
}

// 6. Publish layout version (Transaction simulation)
export async function publishLayoutVersion(layoutId: string) {
  const perm = await verifyEditorialPermission();
  if (!perm.allowed) return { success: false, error: perm.error };

  const supabase = await createClient();

  // 1. Get layout edition
  const { data: targetLayout, error: fetchError } = await supabase
    .from("homepage_layouts")
    .select("edition_id, version")
    .eq("id", layoutId)
    .single();

  if (fetchError || !targetLayout) return { success: false, error: "Layout not found" };

  // 2. Unpublish other layouts for this edition
  const { error: unpublishError } = await supabase
    .from("homepage_layouts")
    .update({ is_published: false, status: "Archived" })
    .eq("edition_id", targetLayout.edition_id)
    .eq("is_published", true);

  if (unpublishError) return { success: false, error: "Failed to archive other layouts" };

  // 3. Mark target layout as published
  const { error: publishError } = await supabase
    .from("homepage_layouts")
    .update({ is_published: true, status: "Published", published_at: new Date().toISOString() })
    .eq("id", layoutId);

  if (publishError) return { success: false, error: "Failed to publish target layout version" };

  // 4. Audit logging
  await supabase.from("homepage_audit_logs").insert({
    action_type: "Version Published",
    details: `Published layout version ${targetLayout.version} for edition ${targetLayout.edition_id}`,
    performed_by: perm.userId
  });

  revalidatePath("/", "layout");
  return { success: true };
}

// 7. Pinned Articles Relation Update
export async function pinArticlesToSection(layoutId: string, sectionId: string, articleIds: string[]) {
  const perm = await verifyEditorialPermission();
  if (!perm.allowed) return { success: false, error: perm.error };

  const supabase = await createClient();

  // Clear existing pins for this section
  const { error: deleteError } = await supabase
    .from("homepage_section_articles")
    .delete()
    .eq("homepage_section_id", sectionId);

  if (deleteError) return { success: false, error: "Failed to reset section articles" };

  if (articleIds.length === 0) return { success: true };

  // Insert new ordered pins
  const pinInserts = articleIds.map((artId, idx) => ({
    homepage_layout_id: layoutId,
    homepage_section_id: sectionId,
    article_id: artId,
    position: idx,
    is_pinned: true,
    created_by: perm.userId
  }));

  const { error: insertError } = await supabase
    .from("homepage_section_articles")
    .insert(pinInserts);

  if (insertError) return { success: false, error: "Failed to write pinned articles" };

  // Log action
  await supabase.from("homepage_audit_logs").insert({
    action_type: "Articles Pinned",
    details: `Pinned ${articleIds.length} articles to section ${sectionId}`,
    performed_by: perm.userId
  });

  return { success: true };
}

// 8. Dynamic Section Locks heartbeat
export async function refreshSectionLock(sectionId: string) {
  const perm = await verifyEditorialPermission();
  if (!perm.allowed) return { success: false, error: perm.error };

  const supabase = await createClient();
  const now = new Date();
  const expires = new Date(now.getTime() + 60000); // Lock active for 60 seconds

  // Try to find if locked by another user
  const { data: existing } = await supabase
    .from("homepage_section_locks")
    .select("*")
    .eq("section_id", sectionId)
    .gt("expires_at", now.toISOString())
    .neq("locked_by", perm.userId)
    .limit(1);

  if (existing && existing.length > 0) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", existing[0].locked_by)
      .single();

    return { 
      success: false, 
      locked: true, 
      lockedBy: userProfile?.display_name || "अन्य संपादक" 
    };
  }

  // Upsert lock
  const { error } = await supabase
    .from("homepage_section_locks")
    .upsert({
      section_id: sectionId,
      locked_by: perm.userId,
      heartbeat_at: now.toISOString(),
      expires_at: expires.toISOString()
    }, { onConflict: "section_id" });

  if (error) return { success: false, error: error.message };
  return { success: true, locked: false };
}

// 9. Fetch Section Performance & CTR Stats
export async function getSectionAnalyticsStats(sectionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_section_analytics")
    .select("*")
    .eq("section_id", sectionId)
    .order("date", { ascending: false })
    .limit(7); // Last 7 days

  if (error) {
    console.error("Error fetching section analytics:", error);
    return [];
  }
  return data || [];
}

// 10. Audit Logs Search
export async function getHomepageAuditLogs(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_audit_logs")
    .select("*, profiles(display_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
  return data || [];
}
