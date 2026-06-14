"use server";

import { supabase } from "@/lib/supabaseClient";
import { hasAnyRole } from "@/lib/rbacService";
import { logGovernanceAction } from "./governanceAuditActions";
import { createNotification } from "./notificationActions";

// Lifecyle: Draft -> Under Review -> Revision Requested -> Approved -> Scheduled -> Published -> Archived

export async function transitionArticleState(articleId: string, newState: string, notes: string = "") {
  // Authentication & Authorization check based on target state
  const isReviewer = await hasAnyRole(['reviewer', 'editor', 'editor_in_chief', 'admin', 'super_admin', 'founder']);
  const isEditor = await hasAnyRole(['editor', 'editor_in_chief', 'admin', 'super_admin', 'founder']);
  const isEIC = await hasAnyRole(['editor_in_chief', 'admin', 'super_admin', 'founder']);

  if (!isReviewer) throw new Error("Unauthorized to perform workflow transitions.");

  // Fetch current article
  const { data: article, error: fetchError } = await supabase
    .from('articles')
    .select('id, status, author_id, title_en, title_hi')
    .eq('id', articleId)
    .single();

  if (fetchError || !article) throw new Error("Article not found.");

  const oldState = article.status;
  
  // State Machine Validation
  let canTransition = false;

  switch (newState) {
    case 'Under Review':
      // Anyone can submit Draft -> Under Review, but we assume author action or reviewer pull
      canTransition = oldState === 'Draft' || oldState === 'Revision Requested';
      break;
    case 'Revision Requested':
      canTransition = (oldState === 'Under Review' || oldState === 'Approved') && isReviewer;
      break;
    case 'Approved':
      canTransition = oldState === 'Under Review' && isEditor;
      break;
    case 'Scheduled':
      canTransition = oldState === 'Approved' && isEditor;
      break;
    case 'Published':
      canTransition = (oldState === 'Approved' || oldState === 'Scheduled') && isEIC;
      break;
    case 'Archived':
      canTransition = isEIC; // EIC can archive from almost any state
      break;
    default:
      throw new Error(`Invalid state transition: ${newState}`);
  }

  if (!canTransition) {
    throw new Error(`Invalid state transition from ${oldState} to ${newState} or insufficient permissions.`);
  }

  // Perform Update
  const { error: updateError } = await supabase
    .from('articles')
    .update({ status: newState })
    .eq('id', articleId);

  if (updateError) throw new Error("Database error during state transition.");

  // Audit Log
  await logGovernanceAction(
    `article_${newState.toLowerCase().replace(' ', '_')}`,
    'editorial',
    articleId,
    { oldState, newState, notes }
  );

  // Notifications
  const title = article.title_en || article.title_hi || "Your Article";
  
  if (newState === 'Revision Requested') {
    await createNotification(article.author_id, 'revision_requested', 'Revision Requested', `Revisions have been requested for "${title}". Note: ${notes}`);
  } else if (newState === 'Approved') {
    await createNotification(article.author_id, 'article_approved', 'Article Approved!', `Your article "${title}" has been approved for publication.`);
  } else if (newState === 'Published') {
    await createNotification(article.author_id, 'article_published', 'Article Published!', `Congratulations! Your article "${title}" is now live.`);
  }

  return true;
}
