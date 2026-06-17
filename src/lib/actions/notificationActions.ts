"use server";

import { supabase } from "@/lib/supabaseClient";

export async function createNotification(
  userId: string,
  eventType: string,
  title: string,
  message: string
) {
  const isAuthorized = await hasAnyRole(['founder', 'admin', 'editor', 'moderator']);
  if (!isAuthorized) throw new Error("Unauthorized action.");

  const { error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      event_type: eventType,
      title,
      message,
      is_read: false
    }]);

  if (error) {
    console.error("Failed to create notification:", error);
    return false;
  }
  
  return true;
}

export async function getUserNotifications() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authData?.user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return false;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', authData.user.id);

  if (error) return false;
  return true;
}
