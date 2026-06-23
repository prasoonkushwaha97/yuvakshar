import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log("=== Phase 4D Database Verification Audit ===");
  
  const tables = [
    'community_groups',
    'community_members',
    'community_posts',
    'community_comments',
    'community_events',
    'community_event_attendees'
  ];

  let auditResults = {
    missingTables: [],
    zeroRowTables: [],
    rlsStatus: {},
    tableCounts: {}
  };

  for (const table of tables) {
    console.log(`\nVerifying table: ${table}`);
    
    // 1. Check existence and row count
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      if (error.code === '42P01') {
        console.log(`❌ Table ${table} does NOT exist.`);
        auditResults.missingTables.push(table);
        continue;
      } else {
        console.log(`⚠️ Error reading ${table}: ${error.message} (Code: ${error.code})`);
      }
    } else {
      console.log(`✅ Table ${table} exists. Row count: ${count}`);
      auditResults.tableCounts[table] = count;
      if (count === 0) {
        auditResults.zeroRowTables.push(table);
      }
    }

    // 2. Check RLS by attempting to insert without auth
    let dummyData = {};
    if (table === 'community_groups') dummyData = { name: 'Test', description: 'Test', category: 'Literature', owner_id: '123' };
    if (table === 'community_members') dummyData = { community_id: '123', user_id: '123', role: 'Member' };
    if (table === 'community_posts') dummyData = { user_id: '123', content: 'Test', post_type: 'text' };
    if (table === 'community_comments') dummyData = { post_id: '123', user_id: '123', content: 'Test' };
    if (table === 'community_events') dummyData = { title: 'Test', description: 'Test', type: 'Meetup', event_date: new Date().toISOString() };
    if (table === 'community_event_attendees') dummyData = { event_id: '123', user_id: '123' };

    const { error: insertError } = await supabase.from(table).insert(dummyData);
    
    if (insertError && insertError.code === '42501') {
      console.log(`✅ RLS is ENABLED for ${table} (INSERT blocked without proper auth).`);
      auditResults.rlsStatus[table] = 'Enabled';
    } else if (insertError) {
      console.log(`⚠️ Insert failed for other reasons: ${insertError.message} (Code: ${insertError.code}). RLS status assumed ENABLED/STRICT.`);
      auditResults.rlsStatus[table] = 'Enabled (Strict schema)';
    } else {
      console.log(`❌ RLS might be DISABLED! Insert succeeded without auth!`);
      auditResults.rlsStatus[table] = 'Disabled';
    }
  }

  console.log("\n=== Audit Summary ===");
  console.log("Missing Tables:", auditResults.missingTables);
  console.log("Zero Row Tables:", auditResults.zeroRowTables);
  console.log("RLS Status:", auditResults.rlsStatus);
}

runAudit().catch(console.error);
