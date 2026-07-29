"use server";

import { supabase } from "@/lib/supabaseClient";
import { hasAnyRole } from "@/lib/rbacService";
import { logGovernanceAction } from "./governanceAuditActions";
import { createNotification } from "./notificationActions";
import { notifyChaupalReport } from "@/lib/notificationService";
import crypto from "crypto";

/**
 * UTILS: Check if user has sufficient community authority.
 * Automatically grants access if the user is a Platform Founder/Super Admin.
 */
export async function hasCommunityRole(communityId: string, allowedRoles: string[]) {
  const isPlatformAdmin = await hasAnyRole(['founder', 'admin']);
  if (isPlatformAdmin) return true;

  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  if (!authData?.user) return false;

  const { data } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', authData.user.id)
    .single();

  if (!data) return false;
  return allowedRoles.includes(data.role);
}

export async function isCommunityOwner(communityId: string) {
  return hasCommunityRole(communityId, ['owner']);
}

/**
 * MUTATIONS
 */
export async function createCommunity(name: string, description: string) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  if (!authData?.user) throw new Error("Unauthorized");
  
  const userId = authData.user.id;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  // 1. Create Community
  const { data: community, error: commError } = await supabase
    .from('communities')
    .insert([{
      name,
      slug,
      description,
      owner_id: userId
    }])
    .select('id')
    .single();

  if (commError || !community) throw new Error(`Failed to create community: ${commError?.message}`);

  // 2. Initialize Settings
  await supabase.from('community_settings').insert([{ community_id: community.id }]);

  // 3. Assign Owner Role in community_members
  await supabase.from('community_members').insert([{
    community_id: community.id,
    user_id: userId,
    role: 'owner'
  }]);

  // 4. Audit Log
  await logGovernanceAction('community_created', 'community', community.id, { name, slug });

  return community.id;
}

export async function joinCommunity(communityId: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  if (!authData?.user) throw new Error("Unauthorized");
  
  const userId = authData.user.id;

  // Check if already a member
  const { data: existing } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .single();

  if (existing) throw new Error("Already a member of this community");

  // Check Settings
  const { data: settings } = await supabase
    .from('community_settings')
    .select('allow_public_join, require_approval')
    .eq('community_id', communityId)
    .single();

  if (!settings?.allow_public_join) throw new Error("Community is private");

  if (settings.require_approval) {
    // Logic for pending approvals goes here (not strictly required for 11B scope, but fallbacked)
    throw new Error("Approval required to join");
  }

  const { error } = await supabase
    .from('community_members')
    .insert([{
      community_id: communityId,
      user_id: userId,
      role: 'member'
    }]);

  if (error) throw new Error("Failed to join community");

  await logGovernanceAction('member_joined', 'community', communityId, { user_id: userId });
  return true;
}

export async function inviteMember(communityId: string, email: string, role: 'admin' | 'editor' | 'member') {
  const isAuthorized = await hasCommunityRole(communityId, ['owner', 'admin']);
  if (!isAuthorized) throw new Error("Only Owners and Moderators can invite members.");

  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  if (!authData.user) throw new Error("Unauthorized");
  const inviterId = authData.user.id;

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiration

  const { error } = await supabase
    .from('community_invitations')
    .insert([{
      community_id: communityId,
      inviter_id: inviterId,
      invitee_email: email,
      role,
      token,
      expires_at: expiresAt.toISOString()
    }]);

  if (error) throw new Error("Failed to create invitation");

  await logGovernanceAction('invitation_created', 'community', communityId, { invitee_email: email, role });
  return token; // Return token for email delivery system
}

export async function acceptInvitation(token: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  if (!authData?.user) throw new Error("You must be logged in to accept an invitation.");
  
  const user = authData.user;

  // Find valid invitation
  const { data: invite } = await supabase
    .from('community_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  if (!invite) throw new Error("Invalid or expired invitation");
  if (new Date(invite.expires_at) < new Date()) throw new Error("Invitation has expired");
  if (invite.invitee_email.toLowerCase() !== user.email?.toLowerCase()) {
    throw new Error("This invitation was sent to a different email address.");
  }

  // Insert member
  const { error: insertError } = await supabase.from('community_members').insert([{
    community_id: invite.community_id,
    user_id: user.id,
    role: invite.role
  }]);

  if (insertError) throw new Error("Failed to join community. You may already be a member.");

  // Mark invite accepted
  await supabase.from('community_invitations').update({ status: 'accepted' }).eq('id', invite.id);

  await logGovernanceAction('invitation_accepted', 'community', invite.community_id, { user_id: user.id, role: invite.role });
  await createNotification(invite.inviter_id, 'invite_accepted', 'Invitation Accepted', `${user.email} has joined your community.`);
  
  return invite.community_id;
}

export async function removeMember(communityId: string, targetUserId: string) {
  const isPlatformAuthorized = await hasAnyRole(['founder', 'admin', 'editor']);
  if (!isPlatformAuthorized) throw new Error("Unauthorized action.");

  const isAuthorized = await hasCommunityRole(communityId, ['owner', 'admin']);
  if (!isAuthorized) throw new Error("Unauthorized to remove members.");

  // Check target's role to prevent admin kicking owner
  const { data: target } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', targetUserId)
    .single();

  if (!target) throw new Error("Target user is not a member");
  if (target.role === 'owner') throw new Error("Community Owner cannot be removed.");

  // If actor is moderator, they can only kick editors/members (not other moderators or owner)
  const isActorOwner = await isCommunityOwner(communityId);
  const isPlatformAdmin = await hasAnyRole(['founder', 'admin']);
  if (!isActorOwner && !isPlatformAdmin && target.role === 'admin') {
    throw new Error("Moderators cannot remove other Moderators.");
  }

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', targetUserId);

  if (error) throw new Error("Failed to remove member");

  await logGovernanceAction('member_removed', 'community', communityId, { target_user_id: targetUserId });
  await createNotification(targetUserId, 'community_removed', 'Removed from Community', `You have been removed from the community.`);

  return true;
}

export async function transferOwnership(communityId: string, newOwnerId: string) {
  const isAuthorizedOwner = await isCommunityOwner(communityId);
  const isPlatformAdmin = await hasAnyRole(['founder', 'admin']);
  if (!isAuthorizedOwner && !isPlatformAdmin) throw new Error("Only the current Owner or Platform Admins can transfer ownership.");

  // Verify new owner is a member
  const { data: target } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', newOwnerId)
    .single();

  if (!target) throw new Error("New owner must be an existing member of the community.");

  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  if (!authData.user) throw new Error("Unauthorized");
  const currentUserId = authData.user.id;

  // Demote current owner to moderator (unless platform admin forced it, then just update owner_id)
  if (isAuthorizedOwner) {
    await supabase.from('community_members').update({ role: 'admin' }).eq('community_id', communityId).eq('user_id', currentUserId);
  }

  // Promote new user
  await supabase.from('community_members').update({ role: 'owner' }).eq('community_id', communityId).eq('user_id', newOwnerId);
  
  // Update communities table owner_id
  await supabase.from('communities').update({ owner_id: newOwnerId }).eq('id', communityId);

  await logGovernanceAction('ownership_transferred', 'community', communityId, { new_owner_id: newOwnerId });
  await createNotification(newOwnerId, 'community_ownership', 'Community Ownership Transferred', `You are now the Owner of the community.`);

  return true;
}
