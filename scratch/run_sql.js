require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fbvffiotmlxypxmtlrsz.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const file = process.argv[2];
  if (!file) {
    console.error("Provide SQL file path");
    process.exit(1);
  }
  const sql = fs.readFileSync(file, 'utf8');
  
  // To run raw SQL from js using supabase-js, you typically can't without an RPC. 
  // Wait, I can just use fetch directly to the postgrest endpoint.
  // Actually, we created an RPC `exec_sql` in phase 1! Let's use it.
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    console.error("Error executing SQL:", error.message);
  } else {
    console.log("Success", data);
  }
}

run();
