"use server";

import { supabase } from "@/lib/supabaseClient";
import { logGovernanceAction } from "./governanceAuditActions";
import { hasPermission } from "@/lib/rbacService";
import { revalidatePath } from "next/cache";

export async function moveArticleStatus(article_id: string, new_status: string) {
  // 1. Validate auth and roles
  const { data: authData, error: authError } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  if (authError || !authData?.user) throw new Error("Unauthorized");

  const userId = authData.user.id;
  const { ArticleStatus } = await import("@/types/content");

  // 2. Determine required permission based on status
  let requiredPermission = "manage_articles";
  if (new_status === ArticleStatus.Published || new_status === ArticleStatus.Scheduled) {
    requiredPermission = "manage_system"; // Example: Need higher privilege to publish directly, except if overridden.
    // In a real system, we'd check if user is editor or admin.
    const canPublish = await hasPermission("manage_system") || await hasPermission("manage_articles");
    if (!canPublish) throw new Error("Forbidden: Cannot publish");
  } else {
    const canManage = await hasPermission("manage_articles");
    if (!canManage) throw new Error("Forbidden: Cannot move article");
  }

  // 3. Fetch old status
  const { data: article } = await supabase.from('articles').select('status, title_hi').eq('id', article_id).single();
  if (!article) throw new Error("Article not found");
  
  const old_status = article.status;

  // 4. Update article
  const { error: updateError } = await supabase
    .from('articles')
    .update({ 
      status: new_status,
      updated_at: new Date().toISOString()
    })
    .eq('id', article_id);

  if (updateError) throw updateError;

  // 5. Dual logging: Workflow History + Governance Audit
  await supabase.from('workflow_history').insert({
    article_id,
    old_status,
    new_status,
    actor_id: userId,
  });

  await logGovernanceAction(
    "WORKFLOW_TRANSITION",
    "articles",
    article_id,
    {
      title: article.title_hi,
      transition: `${old_status} -> ${new_status}`
    }
  );

  revalidatePath('/admin/workflow');
  revalidatePath('/admin/articles');
  
  return true;
}
