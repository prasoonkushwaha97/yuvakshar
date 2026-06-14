import { createClient } from "@supabase/supabase-js";

// Ensure this file is never imported in a client component
if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin.ts must only be used on the server side");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
