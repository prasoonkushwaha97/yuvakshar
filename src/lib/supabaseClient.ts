import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof window !== "undefined" &&
    supabaseUrl !== "" &&
    supabaseAnonKey !== "" &&
    !supabaseUrl.includes("your_supabase_url")
  );
};

// Initialize Supabase Client (provide empty defaults to prevent throw on initial parse if unconfigured)
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
