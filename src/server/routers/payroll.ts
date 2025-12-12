import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// PAYROLL-01: Payroll Management Router
// Pay runs, pay items, tax setup, benefits
// ============================================

// ============================================
// INPUT SCHEMAS
// ============================================

const payRunStatusEnum = z.enum([
  'draft', 'calculating', 'pending_approval', 'approved',
  'submitted', 'processing', 'completed', 'void'
])

const payRunTypeEnum = z.enum([
  'regular', 'off_cycle', 'bonus', 'final', 'correction'
])

const workerTypeEnum = z.enum([
  'employee', 'consultant', 'contractor'
])

const _payTypeEnum = z.enum([
  'hourly', 'salary', 'commission', 'bonus', 'reimbursement'
])

const periodTypeEnum = z.enum([
  'weekly', 'bi_weekly', 'semi_monthly', 'monthly'
])

const payPeriodStatusEnum = z.enum([
  'upcoming', 'current', 'processing', 'closed'
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

function transformPayRun(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    payPeriodId: item.pay_period_id as string,
    runNumber: item.run_number as string,
    runType: item.run_type as string,
    checkDate: item.check_date as string,
    directDepositDate: item.direct_deposit_date as string | null,
    totalGross: item.total_gross ? Number(item.total_gross) : 0,
    totalEmployerTaxes: item.total_employer_taxes ? Number(item.total_employer_taxes) : 0,
    totalEmployeeTaxes: item.total_employee_taxes ? Number(item.total_employee_taxes) : 0,
    totalDeductions: item.total_deductions ? Number(item.total_deductions) : 0,
    totalNet: item.total_net ? Number(item.total_net) : 0,
    totalEmployerCost: item.total_employer_cost ? Number(item.total_employer_cost) : 0,
    employeeCount: item.employee_count as number,
    consultantCount: item.consultant_count as number,
    contractorCount: item.contractor_count as number,
    status: item.status as string,
    calculatedAt: item.calculated_at as string | null,
    approvedAt: item.approved_at as string | null,
    approvedBy: item.approved_by as string | null,
    submittedAt: item.submitted_at as string | null,
    processedAt: item.processed_at as string | null,
    payrollProvider: item.payroll_provider as string | null,
    externalRunId: item.external_run_id as string | null,
    notes: item.notes as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    createdBy: item.created_by as string | null,
    // Joined relations
    payPeriod: item.pay_period,
    approver: item.approver,
    payItems: item.pay_items,
  }
}

function transformPayItem(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    payRunId: item.pay_run_id as string,
    workerType: item.worker_type as string,
    workerId: item.worker_id as string,
    contactId: item.contact_id as string | null,
    payType: item.pay_type as string,
    timesheetIds: item.timesheet_ids as string[] | null,
    // Hours
    regularHours: item.regular_hours ? Number(item.regular_hours) : 0,
    overtimeHours: item.overtime_hours ? Number(item.overtime_hours) : 0,
    doubleTimeHours: item.double_time_hours ? Number(item.double_time_hours) : 0,
    ptoHours: item.pto_hours ? Number(item.pto_hours) : 0,
    holidayHours: item.holiday_hours ? Number(item.holiday_hours) : 0,
    totalHours: item.total_hours ? Number(item.total_hours) : 0,
    // Rates
    regularRate: item.regular_rate ? Number(item.regular_rate) : null,
    overtimeRate: item.overtime_rate ? Number(item.overtime_rate) : null,
    doubleTimeRate: item.double_time_rate ? Number(item.double_time_rate) : null,
    // Earnings
    regularEarnings: item.regular_earnings ? Number(item.regular_earnings) : 0,
    overtimeEarnings: item.overtime_earnings ? Number(item.overtime_earnings) : 0,
    doubleTimeEarnings: item.double_time_earnings ? Number(item.double_time_earnings) : 0,
    ptoEarnings: item.pto_earnings ? Number(item.pto_earnings) : 0,
    holidayEarnings: item.holiday_earnings ? Number(item.holiday_earnings) : 0,
    bonusEarnings: item.bonus_earnings ? Number(item.bonus_earnings) : 0,
    otherEarnings: item.other_earnings ? Number(item.other_earnings) : 0,
    grossPay: item.gross_pay ? Number(item.gross_pay) : 0,
    // Employee taxes
    federalIncomeTax: item.federal_income_tax ? Number(item.federal_income_tax) : 0,
    stateIncomeTax: item.state_income_tax ? Number(item.state_income_tax) : 0,
    localIncomeTax: item.local_income_tax ? Number(item.local_income_tax) : 0,
    socialSecurityTax: item.social_security_tax ? Number(item.social_security_tax) : 0,
    medicareTax: item.medicare_tax ? Number(item.medicare_tax) : 0,
    totalEmployeeTaxes: item.total_employee_taxes ? Number(item.total_employee_taxes) : 0,
    // Employer taxes
    employerSocialSecurity: item.employer_social_security ? Number(item.employer_social_security) : 0,
    employerMedicare: item.employer_medicare ? Number(item.employer_medicare) : 0,
    employerFuta: item.employer_futa ? Number(item.employer_futa) : 0,
    employerSuta: item.employer_suta ? Number(item.employer_suta) : 0,
    totalEmployerTaxes: item.total_employer_taxes ? Number(item.total_employer_taxes) : 0,
    // Deductions
    preTaxDeductions: item.pre_tax_deductions ? Number(item.pre_tax_deductions) : 0,
    postTaxDeductions: item.post_tax_deductions ? Number(item.post_tax_deductions) : 0,
    garnishments: item.garnishments ? Number(item.garnishments) : 0,
    totalDeductions: item.total_deductions ? Number(item.total_deductions) : 0,
    // Net pay
    netPay: item.net_pay ? Number(item.net_pay) : 0,
    // Payment
    paymentMethod: item.payment_method as string,
    bankAccountLast4: item.bank_account_last4 as string | null,
    checkNumber: item.check_number as string | null,
    status: item.status as string,
    // YTD
    ytdGross: item.ytd_gross ? Number(item.ytd_gross) : null,
    ytdFederalTax: item.ytd_federal_tax ? Number(item.ytd_federal_tax) : null,
    ytdStateTax: item.ytd_state_tax ? Number(item.ytd_state_tax) : null,
    ytdSocialSecurity: item.ytd_social_security ? Number(item.ytd_social_security) : null,
    ytdMedicare: item.ytd_medicare ? Number(item.ytd_medicare) : null,
    createdAt: item.created_at as string,
    // Joined relations
    contact: item.contact,
    earnings: item.earnings,
    deductions: item.deductions,
  }
}

function transformPayPeriod(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    periodNumber: item.period_number as number,
    year: item.year as number,
    periodStart: item.period_start as string,
    periodEnd: item.period_end as string,
    payDate: item.pay_date as string,
    periodType: item.period_type as string,
    status: item.status as string,
    timesheetCutoff: item.timesheet_cutoff as string | null,
    createdAt: item.created_at as string,
  }
}

function transformWorkerTaxSetup(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    contactId: item.contact_id as string,
    // Federal
    federalFilingStatus: item.federal_filing_status as string | null,
    federalAllowances: item.federal_allowances as number,
    additionalFederalWithholding: item.additional_federal_withholding ? Number(item.additional_federal_withholding) : 0,
    federalExempt: item.federal_exempt as boolean,
    // State
    workState: item.work_state as string,
    stateFilingStatus: item.state_filing_status as string | null,
    stateAllowances: item.state_allowances as number,
    additionalStateWithholding: item.additional_state_withholding ? Number(item.additional_state_withholding) : 0,
    stateExempt: item.state_exempt as boolean,
    // Resident state
    residentState: item.resident_state as string | null,
    residentStateFilingStatus: item.resident_state_filing_status as string | null,
    // Local
    localTaxJurisdiction: item.local_tax_jurisdiction as string | null,
    localTaxRate: item.local_tax_rate ? Number(item.local_tax_rate) : null,
    // FICA
    ficaExempt: item.fica_exempt as boolean,
    // W-4
    w4FormDate: item.w4_form_date as string | null,
    w4MultipleJobs: item.w4_multiple_jobs as boolean,
    w4DependentsCredit: item.w4_dependents_credit ? Number(item.w4_dependents_credit) : 0,
    w4OtherIncome: item.w4_other_income ? Number(item.w4_other_income) : 0,
    w4Deductions: item.w4_deductions ? Number(item.w4_deductions) : 0,
    effectiveDate: item.effective_date as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    // Joined relations
    contact: item.contact,
  }
}

function transformWorkerBenefit(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    contactId: item.contact_id as string,
    benefitType: item.benefit_type as string,
    planName: item.plan_name as string,
    planId: item.plan_id as string | null,
    coverageLevel: item.coverage_level as string | null,
    enrollmentDate: item.enrollment_date as string | null,
    terminationDate: item.termination_date as string | null,
    employeeContribution: item.employee_contribution ? Number(item.employee_contribution) : 0,
    employerContribution: item.employer_contribution ? Number(item.employer_contribution) : 0,
    contributionFrequency: item.contribution_frequency as string,
    isPreTax: item.is_pre_tax as boolean,
    annualLimit: item.annual_limit ? Number(item.annual_limit) : null,
    ytdContribution: item.ytd_contribution ? Number(item.ytd_contribution) : 0,
    isActive: item.is_active as boolean,
    createdAt: item.created_at as string,
    // Joined relations
    contact: item.contact,
  }
}

async function generatePayRunNumber(adminClient: ReturnType<typeof getAdminClient>, orgId: string): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const prefix = `PR-${year}-`

  // Get the highest run number for this year
  const { data } = await adminClient
    .from('pay_runs')
    .select('run_number')
    .eq('org_id', orgId)
    .like('run_number', `${prefix}%`)
    .order('run_number', { ascending: false })
    .limit(1)

  let nextNumber = 1
  if (data && data.length > 0) {
    const lastNumber = data[0].run_number.replace(prefix, '')
    nextNumber = parseInt(lastNumber, 10) + 1
  }

  return `${prefix}${nextNumber.toString().padStart(5, '0')}`
}

// ============================================
// PAY RUNS ROUTER
// ============================================

const payRunsRouter = router({
  list: orgProtectedProcedure
    .input(z.object({
      status: payRunStatusEnum.optional(),
      runType: payRunTypeEnum.optional(),
      payPeriodId: z.string().uuid().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['check_date', 'run_number', 'total_gross', 'status', 'created_at']).default('check_date'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const { status, runType, payPeriodId, search, limit = 50, offset = 0, sortBy = 'check_date', sortOrder = 'desc' } = input || {}

      let query = adminClient
        .from('pay_runs')
        .select(`
          *,
          pay_period:pay_periods(id, period_start, period_end, period_type),
          approver:user_profiles!approved_by(id, full_name)
        `, { count: 'exact' })
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)

      if (status) query = query.eq('status', status)
      if (runType) query = query.eq('run_type', runType)
      if (payPeriodId) query = query.eq('pay_period_id', payPeriodId)
      if (search) query = query.ilike('run_number', `%${search}%`)

      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items: (data || []).map(transformPayRun),
        total: count || 0,
      }
    }),

  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('pay_runs')
        .select(`
          *,
          pay_period:pay_periods(*),
          approver:user_profiles!approved_by(id, full_name),
          pay_items(
            *,
            contact:contacts(id, first_name, last_name, email)
          )
        `)
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay run not found' })
      }

      return transformPayRun(data)
    }),

  create: orgProtectedProcedure
    .input(z.object({
      payPeriodId: z.string().uuid(),
      runType: payRunTypeEnum.default('regular'),
      checkDate: z.string(),
      directDepositDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const runNumber = await generatePayRunNumber(adminClient, ctx.orgId)

      const { data, error } = await adminClient
        .from('pay_runs')
        .insert({
          org_id: ctx.orgId,
          pay_period_id: input.payPeriodId,
          run_number: runNumber,
          run_type: input.runType,
          check_date: input.checkDate,
          direct_deposit_date: input.directDepositDate || null,
          status: 'draft',
          notes: input.notes || null,
          created_by: ctx.user?.id,
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return transformPayRun(data)
    }),

  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      checkDate: z.string().optional(),
      directDepositDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Verify ownership and status
      const { data: existing } = await adminClient
        .from('pay_runs')
        .select('status')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay run not found' })
      }

      if (!['draft', 'calculating'].includes(existing.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only update draft or calculating pay runs' })
      }

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (input.checkDate !== undefined) updateData.check_date = input.checkDate
      if (input.directDepositDate !== undefined) updateData.direct_deposit_date = input.directDepositDate
      if (input.notes !== undefined) updateData.notes = input.notes

      const { data, error } = await adminClient
        .from('pay_runs')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return transformPayRun(data)
    }),

  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Verify ownership and status
      const { data: existing } = await adminClient
        .from('pay_runs')
        .select('status')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay run not found' })
      }

      if (existing.status !== 'draft') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only delete draft pay runs' })
      }

      const { error } = await adminClient
        .from('pay_runs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { success: true }
    }),

  // Calculate pay run from timesheets
  calculate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      timesheetIds: z.array(z.string().uuid()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Verify pay run exists and is draft
      const { data: payRun } = await adminClient
        .from('pay_runs')
        .select('*, pay_period:pay_periods(*)')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (!payRun) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay run not found' })
      }

      if (!['draft', 'calculating'].includes(payRun.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pay run must be in draft or calculating status' })
      }

      // Update status to calculating
      await adminClient
        .from('pay_runs')
        .update({ status: 'calculating' })
        .eq('id', input.id)

      // Get approved timesheets for the pay period (not yet linked to a payroll run)
      const period = payRun.pay_period as Record<string, unknown>
      let timesheetQuery = adminClient
        .from('timesheets')
        .select(`
          *,
          placement:placements(
            id,
            pay_rate,
            overtime_pay_rate,
            double_time_pay_rate,
            candidate:contacts!candidate_id(id, first_name, last_name, email)
          )
        `)
        .eq('org_id', ctx.orgId)
        .eq('status', 'approved')
        .is('payroll_run_id', null)
        .is('deleted_at', null)

      if (input.timesheetIds && input.timesheetIds.length > 0) {
        timesheetQuery = timesheetQuery.in('id', input.timesheetIds)
      } else {
        // Get all timesheets within the pay period
        timesheetQuery = timesheetQuery
          .gte('period_end', period.period_start)
          .lte('period_start', period.period_end)
      }

      const { data: timesheets, error: tsError } = await timesheetQuery

      if (tsError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: tsError.message })

      // Delete existing pay items for this run
      await adminClient
        .from('pay_items')
        .delete()
        .eq('pay_run_id', input.id)

      // Group timesheets by worker and calculate pay items
      const workerTimesheets: Record<string, typeof timesheets> = {}
      for (const ts of timesheets || []) {
        const placement = ts.placement as Record<string, unknown>
        const candidate = placement?.candidate as Record<string, unknown>
        const workerId = candidate?.id as string
        if (!workerId) continue

        if (!workerTimesheets[workerId]) {
          workerTimesheets[workerId] = []
        }
        workerTimesheets[workerId].push(ts)
      }

      let totalGross = 0
      let totalNet = 0
      const employeeCount = 0
      let consultantCount = 0

      // Create pay items for each worker
      for (const [workerId, workerTs] of Object.entries(workerTimesheets)) {
        const firstTs = workerTs[0]
        const placement = firstTs.placement as Record<string, unknown>
        const _candidate = placement?.candidate as Record<string, unknown>

        // Aggregate hours from all timesheets
        let regularHours = 0
        let overtimeHours = 0
        let doubleTimeHours = 0
        let ptoHours = 0
        let holidayHours = 0
        const timesheetIds: string[] = []

        for (const ts of workerTs) {
          regularHours += Number(ts.total_regular_hours || 0)
          overtimeHours += Number(ts.total_overtime_hours || 0)
          doubleTimeHours += Number(ts.total_double_time_hours || 0)
          ptoHours += Number(ts.total_pto_hours || 0)
          holidayHours += Number(ts.total_holiday_hours || 0)
          timesheetIds.push(ts.id)
        }

        const regularRate = Number(placement?.pay_rate || 0)
        const overtimeRate = Number(placement?.overtime_pay_rate || regularRate * 1.5)
        const doubleTimeRate = Number(placement?.double_time_pay_rate || regularRate * 2)

        // Calculate earnings
        const regularEarnings = regularHours * regularRate
        const overtimeEarnings = overtimeHours * overtimeRate
        const doubleTimeEarnings = doubleTimeHours * doubleTimeRate
        const ptoEarnings = ptoHours * regularRate
        const holidayEarnings = holidayHours * regularRate
        const grossPay = regularEarnings + overtimeEarnings + doubleTimeEarnings + ptoEarnings + holidayEarnings

        // Simplified tax calculations (in production, use proper tax tables)
        const federalIncomeTax = grossPay * 0.22 // Simplified federal
        const stateIncomeTax = grossPay * 0.05 // Simplified state
        const socialSecurityTax = Math.min(grossPay * 0.062, 160200 * 0.062) // SS cap
        const medicareTax = grossPay * 0.0145
        const totalEmployeeTaxes = federalIncomeTax + stateIncomeTax + socialSecurityTax + medicareTax

        // Employer taxes
        const employerSocialSecurity = Math.min(grossPay * 0.062, 160200 * 0.062)
        const employerMedicare = grossPay * 0.0145
        const employerFuta = Math.min(grossPay * 0.006, 7000 * 0.006)
        const employerSuta = Math.min(grossPay * 0.027, 7000 * 0.027)
        const totalEmployerTaxes = employerSocialSecurity + employerMedicare + employerFuta + employerSuta

        const netPay = grossPay - totalEmployeeTaxes

        // Create pay item
        const { error: itemError } = await adminClient
          .from('pay_items')
          .insert({
            pay_run_id: input.id,
            worker_type: 'consultant',
            worker_id: workerId,
            contact_id: workerId,
            pay_type: 'hourly',
            timesheet_ids: timesheetIds,
            regular_hours: regularHours,
            overtime_hours: overtimeHours,
            double_time_hours: doubleTimeHours,
            pto_hours: ptoHours,
            holiday_hours: holidayHours,
            total_hours: regularHours + overtimeHours + doubleTimeHours + ptoHours + holidayHours,
            regular_rate: regularRate,
            overtime_rate: overtimeRate,
            double_time_rate: doubleTimeRate,
            regular_earnings: regularEarnings,
            overtime_earnings: overtimeEarnings,
            double_time_earnings: doubleTimeEarnings,
            pto_earnings: ptoEarnings,
            holiday_earnings: holidayEarnings,
            gross_pay: grossPay,
            federal_income_tax: federalIncomeTax,
            state_income_tax: stateIncomeTax,
            social_security_tax: socialSecurityTax,
            medicare_tax: medicareTax,
            total_employee_taxes: totalEmployeeTaxes,
            employer_social_security: employerSocialSecurity,
            employer_medicare: employerMedicare,
            employer_futa: employerFuta,
            employer_suta: employerSuta,
            total_employer_taxes: totalEmployerTaxes,
            net_pay: netPay,
            status: 'pending',
          })

        if (itemError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: itemError.message })

        totalGross += grossPay
        totalNet += netPay
        consultantCount++
      }

      // Update pay run totals
      const { data: updatedRun, error: updateError } = await adminClient
        .from('pay_runs')
        .update({
          total_gross: totalGross,
          total_net: totalNet,
          employee_count: employeeCount,
          consultant_count: consultantCount,
          contractor_count: 0,
          status: 'draft',
          calculated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (updateError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })

      return transformPayRun(updatedRun)
    }),

  // Submit for approval
  submitForApproval: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data: existing } = await adminClient
        .from('pay_runs')
        .select('status, total_gross')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay run not found' })
      }

      if (existing.status !== 'draft') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pay run must be in draft status' })
      }

      if (!existing.total_gross || existing.total_gross === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pay run must have calculated pay items' })
      }

      const { data, error } = await adminClient
        .from('pay_runs')
        .update({
          status: 'pending_approval',
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return transformPayRun(data)
    }),

  // Approve pay run
  approve: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data: existing } = await adminClient
        .from('pay_runs')
        .select('status')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay run not found' })
      }

      if (existing.status !== 'pending_approval') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pay run must be pending approval' })
      }

      const { data, error } = await adminClient
        .from('pay_runs')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: ctx.user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return transformPayRun(data)
    }),

  // Process pay run (submit to payroll provider)
  process: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data: payRun } = await adminClient
        .from('pay_runs')
        .select('*, pay_items(*)')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (!payRun) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay run not found' })
      }

      if (payRun.status !== 'approved') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pay run must be approved before processing' })
      }

      // Mark timesheets as processed
      const payItems = payRun.pay_items as Array<Record<string, unknown>>
      const allTimesheetIds: string[] = []
      for (const item of payItems) {
        const tsIds = item.timesheet_ids as string[] | null
        if (tsIds) allTimesheetIds.push(...tsIds)
      }

      if (allTimesheetIds.length > 0) {
        await adminClient
          .from('timesheets')
          .update({
            payroll_run_id: input.id,
            status: 'processed',
            processed_at: new Date().toISOString(),
            processed_by: ctx.user?.id,
          })
          .in('id', allTimesheetIds)
      }

      // Update pay items status
      await adminClient
        .from('pay_items')
        .update({ status: 'processed' })
        .eq('pay_run_id', input.id)

      // Update pay run status
      const { data, error } = await adminClient
        .from('pay_runs')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return transformPayRun(data)
    }),

  // Void pay run
  void: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data: existing } = await adminClient
        .from('pay_runs')
        .select('status')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay run not found' })
      }

      if (existing.status === 'void') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pay run is already voided' })
      }

      // Unlink timesheets
      await adminClient
        .from('timesheets')
        .update({
          payroll_run_id: null,
          status: 'approved', // Reset to approved
          processed_at: null,
          processed_by: null,
        })
        .eq('payroll_run_id', input.id)

      const { data, error } = await adminClient
        .from('pay_runs')
        .update({
          status: 'void',
          notes: `${existing.status === 'completed' ? 'VOIDED: ' : ''}${input.reason}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return transformPayRun(data)
    }),

  // Get pay run statistics
  stats: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()

    const { data: runs } = await adminClient
      .from('pay_runs')
      .select('status, total_gross, total_net')
      .eq('org_id', ctx.orgId)
      .is('deleted_at', null)

    const stats = {
      total: 0,
      draft: 0,
      pendingApproval: 0,
      approved: 0,
      completed: 0,
      ytdGross: 0,
      ytdNet: 0,
      currentMonthGross: 0,
    }

    const _now = new Date()
    const _startOfYear = new Date(_now.getFullYear(), 0, 1)
    const _startOfMonth = new Date(_now.getFullYear(), _now.getMonth(), 1)

    for (const run of runs || []) {
      stats.total++
      if (run.status === 'draft') stats.draft++
      if (run.status === 'pending_approval') stats.pendingApproval++
      if (run.status === 'approved') stats.approved++
      if (run.status === 'completed') {
        stats.completed++
        stats.ytdGross += Number(run.total_gross || 0)
        stats.ytdNet += Number(run.total_net || 0)
      }
    }

    return stats
  }),
})

// ============================================
// PAY ITEMS ROUTER
// ============================================

const payItemsRouter = router({
  list: orgProtectedProcedure
    .input(z.object({
      payRunId: z.string().uuid(),
      workerType: workerTypeEnum.optional(),
      limit: z.number().min(1).max(100).default(100),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Verify pay run belongs to org
      const { data: payRun } = await adminClient
        .from('pay_runs')
        .select('id')
        .eq('id', input.payRunId)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (!payRun) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay run not found' })
      }

      let query = adminClient
        .from('pay_items')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email)
        `, { count: 'exact' })
        .eq('pay_run_id', input.payRunId)

      if (input.workerType) query = query.eq('worker_type', input.workerType)

      query = query.order('gross_pay', { ascending: false })
      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items: (data || []).map(transformPayItem),
        total: count || 0,
      }
    }),

  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('pay_items')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email),
          pay_run:pay_runs!inner(id, org_id)
        `)
        .eq('id', input.id)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay item not found' })
      }

      const payRun = data.pay_run as Record<string, unknown>
      if (payRun.org_id !== ctx.orgId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay item not found' })
      }

      return transformPayItem(data)
    }),

  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      bonusEarnings: z.number().optional(),
      otherEarnings: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Verify access
      const { data: existing } = await adminClient
        .from('pay_items')
        .select('*, pay_run:pay_runs!inner(id, org_id, status)')
        .eq('id', input.id)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay item not found' })
      }

      const payRun = existing.pay_run as Record<string, unknown>
      if (payRun.org_id !== ctx.orgId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay item not found' })
      }

      if (!['draft', 'calculating'].includes(payRun.status as string)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pay run is not editable' })
      }

      const updateData: Record<string, unknown> = {}
      if (input.bonusEarnings !== undefined) updateData.bonus_earnings = input.bonusEarnings
      if (input.otherEarnings !== undefined) updateData.other_earnings = input.otherEarnings

      // Recalculate gross if earnings changed
      if (Object.keys(updateData).length > 0) {
        const newBonusEarnings = input.bonusEarnings ?? Number(existing.bonus_earnings || 0)
        const newOtherEarnings = input.otherEarnings ?? Number(existing.other_earnings || 0)
        const baseEarnings = Number(existing.regular_earnings || 0) +
          Number(existing.overtime_earnings || 0) +
          Number(existing.double_time_earnings || 0) +
          Number(existing.pto_earnings || 0) +
          Number(existing.holiday_earnings || 0)
        updateData.gross_pay = baseEarnings + newBonusEarnings + newOtherEarnings
      }

      const { data, error } = await adminClient
        .from('pay_items')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return transformPayItem(data)
    }),
})

// ============================================
// PAY PERIODS ROUTER
// ============================================

const payPeriodsRouter = router({
  list: orgProtectedProcedure
    .input(z.object({
      year: z.number().optional(),
      status: payPeriodStatusEnum.optional(),
      periodType: periodTypeEnum.optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const { year, status, periodType, limit = 50, offset = 0 } = input || {}

      let query = adminClient
        .from('pay_periods')
        .select('*', { count: 'exact' })
        .eq('org_id', ctx.orgId)

      if (year) query = query.eq('year', year)
      if (status) query = query.eq('status', status)
      if (periodType) query = query.eq('period_type', periodType)

      query = query.order('period_start', { ascending: false })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items: (data || []).map(transformPayPeriod),
        total: count || 0,
      }
    }),

  getCurrent: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await adminClient
      .from('pay_periods')
      .select('*')
      .eq('org_id', ctx.orgId)
      .lte('period_start', today)
      .gte('period_end', today)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    return data ? transformPayPeriod(data) : null
  }),

  create: orgProtectedProcedure
    .input(z.object({
      periodNumber: z.number().min(1).max(52),
      year: z.number().min(2020).max(2100),
      periodStart: z.string(),
      periodEnd: z.string(),
      payDate: z.string(),
      periodType: periodTypeEnum,
      timesheetCutoff: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('pay_periods')
        .insert({
          org_id: ctx.orgId,
          period_number: input.periodNumber,
          year: input.year,
          period_start: input.periodStart,
          period_end: input.periodEnd,
          pay_date: input.payDate,
          period_type: input.periodType,
          status: 'upcoming',
          timesheet_cutoff: input.timesheetCutoff || null,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pay period already exists for this year and period number' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return transformPayPeriod(data)
    }),

  // Generate pay periods for a year
  generateForYear: orgProtectedProcedure
    .input(z.object({
      year: z.number().min(2020).max(2100),
      periodType: periodTypeEnum,
      startDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Check if periods already exist for this year
      const { count } = await adminClient
        .from('pay_periods')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', ctx.orgId)
        .eq('year', input.year)

      if (count && count > 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pay periods already exist for this year' })
      }

      const periods: Array<Record<string, unknown>> = []
      let periodStart = new Date(input.startDate)
      let periodNumber = 1

      const getDaysInPeriod = (type: string): number => {
        switch (type) {
          case 'weekly': return 7
          case 'bi_weekly': return 14
          case 'semi_monthly': return 15 // Approximate
          case 'monthly': return 30 // Approximate
          default: return 14
        }
      }

      const daysInPeriod = getDaysInPeriod(input.periodType)
      const periodsInYear = Math.ceil(365 / daysInPeriod)

      while (periodNumber <= periodsInYear && periodStart.getFullYear() === input.year) {
        const periodEnd = new Date(periodStart)

        if (input.periodType === 'semi_monthly') {
          // Semi-monthly: 1-15 and 16-end of month
          if (periodStart.getDate() === 1) {
            periodEnd.setDate(15)
          } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1, 0) // Last day of month
          }
        } else if (input.periodType === 'monthly') {
          periodEnd.setMonth(periodEnd.getMonth() + 1, 0) // Last day of month
        } else {
          periodEnd.setDate(periodEnd.getDate() + daysInPeriod - 1)
        }

        const payDate = new Date(periodEnd)
        payDate.setDate(payDate.getDate() + 5) // Pay 5 days after period end

        periods.push({
          org_id: ctx.orgId,
          period_number: periodNumber,
          year: input.year,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          pay_date: payDate.toISOString().split('T')[0],
          period_type: input.periodType,
          status: 'upcoming',
        })

        // Move to next period
        periodStart = new Date(periodEnd)
        periodStart.setDate(periodStart.getDate() + 1)
        periodNumber++
      }

      const { data, error } = await adminClient
        .from('pay_periods')
        .insert(periods)
        .select()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        generated: data?.length || 0,
        periods: (data || []).map(transformPayPeriod),
      }
    }),
})

// ============================================
// TAX SETUP ROUTER
// ============================================

const taxSetupRouter = router({
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const { search, limit = 50, offset = 0 } = input || {}

      let query = adminClient
        .from('worker_tax_setup')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email)
        `, { count: 'exact' })
        .eq('org_id', ctx.orgId)

      if (search) {
        // Join search on contact name
        query = query.or(`contact.first_name.ilike.%${search}%,contact.last_name.ilike.%${search}%`)
      }

      query = query.order('created_at', { ascending: false })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items: (data || []).map(transformWorkerTaxSetup),
        total: count || 0,
      }
    }),

  getByContactId: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('worker_tax_setup')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email)
        `)
        .eq('org_id', ctx.orgId)
        .eq('contact_id', input.contactId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ? transformWorkerTaxSetup(data) : null
    }),

  upsert: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      // Federal
      federalFilingStatus: z.string().optional(),
      federalAllowances: z.number().default(0),
      additionalFederalWithholding: z.number().default(0),
      federalExempt: z.boolean().default(false),
      // State
      workState: z.string(),
      stateFilingStatus: z.string().optional(),
      stateAllowances: z.number().default(0),
      additionalStateWithholding: z.number().default(0),
      stateExempt: z.boolean().default(false),
      // Resident state
      residentState: z.string().optional(),
      residentStateFilingStatus: z.string().optional(),
      // Local
      localTaxJurisdiction: z.string().optional(),
      localTaxRate: z.number().optional(),
      // FICA
      ficaExempt: z.boolean().default(false),
      // W-4
      w4FormDate: z.string().optional(),
      w4MultipleJobs: z.boolean().default(false),
      w4DependentsCredit: z.number().default(0),
      w4OtherIncome: z.number().default(0),
      w4Deductions: z.number().default(0),
      effectiveDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('worker_tax_setup')
        .upsert({
          org_id: ctx.orgId,
          contact_id: input.contactId,
          federal_filing_status: input.federalFilingStatus || null,
          federal_allowances: input.federalAllowances,
          additional_federal_withholding: input.additionalFederalWithholding,
          federal_exempt: input.federalExempt,
          work_state: input.workState,
          state_filing_status: input.stateFilingStatus || null,
          state_allowances: input.stateAllowances,
          additional_state_withholding: input.additionalStateWithholding,
          state_exempt: input.stateExempt,
          resident_state: input.residentState || null,
          resident_state_filing_status: input.residentStateFilingStatus || null,
          local_tax_jurisdiction: input.localTaxJurisdiction || null,
          local_tax_rate: input.localTaxRate || null,
          fica_exempt: input.ficaExempt,
          w4_form_date: input.w4FormDate || null,
          w4_multiple_jobs: input.w4MultipleJobs,
          w4_dependents_credit: input.w4DependentsCredit,
          w4_other_income: input.w4OtherIncome,
          w4_deductions: input.w4Deductions,
          effective_date: input.effectiveDate || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        }, { onConflict: 'org_id,contact_id' })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return transformWorkerTaxSetup(data)
    }),
})

// ============================================
// BENEFITS ROUTER
// ============================================

const benefitsRouter = router({
  list: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      benefitType: z.string().optional(),
      isActive: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const { contactId, benefitType, isActive, limit = 50, offset = 0 } = input || {}

      let query = adminClient
        .from('worker_benefits')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email)
        `, { count: 'exact' })
        .eq('org_id', ctx.orgId)

      if (contactId) query = query.eq('contact_id', contactId)
      if (benefitType) query = query.eq('benefit_type', benefitType)
      if (isActive !== undefined) query = query.eq('is_active', isActive)

      query = query.order('created_at', { ascending: false })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items: (data || []).map(transformWorkerBenefit),
        total: count || 0,
      }
    }),

  create: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      benefitType: z.string(),
      planName: z.string(),
      planId: z.string().optional(),
      coverageLevel: z.string().optional(),
      enrollmentDate: z.string().optional(),
      employeeContribution: z.number().default(0),
      employerContribution: z.number().default(0),
      contributionFrequency: z.string().default('per_pay_period'),
      isPreTax: z.boolean().default(true),
      annualLimit: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('worker_benefits')
        .insert({
          org_id: ctx.orgId,
          contact_id: input.contactId,
          benefit_type: input.benefitType,
          plan_name: input.planName,
          plan_id: input.planId || null,
          coverage_level: input.coverageLevel || null,
          enrollment_date: input.enrollmentDate || new Date().toISOString().split('T')[0],
          employee_contribution: input.employeeContribution,
          employer_contribution: input.employerContribution,
          contribution_frequency: input.contributionFrequency,
          is_pre_tax: input.isPreTax,
          annual_limit: input.annualLimit || null,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return transformWorkerBenefit(data)
    }),

  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      employeeContribution: z.number().optional(),
      employerContribution: z.number().optional(),
      coverageLevel: z.string().optional(),
      terminationDate: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (input.employeeContribution !== undefined) updateData.employee_contribution = input.employeeContribution
      if (input.employerContribution !== undefined) updateData.employer_contribution = input.employerContribution
      if (input.coverageLevel !== undefined) updateData.coverage_level = input.coverageLevel
      if (input.terminationDate !== undefined) updateData.termination_date = input.terminationDate
      if (input.isActive !== undefined) updateData.is_active = input.isActive

      const { data, error } = await adminClient
        .from('worker_benefits')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return transformWorkerBenefit(data)
    }),

  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('worker_benefits')
        .delete()
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { success: true }
    }),
})

// ============================================
// MAIN PAYROLL ROUTER
// ============================================

export const payrollRouter = router({
  // Pay runs
  list: payRunsRouter.list,
  getById: payRunsRouter.getById,
  create: payRunsRouter.create,
  update: payRunsRouter.update,
  delete: payRunsRouter.delete,
  calculate: payRunsRouter.calculate,
  submitForApproval: payRunsRouter.submitForApproval,
  approve: payRunsRouter.approve,
  process: payRunsRouter.process,
  void: payRunsRouter.void,
  stats: payRunsRouter.stats,

  // Nested routers
  payItems: payItemsRouter,
  payPeriods: payPeriodsRouter,
  taxSetup: taxSetupRouter,
  benefits: benefitsRouter,
})
