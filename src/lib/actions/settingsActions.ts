"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/repositoryService";
import { Profile } from "@/store/types";
import { RESERVED_USERNAMES } from "@/utils/username";

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
        notifications: { email: true, inApp: true, digest: 'weekly', community: true, comments: true, mentions: true, editorial: true },
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

  // Ensure canonical name is synchronized
  if (data.name !== undefined) {
    profileToUpdate.name = data.name.trim();
  }

  // Synchronize username and slug with full validation
  if (data.username !== undefined) {
    const rawUsername = data.username.trim().toLowerCase();
    
    // Check validation constraints
    if (!rawUsername) {
      throw new Error("उपयोगकर्ता नाम आवश्यक है।");
    }

    const usernameRegex = /^[a-z0-9_.-]{3,30}$/;
    if (!usernameRegex.test(rawUsername)) {
      throw new Error("उपयोगकर्ता नाम अमान्य है। यह 3-30 वर्णों का होना चाहिए और केवल अक्षरों, अंकों, अंडरस्कोर (_), अवधियों (.) और हाइफ़न (-) का उपयोग कर सकता है।");
    }

    if (RESERVED_USERNAMES.includes(rawUsername)) {
      throw new Error("यह उपयोगकर्ता नाम आरक्षित है।");
    }

    // Enforce uniqueness
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", rawUsername)
      .neq("id", user.id)
      .maybeSingle();

    if (existingUser) {
      throw new Error("यह उपयोगकर्ता नाम (Username) पहले से उपयोग में है।");
    }

    // Insert username_history on change
    if (existingProfile.username && existingProfile.username.toLowerCase() !== rawUsername) {
      await supabase.from("username_history").insert({
        user_id: user.id,
        old_username: existingProfile.username,
        new_username: rawUsername,
      });
      profileToUpdate.previous_username = existingProfile.username;
      profileToUpdate.username_changed_at = new Date().toISOString();
    }

    profileToUpdate.username = rawUsername;
    profileToUpdate.slug = rawUsername;
  }

  // Properly merge social links if any new ones are supplied
  if (data.social_links !== undefined) {
    profileToUpdate.social_links = {
      ...existingSocialLinks,
      ...data.social_links
    };
  }

  // Handle location fields (city, state, country)
  if (data.city !== undefined || data.state !== undefined || data.country !== undefined) {
    const cleanCity = data.city !== undefined ? data.city.trim() : (existingProfile.city || '').trim();
    const cleanState = data.state !== undefined ? data.state.trim() : (existingProfile.state || '').trim();
    const cleanCountry = data.country !== undefined ? data.country.trim() : (existingProfile.country || '').trim();

    profileToUpdate.city = cleanCity;
    profileToUpdate.state = cleanState;
    profileToUpdate.country = cleanCountry;

    const parts = [cleanCity, cleanState, cleanCountry].filter(Boolean);
    profileToUpdate.location = parts.length > 0 ? parts.join(", ") : null;
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
