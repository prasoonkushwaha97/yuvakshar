"use server";

import { supabase } from "@/lib/supabaseClient";
import { logGovernanceAction } from "./governanceAuditActions";
import { hasPermission } from "@/lib/rbacService";
import { revalidatePath } from "next/cache";

export async function createMagazineIssue(data: { title: string, slug: string, volume: number, issue_number: number }) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  const userId = authData?.user?.id;
  
  if (!await hasPermission("manage_system")) throw new Error("Forbidden");

  const { data: issue, error } = await supabase.from('magazine_issues').insert({
    ...data,
    status: 'draft',
    created_by: userId,
    updated_by: userId
  }).select().single();

  if (error) throw error;

  await logGovernanceAction("CREATE_MAGAZINE_ISSUE", "magazine_issues", issue.id, { title: issue.title });
  revalidatePath('/admin/magazine');
  
  return issue;
}

export async function getMagazineIssues() {
  const { data, error } = await supabase.from('magazine_issues').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMagazineIssueById(id: string) {
  const { data, error } = await supabase
    .from('magazine_issues')
    .select(`
      *,
      sections:magazine_sections(*),
      articles:magazine_issue_articles(
        *,
        article:articles(id, title_hi, slug, status, profiles(name))
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function addSectionToIssue(issue_id: string, title: string) {
  if (!await hasPermission("manage_system")) throw new Error("Forbidden");
  
  const { data, error } = await supabase.from('magazine_sections').insert({ issue_id, title }).select().single();
  if (error) throw error;
  
  revalidatePath(`/admin/magazine/builder/${issue_id}`);
  return data;
}

export async function addArticleToIssue(issue_id: string, article_id: string, section_id?: string) {
  if (!await hasPermission("manage_system")) throw new Error("Forbidden");
  
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));

  const { error } = await supabase.from('magazine_issue_articles').insert({
    issue_id,
    article_id,
    section_id,
    added_by: authData?.user?.id
  });

  if (error) throw error;

  await logGovernanceAction("MAGAZINE_ARTICLE_ADDED", "magazine_issues", issue_id, { article_id, section_id });
  revalidatePath(`/admin/magazine/builder/${issue_id}`);
  return true;
}

export async function updateIssueStatus(issue_id: string, status: string) {
  if (!await hasPermission("manage_system")) throw new Error("Forbidden");
  
  const payload: any = { status };
  if (status === 'published') {
    payload.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from('magazine_issues').update(payload).eq('id', issue_id);
  if (error) throw error;

  await logGovernanceAction("UPDATE_MAGAZINE_STATUS", "magazine_issues", issue_id, { status });
  revalidatePath('/admin/magazine');
  revalidatePath(`/admin/magazine/builder/${issue_id}`);
  
  return true;
}
