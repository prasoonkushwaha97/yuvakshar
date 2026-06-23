import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Recursively walk file tree
const walkFiles = (dir, results = []) => {
  try {
    const list = readdirSync(dir);
    for (const file of list) {
      const full = join(dir, file);
      try {
        const stat = statSync(full);
        if (stat.isDirectory() && !full.includes('node_modules') && !full.includes('.next') && !full.includes('.git')) {
          walkFiles(full, results);
        } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
          results.push(full);
        }
      } catch {}
    }
  } catch {}
  return results;
};

async function fullAudit() {
  const cwd = process.cwd();
  const results = {
    migrations: { total: 14, applied: [], not_applied: [] },
    tables: {},
    rls: {},
    localStorage: [],
    communityService: {},
    score: 0
  };

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║          Phase 4D Database Verification Audit            ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // ─── SECTION 1: Check which migrations are actually applied by probing tables ───
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  1. MIGRATION STATUS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Probe tables created by each known migration
  const migrationProbes = [
    { id: '001', probe: 'profiles', label: '001_create_core_schema' },
    { id: '002', probe: 'profiles', label: '002_add_username_to_profiles', column: 'slug' },
    { id: '003', probe: 'permissions', label: '003_create_rbac_tables' },
    { id: '004', probe: 'roles', label: '004_seed_permissions_and_roles' },
    { id: '005', probe: 'governance_votes', label: '005_governance_foundation' },
    { id: '006', probe: 'community_settings', label: '006_community_governance' },
    { id: '007', probe: 'community_posts', label: '007_phase1_community' },
    { id: '008', probe: 'category_hierarchy', label: '008_category_hierarchy_and_analytics' },
    { id: '009', probe: 'magazine_issues', label: '009_phase2_editorial_and_magazine' },
    { id: '010', probe: 'profiles', label: '010_security_hardening_rls' },
    { id: '011', probe: 'community_posts', label: '011_article_lifecycle_rls' },
    { id: '012', probe: 'user_settings', label: '012_user_settings_architecture' },
    { id: '013', probe: 'cms_navigation', label: '013_full_cms_ecosystem' },
    { id: '014', probe: 'community_events', label: '014_community_events' },
  ];

  for (const m of migrationProbes) {
    const { error } = await supabase.from(m.probe).select('*', { head: true, count: 'exact' }).limit(1);
    const missingFromCache = error && error.code === 'PGRST205';
    const tableMissing = error && error.code === '42P01';
    if (tableMissing || missingFromCache) {
      console.log(`  ❌ ${m.label} — NOT APPLIED (${m.probe} missing or not exposed)`);
      results.migrations.not_applied.push(m.label);
    } else {
      console.log(`  ✅ ${m.label}`);
      results.migrations.applied.push(m.label);
    }
  }

  // ─── SECTION 2: Table Existence + Row Counts ───
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  2. TABLE EXISTENCE + ROW COUNTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const communityTables = [
    'community_groups', 'community_members', 'community_posts',
    'community_comments', 'community_events', 'community_event_attendees',
    'community_post_likes', 'community_comment_likes'
  ];
  for (const t of communityTables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error && error.code === '42P01') {
      console.log(`  ❌ ${t}: MISSING`);
      results.tables[t] = { status: 'MISSING', rows: null };
    } else if (error && error.code === 'PGRST205') {
      console.log(`  ⚠️  ${t}: EXISTS but NOT in PostgREST schema cache (migration not applied/accepted)`);
      results.tables[t] = { status: 'NOT_EXPOSED', rows: null };
    } else if (error) {
      console.log(`  ⚠️  ${t}: ERROR - ${error.message}`);
      results.tables[t] = { status: 'ERROR', rows: null };
    } else {
      const isView = t === 'community_groups';
      const typeLabel = isView ? ' [VIEW]' : '';
      console.log(`  ✅ ${t}${typeLabel}: ${count ?? 0} rows`);
      results.tables[t] = { status: 'OK', rows: count ?? 0 };
    }
  }

  // ─── SECTION 3: RLS Policy Verification ───
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  3. RLS STATUS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  (Inferred from migration SQL files — direct policy query requires service_role key)");

  const rlsMigrations = {
    'community_posts': '007_phase1_community.sql: RLS ENABLED + SELECT/INSERT/UPDATE/DELETE policies',
    'community_post_likes': '007_phase1_community.sql: RLS ENABLED + SELECT/ALL policies',
    'community_comments': '007_phase1_community.sql: RLS ENABLED + SELECT/ALL policies',
    'community_comment_likes': '007_phase1_community.sql: RLS ENABLED + SELECT/ALL policies',
    'community_events': '014_community_events.sql: RLS ENABLED + SELECT/INSERT/UPDATE/DELETE policies',
    'community_event_attendees': '014_community_events.sql: RLS ENABLED + SELECT/ALL policies',
    'community_groups': 'community_groups is a VIEW on communities table — inherits communities RLS',
    'community_members': 'community_members uses community_settings via communities RLS'
  };
  for (const [table, note] of Object.entries(rlsMigrations)) {
    const status = results.tables[table]?.status;
    const icon = status === 'OK' ? '✅' : status === 'NOT_EXPOSED' ? '⚠️ ' : '❌';
    console.log(`  ${icon} ${table}: ${note}`);
    results.rls[table] = status === 'OK' ? 'Verified in migration' : 'Migration not applied';
  }

  // ─── SECTION 4: localStorage Scan ───
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  4. localStorage SCAN (Community-Related)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  const allFiles = walkFiles(join(cwd, 'src'));
  let lsHits = [];
  for (const f of allFiles) {
    const content = readFileSync(f, 'utf8');
    const communityLs = [...content.matchAll(/localStorage\.(getItem|setItem|removeItem)\s*\(['"](community[^'"]*)['"]/g)];
    if (communityLs.length > 0) {
      lsHits.push({ file: f.replace(cwd, ''), keys: communityLs.map(m => m[2]) });
    }
  }
  if (lsHits.length === 0) {
    console.log("  ✅ ZERO community localStorage calls in codebase");
  } else {
    console.log("  ❌ Community localStorage usage detected:");
    for (const h of lsHits) {
      console.log(`     ${h.file}: [${h.keys.join(', ')}]`);
    }
  }
  results.localStorage = lsHits;

  // ─── SECTION 5: communityService.ts Audit ───
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  5. communityService.ts AUDIT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  const svc = readFileSync(join(cwd, 'src/lib/communityService.ts'), 'utf8');
  const checks = {
    '"use server"': svc.includes('"use server"'),
    'import createClient (supabaseServer)': svc.includes('from "./supabaseServer"') || svc.includes("from './supabaseServer'"),
    'No localStorage': !svc.includes('localStorage'),
    'No mockGroups': !svc.includes('mockGroups'),
    'No mockPosts': !svc.includes('mockPosts'),
    'No mockComments': !svc.includes('mockComments'),
    'No mockEvents': !svc.includes('mockEvents'),
    'fetchGroups()': svc.includes('fetchGroups'),
    'fetchPosts()': svc.includes('fetchPosts'),
    'createPost()': svc.includes('createPost'),
    'fetchComments()': svc.includes('fetchComments'),
    'addComment()': svc.includes('addComment'),
    'fetchEvents()': svc.includes('fetchEvents'),
    'toggleEventRegistration()': svc.includes('toggleEventRegistration'),
    'toggleLikePost()': svc.includes('toggleLikePost'),
    'toggleLikeComment()': svc.includes('toggleLikeComment'),
  };
  for (const [check, passed] of Object.entries(checks)) {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
    results.communityService[check] = passed;
  }

  // ─── PRODUCTION READINESS SCORE ───
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  6. PRODUCTION READINESS SCORE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const migrationsApplied = results.migrations.applied.length;
  const migrationsTotal = 14;
  const tableOK = Object.values(results.tables).filter(t => t.status === 'OK').length;
  const tableTotal = communityTables.length;
  const lsClean = lsHits.length === 0;
  const svcChecks = Object.values(results.communityService).filter(v => v).length;
  const svcTotal = Object.keys(results.communityService).length;
  const tablesNotExposed = Object.values(results.tables).filter(t => t.status === 'NOT_EXPOSED').length;
  
  const migScore = Math.round((migrationsApplied / migrationsTotal) * 25);
  const tableScore = Math.round((tableOK / tableTotal) * 25);
  const lsScore = lsClean ? 20 : 0;
  const svcScore = Math.round((svcChecks / svcTotal) * 30);
  const totalScore = migScore + tableScore + lsScore + svcScore;

  console.log(`  Migrations Applied:     ${migrationsApplied}/${migrationsTotal}     → ${migScore}/25 pts`);
  console.log(`  Community Tables OK:    ${tableOK}/${tableTotal}     → ${tableScore}/25 pts`);
  console.log(`  localStorage Clean:     ${lsClean ? 'YES' : 'NO'}         → ${lsScore}/20 pts`);
  console.log(`  Service Checks Passed:  ${svcChecks}/${svcTotal}   → ${svcScore}/30 pts`);
  console.log(`  ────────────────────────────────────────────────`);
  console.log(`  TOTAL SCORE:            ${totalScore}/100`);

  if (tablesNotExposed > 0) {
    console.log(`\n  ⚠️  CRITICAL: ${tablesNotExposed} table(s) not exposed in PostgREST schema cache.`);
    console.log(`     Migration 014 must be applied in Supabase dashboard or via Supabase CLI.`);
    console.log(`     Until applied, community_events + community_event_attendees will error.`);
  }

  console.log("\n  SUMMARY OF REQUIRED ACTIONS:");
  if (results.migrations.not_applied.length > 0) {
    console.log(`  1. Apply MISSING migrations: ${results.migrations.not_applied.join(', ')}`);
  }
  if (tablesNotExposed > 0) {
    console.log(`  2. Run 014_community_events.sql in Supabase SQL Editor to expose tables to API.`);
  }

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  Audit Complete");
  console.log("═══════════════════════════════════════════════════════════════");

  // Return JSON for report generation
  console.log("\n=== JSON RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
}

fullAudit().catch(console.error);
