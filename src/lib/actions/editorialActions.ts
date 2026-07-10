"use server";

import { createClient } from "@/lib/supabaseServer";

export async function getAdminEditorialQueue(statusFilter?: string) {
  const supabase = await createClient();
  
  // Verify admin access here ideally
  
  let query = supabase
    .from('articles')
    .select(`
      *,
      authorProfile:profiles!articles_author_id_fkey(name, username, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.ilike('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch editorial queue", error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function updateArticleStatus(articleId: string, newStatus: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('articles')
    .update({ status: newStatus })
    .eq('id', articleId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Create notification if needed (e.g. revision requested, published)
  
  return { success: true, data };
}
