/**
 * Action Executor
 *
 * Executes workflow actions based on their type and configuration.
 * Supports:
 * - Field updates
 * - Notifications
 * - Activity creation
 * - Webhook calls
 * - Workflow chaining
 * - User assignment
 * - Task creation
 */

import { createClient } from '@supabase/supabase-js'
import {
  type ActionType,
  type ActionConfig,
  type EntityType,
  type WorkflowExecutionRow,
} from './types'

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

export interface ActionExecutionContext {
  orgId: string
  entityType: EntityType
  entityId: string
  record: Record<string, unknown>
  execution: WorkflowExecutionRow
  user?: { id: string }
}

export interface ActionResult {
  success: boolean
  actionType: ActionType
  message?: string
  error?: string
  data?: Record<string, unknown>
}

/**
 * Main function to execute an action
 */
export async function executeAction(
  actionType: ActionType,
  config: ActionConfig,
  context: ActionExecutionContext
): Promise<ActionResult> {
  try {
    switch (actionType) {
      case 'update_field':
        return await executeUpdateField(config, context)

      case 'send_notification':
        return await executeSendNotification(config, context)

      case 'create_activity':
        return await executeCreateActivity(config, context)

      case 'trigger_webhook':
        return await executeTriggerWebhook(config, context)

      case 'run_workflow':
        return await executeRunWorkflow(config, context)

      case 'assign_user':
        return await executeAssignUser(config, context)

      case 'create_task':
        return await executeCreateTask(config, context)

      default:
        throw new Error(`Unknown action type: ${actionType}`)
    }
  } catch (error) {
    return {
      success: false,
      actionType,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update a field on the entity
 */
async function executeUpdateField(
  config: ActionConfig,
  context: ActionExecutionContext
): Promise<ActionResult> {
  const supabase = getAdminClient()

  if (!config.field) {
    throw new Error('field is required for update_field action')
  }

  const tableName = getTableName(context.entityType)
  if (!tableName) {
    throw new Error(`Unknown entity type: ${context.entityType}`)
  }

  // Resolve value (could be a template)
  const resolvedValue = resolveTemplate(String(config.value ?? ''), context)

  const { error } = await supabase
    .from(tableName)
    .update({ [config.field]: resolvedValue })
    .eq('id', context.entityId)

  if (error) {
    throw new Error(`Failed to update field: ${error.message}`)
  }

  return {
    success: true,
    actionType: 'update_field',
    message: `Updated ${config.field} to ${resolvedValue}`,
    data: { field: config.field, value: resolvedValue },
  }
}

/**
 * Send a notification
 */
async function executeSendNotification(
  config: ActionConfig,
  context: ActionExecutionContext
): Promise<ActionResult> {
  const supabase = getAdminClient()

  // Determine recipient
  let recipientId: string | null = null
  let recipientEmail: string | null = null

  switch (config.recipient) {
    case 'owner':
      recipientId = String(context.record.owner_id || context.record.created_by || '')
      break

    case 'submitter':
      recipientId = String(context.record.created_by || '')
      break

    case 'approver':
      // Get current approver from execution
      const { data: approval } = await supabase
        .from('workflow_approvals')
        .select('approver_id')
        .eq('execution_id', context.execution.id)
        .eq('status', 'pending')
        .order('step_order', { ascending: true })
        .limit(1)
        .single()

      recipientId = approval?.approver_id || null
      break

    case 'custom':
      recipientEmail = String(config.custom_email || '')
      break

    default:
      // Default to record owner
      recipientId = String(context.record.owner_id || context.record.created_by || '')
  }

  if (!recipientId && !recipientEmail) {
    throw new Error('Could not determine notification recipient')
  }

  // Resolve template
  const message = resolveTemplate(String(config.template || ''), context)
  const subject = resolveTemplate(
    String(config.subject || `Workflow Notification: ${context.entityType}`),
    context
  )

  // Create notification record
  const { error } = await supabase.from('notifications').insert({
    org_id: context.orgId,
    user_id: recipientId,
    recipient_email: recipientEmail,
    type: 'workflow',
    title: subject,
    message,
    entity_type: context.entityType,
    entity_id: context.entityId,
    metadata: {
      workflow_execution_id: context.execution.id,
      workflow_id: context.execution.workflow_id,
    },
    read: false,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Failed to create notification:', error.message)
    // Don't throw - notification failure shouldn't fail the workflow
  }

  return {
    success: true,
    actionType: 'send_notification',
    message: `Notification sent to ${recipientId || recipientEmail}`,
    data: { recipient_id: recipientId, recipient_email: recipientEmail },
  }
}

/**
 * Create an activity record
 */
async function executeCreateActivity(
  config: ActionConfig,
  context: ActionExecutionContext
): Promise<ActionResult> {
  const supabase = getAdminClient()

  const description = resolveTemplate(
    String(config.description || 'Workflow action executed'),
    context
  )

  const { data, error } = await supabase
    .from('activities')
    .insert({
      org_id: context.orgId,
      entity_type: context.entityType,
      entity_id: context.entityId,
      activity_type: config.activity_type || 'system',
      subject: description,
      description,
      status: 'completed',
      created_by: context.user?.id || null,
      created_at: new Date().toISOString(),
      metadata: {
        workflow_execution_id: context.execution.id,
        workflow_id: context.execution.workflow_id,
        auto_generated: true,
      },
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create activity: ${error.message}`)
  }

  return {
    success: true,
    actionType: 'create_activity',
    message: 'Activity created',
    data: { activity_id: data.id },
  }
}

/**
 * Trigger an external webhook
 */
async function executeTriggerWebhook(
  config: ActionConfig,
  context: ActionExecutionContext
): Promise<ActionResult> {
  if (!config.webhook_url) {
    throw new Error('webhook_url is required for trigger_webhook action')
  }

  const method = (config.method as string) || 'POST'

  // Parse headers if provided
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (config.headers) {
    try {
      const customHeaders = typeof config.headers === 'string'
        ? JSON.parse(config.headers)
        : config.headers
      headers = { ...headers, ...customHeaders }
    } catch {
      console.warn('Failed to parse custom headers')
    }
  }

  // Build payload
  const payload = {
    event: 'workflow_action',
    workflow_execution_id: context.execution.id,
    workflow_id: context.execution.workflow_id,
    entity_type: context.entityType,
    entity_id: context.entityId,
    record: context.record,
    timestamp: new Date().toISOString(),
    ...(config.payload || {}),
  }

  try {
    const response = await fetch(config.webhook_url as string, {
      method,
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`)
    }

    return {
      success: true,
      actionType: 'trigger_webhook',
      message: `Webhook triggered successfully (${response.status})`,
      data: { status_code: response.status },
    }
  } catch (error) {
    throw new Error(`Webhook call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Trigger another workflow
 */
async function executeRunWorkflow(
  config: ActionConfig,
  context: ActionExecutionContext
): Promise<ActionResult> {
  if (!config.workflow_id) {
    throw new Error('workflow_id is required for run_workflow action')
  }

  const supabase = getAdminClient()

  // Get the target workflow
  const { data: workflow, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', config.workflow_id)
    .eq('org_id', context.orgId)
    .eq('status', 'active')
    .single()

  if (error || !workflow) {
    throw new Error(`Target workflow not found or not active: ${config.workflow_id}`)
  }

  // Verify entity type compatibility
  if (workflow.entity_type !== context.entityType) {
    throw new Error(
      `Target workflow entity type (${workflow.entity_type}) does not match current entity type (${context.entityType})`
    )
  }

  // Import dynamically to avoid circular dependency
  const { triggerWorkflows } = await import('./workflow-engine')

  const results = await triggerWorkflows({
    orgId: context.orgId,
    entityType: context.entityType,
    entityId: context.entityId,
    triggerEvent: 'manual',
    record: context.record,
    userId: context.user?.id,
    metadata: {
      triggered_by_workflow: context.execution.workflow_id,
      triggered_by_execution: context.execution.id,
    },
  })

  return {
    success: true,
    actionType: 'run_workflow',
    message: `Triggered workflow ${config.workflow_id}`,
    data: { results },
  }
}

/**
 * Assign a user to the entity
 */
async function executeAssignUser(
  config: ActionConfig,
  context: ActionExecutionContext
): Promise<ActionResult> {
  const supabase = getAdminClient()

  let assignedUserId: string | null = null

  switch (config.assignment_type) {
    case 'specific':
      assignedUserId = String(config.user_id || '')
      break

    case 'round_robin':
      // Get team members and rotate
      if (config.team_id) {
        const { data: members } = await supabase
          .from('pod_members')
          .select('user_id')
          .eq('pod_id', config.team_id)

        if (members && members.length > 0) {
          // Simple round robin based on execution count
          const { count } = await supabase
            .from('workflow_executions')
            .select('id', { count: 'exact', head: true })
            .eq('workflow_id', context.execution.workflow_id)

          const index = (count || 0) % members.length
          assignedUserId = members[index].user_id
        }
      }
      break

    case 'load_balanced':
      // Get user with least active assignments
      // This is a simplified implementation
      if (config.team_id) {
        const { data: members } = await supabase
          .from('pod_members')
          .select('user_id')
          .eq('pod_id', config.team_id)
          .limit(1)

        if (members && members.length > 0) {
          assignedUserId = members[0].user_id
        }
      }
      break

    case 'manager':
      // Get record owner's manager
      const ownerId = context.record.owner_id
      if (ownerId) {
        const { data: employee } = await supabase
          .from('employees')
          .select('manager_id')
          .eq('user_id', ownerId)
          .single()

        assignedUserId = employee?.manager_id || null
      }
      break
  }

  if (!assignedUserId) {
    throw new Error('Could not determine user to assign')
  }

  const tableName = getTableName(context.entityType)
  if (!tableName) {
    throw new Error(`Unknown entity type: ${context.entityType}`)
  }

  const { error } = await supabase
    .from(tableName)
    .update({ owner_id: assignedUserId })
    .eq('id', context.entityId)

  if (error) {
    throw new Error(`Failed to assign user: ${error.message}`)
  }

  return {
    success: true,
    actionType: 'assign_user',
    message: `Assigned to user ${assignedUserId}`,
    data: { assigned_user_id: assignedUserId },
  }
}

/**
 * Create a follow-up task
 */
async function executeCreateTask(
  config: ActionConfig,
  context: ActionExecutionContext
): Promise<ActionResult> {
  const supabase = getAdminClient()

  const title = resolveTemplate(
    String(config.task_title || `Follow up on ${context.entityType}`),
    context
  )
  const description = resolveTemplate(String(config.task_description || ''), context)

  // Calculate due date
  let dueAt: string | null = null
  if (config.due_in_value) {
    const dueDate = new Date()
    const unit = config.due_in_unit || 'days'
    const value = Number(config.due_in_value)

    switch (unit) {
      case 'hours':
        dueDate.setHours(dueDate.getHours() + value)
        break
      case 'business_days':
        // Simplified: just add regular days
        dueDate.setDate(dueDate.getDate() + value)
        break
      default:
        dueDate.setDate(dueDate.getDate() + value)
    }
    dueAt = dueDate.toISOString()
  }

  // Determine assignee
  let assigneeId: string | null = null

  switch (config.assign_to) {
    case 'owner':
      assigneeId = String(context.record.owner_id || context.record.created_by || '')
      break
    case 'manager':
      const ownerId = context.record.owner_id
      if (ownerId) {
        const { data: employee } = await supabase
          .from('employees')
          .select('manager_id')
          .eq('user_id', ownerId)
          .single()

        assigneeId = employee?.manager_id || null
      }
      break
    case 'initiator':
      assigneeId = context.user?.id || null
      break
    default:
      assigneeId = String(context.record.owner_id || '')
  }

  const { data, error } = await supabase
    .from('activities')
    .insert({
      org_id: context.orgId,
      entity_type: context.entityType,
      entity_id: context.entityId,
      activity_type: 'task',
      subject: title,
      description,
      status: 'pending',
      owner_id: assigneeId,
      due_at: dueAt,
      created_by: context.user?.id || null,
      created_at: new Date().toISOString(),
      metadata: {
        workflow_execution_id: context.execution.id,
        workflow_id: context.execution.workflow_id,
        auto_generated: true,
      },
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`)
  }

  return {
    success: true,
    actionType: 'create_task',
    message: 'Task created',
    data: { task_id: data.id, assignee_id: assigneeId, due_at: dueAt },
  }
}

/**
 * Helper: Get table name for entity type
 */
function getTableName(entityType: EntityType): string | null {
  const tableMap: Record<EntityType, string> = {
    jobs: 'jobs',
    candidates: 'candidates',
    submissions: 'submissions',
    placements: 'placements',
    accounts: 'accounts',
    contacts: 'contacts',
    leads: 'leads',
    deals: 'deals',
    activities: 'activities',
    employees: 'employees',
    consultants: 'consultants',
    vendors: 'vendors',
    interviews: 'interviews',
  }

  return tableMap[entityType] || null
}

/**
 * Helper: Resolve template variables
 */
function resolveTemplate(template: string, context: ActionExecutionContext): string {
  if (!template) return ''

  // Replace {{field}} patterns with actual values
  return template.replace(/\{\{(\w+)\}\}/g, (match, field) => {
    // Check context.record first
    if (field in context.record) {
      return String(context.record[field] ?? '')
    }

    // Special variables
    switch (field) {
      case 'entity_type':
        return context.entityType
      case 'entity_id':
        return context.entityId
      case 'workflow_id':
        return context.execution.workflow_id
      case 'execution_id':
        return context.execution.id
      case 'status':
        return context.execution.status
      default:
        return match // Keep original if not found
    }
  })
}

/**
 * Validate action configuration
 */
export function validateActionConfig(
  actionType: ActionType,
  config: ActionConfig
): string[] {
  const errors: string[] = []

  switch (actionType) {
    case 'update_field':
      if (!config.field) {
        errors.push('Field name is required')
      }
      break

    case 'send_notification':
      if (!config.template) {
        errors.push('Notification template is required')
      }
      break

    case 'trigger_webhook':
      if (!config.webhook_url) {
        errors.push('Webhook URL is required')
      } else {
        try {
          new URL(config.webhook_url as string)
        } catch {
          errors.push('Invalid webhook URL')
        }
      }
      break

    case 'run_workflow':
      if (!config.workflow_id) {
        errors.push('Target workflow ID is required')
      }
      break

    case 'assign_user':
      if (config.assignment_type === 'specific' && !config.user_id) {
        errors.push('User ID is required for specific assignment')
      }
      if (config.assignment_type === 'round_robin' && !config.team_id) {
        errors.push('Team/Pod ID is required for round robin assignment')
      }
      break

    case 'create_task':
      if (!config.task_title) {
        errors.push('Task title is required')
      }
      break

    case 'create_activity':
      // No required fields
      break
  }

  return errors
}
