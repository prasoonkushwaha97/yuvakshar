"use server";

import { createClient } from "@/utils/supabase/server";
import { hasAnyRole } from "@/lib/rbacService";
import { revalidatePath } from "next/cache";
import { logGovernanceAction } from "./governanceAuditActions";

import { Category } from "@/types/content";

// Internal helper for max depth = 2 validation
async function validateMaxDepth(parent_id: string | null, category_id?: string) {
  if (!parent_id) return true;
  
  if (parent_id === category_id) {
    throw new Error("Category cannot be its own parent.");
  }

  const supabase = await createClient();
  const { data: parent } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("id", parent_id)
    .single();

  if (!parent) throw new Error("Parent category not found.");
  
  if (parent.parent_id) {
    throw new Error("Maximum category depth of 2 exceeded. You cannot nest a child inside another child category.");
  }

  // Also verify that the category being modified (if any) doesn't have children already
  if (category_id) {
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", category_id)
      .limit(1);
      
    if (children && children.length > 0) {
      throw new Error("Cannot set parent for this category because it already contains child categories. (Max depth = 2)");
    }
  }

  return true;
}

export async function getCategories() {
  const supabase = await createClient();
  
  // Fetch categories with creator and updater profiles
  const { data: categories, error } = await supabase
    .from("categories")
    .select(`
      *,
      creator:profiles!created_by(name, avatar_url),
      updater:profiles!updated_by(name, avatar_url)
    `)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  // Group article counts
  const { data: articles } = await supabase
    .from("articles")
    .select("category_id");

  const counts: Record<string, number> = {};
  if (articles) {
    articles.forEach(a => {
      if (a.category_id) {
        counts[a.category_id] = (counts[a.category_id] || 0) + 1;
      }
    });
  }

  return categories.map((cat: any) => ({
    ...cat,
    _count: {
      articles: counts[cat.id] || 0
    }
  })) as Category[];
}

export async function createCategory(data: Partial<Category>) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor', 'moderator']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  if (data.parent_id) {
    await validateMaxDepth(data.parent_id);
  }

  const { data: result, error } = await supabase
    .from("categories")
    .insert([{
      name_hi: data.name_hi,
      name_en: data.name_en,
      slug: data.slug,
      description_hi: data.description_hi,
      description_en: data.description_en,
      color: data.color || "#EA580C",
      icon: data.icon,
      is_active: data.is_active ?? true,
      sort_order: data.sort_order || 0,
      parent_id: data.parent_id || null,
      created_by: userId,
      updated_by: userId
    }])
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logGovernanceAction("create", "category", result.id, { name_hi: data.name_hi });
  revalidatePath("/founder/categories");
  return { success: true };
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor', 'moderator']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  if (data.parent_id !== undefined) {
    await validateMaxDepth(data.parent_id, id);
  }

  const updateData: any = {
    ...data,
    updated_by: userId,
    updated_at: new Date().toISOString()
  };
  
  // ensure _count etc are not sent to DB
  delete updateData._count;
  delete updateData.created_by; // Prevent overwriting

  const { error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logGovernanceAction("update", "category", id, { fields_updated: Object.keys(data) });
  revalidatePath("/founder/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor', 'moderator']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Unauthorized");

  // Check if it has articles
  const { count: articleCount } = await supabase
    .from("articles")
    .select("*", { count: 'exact', head: true })
    .eq("category_id", id);

  if (articleCount && articleCount > 0) {
    throw new Error(`Cannot delete category because it contains ${articleCount} articles.`);
  }

  // Check if it has children
  const { count: childCount } = await supabase
    .from("categories")
    .select("*", { count: 'exact', head: true })
    .eq("parent_id", id);
    
  if (childCount && childCount > 0) {
    throw new Error(`Cannot delete category because it has ${childCount} child categories. Delete or move them first.`);
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logGovernanceAction("delete", "category", id);
  revalidatePath("/founder/categories");
  return { success: true };
}

export async function mergeCategories(sourceId: string, targetId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Unauthorized");

  if (sourceId === targetId) throw new Error("Cannot merge a category into itself.");

  // Move articles
  const { error: moveError } = await supabase
    .from("articles")
    .update({ category_id: targetId })
    .eq("category_id", sourceId);

  if (moveError) throw new Error(`Failed to move articles: ${moveError.message}`);

  // Delete source category
  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", sourceId);

  if (deleteError) throw new Error(`Failed to delete source category: ${deleteError.message}`);

  await logGovernanceAction("merge", "category", targetId, { merged_source_id: sourceId });
  revalidatePath("/founder/categories");
  return { success: true };
}

export async function reorderCategories(updates: { id: string; sort_order: number }[]) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Unauthorized");

  // Update sequentially for now (upsert can be complex with partial data)
  for (const update of updates) {
    await supabase
      .from("categories")
      .update({ sort_order: update.sort_order })
      .eq("id", update.id);
  }

  await logGovernanceAction("reorder", "category", null, { updated_count: updates.length });
  revalidatePath("/founder/categories");
  return { success: true };
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  return updateCategory(id, { is_active: !currentStatus });
}
