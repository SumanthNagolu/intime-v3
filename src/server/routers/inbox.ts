import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// UNIFIED INBOX ROUTER
// Core work queue for the unified desktop platform
// ============================================

// Input schemas
const inboxItemTypeSchema = z.enum(['task', 'follow_up', 'approval', 'alert', 'mention', 'assignment'])
const inboxPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent'])
const inboxStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'dismissed', 'snoozed'])
const dueByFilterSchema = z.enum(['overdue', 'today', 'this_week', 'this_month', 'all'])

export const inboxRouter = router({
  // ============================================
  // LIST INBOX ITEMS
  // Main query for user's inbox with filtering
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      status: z.array(inboxStatusSchema).default(['pending', 'in_progress']),
      type: z.array(inboxItemTypeSchema).optional(),
      priority: z.array(inboxPrioritySchema).optional(),
      dueBy: dueByFilterSchema.default('all'),
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
      search: z.string().optional(),
      sortBy: z.enum(['due_at', 'priority', 'created_at', 'updated_at']).default('due_at'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('inbox_items')
        .select(`
          id, item_type, entity_type, entity_id, title, subtitle, description,
          priority, due_at, snoozed_until, status, started_at, completed_at,
          available_actions, metadata, context, created_at, updated_at
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .in('status', input.status)

      // Apply filters
      if (input.type && input.type.length > 0) {
        query = query.in('item_type', input.type)
      }

      if (input.priority && input.priority.length > 0) {
        query = query.in('priority', input.priority)
      }

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }

      if (input.entityId) {
        query = query.eq('entity_id', input.entityId)
      }

      if (input.search) {
        query = query.or(`title.ilike.%${input.search}%,subtitle.ilike.%${input.search}%`)
      }

      // Due date filters
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const weekEnd = new Date(today)
      weekEnd.setDate(weekEnd.getDate() + 7)
      const monthEnd = new Date(today)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      if (input.dueBy === 'overdue') {
        query = query.lt('due_at', today.toISOString())
      } else if (input.dueBy === 'today') {
        query = query.gte('due_at', today.toISOString()).lt('due_at', tomorrow.toISOString())
      } else if (input.dueBy === 'this_week') {
        query = query.gte('due_at', today.toISOString()).lt('due_at', weekEnd.toISOString())
      } else if (input.dueBy === 'this_month') {
        query = query.gte('due_at', today.toISOString()).lt('due_at', monthEnd.toISOString())
      }

      // Sorting
      const sortColumn = input.sortBy === 'due_at' ? 'due_at' :
                        input.sortBy === 'priority' ? 'priority' :
                        input.sortBy === 'updated_at' ? 'updated_at' : 'created_at'

      // For priority, we want urgent first (desc by default for priority)
      const ascending = input.sortBy === 'priority'
        ? input.sortOrder === 'desc' // Invert for priority so 'asc' means low first
        : input.sortOrder === 'asc'

      query = query
        .order(sortColumn, { ascending, nullsFirst: false })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(item => ({
          id: item.id,
          itemType: item.item_type,
          entityType: item.entity_type,
          entityId: item.entity_id,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          priority: item.priority,
          dueAt: item.due_at,
          snoozedUntil: item.snoozed_until,
          status: item.status,
          startedAt: item.started_at,
          completedAt: item.completed_at,
          availableActions: item.available_actions as Array<{ id: string; label: string; type?: string }>,
          metadata: item.metadata as Record<string, unknown>,
          context: item.context as Record<string, unknown>,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          // Computed fields
          isOverdue: item.due_at ? new Date(item.due_at) < today : false,
          isSnoozed: item.status === 'snoozed',
        })) ?? [],
        total: count ?? 0,
        pagination: {
          limit: input.limit,
          offset: input.offset,
          hasMore: (count ?? 0) > input.offset + input.limit,
        },
      }
    }),

  // ============================================
  // GET INBOX COUNTS
  // Summary stats for inbox badges and filters
  // ============================================
  counts: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get all active inbox items for counting
      const { data: items, error } = await adminClient
        .from('inbox_items')
        .select('id, item_type, priority, status, due_at')
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .in('status', ['pending', 'in_progress', 'snoozed'])

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const activeItems = items?.filter(i => i.status !== 'snoozed') ?? []

      // Calculate counts
      const total = activeItems.length
      const overdue = activeItems.filter(i => i.due_at && new Date(i.due_at) < today).length
      const dueToday = activeItems.filter(i => {
        if (!i.due_at) return false
        const dueDate = new Date(i.due_at)
        return dueDate >= today && dueDate < tomorrow
      }).length
      const snoozed = items?.filter(i => i.status === 'snoozed').length ?? 0

      // By type
      const byType: Record<string, number> = {}
      activeItems.forEach(i => {
        byType[i.item_type] = (byType[i.item_type] || 0) + 1
      })

      // By priority
      const byPriority: Record<string, number> = {}
      activeItems.forEach(i => {
        byPriority[i.priority] = (byPriority[i.priority] || 0) + 1
      })

      // By status
      const byStatus: Record<string, number> = {}
      items?.forEach(i => {
        byStatus[i.status] = (byStatus[i.status] || 0) + 1
      })

      return {
        total,
        overdue,
        dueToday,
        snoozed,
        urgent: byPriority['urgent'] ?? 0,
        high: byPriority['high'] ?? 0,
        byType,
        byPriority,
        byStatus,
      }
    }),

  // ============================================
  // GET SINGLE INBOX ITEM
  // ============================================
  get: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data: item, error } = await adminClient
        .from('inbox_items')
        .select(`
          *,
          sources:inbox_sources(id, source_type, source_id, source_metadata, created_at),
          history:inbox_item_history(id, action, from_status, to_status, details, performed_at)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .single()

      if (error || !item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Inbox item not found' })
      }

      return {
        id: item.id,
        itemType: item.item_type,
        entityType: item.entity_type,
        entityId: item.entity_id,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        priority: item.priority,
        dueAt: item.due_at,
        snoozedUntil: item.snoozed_until,
        status: item.status,
        startedAt: item.started_at,
        completedAt: item.completed_at,
        completionNotes: item.completion_notes,
        outcome: item.outcome,
        availableActions: item.available_actions,
        metadata: item.metadata,
        context: item.context,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        sources: item.sources,
        history: item.history,
      }
    }),

  // ============================================
  // START WORKING ON ITEM
  // ============================================
  start: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Get current item
      const { data: item } = await adminClient
        .from('inbox_items')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .single()

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Inbox item not found' })
      }

      if (item.status !== 'pending' && item.status !== 'snoozed') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Item must be pending or snoozed to start' })
      }

      const now = new Date().toISOString()

      // Update item
      const { data: updated, error } = await supabase
        .from('inbox_items')
        .update({
          status: 'in_progress',
          started_at: now,
          snoozed_until: null,
          updated_at: now,
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Record history
      await supabase
        .from('inbox_item_history')
        .insert({
          inbox_item_id: input.id,
          action: 'started',
          from_status: item.status,
          to_status: 'in_progress',
          performed_by: user?.id,
        })

      return {
        id: updated.id,
        status: updated.status,
        startedAt: updated.started_at,
      }
    }),

  // ============================================
  // COMPLETE ITEM
  // ============================================
  complete: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      notes: z.string().optional(),
      outcome: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Get current item
      const { data: item } = await adminClient
        .from('inbox_items')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .single()

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Inbox item not found' })
      }

      if (item.status === 'completed' || item.status === 'dismissed') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Item is already completed or dismissed' })
      }

      const now = new Date().toISOString()

      // Update item
      const { data: updated, error } = await supabase
        .from('inbox_items')
        .update({
          status: 'completed',
          completed_at: now,
          completion_notes: input.notes,
          outcome: input.outcome,
          updated_at: now,
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Record history
      await supabase
        .from('inbox_item_history')
        .insert({
          inbox_item_id: input.id,
          action: 'completed',
          from_status: item.status,
          to_status: 'completed',
          details: { notes: input.notes, outcome: input.outcome },
          performed_by: user?.id,
        })

      return {
        id: updated.id,
        status: updated.status,
        completedAt: updated.completed_at,
      }
    }),

  // ============================================
  // DISMISS ITEM
  // ============================================
  dismiss: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Get current item
      const { data: item } = await adminClient
        .from('inbox_items')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .single()

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Inbox item not found' })
      }

      if (item.status === 'completed' || item.status === 'dismissed') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Item is already completed or dismissed' })
      }

      const now = new Date().toISOString()

      // Update item
      const { data: updated, error } = await supabase
        .from('inbox_items')
        .update({
          status: 'dismissed',
          dismissed_at: now,
          updated_at: now,
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Record history
      await supabase
        .from('inbox_item_history')
        .insert({
          inbox_item_id: input.id,
          action: 'dismissed',
          from_status: item.status,
          to_status: 'dismissed',
          details: { reason: input.reason },
          performed_by: user?.id,
        })

      return {
        id: updated.id,
        status: updated.status,
        dismissedAt: updated.dismissed_at,
      }
    }),

  // ============================================
  // SNOOZE ITEM
  // ============================================
  snooze: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      until: z.string().datetime(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Get current item
      const { data: item } = await adminClient
        .from('inbox_items')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .single()

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Inbox item not found' })
      }

      if (item.status === 'completed' || item.status === 'dismissed') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot snooze completed or dismissed items' })
      }

      const now = new Date().toISOString()
      const snoozeUntil = new Date(input.until)

      if (snoozeUntil <= new Date()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Snooze time must be in the future' })
      }

      // Update item
      const { data: updated, error } = await supabase
        .from('inbox_items')
        .update({
          status: 'snoozed',
          snoozed_until: input.until,
          updated_at: now,
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Record history
      await supabase
        .from('inbox_item_history')
        .insert({
          inbox_item_id: input.id,
          action: 'snoozed',
          from_status: item.status,
          to_status: 'snoozed',
          details: { snoozed_until: input.until },
          performed_by: user?.id,
        })

      return {
        id: updated.id,
        status: updated.status,
        snoozedUntil: updated.snoozed_until,
      }
    }),

  // ============================================
  // UNSNOOZE ITEM
  // ============================================
  unsnooze: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Get current item
      const { data: item } = await adminClient
        .from('inbox_items')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .single()

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Inbox item not found' })
      }

      if (item.status !== 'snoozed') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Item is not snoozed' })
      }

      const now = new Date().toISOString()

      // Update item
      const { data: updated, error } = await supabase
        .from('inbox_items')
        .update({
          status: 'pending',
          snoozed_until: null,
          updated_at: now,
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Record history
      await supabase
        .from('inbox_item_history')
        .insert({
          inbox_item_id: input.id,
          action: 'unsnoozed',
          from_status: 'snoozed',
          to_status: 'pending',
          performed_by: user?.id,
        })

      return {
        id: updated.id,
        status: updated.status,
      }
    }),

  // ============================================
  // UPDATE PRIORITY
  // ============================================
  updatePriority: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      priority: inboxPrioritySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Get current item
      const { data: item } = await adminClient
        .from('inbox_items')
        .select('id, priority, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .single()

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Inbox item not found' })
      }

      if (item.status === 'completed' || item.status === 'dismissed') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot update priority of completed or dismissed items' })
      }

      const now = new Date().toISOString()

      // Update item
      const { data: updated, error } = await supabase
        .from('inbox_items')
        .update({
          priority: input.priority,
          updated_at: now,
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Record history
      await supabase
        .from('inbox_item_history')
        .insert({
          inbox_item_id: input.id,
          action: 'priority_changed',
          details: { from: item.priority, to: input.priority },
          performed_by: user?.id,
        })

      return {
        id: updated.id,
        priority: updated.priority,
      }
    }),

  // ============================================
  // BULK COMPLETE
  // ============================================
  bulkComplete: orgProtectedProcedure
    .input(z.object({
      ids: z.array(z.string().uuid()).min(1).max(50),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Verify all items belong to user
      const { data: items } = await adminClient
        .from('inbox_items')
        .select('id, status')
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .in('id', input.ids)

      if (!items || items.length !== input.ids.length) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Some items not found or not accessible' })
      }

      const validItems = items.filter(i => i.status !== 'completed' && i.status !== 'dismissed')
      if (validItems.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No valid items to complete' })
      }

      const now = new Date().toISOString()
      const validIds = validItems.map(i => i.id)

      // Bulk update
      const { error } = await supabase
        .from('inbox_items')
        .update({
          status: 'completed',
          completed_at: now,
          completion_notes: input.notes,
          updated_at: now,
          updated_by: user?.id,
        })
        .in('id', validIds)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Record history for each
      const historyRecords = validItems.map(item => ({
        inbox_item_id: item.id,
        action: 'completed',
        from_status: item.status,
        to_status: 'completed',
        details: { bulk: true, notes: input.notes },
        performed_by: user?.id,
      }))

      await supabase.from('inbox_item_history').insert(historyRecords)

      return {
        completed: validIds.length,
        skipped: input.ids.length - validIds.length,
      }
    }),

  // ============================================
  // BULK DISMISS
  // ============================================
  bulkDismiss: orgProtectedProcedure
    .input(z.object({
      ids: z.array(z.string().uuid()).min(1).max(50),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Verify all items belong to user
      const { data: items } = await adminClient
        .from('inbox_items')
        .select('id, status')
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .in('id', input.ids)

      if (!items || items.length !== input.ids.length) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Some items not found or not accessible' })
      }

      const validItems = items.filter(i => i.status !== 'completed' && i.status !== 'dismissed')
      if (validItems.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No valid items to dismiss' })
      }

      const now = new Date().toISOString()
      const validIds = validItems.map(i => i.id)

      // Bulk update
      const { error } = await supabase
        .from('inbox_items')
        .update({
          status: 'dismissed',
          dismissed_at: now,
          updated_at: now,
          updated_by: user?.id,
        })
        .in('id', validIds)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Record history for each
      const historyRecords = validItems.map(item => ({
        inbox_item_id: item.id,
        action: 'dismissed',
        from_status: item.status,
        to_status: 'dismissed',
        details: { bulk: true, reason: input.reason },
        performed_by: user?.id,
      }))

      await supabase.from('inbox_item_history').insert(historyRecords)

      return {
        dismissed: validIds.length,
        skipped: input.ids.length - validIds.length,
      }
    }),

  // ============================================
  // CREATE INBOX ITEM (for internal/system use)
  // ============================================
  create: orgProtectedProcedure
    .input(z.object({
      itemType: inboxItemTypeSchema,
      entityType: z.string(),
      entityId: z.string().uuid(),
      title: z.string().min(1).max(200),
      subtitle: z.string().max(200).optional(),
      description: z.string().max(2000).optional(),
      priority: inboxPrioritySchema.default('normal'),
      dueAt: z.string().datetime().optional(),
      availableActions: z.array(z.object({
        id: z.string(),
        label: z.string(),
        type: z.string().optional(),
      })).optional(),
      metadata: z.record(z.unknown()).optional(),
      context: z.record(z.unknown()).optional(),
      // Source tracking
      sourceType: z.enum(['activity', 'workflow_approval', 'sla_alert', 'mention', 'assignment', 'system', 'email', 'calendar']).optional(),
      sourceId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      // Create inbox item
      const { data: item, error } = await supabase
        .from('inbox_items')
        .insert({
          org_id: orgId,
          user_id: user?.id,
          item_type: input.itemType,
          entity_type: input.entityType,
          entity_id: input.entityId,
          title: input.title,
          subtitle: input.subtitle,
          description: input.description,
          priority: input.priority,
          due_at: input.dueAt,
          available_actions: input.availableActions ?? [],
          metadata: input.metadata ?? {},
          context: input.context ?? {},
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Record source if provided
      if (input.sourceType && input.sourceId) {
        await supabase
          .from('inbox_sources')
          .insert({
            org_id: orgId,
            source_type: input.sourceType,
            source_id: input.sourceId,
            inbox_item_id: item.id,
          })
      }

      // Record creation in history
      await supabase
        .from('inbox_item_history')
        .insert({
          inbox_item_id: item.id,
          action: 'created',
          to_status: 'pending',
          performed_by: user?.id,
        })

      return {
        id: item.id,
        itemType: item.item_type,
        title: item.title,
        status: item.status,
      }
    }),

  // ============================================
  // GET INBOX ITEMS FOR ENTITY
  // Shows all inbox items related to a specific entity
  // ============================================
  forEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      includeCompleted: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('inbox_items')
        .select('*')
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .order('created_at', { ascending: false })

      if (!input.includeCompleted) {
        query = query.in('status', ['pending', 'in_progress', 'snoozed'])
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(item => ({
        id: item.id,
        itemType: item.item_type,
        title: item.title,
        subtitle: item.subtitle,
        priority: item.priority,
        dueAt: item.due_at,
        status: item.status,
        createdAt: item.created_at,
      })) ?? []
    }),
})
