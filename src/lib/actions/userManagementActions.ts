"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAnyRole } from "@/lib/rbacService";

export type AdminUserRecord = {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar_url: string;
  created_at: string;
  last_sign_in_at?: string;
  status?: string;
  roles: { id: string; name: string; slug: string }[];
};

export async function getAdminUsersList(): Promise<AdminUserRecord[]> {
  // 1. Authorization: Only Founder, Co-Founder, Super Admin, and Admin can view the list
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    throw new Error("Unauthorized to access user management");
  }

  // 2. Fetch users directly from auth.users (requires SERVICE_ROLE)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (authError) {
    console.error("Error fetching auth users:", authError);
    throw new Error("Failed to retrieve users list");
  }

  if (!authData || !authData.users) {
    return [];
  }

  // 3. Fetch user roles in a single batch query
  const userIds = authData.users.map((u: any) => u.id);
  
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('user_roles')
    .select(`
      user_id,
      roles (
        id,
        name,
        slug
      )
    `)
    .in('user_id', userIds);

  if (roleError) {
    console.error("Error fetching user roles:", roleError);
    // Proceed without roles rather than failing entirely, but it's risky
  }

  // Map roles by user_id
  const rolesMap: Record<string, { id: string; name: string; slug: string }[]> = {};
  if (roleData) {
    for (const row of roleData) {
      if (!rolesMap[row.user_id]) {
        rolesMap[row.user_id] = [];
      }
      if (row.roles) {
        rolesMap[row.user_id].push(row.roles as unknown as { id: string; name: string; slug: string });
      }
    }
  }

  // 4. Sanitize and combine data
  return authData.users.map((u: any) => ({
    id: u.id,
    email: u.email || "",
    username: u.user_metadata?.username || u.email?.split("@")[0] || "user",
    name: u.user_metadata?.name || u.email?.split("@")[0] || "User",
    avatar_url: u.user_metadata?.avatar_url || "",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at || undefined,
    status: u.banned_until ? "suspended" : "active",
    roles: rolesMap[u.id] || []
  }));
}

export async function suspendUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized' };

  // Verify target is not a founder
  const { data: roleData } = await supabaseAdmin.from('user_roles')
    .select('roles(slug)')
    .eq('user_id', userId);
    
  if (roleData && roleData.some((r: any) => r.roles?.slug === 'founder')) {
    return { success: false, error: 'Cannot suspend a Founder account.' };
  }

  // Set ban_duration to roughly 10 years (effectively suspended)
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: '87600h'
  });

  if (error) {
    console.error("Error suspending user:", error);
    return { success: false, error: 'Failed to suspend user' };
  }

  return { success: true };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder']);
  if (!isAuthorized) return { success: false, error: 'Only founders can delete users' };

  // Verify target is not a founder
  const { data: roleData } = await supabaseAdmin.from('user_roles')
    .select('roles(slug)')
    .eq('user_id', userId);
    
  if (roleData && roleData.some((r: any) => r.roles?.slug === 'founder')) {
    return { success: false, error: 'Cannot delete a Founder account.' };
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: 'Failed to delete user' };
  }

  return { success: true };
}
