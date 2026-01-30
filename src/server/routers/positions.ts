import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// =====================================================
// SCHEMAS
// =====================================================

const positionStatusSchema = z.enum(['open', 'filled', 'frozen', 'closed', 'all'])
const sortFieldSchema = z.enum([
  'created_at',
  'title',
  'level',
  'status',
  'salary_band_min',
])

// =====================================================
// POSITIONS ROUTER
// =====================================================

export const positionsRouter = router({
  // ============================================
  // LIST POSITIONS
  // ============================================
  list: orgProtectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: positionStatusSchema.optional(),
        departmentId: z.string().uuid().optional(),
        level: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        sortBy: sortFieldSchema.default('title'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()
      const { search, status, departmentId, level, limit, offset, sortBy, sortOrder } = input

      let query = adminClient
        .from('positions')
        .select(
          `
          *,
          department:departments(
            id,
            name,
            code
          ),
          _filled_count:employees(count)
        `,
          { count: 'exact' }
        )
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,code.ilike.%${search}%`)
      }

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      if (departmentId) {
        query = query.eq('department_id', departmentId)
      }

      if (level) {
        query = query.eq('level', level)
      }

      // Sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Pagination
      query = query.range(offset, offset + limit - 1)

      const { data, count, error } = await query

      if (error) {
        console.error('Failed to fetch positions:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch positions',
        })
      }

      // Transform to camelCase for frontend
      const items = (data ?? []).map((pos) => ({
        id: pos.id,
        title: pos.title,
        code: pos.code,
        description: pos.description,
        departmentId: pos.department_id,
        level: pos.level,
        salaryBandMin: pos.salary_band_min,
        salaryBandMid: pos.salary_band_mid,
        salaryBandMax: pos.salary_band_max,
        headcountBudget: pos.headcount_budget,
        status: pos.status,
        createdAt: pos.created_at,
        updatedAt: pos.updated_at,
        // Related data
        department: pos.department,
        filledCount: Array.isArray(pos._filled_count) && pos._filled_count[0]
          ? (pos._filled_count[0] as { count: number }).count || 0
          : 0,
      }))

      return {
        items,
        total: count ?? 0,
      }
    }),

  // ============================================
  // GET POSITION STATS
  // ============================================
  stats: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx
    const adminClient = getAdminClient()

    // Get all positions with employee counts
    const { data: positions, error } = await adminClient
      .from('positions')
      .select(`
        id,
        status,
        headcount_budget,
        employees(count)
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)

    if (error) {
      console.error('Failed to fetch position stats:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch position stats',
      })
    }

    const total = positions?.length ?? 0
    const open = positions?.filter((p) => p.status === 'open').length ?? 0
    const filled = positions?.filter((p) => p.status === 'filled').length ?? 0
    const frozen = positions?.filter((p) => p.status === 'frozen').length ?? 0

    // Calculate vacancy
    let totalBudget = 0
    let totalFilled = 0
    positions?.forEach((pos) => {
      totalBudget += pos.headcount_budget || 0
      const filledCount = Array.isArray(pos.employees) && pos.employees[0]
        ? (pos.employees[0] as { count: number }).count || 0
        : 0
      totalFilled += filledCount
    })
    const vacancies = totalBudget - totalFilled

    return {
      total,
      open,
      filled,
      frozen,
      totalBudget,
      totalFilled,
      vacancies,
    }
  }),

  // ============================================
  // GET POSITION BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: position, error } = await supabase
        .from('positions')
        .select(
          `
          *,
          department:departments(
            id,
            name,
            code,
            head:user_profiles!departments_head_id_fkey(id, full_name, avatar_url)
          ),
          created_by_user:user_profiles!positions_created_by_fkey(id, full_name)
        `
        )
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !position) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Position not found',
        })
      }

      return position
    }),

  // ============================================
  // GET FULL POSITION (ONE DB CALL pattern)
  // ============================================
  getFullPosition: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Execute all queries in parallel
      const [posResult, employeesResult, activityResult] = await Promise.all([
        // Main position data with relations
        supabase
          .from('positions')
          .select(`
            *,
            department:departments(
              id,
              name,
              code,
              head:user_profiles!departments_head_id_fkey(id, full_name, avatar_url)
            ),
            created_by_user:user_profiles!positions_created_by_fkey(id, full_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single(),

        // Employees in this position
        supabase
          .from('employees')
          .select(`
            id,
            job_title,
            status,
            hire_date,
            user:user_profiles!employees_user_id_fkey(
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .eq('position_id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('hire_date', { ascending: false }),

        // Audit logs for this position
        supabase
          .from('audit_logs')
          .select('*')
          .eq('org_id', orgId)
          .eq('table_name', 'positions')
          .eq('record_id', input.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      if (posResult.error || !posResult.data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Position not found',
        })
      }

      return {
        ...posResult.data,
        sections: {
          employees: {
            items: employeesResult.data ?? [],
            total: employeesResult.data?.length ?? 0,
          },
          activity: {
            items: activityResult.data ?? [],
            total: activityResult.data?.length ?? 0,
          },
        },
      }
    }),

  // ============================================
  // GET POSITIONS BY DEPARTMENT
  // ============================================
  getByDepartment: orgProtectedProcedure
    .input(z.object({ departmentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: positions, error } = await supabase
        .from('positions')
        .select(`
          *,
          employees(count)
        `)
        .eq('department_id', input.departmentId)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .order('title', { ascending: true })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch positions',
        })
      }

      return (positions ?? []).map((pos) => ({
        ...pos,
        filledCount: Array.isArray(pos.employees) && pos.employees[0]
          ? (pos.employees[0] as { count: number }).count || 0
          : 0,
      }))
    }),

  // ============================================
  // CREATE POSITION
  // ============================================
  create: orgProtectedProcedure
    .input(
      z.object({
        title: z.string().min(2).max(200),
        code: z.string().max(50).optional(),
        description: z.string().optional(),
        departmentId: z.string().uuid(),
        level: z.string().max(50).optional(),
        salaryBandMin: z.number().optional(),
        salaryBandMid: z.number().optional(),
        salaryBandMax: z.number().optional(),
        headcountBudget: z.number().int().min(0).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get user profile ID
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Verify department exists
      const { data: department } = await adminClient
        .from('departments')
        .select('id')
        .eq('id', input.departmentId)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!department) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Department not found',
        })
      }

      // Create position
      const { data: position, error } = await adminClient
        .from('positions')
        .insert({
          org_id: orgId,
          title: input.title,
          code: input.code,
          description: input.description,
          department_id: input.departmentId,
          level: input.level,
          salary_band_min: input.salaryBandMin,
          salary_band_mid: input.salaryBandMid,
          salary_band_max: input.salaryBandMax,
          headcount_budget: input.headcountBudget,
          status: 'open',
          created_by: userProfileId,
          updated_by: userProfileId,
        })
        .select()
        .single()

      if (error || !position) {
        console.error('Failed to create position:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create position',
        })
      }

      // Create audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: userProfileId,
        user_email: user?.email,
        action: 'create',
        table_name: 'positions',
        record_id: position.id,
        new_values: position,
      })

      return position
    }),

  // ============================================
  // UPDATE POSITION
  // ============================================
  update: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(2).max(200).optional(),
        code: z.string().max(50).nullable().optional(),
        description: z.string().nullable().optional(),
        departmentId: z.string().uuid().optional(),
        level: z.string().max(50).nullable().optional(),
        salaryBandMin: z.number().nullable().optional(),
        salaryBandMid: z.number().nullable().optional(),
        salaryBandMax: z.number().nullable().optional(),
        headcountBudget: z.number().int().min(0).optional(),
        status: z.enum(['open', 'filled', 'frozen', 'closed']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const { id, ...updateData } = input

      // Get current position
      const { data: currentPos, error: fetchError } = await supabase
        .from('positions')
        .select('*')
        .eq('id', id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !currentPos) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Position not found',
        })
      }

      // Build update object with snake_case keys
      const updates: Record<string, unknown> = { updated_by: user?.id }
      if (updateData.title !== undefined) updates.title = updateData.title
      if (updateData.code !== undefined) updates.code = updateData.code
      if (updateData.description !== undefined) updates.description = updateData.description
      if (updateData.departmentId !== undefined) updates.department_id = updateData.departmentId
      if (updateData.level !== undefined) updates.level = updateData.level
      if (updateData.salaryBandMin !== undefined) updates.salary_band_min = updateData.salaryBandMin
      if (updateData.salaryBandMid !== undefined) updates.salary_band_mid = updateData.salaryBandMid
      if (updateData.salaryBandMax !== undefined) updates.salary_band_max = updateData.salaryBandMax
      if (updateData.headcountBudget !== undefined) updates.headcount_budget = updateData.headcountBudget
      if (updateData.status !== undefined) updates.status = updateData.status

      // Update position
      const { data: position, error: updateError } = await supabase
        .from('positions')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !position) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update position',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'positions',
        record_id: id,
        old_values: currentPos,
        new_values: position,
      })

      return position
    }),

  // ============================================
  // DELETE POSITION (soft delete)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Check for employees in this position
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('position_id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .limit(1)

      if (employees && employees.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete position with employees. Please reassign them first.',
        })
      }

      // Soft delete
      const { error } = await supabase
        .from('positions')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (error) {
        console.error('Failed to delete position:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete position',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'delete',
        table_name: 'positions',
        record_id: input.id,
      })

      return { success: true }
    }),

  // ============================================
  // GET LEVELS (for filter dropdown)
  // ============================================
  getLevels: orgProtectedProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    const { data, error } = await supabase
      .from('positions')
      .select('level')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .not('level', 'is', null)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch levels',
      })
    }

    // Get unique levels
    const levels = [...new Set(data?.map((p) => p.level).filter(Boolean) as string[])]
    return levels.sort()
  }),

  // ============================================
  // LIST WITH STATS (Consolidated for single DB call)
  // ============================================
  listWithStats: orgProtectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: positionStatusSchema.optional(),
        departmentId: z.string().uuid().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()
      const { search, status, departmentId, page, pageSize } = input
      const offset = (page - 1) * pageSize

      // Execute all queries in parallel
      const [positionsResult, statsResult] = await Promise.all([
        // Positions list query
        (async () => {
          let query = adminClient
            .from('positions')
            .select(
              `
              *,
              department:departments(id, name, code),
              employees(count)
            `,
              { count: 'exact' }
            )
            .eq('org_id', orgId)
            .is('deleted_at', null)

          if (search) {
            query = query.or(`title.ilike.%${search}%,code.ilike.%${search}%`)
          }
          if (status && status !== 'all') {
            query = query.eq('status', status)
          }
          if (departmentId) {
            query = query.eq('department_id', departmentId)
          }

          query = query
            .order('title', { ascending: true })
            .range(offset, offset + pageSize - 1)

          return query
        })(),

        // Stats aggregation
        adminClient
          .from('positions')
          .select(`id, status, headcount_budget, employees(count)`)
          .eq('org_id', orgId)
          .is('deleted_at', null),
      ])

      if (positionsResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch positions',
        })
      }

      // Transform data
      const items = (positionsResult.data ?? []).map((pos) => ({
        ...pos,
        filledCount: Array.isArray(pos.employees) && pos.employees[0]
          ? (pos.employees[0] as { count: number }).count || 0
          : 0,
        departmentId: pos.department_id,
        salaryBandMin: pos.salary_band_min,
        salaryBandMid: pos.salary_band_mid,
        salaryBandMax: pos.salary_band_max,
        headcountBudget: pos.headcount_budget,
        createdAt: pos.created_at,
        updatedAt: pos.updated_at,
      }))

      // Calculate stats
      const total = statsResult.data?.length ?? 0
      const open = statsResult.data?.filter((p) => p.status === 'open').length ?? 0
      const filled = statsResult.data?.filter((p) => p.status === 'filled').length ?? 0
      const frozen = statsResult.data?.filter((p) => p.status === 'frozen').length ?? 0

      let totalBudget = 0
      let totalFilled = 0
      statsResult.data?.forEach((pos) => {
        totalBudget += pos.headcount_budget || 0
        const filledCount = Array.isArray(pos.employees) && pos.employees[0]
          ? (pos.employees[0] as { count: number }).count || 0
          : 0
        totalFilled += filledCount
      })
      const vacancies = totalBudget - totalFilled

      return {
        items,
        pagination: {
          total: positionsResult.count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((positionsResult.count ?? 0) / pageSize),
        },
        stats: {
          total,
          open,
          filled,
          frozen,
          totalBudget,
          totalFilled,
          vacancies,
        },
      }
    }),
})
