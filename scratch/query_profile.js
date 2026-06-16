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
  const { data, error } = await supabase.from("profiles").select("*").limit(1);
  if (error) {
    console.error("Error querying profiles:", error);
  } else {
    console.log("Success querying profile! Record keys:");
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
      console.log("Record content:", data[0]);
    } else {
      console.log("No profiles found in table.");
    }
  }
}

run();
