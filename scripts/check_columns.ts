import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { supabaseAdmin } = await import("../src/lib/supabaseAdmin");
  const { data, error } = await supabaseAdmin.from('articles').select('status');
  if (data) {
    const statuses = new Set(data.map((d: any) => d.status));
    console.log("Distinct statuses:", Array.from(statuses));
  } else {
    console.log("Error:", error);
  }
}
main();
