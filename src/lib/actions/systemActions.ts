"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAnyRole } from "@/lib/rbacService";

export async function getSystemMetrics() {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    throw new Error("Unauthorized to access system metrics");
  }

  // 1. Total Users
  let totalUsers = 0;
  try {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
    totalUsers = (data as any)?.total || 0;
  } catch (e) {
    console.error("Failed to fetch total users count:", e);
  }

  // 2. Active Roles Assigned
  const { count: rolesCount } = await supabaseAdmin
    .from('user_roles')
    .select('*', { count: 'exact', head: true });

  // 3. Total Audit Events
  const { count: auditCount } = await supabaseAdmin
    .from('role_assignment_logs')
    .select('*', { count: 'exact', head: true });

  let publishedCount = 0;
  try {
    const { count } = await supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'Published');
    publishedCount = count || 0;
  } catch (e) {}

  let pendingReviewsCount = 0;
  try {
    const { count } = await supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).in('status', ['Submitted', 'Revision Requested', 'Under Review']);
    pendingReviewsCount = count || 0;
  } catch (e) {}

  let reportsCount = 0;
  try {
    const { count } = await supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }).ilike('status', 'open');
    reportsCount = count || 0;
  } catch (e) {}

  return {
    totalUsers: totalUsers,
    activeRolesAssigned: rolesCount || 0,
    auditEvents: auditCount || 0,
    publishedArticles: publishedCount,
    pendingReviews: pendingReviewsCount,
    openReports: reportsCount,
  };
}

export async function getFounderDashboardStats() {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    throw new Error("Unauthorized to access founder dashboard stats");
  }

  let totalUsers = 0;
  try {
    const { count } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
    totalUsers = count || 0;
  } catch (e) {
    console.error("Failed to fetch total users count:", e);
  }

  let totalArticles = 0;
  let pendingReviews = 0;
  try {
    const { count: articles } = await supabaseAdmin.from('articles').select('*', { count: 'exact', head: true });
    totalArticles = articles || 0;
    
    const { count: pending } = await supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).in('status', ['Submitted', 'Revision Requested', 'Under Review']);
    pendingReviews = pending || 0;
  } catch (e) {
    console.error("Failed to fetch articles count:", e);
  }

  let totalCommunities = 0;
  try {
    const { count } = await supabaseAdmin.from('communities').select('*', { count: 'exact', head: true });
    totalCommunities = count || 0;
  } catch (e) {
    console.error("Failed to fetch communities count:", e);
  }

  let totalComments = 0;
  try {
    const { count } = await supabaseAdmin.from('comments').select('*', { count: 'exact', head: true });
    totalComments = count || 0;
  } catch (e) {
    console.error("Failed to fetch comments count:", e);
  }

  let totalAuditEvents = 0;
  try {
    const { count } = await supabaseAdmin.from('role_assignment_logs').select('*', { count: 'exact', head: true });
    totalAuditEvents = count || 0;
  } catch (e) {
    console.error("Failed to fetch audit events count:", e);
  }

  return {
    totalUsers,
    totalArticles,
    totalCommunities,
    totalComments,
    totalAuditEvents,
    pendingReviews,
  };
}
