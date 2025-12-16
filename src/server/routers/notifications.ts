import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// =============================================================================
// ROUTER
// =============================================================================

export const notificationsRouter = router({
  // ============================================
  // LIST NOTIFICATION PREFERENCES
  // ============================================
  listPreferences: orgProtectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx
    const adminClient = getAdminClient()

    const { data, error } = await adminClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user?.id)
      .order('category')

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data ?? []
  }),

  // ============================================
  // UPDATE NOTIFICATION PREFERENCE
  // ============================================
  updatePreference: orgProtectedProcedure
    .input(
      z.object({
        category: z.string(),
        channel: z.enum(['email', 'in_app', 'push', 'sms']),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient.from('notification_preferences').upsert(
        {
          user_id: user?.id,
          category: input.category,
          channel: input.channel,
          enabled: input.enabled,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,category,channel',
        }
      )

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // ============================================
  // LIST RECENT NOTIFICATIONS
  // ============================================
  listRecent: orgProtectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        unreadOnly: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx
      const { page, pageSize, unreadOnly } = input
      const adminClient = getAdminClient()

      let query = adminClient
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (unreadOnly) {
        query = query.eq('is_read', false)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query.range(from, to)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: data ?? [],
        pagination: {
          page,
          pageSize,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // ============================================
  // MARK NOTIFICATION AS READ
  // ============================================
  markAsRead: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('user_id', user?.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // ============================================
  // MARK ALL AS READ
  // ============================================
  markAllAsRead: orgProtectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx
    const adminClient = getAdminClient()

    const { error } = await adminClient
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user?.id)
      .eq('is_read', false)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return { success: true }
  }),

  // ============================================
  // GET NOTIFICATION STATS
  // ============================================
  getStats: orgProtectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx
    const adminClient = getAdminClient()

    const { count: total } = await adminClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)

    const { count: unread } = await adminClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('is_read', false)

    return {
      total: total ?? 0,
      unread: unread ?? 0,
      read: (total ?? 0) - (unread ?? 0),
    }
  }),

  // ============================================
  // LIST NOTIFICATION TEMPLATES (Admin)
  // ============================================
  listTemplates: orgProtectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const { search, category, page, pageSize } = input
      const adminClient = getAdminClient()

      let query = adminClient
        .from('notification_templates')
        .select('*', { count: 'exact' })
        .or(`org_id.eq.${orgId},org_id.is.null`)

      if (search) {
        query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)
      }
      if (category) {
        query = query.eq('category', category)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query
        .order('category')
        .order('name')
        .range(from, to)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: data ?? [],
        pagination: {
          page,
          pageSize,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // ============================================
  // GET TEMPLATE BY ID
  // ============================================
  getTemplateById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('notification_templates')
        .select('*')
        .eq('id', input.id)
        .or(`org_id.eq.${orgId},org_id.is.null`)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        })
      }

      return data
    }),

  // ============================================
  // UPDATE NOTIFICATION TEMPLATE
  // ============================================
  updateTemplate: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        subject: z.string().optional(),
        body: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const { id, ...updates } = input

      const updateData: Record<string, unknown> = {}
      if (updates.subject !== undefined) updateData.subject = updates.subject
      if (updates.body !== undefined) updateData.body = updates.body
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await adminClient
        .from('notification_templates')
        .update(updateData)
        .eq('id', id)
        .or(`org_id.eq.${orgId},org_id.is.null`)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update_notification_template',
        table_name: 'notification_templates',
        record_id: id,
        new_values: updateData,
      })

      return data
    }),

  // ============================================
  // GET NOTIFICATION CATEGORIES
  // ============================================
  getCategories: orgProtectedProcedure.query(async () => {
    // Return predefined notification categories
    return [
      { id: 'system', name: 'System', description: 'System-wide notifications' },
      { id: 'security', name: 'Security', description: 'Security alerts and notifications' },
      { id: 'workflow', name: 'Workflow', description: 'Workflow and approval notifications' },
      { id: 'activity', name: 'Activity', description: 'Activity and task notifications' },
      { id: 'reminder', name: 'Reminders', description: 'Scheduled reminders' },
      { id: 'marketing', name: 'Marketing', description: 'Product updates and news' },
    ]
  }),

  // ============================================
  // DELETE NOTIFICATION
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('notifications')
        .delete()
        .eq('id', input.id)
        .eq('user_id', user?.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // ============================================
  // CLEAR ALL READ NOTIFICATIONS
  // ============================================
  clearRead: orgProtectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx
    const adminClient = getAdminClient()

    const { error } = await adminClient
      .from('notifications')
      .delete()
      .eq('user_id', user?.id)
      .eq('is_read', true)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return { success: true }
  }),
})
