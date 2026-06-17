const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTableAndColumns(tableName, columns) {
  const selectQuery = columns.join(',');
  const { data, error } = await supabase.from(tableName).select(selectQuery).limit(1);
  if (error) {
    if (error.code === 'PGRST205' || error.message.includes("Could not find")) {
      return { status: "MISSING", error: error.message };
    }
    // If it's an RLS error or similar, the table and columns still exist!
    return { status: "EXISTS (RLS/Empty)", data };
  }
  return { status: "EXISTS", data };
}

async function run() {
  console.log("=== DATABASE SCHEMA VERIFICATION ===");
  
  const tablesToCheck = {
    "profiles": ["id", "username", "role"],
    "roles": ["id", "name", "slug"],
    "permissions": ["id", "name", "slug"],
    "governance_audit_logs": ["id", "action_type", "actor_id"],
    "community_posts": ["id", "title", "content"], // From 007
    "categories": ["id", "parent_id", "created_by", "updated_by"], // From 008
    "review_notes": ["id", "article_id", "decision", "parent_id"], // From 009
    "article_assignments": ["id", "article_id", "role_type"], // From 009
    "workflow_history": ["id", "old_status", "new_status"], // From 009
    "magazine_issues": ["id", "title", "volume"], // From 009
    "magazine_sections": ["id", "name", "issue_id"], // From 009
    "magazine_issue_articles": ["id", "article_id", "section_id"] // From 009
  };

  for (const [table, columns] of Object.entries(tablesToCheck)) {
    console.log(`\nVerifying Table: ${table}`);
    console.log(`Checking columns: ${columns.join(', ')}`);
    const result = await verifyTableAndColumns(table, columns);
    console.log(`Result: ${result.status}`);
    if (result.error) console.log(`Error Details: ${result.error}`);
  }
}

run();
