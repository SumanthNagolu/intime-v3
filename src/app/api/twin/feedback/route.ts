/**
 * AI Twin Feedback API
 *
 * Story: AI-TWIN-001
 *
 * Allows users to provide feedback on twin interactions (helpful/not helpful, dismiss).
 *
 * @route POST /api/twin/feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Submit feedback for a twin interaction
 */
export async function POST(request: NextRequest) {
  try {
    const { interactionId, wasHelpful, userFeedback, dismissed } = await request.json();

    if (!interactionId) {
      return NextResponse.json({ error: 'Interaction ID is required' }, { status: 400 });
    }

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the interaction belongs to the user
    const { data: interaction, error: fetchError } = await supabase
      .from('employee_twin_interactions')
      .select('user_id')
      .eq('id', interactionId)
      .single();

    if (fetchError || !interaction) {
      return NextResponse.json({ error: 'Interaction not found' }, { status: 404 });
    }

    if (interaction.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update feedback
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof wasHelpful === 'boolean') {
      updateData.was_helpful = wasHelpful;
    }

    if (userFeedback) {
      updateData.user_feedback = userFeedback;
    }

    if (typeof dismissed === 'boolean') {
      updateData.dismissed = dismissed;
    }

    const { error: updateError } = await supabase
      .from('employee_twin_interactions')
      .update(updateData)
      .eq('id', interactionId);

    if (updateError) {
      console.error('[TwinFeedback] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded',
    });
  } catch (error) {
    console.error('[TwinFeedback] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to record feedback',
      },
      { status: 500 }
    );
  }
}
