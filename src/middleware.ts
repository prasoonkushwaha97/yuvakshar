import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Verify authentication only by checking for the presence of a Supabase auth cookie.
  // This acts as a lightweight Edge guard before hitting server-side RBAC logic.
  const hasAuthCookie = req.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
  
  if (!hasAuthCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect_to', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Apply middleware strictly to protected workspaces
export const config = {
  matcher: ['/founder/:path*', '/admin/:path*', '/moderator/:path*'],
};
