/**
 * Leave Management Router
 * Manages leave policies, balances, and requests
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// Leave type from existing schema
const leaveTypeEnum = z.enum([
  'vacation', 'sick', 'personal', 'bereavement', 'jury_duty',
  'parental', 'unpaid', 'holiday', 'other'
])

// Input schemas
const listPoliciesInput = z.object({
  leaveType: leaveTypeEnum.optional(),
  isActive: z.boolean().optional(),
})

const createPolicyInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  leaveType: leaveTypeEnum,
  accrualType: z.enum(['annual', 'monthly', 'per_pay_period', 'none']),
  accrualAmount: z.number().optional(),
  maxBalance: z.number().optional(),
  carryoverEnabled: z.boolean().default(false),
  carryoverMax: z.number().optional(),
  carryoverExpiryMonths: z.number().optional(),
  requiresApproval: z.boolean().default(true),
  autoApproveIfDaysLe: z.number().optional(),
  minNoticeDays: z.number().default(0),
  appliesToEmploymentTypes: z.array(z.string()).default(['fte']),
})

const updatePolicyInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  accrualAmount: z.number().optional(),
  maxBalance: z.number().optional(),
  carryoverEnabled: z.boolean().optional(),
  carryoverMax: z.number().optional(),
  requiresApproval: z.boolean().optional(),
  autoApproveIfDaysLe: z.number().optional(),
  minNoticeDays: z.number().optional(),
  isActive: z.boolean().optional(),
})

const listRequestsInput = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  employeeId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
})

const createRequestInput = z.object({
  employeeId: z.string().uuid(),
  policyId: z.string().uuid().optional(),
  type: leaveTypeEnum,
  startDate: z.string(),
  endDate: z.string(),
  hours: z.number(),
  reason: z.string().optional(),
})

const approveRejectInput = z.object({
  id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
})

const adjustBalanceInput = z.object({
  employeeId: z.string().uuid(),
  policyId: z.string().uuid(),
  fiscalYear: z.number(),
  adjustmentDays: z.number(),
  reason: z.string(),
})

export const leaveRouter = router({
  // ============ POLICIES ============

  policies: router({
    list: orgProtectedProcedure
      .input(listPoliciesInput.optional())
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('leave_policies')
          .select('*')
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .order('leave_type')
          .order('name')

        if (input?.leaveType) {
          query = query.eq('leave_type', input.leaveType)
        }
        if (input?.isActive !== undefined) {
          query = query.eq('is_active', input.isActive)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('leave_policies')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Policy not found' })
        }

        return data
      }),

    create: orgProtectedProcedure
      .input(createPolicyInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('leave_policies')
          .insert({
            org_id: ctx.orgId,
            name: input.name,
            description: input.description,
            leave_type: input.leaveType,
            accrual_type: input.accrualType,
            accrual_amount: input.accrualAmount,
            max_balance: input.maxBalance,
            carryover_enabled: input.carryoverEnabled,
            carryover_max: input.carryoverMax,
            carryover_expiry_months: input.carryoverExpiryMonths,
            requires_approval: input.requiresApproval,
            auto_approve_if_days_le: input.autoApproveIfDaysLe,
            min_notice_days: input.minNoticeDays,
            applies_to_employment_types: input.appliesToEmploymentTypes,
            is_active: true,
            created_by: ctx.userId,
            updated_by: ctx.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    update: orgProtectedProcedure
      .input(updatePolicyInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
          updated_by: ctx.userId,
        }

        if (input.name) updateData.name = input.name
        if (input.description !== undefined) updateData.description = input.description
        if (input.accrualAmount !== undefined) updateData.accrual_amount = input.accrualAmount
        if (input.maxBalance !== undefined) updateData.max_balance = input.maxBalance
        if (input.carryoverEnabled !== undefined) updateData.carryover_enabled = input.carryoverEnabled
        if (input.carryoverMax !== undefined) updateData.carryover_max = input.carryoverMax
        if (input.requiresApproval !== undefined) updateData.requires_approval = input.requiresApproval
        if (input.autoApproveIfDaysLe !== undefined) updateData.auto_approve_if_days_le = input.autoApproveIfDaysLe
        if (input.minNoticeDays !== undefined) updateData.min_notice_days = input.minNoticeDays
        if (input.isActive !== undefined) updateData.is_active = input.isActive

        const { data, error } = await adminClient
          .from('leave_policies')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('leave_policies')
          .update({
            deleted_at: new Date().toISOString(),
            updated_by: ctx.userId,
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============ BALANCES ============

  balances: router({
    getByEmployee: orgProtectedProcedure
      .input(z.object({
        employeeId: z.string().uuid(),
        fiscalYear: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const fiscalYear = input.fiscalYear ?? new Date().getFullYear()

        const { data, error } = await adminClient
          .from('leave_balances')
          .select(`
            *,
            policy:leave_policies!inner(id, name, leave_type, org_id)
          `)
          .eq('employee_id', input.employeeId)
          .eq('fiscal_year', fiscalYear)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Filter by org_id through policy
        const filteredData = (data ?? []).filter(
          b => (b.policy as { org_id: string })?.org_id === ctx.orgId
        )

        return filteredData
      }),

    getMyBalances: orgProtectedProcedure
      .input(z.object({ fiscalYear: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const fiscalYear = input.fiscalYear ?? new Date().getFullYear()

        // Get employee ID for current user
        const { data: employee } = await adminClient
          .from('employees')
          .select('id')
          .eq('user_id', ctx.userId)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        if (!employee) {
          return []
        }

        const { data, error } = await adminClient
          .from('leave_balances')
          .select(`
            *,
            policy:leave_policies!inner(id, name, leave_type)
          `)
          .eq('employee_id', employee.id)
          .eq('fiscal_year', fiscalYear)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    adjust: orgProtectedProcedure
      .input(adjustBalanceInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Get or create balance record
        const { data: existing } = await adminClient
          .from('leave_balances')
          .select('id, adjustment_days')
          .eq('employee_id', input.employeeId)
          .eq('policy_id', input.policyId)
          .eq('fiscal_year', input.fiscalYear)
          .single()

        if (existing) {
          // Update existing
          const { data, error } = await adminClient
            .from('leave_balances')
            .update({
              adjustment_days: (existing.adjustment_days || 0) + input.adjustmentDays,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single()

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          return data
        } else {
          // Create new
          const { data, error } = await adminClient
            .from('leave_balances')
            .insert({
              employee_id: input.employeeId,
              policy_id: input.policyId,
              fiscal_year: input.fiscalYear,
              entitled_days: 0,
              used_days: 0,
              pending_days: 0,
              carried_over_days: 0,
              adjustment_days: input.adjustmentDays,
            })
            .select()
            .single()

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          return data
        }
      }),

    // Run accrual for all employees (typically called by cron)
    runAccrual: orgProtectedProcedure.mutation(async ({ ctx }) => {
      const adminClient = getAdminClient()

      // Get all active policies with accrual
      const { data: policies } = await adminClient
        .from('leave_policies')
        .select('*')
        .eq('org_id', ctx.orgId)
        .eq('is_active', true)
        .neq('accrual_type', 'none')
        .is('deleted_at', null)

      if (!policies || policies.length === 0) {
        return { processed: 0 }
      }

      // Get all active employees
      const { data: employees } = await adminClient
        .from('employees')
        .select('id, employment_type')
        .eq('org_id', ctx.orgId)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (!employees || employees.length === 0) {
        return { processed: 0 }
      }

      const currentYear = new Date().getFullYear()
      let processed = 0

      // For each policy and employee, ensure balance exists and update entitled days
      for (const policy of policies) {
        const applicableEmployees = employees.filter(
          e => policy.applies_to_employment_types?.includes(e.employment_type)
        )

        for (const employee of applicableEmployees) {
          // Upsert balance
          const { error } = await adminClient.rpc('upsert_leave_balance', {
            p_employee_id: employee.id,
            p_policy_id: policy.id,
            p_fiscal_year: currentYear,
            p_accrual_amount: policy.accrual_amount || 0,
          })

          if (!error) {
            processed++
          }
        }
      }

      return { processed }
    }),
  }),

  // ============ REQUESTS ============

  requests: router({
    list: orgProtectedProcedure
      .input(listRequestsInput)
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const offset = (input.page - 1) * input.pageSize

        let query = adminClient
          .from('employee_time_off')
          .select(`
            *,
            employee:employees!inner(
              id,
              job_title,
              department,
              org_id,
              user:user_profiles!inner(full_name, avatar_url)
            ),
            policy:leave_policies(id, name, leave_type),
            approver:user_profiles!employee_time_off_approved_by_fkey(id, full_name)
          `, { count: 'exact' })
          .order('start_date', { ascending: false })

        // Filter by org through employee
        if (input.status) {
          query = query.eq('status', input.status)
        }
        if (input.employeeId) {
          query = query.eq('employee_id', input.employeeId)
        }
        if (input.startDate) {
          query = query.gte('start_date', input.startDate)
        }
        if (input.endDate) {
          query = query.lte('end_date', input.endDate)
        }

        const { data, count, error } = await query.range(offset, offset + input.pageSize - 1)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Filter by org
        const filteredData = (data ?? []).filter(
          r => (r.employee as { org_id: string })?.org_id === ctx.orgId
        )

        return {
          items: filteredData,
          pagination: {
            total: count ?? 0,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil((count ?? 0) / input.pageSize),
          },
        }
      }),

    getMyRequests: orgProtectedProcedure
      .input(z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
        year: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Get employee for current user
        const { data: employee } = await adminClient
          .from('employees')
          .select('id')
          .eq('user_id', ctx.userId)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        if (!employee) {
          return []
        }

        let query = adminClient
          .from('employee_time_off')
          .select(`
            *,
            policy:leave_policies(id, name, leave_type),
            approver:user_profiles!employee_time_off_approved_by_fkey(id, full_name)
          `)
          .eq('employee_id', employee.id)
          .order('start_date', { ascending: false })

        if (input.status) {
          query = query.eq('status', input.status)
        }
        if (input.year) {
          query = query.gte('start_date', `${input.year}-01-01`)
          query = query.lt('start_date', `${input.year + 1}-01-01`)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    create: orgProtectedProcedure
      .input(createRequestInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Verify employee exists in org
        const { data: employee, error: empError } = await adminClient
          .from('employees')
          .select('id, org_id')
          .eq('id', input.employeeId)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        if (empError || !employee) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Employee not found' })
        }

        // Check if policy requires approval
        let autoApprove = false
        if (input.policyId) {
          const { data: policy } = await adminClient
            .from('leave_policies')
            .select('requires_approval, auto_approve_if_days_le')
            .eq('id', input.policyId)
            .single()

          if (policy && !policy.requires_approval) {
            autoApprove = true
          } else if (policy?.auto_approve_if_days_le && input.hours / 8 <= policy.auto_approve_if_days_le) {
            autoApprove = true
          }
        }

        const { data, error } = await adminClient
          .from('employee_time_off')
          .insert({
            employee_id: input.employeeId,
            org_id: ctx.orgId,
            policy_id: input.policyId,
            type: input.type,
            status: autoApprove ? 'approved' : 'pending',
            start_date: input.startDate,
            end_date: input.endDate,
            hours: input.hours,
            reason: input.reason,
            approved_by: autoApprove ? ctx.userId : null,
            approved_at: autoApprove ? new Date().toISOString() : null,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // If approved, update balance
        if (autoApprove && input.policyId) {
          const fiscalYear = new Date(input.startDate).getFullYear()
          const days = input.hours / 8

          await adminClient.rpc('update_leave_balance_on_approval', {
            p_employee_id: input.employeeId,
            p_policy_id: input.policyId,
            p_fiscal_year: fiscalYear,
            p_days: days,
          })
        }

        return data
      }),

    approveReject: orgProtectedProcedure
      .input(approveRejectInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          status: input.action === 'approve' ? 'approved' : 'rejected',
          approved_by: ctx.userId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        if (input.action === 'reject' && input.reason) {
          updateData.denial_reason = input.reason
        }

        // Get request first to validate org
        const { data: request } = await adminClient
          .from('employee_time_off')
          .select(`
            *,
            employee:employees!inner(org_id)
          `)
          .eq('id', input.id)
          .single()

        if (!request || (request.employee as { org_id: string })?.org_id !== ctx.orgId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' })
        }

        const { data, error } = await adminClient
          .from('employee_time_off')
          .update(updateData)
          .eq('id', input.id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // If approved, update balance
        if (input.action === 'approve' && request.policy_id) {
          const fiscalYear = new Date(request.start_date).getFullYear()
          const days = request.hours / 8

          await adminClient.rpc('update_leave_balance_on_approval', {
            p_employee_id: request.employee_id,
            p_policy_id: request.policy_id,
            p_fiscal_year: fiscalYear,
            p_days: days,
          })
        }

        return data
      }),

    cancel: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('employee_time_off')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),
  }),

  // ============ CALENDAR ============

  calendar: router({
    getTeamCalendar: orgProtectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
        departmentId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('employee_time_off')
          .select(`
            id,
            type,
            status,
            start_date,
            end_date,
            hours,
            employee:employees!inner(
              id,
              job_title,
              department,
              department_id,
              org_id,
              user:user_profiles!inner(full_name, avatar_url)
            )
          `)
          .in('status', ['pending', 'approved'])
          .gte('end_date', input.startDate)
          .lte('start_date', input.endDate)

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Filter by org and optionally department
        let filteredData = (data ?? []).filter(
          r => (r.employee as { org_id: string })?.org_id === ctx.orgId
        )

        if (input.departmentId) {
          filteredData = filteredData.filter(
            r => (r.employee as { department_id: string })?.department_id === input.departmentId
          )
        }

        return filteredData
      }),
  }),

  // Dashboard stats
  stats: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const today = new Date().toISOString().split('T')[0]

    const [pendingResult, upcomingResult, policiesResult] = await Promise.all([
      // Pending approvals
      adminClient
        .from('employee_time_off')
        .select(`
          id,
          employee:employees!inner(org_id)
        `)
        .eq('status', 'pending'),

      // Upcoming time off (next 30 days)
      adminClient
        .from('employee_time_off')
        .select(`
          id,
          start_date,
          employee:employees!inner(org_id)
        `)
        .eq('status', 'approved')
        .gte('start_date', today)
        .lte('start_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),

      // Active policies
      adminClient
        .from('leave_policies')
        .select('id')
        .eq('org_id', ctx.orgId)
        .eq('is_active', true)
        .is('deleted_at', null),
    ])

    const pendingCount = (pendingResult.data ?? []).filter(
      r => (r.employee as { org_id: string })?.org_id === ctx.orgId
    ).length

    const upcomingCount = (upcomingResult.data ?? []).filter(
      r => (r.employee as { org_id: string })?.org_id === ctx.orgId
    ).length

    return {
      pendingApprovals: pendingCount,
      upcomingTimeOff: upcomingCount,
      activePolicies: policiesResult.data?.length ?? 0,
    }
  }),
})
