/**
 * Campaign Automation Cron Job
 *
 * Processes scheduled campaign sequence steps.
 * Called by Vercel Cron every minute.
 *
 * Security: Requires CRON_SECRET in Authorization header.
 *
 * Issue: CAMPAIGNS-01 Phase 4
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { processScheduledCampaignSteps } from '@/lib/campaigns/campaign-automation-engine'

// Runtime configuration
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max execution time
export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/campaigns
 *
 * Process all due campaign sequence steps.
 * Returns processing statistics.
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (Vercel sets this header for cron jobs)
    const headersList = await headers()
    const authHeader = headersList.get('authorization')

    // Allow if CRON_SECRET matches or if running in development
    const cronSecret = process.env.CRON_SECRET
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Cron Campaign] Unauthorized request')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Cron Campaign] Starting campaign processing...')

    const result = await processScheduledCampaignSteps()

    console.log(`[Cron Campaign] Completed: ${result.processed} processed, ${result.skipped} skipped, ${result.errors} errors`)

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron Campaign] Processing error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cron/campaigns
 *
 * Manual trigger for testing (requires API key in development).
 */
export async function POST(req: NextRequest) {
  try {
    // Only allow in development or with valid API key
    const headersList = await headers()
    const apiKey = headersList.get('x-api-key')
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev && apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await processScheduledCampaignSteps()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron Campaign] Manual trigger error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
