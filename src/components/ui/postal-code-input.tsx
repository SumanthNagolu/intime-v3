'use client'

import * as React from 'react'
import { MapPin } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Postal code formats and validation by country
export const POSTAL_CODE_FORMATS = {
  US: {
    label: 'ZIP Code',
    format: '#####',
    formatExtended: '#####-####',
    regex: /^\d{5}(-\d{4})?$/,
    maxDigits: 5,
    maxDigitsExtended: 9,
    placeholder: '12345',
    placeholderExtended: '12345-6789',
    allowExtended: true,
    inputMode: 'numeric' as const,
  },
  CA: {
    label: 'Postal Code',
    format: 'A#A #A#',
    regex: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
    maxChars: 7,
    placeholder: 'A1A 1A1',
    allowExtended: false,
    inputMode: 'text' as const,
  },
  IN: {
    label: 'PIN Code',
    format: '######',
    regex: /^\d{6}$/,
    maxDigits: 6,
    placeholder: '110001',
    allowExtended: false,
    inputMode: 'numeric' as const,
  },
  GB: {
    label: 'Postcode',
    format: 'AA## #AA',
    regex: /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/,
    maxChars: 8,
    placeholder: 'SW1A 1AA',
    allowExtended: false,
    inputMode: 'text' as const,
  },
  AU: {
    label: 'Postcode',
    format: '####',
    regex: /^\d{4}$/,
    maxDigits: 4,
    placeholder: '2000',
    allowExtended: false,
    inputMode: 'numeric' as const,
  },
} as const

export type PostalCodeCountry = keyof typeof POSTAL_CODE_FORMATS

interface PostalCodeInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  countryCode: PostalCodeCountry | string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

// Format US ZIP code with dash for extended format
function formatUSZip(digits: string): string {
  if (digits.length <= 5) {
    return digits
  }
  return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`
}

// Format Canadian postal code (A1A 1A1)
function formatCanadianPostal(value: string): string {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.length <= 3) {
    return cleaned
  }
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`
}

// Format UK postcode (variable format with space before last 3 chars)
function formatUKPostcode(value: string): string {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.length <= 4) {
    return cleaned
  }
  // Insert space before last 3 characters
  const insertPos = cleaned.length - 3
  return `${cleaned.slice(0, insertPos)} ${cleaned.slice(insertPos)}`
}

// Get only digits from input
function getDigitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

// Get alphanumeric characters only
function getAlphanumericOnly(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '')
}

// Validate postal code based on country
function validatePostalCode(
  value: string,
  countryCode: PostalCodeCountry
): { valid: boolean; message?: string } {
  if (!value) {
    return { valid: true } // Empty is valid (optional field)
  }

  const config = POSTAL_CODE_FORMATS[countryCode]
  if (!config) {
    return { valid: true } // Unknown country, accept any value
  }

  if (!config.regex.test(value)) {
    return {
      valid: false,
      message: `Invalid ${config.label} format`,
    }
  }

  return { valid: true }
}

/**
 * PostalCodeInput - Postal/ZIP code input with country-specific formatting and validation
 *
 * Usage:
 * ```tsx
 * <PostalCodeInput
 *   label="ZIP Code"
 *   value={postalCode}
 *   onChange={setPostalCode}
 *   countryCode="US"
 *   required
 * />
 * ```
 */
export function PostalCodeInput({
  label,
  value,
  onChange,
  countryCode,
  required = false,
  disabled = false,
  error,
  className,
}: PostalCodeInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | undefined>()

  // Get current country config (default to US if unknown)
  const config = POSTAL_CODE_FORMATS[countryCode as PostalCodeCountry] || POSTAL_CODE_FORMATS.US
  const isNumericOnly = config.inputMode === 'numeric'

  // Format the display value based on country
  const getDisplayValue = (val: string): string => {
    if (!val) return ''

    switch (countryCode) {
      case 'US':
        return formatUSZip(getDigitsOnly(val))
      case 'CA':
        return formatCanadianPostal(val)
      case 'GB':
        return formatUKPostcode(val)
      case 'IN':
      case 'AU':
        return getDigitsOnly(val)
      default:
        return val
    }
  }

  const displayValue = getDisplayValue(value)

  // Get the max length for the input
  const getMaxLength = (): number => {
    switch (countryCode) {
      case 'US':
        return 10 // 12345-6789
      case 'CA':
        return 7 // A1A 1A1
      case 'GB':
        return 8 // SW1A 1AA
      case 'IN':
        return 6
      case 'AU':
        return 4
      default:
        return 10
    }
  }

  // Get current character/digit count for display
  const getCurrentCount = (): { current: number; max: number } => {
    switch (countryCode) {
      case 'US': {
        const digits = getDigitsOnly(value)
        return { current: digits.length, max: config.allowExtended ? 9 : 5 }
      }
      case 'CA':
      case 'GB': {
        const chars = getAlphanumericOnly(value)
        return { current: chars.length, max: countryCode === 'CA' ? 6 : 7 }
      }
      case 'IN':
        return { current: getDigitsOnly(value).length, max: 6 }
      case 'AU':
        return { current: getDigitsOnly(value).length, max: 4 }
      default:
        return { current: value.length, max: 10 }
    }
  }

  // Handle input change with formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value

    switch (countryCode) {
      case 'US': {
        // Only allow digits and dash
        const digits = getDigitsOnly(inputValue)
        const limited = digits.slice(0, 9) // Max 9 digits for ZIP+4
        onChange(limited)
        break
      }
      case 'CA': {
        // Allow letters and numbers, convert to uppercase
        const alphanumeric = getAlphanumericOnly(inputValue).toUpperCase()
        const limited = alphanumeric.slice(0, 6)
        onChange(limited)
        break
      }
      case 'GB': {
        // Allow letters and numbers, convert to uppercase
        const alphanumeric = getAlphanumericOnly(inputValue).toUpperCase()
        const limited = alphanumeric.slice(0, 7)
        onChange(limited)
        break
      }
      case 'IN': {
        const digits = getDigitsOnly(inputValue)
        const limited = digits.slice(0, 6)
        onChange(limited)
        break
      }
      case 'AU': {
        const digits = getDigitsOnly(inputValue)
        const limited = digits.slice(0, 4)
        onChange(limited)
        break
      }
      default:
        onChange(inputValue)
    }

    // Clear validation error while typing
    if (validationError) {
      setValidationError(undefined)
    }
  }

  // Validate on blur
  const handleBlur = () => {
    setIsFocused(false)
    if (value) {
      const validation = validatePostalCode(displayValue, countryCode as PostalCodeCountry)
      if (!validation.valid) {
        setValidationError(validation.message)
      }
    }
  }

  const displayError = error || validationError
  const hasError = !!displayError
  const counts = getCurrentCount()
  const isComplete = counts.current >= (countryCode === 'US' ? 5 : counts.max)

  // Get the appropriate label
  const displayLabel = label || config.label || 'Postal Code'

  return (
    <div className={cn('space-y-2', className)}>
      {displayLabel && (
        <Label className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-charcoal-400" />
          {displayLabel}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <input
          type="text"
          inputMode={config.inputMode}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={config.placeholder}
          maxLength={getMaxLength()}
          className={cn(
            'flex h-11 w-full rounded-sm border bg-white px-4 pr-16 text-base text-charcoal-900',
            'transition-all duration-300',
            'placeholder:text-charcoal-400',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Uppercase for CA and GB
            (countryCode === 'CA' || countryCode === 'GB') && 'uppercase',
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-charcoal-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'
          )}
        />

        {/* Character count indicator */}
        {isFocused && (
          <span
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-xs',
              isComplete ? 'text-success-600' : 'text-charcoal-400'
            )}
          >
            {counts.current}/{countryCode === 'US' ? '5-9' : counts.max}
          </span>
        )}
      </div>

      {displayError && <p className="text-sm text-red-500">{displayError}</p>}

      {/* Helper text for US ZIP+4 */}
      {countryCode === 'US' && isFocused && counts.current >= 5 && counts.current < 9 && (
        <p className="text-xs text-charcoal-500">
          Optional: Add 4 more digits for ZIP+4 format
        </p>
      )}
    </div>
  )
}

/**
 * Display-only version of PostalCodeInput
 * Shows formatted postal code
 */
export function PostalCodeDisplay({
  value,
  countryCode = 'US',
  showIcon = true,
  className,
}: {
  value?: string | null
  countryCode?: PostalCodeCountry | string
  showIcon?: boolean
  className?: string
}) {
  if (!value) {
    return <span className={cn('text-charcoal-400', className)}>No postal code</span>
  }

  const config = POSTAL_CODE_FORMATS[countryCode as PostalCodeCountry] || POSTAL_CODE_FORMATS.US

  // Format for display
  let formatted = value
  switch (countryCode) {
    case 'US':
      formatted = formatUSZip(getDigitsOnly(value))
      break
    case 'CA':
      formatted = formatCanadianPostal(value)
      break
    case 'GB':
      formatted = formatUKPostcode(value)
      break
  }

  return (
    <span className={cn('text-charcoal-700 inline-flex items-center gap-1', className)}>
      {showIcon && <MapPin className="w-3.5 h-3.5 text-charcoal-400" />}
      <span>{formatted}</span>
    </span>
  )
}

// Helper to validate a postal code string
export function isValidPostalCode(value: string, countryCode: PostalCodeCountry | string): boolean {
  const config = POSTAL_CODE_FORMATS[countryCode as PostalCodeCountry]
  if (!config) return true // Unknown country, accept any
  return config.regex.test(value)
}

// Helper to get the postal code label for a country
export function getPostalCodeLabel(countryCode: PostalCodeCountry | string): string {
  const config = POSTAL_CODE_FORMATS[countryCode as PostalCodeCountry]
  return config?.label || 'Postal Code'
}
