"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAnyRole } from "@/lib/rbacService";
import { createClient } from "@/utils/supabase/server";
import {
  notifyUserPromotedEditor,
  notifyUserPromotedAdmin,
  notifyUserSuspended,
  notifyUserRestored,
} from "@/lib/notificationService";

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
  return await hasAnyRole(['founder']);
}

export async function getAdminUsersList(): Promise<AdminUserRecord[]> {
  console.log("Current User - Checking Authorization");
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) {
    console.error("Authorization Error: User lacks required roles for Admin Users List");
    return [];
  }
  console.log("Authorization: Success");

  const { data: profilesData, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, slug, name, avatar_url, created_at, status, role');

  if (profilesError) {
    console.error("Profiles Query Error", profilesError);
    return [];
  }
  
  const profiles = profilesData || [];

  console.table(
    profiles.map((p: any) => ({
      name: p.name,
      role: p.role,
      normalized: p.role?.trim().toLowerCase()
    }))
  );

  const adminRoles = ['founder', 'admin', 'editor'];
  
  const adminProfiles = profiles.filter((p: any) => {
    const normalizedRole = (p.role ?? "").trim().toLowerCase();
    return adminRoles.includes(normalizedRole);
  });

  let uniqueAdminProfilesMap = new Map();
  adminProfiles.forEach((p: any) => {
    if (!uniqueAdminProfilesMap.has(p.id)) {
      uniqueAdminProfilesMap.set(p.id, p);
    }
  });
  const uniqueAdminProfiles = Array.from(uniqueAdminProfilesMap.values());

  let authUsersMap: Record<string, string> = {};
  try {
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    if (authData?.users) {
      for (const u of authData.users) {
        authUsersMap[u.id] = u.email || "";
      }
    }
  } catch (e) {}

  return uniqueAdminProfiles.map((user: any) => {
    const email = authUsersMap[user.id] || "";
    const normalizedRole = (user.role ?? "").trim().toLowerCase();

    return {
      id: user.id,
      email: email,
      username: user.slug || email.split("@")[0] || "user",
      name: user.name || "User",
      avatar_url: user.avatar_url || "",
      created_at: user.created_at,
      status: user.status || "active",
      roles: [{ id: normalizedRole, name: user.role, slug: normalizedRole }]
    };
  });
}

export async function promoteUserToEditor(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized to promote users.' };

  const supabase = await createClient();
  
  const {
    data: { user }
  } = await supabase.auth.getUser();
  
  console.log("AUTH USER:", user);

  if (!user) {
    console.error("Server Action is executing without an authenticated session.");
    return { success: false, error: 'Unauthenticated session' };
  }

  const me = await supabase
    .from("profiles")
    .select("id,name,role")
    .eq("id", user.id)
    .single();

  console.log("CURRENT PROFILE:", me);

  if (me.data?.role?.toLowerCase() !== 'founder' && me.data?.role?.toLowerCase() !== 'admin') {
    console.error("RLS is denying the update. CURRENT PROFILE.role is not Founder/Admin.");
  }

  const profile = await supabase
    .from("profiles")
    .select("id,name,role")
    .eq("id", userId)
    .single();

  console.log("TARGET PROFILE:", profile);

  const result = await supabase
    .from("profiles")
    .update({
      role: 'Editor',
    })
    .eq("id", userId)
    .select();

  console.log(result.data);
  console.log(result.error);
  
  if (!result.data || result.data.length === 0) {
    throw new Error("Database update affected zero rows.");
  }

  // Notify: user promoted to editor
  const promotedName = result.data[0]?.name ?? userId;
  notifyUserPromotedEditor(userId, promotedName).catch(() => {});

  return { success: true };
}

export async function promoteUserToAdmin(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized to promote users.' };

  const supabase = await createClient();

  console.log("TARGET USER:", userId);
  console.log("ROLE:", 'admin');
  
  const {
    data: { user }
  } = await supabase.auth.getUser();
  
  console.log("AUTH USER:", user?.id);

  const result = await supabase
    .from("profiles")
    .update({
      role: 'Admin',
    })
    .eq("id", userId)
    .select();

  console.log(result.data);
  console.log(result.error);
  
  if (!result.data || result.data.length === 0) {
    throw new Error("Database update affected zero rows.");
  }

  // Notify: user promoted to admin
  const adminName = result.data[0]?.name ?? userId;
  notifyUserPromotedAdmin(userId, adminName).catch(() => {});

  return { success: true };
}

export async function changeEditorialRole(userId: string, newRole: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized to change roles.' };

  if (newRole === 'founder') {
      const isFounder = await checkIfCurrentUserIsFounder();
      if (!isFounder) return { success: false, error: 'Only Founders can assign the Founder role.' };
  }

  const supabase = await createClient();

  const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (targetProfile?.role?.toLowerCase() === 'founder') {
     return { success: false, error: 'Cannot change the role of a Founder.' };
  }

  console.log("TARGET USER:", userId);
  console.log("ROLE:", newRole);
  
  const {
    data: { user }
  } = await supabase.auth.getUser();
  
  console.log("AUTH USER:", user?.id);

  // Ensure role is correctly capitalized for the DB CHECK constraint
  const dbRole = newRole.charAt(0).toUpperCase() + newRole.slice(1).toLowerCase();

  const result = await supabase
    .from("profiles")
    .update({
      role: dbRole,
    })
    .eq("id", userId)
    .select();

  console.log(result.data);
  console.log(result.error);
  
  if (!result.data || result.data.length === 0) {
    throw new Error("Database update affected zero rows.");
  }

  return { success: true };
}

export async function removeEditorialRole(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized to remove roles.' };

  const supabase = await createClient();

  const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (targetProfile?.role?.toLowerCase() === 'founder') {
     return { success: false, error: 'Cannot change the role of a Founder.' };
  }

  console.log("TARGET USER:", userId);
  console.log("ROLE:", null);
  
  const {
    data: { user }
  } = await supabase.auth.getUser();
  
  console.log("AUTH USER:", user?.id);

  const result = await supabase
    .from("profiles")
    .update({
      role: 'Member',
    })
    .eq("id", userId)
    .select();

  console.log(result.data);
  console.log(result.error);
  
  if (!result.data || result.data.length === 0) {
    throw new Error("Database update affected zero rows.");
  }

  return { success: true };
}

export async function suspendUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized' };

  const { data: targetProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();
  if (targetProfile?.role?.toLowerCase() === 'founder') {
     return { success: false, error: 'Cannot suspend a Founder account.' };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '87600h' });
  if (error) return { success: false, error: 'Failed to suspend user' };

  await supabaseAdmin.from('profiles').update({ status: 'suspended' }).eq('id', userId);

  // Notify: user suspended
  const { data: suspProfile } = await supabaseAdmin.from('profiles').select('name').eq('id', userId).single();
  notifyUserSuspended(userId, suspProfile?.name ?? userId).catch(() => {});

  return { success: true };
}

export async function activateUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized' };

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
  if (error) return { success: false, error: 'Failed to activate user' };

  await supabaseAdmin.from('profiles').update({ status: 'active' }).eq('id', userId);

  // Notify: user restored
  const { data: restProfile } = await supabaseAdmin.from('profiles').select('name').eq('id', userId).single();
  notifyUserRestored(userId, restProfile?.name ?? userId).catch(() => {});

  return { success: true };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder']);
  if (!isAuthorized) return { success: false, error: 'Only founders can delete users' };

  const { data: targetProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();
  if (targetProfile?.role?.toLowerCase() === 'founder') {
     return { success: false, error: 'Cannot delete a Founder account.' };
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return { success: false, error: 'Failed to delete user' };

  return { success: true };
}

export async function resetStaffPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) return { success: false, error: 'Unauthorized to reset password' };

  const { data: targetProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();
  if (targetProfile?.role?.toLowerCase() === 'founder') {
    const isFounderActor = await hasAnyRole(['founder']);
    if (!isFounderActor) {
      return { success: false, error: 'Cannot reset a Founder account password.' };
    }
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { success: false, error: error.message || 'Failed to reset password' };

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
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) {
    console.error("Authorization Error: Unauthorized to access community users");
    return { data: [], count: 0 };
  }

  const adminRoles = ['founder', 'admin', 'editor'];

  // Fetch all profiles to find which ones are admins
  const { data: allProfiles, error: allProfilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, role');

  if (allProfilesError) {
    console.error("Profiles Query Error in getCommunityUsersList", allProfilesError);
    return { data: [], count: 0 };
  }

  let uniqueAdminIds: string[] = [];
  if (allProfiles) {
    uniqueAdminIds = allProfiles
      .filter((p: any) => adminRoles.includes((p.role ?? "").trim().toLowerCase()))
      .map((p: any) => p.id);
  }

  // Fetch Auth Users mapping to attach emails and search by email
  let authUsersMap: Record<string, string> = {};
  let userIdsMatchingEmail: string[] = [];
  try {
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    if (authData?.users) {
      for (const u of authData.users) {
        authUsersMap[u.id] = u.email || "";
        if (search && u.email?.toLowerCase().includes(search.toLowerCase())) {
           userIdsMatchingEmail.push(u.id);
        }
      }
    }
  } catch (e) {}

  let query = supabaseAdmin
    .from('profiles')
    .select('id, slug, name, avatar_url, status, created_at', { count: 'exact' });

  if (uniqueAdminIds.length > 0) {
    query = query.not('id', 'in', `(${uniqueAdminIds.join(',')})`);
  }

  if (search) {
    const s = `%${search}%`;
    if (userIdsMatchingEmail.length > 0) {
      query = query.or(`name.ilike.${s},slug.ilike.${s},id.in.(${userIdsMatchingEmail.join(',')})`);
    } else {
      query = query.or(`name.ilike.${s},slug.ilike.${s}`);
    }
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

  const mappedData = data?.map((user: any) => ({
    ...user,
    email: authUsersMap[user.id] || "",
    username: user.slug || user.name?.replace(/\s+/g, '').toLowerCase() || "user",
    roles: []
  })) || [];

  let uniqueDataMap = new Map();
  mappedData.forEach((user: any) => {
    if (!uniqueDataMap.has(user.id)) {
      uniqueDataMap.set(user.id, user);
    }
  });
  const uniqueMappedData = Array.from(uniqueDataMap.values());

  return {
    data: uniqueMappedData,
    count: count || 0
  };
}

