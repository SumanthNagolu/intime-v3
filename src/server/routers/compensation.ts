/**
 * Compensation Router
 * Manages employee compensation history and analytics
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// Input schemas
const getHistoryInput = z.object({
  employeeId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(20),
})

const addCompensationInput = z.object({
  employeeId: z.string().uuid(),
  effectiveDate: z.string(),
  salaryType: z.enum(['hourly', 'annual', 'contract']),
  baseSalary: z.number().positive(),
  currency: z.string().default('USD'),
  bonusTargetPercent: z.number().optional(),
  commissionRate: z.number().optional(),
  equityShares: z.number().optional(),
  changeType: z.enum(['hire', 'promotion', 'merit_increase', 'market_adjustment', 'transfer', 'demotion', 'correction']),
  changeReason: z.string().optional(),
  notes: z.string().optional(),
})

export const compensationRouter = router({
  // Get compensation history for an employee
  history: router({
    getByEmployee: orgProtectedProcedure
      .input(getHistoryInput)
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Verify employee is in org
        const { data: employee } = await adminClient
          .from('employees')
          .select('id')
          .eq('id', input.employeeId)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        if (!employee) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Employee not found' })
        }

        const { data, error } = await adminClient
          .from('compensation_history')
          .select(`
            *,
            approved_user:user_profiles!compensation_history_approved_by_fkey(id, full_name)
          `)
          .eq('employee_id', input.employeeId)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .order('effective_date', { ascending: false })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Get current compensation for an employee
    getCurrent: orgProtectedProcedure
      .input(z.object({ employeeId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await adminClient
          .from('compensation_history')
          .select('*')
          .eq('employee_id', input.employeeId)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .lte('effective_date', today)
          .order('effective_date', { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? null
      }),

    // Add new compensation record
    add: orgProtectedProcedure
      .input(addCompensationInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Verify employee is in org
        const { data: employee } = await adminClient
          .from('employees')
          .select('id, salary_amount')
          .eq('id', input.employeeId)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        if (!employee) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Employee not found' })
        }

        // Calculate change percentage if previous salary exists
        let changePercentage: number | null = null
        if (employee.salary_amount && employee.salary_amount > 0) {
          changePercentage = ((input.baseSalary - employee.salary_amount) / employee.salary_amount) * 100
        }

        // End previous compensation record
        const today = new Date(input.effectiveDate)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        await adminClient
          .from('compensation_history')
          .update({
            end_date: yesterday.toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          })
          .eq('employee_id', input.employeeId)
          .eq('org_id', ctx.orgId)
          .is('end_date', null)
          .is('deleted_at', null)

        // Create new compensation record
        const { data, error } = await adminClient
          .from('compensation_history')
          .insert({
            org_id: ctx.orgId,
            employee_id: input.employeeId,
            effective_date: input.effectiveDate,
            salary_type: input.salaryType,
            base_salary: input.baseSalary,
            currency: input.currency,
            bonus_target_percent: input.bonusTargetPercent,
            commission_rate: input.commissionRate,
            equity_shares: input.equityShares,
            change_type: input.changeType,
            change_reason: input.changeReason,
            change_percentage: changePercentage,
            previous_salary: employee.salary_amount,
            notes: input.notes,
            approved_by: ctx.userId,
            approved_at: new Date().toISOString(),
            created_by: ctx.userId,
            updated_by: ctx.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update employee's current salary
        await adminClient
          .from('employees')
          .update({
            salary_type: input.salaryType,
            salary_amount: input.baseSalary,
            currency: input.currency,
            updated_at: new Date().toISOString(),
            updated_by: ctx.userId,
          })
          .eq('id', input.employeeId)

        return data
      }),
  }),

  // Analytics
  analytics: router({
    // Get salary band distribution
    getSalaryBands: orgProtectedProcedure
      .input(z.object({
        departmentId: z.string().uuid().optional(),
        positionId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('employees')
          .select(`
            id,
            salary_amount,
            salary_type,
            job_title,
            department,
            department_id,
            position_id,
            position:positions(
              id,
              title,
              salary_band_min,
              salary_band_mid,
              salary_band_max
            )
          `)
          .eq('org_id', ctx.orgId)
          .eq('status', 'active')
          .is('deleted_at', null)
          .not('salary_amount', 'is', null)

        if (input.departmentId) {
          query = query.eq('department_id', input.departmentId)
        }
        if (input.positionId) {
          query = query.eq('position_id', input.positionId)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Calculate stats
        const salaries = (data ?? []).map(e => e.salary_amount).filter(s => s > 0)
        const total = salaries.length
        const sum = salaries.reduce((a, b) => a + b, 0)
        const avg = total > 0 ? sum / total : 0
        const sorted = [...salaries].sort((a, b) => a - b)
        const median = total > 0 ? sorted[Math.floor(total / 2)] : 0
        const min = total > 0 ? Math.min(...salaries) : 0
        const max = total > 0 ? Math.max(...salaries) : 0

        // Calculate compa-ratios for employees with positions
        const compaRatios = (data ?? [])
          .filter(e => e.position && (e.position as { salary_band_mid: number }).salary_band_mid > 0)
          .map(e => {
            const pos = e.position as { salary_band_mid: number }
            return e.salary_amount / pos.salary_band_mid
          })

        const avgCompaRatio = compaRatios.length > 0
          ? compaRatios.reduce((a, b) => a + b, 0) / compaRatios.length
          : null

        return {
          count: total,
          average: Math.round(avg),
          median: Math.round(median),
          min: Math.round(min),
          max: Math.round(max),
          avgCompaRatio: avgCompaRatio ? Math.round(avgCompaRatio * 100) / 100 : null,
          employees: data ?? [],
        }
      }),

    // Get compensation changes over time
    getChangesTrend: orgProtectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const startDate = input.startDate ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const endDate = input.endDate ?? new Date().toISOString().split('T')[0]

        const { data, error } = await adminClient
          .from('compensation_history')
          .select('effective_date, change_type, change_percentage')
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .gte('effective_date', startDate)
          .lte('effective_date', endDate)
          .order('effective_date')

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Group by month and change type
        const byMonth = (data ?? []).reduce((acc, item) => {
          const month = item.effective_date.substring(0, 7) // YYYY-MM
          if (!acc[month]) {
            acc[month] = {
              month,
              total: 0,
              promotions: 0,
              merit_increases: 0,
              market_adjustments: 0,
              avgChangePercent: 0,
              changes: [] as number[],
            }
          }
          acc[month].total++
          if (item.change_type === 'promotion') acc[month].promotions++
          if (item.change_type === 'merit_increase') acc[month].merit_increases++
          if (item.change_type === 'market_adjustment') acc[month].market_adjustments++
          if (item.change_percentage) acc[month].changes.push(item.change_percentage)
          return acc
        }, {} as Record<string, {
          month: string
          total: number
          promotions: number
          merit_increases: number
          market_adjustments: number
          avgChangePercent: number
          changes: number[]
        }>)

        // Calculate averages
        Object.values(byMonth).forEach(m => {
          if (m.changes.length > 0) {
            m.avgChangePercent = m.changes.reduce((a, b) => a + b, 0) / m.changes.length
          }
        })

        return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
      }),

    // Get compa-ratio distribution
    getCompaRatios: orgProtectedProcedure
      .input(z.object({ departmentId: z.string().uuid().optional() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('employees')
          .select(`
            id,
            salary_amount,
            department_id,
            position:positions!inner(
              salary_band_min,
              salary_band_mid,
              salary_band_max
            )
          `)
          .eq('org_id', ctx.orgId)
          .eq('status', 'active')
          .is('deleted_at', null)
          .not('salary_amount', 'is', null)
          .not('position_id', 'is', null)

        if (input.departmentId) {
          query = query.eq('department_id', input.departmentId)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Calculate distribution buckets
        const buckets = {
          below80: 0, // Below 80% of band mid
          between80_90: 0,
          between90_100: 0,
          between100_110: 0,
          between110_120: 0,
          above120: 0,
        }

        const compaRatios: number[] = []

        ;(data ?? []).forEach(emp => {
          const pos = emp.position as { salary_band_mid: number }
          if (pos.salary_band_mid > 0) {
            const ratio = emp.salary_amount / pos.salary_band_mid
            compaRatios.push(ratio)

            if (ratio < 0.8) buckets.below80++
            else if (ratio < 0.9) buckets.between80_90++
            else if (ratio < 1.0) buckets.between90_100++
            else if (ratio < 1.1) buckets.between100_110++
            else if (ratio < 1.2) buckets.between110_120++
            else buckets.above120++
          }
        })

        const avgRatio = compaRatios.length > 0
          ? compaRatios.reduce((a, b) => a + b, 0) / compaRatios.length
          : null

        return {
          total: compaRatios.length,
          averageCompaRatio: avgRatio ? Math.round(avgRatio * 100) / 100 : null,
          distribution: buckets,
        }
      }),
  }),

  // Get full compensation detail for employee (ONE DB CALL pattern)
  getFullCompensation: orgProtectedProcedure
    .input(z.object({ employeeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Fetch all data in parallel
      const [employeeResult, historyResult, positionResult] = await Promise.all([
        adminClient
          .from('employees')
          .select(`
            id,
            salary_type,
            salary_amount,
            currency,
            job_title,
            department,
            position_id,
            user:user_profiles!inner(full_name, email)
          `)
          .eq('id', input.employeeId)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single(),

        adminClient
          .from('compensation_history')
          .select(`
            *,
            approved_user:user_profiles!compensation_history_approved_by_fkey(id, full_name)
          `)
          .eq('employee_id', input.employeeId)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .order('effective_date', { ascending: false })
          .limit(10),

        adminClient
          .from('positions')
          .select('id, title, salary_band_min, salary_band_mid, salary_band_max')
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null),
      ])

      if (employeeResult.error || !employeeResult.data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Employee not found' })
      }

      const employee = employeeResult.data
      const position = employee.position_id
        ? (positionResult.data ?? []).find(p => p.id === employee.position_id)
        : null

      // Calculate compa-ratio
      let compaRatio: number | null = null
      if (position && position.salary_band_mid > 0 && employee.salary_amount) {
        compaRatio = Math.round((employee.salary_amount / position.salary_band_mid) * 100) / 100
      }

      return {
        employee,
        currentCompensation: {
          salaryType: employee.salary_type,
          baseSalary: employee.salary_amount,
          currency: employee.currency,
        },
        position,
        compaRatio,
        history: historyResult.data ?? [],
      }
    }),
})
