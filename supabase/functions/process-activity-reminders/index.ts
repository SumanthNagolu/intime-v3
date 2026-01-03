/**
 * Activity Reminder Processor (Guidewire Pattern)
 * 
 * This edge function runs on a schedule to:
 * 1. Find activities that are due soon and haven't received a reminder
 * 2. Create reminder notifications for assigned users
 * 3. Update reminder_sent_at timestamp
 * 
 * Scheduled: Every hour
 * Trigger: pg_cron or external scheduler
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ActivityForReminder {
  id: string
  org_id: string
  subject: string
  status: string
  priority: string
  due_date: string
  assigned_to: string | null
  queue_id: string | null
  reminder_sent_at: string | null
  reminder_count: number
  snoozed_until: string | null
}

interface ReminderResult {
  activityId: string
  assignedTo: string | null
  dueDate: string
  hoursUntilDue: number
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const now = new Date()
    const results: ReminderResult[] = []
    const errors: string[] = []

    console.log(`[Reminder Processor] Starting at ${now.toISOString()}`)

    // Define reminder thresholds (hours before due)
    const reminderThresholds = [24, 4, 1] // 24 hours, 4 hours, 1 hour before due
    
    // Calculate the time window for reminders
    // We want to catch activities due within the next 24 hours
    const reminderWindowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Find activities that need reminders:
    // - Status is open or in_progress or scheduled
    // - Due date is within the reminder window
    // - Not snoozed (or snooze expired)
    // - Either no reminder sent, or reminder_count is less than threshold count
    const { data: activities, error: fetchError } = await supabase
      .from('activities')
      .select(`
        id, org_id, subject, status, priority, due_date,
        assigned_to, queue_id, reminder_sent_at, reminder_count, snoozed_until
      `)
      .in('status', ['open', 'in_progress', 'scheduled'])
      .gt('due_date', now.toISOString())
      .lt('due_date', reminderWindowEnd.toISOString())
      .or(`snoozed_until.is.null,snoozed_until.lt.${now.toISOString()}`)
      .is('deleted_at', null)
      .limit(100) // Process in batches

    if (fetchError) {
      throw new Error(`Failed to fetch activities: ${fetchError.message}`)
    }

    console.log(`[Reminder Processor] Found ${activities?.length ?? 0} activities in reminder window`)

    // Filter activities that need a reminder at this point
    const activitiesForReminder = (activities ?? []).filter((a: ActivityForReminder) => {
      const dueDate = new Date(a.due_date)
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      // No assigned user means no one to notify
      if (!a.assigned_to) return false
      
      // Determine which reminder threshold we've crossed
      let targetReminderCount = 0
      for (const threshold of reminderThresholds) {
        if (hoursUntilDue <= threshold) {
          targetReminderCount++
        }
      }
      
      // Only send if we need more reminders than we've sent
      return targetReminderCount > (a.reminder_count ?? 0)
    })

    console.log(`[Reminder Processor] ${activitiesForReminder.length} activities need reminders`)

    // Process each activity
    for (const activity of activitiesForReminder) {
      try {
        const dueDate = new Date(activity.due_date)
        const hoursUntilDue = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60) * 10) / 10

        // Determine reminder urgency message
        let urgencyMessage: string
        let notificationPriority: string
        
        if (hoursUntilDue <= 1) {
          urgencyMessage = 'due in less than 1 hour'
          notificationPriority = 'urgent'
        } else if (hoursUntilDue <= 4) {
          urgencyMessage = `due in ${Math.round(hoursUntilDue)} hours`
          notificationPriority = 'high'
        } else {
          urgencyMessage = `due in ${Math.round(hoursUntilDue)} hours`
          notificationPriority = 'normal'
        }

        const newReminderCount = (activity.reminder_count ?? 0) + 1

        // Update the activity
        const { error: updateError } = await supabase
          .from('activities')
          .update({
            reminder_sent_at: now.toISOString(),
            reminder_count: newReminderCount,
            updated_at: now.toISOString(),
          })
          .eq('id', activity.id)

        if (updateError) {
          errors.push(`Failed to update activity ${activity.id}: ${updateError.message}`)
          continue
        }

        // Create notification for assigned user
        if (activity.assigned_to) {
          await supabase
            .from('notifications')
            .insert({
              org_id: activity.org_id,
              user_id: activity.assigned_to,
              type: 'activity_reminder',
              title: 'Activity Due Soon',
              message: `"${activity.subject || 'Activity'}" is ${urgencyMessage}`,
              entity_type: 'activity',
              entity_id: activity.id,
              priority: notificationPriority,
              action_url: `/activities/${activity.id}`,
            })
        }

        results.push({
          activityId: activity.id,
          assignedTo: activity.assigned_to,
          dueDate: activity.due_date,
          hoursUntilDue,
        })

        console.log(`[Reminder Processor] Sent reminder for activity ${activity.id} (${urgencyMessage})`)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`Error processing activity ${activity.id}: ${errorMessage}`)
      }
    }

    console.log(`[Reminder Processor] Completed. Reminders sent: ${results.length}, Errors: ${errors.length}`)

    return new Response(
      JSON.stringify({
        success: true,
        processed: activitiesForReminder.length,
        remindersSent: results.length,
        errors: errors.length,
        results,
        errorDetails: errors,
        timestamp: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Reminder Processor] Fatal error:', errorMessage)
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})




