import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// WORKQUEUE ROUTER (Guidewire Pattern)
// ============================================

export const workqueueRouter = router({
  // ============================================
  // LIST ALL WORK QUEUES
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      isActive: z.boolean().default(true),
      entityType: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('work_queues')
        .select(`
          *,
          owner_group:teams!owner_group_id(id, name),
          _count:activities(count)
        `)
        .eq('org_id', orgId)
        .eq('is_active', input.isActive)
        .order('priority_order', { ascending: true })

      if (input.entityType) {
        query = query.contains('entity_types', [input.entityType])
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(q => ({
        id: q.id,
        name: q.name,
        code: q.code,
        description: q.description,
        assignmentType: q.assignment_type,
        priorityOrder: q.priority_order,
        escalationThresholdHours: q.escalation_threshold_hours,
        reminderThresholdHours: q.reminder_threshold_hours,
        isDefault: q.is_default,
        entityTypes: q.entity_types,
        ownerGroup: q.owner_group,
        activityCount: (q._count as Array<{count: number}>)?.[0]?.count ?? 0,
      })) ?? []
    }),

  // ============================================
  // GET ACTIVITIES IN A QUEUE
  // ============================================
  getActivities: orgProtectedProcedure
    .input(z.object({
      queueId: z.string().uuid(),
      status: z.array(z.enum(['open', 'in_progress', 'scheduled'])).default(['open', 'scheduled']),
      priority: z.array(z.enum(['low', 'normal', 'high', 'urgent'])).optional(),
      sortBy: z.enum(['due_date', 'priority', 'escalation_count', 'created_at']).default('due_date'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('activities')
        .select(`
          id, subject, description, activity_type, status, priority, due_date,
          entity_type, entity_id, created_at, escalation_count, last_escalated_at,
          pattern_code, snoozed_until,
          assigned_to_user:user_profiles!assigned_to(id, full_name, avatar_url),
          claimed_by_user:user_profiles!claimed_by(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .eq('queue_id', input.queueId)
        .in('status', input.status)
        .order(input.sortBy, { ascending: input.sortOrder === 'asc' })

      if (input.priority && input.priority.length > 0) {
        query = query.in('priority', input.priority)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      return {
        items: data?.map(a => ({
          id: a.id,
          subject: a.subject,
          description: a.description,
          activityType: a.activity_type,
          status: a.status,
          priority: a.priority,
          dueDate: a.due_date,
          entityType: a.entity_type,
          entityId: a.entity_id,
          createdAt: a.created_at,
          escalationCount: a.escalation_count,
          lastEscalatedAt: a.last_escalated_at,
          patternCode: a.pattern_code,
          snoozedUntil: a.snoozed_until,
          assignedTo: a.assigned_to_user,
          claimedBy: a.claimed_by_user,
          isOverdue: a.due_date ? new Date(a.due_date) < today : false,
          isEscalated: (a.escalation_count ?? 0) > 0,
          isSnoozed: a.snoozed_until ? new Date(a.snoozed_until) > now : false,
        })) ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // GET MY TEAM'S ACTIVITIES
  // ============================================
  getMyTeamActivities: orgProtectedProcedure
    .input(z.object({
      includeAssigned: z.boolean().default(true),
      includeUnassigned: z.boolean().default(true),
      status: z.array(z.enum(['open', 'in_progress', 'scheduled'])).default(['open', 'in_progress', 'scheduled']),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get queues the user is a member of
      const { data: memberships } = await adminClient
        .from('work_queue_members')
        .select('queue_id')
        .eq('user_id', user?.id)
        .eq('is_active', true)

      const queueIds = memberships?.map(m => m.queue_id) ?? []

      if (queueIds.length === 0) {
        return { items: [], total: 0 }
      }

      let query = adminClient
        .from('activities')
        .select(`
          id, subject, description, activity_type, status, priority, due_date,
          entity_type, entity_id, created_at, escalation_count, claimed_at,
          assigned_to_user:user_profiles!assigned_to(id, full_name, avatar_url),
          queue:work_queues!queue_id(id, name, code)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .in('queue_id', queueIds)
        .in('status', input.status)
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true })

      // Filter by assignment status
      if (!input.includeAssigned && input.includeUnassigned) {
        query = query.is('assigned_to', null)
      } else if (input.includeAssigned && !input.includeUnassigned) {
        query = query.not('assigned_to', 'is', null)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      return {
        items: data?.map(a => ({
          id: a.id,
          subject: a.subject,
          description: a.description,
          activityType: a.activity_type,
          status: a.status,
          priority: a.priority,
          dueDate: a.due_date,
          entityType: a.entity_type,
          entityId: a.entity_id,
          createdAt: a.created_at,
          escalationCount: a.escalation_count,
          claimedAt: a.claimed_at,
          assignedTo: a.assigned_to_user,
          queue: a.queue,
          isOverdue: a.due_date ? new Date(a.due_date) < today : false,
          isUnassigned: !a.assigned_to_user,
        })) ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // GET QUEUE STATS
  // ============================================
  getStats: orgProtectedProcedure
    .input(z.object({
      queueId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // If specific queue, get stats for that queue
      // If not, get stats for all queues user has access to
      let queueIds: string[] = []

      if (input.queueId) {
        queueIds = [input.queueId]
      } else {
        const { data: memberships } = await adminClient
          .from('work_queue_members')
          .select('queue_id')
          .eq('user_id', user?.id)
          .eq('is_active', true)

        queueIds = memberships?.map(m => m.queue_id) ?? []
      }

      if (queueIds.length === 0) {
        return {
          total: 0,
          unassigned: 0,
          overdue: 0,
          escalated: 0,
          dueToday: 0,
          myActivities: 0,
          byPriority: {},
          byStatus: {},
        }
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Get all activities in queues
      const { data: activities } = await adminClient
        .from('activities')
        .select('id, status, priority, due_date, assigned_to, escalation_count')
        .eq('org_id', orgId)
        .in('queue_id', queueIds)
        .in('status', ['open', 'in_progress', 'scheduled'])

      // Calculate stats
      const total = activities?.length ?? 0
      const unassigned = activities?.filter(a => !a.assigned_to).length ?? 0
      const overdue = activities?.filter(a => a.due_date && new Date(a.due_date) < today).length ?? 0
      const escalated = activities?.filter(a => (a.escalation_count ?? 0) > 0).length ?? 0
      const dueToday = activities?.filter(a => {
        if (!a.due_date) return false
        const dueDate = new Date(a.due_date)
        return dueDate >= today && dueDate < tomorrow
      }).length ?? 0
      const myActivities = activities?.filter(a => a.assigned_to === user?.id).length ?? 0

      // Count by priority
      const byPriority: Record<string, number> = {}
      activities?.forEach(a => {
        byPriority[a.priority] = (byPriority[a.priority] || 0) + 1
      })

      // Count by status
      const byStatus: Record<string, number> = {}
      activities?.forEach(a => {
        byStatus[a.status] = (byStatus[a.status] || 0) + 1
      })

      return {
        total,
        unassigned,
        overdue,
        escalated,
        dueToday,
        myActivities,
        byPriority,
        byStatus,
      }
    }),

  // ============================================
  // CREATE WORK QUEUE
  // ============================================
  create: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      code: z.string().min(1).max(50),
      description: z.string().max(500).optional(),
      ownerGroupId: z.string().uuid().optional(),
      assignmentType: z.enum(['manual', 'round_robin', 'load_balanced', 'skill_based']).default('manual'),
      escalationThresholdHours: z.number().min(1).max(168).default(24),
      reminderThresholdHours: z.number().min(1).max(48).default(4),
      entityTypes: z.array(z.string()).default([]),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      const { data: queue, error } = await supabase
        .from('work_queues')
        .insert({
          org_id: orgId,
          name: input.name,
          code: input.code,
          description: input.description,
          owner_group_id: input.ownerGroupId,
          assignment_type: input.assignmentType,
          escalation_threshold_hours: input.escalationThresholdHours,
          reminder_threshold_hours: input.reminderThresholdHours,
          entity_types: input.entityTypes,
          is_default: input.isDefault,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'A queue with this code already exists' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Add creator as owner
      await supabase
        .from('work_queue_members')
        .insert({
          queue_id: queue.id,
          user_id: user?.id,
          role: 'owner',
          can_claim: true,
          can_assign: true,
        })

      return {
        id: queue.id,
        name: queue.name,
        code: queue.code,
      }
    }),

  // ============================================
  // UPDATE WORK QUEUE
  // ============================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      ownerGroupId: z.string().uuid().nullable().optional(),
      assignmentType: z.enum(['manual', 'round_robin', 'load_balanced', 'skill_based']).optional(),
      escalationThresholdHours: z.number().min(1).max(168).optional(),
      reminderThresholdHours: z.number().min(1).max(48).optional(),
      entityTypes: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, supabase } = ctx

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (input.name !== undefined) updateData.name = input.name
      if (input.description !== undefined) updateData.description = input.description
      if (input.ownerGroupId !== undefined) updateData.owner_group_id = input.ownerGroupId
      if (input.assignmentType !== undefined) updateData.assignment_type = input.assignmentType
      if (input.escalationThresholdHours !== undefined) updateData.escalation_threshold_hours = input.escalationThresholdHours
      if (input.reminderThresholdHours !== undefined) updateData.reminder_threshold_hours = input.reminderThresholdHours
      if (input.entityTypes !== undefined) updateData.entity_types = input.entityTypes
      if (input.isActive !== undefined) updateData.is_active = input.isActive
      if (input.isDefault !== undefined) updateData.is_default = input.isDefault

      const { data: queue, error } = await supabase
        .from('work_queues')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: queue.id,
        name: queue.name,
      }
    }),

  // ============================================
  // ADD MEMBER TO QUEUE
  // ============================================
  addMember: orgProtectedProcedure
    .input(z.object({
      queueId: z.string().uuid(),
      userId: z.string().uuid(),
      role: z.enum(['owner', 'supervisor', 'member']).default('member'),
      canClaim: z.boolean().default(true),
      canAssign: z.boolean().default(false),
      maxActiveActivities: z.number().min(1).max(100).default(10),
      skills: z.array(z.string()).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, supabase } = ctx
      const adminClient = getAdminClient()

      // Verify queue belongs to org
      const { data: queue } = await adminClient
        .from('work_queues')
        .select('id')
        .eq('id', input.queueId)
        .eq('org_id', orgId)
        .single()

      if (!queue) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Queue not found' })
      }

      const { data: member, error } = await supabase
        .from('work_queue_members')
        .insert({
          queue_id: input.queueId,
          user_id: input.userId,
          role: input.role,
          can_claim: input.canClaim,
          can_assign: input.canAssign,
          max_active_activities: input.maxActiveActivities,
          skills: input.skills,
        })
        .select(`
          id, role, can_claim, can_assign, max_active_activities, skills,
          user:user_profiles!user_id(id, full_name, email, avatar_url)
        `)
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'User is already a member of this queue' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: member.id,
        role: member.role,
        user: member.user,
      }
    }),

  // ============================================
  // REMOVE MEMBER FROM QUEUE
  // ============================================
  removeMember: orgProtectedProcedure
    .input(z.object({
      queueId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, supabase } = ctx
      const adminClient = getAdminClient()

      // Verify queue belongs to org
      const { data: queue } = await adminClient
        .from('work_queues')
        .select('id')
        .eq('id', input.queueId)
        .eq('org_id', orgId)
        .single()

      if (!queue) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Queue not found' })
      }

      const { error } = await supabase
        .from('work_queue_members')
        .delete()
        .eq('queue_id', input.queueId)
        .eq('user_id', input.userId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ============================================
  // GET QUEUE MEMBERS
  // ============================================
  getMembers: orgProtectedProcedure
    .input(z.object({
      queueId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Verify queue belongs to org
      const { data: queue } = await adminClient
        .from('work_queues')
        .select('id')
        .eq('id', input.queueId)
        .eq('org_id', orgId)
        .single()

      if (!queue) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Queue not found' })
      }

      const { data: members, error } = await adminClient
        .from('work_queue_members')
        .select(`
          id, role, can_claim, can_assign, max_active_activities, current_load, skills, is_active,
          user:user_profiles!user_id(id, full_name, email, avatar_url)
        `)
        .eq('queue_id', input.queueId)
        .order('role', { ascending: true })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return members?.map(m => ({
        id: m.id,
        role: m.role,
        canClaim: m.can_claim,
        canAssign: m.can_assign,
        maxActiveActivities: m.max_active_activities,
        currentLoad: m.current_load,
        skills: m.skills,
        isActive: m.is_active,
        user: m.user,
        capacityUsed: m.max_active_activities > 0 
          ? Math.round((m.current_load / m.max_active_activities) * 100) 
          : 0,
      })) ?? []
    }),

  // ============================================
  // GET MY QUEUE MEMBERSHIPS
  // ============================================
  getMyMemberships: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('work_queue_members')
        .select(`
          id, role, can_claim, can_assign, max_active_activities, current_load,
          queue:work_queues!queue_id(id, name, code, description, is_active)
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Filter to queues that belong to user's org
      const memberships = data?.filter(m => {
        const queue = (Array.isArray(m.queue) ? m.queue[0] : m.queue) as { id: string; is_active: boolean } | null
        return queue?.is_active
      })

      return memberships?.map(m => ({
        id: m.id,
        role: m.role,
        canClaim: m.can_claim,
        canAssign: m.can_assign,
        maxActiveActivities: m.max_active_activities,
        currentLoad: m.current_load,
        queue: m.queue,
      })) ?? []
    }),
})







