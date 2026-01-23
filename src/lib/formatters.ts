/**
 * Unified Formatters - Single Source of Truth
 *
 * Enterprise-grade formatting utilities for all data types.
 * Hublot-inspired: precise, elegant, consistent.
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

// ============================================
// CURRENCY FORMATTING
// ============================================

export type CurrencyCode = 'USD' | 'CAD' | 'GBP' | 'EUR' | 'INR'

export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; locale: string }> = {
  USD: { symbol: '$', locale: 'en-US' },
  CAD: { symbol: 'C$', locale: 'en-CA' },
  GBP: { symbol: '£', locale: 'en-GB' },
  EUR: { symbol: '€', locale: 'de-DE' },
  INR: { symbol: '₹', locale: 'en-IN' },
}

export interface FormatCurrencyOptions {
  currency?: CurrencyCode
  decimals?: number
  compact?: boolean
  showCurrency?: boolean
}

export function formatCurrency(
  value: number | string | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  const { currency = 'USD', decimals = 0, compact = false, showCurrency = false } = options

  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'

  const config = CURRENCY_CONFIG[currency]

  if (compact && Math.abs(num) >= 1000) {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    })
    return formatter.format(num)
  }

  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  const formatted = formatter.format(num)
  return showCurrency ? `${formatted} ${currency}` : formatted
}

export function parseCurrencyInput(value: string): number | null {
  if (!value) return null
  // Remove currency symbols, commas, spaces
  const cleaned = value.replace(/[$€£₹C,\s]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

// ============================================
// NUMBER FORMATTING
// ============================================

export interface FormatNumberOptions {
  decimals?: number
  compact?: boolean
  locale?: string
}

export function formatNumber(
  value: number | string | null | undefined,
  options: FormatNumberOptions = {}
): string {
  const { decimals = 0, compact = false, locale = 'en-US' } = options

  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'

  if (compact && Math.abs(num) >= 1000) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num)
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

// ============================================
// PERCENTAGE FORMATTING
// ============================================

export interface FormatPercentageOptions {
  decimals?: number
  showSymbol?: boolean
}

export function formatPercentage(
  value: number | string | null | undefined,
  options: FormatPercentageOptions = {}
): string {
  const { decimals = 0, showSymbol = true } = options

  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'

  const formatted = num.toFixed(decimals)
  return showSymbol ? `${formatted}%` : formatted
}

// ============================================
// DATE FORMATTING
// ============================================

export type DateFormat =
  | 'short'       // Jan 21, 2024
  | 'medium'      // January 21, 2024
  | 'long'        // January 21, 2024 at 2:30 PM
  | 'time'        // 2:30 PM
  | 'relative'    // 3 days ago
  | 'iso'         // 2024-01-21
  | 'monthYear'   // January 2024
  | 'dayMonth'    // Jan 21

const DATE_FORMATS: Record<Exclude<DateFormat, 'relative'>, string> = {
  short: 'MMM d, yyyy',
  medium: 'MMMM d, yyyy',
  long: "MMMM d, yyyy 'at' h:mm a",
  time: 'h:mm a',
  iso: 'yyyy-MM-dd',
  monthYear: 'MMMM yyyy',
  dayMonth: 'MMM d',
}

export function formatDate(
  value: Date | string | number | null | undefined,
  dateFormat: DateFormat = 'short'
): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  let date: Date
  if (typeof value === 'string') {
    date = parseISO(value)
  } else if (typeof value === 'number') {
    date = new Date(value)
  } else {
    date = value
  }

  if (!isValid(date)) return '—'

  if (dateFormat === 'relative') {
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return format(date, DATE_FORMATS[dateFormat])
}

export function formatDateRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
  dateFormat: DateFormat = 'short'
): string {
  const startFormatted = formatDate(start, dateFormat)
  const endFormatted = formatDate(end, dateFormat)

  if (startFormatted === '—' && endFormatted === '—') return '—'
  if (startFormatted === '—') return `Until ${endFormatted}`
  if (endFormatted === '—') return `From ${startFormatted}`

  return `${startFormatted} → ${endFormatted}`
}

// ============================================
// PHONE FORMATTING
// ============================================

export interface PhoneValue {
  countryCode?: string
  number: string
}

export const PHONE_FORMATS: Record<string, { dialCode: string; format: string; flag: string }> = {
  US: { dialCode: '+1', format: '(###) ###-####', flag: '🇺🇸' },
  CA: { dialCode: '+1', format: '(###) ###-####', flag: '🇨🇦' },
  GB: { dialCode: '+44', format: '#### ######', flag: '🇬🇧' },
  IN: { dialCode: '+91', format: '##### #####', flag: '🇮🇳' },
  AU: { dialCode: '+61', format: '### ### ###', flag: '🇦🇺' },
}

export function formatPhone(
  value: string | PhoneValue | null | undefined,
  options: { showFlag?: boolean; showDialCode?: boolean } = {}
): string {
  const { showFlag = true, showDialCode = true } = options

  if (!value) return '—'

  let countryCode = 'US'
  let number = ''

  if (typeof value === 'string') {
    number = value.replace(/\D/g, '')
  } else {
    countryCode = value.countryCode || 'US'
    number = value.number?.replace(/\D/g, '') || ''
  }

  if (!number) return '—'

  const config = PHONE_FORMATS[countryCode] || PHONE_FORMATS.US

  // Apply formatting
  let result = ''
  let digitIndex = 0
  for (const char of config.format) {
    if (digitIndex >= number.length) break
    if (char === '#') {
      result += number[digitIndex]
      digitIndex++
    } else {
      result += char
    }
  }

  const parts: string[] = []
  if (showFlag) parts.push(config.flag)
  if (showDialCode) parts.push(config.dialCode)
  parts.push(result || number)

  return parts.join(' ')
}

// ============================================
// ADDRESS FORMATTING
// ============================================

export interface AddressValue {
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export type AddressFormat = 'full' | 'short' | 'cityState' | 'oneLine'

export function formatAddress(
  value: AddressValue | null | undefined,
  addressFormat: AddressFormat = 'full'
): string {
  if (!value) return '—'

  const { addressLine1, addressLine2, city, state, postalCode, country } = value

  switch (addressFormat) {
    case 'cityState':
      if (!city && !state) return '—'
      return [city, state].filter(Boolean).join(', ')

    case 'short':
      if (!city && !state && !country) return '—'
      return [city, state, country].filter(Boolean).join(', ')

    case 'oneLine': {
      const parts = [addressLine1, addressLine2, city, state, postalCode, country].filter(Boolean)
      return parts.length > 0 ? parts.join(', ') : '—'
    }

    case 'full':
    default: {
      const lines: string[] = []
      if (addressLine1) lines.push(addressLine1)
      if (addressLine2) lines.push(addressLine2)
      const cityLine = [city, state, postalCode].filter(Boolean).join(', ')
      if (cityLine) lines.push(cityLine)
      if (country && country !== 'US' && country !== 'USA' && country !== 'United States') {
        lines.push(country)
      }
      return lines.length > 0 ? lines.join('\n') : '—'
    }
  }
}

// ============================================
// TEXT FORMATTING
// ============================================

export function formatSnakeCase(value: string | null | undefined): string {
  if (!value) return '—'
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatCamelCase(value: string | null | undefined): string {
  if (!value) return '—'
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

export function truncateText(
  value: string | null | undefined,
  maxLength: number,
  suffix = '...'
): string {
  if (!value) return '—'
  if (value.length <= maxLength) return value
  return value.slice(0, maxLength - suffix.length) + suffix
}

// ============================================
// ARRAY FORMATTING
// ============================================

export interface FormatArrayOptions {
  maxItems?: number
  separator?: string
  showCount?: boolean
}

export function formatArray(
  value: string[] | null | undefined,
  options: FormatArrayOptions = {}
): { visible: string[]; remaining: number; formatted: string } {
  const { maxItems = 3, separator = ', ', showCount = true } = options

  if (!value || value.length === 0) {
    return { visible: [], remaining: 0, formatted: '—' }
  }

  const visible = value.slice(0, maxItems)
  const remaining = Math.max(0, value.length - maxItems)

  let formatted = visible.join(separator)
  if (showCount && remaining > 0) {
    formatted += ` +${remaining} more`
  }

  return { visible, remaining, formatted }
}

// ============================================
// BOOLEAN FORMATTING
// ============================================

export type BooleanFormat = 'yesNo' | 'trueFalse' | 'check' | 'enabledDisabled' | 'activeInactive'

const BOOLEAN_LABELS: Record<BooleanFormat, [string, string]> = {
  yesNo: ['Yes', 'No'],
  trueFalse: ['True', 'False'],
  check: ['✓', '✗'],
  enabledDisabled: ['Enabled', 'Disabled'],
  activeInactive: ['Active', 'Inactive'],
}

export function formatBoolean(
  value: boolean | null | undefined,
  boolFormat: BooleanFormat = 'yesNo'
): string {
  if (value === null || value === undefined) return '—'
  const labels = BOOLEAN_LABELS[boolFormat]
  return value ? labels[0] : labels[1]
}

// ============================================
// EMAIL FORMATTING
// ============================================

export function formatEmail(value: string | null | undefined): string {
  if (!value) return '—'
  // Basic validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) return value
  return value.toLowerCase()
}

// ============================================
// URL FORMATTING
// ============================================

export function formatUrl(
  value: string | null | undefined,
  options: { showProtocol?: boolean } = {}
): string {
  const { showProtocol = false } = options

  if (!value) return '—'

  let url = value
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  if (!showProtocol) {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }

  return url
}

export function formatLinkedIn(value: string | null | undefined): string {
  if (!value) return '—'

  // Extract username from various formats
  const match = value.match(/linkedin\.com\/in\/([^/\s?]+)/)
  if (match) return `in/${match[1]}`

  // If it's already a username
  if (!value.includes('/') && !value.includes('.')) {
    return `in/${value}`
  }

  return formatUrl(value, { showProtocol: false })
}

// ============================================
// RATING FORMATTING
// ============================================

export function formatRating(
  value: number | null | undefined,
  maxRating = 5
): { value: number; display: string; stars: string } {
  if (value === null || value === undefined) {
    return { value: 0, display: '—', stars: '☆'.repeat(maxRating) }
  }

  const clampedValue = Math.min(Math.max(0, value), maxRating)
  const fullStars = Math.floor(clampedValue)
  const emptyStars = maxRating - fullStars

  return {
    value: clampedValue,
    display: `${clampedValue}/${maxRating}`,
    stars: '★'.repeat(fullStars) + '☆'.repeat(emptyStars),
  }
}

// ============================================
// STATUS HELPERS
// ============================================

export type StatusVariant = 'success' | 'warning' | 'destructive' | 'secondary' | 'default'

export function getStatusVariant(status: string | null | undefined): StatusVariant {
  if (!status) return 'secondary'

  const statusLower = status.toLowerCase()

  // Success states
  if (['active', 'approved', 'completed', 'filled', 'placed', 'won', 'qualified'].includes(statusLower)) {
    return 'success'
  }

  // Warning states
  if (['pending', 'draft', 'in_progress', 'on_hold', 'review', 'submitted'].includes(statusLower)) {
    return 'warning'
  }

  // Destructive states
  if (['inactive', 'suspended', 'declined', 'expired', 'cancelled', 'rejected', 'lost', 'churned', 'terminated'].includes(statusLower)) {
    return 'destructive'
  }

  return 'secondary'
}

// ============================================
// UTILITY: Empty Value Check
// ============================================

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

export function getEmptyText(type: string): string {
  const emptyTexts: Record<string, string> = {
    phone: 'No phone',
    email: 'No email',
    url: 'No link',
    address: 'No address',
    user: 'Unassigned',
    date: '—',
    currency: '—',
    default: 'Not specified',
  }
  return emptyTexts[type] || emptyTexts.default
}
