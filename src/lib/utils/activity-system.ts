/**
 * Activity System Utilities (Guidewire-Inspired)
 *
 * Core functions for the activity management system:
 * - ensureOpenActivity: Creates watchlist activity if none exist
 * - checkBlockingActivities: Validates status changes against blocking activities
 * - getManagerForEscalation: Finds the escalation target (supervisor)
 * - isClosingStatus: Determines if a status is a "closing" status
 *
 * Database columns required (add via Supabase Studio):
 * - activities.is_blocking: boolean DEFAULT false
 * - activities.blocking_statuses: text[] DEFAULT '{}'
 * - activities.escalated_to_user_id: uuid REFERENCES user_profiles(id)
 * - activities.original_assigned_to: uuid REFERENCES user_profiles(id)
 * - activity_patterns.is_blocking: boolean DEFAULT false
 * - activity_patterns.blocking_statuses: jsonb DEFAULT '[]'
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// ============================================
// TYPES
// ============================================

export interface BlockingActivity {
  id: string
  subject: string | null
  status: string
  priority: string
  dueDate: string | null
  assignedTo: {
    id: string
    firstName: string
    lastName: string
  } | null
  blockingStatuses: string[]
}

export interface EnsureOpenActivityResult {
  created: boolean
  activityId?: string
  existingCount: number
}

export interface CheckBlockingResult {
  blocked: boolean
  activities: BlockingActivity[]
}

// ============================================
// CLOSING STATUS DEFINITIONS
// ============================================

/**
 * Define which statuses are considered "closing" statuses for each entity type.
 * Blocking activities only prevent transitions to these statuses.
 */
const CLOSING_STATUSES: Record<string, string[]> = {
  account: ['inactive', 'closed', 'churned', 'lost'],
  job: ['closed', 'cancelled', 'filled', 'on_hold'],
  submission: ['rejected', 'withdrawn', 'declined'],
  placement: ['terminated', 'ended', 'cancelled'],
  candidate: ['inactive', 'archived', 'do_not_contact'],
  lead: ['closed', 'lost', 'disqualified', 'converted'],
  deal: ['closed_lost', 'closed_won', 'cancelled'],
  campaign: ['completed', 'cancelled', 'archived'],
}

/**
 * Check if a status is a "closing" status for the given entity type.
 */
export function isClosingStatus(entityType: string, status: string): boolean {
  const closingStatuses = CLOSING_STATUSES[entityType] || []
  return closingStatuses.includes(status.toLowerCase())
}

/**
 * Get the list of closing statuses for an entity type.
 */
export function getClosingStatuses(entityType: string): string[] {
  return CLOSING_STATUSES[entityType] || []
}

// ============================================
// ENSURE OPEN ACTIVITY
// ============================================

/**
 * Ensures an entity has at least one open activity.
 * If no open/in_progress activities exist, creates a "Watchlist" activity
 * assigned to the entity's owner.
 *
 * @param params - Parameters for ensuring open activity
 * @returns Result indicating if activity was created
 */
export async function ensureOpenActivity(params: {
  entityType: string
  entityId: string
  orgId: string
  ownerId: string
  ownerName?: string
  supabase: SupabaseClient
}): Promise<EnsureOpenActivityResult> {
  const { entityType, entityId, orgId, ownerId, supabase } = params

  // 1. Count existing open/in_progress activities
  const { count, error: countError } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .in('status', ['open', 'in_progress', 'scheduled'])
    .is('deleted_at', null)

  if (countError) {
    console.error('[ensureOpenActivity] Count error:', countError)
    throw new Error(`Failed to count activities: ${countError.message}`)
  }

  const existingCount = count ?? 0

  // 2. If activities exist, no need to create
  if (existingCount > 0) {
    return { created: false, existingCount }
  }

  // 3. Get the watchlist pattern for this entity type
  const patternCode = `sys_watchlist_${entityType}`
  const { data: pattern } = await supabase
    .from('activity_patterns')
    .select('id, code, name, target_days, priority, instructions, checklist')
    .eq('code', patternCode)
    .eq('is_active', true)
    .single()

  // 4. Calculate due date
  const targetDays = pattern?.target_days ?? 30
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + targetDays)

  // 5. Create the watchlist activity
  const { data: activity, error: insertError } = await supabase
    .from('activities')
    .insert({
      org_id: orgId,
      entity_type: entityType,
      entity_id: entityId,
      activity_type: 'task',
      subject: pattern?.name || 'Watchlist',
      description: `Auto-created: This ${entityType} requires attention. No open activities existed.`,
      instructions: pattern?.instructions,
      status: 'open',
      priority: pattern?.priority || 'low',
      due_date: dueDate.toISOString(),
      assigned_to: ownerId,
      pattern_id: pattern?.id,
      pattern_code: patternCode,
      auto_created: true,
      checklist: pattern?.checklist,
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[ensureOpenActivity] Insert error:', insertError)
    throw new Error(`Failed to create watchlist activity: ${insertError.message}`)
  }

  return {
    created: true,
    activityId: activity.id,
    existingCount: 0,
  }
}

// ============================================
// CHECK BLOCKING ACTIVITIES
// ============================================

/**
 * Check if there are blocking activities preventing a status change.
 * Only checks if the target status is a "closing" status.
 *
 * @param params - Parameters for checking blocking activities
 * @returns Result with blocked flag and list of blocking activities
 */
export async function checkBlockingActivities(params: {
  entityType: string
  entityId: string
  targetStatus: string
  orgId: string
  supabase: SupabaseClient
}): Promise<CheckBlockingResult> {
  const { entityType, entityId, targetStatus, orgId, supabase } = params

  // 1. Only check blocking for closing statuses
  if (!isClosingStatus(entityType, targetStatus)) {
    return { blocked: false, activities: [] }
  }

  // 2. Find all blocking activities for this entity
  const { data: activities, error } = await supabase
    .from('activities')
    .select(`
      id,
      subject,
      status,
      priority,
      due_date,
      is_blocking,
      blocking_statuses,
      assigned_to,
      user_profiles!activities_assigned_to_fkey (
        id,
        first_name,
        last_name
      )
    `)
    .eq('org_id', orgId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .in('status', ['open', 'in_progress', 'scheduled'])
    .eq('is_blocking', true)
    .is('deleted_at', null)

  if (error) {
    console.error('[checkBlockingActivities] Query error:', error)
    throw new Error(`Failed to check blocking activities: ${error.message}`)
  }

  if (!activities || activities.length === 0) {
    return { blocked: false, activities: [] }
  }

  // 3. Filter to activities that block the target status
  const blockingActivities: BlockingActivity[] = activities
    .filter((activity) => {
      const blockingStatuses = activity.blocking_statuses as string[] | null
      // If no specific blocking_statuses defined, blocks all closing statuses
      if (!blockingStatuses || blockingStatuses.length === 0) {
        return true
      }
      // Check if target status is in the blocking list
      return blockingStatuses.includes(targetStatus.toLowerCase())
    })
    .map((activity) => {
      // Handle user_profiles join (can be single object or array depending on relationship)
      const userProfile = activity.user_profiles as unknown as
        | { id: string; first_name: string; last_name: string }
        | null

      return {
        id: activity.id,
        subject: activity.subject,
        status: activity.status,
        priority: activity.priority,
        dueDate: activity.due_date,
        blockingStatuses: (activity.blocking_statuses as string[]) || [],
        assignedTo: userProfile
          ? {
              id: userProfile.id,
              firstName: userProfile.first_name,
              lastName: userProfile.last_name,
            }
          : null,
      }
    })

  return {
    blocked: blockingActivities.length > 0,
    activities: blockingActivities,
  }
}

// ============================================
// MANAGER ESCALATION LOOKUP
// ============================================

/**
 * Get the manager/supervisor for escalation based on the escalation level.
 *
 * Escalation chain:
 * - Level 1: User's direct manager (employee_manager_id)
 * - Level 2: User's pod manager (via pod membership)
 * - Level 3+: Chain up through managers
 *
 * @param params - Parameters for finding escalation target
 * @returns User ID of the escalation target, or null if none found
 */
export async function getManagerForEscalation(params: {
  userId: string
  orgId: string
  escalationLevel: number
  supabase: SupabaseClient
}): Promise<string | null> {
  const { userId, orgId, escalationLevel, supabase } = params

  // 1. Get the user's profile with manager info
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      employee_manager_id,
      recruiter_pod_id,
      manager_id
    `)
    .eq('id', userId)
    .single()

  if (userError || !user) {
    console.error('[getManagerForEscalation] User lookup error:', userError)
    return null
  }

  // 2. Level 1: Direct manager
  if (escalationLevel <= 1) {
    // Try employee_manager_id first, then manager_id
    const directManager = user.employee_manager_id || user.manager_id
    if (directManager && directManager !== userId) {
      return directManager
    }
  }

  // 3. Level 2+: Pod manager
  if (user.recruiter_pod_id) {
    const { data: pod } = await supabase
      .from('pods')
      .select('manager_id')
      .eq('id', user.recruiter_pod_id)
      .single()

    if (pod?.manager_id && pod.manager_id !== userId) {
      return pod.manager_id
    }
  }

  // 4. Level 3+: Chain up through managers
  if (escalationLevel >= 3 && (user.employee_manager_id || user.manager_id)) {
    const managerId = user.employee_manager_id || user.manager_id
    if (managerId) {
      // Recursively get the manager's manager
      return getManagerForEscalation({
        userId: managerId,
        orgId,
        escalationLevel: escalationLevel - 1,
        supabase,
      })
    }
  }

  // 5. Fallback: Try to find any org admin
  const { data: orgAdmin } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('org_id', orgId)
    .eq('role', 'admin')
    .neq('id', userId)
    .limit(1)
    .single()

  return orgAdmin?.id || null
}

// ============================================
// ENTITY OWNER LOOKUP
// ============================================

/**
 * Get the owner of an entity for activity assignment.
 *
 * @param params - Parameters for finding entity owner
 * @returns User ID of the entity owner, or null if not found
 */
export async function getEntityOwner(params: {
  entityType: string
  entityId: string
  orgId: string
  supabase: SupabaseClient
}): Promise<string | null> {
  const { entityType, entityId, orgId, supabase } = params

  // Map entity types to their tables and owner fields
  const entityConfig: Record<string, { table: string; ownerField: string }> = {
    account: { table: 'companies', ownerField: 'owner_id' },
    company: { table: 'companies', ownerField: 'owner_id' },
    job: { table: 'jobs', ownerField: 'owner_id' },
    submission: { table: 'submissions', ownerField: 'owner_id' },
    candidate: { table: 'candidates', ownerField: 'owner_id' },
    placement: { table: 'placements', ownerField: 'recruiter_id' },
    lead: { table: 'leads', ownerField: 'owner_id' },
    deal: { table: 'deals', ownerField: 'owner_id' },
    contact: { table: 'contacts', ownerField: 'owner_id' },
    campaign: { table: 'campaigns', ownerField: 'owner_id' },
  }

  const config = entityConfig[entityType]
  if (!config) {
    console.warn(`[getEntityOwner] Unknown entity type: ${entityType}`)
    return null
  }

  const { data, error } = await supabase
    .from(config.table)
    .select(config.ownerField)
    .eq('id', entityId)
    .eq('org_id', orgId)
    .single()

  if (error || !data) {
    console.error(`[getEntityOwner] Lookup error for ${entityType}:`, error)
    return null
  }

  return data[config.ownerField as keyof typeof data] as string | null
}

// ============================================
// ACTIVITY CREATION FROM ACTION ITEMS
// ============================================

export interface ActionItemData {
  title: string
  description?: string
  dueDate?: Date | string
  assignedTo?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

/**
 * Create an activity from a meeting or escalation action item.
 *
 * @param params - Parameters for creating activity from action item
 * @returns The created activity ID
 */
export async function createActivityFromActionItem(params: {
  sourceType: 'meeting' | 'escalation'
  sourceId: string
  accountId: string
  actionItem: ActionItemData
  orgId: string
  userId: string
  supabase: SupabaseClient
}): Promise<{ activityId: string }> {
  const { sourceType, sourceId, accountId, actionItem, orgId, userId, supabase } = params

  // Calculate due date
  let dueDate: string | undefined
  if (actionItem.dueDate) {
    dueDate = actionItem.dueDate instanceof Date
      ? actionItem.dueDate.toISOString()
      : new Date(actionItem.dueDate).toISOString()
  }

  // Create the activity
  const { data: activity, error } = await supabase
    .from('activities')
    .insert({
      org_id: orgId,
      entity_type: sourceType,
      entity_id: sourceId,
      secondary_entity_type: 'account',
      secondary_entity_id: accountId,
      activity_type: 'task',
      subject: actionItem.title,
      description: actionItem.description,
      status: 'open',
      priority: actionItem.priority || 'normal',
      due_date: dueDate,
      assigned_to: actionItem.assignedTo || userId,
      created_by: userId,
      auto_created: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[createActivityFromActionItem] Insert error:', error)
    throw new Error(`Failed to create activity: ${error.message}`)
  }

  return { activityId: activity.id }
}
