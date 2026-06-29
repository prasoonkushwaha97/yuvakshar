"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function updateUserAccount(data: { name?: string, username?: string, bio?: string, social_links?: any }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);

  if (error) {
    throw error;
  }

  revalidatePath("/settings/account");
  return { success: true };
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
