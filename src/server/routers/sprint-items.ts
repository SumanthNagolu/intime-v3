import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import type { SprintItem, SprintItemStatus, SprintItemType, SprintItemPriority, SprintItemWithRelations } from '@/types/scrum'

// ============================================
// HELPER: Get user's pod ID (same as sprints router)
// ============================================
async function getUserPodId(adminClient: ReturnType<typeof getAdminClient>, userId: string, orgId: string): Promise<string | null> {
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!profile?.id) return null

  const { data: podMember } = await adminClient
    .from('pod_members')
    .select('pod_id')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (podMember?.pod_id) return podMember.pod_id

  const { data: managedPod } = await adminClient
    .from('pods')
    .select('id')
    .eq('org_id', orgId)
    .eq('manager_id', profile.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .limit(1)
    .single()

  if (managedPod?.id) return managedPod.id

  const { data: groupMember } = await adminClient
    .from('group_members')
    .select('group_id')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (groupMember?.group_id) return groupMember.group_id

  return null
}

// ============================================
// INPUT SCHEMAS
// ============================================

const SprintItemTypeEnum = z.enum(['epic', 'story', 'task', 'bug', 'spike'])
const SprintItemStatusEnum = z.enum(['backlog', 'todo', 'in_progress', 'review', 'done', 'blocked'])
const SprintItemPriorityEnum = z.enum(['critical', 'high', 'medium', 'low'])
const LinkedEntityTypeEnum = z.enum(['job', 'submission', 'candidate', 'activity', 'account'])

const CreateSprintItemInput = z.object({
  podId: z.string().uuid().optional(), // Made optional, will auto-detect
  sprintId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  itemType: SprintItemTypeEnum.default('story'),
  status: SprintItemStatusEnum.default('backlog'),
  priority: SprintItemPriorityEnum.default('medium'),
  storyPoints: z.number().min(0).max(100).optional(),
  assigneeId: z.string().uuid().optional(),
  epicId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  labels: z.array(z.string()).default([]),
  dueDate: z.string().optional(),
  linkedEntityType: LinkedEntityTypeEnum.optional(),
  linkedEntityId: z.string().uuid().optional(),
})

const UpdateSprintItemInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  itemType: SprintItemTypeEnum.optional(),
  status: SprintItemStatusEnum.optional(),
  priority: SprintItemPriorityEnum.optional(),
  storyPoints: z.number().min(0).max(100).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  epicId: z.string().uuid().nullable().optional(),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().nullable().optional(),
  timeSpentHours: z.number().min(0).optional(),
})

const MoveItemInput = z.object({
  id: z.string().uuid(), // Item ID
  status: SprintItemStatusEnum, // New status (column)
  boardOrder: z.number().min(0).optional(), // New position
})

const AddToSprintInput = z.object({
  itemIds: z.array(z.string().uuid()),
  sprintId: z.string().uuid(),
})

const ListItemsInput = z.object({
  podId: z.string().uuid().optional(), // Made optional, will auto-detect
  sprintId: z.string().uuid().optional(),
  status: z.array(SprintItemStatusEnum).optional(),
  itemType: z.array(SprintItemTypeEnum).optional(),
  assigneeId: z.string().uuid().optional(),
  priority: z.array(SprintItemPriorityEnum).optional(),
  labels: z.array(z.string()).optional(),
  search: z.string().optional(),
  inBacklog: z.boolean().optional(),
  limit: z.number().min(1).max(200).default(100),
  offset: z.number().min(0).default(0),
})

// ============================================
// ROUTER
// ============================================

export const sprintItemsRouter = router({
  // ============================================
  // LIST SPRINT ITEMS
  // ============================================
  list: orgProtectedProcedure
    .input(ListItemsInput)
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      let query = adminClient
        .from('sprint_items')
        .select(`
          *,
          assignee:user_profiles!sprint_items_assignee_id_fkey(id, full_name, avatar_url),
          reporter:user_profiles!sprint_items_reporter_id_fkey(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('org_id', ctx.orgId)
        .eq('pod_id', input.podId)
        .is('deleted_at', null)

      // Filter by sprint or backlog
      if (input.sprintId) {
        query = query.eq('sprint_id', input.sprintId)
      } else if (input.inBacklog) {
        query = query.is('sprint_id', null)
      }

      // Additional filters
      if (input.status && input.status.length > 0) {
        query = query.in('status', input.status)
      }
      if (input.itemType && input.itemType.length > 0) {
        query = query.in('item_type', input.itemType)
      }
      if (input.assigneeId) {
        query = query.eq('assignee_id', input.assigneeId)
      }
      if (input.priority && input.priority.length > 0) {
        query = query.in('priority', input.priority)
      }
      if (input.labels && input.labels.length > 0) {
        query = query.overlaps('labels', input.labels)
      }
      if (input.search) {
        query = query.or(`title.ilike.%${input.search}%,item_number.ilike.%${input.search}%`)
      }

      // Order by board position for sprint items, backlog order for backlog
      if (input.sprintId) {
        query = query.order('board_column').order('board_order')
      } else {
        query = query.order('backlog_order', { nullsFirst: false })
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: (data || []).map(transformSprintItemWithRelations),
        total: count || 0,
      }
    }),

  // ============================================
  // GET SINGLE ITEM
  // ============================================
  get: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('sprint_items')
        .select(`
          *,
          assignee:user_profiles!sprint_items_assignee_id_fkey(id, full_name, avatar_url),
          reporter:user_profiles!sprint_items_reporter_id_fkey(id, full_name, avatar_url),
          epic:sprint_items!sprint_items_epic_id_fkey(id, item_number, title),
          parent:sprint_items!sprint_items_parent_id_fkey(id, item_number, title)
        `)
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Item not found',
        })
      }

      // Get subtasks
      const { data: subtasks } = await adminClient
        .from('sprint_items')
        .select('id, item_number, title, status, assignee_id')
        .eq('parent_id', input.id)
        .is('deleted_at', null)
        .order('board_order')

      // Get comments
      const { data: comments } = await adminClient
        .from('sprint_item_comments')
        .select(`
          *,
          author:user_profiles(id, full_name, avatar_url)
        `)
        .eq('item_id', input.id)
        .order('created_at', { ascending: false })
        .limit(50)

      return {
        ...transformSprintItemWithRelations(data),
        subtasks: subtasks || [],
        comments: (comments || []).map((c: Record<string, unknown>) => ({
          id: c.id as string,
          itemId: c.item_id as string,
          authorId: c.author_id as string,
          authorName: (c.author as Record<string, unknown>)?.full_name as string || 'Unknown',
          authorAvatar: (c.author as Record<string, unknown>)?.avatar_url as string | undefined,
          content: c.content as string,
          createdAt: c.created_at as string,
          updatedAt: c.updated_at as string | undefined,
        })),
      }
    }),

  // ============================================
  // CREATE ITEM
  // ============================================
  create: orgProtectedProcedure
    .input(CreateSprintItemInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get reporter profile ID
      const { data: profile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', ctx.user?.id)
        .single()

      // Auto-detect podId if not provided
      const podId = input.podId || (ctx.user?.id ? await getUserPodId(adminClient, ctx.user.id, ctx.orgId) : null)

      if (!podId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No team found for this user. Please join a team first.',
        })
      }

      // Get max board_order or backlog_order
      let maxOrder = 0
      if (input.sprintId) {
        const { data: maxItem } = await adminClient
          .from('sprint_items')
          .select('board_order')
          .eq('sprint_id', input.sprintId)
          .eq('board_column', 'todo')
          .is('deleted_at', null)
          .order('board_order', { ascending: false })
          .limit(1)
          .single()
        maxOrder = (maxItem?.board_order || 0) + 1
      } else {
        const { data: maxItem } = await adminClient
          .from('sprint_items')
          .select('backlog_order')
          .eq('pod_id', podId)
          .is('sprint_id', null)
          .is('deleted_at', null)
          .order('backlog_order', { ascending: false })
          .limit(1)
          .single()
        maxOrder = (maxItem?.backlog_order || 0) + 1
      }

      const { data, error } = await adminClient
        .from('sprint_items')
        .insert({
          org_id: ctx.orgId,
          pod_id: podId,
          sprint_id: input.sprintId || null,
          title: input.title,
          description: input.description,
          item_type: input.itemType,
          status: input.status || 'backlog',
          priority: input.priority,
          story_points: input.storyPoints,
          assignee_id: input.assigneeId,
          reporter_id: profile?.id,
          epic_id: input.epicId,
          parent_id: input.parentId,
          labels: input.labels,
          due_date: input.dueDate,
          linked_entity_type: input.linkedEntityType,
          linked_entity_id: input.linkedEntityId,
          board_column: 'todo',
          board_order: input.sprintId ? maxOrder : 0,
          backlog_order: input.sprintId ? null : maxOrder,
          status: 'todo',
          created_by: ctx.user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return transformSprintItem(data)
    }),

  // ============================================
  // UPDATE ITEM
  // ============================================
  update: orgProtectedProcedure
    .input(UpdateSprintItemInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get current item for history tracking
      const { data: currentItem } = await adminClient
        .from('sprint_items')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (!currentItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Item not found',
        })
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: ctx.user?.id,
      }

      // Build update object and track changes
      const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = []

      if (input.title !== undefined && input.title !== currentItem.title) {
        updateData.title = input.title
        changes.push({ field: 'title', oldValue: currentItem.title, newValue: input.title })
      }
      if (input.description !== undefined) {
        updateData.description = input.description
      }
      if (input.itemType !== undefined && input.itemType !== currentItem.item_type) {
        updateData.item_type = input.itemType
        changes.push({ field: 'item_type', oldValue: currentItem.item_type, newValue: input.itemType })
      }
      if (input.status !== undefined && input.status !== currentItem.status) {
        updateData.status = input.status
        updateData.board_column = input.status
        changes.push({ field: 'status', oldValue: currentItem.status, newValue: input.status })

        // Track started_at and completed_at
        if (input.status === 'in_progress' && !currentItem.started_at) {
          updateData.started_at = new Date().toISOString()
        }
        if (input.status === 'done' && !currentItem.completed_at) {
          updateData.completed_at = new Date().toISOString()
        }
      }
      if (input.priority !== undefined && input.priority !== currentItem.priority) {
        updateData.priority = input.priority
        changes.push({ field: 'priority', oldValue: currentItem.priority, newValue: input.priority })
      }
      if (input.storyPoints !== undefined && input.storyPoints !== currentItem.story_points) {
        updateData.story_points = input.storyPoints
        changes.push({ field: 'story_points', oldValue: currentItem.story_points, newValue: input.storyPoints })
      }
      if (input.assigneeId !== undefined && input.assigneeId !== currentItem.assignee_id) {
        updateData.assignee_id = input.assigneeId
        changes.push({ field: 'assignee_id', oldValue: currentItem.assignee_id, newValue: input.assigneeId })
      }
      if (input.epicId !== undefined) {
        updateData.epic_id = input.epicId
      }
      if (input.labels !== undefined) {
        updateData.labels = input.labels
      }
      if (input.dueDate !== undefined) {
        updateData.due_date = input.dueDate
      }
      if (input.timeSpentHours !== undefined) {
        updateData.time_spent_hours = input.timeSpentHours
      }

      const { data, error } = await adminClient
        .from('sprint_items')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to update item',
        })
      }

      // Record history for significant changes
      if (changes.length > 0) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', ctx.user?.id)
          .single()

        for (const change of changes) {
          await adminClient
            .from('sprint_item_history')
            .insert({
              org_id: ctx.orgId,
              item_id: input.id,
              field_name: change.field,
              old_value: change.oldValue?.toString() || null,
              new_value: change.newValue?.toString() || null,
              changed_by: profile?.id,
            })
        }
      }

      return transformSprintItem(data)
    }),

  // ============================================
  // MOVE ITEM ON BOARD (drag-and-drop)
  // ============================================
  moveItem: orgProtectedProcedure
    .input(MoveItemInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get the item
      const { data: item, error: fetchError } = await adminClient
        .from('sprint_items')
        .select('sprint_id, board_column, status')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Item not found',
        })
      }

      const newStatus = input.status
      const updateData: Record<string, unknown> = {
        board_column: newStatus,
        board_order: input.boardOrder || 0,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      // Track started_at and completed_at
      if (newStatus === 'in_progress' && item.status === 'todo') {
        updateData.started_at = new Date().toISOString()
      }
      if (newStatus === 'done' && item.status !== 'done') {
        updateData.completed_at = new Date().toISOString()
      }

      const { data, error } = await adminClient
        .from('sprint_items')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to move item',
        })
      }

      return transformSprintItem(data)
    }),

  // ============================================
  // REORDER ITEMS IN COLUMN
  // ============================================
  reorderItems: orgProtectedProcedure
    .input(z.object({
      items: z.array(z.object({
        id: z.string().uuid(),
        order: z.number().min(0),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Update each item's order
      for (const item of input.items) {
        await adminClient
          .from('sprint_items')
          .update({
            board_order: item.order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)
          .eq('org_id', ctx.orgId)
      }

      return { success: true }
    }),

  // ============================================
  // GET BACKLOG
  // ============================================
  getBacklog: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid().optional(),
      limit: z.number().min(1).max(200).default(100),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Auto-detect podId if not provided
      const podId = input?.podId || (ctx.user?.id ? await getUserPodId(adminClient, ctx.user.id, ctx.orgId) : null)

      if (!podId) {
        return []
      }

      const { data, error, count } = await adminClient
        .from('sprint_items')
        .select(`
          *,
          assignee:user_profiles!sprint_items_assignee_id_fkey(id, full_name, avatar_url),
          epic:sprint_items!sprint_items_epic_id_fkey(id, item_number, title)
        `, { count: 'exact' })
        .eq('org_id', ctx.orgId)
        .eq('pod_id', podId)
        .is('sprint_id', null)
        .is('deleted_at', null)
        .order('backlog_order', { nullsFirst: false })
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 100) - 1)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return (data || []).map(transformSprintItem) as SprintItemWithRelations[]
    }),

  // ============================================
  // GET BACKLOG (OLD - for compatibility)
  // ============================================
  getBacklogOld: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid().optional(),
      limit: z.number().min(1).max(200).default(100),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const podId = input?.podId || (ctx.user?.id ? await getUserPodId(adminClient, ctx.user.id, ctx.orgId) : null)

      if (!podId) {
        return { items: [], total: 0 }
      }

      const { data, error, count } = await adminClient
        .from('sprint_items')
        .select(`
          *,
          assignee:user_profiles!sprint_items_assignee_id_fkey(id, full_name, avatar_url),
          epic:sprint_items!sprint_items_epic_id_fkey(id, item_number, title)
        `, { count: 'exact' })
        .eq('org_id', ctx.orgId)
        .eq('pod_id', podId)
        .is('sprint_id', null)
        .is('deleted_at', null)
        .order('backlog_order', { nullsFirst: false })
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 100) - 1)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: (data || []).map(transformSprintItemWithRelations),
        total: count || 0,
      }
    }),

  // ============================================
  // ADD ITEMS TO SPRINT
  // ============================================
  addToSprint: orgProtectedProcedure
    .input(AddToSprintInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get max board_order in the sprint's todo column
      const { data: maxItem } = await adminClient
        .from('sprint_items')
        .select('board_order')
        .eq('sprint_id', input.sprintId)
        .eq('board_column', 'todo')
        .is('deleted_at', null)
        .order('board_order', { ascending: false })
        .limit(1)
        .single()

      let currentOrder = (maxItem?.board_order || 0) + 1

      // Update each item
      for (const itemId of input.itemIds) {
        await adminClient
          .from('sprint_items')
          .update({
            sprint_id: input.sprintId,
            board_column: 'todo',
            board_order: currentOrder++,
            backlog_order: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itemId)
          .eq('org_id', ctx.orgId)
      }

      return { success: true, count: input.itemIds.length }
    }),

  // ============================================
  // REMOVE FROM SPRINT (back to backlog)
  // ============================================
  removeFromSprint: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get item's pod_id
      const { data: item } = await adminClient
        .from('sprint_items')
        .select('pod_id')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .single()

      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Item not found',
        })
      }

      // Get max backlog order
      const { data: maxItem } = await adminClient
        .from('sprint_items')
        .select('backlog_order')
        .eq('pod_id', item.pod_id)
        .is('sprint_id', null)
        .is('deleted_at', null)
        .order('backlog_order', { ascending: false })
        .limit(1)
        .single()

      const { data, error } = await adminClient
        .from('sprint_items')
        .update({
          sprint_id: null,
          board_column: 'todo',
          board_order: 0,
          backlog_order: (maxItem?.backlog_order || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to remove item from sprint',
        })
      }

      return transformSprintItem(data)
    }),

  // ============================================
  // REORDER BACKLOG
  // ============================================
  reorderBacklog: orgProtectedProcedure
    .input(z.object({
      items: z.array(z.object({
        id: z.string().uuid(),
        order: z.number().min(0),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      for (const item of input.items) {
        await adminClient
          .from('sprint_items')
          .update({
            backlog_order: item.order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)
          .eq('org_id', ctx.orgId)
      }

      return { success: true }
    }),

  // ============================================
  // DELETE ITEM (soft delete)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('sprint_items')
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // ============================================
  // ADD COMMENT
  // ============================================
  addComment: orgProtectedProcedure
    .input(z.object({
      itemId: z.string().uuid(),
      content: z.string().min(1).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data: profile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', ctx.user?.id)
        .single()

      if (!profile) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User profile not found',
        })
      }

      const { data, error } = await adminClient
        .from('sprint_item_comments')
        .insert({
          org_id: ctx.orgId,
          item_id: input.itemId,
          author_id: profile.id,
          content: input.content,
        })
        .select(`
          *,
          author:user_profiles(id, full_name, avatar_url)
        `)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to add comment',
        })
      }

      return {
        id: data.id,
        itemId: data.item_id,
        authorId: data.author_id,
        authorName: (data.author as Record<string, unknown>)?.full_name || 'Unknown',
        authorAvatar: (data.author as Record<string, unknown>)?.avatar_url,
        content: data.content,
        createdAt: data.created_at,
      }
    }),

  // ============================================
  // GET ITEM HISTORY
  // ============================================
  getHistory: orgProtectedProcedure
    .input(z.object({
      itemId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('sprint_item_history')
        .select(`
          *,
          changed_by_user:user_profiles(id, full_name, avatar_url)
        `)
        .eq('item_id', input.itemId)
        .eq('org_id', ctx.orgId)
        .order('changed_at', { ascending: false })
        .limit(input.limit)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return (data || []).map((h: Record<string, unknown>) => ({
        id: h.id,
        itemId: h.item_id,
        fieldName: h.field_name,
        oldValue: h.old_value,
        newValue: h.new_value,
        changedBy: {
          id: (h.changed_by_user as Record<string, unknown>)?.id,
          name: (h.changed_by_user as Record<string, unknown>)?.full_name || 'Unknown',
          avatar: (h.changed_by_user as Record<string, unknown>)?.avatar_url,
        },
        changedAt: h.changed_at,
      }))
    }),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformSprintItem(data: Record<string, unknown>): SprintItem {
  return {
    id: data.id as string,
    orgId: data.org_id as string,
    sprintId: data.sprint_id as string | undefined,
    itemNumber: data.item_number as string,
    title: data.title as string,
    description: data.description as string | undefined,
    itemType: data.item_type as SprintItemType,
    status: data.status as SprintItemStatus,
    priority: data.priority as SprintItemPriority,
    storyPoints: data.story_points as number | undefined,
    assigneeId: data.assignee_id as string | undefined,
    reporterId: data.reporter_id as string | undefined,
    parentId: data.parent_id as string | undefined,
    epicId: data.epic_id as string | undefined,
    linkedEntityType: data.linked_entity_type as 'job' | 'submission' | 'candidate' | 'activity' | undefined,
    linkedEntityId: data.linked_entity_id as string | undefined,
    boardColumn: data.board_column as string,
    boardOrder: data.board_order as number,
    backlogOrder: data.backlog_order as number | undefined,
    labels: (data.labels as string[]) || [],
    timeEstimateHours: data.time_estimate_hours as number | undefined,
    timeSpentHours: (data.time_spent_hours as number) || 0,
    startedAt: data.started_at as string | undefined,
    completedAt: data.completed_at as string | undefined,
    dueDate: data.due_date as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    createdBy: data.created_by as string | undefined,
    updatedBy: data.updated_by as string | undefined,
  }
}

function transformSprintItemWithRelations(data: Record<string, unknown>): SprintItemWithRelations {
  const item = transformSprintItem(data)

  const assignee = data.assignee as Record<string, unknown> | null
  const reporter = data.reporter as Record<string, unknown> | null
  const epic = data.epic as Record<string, unknown> | null
  const parent = data.parent as Record<string, unknown> | null

  return {
    ...item,
    assignee: assignee ? {
      id: assignee.id as string,
      fullName: assignee.full_name as string,
      avatarUrl: assignee.avatar_url as string | undefined,
    } : undefined,
    reporter: reporter ? {
      id: reporter.id as string,
      fullName: reporter.full_name as string,
      avatarUrl: reporter.avatar_url as string | undefined,
    } : undefined,
    epic: epic ? {
      id: epic.id as string,
      itemNumber: epic.item_number as string,
      title: epic.title as string,
    } as SprintItem : undefined,
    parent: parent ? {
      id: parent.id as string,
      itemNumber: parent.item_number as string,
      title: parent.title as string,
    } as SprintItem : undefined,
  }
}
