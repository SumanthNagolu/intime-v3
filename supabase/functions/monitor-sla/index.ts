/**
 * SLA Monitoring Edge Function
 *
 * This function is triggered by a cron job (every 15 minutes recommended)
 * to check active SLA rules and update event statuses.
 *
 * It:
 * 1. Checks all active SLA definitions
 * 2. Queries pending SLA events
 * 3. Calculates elapsed time (with business hours if configured)
 * 4. Updates event status based on escalation levels
 * 5. Triggers notifications for new escalations
 *
 * Deployment:
 * - Set up as a cron job in Supabase: https://supabase.com/docs/guides/functions/schedule-functions
 * - Recommended schedule: every 15 minutes - "*/15 * * * *"
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SlaDefinition {
  id: string
  org_id: string
  name: string
  category: string
  entity_type: string
  start_event: string
  end_event: string
  target_value: number
  target_unit: string
  business_hours_only: boolean
  exclude_weekends: boolean
  conditions: Array<{ field: string; operator: string; value: unknown }>
  status: string
}

interface EscalationLevel {
  id: string
  sla_definition_id: string
  level_number: number
  level_name: string
  trigger_percentage: number
  notify_email: boolean
  email_recipients: string[]
  notify_slack: boolean
  slack_channel: string | null
  show_badge: boolean
  badge_color: string
  add_to_report: boolean
  add_to_dashboard: boolean
  create_task: boolean
  task_assignee: string | null
  require_resolution_notes: boolean
}

interface SlaEvent {
  id: string
  org_id: string
  sla_definition_id: string
  entity_type: string
  entity_id: string
  start_time: string
  target_deadline: string
  current_level: number
  status: string
  elapsed_minutes: number
  current_percentage: number
}

interface OrgBusinessHours {
  business_hours_start: string
  business_hours_end: string
  business_timezone: string
  holiday_calendar: string[]
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const startTime = Date.now()

  try {
    const now = new Date()
    const results = {
      rulesChecked: 0,
      eventsUpdated: 0,
      notificationsSent: 0,
      newEvents: 0,
      errors: [] as string[],
    }

    // Get all active SLA definitions
    const { data: slaDefinitions, error: defError } = await supabase
      .from('sla_definitions')
      .select('*, escalation_levels:sla_escalation_levels(*)')
      .eq('status', 'active')
      .eq('is_active', true)

    if (defError) {
      throw new Error(`Failed to fetch SLA definitions: ${defError.message}`)
    }

    if (!slaDefinitions || slaDefinitions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active SLA rules found',
          ...results,
          runDurationMs: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    results.rulesChecked = slaDefinitions.length

    // Process each SLA definition
    for (const definition of slaDefinitions as (SlaDefinition & { escalation_levels: EscalationLevel[] })[]) {
      try {
        // Get business hours for this org
        const { data: orgData } = await supabase
          .from('organizations')
          .select('business_hours_start, business_hours_end, business_timezone, holiday_calendar')
          .eq('id', definition.org_id)
          .single()

        const businessHours = orgData as OrgBusinessHours | null

        // Get all pending/warning events for this definition
        const { data: events, error: eventsError } = await supabase
          .from('sla_events')
          .select('*')
          .eq('sla_definition_id', definition.id)
          .in('status', ['pending', 'warning', 'breach'])
          .is('end_time', null)

        if (eventsError) {
          results.errors.push(`Failed to fetch events for ${definition.name}: ${eventsError.message}`)
          continue
        }

        if (!events || events.length === 0) {
          // Check if we need to create new events (retroactive or new records)
          if (definition.apply_retroactive) {
            const newEventsCount = await createNewSlaEvents(supabase, definition, now)
            results.newEvents += newEventsCount
          }
          continue
        }

        // Sort escalation levels by percentage
        const levels = (definition.escalation_levels || []).sort(
          (a, b) => a.trigger_percentage - b.trigger_percentage
        )

        // Process each event
        for (const event of events as SlaEvent[]) {
          try {
            const startTime = new Date(event.start_time)
            let elapsedMinutes: number

            // Calculate elapsed time
            if (definition.business_hours_only && businessHours) {
              elapsedMinutes = calculateBusinessMinutes(
                startTime,
                now,
                businessHours
              )
            } else {
              elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60)
            }

            // Calculate target in minutes
            const targetMinutes = convertToMinutes(
              definition.target_value,
              definition.target_unit
            )

            // Calculate percentage
            const percentage = (elapsedMinutes / targetMinutes) * 100

            // Determine new status based on escalation levels
            let newStatus = event.status
            let newLevel = event.current_level

            for (const level of levels) {
              if (percentage >= level.trigger_percentage && level.level_number > newLevel) {
                newLevel = level.level_number

                // Update status based on level name or percentage
                if (level.trigger_percentage >= 100 || level.level_name.toLowerCase() === 'breach') {
                  newStatus = 'breach'
                } else if (level.trigger_percentage >= 100 && level.level_name.toLowerCase() === 'critical') {
                  newStatus = 'critical'
                } else {
                  newStatus = 'warning'
                }
              }
            }

            // Update event if status changed
            if (newStatus !== event.status || newLevel !== event.current_level ||
                Math.abs(percentage - event.current_percentage) > 1) {
              const { error: updateError } = await supabase
                .from('sla_events')
                .update({
                  status: newStatus,
                  current_level: newLevel,
                  elapsed_minutes: Math.round(elapsedMinutes),
                  current_percentage: Math.round(percentage * 100) / 100,
                  updated_at: now.toISOString(),
                })
                .eq('id', event.id)

              if (updateError) {
                results.errors.push(`Failed to update event ${event.id}: ${updateError.message}`)
                continue
              }

              results.eventsUpdated++

              // Send notification if level changed
              if (newLevel > event.current_level) {
                const notificationCount = await sendEscalationNotifications(
                  supabase,
                  definition,
                  event,
                  levels.find(l => l.level_number === newLevel)!,
                  percentage,
                  now
                )
                results.notificationsSent += notificationCount
              }
            }
          } catch (eventError) {
            results.errors.push(
              `Error processing event ${event.id}: ${eventError instanceof Error ? eventError.message : 'Unknown error'}`
            )
          }
        }
      } catch (defError) {
        results.errors.push(
          `Error processing definition ${definition.name}: ${defError instanceof Error ? defError.message : 'Unknown error'}`
        )
      }
    }

    // Log the run
    await supabase.from('sla_scheduled_runs').insert({
      last_run_at: now.toISOString(),
      rules_checked: results.rulesChecked,
      events_updated: results.eventsUpdated,
      notifications_sent: results.notificationsSent,
      errors: results.errors.length > 0 ? results.errors : null,
      run_duration_ms: Date.now() - startTime,
    })

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        runDurationMs: Date.now() - startTime,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('SLA monitoring error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Convert target value to minutes based on unit
 */
function convertToMinutes(value: number, unit: string): number {
  switch (unit) {
    case 'minutes':
      return value
    case 'hours':
    case 'business_hours':
      return value * 60
    case 'days':
    case 'business_days':
      return value * 8 * 60 // Assuming 8-hour workday
    case 'weeks':
      return value * 5 * 8 * 60 // Assuming 5-day work week
    default:
      return value * 60 // Default to hours
  }
}

/**
 * Calculate elapsed business minutes between two dates
 */
function calculateBusinessMinutes(
  startDate: Date,
  endDate: Date,
  businessHours: OrgBusinessHours
): number {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Parse business hours
  const [startHour, startMin] = (businessHours.business_hours_start || '09:00').split(':').map(Number)
  const [endHour, endMin] = (businessHours.business_hours_end || '17:00').split(':').map(Number)

  const businessStartMinutes = startHour * 60 + startMin
  const businessEndMinutes = endHour * 60 + endMin
  const businessDayMinutes = businessEndMinutes - businessStartMinutes

  const holidays = new Set(businessHours.holiday_calendar || [])

  let totalMinutes = 0
  const current = new Date(start)

  while (current < end) {
    const dayOfWeek = current.getDay()
    const dateStr = current.toISOString().split('T')[0]

    // Skip weekends and holidays
    if (dayOfWeek === 0 || dayOfWeek === 6 || holidays.has(dateStr)) {
      current.setDate(current.getDate() + 1)
      current.setHours(startHour, startMin, 0, 0)
      continue
    }

    const currentMinutes = current.getHours() * 60 + current.getMinutes()

    // If before business hours, skip to start
    if (currentMinutes < businessStartMinutes) {
      current.setHours(startHour, startMin, 0, 0)
      continue
    }

    // If after business hours, skip to next day
    if (currentMinutes >= businessEndMinutes) {
      current.setDate(current.getDate() + 1)
      current.setHours(startHour, startMin, 0, 0)
      continue
    }

    // Calculate minutes until end of business day or end date
    const nextDay = new Date(current)
    nextDay.setDate(nextDay.getDate() + 1)
    nextDay.setHours(startHour, startMin, 0, 0)

    const endOfBusinessDay = new Date(current)
    endOfBusinessDay.setHours(endHour, endMin, 0, 0)

    const stopPoint = end < endOfBusinessDay ? end : endOfBusinessDay

    if (current < stopPoint) {
      totalMinutes += (stopPoint.getTime() - current.getTime()) / (1000 * 60)
    }

    current.setDate(current.getDate() + 1)
    current.setHours(startHour, startMin, 0, 0)
  }

  return totalMinutes
}

/**
 * Create new SLA events for matching records
 */
async function createNewSlaEvents(
  supabase: ReturnType<typeof createClient>,
  definition: SlaDefinition,
  now: Date
): Promise<number> {
  try {
    // Query records that don't have SLA events yet
    const { data: existingEventIds } = await supabase
      .from('sla_events')
      .select('entity_id')
      .eq('sla_definition_id', definition.id)

    const existingIds = new Set((existingEventIds || []).map(e => e.entity_id))

    // Query matching records
    let query = supabase
      .from(definition.entity_type)
      .select('id, created_at')
      .eq('org_id', definition.org_id)
      .is('deleted_at', null)
      .limit(100)

    const { data: records, error: recordsError } = await query

    if (recordsError || !records) {
      return 0
    }

    // Filter out records that already have events
    const newRecords = records.filter((r: { id: string }) => !existingIds.has(r.id))

    if (newRecords.length === 0) {
      return 0
    }

    // Calculate target deadline based on definition
    const targetMinutes = convertToMinutes(definition.target_value, definition.target_unit)

    // Create events for new records
    const events = newRecords.map((record: { id: string; created_at: string }) => {
      const startTime = new Date(record.created_at)
      const targetDeadline = new Date(startTime.getTime() + targetMinutes * 60 * 1000)

      return {
        org_id: definition.org_id,
        sla_definition_id: definition.id,
        entity_type: definition.entity_type,
        entity_id: record.id,
        start_time: startTime.toISOString(),
        target_deadline: targetDeadline.toISOString(),
        status: 'pending',
        current_level: 0,
        elapsed_minutes: 0,
        current_percentage: 0,
      }
    })

    const { error: insertError } = await supabase
      .from('sla_events')
      .insert(events)

    if (insertError) {
      console.error('Failed to create SLA events:', insertError)
      return 0
    }

    return events.length
  } catch {
    return 0
  }
}

/**
 * Send notifications for escalation level
 */
async function sendEscalationNotifications(
  supabase: ReturnType<typeof createClient>,
  definition: SlaDefinition,
  event: SlaEvent,
  level: EscalationLevel,
  percentage: number,
  now: Date
): Promise<number> {
  let notificationCount = 0

  try {
    // Check if notification already sent for this level
    const { data: existingNotifications } = await supabase
      .from('sla_notifications')
      .select('id')
      .eq('sla_event_id', event.id)
      .eq('escalation_level', level.level_number)

    if (existingNotifications && existingNotifications.length > 0) {
      return 0 // Already notified
    }

    // Send email notifications
    if (level.notify_email && level.email_recipients && level.email_recipients.length > 0) {
      // Resolve recipient addresses
      const recipients = await resolveRecipients(
        supabase,
        level.email_recipients,
        event.entity_type,
        event.entity_id,
        definition.org_id
      )

      if (recipients.length > 0) {
        // Log the notification (actual email sending would be handled by email service)
        await supabase.from('sla_notifications').insert({
          sla_event_id: event.id,
          escalation_level: level.level_number,
          notification_type: 'email',
          recipients,
          sent_at: now.toISOString(),
        })

        notificationCount++

        // Create activity for the notification
        await supabase.from('activities').insert({
          org_id: definition.org_id,
          type: 'sla_escalation',
          title: `SLA Escalation: ${level.level_name}`,
          description: `${definition.name} reached ${Math.round(percentage)}% (${level.level_name})`,
          entity_type: event.entity_type,
          entity_id: event.entity_id,
          metadata: {
            sla_definition_id: definition.id,
            sla_event_id: event.id,
            escalation_level: level.level_number,
            percentage,
          },
        })
      }
    }

    // Send Slack notification (if configured)
    if (level.notify_slack && level.slack_channel) {
      await supabase.from('sla_notifications').insert({
        sla_event_id: event.id,
        escalation_level: level.level_number,
        notification_type: 'slack',
        recipients: [level.slack_channel],
        sent_at: now.toISOString(),
      })
      notificationCount++
    }

    return notificationCount
  } catch (error) {
    console.error('Failed to send escalation notifications:', error)
    return 0
  }
}

/**
 * Resolve recipient identifiers to email addresses
 */
async function resolveRecipients(
  supabase: ReturnType<typeof createClient>,
  recipients: string[],
  entityType: string,
  entityId: string,
  orgId: string
): Promise<string[]> {
  const resolved: string[] = []

  for (const recipient of recipients) {
    if (recipient.includes('@')) {
      // Already an email address
      resolved.push(recipient)
    } else if (recipient === 'owner') {
      // Get record owner
      const { data } = await supabase
        .from(entityType)
        .select('owner_id')
        .eq('id', entityId)
        .single()

      if (data?.owner_id) {
        const { data: user } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('id', data.owner_id)
          .single()

        if (user?.email) {
          resolved.push(user.email)
        }
      }
    } else if (recipient === 'owners_manager') {
      // Get owner's manager
      const { data } = await supabase
        .from(entityType)
        .select('owner_id')
        .eq('id', entityId)
        .single()

      if (data?.owner_id) {
        const { data: employee } = await supabase
          .from('employees')
          .select('reports_to')
          .eq('user_id', data.owner_id)
          .single()

        if (employee?.reports_to) {
          const { data: manager } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('id', employee.reports_to)
            .single()

          if (manager?.email) {
            resolved.push(manager.email)
          }
        }
      }
    } else if (recipient === 'pod_manager') {
      // Get pod manager for this record
      const { data: recordData } = await supabase
        .from(entityType)
        .select('pod_id')
        .eq('id', entityId)
        .single()

      if (recordData?.pod_id) {
        const { data: pod } = await supabase
          .from('pods')
          .select('manager_id')
          .eq('id', recordData.pod_id)
          .single()

        if (pod?.manager_id) {
          const { data: manager } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('id', pod.manager_id)
            .single()

          if (manager?.email) {
            resolved.push(manager.email)
          }
        }
      }
    } else {
      // Assume it's a user ID
      const { data: user } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', recipient)
        .single()

      if (user?.email) {
        resolved.push(user.email)
      }
    }
  }

  return [...new Set(resolved)] // Dedupe
}
