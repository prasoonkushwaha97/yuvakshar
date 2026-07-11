"use server";

import { supabase } from "@/lib/supabaseClient";
import { hasAnyRole } from "@/lib/rbacService";
import { logGovernanceAction } from "./governanceAuditActions";
import { createNotification } from "./notificationActions";
import { ArticleStatus } from "@/types/content";

// Lifecyle: Draft -> Under Review -> Revision Requested -> Approved -> Scheduled -> Published -> Archived

export async function transitionArticleState(articleId: string, newState: ArticleStatus, notes: string = "") {
  // Authentication & Authorization check based on target state
  const isReviewAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  const isEditorAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  const isAdminOrFounder = await hasAnyRole(['founder', 'admin']);

  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  if (!authData?.user) throw new Error("Unauthenticated");
  const currentUserId = authData.user.id;

  // Fetch current article
  const { data: article, error: fetchError } = await supabase
    .from('articles')
    .select('id, status, author_id, title_en, title_hi')
    .eq('id', articleId)
    .single();

  if (fetchError || !article) throw new Error("Article not found.");

  const oldState = article.status as ArticleStatus;
  
  // State Machine Validation
  let canTransition = false;

  switch (newState) {
    case ArticleStatus.UnderReview:
      canTransition = (oldState === ArticleStatus.Draft || oldState === ArticleStatus.RevisionRequested) && (isEditorAuthorized || article.author_id === currentUserId);
      break;
    case ArticleStatus.RevisionRequested:
      canTransition = (oldState === ArticleStatus.UnderReview || oldState === ArticleStatus.Approved) && isReviewAuthorized;
      break;
    case ArticleStatus.Approved:
      canTransition = oldState === ArticleStatus.UnderReview && isEditorAuthorized;
      break;
    case ArticleStatus.Scheduled:
      canTransition = oldState === ArticleStatus.Approved && isEditorAuthorized;
      break;
    case ArticleStatus.Published:
      canTransition = (oldState === ArticleStatus.Approved || oldState === ArticleStatus.Scheduled) && isAdminOrFounder;
      break;
    case ArticleStatus.Archived:
      canTransition = isAdminOrFounder; // Admin/Founder can archive from almost any state
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
  
  if (newState === ArticleStatus.RevisionRequested) {
    await createNotification(article.author_id, 'revision_requested', 'Revision Requested', `Revisions have been requested for "${title}". Note: ${notes}`);
  } else if (newState === ArticleStatus.Approved) {
    await createNotification(article.author_id, 'article_approved', 'Article Approved!', `Your article "${title}" has been approved for publication.`);
  } else if (newState === ArticleStatus.Published) {
    await createNotification(article.author_id, 'article_published', 'Article Published!', `Congratulations! Your article "${title}" is now live.`);
  }

  return true;
}
