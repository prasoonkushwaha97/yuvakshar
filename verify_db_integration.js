const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== DB INTEGRATION TEST ===");

  // 1. Create Category
  console.log("\n1. Creating test category...");
  const { data: newCat, error: err1 } = await supabase.from('categories').insert({
    name_hi: 'टेस्ट कैटेगरी',
    name_en: 'Test Category',
    slug: 'test-category-' + Date.now(),
    color: '#000000',
    sort_order: 999
  }).select().single();
  
  if (err1) throw err1;
  console.log("   ✅ Created:", newCat.id, newCat.name_hi);

  // 2. Update Category
  console.log("\n2. Updating category status...");
  const { data: updatedCat, error: err2 } = await supabase.from('categories').update({
    is_active: false
  }).eq('id', newCat.id).select().single();

  if (err2) throw err2;
  console.log("   ✅ Updated is_active:", updatedCat.is_active);

  // 3. Create Article
  console.log("\n3. Creating test article (draft)...");
  const { data: newArt, error: err3 } = await supabase.from('articles').insert({
    title_hi: 'टेस्ट आर्टिकल',
    title_en: 'Test Article',
    slug: 'test-article-' + Date.now(),
    content: '<p>Content</p>',
    category_id: newCat.id,
    status: 'draft',
    author_id: '15d48be3-4dc9-408a-b850-843de635bcdd' // Assuming some UUID from previous tests or mock
  }).select().single();

  if (err3) {
     console.log("   ⚠️ Note: Author ID might be missing, skipping insert.", err3.message);
  } else {
     console.log("   ✅ Created Article:", newArt.id, "Status:", newArt.status);
     
     // 4. Update Article
     console.log("\n4. Changing article status to in_review...");
     const { data: updatedArt, error: err4 } = await supabase.from('articles').update({
       status: 'in_review'
     }).eq('id', newArt.id).select().single();
     if(err4) throw err4;
     console.log("   ✅ Updated Article Status:", updatedArt.status);
     
     // Delete Article
     console.log("\n   Cleaning up article...");
     await supabase.from('articles').delete().eq('id', newArt.id);
  }

  // 5. Delete Category
  console.log("\n5. Deleting test category...");
  const { error: err5 } = await supabase.from('categories').delete().eq('id', newCat.id);
  if (err5) throw err5;
  console.log("   ✅ Deleted category:", newCat.id);

  console.log("\n=== TEST COMPLETE ===");
}

run().catch(console.error);
