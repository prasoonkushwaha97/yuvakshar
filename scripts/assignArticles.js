import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing from .env.local!");
  console.error("This script requires the Service Role Key to bypass Row Level Security (RLS) and update articles.");
  console.error("Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file and run this script again.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_USERNAME = 'prasoonkushwaha';

async function main() {
  console.log(`🔍 Starting assignment process for user: @${TARGET_USERNAME}`);

  // 1. Find the target user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', TARGET_USERNAME)
    .single();

  if (profileError || !profile) {
    console.error(`❌ Failed to find user with username "${TARGET_USERNAME}".`);
    console.error(profileError);
    process.exit(1);
  }

  const targetUserId = profile.id;
  console.log(`✅ Found user: ${profile.username} (UUID: ${targetUserId})`);

  // 2. Fetch existing articles to update
  const { data: existingArticles, error: fetchError } = await supabase
    .from('articles')
    .select('id, author_id');

  if (fetchError) {
    console.error(`❌ Failed to fetch existing articles.`);
    console.error(fetchError);
    process.exit(1);
  }

  if (!existingArticles || existingArticles.length === 0) {
    console.log(`ℹ️ No articles found in the database. Nothing to update.`);
    process.exit(0);
  }

  console.log(`📄 Found ${existingArticles.length} total articles.`);

  // 3. Update articles
  let updatedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (const article of existingArticles) {
    if (article.author_id === targetUserId) {
      skippedCount++;
      continue;
    }

    // Update query - add author_username if your schema uses it, otherwise it ignores it safely if not passed
    const updatePayload: any = { 
      author_id: targetUserId 
    };

    const { error: updateError } = await supabase
      .from('articles')
      .update(updatePayload)
      .eq('id', article.id);

    if (updateError) {
      errors.push({ articleId: article.id, error: updateError.message });
    } else {
      updatedCount++;
    }
  }

  // 4. Generate Report
  console.log(`\n==================================================`);
  console.log(`📊 EXECUTION REPORT`);
  console.log(`==================================================`);
  console.log(`- Target User Username : ${TARGET_USERNAME}`);
  console.log(`- Target User UUID     : ${targetUserId}`);
  console.log(`- Total Articles       : ${existingArticles.length}`);
  console.log(`- Articles Updated     : ${updatedCount}`);
  console.log(`- Articles Skipped     : ${skippedCount} (already assigned)`);
  console.log(`- Errors Encountered   : ${errors.length}`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️ Errors Details:`);
    errors.forEach(e => console.log(`  - Article ${e.articleId}: ${e.error}`));
  }

  console.log(`==================================================`);
  console.log(`✅ Operation complete. Please verify the changes on the platform dashboard.`);
}

main();
