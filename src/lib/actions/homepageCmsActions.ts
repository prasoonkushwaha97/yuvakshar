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

  const allowedRoles = ["Super Admin", "Editor-in-Chief", "Managing Editor", "Section Editor", "Founder"];
  if (!allowedRoles.includes(profile.role)) {
    return { allowed: false, error: "Insufficient editorial permissions" };
  }

  return { allowed: true, userId: user.id };
}

// 2. Fetch Editions
export async function getEditions() {
  return [
    {
      id: "main-edition",
      name: "मुख्य राष्ट्रीय संस्करण (National Edition)",
      is_active: true,
      is_default: true,
      created_at: new Date().toISOString()
    }
  ];
}

// 3. Fetch Layouts for specific Edition
export async function getLayoutsForEdition(editionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_layouts")
    .select("*")
    .order("version", { ascending: false });

  if (error) {
    console.error("Error fetching layouts:", error);
    return [];
  }
  return (data || []).map((layout: any) => ({
    ...layout,
    edition_id: editionId,
    status: layout.is_published ? "Published" : "Draft"
  }));
}

// 4. Fetch Sections for specific Layout Version
export async function getSectionsForLayout(layoutId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_layouts")
    .select("layout_json")
    .eq("id", layoutId)
    .single();

  if (error || !data) {
    console.error("Error fetching layout sections:", error);
    return [];
  }

  const lJson = data.layout_json as any;
  let rawSections = [];
  if (Array.isArray(lJson)) {
    rawSections = lJson;
  } else if (lJson && Array.isArray(lJson.sections)) {
    rawSections = lJson.sections;
  } else if (lJson && lJson.sections_order) {
    rawSections = lJson.sections_order.map((type: string, idx: number) => ({
      id: `${layoutId}-${type}`,
      section_type: type,
      title: type === "hero" ? "मुख्य समाचार" : type,
      is_visible: lJson.visible_sections?.[type] !== false,
      category: "",
      display_order: idx
    }));
  }

  return rawSections.map((sec: any, idx: number) => ({
    id: sec.id || `sec-${layoutId}-${idx}`,
    section_type: sec.section_type || sec.type,
    title: sec.title || "",
    subtitle: sec.subtitle || "",
    category: sec.category || "",
    layout_variant: sec.layout_variant || "standard",
    article_limit: sec.article_limit || sec.limit || 4,
    is_visible: sec.is_visible !== false,
    display_order: sec.display_order ?? idx,
    homepage_section_articles: sec.homepage_section_articles || []
  }));
}

// 5. Create new Layout version draft
export async function createLayoutDraft(editionId: string, name: string, sections: any[]) {
  const perm = await verifyEditorialPermission();
  if (!perm.allowed) return { success: false, error: perm.error };

  const supabase = await createClient();

  // Find latest version number
  const { data: latest } = await supabase
    .from("homepage_layouts")
    .select("version")
    .order("version", { ascending: false })
    .limit(1);

  const nextVersion = latest && latest[0] ? latest[0].version + 1 : 1;

  const { data: layout, error: layoutError } = await supabase
    .from("homepage_layouts")
    .insert({
      name: `${name} (v${nextVersion})`,
      layout_json: { sections },
      version: nextVersion,
      is_published: false
    })
    .select()
    .single();

  if (layoutError || !layout) {
    return { success: false, error: layoutError?.message || "Failed to create layout draft" };
  }

  await supabase.from("activity_logs").insert({
    user_id: perm.userId,
    action: "Layout Created",
    details: {
      message: `Created layout version ${layout.version} for edition ${editionId}`,
      layout_id: layout.id
    }
  });

  return { success: true, layoutId: layout.id };
}

// 6. Publish layout version
export async function publishLayoutVersion(layoutId: string) {
  const perm = await verifyEditorialPermission();
  if (!perm.allowed) return { success: false, error: perm.error };

  const supabase = await createClient();

  const { data: targetLayout, error: fetchError } = await supabase
    .from("homepage_layouts")
    .select("version")
    .eq("id", layoutId)
    .single();

  if (fetchError || !targetLayout) return { success: false, error: "Layout not found" };

  const { error: unpublishError } = await supabase
    .from("homepage_layouts")
    .update({ is_published: false })
    .eq("is_published", true);

  if (unpublishError) return { success: false, error: "Failed to archive other layouts" };

  const { error: publishError } = await supabase
    .from("homepage_layouts")
    .update({ is_published: true })
    .eq("id", layoutId);

  if (publishError) return { success: false, error: "Failed to publish target layout version" };

  await supabase.from("activity_logs").insert({
    user_id: perm.userId,
    action: "Version Published",
    details: {
      message: `Published layout version ${targetLayout.version}`
    }
  });

  revalidatePath("/", "layout");
  return { success: true };
}

// 7. Pinned Articles Relation Update
export async function pinArticlesToSection(layoutId: string, sectionId: string, articleIds: string[]) {
  const perm = await verifyEditorialPermission();
  if (!perm.allowed) return { success: false, error: perm.error };

  const supabase = await createClient();

  const { data: layout, error: fetchError } = await supabase
    .from("homepage_layouts")
    .select("*")
    .eq("id", layoutId)
    .single();

  if (fetchError || !layout) return { success: false, error: "Layout not found" };

  const lJson = layout.layout_json as any;
  let sections = Array.isArray(lJson) ? lJson : lJson.sections || [];

  sections = sections.map((sec: any) => {
    if (sec.id === sectionId) {
      return {
        ...sec,
        homepage_section_articles: articleIds.map((artId, idx) => ({
          article_id: artId,
          position: idx
        }))
      };
    }
    return sec;
  });

  const updatedLayoutJson = Array.isArray(lJson) ? sections : { ...lJson, sections };

  const { error: updateError } = await supabase
    .from("homepage_layouts")
    .update({ layout_json: updatedLayoutJson })
    .eq("id", layoutId);

  if (updateError) return { success: false, error: "Failed to save pinned articles" };

  await supabase.from("activity_logs").insert({
    user_id: perm.userId,
    action: "Articles Pinned",
    details: {
      message: `Pinned ${articleIds.length} articles to section ${sectionId} in layout ${layoutId}`
    }
  });

  return { success: true };
}

// 8. Dynamic Section Locks heartbeat
export async function refreshSectionLock(_sectionId: string): Promise<{ success: boolean; locked: boolean; lockedBy?: string; error?: string }> {
  return { success: true, locked: false };
}

// 9. Fetch Section Performance & CTR Stats
export async function getSectionAnalyticsStats(_sectionId: string) {
  return [];
}

// 10. Audit Logs Search
export async function getHomepageAuditLogs(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*, profiles(name, email)")
    .in("action", ["Layout Created", "Version Published", "Articles Pinned"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }

  return (data || []).map((log: any) => ({
    id: log.id,
    action_type: log.action,
    details: log.details?.message || log.action,
    created_at: log.created_at,
    profiles: {
      name: log.profiles?.name || "संपादक",
      display_name: log.profiles?.name || "संपादक",
      email: log.profiles?.email || ""
    }
  }));
}
