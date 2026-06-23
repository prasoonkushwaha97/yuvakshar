import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const pathname = request.nextUrl.pathname;
    const isProtectedRoute = 
      pathname.startsWith('/founder') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/editorial') ||
      pathname.startsWith('/author');

    // Fail gracefully if environment variables are missing
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Middleware: Missing Supabase Environment Variables.");
      if (isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect_to', pathname);
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
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions. Edge environment cookies might throw here.
              console.warn("Middleware: Cookie mutation failed.", error);
            }
          },
        },
      }
    );

    // Refreshing the auth token safely
    let user = null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.warn("Middleware: Auth Validation Error:", error.message);
      } else {
        user = data.user;
      }
    } catch (authError) {
      console.warn("Middleware: Unhandled Auth Exception.", authError);
    }

    if (isProtectedRoute && !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_to', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  } catch (globalError) {
    console.error("Middleware: Catastrophic failure caught.", globalError);
    
    // Ultimate Fallback: allow public routes, block protected routes
    const pathname = request.nextUrl.pathname;
    const isProtectedRoute = 
      pathname.startsWith('/founder') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/editorial') ||
      pathname.startsWith('/author');

    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Always return a valid response to prevent HTTP 500 MIDDLEWARE_INVOCATION_FAILED
    return NextResponse.next({ request });
  }
}
