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
  console.log("Current User - Checking Authorization");
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    console.error("Authorization Error: User lacks required roles for Admin Users List");
    return [];
  }
  console.log("Authorization: Success");

  const adminSlugs = ['founder', 'co_founder', 'super_admin', 'admin', 'eic', 'managing_editor', 'editor'];
  
  const { data: rolesData, error: rolesError } = await supabaseAdmin.from('roles').select('id, slug').in('slug', adminSlugs);
  if (rolesError) {
    console.error("Roles Error", rolesError);
    return [];
  }
  const roleIds = rolesData?.map((r: any) => r.id) || [];
  console.log("Role IDs", roleIds);
  
  const { data: userRolesData, error: userRolesError } = await supabaseAdmin.from('user_roles').select('user_id').in('role_id', roleIds);
  if (userRolesError) {
    console.error("User Roles Error", userRolesError);
    return [];
  }
  const adminUserIds = Array.from(new Set(userRolesData?.map((ur: any) => ur.user_id) || []));
  console.log("Admin User IDs", adminUserIds);
  
  if (adminUserIds.length === 0) return [];
  
  // Fix: Removed nested select due to missing direct FK relationship between profiles and user_roles.
  // Replaced with safer multi-query approach.
  const { data: profilesData, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, username, name, avatar_url, created_at, status')
    .in('id', adminUserIds);

  if (profilesError) {
    console.error("Profiles Query Error", profilesError);
    return [];
  }
  
  console.log("Profiles Count", profilesData?.length || 0);

  // Fetch roles independently and map them in JS
  const { data: allUserRoles, error: allRolesError } = await supabaseAdmin
    .from('user_roles')
    .select(`
      user_id,
      roles ( id, name, slug )
    `)
    .in('user_id', adminUserIds);

  if (allRolesError) {
    console.error("All User Roles Query Error", allRolesError);
  }

  const userRolesMap: Record<string, any[]> = {};
  if (allUserRoles) {
    for (const ur of allUserRoles) {
      if (ur.roles) {
        if (!userRolesMap[ur.user_id]) userRolesMap[ur.user_id] = [];
        if (Array.isArray(ur.roles)) {
          userRolesMap[ur.user_id].push(...ur.roles);
        } else {
          userRolesMap[ur.user_id].push(ur.roles);
        }
      }
    }
  }

  return profilesData.map((user: any) => {
    const roles = userRolesMap[user.id] || [];

    return {
      id: user.id,
      email: user.email || "",
      username: user.username || user.email?.split("@")[0] || "user",
      name: user.name || user.email?.split("@")[0] || "User",
      avatar_url: user.avatar_url || "",
      created_at: user.created_at,
      status: user.status || "active",
      roles: roles
    };
  });
}

export async function createAdminMember(email: string, name: string, username: string, password: string, roleSlug: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    console.error("Authorization Error: Unauthorized to create staff");
    return { success: false, error: 'Unauthorized to create staff' };
  }

  if (roleSlug === 'founder') {
    const isFounder = await checkIfCurrentUserIsFounder();
    if (!isFounder) {
      console.error("Authorization Error: Only Founders can create Founder accounts");
      return { success: false, error: 'Only Founders can create Founder accounts' };
    }
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, username }
  });

  if (error || !data.user) {
    console.error("Auth Create User Error", error);
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
    console.error("Profiles Insert Error", profileError);
  }

  const { data: roleData, error: roleError } = await supabaseAdmin.from('roles').select('id').eq('slug', roleSlug).single();
  if (roleError) {
    console.error("Role Select Error", roleError);
  }
  
  if (roleData) {
    const { error: urError } = await supabaseAdmin.from('user_roles').insert({
      user_id: userId,
      role_id: roleData.id
    });
    if (urError) {
      console.error("User Roles Insert Error", urError);
    }
  }

  return { success: true };
}

export async function suspendUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    console.error("Authorization Error: Unauthorized to suspend user");
    return { success: false, error: 'Unauthorized' };
  }

  const { data: roleData, error: roleError } = await supabaseAdmin.from('user_roles').select('roles(slug)').eq('user_id', userId);
  if (roleError) {
    console.error("User Roles Query Error in suspendUser", roleError);
  }
    
  if (roleData && roleData.some((r: any) => r.roles?.slug === 'founder')) {
    return { success: false, error: 'Cannot suspend a Founder account.' };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: '87600h'
  });

  if (error) {
    console.error("Auth Suspend Error", error);
    return { success: false, error: 'Failed to suspend user' };
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').update({ status: 'suspended' }).eq('id', userId);
  if (profileError) {
    console.error("Profiles Update Error in suspendUser", profileError);
  }

  return { success: true };
}

export async function activateUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    console.error("Authorization Error: Unauthorized to activate user");
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: 'none'
  });

  if (error) {
    console.error("Auth Activate Error", error);
    return { success: false, error: 'Failed to activate user' };
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').update({ status: 'active' }).eq('id', userId);
  if (profileError) {
    console.error("Profiles Update Error in activateUser", profileError);
  }

  return { success: true };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder']);
  if (!isAuthorized) {
    console.error("Authorization Error: Only founders can delete users");
    return { success: false, error: 'Only founders can delete users' };
  }

  const { data: roleData, error: roleError } = await supabaseAdmin.from('user_roles').select('roles(slug)').eq('user_id', userId);
  if (roleError) {
    console.error("User Roles Query Error in deleteUser", roleError);
  }
    
  if (roleData && roleData.some((r: any) => r.roles?.slug === 'founder')) {
    return { success: false, error: 'Cannot delete a Founder account.' };
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Auth Delete Error", error);
    return { success: false, error: 'Failed to delete user' };
  }

  return { success: true };
}

export async function resetStaffPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    console.error("Authorization Error: Unauthorized to reset password");
    return { success: false, error: 'Unauthorized to reset password' };
  }

  const { data: roleData, error: roleError } = await supabaseAdmin.from('user_roles').select('roles(slug)').eq('user_id', userId);
  if (roleError) {
    console.error("User Roles Query Error in resetStaffPassword", roleError);
  }
    
  if (roleData && roleData.some((r: any) => r.roles?.slug === 'founder')) {
    const isFounderActor = await hasAnyRole(['founder']);
    if (!isFounderActor) {
      console.error("Authorization Error: Cannot reset a Founder account password.");
      return { success: false, error: 'Cannot reset a Founder account password.' };
    }
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword
  });

  if (error) {
    console.error("Auth Update Password Error", error);
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
    console.error("Authorization Error: Unauthorized to access community users");
    return { data: [], count: 0 };
  }

  const { data: adminRoles, error: rolesError } = await supabaseAdmin.from('user_roles').select('user_id');
  if (rolesError) {
    console.error("User Roles Query Error in getCommunityUsersList", rolesError);
    return { data: [], count: 0 };
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
    console.error("Profiles Query Error in getCommunityUsersList", error);
    return { data: [], count: 0 };
  }

  return {
    data: data || [],
    count: count || 0
  };
}

