"use server";

import { supabase } from "@/lib/supabaseClient";
import { hasAnyRole } from "@/lib/rbacService";

export async function getAuditLogsForUser(userId: string) {
  // 1. Authorization: Only Founder, Co-Founder, Super Admin, and Admin can view audit logs
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    throw new Error("Unauthorized to access audit logs");
  }

  const { data, error } = await supabase
    .from('role_assignment_logs')
    .select(`
      id,
      action,
      notes,
      created_at,
      roles ( id, name, slug ),
      performed_by_user:performed_by ( id )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }

  return data || [];
}

export async function getGlobalAuditLogs() {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    throw new Error("Unauthorized to access audit logs");
  }

  const { data, error } = await supabase
    .from('role_assignment_logs')
    .select(`
      id,
      action,
      notes,
      created_at,
      roles ( id, name, slug ),
      target_user:user_id,
      performed_by_user:performed_by
    `)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error || !data) {
    console.error("Error fetching global audit logs:", error);
    return [];
  }

  // Need to import supabaseAdmin dynamically to avoid edge runtime issues if not configured, or statically if safe.
  // We'll use the static import from userManagementActions.
  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');

  // Fetch users for target_user and performed_by
  const userIds = new Set<string>();
  data.forEach(log => {
    if (log.target_user) userIds.add(log.target_user as unknown as string);
    if (log.performed_by_user) userIds.add(log.performed_by_user as unknown as string);
  });

  let usersMap: Record<string, any> = {};
  
  if (userIds.size > 0) {
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    if (authData?.users) {
      usersMap = authData.users.reduce((acc, user) => {
        acc[user.id] = {
          email: user.email,
          username: user.user_metadata?.username || user.email?.split('@')[0],
          name: user.user_metadata?.name || user.email?.split('@')[0],
        };
        return acc;
      }, {} as Record<string, any>);
    }
  }

  return data.map(log => ({
    ...log,
    target_user_details: usersMap[log.target_user as unknown as string] || { name: 'Unknown User', email: 'unknown' },
    performed_by_details: usersMap[log.performed_by_user as unknown as string] || { name: 'Unknown User', email: 'unknown' }
  }));
}
