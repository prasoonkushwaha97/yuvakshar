"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/repositoryService";
import { Profile } from "@/store/types";

export async function getUserSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Try creating it if missing (in case trigger missed it)
      const { data: newData, error: insertError } = await supabase
        .from("user_settings")
        .insert([{ id: user.id }])
        .select()
        .single();
        
      if (!insertError && newData) return newData;

      return {
        appearance: { theme: 'system', fontSize: 'medium', readingWidth: 'standard', reducedMotion: false, highContrast: false },
        notifications: { email: true, inApp: true, digest: 'weekly', community: true, comments: true, mentions: true, editorial: true, newsletter: true },
        privacy: { profileVisibility: 'public', activityVisibility: 'public', searchable: true },
        language: { interfaceLanguage: 'hi', contentLanguage: 'hi', bilingualMode: false },
        future_2fa_enabled: false
      };
    }
    throw error;
  }

  return data;
}

export async function updateUserSettings(category: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("user_settings")
    .update({ [category]: data, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    throw error;
  }

  revalidatePath(`/settings/${category}`);
  return { success: true };
}

export async function updateUserAccount(data: Partial<Profile>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch the existing profile to get current social_links and other attributes
  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    throw profileError;
  }

  const existingProfile = currentProfile || {};
  const existingSocialLinks = existingProfile.social_links || {};
  
  const profileToUpdate: any = {
    ...existingProfile,
    ...data,
    id: user.id,
  };

  // Ensure canonical name and display_name are synchronized
  if (data.name !== undefined) {
    profileToUpdate.name = data.name;
    profileToUpdate.display_name = data.name;
  }

  // Synchronize username and slug
  if (data.username !== undefined) {
    profileToUpdate.username = data.username;
    profileToUpdate.slug = data.username;
  }

  // Properly merge social links if any new ones are supplied
  if (data.social_links !== undefined) {
    profileToUpdate.social_links = {
      ...existingSocialLinks,
      ...data.social_links
    };
  }

  const { data: updatedProfile, error } = await updateProfile(profileToUpdate, supabase);

  if (error) {
    throw new Error(error);
  }

  revalidatePath("/settings/account");
  return { success: true, user: updatedProfile };
}

export async function updateAvatarUrl(avatar_url: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url })
    .eq("id", user.id);

  if (error) {
    throw error;
  }

  revalidatePath("/settings/account");
  return { success: true };
}

export async function getUserLoginHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("user_login_history")
    .select("*")
    .eq("user_id", user.id)
    .order("login_time", { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  return data;
}
