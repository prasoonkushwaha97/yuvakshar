const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envPath = "C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/.env.local";
let url = "";
let key = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = content.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
  if (urlMatch) url = urlMatch[1].trim();
  if (keyMatch) key = keyMatch[1].trim();
}

if (!url || !key) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.rpc("get_tables"); // Try to run RPC if exists, or check tables using fetch
  if (error) {
    console.log("get_tables RPC not found, querying tables by probing standard ones...");
  }
  
  const tables = [
    "profiles", "roles", "permissions", "role_permissions", "categories", "tags", 
    "articles", "article_tags", "editorial_assignments", "magazines", "comments", 
    "bookmarks", "subscribers", "newsletter_campaigns", "ads", "memberships", 
    "search_analytics", "contact_messages", "site_settings", "slug_redirects", 
    "homepage_layouts", "activity_logs", "communities", "community_posts"
  ];
  
  console.log("Probing tables:");
  for (const t of tables) {
    const { data: selectData, error: selectError } = await supabase.from(t).select("count").limit(1);
    if (selectError) {
      console.log(`- ${t}: Error/Missing (${selectError.message})`);
    } else {
      console.log(`- ${t}: Exists!`);
    }
  }
}

run();
