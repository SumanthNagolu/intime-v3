/**
 * Next.js Middleware for Authentication
 *
 * Protects routes and refreshes Supabase sessions
 * Runs on every request matching the config below
 *
 * Epic: FOUND-005 - Configure Supabase Auth
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if needed
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    // If there's an auth error (e.g., invalid refresh token), clear the user
    console.error('Auth error in middleware:', error);
    user = null;

    // Clear invalid auth cookies
    const authCookies = ['sb-access-token', 'sb-refresh-token'];
    authCookies.forEach(cookieName => {
      response.cookies.delete(cookieName);
    });
  }

  // Define protected paths that require authentication
  // TEMPORARY: Allow /students/dashboard and /students/profile without auth for development
  const allowWithoutAuth = ['/students/dashboard', '/students/profile'];
  const isAllowedWithoutAuth = allowWithoutAuth.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );
  
  const protectedPaths = [
    '/dashboard',
    '/admin',
    '/students',
    '/employees',
    '/candidates',
    '/clients',
    '/recruiting',
    '/placements',
    // Note: /academy is public (landing pages), but /students is protected
  ];

  // Define auth paths (redirect if already logged in)
  const authPaths = ['/login', '/signup'];

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect to login if accessing protected path without authentication
  // TEMPORARY: Skip auth check for development routes
  if (isProtectedPath && !user && !isAllowedWithoutAuth) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Copy cookies to preserve session
    const cookiesToSet = response.cookies.getAll();
    cookiesToSet.forEach(cookie => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isAuthPath && user) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));

    // Copy cookies to preserve session
    const cookiesToSet = response.cookies.getAll();
    cookiesToSet.forEach(cookie => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - files with extensions (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
