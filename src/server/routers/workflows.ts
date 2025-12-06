import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// INPUT SCHEMAS
// ============================================

const workflowTypeSchema = z.enum([
  'approval', 'status_auto', 'notification', 'sla_escalation',
  'field_auto', 'assignment', 'webhook', 'scheduled'
])

const triggerEventSchema = z.enum([
  'record_created', 'record_updated', 'field_changed',
  'status_changed', 'time_based', 'manual'
])

const workflowStatusSchema = z.enum(['draft', 'active', 'disabled', 'archived'])

const entityTypeSchema = z.enum([
  'jobs', 'candidates', 'submissions', 'placements',
  'accounts', 'contacts', 'leads', 'deals', 'activities',
  'employees', 'consultants', 'vendors', 'interviews'
])

const approverTypeSchema = z.enum([
  'specific_user', 'record_owner', 'owners_manager',
  'role_based', 'pod_manager', 'custom_formula'
])

const timeoutUnitSchema = z.enum([
  'minutes', 'hours', 'business_hours', 'days', 'business_days'
])

const timeoutActionSchema = z.enum([
  'escalate', 'auto_approve', 'auto_reject', 'reminder', 'nothing'
])

const actionTriggerSchema = z.enum([
  'on_start', 'on_approval', 'on_rejection', 'on_cancellation',
  'on_completion', 'on_timeout', 'on_each_step'
])

const actionTypeSchema = z.enum([
  'update_field', 'send_notification', 'create_activity',
  'trigger_webhook', 'run_workflow', 'assign_user', 'create_task'
])

const conditionOperatorSchema = z.enum([
  'eq', 'neq', 'contains', 'starts_with', 'ends_with',
  'gt', 'lt', 'gte', 'lte', 'between',
  'is_empty', 'is_not_empty', 'in', 'not_in',
  'changed', 'changed_to', 'changed_from',
  'has_rel', 'no_rel'
])

const conditionSchema = z.object({
  field: z.string(),
  operator: conditionOperatorSchema,
  value: z.unknown(),
  valueEnd: z.unknown().optional(), // For 'between' operator
})

const triggerConditionsSchema = z.object({
  conditions: z.array(conditionSchema).default([]),
  logic: z.enum(['and', 'or']).default('and'),
})

const stepSchema = z.object({
  stepName: z.string().min(1, 'Step name is required'),
  approverType: approverTypeSchema,
  approverConfig: z.record(z.unknown()).default({}),
  timeoutHours: z.number().min(1).max(720).optional(),
  timeoutUnit: timeoutUnitSchema.default('hours'),
  timeoutAction: timeoutActionSchema.optional(),
  reminderEnabled: z.boolean().default(false),
  reminderPercent: z.number().min(0).max(100).optional(),
})

const actionSchema = z.object({
  actionTrigger: actionTriggerSchema,
  actionOrder: z.number().default(1),
  actionType: actionTypeSchema,
  actionConfig: z.record(z.unknown()),
})

const createWorkflowSchema = z.object({
  name: z.string().min(5, 'Name must be at least 5 characters').max(100),
  description: z.string().optional(),
  workflowType: workflowTypeSchema,
  entityType: entityTypeSchema,
  triggerEvent: triggerEventSchema,
  triggerConditions: triggerConditionsSchema.optional(),
  scheduleConfig: z.object({
    cron: z.string(),
    timezone: z.string().default('UTC'),
  }).optional(),
  steps: z.array(stepSchema).optional(),
  actions: z.array(actionSchema).optional(),
})

const updateWorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(5).max(100).optional(),
  description: z.string().optional().nullable(),
  triggerConditions: triggerConditionsSchema.optional(),
  scheduleConfig: z.object({
    cron: z.string(),
    timezone: z.string().default('UTC'),
  }).optional().nullable(),
  steps: z.array(stepSchema).optional(),
  actions: z.array(actionSchema).optional(),
})

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Type definitions for database returns
interface WorkflowRow {
  id: string
  org_id: string
  name: string
  description: string | null
  workflow_type: string
  entity_type: string
  trigger_event: string
  trigger_conditions: Record<string, unknown>
  status: string
  version: number
  parent_version_id: string | null
  schedule_config: Record<string, unknown> | null
  activated_at: string | null
  activated_by: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at: string | null
}

interface WorkflowStepRow {
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
  created_at: string
}

interface WorkflowActionRow {
  id: string
  workflow_id: string
  action_trigger: string
  action_order: number
  action_type: string
  action_config: Record<string, unknown>
  created_at: string
}

interface ExecutionCountResult {
  total_runs: number
  successful_runs: number
  failed_runs: number
  last_run_at: string | null
}

export const workflowsRouter = router({
  // ============================================
  // GET STATS FOR DASHBOARD
  // ============================================
  getStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .rpc('get_workflow_stats', { p_org_id: orgId })

      if (error) {
        console.error('Failed to fetch workflow stats:', error)
        return {
          total: 0,
          active: 0,
          draft: 0,
          disabled: 0,
          totalExecutions: 0,
          pendingApprovals: 0,
          executionsToday: 0,
          executionsThisWeek: 0,
        }
      }

      const stats = data?.[0] ?? {}
      return {
        total: Number(stats.total_count) || 0,
        active: Number(stats.active_count) || 0,
        draft: Number(stats.draft_count) || 0,
        disabled: Number(stats.disabled_count) || 0,
        totalExecutions: Number(stats.total_executions) || 0,
        pendingApprovals: Number(stats.pending_approvals) || 0,
        executionsToday: Number(stats.executions_today) || 0,
        executionsThisWeek: Number(stats.executions_this_week) || 0,
      }
    }),

  // ============================================
  // LIST WORKFLOWS
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      workflowType: workflowTypeSchema.optional(),
      status: workflowStatusSchema.optional(),
      entityType: entityTypeSchema.optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const { search, workflowType, status, entityType, page, pageSize } = input
      const adminClient = getAdminClient()

      let query = adminClient
        .from('workflows')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }
      if (workflowType) {
        query = query.eq('workflow_type', workflowType)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (entityType) {
        query = query.eq('entity_type', entityType)
      }

      // Pagination
      const offset = (page - 1) * pageSize
      query = query
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false })

      const { data, count, error } = await query

      if (error) {
        console.error('Failed to fetch workflows:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch workflows',
        })
      }

      // Get execution counts for each workflow
      const workflows = data as WorkflowRow[] ?? []
      const workflowsWithStats = await Promise.all(
        workflows.map(async (workflow) => {
          const { data: execData } = await adminClient
            .rpc('get_workflow_execution_count', { p_workflow_id: workflow.id })

          const execStats = (execData as ExecutionCountResult[])?.[0] ?? {
            total_runs: 0,
            successful_runs: 0,
            failed_runs: 0,
            last_run_at: null,
          }

          return {
            ...workflow,
            totalRuns: Number(execStats.total_runs) || 0,
            successfulRuns: Number(execStats.successful_runs) || 0,
            failedRuns: Number(execStats.failed_runs) || 0,
            lastRunAt: execStats.last_run_at,
          }
        })
      )

      return {
        items: workflowsWithStats,
        pagination: {
          total: count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // ============================================
  // GET WORKFLOW BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get workflow
      const { data: workflow, error: workflowError } = await adminClient
        .from('workflows')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (workflowError || !workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        })
      }

      // Get steps
      const { data: steps } = await adminClient
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', input.id)
        .order('step_order')

      // Get actions
      const { data: actions } = await adminClient
        .from('workflow_actions')
        .select('*')
        .eq('workflow_id', input.id)
        .order('action_order')

      // Get execution stats
      const { data: execData } = await adminClient
        .rpc('get_workflow_execution_count', { p_workflow_id: input.id })

      const execStats = (execData as ExecutionCountResult[])?.[0] ?? {
        total_runs: 0,
        successful_runs: 0,
        failed_runs: 0,
        last_run_at: null,
      }

      // Get created by user info
      let createdByUser = null
      if (workflow.created_by) {
        const { data: userData } = await adminClient
          .from('user_profiles')
          .select('id, email, full_name')
          .eq('id', workflow.created_by)
          .single()
        createdByUser = userData
      }

      return {
        ...workflow,
        steps: (steps as WorkflowStepRow[]) ?? [],
        actions: (actions as WorkflowActionRow[]) ?? [],
        totalRuns: Number(execStats.total_runs) || 0,
        successfulRuns: Number(execStats.successful_runs) || 0,
        failedRuns: Number(execStats.failed_runs) || 0,
        lastRunAt: execStats.last_run_at,
        createdByUser,
      }
    }),

  // ============================================
  // CREATE WORKFLOW
  // ============================================
  create: orgProtectedProcedure
    .input(createWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Check for duplicate name
      const { data: existing } = await adminClient
        .from('workflows')
        .select('id')
        .eq('org_id', orgId)
        .eq('name', input.name)
        .is('deleted_at', null)
        .limit(1)

      if (existing && existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A workflow with this name already exists',
        })
      }

      // Create workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .insert({
          org_id: orgId,
          name: input.name,
          description: input.description,
          workflow_type: input.workflowType,
          entity_type: input.entityType,
          trigger_event: input.triggerEvent,
          trigger_conditions: input.triggerConditions ?? { conditions: [], logic: 'and' },
          schedule_config: input.scheduleConfig,
          status: 'draft',
          version: 1,
          created_by: user?.id,
        })
        .select()
        .single()

      if (workflowError || !workflow) {
        console.error('Failed to create workflow:', workflowError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create workflow',
        })
      }

      // Create steps if provided (for approval workflows)
      if (input.steps && input.steps.length > 0) {
        const stepsToInsert = input.steps.map((step, index) => ({
          workflow_id: workflow.id,
          step_order: index + 1,
          step_name: step.stepName,
          approver_type: step.approverType,
          approver_config: step.approverConfig,
          timeout_hours: step.timeoutHours,
          timeout_unit: step.timeoutUnit,
          timeout_action: step.timeoutAction,
          reminder_enabled: step.reminderEnabled,
          reminder_percent: step.reminderPercent,
        }))

        const { error: stepsError } = await supabase
          .from('workflow_steps')
          .insert(stepsToInsert)

        if (stepsError) {
          console.error('Failed to create workflow steps:', stepsError)
          // Clean up workflow on step creation failure
          await adminClient.from('workflows').delete().eq('id', workflow.id)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create workflow steps',
          })
        }
      }

      // Create actions if provided
      if (input.actions && input.actions.length > 0) {
        const actionsToInsert = input.actions.map((action, index) => ({
          workflow_id: workflow.id,
          action_trigger: action.actionTrigger,
          action_order: action.actionOrder || index + 1,
          action_type: action.actionType,
          action_config: action.actionConfig,
        }))

        const { error: actionsError } = await supabase
          .from('workflow_actions')
          .insert(actionsToInsert)

        if (actionsError) {
          console.error('Failed to create workflow actions:', actionsError)
        }
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'workflows',
        record_id: workflow.id,
        new_values: {
          name: input.name,
          workflow_type: input.workflowType,
          entity_type: input.entityType,
        },
      })

      return workflow
    }),

  // ============================================
  // UPDATE WORKFLOW
  // ============================================
  update: orgProtectedProcedure
    .input(updateWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get current workflow
      const { data: current, error: fetchError } = await adminClient
        .from('workflows')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        })
      }

      // Only allow updates on draft workflows
      if (current.status !== 'draft') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only draft workflows can be edited. Create a new version to modify an active workflow.',
        })
      }

      // Check for duplicate name if name is being changed
      if (input.name && input.name !== current.name) {
        const { data: existing } = await adminClient
          .from('workflows')
          .select('id')
          .eq('org_id', orgId)
          .eq('name', input.name)
          .neq('id', input.id)
          .is('deleted_at', null)
          .limit(1)

        if (existing && existing.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A workflow with this name already exists',
          })
        }
      }

      // Build update object
      const updates: Record<string, unknown> = {}
      if (input.name !== undefined) updates.name = input.name
      if (input.description !== undefined) updates.description = input.description
      if (input.triggerConditions !== undefined) updates.trigger_conditions = input.triggerConditions
      if (input.scheduleConfig !== undefined) updates.schedule_config = input.scheduleConfig

      // Update workflow
      const { data: workflow, error: updateError } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !workflow) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update workflow',
        })
      }

      // Update steps if provided
      if (input.steps !== undefined) {
        // Delete existing steps
        await adminClient
          .from('workflow_steps')
          .delete()
          .eq('workflow_id', input.id)

        // Insert new steps
        if (input.steps.length > 0) {
          const stepsToInsert = input.steps.map((step, index) => ({
            workflow_id: input.id,
            step_order: index + 1,
            step_name: step.stepName,
            approver_type: step.approverType,
            approver_config: step.approverConfig,
            timeout_hours: step.timeoutHours,
            timeout_unit: step.timeoutUnit,
            timeout_action: step.timeoutAction,
            reminder_enabled: step.reminderEnabled,
            reminder_percent: step.reminderPercent,
          }))

          await supabase.from('workflow_steps').insert(stepsToInsert)
        }
      }

      // Update actions if provided
      if (input.actions !== undefined) {
        // Delete existing actions
        await adminClient
          .from('workflow_actions')
          .delete()
          .eq('workflow_id', input.id)

        // Insert new actions
        if (input.actions.length > 0) {
          const actionsToInsert = input.actions.map((action, index) => ({
            workflow_id: input.id,
            action_trigger: action.actionTrigger,
            action_order: action.actionOrder || index + 1,
            action_type: action.actionType,
            action_config: action.actionConfig,
          }))

          await supabase.from('workflow_actions').insert(actionsToInsert)
        }
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'workflows',
        record_id: input.id,
        old_values: { name: current.name },
        new_values: updates,
      })

      return workflow
    }),

  // ============================================
  // DELETE WORKFLOW (Soft Delete)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify exists
      const { data: current, error: fetchError } = await adminClient
        .from('workflows')
        .select('id, name, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        })
      }

      // Check if there are running executions
      const { count: runningCount } = await adminClient
        .from('workflow_executions')
        .select('*', { count: 'exact', head: true })
        .eq('workflow_id', input.id)
        .in('status', ['pending', 'in_progress'])

      if (runningCount && runningCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete workflow with ${runningCount} running execution(s). Cancel them first.`,
        })
      }

      // Soft delete
      const { error: deleteError } = await supabase
        .from('workflows')
        .update({
          deleted_at: new Date().toISOString(),
          status: 'archived',
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (deleteError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete workflow',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'delete',
        table_name: 'workflows',
        record_id: input.id,
        old_values: { name: current.name, status: current.status },
      })

      return { success: true }
    }),

  // ============================================
  // ACTIVATE WORKFLOW
  // ============================================
  activate: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get workflow with steps
      const { data: workflow, error: fetchError } = await adminClient
        .from('workflows')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        })
      }

      if (workflow.status === 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Workflow is already active',
        })
      }

      // Validate approval workflow has steps
      if (workflow.workflow_type === 'approval') {
        const { count: stepsCount } = await adminClient
          .from('workflow_steps')
          .select('*', { count: 'exact', head: true })
          .eq('workflow_id', input.id)

        if (!stepsCount || stepsCount === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Approval workflows must have at least one approval step',
          })
        }
      }

      // Activate workflow
      const { data: updated, error: updateError } = await supabase
        .from('workflows')
        .update({
          status: 'active',
          activated_at: new Date().toISOString(),
          activated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !updated) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to activate workflow',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'activate',
        table_name: 'workflows',
        record_id: input.id,
        new_values: { status: 'active' },
      })

      return updated
    }),

  // ============================================
  // DISABLE WORKFLOW
  // ============================================
  disable: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get workflow
      const { data: workflow, error: fetchError } = await adminClient
        .from('workflows')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        })
      }

      if (workflow.status !== 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only active workflows can be disabled',
        })
      }

      // Disable workflow
      const { data: updated, error: updateError } = await supabase
        .from('workflows')
        .update({ status: 'disabled' })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !updated) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disable workflow',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'disable',
        table_name: 'workflows',
        record_id: input.id,
        new_values: { status: 'disabled' },
      })

      return updated
    }),

  // ============================================
  // CLONE WORKFLOW
  // ============================================
  clone: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      newName: z.string().min(5).max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get source workflow with steps and actions
      const { data: source, error: fetchError } = await adminClient
        .from('workflows')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !source) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        })
      }

      // Get steps
      const { data: steps } = await adminClient
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', input.id)
        .order('step_order')

      // Get actions
      const { data: actions } = await adminClient
        .from('workflow_actions')
        .select('*')
        .eq('workflow_id', input.id)
        .order('action_order')

      // Generate new name
      let newName = input.newName || `${source.name} (Copy)`

      // Ensure name is unique
      let nameAttempt = 0
      let nameIsUnique = false
      while (!nameIsUnique && nameAttempt < 10) {
        const { data: existing } = await adminClient
          .from('workflows')
          .select('id')
          .eq('org_id', orgId)
          .eq('name', newName)
          .is('deleted_at', null)
          .limit(1)

        if (!existing || existing.length === 0) {
          nameIsUnique = true
        } else {
          nameAttempt++
          newName = input.newName
            ? `${input.newName} (${nameAttempt + 1})`
            : `${source.name} (Copy ${nameAttempt + 1})`
        }
      }

      // Create cloned workflow
      const { data: cloned, error: createError } = await supabase
        .from('workflows')
        .insert({
          org_id: orgId,
          name: newName,
          description: source.description,
          workflow_type: source.workflow_type,
          entity_type: source.entity_type,
          trigger_event: source.trigger_event,
          trigger_conditions: source.trigger_conditions,
          schedule_config: source.schedule_config,
          status: 'draft',
          version: 1,
          created_by: user?.id,
        })
        .select()
        .single()

      if (createError || !cloned) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clone workflow',
        })
      }

      // Clone steps
      if (steps && steps.length > 0) {
        const stepsToInsert = (steps as WorkflowStepRow[]).map((step) => ({
          workflow_id: cloned.id,
          step_order: step.step_order,
          step_name: step.step_name,
          approver_type: step.approver_type,
          approver_config: step.approver_config,
          timeout_hours: step.timeout_hours,
          timeout_unit: step.timeout_unit,
          timeout_action: step.timeout_action,
          reminder_enabled: step.reminder_enabled,
          reminder_percent: step.reminder_percent,
        }))

        await supabase.from('workflow_steps').insert(stepsToInsert)
      }

      // Clone actions
      if (actions && actions.length > 0) {
        const actionsToInsert = (actions as WorkflowActionRow[]).map((action) => ({
          workflow_id: cloned.id,
          action_trigger: action.action_trigger,
          action_order: action.action_order,
          action_type: action.action_type,
          action_config: action.action_config,
        }))

        await supabase.from('workflow_actions').insert(actionsToInsert)
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'clone',
        table_name: 'workflows',
        record_id: cloned.id,
        old_values: { source_id: input.id, source_name: source.name },
        new_values: { name: newName },
      })

      return cloned
    }),

  // ============================================
  // CREATE NEW VERSION (Edit Active Workflow)
  // ============================================
  createVersion: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get source workflow
      const { data: source, error: fetchError } = await adminClient
        .from('workflows')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !source) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        })
      }

      // Get current max version for this workflow name
      const { data: maxVersionData } = await adminClient
        .from('workflows')
        .select('version')
        .eq('org_id', orgId)
        .eq('name', source.name)
        .is('deleted_at', null)
        .order('version', { ascending: false })
        .limit(1)

      const maxVersion = maxVersionData?.[0]?.version ?? source.version
      const newVersion = maxVersion + 1

      // Get steps
      const { data: steps } = await adminClient
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', input.id)
        .order('step_order')

      // Get actions
      const { data: actions } = await adminClient
        .from('workflow_actions')
        .select('*')
        .eq('workflow_id', input.id)
        .order('action_order')

      // Create new version as draft
      const { data: newWorkflow, error: createError } = await supabase
        .from('workflows')
        .insert({
          org_id: orgId,
          name: source.name,
          description: source.description,
          workflow_type: source.workflow_type,
          entity_type: source.entity_type,
          trigger_event: source.trigger_event,
          trigger_conditions: source.trigger_conditions,
          schedule_config: source.schedule_config,
          status: 'draft',
          version: newVersion,
          parent_version_id: input.id,
          created_by: user?.id,
        })
        .select()
        .single()

      if (createError || !newWorkflow) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create new version',
        })
      }

      // Copy steps
      if (steps && steps.length > 0) {
        const stepsToInsert = (steps as WorkflowStepRow[]).map((step) => ({
          workflow_id: newWorkflow.id,
          step_order: step.step_order,
          step_name: step.step_name,
          approver_type: step.approver_type,
          approver_config: step.approver_config,
          timeout_hours: step.timeout_hours,
          timeout_unit: step.timeout_unit,
          timeout_action: step.timeout_action,
          reminder_enabled: step.reminder_enabled,
          reminder_percent: step.reminder_percent,
        }))

        await supabase.from('workflow_steps').insert(stepsToInsert)
      }

      // Copy actions
      if (actions && actions.length > 0) {
        const actionsToInsert = (actions as WorkflowActionRow[]).map((action) => ({
          workflow_id: newWorkflow.id,
          action_trigger: action.action_trigger,
          action_order: action.action_order,
          action_type: action.action_type,
          action_config: action.action_config,
        }))

        await supabase.from('workflow_actions').insert(actionsToInsert)
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create_version',
        table_name: 'workflows',
        record_id: newWorkflow.id,
        old_values: { parent_id: input.id, parent_version: source.version },
        new_values: { version: newVersion },
      })

      return newWorkflow
    }),

  // ============================================
  // VALIDATE WORKFLOW
  // ============================================
  validate: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const errors: string[] = []
      const warnings: string[] = []

      // Get workflow
      const { data: workflow, error: fetchError } = await adminClient
        .from('workflows')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !workflow) {
        return { isValid: false, errors: ['Workflow not found'], warnings: [] }
      }

      // Get steps
      const { data: steps } = await adminClient
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', input.id)
        .order('step_order')

      // Get actions
      const { data: actions } = await adminClient
        .from('workflow_actions')
        .select('*')
        .eq('workflow_id', input.id)
        .order('action_order')

      // Validate name
      if (!workflow.name || workflow.name.length < 5) {
        errors.push('Workflow name must be at least 5 characters')
      }

      // Validate approval workflows have steps
      if (workflow.workflow_type === 'approval') {
        if (!steps || steps.length === 0) {
          errors.push('Approval workflows must have at least one approval step')
        }
      }

      // Validate scheduled workflows have schedule config
      if (workflow.workflow_type === 'scheduled') {
        if (!workflow.schedule_config || !workflow.schedule_config.cron) {
          errors.push('Scheduled workflows must have a cron expression')
        }
      }

      // Validate steps have valid approvers
      if (steps && steps.length > 0) {
        for (const step of steps as WorkflowStepRow[]) {
          if (step.approver_type === 'specific_user' && !step.approver_config.user_id) {
            errors.push(`Step "${step.step_name}" requires a specific user to be selected`)
          }
          if (step.approver_type === 'role_based' && !step.approver_config.role_name) {
            errors.push(`Step "${step.step_name}" requires a role to be selected`)
          }
          if (step.timeout_hours && step.timeout_hours < 1) {
            warnings.push(`Step "${step.step_name}" has a very short timeout`)
          }
        }
      }

      // Validate actions have required config
      if (actions && actions.length > 0) {
        for (const action of actions as WorkflowActionRow[]) {
          if (action.action_type === 'update_field') {
            if (!action.action_config.field || action.action_config.value === undefined) {
              errors.push('Update field action requires field and value')
            }
          }
          if (action.action_type === 'send_notification') {
            if (!action.action_config.recipient) {
              errors.push('Send notification action requires a recipient')
            }
          }
          if (action.action_type === 'trigger_webhook') {
            if (!action.action_config.webhook_id) {
              errors.push('Trigger webhook action requires a webhook to be selected')
            }
          }
        }
      }

      // Check if no actions defined
      if (!actions || actions.length === 0) {
        warnings.push('No actions defined. Consider adding actions for when the workflow completes.')
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      }
    }),

  // ============================================
  // GET EXECUTION HISTORY
  // ============================================
  getExecutionHistory: orgProtectedProcedure
    .input(z.object({
      workflowId: z.string().uuid(),
      status: z.enum(['pending', 'in_progress', 'approved', 'rejected', 'escalated', 'cancelled', 'expired', 'completed', 'failed']).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('workflow_executions')
        .select('*', { count: 'exact' })
        .eq('workflow_id', input.workflowId)
        .eq('org_id', orgId)

      if (input.status) {
        query = query.eq('status', input.status)
      }

      const offset = (input.page - 1) * input.pageSize
      query = query
        .range(offset, offset + input.pageSize - 1)
        .order('started_at', { ascending: false })

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch execution history',
        })
      }

      return {
        items: data ?? [],
        pagination: {
          total: count ?? 0,
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil((count ?? 0) / input.pageSize),
        },
      }
    }),

  // ============================================
  // GET ENTITY TYPES (For dropdown)
  // ============================================
  getEntityTypes: orgProtectedProcedure
    .query(async () => {
      return [
        { value: 'jobs', label: 'Jobs' },
        { value: 'candidates', label: 'Candidates' },
        { value: 'submissions', label: 'Submissions' },
        { value: 'placements', label: 'Placements' },
        { value: 'accounts', label: 'Accounts' },
        { value: 'contacts', label: 'Contacts' },
        { value: 'leads', label: 'Leads' },
        { value: 'deals', label: 'Deals' },
        { value: 'activities', label: 'Activities' },
        { value: 'employees', label: 'Employees' },
        { value: 'consultants', label: 'Consultants' },
        { value: 'vendors', label: 'Vendors' },
        { value: 'interviews', label: 'Interviews' },
      ]
    }),

  // ============================================
  // GET WORKFLOW TYPES (For dropdown)
  // ============================================
  getWorkflowTypes: orgProtectedProcedure
    .query(async () => {
      return [
        {
          value: 'approval',
          label: 'Approval Chain',
          description: 'Multi-level approvals with timeout and escalation',
          bestFor: 'Job approvals, expense approvals',
        },
        {
          value: 'status_auto',
          label: 'Status Automation',
          description: 'Automatically update statuses based on events',
          bestFor: 'Pipeline progression, task completion',
        },
        {
          value: 'notification',
          label: 'Notification Trigger',
          description: 'Send emails, Slack, or in-app notifications',
          bestFor: 'Alerts, reminders, celebrations',
        },
        {
          value: 'sla_escalation',
          label: 'SLA Escalation',
          description: 'Time-based alerts and escalation paths',
          bestFor: 'Response time SLAs, overdue tasks',
        },
        {
          value: 'field_auto',
          label: 'Field Automation',
          description: 'Auto-populate or calculate field values',
          bestFor: 'Default values, calculated fields',
        },
        {
          value: 'assignment',
          label: 'Assignment Rules',
          description: 'Auto-assign records to users or teams',
          bestFor: 'Lead routing, workload balancing',
        },
        {
          value: 'webhook',
          label: 'Webhook Trigger',
          description: 'Call external APIs when events occur',
          bestFor: 'External integrations, sync to other systems',
        },
        {
          value: 'scheduled',
          label: 'Scheduled Task',
          description: 'Run workflows on a schedule',
          bestFor: 'Daily digests, weekly reports',
        },
      ]
    }),

  // ============================================
  // GET TRIGGER EVENTS (For dropdown)
  // ============================================
  getTriggerEvents: orgProtectedProcedure
    .query(async () => {
      return [
        { value: 'record_created', label: 'Record Created' },
        { value: 'record_updated', label: 'Record Updated' },
        { value: 'field_changed', label: 'Field Changed' },
        { value: 'status_changed', label: 'Status Changed' },
        { value: 'time_based', label: 'Time-Based' },
        { value: 'manual', label: 'Manual Trigger' },
      ]
    }),

  // ============================================
  // GET PENDING APPROVALS FOR CURRENT USER
  // ============================================
  getPendingApprovals: orgProtectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      if (!user?.id) {
        return { items: [], total: 0 }
      }

      const offset = (input.page - 1) * input.limit

      const { data, count, error } = await adminClient
        .from('workflow_approvals')
        .select(`
          *,
          execution:workflow_executions!inner(
            *,
            workflow:workflows(id, name, workflow_type, entity_type)
          )
        `, { count: 'exact' })
        .eq('approver_id', user.id)
        .eq('status', 'pending')
        .eq('execution.org_id', orgId)
        .order('requested_at', { ascending: false })
        .range(offset, offset + input.limit - 1)

      if (error) {
        console.error('Failed to fetch pending approvals:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch pending approvals',
        })
      }

      // Enrich with overdue status
      const now = new Date()
      const items = (data ?? []).map((item) => ({
        ...item,
        is_overdue: item.due_at ? new Date(item.due_at) < now : false,
      }))

      return {
        items,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / input.limit),
      }
    }),

  // ============================================
  // RESPOND TO APPROVAL
  // ============================================
  respondToApproval: orgProtectedProcedure
    .input(z.object({
      approvalId: z.string().uuid(),
      response: z.enum(['approved', 'rejected']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      if (!user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        })
      }

      // Get approval with execution info
      const { data: approval, error: fetchError } = await adminClient
        .from('workflow_approvals')
        .select(`
          *,
          execution:workflow_executions!inner(
            *,
            workflow:workflows(*, steps:workflow_steps(*), actions:workflow_actions(*))
          )
        `)
        .eq('id', input.approvalId)
        .single()

      if (fetchError || !approval) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Approval not found',
        })
      }

      // Verify user is the approver
      if (approval.approver_id !== user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to respond to this approval',
        })
      }

      // Verify approval is still pending
      if (approval.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `This approval has already been ${approval.status}`,
        })
      }

      // Verify org access
      const execution = approval.execution as {
        org_id: string
        id: string
        workflow_id: string
        workflow: { steps: WorkflowStepRow[]; actions: WorkflowActionRow[] }
      }
      if (execution.org_id !== orgId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        })
      }

      // Update approval status
      const { error: updateError } = await adminClient
        .from('workflow_approvals')
        .update({
          status: input.response,
          responded_at: new Date().toISOString(),
          response_notes: input.notes || null,
        })
        .eq('id', input.approvalId)

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update approval',
        })
      }

      // Log the action
      await adminClient.from('workflow_execution_logs').insert({
        execution_id: execution.id,
        event_type: `step_${input.response}`,
        event_data: {
          step_order: approval.step_order,
          approver_id: user.id,
          response_notes: input.notes,
        },
        created_at: new Date().toISOString(),
      })

      if (input.response === 'rejected') {
        // Mark execution as rejected
        await adminClient
          .from('workflow_executions')
          .update({
            status: 'rejected',
            completed_at: new Date().toISOString(),
            completed_by: user.id,
            completion_notes: input.notes,
          })
          .eq('id', execution.id)

        // Create audit log
        await supabase.from('audit_logs').insert({
          org_id: orgId,
          user_id: user.id,
          user_email: user.email,
          action: 'approval_rejected',
          table_name: 'workflow_executions',
          record_id: execution.id,
        })

        return { status: 'rejected', message: 'Workflow rejected' }
      }

      // Find next step
      const workflow = execution.workflow
      const sortedSteps = [...workflow.steps].sort((a, b) => a.step_order - b.step_order)
      const currentStepIndex = sortedSteps.findIndex(s => s.step_order === approval.step_order)
      const nextStep = sortedSteps[currentStepIndex + 1]

      if (!nextStep) {
        // No more steps - workflow fully approved
        await adminClient
          .from('workflow_executions')
          .update({
            status: 'approved',
            completed_at: new Date().toISOString(),
            completed_by: user.id,
          })
          .eq('id', execution.id)

        // Create audit log
        await supabase.from('audit_logs').insert({
          org_id: orgId,
          user_id: user.id,
          user_email: user.email,
          action: 'approval_completed',
          table_name: 'workflow_executions',
          record_id: execution.id,
        })

        return { status: 'approved', message: 'Workflow fully approved' }
      }

      // Move to next step - create next approval record
      // For simplicity, using a placeholder approver ID until resolver is called
      const nextApproverConfig = nextStep.approver_config as { user_id?: string }
      const nextApproverId = nextApproverConfig.user_id || user.id // Fallback to current user

      let dueAt: string | null = null
      if (nextStep.timeout_hours) {
        const dueDate = new Date()
        dueDate.setHours(dueDate.getHours() + nextStep.timeout_hours)
        dueAt = dueDate.toISOString()
      }

      await adminClient.from('workflow_approvals').insert({
        execution_id: execution.id,
        step_id: nextStep.id,
        step_order: nextStep.step_order,
        approver_id: nextApproverId,
        status: 'pending',
        requested_at: new Date().toISOString(),
        due_at: dueAt,
      })

      // Update execution current step
      await adminClient
        .from('workflow_executions')
        .update({ current_step: nextStep.step_order })
        .eq('id', execution.id)

      // Log
      await adminClient.from('workflow_execution_logs').insert({
        execution_id: execution.id,
        event_type: 'approval_requested',
        event_data: {
          step_name: nextStep.step_name,
          step_order: nextStep.step_order,
          approver_id: nextApproverId,
        },
        created_at: new Date().toISOString(),
      })

      return {
        status: 'in_progress',
        message: `Moved to step ${nextStep.step_order}: ${nextStep.step_name}`,
        nextStep: {
          order: nextStep.step_order,
          name: nextStep.step_name,
        },
      }
    }),

  // ============================================
  // DELEGATE APPROVAL
  // ============================================
  delegateApproval: orgProtectedProcedure
    .input(z.object({
      approvalId: z.string().uuid(),
      delegateToUserId: z.string().uuid(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      if (!user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        })
      }

      // Get approval
      const { data: approval, error: fetchError } = await adminClient
        .from('workflow_approvals')
        .select(`*, execution:workflow_executions!inner(org_id)`)
        .eq('id', input.approvalId)
        .single()

      if (fetchError || !approval) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Approval not found',
        })
      }

      // Verify user is the approver
      if (approval.approver_id !== user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to delegate this approval',
        })
      }

      // Verify approval is still pending
      if (approval.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only pending approvals can be delegated',
        })
      }

      // Verify delegate user exists in same org
      const { data: delegateUser, error: userError } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('id', input.delegateToUserId)
        .eq('org_id', orgId)
        .single()

      if (userError || !delegateUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid delegate user',
        })
      }

      // Update approval
      const { error: updateError } = await adminClient
        .from('workflow_approvals')
        .update({
          status: 'delegated',
          response_notes: input.notes,
          delegated_to: input.delegateToUserId,
          responded_at: new Date().toISOString(),
        })
        .eq('id', input.approvalId)

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delegate approval',
        })
      }

      // Create new approval for delegated user
      await adminClient.from('workflow_approvals').insert({
        execution_id: approval.execution_id,
        step_id: approval.step_id,
        step_order: approval.step_order,
        approver_id: input.delegateToUserId,
        status: 'pending',
        requested_at: new Date().toISOString(),
        due_at: approval.due_at,
      })

      // Log
      await adminClient.from('workflow_execution_logs').insert({
        execution_id: approval.execution_id,
        event_type: 'approval_delegated',
        event_data: {
          from_user: user.id,
          to_user: input.delegateToUserId,
          notes: input.notes,
        },
        created_at: new Date().toISOString(),
      })

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user.id,
        user_email: user.email,
        action: 'delegate_approval',
        table_name: 'workflow_approvals',
        record_id: input.approvalId,
        new_values: { delegated_to: input.delegateToUserId },
      })

      return { success: true, message: 'Approval delegated' }
    }),

  // ============================================
  // CANCEL EXECUTION
  // ============================================
  cancelExecution: orgProtectedProcedure
    .input(z.object({
      executionId: z.string().uuid(),
      reason: z.string().min(1, 'Reason is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      if (!user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        })
      }

      // Get execution
      const { data: execution, error: fetchError } = await adminClient
        .from('workflow_executions')
        .select('*')
        .eq('id', input.executionId)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !execution) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Execution not found',
        })
      }

      // Verify can be cancelled
      if (!['pending', 'in_progress'].includes(execution.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot cancel execution with status: ${execution.status}`,
        })
      }

      // Update execution
      const { error: updateError } = await adminClient
        .from('workflow_executions')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString(),
          completed_by: user.id,
          completion_notes: input.reason,
        })
        .eq('id', input.executionId)

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel execution',
        })
      }

      // Expire any pending approvals
      await adminClient
        .from('workflow_approvals')
        .update({ status: 'expired' })
        .eq('execution_id', input.executionId)
        .eq('status', 'pending')

      // Log
      await adminClient.from('workflow_execution_logs').insert({
        execution_id: input.executionId,
        event_type: 'execution_cancelled',
        event_data: {
          cancelled_by: user.id,
          reason: input.reason,
        },
        created_at: new Date().toISOString(),
      })

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user.id,
        user_email: user.email,
        action: 'cancel_execution',
        table_name: 'workflow_executions',
        record_id: input.executionId,
        new_values: { status: 'cancelled', reason: input.reason },
      })

      return { success: true, message: 'Execution cancelled' }
    }),

  // ============================================
  // GET EXECUTION DETAILS
  // ============================================
  getExecutionDetails: orgProtectedProcedure
    .input(z.object({ executionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: execution, error: fetchError } = await adminClient
        .from('workflow_executions')
        .select(`
          *,
          workflow:workflows(id, name, workflow_type, entity_type),
          approvals:workflow_approvals(*),
          logs:workflow_execution_logs(*)
        `)
        .eq('id', input.executionId)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !execution) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Execution not found',
        })
      }

      // Sort approvals and logs
      const approvals = (execution.approvals ?? []).sort((a: { step_order: number }, b: { step_order: number }) => a.step_order - b.step_order)
      const logs = (execution.logs ?? []).sort((a: { created_at: string }, b: { created_at: string }) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      return {
        ...execution,
        approvals,
        logs,
      }
    }),

  // ============================================
  // GET EXECUTION HISTORY (Enhanced with approvals)
  // ============================================
  getExecutionHistory: orgProtectedProcedure
    .input(z.object({
      workflowId: z.string().uuid(),
      status: z.enum(['pending', 'in_progress', 'approved', 'rejected', 'escalated', 'cancelled', 'expired', 'completed', 'failed']).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('workflow_executions')
        .select(`
          *,
          approvals:workflow_approvals(*)
        `, { count: 'exact' })
        .eq('workflow_id', input.workflowId)
        .eq('org_id', orgId)

      if (input.status) {
        query = query.eq('status', input.status)
      }

      const offset = (input.page - 1) * input.limit
      query = query
        .range(offset, offset + input.limit - 1)
        .order('started_at', { ascending: false })

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch execution history',
        })
      }

      // Get status counts
      const { data: statusCounts } = await adminClient
        .from('workflow_executions')
        .select('status')
        .eq('workflow_id', input.workflowId)
        .eq('org_id', orgId)

      const counts = {
        totalCount: count ?? 0,
        completedCount: 0,
        inProgressCount: 0,
        failedCount: 0,
        pendingCount: 0,
      }

      statusCounts?.forEach((row) => {
        switch (row.status) {
          case 'completed':
          case 'approved':
            counts.completedCount++
            break
          case 'in_progress':
            counts.inProgressCount++
            break
          case 'failed':
          case 'rejected':
            counts.failedCount++
            break
          case 'pending':
            counts.pendingCount++
            break
        }
      })

      return {
        executions: data ?? [],
        ...counts,
        totalPages: Math.ceil((count ?? 0) / input.limit),
      }
    }),
})
