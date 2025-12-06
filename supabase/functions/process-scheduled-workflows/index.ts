/**
 * Process Scheduled Workflows Edge Function
 *
 * This function is triggered by a cron job (e.g., every minute) to check
 * for scheduled workflows that should run based on their cron expressions.
 *
 * Deployment:
 * - Set up as a cron job in Supabase: https://supabase.com/docs/guides/functions/schedule-functions
 * - Recommended schedule: every minute "* * * * *"
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduledWorkflow {
  id: string
  org_id: string
  name: string
  entity_type: string
  trigger_conditions: {
    conditions: Array<{
      field: string
      operator: string
      value: unknown
      valueEnd?: unknown
    }>
    logic: 'and' | 'or'
  }
  schedule_config: {
    cron: string
    timezone: string
  }
  last_scheduled_run?: string
}

interface CronPart {
  type: 'value' | 'any' | 'range' | 'step' | 'list'
  values?: number[]
  from?: number
  to?: number
  step?: number
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

  try {
    const now = new Date()
    const results: Array<{
      workflowId: string
      workflowName: string
      status: 'triggered' | 'skipped' | 'error'
      executionsCreated?: number
      error?: string
    }> = []

    // Get all active scheduled workflows
    const { data: workflows, error: workflowsError } = await supabase
      .from('workflows')
      .select('id, org_id, name, entity_type, trigger_conditions, schedule_config')
      .eq('workflow_type', 'scheduled')
      .eq('status', 'active')
      .not('schedule_config', 'is', null)

    if (workflowsError) {
      throw new Error(`Failed to fetch workflows: ${workflowsError.message}`)
    }

    if (!workflows || workflows.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No scheduled workflows found',
          processed: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get last run times from a tracking table
    const { data: runHistory } = await supabase
      .from('workflow_scheduled_runs')
      .select('workflow_id, last_run_at')
      .in('workflow_id', workflows.map(w => w.id))

    const lastRunMap = new Map(
      (runHistory || []).map(r => [r.workflow_id, new Date(r.last_run_at)])
    )

    // Process each workflow
    for (const workflow of workflows as ScheduledWorkflow[]) {
      try {
        const { schedule_config } = workflow

        if (!schedule_config?.cron) {
          results.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            status: 'skipped',
            error: 'No cron expression configured',
          })
          continue
        }

        // Check if should run based on cron expression
        const shouldRun = cronMatches(schedule_config.cron, now, schedule_config.timezone)
        const lastRun = lastRunMap.get(workflow.id)

        // Skip if already ran this minute
        if (lastRun) {
          const lastRunMinute = Math.floor(lastRun.getTime() / 60000)
          const currentMinute = Math.floor(now.getTime() / 60000)
          if (lastRunMinute === currentMinute) {
            results.push({
              workflowId: workflow.id,
              workflowName: workflow.name,
              status: 'skipped',
              error: 'Already ran this minute',
            })
            continue
          }
        }

        if (!shouldRun) {
          results.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            status: 'skipped',
          })
          continue
        }

        // Get matching records to trigger on
        const { data: records, error: recordsError } = await fetchMatchingRecords(
          supabase,
          workflow.entity_type,
          workflow.org_id,
          workflow.trigger_conditions
        )

        if (recordsError) {
          results.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            status: 'error',
            error: `Failed to fetch records: ${recordsError}`,
          })
          continue
        }

        if (!records || records.length === 0) {
          // Update last run time even if no records match
          await upsertScheduledRun(supabase, workflow.id, now)
          results.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            status: 'triggered',
            executionsCreated: 0,
          })
          continue
        }

        // Create executions for each matching record
        const executions = records.map(record => ({
          org_id: workflow.org_id,
          workflow_id: workflow.id,
          workflow_version: 1,
          entity_type: workflow.entity_type,
          entity_id: record.id,
          status: 'in_progress',
          started_at: now.toISOString(),
          metadata: {
            triggered_by: 'scheduled',
            schedule_config: schedule_config,
            trigger_time: now.toISOString(),
          },
        }))

        const { error: insertError } = await supabase
          .from('workflow_executions')
          .insert(executions)

        if (insertError) {
          results.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            status: 'error',
            error: `Failed to create executions: ${insertError.message}`,
          })
          continue
        }

        // Update last run time
        await upsertScheduledRun(supabase, workflow.id, now)

        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          status: 'triggered',
          executionsCreated: executions.length,
        })
      } catch (error) {
        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const triggered = results.filter(r => r.status === 'triggered')
    const totalExecutions = triggered.reduce((sum, r) => sum + (r.executionsCreated || 0), 0)

    return new Response(
      JSON.stringify({
        success: true,
        processed: workflows.length,
        triggered: triggered.length,
        totalExecutions,
        results,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Scheduled workflow processing error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Check if a cron expression matches the given date/time
 */
function cronMatches(cronExpr: string, date: Date, timezone?: string): boolean {
  try {
    // Adjust for timezone if specified
    let checkDate = date
    if (timezone) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        const parts = formatter.formatToParts(date)
        const getPart = (type: string) => parts.find(p => p.type === type)?.value
        checkDate = new Date(
          parseInt(getPart('year') || '0'),
          parseInt(getPart('month') || '1') - 1,
          parseInt(getPart('day') || '1'),
          parseInt(getPart('hour') || '0'),
          parseInt(getPart('minute') || '0')
        )
      } catch {
        // Fall back to UTC if timezone parsing fails
      }
    }

    const parts = cronExpr.trim().split(/\s+/)
    if (parts.length !== 5) {
      console.error(`Invalid cron expression: ${cronExpr}`)
      return false
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

    // Check each part
    const currentMinute = checkDate.getMinutes()
    const currentHour = checkDate.getHours()
    const currentDay = checkDate.getDate()
    const currentMonth = checkDate.getMonth() + 1
    const currentDayOfWeek = checkDate.getDay()

    return (
      matchesCronPart(minute, currentMinute, 0, 59) &&
      matchesCronPart(hour, currentHour, 0, 23) &&
      matchesCronPart(dayOfMonth, currentDay, 1, 31) &&
      matchesCronPart(month, currentMonth, 1, 12) &&
      matchesCronPart(dayOfWeek, currentDayOfWeek, 0, 6)
    )
  } catch {
    return false
  }
}

/**
 * Check if a cron part matches a value
 */
function matchesCronPart(cronPart: string, value: number, min: number, max: number): boolean {
  // Wildcard matches everything
  if (cronPart === '*') {
    return true
  }

  // Handle comma-separated values (e.g., "1,2,3")
  if (cronPart.includes(',')) {
    const values = cronPart.split(',').map(v => parseCronValue(v, min, max))
    return values.some(v => v === value)
  }

  // Handle range (e.g., "1-5")
  if (cronPart.includes('-') && !cronPart.includes('/')) {
    const [start, end] = cronPart.split('-').map(v => parseCronValue(v, min, max))
    return value >= start && value <= end
  }

  // Handle step (e.g., "*/5" or "0-30/5")
  if (cronPart.includes('/')) {
    const [range, stepStr] = cronPart.split('/')
    const step = parseInt(stepStr)
    if (isNaN(step) || step <= 0) return false

    let rangeStart = min
    let rangeEnd = max

    if (range !== '*') {
      if (range.includes('-')) {
        [rangeStart, rangeEnd] = range.split('-').map(v => parseCronValue(v, min, max))
      } else {
        rangeStart = parseCronValue(range, min, max)
      }
    }

    if (value < rangeStart || value > rangeEnd) return false
    return (value - rangeStart) % step === 0
  }

  // Handle single value
  return parseCronValue(cronPart, min, max) === value
}

/**
 * Parse a cron value, handling day/month names
 */
function parseCronValue(value: string, min: number, max: number): number {
  // Handle day of week names
  const dayNames: Record<string, number> = {
    sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
  }
  if (dayNames[value.toLowerCase()] !== undefined) {
    return dayNames[value.toLowerCase()]
  }

  // Handle month names
  const monthNames: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  }
  if (monthNames[value.toLowerCase()] !== undefined) {
    return monthNames[value.toLowerCase()]
  }

  const parsed = parseInt(value)
  return isNaN(parsed) ? min : Math.max(min, Math.min(max, parsed))
}

/**
 * Fetch records matching trigger conditions
 */
async function fetchMatchingRecords(
  supabase: ReturnType<typeof createClient>,
  entityType: string,
  orgId: string,
  conditions: ScheduledWorkflow['trigger_conditions']
): Promise<{ data: Array<{ id: string }> | null; error: string | null }> {
  try {
    let query = supabase
      .from(entityType)
      .select('id')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .limit(1000) // Safety limit

    // Apply conditions if any
    if (conditions?.conditions && conditions.conditions.length > 0) {
      for (const condition of conditions.conditions) {
        query = applyConditionToQuery(query, condition)
      }
    }

    const { data, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as Array<{ id: string }>, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Apply a condition to a Supabase query
 */
function applyConditionToQuery(
  query: ReturnType<typeof createClient>['from'],
  condition: { field: string; operator: string; value: unknown; valueEnd?: unknown }
): ReturnType<typeof createClient>['from'] {
  const { field, operator, value } = condition

  switch (operator) {
    case 'eq':
      return query.eq(field, value)
    case 'neq':
      return query.neq(field, value)
    case 'gt':
      return query.gt(field, value)
    case 'lt':
      return query.lt(field, value)
    case 'gte':
      return query.gte(field, value)
    case 'lte':
      return query.lte(field, value)
    case 'contains':
      return query.ilike(field, `%${value}%`)
    case 'starts_with':
      return query.ilike(field, `${value}%`)
    case 'ends_with':
      return query.ilike(field, `%${value}`)
    case 'is_empty':
      return query.is(field, null)
    case 'is_not_empty':
      return query.not(field, 'is', null)
    case 'in':
      return query.in(field, Array.isArray(value) ? value : [value])
    case 'not_in':
      return query.not(field, 'in', `(${Array.isArray(value) ? value.join(',') : value})`)
    default:
      return query
  }
}

/**
 * Update or insert the last scheduled run time
 */
async function upsertScheduledRun(
  supabase: ReturnType<typeof createClient>,
  workflowId: string,
  runTime: Date
): Promise<void> {
  await supabase
    .from('workflow_scheduled_runs')
    .upsert(
      {
        workflow_id: workflowId,
        last_run_at: runTime.toISOString(),
      },
      { onConflict: 'workflow_id' }
    )
}
