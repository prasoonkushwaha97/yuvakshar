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
  article_count?: number;
};

export async function checkIfCurrentUserIsFounder(): Promise<boolean> {
  return await hasAnyRole(['founder', 'co_founder']);
}

export async function getAdminUsersList(): Promise<AdminUserRecord[]> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    throw new Error("Unauthorized to access user management");
  }

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
  }

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

export async function createAdminMember(email: string, name: string, username: string, password: string, roleSlug: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized to create staff' };

  if (roleSlug === 'founder') {
    const isFounder = await checkIfCurrentUserIsFounder();
    if (!isFounder) return { success: false, error: 'Only Founders can create Founder accounts' };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, username }
  });

  if (error || !data.user) {
    console.error("Error creating staff:", error);
    return { success: false, error: error?.message || 'Failed to create staff' };
  }

  const userId = data.user.id;

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    email,
    name: name,
    username: username,
    status: 'active'
  });

  if (profileError) {
    console.error("Error creating profile:", profileError);
  }

  const { data: roleData } = await supabaseAdmin.from('roles').select('id').eq('slug', roleSlug).single();
  if (roleData) {
    await supabaseAdmin.from('user_roles').insert({
      user_id: userId,
      role_id: roleData.id
    });
  }

  return { success: true };
}

export async function suspendUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized' };

  const { data: roleData } = await supabaseAdmin.from('user_roles').select('roles(slug)').eq('user_id', userId);
    
  if (roleData && roleData.some((r: any) => r.roles?.slug === 'founder')) {
    return { success: false, error: 'Cannot suspend a Founder account.' };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: '87600h'
  });

  if (error) {
    console.error("Error suspending user:", error);
    return { success: false, error: 'Failed to suspend user' };
  }

  await supabaseAdmin.from('profiles').update({ status: 'suspended' }).eq('id', userId);

  return { success: true };
}

export async function activateUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized' };

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: 'none'
  });

  if (error) {
    console.error("Error activating user:", error);
    return { success: false, error: 'Failed to activate user' };
  }

  await supabaseAdmin.from('profiles').update({ status: 'active' }).eq('id', userId);

  return { success: true };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder']);
  if (!isAuthorized) return { success: false, error: 'Only founders can delete users' };

  const { data: roleData } = await supabaseAdmin.from('user_roles').select('roles(slug)').eq('user_id', userId);
    
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

export async function resetStaffPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized to reset password' };

  const { data: roleData } = await supabaseAdmin.from('user_roles').select('roles(slug)').eq('user_id', userId);
    
  if (roleData && roleData.some((r: any) => r.roles?.slug === 'founder')) {
    const isFounderActor = await hasAnyRole(['founder']);
    if (!isFounderActor) {
      return { success: false, error: 'Cannot reset a Founder account password.' };
    }
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword
  });

  if (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: error.message || 'Failed to reset password' };
  }

  return { success: true };
}

export async function getCommunityUsersList({
  page = 1,
  perPage = 20,
  search = '',
  statusFilter = 'All',
  sort = 'newest'
}: {
  page?: number;
  perPage?: number;
  search?: string;
  statusFilter?: string;
  sort?: string;
}) {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin', 'editor', 'managing_editor']);
  if (!isAuthorized) {
    throw new Error("Unauthorized to access community users");
  }

  const { data: adminRoles, error: rolesError } = await supabaseAdmin.from('user_roles').select('user_id');
  if (rolesError) {
    console.error("Error fetching admin roles:", rolesError);
    throw new Error("Failed to fetch community users");
  }

  const adminIds = adminRoles.map((r: any) => r.user_id);
  const uniqueAdminIds = Array.from(new Set(adminIds));

  let query = supabaseAdmin
    .from('profiles')
    .select('id, email, name, username, avatar_url, status, created_at', { count: 'exact' });

  if (uniqueAdminIds.length > 0) {
    query = query.not('id', 'in', `(${uniqueAdminIds.join(',')})`);
  }

  if (search) {
    const s = `%${search}%`;
    query = query.or(`name.ilike.${s},email.ilike.${s},username.ilike.${s}`);
  }

  if (statusFilter !== 'All') {
    query = query.eq('status', statusFilter.toLowerCase());
  }

  if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const start = (page - 1) * perPage;
  const end = start + perPage - 1;
  query = query.range(start, end);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching community users:", error);
    throw new Error("Failed to retrieve community users list");
  }

  return {
    data: data || [],
    count: count || 0
  };
}

