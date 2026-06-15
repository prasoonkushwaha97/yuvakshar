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
  console.log("Querying roles table...");
  const { data: roles, error: rolesErr } = await supabase.from("roles").select("*");
  if (rolesErr) {
    console.error("Roles error:", rolesErr.message);
  } else {
    console.log("Roles in database:", roles);
  }

  console.log("\nQuerying user_roles table...");
  const { data: userRoles, error: urErr } = await supabase.from("user_roles").select("*, roles(*)");
  if (urErr) {
    console.error("User roles error:", urErr.message);
  } else {
    console.log("User roles in database:", userRoles);
  }

  console.log("\nQuerying profiles with role = Founder...");
  const { data: profs, error: profErr } = await supabase.from("profiles").select("*").eq("role", "Founder");
  if (profErr) {
    console.error("Profiles error:", profErr.message);
  } else {
    console.log("Profiles with role = Founder:", profs);
  }
}

check();
