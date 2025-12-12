/**
 * Pay Period Management Service
 *
 * Handles pay period generation, management, and timesheet scheduling.
 * Supports multiple period types:
 * - Weekly
 * - Bi-weekly
 * - Semi-monthly (1-15, 16-end)
 * - Monthly
 *
 * @module lib/services/pay-period-service
 */

import { createClient } from '@supabase/supabase-js'
import {
  addDays,
  addWeeks,
  startOfWeek,
  endOfWeek,
  format,
  parseISO,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
} from 'date-fns'

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

/**
 * Pay period type enumeration
 */
export type PeriodType = 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly'

/**
 * Pay period status enumeration
 */
export type PeriodStatus = 'upcoming' | 'active' | 'processing' | 'completed' | 'void'

/**
 * Configuration for pay period generation
 */
export interface PayPeriodConfig {
  periodType: PeriodType
  weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 1 = Monday, etc.
  payDayOffset: number // Days after period end to pay
  timesheetDeadlineHours: number // Hours after period end for timesheet submission
}

/**
 * Default pay period configurations by type
 */
export const DEFAULT_CONFIGS: Record<PeriodType, Partial<PayPeriodConfig>> = {
  weekly: {
    weekStartDay: 1, // Monday
    payDayOffset: 5, // Friday after week ends
    timesheetDeadlineHours: 48, // Monday noon after week ends
  },
  bi_weekly: {
    weekStartDay: 1, // Monday
    payDayOffset: 5, // Friday after period ends
    timesheetDeadlineHours: 48,
  },
  semi_monthly: {
    payDayOffset: 5, // 5 days after period ends
    timesheetDeadlineHours: 24,
  },
  monthly: {
    payDayOffset: 5, // 5th of following month
    timesheetDeadlineHours: 48,
  },
}

/**
 * Pay period data structure
 */
export interface PayPeriod {
  id: string
  orgId: string
  periodNumber: number
  year: number
  periodStart: string
  periodEnd: string
  payDate: string
  periodType: PeriodType
  status: PeriodStatus
  timesheetCutoff: string | null
  createdAt: string
}

/**
 * Pay Period Management Service
 *
 * Generates and manages pay periods for an organization,
 * handling different period types and calculating important dates.
 */
export class PayPeriodService {
  private adminClient = getAdminClient()

  /**
   * Generate pay periods for a given year
   *
   * @param orgId - Organization UUID
   * @param year - Year to generate periods for
   * @param config - Configuration for period generation
   */
  async generatePayPeriods(orgId: string, year: number, config: PayPeriodConfig): Promise<void> {
    const periods: Array<{
      org_id: string
      period_number: number
      year: number
      period_start: string
      period_end: string
      pay_date: string
      period_type: PeriodType
      status: PeriodStatus
      timesheet_cutoff: string | null
    }> = []

    let periodNumber = 1
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)

    switch (config.periodType) {
      case 'weekly':
        {
          // Start from first day of the week containing Jan 1
          let currentDate = startOfWeek(yearStart, {
            weekStartsOn: config.weekStartDay,
          })

          // If the week start is before Jan 1, move to next week
          if (isBefore(currentDate, yearStart)) {
            currentDate = addWeeks(currentDate, 1)
          }

          while (isBefore(currentDate, yearEnd) || currentDate.getTime() === yearEnd.getTime()) {
            const periodEnd = endOfWeek(currentDate, {
              weekStartsOn: config.weekStartDay,
            })
            const payDate = addDays(periodEnd, config.payDayOffset)
            const timesheetCutoff = addDays(periodEnd, Math.ceil(config.timesheetDeadlineHours / 24))

            periods.push({
              org_id: orgId,
              period_number: periodNumber++,
              year,
              period_start: format(currentDate, 'yyyy-MM-dd'),
              period_end: format(periodEnd, 'yyyy-MM-dd'),
              pay_date: format(payDate, 'yyyy-MM-dd'),
              period_type: 'weekly',
              status: 'upcoming',
              timesheet_cutoff: format(timesheetCutoff, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            })

            currentDate = addWeeks(currentDate, 1)
          }
        }
        break

      case 'bi_weekly':
        {
          let currentDate = startOfWeek(yearStart, {
            weekStartsOn: config.weekStartDay,
          })

          if (isBefore(currentDate, yearStart)) {
            currentDate = addWeeks(currentDate, 1)
          }

          while (isBefore(currentDate, yearEnd) || currentDate.getTime() === yearEnd.getTime()) {
            const periodEnd = addDays(currentDate, 13) // 14 days - 1
            const payDate = addDays(periodEnd, config.payDayOffset)
            const timesheetCutoff = addDays(periodEnd, Math.ceil(config.timesheetDeadlineHours / 24))

            periods.push({
              org_id: orgId,
              period_number: periodNumber++,
              year,
              period_start: format(currentDate, 'yyyy-MM-dd'),
              period_end: format(periodEnd, 'yyyy-MM-dd'),
              pay_date: format(payDate, 'yyyy-MM-dd'),
              period_type: 'bi_weekly',
              status: 'upcoming',
              timesheet_cutoff: format(timesheetCutoff, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            })

            currentDate = addWeeks(currentDate, 2)
          }
        }
        break

      case 'semi_monthly':
        {
          for (let month = 0; month < 12; month++) {
            // First period: 1st - 15th
            const firstPeriodStart = new Date(year, month, 1)
            const firstPeriodEnd = new Date(year, month, 15)
            const firstPayDate = addDays(firstPeriodEnd, config.payDayOffset)
            const firstTimesheetCutoff = addDays(
              firstPeriodEnd,
              Math.ceil(config.timesheetDeadlineHours / 24)
            )

            periods.push({
              org_id: orgId,
              period_number: periodNumber++,
              year,
              period_start: format(firstPeriodStart, 'yyyy-MM-dd'),
              period_end: format(firstPeriodEnd, 'yyyy-MM-dd'),
              pay_date: format(firstPayDate, 'yyyy-MM-dd'),
              period_type: 'semi_monthly',
              status: 'upcoming',
              timesheet_cutoff: format(firstTimesheetCutoff, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            })

            // Second period: 16th - end of month
            const secondPeriodStart = new Date(year, month, 16)
            const lastDay = new Date(year, month + 1, 0).getDate()
            const secondPeriodEnd = new Date(year, month, lastDay)
            const secondPayDate = addDays(secondPeriodEnd, config.payDayOffset)
            const secondTimesheetCutoff = addDays(
              secondPeriodEnd,
              Math.ceil(config.timesheetDeadlineHours / 24)
            )

            periods.push({
              org_id: orgId,
              period_number: periodNumber++,
              year,
              period_start: format(secondPeriodStart, 'yyyy-MM-dd'),
              period_end: format(secondPeriodEnd, 'yyyy-MM-dd'),
              pay_date: format(secondPayDate, 'yyyy-MM-dd'),
              period_type: 'semi_monthly',
              status: 'upcoming',
              timesheet_cutoff: format(secondTimesheetCutoff, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            })
          }
        }
        break

      case 'monthly':
        {
          for (let month = 0; month < 12; month++) {
            const periodStart = new Date(year, month, 1)
            const lastDay = new Date(year, month + 1, 0).getDate()
            const periodEnd = new Date(year, month, lastDay)
            const payDate = addDays(periodEnd, config.payDayOffset)
            const timesheetCutoff = addDays(
              periodEnd,
              Math.ceil(config.timesheetDeadlineHours / 24)
            )

            periods.push({
              org_id: orgId,
              period_number: periodNumber++,
              year,
              period_start: format(periodStart, 'yyyy-MM-dd'),
              period_end: format(periodEnd, 'yyyy-MM-dd'),
              pay_date: format(payDate, 'yyyy-MM-dd'),
              period_type: 'monthly',
              status: 'upcoming',
              timesheet_cutoff: format(timesheetCutoff, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            })
          }
        }
        break
    }

    // Insert all periods (upsert to handle re-generation)
    const { error } = await this.adminClient.from('pay_periods').upsert(periods, {
      onConflict: 'org_id,year,period_number',
      ignoreDuplicates: false,
    })

    if (error) {
      throw new Error(`Failed to generate pay periods: ${error.message}`)
    }
  }

  /**
   * Get the current active pay period for an organization
   *
   * @param orgId - Organization UUID
   * @returns Current pay period or null if none active
   */
  async getCurrentPeriod(orgId: string): Promise<PayPeriod | null> {
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data, error } = await this.adminClient
      .from('pay_periods')
      .select('*')
      .eq('org_id', orgId)
      .lte('period_start', today)
      .gte('period_end', today)
      .single()

    if (error || !data) return null

    return this.mapToPayPeriod(data)
  }

  /**
   * Get the pay period containing a specific date
   *
   * @param orgId - Organization UUID
   * @param date - Date to find period for
   * @returns Pay period or null if not found
   */
  async getPeriodForDate(orgId: string, date: Date): Promise<PayPeriod | null> {
    const dateStr = format(date, 'yyyy-MM-dd')

    const { data, error } = await this.adminClient
      .from('pay_periods')
      .select('*')
      .eq('org_id', orgId)
      .lte('period_start', dateStr)
      .gte('period_end', dateStr)
      .single()

    if (error || !data) return null

    return this.mapToPayPeriod(data)
  }

  /**
   * Get upcoming pay periods for an organization
   *
   * @param orgId - Organization UUID
   * @param count - Number of periods to return
   * @returns Array of upcoming pay periods
   */
  async getUpcomingPeriods(orgId: string, count: number = 4): Promise<PayPeriod[]> {
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data, error } = await this.adminClient
      .from('pay_periods')
      .select('*')
      .eq('org_id', orgId)
      .gte('period_start', today)
      .order('period_start', { ascending: true })
      .limit(count)

    if (error || !data) return []

    return data.map((row) => this.mapToPayPeriod(row))
  }

  /**
   * Get recent completed pay periods for an organization
   *
   * @param orgId - Organization UUID
   * @param count - Number of periods to return
   * @returns Array of recent completed pay periods
   */
  async getRecentPeriods(orgId: string, count: number = 4): Promise<PayPeriod[]> {
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data, error } = await this.adminClient
      .from('pay_periods')
      .select('*')
      .eq('org_id', orgId)
      .lt('period_end', today)
      .order('period_end', { ascending: false })
      .limit(count)

    if (error || !data) return []

    return data.map((row) => this.mapToPayPeriod(row))
  }

  /**
   * List all pay periods for a year
   *
   * @param orgId - Organization UUID
   * @param year - Year to list periods for
   * @returns Array of pay periods
   */
  async listPeriodsForYear(orgId: string, year: number): Promise<PayPeriod[]> {
    const { data, error } = await this.adminClient
      .from('pay_periods')
      .select('*')
      .eq('org_id', orgId)
      .eq('year', year)
      .order('period_number', { ascending: true })

    if (error || !data) return []

    return data.map((row) => this.mapToPayPeriod(row))
  }

  /**
   * Update the status of a pay period
   *
   * @param periodId - Pay period UUID
   * @param status - New status
   */
  async updatePeriodStatus(periodId: string, status: PeriodStatus): Promise<void> {
    const { error } = await this.adminClient
      .from('pay_periods')
      .update({ status })
      .eq('id', periodId)

    if (error) {
      throw new Error(`Failed to update period status: ${error.message}`)
    }
  }

  /**
   * Get the timesheet submission deadline for a period
   *
   * @param periodEnd - End date of the period
   * @param deadlineHours - Hours after period end
   * @returns Deadline datetime
   */
  getSubmissionDeadline(periodEnd: string, deadlineHours: number = 48): Date {
    const endDate = parseISO(periodEnd)
    const deadline = endOfDay(endDate)
    return addDays(deadline, Math.ceil(deadlineHours / 24))
  }

  /**
   * Check if a timesheet submission is on time
   *
   * @param periodEnd - End date of the period
   * @param submittedAt - When the timesheet was submitted
   * @param deadlineHours - Hours after period end
   * @returns Whether the submission is on time
   */
  isSubmissionOnTime(periodEnd: string, submittedAt: Date, deadlineHours: number = 48): boolean {
    const deadline = this.getSubmissionDeadline(periodEnd, deadlineHours)
    return isBefore(submittedAt, deadline) || submittedAt.getTime() === deadline.getTime()
  }

  /**
   * Get statistics for pay periods
   *
   * @param orgId - Organization UUID
   * @param year - Year to get stats for (optional)
   * @returns Period statistics
   */
  async getPeriodStats(
    orgId: string,
    year?: number
  ): Promise<{
    total: number
    upcoming: number
    active: number
    completed: number
    processing: number
  }> {
    let query = this.adminClient.from('pay_periods').select('status', { count: 'exact' })

    query = query.eq('org_id', orgId)

    if (year) {
      query = query.eq('year', year)
    }

    const { data, error } = await query

    if (error || !data) {
      return {
        total: 0,
        upcoming: 0,
        active: 0,
        completed: 0,
        processing: 0,
      }
    }

    const stats = data.reduce(
      (acc, row) => {
        acc.total++
        switch (row.status) {
          case 'upcoming':
            acc.upcoming++
            break
          case 'active':
            acc.active++
            break
          case 'completed':
            acc.completed++
            break
          case 'processing':
            acc.processing++
            break
        }
        return acc
      },
      { total: 0, upcoming: 0, active: 0, completed: 0, processing: 0 }
    )

    return stats
  }

  /**
   * Map database row to PayPeriod interface
   */
  private mapToPayPeriod(row: Record<string, unknown>): PayPeriod {
    return {
      id: row.id as string,
      orgId: row.org_id as string,
      periodNumber: row.period_number as number,
      year: row.year as number,
      periodStart: row.period_start as string,
      periodEnd: row.period_end as string,
      payDate: row.pay_date as string,
      periodType: row.period_type as PeriodType,
      status: row.status as PeriodStatus,
      timesheetCutoff: row.timesheet_cutoff as string | null,
      createdAt: row.created_at as string,
    }
  }

  /**
   * Generate timesheet periods for active placements
   * Creates pre-defined timesheet records for upcoming pay periods
   *
   * @param orgId - Organization UUID
   * @param periodsAhead - Number of periods ahead to generate
   */
  async generateTimesheetPeriodsForPlacements(orgId: string, periodsAhead: number = 4): Promise<{
    generated: number
    skipped: number
  }> {
    // Get upcoming periods
    const periods = await this.getUpcomingPeriods(orgId, periodsAhead)

    if (periods.length === 0) {
      return { generated: 0, skipped: 0 }
    }

    // Get active placements
    const { data: placements, error: placementsError } = await this.adminClient
      .from('placements')
      .select('id, start_date, end_date')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .is('deleted_at', null)

    if (placementsError || !placements) {
      throw new Error(`Failed to fetch placements: ${placementsError?.message}`)
    }

    let generated = 0
    let skipped = 0

    for (const period of periods) {
      for (const placement of placements) {
        // Check if placement is active during this period
        const placementStart = parseISO(placement.start_date)
        const placementEnd = placement.end_date ? parseISO(placement.end_date) : null
        const periodStart = parseISO(period.periodStart)
        const periodEnd = parseISO(period.periodEnd)

        // Skip if placement hasn't started yet or has ended
        if (isAfter(placementStart, periodEnd)) {
          skipped++
          continue
        }
        if (placementEnd && isBefore(placementEnd, periodStart)) {
          skipped++
          continue
        }

        // Check if timesheet already exists
        const { data: existingTimesheet } = await this.adminClient
          .from('timesheets')
          .select('id')
          .eq('placement_id', placement.id)
          .eq('period_start', period.periodStart)
          .eq('period_end', period.periodEnd)
          .single()

        if (existingTimesheet) {
          skipped++
          continue
        }

        // Create draft timesheet
        const { error: insertError } = await this.adminClient.from('timesheets').insert({
          org_id: orgId,
          placement_id: placement.id,
          period_start: period.periodStart,
          period_end: period.periodEnd,
          period_type: period.periodType,
          status: 'draft',
        })

        if (insertError) {
          console.error(`Failed to create timesheet: ${insertError.message}`)
          continue
        }

        generated++
      }
    }

    return { generated, skipped }
  }
}

// Export singleton instance
export const payPeriodService = new PayPeriodService()
