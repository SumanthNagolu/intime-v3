/**
 * Rate Resolution Service
 *
 * Unified rate resolution for billing and payroll calculations.
 * Handles complex rate scenarios including:
 * - Placement-specific rates with date ranges
 * - Rate card lookups
 * - Contract rate agreements
 * - State-specific overtime rules
 *
 * @module lib/services/rate-resolver
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

/**
 * Rate snapshot capturing the effective rates at a point in time
 */
export interface RateSnapshot {
  billRate: number
  payRate: number
  rateType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual'
  effectiveDate: string
  source: 'placement' | 'placement_rates' | 'rate_card' | 'contract'
  sourceId: string
  currency: string
}

/**
 * Overtime calculation rules based on work location
 */
export interface OvertimeRules {
  overtimeMultiplier: number
  doubleTimeMultiplier: number
  dailyOvertimeThreshold: number | null // CA: 8 hours
  weeklyOvertimeThreshold: number // Federal: 40 hours
  seventhDayRule: boolean // CA requires OT on 7th consecutive day
  dailyDoubleTimeThreshold: number | null // CA: 12 hours
}

/**
 * Calculated amounts for timesheet billing/payroll
 */
export interface CalculatedAmounts {
  totalBillable: number
  totalPayable: number
  margin: number
  marginPercent: number
  breakdown: {
    regularBillable: number
    overtimeBillable: number
    doubleTimeBillable: number
    regularPayable: number
    overtimePayable: number
    doubleTimePayable: number
  }
}

/**
 * State-specific overtime rules configuration
 */
const STATE_OVERTIME_RULES: Record<string, Partial<OvertimeRules>> = {
  // California - most complex overtime rules
  CA: {
    overtimeMultiplier: 1.5,
    doubleTimeMultiplier: 2.0,
    dailyOvertimeThreshold: 8,
    dailyDoubleTimeThreshold: 12,
    weeklyOvertimeThreshold: 40,
    seventhDayRule: true,
  },
  // Alaska
  AK: {
    overtimeMultiplier: 1.5,
    doubleTimeMultiplier: 2.0,
    dailyOvertimeThreshold: 8,
    weeklyOvertimeThreshold: 40,
    seventhDayRule: false,
  },
  // Nevada
  NV: {
    overtimeMultiplier: 1.5,
    doubleTimeMultiplier: 2.0,
    dailyOvertimeThreshold: 8,
    weeklyOvertimeThreshold: 40,
    seventhDayRule: false,
  },
  // Colorado
  CO: {
    overtimeMultiplier: 1.5,
    doubleTimeMultiplier: 2.0,
    dailyOvertimeThreshold: 12,
    weeklyOvertimeThreshold: 40,
    seventhDayRule: false,
  },
}

/**
 * Federal default overtime rules
 */
const FEDERAL_OVERTIME_RULES: OvertimeRules = {
  overtimeMultiplier: 1.5,
  doubleTimeMultiplier: 2.0,
  dailyOvertimeThreshold: null, // No federal daily OT
  dailyDoubleTimeThreshold: null,
  weeklyOvertimeThreshold: 40,
  seventhDayRule: false,
}

/**
 * Rate Resolution Service
 *
 * Resolves effective billing and pay rates for placements,
 * considering date-specific overrides, rate cards, and contract terms.
 */
export class RateResolver {
  private adminClient = getAdminClient()

  /**
   * Get the effective bill/pay rates for a placement on a specific date
   *
   * Resolution order:
   * 1. placement_rates (date-specific rate overrides)
   * 2. placement.bill_rate (current placement rate)
   * 3. rate_card (if placement has linked rate card)
   * 4. contract rate (if linked via account/company)
   *
   * @param placementId - The placement UUID
   * @param workDate - The date to get rates for
   * @returns RateSnapshot with effective rates and source
   */
  async getRates(placementId: string, workDate: Date): Promise<RateSnapshot> {
    const dateStr = workDate.toISOString().split('T')[0]

    // 1. Check placement_rates for date-specific rate
    const { data: dateRate } = await this.adminClient
      .from('placement_rates')
      .select('id, bill_rate, pay_rate, rate_type, effective_from, currency')
      .eq('placement_id', placementId)
      .lte('effective_from', dateStr)
      .or(`effective_to.is.null,effective_to.gte.${dateStr}`)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single()

    if (dateRate && dateRate.bill_rate !== null) {
      return {
        billRate: Number(dateRate.bill_rate),
        payRate: Number(dateRate.pay_rate || 0),
        rateType: (dateRate.rate_type as RateSnapshot['rateType']) || 'hourly',
        effectiveDate: dateRate.effective_from,
        source: 'placement_rates',
        sourceId: dateRate.id,
        currency: dateRate.currency || 'USD',
      }
    }

    // 2. Fall back to placement.bill_rate
    const { data: placement } = await this.adminClient
      .from('placements')
      .select('id, bill_rate, pay_rate, rate_type, rate_card_id, contract_id, account_id')
      .eq('id', placementId)
      .single()

    if (!placement) {
      throw new Error(`Placement ${placementId} not found`)
    }

    if (placement.bill_rate !== null) {
      return {
        billRate: Number(placement.bill_rate),
        payRate: Number(placement.pay_rate || 0),
        rateType: (placement.rate_type as RateSnapshot['rateType']) || 'hourly',
        effectiveDate: dateStr,
        source: 'placement',
        sourceId: placement.id,
        currency: 'USD',
      }
    }

    // 3. Try rate card if linked
    if (placement.rate_card_id) {
      const { data: rateCard } = await this.adminClient
        .from('rate_cards')
        .select('id, standard_bill_rate, target_pay_rate, currency')
        .eq('id', placement.rate_card_id)
        .single()

      if (rateCard && rateCard.standard_bill_rate !== null) {
        return {
          billRate: Number(rateCard.standard_bill_rate),
          payRate: Number(rateCard.target_pay_rate || 0),
          rateType: 'hourly',
          effectiveDate: dateStr,
          source: 'rate_card',
          sourceId: rateCard.id,
          currency: rateCard.currency || 'USD',
        }
      }
    }

    // 4. Try contract rate if linked
    if (placement.contract_id) {
      const { data: contract } = await this.adminClient
        .from('contracts')
        .select('id, contract_terms')
        .eq('id', placement.contract_id)
        .single()

      if (contract?.contract_terms) {
        const terms = contract.contract_terms as {
          bill_rate?: number
          pay_rate?: number
        }
        if (terms.bill_rate) {
          return {
            billRate: Number(terms.bill_rate),
            payRate: Number(terms.pay_rate || 0),
            rateType: 'hourly',
            effectiveDate: dateStr,
            source: 'contract',
            sourceId: contract.id,
            currency: 'USD',
          }
        }
      }
    }

    throw new Error(`No rate found for placement ${placementId} on ${dateStr}`)
  }

  /**
   * Get overtime rules for a placement based on work location
   *
   * @param placementId - The placement UUID
   * @returns OvertimeRules based on work state or federal default
   */
  async getOvertimeRules(placementId: string): Promise<OvertimeRules> {
    const { data: placement } = await this.adminClient
      .from('placements')
      .select('id, work_state, overtime_eligible')
      .eq('id', placementId)
      .single()

    if (!placement) {
      throw new Error(`Placement ${placementId} not found`)
    }

    // If not overtime eligible, return rules with no OT multipliers
    if (placement.overtime_eligible === false) {
      return {
        overtimeMultiplier: 1,
        doubleTimeMultiplier: 1,
        dailyOvertimeThreshold: null,
        dailyDoubleTimeThreshold: null,
        weeklyOvertimeThreshold: 999, // Effectively no weekly OT
        seventhDayRule: false,
      }
    }

    // Get state-specific rules or fall back to federal
    const workState = placement.work_state?.toUpperCase()
    const stateRules = workState ? STATE_OVERTIME_RULES[workState] : null

    if (stateRules) {
      return {
        ...FEDERAL_OVERTIME_RULES,
        ...stateRules,
      }
    }

    return FEDERAL_OVERTIME_RULES
  }

  /**
   * Calculate billing and payroll amounts for timesheet entries
   *
   * @param entries - Array of timesheet entry hour breakdowns
   * @param rateSnapshot - The rate snapshot to use for calculations
   * @param overtimeRules - The overtime rules to apply
   * @returns Calculated amounts with detailed breakdown
   */
  calculateTimesheetAmounts(
    entries: Array<{
      regularHours: number
      overtimeHours: number
      doubleTimeHours: number
    }>,
    rateSnapshot: RateSnapshot,
    overtimeRules: OvertimeRules
  ): CalculatedAmounts {
    let totalRegularBillable = 0
    let totalOvertimeBillable = 0
    let totalDoubleTimeBillable = 0
    let totalRegularPayable = 0
    let totalOvertimePayable = 0
    let totalDoubleTimePayable = 0

    for (const entry of entries) {
      // Billing amounts
      totalRegularBillable += entry.regularHours * rateSnapshot.billRate
      totalOvertimeBillable +=
        entry.overtimeHours * rateSnapshot.billRate * overtimeRules.overtimeMultiplier
      totalDoubleTimeBillable +=
        entry.doubleTimeHours * rateSnapshot.billRate * overtimeRules.doubleTimeMultiplier

      // Payable amounts
      totalRegularPayable += entry.regularHours * rateSnapshot.payRate
      totalOvertimePayable +=
        entry.overtimeHours * rateSnapshot.payRate * overtimeRules.overtimeMultiplier
      totalDoubleTimePayable +=
        entry.doubleTimeHours * rateSnapshot.payRate * overtimeRules.doubleTimeMultiplier
    }

    const totalBillable = totalRegularBillable + totalOvertimeBillable + totalDoubleTimeBillable
    const totalPayable = totalRegularPayable + totalOvertimePayable + totalDoubleTimePayable
    const margin = totalBillable - totalPayable
    const marginPercent = totalBillable > 0 ? (margin / totalBillable) * 100 : 0

    return {
      totalBillable: Math.round(totalBillable * 100) / 100,
      totalPayable: Math.round(totalPayable * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      marginPercent: Math.round(marginPercent * 100) / 100,
      breakdown: {
        regularBillable: Math.round(totalRegularBillable * 100) / 100,
        overtimeBillable: Math.round(totalOvertimeBillable * 100) / 100,
        doubleTimeBillable: Math.round(totalDoubleTimeBillable * 100) / 100,
        regularPayable: Math.round(totalRegularPayable * 100) / 100,
        overtimePayable: Math.round(totalOvertimePayable * 100) / 100,
        doubleTimePayable: Math.round(totalDoubleTimePayable * 100) / 100,
      },
    }
  }

  /**
   * Classify daily hours into regular, overtime, and double-time
   * based on the provided overtime rules
   *
   * @param totalHours - Total hours worked in a day
   * @param overtimeRules - The overtime rules to apply
   * @returns Breakdown of hours by type
   */
  classifyDailyHours(
    totalHours: number,
    overtimeRules: OvertimeRules
  ): {
    regularHours: number
    overtimeHours: number
    doubleTimeHours: number
  } {
    let regularHours = 0
    let overtimeHours = 0
    let doubleTimeHours = 0

    if (!overtimeRules.dailyOvertimeThreshold) {
      // No daily OT threshold (federal default) - all hours are regular for daily calc
      regularHours = totalHours
    } else {
      // State with daily OT threshold (e.g., CA)
      regularHours = Math.min(totalHours, overtimeRules.dailyOvertimeThreshold)

      const remainingHours = totalHours - regularHours

      if (remainingHours > 0) {
        if (overtimeRules.dailyDoubleTimeThreshold) {
          // State with daily double-time threshold (e.g., CA at 12 hours)
          const dtThreshold =
            overtimeRules.dailyDoubleTimeThreshold - overtimeRules.dailyOvertimeThreshold
          overtimeHours = Math.min(remainingHours, dtThreshold)
          doubleTimeHours = Math.max(0, remainingHours - dtThreshold)
        } else {
          overtimeHours = remainingHours
        }
      }
    }

    return {
      regularHours: Math.round(regularHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      doubleTimeHours: Math.round(doubleTimeHours * 100) / 100,
    }
  }

  /**
   * Apply weekly overtime rules to adjust hours classification
   * Called after daily classification to handle weekly OT threshold
   *
   * @param dailyClassifications - Array of daily hour classifications
   * @param overtimeRules - The overtime rules to apply
   * @returns Adjusted classifications with weekly OT applied
   */
  applyWeeklyOvertimeRules(
    dailyClassifications: Array<{
      date: string
      regularHours: number
      overtimeHours: number
      doubleTimeHours: number
    }>,
    overtimeRules: OvertimeRules
  ): Array<{
    date: string
    regularHours: number
    overtimeHours: number
    doubleTimeHours: number
  }> {
    // Sort by date
    const sorted = [...dailyClassifications].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Track cumulative regular hours
    let cumulativeRegularHours = 0
    const result: typeof dailyClassifications = []

    for (const day of sorted) {
      // Start with daily classification
      let { regularHours, overtimeHours, doubleTimeHours } = day

      // Apply weekly OT threshold
      const potentialCumulative = cumulativeRegularHours + regularHours

      if (potentialCumulative > overtimeRules.weeklyOvertimeThreshold) {
        // Split: some hours become weekly OT
        const regularAllowed = Math.max(
          0,
          overtimeRules.weeklyOvertimeThreshold - cumulativeRegularHours
        )
        const convertToOT = regularHours - regularAllowed

        regularHours = regularAllowed
        overtimeHours += convertToOT
        cumulativeRegularHours = overtimeRules.weeklyOvertimeThreshold
      } else {
        cumulativeRegularHours = potentialCumulative
      }

      result.push({
        date: day.date,
        regularHours: Math.round(regularHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        doubleTimeHours: Math.round(doubleTimeHours * 100) / 100,
      })
    }

    return result
  }

  /**
   * Create a rate snapshot for audit purposes
   * Called when a timesheet is submitted to freeze rates
   *
   * @param placementId - The placement UUID
   * @param periodStart - Start of the timesheet period
   * @param periodEnd - End of the timesheet period
   * @returns JSON-serializable rate snapshot
   */
  async createRateSnapshotForPeriod(
    placementId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<Record<string, unknown>> {
    const rates = await this.getRates(placementId, periodStart)
    const overtimeRules = await this.getOvertimeRules(placementId)

    return {
      capturedAt: new Date().toISOString(),
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
      rates: {
        billRate: rates.billRate,
        payRate: rates.payRate,
        rateType: rates.rateType,
        currency: rates.currency,
        source: rates.source,
        sourceId: rates.sourceId,
        effectiveDate: rates.effectiveDate,
      },
      overtimeRules: {
        overtimeMultiplier: overtimeRules.overtimeMultiplier,
        doubleTimeMultiplier: overtimeRules.doubleTimeMultiplier,
        dailyOvertimeThreshold: overtimeRules.dailyOvertimeThreshold,
        weeklyOvertimeThreshold: overtimeRules.weeklyOvertimeThreshold,
        seventhDayRule: overtimeRules.seventhDayRule,
      },
    }
  }
}

// Export singleton instance
export const rateResolver = new RateResolver()
