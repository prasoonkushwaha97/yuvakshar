"use server";

import { supabase } from "@/lib/supabaseClient";

export async function getGroups() {
  const { data, error } = await supabase
    .from('chaupal_rooms')
    .select(`
      id,
      title,
      description,
      type,
      is_private,
      created_at,
      chaupal_group_members(count)
    `)
    .eq('type', 'group')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching groups:", error);
    return [];
  }

  return data.map(group => ({
    id: group.id,
    name: group.title,
    description: group.description,
    isPrivate: group.is_private,
    membersCount: group.chaupal_group_members?.[0]?.count || 0,
    tags: [] // In a more advanced version, tags could be added to chaupal_rooms
  }));
}

export async function joinGroup(groupId: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('chaupal_group_members')
    .insert([{
      group_id: groupId,
      user_id: userId,
      role: 'member'
    }]);

  if (error) {
    // If it's a unique constraint violation, they are already a member
    if (error.code === '23505') return true;
    throw new Error(error.message);
  }

  return true;
}

export async function checkGroupMembership(groupId: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;
  if (!userId) return false;

  const { data, error } = await supabase
    .from('chaupal_group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return false;
  return data.role;
}
