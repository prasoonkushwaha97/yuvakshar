import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  console.log("Storage buckets error:", error);
  console.log("Storage buckets:", buckets);
}

run();
