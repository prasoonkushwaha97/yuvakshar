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

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from("profiles").select("username, slug").limit(1);
  if (error) {
    console.error("Query failed with error:", error.message, error.code);
  } else {
    console.log("Query succeeded! Columns exist. Data:", data);
  }
}

run();
