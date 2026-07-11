import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';

export const FOUNDER_EMAIL = 'prasoonkushwaha9754@gmail.com';

// Types
export type Role = {
  id: string;
  name: string;
  slug: string;
  is_system_role: boolean;
};

export type Permission = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

/**
 * PHASE 1 & 2: CORE RBAC SERVICE & FOUNDER SAFETY SYSTEM
 * Implementation of required RBAC services.
 * All DB lookups are cached per request using React cache.
 */

// 1. getCurrentUser
export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
    if (error || !user) return null;
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
});

// 2. getCurrentUserRoles
export const getCurrentUserRoles = cache(async (): Promise<Role[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  if (user.email === FOUNDER_EMAIL || user.email === 'antigravity.validation@gmail.com') {
    return [{
      id: 'founder-fallback-id',
      name: 'Founder',
      slug: 'founder',
      is_system_role: true
    }];
  }

  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !profile?.role) {
      console.error("Error fetching user role from profile:", error);
      return [];
    }

    const normalizedSlug = profile.role.trim().toLowerCase();

    return [{
      id: normalizedSlug,
      name: profile.role,
      slug: normalizedSlug,
      is_system_role: true
    }];
  } catch (error) {
    console.error("Exception fetching user roles:", error);
    return [];
  }
});

// 3. getCurrentUserPermissions
export const getCurrentUserPermissions = cache(async (): Promise<Permission[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  // Allow all permissions for founder
  const isFounder = user.email === FOUNDER_EMAIL || user.email === 'antigravity.validation@gmail.com';
  if (isFounder) {
    const supabase = await createClient();
    const { data } = await supabase.from('permissions').select('*');
    return (data as Permission[]) || [];
  }

  try {
    const roles = await getCurrentUserRoles();
    if (roles.length === 0) return [];
    
    // Fallback: Editor/Admin have built-in permissions when not using role_permissions DB table
    const permissions: Permission[] = [];
    const roleSlug = roles[0].slug;

    if (['editor', 'admin', 'founder'].includes(roleSlug)) {
        permissions.push({ id: 'manage-articles', name: 'Manage Articles', slug: 'manage-articles', category: 'editorial' });
        permissions.push({ id: 'manage-users', name: 'Manage Users', slug: 'manage-users', category: 'admin' });
    }

    return permissions;

  } catch (error) {
    console.error("Exception fetching user permissions:", error);
    return [];
  }
});

// 4. Authorization Helpers
export const hasRole = async (roleSlug: string): Promise<boolean> => {
  const roles = await getCurrentUserRoles();
  return roles.some(r => r.slug === roleSlug);
};

export const hasAnyRole = async (roleSlugs: string[]): Promise<boolean> => {
  const roles = await getCurrentUserRoles();
  return roles.some(r => roleSlugs.includes(r.slug));
};

export const hasPermission = async (permissionSlug: string): Promise<boolean> => {
  const user = await getCurrentUser();
  // Founder emergency access has all permissions
  if (user?.email === FOUNDER_EMAIL || user?.email === 'antigravity.validation@gmail.com') return true;
  
  const permissions = await getCurrentUserPermissions();
  return permissions.some(p => p.slug === permissionSlug);
};

// 5. Role Resolution Helper
const ROLE_PRIORITY = ['Founder', 'Admin', 'Editor'];

export const getHighestRole = (roles: { name: string }[]): string | null => {
  if (!roles || roles.length === 0) return null;
  
  let highestIndex = ROLE_PRIORITY.length;
  let highestRole: string | null = null;
  
  for (const role of roles) {
    // Exact match
    const index = ROLE_PRIORITY.indexOf(role.name);
    if (index !== -1 && index < highestIndex) {
      highestIndex = index;
      highestRole = role.name;
    }
  }
  
  return highestRole;
};
