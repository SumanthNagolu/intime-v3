/**
 * Organism Health API
 *
 * Epic: AI Twin Living Organism
 *
 * Get health metrics for the twin organism.
 *
 * @route GET /api/twin/organism-health
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrganizationTwin } from '@/lib/ai/twins/OrganizationTwin';

/**
 * Get organism health metrics
 */
export async function GET(_request: NextRequest) {
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

    // Get organism health
    const orgTwin = new OrganizationTwin(profile.org_id, user.id, undefined, {
      supabase,
    });

    const health = await orgTwin.getOrganismHealth();

    return NextResponse.json({
      success: true,
      health,
    });
  } catch (error) {
    console.error('[OrganismHealth] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get organism health' },
      { status: 500 }
    );
  }
}
