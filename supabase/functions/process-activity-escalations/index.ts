/**
 * Activity Escalation Processor (Guidewire Pattern)
 * 
 * This edge function runs on a schedule to:
 * 1. Find overdue activities that need escalation
 * 2. Increment escalation level and update priority
 * 3. Optionally reassign to supervisor or queue
 * 4. Create escalation history record
 * 5. Send notifications
 * 
 * Scheduled: Every 15 minutes
 * Trigger: pg_cron or external scheduler
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ActivityToEscalate {
  id: string
  org_id: string
  subject: string
  status: string
  priority: string
  due_date: string
  escalation_date: string | null
  escalation_count: number
  assigned_to: string | null
  queue_id: string | null
  pattern_id: string | null
}

interface EscalationResult {
  activityId: string
  previousLevel: number
  newLevel: number
  newPriority: string
  reassignedTo: string | null
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
    const results: EscalationResult[] = []
    const errors: string[] = []

    console.log(`[Escalation Processor] Starting at ${now.toISOString()}`)

    // Find activities that need escalation:
    // - Status is open or in_progress
    // - Due date has passed
    // - Not snoozed (or snooze expired)
    // - Has an escalation date that has passed OR no escalation date but pattern defines one
    const { data: activities, error: fetchError } = await supabase
      .from('activities')
      .select(`
        id, org_id, subject, status, priority, due_date, 
        escalation_date, escalation_count, assigned_to, queue_id, pattern_id,
        snoozed_until
      `)
      .in('status', ['open', 'in_progress', 'scheduled'])
      .lt('due_date', now.toISOString())
      .or(`snoozed_until.is.null,snoozed_until.lt.${now.toISOString()}`)
      .is('deleted_at', null)
      .limit(100) // Process in batches

    if (fetchError) {
      throw new Error(`Failed to fetch activities: ${fetchError.message}`)
    }

    console.log(`[Escalation Processor] Found ${activities?.length ?? 0} overdue activities`)

    // Filter activities that are ready for escalation
    // An activity is ready if:
    // 1. Its escalation_date has passed, OR
    // 2. It's been overdue for more than 24 hours without escalation
    const activitiesToEscalate = (activities ?? []).filter((a: ActivityToEscalate) => {
      // If escalation_date is set and passed
      if (a.escalation_date && new Date(a.escalation_date) < now) {
        return true
      }
      
      // If no escalation_date but due_date passed by more than 24 hours
      const dueDate = new Date(a.due_date)
      const hoursOverdue = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60)
      
      // Escalate if overdue by more than 24 hours and not yet escalated at this level
      const escalationIntervalHours = 24 // Base interval
      const adjustedInterval = escalationIntervalHours * Math.pow(0.75, a.escalation_count) // Shorter intervals at higher levels
      
      return hoursOverdue > adjustedInterval * (a.escalation_count + 1)
    })

    console.log(`[Escalation Processor] ${activitiesToEscalate.length} activities need escalation`)

    // Process each activity
    for (const activity of activitiesToEscalate) {
      try {
        const newLevel = (activity.escalation_count ?? 0) + 1
        
        // Determine new priority based on escalation level
        let newPriority = activity.priority
        if (newLevel >= 3) {
          newPriority = 'urgent'
        } else if (newLevel >= 2 && activity.priority !== 'urgent') {
          newPriority = 'high'
        } else if (newLevel >= 1 && activity.priority === 'low') {
          newPriority = 'normal'
        }

        // Calculate next escalation date
        const nextEscalationHours = Math.max(4, 24 / Math.pow(2, newLevel - 1)) // 24h, 12h, 6h, 4h minimum
        const nextEscalationDate = new Date(now.getTime() + nextEscalationHours * 60 * 60 * 1000)

        // Update the activity
        const { error: updateError } = await supabase
          .from('activities')
          .update({
            escalation_count: newLevel,
            last_escalated_at: now.toISOString(),
            escalation_date: nextEscalationDate.toISOString(),
            priority: newPriority,
            updated_at: now.toISOString(),
          })
          .eq('id', activity.id)

        if (updateError) {
          errors.push(`Failed to update activity ${activity.id}: ${updateError.message}`)
          continue
        }

        // Log escalation record
        await supabase
          .from('activity_escalations')
          .insert({
            activity_id: activity.id,
            org_id: activity.org_id,
            escalation_level: newLevel,
            escalated_from_user: activity.assigned_to,
            reason: `Automatic escalation - overdue since ${activity.due_date}`,
            escalation_type: 'automatic',
          })

        // Log history
        await supabase
          .from('activity_history')
          .insert({
            activity_id: activity.id,
            action: 'escalated',
            field_changed: 'escalation_count',
            old_value: activity.escalation_count?.toString(),
            new_value: newLevel.toString(),
            notes: `Automatic escalation to level ${newLevel}`,
          })

        // Create notification for assigned user (if any)
        if (activity.assigned_to) {
          await supabase
            .from('notifications')
            .insert({
              org_id: activity.org_id,
              user_id: activity.assigned_to,
              type: 'activity_escalated',
              title: 'Activity Escalated',
              message: `"${activity.subject || 'Activity'}" has been escalated to level ${newLevel}`,
              entity_type: 'activity',
              entity_id: activity.id,
              priority: newPriority === 'urgent' ? 'high' : 'normal',
            })
        }

        results.push({
          activityId: activity.id,
          previousLevel: activity.escalation_count ?? 0,
          newLevel,
          newPriority,
          reassignedTo: null,
        })

        console.log(`[Escalation Processor] Escalated activity ${activity.id} to level ${newLevel}`)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`Error processing activity ${activity.id}: ${errorMessage}`)
      }
    }

    console.log(`[Escalation Processor] Completed. Escalated: ${results.length}, Errors: ${errors.length}`)

    return new Response(
      JSON.stringify({
        success: true,
        processed: activitiesToEscalate.length,
        escalated: results.length,
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
    console.error('[Escalation Processor] Fatal error:', errorMessage)
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})


