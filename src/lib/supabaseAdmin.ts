import { createClient } from "@supabase/supabase-js";

// Ensure this file is never imported in a client component
if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin.ts must only be used on the server side");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedClient: any = null;

const getAdminClient = () => {
  if (!supabaseUrl) {
    throw new Error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is required for administrative database operations but was not provided in the environment variables.");
  }
  if (!supabaseServiceKey) {
    throw new Error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is required for administrative database operations but was not provided in the environment variables.");
  }
  
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseServiceKey, {
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
