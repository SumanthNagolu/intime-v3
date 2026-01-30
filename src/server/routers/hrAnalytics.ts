/**
 * HR Analytics Router
 * Dashboards, metrics, and reporting for HR data
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

export const hrAnalyticsRouter = router({
  // ============ HEADCOUNT ============

  headcount: router({
    current: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('employees')
        .select('id, status, employment_type, department, department_id, hire_date')
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const employees = data ?? []
      const active = employees.filter(e => e.status === 'active')
      const byType = active.reduce((acc, e) => {
        acc[e.employment_type] = (acc[e.employment_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // New hires in last 30/90 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const newHires30 = employees.filter(e => e.hire_date >= thirtyDaysAgo).length
      const newHires90 = employees.filter(e => e.hire_date >= ninetyDaysAgo).length

      return {
        total: employees.length,
        active: active.length,
        onboarding: employees.filter(e => e.status === 'onboarding').length,
        onLeave: employees.filter(e => e.status === 'on_leave').length,
        terminated: employees.filter(e => e.status === 'terminated').length,
        byType,
        newHires30,
        newHires90,
      }
    }),

    trend: orgProtectedProcedure
      .input(z.object({
        months: z.number().min(1).max(24).default(12),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('employees')
          .select('hire_date, termination_date, status')
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        const employees = data ?? []

        // Generate monthly data points
        const today = new Date()
        const months: { month: string; headcount: number; hires: number; terminations: number }[] = []

        for (let i = input.months - 1; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          const monthStr = date.toISOString().slice(0, 7)

          // Count employees active at month end
          const headcount = employees.filter(e => {
            const hireDate = new Date(e.hire_date)
            const termDate = e.termination_date ? new Date(e.termination_date) : null
            return hireDate <= monthEnd && (!termDate || termDate > monthEnd)
          }).length

          // Hires in this month
          const hires = employees.filter(e => {
            const hireDate = new Date(e.hire_date)
            return hireDate >= date && hireDate <= monthEnd
          }).length

          // Terminations in this month
          const terminations = employees.filter(e => {
            if (!e.termination_date) return false
            const termDate = new Date(e.termination_date)
            return termDate >= date && termDate <= monthEnd
          }).length

          months.push({ month: monthStr, headcount, hires, terminations })
        }

        return months
      }),

    byDepartment: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('employees')
        .select(`
          id,
          department,
          department_id,
          status,
          dept:departments(id, name)
        `)
        .eq('org_id', ctx.orgId)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const byDept = (data ?? []).reduce((acc, e) => {
        const deptName = (e.dept as { name: string } | null)?.name || e.department || 'Unassigned'
        if (!acc[deptName]) {
          acc[deptName] = { name: deptName, count: 0, departmentId: e.department_id }
        }
        acc[deptName].count++
        return acc
      }, {} as Record<string, { name: string; count: number; departmentId: string | null }>)

      return Object.values(byDept).sort((a, b) => b.count - a.count)
    }),

    byLocation: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('employees')
        .select('location, work_mode')
        .eq('org_id', ctx.orgId)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const byLocation = (data ?? []).reduce((acc, e) => {
        const loc = e.location || 'Unknown'
        if (!acc[loc]) {
          acc[loc] = { location: loc, count: 0, remote: 0, onSite: 0, hybrid: 0 }
        }
        acc[loc].count++
        if (e.work_mode === 'remote') acc[loc].remote++
        else if (e.work_mode === 'on_site') acc[loc].onSite++
        else if (e.work_mode === 'hybrid') acc[loc].hybrid++
        return acc
      }, {} as Record<string, { location: string; count: number; remote: number; onSite: number; hybrid: number }>)

      return Object.values(byLocation).sort((a, b) => b.count - a.count)
    }),
  }),

  // ============ TURNOVER ============

  turnover: router({
    summary: orgProtectedProcedure
      .input(z.object({ months: z.number().min(1).max(24).default(12) }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - input.months)

        const { data, error } = await adminClient
          .from('employees')
          .select('hire_date, termination_date, termination_reason, status')
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        const employees = data ?? []
        const terminated = employees.filter(e =>
          e.termination_date && new Date(e.termination_date) >= startDate
        )

        const avgHeadcount = employees.filter(e => e.status === 'active').length

        const voluntary = terminated.filter(e => e.termination_reason === 'voluntary').length
        const involuntary = terminated.filter(e => e.termination_reason && e.termination_reason !== 'voluntary').length

        const turnoverRate = avgHeadcount > 0
          ? Math.round((terminated.length / avgHeadcount) * 100 * 10) / 10
          : 0

        const voluntaryRate = avgHeadcount > 0
          ? Math.round((voluntary / avgHeadcount) * 100 * 10) / 10
          : 0

        return {
          totalTerminations: terminated.length,
          voluntary,
          involuntary,
          turnoverRate,
          voluntaryRate,
          avgHeadcount,
          periodMonths: input.months,
        }
      }),

    trend: orgProtectedProcedure
      .input(z.object({ months: z.number().min(1).max(24).default(12) }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('employees')
          .select('hire_date, termination_date, termination_reason')
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        const employees = data ?? []
        const today = new Date()
        const months: { month: string; terminations: number; voluntary: number; involuntary: number; rate: number }[] = []

        for (let i = input.months - 1; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          const monthStr = date.toISOString().slice(0, 7)

          // Headcount at start of month
          const headcount = employees.filter(e => {
            const hireDate = new Date(e.hire_date)
            const termDate = e.termination_date ? new Date(e.termination_date) : null
            return hireDate < date && (!termDate || termDate >= date)
          }).length

          // Terminations in this month
          const monthTerms = employees.filter(e => {
            if (!e.termination_date) return false
            const termDate = new Date(e.termination_date)
            return termDate >= date && termDate <= monthEnd
          })

          const voluntary = monthTerms.filter(e => e.termination_reason === 'voluntary').length
          const involuntary = monthTerms.length - voluntary

          const rate = headcount > 0
            ? Math.round((monthTerms.length / headcount) * 100 * 10) / 10
            : 0

          months.push({
            month: monthStr,
            terminations: monthTerms.length,
            voluntary,
            involuntary,
            rate,
          })
        }

        return months
      }),

    byReason: orgProtectedProcedure
      .input(z.object({ months: z.number().min(1).max(24).default(12) }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - input.months)

        const { data, error } = await adminClient
          .from('employees')
          .select('termination_reason')
          .eq('org_id', ctx.orgId)
          .not('termination_date', 'is', null)
          .gte('termination_date', startDate.toISOString().split('T')[0])
          .is('deleted_at', null)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        const byReason = (data ?? []).reduce((acc, e) => {
          const reason = e.termination_reason || 'Unknown'
          acc[reason] = (acc[reason] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        return Object.entries(byReason)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
      }),
  }),

  // ============ TENURE ============

  tenure: router({
    distribution: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('employees')
        .select('hire_date')
        .eq('org_id', ctx.orgId)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const today = new Date()
      const buckets = {
        'Under 3 months': 0,
        '3-6 months': 0,
        '6-12 months': 0,
        '1-2 years': 0,
        '2-5 years': 0,
        '5+ years': 0,
      }

      ;(data ?? []).forEach(e => {
        const hireDate = new Date(e.hire_date)
        const months = (today.getFullYear() - hireDate.getFullYear()) * 12 + (today.getMonth() - hireDate.getMonth())

        if (months < 3) buckets['Under 3 months']++
        else if (months < 6) buckets['3-6 months']++
        else if (months < 12) buckets['6-12 months']++
        else if (months < 24) buckets['1-2 years']++
        else if (months < 60) buckets['2-5 years']++
        else buckets['5+ years']++
      })

      return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }))
    }),

    avgByDepartment: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('employees')
        .select('hire_date, department, department_id')
        .eq('org_id', ctx.orgId)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const today = new Date()
      const byDept: Record<string, { total: number; count: number }> = {}

      ;(data ?? []).forEach(e => {
        const dept = e.department || 'Unassigned'
        const hireDate = new Date(e.hire_date)
        const yearsOfService = (today.getTime() - hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)

        if (!byDept[dept]) byDept[dept] = { total: 0, count: 0 }
        byDept[dept].total += yearsOfService
        byDept[dept].count++
      })

      return Object.entries(byDept)
        .map(([department, data]) => ({
          department,
          avgTenureYears: Math.round((data.total / data.count) * 10) / 10,
          employeeCount: data.count,
        }))
        .sort((a, b) => b.avgTenureYears - a.avgTenureYears)
    }),

    anniversaries: orgProtectedProcedure
      .input(z.object({ days: z.number().min(1).max(90).default(30) }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('employees')
          .select(`
            id,
            hire_date,
            job_title,
            department,
            user:user_profiles!inner(full_name, avatar_url)
          `)
          .eq('org_id', ctx.orgId)
          .eq('status', 'active')
          .is('deleted_at', null)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        const today = new Date()
        const futureDate = new Date(today.getTime() + input.days * 24 * 60 * 60 * 1000)

        const upcomingAnniversaries = (data ?? []).filter(e => {
          const hireDate = new Date(e.hire_date)
          const thisYearAnniversary = new Date(today.getFullYear(), hireDate.getMonth(), hireDate.getDate())
          const nextYearAnniversary = new Date(today.getFullYear() + 1, hireDate.getMonth(), hireDate.getDate())

          const anniversaryDate = thisYearAnniversary >= today ? thisYearAnniversary : nextYearAnniversary
          return anniversaryDate >= today && anniversaryDate <= futureDate
        }).map(e => {
          const hireDate = new Date(e.hire_date)
          const thisYearAnniversary = new Date(today.getFullYear(), hireDate.getMonth(), hireDate.getDate())
          const anniversaryDate = thisYearAnniversary >= today
            ? thisYearAnniversary
            : new Date(today.getFullYear() + 1, hireDate.getMonth(), hireDate.getDate())
          const years = anniversaryDate.getFullYear() - hireDate.getFullYear()

          return {
            ...e,
            anniversaryDate: anniversaryDate.toISOString().split('T')[0],
            yearsOfService: years,
          }
        }).sort((a, b) => a.anniversaryDate.localeCompare(b.anniversaryDate))

        return upcomingAnniversaries
      }),
  }),

  // ============ DASHBOARD (ONE DB CALL pattern) ============

  dashboard: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()

    // Fetch all data in parallel
    const [employeesResult, timeOffResult, reviewsResult, goalsResult] = await Promise.all([
      adminClient
        .from('employees')
        .select('id, status, employment_type, department, hire_date, termination_date')
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null),

      adminClient
        .from('employee_time_off')
        .select(`
          id, status, start_date, end_date,
          employee:employees!inner(org_id)
        `)
        .eq('status', 'pending'),

      adminClient
        .from('performance_reviews')
        .select('id, review_status')
        .eq('org_id', ctx.orgId)
        .in('review_status', ['pending', 'self_review', 'manager_review']),

      adminClient
        .from('performance_goals')
        .select('id, status')
        .eq('org_id', ctx.orgId)
        .in('status', ['not_started', 'in_progress'])
        .is('deleted_at', null),
    ])

    const employees = employeesResult.data ?? []
    const active = employees.filter(e => e.status === 'active')

    // Headcount metrics
    const headcount = {
      total: active.length,
      fullTime: active.filter(e => e.employment_type === 'fte').length,
      contractor: active.filter(e => e.employment_type === 'contractor').length,
      intern: active.filter(e => e.employment_type === 'intern').length,
    }

    // New hires
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const newHires = employees.filter(e => e.hire_date >= thirtyDaysAgo).length

    // Terminations
    const terminations = employees.filter(e =>
      e.termination_date && e.termination_date >= thirtyDaysAgo
    ).length

    // Pending time off requests (filter by org)
    const pendingTimeOff = (timeOffResult.data ?? []).filter(
      t => (t.employee as { org_id: string })?.org_id === ctx.orgId
    ).length

    // Pending reviews
    const pendingReviews = reviewsResult.data?.length ?? 0

    // Active goals
    const activeGoals = goalsResult.data?.length ?? 0

    // Department distribution
    const byDepartment = active.reduce((acc, e) => {
      const dept = e.department || 'Unassigned'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topDepartments = Object.entries(byDepartment)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      headcount,
      newHires,
      terminations,
      pendingTimeOff,
      pendingReviews,
      activeGoals,
      topDepartments,
    }
  }),

  // ============ REPORTS ============

  reports: router({
    getTemplates: orgProtectedProcedure.query(async () => {
      // Return available report templates
      return [
        { id: 'headcount', name: 'Headcount Report', description: 'Current headcount by department and employment type' },
        { id: 'turnover', name: 'Turnover Report', description: 'Turnover rates and trends by period' },
        { id: 'tenure', name: 'Tenure Report', description: 'Employee tenure distribution and averages' },
        { id: 'compensation', name: 'Compensation Report', description: 'Salary bands and compa-ratio analysis' },
        { id: 'time-off', name: 'Time Off Report', description: 'Leave balances and usage by employee' },
      ]
    }),

    generate: orgProtectedProcedure
      .input(z.object({
        templateId: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        departmentId: z.string().uuid().optional(),
        format: z.enum(['json', 'csv']).default('json'),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Based on template, generate report data
        switch (input.templateId) {
          case 'headcount': {
            const { data } = await adminClient
              .from('employees')
              .select('id, status, employment_type, department, department_id, hire_date, job_title')
              .eq('org_id', ctx.orgId)
              .is('deleted_at', null)

            let employees = data ?? []
            if (input.departmentId) {
              employees = employees.filter(e => e.department_id === input.departmentId)
            }

            return {
              template: 'headcount',
              generatedAt: new Date().toISOString(),
              data: employees,
              summary: {
                total: employees.length,
                active: employees.filter(e => e.status === 'active').length,
              },
            }
          }

          case 'turnover': {
            const { data } = await adminClient
              .from('employees')
              .select('id, hire_date, termination_date, termination_reason, department')
              .eq('org_id', ctx.orgId)
              .is('deleted_at', null)

            const employees = data ?? []
            const terminated = employees.filter(e => e.termination_date)

            return {
              template: 'turnover',
              generatedAt: new Date().toISOString(),
              data: terminated,
              summary: {
                totalTerminations: terminated.length,
                voluntary: terminated.filter(e => e.termination_reason === 'voluntary').length,
              },
            }
          }

          default:
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Unknown report template' })
        }
      }),
  }),
})
