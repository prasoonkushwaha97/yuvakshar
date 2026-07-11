"use server";

import { createClient } from "@/utils/supabase/server";
import { hasAnyRole } from "@/lib/rbacService";
import { revalidatePath } from "next/cache";
import { logGovernanceAction } from "./governanceAuditActions";
import { Article, ArticleStatus } from "@/types/content";
import { mapDbProfileToProfile } from "@/lib/repositoryService";
import { STORAGE_CONFIG } from "@/config/storage.config";

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
    .select("*, categories(name, slug), profiles!articles_author_id_fkey(id, name, avatar_url, social_links)", { count: 'exact' });

  if (filters?.status) {
    query = query.ilike("status", filters.status);
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
    status: art.status as ArticleStatus || ArticleStatus.Draft,
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
      .select("*, categories(id, name, slug), profiles!articles_author_id_fkey(id, name, avatar_url, social_links)")
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
      status: art.status as ArticleStatus || ArticleStatus.Draft,
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
      .select("*, categories(id, name, slug), profiles!articles_author_id_fkey(id, name, avatar_url, social_links)")
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
      status: art.status as ArticleStatus || ArticleStatus.Draft,
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
  if (!insertData.status) insertData.status = ArticleStatus.Draft;

  if (!insertData.author_id || insertData.author_id === "") {
    const { data: authData } = await supabase.auth.getUser();
    insertData.author_id = authData.user?.id;
  }

  console.log("createArticle data prop", data);
  console.log("createArticle insertData dbData", insertData);

  const { data: result, error } = await supabase
    .from("articles")
    .insert([insertData])
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logGovernanceAction("create", "article", result.id, { title: data.title_hi, status: insertData.status });
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  return { success: true, id: result.id };
}

export async function updateArticle(id: string, data: Partial<Article>) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const updateData = mapArticleToDb(data);
  
  if (updateData.author_id === "") {
    delete updateData.author_id;
  }

  console.log("updateArticle data prop", data);
  console.log("updateArticle updateData dbData", updateData);

  const { error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logGovernanceAction("update", "article", id, { fields_updated: Object.keys(updateData), new_status: data.status });
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath(`/admin/articles/${id}`);
  return { success: true };
}

export async function toggleFeaturedArticle(id: string, is_featured: boolean) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const { error } = await supabase
    .from("articles")
    .update({ featured: is_featured })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logGovernanceAction("update", "article", id, { fields_updated: ['featured'], new_featured_status: is_featured });
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteArticle(id: string) {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const { data: art } = await supabase.from("articles").select("cover_image").eq("id", id).single();

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  if (art?.cover_image) {
     if (art.cover_image.includes('/articles/')) {
       const urlParts = art.cover_image.split('/articles/');
       if (urlParts.length >= 2) {
         const filePath = urlParts.slice(1).join('/articles/');
         await supabase.storage.from('articles').remove([filePath]);
       }
     } else if (art.cover_image.includes(`${STORAGE_CONFIG.BUCKET_NAME}/`)) {
       const urlParts = art.cover_image.split(`${STORAGE_CONFIG.BUCKET_NAME}/`);
       if (urlParts.length === 2) {
         const filePath = urlParts[1];
         if (filePath.startsWith('articles/')) {
           await supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).remove([filePath]);
         }
       }
     }
  }

  await logGovernanceAction("delete", "article", id);
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  return { success: true };
}

export async function bulkDeleteArticles(ids: string[]) {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const { data: arts } = await supabase.from("articles").select("cover_image").in("id", ids);

  const { error } = await supabase
    .from("articles")
    .delete()
    .in("id", ids);

  if (error) throw new Error(error.message);

  if (arts && arts.length > 0) {
      const pathsToDeleteArticles: string[] = [];
      const pathsToDeleteMedia: string[] = [];
      arts.forEach(art => {
         if (art.cover_image) {
             if (art.cover_image.includes('/articles/')) {
               const urlParts = art.cover_image.split('/articles/');
               if (urlParts.length >= 2) {
                 pathsToDeleteArticles.push(urlParts.slice(1).join('/articles/'));
               }
             } else if (art.cover_image.includes(`${STORAGE_CONFIG.BUCKET_NAME}/`)) {
               const urlParts = art.cover_image.split(`${STORAGE_CONFIG.BUCKET_NAME}/`);
               if (urlParts.length === 2) {
                 const filePath = urlParts[1];
                 if (filePath.startsWith('articles/')) {
                   pathsToDeleteMedia.push(filePath);
                 }
               }
             }
         }
      });
      if (pathsToDeleteArticles.length > 0) {
          await supabase.storage.from('articles').remove(pathsToDeleteArticles);
      }
      if (pathsToDeleteMedia.length > 0) {
          await supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).remove(pathsToDeleteMedia);
      }
  }

  await logGovernanceAction("bulk_delete", "article", null, { deleted_count: ids.length });
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  return { success: true };
}

export async function bulkUpdateArticleStatus(ids: string[], status: ArticleStatus | string) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const { error } = await supabase
    .from("articles")
    .update({ status })
    .in("id", ids);

  if (error) throw new Error(error.message);

  await logGovernanceAction("bulk_status_update", "article", null, { updated_count: ids.length, new_status: status });
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  return { success: true };
}

export async function duplicateArticle(id: string) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const { data: original, error: fetchError } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) throw new Error("Article not found");

  const { id: _oldId, created_at: _ca, updated_at: _ua, ...copyData } = original;
  copyData.title = `${copyData.title} (Copy)`;
  copyData.slug = `${copyData.slug}-copy-${Math.random().toString(36).substring(2, 7)}`;
  copyData.status = ArticleStatus.Draft;

  const { data: newArticle, error: insertError } = await supabase
    .from("articles")
    .insert([copyData])
    .select("id")
    .single();

  if (insertError) throw new Error(insertError.message);

  await logGovernanceAction("create", "article", newArticle.id, { notes: "Duplicated from " + id });
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  return { success: true, id: newArticle.id };
}

export async function updateArticleStatus(id: string, status: ArticleStatus | string) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const supabase = await createClient();
  
  const { data: currentArticle } = await supabase.from("articles").select("status").eq("id", id).single();
  const current_status = currentArticle?.status;
  
  const isFounder = await hasAnyRole(['founder']);
  
  if (!isFounder) {
    const allowedTransitions: Record<string, string[]> = {
      [ArticleStatus.Draft]: [ArticleStatus.Submitted, ArticleStatus.UnderReview],
      [ArticleStatus.Submitted]: [ArticleStatus.UnderReview, ArticleStatus.Draft, ArticleStatus.Rejected],
      [ArticleStatus.UnderReview]: [ArticleStatus.RevisionRequested, ArticleStatus.Approved, ArticleStatus.Draft, ArticleStatus.Rejected],
      [ArticleStatus.RevisionRequested]: [ArticleStatus.Submitted, ArticleStatus.Draft],
      [ArticleStatus.Approved]: [ArticleStatus.Scheduled, ArticleStatus.Published, ArticleStatus.Draft],
      [ArticleStatus.Scheduled]: [ArticleStatus.Published, ArticleStatus.Draft],
      [ArticleStatus.Published]: [ArticleStatus.Archived],
      [ArticleStatus.Archived]: [ArticleStatus.Published],
      [ArticleStatus.Rejected]: [ArticleStatus.Draft]
    };
    
    const normalizedCurrent = current_status || ArticleStatus.Draft;
    const normalizedAttempt = status as ArticleStatus;
    
    const allowed = allowedTransitions[normalizedCurrent as string] || [];
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
  revalidatePath("/admin");
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
  if (data.meta_title !== undefined) dbData.meta_title = data.meta_title;
  if (data.meta_description !== undefined) dbData.meta_description = data.meta_description;
  if (data.meta_keywords !== undefined) dbData.meta_keywords = data.meta_keywords;
  return dbData;
}

export async function getRelatedArticlesForInfiniteScroll(
  excludeIds: string[],
  categoryId?: string,
  limit: number = 2
): Promise<Article[]> {
  try {
    const supabase = await createClient();
    
    // We do a single query to get the latest published articles not in excludeIds.
    // If categoryId is provided, we can prioritize them, but for simplicity let's 
    // fetch limit * 3 articles, sort them in JS if we need to prioritize category,
    // or just rely on supabase to give us some matches.
    let query = supabase
      .from("articles")
      .select("*, categories(id, name, slug), profiles!articles_author_id_fkey(id, name, avatar_url, social_links)")
      .eq("status", ArticleStatus.Published)
      .not("id", "in", `(${excludeIds.join(',')})`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (categoryId) {
       // Ideally we do an OR query or rank by category, but Supabase doesn't easily let us order by condition.
       // Let's just fetch the exact category first.
         const { data: catData, error: catError } = await supabase
           .from("articles")
           .select("*, categories(id, name, slug), profiles!articles_author_id_fkey(id, name, avatar_url, social_links)")
           .eq("status", ArticleStatus.Published)
           .eq("category_id", categoryId)
           .not("id", "in", `(${excludeIds.join(',')})`)
           .order("created_at", { ascending: false })
           .limit(limit);
         
       if (!catError && catData && catData.length > 0) {
         let results = catData;
         if (results.length < limit) {
           const newExcludes = [...excludeIds, ...results.map(r => r.id)];
             const { data: fallbackData } = await supabase
               .from("articles")
               .select("*, categories(id, name, slug), profiles!articles_author_id_fkey(id, name, avatar_url, social_links)")
               .eq("status", ArticleStatus.Published)
               .not("id", "in", `(${newExcludes.join(',')})`)
               .order("created_at", { ascending: false })
               .limit(limit - results.length);
           if (fallbackData) {
             results = [...results, ...fallbackData];
           }
         }
         return results.map((art: any) => ({
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
         })) as Article[];
       }
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching related infinite scroll articles:", error);
      return [];
    }

    return (data || []).map((art: any) => ({
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
    })) as Article[];
  } catch (err) {
    console.error("Exception fetching infinite scroll:", err);
    return [];
  }
}

export async function getAuthorsForSelect() {
  try {
    const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
    if (!isAuthorized) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, display_name, username")
      .order("display_name", { ascending: true })
      .limit(200);

    if (error) {
      console.error("Error fetching authors for select:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Exception in getAuthorsForSelect:", error);
    return [];
  }
}
