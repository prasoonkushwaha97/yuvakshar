import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

console.log("[SupabaseClientDebug] NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl || "(empty)");
console.log("[SupabaseClientDebug] NEXT_PUBLIC_SUPABASE_ANON_KEY length:", supabaseAnonKey ? supabaseAnonKey.length : 0);
console.log("[SupabaseClientDebug] isSupabaseConfigured() result:", (
  supabaseUrl !== "" &&
  supabaseAnonKey !== "" &&
  !supabaseUrl.includes("your_supabase_url") &&
  !supabaseUrl.includes("placeholder-url")
));

export const isSupabaseConfigured = (): boolean => {
  const result = (
    supabaseUrl !== "" &&
    supabaseAnonKey !== "" &&
    !supabaseUrl.includes("your_supabase_url") &&
    !supabaseUrl.includes("placeholder-url")
  );
  return result;
};

// Initialize Supabase Client (provide empty defaults to prevent throw on initial parse if unconfigured)
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
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

