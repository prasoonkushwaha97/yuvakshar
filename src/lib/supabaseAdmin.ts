import { createClient } from "@supabase/supabase-js";

// Ensure this file is never imported in a client component
if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin.ts must only be used on the server side");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let cachedClient: any = null;

const getAdminClient = () => {
  if (!cachedClient) {
    // Fallback if service role key is missing (e.g. at build time or local dev)
    const keyToUse = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
    cachedClient = createClient(supabaseUrl, keyToUse, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return cachedClient;
};

export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    const client = getAdminClient();
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});
