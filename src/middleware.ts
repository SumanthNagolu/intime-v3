/**
 * Next.js Middleware for Authentication
 *
 * Protects routes and refreshes Supabase sessions
 * Runs on every request matching the config below
 *
 * Epic: FOUND-005 - Configure Supabase Auth
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

// In-memory cache for user profiles (per-request is fine since middleware runs on edge)
// For production, consider Redis or similar
const profileCache = new Map<string, { orgId: string | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function middleware(request: NextRequest) {
  // Clone headers to add user context
  const requestHeaders = new Headers(request.headers);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
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
              headers: requestHeaders,
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
              headers: requestHeaders,
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
  } catch {
    // If there's an auth error (e.g., invalid refresh token), clear the user
    // Silently handle auth errors to avoid excessive logging
    user = null;

    // Clear invalid auth cookies
    const authCookies = ['sb-access-token', 'sb-refresh-token'];
    authCookies.forEach(cookieName => {
      response.cookies.delete(cookieName);
    });
  }

  // If user is authenticated, fetch and cache their org_id
  // This eliminates repeated DB lookups in tRPC context
  if (user) {
    let orgId: string | null = null;
    const cached = profileCache.get(user.id);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Use cached value
      orgId = cached.orgId;
    } else {
      // Fetch from database using service role (bypasses RLS)
      try {
        const adminClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: { autoRefreshToken: false, persistSession: false },
          }
        );

        // Single query with OR condition
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('org_id')
          .or(`id.eq.${user.id},auth_id.eq.${user.id}`)
          .limit(1)
          .maybeSingle();

        orgId = profile?.org_id || null;

        // Cache the result
        profileCache.set(user.id, { orgId, timestamp: Date.now() });
      } catch (error) {
        console.error('Middleware: Error fetching user profile:', error);
      }
    }

    // Set user context in headers for downstream use
    requestHeaders.set('x-user-id', user.id);
    if (orgId) {
      requestHeaders.set('x-org-id', orgId);
    }

    // Update response with new headers
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
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
    '/employee',
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

  // Allow users to explicitly sign out and return to login
  // Only redirect if they're on the signup page (not login)
  if (isAuthPath && user && request.nextUrl.pathname.startsWith('/signup')) {
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
