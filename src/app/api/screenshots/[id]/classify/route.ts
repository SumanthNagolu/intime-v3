/**
 * Screenshot Classification API
 *
 * Story: AI-PROD-002
 *
 * Manually classify a single screenshot (for testing or admin use).
 *
 * @route POST /api/screenshots/[id]/classify
 */

import { NextRequest, NextResponse } from 'next/server';
import { ActivityClassifierAgent } from '@/lib/ai/productivity/ActivityClassifierAgent';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * Classify a single screenshot
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Screenshot ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify screenshot exists
    const { data: screenshot, error } = await supabase
      .from('employee_screenshots')
      .select('id, user_id, analyzed')
      .eq('id', id)
      .single();

    if (error || !screenshot) {
      return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 });
    }

    // TODO: Verify user has permission to classify (admin only)

    // Classify screenshot
    const classifier = new ActivityClassifierAgent();
    const result = await classifier.classifyScreenshot(id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[ClassifyScreenshot] Error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Classification failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Get classification status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const { data: screenshot, error } = await supabase
      .from('employee_screenshots')
      .select('id, analyzed, activity_category, confidence, analyzed_at')
      .eq('id', id)
      .single();

    if (error || !screenshot) {
      return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: screenshot.id,
        analyzed: screenshot.analyzed,
        category: screenshot.activity_category,
        confidence: screenshot.confidence,
        analyzedAt: screenshot.analyzed_at,
      },
    });
  } catch (error) {
    console.error('[GetClassification] Error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get classification',
      },
      { status: 500 }
    );
  }
}
