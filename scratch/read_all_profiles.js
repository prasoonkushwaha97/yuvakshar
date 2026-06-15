const { createClient } = require("C:\\Users\\HP\\.gemini\\antigravity\\scratch\\yuvakshar\\node_modules\\@supabase\\supabase-js");
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

async function check() {
  console.log("Querying all profiles...");
  const { data: profs, error } = await supabase.from("profiles").select("*");
  if (error) {
    console.error("Profiles select error:", error.message);
  } else {
    console.log("Profiles list:", profs);
  }
}

check();
