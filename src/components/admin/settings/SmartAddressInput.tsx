'use client'

import * as React from 'react'
import { MapPin, Check, AlertCircle, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  getStatesByCountry,
  OPERATING_COUNTRIES,
  type AddressData,
} from '@/components/addresses'
import { PostalCodeInput, type PostalCodeCountry } from '@/components/ui/postal-code-input'

export interface AddressValue {
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface SmartAddressInputProps {
  value: AddressValue
  onChange: (value: AddressValue) => void
  errors?: Partial<Record<keyof AddressValue, string>>
  disabled?: boolean
  className?: string
  showLabels?: boolean
  compact?: boolean
}

/**
 * SmartAddressInput - Enhanced address input with country/state cascading
 *
 * Features:
 * - Country selection affects state dropdown options
 * - Postal code format validation based on country
 * - State dropdown with search
 * - Compact mode for inline forms
 */
export function SmartAddressInput({
  value,
  onChange,
  errors = {},
  disabled = false,
  className,
  showLabels = true,
  compact = false,
}: SmartAddressInputProps) {
  // Get states based on selected country
  const stateOptions = React.useMemo(() => {
    return getStatesByCountry(value.country || 'US')
  }, [value.country])

  // Handle country change - reset state and postal code
  const handleCountryChange = (country: string) => {
    onChange({
      ...value,
      country,
      state: '',
      postalCode: '',
    })
  }

  // Handle field change
  const handleChange = (field: keyof AddressValue, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    })
  }

  // Get country flag
  const getCountryFlag = (code: string) => {
    const flags: Record<string, string> = {
      US: '🇺🇸',
      CA: '🇨🇦',
      IN: '🇮🇳',
    }
    return flags[code] || '🌍'
  }

  const inputClass = compact
    ? 'h-9 text-sm'
    : 'h-11 border-charcoal-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'

  const labelClass = showLabels ? '' : 'sr-only'

  return (
    <div className={cn('space-y-4', className)}>
      {/* Country Selection */}
      <div className="space-y-2">
        {showLabels && <Label className={labelClass}>Country</Label>}
        <Select
          value={value.country || 'US'}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger className={cn(inputClass, errors.country && 'border-error-400')}>
            <SelectValue>
              <span className="flex items-center gap-2">
                <span>{getCountryFlag(value.country || 'US')}</span>
                <span>
                  {OPERATING_COUNTRIES.find((c) => c.value === value.country)?.label ||
                    'United States'}
                </span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {OPERATING_COUNTRIES.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                <span className="flex items-center gap-2">
                  <span>{getCountryFlag(country.value)}</span>
                  <span>{country.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && <p className="text-xs text-error-500">{errors.country}</p>}
      </div>

      {/* Address Line 1 */}
      <div className="space-y-2">
        {showLabels && (
          <Label className={labelClass}>
            Address Line 1 <span className="text-error-500">*</span>
          </Label>
        )}
        <Input
          value={value.line1}
          onChange={(e) => handleChange('line1', e.target.value)}
          placeholder="123 Main Street"
          disabled={disabled}
          className={cn(inputClass, errors.line1 && 'border-error-400')}
        />
        {errors.line1 && <p className="text-xs text-error-500">{errors.line1}</p>}
      </div>

      {/* Address Line 2 */}
      <div className="space-y-2">
        {showLabels && <Label className={labelClass}>Address Line 2</Label>}
        <Input
          value={value.line2}
          onChange={(e) => handleChange('line2', e.target.value)}
          placeholder="Suite, Apt, Floor (optional)"
          disabled={disabled}
          className={cn(inputClass, errors.line2 && 'border-error-400')}
        />
        {errors.line2 && <p className="text-xs text-error-500">{errors.line2}</p>}
      </div>

      {/* City, State, ZIP Row */}
      <div className={cn('grid gap-4', compact ? 'grid-cols-3' : 'grid-cols-1 md:grid-cols-3')}>
        {/* City */}
        <div className="space-y-2">
          {showLabels && (
            <Label className={labelClass}>
              City <span className="text-error-500">*</span>
            </Label>
          )}
          <Input
            value={value.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="New York"
            disabled={disabled}
            className={cn(inputClass, errors.city && 'border-error-400')}
          />
          {errors.city && <p className="text-xs text-error-500">{errors.city}</p>}
        </div>

        {/* State/Province */}
        <div className="space-y-2">
          {showLabels && (
            <Label className={labelClass}>
              {value.country === 'CA' ? 'Province' : value.country === 'IN' ? 'State/UT' : 'State'}{' '}
              <span className="text-error-500">*</span>
            </Label>
          )}
          <Select
            value={value.state}
            onValueChange={(v) => handleChange('state', v)}
            disabled={disabled || stateOptions.length === 0}
          >
            <SelectTrigger className={cn(inputClass, errors.state && 'border-error-400')}>
              <SelectValue
                placeholder={
                  value.country === 'CA'
                    ? 'Select province'
                    : value.country === 'IN'
                      ? 'Select state'
                      : 'Select state'
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {stateOptions.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-xs text-error-500">{errors.state}</p>}
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          {showLabels && (
            <Label className={labelClass}>
              {value.country === 'US' ? 'ZIP Code' : 'Postal Code'}{' '}
              <span className="text-error-500">*</span>
            </Label>
          )}
          <PostalCodeInput
            value={value.postalCode}
            onChange={(v) => handleChange('postalCode', v)}
            countryCode={(value.country || 'US') as PostalCodeCountry}
            disabled={disabled}
            error={errors.postalCode}
            className={compact ? 'h-9 text-sm' : ''}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * AddressDisplay - Read-only display of an address
 */
export function AddressDisplayCard({
  address,
  className,
  showIcon = true,
}: {
  address: AddressValue | null | undefined
  className?: string
  showIcon?: boolean
}) {
  if (!address || !address.line1) {
    return (
      <div className={cn('flex items-center gap-2 text-charcoal-400', className)}>
        {showIcon && <MapPin className="h-4 w-4" />}
        <span className="text-sm">No address set</span>
      </div>
    )
  }

  const countryLabel = OPERATING_COUNTRIES.find((c) => c.value === address.country)?.label

  return (
    <div className={cn('flex items-start gap-2', className)}>
      {showIcon && <MapPin className="h-4 w-4 text-charcoal-400 mt-0.5 shrink-0" />}
      <div className="text-sm text-charcoal-700">
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>
          {address.city}
          {address.state && `, ${address.state}`} {address.postalCode}
        </p>
        {countryLabel && address.country !== 'US' && <p>{countryLabel}</p>}
      </div>
    </div>
  )
}

export default SmartAddressInput
