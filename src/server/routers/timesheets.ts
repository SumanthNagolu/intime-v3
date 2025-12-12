import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// TIMESHEETS-01: Timesheet Management Router
// Consultant time entry, approval workflow, and processing
// ============================================

// ============================================
// INPUT SCHEMAS
// ============================================

const timesheetStatusEnum = z.enum([
  'draft', 'submitted', 'pending_client_approval', 'client_approved',
  'client_rejected', 'pending_internal_approval', 'internal_approved',
  'internal_rejected', 'approved', 'processed', 'void'
])

const periodTypeEnum = z.enum([
  'weekly', 'bi_weekly', 'semi_monthly', 'monthly'
])

const approvalStatusEnum = z.enum([
  'pending', 'approved', 'rejected', 'delegated', 'escalated'
])

const expenseCategoryEnum = z.enum([
  'travel', 'lodging', 'meals', 'mileage', 'parking',
  'equipment', 'supplies', 'communication', 'other'
])

const adjustmentTypeEnum = z.enum([
  'correction', 'addition', 'void'
])

const adjustmentStatusEnum = z.enum([
  'pending', 'approved', 'rejected'
])

// ============================================
// ADMIN CLIENT
// ============================================

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformTimesheet(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    placementId: item.placement_id as string,
    periodStart: item.period_start as string,
    periodEnd: item.period_end as string,
    periodType: item.period_type as string,
    totalRegularHours: item.total_regular_hours ? Number(item.total_regular_hours) : 0,
    totalOvertimeHours: item.total_overtime_hours ? Number(item.total_overtime_hours) : 0,
    totalDoubleTimeHours: item.total_double_time_hours ? Number(item.total_double_time_hours) : 0,
    totalPtoHours: item.total_pto_hours ? Number(item.total_pto_hours) : 0,
    totalHolidayHours: item.total_holiday_hours ? Number(item.total_holiday_hours) : 0,
    totalBillableAmount: item.total_billable_amount ? Number(item.total_billable_amount) : 0,
    totalPayableAmount: item.total_payable_amount ? Number(item.total_payable_amount) : 0,
    rateSnapshot: item.rate_snapshot as Record<string, unknown> | null,
    status: item.status as string,
    submittedAt: item.submitted_at as string | null,
    submittedBy: item.submitted_by as string | null,
    clientApprovalStatus: item.client_approval_status as string | null,
    clientApprovedAt: item.client_approved_at as string | null,
    clientApprovedBy: item.client_approved_by as string | null,
    clientApprovalNotes: item.client_approval_notes as string | null,
    internalApprovalStatus: item.internal_approval_status as string | null,
    internalApprovedAt: item.internal_approved_at as string | null,
    internalApprovedBy: item.internal_approved_by as string | null,
    internalApprovalNotes: item.internal_approval_notes as string | null,
    processedAt: item.processed_at as string | null,
    processedBy: item.processed_by as string | null,
    invoiceId: item.invoice_id as string | null,
    payrollRunId: item.payroll_run_id as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    createdBy: item.created_by as string | null,
    updatedBy: item.updated_by as string | null,
    // Joined relations
    placement: item.placement,
    submitter: item.submitter,
    clientApprover: item.client_approver,
    internalApprover: item.internal_approver,
  }
}

function transformTimesheetEntry(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    timesheetId: item.timesheet_id as string,
    workDate: item.work_date as string,
    regularHours: item.regular_hours ? Number(item.regular_hours) : 0,
    overtimeHours: item.overtime_hours ? Number(item.overtime_hours) : 0,
    doubleTimeHours: item.double_time_hours ? Number(item.double_time_hours) : 0,
    ptoHours: item.pto_hours ? Number(item.pto_hours) : 0,
    holidayHours: item.holiday_hours ? Number(item.holiday_hours) : 0,
    startTime: item.start_time as string | null,
    endTime: item.end_time as string | null,
    breakMinutes: item.break_minutes as number | null,
    projectId: item.project_id as string | null,
    taskCode: item.task_code as string | null,
    costCenter: item.cost_center as string | null,
    isBillable: item.is_billable as boolean,
    billRate: item.bill_rate ? Number(item.bill_rate) : null,
    payRate: item.pay_rate ? Number(item.pay_rate) : null,
    billableAmount: item.billable_amount ? Number(item.billable_amount) : 0,
    payableAmount: item.payable_amount ? Number(item.payable_amount) : 0,
    description: item.description as string | null,
    internalNotes: item.internal_notes as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
  }
}

function transformTimesheetApproval(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    timesheetId: item.timesheet_id as string,
    approvalLevel: item.approval_level as number,
    approverType: item.approver_type as string,
    approverId: item.approver_id as string | null,
    status: item.status as string,
    decisionAt: item.decision_at as string | null,
    comments: item.comments as string | null,
    delegatedFrom: item.delegated_from as string | null,
    delegatedReason: item.delegated_reason as string | null,
    createdAt: item.created_at as string,
    // Joined relations
    approver: item.approver,
    delegator: item.delegator,
  }
}

function transformTimesheetExpense(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    timesheetId: item.timesheet_id as string,
    expenseDate: item.expense_date as string,
    category: item.category as string,
    description: item.description as string,
    amount: item.amount ? Number(item.amount) : 0,
    isBillable: item.is_billable as boolean,
    isReimbursable: item.is_reimbursable as boolean,
    receiptUrl: item.receipt_url as string | null,
    receiptVerified: item.receipt_verified as boolean,
    verifiedBy: item.verified_by as string | null,
    verifiedAt: item.verified_at as string | null,
    notes: item.notes as string | null,
    createdAt: item.created_at as string,
    // Joined relations
    verifier: item.verifier,
  }
}

function transformTimesheetAdjustment(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    originalTimesheetId: item.original_timesheet_id as string,
    adjustmentTimesheetId: item.adjustment_timesheet_id as string | null,
    adjustmentType: item.adjustment_type as string,
    reason: item.reason as string,
    hoursDelta: item.hours_delta ? Number(item.hours_delta) : null,
    amountDelta: item.amount_delta ? Number(item.amount_delta) : null,
    requestedBy: item.requested_by as string,
    approvedBy: item.approved_by as string | null,
    approvedAt: item.approved_at as string | null,
    status: item.status as string,
    createdAt: item.created_at as string,
    // Joined relations
    requester: item.requester,
    approver: item.approver,
    originalTimesheet: item.original_timesheet,
  }
}

function transformTimesheetTemplate(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    name: item.name as string,
    description: item.description as string | null,
    periodType: item.period_type as string,
    defaultHoursPerDay: item.default_hours_per_day ? Number(item.default_hours_per_day) : 8,
    defaultDaysPerWeek: item.default_days_per_week as number,
    defaultEntries: item.default_entries as Record<string, unknown>[] | null,
    isDefault: item.is_default as boolean,
    isActive: item.is_active as boolean,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
  }
}

function transformApprovalWorkflow(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    name: item.name as string,
    description: item.description as string | null,
    approvalLevels: item.approval_levels as Record<string, unknown>[],
    autoApproveUnderHours: item.auto_approve_under_hours ? Number(item.auto_approve_under_hours) : null,
    autoApproveIfMatchesSchedule: item.auto_approve_if_matches_schedule as boolean,
    escalationHours: item.escalation_hours as number,
    escalationTo: item.escalation_to as string | null,
    isDefault: item.is_default as boolean,
    isActive: item.is_active as boolean,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
  }
}

// ============================================
// ROUTER
// ============================================

export const timesheetsRouter = router({
  // ==========================================
  // TIMESHEETS - Main timesheet operations
  // ==========================================

  // List timesheets with filters
  list: orgProtectedProcedure
    .input(z.object({
      placementId: z.string().uuid().optional(),
      status: timesheetStatusEnum.optional(),
      periodType: periodTypeEnum.optional(),
      periodStart: z.string().optional(),
      periodEnd: z.string().optional(),
      isUninvoiced: z.boolean().optional(),
      isUnpaid: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['period_start', 'period_end', 'status', 'total_billable_amount', 'created_at', 'submitted_at']).default('period_start'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('timesheets')
        .select(`
          *,
          placement:placements!placement_id(
            id,
            job:jobs!job_id(id, title),
            candidate:contacts!candidate_id(id, first_name, last_name)
          ),
          submitter:user_profiles!submitted_by(id, full_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input.placementId) query = query.eq('placement_id', input.placementId)
      if (input.status) query = query.eq('status', input.status)
      if (input.periodType) query = query.eq('period_type', input.periodType)
      if (input.periodStart) query = query.gte('period_start', input.periodStart)
      if (input.periodEnd) query = query.lte('period_end', input.periodEnd)

      if (input.isUninvoiced === true) {
        query = query.is('invoice_id', null).eq('status', 'approved')
      }

      if (input.isUnpaid === true) {
        query = query.is('payroll_run_id', null).eq('status', 'approved')
      }

      if (input.search) {
        // Search by placement candidate name - need to filter in app for complex joins
        query = query.or(`status.ilike.%${input.search}%`)
      }

      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc', nullsFirst: false })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list timesheets:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformTimesheet) ?? [],
        total: count ?? 0,
      }
    }),

  // Get single timesheet with full details
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('timesheets')
        .select(`
          *,
          placement:placements!placement_id(
            id,
            job:jobs!job_id(id, title, account:companies!account_id(id, legal_name)),
            candidate:contacts!candidate_id(id, first_name, last_name, email)
          ),
          submitter:user_profiles!submitted_by(id, full_name),
          client_approver:user_profiles!client_approved_by(id, full_name),
          internal_approver:user_profiles!internal_approved_by(id, full_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
      }

      // Also fetch entries for this timesheet
      const { data: entries } = await adminClient
        .from('timesheet_entries')
        .select('*')
        .eq('timesheet_id', input.id)
        .order('work_date', { ascending: true })

      // Fetch expenses
      const { data: expenses } = await adminClient
        .from('timesheet_expenses')
        .select(`
          *,
          verifier:user_profiles!verified_by(id, full_name)
        `)
        .eq('timesheet_id', input.id)
        .order('expense_date', { ascending: true })

      // Fetch approvals
      const { data: approvals } = await adminClient
        .from('timesheet_approvals')
        .select(`
          *,
          approver:user_profiles!approver_id(id, full_name),
          delegator:user_profiles!delegated_from(id, full_name)
        `)
        .eq('timesheet_id', input.id)
        .order('approval_level', { ascending: true })

      const timesheet = transformTimesheet(data)
      return {
        ...timesheet,
        entries: entries?.map(transformTimesheetEntry) ?? [],
        expenses: expenses?.map(transformTimesheetExpense) ?? [],
        approvals: approvals?.map(transformTimesheetApproval) ?? [],
      }
    }),

  // Get timesheets by placement
  getByPlacement: orgProtectedProcedure
    .input(z.object({
      placementId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('timesheets')
        .select(`
          *,
          submitter:user_profiles!submitted_by(id, full_name)
        `)
        .eq('org_id', orgId)
        .eq('placement_id', input.placementId)
        .is('deleted_at', null)
        .order('period_start', { ascending: false })
        .limit(input.limit)

      if (error) {
        console.error('Failed to get timesheets by placement:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformTimesheet) ?? []
    }),

  // Get uninvoiced timesheets (for billing)
  getUninvoiced: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid().optional(),
      placementId: z.string().uuid().optional(),
      beforeDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('timesheets')
        .select(`
          *,
          placement:placements!placement_id(
            id,
            job:jobs!job_id(id, title, account_id)
          )
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .is('invoice_id', null)
        .eq('status', 'approved')

      if (input.placementId) {
        query = query.eq('placement_id', input.placementId)
      }

      if (input.beforeDate) {
        query = query.lte('period_end', input.beforeDate)
      }

      query = query.order('period_start', { ascending: true })

      const { data, error } = await query

      if (error) {
        console.error('Failed to get uninvoiced timesheets:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      let items = data?.map(transformTimesheet) ?? []

      // Filter by company if specified (requires checking through placement->job->account_id)
      if (input.companyId && data) {
        items = items.filter(t => {
          const placement = (t as unknown as Record<string, unknown>).placement as Record<string, unknown> | null
          if (!placement) return false
          const job = placement.job as Record<string, unknown> | null
          if (!job) return false
          return job.account_id === input.companyId
        })
      }

      return items
    }),

  // Get unpaid timesheets (for payroll)
  getUnpaid: orgProtectedProcedure
    .input(z.object({
      placementId: z.string().uuid().optional(),
      beforeDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('timesheets')
        .select(`
          *,
          placement:placements!placement_id(
            id,
            candidate:contacts!candidate_id(id, first_name, last_name)
          )
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .is('payroll_run_id', null)
        .eq('status', 'approved')

      if (input.placementId) {
        query = query.eq('placement_id', input.placementId)
      }

      if (input.beforeDate) {
        query = query.lte('period_end', input.beforeDate)
      }

      query = query.order('period_start', { ascending: true })

      const { data, error } = await query

      if (error) {
        console.error('Failed to get unpaid timesheets:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformTimesheet) ?? []
    }),

  // Get active placements for timesheet creation
  getActivePlacements: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const query = adminClient
        .from('placements')
        .select(`
          id,
          status,
          start_date,
          end_date,
          bill_rate,
          pay_rate,
          job:jobs!job_id(id, title, account:companies!account_id(id, legal_name)),
          candidate:contacts!candidate_id(id, first_name, last_name)
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .in('status', ['active', 'pending'])
        .order('start_date', { ascending: false })
        .limit(input.limit)

      const { data, error } = await query

      if (error) {
        console.error('Failed to get active placements:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Transform and filter by search if provided
      let items = (data ?? []).map((p: Record<string, unknown>) => {
        const job = p.job as Record<string, unknown> | null
        const candidate = p.candidate as Record<string, unknown> | null
        const account = job?.account as Record<string, unknown> | null

        const candidateName = candidate
          ? `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim()
          : 'Unknown Candidate'
        const jobTitle = (job?.title as string) || 'Unknown Job'
        const accountName = (account?.legal_name as string) || 'Unknown Account'

        return {
          id: p.id as string,
          status: p.status as string,
          startDate: p.start_date as string,
          endDate: p.end_date as string | null,
          billRate: p.bill_rate ? Number(p.bill_rate) : 0,
          payRate: p.pay_rate ? Number(p.pay_rate) : 0,
          candidateName,
          jobTitle,
          accountName,
        }
      })

      // Filter by search term if provided
      if (input.search) {
        const searchLower = input.search.toLowerCase()
        items = items.filter(p =>
          p.candidateName.toLowerCase().includes(searchLower) ||
          p.jobTitle.toLowerCase().includes(searchLower) ||
          p.accountName.toLowerCase().includes(searchLower)
        )
      }

      return { items }
    }),

  // Create timesheet with entries and expenses
  create: orgProtectedProcedure
    .input(z.object({
      placementId: z.string().uuid(),
      periodStart: z.string(),
      periodEnd: z.string(),
      periodType: periodTypeEnum.default('weekly'),
      totalRegularHours: z.number().default(0),
      totalOvertimeHours: z.number().default(0),
      totalDoubleTimeHours: z.number().default(0),
      totalPtoHours: z.number().default(0),
      totalHolidayHours: z.number().default(0),
      totalHours: z.number().default(0),
      billRate: z.number().default(0),
      payRate: z.number().default(0),
      totalBillable: z.number().default(0),
      totalPayable: z.number().default(0),
      totalExpenses: z.number().default(0),
      internalNotes: z.string().optional(),
      entries: z.array(z.object({
        workDate: z.string(),
        regularHours: z.number().default(0),
        overtimeHours: z.number().default(0),
        doubleTimeHours: z.number().default(0),
        ptoHours: z.number().default(0),
        holidayHours: z.number().default(0),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        breakMinutes: z.number().optional(),
        projectId: z.string().uuid().optional(),
        taskCode: z.string().optional(),
        costCenter: z.string().optional(),
        isBillable: z.boolean().default(true),
        description: z.string().optional(),
      })).optional(),
      expenses: z.array(z.object({
        expenseDate: z.string(),
        category: expenseCategoryEnum,
        description: z.string(),
        amount: z.number(),
        isBillable: z.boolean().default(true),
        isReimbursable: z.boolean().default(true),
        receiptUrl: z.string().optional(),
        notes: z.string().optional(),
      })).optional(),
      rateSnapshot: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify placement belongs to org
      const { data: placement, error: placementError } = await adminClient
        .from('placements')
        .select('id, org_id, bill_rate, pay_rate')
        .eq('id', input.placementId)
        .eq('org_id', orgId)
        .single()

      if (placementError || !placement) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Placement not found' })
      }

      // Build rate snapshot
      const rateSnapshot = input.rateSnapshot || {
        billRate: input.billRate || placement.bill_rate,
        payRate: input.payRate || placement.pay_rate,
      }

      // Create timesheet
      const { data, error } = await adminClient
        .from('timesheets')
        .insert({
          org_id: orgId,
          placement_id: input.placementId,
          period_start: input.periodStart,
          period_end: input.periodEnd,
          period_type: input.periodType,
          total_regular_hours: input.totalRegularHours,
          total_overtime_hours: input.totalOvertimeHours,
          total_double_time_hours: input.totalDoubleTimeHours,
          total_pto_hours: input.totalPtoHours,
          total_holiday_hours: input.totalHolidayHours,
          total_billable_amount: input.totalBillable,
          total_payable_amount: input.totalPayable,
          rate_snapshot: rateSnapshot,
          internal_notes: input.internalNotes || null,
          status: 'draft',
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'A timesheet already exists for this period' })
        }
        console.error('Failed to create timesheet:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const timesheetId = data.id

      // Insert entries if provided
      if (input.entries && input.entries.length > 0) {
        const entryInserts = input.entries.map(entry => ({
          timesheet_id: timesheetId,
          work_date: entry.workDate,
          regular_hours: entry.regularHours,
          overtime_hours: entry.overtimeHours,
          double_time_hours: entry.doubleTimeHours,
          pto_hours: entry.ptoHours,
          holiday_hours: entry.holidayHours,
          start_time: entry.startTime || null,
          end_time: entry.endTime || null,
          break_minutes: entry.breakMinutes || null,
          project_id: entry.projectId || null,
          task_code: entry.taskCode || null,
          cost_center: entry.costCenter || null,
          is_billable: entry.isBillable,
          bill_rate: input.billRate,
          pay_rate: input.payRate,
          description: entry.description || null,
        }))

        const { error: entryError } = await adminClient
          .from('timesheet_entries')
          .insert(entryInserts)

        if (entryError) {
          console.error('Failed to create timesheet entries:', entryError)
          // Don't fail the whole operation, log the error
        }
      }

      // Insert expenses if provided
      if (input.expenses && input.expenses.length > 0) {
        const expenseInserts = input.expenses.map(expense => ({
          timesheet_id: timesheetId,
          expense_date: expense.expenseDate,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          is_billable: expense.isBillable,
          is_reimbursable: expense.isReimbursable,
          receipt_url: expense.receiptUrl || null,
          notes: expense.notes || null,
        }))

        const { error: expenseError } = await adminClient
          .from('timesheet_expenses')
          .insert(expenseInserts)

        if (expenseError) {
          console.error('Failed to create timesheet expenses:', expenseError)
          // Don't fail the whole operation, log the error
        }
      }

      return { id: timesheetId }
    }),

  // Update timesheet (only draft status)
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      periodStart: z.string().optional(),
      periodEnd: z.string().optional(),
      periodType: periodTypeEnum.optional(),
      rateSnapshot: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify timesheet exists and is in draft status
      const { data: existing } = await adminClient
        .from('timesheets')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
      }

      if (existing.status !== 'draft') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only update draft timesheets' })
      }

      const { id, ...updateData } = input

      const dbUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      }

      if (updateData.periodStart !== undefined) dbUpdate.period_start = updateData.periodStart
      if (updateData.periodEnd !== undefined) dbUpdate.period_end = updateData.periodEnd
      if (updateData.periodType !== undefined) dbUpdate.period_type = updateData.periodType
      if (updateData.rateSnapshot !== undefined) dbUpdate.rate_snapshot = updateData.rateSnapshot

      const { error } = await adminClient
        .from('timesheets')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update timesheet:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Delete timesheet (soft delete, only draft)
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify timesheet exists and is in draft status
      const { data: existing } = await adminClient
        .from('timesheets')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
      }

      if (existing.status !== 'draft') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only delete draft timesheets' })
      }

      const { error } = await adminClient
        .from('timesheets')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete timesheet:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Submit timesheet for approval
  submit: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      rateSnapshot: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify timesheet exists and is in draft status
      const { data: existing } = await adminClient
        .from('timesheets')
        .select('id, status, total_regular_hours, total_overtime_hours, total_double_time_hours')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
      }

      if (existing.status !== 'draft') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Timesheet is not in draft status' })
      }

      // Verify there are entries
      const totalHours = Number(existing.total_regular_hours || 0) +
                         Number(existing.total_overtime_hours || 0) +
                         Number(existing.total_double_time_hours || 0)

      if (totalHours === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot submit timesheet with no hours' })
      }

      const { error } = await adminClient
        .from('timesheets')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          submitted_by: user?.id,
          rate_snapshot: input.rateSnapshot,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to submit timesheet:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Approve timesheet (client or internal)
  approve: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      approvalType: z.enum(['client', 'internal']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get current timesheet status
      const { data: existing } = await adminClient
        .from('timesheets')
        .select('id, status, client_approval_status, internal_approval_status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
      }

      const validStatuses = ['submitted', 'pending_client_approval', 'client_approved', 'pending_internal_approval']
      if (!validStatuses.includes(existing.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Timesheet is not pending approval' })
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      }

      if (input.approvalType === 'client') {
        updateData.client_approval_status = 'approved'
        updateData.client_approved_at = new Date().toISOString()
        updateData.client_approved_by = user?.id
        updateData.client_approval_notes = input.notes || null
        updateData.status = 'client_approved'
      } else {
        updateData.internal_approval_status = 'approved'
        updateData.internal_approved_at = new Date().toISOString()
        updateData.internal_approved_by = user?.id
        updateData.internal_approval_notes = input.notes || null

        // If client is also approved, mark as fully approved
        if (existing.client_approval_status === 'approved') {
          updateData.status = 'approved'
        } else {
          updateData.status = 'internal_approved'
        }
      }

      // Check if both are now approved
      if (input.approvalType === 'client' && existing.internal_approval_status === 'approved') {
        updateData.status = 'approved'
      }

      const { error } = await adminClient
        .from('timesheets')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to approve timesheet:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Reject timesheet
  reject: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      approvalType: z.enum(['client', 'internal']),
      reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data: existing } = await adminClient
        .from('timesheets')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      }

      if (input.approvalType === 'client') {
        updateData.client_approval_status = 'rejected'
        updateData.client_approved_at = new Date().toISOString()
        updateData.client_approved_by = user?.id
        updateData.client_approval_notes = input.reason
        updateData.status = 'client_rejected'
      } else {
        updateData.internal_approval_status = 'rejected'
        updateData.internal_approved_at = new Date().toISOString()
        updateData.internal_approved_by = user?.id
        updateData.internal_approval_notes = input.reason
        updateData.status = 'internal_rejected'
      }

      const { error } = await adminClient
        .from('timesheets')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to reject timesheet:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Void timesheet
  void: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data: existing } = await adminClient
        .from('timesheets')
        .select('id, status, invoice_id, payroll_run_id')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
      }

      // Cannot void if already invoiced or paid
      if (existing.invoice_id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot void timesheet that has been invoiced' })
      }

      if (existing.payroll_run_id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot void timesheet that has been paid' })
      }

      const { error } = await adminClient
        .from('timesheets')
        .update({
          status: 'void',
          internal_approval_notes: `Voided: ${input.reason}`,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to void timesheet:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Mark as processed (linked to invoice/payroll)
  markProcessed: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      invoiceId: z.string().uuid().optional(),
      payrollRunId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      }

      if (input.invoiceId) {
        updateData.invoice_id = input.invoiceId
      }

      if (input.payrollRunId) {
        updateData.payroll_run_id = input.payrollRunId
      }

      // If both invoice and payroll are set, mark as processed
      const { data: existing } = await adminClient
        .from('timesheets')
        .select('invoice_id, payroll_run_id')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (existing) {
        const willHaveInvoice = input.invoiceId || existing.invoice_id
        const willHavePayroll = input.payrollRunId || existing.payroll_run_id

        if (willHaveInvoice && willHavePayroll) {
          updateData.status = 'processed'
          updateData.processed_at = new Date().toISOString()
          updateData.processed_by = user?.id
        }
      }

      const { error } = await adminClient
        .from('timesheets')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to mark timesheet processed:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Timesheet statistics
  stats: orgProtectedProcedure
    .input(z.object({
      placementId: z.string().uuid().optional(),
      periodStart: z.string().optional(),
      periodEnd: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('timesheets')
        .select('id, status, total_billable_amount, total_payable_amount, invoice_id, payroll_run_id')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.placementId) {
        query = query.eq('placement_id', input.placementId)
      }
      if (input?.periodStart) {
        query = query.gte('period_start', input.periodStart)
      }
      if (input?.periodEnd) {
        query = query.lte('period_end', input.periodEnd)
      }

      const { data: items } = await query

      const byStatus = items?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const totalBillable = items?.reduce((sum, item) =>
        sum + (item.total_billable_amount ? Number(item.total_billable_amount) : 0), 0) || 0

      const totalPayable = items?.reduce((sum, item) =>
        sum + (item.total_payable_amount ? Number(item.total_payable_amount) : 0), 0) || 0

      return {
        total: items?.length ?? 0,
        draft: byStatus['draft'] ?? 0,
        submitted: byStatus['submitted'] ?? 0,
        pendingApproval: (byStatus['pending_client_approval'] ?? 0) + (byStatus['pending_internal_approval'] ?? 0),
        approved: byStatus['approved'] ?? 0,
        rejected: (byStatus['client_rejected'] ?? 0) + (byStatus['internal_rejected'] ?? 0),
        processed: byStatus['processed'] ?? 0,
        void: byStatus['void'] ?? 0,
        uninvoiced: items?.filter(i => i.status === 'approved' && !i.invoice_id).length ?? 0,
        unpaid: items?.filter(i => i.status === 'approved' && !i.payroll_run_id).length ?? 0,
        totalBillable,
        totalPayable,
        byStatus,
      }
    }),

  // ==========================================
  // ENTRIES - Timesheet entry operations
  // ==========================================
  entries: router({
    // List entries for a timesheet
    list: orgProtectedProcedure
      .input(z.object({
        timesheetId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        const { data, error } = await adminClient
          .from('timesheet_entries')
          .select('*')
          .eq('timesheet_id', input.timesheetId)
          .order('work_date', { ascending: true })

        if (error) {
          console.error('Failed to list timesheet entries:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformTimesheetEntry) ?? []
      }),

    // Create or update entry (upsert by date)
    upsert: orgProtectedProcedure
      .input(z.object({
        timesheetId: z.string().uuid(),
        workDate: z.string(),
        regularHours: z.number().min(0).max(24).default(0),
        overtimeHours: z.number().min(0).max(24).default(0),
        doubleTimeHours: z.number().min(0).max(24).default(0),
        ptoHours: z.number().min(0).max(24).default(0),
        holidayHours: z.number().min(0).max(24).default(0),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        breakMinutes: z.number().min(0).max(480).optional(),
        projectId: z.string().uuid().optional(),
        taskCode: z.string().max(50).optional(),
        costCenter: z.string().max(50).optional(),
        isBillable: z.boolean().default(true),
        billRate: z.number().optional(),
        payRate: z.number().optional(),
        description: z.string().optional(),
        internalNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org and is in draft status
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id, status')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        if (timesheet.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only modify entries in draft timesheets' })
        }

        const { data, error } = await adminClient
          .from('timesheet_entries')
          .upsert({
            timesheet_id: input.timesheetId,
            work_date: input.workDate,
            regular_hours: input.regularHours,
            overtime_hours: input.overtimeHours,
            double_time_hours: input.doubleTimeHours,
            pto_hours: input.ptoHours,
            holiday_hours: input.holidayHours,
            start_time: input.startTime || null,
            end_time: input.endTime || null,
            break_minutes: input.breakMinutes ?? 0,
            project_id: input.projectId || null,
            task_code: input.taskCode || null,
            cost_center: input.costCenter || null,
            is_billable: input.isBillable,
            bill_rate: input.billRate ?? null,
            pay_rate: input.payRate ?? null,
            description: input.description || null,
            internal_notes: input.internalNotes || null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'timesheet_id,work_date',
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to upsert timesheet entry:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Bulk upsert entries (for grid editing)
    bulkUpsert: orgProtectedProcedure
      .input(z.object({
        timesheetId: z.string().uuid(),
        entries: z.array(z.object({
          workDate: z.string(),
          regularHours: z.number().min(0).max(24).default(0),
          overtimeHours: z.number().min(0).max(24).default(0),
          doubleTimeHours: z.number().min(0).max(24).default(0),
          ptoHours: z.number().min(0).max(24).default(0),
          holidayHours: z.number().min(0).max(24).default(0),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          breakMinutes: z.number().min(0).max(480).optional(),
          projectId: z.string().uuid().optional(),
          taskCode: z.string().max(50).optional(),
          costCenter: z.string().max(50).optional(),
          isBillable: z.boolean().default(true),
          billRate: z.number().optional(),
          payRate: z.number().optional(),
          description: z.string().optional(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org and is in draft status
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id, status')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        if (timesheet.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only modify entries in draft timesheets' })
        }

        const entriesToUpsert = input.entries.map(entry => ({
          timesheet_id: input.timesheetId,
          work_date: entry.workDate,
          regular_hours: entry.regularHours,
          overtime_hours: entry.overtimeHours,
          double_time_hours: entry.doubleTimeHours,
          pto_hours: entry.ptoHours,
          holiday_hours: entry.holidayHours,
          start_time: entry.startTime || null,
          end_time: entry.endTime || null,
          break_minutes: entry.breakMinutes ?? 0,
          project_id: entry.projectId || null,
          task_code: entry.taskCode || null,
          cost_center: entry.costCenter || null,
          is_billable: entry.isBillable,
          bill_rate: entry.billRate ?? null,
          pay_rate: entry.payRate ?? null,
          description: entry.description || null,
          updated_at: new Date().toISOString(),
        }))

        const { error } = await adminClient
          .from('timesheet_entries')
          .upsert(entriesToUpsert, {
            onConflict: 'timesheet_id,work_date',
          })

        if (error) {
          console.error('Failed to bulk upsert timesheet entries:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true, count: input.entries.length }
      }),

    // Delete entry
    delete: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        timesheetId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org and is in draft status
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id, status')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        if (timesheet.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only modify entries in draft timesheets' })
        }

        const { error } = await adminClient
          .from('timesheet_entries')
          .delete()
          .eq('id', input.id)
          .eq('timesheet_id', input.timesheetId)

        if (error) {
          console.error('Failed to delete timesheet entry:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // EXPENSES - Expense tracking
  // ==========================================
  expenses: router({
    // List expenses for a timesheet
    list: orgProtectedProcedure
      .input(z.object({
        timesheetId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        const { data, error } = await adminClient
          .from('timesheet_expenses')
          .select(`
            *,
            verifier:user_profiles!verified_by(id, full_name)
          `)
          .eq('timesheet_id', input.timesheetId)
          .order('expense_date', { ascending: true })

        if (error) {
          console.error('Failed to list timesheet expenses:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformTimesheetExpense) ?? []
      }),

    // Add expense
    create: orgProtectedProcedure
      .input(z.object({
        timesheetId: z.string().uuid(),
        expenseDate: z.string(),
        category: expenseCategoryEnum,
        description: z.string().min(1),
        amount: z.number().positive(),
        isBillable: z.boolean().default(true),
        isReimbursable: z.boolean().default(true),
        receiptUrl: z.string().url().optional().or(z.literal('')),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org and is in draft status
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id, status')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        if (timesheet.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only add expenses to draft timesheets' })
        }

        const { data, error } = await adminClient
          .from('timesheet_expenses')
          .insert({
            timesheet_id: input.timesheetId,
            expense_date: input.expenseDate,
            category: input.category,
            description: input.description,
            amount: input.amount,
            is_billable: input.isBillable,
            is_reimbursable: input.isReimbursable,
            receipt_url: input.receiptUrl || null,
            notes: input.notes || null,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create timesheet expense:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update expense
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        timesheetId: z.string().uuid(),
        expenseDate: z.string().optional(),
        category: expenseCategoryEnum.optional(),
        description: z.string().min(1).optional(),
        amount: z.number().positive().optional(),
        isBillable: z.boolean().optional(),
        isReimbursable: z.boolean().optional(),
        receiptUrl: z.string().url().optional().or(z.literal('')),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org and is in draft status
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id, status')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        if (timesheet.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only modify expenses in draft timesheets' })
        }

        const { id, timesheetId, ...updateData } = input
        const dbUpdate: Record<string, unknown> = {}

        if (updateData.expenseDate !== undefined) dbUpdate.expense_date = updateData.expenseDate
        if (updateData.category !== undefined) dbUpdate.category = updateData.category
        if (updateData.description !== undefined) dbUpdate.description = updateData.description
        if (updateData.amount !== undefined) dbUpdate.amount = updateData.amount
        if (updateData.isBillable !== undefined) dbUpdate.is_billable = updateData.isBillable
        if (updateData.isReimbursable !== undefined) dbUpdate.is_reimbursable = updateData.isReimbursable
        if (updateData.receiptUrl !== undefined) dbUpdate.receipt_url = updateData.receiptUrl || null
        if (updateData.notes !== undefined) dbUpdate.notes = updateData.notes

        const { error } = await adminClient
          .from('timesheet_expenses')
          .update(dbUpdate)
          .eq('id', id)
          .eq('timesheet_id', timesheetId)

        if (error) {
          console.error('Failed to update timesheet expense:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete expense
    delete: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        timesheetId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org and is in draft status
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id, status')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        if (timesheet.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only delete expenses from draft timesheets' })
        }

        const { error } = await adminClient
          .from('timesheet_expenses')
          .delete()
          .eq('id', input.id)
          .eq('timesheet_id', input.timesheetId)

        if (error) {
          console.error('Failed to delete timesheet expense:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Verify receipt
    verifyReceipt: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        timesheetId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        const { error } = await adminClient
          .from('timesheet_expenses')
          .update({
            receipt_verified: true,
            verified_by: user?.id,
            verified_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('timesheet_id', input.timesheetId)

        if (error) {
          console.error('Failed to verify receipt:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // APPROVALS - Approval workflow records
  // ==========================================
  approvals: router({
    // List approvals for a timesheet
    list: orgProtectedProcedure
      .input(z.object({
        timesheetId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        const { data, error } = await adminClient
          .from('timesheet_approvals')
          .select(`
            *,
            approver:user_profiles!approver_id(id, full_name),
            delegator:user_profiles!delegated_from(id, full_name)
          `)
          .eq('timesheet_id', input.timesheetId)
          .order('approval_level', { ascending: true })

        if (error) {
          console.error('Failed to list timesheet approvals:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformTimesheetApproval) ?? []
      }),

    // Create approval record
    create: orgProtectedProcedure
      .input(z.object({
        timesheetId: z.string().uuid(),
        approvalLevel: z.number().int().min(1),
        approverType: z.string(),
        approverId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify timesheet belongs to org
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id')
          .eq('id', input.timesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        const { data, error } = await adminClient
          .from('timesheet_approvals')
          .insert({
            timesheet_id: input.timesheetId,
            approval_level: input.approvalLevel,
            approver_type: input.approverType,
            approver_id: input.approverId || null,
            status: 'pending',
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new TRPCError({ code: 'CONFLICT', message: 'Approval record already exists for this level' })
          }
          console.error('Failed to create approval record:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Record decision
    decide: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: approvalStatusEnum,
        comments: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('timesheet_approvals')
          .update({
            status: input.status,
            decision_at: new Date().toISOString(),
            approver_id: user?.id,
            comments: input.comments || null,
          })
          .eq('id', input.id)

        if (error) {
          console.error('Failed to record approval decision:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delegate approval
    delegate: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        delegateTo: z.string().uuid(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('timesheet_approvals')
          .update({
            status: 'delegated',
            approver_id: input.delegateTo,
            delegated_from: user?.id,
            delegated_reason: input.reason || null,
          })
          .eq('id', input.id)

        if (error) {
          console.error('Failed to delegate approval:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // ADJUSTMENTS - Post-approval corrections
  // ==========================================
  adjustments: router({
    // List adjustments
    list: orgProtectedProcedure
      .input(z.object({
        originalTimesheetId: z.string().uuid().optional(),
        status: adjustmentStatusEnum.optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('timesheet_adjustments')
          .select(`
            *,
            requester:user_profiles!requested_by(id, full_name),
            approver:user_profiles!approved_by(id, full_name),
            original_timesheet:timesheets!original_timesheet_id(id, period_start, period_end)
          `, { count: 'exact' })
          .eq('org_id', orgId)

        if (input.originalTimesheetId) {
          query = query.eq('original_timesheet_id', input.originalTimesheetId)
        }
        if (input.status) {
          query = query.eq('status', input.status)
        }

        query = query
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list adjustments:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformTimesheetAdjustment) ?? [],
          total: count ?? 0,
        }
      }),

    // Request adjustment
    create: orgProtectedProcedure
      .input(z.object({
        originalTimesheetId: z.string().uuid(),
        adjustmentType: adjustmentTypeEnum,
        reason: z.string().min(1),
        hoursDelta: z.number().optional(),
        amountDelta: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Verify original timesheet belongs to org and is approved
        const { data: timesheet } = await adminClient
          .from('timesheets')
          .select('id, status')
          .eq('id', input.originalTimesheetId)
          .eq('org_id', orgId)
          .single()

        if (!timesheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Timesheet not found' })
        }

        if (timesheet.status !== 'approved' && timesheet.status !== 'processed') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only adjust approved or processed timesheets' })
        }

        const { data, error } = await adminClient
          .from('timesheet_adjustments')
          .insert({
            org_id: orgId,
            original_timesheet_id: input.originalTimesheetId,
            adjustment_type: input.adjustmentType,
            reason: input.reason,
            hours_delta: input.hoursDelta ?? null,
            amount_delta: input.amountDelta ?? null,
            requested_by: user!.id,
            status: 'pending',
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create adjustment:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Approve adjustment
    approve: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('timesheet_adjustments')
          .update({
            status: 'approved',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to approve adjustment:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Reject adjustment
    reject: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('timesheet_adjustments')
          .update({
            status: 'rejected',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to reject adjustment:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // TEMPLATES - Timesheet templates
  // ==========================================
  templates: router({
    // List templates
    list: orgProtectedProcedure
      .input(z.object({
        isActive: z.boolean().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('timesheet_templates')
          .select('*', { count: 'exact' })
          .eq('org_id', orgId)

        if (input.isActive !== undefined) {
          query = query.eq('is_active', input.isActive)
        }
        if (input.search) {
          query = query.ilike('name', `%${input.search}%`)
        }

        query = query
          .order('name')
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list templates:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformTimesheetTemplate) ?? [],
          total: count ?? 0,
        }
      }),

    // Get single template
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('timesheet_templates')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
        }

        return transformTimesheetTemplate(data)
      }),

    // Create template
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        periodType: periodTypeEnum.default('weekly'),
        defaultHoursPerDay: z.number().min(0).max(24).default(8),
        defaultDaysPerWeek: z.number().int().min(1).max(7).default(5),
        defaultEntries: z.array(z.record(z.unknown())).optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // If setting as default, clear other defaults
        if (input.isDefault) {
          await adminClient
            .from('timesheet_templates')
            .update({ is_default: false })
            .eq('org_id', orgId)
        }

        const { data, error } = await adminClient
          .from('timesheet_templates')
          .insert({
            org_id: orgId,
            name: input.name,
            description: input.description || null,
            period_type: input.periodType,
            default_hours_per_day: input.defaultHoursPerDay,
            default_days_per_week: input.defaultDaysPerWeek,
            default_entries: input.defaultEntries || [],
            is_default: input.isDefault,
            is_active: true,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create template:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update template
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        periodType: periodTypeEnum.optional(),
        defaultHoursPerDay: z.number().min(0).max(24).optional(),
        defaultDaysPerWeek: z.number().int().min(1).max(7).optional(),
        defaultEntries: z.array(z.record(z.unknown())).optional(),
        isDefault: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // If setting as default, clear other defaults
        if (input.isDefault === true) {
          await adminClient
            .from('timesheet_templates')
            .update({ is_default: false })
            .eq('org_id', orgId)
        }

        const { id, ...updateData } = input
        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.name !== undefined) dbUpdate.name = updateData.name
        if (updateData.description !== undefined) dbUpdate.description = updateData.description
        if (updateData.periodType !== undefined) dbUpdate.period_type = updateData.periodType
        if (updateData.defaultHoursPerDay !== undefined) dbUpdate.default_hours_per_day = updateData.defaultHoursPerDay
        if (updateData.defaultDaysPerWeek !== undefined) dbUpdate.default_days_per_week = updateData.defaultDaysPerWeek
        if (updateData.defaultEntries !== undefined) dbUpdate.default_entries = updateData.defaultEntries
        if (updateData.isDefault !== undefined) dbUpdate.is_default = updateData.isDefault
        if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive

        const { error } = await adminClient
          .from('timesheet_templates')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update template:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete template
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('timesheet_templates')
          .delete()
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete template:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // WORKFLOWS - Approval workflow configuration
  // ==========================================
  workflows: router({
    // List workflows
    list: orgProtectedProcedure
      .input(z.object({
        isActive: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('timesheet_approval_workflows')
          .select('*')
          .eq('org_id', orgId)

        if (input.isActive !== undefined) {
          query = query.eq('is_active', input.isActive)
        }

        query = query.order('name')

        const { data, error } = await query

        if (error) {
          console.error('Failed to list workflows:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformApprovalWorkflow) ?? []
      }),

    // Get default workflow
    getDefault: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('timesheet_approval_workflows')
          .select('*')
          .eq('org_id', orgId)
          .eq('is_default', true)
          .eq('is_active', true)
          .single()

        if (error || !data) {
          return null
        }

        return transformApprovalWorkflow(data)
      }),

    // Create workflow
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        approvalLevels: z.array(z.record(z.unknown())),
        autoApproveUnderHours: z.number().positive().optional(),
        autoApproveIfMatchesSchedule: z.boolean().default(false),
        escalationHours: z.number().int().min(1).default(48),
        escalationTo: z.string().uuid().optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // If setting as default, clear other defaults
        if (input.isDefault) {
          await adminClient
            .from('timesheet_approval_workflows')
            .update({ is_default: false })
            .eq('org_id', orgId)
        }

        const { data, error } = await adminClient
          .from('timesheet_approval_workflows')
          .insert({
            org_id: orgId,
            name: input.name,
            description: input.description || null,
            approval_levels: input.approvalLevels,
            auto_approve_under_hours: input.autoApproveUnderHours ?? null,
            auto_approve_if_matches_schedule: input.autoApproveIfMatchesSchedule,
            escalation_hours: input.escalationHours,
            escalation_to: input.escalationTo || null,
            is_default: input.isDefault,
            is_active: true,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create workflow:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update workflow
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        approvalLevels: z.array(z.record(z.unknown())).optional(),
        autoApproveUnderHours: z.number().positive().optional().nullable(),
        autoApproveIfMatchesSchedule: z.boolean().optional(),
        escalationHours: z.number().int().min(1).optional(),
        escalationTo: z.string().uuid().optional().nullable(),
        isDefault: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // If setting as default, clear other defaults
        if (input.isDefault === true) {
          await adminClient
            .from('timesheet_approval_workflows')
            .update({ is_default: false })
            .eq('org_id', orgId)
        }

        const { id, ...updateData } = input
        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.name !== undefined) dbUpdate.name = updateData.name
        if (updateData.description !== undefined) dbUpdate.description = updateData.description
        if (updateData.approvalLevels !== undefined) dbUpdate.approval_levels = updateData.approvalLevels
        if (updateData.autoApproveUnderHours !== undefined) dbUpdate.auto_approve_under_hours = updateData.autoApproveUnderHours
        if (updateData.autoApproveIfMatchesSchedule !== undefined) dbUpdate.auto_approve_if_matches_schedule = updateData.autoApproveIfMatchesSchedule
        if (updateData.escalationHours !== undefined) dbUpdate.escalation_hours = updateData.escalationHours
        if (updateData.escalationTo !== undefined) dbUpdate.escalation_to = updateData.escalationTo
        if (updateData.isDefault !== undefined) dbUpdate.is_default = updateData.isDefault
        if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive

        const { error } = await adminClient
          .from('timesheet_approval_workflows')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update workflow:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete workflow
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('timesheet_approval_workflows')
          .delete()
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete workflow:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),
})
