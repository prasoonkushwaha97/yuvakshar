require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // public can read, but can we write?
);

// We need service key to insert, but let's check what exists first
async function check() {
  const { data: editions } = await supabase.from("homepage_editions").select("*");
  console.log("Editions:", editions);

  const { data: layouts, error: le } = await supabase.from("homepage_layouts").select("*");
  console.log("Layouts error:", le);
  console.log("Layouts:", layouts);

  const { data: sections, error: se } = await supabase.from("homepage_sections").select("*");
  console.log("Sections error:", se);
  console.log("Sections count:", sections ? sections.length : 0);
}
check();
