"use server";

import { supabase } from "@/lib/supabaseClient";
import { logGovernanceAction } from "./governanceAuditActions";
import { hasPermission } from "@/lib/rbacService";
import { revalidatePath } from "next/cache";

export async function addReviewNote(article_id: string, note: string, decision?: 'approve' | 'request_changes' | 'reject' | null, parent_id?: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) throw new Error("Unauthorized");

  const userId = authData.user.id;

  // Assuming reviewer or editor permission
  const canReview = await hasPermission("manage_articles");
  if (!canReview) throw new Error("Forbidden");

  // Insert note
  const { data: noteData, error: noteError } = await supabase
    .from('review_notes')
    .insert({
      article_id,
      reviewer_id: userId,
      note,
      decision,
      parent_id
    })
    .select()
    .single();

  if (noteError) throw noteError;

  // Dual logging
  await logGovernanceAction(
    "REVIEW_NOTE_ADDED",
    "review_notes",
    noteData.id,
    { article_id, decision, is_reply: !!parent_id }
  );

  revalidatePath('/founder/reviews');
  return noteData;
}

export async function assignReviewer(article_id: string, user_id: string, role_type: 'reviewer' | 'editor' | 'fact_checker') {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) throw new Error("Unauthorized");

  const adminId = authData.user.id;
  
  const canAssign = await hasPermission("manage_articles");
  if (!canAssign) throw new Error("Forbidden");

  const { error } = await supabase
    .from('article_assignments')
    .upsert({
      article_id,
      user_id,
      role_type,
      assigned_by: adminId
    }, { onConflict: 'article_id,user_id,role_type' });

  if (error) throw error;

  // Also update the main articles table for quick access
  const updatePayload: any = {};
  if (role_type === 'reviewer') updatePayload.reviewer_id = user_id;
  if (role_type === 'editor') updatePayload.editor_id = user_id;
  
  if (Object.keys(updatePayload).length > 0) {
    await supabase.from('articles').update(updatePayload).eq('id', article_id);
  }

  await logGovernanceAction(
    "REVIEWER_ASSIGNED",
    "article_assignments",
    article_id,
    { assigned_to: user_id, role_type }
  );

  revalidatePath('/founder/reviews');
  return true;
}

export async function getReviewNotes(article_id: string) {
  const { data, error } = await supabase
    .from('review_notes')
    .select(`
      *,
      reviewer:profiles!reviewer_id(id, name, avatar_url)
    `)
    .eq('article_id', article_id)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Build tree
  const tree: any[] = [];
  const map = new Map();
  
  data.forEach(item => {
    map.set(item.id, { ...item, replies: [] });
  });
  
  data.forEach(item => {
    if (item.parent_id) {
      const parent = map.get(item.parent_id);
      if (parent) {
        parent.replies.push(map.get(item.id));
      }
    } else {
      tree.push(map.get(item.id));
    }
  });

  return tree;
}
