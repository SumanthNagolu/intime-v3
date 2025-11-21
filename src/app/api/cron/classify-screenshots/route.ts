/**
 * Cron Job: Classify Screenshots
 *
 * Story: AI-PROD-002
 *
 * Runs daily to classify all unanalyzed screenshots.
 * Can be triggered by Vercel Cron or manually via API.
 *
 * Schedule: Daily at 2 AM (low usage time)
 *
 * @route POST /api/cron/classify-screenshots
 */

import { NextRequest, NextResponse } from 'next/server';
import { ActivityClassifierAgent } from '@/lib/ai/productivity/ActivityClassifierAgent';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution

/**
 * Verify cron secret (prevent unauthorized access)
 */
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return false;
  }

  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    console.warn('[ClassifyScreenshots] CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${expectedSecret}`;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[ClassifyScreenshots] Starting batch classification job');

    const supabase = await createClient();
    const classifier = new ActivityClassifierAgent();

    // Get all users with unanalyzed screenshots
    const { data: unanalyzedUsers, error } = await supabase
      .from('employee_screenshots')
      .select('user_id')
      .eq('analyzed', false)
      .is('deleted_at', null);

    if (error) {
      console.error('[ClassifyScreenshots] Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!unanalyzedUsers || unanalyzedUsers.length === 0) {
      console.log('[ClassifyScreenshots] No unanalyzed screenshots found');
      return NextResponse.json({
        success: true,
        message: 'No screenshots to classify',
        stats: {
          usersProcessed: 0,
          screenshotsClassified: 0,
          durationMs: Date.now() - startTime,
        },
      });
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(unanalyzedUsers.map((u) => u.user_id))];
    console.log(`[ClassifyScreenshots] Found ${uniqueUserIds.length} users with unanalyzed screenshots`);

    // Process each user
    let totalClassified = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const userId of uniqueUserIds) {
      try {
        const classified = await classifier.batchClassify(userId, today);
        totalClassified += classified;
        console.log(`[ClassifyScreenshots] User ${userId}: ${classified} screenshots classified`);
      } catch (userError) {
        console.error(`[ClassifyScreenshots] Error processing user ${userId}:`, userError);
        // Continue with next user
      }
    }

    const durationMs = Date.now() - startTime;

    console.log(
      `[ClassifyScreenshots] Job complete: ${totalClassified} screenshots classified in ${durationMs}ms`
    );

    return NextResponse.json({
      success: true,
      stats: {
        usersProcessed: uniqueUserIds.length,
        screenshotsClassified: totalClassified,
        durationMs,
      },
    });
  } catch (error) {
    console.error('[ClassifyScreenshots] Job failed:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger (for testing)
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  return POST(request);
}
