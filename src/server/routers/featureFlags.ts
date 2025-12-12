import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// =============================================================================
// HELPERS
// =============================================================================

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}

/**
 * Deterministic hash for percentage rollout
 * Same user + feature always gets same result
 */
function hashUserForPercentage(userId: string, featureKey: string): number {
  const hash = crypto.createHash('sha256')
  hash.update(`${userId}:${featureKey}`)
  const hex = hash.digest('hex').slice(0, 8)
  return parseInt(hex, 16) % 100
}

// =============================================================================
// SCHEMAS
// =============================================================================

const featureFlagStateSchema = z.enum([
  'enabled', 'disabled', 'beta', 'internal', 'percentage', 'coming_soon'
])

const rolloutStrategySchema = z.enum([
  'all', 'roles', 'users', 'percentage', 'pods', 'none'
])

const rolloutScheduleItemSchema = z.object({
  date: z.string(),
  targetPercentage: z.number().min(0).max(100),
  status: z.enum(['pending', 'completed', 'skipped']).default('pending'),
})

const safeguardsSchema = z.object({
  pauseOnErrorRate: z.number().min(0).max(100).optional(),
  notifyOnIssues: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
})

const createFeatureFlagSchema = z.object({
  key: z.string()
    .min(2)
    .max(100)
    .regex(/^[a-z][a-z0-9_]*$/, 'Key must be lowercase with underscores only'),
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  category: z.string().optional(),
  state: featureFlagStateSchema.default('disabled'),
  rolloutStrategy: rolloutStrategySchema.default('none'),
  rolloutPercentage: z.number().min(0).max(100).default(0),
  enabledRoles: z.array(z.string().uuid()).default([]),
  enabledUsers: z.array(z.string().uuid()).default([]),
  enabledPods: z.array(z.string().uuid()).default([]),
  showInNav: z.boolean().default(true),
  showNewBadge: z.boolean().default(false),
  showBetaBadge: z.boolean().default(false),
  logUsage: z.boolean().default(true),
  showFeedbackPrompt: z.boolean().default(false),
  rolloutSchedule: z.array(rolloutScheduleItemSchema).default([]),
  safeguards: safeguardsSchema.default({}),
})

const updateFeatureFlagSchema = createFeatureFlagSchema.partial().extend({
  id: z.string().uuid(),
})

// =============================================================================
// ROUTER
// =============================================================================

export const featureFlagsRouter = router({
  // ========== Stats/Dashboard ==========
  getStats: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const orgId = ctx.orgId

    const { data: flags } = await adminClient
      .from('feature_flags')
      .select('state')
      .or(`org_id.eq.${orgId},is_global.eq.true`)
      .is('deleted_at', null)

    const stats = {
      enabled: 0,
      disabled: 0,
      beta: 0,
      internal: 0,
      percentage: 0,
      coming_soon: 0,
      total: flags?.length || 0,
    }

    flags?.forEach(f => {
      if (f.state in stats) {
        stats[f.state as keyof typeof stats]++
      }
    })

    return stats
  }),

  // ========== List with Filtering ==========
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      state: featureFlagStateSchema.optional(),
      category: z.string().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId
      const { search, state, category, page, pageSize } = input

      let query = adminClient
        .from('feature_flags')
        .select('*', { count: 'exact' })
        .or(`org_id.eq.${orgId},is_global.eq.true`)
        .is('deleted_at', null)
        .order('name', { ascending: true })

      if (state) {
        query = query.eq('state', state)
      }

      if (category) {
        query = query.eq('category', category)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,key.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const offset = (page - 1) * pageSize
      query = query.range(offset, offset + pageSize - 1)

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch feature flags',
        })
      }

      return {
        items: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      }
    }),

  // ========== Get by ID ==========
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId

      const { data, error } = await adminClient
        .from('feature_flags')
        .select('*')
        .eq('id', input.id)
        .or(`org_id.eq.${orgId},is_global.eq.true`)
        .is('deleted_at', null)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Feature flag not found',
        })
      }

      return data
    }),

  // ========== Get by Key (for evaluation) ==========
  getByKey: orgProtectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId

      const { data, error } = await adminClient
        .from('feature_flags')
        .select('*')
        .eq('key', input.key)
        .or(`org_id.eq.${orgId},is_global.eq.true`)
        .is('deleted_at', null)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Feature flag not found',
        })
      }

      return data
    }),

  // ========== Check if Feature Enabled ==========
  isEnabled: orgProtectedProcedure
    .input(z.object({
      key: z.string(),
      logUsage: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId
      const userId = ctx.user?.id

      if (!userId) {
        return { enabled: false, reason: 'User not authenticated' }
      }

      // Fetch flag
      const { data: flag, error } = await adminClient
        .from('feature_flags')
        .select('*')
        .eq('key', input.key)
        .or(`org_id.eq.${orgId},is_global.eq.true`)
        .is('deleted_at', null)
        .single()

      if (error || !flag) {
        return { enabled: false, reason: 'Flag not found' }
      }

      // Check state
      if (flag.state === 'disabled' || flag.state === 'coming_soon') {
        return { enabled: false, reason: `Feature is ${flag.state}` }
      }

      // Get user profile for role/pod
      const { data: profile } = await adminClient
        .from('user_profiles')
        .select('role_id, pod_id')
        .eq('id', userId)
        .single()

      let enabled = false
      let reason = ''

      // Evaluate rollout strategy
      switch (flag.rollout_strategy) {
        case 'all':
          enabled = true
          reason = 'Enabled for all users'
          break

        case 'none':
          enabled = false
          reason = 'Disabled for all users'
          break

        case 'roles':
          if (profile?.role_id && flag.enabled_roles?.includes(profile.role_id)) {
            enabled = true
            reason = 'Enabled for your role'
          } else {
            reason = 'Not enabled for your role'
          }
          break

        case 'users':
          if (flag.enabled_users?.includes(userId)) {
            enabled = true
            reason = 'Enabled for you specifically'
          } else {
            reason = 'Not in beta user list'
          }
          break

        case 'pods':
          if (profile?.pod_id && flag.enabled_pods?.includes(profile.pod_id)) {
            enabled = true
            reason = 'Enabled for your pod'
          } else {
            reason = 'Not enabled for your pod'
          }
          break

        case 'percentage':
          const userPercentile = hashUserForPercentage(userId, flag.key)
          if (userPercentile < flag.rollout_percentage) {
            enabled = true
            reason = `In rollout group (${flag.rollout_percentage}%)`
          } else {
            reason = `Not in rollout group (${flag.rollout_percentage}%)`
          }
          break
      }

      // Log usage if enabled
      if (flag.log_usage && input.logUsage) {
        try {
          await adminClient.from('feature_flag_usage').insert({
            org_id: orgId,
            feature_flag_id: flag.id,
            user_id: userId,
            was_enabled: enabled,
            context: { strategy: flag.rollout_strategy },
          })
        } catch {
          // Don't fail the request if logging fails
        }
      }

      return {
        enabled,
        reason,
        showBetaBadge: flag.show_beta_badge,
        showNewBadge: flag.show_new_badge,
        showFeedbackPrompt: flag.show_feedback_prompt && enabled,
      }
    }),

  // ========== Create ==========
  create: orgProtectedProcedure
    .input(createFeatureFlagSchema)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId
      const userId = ctx.user?.id

      // Check for duplicate key
      const { data: existing } = await adminClient
        .from('feature_flags')
        .select('id')
        .eq('org_id', orgId)
        .eq('key', input.key)
        .is('deleted_at', null)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `A feature with key "${input.key}" already exists`,
        })
      }

      const { data, error } = await adminClient
        .from('feature_flags')
        .insert({
          org_id: orgId,
          key: input.key,
          name: input.name,
          description: input.description,
          category: input.category,
          state: input.state,
          rollout_strategy: input.rolloutStrategy,
          rollout_percentage: input.rolloutPercentage,
          enabled_roles: input.enabledRoles,
          enabled_users: input.enabledUsers,
          enabled_pods: input.enabledPods,
          show_in_nav: input.showInNav,
          show_new_badge: input.showNewBadge,
          show_beta_badge: input.showBetaBadge,
          log_usage: input.logUsage,
          show_feedback_prompt: input.showFeedbackPrompt,
          rollout_schedule: input.rolloutSchedule,
          safeguards: input.safeguards,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create feature flag',
        })
      }

      // Audit log
      try {
        await adminClient.from('audit_logs').insert({
          org_id: orgId,
          user_id: userId,
          user_email: ctx.user?.email,
          action: 'create',
          table_name: 'feature_flags',
          record_id: data.id,
          new_values: data,
        })
      } catch { /* ignore audit log failures */ }

      return data
    }),

  // ========== Update ==========
  update: orgProtectedProcedure
    .input(updateFeatureFlagSchema)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId
      const userId = ctx.user?.id
      const { id, ...updateData } = input

      // Get current state for audit
      const { data: current, error: fetchError } = await adminClient
        .from('feature_flags')
        .select('*')
        .eq('id', id)
        .or(`org_id.eq.${orgId},is_global.eq.true`)
        .single()

      if (fetchError || !current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Feature flag not found',
        })
      }

      // Build update object (convert camelCase to snake_case)
      const updateObj: Record<string, unknown> = { updated_by: userId }
      if (updateData.name !== undefined) updateObj.name = updateData.name
      if (updateData.description !== undefined) updateObj.description = updateData.description
      if (updateData.category !== undefined) updateObj.category = updateData.category
      if (updateData.state !== undefined) updateObj.state = updateData.state
      if (updateData.rolloutStrategy !== undefined) updateObj.rollout_strategy = updateData.rolloutStrategy
      if (updateData.rolloutPercentage !== undefined) updateObj.rollout_percentage = updateData.rolloutPercentage
      if (updateData.enabledRoles !== undefined) updateObj.enabled_roles = updateData.enabledRoles
      if (updateData.enabledUsers !== undefined) updateObj.enabled_users = updateData.enabledUsers
      if (updateData.enabledPods !== undefined) updateObj.enabled_pods = updateData.enabledPods
      if (updateData.showInNav !== undefined) updateObj.show_in_nav = updateData.showInNav
      if (updateData.showNewBadge !== undefined) updateObj.show_new_badge = updateData.showNewBadge
      if (updateData.showBetaBadge !== undefined) updateObj.show_beta_badge = updateData.showBetaBadge
      if (updateData.logUsage !== undefined) updateObj.log_usage = updateData.logUsage
      if (updateData.showFeedbackPrompt !== undefined) updateObj.show_feedback_prompt = updateData.showFeedbackPrompt
      if (updateData.rolloutSchedule !== undefined) updateObj.rollout_schedule = updateData.rolloutSchedule
      if (updateData.safeguards !== undefined) updateObj.safeguards = updateData.safeguards

      const { data, error } = await adminClient
        .from('feature_flags')
        .update(updateObj)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update feature flag',
        })
      }

      // Audit log
      try {
        await adminClient.from('audit_logs').insert({
          org_id: orgId,
          user_id: userId,
          user_email: ctx.user?.email,
          action: 'update',
          table_name: 'feature_flags',
          record_id: id,
          old_values: current,
          new_values: data,
        })
      } catch { /* ignore audit log failures */ }

      return data
    }),

  // ========== Quick Toggle (Enable/Disable) ==========
  quickToggle: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId
      const userId = ctx.user?.id

      const newState = input.enabled ? 'enabled' : 'disabled'
      const newStrategy = input.enabled ? 'all' : 'none'

      const { data: current } = await adminClient
        .from('feature_flags')
        .select('*')
        .eq('id', input.id)
        .or(`org_id.eq.${orgId},is_global.eq.true`)
        .single()

      const { data, error } = await adminClient
        .from('feature_flags')
        .update({
          state: newState,
          rollout_strategy: newStrategy,
          updated_by: userId,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle feature flag',
        })
      }

      // Audit log
      try {
        await adminClient.from('audit_logs').insert({
          org_id: orgId,
          user_id: userId,
          user_email: ctx.user?.email,
          action: 'update',
          table_name: 'feature_flags',
          record_id: input.id,
          old_values: current,
          new_values: data,
        })
      } catch { /* ignore audit log failures */ }

      return data
    }),

  // ========== Delete (Soft) ==========
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId
      const userId = ctx.user?.id

      const { data, error } = await adminClient
        .from('feature_flags')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', input.id)
        .or(`org_id.eq.${orgId},is_global.eq.true`)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete feature flag',
        })
      }

      // Audit log
      try {
        await adminClient.from('audit_logs').insert({
          org_id: orgId,
          user_id: userId,
          user_email: ctx.user?.email,
          action: 'delete',
          table_name: 'feature_flags',
          record_id: input.id,
        })
      } catch { /* ignore audit log failures */ }

      return { success: true }
    }),

  // ========== Clone ==========
  clone: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      newKey: z.string().regex(/^[a-z][a-z0-9_]*$/),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId
      const userId = ctx.user?.id

      // Get original
      const { data: original, error: fetchError } = await adminClient
        .from('feature_flags')
        .select('*')
        .eq('id', input.id)
        .single()

      if (fetchError || !original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Feature flag not found',
        })
      }

      // Create clone
      const { data, error } = await adminClient
        .from('feature_flags')
        .insert({
          org_id: orgId,
          key: input.newKey,
          name: `${original.name} (Copy)`,
          description: original.description,
          category: original.category,
          state: 'disabled', // Clone starts disabled
          rollout_strategy: original.rollout_strategy,
          rollout_percentage: original.rollout_percentage,
          enabled_roles: original.enabled_roles,
          enabled_users: [],
          enabled_pods: original.enabled_pods,
          show_in_nav: original.show_in_nav,
          show_new_badge: false,
          show_beta_badge: false,
          log_usage: original.log_usage,
          show_feedback_prompt: original.show_feedback_prompt,
          rollout_schedule: [],
          safeguards: original.safeguards,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clone feature flag',
        })
      }

      return data
    }),

  // ========== Get Usage Stats ==========
  getUsage: orgProtectedProcedure
    .input(z.object({
      flagId: z.string().uuid(),
      days: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId
      const since = new Date()
      since.setDate(since.getDate() - input.days)

      // Get usage counts
      const { data: usage, error } = await adminClient
        .from('feature_flag_usage')
        .select('user_id, was_enabled, checked_at')
        .eq('feature_flag_id', input.flagId)
        .eq('org_id', orgId)
        .gte('checked_at', since.toISOString())

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch usage data',
        })
      }

      // Calculate stats
      const uniqueUsers = new Set(usage?.map(u => u.user_id)).size
      const totalChecks = usage?.length || 0
      const enabledChecks = usage?.filter(u => u.was_enabled).length || 0

      return {
        uniqueUsers,
        totalChecks,
        enabledChecks,
        enabledRate: totalChecks > 0 ? Math.round((enabledChecks / totalChecks) * 100) : 0,
      }
    }),

  // ========== Get Categories ==========
  getCategories: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const orgId = ctx.orgId

    const { data, error } = await adminClient
      .from('feature_flag_categories')
      .select('*')
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .order('display_order', { ascending: true })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch categories',
      })
    }

    return data || []
  }),

  // ========== Submit Feedback ==========
  submitFeedback: orgProtectedProcedure
    .input(z.object({
      flagId: z.string().uuid(),
      rating: z.number().min(1).max(5),
      feedbackText: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId
      const userId = ctx.user?.id

      const { data, error } = await adminClient
        .from('feature_flag_feedback')
        .insert({
          org_id: orgId,
          feature_flag_id: input.flagId,
          user_id: userId,
          rating: input.rating,
          feedback_text: input.feedbackText,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit feedback',
        })
      }

      return data
    }),

  // ========== Export Flags ==========
  export: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const orgId = ctx.orgId

    const { data, error } = await adminClient
      .from('feature_flags')
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('key')

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to export feature flags',
      })
    }

    // Remove org-specific IDs for portable export
    return data?.map(f => ({
      key: f.key,
      name: f.name,
      description: f.description,
      category: f.category,
      state: f.state,
      rollout_strategy: f.rollout_strategy,
      rollout_percentage: f.rollout_percentage,
      show_in_nav: f.show_in_nav,
      log_usage: f.log_usage,
      safeguards: f.safeguards,
    }))
  }),

  // ========== Import Flags ==========
  import: orgProtectedProcedure
    .input(z.object({
      flags: z.array(z.object({
        key: z.string(),
        name: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        state: featureFlagStateSchema.optional(),
        rollout_strategy: rolloutStrategySchema.optional(),
        rollout_percentage: z.number().optional(),
        show_in_nav: z.boolean().optional(),
        log_usage: z.boolean().optional(),
      })),
      overwrite: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const orgId = ctx.orgId
      const userId = ctx.user?.id

      const results = { created: 0, updated: 0, skipped: 0 }

      for (const flag of input.flags) {
        // Check if exists
        const { data: existing } = await adminClient
          .from('feature_flags')
          .select('id')
          .eq('org_id', orgId)
          .eq('key', flag.key)
          .is('deleted_at', null)
          .single()

        if (existing) {
          if (input.overwrite) {
            await adminClient
              .from('feature_flags')
              .update({
                name: flag.name,
                description: flag.description,
                category: flag.category,
                state: flag.state,
                rollout_strategy: flag.rollout_strategy,
                rollout_percentage: flag.rollout_percentage,
                show_in_nav: flag.show_in_nav,
                log_usage: flag.log_usage,
                updated_by: userId,
              })
              .eq('id', existing.id)
            results.updated++
          } else {
            results.skipped++
          }
        } else {
          await adminClient
            .from('feature_flags')
            .insert({
              org_id: orgId,
              key: flag.key,
              name: flag.name,
              description: flag.description,
              category: flag.category,
              state: flag.state || 'disabled',
              rollout_strategy: flag.rollout_strategy || 'none',
              rollout_percentage: flag.rollout_percentage || 0,
              show_in_nav: flag.show_in_nav ?? true,
              log_usage: flag.log_usage ?? true,
              created_by: userId,
              updated_by: userId,
            })
          results.created++
        }
      }

      return results
    }),
})
