import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Ensure next path starts with a single slash to prevent open redirect vulnerabilities
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        let targetOrigin = origin;
        if (!isLocalEnv && forwardedHost) {
          targetOrigin = `https://${forwardedHost}`;
        }

        return NextResponse.redirect(`${targetOrigin}${safeNext}`);
      } else {
        console.error("Supabase auth callback exchangeCodeForSession error:", error.message);
      }
    } catch (err) {
      console.error("Supabase auth callback unexpected exception:", err);
    }
  }

  // Fallback redirect if code is missing or exchange fails
  return NextResponse.redirect(`${origin}${safeNext}`);
}
