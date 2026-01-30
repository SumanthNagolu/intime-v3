import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// =====================================================
// SCHEMAS
// =====================================================

const departmentStatusSchema = z.enum(['active', 'inactive', 'archived', 'all'])
const sortFieldSchema = z.enum([
  'created_at',
  'name',
  'code',
  'status',
  'headcount',
])

// =====================================================
// DEPARTMENTS ROUTER
// =====================================================

export const departmentsRouter = router({
  // ============================================
  // LIST DEPARTMENTS
  // ============================================
  list: orgProtectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: departmentStatusSchema.optional(),
        parentId: z.string().uuid().nullable().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        sortBy: sortFieldSchema.default('name'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()
      const { search, status, parentId, limit, offset, sortBy, sortOrder } = input

      let query = adminClient
        .from('departments')
        .select(
          `
          *,
          head:user_profiles!departments_head_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          ),
          parent:departments!departments_parent_id_fkey(
            id,
            name,
            code
          ),
          _count:employees(count)
        `,
          { count: 'exact' }
        )
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)
      }

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      if (parentId !== undefined) {
        if (parentId === null) {
          query = query.is('parent_id', null)
        } else {
          query = query.eq('parent_id', parentId)
        }
      }

      // Sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Pagination
      query = query.range(offset, offset + limit - 1)

      const { data, count, error } = await query

      if (error) {
        console.error('Failed to fetch departments:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch departments',
        })
      }

      // Transform to camelCase for frontend
      const items = (data ?? []).map((dept) => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        parentId: dept.parent_id,
        headId: dept.head_id,
        costCenterCode: dept.cost_center_code,
        budgetAmount: dept.budget_amount,
        status: dept.status,
        hierarchyLevel: dept.hierarchy_level,
        createdAt: dept.created_at,
        updatedAt: dept.updated_at,
        // Related data
        head: dept.head,
        parent: dept.parent,
        headcount: Array.isArray(dept._count) && dept._count[0]
          ? (dept._count[0] as { count: number }).count || 0
          : 0,
      }))

      return {
        items,
        total: count ?? 0,
      }
    }),

  // ============================================
  // GET DEPARTMENT STATS
  // ============================================
  stats: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx
    const adminClient = getAdminClient()

    // Get all departments with employee counts
    const { data: departments, error } = await adminClient
      .from('departments')
      .select(`
        id,
        status,
        employees(count)
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)

    if (error) {
      console.error('Failed to fetch department stats:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch department stats',
      })
    }

    const total = departments?.length ?? 0
    const active = departments?.filter((d) => d.status === 'active').length ?? 0

    // Calculate total employees across all departments
    let totalEmployees = 0
    departments?.forEach((dept) => {
      const count = Array.isArray(dept.employees) && dept.employees[0]
        ? (dept.employees[0] as { count: number }).count || 0
        : 0
      totalEmployees += count
    })

    const avgSize = total > 0 ? Math.round((totalEmployees / total) * 10) / 10 : 0

    return {
      total,
      active,
      totalEmployees,
      avgSize,
    }
  }),

  // ============================================
  // GET DEPARTMENT BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: department, error } = await supabase
        .from('departments')
        .select(
          `
          *,
          head:user_profiles!departments_head_id_fkey(
            id,
            full_name,
            email,
            avatar_url,
            role_id
          ),
          parent:departments!departments_parent_id_fkey(
            id,
            name,
            code
          ),
          children:departments!departments_parent_id_fkey(
            id,
            name,
            code,
            status
          ),
          created_by_user:user_profiles!departments_created_by_fkey(id, full_name)
        `
        )
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !department) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Department not found',
        })
      }

      return department
    }),

  // ============================================
  // GET FULL DEPARTMENT (ONE DB CALL pattern)
  // ============================================
  getFullDepartment: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Execute all queries in parallel
      const [deptResult, employeesResult, positionsResult, childrenResult, activityResult] = await Promise.all([
        // Main department data with relations
        supabase
          .from('departments')
          .select(`
            *,
            head:user_profiles!departments_head_id_fkey(
              id,
              full_name,
              email,
              avatar_url,
              role_id
            ),
            parent:departments!departments_parent_id_fkey(
              id,
              name,
              code
            ),
            created_by_user:user_profiles!departments_created_by_fkey(id, full_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single(),

        // Employees in this department
        supabase
          .from('employees')
          .select(`
            id,
            job_title,
            status,
            user:user_profiles!employees_user_id_fkey(
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .eq('department_id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(50),

        // Positions in this department
        supabase
          .from('positions')
          .select('*')
          .eq('department_id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('title', { ascending: true }),

        // Child departments
        supabase
          .from('departments')
          .select(`
            id,
            name,
            code,
            status,
            employees(count)
          `)
          .eq('parent_id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('name', { ascending: true }),

        // Audit logs for this department
        supabase
          .from('audit_logs')
          .select('*')
          .eq('org_id', orgId)
          .eq('table_name', 'departments')
          .eq('record_id', input.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      if (deptResult.error || !deptResult.data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Department not found',
        })
      }

      return {
        ...deptResult.data,
        sections: {
          employees: {
            items: employeesResult.data ?? [],
            total: employeesResult.data?.length ?? 0,
          },
          positions: {
            items: positionsResult.data ?? [],
            total: positionsResult.data?.length ?? 0,
          },
          children: {
            items: (childrenResult.data ?? []).map((child) => ({
              ...child,
              headcount: Array.isArray(child.employees) && child.employees[0]
                ? (child.employees[0] as { count: number }).count || 0
                : 0,
            })),
            total: childrenResult.data?.length ?? 0,
          },
          activity: {
            items: activityResult.data ?? [],
            total: activityResult.data?.length ?? 0,
          },
        },
      }
    }),

  // ============================================
  // GET DEPARTMENT TREE (for org chart)
  // ============================================
  getTree: orgProtectedProcedure
    .input(z.object({
      includeEmployees: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: departments, error } = await adminClient
        .from('departments')
        .select(`
          id,
          name,
          code,
          parent_id,
          hierarchy_level,
          status,
          head:user_profiles!departments_head_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          employees(count)
        `)
        .eq('org_id', orgId)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('hierarchy_level', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Transform to tree structure
      const deptMap = new Map<string, typeof departments[0] & { children: unknown[] }>()
      const roots: (typeof departments[0] & { children: unknown[] })[] = []

      // First pass: create map of all departments
      departments?.forEach((dept) => {
        deptMap.set(dept.id, {
          ...dept,
          headcount: Array.isArray(dept.employees) && dept.employees[0]
            ? (dept.employees[0] as { count: number }).count || 0
            : 0,
          children: [],
        })
      })

      // Second pass: build tree
      departments?.forEach((dept) => {
        const node = deptMap.get(dept.id)!
        if (dept.parent_id && deptMap.has(dept.parent_id)) {
          deptMap.get(dept.parent_id)!.children.push(node)
        } else {
          roots.push(node)
        }
      })

      return { tree: roots, flat: departments ?? [] }
    }),

  // ============================================
  // CREATE DEPARTMENT
  // ============================================
  create: orgProtectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(200),
        code: z.string().max(50).optional(),
        description: z.string().optional(),
        parentId: z.string().uuid().optional(),
        headId: z.string().uuid().optional(),
        costCenterCode: z.string().max(50).optional(),
        budgetAmount: z.number().optional(),
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

      // Check for duplicate name
      const { data: existing } = await adminClient
        .from('departments')
        .select('id')
        .eq('org_id', orgId)
        .eq('name', input.name)
        .is('deleted_at', null)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A department with this name already exists',
        })
      }

      // Determine hierarchy level
      let hierarchyLevel = 0
      if (input.parentId) {
        const { data: parent } = await adminClient
          .from('departments')
          .select('hierarchy_level')
          .eq('id', input.parentId)
          .single()
        hierarchyLevel = (parent?.hierarchy_level ?? 0) + 1
      }

      // Create department
      const { data: department, error } = await adminClient
        .from('departments')
        .insert({
          org_id: orgId,
          name: input.name,
          code: input.code,
          description: input.description,
          parent_id: input.parentId,
          head_id: input.headId,
          cost_center_code: input.costCenterCode,
          budget_amount: input.budgetAmount,
          hierarchy_level: hierarchyLevel,
          status: 'active',
          created_by: userProfileId,
          updated_by: userProfileId,
        })
        .select()
        .single()

      if (error || !department) {
        console.error('Failed to create department:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create department',
        })
      }

      // Create audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: userProfileId,
        user_email: user?.email,
        action: 'create',
        table_name: 'departments',
        record_id: department.id,
        new_values: department,
      })

      return department
    }),

  // ============================================
  // UPDATE DEPARTMENT
  // ============================================
  update: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(200).optional(),
        code: z.string().max(50).nullable().optional(),
        description: z.string().nullable().optional(),
        parentId: z.string().uuid().nullable().optional(),
        headId: z.string().uuid().nullable().optional(),
        costCenterCode: z.string().max(50).nullable().optional(),
        budgetAmount: z.number().nullable().optional(),
        status: z.enum(['active', 'inactive', 'archived']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const { id, ...updateData } = input

      // Get current department
      const { data: currentDept, error: fetchError } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !currentDept) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Department not found',
        })
      }

      // Check for duplicate name if name is being changed
      if (updateData.name && updateData.name !== currentDept.name) {
        const { data: existing } = await supabase
          .from('departments')
          .select('id')
          .eq('org_id', orgId)
          .eq('name', updateData.name)
          .neq('id', id)
          .is('deleted_at', null)
          .single()

        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'A department with this name already exists',
          })
        }
      }

      // Build update object with snake_case keys
      const updates: Record<string, unknown> = { updated_by: user?.id }
      if (updateData.name !== undefined) updates.name = updateData.name
      if (updateData.code !== undefined) updates.code = updateData.code
      if (updateData.description !== undefined) updates.description = updateData.description
      if (updateData.parentId !== undefined) updates.parent_id = updateData.parentId
      if (updateData.headId !== undefined) updates.head_id = updateData.headId
      if (updateData.costCenterCode !== undefined) updates.cost_center_code = updateData.costCenterCode
      if (updateData.budgetAmount !== undefined) updates.budget_amount = updateData.budgetAmount
      if (updateData.status !== undefined) updates.status = updateData.status

      // Update hierarchy level if parent changed
      if (updateData.parentId !== undefined && updateData.parentId !== currentDept.parent_id) {
        if (updateData.parentId === null) {
          updates.hierarchy_level = 0
        } else {
          const { data: parent } = await supabase
            .from('departments')
            .select('hierarchy_level')
            .eq('id', updateData.parentId)
            .single()
          updates.hierarchy_level = (parent?.hierarchy_level ?? 0) + 1
        }
      }

      // Update department
      const { data: department, error: updateError } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !department) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update department',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'departments',
        record_id: id,
        old_values: currentDept,
        new_values: department,
      })

      return department
    }),

  // ============================================
  // DELETE DEPARTMENT (soft delete)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Check for child departments
      const { data: children } = await supabase
        .from('departments')
        .select('id')
        .eq('parent_id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .limit(1)

      if (children && children.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete department with child departments. Please reassign or delete them first.',
        })
      }

      // Check for employees
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('department_id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .limit(1)

      if (employees && employees.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete department with employees. Please reassign them first.',
        })
      }

      // Soft delete
      const { error } = await supabase
        .from('departments')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (error) {
        console.error('Failed to delete department:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete department',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'delete',
        table_name: 'departments',
        record_id: input.id,
      })

      return { success: true }
    }),

  // ============================================
  // MOVE DEPARTMENT (change parent)
  // ============================================
  move: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        newParentId: z.string().uuid().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Prevent moving to self or descendant
      if (input.newParentId) {
        // Check if new parent is a descendant of the department being moved
        const { data: descendants } = await supabase
          .from('departments')
          .select('id')
          .eq('org_id', orgId)
          .is('deleted_at', null)

        // For now, just prevent moving to self
        if (input.newParentId === input.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot move department to itself',
          })
        }
      }

      // Calculate new hierarchy level
      let hierarchyLevel = 0
      if (input.newParentId) {
        const { data: parent } = await supabase
          .from('departments')
          .select('hierarchy_level')
          .eq('id', input.newParentId)
          .single()
        hierarchyLevel = (parent?.hierarchy_level ?? 0) + 1
      }

      // Update department
      const { data: department, error } = await supabase
        .from('departments')
        .update({
          parent_id: input.newParentId,
          hierarchy_level: hierarchyLevel,
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .select()
        .single()

      if (error || !department) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to move department',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'move',
        table_name: 'departments',
        record_id: input.id,
        new_values: { parent_id: input.newParentId },
      })

      return department
    }),

  // ============================================
  // LIST WITH STATS (Consolidated for single DB call)
  // ============================================
  listWithStats: orgProtectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: departmentStatusSchema.optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()
      const { search, status, page, pageSize } = input
      const offset = (page - 1) * pageSize

      // Execute all queries in parallel
      const [deptsResult, statsResult] = await Promise.all([
        // Departments list query
        (async () => {
          let query = adminClient
            .from('departments')
            .select(
              `
              *,
              head:user_profiles!departments_head_id_fkey(id, full_name, email, avatar_url),
              parent:departments!departments_parent_id_fkey(id, name, code),
              employees(count)
            `,
              { count: 'exact' }
            )
            .eq('org_id', orgId)
            .is('deleted_at', null)

          if (search) {
            query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)
          }
          if (status && status !== 'all') {
            query = query.eq('status', status)
          }

          query = query
            .order('name', { ascending: true })
            .range(offset, offset + pageSize - 1)

          return query
        })(),

        // Stats aggregation
        adminClient
          .from('departments')
          .select(`id, status, employees(count)`)
          .eq('org_id', orgId)
          .is('deleted_at', null),
      ])

      if (deptsResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch departments',
        })
      }

      // Transform data
      const items = (deptsResult.data ?? []).map((dept) => ({
        ...dept,
        headcount: Array.isArray(dept.employees) && dept.employees[0]
          ? (dept.employees[0] as { count: number }).count || 0
          : 0,
        parentId: dept.parent_id,
        headId: dept.head_id,
        costCenterCode: dept.cost_center_code,
        budgetAmount: dept.budget_amount,
        hierarchyLevel: dept.hierarchy_level,
        createdAt: dept.created_at,
        updatedAt: dept.updated_at,
      }))

      // Calculate stats
      const total = statsResult.data?.length ?? 0
      const active = statsResult.data?.filter((d) => d.status === 'active').length ?? 0

      let totalEmployees = 0
      statsResult.data?.forEach((dept) => {
        const count = Array.isArray(dept.employees) && dept.employees[0]
          ? (dept.employees[0] as { count: number }).count || 0
          : 0
        totalEmployees += count
      })
      const avgSize = total > 0 ? Math.round((totalEmployees / total) * 10) / 10 : 0

      return {
        items,
        pagination: {
          total: deptsResult.count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((deptsResult.count ?? 0) / pageSize),
        },
        stats: {
          total,
          active,
          totalEmployees,
          avgSize,
        },
      }
    }),
})
