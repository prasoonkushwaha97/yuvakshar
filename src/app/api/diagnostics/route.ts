import { NextResponse } from 'next/server';

export async function GET() {
  const urlExists = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const keyExists = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("==== SUPABASE DIAGNOSTICS ====");
  console.log("SUPABASE_URL_EXISTS:", urlExists);
  console.log("SUPABASE_KEY_EXISTS:", keyExists);
  console.log("===============================");

  return NextResponse.json({
    SUPABASE_URL_EXISTS: urlExists,
    SUPABASE_KEY_EXISTS: keyExists,
    NODE_ENV: process.env.NODE_ENV,
    TIMESTAMP: new Date().toISOString()
  });
}
