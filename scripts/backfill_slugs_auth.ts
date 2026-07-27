import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(name: string | null, id: string, existingSlugs: Set<string>): string {
  let raw = (name && name.trim()) || `user-${id.substring(0, 6)}`;
  
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
  console.log("Starting Profile Slug Backfill Execution...");

  // 1. Fetch all profiles
  const { data: profiles, error: fetchErr } = await supabase
    .from("profiles")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (fetchErr) {
    console.error("Error fetching profiles:", fetchErr);
    process.exit(1);
  }

  console.log(`Retrieved ${profiles.length} profiles from database.`);

  const existingSlugs = new Set<string>();
  profiles.forEach(p => {
    if (p.slug && p.slug.trim()) existingSlugs.add(p.slug.trim().toLowerCase());
  });

  // Backfill each profile missing a slug
  for (const profile of profiles) {
    const slugToAssign = generateSlug(profile.name, profile.id, existingSlugs);
    console.log(`Assigning slug "${slugToAssign}" to user "${profile.name}" (${profile.id})...`);
    
    // Perform update
    const { data: updateResult, error: updateErr } = await supabase
      .from("profiles")
      .update({ slug: slugToAssign })
      .eq("id", profile.id)
      .select("id, name, slug");

    if (updateErr) {
      console.error(`Update failed for ${profile.name}:`, updateErr.message);
    } else {
      console.log(`Update result for ${profile.name}:`, updateResult);
    }
  }

  // Final verification query: SELECT id, name, slug FROM public.profiles ORDER BY name;
  console.log("\n================ VERIFICATION QUERY ================");
  console.log("SQL: SELECT id, name, slug FROM public.profiles ORDER BY name;\n");

  const { data: finalProfiles, error: finalErr } = await supabase
    .from("profiles")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (finalErr) {
    console.error("Verification error:", finalErr);
  } else {
    console.table(finalProfiles);
  }
}

main().catch(console.error);
