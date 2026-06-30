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
  
  // Fetch categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*");

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
    id: cat.id,
    name_hi: cat.name,
    name_en: cat.name,
    slug: cat.slug,
    description_hi: cat.description || "",
    description_en: cat.description || "",
    color: "#EA580C",
    is_active: true,
    sort_order: 0,
    parent_id: cat.parent_id,
    created_at: cat.created_at,
    updated_at: cat.created_at,
    _count: {
      articles: counts[cat.id] || 0
    }
  })) as Category[];
}

export async function createCategory(data: Partial<Category>) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor', 'moderator']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();

  const { data: result, error } = await supabase
    .from("categories")
    .insert([{
      name: data.name_hi || data.name_en || "",
      slug: data.slug || "",
      description: data.description_hi || data.description_en || "",
      parent_id: data.parent_id || null,
      language_code: "hi"
    }])
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logGovernanceAction("create", "category", result.id, { name_hi: data.name_hi });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor', 'moderator']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();

  const updateData: any = {};
  if (data.name_hi !== undefined || data.name_en !== undefined) {
    updateData.name = data.name_hi || data.name_en;
  }
  if (data.slug !== undefined) {
    updateData.slug = data.slug;
  }
  if (data.description_hi !== undefined || data.description_en !== undefined) {
    updateData.description = data.description_hi || data.description_en;
  }
  if (data.parent_id !== undefined) {
    updateData.parent_id = data.parent_id;
  }

  const { error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logGovernanceAction("update", "category", id, { fields_updated: Object.keys(updateData) });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor', 'moderator']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
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
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function mergeCategories(sourceId: string, targetId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
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
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function reorderCategories(updates: { id: string; sort_order: number }[]) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  if (!authData?.user) throw new Error("Unauthorized");

  // Update sequentially for now (upsert can be complex with partial data)
  for (const update of updates) {
    await supabase
      .from("categories")
      .update({ sort_order: update.sort_order })
      .eq("id", update.id);
  }

  await logGovernanceAction("reorder", "category", null, { updated_count: updates.length });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  return updateCategory(id, { is_active: !currentStatus });
}
