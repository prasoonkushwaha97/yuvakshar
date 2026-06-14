"use server";

import { supabase } from "@/lib/supabaseClient";

export async function logGovernanceAction(
  actionType: string,
  entityType: 'rbac' | 'moderation' | 'editorial' | 'community' | 'announcement',
  entityId?: string,
  details: Record<string, any> = {}
) {
  // Get currently authenticated user to act as actor_id
  const { data: authData, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authData?.user) {
    console.error("Governance Audit Error: No authenticated user found to log action.");
    return false;
  }

  const actor_id = authData.user.id;

  const { error } = await supabase
    .from('governance_audit_logs')
    .insert([{
      actor_id,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId || null,
      details
    }]);

  if (error) {
    console.error("Governance Audit Error: Failed to insert log:", error);
    return false;
  }

  return true;
}
