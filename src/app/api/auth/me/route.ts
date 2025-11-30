/**
 * Auth Me API
 *
 * Get current authenticated user's profile.
 * Used by client components to check auth state.
 *
 * @route GET /api/auth/me
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get current user's profile
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, employee_role, org_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        employee_role: profile.employee_role,
        org_id: profile.org_id,
      },
    });
  } catch (error) {
    console.error('[AuthMe] Error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
