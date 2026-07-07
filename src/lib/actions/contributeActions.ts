"use server";

import { createClient } from "../supabaseServer";
import { revalidatePath } from "next/cache";
import { mapDbProfileToProfile } from "../repositoryService";
import { hasAnyRole } from "../rbacService";

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

  // Generate a safe slug if needed, but for guest_submissions we don't strictly need a slug yet.
  
  const { data, error } = await supabase
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

export async function submitContributorArticle(formData: FormData, isDraft: boolean = false) {
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

  if (!title || !content || !category) {
    return { error: "Missing required fields" };
  }

  const isAdmin = await hasAnyRole(["admin", "editor", "superadmin", "founder"]);
  const mode = formData.get("mode") as string;
  const isEditingAsAdmin = isAdmin && mode === "admin";
  const publishAs = formData.get("publishAs") as string;

  // Find category ID
  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category)
    .limit(1);

  const categoryId = categories && categories.length > 0 ? categories[0].id : null;

  const status = isDraft ? "Draft" : "Submitted";
  
  const payload: any = {
    title: title,
    english_title: title,
    content,
    status,
    category_id: categoryId,
    meta_title: metaTitle || null,
    meta_description: metaDescription || null,
  };
  
  if (customSlug) {
    payload.slug = customSlug;
  } else if (!articleId) {
    payload.slug = `contrib-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  // Only set author_id if it's a new article OR if we are explicitly overriding it
  // Otherwise, leave author_id untouched so the original author is preserved
  if (!articleId) {
    payload.author_id = user.id;
  }

  // Handle Admin "Publish As" override
  if (isEditingAsAdmin && publishAs) {
    if (publishAs === "युवाक्षर संपादकीय" || publishAs === "संपादकीय मंडल" || publishAs === "Guest Author") {
       // Ideally find the profile id, but for now we fallback to string logic in display
       payload.author = publishAs; 
       // In a real system, we'd lookup the ID of the special account.
    }
  }

  if (isEditingAsAdmin) {
    payload.editor_id = user.id;
    // Add internal metadata for tracking
    payload.editorial_metadata = {
      edited_by: user.id,
      edited_at: new Date().toISOString()
    };
  }

  if (categoryId) {
    payload.category_id = categoryId;
  }

  if (articleId) {
    let updateQuery = supabase
      .from("articles")
      .update(payload)
      .eq("id", articleId);

    if (!isEditingAsAdmin) {
      updateQuery = updateQuery.eq("author_id", user.id); // security check for authors
    }

    const { data, error } = await updateQuery.select().single();

    if (error) {
      console.error("Update contributor article error:", error);
      return { error: error.message };
    }

    revalidatePath("/workspace/articles");
    return { success: true, data };
  } else {
    const { data, error } = await supabase
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

export async function getContributorSubmissions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not logged in", submissions: [] };
  }

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, status, updated_at")
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

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id, title, content, status, created_at, updated_at")
    .eq("id", id)
    .eq("author_id", user.id)
    .single();

  if (articleError) {
    return { error: articleError.message, data: null };
  }

  // Fetch feedback notes if any
  const { data: notes } = await supabase
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
