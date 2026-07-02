"use server";

import { createClient } from "@/utils/supabase/server";
import { hasAnyRole } from "@/lib/rbacService";
import { revalidatePath } from "next/cache";
import { logGovernanceAction } from "./governanceAuditActions";
import { Article, ArticleStatus } from "@/types/content";
import { mapDbProfileToProfile } from "@/lib/repositoryService";

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
    .select("*, categories(name, slug), profiles(id, name, avatar_url, social_links)", { count: 'exact' });

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
    query = query.or(`title.ilike.%${filters.search}%,english_title.ilike.%${filters.search}%`);
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

  const mappedData = (data as any[]).map((art: any) => ({
    ...art,
    profiles: art.profiles ? mapDbProfileToProfile(art.profiles) : null,
    title_hi: art.title,
    title_en: art.english_title || "",
    summary_hi: art.summary || "",
    summary_en: art.summary || "",
    is_featured: art.featured || false,
    view_count: art.views || 0,
    like_count: art.likes || 0,
    categories: art.categories ? {
      id: art.categories.id,
      name_hi: art.categories.name,
      slug: art.categories.slug,
      color: "#EA580C"
    } : null
  }));

  return { data: mappedData as Article[], count: count || 0, error: null };
}

export async function getArticleById(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*, categories(id, name, slug), profiles(id, name, avatar_url, social_links)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching article by id in getArticleById action:", error);
      return null;
    }
    
    if (!data) {
      console.error(`No article found for ID: ${id}`);
      return null;
    }
    
    const art = data as any;
    return {
      ...art,
      profiles: art.profiles ? mapDbProfileToProfile(art.profiles) : null,
      title_hi: art.title,
      title_en: art.english_title || "",
      summary_hi: art.summary || "",
      summary_en: art.summary || "",
      is_featured: art.featured || false,
      view_count: art.views || 0,
      like_count: art.likes || 0,
      categories: art.categories ? {
        id: art.categories.id,
        name_hi: art.categories.name,
        slug: art.categories.slug,
        color: "#EA580C"
      } : null
    } as Article;
  } catch (err) {
    console.error("Exception in getArticleById action:", err);
    return null;
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*, categories(id, name, slug), profiles(id, name, avatar_url, social_links)")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching article by slug in getArticleBySlug action:", error);
      return null;
    }

    if (!data) {
      console.error(`No article found for slug: ${slug}`);
      return null;
    }

    const art = data as any;
    return {
      ...art,
      profiles: art.profiles ? mapDbProfileToProfile(art.profiles) : null,
      title_hi: art.title,
      title_en: art.english_title || "",
      summary_hi: art.summary || "",
      summary_en: art.summary || "",
      is_featured: art.featured || false,
      view_count: art.views || 0,
      like_count: art.likes || 0,
      categories: art.categories ? {
        id: art.categories.id,
        name_hi: art.categories.name,
        slug: art.categories.slug,
        color: "#EA580C"
      } : null
    } as Article;
  } catch (err) {
    console.error("Exception in getArticleBySlug action:", err);
    return null;
  }
}

export async function createArticle(data: Partial<Article>) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  // Enforce server-side logic
  const insertData = mapArticleToDb(data);
  if (!insertData.status) insertData.status = "Draft";

  const { data: result, error } = await supabase
    .from("articles")
    .insert([insertData])
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logGovernanceAction("create", "article", result.id, { title: data.title_hi, status: insertData.status });
  revalidatePath("/admin/articles");
  revalidatePath("/admin/articles");
  return { success: true, id: result.id };
}

export async function updateArticle(id: string, data: Partial<Article>) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const updateData = mapArticleToDb(data);

  const { error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logGovernanceAction("update", "article", id, { fields_updated: Object.keys(updateData), new_status: data.status });
  revalidatePath("/admin/articles");
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
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
  revalidatePath("/admin/articles");
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
  revalidatePath("/admin/articles");
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
      const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
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
  
  const updateData: any = { status };

  const { error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logGovernanceAction("status_change", "article", id, { new_status: status });
  revalidatePath("/admin/articles");
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
  return { success: true };
}

function mapArticleToDb(data: Partial<Article>): any {
  const dbData: any = {};
  if (data.title_hi !== undefined) dbData.title = data.title_hi;
  if (data.title_en !== undefined) dbData.english_title = data.title_en;
  if (data.slug !== undefined) dbData.slug = data.slug;
  if (data.summary_hi !== undefined) dbData.summary = data.summary_hi;
  if (data.content !== undefined) dbData.content = data.content;
  if (data.cover_image !== undefined) dbData.cover_image = data.cover_image;
  if (data.category_id !== undefined) dbData.category_id = data.category_id;
  if (data.author_id !== undefined) dbData.author_id = data.author_id;
  if (data.status !== undefined) dbData.status = data.status;
  if (data.is_featured !== undefined) dbData.featured = data.is_featured;
  if (data.view_count !== undefined) dbData.views = data.view_count;
  if (data.like_count !== undefined) dbData.likes = data.like_count;
  if (data.read_time !== undefined) dbData.read_time = data.read_time;
  if (data.scheduled_publish_at !== undefined) dbData.scheduled_for = data.scheduled_publish_at;
  if (data.language !== undefined) dbData.language_code = data.language;
  return dbData;
}
