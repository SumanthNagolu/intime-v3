'use client'

import * as React from 'react'
import { Phone } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Country codes with their phone formats
export const PHONE_COUNTRY_CODES = [
  {
    code: 'US',
    dialCode: '+1',
    label: 'United States',
    flag: '🇺🇸',
    format: '(###) ###-####',
    maxDigits: 10,
  },
  {
    code: 'CA',
    dialCode: '+1',
    label: 'Canada',
    flag: '🇨🇦',
    format: '(###) ###-####',
    maxDigits: 10,
  },
  {
    code: 'IN',
    dialCode: '+91',
    label: 'India',
    flag: '🇮🇳',
    format: '##### #####',
    maxDigits: 10,
  },
  {
    code: 'GB',
    dialCode: '+44',
    label: 'United Kingdom',
    flag: '🇬🇧',
    format: '#### ######',
    maxDigits: 10,
  },
  {
    code: 'AU',
    dialCode: '+61',
    label: 'Australia',
    flag: '🇦🇺',
    format: '### ### ###',
    maxDigits: 9,
  },
] as const

export type PhoneCountryCode = typeof PHONE_COUNTRY_CODES[number]['code']

export interface PhoneInputValue {
  countryCode: PhoneCountryCode
  number: string
}

interface PhoneInputProps {
  label?: string
  value: PhoneInputValue
  onChange: (value: PhoneInputValue) => void
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
  placeholder?: string
}

// Format phone number based on country format
function formatPhoneNumber(digits: string, format: string): string {
  let result = ''
  let digitIndex = 0

  for (const char of format) {
    if (digitIndex >= digits.length) break
    if (char === '#') {
      result += digits[digitIndex]
      digitIndex++
    } else {
      result += char
    }
  }

  return result
}

// Get only digits from input
function getDigitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

// Validate phone number based on country
function validatePhoneNumber(digits: string, maxDigits: number): { valid: boolean; message?: string } {
  if (!digits) {
    return { valid: true } // Empty is valid (optional field)
  }
  if (digits.length < maxDigits) {
    return { valid: false, message: `Phone number must be ${maxDigits} digits` }
  }
  if (digits.length > maxDigits) {
    return { valid: false, message: `Phone number cannot exceed ${maxDigits} digits` }
  }
  return { valid: true }
}

/**
 * PhoneInput - Phone number input with country code selector and auto-formatting
 *
 * Usage:
 * ```tsx
 * <PhoneInput
 *   label="Phone Number"
 *   value={{ countryCode: 'US', number: '5551234567' }}
 *   onChange={(data) => setPhone(data)}
 *   required
 * />
 * ```
 */
export function PhoneInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  className,
  placeholder,
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | undefined>()
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Get current country config
  const countryConfig = PHONE_COUNTRY_CODES.find(c => c.code === value.countryCode) || PHONE_COUNTRY_CODES[0]

  // Format the display value
  const digits = getDigitsOnly(value.number)
  const displayValue = formatPhoneNumber(digits, countryConfig.format)

  // Handle input change with masking
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const newDigits = getDigitsOnly(inputValue)

    // Limit to max digits
    const limitedDigits = newDigits.slice(0, countryConfig.maxDigits)

    onChange({
      ...value,
      number: limitedDigits,
    })

    // Clear validation error while typing
    if (validationError) {
      setValidationError(undefined)
    }
  }

  // Validate on blur
  const handleBlur = () => {
    setIsFocused(false)
    const validation = validatePhoneNumber(digits, countryConfig.maxDigits)
    if (!validation.valid) {
      setValidationError(validation.message)
    }
  }

  // Handle country change
  const handleCountryChange = (newCountryCode: string) => {
    const newConfig = PHONE_COUNTRY_CODES.find(c => c.code === newCountryCode)
    if (newConfig) {
      // Truncate number if it exceeds new max
      const truncatedNumber = digits.slice(0, newConfig.maxDigits)
      onChange({
        countryCode: newCountryCode as PhoneCountryCode,
        number: truncatedNumber,
      })
      setValidationError(undefined)
    }
  }

  // Generate placeholder from format
  const getPlaceholder = () => {
    if (placeholder) return placeholder
    return countryConfig.format.replace(/#/g, '0')
  }

  const displayError = error || validationError
  const hasError = !!displayError

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-charcoal-400" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="flex gap-2">
        {/* Country Code Selector */}
        <Select
          value={value.countryCode}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              'w-[100px] shrink-0',
              hasError && 'border-red-500'
            )}
          >
            <SelectValue>
              <span className="flex items-center gap-1">
                <span>{countryConfig.flag}</span>
                <span className="text-charcoal-600">{countryConfig.dialCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PHONE_COUNTRY_CODES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.label}</span>
                  <span className="text-charcoal-400 ml-auto">{country.dialCode}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={getPlaceholder()}
            className={cn(
              'flex h-11 w-full rounded-sm border bg-white px-4 text-base text-charcoal-900',
              'transition-all duration-300',
              'placeholder:text-charcoal-400',
              'disabled:cursor-not-allowed disabled:opacity-50',
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-charcoal-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'
            )}
          />

          {/* Character count indicator */}
          {isFocused && (
            <span className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-xs',
              digits.length === countryConfig.maxDigits
                ? 'text-success-600'
                : 'text-charcoal-400'
            )}>
              {digits.length}/{countryConfig.maxDigits}
            </span>
          )}
        </div>
      </div>

      {displayError && (
        <p className="text-sm text-red-500">{displayError}</p>
      )}
    </div>
  )
}

/**
 * Display-only version of PhoneInput
 * Shows formatted phone number with country code
 */
export function PhoneDisplay({
  countryCode = 'US',
  number,
  showIcon = true,
  className,
}: {
  countryCode?: PhoneCountryCode
  number?: string | null
  showIcon?: boolean
  className?: string
}) {
  if (!number) {
    return <span className={cn('text-charcoal-400', className)}>No phone</span>
  }

  const countryConfig = PHONE_COUNTRY_CODES.find(c => c.code === countryCode) || PHONE_COUNTRY_CODES[0]
  const digits = getDigitsOnly(number)
  const formattedNumber = formatPhoneNumber(digits, countryConfig.format)

  return (
    <span className={cn('text-charcoal-700 inline-flex items-center gap-1', className)}>
      {showIcon && <Phone className="w-3.5 h-3.5 text-charcoal-400" />}
      <span>{countryConfig.flag}</span>
      <span>{countryConfig.dialCode}</span>
      <span>{formattedNumber}</span>
    </span>
  )
}

// Helper to parse a phone string into PhoneInputValue
export function parsePhoneValue(phone: string | undefined | null, defaultCountry: PhoneCountryCode = 'US'): PhoneInputValue {
  if (!phone) {
    return { countryCode: defaultCountry, number: '' }
  }

  const digits = getDigitsOnly(phone)

  // Check if it starts with a known dial code
  for (const country of PHONE_COUNTRY_CODES) {
    const dialDigits = getDigitsOnly(country.dialCode)
    if (digits.startsWith(dialDigits) && digits.length > dialDigits.length) {
      return {
        countryCode: country.code,
        number: digits.slice(dialDigits.length),
      }
    }
  }

  return { countryCode: defaultCountry, number: digits }
}

// Helper to format PhoneInputValue to string (for API)
export function formatPhoneValue(value: PhoneInputValue): string {
  if (!value.number) return ''
  const countryConfig = PHONE_COUNTRY_CODES.find(c => c.code === value.countryCode) || PHONE_COUNTRY_CODES[0]
  return `${countryConfig.dialCode}${value.number}`
}
