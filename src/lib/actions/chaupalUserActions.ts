"use server";

import { supabase } from "@/lib/supabaseClient";

export async function followUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('user_followers')
    .insert({
      follower_id: followerId,
      following_id: followingId
    });

  if (error) {
    console.error("Error following user:", error);
    throw error;
  }
  
  // Notification for follow
  const { data: user } = await supabase.from('profiles').select('name').eq('id', followerId).single();
  if (user) {
    import('./notificationActions').then(({ createInternalNotification }) => {
      createInternalNotification(
        followingId, 
        'follow', 
        'नया फ़ॉलोअर', 
        `${user.name} ने आपको फ़ॉलो करना शुरू किया है।`,
        `/user/${followerId}`
      );
    });
  }
  
  return true;
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('user_followers')
    .delete()
    .match({
      follower_id: followerId,
      following_id: followingId
    });

  if (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
  return true;
}

export async function isFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('user_followers')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error checking follow status:", error);
    return false;
  }

  return !!data;
}
