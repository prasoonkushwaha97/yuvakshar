import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const pathname = request.nextUrl.pathname;
    const isProtectedRoute = 
      (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) ||
      pathname.startsWith('/workspace');

    if (!supabaseUrl || !supabaseKey) {
      if (isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
      return supabaseResponse;
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            } catch {
              // Ignore cookie mutations from server component contexts
            }
          },
        },
      }
    );

    // Fast path: Check if any auth cookie exists before calling auth.getUser()
    const allCookies = request.cookies.getAll();
    const hasAuthCookie = allCookies.some(c => c.name.includes('sb-') || c.name.includes('supabase'));

    let user = null;
    if (hasAuthCookie || isProtectedRoute) {
      try {
        const { data } = await supabase.auth.getUser();
        user = data?.user || null;
      } catch {
        user = null;
      }
    }

    if (isProtectedRoute && !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_to', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  } catch {
    const pathname = request.nextUrl.pathname;
    const isProtectedRoute = 
      (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) ||
      pathname.startsWith('/workspace');

    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot|ico)$).*)',
  ],
};
