import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import type { SprintRetrospective, RetroItem, RetroActionItem, RetroStatus } from '@/types/scrum'

// ============================================
// INPUT SCHEMAS
// ============================================

const RetroStatusEnum = z.enum(['draft', 'in_progress', 'completed'])

const CreateRetroItemInput = z.object({
  sprintId: z.string().uuid(),
  category: z.enum(['went_well', 'to_improve']),
  text: z.string().min(1).max(500),
})

const CreateRetroActionItemInput = z.object({
  sprintId: z.string().uuid(),
  text: z.string().min(1).max(500),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
})

// ============================================
// ROUTER
// ============================================

export const retrospectivesRouter = router({
  // ============================================
  // GET RETRO FOR A SPRINT
  // ============================================
  get: orgProtectedProcedure
    .input(z.object({ sprintId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('sprint_retrospectives')
        .select('*')
        .eq('sprint_id', input.sprintId)
        .eq('org_id', ctx.orgId)
        .single()

      if (error) {
        // No retro yet is not an error
        return null
      }

      return transformRetro(data)
    }),

  // ============================================
  // CREATE OR INITIALIZE RETRO
  // ============================================
  create: orgProtectedProcedure
    .input(z.object({ sprintId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Check if retro already exists
      const { data: existing } = await adminClient
        .from('sprint_retrospectives')
        .select('id')
        .eq('sprint_id', input.sprintId)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Retrospective already exists for this sprint',
        })
      }

      // Get current user profile ID for participants
      const { data: profile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', ctx.user?.id)
        .single()

      const { data, error } = await adminClient
        .from('sprint_retrospectives')
        .insert({
          org_id: ctx.orgId,
          sprint_id: input.sprintId,
          participants: profile ? [profile.id] : [],
          status: 'draft',
        })
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to create retrospective',
        })
      }

      return transformRetro(data)
    }),

  // ============================================
  // START RETRO SESSION (draft -> in_progress)
  // ============================================
  start: orgProtectedProcedure
    .input(z.object({ sprintId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('sprint_retrospectives')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('sprint_id', input.sprintId)
        .eq('org_id', ctx.orgId)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to start retrospective',
        })
      }

      return transformRetro(data)
    }),

  // ============================================
  // COMPLETE RETRO (in_progress -> completed)
  // ============================================
  complete: orgProtectedProcedure
    .input(z.object({ sprintId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('sprint_retrospectives')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('sprint_id', input.sprintId)
        .eq('org_id', ctx.orgId)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to complete retrospective',
        })
      }

      // Update sprint to mark retro as completed
      await adminClient
        .from('sprints')
        .update({
          retro_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.sprintId)

      return transformRetro(data)
    }),

  // ============================================
  // ADD RETRO ITEM (went_well or to_improve)
  // ============================================
  addItem: orgProtectedProcedure
    .input(CreateRetroItemInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get current user profile
      const { data: profile } = await adminClient
        .from('user_profiles')
        .select('id, full_name')
        .eq('auth_id', ctx.user?.id)
        .single()

      // Get current retro
      const { data: retro, error: fetchError } = await adminClient
        .from('sprint_retrospectives')
        .select('*')
        .eq('sprint_id', input.sprintId)
        .eq('org_id', ctx.orgId)
        .single()

      if (fetchError || !retro) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retrospective not found',
        })
      }

      // Create new item
      const newItem: RetroItem = {
        id: crypto.randomUUID(),
        text: input.text,
        authorId: profile?.id || '',
        authorName: profile?.full_name || 'Anonymous',
        votes: 0,
        votedBy: [],
        createdAt: new Date().toISOString(),
      }

      // Add to appropriate array
      const field = input.category === 'went_well' ? 'went_well' : 'to_improve'
      const currentItems = (retro[field] as RetroItem[]) || []
      const updatedItems = [...currentItems, newItem]

      // Update participants if not already included
      let participants = (retro.participants as string[]) || []
      if (profile && !participants.includes(profile.id)) {
        participants = [...participants, profile.id]
      }

      const { data, error } = await adminClient
        .from('sprint_retrospectives')
        .update({
          [field]: updatedItems,
          participants,
          updated_at: new Date().toISOString(),
        })
        .eq('id', retro.id)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to add item',
        })
      }

      return {
        retro: transformRetro(data),
        newItem,
      }
    }),

  // ============================================
  // VOTE ON ITEM
  // ============================================
  voteItem: orgProtectedProcedure
    .input(z.object({
      sprintId: z.string().uuid(),
      itemId: z.string().uuid(),
      category: z.enum(['went_well', 'to_improve']),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get current user profile
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

      // Get current retro
      const { data: retro, error: fetchError } = await adminClient
        .from('sprint_retrospectives')
        .select('*')
        .eq('sprint_id', input.sprintId)
        .eq('org_id', ctx.orgId)
        .single()

      if (fetchError || !retro) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retrospective not found',
        })
      }

      const field = input.category === 'went_well' ? 'went_well' : 'to_improve'
      const items = (retro[field] as RetroItem[]) || []

      // Find and update the item
      const updatedItems = items.map((item: RetroItem) => {
        if (item.id === input.itemId) {
          // Toggle vote
          const hasVoted = item.votedBy.includes(profile.id)
          if (hasVoted) {
            return {
              ...item,
              votes: item.votes - 1,
              votedBy: item.votedBy.filter((id: string) => id !== profile.id),
            }
          } else {
            return {
              ...item,
              votes: item.votes + 1,
              votedBy: [...item.votedBy, profile.id],
            }
          }
        }
        return item
      })

      const { data, error } = await adminClient
        .from('sprint_retrospectives')
        .update({
          [field]: updatedItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', retro.id)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to vote',
        })
      }

      return transformRetro(data)
    }),

  // ============================================
  // DELETE RETRO ITEM
  // ============================================
  deleteItem: orgProtectedProcedure
    .input(z.object({
      sprintId: z.string().uuid(),
      itemId: z.string().uuid(),
      category: z.enum(['went_well', 'to_improve']),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get current retro
      const { data: retro, error: fetchError } = await adminClient
        .from('sprint_retrospectives')
        .select('*')
        .eq('sprint_id', input.sprintId)
        .eq('org_id', ctx.orgId)
        .single()

      if (fetchError || !retro) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retrospective not found',
        })
      }

      const field = input.category === 'went_well' ? 'went_well' : 'to_improve'
      const items = (retro[field] as RetroItem[]) || []
      const updatedItems = items.filter((item: RetroItem) => item.id !== input.itemId)

      const { data, error } = await adminClient
        .from('sprint_retrospectives')
        .update({
          [field]: updatedItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', retro.id)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to delete item',
        })
      }

      return transformRetro(data)
    }),

  // ============================================
  // ADD ACTION ITEM
  // ============================================
  addActionItem: orgProtectedProcedure
    .input(CreateRetroActionItemInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get assignee name if provided
      let assigneeName: string | undefined
      if (input.assigneeId) {
        const { data: assignee } = await adminClient
          .from('user_profiles')
          .select('full_name')
          .eq('id', input.assigneeId)
          .single()
        assigneeName = assignee?.full_name
      }

      // Get current retro
      const { data: retro, error: fetchError } = await adminClient
        .from('sprint_retrospectives')
        .select('*')
        .eq('sprint_id', input.sprintId)
        .eq('org_id', ctx.orgId)
        .single()

      if (fetchError || !retro) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retrospective not found',
        })
      }

      // Create new action item
      const newActionItem: RetroActionItem = {
        id: crypto.randomUUID(),
        text: input.text,
        assigneeId: input.assigneeId,
        assigneeName,
        completed: false,
        dueDate: input.dueDate,
        createdAt: new Date().toISOString(),
      }

      const currentActionItems = (retro.action_items as RetroActionItem[]) || []
      const updatedActionItems = [...currentActionItems, newActionItem]

      const { data, error } = await adminClient
        .from('sprint_retrospectives')
        .update({
          action_items: updatedActionItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', retro.id)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to add action item',
        })
      }

      return {
        retro: transformRetro(data),
        newActionItem,
      }
    }),

  // ============================================
  // TOGGLE ACTION ITEM COMPLETED
  // ============================================
  toggleActionItemCompleted: orgProtectedProcedure
    .input(z.object({
      sprintId: z.string().uuid(),
      actionItemId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get current retro
      const { data: retro, error: fetchError } = await adminClient
        .from('sprint_retrospectives')
        .select('*')
        .eq('sprint_id', input.sprintId)
        .eq('org_id', ctx.orgId)
        .single()

      if (fetchError || !retro) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retrospective not found',
        })
      }

      const actionItems = (retro.action_items as RetroActionItem[]) || []
      const updatedActionItems = actionItems.map((item: RetroActionItem) => {
        if (item.id === input.actionItemId) {
          return {
            ...item,
            completed: !item.completed,
            completedAt: !item.completed ? new Date().toISOString() : undefined,
          }
        }
        return item
      })

      const { data, error } = await adminClient
        .from('sprint_retrospectives')
        .update({
          action_items: updatedActionItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', retro.id)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to update action item',
        })
      }

      return transformRetro(data)
    }),

  // ============================================
  // DELETE ACTION ITEM
  // ============================================
  deleteActionItem: orgProtectedProcedure
    .input(z.object({
      sprintId: z.string().uuid(),
      actionItemId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get current retro
      const { data: retro, error: fetchError } = await adminClient
        .from('sprint_retrospectives')
        .select('*')
        .eq('sprint_id', input.sprintId)
        .eq('org_id', ctx.orgId)
        .single()

      if (fetchError || !retro) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retrospective not found',
        })
      }

      const actionItems = (retro.action_items as RetroActionItem[]) || []
      const updatedActionItems = actionItems.filter(
        (item: RetroActionItem) => item.id !== input.actionItemId
      )

      const { data, error } = await adminClient
        .from('sprint_retrospectives')
        .update({
          action_items: updatedActionItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', retro.id)
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to delete action item',
        })
      }

      return transformRetro(data)
    }),

  // ============================================
  // JOIN RETRO (add participant)
  // ============================================
  join: orgProtectedProcedure
    .input(z.object({ sprintId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get current user profile
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

      // Get current retro
      const { data: retro, error: fetchError } = await adminClient
        .from('sprint_retrospectives')
        .select('participants')
        .eq('sprint_id', input.sprintId)
        .eq('org_id', ctx.orgId)
        .single()

      if (fetchError || !retro) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retrospective not found',
        })
      }

      const participants = (retro.participants as string[]) || []
      if (participants.includes(profile.id)) {
        return { alreadyJoined: true }
      }

      const { error } = await adminClient
        .from('sprint_retrospectives')
        .update({
          participants: [...participants, profile.id],
          updated_at: new Date().toISOString(),
        })
        .eq('sprint_id', input.sprintId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { joined: true }
    }),

  // ============================================
  // GET PREVIOUS RETROS (for comparison)
  // ============================================
  getPrevious: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Get recent completed sprints for this pod
      const { data: sprints, error: sprintsError } = await adminClient
        .from('sprints')
        .select('id')
        .eq('org_id', ctx.orgId)
        .eq('pod_id', input.podId)
        .eq('status', 'completed')
        .is('deleted_at', null)
        .order('sprint_number', { ascending: false })
        .limit(input.limit)

      if (sprintsError || !sprints) {
        return []
      }

      const sprintIds = sprints.map(s => s.id)

      // Get retros for these sprints
      const { data: retros, error: retrosError } = await adminClient
        .from('sprint_retrospectives')
        .select(`
          *,
          sprint:sprints(id, sprint_number, name, start_date, end_date)
        `)
        .in('sprint_id', sprintIds)
        .eq('status', 'completed')

      if (retrosError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: retrosError.message,
        })
      }

      return (retros || []).map((r: Record<string, unknown>) => ({
        ...transformRetro(r),
        sprint: {
          id: (r.sprint as Record<string, unknown>)?.id,
          sprintNumber: (r.sprint as Record<string, unknown>)?.sprint_number,
          name: (r.sprint as Record<string, unknown>)?.name,
          startDate: (r.sprint as Record<string, unknown>)?.start_date,
          endDate: (r.sprint as Record<string, unknown>)?.end_date,
        },
      }))
    }),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformRetro(data: Record<string, unknown>): SprintRetrospective {
  return {
    id: data.id as string,
    orgId: data.org_id as string,
    sprintId: data.sprint_id as string,
    wentWell: (data.went_well as RetroItem[]) || [],
    toImprove: (data.to_improve as RetroItem[]) || [],
    actionItems: (data.action_items as RetroActionItem[]) || [],
    participants: (data.participants as string[]) || [],
    status: data.status as RetroStatus,
    completedAt: data.completed_at as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
