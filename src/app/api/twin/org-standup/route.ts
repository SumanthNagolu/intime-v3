/**
 * Organization Standup API
 *
 * Epic: AI Twin Living Organism
 *
 * Get or generate daily standup report.
 *
 * @route GET /api/twin/org-standup
 * @route POST /api/twin/org-standup - Force regenerate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrganizationTwin } from '@/lib/ai/twins/OrganizationTwin';

/**
 * Get today's standup (generates if not exists)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id, employee_role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if user has access to standups (leadership roles)
    const leadershipRoles = ['ceo', 'admin', 'administrator', 'super_admin'];
    if (!leadershipRoles.includes(profile.employee_role?.toLowerCase() || '')) {
      return NextResponse.json(
        { error: 'Standups are only accessible to leadership roles' },
        { status: 403 }
      );
    }

    // Get standup
    const orgTwin = new OrganizationTwin(profile.org_id, user.id, undefined, {
      supabase,
    });

    const standup = await orgTwin.getTodayStandup();

    return NextResponse.json({
      success: true,
      standup,
    });
  } catch (error) {
    console.error('[OrgStandup] GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get standup' },
      { status: 500 }
    );
  }
}

/**
 * Force regenerate today's standup
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id, employee_role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if user is CEO (only CEO can regenerate)
    if (profile.employee_role?.toLowerCase() !== 'ceo') {
      return NextResponse.json(
        { error: 'Only CEO can regenerate standups' },
        { status: 403 }
      );
    }

    // Force regenerate
    const orgTwin = new OrganizationTwin(profile.org_id, user.id, undefined, {
      supabase,
    });

    const standup = await orgTwin.getTodayStandup(true);

    return NextResponse.json({
      success: true,
      standup,
      regenerated: true,
    });
  } catch (error) {
    console.error('[OrgStandup] POST Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to regenerate standup' },
      { status: 500 }
    );
  }
}
