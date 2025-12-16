import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'

// Input schemas
const podTypeSchema = z.enum(['recruiting', 'bench_sales', 'ta', 'hr', 'mixed'])
const podStatusSchema = z.enum(['active', 'inactive'])
const podSortFieldSchema = z.enum([
  'created_at',
  'name',
  'pod_type',
  'status',
])

export const podsRouter = router({
  // ============================================
  // GET POD STATS
  // ============================================
  stats: orgProtectedProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    // Get all pods with member counts
    const { data: pods, error } = await supabase
      .from('pods')
      .select(`
        id,
        status,
        pod_members(id, is_active)
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)

    if (error) {
      console.error('Failed to fetch pod stats:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch pod stats',
      })
    }

    type PodMember = { id: string; is_active: boolean }
    type PodWithMembers = { id: string; status: string; pod_members: PodMember[] }

    const total = pods?.length ?? 0
    const active = pods?.filter((p) => p.status === 'active').length ?? 0

    // Calculate total members and average size
    let totalMembers = 0
    pods?.forEach((pod) => {
      const activeMembers = (pod as PodWithMembers).pod_members?.filter((m) => m.is_active).length ?? 0
      totalMembers += activeMembers
    })
    const avgSize = total > 0 ? Math.round((totalMembers / total) * 10) / 10 : 0

    return {
      total,
      active,
      avgSize,
      totalMembers,
    }
  }),

  // ============================================
  // LIST PODS
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      podType: podTypeSchema.optional(),
      status: podStatusSchema.or(z.literal('all')).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      sortBy: podSortFieldSchema.default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      // Legacy pagination support
      page: z.number().optional(),
      pageSize: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx
      const { search, podType, status, sortBy, sortOrder } = input

      // Support both new (limit/offset) and legacy (page/pageSize) pagination
      const limit = input.limit ?? input.pageSize ?? 20
      const offset = input.offset ?? (input.page ? (input.page - 1) * limit : 0)

      let query = supabase
        .from('pods')
        .select(`
          *,
          manager:user_profiles!pods_manager_id_fkey(id, full_name, email, avatar_url),
          region:regions(id, name, code),
          members:pod_members(
            id,
            user:user_profiles(id, full_name, email, avatar_url),
            role,
            is_active
          )
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Apply filters
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }
      if (podType) {
        query = query.eq('pod_type', podType)
      }
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      // Sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Pagination
      query = query.range(offset, offset + limit - 1)

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch pods',
        })
      }

      // Transform data with computed fields
      type PodMember = { id: string; is_active: boolean }
      const items = (data ?? []).map((pod) => {
        const activeMembers = (pod.members as PodMember[])?.filter((m) => m.is_active).length ?? 0
        return {
          ...pod,
          memberCount: activeMembers,
          // CamelCase versions for frontend
          podType: pod.pod_type,
          createdAt: pod.created_at,
          updatedAt: pod.updated_at,
        }
      })

      return {
        items,
        total: count ?? 0,
        // Legacy pagination object for backward compatibility
        pagination: {
          total: count ?? 0,
          page: input.page ?? Math.floor(offset / limit) + 1,
          pageSize: limit,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      }
    }),

  // ============================================
  // GET POD BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: pod, error } = await supabase
        .from('pods')
        .select(`
          *,
          manager:user_profiles!pods_manager_id_fkey(id, full_name, email, avatar_url, role_id),
          region:regions(id, name, code),
          members:pod_members(
            id,
            user:user_profiles(id, full_name, email, avatar_url, role_id),
            role,
            is_active,
            joined_at
          ),
          created_by_user:user_profiles!pods_created_by_fkey(id, full_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !pod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found',
        })
      }

      return pod
    }),

  // ============================================
  // CREATE POD
  // ============================================
  create: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(2).max(100),
      description: z.string().optional(),
      podType: podTypeSchema,
      regionId: z.string().uuid().optional(),
      managerId: z.string().uuid(),
      memberIds: z.array(z.string().uuid()).optional(),
      sprintDurationWeeks: z.number().min(1).max(4).default(2),
      placementsPerSprintTarget: z.number().min(0).default(2),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Check for duplicate name
      const { data: existing } = await supabase
        .from('pods')
        .select('id')
        .eq('org_id', orgId)
        .eq('name', input.name)
        .is('deleted_at', null)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A pod with this name already exists',
        })
      }

      // Create pod
      const { data: pod, error: podError } = await supabase
        .from('pods')
        .insert({
          org_id: orgId,
          name: input.name,
          description: input.description,
          pod_type: input.podType,
          region_id: input.regionId,
          manager_id: input.managerId,
          sprint_duration_weeks: input.sprintDurationWeeks,
          placements_per_sprint_target: input.placementsPerSprintTarget,
          status: 'active',
          is_active: true,
          formed_date: new Date().toISOString().split('T')[0],
          created_by: user?.id,
        })
        .select()
        .single()

      if (podError || !pod) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create pod',
        })
      }

      // Add manager to pod_managers table
      await supabase
        .from('pod_managers')
        .insert({
          org_id: orgId,
          pod_id: pod.id,
          user_id: input.managerId,
          is_primary: true,
          assigned_by: user?.id,
        })

      // Add initial members if provided
      if (input.memberIds && input.memberIds.length > 0) {
        const memberInserts = input.memberIds.map(userId => ({
          org_id: orgId,
          pod_id: pod.id,
          user_id: userId,
          role: 'junior',
          is_active: true,
        }))

        await supabase.from('pod_members').insert(memberInserts)
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'pods',
        record_id: pod.id,
        new_values: pod,
      })

      return pod
    }),

  // ============================================
  // UPDATE POD
  // ============================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(2).max(100).optional(),
      description: z.string().optional(),
      podType: podTypeSchema.optional(),
      regionId: z.string().uuid().nullable().optional(),
      managerId: z.string().uuid().optional(),
      sprintDurationWeeks: z.number().min(1).max(4).optional(),
      placementsPerSprintTarget: z.number().min(0).optional(),
      sprintStartDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
      sendSprintSummary: z.boolean().optional(),
      sendMidpointCheck: z.boolean().optional(),
      alertIfBelowTarget: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const { id, managerId, ...updateData } = input

      // Get current pod
      const { data: currentPod, error: fetchError } = await supabase
        .from('pods')
        .select('*')
        .eq('id', id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !currentPod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found',
        })
      }

      // Check for duplicate name if name is being changed
      if (updateData.name && updateData.name !== currentPod.name) {
        const { data: existing } = await supabase
          .from('pods')
          .select('id')
          .eq('org_id', orgId)
          .eq('name', updateData.name)
          .neq('id', id)
          .is('deleted_at', null)
          .single()

        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'A pod with this name already exists',
          })
        }
      }

      // Build update object with snake_case keys
      const updates: Record<string, unknown> = {}
      if (updateData.name !== undefined) updates.name = updateData.name
      if (updateData.description !== undefined) updates.description = updateData.description
      if (updateData.podType !== undefined) updates.pod_type = updateData.podType
      if (updateData.regionId !== undefined) updates.region_id = updateData.regionId
      if (updateData.sprintDurationWeeks !== undefined) updates.sprint_duration_weeks = updateData.sprintDurationWeeks
      if (updateData.placementsPerSprintTarget !== undefined) updates.placements_per_sprint_target = updateData.placementsPerSprintTarget
      if (updateData.sprintStartDay !== undefined) updates.sprint_start_day = updateData.sprintStartDay
      if (updateData.sendSprintSummary !== undefined) updates.send_sprint_summary = updateData.sendSprintSummary
      if (updateData.sendMidpointCheck !== undefined) updates.send_midpoint_check = updateData.sendMidpointCheck
      if (updateData.alertIfBelowTarget !== undefined) updates.alert_if_below_target = updateData.alertIfBelowTarget

      // Handle manager change
      if (managerId && managerId !== currentPod.manager_id) {
        updates.manager_id = managerId

        // Mark old manager as removed in pod_managers
        await supabase
          .from('pod_managers')
          .update({
            removed_at: new Date().toISOString(),
            removed_by: user?.id,
          })
          .eq('pod_id', id)
          .eq('is_primary', true)
          .is('removed_at', null)

        // Add new manager to pod_managers
        await supabase.from('pod_managers').insert({
          org_id: orgId,
          pod_id: id,
          user_id: managerId,
          is_primary: true,
          assigned_by: user?.id,
        })
      }

      // Update pod
      const { data: pod, error: updateError } = await supabase
        .from('pods')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !pod) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update pod',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'pods',
        record_id: pod.id,
        old_values: currentPod,
        new_values: pod,
      })

      return pod
    }),

  // ============================================
  // ADD MEMBERS
  // ============================================
  addMembers: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
      members: z.array(z.object({
        userId: z.string().uuid(),
        role: z.enum(['senior', 'junior']).default('junior'),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Verify pod exists
      const { data: pod, error: podError } = await supabase
        .from('pods')
        .select('id')
        .eq('id', input.podId)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (podError || !pod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found',
        })
      }

      // Check for existing members
      const userIds = input.members.map(m => m.userId)
      const { data: existingMembers } = await supabase
        .from('pod_members')
        .select('user_id')
        .eq('pod_id', input.podId)
        .in('user_id', userIds)
        .eq('is_active', true)

      const existingUserIds = new Set(existingMembers?.map(m => m.user_id) ?? [])
      const newMembers = input.members.filter(m => !existingUserIds.has(m.userId))

      if (newMembers.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'All specified users are already members of this pod',
        })
      }

      // Insert new members
      const memberInserts = newMembers.map(member => ({
        org_id: orgId,
        pod_id: input.podId,
        user_id: member.userId,
        role: member.role,
        is_active: true,
      }))

      const { data: members, error: insertError } = await supabase
        .from('pod_members')
        .insert(memberInserts)
        .select()

      if (insertError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add members',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'add_members',
        table_name: 'pod_members',
        record_id: input.podId,
        new_values: { added_members: newMembers },
      })

      return { added: members?.length ?? 0, skipped: existingUserIds.size }
    }),

  // ============================================
  // REMOVE MEMBERS
  // ============================================
  removeMembers: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
      userIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Soft delete members (set is_active = false, left_at)
      const { data: removed, error } = await supabase
        .from('pod_members')
        .update({
          is_active: false,
          left_at: new Date().toISOString(),
        })
        .eq('pod_id', input.podId)
        .in('user_id', input.userIds)
        .eq('is_active', true)
        .select()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove members',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'remove_members',
        table_name: 'pod_members',
        record_id: input.podId,
        old_values: { removed_user_ids: input.userIds },
      })

      return { removed: removed?.length ?? 0 }
    }),

  // ============================================
  // TRANSFER MEMBERS
  // ============================================
  transferMembers: orgProtectedProcedure
    .input(z.object({
      fromPodId: z.string().uuid(),
      toPodId: z.string().uuid(),
      userIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Remove from source pod
      await supabase
        .from('pod_members')
        .update({
          is_active: false,
          left_at: new Date().toISOString(),
        })
        .eq('pod_id', input.fromPodId)
        .in('user_id', input.userIds)
        .eq('is_active', true)

      // Add to destination pod
      const memberInserts = input.userIds.map(userId => ({
        org_id: orgId,
        pod_id: input.toPodId,
        user_id: userId,
        role: 'junior',
        is_active: true,
      }))

      const { error } = await supabase
        .from('pod_members')
        .insert(memberInserts)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to transfer members',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'transfer_members',
        table_name: 'pod_members',
        record_id: input.fromPodId,
        new_values: {
          from_pod_id: input.fromPodId,
          to_pod_id: input.toPodId,
          transferred_user_ids: input.userIds,
        },
      })

      return { transferred: input.userIds.length }
    }),

  // ============================================
  // DEACTIVATE POD
  // ============================================
  deactivate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reassignToPodId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Get current pod with members
      const { data: pod, error: fetchError } = await supabase
        .from('pods')
        .select(`
          *,
          members:pod_members(user_id, is_active)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !pod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found',
        })
      }

      type PodMember = { user_id: string; is_active: boolean }
      const activeMembers = (pod.members as PodMember[])?.filter((m) => m.is_active) ?? []

      // If pod has active members and no reassignment target, error
      if (activeMembers.length > 0 && !input.reassignToPodId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Pod has ${activeMembers.length} active member(s). Please reassign them first or specify a pod to transfer them to.`,
        })
      }

      // Transfer members if reassignment target provided
      if (activeMembers.length > 0 && input.reassignToPodId) {
        const userIds = activeMembers.map((m) => m.user_id)

        // Remove from current pod
        await supabase
          .from('pod_members')
          .update({
            is_active: false,
            left_at: new Date().toISOString(),
          })
          .eq('pod_id', input.id)
          .eq('is_active', true)

        // Add to new pod
        const memberInserts = userIds.map((userId: string) => ({
          org_id: orgId,
          pod_id: input.reassignToPodId,
          user_id: userId,
          role: 'junior',
          is_active: true,
        }))

        await supabase.from('pod_members').insert(memberInserts)
      }

      // Deactivate pod
      const { data: updated, error: updateError } = await supabase
        .from('pods')
        .update({
          status: 'inactive',
          is_active: false,
          dissolved_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !updated) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to deactivate pod',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'deactivate',
        table_name: 'pods',
        record_id: input.id,
        old_values: pod,
        new_values: updated,
      })

      return updated
    }),

  // ============================================
  // REACTIVATE POD
  // ============================================
  reactivate: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data: pod, error } = await supabase
        .from('pods')
        .update({
          status: 'active',
          is_active: true,
          dissolved_date: null,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('status', 'inactive')
        .select()
        .single()

      if (error || !pod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found or not inactive',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'reactivate',
        table_name: 'pods',
        record_id: input.id,
        new_values: pod,
      })

      return pod
    }),

  // ============================================
  // GET POD METRICS
  // ============================================
  getMetrics: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
      period: z.enum(['current_sprint', 'mtd', 'qtd', 'ytd']).default('mtd'),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Get current sprint metrics if exists
      const { data: sprintMetrics } = await supabase
        .from('pod_sprint_metrics')
        .select('*')
        .eq('pod_id', input.podId)
        .eq('org_id', orgId)
        .eq('status', 'active')
        .order('sprint_number', { ascending: false })
        .limit(1)
        .single()

      // For now, return mock data for other metrics
      // TODO: Implement actual metrics aggregation from placements/submissions tables
      return {
        sprintMetrics: sprintMetrics ?? null,
        openJobs: 0,
        submissionsMtd: 0,
        placementsMtd: 0,
        revenueMtd: 0,
      }
    }),

  // ============================================
  // GET AVAILABLE USERS (for member selection)
  // ============================================
  getAvailableUsers: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      excludePodId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, role_id')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('full_name')

      if (input.search) {
        query = query.or(`full_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
      }

      const { data: users, error } = await query.limit(50)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        })
      }

      return users ?? []
    }),

  // ============================================
  // GET REGIONS (for pod region selection)
  // ============================================
  getRegions: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      const { data: regions, error } = await supabase
        .from('regions')
        .select('id, name, code')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch regions',
        })
      }

      return regions ?? []
    }),

  // ============================================
  // LIST WITH STATS (Consolidated for single DB call)
  // ============================================
  listWithStats: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      podType: podTypeSchema.optional(),
      status: podStatusSchema.or(z.literal('all')).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx
      const { search, podType, status, page, pageSize } = input
      const offset = (page - 1) * pageSize

      // Execute all queries in parallel
      const [podsResult, statsResult] = await Promise.all([
        // Pods list query
        (async () => {
          let query = supabase
            .from('pods')
            .select(`
              *,
              manager:user_profiles!pods_manager_id_fkey(id, full_name, email, avatar_url),
              region:regions(id, name, code),
              members:pod_members(
                id,
                user:user_profiles(id, full_name, email, avatar_url),
                role,
                is_active
              )
            `, { count: 'exact' })
            .eq('org_id', orgId)
            .is('deleted_at', null)

          if (search) {
            query = query.ilike('name', `%${search}%`)
          }
          if (podType) {
            query = query.eq('pod_type', podType)
          }
          if (status && status !== 'all') {
            query = query.eq('status', status)
          }

          query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + pageSize - 1)

          return query
        })(),

        // Stats aggregation
        supabase
          .from('pods')
          .select(`
            id,
            status,
            pod_members(id, is_active)
          `)
          .eq('org_id', orgId)
          .is('deleted_at', null),
      ])

      if (podsResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch pods',
        })
      }

      // Transform data
      type PodMember = { id: string; is_active: boolean }
      const items = (podsResult.data ?? []).map((pod) => {
        const activeMembers = (pod.members as PodMember[])?.filter((m) => m.is_active).length ?? 0
        return {
          ...pod,
          memberCount: activeMembers,
          podType: pod.pod_type,
          createdAt: pod.created_at,
          updatedAt: pod.updated_at,
        }
      })

      // Calculate stats
      type PodWithMembers = { id: string; status: string; pod_members: PodMember[] }
      const total = statsResult.data?.length ?? 0
      const active = statsResult.data?.filter((p) => p.status === 'active').length ?? 0

      let totalMembers = 0
      statsResult.data?.forEach((pod) => {
        const activeMembers = (pod as PodWithMembers).pod_members?.filter((m) => m.is_active).length ?? 0
        totalMembers += activeMembers
      })
      const avgSize = total > 0 ? Math.round((totalMembers / total) * 10) / 10 : 0

      return {
        items,
        pagination: {
          total: podsResult.count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((podsResult.count ?? 0) / pageSize),
        },
        stats: {
          total,
          active,
          avgSize,
          totalMembers,
        },
      }
    }),

  // ============================================
  // GET FULL POD (Consolidated for single DB call)
  // ============================================
  getFullPod: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Execute all queries in parallel
      const [podResult, metricsResult, activityResult] = await Promise.all([
        // Main pod data with relations
        supabase
          .from('pods')
          .select(`
            *,
            manager:user_profiles!pods_manager_id_fkey(id, full_name, email, avatar_url, role_id),
            region:regions(id, name, code),
            members:pod_members(
              id,
              user:user_profiles(id, full_name, email, avatar_url, role_id),
              role,
              is_active,
              joined_at
            ),
            created_by_user:user_profiles!pods_created_by_fkey(id, full_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single(),

        // Sprint metrics
        supabase
          .from('pod_sprint_metrics')
          .select('*')
          .eq('pod_id', input.id)
          .eq('org_id', orgId)
          .eq('status', 'active')
          .order('sprint_number', { ascending: false })
          .limit(1)
          .maybeSingle(),

        // Audit logs for this pod
        supabase
          .from('audit_logs')
          .select('*')
          .eq('org_id', orgId)
          .eq('table_name', 'pods')
          .eq('record_id', input.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      if (podResult.error || !podResult.data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found',
        })
      }

      return {
        ...podResult.data,
        sections: {
          metrics: {
            sprintMetrics: metricsResult.data ?? null,
            // TODO: Implement actual metrics aggregation from placements/submissions tables
            openJobs: 0,
            submissionsMtd: 0,
            placementsMtd: 0,
            revenueMtd: 0,
          },
          activity: {
            items: activityResult.data ?? [],
            total: activityResult.data?.length ?? 0,
          },
        },
      }
    }),
})
