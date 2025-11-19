/**
 * Auth Callback Route
 *
 * Handles the OAuth callback from Supabase Auth
 * Exchanges the code for a session and redirects to the app
 *
 * Epic: FOUND-005 - Configure Supabase Auth
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the specified page or dashboard
  return NextResponse.redirect(new URL(redirect, request.url));
}
