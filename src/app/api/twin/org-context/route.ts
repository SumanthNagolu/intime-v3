/**
 * Organization Context API
 *
 * Epic: AI Twin Living Organism
 *
 * Get shared organizational context.
 *
 * @route GET /api/twin/org-context
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrganizationContext } from '@/lib/ai/twins/OrganizationContext';

/**
 * Get organization context
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const contextType = searchParams.get('type') || 'all';
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Get context
    const context = new OrganizationContext(supabase);

    const data: Record<string, unknown> = {};

    if (contextType === 'all' || contextType === 'priorities') {
      data.priorities = await context.getOrgPriorities(profile.org_id, forceRefresh);
    }

    if (contextType === 'all' || contextType === 'metrics') {
      data.metrics = await context.getOrgMetrics(profile.org_id, forceRefresh);
    }

    if (contextType === 'all' || contextType === 'pillar_health') {
      data.pillarHealth = await context.getPillarHealth(profile.org_id);
    }

    if (contextType === 'all' || contextType === 'opportunities') {
      data.opportunities = await context.getCrossPollinationOpportunities(profile.org_id);
    }

    return NextResponse.json({
      success: true,
      context: data,
      type: contextType,
      refreshed: forceRefresh,
    });
  } catch (error) {
    console.error('[OrgContext] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get context' },
      { status: 500 }
    );
  }
}
