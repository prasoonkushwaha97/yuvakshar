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
  console.log("Checking if RLS is enabled on roles and user_roles tables...");
  
  // We can query pg_tables to check rowsecurity
  // Let's execute a query to check if roles are readable, or if there's any RLS
  // Wait, let's select pg_class and check relrowsecurity
  // Since we can't write raw SQL directly unless there is an RPC, let's see if we can do it by querying pg_policies
  const { data, error } = await supabase.from("roles").select("count");
  if (error) {
    console.error("roles count select error:", error.message);
  } else {
    console.log("roles count result:", data);
  }
}

check();
