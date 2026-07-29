import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

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

const configError = getSupabaseConfigError();
if (configError) {
  throw new Error(`CRITICAL: Supabase initialization failed. ${configError}`);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase: SupabaseClient = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    global: {
      fetch: (url, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        return fetch(url, {
          ...options,
          signal: options?.signal || controller.signal,
        }).finally(() => clearTimeout(timeoutId));
      },
    },
  }
);

/**
 * Checks connection health to the database
 */
export const checkConnectionHealth = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from("site_settings").select("key").limit(1);
    if (error) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

import { STORAGE_CONFIG } from "@/config/storage.config";

/**
 * Checks connection health to the storage client and verifies bucket exists
 */
export const checkStorageHealth = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).list("", { limit: 1 });
    if (error) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};
