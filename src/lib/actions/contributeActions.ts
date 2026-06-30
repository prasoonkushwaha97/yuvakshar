"use server";

import { createClient } from "../supabaseServer";
import { revalidatePath } from "next/cache";

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

  if (!title || !content || !category) {
    return { error: "Missing required fields" };
  }

  // Find category ID
  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category)
    .limit(1);

  const categoryId = categories && categories.length > 0 ? categories[0].id : null;

  const status = isDraft ? "Draft" : "Submitted";
  
  // Generate a random slug since we don't have slug logic implemented in this module
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000000);
  
  const payload: any = {
    title: title,
    english_title: title,
    slug: slug,
    content,
    author_id: user.id,
    status,
    category_id: categoryId
  };

  if (categoryId) {
    payload.category_id = categoryId;
  }

  if (articleId) {
    // Update existing
    const { data, error } = await supabase
      .from("articles")
      .update(payload)
      .eq("id", articleId)
      .eq("author_id", user.id) // security check
      .select()
      .single();

    if (error) {
      console.error("Update contributor article error:", error);
      return { error: error.message };
    }

    revalidatePath("/contribute/dashboard");
    return { success: true, data };
  } else {
    // Generate a unique slug for new articles
    payload.slug = `contrib-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { data, error } = await supabase
      .from("articles")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Insert contributor article error:", error);
      return { error: error.message };
    }

    revalidatePath("/contribute/dashboard");
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
    .select("id, note, created_at, profiles(username)")
    .eq("article_id", id)
    .order("created_at", { ascending: true });

  return {
    data: {
      ...article,
      notes: notes || []
    }
  };
}
