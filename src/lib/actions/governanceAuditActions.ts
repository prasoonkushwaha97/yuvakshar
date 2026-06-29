"use server";

import { supabase } from "@/lib/supabaseClient";

export async function logGovernanceAction(
  action: string,
  entity_type: string,
  entity_id: string | null = null,
  metadata: Record<string, any> = {}
) {
  const { data: authData, error: authError } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  
  if (authError || !authData?.user) {
    console.error("Governance Audit Error: No authenticated user found to log action.");
    return false;
  }

  const user_id = authData.user.id;
  
  // Try to fetch user name from profiles if needed
  let user_name = "Unknown User";
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user_id)
    .single();
    
  if (profile?.name) {
    user_name = profile.name;
  }

  const { error } = await supabase
    .from('governance_audit_logs')
    .insert([{
      actor_id: user_id,
      action_type: action,
      entity_type: entity_type,
      entity_id: entity_id,
      details: {
        user_name,
        ...metadata
      }
    }]);

  if (error) {
    console.error("Failed to insert governance audit log:", error);
    return false;
  }
  return true;
}
