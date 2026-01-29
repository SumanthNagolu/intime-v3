import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import type { Sprint, SprintStatus } from '@/types/scrum'

// ============================================
// INPUT SCHEMAS
// ============================================

const SprintStatusEnum = z.enum(['planning', 'active', 'review', 'completed', 'cancelled'])

const CreateSprintInput = z.object({
  podId: z.string().uuid().optional(), // Made optional, will auto-detect
  name: z.string().min(1).max(100),
  startDate: z.string(),  // ISO date string
  endDate: z.string(),    // ISO date string
  goal: z.string().max(500).optional(),
})

const UpdateSprintInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goal: z.string().max(500).optional(),
  status: SprintStatusEnum.optional(),
  goalAchieved: z.boolean().optional(),
})

const SprintIdInput = z.object({
  id: z.string().uuid(),
})

const ListSprintsInput = z.object({
  podId: z.string().uuid().optional(), // Made optional, will auto-detect
  status: z.array(SprintStatusEnum).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

// ============================================
// HELPER: Get user's pod ID
// ============================================
async function getUserPodId(adminClient: ReturnType<typeof getAdminClient>, userId: string, orgId: string): Promise<string | null> {
  // First get user_profiles.id from auth.users.id
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!profile?.id) return null

  // Check pod membership
  const { data: podMember } = await adminClient
    .from('pod_members')
    .select('pod_id')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (podMember?.pod_id) return podMember.pod_id

  // Check if user manages a pod
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

  // Fallback to group membership
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
// ROUTER
// ============================================

export const sprintsRouter = router({
  // ============================================
  // LIST SPRINTS FOR A POD
  // ============================================
  list: orgProtectedProcedure
    .input(ListSprintsInput)
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Auto-detect podId if not provided
      const podId = input.podId || (ctx.user?.id ? await getUserPodId(adminClient, ctx.user.id, ctx.orgId) : null)

      if (!podId) {
        return { items: [], total: 0 }
      }

      let query = adminClient
        .from('sprints')
        .select('*', { count: 'exact' })
        .eq('org_id', ctx.orgId)
        .eq('pod_id', podId)
        .is('deleted_at', null)
        .order('sprint_number', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status && input.status.length > 0) {
        query = query.in('status', input.status)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: (data || []).map(transformSprint),
        total: count || 0,
      }
    }),

  // ============================================
  // GET SINGLE SPRINT
  // ============================================
  get: orgProtectedProcedure
    .input(SprintIdInput)
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('sprints')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sprint not found',
        })
      }

      return transformSprint(data)
    }),

  // ============================================
  // GET ACTIVE SPRINT FOR A POD
  // ============================================
  getActive: orgProtectedProcedure
    .input(z.object({ podId: z.string().uuid().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Auto-detect podId if not provided
      const podId = input?.podId || (ctx.user?.id ? await getUserPodId(adminClient, ctx.user.id, ctx.orgId) : null)

      if (!podId) {
        return null
      }

      const { data, error } = await adminClient
        .from('sprints')
        .select('*')
        .eq('org_id', ctx.orgId)
        .eq('pod_id', podId)
        .eq('status', 'active')
        .is('deleted_at', null)
        .single()

      if (error) {
        // No active sprint is not an error
        return null
      }

      return transformSprint(data)
    }),

  // ============================================
  // CREATE SPRINT
  // ============================================
  create: orgProtectedProcedure
    .input(CreateSprintInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Auto-detect podId if not provided
      const podId = input.podId || (ctx.user?.id ? await getUserPodId(adminClient, ctx.user.id, ctx.orgId) : null)

      if (!podId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No team found for this user. Please join a team first.',
        })
      }

      // Get next sprint number for this pod
      const { data: lastSprint } = await adminClient
        .from('sprints')
        .select('sprint_number')
        .eq('pod_id', podId)
        .is('deleted_at', null)
        .order('sprint_number', { ascending: false })
        .limit(1)
        .single()

      const nextNumber = (lastSprint?.sprint_number || 0) + 1

      const { data, error } = await adminClient
        .from('sprints')
        .insert({
          org_id: ctx.orgId,
          pod_id: podId,
          sprint_number: nextNumber,
          name: input.name,
          start_date: input.startDate,
          end_date: input.endDate,
          goal: input.goal,
          status: 'planning',
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

      return transformSprint(data)
    }),

  // ============================================
  // UPDATE SPRINT
  // ============================================
  update: orgProtectedProcedure
    .input(UpdateSprintInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (input.name !== undefined) updateData.name = input.name
      if (input.startDate !== undefined) updateData.start_date = input.startDate
      if (input.endDate !== undefined) updateData.end_date = input.endDate
      if (input.goal !== undefined) updateData.goal = input.goal
      if (input.status !== undefined) updateData.status = input.status
      if (input.goalAchieved !== undefined) updateData.goal_achieved = input.goalAchieved

      const { data, error } = await adminClient
        .from('sprints')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to update sprint',
        })
      }

      return transformSprint(data)
    }),

  // ============================================
  // START SPRINT (planning -> active)
  // ============================================
  start: orgProtectedProcedure
    .input(SprintIdInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get current sprint
      const { data: sprint, error: fetchError } = await adminClient
        .from('sprints')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !sprint) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sprint not found',
        })
      }

      if (sprint.status !== 'planning') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only sprints in planning status can be started',
        })
      }

      // Check for existing active sprint in this pod
      const { data: activeSprint } = await adminClient
        .from('sprints')
        .select('id')
        .eq('pod_id', sprint.pod_id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .single()

      if (activeSprint) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'There is already an active sprint for this team',
        })
      }

      const { data, error } = await adminClient
        .from('sprints')
        .update({
          status: 'active',
          planning_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to start sprint',
        })
      }

      return transformSprint(data)
    }),

  // ============================================
  // COMPLETE SPRINT (active -> review -> completed)
  // ============================================
  complete: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      moveIncomplete: z.enum(['backlog', 'next_sprint']).default('backlog'),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get current sprint
      const { data: sprint, error: fetchError } = await adminClient
        .from('sprints')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !sprint) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sprint not found',
        })
      }

      if (sprint.status !== 'active' && sprint.status !== 'review') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only active or in-review sprints can be completed',
        })
      }

      // Move incomplete items based on preference
      if (input.moveIncomplete === 'backlog') {
        // Move incomplete items to backlog
        await adminClient
          .from('sprint_items')
          .update({
            sprint_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('sprint_id', input.id)
          .neq('status', 'done')
          .is('deleted_at', null)
      }
      // Note: 'next_sprint' would require knowing the next sprint ID

      const { data, error } = await adminClient
        .from('sprints')
        .update({
          status: 'completed',
          review_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to complete sprint',
        })
      }

      return transformSprint(data)
    }),

  // ============================================
  // GET BURNDOWN DATA
  // ============================================
  getBurndown: orgProtectedProcedure
    .input(SprintIdInput)
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('sprint_burndown')
        .select('*')
        .eq('sprint_id', input.id)
        .eq('org_id', ctx.orgId)
        .order('snapshot_date', { ascending: true })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data || []
    }),

  // ============================================
  // GET VELOCITY (last N sprints)
  // ============================================
  getVelocity: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid().optional(),
      limit: z.number().min(1).max(20).default(6),
    }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Auto-detect podId if not provided
      const podId = input?.podId || (ctx.user?.id ? await getUserPodId(adminClient, ctx.user.id, ctx.orgId) : null)

      if (!podId) {
        return []
      }

      const { data, error } = await adminClient
        .from('sprints')
        .select('id, sprint_number, name, planned_points, completed_points, start_date, end_date')
        .eq('org_id', ctx.orgId)
        .eq('pod_id', podId)
        .eq('status', 'completed')
        .is('deleted_at', null)
        .order('sprint_number', { ascending: false })
        .limit(input?.limit || 6)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Reverse to show oldest first
      return (data || []).reverse().map(s => ({
        sprintId: s.id,
        sprintNumber: s.sprint_number,
        sprintName: s.name,
        plannedPoints: s.planned_points || 0,
        completedPoints: s.completed_points || 0,
        startDate: s.start_date,
        endDate: s.end_date,
      }))
    }),

  // ============================================
  // DELETE SPRINT (soft delete)
  // ============================================
  delete: orgProtectedProcedure
    .input(SprintIdInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Check sprint exists and is in planning status
      const { data: sprint, error: fetchError } = await adminClient
        .from('sprints')
        .select('status')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !sprint) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sprint not found',
        })
      }

      if (sprint.status !== 'planning') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only sprints in planning status can be deleted',
        })
      }

      // Move items back to backlog
      await adminClient
        .from('sprint_items')
        .update({
          sprint_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('sprint_id', input.id)
        .is('deleted_at', null)

      // Soft delete sprint
      const { error } = await adminClient
        .from('sprints')
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', input.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformSprint(data: Record<string, unknown>): Sprint {
  const plannedPoints = (data.planned_points as number) || 0
  return {
    id: data.id as string,
    orgId: data.org_id as string,
    podId: data.pod_id as string,
    sprintNumber: data.sprint_number as number,
    name: data.name as string,
    startDate: data.start_date as string,
    endDate: data.end_date as string,
    goal: data.goal as string | undefined,
    goalAchieved: data.goal_achieved as boolean | undefined,
    status: data.status as SprintStatus,
    plannedPoints,
    completedPoints: (data.completed_points as number) || 0,
    totalItems: (data.total_items as number) || 0,
    completedItems: (data.completed_items as number) || 0,
    totalPoints: plannedPoints, // Alias for convenience
    planningCompletedAt: data.planning_completed_at as string | undefined,
    reviewCompletedAt: data.review_completed_at as string | undefined,
    retroCompletedAt: data.retro_completed_at as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    createdBy: data.created_by as string | undefined,
  }
}
