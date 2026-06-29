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

  // PHASE 2: FOUNDER SAFETY SYSTEM (Fallback Mechanism)
  if (user.email === FOUNDER_EMAIL) {
    return [{
      id: 'founder-fallback-id',
      name: 'Founder',
      slug: 'founder',
      is_system_role: true
    }];
  }

  try {
    const supabase = await createClient();
    // Resolve user_roles -> roles
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles (
          id,
          name,
          slug,
          is_system_role
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }

    // Extract roles from the join
    const roles: Role[] = [];
    if (data) {
      for (const item of data) {
        if (item.roles) {
          if (Array.isArray(item.roles)) {
            roles.push(...(item.roles as Role[]));
          } else {
            roles.push(item.roles as Role);
          }
        }
      }
    }
    return roles;
  } catch (error) {
    console.error("Exception fetching user roles:", error);
    return [];
  }
});

// 3. getCurrentUserPermissions
export const getCurrentUserPermissions = cache(async (): Promise<Permission[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  // PHASE 2: FOUNDER SAFETY SYSTEM (Fallback)
  if (user.email === FOUNDER_EMAIL) {
    const supabase = await createClient();
    // Fetch all permissions for the emergency founder
    const { data } = await supabase.from('permissions').select('*');
    return (data as Permission[]) || [];
  }

  try {
    const roles = await getCurrentUserRoles();
    if (roles.length === 0) return [];
    
    const roleIds = roles.map(r => r.id);
    
    const supabase = await createClient();
    // Resolve: user_roles -> role_permissions -> permissions
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          id,
          name,
          slug,
          category
        )
      `)
      .in('role_id', roleIds);

    if (error) {
      console.error("Error fetching user permissions:", error);
      return [];
    }

    const permissions: Permission[] = [];
    if (data) {
      for (const item of data) {
        if (item.permissions) {
          if (Array.isArray(item.permissions)) {
            permissions.push(...(item.permissions as Permission[]));
          } else {
            permissions.push(item.permissions as Permission);
          }
        }
      }
    }
    
    // Deduplicate permissions by slug
    const uniquePermissions: Permission[] = [];
    const seen = new Set<string>();
    for (const p of permissions) {
      if (!seen.has(p.slug)) {
        seen.add(p.slug);
        uniquePermissions.push(p);
      }
    }
    
    return uniquePermissions;

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
  if (user?.email === FOUNDER_EMAIL) return true;
  
  const permissions = await getCurrentUserPermissions();
  return permissions.some(p => p.slug === permissionSlug);
};

// 5. Role Resolution Helper
const ROLE_PRIORITY = ['Founder', 'Admin', 'Moderator', 'Editor', 'Author', 'Member'];

export const getHighestRole = (roles: { name: string }[]): string => {
  if (!roles || roles.length === 0) return 'Member';
  
  let highestIndex = ROLE_PRIORITY.length;
  let highestRole = 'Member';
  
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
