"use server";

import { createClient } from "@/utils/supabase/server";
import { hasAnyRole } from "@/lib/rbacService";
import { revalidatePath } from "next/cache";
import { logGovernanceAction } from "./governanceAuditActions";
import { Article, ArticleStatus } from "@/types/content";

export async function getArticles(
  filters?: { status?: string, category_id?: string, author_id?: string, search?: string },
  options?: { page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc' }
) {
  const supabase = await createClient();
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  let query = supabase
    .from("articles")
    .select("*, categories(name_hi, name_en, slug), profiles(name, display_name, avatar_url, email)", { count: 'exact' });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.category_id) {
    query = query.eq("category_id", filters.category_id);
  }
  if (filters?.author_id) {
    query = query.eq("author_id", filters.author_id);
  }
  if (filters?.search) {
    query = query.or(`title_hi.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%`);
  }

  // Sorting
  const sortBy = options?.sortBy || 'created_at';
  const sortOrder = options?.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Pagination
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching articles:", error);
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as Article[], count: count || 0, error: null };
}

export async function getArticleById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(name_hi, slug), profiles(name, avatar_url)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching article by id:", error);
    return null;
  }
  return data as Article;
}

export async function getArticleBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(name_hi, slug), profiles(name, avatar_url)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
  return data as Article;
}

export async function createArticle(data: Partial<Article>) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  // Enforce server-side logic
  const insertData = { ...data };
  if (!insertData.status) insertData.status = "draft";
  if (insertData.status === "published" && !insertData.published_at) {
    insertData.published_at = new Date().toISOString();
  }

  const { data: result, error } = await supabase
    .from("articles")
    .insert([insertData])
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logGovernanceAction("create", "article", result.id, { title: data.title_hi, status: insertData.status });
  revalidatePath("/founder/articles");
  revalidatePath("/admin/articles");
  return { success: true, id: result.id };
}

export async function updateArticle(id: string, data: Partial<Article>) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const updateData = { ...data, updated_at: new Date().toISOString() };
  if (data.status === "published" && !data.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logGovernanceAction("update", "article", id, { fields_updated: Object.keys(data), new_status: data.status });
  revalidatePath("/founder/articles");
  revalidatePath("/admin/articles");
  revalidatePath(`/founder/articles/${id}`);
  return { success: true };
}

export async function deleteArticle(id: string) {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logGovernanceAction("delete", "article", id);
  revalidatePath("/founder/articles");
  revalidatePath("/admin/articles");
  return { success: true };
}

export async function bulkDeleteArticles(ids: string[]) {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const { error } = await supabase
    .from("articles")
    .delete()
    .in("id", ids);

  if (error) throw new Error(error.message);

  await logGovernanceAction("bulk_delete", "article", null, { deleted_count: ids.length });
  revalidatePath("/founder/articles");
  return { success: true };
}

export async function updateArticleStatus(id: string, status: ArticleStatus | string) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const { data: currentArticle } = await supabase.from("articles").select("status").eq("id", id).single();
  const current_status = currentArticle?.status;
  
  const isFounder = await hasAnyRole(['founder', 'co_founder']);
  
  if (!isFounder) {
    const allowedTransitions: Record<string, string[]> = {
      "draft": ["in_review"],
      "in_review": ["fact_check", "draft"],
      "review": ["fact_check", "draft"],
      "fact_check": ["editor_review", "in_review", "review"],
      "editor_review": ["scheduled", "draft"],
      "scheduled": ["published", "editor_review"],
      "published": ["archived"],
      "archived": ["published"]
    };
    
    const normalizedCurrent = current_status?.toLowerCase() || 'draft';
    const normalizedAttempt = status.toLowerCase();
    
    const allowed = allowedTransitions[normalizedCurrent] || [];
    if (!allowed.includes(normalizedAttempt)) {
      const { data: authData } = await supabase.auth.getUser();
      await logGovernanceAction(
        "workflow_violation",
        "article",
        id,
        {
          current_status,
          attempted_status: status,
          actor: authData.user?.email || authData.user?.id
        }
      );
      throw new Error(`Invalid workflow transition from ${current_status} to ${status}`);
    }
  }
  
  const updateData: any = { status, updated_at: new Date().toISOString() };
  if (status === "published") {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logGovernanceAction("status_change", "article", id, { new_status: status });
  revalidatePath("/founder/articles");
  revalidatePath("/admin/articles");
  revalidatePath(`/founder/articles/${id}`);
  return { success: true };
}
