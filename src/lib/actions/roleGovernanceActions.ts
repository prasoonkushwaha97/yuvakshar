"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAnyRole } from "@/lib/rbacService";

export async function getRoleGovernanceData() {
  const isAuthorized = await hasAnyRole(['founder', 'co_founder', 'super_admin', 'admin']);
  if (!isAuthorized) {
    throw new Error("Unauthorized to access role governance");
  }

  // Fetch all roles
  const { data: roles, error: rolesError } = await supabaseAdmin
    .from('roles')
    .select('*');

  if (rolesError || !roles) {
    console.error("Error fetching roles:", rolesError);
    return [];
  }

  // Fetch member counts from user_roles
  const { data: countsData, error: countsError } = await supabaseAdmin
    .from('user_roles')
    .select('role_id');

  if (countsError) {
    console.error("Error fetching member counts:", countsError);
  }

  const countsMap: Record<string, number> = {};
  if (countsData) {
    countsData.forEach((row: any) => {
      countsMap[row.role_id] = (countsMap[row.role_id] || 0) + 1;
    });
  }

  const ROLE_HIERARCHY_RANK: Record<string, number> = {
    'founder': 0, 'co_founder': 1, 'super_admin': 2, 'admin': 3,
    'editor_in_chief': 4, 'editor': 5, 'moderator': 6, 'reviewer': 7,
  };

  return roles.map((r: any) => ({
    ...r,
    rank: ROLE_HIERARCHY_RANK[r.slug] ?? 999,
    member_count: countsMap[r.id] || 0
  })).sort((a: any, b: any) => a.rank - b.rank);
}
