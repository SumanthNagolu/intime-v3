/**
 * Expenses Router
 * Manages expense reports, items, approvals, and policies
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// Enums
const expenseReportStatusEnum = z.enum([
  'draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'processing', 'paid', 'cancelled'
])

const expenseCategoryEnum = z.enum([
  'travel', 'meals', 'lodging', 'transportation', 'office_supplies',
  'software', 'equipment', 'training', 'professional_services',
  'client_entertainment', 'phone_internet', 'other'
])

// Input schemas
const listReportsInput = z.object({
  status: expenseReportStatusEnum.optional(),
  employeeId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(20),
})

const createReportInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  businessPurpose: z.string().optional(),
  projectCode: z.string().optional(),
  costCenterCode: z.string().optional(),
  departmentId: z.string().uuid().optional(),
})

const createItemInput = z.object({
  expenseReportId: z.string().uuid(),
  expenseDate: z.string(),
  category: expenseCategoryEnum,
  description: z.string().min(1),
  vendorName: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  receiptUrl: z.string().optional(),
  isMileage: z.boolean().default(false),
  miles: z.number().optional(),
  originLocation: z.string().optional(),
  destinationLocation: z.string().optional(),
  isPerDiem: z.boolean().default(false),
  perDiemDays: z.number().optional(),
  isPersonal: z.boolean().default(false),
  isReimbursable: z.boolean().default(true),
})

const createPolicyInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  categoryDailyLimits: z.record(z.number()).optional(),
  categoryPerItemLimits: z.record(z.number()).optional(),
  autoApprovalLimit: z.number().default(0),
  receiptRequiredAbove: z.number().default(25),
  maxDaysToSubmit: z.number().default(60),
  mileageRatePerMile: z.number().default(0.67),
})

export const expensesRouter = router({
  // ============ POLICIES ============

  policies: router({
    list: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('expense_policies')
        .select('*')
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .order('is_default', { ascending: false })
        .order('name')

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
          .from('expense_policies')
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
          .from('expense_policies')
          .insert({
            org_id: ctx.orgId,
            name: input.name,
            description: input.description,
            is_default: input.isDefault,
            category_daily_limits: input.categoryDailyLimits ?? {},
            category_per_item_limits: input.categoryPerItemLimits ?? {},
            auto_approval_limit: input.autoApprovalLimit,
            receipt_required_above: input.receiptRequiredAbove,
            max_days_to_submit: input.maxDaysToSubmit,
            mileage_rate_per_mile: input.mileageRatePerMile,
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
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        isDefault: z.boolean().optional(),
        categoryDailyLimits: z.record(z.number()).optional(),
        categoryPerItemLimits: z.record(z.number()).optional(),
        autoApprovalLimit: z.number().optional(),
        receiptRequiredAbove: z.number().optional(),
        mileageRatePerMile: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
          updated_by: ctx.userId,
        }

        if (input.name) updateData.name = input.name
        if (input.description !== undefined) updateData.description = input.description
        if (input.isDefault !== undefined) updateData.is_default = input.isDefault
        if (input.categoryDailyLimits) updateData.category_daily_limits = input.categoryDailyLimits
        if (input.categoryPerItemLimits) updateData.category_per_item_limits = input.categoryPerItemLimits
        if (input.autoApprovalLimit !== undefined) updateData.auto_approval_limit = input.autoApprovalLimit
        if (input.receiptRequiredAbove !== undefined) updateData.receipt_required_above = input.receiptRequiredAbove
        if (input.mileageRatePerMile !== undefined) updateData.mileage_rate_per_mile = input.mileageRatePerMile
        if (input.isActive !== undefined) updateData.is_active = input.isActive

        const { data, error } = await adminClient
          .from('expense_policies')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
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
          .from('expense_policies')
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

  // ============ REPORTS ============

  reports: router({
    list: orgProtectedProcedure
      .input(listReportsInput)
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const offset = (input.page - 1) * input.pageSize

        let query = adminClient
          .from('expense_reports')
          .select(`
            *,
            employee:employees!expense_reports_employee_id_fkey(
              id, job_title, department,
              user:user_profiles!inner(full_name, avatar_url)
            ),
            policy:expense_policies(id, name),
            department:departments(id, name),
            items:expense_items(count)
          `, { count: 'exact' })
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (input.status) query = query.eq('status', input.status)
        if (input.employeeId) query = query.eq('employee_id', input.employeeId)
        if (input.startDate) query = query.gte('created_at', input.startDate)
        if (input.endDate) query = query.lte('created_at', input.endDate)

        const { data, count, error } = await query.range(offset, offset + input.pageSize - 1)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          pagination: {
            total: count ?? 0,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil((count ?? 0) / input.pageSize),
          },
        }
      }),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('expense_reports')
          .select(`
            *,
            employee:employees!expense_reports_employee_id_fkey(
              id, job_title, department,
              user:user_profiles!inner(full_name, email, avatar_url)
            ),
            policy:expense_policies(id, name, receipt_required_above),
            department:departments(id, name)
          `)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' })
        }

        return data
      }),

    // Get full report with all items (ONE DB CALL pattern)
    getFullReport: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const [reportResult, itemsResult, approvalsResult, auditResult] = await Promise.all([
          adminClient
            .from('expense_reports')
            .select(`
              *,
              employee:employees!expense_reports_employee_id_fkey(
                id, job_title, department, manager_id,
                user:user_profiles!inner(full_name, email, avatar_url)
              ),
              policy:expense_policies(*),
              department:departments(id, name),
              current_approver:user_profiles!expense_reports_current_approver_id_fkey(id, full_name, avatar_url)
            `)
            .eq('id', input.id)
            .eq('org_id', ctx.orgId)
            .is('deleted_at', null)
            .single(),

          adminClient
            .from('expense_items')
            .select('*')
            .eq('expense_report_id', input.id)
            .order('expense_date', { ascending: false }),

          adminClient
            .from('expense_approvals')
            .select(`
              *,
              approver:user_profiles!expense_approvals_approver_id_fkey(id, full_name, avatar_url)
            `)
            .eq('expense_report_id', input.id)
            .order('approval_level'),

          adminClient
            .from('expense_audit_log')
            .select(`
              *,
              performed_by_user:user_profiles!expense_audit_log_performed_by_fkey(id, full_name)
            `)
            .eq('expense_report_id', input.id)
            .order('performed_at', { ascending: false })
            .limit(20),
        ])

        if (reportResult.error || !reportResult.data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' })
        }

        // Calculate totals by category
        const items = itemsResult.data ?? []
        const totalsByCategory = items.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = 0
          acc[item.category] += item.amount
          return acc
        }, {} as Record<string, number>)

        return {
          ...reportResult.data,
          items,
          totalsByCategory,
          approvals: approvalsResult.data ?? [],
          auditLog: auditResult.data ?? [],
        }
      }),

    create: orgProtectedProcedure
      .input(createReportInput)
      .mutation(async ({ ctx, input }) => {
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
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'User is not an employee' })
        }

        // Get default policy
        const { data: policy } = await adminClient
          .from('expense_policies')
          .select('id')
          .eq('org_id', ctx.orgId)
          .eq('is_default', true)
          .is('deleted_at', null)
          .single()

        // Generate report number
        const reportNumber = `EXP-${Date.now().toString().slice(-8)}`

        const { data, error } = await adminClient
          .from('expense_reports')
          .insert({
            org_id: ctx.orgId,
            report_number: reportNumber,
            title: input.title,
            description: input.description,
            employee_id: employee.id,
            policy_id: policy?.id,
            period_start: input.periodStart,
            period_end: input.periodEnd,
            business_purpose: input.businessPurpose,
            project_code: input.projectCode,
            cost_center_code: input.costCenterCode,
            department_id: input.departmentId,
            total_amount: 0,
            status: 'draft',
            created_by: ctx.userId,
            updated_by: ctx.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log creation
        await adminClient.from('expense_audit_log').insert({
          expense_report_id: data.id,
          action: 'created',
          new_status: 'draft',
          performed_by: ctx.userId,
        })

        return data
      }),

    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        description: z.string().optional(),
        businessPurpose: z.string().optional(),
        projectCode: z.string().optional(),
        costCenterCode: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
          updated_by: ctx.userId,
        }

        if (input.title) updateData.title = input.title
        if (input.description !== undefined) updateData.description = input.description
        if (input.businessPurpose !== undefined) updateData.business_purpose = input.businessPurpose
        if (input.projectCode !== undefined) updateData.project_code = input.projectCode
        if (input.costCenterCode !== undefined) updateData.cost_center_code = input.costCenterCode

        const { data, error } = await adminClient
          .from('expense_reports')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .eq('status', 'draft') // Can only update draft reports
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    submit: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Get report with items
        const { data: report } = await adminClient
          .from('expense_reports')
          .select(`
            *,
            items:expense_items(id, amount),
            employee:employees!expense_reports_employee_id_fkey(manager_id),
            policy:expense_policies(auto_approval_limit)
          `)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .eq('status', 'draft')
          .is('deleted_at', null)
          .single()

        if (!report) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found or already submitted' })
        }

        const items = report.items as { id: string; amount: number }[]
        if (items.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot submit empty report' })
        }

        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
        const policy = report.policy as { auto_approval_limit: number } | null
        const employee = report.employee as { manager_id: string } | null

        // Check if auto-approval applies
        const autoApprove = policy?.auto_approval_limit && totalAmount <= policy.auto_approval_limit

        const newStatus = autoApprove ? 'approved' : 'pending_approval'

        const { data, error } = await adminClient
          .from('expense_reports')
          .update({
            status: newStatus,
            total_amount: totalAmount,
            submitted_at: new Date().toISOString(),
            approved_at: autoApprove ? new Date().toISOString() : null,
            approved_amount: autoApprove ? totalAmount : null,
            current_approver_id: autoApprove ? null : employee?.manager_id,
            current_approval_level: autoApprove ? 0 : 1,
            updated_at: new Date().toISOString(),
            updated_by: ctx.userId,
          })
          .eq('id', input.id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Create approval record if not auto-approved
        if (!autoApprove && employee?.manager_id) {
          await adminClient.from('expense_approvals').insert({
            expense_report_id: input.id,
            approval_level: 1,
            approver_id: employee.manager_id,
            status: 'pending',
          })
        }

        // Log submission
        await adminClient.from('expense_audit_log').insert({
          expense_report_id: input.id,
          action: 'submitted',
          previous_status: 'draft',
          new_status: newStatus,
          performed_by: ctx.userId,
        })

        return data
      }),

    approve: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        comments: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Get report
        const { data: report } = await adminClient
          .from('expense_reports')
          .select('*, items:expense_items(amount)')
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .eq('status', 'pending_approval')
          .is('deleted_at', null)
          .single()

        if (!report) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' })
        }

        const items = report.items as { amount: number }[]
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)

        // Update approval record
        await adminClient
          .from('expense_approvals')
          .update({
            status: 'approved',
            decision_at: new Date().toISOString(),
            comments: input.comments,
            updated_at: new Date().toISOString(),
          })
          .eq('expense_report_id', input.id)
          .eq('approver_id', ctx.userId)
          .eq('status', 'pending')

        // Update report
        const { data, error } = await adminClient
          .from('expense_reports')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_amount: totalAmount,
            current_approver_id: null,
            updated_at: new Date().toISOString(),
            updated_by: ctx.userId,
          })
          .eq('id', input.id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log approval
        await adminClient.from('expense_audit_log').insert({
          expense_report_id: input.id,
          action: 'approved',
          previous_status: 'pending_approval',
          new_status: 'approved',
          notes: input.comments,
          performed_by: ctx.userId,
        })

        return data
      }),

    reject: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Update approval record
        await adminClient
          .from('expense_approvals')
          .update({
            status: 'rejected',
            decision_at: new Date().toISOString(),
            comments: input.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('expense_report_id', input.id)
          .eq('approver_id', ctx.userId)
          .eq('status', 'pending')

        // Update report
        const { data, error } = await adminClient
          .from('expense_reports')
          .update({
            status: 'rejected',
            rejected_at: new Date().toISOString(),
            rejection_reason: input.reason,
            current_approver_id: null,
            updated_at: new Date().toISOString(),
            updated_by: ctx.userId,
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log rejection
        await adminClient.from('expense_audit_log').insert({
          expense_report_id: input.id,
          action: 'rejected',
          previous_status: 'pending_approval',
          new_status: 'rejected',
          notes: input.reason,
          performed_by: ctx.userId,
        })

        return data
      }),

    markPaid: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        paymentMethod: z.string().optional(),
        paymentReference: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('expense_reports')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_method: input.paymentMethod,
            payment_reference: input.paymentReference,
            updated_at: new Date().toISOString(),
            updated_by: ctx.userId,
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .eq('status', 'approved')
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log payment
        await adminClient.from('expense_audit_log').insert({
          expense_report_id: input.id,
          action: 'paid',
          previous_status: 'approved',
          new_status: 'paid',
          performed_by: ctx.userId,
        })

        return data
      }),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('expense_reports')
          .update({
            deleted_at: new Date().toISOString(),
            updated_by: ctx.userId,
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .eq('status', 'draft') // Can only delete drafts

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Get my drafts
    getMyDrafts: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

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
        .from('expense_reports')
        .select(`
          *,
          items:expense_items(count)
        `)
        .eq('employee_id', employee.id)
        .eq('org_id', ctx.orgId)
        .eq('status', 'draft')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ?? []
    }),

    // Get reports awaiting my approval
    getAwaitingMyApproval: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('expense_reports')
        .select(`
          *,
          employee:employees!expense_reports_employee_id_fkey(
            id, job_title,
            user:user_profiles!inner(full_name, avatar_url)
          ),
          items:expense_items(count)
        `)
        .eq('org_id', ctx.orgId)
        .eq('status', 'pending_approval')
        .eq('current_approver_id', ctx.userId)
        .is('deleted_at', null)
        .order('submitted_at')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ?? []
    }),

    stats: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('expense_reports')
        .select('status, total_amount')
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const reports = data ?? []

      const statusCounts = reports.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const totalPending = reports
        .filter(r => r.status === 'pending_approval')
        .reduce((sum, r) => sum + (r.total_amount || 0), 0)

      const totalPaid = reports
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + (r.total_amount || 0), 0)

      return {
        total: reports.length,
        draft: statusCounts['draft'] ?? 0,
        pendingApproval: statusCounts['pending_approval'] ?? 0,
        approved: statusCounts['approved'] ?? 0,
        rejected: statusCounts['rejected'] ?? 0,
        paid: statusCounts['paid'] ?? 0,
        totalPending,
        totalPaid,
      }
    }),
  }),

  // ============ ITEMS ============

  items: router({
    create: orgProtectedProcedure
      .input(createItemInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Verify report exists and is draft
        const { data: report } = await adminClient
          .from('expense_reports')
          .select('id, policy_id')
          .eq('id', input.expenseReportId)
          .eq('org_id', ctx.orgId)
          .eq('status', 'draft')
          .is('deleted_at', null)
          .single()

        if (!report) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found or not in draft status' })
        }

        // Check receipt requirement
        let receiptRequired = true
        if (report.policy_id) {
          const { data: policy } = await adminClient
            .from('expense_policies')
            .select('receipt_required_above, mileage_rate_per_mile')
            .eq('id', report.policy_id)
            .single()

          if (policy) {
            receiptRequired = input.amount > (policy.receipt_required_above ?? 25)

            // Apply mileage rate if this is a mileage item
            if (input.isMileage && input.miles) {
              // Amount will be calculated from miles
            }
          }
        }

        const { data, error } = await adminClient
          .from('expense_items')
          .insert({
            expense_report_id: input.expenseReportId,
            expense_date: input.expenseDate,
            category: input.category,
            description: input.description,
            vendor_name: input.vendorName,
            amount: input.amount,
            currency: input.currency,
            receipt_url: input.receiptUrl,
            receipt_required: receiptRequired,
            is_mileage: input.isMileage,
            miles: input.miles,
            origin_location: input.originLocation,
            destination_location: input.destinationLocation,
            is_per_diem: input.isPerDiem,
            per_diem_days: input.perDiemDays,
            is_personal: input.isPersonal,
            is_reimbursable: input.isReimbursable,
            status: 'pending',
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update report total
        await adminClient.rpc('update_expense_report_total', {
          p_report_id: input.expenseReportId,
        })

        return data
      }),

    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        expenseDate: z.string().optional(),
        category: expenseCategoryEnum.optional(),
        description: z.string().optional(),
        vendorName: z.string().optional(),
        amount: z.number().positive().optional(),
        receiptUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (input.expenseDate) updateData.expense_date = input.expenseDate
        if (input.category) updateData.category = input.category
        if (input.description) updateData.description = input.description
        if (input.vendorName !== undefined) updateData.vendor_name = input.vendorName
        if (input.amount) updateData.amount = input.amount
        if (input.receiptUrl !== undefined) updateData.receipt_url = input.receiptUrl

        const { data, error } = await adminClient
          .from('expense_items')
          .update(updateData)
          .eq('id', input.id)
          .select(`*, expense_report:expense_reports!inner(org_id, status)`)
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Verify org and draft status
        const report = data.expense_report as { org_id: string; status: string }
        if (report.org_id !== ctx.orgId || report.status !== 'draft') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot edit this item' })
        }

        // Update report total if amount changed
        if (input.amount) {
          await adminClient.rpc('update_expense_report_total', {
            p_report_id: data.expense_report_id,
          })
        }

        return data
      }),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Get item with report info
        const { data: item } = await adminClient
          .from('expense_items')
          .select(`*, expense_report:expense_reports!inner(id, org_id, status)`)
          .eq('id', input.id)
          .single()

        if (!item) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Item not found' })
        }

        const report = item.expense_report as { id: string; org_id: string; status: string }
        if (report.org_id !== ctx.orgId || report.status !== 'draft') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete this item' })
        }

        const { error } = await adminClient
          .from('expense_items')
          .delete()
          .eq('id', input.id)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update report total
        await adminClient.rpc('update_expense_report_total', {
          p_report_id: report.id,
        })

        return { success: true }
      }),

    uploadReceipt: orgProtectedProcedure
      .input(z.object({
        itemId: z.string().uuid(),
        receiptUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('expense_items')
          .update({
            receipt_url: input.receiptUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.itemId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),
  }),

  // Dashboard stats
  dashboard: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()

    const { data: employee } = await adminClient
      .from('employees')
      .select('id, manager_id')
      .eq('user_id', ctx.userId)
      .eq('org_id', ctx.orgId)
      .is('deleted_at', null)
      .single()

    const [myDraftsResult, awaitingApprovalResult, recentResult] = await Promise.all([
      // My drafts
      adminClient
        .from('expense_reports')
        .select('id')
        .eq('employee_id', employee?.id ?? '')
        .eq('org_id', ctx.orgId)
        .eq('status', 'draft')
        .is('deleted_at', null),

      // Awaiting my approval
      adminClient
        .from('expense_reports')
        .select('id, total_amount')
        .eq('org_id', ctx.orgId)
        .eq('status', 'pending_approval')
        .eq('current_approver_id', ctx.userId)
        .is('deleted_at', null),

      // Recent activity
      adminClient
        .from('expense_reports')
        .select(`
          id,
          report_number,
          title,
          total_amount,
          status,
          submitted_at,
          employee:employees!expense_reports_employee_id_fkey(
            user:user_profiles!inner(full_name, avatar_url)
          )
        `)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(5),
    ])

    const awaitingApproval = awaitingApprovalResult.data ?? []
    const pendingAmount = awaitingApproval.reduce((sum, r) => sum + (r.total_amount ?? 0), 0)

    return {
      myDrafts: myDraftsResult.data?.length ?? 0,
      awaitingMyApproval: awaitingApproval.length,
      pendingAmount,
      recentReports: recentResult.data ?? [],
    }
  }),
})
