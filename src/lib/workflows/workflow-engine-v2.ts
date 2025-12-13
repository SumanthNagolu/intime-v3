/**
 * Workflow Engine V2
 *
 * Enhanced workflow engine with support for:
 * - Trigger-based workflow execution
 * - Multiple action types (email, notification, task, activity, field update, webhook, assign)
 * - State machine execution
 * - Comprehensive logging
 *
 * Issue: WORKFLOWS-01 Phase 1
 */

import { createClient } from '@supabase/supabase-js'
import { createNotification } from '@/lib/notifications/notification-service'
import { sendTemplatedEmail } from '@/lib/email/template-service'

// ============================================
// SERVICE CONFIGURATION
// ============================================

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// TYPES
// ============================================

interface WorkflowTrigger {
  type: 'status_change' | 'field_change' | 'created' | 'manual' | 'scheduled'
  from?: string | null
  to?: string
  field?: string
}

interface WorkflowCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'not_contains' | 'is_null' | 'is_not_null'
  value: unknown
}

interface WorkflowActionConfig {
  type:
    | 'send_email'
    | 'send_notification'
    | 'create_task'
    | 'create_activity'
    | 'update_field'
    | 'webhook'
    | 'wait'
    | 'assign'
  config: Record<string, unknown>
}

interface WorkflowDefinition {
  triggers?: WorkflowTrigger[]
  actions?: WorkflowActionConfig[]
  conditions?: WorkflowCondition[]
  states?: Array<{ id: string; actions: WorkflowActionConfig[] }>
}

interface WorkflowRow {
  id: string
  org_id: string
  name: string
  entity_type: string
  is_active: boolean
  definition: WorkflowDefinition
  deleted_at: string | null
}

interface WorkflowInstanceRow {
  id: string
  org_id: string
  workflow_id: string
  entity_type: string
  entity_id: string
  current_state_id: string | null
  status: string
  created_by: string
  workflow?: WorkflowRow
}

interface WorkflowExecutionRow {
  id: string
  org_id: string
  instance_id: string
  status: string
  triggered_by: string | null
  trigger_type: string | null
  trigger_event: Record<string, unknown> | null
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  created_at: string
}

interface WorkflowStepRow {
  id: string
  execution_id: string
  step_type: string
  step_name: string | null
  step_config: Record<string, unknown>
  position: number
  status: string
  started_at: string | null
  completed_at: string | null
  error_message: string | null
}

interface TriggerEvent {
  type: 'created' | 'updated' | 'status_change' | 'field_change'
  field?: string
  oldValue?: unknown
  newValue?: unknown
}

// ============================================
// WORKFLOW ENGINE V2 CLASS
// ============================================

export class WorkflowEngineV2 {
  private orgId: string
  private userId: string
  private db = getAdminClient()

  constructor(orgId: string, userId: string) {
    this.orgId = orgId
    this.userId = userId
  }

  /**
   * Check if any workflows should trigger for an entity event
   */
  async checkTriggers(
    entityType: string,
    entityId: string,
    event: TriggerEvent
  ): Promise<string[]> {
    // Find active workflows for this entity type
    const { data: workflows, error } = await this.db
      .from('workflows')
      .select('*')
      .eq('org_id', this.orgId)
      .eq('entity_type', entityType)
      .eq('is_active', true)
      .is('deleted_at', null)

    if (error) {
      console.error('[WorkflowEngineV2] Error fetching workflows:', error)
      return []
    }

    if (!workflows || workflows.length === 0) return []

    const triggeredWorkflows: string[] = []

    for (const workflow of workflows as WorkflowRow[]) {
      const definition = workflow.definition
      if (!definition?.triggers) continue

      for (const trigger of definition.triggers) {
        if (this.matchesTrigger(trigger, event)) {
          triggeredWorkflows.push(workflow.id)
          await this.startExecution(workflow.id, entityType, entityId, {
            trigger,
            event,
          })
          break // Only trigger once per workflow
        }
      }
    }

    return triggeredWorkflows
  }

  private matchesTrigger(trigger: WorkflowTrigger, event: TriggerEvent): boolean {
    switch (trigger.type) {
      case 'created':
        return event.type === 'created'

      case 'status_change':
        if (event.type !== 'status_change' && event.field !== 'status') return false
        if (trigger.from !== undefined && trigger.from !== event.oldValue) return false
        if (trigger.to !== undefined && trigger.to !== event.newValue) return false
        return true

      case 'field_change':
        if (event.type !== 'field_change') return false
        if (trigger.field && trigger.field !== event.field) return false
        return true

      default:
        return false
    }
  }

  /**
   * Start a new workflow execution
   */
  async startExecution(
    workflowId: string,
    entityType: string,
    entityId: string,
    triggerContext: Record<string, unknown>
  ): Promise<WorkflowExecutionRow> {
    // 1. Get or create workflow instance
    const instance = await this.getOrCreateInstance(workflowId, entityType, entityId)

    // 2. Create execution record
    const { data: execution, error } = await this.db
      .from('workflow_executions')
      .insert({
        org_id: this.orgId,
        instance_id: instance.id,
        status: 'running',
        triggered_by: this.userId,
        trigger_type: 'automatic',
        trigger_event: triggerContext,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[WorkflowEngineV2] Error creating execution:', error)
      throw error
    }

    // 3. Log execution start
    await this.log(execution.id, 'info', 'Workflow execution started', triggerContext)

    // 4. Execute the workflow
    try {
      await this.executeWorkflow(execution, entityType, entityId)
    } catch (err) {
      await this.failExecution(
        execution.id,
        err instanceof Error ? err.message : 'Unknown error'
      )
    }

    return execution
  }

  private async getOrCreateInstance(
    workflowId: string,
    entityType: string,
    entityId: string
  ): Promise<WorkflowInstanceRow> {
    // Check for existing instance
    const { data: existing } = await this.db
      .from('workflow_instances')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .single()

    if (existing) return existing

    // Get initial state (if workflow has states)
    const { data: initialState } = await this.db
      .from('workflow_states')
      .select('id')
      .eq('workflow_id', workflowId)
      .eq('state_type', 'initial')
      .single()

    // Create new instance
    const { data: instance, error } = await this.db
      .from('workflow_instances')
      .insert({
        org_id: this.orgId,
        workflow_id: workflowId,
        entity_type: entityType,
        entity_id: entityId,
        current_state_id: initialState?.id || null,
        status: 'active',
        created_by: this.userId,
      })
      .select()
      .single()

    if (error) {
      console.error('[WorkflowEngineV2] Error creating instance:', error)
      throw error
    }

    return instance
  }

  private async executeWorkflow(
    execution: WorkflowExecutionRow,
    entityType: string,
    entityId: string
  ): Promise<void> {
    // Get workflow definition via instance
    const { data: instance } = await this.db
      .from('workflow_instances')
      .select('*, workflow:workflows(*)')
      .eq('id', execution.instance_id)
      .single()

    if (!instance) throw new Error('Instance not found')

    const instanceWithWorkflow = instance as WorkflowInstanceRow
    const workflow = instanceWithWorkflow.workflow as WorkflowRow | undefined

    if (!workflow) throw new Error('Workflow not found for instance')

    const definition = workflow.definition

    // Execute actions defined in the workflow
    const actions = definition.actions || []
    let stepIndex = 0

    for (const actionConfig of actions) {
      // Create step record
      const { data: step } = await this.db
        .from('workflow_steps')
        .insert({
          execution_id: execution.id,
          step_type: 'action',
          step_name: `Action: ${actionConfig.type}`,
          step_config: actionConfig,
          position: stepIndex++,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!step) continue

      try {
        await this.executeAction(
          execution.id,
          step.id,
          actionConfig,
          entityType,
          entityId
        )

        await this.db
          .from('workflow_steps')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', step.id)
      } catch (err) {
        await this.db
          .from('workflow_steps')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown error',
            completed_at: new Date().toISOString(),
          })
          .eq('id', step.id)
        throw err
      }
    }

    // Mark execution as completed
    await this.db
      .from('workflow_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', execution.id)

    await this.log(execution.id, 'info', 'Workflow execution completed')
  }

  private async executeAction(
    executionId: string,
    stepId: string,
    actionConfig: WorkflowActionConfig,
    entityType: string,
    entityId: string
  ): Promise<void> {
    // Create action record
    const { data: action, error: actionError } = await this.db
      .from('workflow_actions')
      .insert({
        execution_id: executionId,
        step_id: stepId,
        action_type: actionConfig.type,
        action_config: actionConfig.config,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (actionError || !action) {
      throw new Error(`Failed to create action record: ${actionError?.message}`)
    }

    try {
      let result: unknown

      switch (actionConfig.type) {
        case 'send_email':
          result = await this.executeSendEmail(actionConfig.config, entityType, entityId)
          break
        case 'send_notification':
          result = await this.executeSendNotification(
            actionConfig.config,
            entityType,
            entityId
          )
          break
        case 'create_task':
          result = await this.executeCreateTask(actionConfig.config, entityType, entityId)
          break
        case 'create_activity':
          result = await this.executeCreateActivity(
            actionConfig.config,
            entityType,
            entityId
          )
          break
        case 'update_field':
          result = await this.executeUpdateField(actionConfig.config, entityType, entityId)
          break
        case 'webhook':
          result = await this.executeWebhook(actionConfig.config, entityType, entityId)
          break
        case 'assign':
          result = await this.executeAssign(actionConfig.config, entityType, entityId)
          break
        case 'wait':
          // Wait actions are handled by scheduling, not direct execution
          result = { waited: true }
          break
        default:
          throw new Error(`Unknown action type: ${actionConfig.type}`)
      }

      await this.db
        .from('workflow_actions')
        .update({
          status: 'completed',
          result: result as Record<string, unknown>,
          completed_at: new Date().toISOString(),
        })
        .eq('id', action.id)
    } catch (err) {
      await this.db
        .from('workflow_actions')
        .update({
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', action.id)
      throw err
    }
  }

  // ============================================
  // ACTION EXECUTORS
  // ============================================

  private async executeSendEmail(
    config: Record<string, unknown>,
    entityType: string,
    entityId: string
  ) {
    const { templateSlug, to, toName, variables } = config as {
      templateSlug: string
      to: string
      toName?: string
      variables?: Record<string, string>
    }

    return await sendTemplatedEmail({
      templateSlug,
      orgId: this.orgId,
      to,
      toName,
      context: variables || {},
      entityType,
      entityId,
      triggeredBy: 'workflow',
      userId: this.userId,
    })
  }

  private async executeSendNotification(
    config: Record<string, unknown>,
    entityType: string,
    entityId: string
  ) {
    const { userId, title, message, category, priority, actionUrl, actionLabel } =
      config as {
        userId: string
        title: string
        message: string
        category?: string
        priority?: 'low' | 'normal' | 'high' | 'urgent'
        actionUrl?: string
        actionLabel?: string
      }

    // Determine notification type from category or use a default
    const notificationType = (category || 'workflow_started') as
      | 'workflow_started'
      | 'workflow_completed'
      | 'task_assigned'
      | 'approval_required'

    return await createNotification({
      orgId: this.orgId,
      userId,
      notificationType,
      title,
      message,
      entityType,
      entityId,
      priority: priority || 'normal',
      actionUrl,
      actionLabel,
    })
  }

  private async executeCreateTask(
    config: Record<string, unknown>,
    entityType: string,
    entityId: string
  ) {
    const { title, description, assigneeId, dueDate, priority } = config as {
      title: string
      description?: string
      assigneeId: string
      dueDate?: string
      priority?: string
    }

    const { data: activity, error } = await this.db
      .from('activities')
      .insert({
        org_id: this.orgId,
        entity_type: entityType,
        entity_id: entityId,
        type: 'task',
        subject: title,
        description,
        assignee_id: assigneeId,
        due_date: dueDate,
        priority: priority || 'normal',
        status: 'open',
        created_by: this.userId,
      })
      .select()
      .single()

    if (error) {
      console.error('[WorkflowEngineV2] Error creating task:', error)
      throw error
    }

    return activity
  }

  private async executeCreateActivity(
    config: Record<string, unknown>,
    entityType: string,
    entityId: string
  ) {
    const { type, subject, description } = config as {
      type: string
      subject: string
      description?: string
    }

    const { data: activity, error } = await this.db
      .from('activities')
      .insert({
        org_id: this.orgId,
        entity_type: entityType,
        entity_id: entityId,
        type,
        subject,
        description,
        status: 'completed',
        completed_at: new Date().toISOString(),
        created_by: this.userId,
      })
      .select()
      .single()

    if (error) {
      console.error('[WorkflowEngineV2] Error creating activity:', error)
      throw error
    }

    return activity
  }

  private async executeUpdateField(
    config: Record<string, unknown>,
    entityType: string,
    entityId: string
  ) {
    const { field, value } = config as { field: string; value: unknown }

    // Map entity type to table name
    const tableMap: Record<string, string> = {
      job: 'jobs',
      jobs: 'jobs',
      submission: 'submissions',
      submissions: 'submissions',
      placement: 'placements',
      placements: 'placements',
      deal: 'deals',
      deals: 'deals',
      contact: 'contacts',
      contacts: 'contacts',
      account: 'accounts',
      accounts: 'accounts',
      candidate: 'candidates',
      candidates: 'candidates',
      lead: 'leads',
      leads: 'leads',
    }

    const tableName = tableMap[entityType]
    if (!tableName) throw new Error(`Unknown entity type: ${entityType}`)

    const { data, error } = await this.db
      .from(tableName)
      .update({
        [field]: value,
        updated_by: this.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entityId)
      .select()
      .single()

    if (error) {
      console.error('[WorkflowEngineV2] Error updating field:', error)
      throw error
    }

    return data
  }

  private async executeWebhook(
    config: Record<string, unknown>,
    entityType: string,
    entityId: string
  ) {
    const { url, method, headers, body } = config as {
      url: string
      method?: string
      headers?: Record<string, string>
      body?: Record<string, unknown>
    }

    const response = await fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        entity_type: entityType,
        entity_id: entityId,
        org_id: this.orgId,
        triggered_at: new Date().toISOString(),
        ...body,
      }),
    })

    return {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    }
  }

  private async executeAssign(
    config: Record<string, unknown>,
    entityType: string,
    entityId: string
  ) {
    const { assigneeType, assigneeId, field } = config as {
      assigneeType: 'user' | 'round_robin' | 'manager'
      assigneeId?: string
      field?: string
    }

    let resolvedAssigneeId: string | null | undefined = assigneeId

    if (assigneeType === 'round_robin') {
      // Round-robin assignment - get the next assignee
      resolvedAssigneeId = await this.resolveRoundRobinAssignee(entityType)
    } else if (assigneeType === 'manager' && !assigneeId) {
      // Get manager of current user
      resolvedAssigneeId = await this.resolveManagerId(this.userId)
    }

    if (!resolvedAssigneeId) {
      throw new Error('Could not resolve assignee')
    }

    const fieldName = field || 'owner_id'
    return await this.executeUpdateField(
      { field: fieldName, value: resolvedAssigneeId },
      entityType,
      entityId
    )
  }

  private async resolveRoundRobinAssignee(entityType: string): Promise<string | null> {
    // Get active users in the org who can be assigned
    const { data: users } = await this.db
      .from('user_profiles')
      .select('id')
      .eq('org_id', this.orgId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(10)

    if (!users || users.length === 0) return null

    // Get the last assignment for this entity type
    const { data: lastAssignment } = await this.db
      .from('activities')
      .select('assignee_id')
      .eq('org_id', this.orgId)
      .eq('entity_type', entityType)
      .not('assignee_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Find next user in rotation
    if (lastAssignment?.assignee_id) {
      const lastIndex = users.findIndex((u) => u.id === lastAssignment.assignee_id)
      const nextIndex = (lastIndex + 1) % users.length
      return users[nextIndex].id
    }

    // Default to first user
    return users[0].id
  }

  private async resolveManagerId(userId: string): Promise<string | null> {
    const { data: user } = await this.db
      .from('user_profiles')
      .select('manager_id')
      .eq('id', userId)
      .single()

    return user?.manager_id || null
  }

  // ============================================
  // ERROR HANDLING & LOGGING
  // ============================================

  private async failExecution(executionId: string, errorMessage: string): Promise<void> {
    await this.db
      .from('workflow_executions')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', executionId)

    await this.log(executionId, 'error', `Workflow execution failed: ${errorMessage}`)
  }

  private async log(
    executionId: string,
    level: 'debug' | 'info' | 'warning' | 'error',
    message: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await this.db.from('workflow_execution_logs').insert({
      execution_id: executionId,
      level,
      message,
      data,
      source: 'engine',
      occurred_at: new Date().toISOString(),
    })
  }

  // ============================================
  // PUBLIC UTILITY METHODS
  // ============================================

  /**
   * Manually trigger a workflow for an entity
   */
  async triggerManually(
    workflowId: string,
    entityType: string,
    entityId: string,
    context?: Record<string, unknown>
  ): Promise<WorkflowExecutionRow> {
    return await this.startExecution(workflowId, entityType, entityId, {
      trigger: { type: 'manual' },
      context: context || {},
    })
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecutionRow | null> {
    const { data } = await this.db
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .single()

    return data
  }

  /**
   * Get execution logs
   */
  async getExecutionLogs(
    executionId: string
  ): Promise<Array<{ level: string; message: string; data: unknown; occurred_at: string }>> {
    const { data } = await this.db
      .from('workflow_execution_logs')
      .select('level, message, data, occurred_at')
      .eq('execution_id', executionId)
      .order('occurred_at', { ascending: true })

    return data || []
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string, reason?: string): Promise<void> {
    await this.db
      .from('workflow_executions')
      .update({
        status: 'cancelled',
        error_message: reason || 'Cancelled by user',
        completed_at: new Date().toISOString(),
      })
      .eq('id', executionId)
      .eq('status', 'running')

    await this.log(executionId, 'info', `Workflow cancelled: ${reason || 'No reason provided'}`)
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a new WorkflowEngineV2 instance
 */
export function createWorkflowEngine(orgId: string, userId: string): WorkflowEngineV2 {
  return new WorkflowEngineV2(orgId, userId)
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Trigger workflows for an entity event
 * Use this from mutation handlers after entity changes
 */
export async function triggerWorkflowsForEvent(
  orgId: string,
  userId: string,
  entityType: string,
  entityId: string,
  event: TriggerEvent
): Promise<string[]> {
  const engine = createWorkflowEngine(orgId, userId)
  return await engine.checkTriggers(entityType, entityId, event)
}

/**
 * Manually trigger a specific workflow
 */
export async function triggerWorkflowManually(
  orgId: string,
  userId: string,
  workflowId: string,
  entityType: string,
  entityId: string,
  context?: Record<string, unknown>
): Promise<WorkflowExecutionRow> {
  const engine = createWorkflowEngine(orgId, userId)
  return await engine.triggerManually(workflowId, entityType, entityId, context)
}
