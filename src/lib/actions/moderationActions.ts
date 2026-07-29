"use server";

import { supabase } from "@/lib/supabaseClient";
import { hasAnyRole } from "@/lib/rbacService";
import { logGovernanceAction } from "./governanceAuditActions";
import { createNotification } from "./notificationActions";
import { notifyChaupalReportResolved, notifyChaupalPostRemoved } from "@/lib/notificationService";

export async function getOpenReports() {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .in('status', ['open', 'under_review'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Failed to fetch reports:", error);
    return [];
  }
  
  return data;
}

export async function moderateReport(
  reportId: string, 
  action: 'dismiss' | 'warn' | 'hide' | 'suspend' | 'escalate',
  notes: string
) {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) throw new Error("Unauthorized");

  // Fetch report details
  const { data: report } = await supabase.from('reports').select('*').eq('id', reportId).single();
  if (!report) throw new Error("Report not found");

  let newStatus = 'resolved';
  if (action === 'dismiss') newStatus = 'dismissed';
  if (action === 'escalate') newStatus = 'open'; // remains open but escalated via notes/audit

  // Update report
  await supabase.from('reports').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', reportId);

  // Implement the actual moderation action
  if (action === 'hide' && report.target_type === 'article') {
    await supabase.from('articles').update({ status: 'Archived' }).eq('id', report.target_id);
  } else if (action === 'hide' && report.target_type === 'comment') {
    await supabase.from('comments').update({ status: 'hidden' }).eq('id', report.target_id);
  } else if (action === 'warn' && report.target_type === 'user') {
    await createNotification(report.target_id, 'moderation_warning', 'Community Guideline Warning', `Your account has received a warning regarding recent activity. Note: ${notes}`);
  } else if (action === 'suspend' && report.target_type === 'user') {
    // Requires Admin client to suspend user, usually restricted to higher roles
    const isAdmin = await hasAnyRole(['founder', 'admin']);
    if (!isAdmin) throw new Error("Only Administrators can suspend users.");
    
    // In a real app: await supabaseAdmin.auth.admin.updateUserById(report.target_id, { ban_duration: '87600h' })
    await supabase.from('profiles').update({ status: 'suspended' }).eq('id', report.target_id);
    await createNotification(report.target_id, 'account_suspended', 'Account Suspended', `Your account has been suspended. Reason: ${notes}`);
  }

  // Log Audit
  await logGovernanceAction(
    `report_${action}`,
    'moderation',
    reportId,
    { target_type: report.target_type, target_id: report.target_id, notes }
  );

  // Notify: fire CMS notification based on action
  if (action === 'dismiss' || action === 'escalate') {
    notifyChaupalReportResolved(reportId).catch(() => {});
  } else if (action === 'hide') {
    notifyChaupalPostRemoved(report.target_id ?? reportId).catch(() => {});
  }

  return true;
}
