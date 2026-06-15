import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

console.log("SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE_KEY_EXISTS", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const getSupabaseConfigError = (): string | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url) {
    return "❌ Missing NEXT_PUBLIC_SUPABASE_URL";
  }
  if (!key) {
    return "❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY";
  }
  if (!url.startsWith("https://")) {
    return `❌ Invalid NEXT_PUBLIC_SUPABASE_URL (must start with https://, got: ${url})`;
  }
  if (url.includes("placeholder") || url.includes("your_supabase_url")) {
    return `❌ Placeholder NEXT_PUBLIC_SUPABASE_URL detected: ${url}`;
  }
  return null;
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfigError() === null;
};

if (process.env.NODE_ENV !== "production" && !isSupabaseConfigured()) {
  console.warn("⚠️ [Supabase] Environment variables missing or invalid. Check .env.local");
}

export const supabase: SupabaseClient = createBrowserClient(
  isSupabaseConfigured() ? supabaseUrl : "https://unconfigured.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "unconfigured-anon-key"
);

/**
 * Checks connection health to the database
 */
export const checkConnectionHealth = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from("site_settings").select("key").limit(1);
    if (error) {
      console.warn("Supabase health check returned error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase health check caught exception:", err);
    return false;
  }
};

/**
 * Checks connection health to the storage client
 */
export const checkStorageHealth = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn("Supabase storage health check returned error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase storage health check caught exception:", err);
    return false;
  }
};
