import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// INPUT SCHEMAS
// ============================================

const OutcomeSchema = z.object({
  label: z.string().min(1).max(50),
  value: z.string().min(1).max(30),
  color: z.enum(['green', 'yellow', 'orange', 'red', 'gray', 'blue', 'purple']),
  nextAction: z.enum([
    'log_notes',
    'schedule_followup',
    'retry_later',
    'update_info',
    'mark_invalid',
    'create_task',
    'send_email',
    'none'
  ]),
})

const PointMultiplierSchema = z.object({
  condition: z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than']),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }),
  type: z.enum(['multiply', 'add']),
  value: z.number(),
})

const FollowupRuleSchema = z.object({
  outcome: z.string(),
  delayHours: z.number().min(1).max(720),
  taskTitle: z.string(),
  assignTo: z.enum(['activity_owner', 'manager', 'specific_user']),
  assigneeId: z.string().optional(),
})

const FieldDependencySchema = z.object({
  whenField: z.string(),
  equals: z.union([z.string(), z.number(), z.boolean()]),
  thenRequire: z.array(z.string()),
})

const PatternFieldSchema = z.object({
  fieldName: z.string(),
  fieldLabel: z.string(),
  fieldType: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'checkbox', 'textarea']),
  isRequired: z.boolean(),
  defaultValue: z.any().optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
})

const categoryEnum = z.enum([
  'communication',
  'calendar',
  'workflow',
  'documentation',
  'research',
  'administrative'
])

const CreatePatternInput = z.object({
  name: z.string().min(3).max(100),
  code: z.string().min(2).max(50).optional(),
  category: categoryEnum,
  description: z.string().max(500).optional(),
  entityType: z.string(),
  icon: z.string().default('📋'),
  color: z.string().default('blue'),
  displayOrder: z.number().default(100),

  // Fields configuration
  requiredFields: z.array(z.string()).default([]),
  customFields: z.array(PatternFieldSchema).default([]),
  fieldDependencies: z.array(FieldDependencySchema).default([]),

  // Outcomes
  outcomes: z.array(OutcomeSchema).min(1),

  // Automation
  autoLogIntegrations: z.array(z.string()).default([]),
  followupRules: z.array(FollowupRuleSchema).default([]),

  // Points
  points: z.number().min(0).max(100).default(0),
  pointMultipliers: z.array(PointMultiplierSchema).default([]),

  // Display
  showInTimeline: z.boolean().default(true),

  // Assignment defaults
  defaultAssignee: z.enum(['owner', 'manager', 'pod', 'specific_user']).default('owner'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  targetDays: z.number().default(1),
})

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Type definitions
interface PatternRow {
  id: string
  org_id: string
  code: string
  name: string
  description: string | null
  category: string
  entity_type: string
  icon: string | null
  color: string | null
  display_order: number
  target_days: number
  default_assignee: string
  priority: string
  outcomes: unknown[]
  auto_log_integrations: string[]
  followup_rules: unknown[]
  field_dependencies: unknown[]
  points: number
  point_multipliers: unknown[]
  show_in_timeline: boolean
  is_system: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

interface PatternFieldRow {
  id: string
  pattern_id: string
  field_name: string
  field_label: string
  field_type: string
  is_required: boolean
  default_value: string | null
  options: unknown[]
  validation_rules: Record<string, unknown> | null
  order_index: number
  created_at: string
}

export const activityPatternsRouter = router({
  // ============================================
  // LIST ALL PATTERNS WITH FILTERING
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(['active', 'inactive', 'all']).default('all'),
      entityType: z.string().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const { search, category, status, entityType, page, pageSize } = input
      const adminClient = getAdminClient()

      let query = adminClient
        .from('activity_patterns')
        .select('*, pattern_fields(*)', { count: 'exact' })
        .eq('org_id', orgId)
        .order('category')
        .order('display_order')
        .order('name')

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,code.ilike.%${search}%`)
      }
      if (category && category !== 'all') {
        query = query.eq('category', category)
      }
      if (status === 'active') {
        query = query.eq('is_active', true)
      } else if (status === 'inactive') {
        query = query.eq('is_active', false)
      }
      if (entityType && entityType !== 'all') {
        query = query.eq('entity_type', entityType)
      }

      const offset = (page - 1) * pageSize
      query = query.range(offset, offset + pageSize - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to fetch patterns:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: (data as (PatternRow & { pattern_fields: PatternFieldRow[] })[]) ?? [],
        total: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      }
    }),

  // ============================================
  // GET SINGLE PATTERN BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('activity_patterns')
        .select('*, pattern_fields(*), activity_pattern_successors(*)')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pattern not found' })
      }

      return data
    }),

  // ============================================
  // GET USAGE STATS FOR DASHBOARD
  // ============================================
  getStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get pattern counts by status
      const { data: patterns } = await adminClient
        .from('activity_patterns')
        .select('id, is_active, category')
        .eq('org_id', orgId)

      const total = patterns?.length ?? 0
      const active = patterns?.filter(p => p.is_active).length ?? 0
      const inactive = total - active

      // Get category breakdown
      const byCategory = patterns?.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        return acc
      }, {} as Record<string, number>) ?? {}

      // Get 30-day usage stats
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: recentActivities } = await adminClient
        .from('activities')
        .select('pattern_id, id')
        .eq('org_id', orgId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      const totalLogged = recentActivities?.length ?? 0

      // Get usage by pattern
      const usageByPattern = recentActivities?.reduce((acc, a) => {
        if (a.pattern_id) {
          acc[a.pattern_id] = (acc[a.pattern_id] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) ?? {}

      return {
        total,
        active,
        inactive,
        byCategory,
        last30Days: {
          totalLogged,
          usageByPattern,
        },
      }
    }),

  // ============================================
  // GET CATEGORIES ENUM
  // ============================================
  getCategories: orgProtectedProcedure
    .query(() => {
      return [
        { value: 'communication', label: 'Communication', icon: '📞', color: 'blue' },
        { value: 'calendar', label: 'Calendar', icon: '📅', color: 'teal' },
        { value: 'workflow', label: 'Workflow', icon: '📄', color: 'violet' },
        { value: 'documentation', label: 'Documentation', icon: '📝', color: 'gray' },
        { value: 'research', label: 'Research', icon: '🔍', color: 'amber' },
        { value: 'administrative', label: 'Administrative', icon: '✅', color: 'slate' },
      ]
    }),

  // ============================================
  // GET ENTITY TYPES (For dropdown)
  // ============================================
  getEntityTypes: orgProtectedProcedure
    .query(() => {
      return [
        { value: 'candidate', label: 'Candidate' },
        { value: 'job', label: 'Job' },
        { value: 'submission', label: 'Submission' },
        { value: 'placement', label: 'Placement' },
        { value: 'account', label: 'Account' },
        { value: 'contact', label: 'Contact' },
        { value: 'lead', label: 'Lead' },
        { value: 'deal', label: 'Deal' },
        { value: 'consultant', label: 'Consultant' },
        { value: 'vendor', label: 'Vendor' },
        { value: 'interview', label: 'Interview' },
        { value: 'general', label: 'General' },
      ]
    }),

  // ============================================
  // CREATE NEW PATTERN
  // ============================================
  create: orgProtectedProcedure
    .input(CreatePatternInput)
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Generate code from name if not provided
      const code = input.code || input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')

      // Check for duplicate code
      const { data: existing } = await adminClient
        .from('activity_patterns')
        .select('id')
        .eq('org_id', orgId)
        .eq('code', code)
        .single()

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'An activity pattern with this code already exists' })
      }

      // Create the pattern
      const { data, error } = await supabase
        .from('activity_patterns')
        .insert({
          org_id: orgId,
          name: input.name,
          code,
          category: input.category,
          description: input.description,
          entity_type: input.entityType,
          icon: input.icon,
          color: input.color,
          display_order: input.displayOrder,
          outcomes: input.outcomes,
          auto_log_integrations: input.autoLogIntegrations,
          followup_rules: input.followupRules,
          field_dependencies: input.fieldDependencies,
          points: input.points,
          point_multipliers: input.pointMultipliers,
          show_in_timeline: input.showInTimeline,
          default_assignee: input.defaultAssignee,
          priority: input.priority,
          target_days: input.targetDays,
          is_active: true,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create pattern:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Create custom fields if any
      if (input.customFields.length > 0) {
        const fieldsToInsert = input.customFields.map((f, i) => ({
          pattern_id: data.id,
          field_name: f.fieldName,
          field_label: f.fieldLabel,
          field_type: f.fieldType,
          is_required: f.isRequired,
          default_value: f.defaultValue,
          options: f.options,
          validation_rules: f.validation,
          order_index: i,
        }))

        await supabase.from('pattern_fields').insert(fieldsToInsert)
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'activity_patterns',
        record_id: data.id,
        new_values: { name: input.name, category: input.category },
      })

      return data
    }),

  // ============================================
  // UPDATE EXISTING PATTERN
  // ============================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }).merge(CreatePatternInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()
      const { id, ...updateData } = input

      // Verify pattern exists and belongs to org
      const { data: existing } = await adminClient
        .from('activity_patterns')
        .select('id, is_system, name')
        .eq('id', id)
        .eq('org_id', orgId)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pattern not found' })
      }

      if (existing.is_system) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'System patterns cannot be modified' })
      }

      // Build update object
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (updateData.name !== undefined) updates.name = updateData.name
      if (updateData.category !== undefined) updates.category = updateData.category
      if (updateData.description !== undefined) updates.description = updateData.description
      if (updateData.entityType !== undefined) updates.entity_type = updateData.entityType
      if (updateData.icon !== undefined) updates.icon = updateData.icon
      if (updateData.color !== undefined) updates.color = updateData.color
      if (updateData.displayOrder !== undefined) updates.display_order = updateData.displayOrder
      if (updateData.outcomes !== undefined) updates.outcomes = updateData.outcomes
      if (updateData.autoLogIntegrations !== undefined) updates.auto_log_integrations = updateData.autoLogIntegrations
      if (updateData.followupRules !== undefined) updates.followup_rules = updateData.followupRules
      if (updateData.fieldDependencies !== undefined) updates.field_dependencies = updateData.fieldDependencies
      if (updateData.points !== undefined) updates.points = updateData.points
      if (updateData.pointMultipliers !== undefined) updates.point_multipliers = updateData.pointMultipliers
      if (updateData.showInTimeline !== undefined) updates.show_in_timeline = updateData.showInTimeline
      if (updateData.defaultAssignee !== undefined) updates.default_assignee = updateData.defaultAssignee
      if (updateData.priority !== undefined) updates.priority = updateData.priority
      if (updateData.targetDays !== undefined) updates.target_days = updateData.targetDays

      // Update the pattern
      const { data, error } = await supabase
        .from('activity_patterns')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Update custom fields if provided
      if (updateData.customFields !== undefined) {
        await adminClient.from('pattern_fields').delete().eq('pattern_id', id)

        if (updateData.customFields.length > 0) {
          const fieldsToInsert = updateData.customFields.map((f, i) => ({
            pattern_id: id,
            field_name: f.fieldName,
            field_label: f.fieldLabel,
            field_type: f.fieldType,
            is_required: f.isRequired,
            default_value: f.defaultValue,
            options: f.options,
            validation_rules: f.validation,
            order_index: i,
          }))

          await supabase.from('pattern_fields').insert(fieldsToInsert)
        }
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'activity_patterns',
        record_id: id,
        old_values: { name: existing.name },
        new_values: updates,
      })

      return data
    }),

  // ============================================
  // TOGGLE ACTIVE STATUS
  // ============================================
  toggleStatus: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data, error } = await supabase
        .from('activity_patterns')
        .update({ is_active: input.isActive, updated_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: input.isActive ? 'activate' : 'deactivate',
        table_name: 'activity_patterns',
        record_id: input.id,
        new_values: { is_active: input.isActive },
      })

      return data
    }),

  // ============================================
  // DUPLICATE PATTERN
  // ============================================
  duplicate: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get original pattern
      const { data: original, error: fetchError } = await adminClient
        .from('activity_patterns')
        .select('*, pattern_fields(*)')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !original) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pattern not found' })
      }

      // Generate new code
      const newCode = `${original.code}_copy_${Date.now()}`
      const newName = `${original.name} (Copy)`

      // Create duplicate
      const { data: newPattern, error: insertError } = await supabase
        .from('activity_patterns')
        .insert({
          org_id: orgId,
          name: newName,
          code: newCode,
          category: original.category,
          description: original.description,
          entity_type: original.entity_type,
          icon: original.icon,
          color: original.color,
          display_order: original.display_order,
          outcomes: original.outcomes,
          auto_log_integrations: original.auto_log_integrations,
          followup_rules: original.followup_rules,
          field_dependencies: original.field_dependencies,
          points: original.points,
          point_multipliers: original.point_multipliers,
          show_in_timeline: original.show_in_timeline,
          default_assignee: original.default_assignee,
          priority: original.priority,
          target_days: original.target_days,
          is_active: false, // Duplicates start as inactive
          is_system: false,
          created_by: user?.id,
        })
        .select()
        .single()

      if (insertError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: insertError.message })
      }

      // Duplicate fields
      if (original.pattern_fields?.length > 0) {
        const fieldsToInsert = (original.pattern_fields as PatternFieldRow[]).map((f) => ({
          pattern_id: newPattern.id,
          field_name: f.field_name,
          field_label: f.field_label,
          field_type: f.field_type,
          is_required: f.is_required,
          default_value: f.default_value,
          options: f.options,
          validation_rules: f.validation_rules,
          order_index: f.order_index,
        }))

        await supabase.from('pattern_fields').insert(fieldsToInsert)
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'duplicate',
        table_name: 'activity_patterns',
        record_id: newPattern.id,
        old_values: { source_id: input.id, source_name: original.name },
        new_values: { name: newName },
      })

      return newPattern
    }),

  // ============================================
  // DELETE PATTERN
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Check for existing activities using this pattern
      const { count } = await adminClient
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('pattern_id', input.id)

      if ((count ?? 0) > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Cannot delete pattern with ${count} existing activities. Disable it instead.`,
        })
      }

      // Check if system pattern
      const { data: pattern } = await adminClient
        .from('activity_patterns')
        .select('is_system, name')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (pattern?.is_system) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'System patterns cannot be deleted' })
      }

      // Delete fields first
      await adminClient.from('pattern_fields').delete().eq('pattern_id', input.id)

      // Delete pattern
      const { error } = await supabase
        .from('activity_patterns')
        .delete()
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'delete',
        table_name: 'activity_patterns',
        record_id: input.id,
        old_values: { name: pattern?.name },
      })

      return { success: true }
    }),

  // ============================================
  // EXPORT PATTERNS AS JSON
  // ============================================
  export: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('activity_patterns')
        .select('*, pattern_fields(*)')
        .eq('org_id', orgId)
        .eq('is_system', false)
        .order('category')
        .order('display_order')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        patterns: data,
      }
    }),

  // ============================================
  // IMPORT PATTERNS FROM JSON
  // ============================================
  import: orgProtectedProcedure
    .input(z.object({
      patterns: z.array(z.object({
        name: z.string(),
        code: z.string(),
        category: z.string(),
        description: z.string().optional(),
        entity_type: z.string(),
        icon: z.string().optional(),
        color: z.string().optional(),
        outcomes: z.array(z.any()).optional(),
        points: z.number().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      const results = { created: 0, skipped: 0, errors: [] as string[] }

      for (const pattern of input.patterns) {
        try {
          // Check if code exists
          const { data: existing } = await adminClient
            .from('activity_patterns')
            .select('id')
            .eq('org_id', orgId)
            .eq('code', pattern.code)
            .single()

          if (existing) {
            results.skipped++
            continue
          }

          await supabase.from('activity_patterns').insert({
            org_id: orgId,
            name: pattern.name,
            code: pattern.code,
            category: pattern.category,
            description: pattern.description,
            entity_type: pattern.entity_type,
            icon: pattern.icon || '📋',
            color: pattern.color || 'blue',
            outcomes: pattern.outcomes || [],
            points: pattern.points || 0,
            is_active: true,
            created_by: user?.id,
          })

          results.created++
        } catch (e: unknown) {
          const error = e as Error
          results.errors.push(`${pattern.name}: ${error.message}`)
        }
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'import',
        table_name: 'activity_patterns',
        new_values: { created: results.created, skipped: results.skipped },
      })

      return results
    }),

  // ============================================
  // GET USAGE COUNT FOR A SPECIFIC PATTERN
  // ============================================
  getUsageCount: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      days: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - input.days)

      const { count } = await adminClient
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('pattern_id', input.id)
        .eq('org_id', orgId)
        .gte('created_at', sinceDate.toISOString())

      // Also get total count
      const { count: totalCount } = await adminClient
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('pattern_id', input.id)
        .eq('org_id', orgId)

      return { count: count ?? 0, totalCount: totalCount ?? 0, days: input.days }
    }),

  // ============================================
  // REORDER PATTERNS WITHIN CATEGORY
  // ============================================
  reorder: orgProtectedProcedure
    .input(z.object({
      updates: z.array(z.object({
        id: z.string().uuid(),
        displayOrder: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      for (const update of input.updates) {
        await supabase
          .from('activity_patterns')
          .update({ display_order: update.displayOrder, updated_at: new Date().toISOString() })
          .eq('id', update.id)
          .eq('org_id', orgId)
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'reorder',
        table_name: 'activity_patterns',
        new_values: { count: input.updates.length },
      })

      return { success: true }
    }),
})
