import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deepAudit() {
  console.log("=== Phase 4D Deep Database Audit ===\n");

  // 1. Verify applied migrations via supabase_migrations table
  console.log("--- 1. MIGRATION HISTORY ---");
  const { data: migrations, error: migErr } = await supabase
    .from('supabase_migrations')
    .select('version, name')
    .order('version');
  if (migErr) {
    console.log("⚠️  Cannot read supabase_migrations (expected - restricted):", migErr.message);
  } else {
    console.log("Applied migrations:", JSON.stringify(migrations, null, 2));
  }

  // 2. List all tables via information_schema via rpc or direct query
  console.log("\n--- 2. ALL PUBLIC TABLES ---");
  const { data: tableList, error: tableErr } = await supabase
    .rpc('get_all_tables');
  if (tableErr) {
    console.log("⚠️  RPC get_all_tables not available:", tableErr.message);
  } else {
    console.log("Tables:", JSON.stringify(tableList));
  }

  // 3. Check exact row counts
  console.log("\n--- 3. ROW COUNTS ---");
  const tables = [
    'community_groups', 'community_members', 'community_posts',
    'community_comments', 'community_events', 'community_event_attendees'
  ];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${t}: ERROR - ${error.message} (${error.code})`);
    } else {
      console.log(`✅ ${t}: ${count} rows`);
    }
  }

  // 4. Verify no localStorage in production code
  console.log("\n--- 4. COMMUNITY SERVICE VERIFICATION ---");
  const fs = await import('fs');
  const path = await import('path');
  const svcPath = path.join(process.cwd(), 'src/lib/communityService.ts');
  const content = fs.readFileSync(svcPath, 'utf8');
  const localStorageCount = (content.match(/localStorage/g) || []).length;
  const mockDataCount = (content.match(/mock(Groups|Posts|Comments|Events)/g) || []).length;
  const hardcodedArrays = (content.match(/^\s*const\s+\w+\s*=\s*\[/gm) || []).length;
  const serverAction = content.includes('"use server"');
  const supabaseImport = content.includes('createClient');
  const lineCount = content.split('\n').length;

  console.log(`📄 communityService.ts: ${lineCount} lines`);
  console.log(`  "use server" directive: ${serverAction ? '✅ YES' : '❌ NO'}`);
  console.log(`  Supabase createClient: ${supabaseImport ? '✅ YES' : '❌ NO'}`);
  console.log(`  localStorage references: ${localStorageCount === 0 ? '✅' : '❌'} ${localStorageCount} found`);
  console.log(`  mockGroups/Posts/etc: ${mockDataCount === 0 ? '✅' : '❌'} ${mockDataCount} found`);
  console.log(`  Hardcoded array consts: ${hardcodedArrays}`);

  // 5. Check all tsx/ts files for localStorage references related to community
  console.log("\n--- 5. CODEBASE localStorage SCAN ---");
  const walk = (dir, results = []) => {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat.isDirectory() && !full.includes('node_modules') && !full.includes('.next')) {
        walk(full, results);
      } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
        const c = fs.readFileSync(full, 'utf8');
        const matches = (c.match(/localStorage\.(getItem|setItem|removeItem)\s*\(['"]community/g) || []);
        if (matches.length > 0) results.push({ file: full.replace(process.cwd(), ''), count: matches.length });
      }
    }
    return results;
  };
  const lsHits = walk(path.join(process.cwd(), 'src'));
  if (lsHits.length === 0) {
    console.log("✅ No community-related localStorage calls found in src/");
  } else {
    console.log("❌ Community localStorage usage found:");
    for (const h of lsHits) console.log(`  ${h.file}: ${h.count} calls`);
  }

  // 6. Check for schema cache issue on community_events
  console.log("\n--- 6. community_events SCHEMA CACHE CHECK ---");
  const { data: evData, error: evErr } = await supabase.from('community_events').select('id').limit(1);
  if (evErr) {
    console.log(`❌ community_events inaccessible: ${evErr.message} (${evErr.code})`);
    if (evErr.code === 'PGRST205') {
      console.log("   → Migration 014 likely NOT applied. Table exists in DB but is not exposed via PostgREST.");
    }
  } else {
    console.log(`✅ community_events accessible. Sample:`, evData);
  }

  const { data: attData, error: attErr } = await supabase.from('community_event_attendees').select('id').limit(1);
  if (attErr) {
    console.log(`❌ community_event_attendees inaccessible: ${attErr.message} (${attErr.code})`);
    if (attErr.code === 'PGRST205') {
      console.log("   → Migration 014 likely NOT applied. Table exists in DB but is not exposed via PostgREST.");
    }
  } else {
    console.log(`✅ community_event_attendees accessible. Sample:`, attData);
  }

  // 7. Verify community_groups is view or table
  console.log("\n--- 7. community_groups VIEW vs TABLE CHECK ---");
  const { error: viewTestErr } = await supabase.from('community_groups').insert({ name: 'ViewTest', description: 'x', category: 'Literature', owner_id: '00000000-0000-0000-0000-000000000000' });
  if (viewTestErr && viewTestErr.message.includes('view')) {
    console.log("⚠️  community_groups is a VIEW, not a physical table. Direct inserts will fail.");
    console.log("   → Check if base table is named differently (e.g., community_groups_base or groups).");
  } else if (viewTestErr) {
    console.log("ℹ️  community_groups insert failed:", viewTestErr.message, `(${viewTestErr.code})`);
  }

  console.log("\n=== Audit Complete ===");
}

deepAudit().catch(console.error);
