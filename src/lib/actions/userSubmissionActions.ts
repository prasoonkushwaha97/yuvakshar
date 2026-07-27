"use server";

import { createClient } from "../supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { mapDbProfileToProfile } from "../repositoryService";
import { hasAnyRole } from "../rbacService";
import { ArticleStatus } from "@/types/content";

export async function submitGuestArticle(formData: FormData) {
  const supabase = await createClient();
  
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const mobile = formData.get("mobile") as string || null;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string || "Opinion";

  if (!fullName || !email || !title || !content) {
    return { error: "Missing required fields" };
  }

  const { data, error } = await supabaseAdmin
    .from("guest_submissions")
    .insert([
      {
        full_name: fullName,
        email,
        mobile,
        title,
        content,
        category,
        status: "Submitted"
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Guest submission error:", error);
    return { error: error.message };
  }

  return { success: true, data };
}

export async function submitUserArticle(formData: FormData, isDraft: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit an article." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const articleId = formData.get("id") as string || null;
  const metaTitle = formData.get("meta_title") as string;
  const metaDescription = formData.get("meta_description") as string;
  const customSlug = formData.get("slug") as string;
  const coverImage = formData.get("cover_image") as string;

  if (!title || !content) {
    return { error: "Title and content are required." };
  }

  const isAdmin = await hasAnyRole(["admin", "editor", "founder"]);
  const mode = formData.get("mode") as string;
  const isEditingAsAdmin = isAdmin && mode === "admin";
  const publishAs = formData.get("publishAs") as string;

  // Find category ID (handles both UUID and Slug formats)
  let categoryId = null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (category) {
    if (uuidRegex.test(category)) {
      categoryId = category;
    } else {
      const { data: categories } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("slug", category)
        .limit(1);
      categoryId = categories && categories.length > 0 ? categories[0].id : null;
    }
  }

  // Normal community users MUST ONLY be allowed status Draft or Submitted
  let status = isDraft ? ArticleStatus.Draft : ArticleStatus.Submitted;
  if (!isAdmin && status !== ArticleStatus.Draft && status !== ArticleStatus.Submitted) {
    status = ArticleStatus.Submitted;
  }

  const payload: any = {
    title: title,
    title_hi: title,
    english_title: title,
    content,
    status,
    category_id: categoryId,
    meta_title: metaTitle || null,
    meta_description: metaDescription || null,
  };
  
  const summary_hi = formData.get("summary_hi") as string;
  if (summary_hi !== null && summary_hi !== undefined) {
    payload.summary = summary_hi;
    payload.summary_hi = summary_hi;
  }
  
  if (coverImage) {
    payload.cover_image = coverImage;
  }
  
  if (customSlug) {
    payload.slug = customSlug;
  } else if (!articleId) {
    payload.slug = `contrib-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  // Always enforce author_id = user.id for normal users
  if (!isEditingAsAdmin) {
    payload.author_id = user.id;
  } else if (!articleId && !payload.author_id) {
    payload.author_id = user.id;
  }

  // Handle Admin "Publish As" override
  if (isEditingAsAdmin && publishAs) {
    if (publishAs === "युवाक्षर संपादकीय" || publishAs === "संपादकीय मंडल" || publishAs === "Guest Author") {
       payload.author = publishAs; 
    }
  }

  if (isEditingAsAdmin) {
    payload.editor_id = user.id;
    payload.editorial_metadata = {
      edited_by: user.id,
      edited_at: new Date().toISOString()
    };
  }

  if (categoryId) {
    payload.category_id = categoryId;
  }

  console.log("[submitUserArticle]", { userId: user.id, articleId, isDraft, status, payload });

  if (articleId) {
    // If editing existing article, ensure normal user can only update their own article
    if (!isEditingAsAdmin) {
      const { data: existing } = await supabaseAdmin
        .from("articles")
        .select("id, author_id, status")
        .eq("id", articleId)
        .single();

      if (!existing || existing.author_id !== user.id) {
        return { error: "Unauthorized: You can only edit your own articles." };
      }

      // Normal users cannot edit published or archived articles
      if (existing.status === ArticleStatus.Published || existing.status === ArticleStatus.Archived) {
        return { error: "Published articles cannot be edited by contributor." };
      }
    }

    const { data, error } = await supabaseAdmin
      .from("articles")
      .update(payload)
      .eq("id", articleId)
      .select()
      .single();

    if (error) {
      console.error("Update contributor article error:", error);
      return { error: error.message };
    }

    revalidatePath("/workspace/articles");
    return { success: true, data };
  } else {
    const { data, error } = await supabaseAdmin
      .from("articles")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Insert contributor article error:", error);
      return { error: error.message };
    }

    revalidatePath("/workspace/articles");
    return { success: true, data };
  }
}

export async function getUserSubmissions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not logged in", submissions: [] };
  }

  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("id, title, status, updated_at, created_at, cover_image, summary")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Fetch submissions error:", error);
    return { error: error.message, submissions: [] };
  }

  return { submissions: data };
}

export async function getSubmissionDetails(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not logged in", data: null };
  }

  const { data: article, error: articleError } = await supabaseAdmin
    .from("articles")
    .select("id, title, content, status, created_at, updated_at, cover_image, summary, category_id, slug")
    .eq("id", id)
    .eq("author_id", user.id)
    .single();

  if (articleError) {
    return { error: articleError.message, data: null };
  }

  // Fetch feedback notes if any
  const { data: notes } = await supabaseAdmin
    .from("review_notes")
    .select("id, note, created_at, profiles(id, name, avatar_url, social_links)")
    .eq("article_id", id)
    .order("created_at", { ascending: true });

  const mappedNotes = (notes || []).map((msg: any) => ({
    ...msg,
    profiles: msg.profiles ? mapDbProfileToProfile(msg.profiles) : null
  }));

  return {
    data: {
      ...article,
      notes: mappedNotes
    }
  };
}
