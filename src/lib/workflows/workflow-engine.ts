/**
 * Workflow Engine
 *
 * Core orchestration engine for workflow execution.
 * Handles:
 * - Workflow triggering
 * - Condition evaluation
 * - Approval flow management
 * - Action execution
 * - Execution tracking
 */

import { createClient } from '@supabase/supabase-js'
import { evaluateConditions, type EvaluationContext } from './condition-evaluator'
import { resolveApprover, type ApproverResolutionContext } from './approver-resolver'
import { executeAction, type ActionExecutionContext } from './action-executor'
import { createNotification } from '@/lib/notifications/notification-service'
import {
  type WorkflowRow,
  type WorkflowStepRow,
  type WorkflowActionRow,
  type WorkflowExecutionRow,
  type WorkflowApprovalRow,
  type TriggerEvent,
  type EntityType,
  type ExecutionStatus,
  type ApprovalStatus,
  type ActionTrigger,
} from './types'

// Initialize Supabase client with service role for engine operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

export interface TriggerContext {
  orgId: string
  entityType: EntityType
  entityId: string
  triggerEvent: TriggerEvent
  record: Record<string, unknown>
  previousRecord?: Record<string, unknown>
  userId?: string
  metadata?: Record<string, unknown>
}

export interface ExecutionResult {
  success: boolean
  executionId?: string
  workflowId?: string
  status: ExecutionStatus
  message?: string
  error?: string
}

/**
 * Main function to trigger workflows for an event
 */
export async function triggerWorkflows(context: TriggerContext): Promise<ExecutionResult[]> {
  const supabase = getAdminClient()
  const results: ExecutionResult[] = []

  try {
    // Find active workflows matching this trigger
    const { data: workflows, error } = await supabase
      .from('workflows')
      .select('*, steps:workflow_steps(*), actions:workflow_actions(*)')
      .eq('org_id', context.orgId)
      .eq('entity_type', context.entityType)
      .eq('trigger_event', context.triggerEvent)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch workflows: ${error.message}`)
    }

    if (!workflows || workflows.length === 0) {
      return results
    }

    // Process each matching workflow
    for (const workflow of workflows) {
      try {
        const result = await executeWorkflow(workflow, context)
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          workflowId: workflow.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  } catch (error) {
    console.error('Error triggering workflows:', error)
    throw error
  }
}

/**
 * Execute a single workflow
 */
async function executeWorkflow(
  workflow: WorkflowRow & { steps: WorkflowStepRow[]; actions: WorkflowActionRow[] },
  context: TriggerContext
): Promise<ExecutionResult> {
  const supabase = getAdminClient()

  // Evaluate conditions
  const evalContext: EvaluationContext = {
    record: context.record,
    previousRecord: context.previousRecord,
  }

  const evalResult = evaluateConditions(workflow.trigger_conditions, evalContext)

  if (!evalResult.triggered) {
    // Conditions not met, workflow doesn't trigger
    return {
      success: true,
      workflowId: workflow.id,
      status: 'completed',
      message: 'Conditions not met, workflow skipped',
    }
  }

  // Create execution record
  const { data: execution, error: execError } = await supabase
    .from('workflow_executions')
    .insert({
      org_id: context.orgId,
      workflow_id: workflow.id,
      workflow_version: workflow.version,
      entity_type: context.entityType,
      entity_id: context.entityId,
      status: 'pending',
      started_at: new Date().toISOString(),
      metadata: {
        ...context.metadata,
        trigger_event: context.triggerEvent,
        conditions_result: evalResult,
      },
    })
    .select()
    .single()

  if (execError || !execution) {
    throw new Error(`Failed to create execution: ${execError?.message}`)
  }

  try {
    // Execute on_start actions
    await executeActionsForTrigger(
      workflow.actions,
      'on_start',
      execution,
      context
    )

    // Handle based on workflow type
    if (workflow.workflow_type === 'approval' && workflow.steps?.length > 0) {
      // Start approval process
      await startApprovalProcess(workflow, execution, context)

      return {
        success: true,
        executionId: execution.id,
        workflowId: workflow.id,
        status: 'in_progress',
        message: 'Approval workflow started',
      }
    } else {
      // Non-approval workflow - execute completion actions directly
      await executeActionsForTrigger(
        workflow.actions,
        'on_completion',
        execution,
        context
      )

      // Mark as completed
      await supabase
        .from('workflow_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id)

      return {
        success: true,
        executionId: execution.id,
        workflowId: workflow.id,
        status: 'completed',
        message: 'Workflow completed',
      }
    }
  } catch (error) {
    // Mark execution as failed
    await supabase
      .from('workflow_executions')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      })
      .eq('id', execution.id)

    throw error
  }
}

/**
 * Start the approval process for a workflow
 */
async function startApprovalProcess(
  workflow: WorkflowRow & { steps: WorkflowStepRow[] },
  execution: WorkflowExecutionRow,
  context: TriggerContext
): Promise<void> {
  const supabase = getAdminClient()

  // Sort steps by order
  const sortedSteps = [...workflow.steps].sort((a, b) => a.step_order - b.step_order)

  if (sortedSteps.length === 0) {
    throw new Error('Approval workflow has no steps')
  }

  // Start with first step
  const firstStep = sortedSteps[0]

  // Resolve approver for first step
  const approverContext: ApproverResolutionContext = {
    orgId: context.orgId,
    entityType: context.entityType,
    entityId: context.entityId,
    record: context.record,
    userId: context.userId,
  }

  const approver = await resolveApprover(
    firstStep.approver_type,
    firstStep.approver_config,
    approverContext
  )

  if (!approver) {
    throw new Error(`Could not resolve approver for step "${firstStep.step_name}"`)
  }

  // Calculate due date
  let dueAt: string | null = null
  if (firstStep.timeout_hours) {
    const dueDate = new Date()
    if (firstStep.timeout_unit === 'business_hours' || firstStep.timeout_unit === 'business_days') {
      // For business time, we'd need a more complex calculation
      // For now, just use regular hours/days
      const multiplier = firstStep.timeout_unit.includes('days') ? 24 : 1
      dueDate.setHours(dueDate.getHours() + firstStep.timeout_hours * multiplier)
    } else if (firstStep.timeout_unit === 'days') {
      dueDate.setDate(dueDate.getDate() + firstStep.timeout_hours)
    } else if (firstStep.timeout_unit === 'hours') {
      dueDate.setHours(dueDate.getHours() + firstStep.timeout_hours)
    } else {
      dueDate.setMinutes(dueDate.getMinutes() + firstStep.timeout_hours)
    }
    dueAt = dueDate.toISOString()
  }

  // Create approval record
  await supabase.from('workflow_approvals').insert({
    execution_id: execution.id,
    step_id: firstStep.id,
    step_order: firstStep.step_order,
    approver_id: approver.userId,
    status: 'pending',
    requested_at: new Date().toISOString(),
    due_at: dueAt,
  })

  // Update execution to in_progress
  await supabase
    .from('workflow_executions')
    .update({
      status: 'in_progress',
      current_step: firstStep.step_order,
    })
    .eq('id', execution.id)

  // Log the event
  await logExecutionEvent(execution.id, 'approval_requested', {
    step_name: firstStep.step_name,
    step_order: firstStep.step_order,
    approver_id: approver.userId,
    due_at: dueAt,
  })

  // Send notification to approver
  await createNotification({
    orgId: context.orgId,
    userId: approver.userId,
    notificationType: 'approval_required',
    title: `Approval Required: ${firstStep.step_name}`,
    message: `You have a pending approval request for ${context.entityType} workflow.`,
    entityType: context.entityType,
    entityId: context.entityId,
    priority: 'high',
    actionUrl: `/employee/workflows/approvals/${execution.id}`,
    actionLabel: 'Review & Approve',
    channels: ['in_app', 'email'],
  })
}

/**
 * Process an approval response
 */
export async function processApprovalResponse(
  approvalId: string,
  response: 'approved' | 'rejected',
  responseNotes: string | null,
  responderId: string
): Promise<ExecutionResult> {
  const supabase = getAdminClient()

  // Get approval record with related data
  const { data: approval, error } = await supabase
    .from('workflow_approvals')
    .select(`
      *,
      execution:workflow_executions(*, workflow:workflows(*, steps:workflow_steps(*), actions:workflow_actions(*)))
    `)
    .eq('id', approvalId)
    .single()

  if (error || !approval) {
    throw new Error(`Approval not found: ${error?.message}`)
  }

  if (approval.status !== 'pending') {
    throw new Error(`Approval already processed with status: ${approval.status}`)
  }

  // Verify responder is the approver
  if (approval.approver_id !== responderId) {
    throw new Error('You are not authorized to respond to this approval')
  }

  const execution = approval.execution as WorkflowExecutionRow & {
    workflow: WorkflowRow & { steps: WorkflowStepRow[]; actions: WorkflowActionRow[] }
  }
  const workflow = execution.workflow

  // Update approval status
  await supabase
    .from('workflow_approvals')
    .update({
      status: response,
      responded_at: new Date().toISOString(),
      response_notes: responseNotes,
    })
    .eq('id', approvalId)

  // Log the event
  await logExecutionEvent(execution.id, `step_${response}`, {
    step_order: approval.step_order,
    response_notes: responseNotes,
  })

  // Execute on_each_step actions
  const actionContext: TriggerContext = {
    orgId: execution.org_id,
    entityType: execution.entity_type as EntityType,
    entityId: execution.entity_id,
    triggerEvent: 'manual',
    record: execution.metadata as Record<string, unknown>,
  }

  await executeActionsForTrigger(
    workflow.actions,
    'on_each_step',
    execution,
    actionContext
  )

  if (response === 'rejected') {
    // Workflow rejected
    await supabase
      .from('workflow_executions')
      .update({
        status: 'rejected',
        completed_at: new Date().toISOString(),
        completed_by: responderId,
        completion_notes: responseNotes,
      })
      .eq('id', execution.id)

    // Execute on_rejection actions
    await executeActionsForTrigger(
      workflow.actions,
      'on_rejection',
      execution,
      actionContext
    )

    return {
      success: true,
      executionId: execution.id,
      workflowId: workflow.id,
      status: 'rejected',
      message: 'Workflow rejected',
    }
  }

  // Find next step
  const sortedSteps = [...workflow.steps].sort((a, b) => a.step_order - b.step_order)
  const currentStepIndex = sortedSteps.findIndex(s => s.step_order === approval.step_order)
  const nextStep = sortedSteps[currentStepIndex + 1]

  if (!nextStep) {
    // No more steps - workflow approved
    await supabase
      .from('workflow_executions')
      .update({
        status: 'approved',
        completed_at: new Date().toISOString(),
        completed_by: responderId,
      })
      .eq('id', execution.id)

    // Execute on_approval actions
    await executeActionsForTrigger(
      workflow.actions,
      'on_approval',
      execution,
      actionContext
    )

    // Execute on_completion actions
    await executeActionsForTrigger(
      workflow.actions,
      'on_completion',
      execution,
      actionContext
    )

    return {
      success: true,
      executionId: execution.id,
      workflowId: workflow.id,
      status: 'approved',
      message: 'Workflow fully approved',
    }
  }

  // Move to next step
  const approverContext: ApproverResolutionContext = {
    orgId: execution.org_id,
    entityType: execution.entity_type as EntityType,
    entityId: execution.entity_id,
    record: execution.metadata as Record<string, unknown>,
  }

  const nextApprover = await resolveApprover(
    nextStep.approver_type,
    nextStep.approver_config,
    approverContext
  )

  if (!nextApprover) {
    throw new Error(`Could not resolve approver for step "${nextStep.step_name}"`)
  }

  // Calculate due date for next step
  let dueAt: string | null = null
  if (nextStep.timeout_hours) {
    const dueDate = new Date()
    const multiplier = nextStep.timeout_unit?.includes('days') ? 24 : 1
    dueDate.setHours(dueDate.getHours() + nextStep.timeout_hours * multiplier)
    dueAt = dueDate.toISOString()
  }

  // Create next approval record
  await supabase.from('workflow_approvals').insert({
    execution_id: execution.id,
    step_id: nextStep.id,
    step_order: nextStep.step_order,
    approver_id: nextApprover.userId,
    status: 'pending',
    requested_at: new Date().toISOString(),
    due_at: dueAt,
  })

  // Update execution current step
  await supabase
    .from('workflow_executions')
    .update({
      current_step: nextStep.step_order,
    })
    .eq('id', execution.id)

  // Log the event
  await logExecutionEvent(execution.id, 'approval_requested', {
    step_name: nextStep.step_name,
    step_order: nextStep.step_order,
    approver_id: nextApprover.userId,
    due_at: dueAt,
  })

  return {
    success: true,
    executionId: execution.id,
    workflowId: workflow.id,
    status: 'in_progress',
    message: `Moved to step ${nextStep.step_order}: ${nextStep.step_name}`,
  }
}

/**
 * Cancel a workflow execution
 */
export async function cancelExecution(
  executionId: string,
  reason: string,
  userId: string
): Promise<ExecutionResult> {
  const supabase = getAdminClient()

  const { data: execution, error } = await supabase
    .from('workflow_executions')
    .select('*, workflow:workflows(*, actions:workflow_actions(*))')
    .eq('id', executionId)
    .single()

  if (error || !execution) {
    throw new Error(`Execution not found: ${error?.message}`)
  }

  if (!['pending', 'in_progress'].includes(execution.status)) {
    throw new Error(`Cannot cancel execution with status: ${execution.status}`)
  }

  // Update execution
  await supabase
    .from('workflow_executions')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
      completed_by: userId,
      completion_notes: reason,
    })
    .eq('id', executionId)

  // Cancel any pending approvals
  await supabase
    .from('workflow_approvals')
    .update({
      status: 'expired',
    })
    .eq('execution_id', executionId)
    .eq('status', 'pending')

  // Log the event
  await logExecutionEvent(executionId, 'execution_cancelled', { reason, cancelled_by: userId })

  // Execute on_cancellation actions
  const workflow = execution.workflow as WorkflowRow & { actions: WorkflowActionRow[] }
  const actionContext: TriggerContext = {
    orgId: execution.org_id,
    entityType: execution.entity_type as EntityType,
    entityId: execution.entity_id,
    triggerEvent: 'manual',
    record: execution.metadata as Record<string, unknown>,
  }

  await executeActionsForTrigger(
    workflow.actions,
    'on_cancellation',
    execution,
    actionContext
  )

  return {
    success: true,
    executionId,
    workflowId: execution.workflow_id,
    status: 'cancelled',
    message: 'Execution cancelled',
  }
}

/**
 * Execute actions for a specific trigger
 */
async function executeActionsForTrigger(
  actions: WorkflowActionRow[],
  trigger: ActionTrigger,
  execution: WorkflowExecutionRow,
  context: TriggerContext
): Promise<void> {
  const matchingActions = actions
    .filter(a => a.action_trigger === trigger)
    .sort((a, b) => a.action_order - b.action_order)

  for (const action of matchingActions) {
    try {
      const actionContext: ActionExecutionContext = {
        orgId: context.orgId,
        entityType: context.entityType,
        entityId: context.entityId,
        record: context.record,
        execution,
        user: context.userId ? { id: context.userId } : undefined,
      }

      await executeAction(action.action_type, action.action_config, actionContext)

      await logExecutionEvent(execution.id, 'action_executed', {
        action_type: action.action_type,
        action_order: action.action_order,
        success: true,
      })
    } catch (error) {
      await logExecutionEvent(execution.id, 'action_failed', {
        action_type: action.action_type,
        action_order: action.action_order,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      // Continue with other actions even if one fails
    }
  }
}

/**
 * Log an execution event
 */
async function logExecutionEvent(
  executionId: string,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<void> {
  const supabase = getAdminClient()

  await supabase.from('workflow_execution_logs').insert({
    execution_id: executionId,
    event_type: eventType,
    event_data: eventData,
    created_at: new Date().toISOString(),
  })
}

/**
 * Get pending approvals for a user
 */
export async function getPendingApprovals(
  orgId: string,
  userId: string
): Promise<WorkflowApprovalRow[]> {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('workflow_approvals')
    .select(`
      *,
      execution:workflow_executions(*, workflow:workflows(*))
    `)
    .eq('approver_id', userId)
    .eq('status', 'pending')

  if (error) {
    throw new Error(`Failed to get pending approvals: ${error.message}`)
  }

  return data || []
}
