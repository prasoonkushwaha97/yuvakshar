import fs from 'fs';
import { Client } from 'pg';

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("Missing SUPABASE_DB_URL");
  process.exit(1);
}

async function run() {
  const file = process.argv[2];
  if (!file) {
    console.error("Provide SQL file path");
    process.exit(1);
  }
  const sql = fs.readFileSync(file, 'utf8');
  
  const client = new Client({ connectionString });
  await client.connect();
  
  try {
    await client.query(sql);
    console.log("Success");
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}
run();
