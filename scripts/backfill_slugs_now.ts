import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(name: string | null, email: string | null, id: string, existingSlugs: Set<string>): string {
  let raw = (name && name.trim()) || (email && email.split("@")[0]) || `user-${id.substring(0, 6)}`;
  
  // Normalize: lowercase, remove non-alphanumeric except hyphen
  let base = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, ""); // e.g. "Prasoon Kushwaha" -> "prasoonkushwaha"

  if (!base || base.length < 2) {
    base = `user${Math.floor(1000 + Math.random() * 9000)}`;
  }

  let slug = base;
  let counter = 2;

  while (existingSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }

  existingSlugs.add(slug);
  return slug;
}

async function main() {
  console.log("Fetching profiles from Supabase...");
  
  // 1. Fetch profiles (id, name, slug)
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching profiles:", error);
    process.exit(1);
  }

  // 2. Fetch Auth Users for email fallback mapping if needed
  let authEmailMap: Record<string, string> = {};
  try {
    const { data: authData } = await supabase.auth.admin.listUsers();
    if (authData?.users) {
      for (const u of authData.users) {
        authEmailMap[u.id] = u.email || "";
      }
    }
  } catch (e) {
    console.warn("Could not list auth users for email fallback:", e);
  }

  console.log(`Found ${profiles.length} profiles in database.`);

  const existingSlugs = new Set<string>();
  
  // Collect already assigned valid slugs
  profiles.forEach(p => {
    if (p.slug && p.slug.trim()) {
      existingSlugs.add(p.slug.trim().toLowerCase());
    }
  });

  const updates = [];

  for (const profile of profiles) {
    if (!profile.slug || !profile.slug.trim()) {
      const email = authEmailMap[profile.id] || null;
      const newSlug = generateSlug(profile.name, email, profile.id, existingSlugs);
      console.log(`Backfilling profile [${profile.name || profile.id}]: generated slug -> "${newSlug}"`);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ slug: newSlug })
        .eq("id", profile.id);

      if (updateError) {
        console.error(`Failed to update profile ${profile.id}:`, updateError.message);
      } else {
        updates.push({ id: profile.id, name: profile.name, slug: newSlug });
      }
    } else {
      console.log(`Profile [${profile.name}]: already has slug -> "${profile.slug}"`);
    }
  }

  console.log("\n================ VERIFICATION RESULTS ==================");
  const { data: verifyProfiles, error: verifyError } = await supabase
    .from("profiles")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (verifyError) {
    console.error("Verification query error:", verifyError);
  } else {
    console.table(verifyProfiles);
  }
}

main().catch(console.error);
