/**
 * Business Hours Calculation Utilities
 *
 * Provides functions for calculating elapsed time considering:
 * - Business hours (configurable start/end times)
 * - Weekends (exclude Saturday/Sunday)
 * - Holidays (from organization calendar)
 * - Timezones
 */

import { BusinessHoursConfig, SlaTargetUnit, ElapsedTimeResult } from './types'

// Default business hours configuration
export const DEFAULT_BUSINESS_HOURS: BusinessHoursConfig = {
  startHour: 9, // 9:00 AM
  endHour: 17, // 5:00 PM
  timezone: 'America/New_York',
  excludeWeekends: true,
  holidays: [],
}

// Minutes per business day (8 hours by default)
const MINUTES_PER_BUSINESS_DAY = 8 * 60 // 480 minutes

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date, holidays: string[]): boolean {
  const dateString = formatDateString(date)
  return holidays.includes(dateString)
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if a date falls within business hours
 */
export function isBusinessHour(
  date: Date,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): boolean {
  // Check weekend
  if (config.excludeWeekends && isWeekend(date)) {
    return false
  }

  // Check holiday
  if (isHoliday(date, config.holidays)) {
    return false
  }

  // Check time within business hours
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const timeInMinutes = hours * 60 + minutes
  const startInMinutes = config.startHour * 60
  const endInMinutes = config.endHour * 60

  return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes
}

/**
 * Check if a date is a business day (not weekend, not holiday)
 */
export function isBusinessDay(
  date: Date,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): boolean {
  if (config.excludeWeekends && isWeekend(date)) {
    return false
  }
  if (isHoliday(date, config.holidays)) {
    return false
  }
  return true
}

/**
 * Get the start of business hours for a given date
 */
export function getBusinessDayStart(
  date: Date,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): Date {
  const result = new Date(date)
  result.setHours(config.startHour, 0, 0, 0)
  return result
}

/**
 * Get the end of business hours for a given date
 */
export function getBusinessDayEnd(
  date: Date,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): Date {
  const result = new Date(date)
  result.setHours(config.endHour, 0, 0, 0)
  return result
}

/**
 * Get the next business day start from a given date
 */
export function getNextBusinessDayStart(
  date: Date,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + 1)
  result.setHours(config.startHour, 0, 0, 0)

  // Skip weekends and holidays
  while (!isBusinessDay(result, config)) {
    result.setDate(result.getDate() + 1)
  }

  return result
}

/**
 * Get the previous business day end from a given date
 */
export function getPreviousBusinessDayEnd(
  date: Date,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - 1)
  result.setHours(config.endHour, 0, 0, 0)

  // Skip weekends and holidays
  while (!isBusinessDay(result, config)) {
    result.setDate(result.getDate() - 1)
  }

  return result
}

/**
 * Calculate business minutes between two dates on the same day
 */
function calculateSameDayBusinessMinutes(
  start: Date,
  end: Date,
  config: BusinessHoursConfig
): number {
  const businessStart = getBusinessDayStart(start, config)
  const businessEnd = getBusinessDayEnd(start, config)

  // Clamp start and end to business hours
  const effectiveStart = new Date(
    Math.max(start.getTime(), businessStart.getTime())
  )
  const effectiveEnd = new Date(Math.min(end.getTime(), businessEnd.getTime()))

  if (effectiveEnd <= effectiveStart) {
    return 0
  }

  return Math.floor(
    (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60)
  )
}

/**
 * Calculate elapsed business hours between two dates
 *
 * This is the core calculation function that considers:
 * - Business hours (9 AM - 5 PM by default)
 * - Weekends (Saturday and Sunday)
 * - Holidays (from config)
 */
export function calculateBusinessMinutes(
  startDate: Date,
  endDate: Date,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): number {
  // If end is before start, return 0
  if (endDate <= startDate) {
    return 0
  }

  let totalMinutes = 0
  let currentDate = new Date(startDate)

  // Process the calculation day by day
  while (currentDate < endDate) {
    // Skip non-business days
    if (!isBusinessDay(currentDate, config)) {
      currentDate.setDate(currentDate.getDate() + 1)
      currentDate.setHours(config.startHour, 0, 0, 0)
      continue
    }

    const businessStart = getBusinessDayStart(currentDate, config)
    const businessEnd = getBusinessDayEnd(currentDate, config)

    // Determine effective start for this day
    let dayStart = currentDate
    if (currentDate < businessStart) {
      dayStart = businessStart
    }

    // Check if we're after business hours for this day
    if (currentDate >= businessEnd) {
      currentDate = getNextBusinessDayStart(currentDate, config)
      continue
    }

    // Determine effective end for this day
    const nextDayStart = new Date(currentDate)
    nextDayStart.setDate(nextDayStart.getDate() + 1)
    nextDayStart.setHours(0, 0, 0, 0)

    const dayEnd =
      endDate < businessEnd
        ? endDate
        : endDate < nextDayStart
          ? endDate
          : businessEnd

    // Calculate minutes for this day
    if (dayEnd > dayStart) {
      totalMinutes += calculateSameDayBusinessMinutes(dayStart, dayEnd, config)
    }

    // Move to next day
    currentDate = getNextBusinessDayStart(currentDate, config)
  }

  return totalMinutes
}

/**
 * Calculate total calendar minutes between two dates
 */
export function calculateTotalMinutes(startDate: Date, endDate: Date): number {
  if (endDate <= startDate) {
    return 0
  }
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60))
}

/**
 * Calculate business hours between two dates
 */
export function calculateBusinessHours(
  startDate: Date,
  endDate: Date,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): number {
  return calculateBusinessMinutes(startDate, endDate, config) / 60
}

/**
 * Convert target value and unit to minutes
 */
export function convertToMinutes(
  targetValue: number,
  targetUnit: SlaTargetUnit,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): number {
  const businessDayMinutes =
    (config.endHour - config.startHour) * 60 || MINUTES_PER_BUSINESS_DAY

  switch (targetUnit) {
    case 'minutes':
      return targetValue
    case 'hours':
      return targetValue * 60
    case 'business_hours':
      return targetValue * 60
    case 'days':
      return targetValue * 24 * 60
    case 'business_days':
      return targetValue * businessDayMinutes
    case 'weeks':
      return targetValue * 7 * 24 * 60
    default:
      return targetValue * 60
  }
}

/**
 * Calculate target deadline given start date and target value
 *
 * For business time units, this adds business time.
 * For regular time units, this adds calendar time.
 */
export function calculateDeadline(
  startDate: Date,
  targetValue: number,
  targetUnit: SlaTargetUnit,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): Date {
  const result = new Date(startDate)

  switch (targetUnit) {
    case 'minutes':
      result.setTime(result.getTime() + targetValue * 60 * 1000)
      return result

    case 'hours':
      result.setTime(result.getTime() + targetValue * 60 * 60 * 1000)
      return result

    case 'business_hours':
      return addBusinessMinutes(result, targetValue * 60, config)

    case 'days':
      result.setDate(result.getDate() + targetValue)
      return result

    case 'business_days':
      return addBusinessDays(result, targetValue, config)

    case 'weeks':
      result.setDate(result.getDate() + targetValue * 7)
      return result

    default:
      result.setTime(result.getTime() + targetValue * 60 * 60 * 1000)
      return result
  }
}

/**
 * Add business minutes to a date
 */
export function addBusinessMinutes(
  startDate: Date,
  minutesToAdd: number,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): Date {
  let remaining = minutesToAdd
  let current = new Date(startDate)

  // If starting outside business hours, move to next business hour start
  if (!isBusinessHour(current, config)) {
    if (!isBusinessDay(current, config)) {
      current = getNextBusinessDayStart(current, config)
    } else {
      const hours = current.getHours()
      if (hours < config.startHour) {
        current.setHours(config.startHour, 0, 0, 0)
      } else if (hours >= config.endHour) {
        current = getNextBusinessDayStart(current, config)
      }
    }
  }

  while (remaining > 0) {
    const businessEnd = getBusinessDayEnd(current, config)
    const minutesUntilEnd = Math.floor(
      (businessEnd.getTime() - current.getTime()) / (1000 * 60)
    )

    if (remaining <= minutesUntilEnd) {
      // Can complete within current day
      current.setTime(current.getTime() + remaining * 60 * 1000)
      remaining = 0
    } else {
      // Use up remaining time today and move to next day
      remaining -= minutesUntilEnd
      current = getNextBusinessDayStart(current, config)
    }
  }

  return current
}

/**
 * Add business days to a date
 */
export function addBusinessDays(
  startDate: Date,
  daysToAdd: number,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): Date {
  let remaining = daysToAdd
  const current = new Date(startDate)

  while (remaining > 0) {
    current.setDate(current.getDate() + 1)
    if (isBusinessDay(current, config)) {
      remaining--
    }
  }

  return current
}

/**
 * Calculate elapsed time result for SLA monitoring
 *
 * Returns comprehensive information about elapsed time including
 * both total and business minutes.
 */
export function calculateElapsedTime(
  startDate: Date,
  targetValue: number,
  targetUnit: SlaTargetUnit,
  config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS,
  endDate?: Date
): ElapsedTimeResult {
  const now = endDate || new Date()
  const targetMinutes = convertToMinutes(targetValue, targetUnit, config)

  // Calculate elapsed time based on unit type
  const isBusinessTimeUnit =
    targetUnit === 'business_hours' || targetUnit === 'business_days'

  const totalMinutes = calculateTotalMinutes(startDate, now)
  const businessMinutes = isBusinessTimeUnit
    ? calculateBusinessMinutes(startDate, now, config)
    : totalMinutes

  const effectiveMinutes = isBusinessTimeUnit ? businessMinutes : totalMinutes
  const percentageOfTarget =
    targetMinutes > 0 ? (effectiveMinutes / targetMinutes) * 100 : 0

  const isOverdue = effectiveMinutes > targetMinutes
  const overdueMinutes = isOverdue ? effectiveMinutes - targetMinutes : 0

  return {
    totalMinutes,
    businessMinutes,
    percentageOfTarget: Math.round(percentageOfTarget * 100) / 100,
    isOverdue,
    overdueMinutes,
  }
}

/**
 * Determine the current escalation level based on percentage
 */
export function determineEscalationLevel(
  percentage: number,
  escalationLevels: Array<{ levelNumber: number; triggerPercentage: number }>
): number {
  // Sort levels by trigger percentage descending
  const sortedLevels = [...escalationLevels].sort(
    (a, b) => b.triggerPercentage - a.triggerPercentage
  )

  for (const level of sortedLevels) {
    if (percentage >= level.triggerPercentage) {
      return level.levelNumber
    }
  }

  return 0 // No escalation level reached
}

/**
 * Get SLA status based on current percentage and escalation levels
 */
export function getSlaStatus(
  percentage: number,
  escalationLevels: Array<{
    levelNumber: number
    triggerPercentage: number
    levelName: string
  }>
): 'pending' | 'warning' | 'breach' | 'critical' {
  const currentLevel = determineEscalationLevel(percentage, escalationLevels)

  if (currentLevel === 0) {
    return 'pending'
  }

  const level = escalationLevels.find((l) => l.levelNumber === currentLevel)
  if (!level) {
    return 'pending'
  }

  const levelName = level.levelName.toLowerCase()
  if (levelName === 'critical' || level.triggerPercentage > 125) {
    return 'critical'
  }
  if (levelName === 'breach' || level.triggerPercentage >= 100) {
    return 'breach'
  }
  return 'warning'
}

/**
 * Format elapsed time for display
 */
export function formatElapsedTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }

  const hours = minutes / 60
  if (hours < 24) {
    return `${Math.round(hours * 10) / 10} hrs`
  }

  const days = hours / 24
  if (days < 7) {
    return `${Math.round(days * 10) / 10} days`
  }

  const weeks = days / 7
  return `${Math.round(weeks * 10) / 10} weeks`
}

/**
 * Format time remaining until deadline
 */
export function formatTimeRemaining(deadline: Date, now?: Date): string {
  const current = now || new Date()
  const diffMs = deadline.getTime() - current.getTime()

  if (diffMs <= 0) {
    const overdueMinutes = Math.abs(diffMs) / (1000 * 60)
    return `${formatElapsedTime(overdueMinutes)} overdue`
  }

  const minutes = diffMs / (1000 * 60)
  return `${formatElapsedTime(minutes)} remaining`
}
