/**
 * Academy Reminders Cron Job
 *
 * Runs daily to:
 * - Send inactivity reminders (students inactive > 7 days)
 *
 * Security: Requires CRON_SECRET in Authorization header.
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendInactivityReminderEmail } from '@/lib/academy/email-triggers'
import { sendWhatsAppInactivityReminder } from '@/lib/whatsapp/service'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verify cron secret
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = getAdminClient()
    const stats = { inactivityReminders: 0, whatsappReminders: 0, errors: 0 }

    // Find active enrollments with students inactive > 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: enrollments } = await adminClient
      .from('path_enrollments')
      .select(`
        id,
        user_id,
        learning_paths:path_id(slug, title),
        user_profiles:user_id(first_name, last_name, email)
      `)
      .eq('status', 'active')

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ message: 'No active enrollments', stats })
    }

    // Check student progress for inactivity
    for (const enrollment of enrollments) {
      try {
        const userProfile = enrollment.user_profiles as { first_name: string; last_name: string; email: string } | null
        const pathInfo = enrollment.learning_paths as { slug: string; title: string } | null

        if (!userProfile?.email || !pathInfo) continue

        // Check last active date from student_progress
        const { data: progress } = await adminClient
          .from('student_progress')
          .select('last_active_date, current_lesson')
          .eq('student_id', enrollment.user_id)
          .single()

        if (!progress?.last_active_date) continue

        const lastActive = new Date(progress.last_active_date)
        const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

        // Only send if inactive between 7-14 days (avoid spamming)
        if (daysSinceActive >= 7 && daysSinceActive <= 14) {
          const result = await sendInactivityReminderEmail({
            to: userProfile.email,
            firstName: userProfile.first_name || 'Student',
            pathTitle: pathInfo.title,
            daysSinceActive,
          })

          if (result.success) {
            stats.inactivityReminders++
          } else {
            stats.errors++
          }

          // Also send WhatsApp reminder (fire-and-forget)
          void sendWhatsAppInactivityReminder({
            userId: enrollment.user_id,
            firstName: userProfile.first_name || 'Student',
            daysSinceActive,
          }).then(r => {
            if (r.success) stats.whatsappReminders++
          })
        }
      } catch (err) {
        console.error('[Academy Cron] Error processing enrollment:', err)
        stats.errors++
      }
    }

    return NextResponse.json({
      message: 'Academy reminders processed',
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[Academy Cron] Fatal error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
