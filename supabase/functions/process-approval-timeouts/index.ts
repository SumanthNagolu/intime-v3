/**
 * Process Approval Timeouts Edge Function
 *
 * This function is triggered by a cron job to check for pending approvals
 * that have exceeded their timeout and execute the configured timeout action:
 * - escalate: Move to the next approver or escalation path
 * - auto_approve: Automatically approve the request
 * - auto_reject: Automatically reject the request
 * - reminder: Send a reminder notification
 * - nothing: Do nothing (just mark as expired)
 *
 * Deployment:
 * - Set up as a cron job in Supabase: https://supabase.com/docs/guides/functions/schedule-functions
 * - Recommended schedule: every 5 minutes (cron: every 5 min)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PendingApproval {
  id: string
  execution_id: string
  step_id: string
  step_order: number
  approver_id: string
  status: string
  requested_at: string
  due_at: string | null
  reminder_sent_at: string | null
}

interface WorkflowStep {
  id: string
  workflow_id: string
  step_order: number
  step_name: string
  approver_type: string
  approver_config: Record<string, unknown>
  timeout_hours: number | null
  timeout_unit: string
  timeout_action: string | null
  reminder_enabled: boolean
  reminder_percent: number | null
}

interface WorkflowExecution {
  id: string
  org_id: string
  workflow_id: string
  workflow_version: number
  entity_type: string
  entity_id: string
  status: string
  current_step: number | null
  metadata: Record<string, unknown>
}

type TimeoutAction = 'escalate' | 'auto_approve' | 'auto_reject' | 'reminder' | 'nothing'

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
      approvalId: string
      executionId: string
      action: TimeoutAction
      status: 'processed' | 'skipped' | 'error'
      error?: string
    }> = []

    // Get pending approvals that have passed their due date
    const { data: overdueApprovals, error: approvalsError } = await supabase
      .from('workflow_approvals')
      .select(`
        id,
        execution_id,
        step_id,
        step_order,
        approver_id,
        status,
        requested_at,
        due_at,
        reminder_sent_at
      `)
      .eq('status', 'pending')
      .not('due_at', 'is', null)
      .lte('due_at', now.toISOString())

    if (approvalsError) {
      throw new Error(`Failed to fetch approvals: ${approvalsError.message}`)
    }

    if (!overdueApprovals || overdueApprovals.length === 0) {
      // Also check for reminders
      await processReminders(supabase, now, results)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'No overdue approvals found',
          processed: 0,
          remindersProcessed: results.length,
          results,
          timestamp: now.toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get step configurations for all approvals
    const stepIds = [...new Set(overdueApprovals.map(a => a.step_id))]
    const { data: steps, error: stepsError } = await supabase
      .from('workflow_steps')
      .select('*')
      .in('id', stepIds)

    if (stepsError) {
      throw new Error(`Failed to fetch steps: ${stepsError.message}`)
    }

    const stepsMap = new Map((steps || []).map(s => [s.id, s as WorkflowStep]))

    // Get execution details for context
    const executionIds = [...new Set(overdueApprovals.map(a => a.execution_id))]
    const { data: executions, error: executionsError } = await supabase
      .from('workflow_executions')
      .select('*')
      .in('id', executionIds)

    if (executionsError) {
      throw new Error(`Failed to fetch executions: ${executionsError.message}`)
    }

    const executionsMap = new Map(
      (executions || []).map(e => [e.id, e as WorkflowExecution])
    )

    // Process each overdue approval
    for (const approval of overdueApprovals as PendingApproval[]) {
      try {
        const step = stepsMap.get(approval.step_id)
        const execution = executionsMap.get(approval.execution_id)

        if (!step || !execution) {
          results.push({
            approvalId: approval.id,
            executionId: approval.execution_id,
            action: 'nothing',
            status: 'skipped',
            error: 'Step or execution not found',
          })
          continue
        }

        // Skip if execution is no longer in progress
        if (execution.status !== 'in_progress') {
          results.push({
            approvalId: approval.id,
            executionId: approval.execution_id,
            action: 'nothing',
            status: 'skipped',
            error: `Execution status is ${execution.status}`,
          })
          continue
        }

        const timeoutAction = (step.timeout_action || 'nothing') as TimeoutAction

        await processTimeoutAction(
          supabase,
          approval,
          step,
          execution,
          timeoutAction,
          now
        )

        results.push({
          approvalId: approval.id,
          executionId: approval.execution_id,
          action: timeoutAction,
          status: 'processed',
        })
      } catch (error) {
        results.push({
          approvalId: approval.id,
          executionId: approval.execution_id,
          action: 'nothing',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Also process reminders for approvals approaching their due date
    await processReminders(supabase, now, results)

    const processed = results.filter(r => r.status === 'processed').length

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        total: results.length,
        results,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Approval timeout processing error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Process a timeout action for an approval
 */
async function processTimeoutAction(
  supabase: ReturnType<typeof createClient>,
  approval: PendingApproval,
  step: WorkflowStep,
  execution: WorkflowExecution,
  action: TimeoutAction,
  now: Date
): Promise<void> {
  switch (action) {
    case 'auto_approve':
      await handleAutoApprove(supabase, approval, execution, now)
      break

    case 'auto_reject':
      await handleAutoReject(supabase, approval, execution, now)
      break

    case 'escalate':
      await handleEscalation(supabase, approval, step, execution, now)
      break

    case 'reminder':
      await sendReminderNotification(supabase, approval, step, execution)
      // Mark as expired after sending final reminder
      await markAsExpired(supabase, approval, now)
      break

    case 'nothing':
    default:
      await markAsExpired(supabase, approval, now)
      break
  }
}

/**
 * Handle auto-approval of a timed-out approval
 */
async function handleAutoApprove(
  supabase: ReturnType<typeof createClient>,
  approval: PendingApproval,
  execution: WorkflowExecution,
  now: Date
): Promise<void> {
  // Update approval status
  await supabase
    .from('workflow_approvals')
    .update({
      status: 'approved',
      responded_at: now.toISOString(),
      response_notes: 'Auto-approved due to timeout',
    })
    .eq('id', approval.id)

  // Log the action
  await supabase.from('workflow_execution_logs').insert({
    execution_id: approval.execution_id,
    event_type: 'approval_auto_approve',
    event_data: {
      approval_id: approval.id,
      step_order: approval.step_order,
      action: 'auto_approve',
      due_at: approval.due_at,
      processed_at: now.toISOString(),
    },
    // Also populate new columns
    log_type: 'approval_auto',
    step_order: approval.step_order,
    message: `Step ${approval.step_order} auto-approved due to timeout`,
    metadata: {
      approval_id: approval.id,
      action: 'auto_approve',
      due_at: approval.due_at,
      processed_at: now.toISOString(),
    },
    created_at: now.toISOString(),
  })

  // Trigger next step or complete the workflow
  await advanceWorkflow(supabase, execution, approval.step_order, 'approved', now)
}

/**
 * Handle auto-rejection of a timed-out approval
 */
async function handleAutoReject(
  supabase: ReturnType<typeof createClient>,
  approval: PendingApproval,
  execution: WorkflowExecution,
  now: Date
): Promise<void> {
  // Update approval status
  await supabase
    .from('workflow_approvals')
    .update({
      status: 'rejected',
      responded_at: now.toISOString(),
      response_notes: 'Auto-rejected due to timeout',
    })
    .eq('id', approval.id)

  // Update execution status
  await supabase
    .from('workflow_executions')
    .update({
      status: 'rejected',
      completed_at: now.toISOString(),
      completion_notes: 'Auto-rejected due to approval timeout',
    })
    .eq('id', approval.execution_id)

  // Log the action
  await supabase.from('workflow_execution_logs').insert({
    execution_id: approval.execution_id,
    event_type: 'approval_auto_reject',
    event_data: {
      approval_id: approval.id,
      step_order: approval.step_order,
      action: 'auto_reject',
      due_at: approval.due_at,
      processed_at: now.toISOString(),
    },
    log_type: 'approval_auto',
    step_order: approval.step_order,
    message: `Step ${approval.step_order} auto-rejected due to timeout`,
    metadata: {
      approval_id: approval.id,
      action: 'auto_reject',
      due_at: approval.due_at,
      processed_at: now.toISOString(),
    },
    created_at: now.toISOString(),
  })
}

/**
 * Handle escalation of a timed-out approval
 */
async function handleEscalation(
  supabase: ReturnType<typeof createClient>,
  approval: PendingApproval,
  step: WorkflowStep,
  execution: WorkflowExecution,
  now: Date
): Promise<void> {
  // Mark current approval as escalated
  await supabase
    .from('workflow_approvals')
    .update({
      status: 'escalated',
      escalated_at: now.toISOString(),
    })
    .eq('id', approval.id)

  // Get the escalation target
  const escalationConfig = (step.approver_config as Record<string, unknown>).escalation_to
  let escalationApproverId: string | null = null

  if (typeof escalationConfig === 'string') {
    escalationApproverId = escalationConfig
  } else if (escalationConfig && typeof escalationConfig === 'object') {
    // Handle complex escalation config
    const config = escalationConfig as Record<string, unknown>
    if (config.user_id) {
      escalationApproverId = config.user_id as string
    } else if (config.role_name) {
      // Find a user with the specified role
      const { data: roleUser } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('org_id', execution.org_id)
        .eq('role_name', config.role_name)
        .limit(1)
        .single()

      if (roleUser) {
        escalationApproverId = roleUser.user_id
      }
    }
  }

  // If no escalation target, get the approver's manager
  if (!escalationApproverId) {
    const { data: approverEmployee } = await supabase
      .from('employees')
      .select('manager_id')
      .eq('user_id', approval.approver_id)
      .single()

    if (approverEmployee?.manager_id) {
      escalationApproverId = approverEmployee.manager_id
    }
  }

  // If still no escalation target, fallback to org admin
  if (!escalationApproverId) {
    const { data: orgAdmin } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('org_id', execution.org_id)
      .eq('role_name', 'admin')
      .limit(1)
      .single()

    if (orgAdmin) {
      escalationApproverId = orgAdmin.user_id
    }
  }

  if (escalationApproverId) {
    // Calculate new due date
    const newDueAt = step.timeout_hours
      ? new Date(now.getTime() + step.timeout_hours * 60 * 60 * 1000)
      : null

    // Create new approval for escalation target
    await supabase.from('workflow_approvals').insert({
      execution_id: approval.execution_id,
      step_id: approval.step_id,
      step_order: approval.step_order,
      approver_id: escalationApproverId,
      status: 'pending',
      requested_at: now.toISOString(),
      due_at: newDueAt?.toISOString() || null,
    })

    // Send notification to escalation target
    await sendEscalationNotification(
      supabase,
      execution,
      step,
      escalationApproverId,
      approval.approver_id
    )
  }

  // Update execution status
  await supabase
    .from('workflow_executions')
    .update({
      status: 'escalated',
      metadata: {
        ...execution.metadata,
        escalated_at: now.toISOString(),
        escalated_from: approval.approver_id,
        escalated_to: escalationApproverId,
      },
    })
    .eq('id', approval.execution_id)

  // Log the escalation
  await supabase.from('workflow_execution_logs').insert({
    execution_id: approval.execution_id,
    event_type: 'approval_escalated',
    event_data: {
      approval_id: approval.id,
      step_order: approval.step_order,
      original_approver: approval.approver_id,
      escalated_to: escalationApproverId,
      due_at: approval.due_at,
      processed_at: now.toISOString(),
    },
    log_type: 'escalation',
    step_order: approval.step_order,
    message: `Step ${approval.step_order} escalated from ${approval.approver_id} to ${escalationApproverId || 'N/A'}`,
    metadata: {
      approval_id: approval.id,
      original_approver: approval.approver_id,
      escalated_to: escalationApproverId,
      due_at: approval.due_at,
      processed_at: now.toISOString(),
    },
    created_at: now.toISOString(),
  })
}

/**
 * Mark an approval as expired
 */
async function markAsExpired(
  supabase: ReturnType<typeof createClient>,
  approval: PendingApproval,
  now: Date
): Promise<void> {
  await supabase
    .from('workflow_approvals')
    .update({
      status: 'expired',
      responded_at: now.toISOString(),
      response_notes: 'Expired due to timeout',
    })
    .eq('id', approval.id)

  await supabase
    .from('workflow_executions')
    .update({
      status: 'expired',
      completed_at: now.toISOString(),
      completion_notes: 'Expired due to approval timeout',
    })
    .eq('id', approval.execution_id)

  await supabase.from('workflow_execution_logs').insert({
    execution_id: approval.execution_id,
    event_type: 'approval_expired',
    event_data: {
      approval_id: approval.id,
      step_order: approval.step_order,
      due_at: approval.due_at,
      processed_at: now.toISOString(),
    },
    log_type: 'timeout',
    step_order: approval.step_order,
    message: `Step ${approval.step_order} expired due to timeout`,
    metadata: {
      approval_id: approval.id,
      due_at: approval.due_at,
      processed_at: now.toISOString(),
    },
    created_at: now.toISOString(),
  })
}

/**
 * Advance workflow to next step or complete it
 */
async function advanceWorkflow(
  supabase: ReturnType<typeof createClient>,
  execution: WorkflowExecution,
  currentStepOrder: number,
  result: 'approved' | 'rejected',
  now: Date
): Promise<void> {
  if (result === 'rejected') {
    await supabase
      .from('workflow_executions')
      .update({
        status: 'rejected',
        completed_at: now.toISOString(),
      })
      .eq('id', execution.id)
    return
  }

  // Get next step
  const { data: nextStep } = await supabase
    .from('workflow_steps')
    .select('*')
    .eq('workflow_id', execution.workflow_id)
    .gt('step_order', currentStepOrder)
    .order('step_order', { ascending: true })
    .limit(1)
    .single()

  if (!nextStep) {
    // No more steps - workflow is complete
    await supabase
      .from('workflow_executions')
      .update({
        status: 'completed',
        completed_at: now.toISOString(),
        completion_notes: 'All approval steps completed',
      })
      .eq('id', execution.id)

    // Execute on_completion actions
    await executeCompletionActions(supabase, execution)
  } else {
    // Move to next step
    await supabase
      .from('workflow_executions')
      .update({
        current_step: nextStep.step_order,
      })
      .eq('id', execution.id)

    // Create approval for next step
    await createApprovalForStep(supabase, execution, nextStep as WorkflowStep, now)
  }
}

/**
 * Create an approval request for a workflow step
 */
async function createApprovalForStep(
  supabase: ReturnType<typeof createClient>,
  execution: WorkflowExecution,
  step: WorkflowStep,
  now: Date
): Promise<void> {
  // Resolve approver based on step configuration
  let approverId: string | null = null

  switch (step.approver_type) {
    case 'specific_user':
      approverId = (step.approver_config as Record<string, unknown>).user_id as string
      break

    case 'record_owner': {
      const { data: record } = await supabase
        .from(execution.entity_type)
        .select('owner_id, created_by')
        .eq('id', execution.entity_id)
        .single()

      approverId = record?.owner_id || record?.created_by || null
      break
    }

    case 'role_based': {
      const roleName = (step.approver_config as Record<string, unknown>).role_name as string
      const { data: roleUser } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('org_id', execution.org_id)
        .eq('role_name', roleName)
        .limit(1)
        .single()

      approverId = roleUser?.user_id || null
      break
    }

    default:
      // Fallback to org admin
      const { data: admin } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('org_id', execution.org_id)
        .eq('role_name', 'admin')
        .limit(1)
        .single()

      approverId = admin?.user_id || null
  }

  if (!approverId) {
    throw new Error(`Could not resolve approver for step ${step.step_order}`)
  }

  // Calculate due date
  let dueAt: Date | null = null
  if (step.timeout_hours) {
    const hours = convertTimeoutToHours(step.timeout_hours, step.timeout_unit)
    dueAt = new Date(now.getTime() + hours * 60 * 60 * 1000)
  }

  await supabase.from('workflow_approvals').insert({
    execution_id: execution.id,
    step_id: step.id,
    step_order: step.step_order,
    approver_id: approverId,
    status: 'pending',
    requested_at: now.toISOString(),
    due_at: dueAt?.toISOString() || null,
  })
}

/**
 * Convert timeout to hours based on unit
 */
function convertTimeoutToHours(value: number, unit: string): number {
  switch (unit) {
    case 'minutes':
      return value / 60
    case 'hours':
      return value
    case 'business_hours':
      // Assume 8 business hours = 1 day, multiply by calendar factor
      return value * (24 / 8)
    case 'days':
      return value * 24
    case 'business_days':
      // Assume 5 business days = 7 calendar days
      return value * 24 * (7 / 5)
    default:
      return value
  }
}

/**
 * Execute completion actions for a workflow
 */
async function executeCompletionActions(
  supabase: ReturnType<typeof createClient>,
  execution: WorkflowExecution
): Promise<void> {
  // Get on_completion actions
  const { data: actions } = await supabase
    .from('workflow_actions')
    .select('*')
    .eq('workflow_id', execution.workflow_id)
    .eq('action_trigger', 'on_completion')
    .order('action_order')

  if (!actions || actions.length === 0) return

  for (const action of actions) {
    try {
      await executeAction(supabase, execution, action)
    } catch (error) {
      console.error(`Error executing action ${action.id}:`, error)
    }
  }
}

/**
 * Execute a single workflow action
 */
async function executeAction(
  supabase: ReturnType<typeof createClient>,
  execution: WorkflowExecution,
  action: { action_type: string; action_config: Record<string, unknown> }
): Promise<void> {
  const { action_type, action_config } = action

  switch (action_type) {
    case 'update_field': {
      const { field, value } = action_config as { field: string; value: unknown }
      await supabase
        .from(execution.entity_type)
        .update({ [field]: value })
        .eq('id', execution.entity_id)
      break
    }

    case 'create_activity': {
      const config = action_config as Record<string, unknown>
      await supabase.from('activities').insert({
        org_id: execution.org_id,
        entity_type: execution.entity_type,
        entity_id: execution.entity_id,
        activity_type: config.activity_type || 'workflow_completed',
        subject: config.subject || 'Workflow completed',
        description: config.description || `Workflow execution ${execution.id} completed`,
        created_at: new Date().toISOString(),
      })
      break
    }

    case 'send_notification': {
      const config = action_config as Record<string, unknown>
      // Insert notification (assumes notifications table exists)
      await supabase.from('notifications').insert({
        org_id: execution.org_id,
        user_id: config.recipient || null,
        title: config.subject || 'Workflow Notification',
        message: config.template || 'A workflow has been completed.',
        notification_type: 'workflow',
        entity_type: execution.entity_type,
        entity_id: execution.entity_id,
        created_at: new Date().toISOString(),
      }).catch(() => {
        // Ignore if notifications table doesn't exist
      })
      break
    }

    // Other action types can be added here
  }
}

/**
 * Process reminders for approvals approaching their due date
 */
async function processReminders(
  supabase: ReturnType<typeof createClient>,
  now: Date,
  results: Array<{
    approvalId: string
    executionId: string
    action: TimeoutAction
    status: 'processed' | 'skipped' | 'error'
    error?: string
  }>
): Promise<void> {
  // Get pending approvals with reminders enabled that haven't been sent yet
  const { data: approvalsNeedingReminder } = await supabase
    .from('workflow_approvals')
    .select(`
      id,
      execution_id,
      step_id,
      step_order,
      approver_id,
      status,
      requested_at,
      due_at,
      reminder_sent_at
    `)
    .eq('status', 'pending')
    .not('due_at', 'is', null)
    .is('reminder_sent_at', null)

  if (!approvalsNeedingReminder || approvalsNeedingReminder.length === 0) return

  // Get step configurations
  const stepIds = [...new Set(approvalsNeedingReminder.map(a => a.step_id))]
  const { data: steps } = await supabase
    .from('workflow_steps')
    .select('*')
    .in('id', stepIds)
    .eq('reminder_enabled', true)

  if (!steps || steps.length === 0) return

  const stepsMap = new Map(steps.map(s => [s.id, s as WorkflowStep]))

  for (const approval of approvalsNeedingReminder as PendingApproval[]) {
    const step = stepsMap.get(approval.step_id)
    if (!step || !step.reminder_enabled || !step.reminder_percent) continue

    const dueAt = new Date(approval.due_at!)
    const requestedAt = new Date(approval.requested_at)
    const totalDuration = dueAt.getTime() - requestedAt.getTime()
    const reminderTime = requestedAt.getTime() + (totalDuration * step.reminder_percent / 100)

    if (now.getTime() >= reminderTime) {
      try {
        // Get execution for context
        const { data: execution } = await supabase
          .from('workflow_executions')
          .select('*')
          .eq('id', approval.execution_id)
          .single()

        if (execution) {
          await sendReminderNotification(
            supabase,
            approval,
            step,
            execution as WorkflowExecution
          )

          // Mark reminder as sent
          await supabase
            .from('workflow_approvals')
            .update({ reminder_sent_at: now.toISOString() })
            .eq('id', approval.id)

          results.push({
            approvalId: approval.id,
            executionId: approval.execution_id,
            action: 'reminder',
            status: 'processed',
          })
        }
      } catch (error) {
        results.push({
          approvalId: approval.id,
          executionId: approval.execution_id,
          action: 'reminder',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }
}

/**
 * Send a reminder notification to the approver
 */
async function sendReminderNotification(
  supabase: ReturnType<typeof createClient>,
  approval: PendingApproval,
  step: WorkflowStep,
  execution: WorkflowExecution
): Promise<void> {
  const dueAt = approval.due_at ? new Date(approval.due_at) : null
  const now = new Date()
  const hoursRemaining = dueAt
    ? Math.round((dueAt.getTime() - now.getTime()) / (1000 * 60 * 60))
    : null

  await supabase.from('notifications').insert({
    org_id: execution.org_id,
    user_id: approval.approver_id,
    title: 'Approval Reminder',
    message: `You have a pending approval for "${step.step_name}" that ${
      hoursRemaining !== null
        ? `is due in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`
        : 'requires your attention'
    }.`,
    notification_type: 'approval_reminder',
    entity_type: execution.entity_type,
    entity_id: execution.entity_id,
    action_url: `/employee/admin/workflows/approvals?execution=${execution.id}`,
    created_at: now.toISOString(),
  }).catch(() => {
    // Ignore if notifications table doesn't exist
  })
}

/**
 * Send an escalation notification
 */
async function sendEscalationNotification(
  supabase: ReturnType<typeof createClient>,
  execution: WorkflowExecution,
  step: WorkflowStep,
  escalatedTo: string,
  escalatedFrom: string
): Promise<void> {
  await supabase.from('notifications').insert({
    org_id: execution.org_id,
    user_id: escalatedTo,
    title: 'Escalated Approval Request',
    message: `An approval for "${step.step_name}" has been escalated to you because the previous approver did not respond in time.`,
    notification_type: 'approval_escalation',
    entity_type: execution.entity_type,
    entity_id: execution.entity_id,
    action_url: `/employee/admin/workflows/approvals?execution=${execution.id}`,
    metadata: {
      escalated_from: escalatedFrom,
      step_name: step.step_name,
    },
    created_at: new Date().toISOString(),
  }).catch(() => {
    // Ignore if notifications table doesn't exist
  })
}
