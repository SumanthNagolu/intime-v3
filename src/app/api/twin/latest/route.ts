/**
 * AI Twin Latest Interactions API
 *
 * Story: AI-TWIN-001
 *
 * Retrieves latest morning briefing and proactive suggestions for the authenticated user.
 *
 * @route GET /api/twin/latest
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Get latest twin interactions
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get today's morning briefing
    const { data: briefing } = await supabase
      .from('employee_twin_interactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('interaction_type', 'morning_briefing')
      .gte('created_at', `${today}T00:00:00Z`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get today's suggestions
    const { data: suggestions } = await supabase
      .from('employee_twin_interactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('interaction_type', 'suggestion')
      .gte('created_at', `${today}T00:00:00Z`)
      .eq('dismissed', false) // Only non-dismissed suggestions
      .order('created_at', { ascending: false })
      .limit(3);

    return NextResponse.json({
      success: true,
      briefing: briefing || null,
      suggestions: suggestions || [],
    });
  } catch (error) {
    console.error('[TwinLatest] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch interactions',
      },
      { status: 500 }
    );
  }
}
