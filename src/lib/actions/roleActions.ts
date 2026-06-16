"use server";

import { createClient } from '@/utils/supabase/server';
import { getCurrentUser, getCurrentUserRoles, FOUNDER_EMAIL, Role } from '@/lib/rbacService';

// Define the exact role hierarchy for management enforcement
// Lower number means higher authority.
const ROLE_HIERARCHY_RANK: Record<string, number> = {
  'founder': 0,
  'co_founder': 1,
  'super_admin': 2,
  'admin': 3,
  'editor_in_chief': 4,
  'editor': 5,
  'moderator': 6,
  'reviewer': 7,
};

type ActionResponse = {
  success: boolean;
  error?: string;
};

// Helper: Determine the highest rank (lowest number) of the current user
async function getHighestRank(roles: Role[], email: string | undefined): Promise<number> {
  if (email === FOUNDER_EMAIL) return 0;
  if (roles.length === 0) return 999;
  
  return Math.min(...roles.map(r => ROLE_HIERARCHY_RANK[r.slug] ?? 999));
}

// Helper: Check if user has management authority over a target role slug
function canManageTargetRole(actorRank: number, targetRoleSlug: string): boolean {
  const targetRank = ROLE_HIERARCHY_RANK[targetRoleSlug] ?? 999;
  
  // Rule: Founder (0) can manage everyone
  if (actorRank === 0) return true;
  
  // Rule: Protected roles (Founder, Co-Founder, Super Admin)
  // Non-founders cannot grant/remove founder.
  if (targetRoleSlug === 'founder' && actorRank !== 0) return false;
  
  // Rule: Higher roles can manage lower roles (actorRank < targetRank). 
  // Cannot manage equal or higher roles.
  return actorRank < targetRank;
}

// Helper: Check if the actor can manage the target user's existing roles
async function canManageTargetUser(actorRank: number, targetUserId: string): Promise<boolean> {
  if (actorRank === 0) return true;
  
  const supabase = await createClient();
  const { data } = await supabase.from('user_roles').select('roles(slug)').eq('user_id', targetUserId);
  const targetRoles = data?.map((d: any) => Array.isArray(d.roles) ? d.roles[0]?.slug : d.roles?.slug).filter(Boolean) || [];
  
  if (targetRoles.length === 0) return true; // Target has no roles
  
  const targetHighestRank = Math.min(...targetRoles.map(slug => ROLE_HIERARCHY_RANK[slug] ?? 999));
  
  return actorRank < targetHighestRank;
}

/**
 * Get all available roles from the database.
 */
export async function getRolesList(): Promise<Role[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('roles').select('*');
  if (error) {
    console.error("Error fetching roles from DB:", error.message);
    return [];
  }
  return data || [];
}

/**
 * Assign a role to a user.
 */
export async function assignRole(targetUserId: string, roleId: string, notes?: string): Promise<ActionResponse> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthenticated.' };
  
  // Self-modification protection
  if (actor.id === targetUserId && actor.email !== FOUNDER_EMAIL) {
    return { success: false, error: 'You cannot modify your own roles to prevent self-destruction.' };
  }
  
  const actorRoles = await getCurrentUserRoles();
  const actorRank = await getHighestRank(actorRoles, actor.email);

  const supabase = await createClient();

  // 1. Verify target role exists
  const { data: roleData, error: roleError } = await supabase.from('roles').select('*').eq('id', roleId).single();
  if (roleError || !roleData) return { success: false, error: 'Target role does not exist.' };

  // 2. Verify hierarchy rules
  if (!canManageTargetRole(actorRank, roleData.slug)) {
    return { success: false, error: 'Hierarchy Violation: You do not have authority to assign this role.' };
  }
  
  if (!(await canManageTargetUser(actorRank, targetUserId))) {
    return { success: false, error: 'Hierarchy Violation: You do not have authority to modify this user.' };
  }

  // 3. Verify role not already assigned
  const { data: existing } = await supabase.from('user_roles')
    .select('user_id')
    .eq('user_id', targetUserId)
    .eq('role_id', roleId)
    .single();

  if (existing) {
    return { success: false, error: 'Role is already assigned to this user.' };
  }

  // 4. Execute Assignment
  const { error: insertError } = await supabase.from('user_roles').insert({
    user_id: targetUserId,
    role_id: roleId,
  });

  if (insertError) {
    // Check if it's a foreign key violation for the user_id (target user does not exist)
    if (insertError.code === '23503') {
       return { success: false, error: 'Target user does not exist.' };
    }
    return { success: false, error: 'Database error assigning role.' };
  }

  // 5. Write Audit Log
  await supabase.from('role_assignment_logs').insert({
    user_id: targetUserId,
    role_id: roleId,
    action: 'assign',
    performed_by: actor.id,
    notes: notes || 'Assigned via Founder Workspace'
  });

  return { success: true };
}

/**
 * Remove a role from a user.
 */
export async function removeRole(targetUserId: string, roleId: string, notes?: string): Promise<ActionResponse> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthenticated.' };
  
  // Self-modification protection
  if (actor.id === targetUserId && actor.email !== FOUNDER_EMAIL) {
    return { success: false, error: 'You cannot modify your own roles to prevent self-destruction.' };
  }
  
  const actorRoles = await getCurrentUserRoles();
  const actorRank = await getHighestRank(actorRoles, actor.email);

  const supabase = await createClient();

  // 1. Verify target role exists
  const { data: roleData } = await supabase.from('roles').select('*').eq('id', roleId).single();
  if (!roleData) return { success: false, error: 'Target role does not exist.' };

  // 2. Verify hierarchy rules
  if (!canManageTargetRole(actorRank, roleData.slug)) {
    return { success: false, error: 'Hierarchy Violation: You do not have authority to remove this role.' };
  }
  
  if (!(await canManageTargetUser(actorRank, targetUserId))) {
    return { success: false, error: 'Hierarchy Violation: You do not have authority to modify this user.' };
  }

  // 3. Execute Removal
  const { error: deleteError } = await supabase.from('user_roles')
    .delete()
    .eq('user_id', targetUserId)
    .eq('role_id', roleId);

  if (deleteError) {
    return { success: false, error: 'Database error removing role.' };
  }

  // 4. Write Audit Log
  await supabase.from('role_assignment_logs').insert({
    user_id: targetUserId,
    role_id: roleId,
    action: 'remove',
    performed_by: actor.id,
    notes: notes || 'Removed via Founder Workspace'
  });

  return { success: true };
}

/**
 * Promote Role (Assigns new role, removes current lowest rank)
 */
export async function promoteRole(targetUserId: string, newRoleId: string, oldRoleId: string): Promise<ActionResponse> {
  const actor = await getCurrentUser();
  // We use assignRole to do the heavy lifting of security checks
  const assignRes = await assignRole(targetUserId, newRoleId, 'Promotion assignment');
  if (!assignRes.success) return assignRes;
  
  const removeRes = await removeRole(targetUserId, oldRoleId, 'Promotion removal');
  if (!removeRes.success) {
    // rollback assignment if removal fails (ideally in a transaction, but standard supabase JS client doesn't support transactions easily without RPC)
    const supabase = await createClient();
    await supabase.from('user_roles').delete().eq('user_id', targetUserId).eq('role_id', newRoleId);
    return removeRes;
  }
  
  const supabase = await createClient();
  await supabase.from('role_assignment_logs').insert({
    user_id: targetUserId,
    role_id: newRoleId,
    action: 'promote',
    performed_by: actor?.id,
    notes: 'Role promotion sequence completed'
  });
  
  return { success: true };
}

/**
 * Demote Role
 */
export async function demoteRole(targetUserId: string, newRoleId: string, oldRoleId: string): Promise<ActionResponse> {
  const actor = await getCurrentUser();
  const assignRes = await assignRole(targetUserId, newRoleId, 'Demotion assignment');
  if (!assignRes.success) return assignRes;
  
  const removeRes = await removeRole(targetUserId, oldRoleId, 'Demotion removal');
  if (!removeRes.success) {
    const supabase = await createClient();
    await supabase.from('user_roles').delete().eq('user_id', targetUserId).eq('role_id', newRoleId);
    return removeRes;
  }
  
  const supabase = await createClient();
  await supabase.from('role_assignment_logs').insert({
    user_id: targetUserId,
    role_id: newRoleId,
    action: 'demote',
    performed_by: actor?.id,
    notes: 'Role demotion sequence completed'
  });
  
  return { success: true };
}
