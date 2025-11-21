/**
 * Cron Job: Generate Daily Timelines
 *
 * Story: AI-PROD-003
 *
 * Runs daily to generate productivity reports for all employees.
 * Runs after screenshot classification (at 3 AM).
 *
 * Schedule: Daily at 3 AM (1 hour after classification)
 *
 * @route POST /api/cron/generate-timelines
 */

import { NextRequest, NextResponse } from 'next/server';
import { TimelineGeneratorAgent } from '@/lib/ai/productivity/TimelineGeneratorAgent';

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
    console.warn('[GenerateTimelines] CRON_SECRET not configured');
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

    console.log('[GenerateTimelines] Starting batch timeline generation');

    const generator = new TimelineGeneratorAgent();

    // Generate reports for yesterday (classification runs at 2 AM for today's screenshots)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().split('T')[0];

    const generated = await generator.batchGenerateReports(date);

    const durationMs = Date.now() - startTime;

    console.log(
      `[GenerateTimelines] Job complete: ${generated} reports generated in ${durationMs}ms`
    );

    return NextResponse.json({
      success: true,
      stats: {
        date,
        reportsGenerated: generated,
        durationMs,
      },
    });
  } catch (error) {
    console.error('[GenerateTimelines] Job failed:', error);

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
