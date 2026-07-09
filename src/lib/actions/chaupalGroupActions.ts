"use server";

import { supabase } from "@/lib/supabaseClient";

export async function joinGroup(groupId: string) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('chaupal_group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
      role: 'member'
    });

  if (error) {
    console.error("Error joining group:", error);
    throw error;
  }
  return true;
}

export async function leaveGroup(groupId: string) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('chaupal_group_members')
    .delete()
    .match({
      group_id: groupId,
      user_id: userId
    });

  if (error) {
    console.error("Error leaving group:", error);
    throw error;
  }
  return true;
}

export async function getGroupDetails(groupId: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;

  const { data: group, error } = await supabase
    .from('chaupal_groups')
    .select(`
      id, name, description, avatar_url, cover_url, is_private, created_at, created_by,
      members:chaupal_group_members(count)
    `)
    .eq('id', groupId)
    .single();

  if (error || !group) {
    return null;
  }

  let isMember = false;
  if (userId) {
    const { data: membership } = await supabase
      .from('chaupal_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();
    
    if (membership) isMember = true;
  }

  return {
    ...group,
    memberCount: group.members[0]?.count || 0,
    isMember
  };
}

export async function getRecommendedGroups(limit = 5) {
  const { data, error } = await supabase
    .from('chaupal_groups')
    .select('id, name, description, avatar_url, is_private')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recommended groups:", error);
    return [];
  }
  return data;
}

export async function createGroup(name: string, description: string, isPrivate: boolean, avatarUrl?: string, coverUrl?: string) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data: group, error } = await supabase
    .from('chaupal_groups')
    .insert({
      name,
      description,
      is_private: isPrivate,
      avatar_url: avatarUrl,
      cover_url: coverUrl,
      created_by: userId
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating group:", error);
    throw error;
  }

  // Add creator as admin
  await supabase
    .from('chaupal_group_members')
    .insert({
      group_id: group.id,
      user_id: userId,
      role: 'admin'
    });

  return group;
}

export async function getGroups() {
  const { data, error } = await supabase
    .from('chaupal_groups')
    .select('id, name, description, avatar_url, is_private')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching all groups:", error);
    return [];
  }
  return data;
}

export async function checkGroupMembership(groupId: string) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return false;

  const { data: membership } = await supabase
    .from('chaupal_group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  return membership ? membership.role : false;
}
