import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'

// =====================================================
// SCHEMAS
// =====================================================

const employmentStatusSchema = z.enum(['onboarding', 'active', 'on_leave', 'terminated', 'all'])
const employmentTypeSchema = z.enum(['fte', 'contractor', 'intern', 'part_time', 'all'])
const sortFieldSchema = z.enum([
  'created_at',
  'hire_date',
  'employee_number',
  'job_title',
  'department',
  'status',
  'location',
])

// =====================================================
// HR ROUTER
// =====================================================

export const hrRouter = router({
  // =====================================================
  // EMPLOYEES NAMESPACE
  // =====================================================
  employees: router({
    // ============================================
    // LIST EMPLOYEES
    // ============================================
    list: orgProtectedProcedure
      .input(
        z.object({
          search: z.string().optional(),
          status: employmentStatusSchema.optional(),
          employmentType: employmentTypeSchema.optional(),
          department: z.string().optional(),
          managerId: z.string().uuid().optional(),
          podId: z.string().uuid().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
          sortBy: sortFieldSchema.default('created_at'),
          sortOrder: z.enum(['asc', 'desc']).default('desc'),
        })
      )
      .query(async ({ ctx, input }) => {
        const { supabase, orgId } = ctx
        const {
          search,
          status,
          employmentType,
          department,
          managerId,
          podId,
          limit,
          offset,
          sortBy,
          sortOrder,
        } = input

        let query = supabase
          .from('employees')
          .select(
            `
            *,
            user:user_profiles!employees_user_id_fkey(
              id,
              full_name,
              email,
              avatar_url,
              phone
            ),
            manager:employees!employees_manager_id_fkey(
              id,
              user_id,
              user:user_profiles!employees_user_id_fkey(
                id,
                full_name,
                avatar_url
              )
            )
          `,
            { count: 'exact' }
          )
          .eq('org_id', orgId)
          .is('deleted_at', null)

        // Apply filters
        if (search) {
          // Search in user_profiles table via RPC or join
          // For now, we search in job_title and department
          query = query.or(
            `job_title.ilike.%${search}%,department.ilike.%${search}%,employee_number.ilike.%${search}%`
          )
        }

        if (status && status !== 'all') {
          query = query.eq('status', status)
        }

        if (employmentType && employmentType !== 'all') {
          query = query.eq('employment_type', employmentType)
        }

        if (department) {
          query = query.eq('department', department)
        }

        if (managerId) {
          query = query.eq('manager_id', managerId)
        }

        // Sorting
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })

        // Pagination
        query = query.range(offset, offset + limit - 1)

        const { data, count, error } = await query

        if (error) {
          console.error('Failed to fetch employees:', error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch employees',
          })
        }

        // Transform to camelCase for frontend
        const items = (data ?? []).map((employee) => ({
          id: employee.id,
          userId: employee.user_id,
          employeeNumber: employee.employee_number,
          status: employee.status,
          employmentType: employee.employment_type,
          hireDate: employee.hire_date,
          terminationDate: employee.termination_date,
          department: employee.department,
          jobTitle: employee.job_title,
          location: employee.location,
          workMode: employee.work_mode,
          salaryType: employee.salary_type,
          salaryAmount: employee.salary_amount,
          currency: employee.currency,
          createdAt: employee.created_at,
          updatedAt: employee.updated_at,
          // Related data
          user: employee.user,
          manager: employee.manager,
        }))

        return {
          items,
          total: count ?? 0,
        }
      }),

    // ============================================
    // GET EMPLOYEE STATS
    // ============================================
    stats: orgProtectedProcedure.query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get all employees for this org
      const { data: employees, error } = await supabase
        .from('employees')
        .select('id, status, hire_date, department')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (error) {
        console.error('Failed to fetch employee stats:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch employee stats',
        })
      }

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const total = employees?.length ?? 0
      const active = employees?.filter((e) => e.status === 'active').length ?? 0
      const newThisMonth =
        employees?.filter((e) => {
          if (!e.hire_date) return false
          return new Date(e.hire_date) >= startOfMonth
        }).length ?? 0

      // Count by department
      const departmentCounts: Record<string, number> = {}
      employees?.forEach((e) => {
        if (e.department) {
          departmentCounts[e.department] = (departmentCounts[e.department] || 0) + 1
        }
      })

      return {
        total,
        active,
        newThisMonth,
        byDepartment: Object.keys(departmentCounts).length,
      }
    }),

    // ============================================
    // GET EMPLOYEE BY ID
    // ============================================
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { supabase, orgId } = ctx

        const { data: employee, error } = await supabase
          .from('employees')
          .select(
            `
            *,
            user:user_profiles!employees_user_id_fkey(
              id,
              full_name,
              email,
              avatar_url,
              phone
            ),
            manager:employees!employees_manager_id_fkey(
              id,
              user_id,
              user:user_profiles!employees_user_id_fkey(
                id,
                full_name,
                avatar_url
              )
            ),
            profile:employee_profiles(*)
          `
          )
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error || !employee) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Employee not found',
          })
        }

        return employee
      }),

    // ============================================
    // GET DEPARTMENTS (for filter dropdown)
    // ============================================
    getDepartments: orgProtectedProcedure.query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('employees')
        .select('department')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .not('department', 'is', null)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch departments',
        })
      }

      // Get unique departments
      const departments = [...new Set(data?.map((e) => e.department).filter(Boolean))]
      return departments.sort()
    }),

    // ============================================
    // GET MANAGERS (for filter dropdown)
    // ============================================
    getManagers: orgProtectedProcedure.query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get employees who are managers (have direct reports)
      const { data: managerIds, error: managerError } = await supabase
        .from('employees')
        .select('manager_id')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .not('manager_id', 'is', null)

      if (managerError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch managers',
        })
      }

      const uniqueManagerIds = [...new Set(managerIds?.map((e) => e.manager_id).filter(Boolean))]

      if (uniqueManagerIds.length === 0) {
        return []
      }

      const { data: managers, error } = await supabase
        .from('employees')
        .select(
          `
          id,
          user:user_profiles!employees_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `
        )
        .in('id', uniqueManagerIds)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch manager details',
        })
      }

      return managers ?? []
    }),
  }),
})
