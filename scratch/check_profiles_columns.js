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
  console.log("Querying profiles column details...");
  // We can query pg_attribute to get the columns of profiles table
  const { data, error } = await supabase.rpc("get_table_columns", { table_name_param: "profiles" });
  if (error) {
    // If RPC is not available, we can try to select a dummy row or fetch schema info
    console.error("RPC error:", error.message);
    
    // Fallback: check schema by selecting and looking at keys of a row
    const { data: rows } = await supabase.from("profiles").select("*").limit(1);
    if (rows && rows.length > 0) {
      console.log("All columns in profiles row:", Object.keys(rows[0]));
    } else {
      console.log("No rows found in profiles table");
    }
  } else {
    console.log("Columns:", data);
  }
}

check();
