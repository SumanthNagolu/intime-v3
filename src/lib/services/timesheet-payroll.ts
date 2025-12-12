/**
 * Timesheet → Payroll Automation Service
 *
 * Automates the creation of pay items from approved timesheets.
 * Groups timesheets by worker, calculates earnings and taxes.
 *
 * @module lib/services/timesheet-payroll
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================
// TYPES
// ============================================

export interface TimesheetForPayroll {
  id: string
  orgId: string
  placementId: string
  periodStart: string
  periodEnd: string
  totalRegularHours: number
  totalOvertimeHours: number
  totalDoubleTimeHours: number
  totalPtoHours: number
  totalHolidayHours: number
  totalPayableAmount: number
  rateSnapshot: RateSnapshot | null
  placement: {
    id: string
    payRate: number | null
    overtimePayRate: number | null
    doubleTimePayRate: number | null
    candidate: {
      id: string
      firstName: string
      lastName: string
      email: string | null
    } | null
  } | null
}

interface RateSnapshot {
  billRate?: number
  payRate?: number
  overtimeBillRate?: number
  overtimePayRate?: number
  doubleTimeBillRate?: number
  doubleTimePayRate?: number
}

export interface PayItemData {
  workerId: string
  contactId: string
  workerName: string
  workerEmail: string | null
  workerType: 'employee' | 'consultant' | 'contractor'
  payType: 'hourly' | 'salary'
  timesheetIds: string[]
  // Hours
  regularHours: number
  overtimeHours: number
  doubleTimeHours: number
  ptoHours: number
  holidayHours: number
  totalHours: number
  // Rates
  regularRate: number
  overtimeRate: number
  doubleTimeRate: number
  // Earnings
  regularEarnings: number
  overtimeEarnings: number
  doubleTimeEarnings: number
  ptoEarnings: number
  holidayEarnings: number
  grossPay: number
  // Taxes (estimated)
  federalIncomeTax: number
  stateIncomeTax: number
  socialSecurityTax: number
  medicareTax: number
  totalEmployeeTaxes: number
  employerSocialSecurity: number
  employerMedicare: number
  employerFuta: number
  employerSuta: number
  totalEmployerTaxes: number
  // Net
  netPay: number
}

export interface PayrollCalculationOptions {
  /** Pay period ID */
  payPeriodId: string
  /** Specific timesheet IDs (optional - defaults to all eligible in period) */
  timesheetIds?: string[]
  /** Check date */
  checkDate: string
  /** Direct deposit date (optional) */
  directDepositDate?: string
  /** Run type */
  runType?: 'regular' | 'off_cycle' | 'bonus' | 'final' | 'correction'
  /** Notes */
  notes?: string
}

export interface CalculatedPayRun {
  payPeriodId: string
  runType: string
  checkDate: string
  directDepositDate: string | null
  totalGross: number
  totalEmployeeTaxes: number
  totalEmployerTaxes: number
  totalNet: number
  employeeCount: number
  consultantCount: number
  contractorCount: number
  payItems: PayItemData[]
  timesheetIds: string[]
}

export interface EligibleTimesheetsResult {
  timesheets: TimesheetForPayroll[]
  byWorker: Map<string, TimesheetForPayroll[]>
  totalPayableAmount: number
  workerCount: number
}

// Tax rates (simplified - in production, use proper tax tables)
const TAX_RATES = {
  // Federal tax brackets (simplified flat rate for demo)
  federalRate: 0.22,
  // State tax (varies by state - using simplified rate)
  stateRate: 0.05,
  // FICA
  socialSecurityRate: 0.062,
  socialSecurityWageCap: 160200, // 2023 cap
  medicareRate: 0.0145,
  // Employer taxes
  futaRate: 0.006,
  futaWageCap: 7000,
  sutaRate: 0.027, // State unemployment (varies)
  sutaWageCap: 7000,
}

// ============================================
// TIMESHEET PAYROLL SERVICE
// ============================================

export class TimesheetPayroll {
  private adminClient: SupabaseClient

  constructor() {
    this.adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }

  /**
   * Get all approved timesheets eligible for payroll
   * (status = 'approved', not yet linked to a payroll run)
   */
  async getEligibleTimesheets(
    orgId: string,
    options?: {
      payPeriodId?: string
      fromDate?: string
      toDate?: string
      workerId?: string
    }
  ): Promise<EligibleTimesheetsResult> {
    let query = this.adminClient
      .from('timesheets')
      .select(`
        id,
        org_id,
        placement_id,
        period_start,
        period_end,
        total_regular_hours,
        total_overtime_hours,
        total_double_time_hours,
        total_pto_hours,
        total_holiday_hours,
        total_payable_amount,
        rate_snapshot,
        placement:placements!placement_id(
          id,
          pay_rate,
          overtime_pay_rate,
          double_time_pay_rate,
          candidate:contacts!candidate_id(id, first_name, last_name, email)
        )
      `)
      .eq('org_id', orgId)
      .eq('status', 'approved')
      .is('payroll_run_id', null)
      .is('deleted_at', null)

    // Filter by pay period dates if provided
    if (options?.payPeriodId) {
      const { data: period } = await this.adminClient
        .from('pay_periods')
        .select('period_start, period_end')
        .eq('id', options.payPeriodId)
        .single()

      if (period) {
        query = query
          .gte('period_end', period.period_start)
          .lte('period_start', period.period_end)
      }
    } else {
      if (options?.fromDate) {
        query = query.gte('period_start', options.fromDate)
      }
      if (options?.toDate) {
        query = query.lte('period_end', options.toDate)
      }
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch eligible timesheets: ${error.message}`)
    }

    // Transform and group by worker
    const timesheets: TimesheetForPayroll[] = []
    const byWorker = new Map<string, TimesheetForPayroll[]>()
    let totalPayableAmount = 0

    for (const ts of data || []) {
      const placement = ts.placement as unknown as Record<string, unknown> | null
      const candidate = placement?.candidate as unknown as Record<string, unknown> | null
      const workerId = candidate?.id as string

      // Skip timesheets without a worker
      if (!workerId) {
        continue
      }

      // Filter by worker if specified
      if (options?.workerId && workerId !== options.workerId) {
        continue
      }

      const timesheet: TimesheetForPayroll = {
        id: ts.id,
        orgId: ts.org_id,
        placementId: ts.placement_id,
        periodStart: ts.period_start,
        periodEnd: ts.period_end,
        totalRegularHours: Number(ts.total_regular_hours || 0),
        totalOvertimeHours: Number(ts.total_overtime_hours || 0),
        totalDoubleTimeHours: Number(ts.total_double_time_hours || 0),
        totalPtoHours: Number(ts.total_pto_hours || 0),
        totalHolidayHours: Number(ts.total_holiday_hours || 0),
        totalPayableAmount: Number(ts.total_payable_amount || 0),
        rateSnapshot: ts.rate_snapshot as RateSnapshot | null,
        placement: placement ? {
          id: placement.id as string,
          payRate: placement.pay_rate ? Number(placement.pay_rate) : null,
          overtimePayRate: placement.overtime_pay_rate ? Number(placement.overtime_pay_rate) : null,
          doubleTimePayRate: placement.double_time_pay_rate ? Number(placement.double_time_pay_rate) : null,
          candidate: candidate ? {
            id: candidate.id as string,
            firstName: candidate.first_name as string,
            lastName: candidate.last_name as string,
            email: candidate.email as string | null,
          } : null,
        } : null,
      }

      timesheets.push(timesheet)
      totalPayableAmount += timesheet.totalPayableAmount

      // Group by worker
      if (!byWorker.has(workerId)) {
        byWorker.set(workerId, [])
      }
      byWorker.get(workerId)!.push(timesheet)
    }

    return {
      timesheets,
      byWorker,
      totalPayableAmount,
      workerCount: byWorker.size,
    }
  }

  /**
   * Calculate pay run from timesheets without persisting
   */
  async calculatePayRun(
    orgId: string,
    options: PayrollCalculationOptions
  ): Promise<CalculatedPayRun> {
    // Get eligible timesheets
    let timesheets: TimesheetForPayroll[]

    if (options.timesheetIds && options.timesheetIds.length > 0) {
      const { data, error } = await this.adminClient
        .from('timesheets')
        .select(`
          id,
          org_id,
          placement_id,
          period_start,
          period_end,
          total_regular_hours,
          total_overtime_hours,
          total_double_time_hours,
          total_pto_hours,
          total_holiday_hours,
          total_payable_amount,
          rate_snapshot,
          placement:placements!placement_id(
            id,
            pay_rate,
            overtime_pay_rate,
            double_time_pay_rate,
            candidate:contacts!candidate_id(id, first_name, last_name, email)
          )
        `)
        .eq('org_id', orgId)
        .eq('status', 'approved')
        .is('payroll_run_id', null)
        .is('deleted_at', null)
        .in('id', options.timesheetIds)

      if (error) {
        throw new Error(`Failed to fetch timesheets: ${error.message}`)
      }

      timesheets = this.transformTimesheets(data || [])
    } else {
      const result = await this.getEligibleTimesheets(orgId, {
        payPeriodId: options.payPeriodId,
      })
      timesheets = result.timesheets
    }

    if (timesheets.length === 0) {
      return {
        payPeriodId: options.payPeriodId,
        runType: options.runType || 'regular',
        checkDate: options.checkDate,
        directDepositDate: options.directDepositDate || null,
        totalGross: 0,
        totalEmployeeTaxes: 0,
        totalEmployerTaxes: 0,
        totalNet: 0,
        employeeCount: 0,
        consultantCount: 0,
        contractorCount: 0,
        payItems: [],
        timesheetIds: [],
      }
    }

    // Group by worker
    const byWorker = new Map<string, TimesheetForPayroll[]>()
    for (const ts of timesheets) {
      const workerId = ts.placement?.candidate?.id
      if (!workerId) continue

      if (!byWorker.has(workerId)) {
        byWorker.set(workerId, [])
      }
      byWorker.get(workerId)!.push(ts)
    }

    // Calculate pay items
    const payItems: PayItemData[] = []
    let totalGross = 0
    let totalEmployeeTaxes = 0
    let totalEmployerTaxes = 0
    let totalNet = 0
    let consultantCount = 0

    for (const [workerId, workerTimesheets] of byWorker) {
      const payItem = this.calculatePayItem(workerId, workerTimesheets)
      payItems.push(payItem)

      totalGross += payItem.grossPay
      totalEmployeeTaxes += payItem.totalEmployeeTaxes
      totalEmployerTaxes += payItem.totalEmployerTaxes
      totalNet += payItem.netPay

      if (payItem.workerType === 'consultant') {
        consultantCount++
      }
    }

    return {
      payPeriodId: options.payPeriodId,
      runType: options.runType || 'regular',
      checkDate: options.checkDate,
      directDepositDate: options.directDepositDate || null,
      totalGross,
      totalEmployeeTaxes,
      totalEmployerTaxes,
      totalNet,
      employeeCount: 0, // W-2 employees would be counted here
      consultantCount,
      contractorCount: 0, // 1099 contractors would be counted here
      payItems,
      timesheetIds: timesheets.map(ts => ts.id),
    }
  }

  /**
   * Create a pay run and persist pay items
   */
  async createPayRun(
    orgId: string,
    userId: string | undefined,
    options: PayrollCalculationOptions
  ): Promise<{ payRunId: string; runNumber: string; calculation: CalculatedPayRun }> {
    // Calculate first
    const calculation = await this.calculatePayRun(orgId, options)

    if (calculation.payItems.length === 0) {
      throw new Error('No eligible timesheets found for payroll')
    }

    // Generate run number
    const runNumber = await this.generateRunNumber(orgId)

    // Create pay run
    const { data: payRun, error: payRunError } = await this.adminClient
      .from('pay_runs')
      .insert({
        org_id: orgId,
        pay_period_id: options.payPeriodId,
        run_number: runNumber,
        run_type: calculation.runType,
        check_date: calculation.checkDate,
        direct_deposit_date: calculation.directDepositDate,
        total_gross: calculation.totalGross,
        total_employee_taxes: calculation.totalEmployeeTaxes,
        total_employer_taxes: calculation.totalEmployerTaxes,
        total_net: calculation.totalNet,
        total_employer_cost: calculation.totalGross + calculation.totalEmployerTaxes,
        employee_count: calculation.employeeCount,
        consultant_count: calculation.consultantCount,
        contractor_count: calculation.contractorCount,
        status: 'draft',
        calculated_at: new Date().toISOString(),
        notes: options.notes || null,
        created_by: userId || null,
      })
      .select()
      .single()

    if (payRunError) {
      throw new Error(`Failed to create pay run: ${payRunError.message}`)
    }

    const payRunId = payRun.id

    // Create pay items
    const payItemInserts = calculation.payItems.map(item => ({
      pay_run_id: payRunId,
      worker_type: item.workerType,
      worker_id: item.workerId,
      contact_id: item.contactId,
      pay_type: item.payType,
      timesheet_ids: item.timesheetIds,
      regular_hours: item.regularHours,
      overtime_hours: item.overtimeHours,
      double_time_hours: item.doubleTimeHours,
      pto_hours: item.ptoHours,
      holiday_hours: item.holidayHours,
      total_hours: item.totalHours,
      regular_rate: item.regularRate,
      overtime_rate: item.overtimeRate,
      double_time_rate: item.doubleTimeRate,
      regular_earnings: item.regularEarnings,
      overtime_earnings: item.overtimeEarnings,
      double_time_earnings: item.doubleTimeEarnings,
      pto_earnings: item.ptoEarnings,
      holiday_earnings: item.holidayEarnings,
      gross_pay: item.grossPay,
      federal_income_tax: item.federalIncomeTax,
      state_income_tax: item.stateIncomeTax,
      social_security_tax: item.socialSecurityTax,
      medicare_tax: item.medicareTax,
      total_employee_taxes: item.totalEmployeeTaxes,
      employer_social_security: item.employerSocialSecurity,
      employer_medicare: item.employerMedicare,
      employer_futa: item.employerFuta,
      employer_suta: item.employerSuta,
      total_employer_taxes: item.totalEmployerTaxes,
      net_pay: item.netPay,
      status: 'pending',
    }))

    const { error: itemsError } = await this.adminClient
      .from('pay_items')
      .insert(payItemInserts)

    if (itemsError) {
      // Rollback pay run
      await this.adminClient.from('pay_runs').delete().eq('id', payRunId)
      throw new Error(`Failed to create pay items: ${itemsError.message}`)
    }

    return {
      payRunId,
      runNumber,
      calculation,
    }
  }

  /**
   * Preview pay items without creating pay run
   */
  async previewPayItems(
    orgId: string,
    options: PayrollCalculationOptions
  ): Promise<PayItemData[]> {
    const calculation = await this.calculatePayRun(orgId, options)
    return calculation.payItems
  }

  /**
   * Get summary statistics for payroll
   */
  async getPayrollSummary(orgId: string): Promise<{
    pendingTimesheets: number
    pendingAmount: number
    currentPeriod: { id: string; periodStart: string; periodEnd: string; payDate: string } | null
    nextPayDate: string | null
    ytdGross: number
    ytdTaxes: number
  }> {
    const today = new Date().toISOString().split('T')[0]

    // Get eligible timesheets count
    const { count: pendingTimesheets } = await this.adminClient
      .from('timesheets')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'approved')
      .is('payroll_run_id', null)
      .is('deleted_at', null)

    // Get pending amount
    const { data: pendingTs } = await this.adminClient
      .from('timesheets')
      .select('total_payable_amount')
      .eq('org_id', orgId)
      .eq('status', 'approved')
      .is('payroll_run_id', null)
      .is('deleted_at', null)

    const pendingAmount = pendingTs?.reduce(
      (sum, ts) => sum + Number(ts.total_payable_amount || 0),
      0
    ) || 0

    // Get current pay period
    const { data: currentPeriod } = await this.adminClient
      .from('pay_periods')
      .select('id, period_start, period_end, pay_date')
      .eq('org_id', orgId)
      .lte('period_start', today)
      .gte('period_end', today)
      .single()

    // Get next pay date
    const { data: nextPeriod } = await this.adminClient
      .from('pay_periods')
      .select('pay_date')
      .eq('org_id', orgId)
      .gt('pay_date', today)
      .order('pay_date', { ascending: true })
      .limit(1)
      .single()

    // Get YTD totals
    const startOfYear = `${new Date().getFullYear()}-01-01`
    const { data: ytdRuns } = await this.adminClient
      .from('pay_runs')
      .select('total_gross, total_employee_taxes, total_employer_taxes')
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .gte('check_date', startOfYear)
      .is('deleted_at', null)

    const ytdGross = ytdRuns?.reduce(
      (sum, run) => sum + Number(run.total_gross || 0),
      0
    ) || 0

    const ytdTaxes = ytdRuns?.reduce(
      (sum, run) =>
        sum +
        Number(run.total_employee_taxes || 0) +
        Number(run.total_employer_taxes || 0),
      0
    ) || 0

    return {
      pendingTimesheets: pendingTimesheets || 0,
      pendingAmount,
      currentPeriod: currentPeriod
        ? {
            id: currentPeriod.id,
            periodStart: currentPeriod.period_start,
            periodEnd: currentPeriod.period_end,
            payDate: currentPeriod.pay_date,
          }
        : null,
      nextPayDate: nextPeriod?.pay_date || null,
      ytdGross,
      ytdTaxes,
    }
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private transformTimesheets(data: Array<Record<string, unknown>>): TimesheetForPayroll[] {
    return data.map(ts => {
      const placement = ts.placement as Record<string, unknown>
      const candidate = placement?.candidate as Record<string, unknown>

      return {
        id: ts.id as string,
        orgId: ts.org_id as string,
        placementId: ts.placement_id as string,
        periodStart: ts.period_start as string,
        periodEnd: ts.period_end as string,
        totalRegularHours: Number(ts.total_regular_hours || 0),
        totalOvertimeHours: Number(ts.total_overtime_hours || 0),
        totalDoubleTimeHours: Number(ts.total_double_time_hours || 0),
        totalPtoHours: Number(ts.total_pto_hours || 0),
        totalHolidayHours: Number(ts.total_holiday_hours || 0),
        totalPayableAmount: Number(ts.total_payable_amount || 0),
        rateSnapshot: ts.rate_snapshot as RateSnapshot | null,
        placement: placement
          ? {
              id: placement.id as string,
              payRate: placement.pay_rate ? Number(placement.pay_rate) : null,
              overtimePayRate: placement.overtime_pay_rate
                ? Number(placement.overtime_pay_rate)
                : null,
              doubleTimePayRate: placement.double_time_pay_rate
                ? Number(placement.double_time_pay_rate)
                : null,
              candidate: candidate
                ? {
                    id: candidate.id as string,
                    firstName: candidate.first_name as string,
                    lastName: candidate.last_name as string,
                    email: candidate.email as string | null,
                  }
                : null,
            }
          : null,
      }
    })
  }

  private calculatePayItem(
    workerId: string,
    timesheets: TimesheetForPayroll[]
  ): PayItemData {
    const firstTs = timesheets[0]
    const candidate = firstTs.placement?.candidate

    // Aggregate hours
    let regularHours = 0
    let overtimeHours = 0
    let doubleTimeHours = 0
    let ptoHours = 0
    let holidayHours = 0
    const timesheetIds: string[] = []

    for (const ts of timesheets) {
      regularHours += ts.totalRegularHours
      overtimeHours += ts.totalOvertimeHours
      doubleTimeHours += ts.totalDoubleTimeHours
      ptoHours += ts.totalPtoHours
      holidayHours += ts.totalHolidayHours
      timesheetIds.push(ts.id)
    }

    const totalHours =
      regularHours + overtimeHours + doubleTimeHours + ptoHours + holidayHours

    // Get rates from rate snapshot or placement
    const regularRate =
      firstTs.rateSnapshot?.payRate ?? firstTs.placement?.payRate ?? 0
    const overtimeRate =
      firstTs.rateSnapshot?.overtimePayRate ??
      firstTs.placement?.overtimePayRate ??
      regularRate * 1.5
    const doubleTimeRate =
      firstTs.rateSnapshot?.doubleTimePayRate ??
      firstTs.placement?.doubleTimePayRate ??
      regularRate * 2

    // Calculate earnings
    const regularEarnings = regularHours * regularRate
    const overtimeEarnings = overtimeHours * overtimeRate
    const doubleTimeEarnings = doubleTimeHours * doubleTimeRate
    const ptoEarnings = ptoHours * regularRate
    const holidayEarnings = holidayHours * regularRate
    const grossPay =
      regularEarnings +
      overtimeEarnings +
      doubleTimeEarnings +
      ptoEarnings +
      holidayEarnings

    // Calculate employee taxes
    const federalIncomeTax = grossPay * TAX_RATES.federalRate
    const stateIncomeTax = grossPay * TAX_RATES.stateRate
    const socialSecurityTax = Math.min(
      grossPay * TAX_RATES.socialSecurityRate,
      TAX_RATES.socialSecurityWageCap * TAX_RATES.socialSecurityRate
    )
    const medicareTax = grossPay * TAX_RATES.medicareRate
    const totalEmployeeTaxes =
      federalIncomeTax + stateIncomeTax + socialSecurityTax + medicareTax

    // Calculate employer taxes
    const employerSocialSecurity = Math.min(
      grossPay * TAX_RATES.socialSecurityRate,
      TAX_RATES.socialSecurityWageCap * TAX_RATES.socialSecurityRate
    )
    const employerMedicare = grossPay * TAX_RATES.medicareRate
    const employerFuta = Math.min(
      grossPay * TAX_RATES.futaRate,
      TAX_RATES.futaWageCap * TAX_RATES.futaRate
    )
    const employerSuta = Math.min(
      grossPay * TAX_RATES.sutaRate,
      TAX_RATES.sutaWageCap * TAX_RATES.sutaRate
    )
    const totalEmployerTaxes =
      employerSocialSecurity + employerMedicare + employerFuta + employerSuta

    const netPay = grossPay - totalEmployeeTaxes

    return {
      workerId,
      contactId: workerId,
      workerName: candidate
        ? `${candidate.firstName} ${candidate.lastName}`
        : 'Unknown',
      workerEmail: candidate?.email || null,
      workerType: 'consultant', // Could be determined from worker profile
      payType: 'hourly',
      timesheetIds,
      regularHours,
      overtimeHours,
      doubleTimeHours,
      ptoHours,
      holidayHours,
      totalHours,
      regularRate,
      overtimeRate,
      doubleTimeRate,
      regularEarnings,
      overtimeEarnings,
      doubleTimeEarnings,
      ptoEarnings,
      holidayEarnings,
      grossPay,
      federalIncomeTax,
      stateIncomeTax,
      socialSecurityTax,
      medicareTax,
      totalEmployeeTaxes,
      employerSocialSecurity,
      employerMedicare,
      employerFuta,
      employerSuta,
      totalEmployerTaxes,
      netPay,
    }
  }

  private async generateRunNumber(orgId: string): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `PR-${year}-`

    const { data } = await this.adminClient
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
}

// Singleton instance
export const timesheetPayroll = new TimesheetPayroll()
