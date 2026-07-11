"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAnyRole } from "@/lib/rbacService";

export async function getPermissionsMatrix() {
  console.log("[DIAGNOSTICS] getPermissionsMatrix server action initiated");
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) {
    console.warn("[DIAGNOSTICS] getPermissionsMatrix: Unauthorized access attempt");
    throw new Error("Unauthorized to access permissions matrix");
  }

  // 1. Fetch all roles ordered by rank
  const { data: rolesData, error: rolesError } = await supabaseAdmin
    .from('roles')
    .select('*');

  if (rolesError || !rolesData) {
    console.error("[DIAGNOSTICS] getPermissionsMatrix: Error fetching roles:", rolesError);
    return { roles: [], permissions: [], matrix: {} };
  }

  // Define hardcoded rank for sorting (since DB doesn't have rank natively)
  const ROLE_HIERARCHY_RANK: Record<string, number> = {
    'founder': 0, 'admin': 1, 'editor': 2,
  };

  const sortedRoles = rolesData.sort((a: any, b: any) => 
    (ROLE_HIERARCHY_RANK[a.slug] ?? 999) - (ROLE_HIERARCHY_RANK[b.slug] ?? 999)
  );

  // 2. Fetch all permissions
  const { data: permissionsData, error: permError } = await supabaseAdmin
    .from('permissions')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (permError || !permissionsData) {
    console.error("[DIAGNOSTICS] getPermissionsMatrix: Error fetching permissions:", permError);
    return { roles: sortedRoles, permissions: [], matrix: {} };
  }

  // 3. Fetch role_permissions mapping
  const { data: rolePermsData, error: rpError } = await supabaseAdmin
    .from('role_permissions')
    .select('role_id, permission_id');

  if (rpError || !rolePermsData) {
    console.error("[DIAGNOSTICS] getPermissionsMatrix: Error fetching role_permissions:", rpError);
    return { roles: sortedRoles, permissions: permissionsData, matrix: {} };
  }

  // 4. Build Matrix [permission_id][role_id] = boolean
  const matrix: Record<string, Record<string, boolean>> = {};
  
  permissionsData.forEach((p: any) => {
    matrix[p.id] = {};
    sortedRoles.forEach((r: any) => {
      matrix[p.id][r.id] = false;
    });
  });

  rolePermsData.forEach((rp: any) => {
    if (matrix[rp.permission_id]) {
      matrix[rp.permission_id][rp.role_id] = true;
    }
  });

  console.log(`[DIAGNOSTICS] getPermissionsMatrix: Returning matrix for ${sortedRoles.length} roles and ${permissionsData.length} permissions`);

  return {
    roles: sortedRoles,
    permissions: permissionsData,
    matrix
  };
}
