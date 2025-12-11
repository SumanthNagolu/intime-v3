'use client'

import { MapPin } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { US_STATES, COUNTRIES } from './index'

interface LocationPickerValue {
  city?: string | null
  stateProvince?: string | null
  countryCode?: string | null
}

interface LocationPickerProps {
  label?: string
  value: LocationPickerValue
  onChange: (data: LocationPickerValue) => void
  required?: boolean
  showCountry?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

/**
 * LocationPicker - Simplified location input (City, State, Country)
 *
 * Use this instead of full AddressForm when only location matters
 * (e.g., job location, candidate location)
 *
 * Usage:
 * ```tsx
 * <LocationPicker
 *   label="Job Location"
 *   value={{ city: 'Austin', stateProvince: 'TX', countryCode: 'US' }}
 *   onChange={(data) => setLocation(data)}
 *   required
 *   showCountry
 * />
 * ```
 */
export function LocationPicker({
  label,
  value,
  onChange,
  required = false,
  showCountry = false,
  disabled = false,
  error,
  className,
}: LocationPickerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-charcoal-400" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className={cn('grid gap-3', showCountry ? 'grid-cols-3' : 'grid-cols-2')}>
        {/* City */}
        <div>
          <Input
            placeholder="City"
            value={value.city || ''}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        </div>

        {/* State */}
        <div>
          <Select
            value={value.stateProvince || ''}
            onValueChange={(v) => onChange({ ...value, stateProvince: v })}
            disabled={disabled}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country (optional) */}
        {showCountry && (
          <div>
            <Select
              value={value.countryCode || 'US'}
              onValueChange={(v) => onChange({ ...value, countryCode: v })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

/**
 * Display-only version of LocationPicker
 * Shows location as text, not editable
 */
export function LocationDisplay({
  city,
  stateProvince,
  countryCode = 'US',
  showIcon = true,
  className,
}: {
  city?: string | null
  stateProvince?: string | null
  countryCode?: string | null
  showIcon?: boolean
  className?: string
}) {
  const location = [city, stateProvince].filter(Boolean).join(', ')
  const showCountry = countryCode && countryCode !== 'US'

  if (!location && !showCountry) {
    return <span className={cn('text-charcoal-400', className)}>No location</span>
  }

  return (
    <span className={cn('text-charcoal-700 inline-flex items-center gap-1', className)}>
      {showIcon && <MapPin className="w-3.5 h-3.5 text-charcoal-400" />}
      {location}
      {showCountry && ` (${countryCode})`}
    </span>
  )
}
