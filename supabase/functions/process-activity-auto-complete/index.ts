/**
 * Activity Auto-Complete Processor (Guidewire Pattern)
 * 
 * This edge function evaluates auto-complete conditions for activities:
 * 1. Find activities with auto_complete=true or auto_complete_condition set
 * 2. Evaluate the condition against current entity state
 * 3. Auto-complete activities where conditions are met
 * 4. Create successor activities if pattern defines them
 * 
 * Scheduled: Every 30 minutes OR triggered by webhooks
 * Trigger: pg_cron, webhooks from entity changes, or manual
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ActivityToCheck {
  id: string
  org_id: string
  subject: string
  status: string
  entity_type: string
  entity_id: string
  pattern_id: string | null
  pattern_code: string | null
  auto_complete: boolean
  auto_complete_condition: Record<string, unknown> | null
}

interface AutoCompleteResult {
  activityId: string
  reason: string
  successorCreated: boolean
  successorId: string | null
}

// Condition evaluator for auto-complete
function evaluateCondition(
  condition: Record<string, unknown>,
  entityData: Record<string, unknown>
): boolean {
  const conditionType = condition.type as string
  
  switch (conditionType) {
    case 'field_equals':
      return entityData[condition.field as string] === condition.value
      
    case 'field_not_empty':
      const fieldValue = entityData[condition.field as string]
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== ''
      
    case 'status_in':
      const allowedStatuses = condition.statuses as string[]
      return allowedStatuses.includes(entityData.status as string)
      
    case 'all_of':
      const allConditions = condition.conditions as Record<string, unknown>[]
      return allConditions.every(c => evaluateCondition(c, entityData))
      
    case 'any_of':
      const anyConditions = condition.conditions as Record<string, unknown>[]
      return anyConditions.some(c => evaluateCondition(c, entityData))
      
    case 'count_gte':
      const countField = entityData[condition.field as string]
      const countValue = Array.isArray(countField) ? countField.length : 0
      return countValue >= (condition.value as number)
      
    default:
      console.warn(`Unknown condition type: ${conditionType}`)
      return false
  }
}

// Get entity data based on entity type
async function getEntityData(
  supabase: ReturnType<typeof createClient>,
  entityType: string,
  entityId: string
): Promise<Record<string, unknown> | null> {
  let query
  
  switch (entityType) {
    case 'submission':
      query = supabase
        .from('submissions')
        .select('*')
        .eq('id', entityId)
        .single()
      break
      
    case 'candidate':
      query = supabase
        .from('candidates')
        .select('*')
        .eq('id', entityId)
        .single()
      break
      
    case 'job':
      query = supabase
        .from('jobs')
        .select('*')
        .eq('id', entityId)
        .single()
      break
      
    case 'company':
    case 'account':
      query = supabase
        .from('companies')
        .select('*')
        .eq('id', entityId)
        .single()
      break
      
    case 'placement':
      query = supabase
        .from('placements')
        .select('*')
        .eq('id', entityId)
        .single()
      break
      
    case 'campaign':
      query = supabase
        .from('campaigns')
        .select('*')
        .eq('id', entityId)
        .single()
      break
      
    default:
      return null
  }
  
  const { data, error } = await query
  if (error || !data) return null
  return data as Record<string, unknown>
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
    const results: AutoCompleteResult[] = []
    const errors: string[] = []

    // Check if this is a targeted evaluation (webhook trigger)
    let targetEntityType: string | null = null
    let targetEntityId: string | null = null
    
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        targetEntityType = body.entityType
        targetEntityId = body.entityId
      } catch {
        // No body or invalid JSON - process all
      }
    }

    console.log(`[Auto-Complete Processor] Starting at ${now.toISOString()}`)
    if (targetEntityType && targetEntityId) {
      console.log(`[Auto-Complete Processor] Targeted: ${targetEntityType}/${targetEntityId}`)
    }

    // Find activities that have auto-complete conditions
    let query = supabase
      .from('activities')
      .select(`
        id, org_id, subject, status, entity_type, entity_id,
        pattern_id, pattern_code, auto_complete, auto_complete_condition
      `)
      .in('status', ['open', 'in_progress', 'scheduled'])
      .is('deleted_at', null)
      .or('auto_complete.eq.true,auto_complete_condition.not.is.null')
      .limit(100)

    // If targeted, only check activities for that entity
    if (targetEntityType && targetEntityId) {
      query = query
        .eq('entity_type', targetEntityType)
        .eq('entity_id', targetEntityId)
    }

    const { data: activities, error: fetchError } = await query

    if (fetchError) {
      throw new Error(`Failed to fetch activities: ${fetchError.message}`)
    }

    console.log(`[Auto-Complete Processor] Found ${activities?.length ?? 0} activities with auto-complete`)

    // Group activities by entity to minimize database queries
    const activitiesByEntity = new Map<string, ActivityToCheck[]>()
    for (const activity of (activities ?? []) as ActivityToCheck[]) {
      const key = `${activity.entity_type}:${activity.entity_id}`
      if (!activitiesByEntity.has(key)) {
        activitiesByEntity.set(key, [])
      }
      activitiesByEntity.get(key)!.push(activity)
    }

    // Process each entity's activities
    for (const [entityKey, entityActivities] of activitiesByEntity) {
      const [entityType, entityId] = entityKey.split(':')
      
      // Get entity data
      const entityData = await getEntityData(supabase, entityType, entityId)
      if (!entityData) {
        console.warn(`[Auto-Complete Processor] Could not find entity: ${entityKey}`)
        continue
      }

      // Check each activity's conditions
      for (const activity of entityActivities) {
        try {
          let shouldComplete = false
          let reason = ''

          if (activity.auto_complete && !activity.auto_complete_condition) {
            // Simple auto-complete without condition - check if entity is in a "completed" state
            const completedStatuses = ['completed', 'closed', 'accepted', 'placed', 'hired']
            if (completedStatuses.includes(entityData.status as string)) {
              shouldComplete = true
              reason = `Entity status is ${entityData.status}`
            }
          } else if (activity.auto_complete_condition) {
            // Evaluate the specific condition
            shouldComplete = evaluateCondition(
              activity.auto_complete_condition,
              entityData
            )
            reason = shouldComplete 
              ? `Condition met: ${JSON.stringify(activity.auto_complete_condition)}`
              : ''
          }

          if (!shouldComplete) continue

          console.log(`[Auto-Complete Processor] Auto-completing activity ${activity.id}: ${reason}`)

          // Complete the activity
          const { error: updateError } = await supabase
            .from('activities')
            .update({
              status: 'completed',
              completed_at: now.toISOString(),
              auto_completed: true,
              outcome: 'auto_completed',
              outcome_notes: reason,
              updated_at: now.toISOString(),
            })
            .eq('id', activity.id)

          if (updateError) {
            errors.push(`Failed to complete activity ${activity.id}: ${updateError.message}`)
            continue
          }

          // Log history
          await supabase
            .from('activity_history')
            .insert({
              activity_id: activity.id,
              action: 'auto_completed',
              notes: reason,
            })

          // Check for successor activities (if pattern defines them)
          let successorCreated = false
          let successorId: string | null = null

          if (activity.pattern_id) {
            const { data: successors } = await supabase
              .from('activity_pattern_successors')
              .select(`
                *,
                successor:activity_patterns!successor_pattern_id(
                  id, code, name, description, target_days, escalation_days,
                  priority, category, instructions, checklist
                )
              `)
              .eq('pattern_id', activity.pattern_id)
              .order('order_index', { ascending: true })

            for (const successor of (successors ?? [])) {
              const pattern = successor.successor as Record<string, unknown>
              if (!pattern) continue

              // Check condition for creating successor
              let createSuccessor = successor.condition_type === 'always'
              if (successor.condition_type === 'field_equals') {
                createSuccessor = entityData[successor.condition_field] === successor.condition_value
              }

              if (!createSuccessor) continue

              const targetDays = (pattern.target_days as number) || 1
              const delayDays = (successor.delay_days as number) || 0
              const dueDate = new Date(now.getTime() + (targetDays + delayDays) * 24 * 60 * 60 * 1000)

              const { data: newActivity, error: createError } = await supabase
                .from('activities')
                .insert({
                  org_id: activity.org_id,
                  entity_type: activity.entity_type,
                  entity_id: activity.entity_id,
                  activity_type: 'task',
                  pattern_id: pattern.id,
                  pattern_code: pattern.code,
                  subject: pattern.name,
                  description: pattern.description,
                  instructions: pattern.instructions,
                  checklist: pattern.checklist,
                  priority: pattern.priority || 'normal',
                  category: pattern.category,
                  status: 'open',
                  due_date: dueDate.toISOString(),
                  predecessor_activity_id: activity.id,
                  auto_created: true,
                })
                .select('id')
                .single()

              if (!createError && newActivity) {
                successorCreated = true
                successorId = newActivity.id
                console.log(`[Auto-Complete Processor] Created successor activity ${newActivity.id}`)
              }
            }
          }

          results.push({
            activityId: activity.id,
            reason,
            successorCreated,
            successorId,
          })
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          errors.push(`Error processing activity ${activity.id}: ${errorMessage}`)
        }
      }
    }

    console.log(`[Auto-Complete Processor] Completed. Auto-completed: ${results.length}, Errors: ${errors.length}`)

    return new Response(
      JSON.stringify({
        success: true,
        processed: activities?.length ?? 0,
        autoCompleted: results.length,
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
    console.error('[Auto-Complete Processor] Fatal error:', errorMessage)
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})


