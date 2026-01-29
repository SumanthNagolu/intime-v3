import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import type { BoardColumn, BoardState, SprintItemStatus } from '@/types/scrum'

// ============================================
// HELPER: Get user's pod ID
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

const SprintItemStatusEnum = z.enum(['backlog', 'todo', 'in_progress', 'review', 'done', 'blocked'])

const CreateColumnInput = z.object({
  podId: z.string().uuid(),
  columnKey: z.string().min(1).max(50),
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  color: z.string().default('gray'),
  icon: z.string().optional(),
  position: z.number().min(0),
  mapsToStatus: SprintItemStatusEnum,
  wipLimit: z.number().min(1).optional(),
  isDoneColumn: z.boolean().default(false),
  isInitialColumn: z.boolean().default(false),
})

const UpdateColumnInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  wipLimit: z.number().min(1).nullable().optional(),
  isDoneColumn: z.boolean().optional(),
  isInitialColumn: z.boolean().optional(),
})

// ============================================
// ROUTER
// ============================================

export const boardRouter = router({
  // ============================================
  // GET COLUMNS FOR A POD
  // ============================================
  getColumns: orgProtectedProcedure
    .input(z.object({ podId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('board_columns')
        .select('*')
        .eq('org_id', ctx.orgId)
        .eq('pod_id', input.podId)
        .order('position')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // If no columns exist, create defaults
      if (!data || data.length === 0) {
        await adminClient.rpc('create_default_board_columns', {
          p_org_id: ctx.orgId,
          p_pod_id: input.podId,
        })

        // Fetch again
        const { data: newData, error: newError } = await adminClient
          .from('board_columns')
          .select('*')
          .eq('org_id', ctx.orgId)
          .eq('pod_id', input.podId)
          .order('position')

        if (newError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: newError.message,
          })
        }

        return (newData || []).map(transformColumn)
      }

      return data.map(transformColumn)
    }),

  // ============================================
  // GET FULL BOARD STATE (columns + items)
  // ============================================
  getFullBoard: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid().optional(),
      sprintId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Auto-detect podId if not provided
      const podId = input?.podId || (ctx.user?.id ? await getUserPodId(adminClient, ctx.user.id, ctx.orgId) : null)
      if (!podId) {
        return {
          columns: [],
          items: {},
          sprint: undefined,
        } as BoardState
      }

      // Get columns
      let columnsData: Record<string, unknown>[] = []
      const { data: columns, error: columnsError } = await adminClient
        .from('board_columns')
        .select('*')
        .eq('org_id', ctx.orgId)
        .eq('pod_id', podId)
        .order('position')

      if (columnsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: columnsError.message,
        })
      }

      columnsData = columns || []

      // Create defaults if needed
      if (columnsData.length === 0) {
        await adminClient.rpc('create_default_board_columns', {
          p_org_id: ctx.orgId,
          p_pod_id: podId,
        })

        const { data: newColumns } = await adminClient
          .from('board_columns')
          .select('*')
          .eq('org_id', ctx.orgId)
          .eq('pod_id', podId)
          .order('position')

        columnsData = newColumns || []
      }

      // Get sprint if specified
      let sprint = null
      if (input.sprintId) {
        const { data: sprintData } = await adminClient
          .from('sprints')
          .select('*')
          .eq('id', input.sprintId)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        sprint = sprintData
      }

      // Get items for this sprint (or backlog if no sprint)
      let itemsQuery = adminClient
        .from('sprint_items')
        .select(`
          *,
          assignee:user_profiles!sprint_items_assignee_id_fkey(id, full_name, avatar_url)
        `)
        .eq('org_id', ctx.orgId)
        .eq('pod_id', podId)
        .is('deleted_at', null)
        .order('board_order')

      if (input.sprintId) {
        itemsQuery = itemsQuery.eq('sprint_id', input.sprintId)
      }

      const { data: items, error: itemsError } = await itemsQuery

      if (itemsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: itemsError.message,
        })
      }

      // Group items by column
      const itemsByColumn: Record<string, unknown[]> = {}
      for (const column of columnsData) {
        const columnKey = column.column_key as string
        itemsByColumn[columnKey] = (items || []).filter(
          (item: Record<string, unknown>) => item.board_column === columnKey
        )
      }

      return {
        columns: columnsData.map(transformColumn),
        items: itemsByColumn,
        sprint: sprint ? {
          id: sprint.id,
          name: sprint.name,
          startDate: sprint.start_date,
          endDate: sprint.end_date,
          goal: sprint.goal,
          status: sprint.status,
          plannedPoints: sprint.planned_points,
          completedPoints: sprint.completed_points,
          totalItems: sprint.total_items,
          completedItems: sprint.completed_items,
        } : undefined,
      } as BoardState
    }),

  // ============================================
  // CREATE COLUMN
  // ============================================
  createColumn: orgProtectedProcedure
    .input(CreateColumnInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Check for duplicate column key
      const { data: existing } = await adminClient
        .from('board_columns')
        .select('id')
        .eq('pod_id', input.podId)
        .eq('column_key', input.columnKey)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A column with this key already exists',
        })
      }

      // Shift positions of existing columns
      await adminClient
        .from('board_columns')
        .update({ position: adminClient.sql`position + 1` })
        .eq('pod_id', input.podId)
        .gte('position', input.position)

      const { data, error } = await adminClient
        .from('board_columns')
        .insert({
          org_id: ctx.orgId,
          pod_id: input.podId,
          column_key: input.columnKey,
          name: input.name,
          description: input.description,
          color: input.color,
          icon: input.icon,
          position: input.position,
          maps_to_status: input.mapsToStatus,
          wip_limit: input.wipLimit,
          is_done_column: input.isDoneColumn,
          is_initial_column: input.isInitialColumn,
        })
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to create column',
        })
      }

      return transformColumn(data)
    }),

  // ============================================
  // UPDATE COLUMN
  // ============================================
  updateColumn: orgProtectedProcedure
    .input(UpdateColumnInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (input.name !== undefined) updateData.name = input.name
      if (input.description !== undefined) updateData.description = input.description
      if (input.color !== undefined) updateData.color = input.color
      if (input.icon !== undefined) updateData.icon = input.icon
      if (input.wipLimit !== undefined) updateData.wip_limit = input.wipLimit
      if (input.isDoneColumn !== undefined) updateData.is_done_column = input.isDoneColumn
      if (input.isInitialColumn !== undefined) updateData.is_initial_column = input.isInitialColumn

      const { data, error } = await adminClient
        .from('board_columns')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to update column',
        })
      }

      return transformColumn(data)
    }),

  // ============================================
  // DELETE COLUMN
  // ============================================
  deleteColumn: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get column to find pod_id and position
      const { data: column, error: fetchError } = await adminClient
        .from('board_columns')
        .select('pod_id, position, column_key')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .single()

      if (fetchError || !column) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Column not found',
        })
      }

      // Check if there are items in this column
      const { count } = await adminClient
        .from('sprint_items')
        .select('id', { count: 'exact', head: true })
        .eq('board_column', column.column_key)
        .is('deleted_at', null)

      if (count && count > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete column with items. Move items first.',
        })
      }

      // Delete the column
      const { error } = await adminClient
        .from('board_columns')
        .delete()
        .eq('id', input.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Shift positions of remaining columns
      await adminClient
        .from('board_columns')
        .update({ position: adminClient.sql`position - 1` })
        .eq('pod_id', column.pod_id)
        .gt('position', column.position)

      return { success: true }
    }),

  // ============================================
  // REORDER COLUMNS
  // ============================================
  reorderColumns: orgProtectedProcedure
    .input(z.object({
      columns: z.array(z.object({
        id: z.string().uuid(),
        position: z.number().min(0),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      for (const column of input.columns) {
        await adminClient
          .from('board_columns')
          .update({
            position: column.position,
            updated_at: new Date().toISOString(),
          })
          .eq('id', column.id)
          .eq('org_id', ctx.orgId)
      }

      return { success: true }
    }),

  // ============================================
  // ENSURE DEFAULT COLUMNS EXIST
  // ============================================
  ensureDefaults: orgProtectedProcedure
    .input(z.object({ podId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Check if columns exist
      const { count } = await adminClient
        .from('board_columns')
        .select('id', { count: 'exact', head: true })
        .eq('pod_id', input.podId)

      if (count && count > 0) {
        return { created: false, message: 'Columns already exist' }
      }

      // Create defaults
      await adminClient.rpc('create_default_board_columns', {
        p_org_id: ctx.orgId,
        p_pod_id: input.podId,
      })

      return { created: true, message: 'Default columns created' }
    }),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformColumn(data: Record<string, unknown>): BoardColumn {
  return {
    id: data.id as string,
    orgId: data.org_id as string,
    podId: data.pod_id as string,
    columnKey: data.column_key as string,
    name: data.name as string,
    description: data.description as string | undefined,
    color: data.color as string,
    icon: data.icon as string | undefined,
    position: data.position as number,
    wipLimit: data.wip_limit as number | undefined,
    mapsToStatus: data.maps_to_status as SprintItemStatus,
    isDoneColumn: data.is_done_column as boolean,
    isInitialColumn: data.is_initial_column as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
