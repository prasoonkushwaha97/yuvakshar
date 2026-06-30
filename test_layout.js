require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
);

async function checkLayout() {
  const { data: layout } = await supabase
    .from("homepage_layouts")
    .select("layout_json")
    .eq("is_published", true)
    .single();

  console.log("Published Layout JSON:", JSON.stringify(layout, null, 2));
}

checkLayout();
