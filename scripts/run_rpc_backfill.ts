import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Invoking execute_slug_backfill RPC...");
  
  const { data, error } = await supabase.rpc("execute_slug_backfill");

  if (error) {
    console.error("RPC Error:", error);
    
    // If RPC doesn't exist yet, let's execute direct UPDATE via authenticated RPC or client
    console.log("\nAttempting direct query of profiles...");
    const { data: profiles, error: selectErr } = await supabase
      .from("profiles")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (selectErr) {
      console.error("Select Error:", selectErr);
    } else {
      console.table(profiles);
    }
  } else {
    console.log("\n================ RPC BACKFILL SUCCESSFUL ================");
    console.table(data);
  }
}

main().catch(console.error);
