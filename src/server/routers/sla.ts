import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// INPUT SCHEMAS
// ============================================

const slaCategorySchema = z.enum([
  'response_time', 'submission_speed', 'interview_schedule',
  'interview_feedback', 'offer_response', 'onboarding',
  'client_touch', 'candidate_followup', 'document_collection',
  'timesheet_approval'
])

const entityTypeSchema = z.enum([
  'jobs', 'candidates', 'submissions', 'placements',
  'accounts', 'leads', 'interviews', 'offers'
])

const targetUnitSchema = z.enum([
  'minutes', 'hours', 'business_hours', 'days', 'business_days', 'weeks'
])

const slaStatusSchema = z.enum(['draft', 'active', 'disabled'])

const escalationLevelSchema = z.object({
  levelNumber: z.number().min(1).max(10),
  levelName: z.string().min(1),
  triggerPercentage: z.number().min(1).max(500),
  notifyEmail: z.boolean().default(true),
  emailRecipients: z.array(z.string()).default([]),
  notifySlack: z.boolean().default(false),
  slackChannel: z.string().optional(),
  showBadge: z.boolean().default(true),
  badgeColor: z.enum(['yellow', 'orange', 'red']).default('yellow'),
  addToReport: z.boolean().default(false),
  addToDashboard: z.boolean().default(false),
  createTask: z.boolean().default(false),
  taskAssignee: z.string().optional(),
  escalateOwnership: z.boolean().default(false),
  escalateTo: z.string().optional(),
  requireResolutionNotes: z.boolean().default(false),
})

const createSlaRuleSchema = z.object({
  name: z.string().min(5, 'Name must be at least 5 characters').max(100),
  category: slaCategorySchema,
  description: z.string().optional(),
  entityType: entityTypeSchema,
  startEvent: z.string().min(1, 'Start event is required'),
  endEvent: z.string().min(1, 'End event is required'),
  targetValue: z.number().min(1).max(9999),
  targetUnit: targetUnitSchema,
  useBusinessHours: z.boolean().default(true),
  excludeWeekends: z.boolean().default(true),
  excludeHolidays: z.boolean().default(true),
  pauseOnHold: z.boolean().default(false),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.unknown(),
  })).default([]),
  escalationLevels: z.array(escalationLevelSchema).min(1, 'At least one escalation level required'),
  activate: z.boolean().default(false),
  applyRetroactive: z.boolean().default(false),
})

const updateSlaRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(5).max(100).optional(),
  description: z.string().optional().nullable(),
  targetValue: z.number().min(1).max(9999).optional(),
  targetUnit: targetUnitSchema.optional(),
  useBusinessHours: z.boolean().optional(),
  excludeWeekends: z.boolean().optional(),
  excludeHolidays: z.boolean().optional(),
  pauseOnHold: z.boolean().optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.unknown(),
  })).optional(),
  escalationLevels: z.array(escalationLevelSchema).optional(),
})


// Type for escalation level database record
interface EscalationLevelRow {
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
  escalate_ownership: boolean
  escalate_to: string | null
  require_resolution_notes: boolean
  created_at: string
  updated_at: string
}

export const slaRouter = router({
  // ============================================
  // GET STATS FOR DASHBOARD
  // ============================================
  getStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .rpc('get_sla_stats', { p_org_id: orgId })

      if (error) {
        console.error('Failed to fetch SLA stats:', error)
        return {
          totalRules: 0,
          activeRules: 0,
          draftRules: 0,
          disabledRules: 0,
          pendingEvents: 0,
          warningEvents: 0,
          breachEvents: 0,
          metToday: 0,
          breachedToday: 0,
          complianceRate: 0,
        }
      }

      const stats = data?.[0] ?? {}
      return {
        totalRules: Number(stats.total_rules) || 0,
        activeRules: Number(stats.active_rules) || 0,
        draftRules: Number(stats.draft_rules) || 0,
        disabledRules: Number(stats.disabled_rules) || 0,
        pendingEvents: Number(stats.pending_events) || 0,
        warningEvents: Number(stats.warning_events) || 0,
        breachEvents: Number(stats.breach_events) || 0,
        metToday: Number(stats.met_today) || 0,
        breachedToday: Number(stats.breached_today) || 0,
        complianceRate: Number(stats.compliance_rate) || 0,
      }
    }),

  // ============================================
  // LIST SLA RULES
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      category: slaCategorySchema.optional(),
      status: slaStatusSchema.optional(),
      entityType: entityTypeSchema.optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const { search, category, status, entityType, page, pageSize } = input
      const adminClient = getAdminClient()

      let query = adminClient
        .from('sla_definitions')
        .select(`
          *,
          escalation_levels:sla_escalation_levels(*)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .eq('is_active', true)

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }
      if (category) {
        query = query.eq('category', category)
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
        console.error('Failed to fetch SLA rules:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch SLA rules',
        })
      }

      // Get compliance stats for each rule
      const rulesWithStats = await Promise.all(
        (data ?? []).map(async (rule) => {
          const { data: eventData } = await adminClient
            .from('sla_events')
            .select('status')
            .eq('sla_definition_id', rule.id)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

          const met = eventData?.filter(e => e.status === 'met').length || 0
          const warning = eventData?.filter(e => e.status === 'warning').length || 0
          const breach = eventData?.filter(e => ['breach', 'critical'].includes(e.status)).length || 0
          const total = met + breach
          const complianceRate = total > 0 ? Math.round((met / total) * 100) : 100

          return {
            ...rule,
            stats: {
              met,
              warning,
              breach,
              complianceRate,
            },
          }
        })
      )

      return {
        items: rulesWithStats,
        pagination: {
          total: count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // ============================================
  // GET SLA RULE BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: rule, error } = await adminClient
        .from('sla_definitions')
        .select(`
          *,
          escalation_levels:sla_escalation_levels(*)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !rule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'SLA rule not found',
        })
      }

      // Get created by user info
      let createdByUser = null
      if (rule.created_by) {
        const { data: userData } = await adminClient
          .from('user_profiles')
          .select('id, email, full_name')
          .eq('id', rule.created_by)
          .single()
        createdByUser = userData
      }

      // Get event stats
      const { data: eventData } = await adminClient
        .from('sla_events')
        .select('status, created_at, met_at')
        .eq('sla_definition_id', input.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      return {
        ...rule,
        createdByUser,
        recentEvents: eventData ?? [],
      }
    }),

  // ============================================
  // CREATE SLA RULE
  // ============================================
  create: orgProtectedProcedure
    .input(createSlaRuleSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Check for duplicate name
      const { data: existing } = await adminClient
        .from('sla_definitions')
        .select('id')
        .eq('org_id', orgId)
        .eq('name', input.name)
        .eq('is_active', true)
        .limit(1)

      if (existing && existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An SLA rule with this name already exists',
        })
      }

      // Validate escalation levels are in ascending order
      const sortedLevels = [...input.escalationLevels].sort(
        (a, b) => a.levelNumber - b.levelNumber
      )
      for (let i = 1; i < sortedLevels.length; i++) {
        if (sortedLevels[i].triggerPercentage <= sortedLevels[i - 1].triggerPercentage) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Escalation level ${sortedLevels[i].levelNumber} must have a higher trigger percentage than level ${sortedLevels[i - 1].levelNumber}`,
          })
        }
      }

      // Create SLA rule
      const { data: rule, error: ruleError } = await supabase
        .from('sla_definitions')
        .insert({
          org_id: orgId,
          name: input.name,
          category: input.category,
          description: input.description,
          entity_type: input.entityType,
          start_event: input.startEvent,
          end_event: input.endEvent,
          target_value: input.targetValue,
          target_unit: input.targetUnit,
          business_hours_only: input.useBusinessHours,
          exclude_weekends: input.excludeWeekends,
          conditions: input.conditions,
          status: input.activate ? 'active' : 'draft',
          pause_on_hold: input.pauseOnHold,
          apply_retroactive: input.applyRetroactive,
          created_by: user?.id,
          // Keep legacy fields for compatibility
          warning_threshold: Math.round(input.targetValue * 0.75),
          breach_threshold: input.targetValue,
          metric: input.category,
        })
        .select()
        .single()

      if (ruleError || !rule) {
        console.error('Failed to create SLA rule:', ruleError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create SLA rule',
        })
      }

      // Create escalation levels
      const levelsToInsert = input.escalationLevels.map(level => ({
        sla_definition_id: rule.id,
        level_number: level.levelNumber,
        level_name: level.levelName,
        trigger_percentage: level.triggerPercentage,
        notify_email: level.notifyEmail,
        email_recipients: level.emailRecipients,
        notify_slack: level.notifySlack,
        slack_channel: level.slackChannel,
        show_badge: level.showBadge,
        badge_color: level.badgeColor,
        add_to_report: level.addToReport,
        add_to_dashboard: level.addToDashboard,
        create_task: level.createTask,
        task_assignee: level.taskAssignee,
        escalate_ownership: level.escalateOwnership,
        escalate_to: level.escalateTo,
        require_resolution_notes: level.requireResolutionNotes,
      }))

      const { error: levelsError } = await supabase
        .from('sla_escalation_levels')
        .insert(levelsToInsert)

      if (levelsError) {
        console.error('Failed to create escalation levels:', levelsError)
        // Clean up rule on failure
        await adminClient.from('sla_definitions').delete().eq('id', rule.id)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create escalation levels',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'sla_definitions',
        record_id: rule.id,
        new_values: {
          name: input.name,
          category: input.category,
          entity_type: input.entityType,
          status: input.activate ? 'active' : 'draft',
        },
      })

      return rule
    }),

  // ============================================
  // UPDATE SLA RULE
  // ============================================
  update: orgProtectedProcedure
    .input(updateSlaRuleSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get current rule
      const { data: current, error: fetchError } = await adminClient
        .from('sla_definitions')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'SLA rule not found',
        })
      }

      // Only allow updates on draft rules
      if (current.status !== 'draft') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only draft SLA rules can be edited. Disable the rule first to make changes.',
        })
      }

      // Build update object
      const updates: Record<string, unknown> = {}
      if (input.name !== undefined) updates.name = input.name
      if (input.description !== undefined) updates.description = input.description
      if (input.targetValue !== undefined) {
        updates.target_value = input.targetValue
        updates.warning_threshold = Math.round(input.targetValue * 0.75)
        updates.breach_threshold = input.targetValue
      }
      if (input.targetUnit !== undefined) updates.target_unit = input.targetUnit
      if (input.useBusinessHours !== undefined) updates.business_hours_only = input.useBusinessHours
      if (input.excludeWeekends !== undefined) updates.exclude_weekends = input.excludeWeekends
      if (input.pauseOnHold !== undefined) updates.pause_on_hold = input.pauseOnHold
      if (input.conditions !== undefined) updates.conditions = input.conditions

      // Update rule
      const { data: rule, error: updateError } = await supabase
        .from('sla_definitions')
        .update(updates)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !rule) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update SLA rule',
        })
      }

      // Update escalation levels if provided
      if (input.escalationLevels !== undefined) {
        // Delete existing levels
        await adminClient
          .from('sla_escalation_levels')
          .delete()
          .eq('sla_definition_id', input.id)

        // Insert new levels
        if (input.escalationLevels.length > 0) {
          const levelsToInsert = input.escalationLevels.map(level => ({
            sla_definition_id: input.id,
            level_number: level.levelNumber,
            level_name: level.levelName,
            trigger_percentage: level.triggerPercentage,
            notify_email: level.notifyEmail,
            email_recipients: level.emailRecipients,
            notify_slack: level.notifySlack,
            slack_channel: level.slackChannel,
            show_badge: level.showBadge,
            badge_color: level.badgeColor,
            add_to_report: level.addToReport,
            add_to_dashboard: level.addToDashboard,
            create_task: level.createTask,
            task_assignee: level.taskAssignee,
            escalate_ownership: level.escalateOwnership,
            escalate_to: level.escalateTo,
            require_resolution_notes: level.requireResolutionNotes,
          }))

          await supabase.from('sla_escalation_levels').insert(levelsToInsert)
        }
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'sla_definitions',
        record_id: input.id,
        old_values: { name: current.name },
        new_values: updates,
      })

      return rule
    }),

  // ============================================
  // DELETE SLA RULE (Soft Delete)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify exists
      const { data: current, error: fetchError } = await adminClient
        .from('sla_definitions')
        .select('id, name, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'SLA rule not found',
        })
      }

      // Check for pending events
      const { count: pendingCount } = await adminClient
        .from('sla_events')
        .select('*', { count: 'exact', head: true })
        .eq('sla_definition_id', input.id)
        .in('status', ['pending', 'warning'])

      if (pendingCount && pendingCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete SLA rule with ${pendingCount} pending events. Disable the rule first.`,
        })
      }

      // Soft delete
      const { error: deleteError } = await supabase
        .from('sla_definitions')
        .update({
          is_active: false,
          status: 'disabled',
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (deleteError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete SLA rule',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'delete',
        table_name: 'sla_definitions',
        record_id: input.id,
        old_values: { name: current.name, status: current.status },
      })

      return { success: true }
    }),

  // ============================================
  // ACTIVATE SLA RULE
  // ============================================
  activate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      applyRetroactive: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get rule with escalation levels
      const { data: rule, error: fetchError } = await adminClient
        .from('sla_definitions')
        .select('*, escalation_levels:sla_escalation_levels(*)')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !rule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'SLA rule not found',
        })
      }

      if (rule.status === 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'SLA rule is already active',
        })
      }

      // Validate has escalation levels
      if (!rule.escalation_levels || rule.escalation_levels.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'SLA rule must have at least one escalation level before activation',
        })
      }

      // Activate rule
      const { data: updated, error: updateError } = await supabase
        .from('sla_definitions')
        .update({
          status: 'active',
          apply_retroactive: input.applyRetroactive,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !updated) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to activate SLA rule',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'activate',
        table_name: 'sla_definitions',
        record_id: input.id,
        new_values: { status: 'active', apply_retroactive: input.applyRetroactive },
      })

      return updated
    }),

  // ============================================
  // DISABLE SLA RULE
  // ============================================
  disable: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get rule
      const { data: rule, error: fetchError } = await adminClient
        .from('sla_definitions')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !rule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'SLA rule not found',
        })
      }

      if (rule.status !== 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only active SLA rules can be disabled',
        })
      }

      // Disable rule
      const { data: updated, error: updateError } = await supabase
        .from('sla_definitions')
        .update({ status: 'disabled' })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !updated) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disable SLA rule',
        })
      }

      // Cancel pending events for this rule
      await adminClient
        .from('sla_events')
        .update({ status: 'cancelled' })
        .eq('sla_definition_id', input.id)
        .in('status', ['pending', 'warning'])

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'disable',
        table_name: 'sla_definitions',
        record_id: input.id,
        new_values: { status: 'disabled' },
      })

      return updated
    }),

  // ============================================
  // CLONE SLA RULE
  // ============================================
  clone: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      newName: z.string().min(5).max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get source rule with levels
      const { data: source, error: fetchError } = await adminClient
        .from('sla_definitions')
        .select('*, escalation_levels:sla_escalation_levels(*)')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !source) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'SLA rule not found',
        })
      }

      // Generate unique name
      let newName = input.newName || `${source.name} (Copy)`
      let nameAttempt = 0
      let nameIsUnique = false
      while (!nameIsUnique && nameAttempt < 10) {
        const { data: existing } = await adminClient
          .from('sla_definitions')
          .select('id')
          .eq('org_id', orgId)
          .eq('name', newName)
          .eq('is_active', true)
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

      // Create cloned rule
      const { data: cloned, error: createError } = await supabase
        .from('sla_definitions')
        .insert({
          org_id: orgId,
          name: newName,
          category: source.category,
          description: source.description,
          entity_type: source.entity_type,
          start_event: source.start_event,
          end_event: source.end_event,
          target_value: source.target_value,
          target_unit: source.target_unit,
          business_hours_only: source.business_hours_only,
          exclude_weekends: source.exclude_weekends,
          conditions: source.conditions,
          status: 'draft',
          pause_on_hold: source.pause_on_hold,
          warning_threshold: source.warning_threshold,
          breach_threshold: source.breach_threshold,
          metric: source.metric,
          created_by: user?.id,
        })
        .select()
        .single()

      if (createError || !cloned) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clone SLA rule',
        })
      }

      // Clone escalation levels
      if (source.escalation_levels && source.escalation_levels.length > 0) {
        const levelsToInsert = (source.escalation_levels as EscalationLevelRow[]).map((level) => ({
          sla_definition_id: cloned.id,
          level_number: level.level_number,
          level_name: level.level_name,
          trigger_percentage: level.trigger_percentage,
          notify_email: level.notify_email,
          email_recipients: level.email_recipients,
          notify_slack: level.notify_slack,
          slack_channel: level.slack_channel,
          show_badge: level.show_badge,
          badge_color: level.badge_color,
          add_to_report: level.add_to_report,
          add_to_dashboard: level.add_to_dashboard,
          create_task: level.create_task,
          task_assignee: level.task_assignee,
          escalate_ownership: level.escalate_ownership,
          escalate_to: level.escalate_to,
          require_resolution_notes: level.require_resolution_notes,
        }))

        await supabase.from('sla_escalation_levels').insert(levelsToInsert)
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'clone',
        table_name: 'sla_definitions',
        record_id: cloned.id,
        old_values: { source_id: input.id, source_name: source.name },
        new_values: { name: newName },
      })

      return cloned
    }),

  // ============================================
  // TEST SLA RULE
  // ============================================
  test: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      days: z.number().min(1).max(30).default(7),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get rule
      const { data: rule, error: fetchError } = await adminClient
        .from('sla_definitions')
        .select('*, escalation_levels:sla_escalation_levels(*)')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !rule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'SLA rule not found',
        })
      }

      // Query records from the entity type
      const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000)

      const { data: records, error: recordsError } = await adminClient
        .from(rule.entity_type)
        .select('id, created_at, status, title, name')
        .eq('org_id', orgId)
        .gte('created_at', startDate.toISOString())
        .is('deleted_at', null)
        .limit(100)

      if (recordsError) {
        console.error('Error fetching records for SLA test:', recordsError)
        // Return empty results instead of throwing - table might not exist
        return {
          totalRecords: 0,
          metSla: 0,
          wouldWarning: 0,
          wouldBreach: 0,
          wouldCritical: 0,
          projectedComplianceRate: 100,
          sampleRecords: [],
        }
      }

      // Calculate SLA status for each record (simplified simulation)
      const results = {
        totalRecords: records?.length || 0,
        metSla: 0,
        wouldWarning: 0,
        wouldBreach: 0,
        wouldCritical: 0,
        projectedComplianceRate: 0,
        sampleRecords: [] as Array<{
          id: string
          name: string
          createdAt: string
          elapsedHours: number
          status: 'met' | 'warning' | 'breach' | 'critical'
        }>,
      }

      const targetHours = rule.target_value * (
        rule.target_unit === 'hours' || rule.target_unit === 'business_hours' ? 1 :
        rule.target_unit === 'days' || rule.target_unit === 'business_days' ? 8 :
        rule.target_unit === 'minutes' ? 1/60 : 40
      )

      interface RecordRow {
        id: string
        created_at: string
        status: string
        title?: string
        name?: string
      }

      for (const record of (records || []) as RecordRow[]) {
        const createdAt = new Date(record.created_at)
        const elapsedMs = Date.now() - createdAt.getTime()
        const elapsedHours = elapsedMs / (1000 * 60 * 60)
        const percentage = (elapsedHours / targetHours) * 100

        let status: 'met' | 'warning' | 'breach' | 'critical' = 'met'

        interface EscalationLevel {
          trigger_percentage: number
          level_name: string
        }

        const sortedLevels = ((rule.escalation_levels || []) as EscalationLevel[]).sort(
          (a, b) => b.trigger_percentage - a.trigger_percentage
        )

        for (const level of sortedLevels) {
          if (percentage >= level.trigger_percentage) {
            if (level.level_name === 'critical' || level.trigger_percentage > 100) {
              status = 'critical'
            } else if (level.level_name === 'breach' || level.trigger_percentage >= 100) {
              status = 'breach'
            } else {
              status = 'warning'
            }
            break
          }
        }

        if (status === 'met') results.metSla++
        else if (status === 'warning') results.wouldWarning++
        else if (status === 'breach') results.wouldBreach++
        else if (status === 'critical') results.wouldCritical++

        // Add to sample if noteworthy
        if (results.sampleRecords.length < 5 || status !== 'met') {
          results.sampleRecords.push({
            id: record.id,
            name: record.title || record.name || record.id,
            createdAt: record.created_at,
            elapsedHours: Math.round(elapsedHours * 10) / 10,
            status,
          })
        }
      }

      const completed = results.metSla + results.wouldBreach + results.wouldCritical
      results.projectedComplianceRate = completed > 0
        ? Math.round((results.metSla / completed) * 100)
        : 100

      return results
    }),

  // ============================================
  // GET CATEGORIES
  // ============================================
  getCategories: orgProtectedProcedure
    .query(async () => {
      return [
        { value: 'response_time', label: 'Response Time', description: 'Time to first response after inquiry' },
        { value: 'submission_speed', label: 'Submission Speed', description: 'Time from job creation to first submission' },
        { value: 'interview_schedule', label: 'Interview Scheduling', description: 'Time to schedule interview after client request' },
        { value: 'interview_feedback', label: 'Interview Feedback', description: 'Time to receive feedback after interview' },
        { value: 'offer_response', label: 'Offer Response', description: 'Time to respond to candidate offer' },
        { value: 'onboarding', label: 'Onboarding Completion', description: 'Time to complete all onboarding tasks' },
        { value: 'client_touch', label: 'Client Communication', description: 'Maximum time between client touchpoints' },
        { value: 'candidate_followup', label: 'Candidate Follow-up', description: 'Time to follow up with active candidates' },
        { value: 'document_collection', label: 'Document Collection', description: 'Time to collect required documents' },
        { value: 'timesheet_approval', label: 'Timesheet Approval', description: 'Time to approve submitted timesheets' },
      ]
    }),

  // ============================================
  // GET EVENTS (for SLA event list/report)
  // ============================================
  getEvents: orgProtectedProcedure
    .input(z.object({
      ruleId: z.string().uuid().optional(),
      status: z.enum(['pending', 'warning', 'breach', 'critical', 'met', 'cancelled']).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('sla_events')
        .select(`
          *,
          sla_definition:sla_definitions(id, name, category, entity_type)
        `, { count: 'exact' })
        .eq('org_id', orgId)

      if (input.ruleId) {
        query = query.eq('sla_definition_id', input.ruleId)
      }
      if (input.status) {
        query = query.eq('status', input.status)
      }

      const offset = (input.page - 1) * input.pageSize
      query = query
        .range(offset, offset + input.pageSize - 1)
        .order('created_at', { ascending: false })

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch SLA events',
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
  // GET START/END EVENTS FOR ENTITY TYPE
  // ============================================
  getEventsForEntity: orgProtectedProcedure
    .input(z.object({ entityType: entityTypeSchema }))
    .query(async ({ input }) => {
      // Return available start and end events based on entity type
      const eventsByEntity: Record<string, { startEvents: { value: string; label: string }[]; endEvents: { value: string; label: string }[] }> = {
        jobs: {
          startEvents: [
            { value: 'job_created', label: 'Job Created' },
            { value: 'job_activated', label: 'Job Activated' },
            { value: 'job_assigned', label: 'Job Assigned to Recruiter' },
          ],
          endEvents: [
            { value: 'first_submission', label: 'First Submission Created' },
            { value: 'submission_sent', label: 'Submission Sent to Client' },
            { value: 'interview_scheduled', label: 'Interview Scheduled' },
            { value: 'offer_extended', label: 'Offer Extended' },
            { value: 'job_filled', label: 'Job Filled' },
          ],
        },
        submissions: {
          startEvents: [
            { value: 'submission_created', label: 'Submission Created' },
            { value: 'submission_sent', label: 'Submission Sent to Client' },
          ],
          endEvents: [
            { value: 'client_response', label: 'Client Response Received' },
            { value: 'interview_scheduled', label: 'Interview Scheduled' },
            { value: 'candidate_rejected', label: 'Candidate Rejected' },
            { value: 'offer_extended', label: 'Offer Extended' },
          ],
        },
        candidates: {
          startEvents: [
            { value: 'candidate_created', label: 'Candidate Created' },
            { value: 'candidate_sourced', label: 'Candidate Sourced' },
            { value: 'application_received', label: 'Application Received' },
          ],
          endEvents: [
            { value: 'first_contact', label: 'First Contact Made' },
            { value: 'screening_completed', label: 'Screening Completed' },
            { value: 'submitted_to_job', label: 'Submitted to a Job' },
          ],
        },
        interviews: {
          startEvents: [
            { value: 'interview_scheduled', label: 'Interview Scheduled' },
            { value: 'interview_completed', label: 'Interview Completed' },
          ],
          endEvents: [
            { value: 'feedback_received', label: 'Feedback Received' },
            { value: 'next_round_scheduled', label: 'Next Round Scheduled' },
            { value: 'decision_made', label: 'Decision Made' },
          ],
        },
        placements: {
          startEvents: [
            { value: 'placement_created', label: 'Placement Created' },
            { value: 'offer_accepted', label: 'Offer Accepted' },
            { value: 'start_date', label: 'Placement Start Date' },
          ],
          endEvents: [
            { value: 'onboarding_complete', label: 'Onboarding Complete' },
            { value: 'first_timesheet', label: 'First Timesheet Submitted' },
            { value: 'day1_checkin', label: 'Day 1 Check-in Complete' },
          ],
        },
        accounts: {
          startEvents: [
            { value: 'last_activity', label: 'Last Activity' },
            { value: 'last_communication', label: 'Last Communication' },
            { value: 'account_created', label: 'Account Created' },
          ],
          endEvents: [
            { value: 'activity_logged', label: 'Activity Logged' },
            { value: 'communication_sent', label: 'Communication Sent' },
            { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
          ],
        },
        leads: {
          startEvents: [
            { value: 'lead_created', label: 'Lead Created' },
            { value: 'lead_assigned', label: 'Lead Assigned' },
            { value: 'lead_received', label: 'Lead Received' },
          ],
          endEvents: [
            { value: 'first_contact', label: 'First Contact Made' },
            { value: 'qualified', label: 'Lead Qualified' },
            { value: 'converted', label: 'Lead Converted' },
          ],
        },
        offers: {
          startEvents: [
            { value: 'offer_created', label: 'Offer Created' },
            { value: 'offer_sent', label: 'Offer Sent' },
          ],
          endEvents: [
            { value: 'candidate_response', label: 'Candidate Response' },
            { value: 'offer_accepted', label: 'Offer Accepted' },
            { value: 'offer_declined', label: 'Offer Declined' },
          ],
        },
      }

      return eventsByEntity[input.entityType] || { startEvents: [], endEvents: [] }
    }),

  // ============================================
  // GET ENTITY TYPES
  // ============================================
  getEntityTypes: orgProtectedProcedure
    .query(async () => {
      return [
        { value: 'jobs', label: 'Jobs' },
        { value: 'candidates', label: 'Candidates' },
        { value: 'submissions', label: 'Submissions' },
        { value: 'placements', label: 'Placements' },
        { value: 'accounts', label: 'Accounts' },
        { value: 'leads', label: 'Leads' },
        { value: 'interviews', label: 'Interviews' },
        { value: 'offers', label: 'Offers' },
      ]
    }),
})
