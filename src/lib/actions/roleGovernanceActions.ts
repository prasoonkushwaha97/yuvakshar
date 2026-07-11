"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAnyRole } from "@/lib/rbacService";

export async function getRoleGovernanceData() {
  console.log("[DIAGNOSTICS] getRoleGovernanceData server action initiated");
  const isAuthorized = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorized) {
    console.warn("[DIAGNOSTICS] getRoleGovernanceData: Unauthorized access attempt");
    throw new Error("Unauthorized to access role governance");
  }

  // Fetch all roles
  const { data: roles, error: rolesError } = await supabaseAdmin
    .from('roles')
    .select('*');

  if (rolesError || !roles) {
    console.error("[DIAGNOSTICS] getRoleGovernanceData: Error fetching roles:", rolesError);
    return [];
  }

  // Fetch member counts from user_roles
  const { data: countsData, error: countsError } = await supabaseAdmin
    .from('user_roles')
    .select('role_id');

  if (countsError) {
    console.error("[DIAGNOSTICS] getRoleGovernanceData: Error fetching member counts:", countsError);
  }

  const countsMap: Record<string, number> = {};
  if (countsData) {
    countsData.forEach((row: any) => {
      countsMap[row.role_id] = (countsMap[row.role_id] || 0) + 1;
    });
  }

  const ROLE_HIERARCHY_RANK: Record<string, number> = {
    'founder': 0, 'admin': 1, 'editor': 2,
  };

  const result = roles.map((r: any) => ({
    ...r,
    rank: ROLE_HIERARCHY_RANK[r.slug] ?? 999,
    member_count: countsMap[r.id] || 0
  })).sort((a: any, b: any) => a.rank - b.rank);

  console.log(`[DIAGNOSTICS] getRoleGovernanceData: Returning ${result.length} mapped roles`);
  return result;
}
