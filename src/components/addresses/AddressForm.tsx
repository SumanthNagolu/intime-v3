'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OPERATING_COUNTRIES, getStatesByCountry, type AddressFormData } from './index'
import { cn } from '@/lib/utils'

// ZIP/Postal code validation patterns by country
const ZIP_PATTERNS: Record<string, { pattern: RegExp; format: string; example: string }> = {
  US: { pattern: /^\d{5}(-\d{4})?$/, format: '5 digits or 5+4', example: '12345 or 12345-6789' },
  CA: { pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, format: 'A1A 1A1', example: 'K1A 0B1' },
  GB: { pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, format: 'UK format', example: 'SW1A 1AA' },
  IN: { pattern: /^\d{6}$/, format: '6 digits', example: '110001' },
  AU: { pattern: /^\d{4}$/, format: '4 digits', example: '2000' },
  DE: { pattern: /^\d{5}$/, format: '5 digits', example: '10115' },
  FR: { pattern: /^\d{5}$/, format: '5 digits', example: '75001' },
  MX: { pattern: /^\d{5}$/, format: '5 digits', example: '06600' },
}

// Validate ZIP/postal code based on country
export function validatePostalCode(code: string, countryCode: string): { valid: boolean; message?: string } {
  if (!code) return { valid: true } // Empty is valid (not required)
  
  const countryPattern = ZIP_PATTERNS[countryCode]
  if (!countryPattern) return { valid: true } // No validation for unknown countries
  
  if (!countryPattern.pattern.test(code)) {
    return { 
      valid: false, 
      message: `Invalid format. Expected: ${countryPattern.format} (e.g., ${countryPattern.example})` 
    }
  }
  
  return { valid: true }
}

interface AddressFormProps {
  value: Partial<AddressFormData>
  onChange: (data: Partial<AddressFormData>) => void
  errors?: Record<string, string>
  required?: boolean
  showCounty?: boolean
  showAddressLine2?: boolean
  disabled?: boolean
  compact?: boolean
  validateOnBlur?: boolean
}

/**
 * AddressForm - Full address input form with all fields
 *
 * Usage:
 * ```tsx
 * <AddressForm
 *   value={{ city: 'Austin', stateProvince: 'TX', countryCode: 'US' }}
 *   onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
 *   required
 *   showCounty
 * />
 * ```
 */
export function AddressForm({
  value,
  onChange,
  errors = {},
  required = false,
  showCounty = false,
  showAddressLine2 = true,
  disabled = false,
  compact = false,
  validateOnBlur = true,
}: AddressFormProps) {
  // Local validation state for ZIP code
  const [zipError, setZipError] = useState<string | null>(null)
  
  // Get state/province options based on selected country
  const countryCode = value.countryCode || 'US'
  const stateOptions = getStatesByCountry(countryCode)

  const handleChange = (field: keyof AddressFormData, newValue: string) => {
    onChange({ [field]: newValue })
    
    // Clear ZIP error when user types
    if (field === 'postalCode') {
      setZipError(null)
    }
  }

  // Validate ZIP on blur
  const handleZipBlur = () => {
    if (!validateOnBlur) return
    const result = validatePostalCode(value.postalCode || '', countryCode)
    if (!result.valid) {
      setZipError(result.message || 'Invalid postal code')
    } else {
      setZipError(null)
    }
  }

  // Handle country change - reset state when country changes
  const handleCountryChange = (newCountryCode: string) => {
    onChange({
      countryCode: newCountryCode,
      stateProvince: '', // Reset state when country changes
    })
    // Re-validate ZIP for new country
    if (value.postalCode) {
      const result = validatePostalCode(value.postalCode, newCountryCode)
      setZipError(result.valid ? null : result.message || 'Invalid postal code')
    }
  }
  
  // Combined error for ZIP (from props or local validation)
  const postalCodeError = errors.postalCode || zipError

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Street Address */}
        <div>
          <Label className="text-sm">Street Address</Label>
          <Input
            placeholder="123 Main St"
            value={value.addressLine1 || ''}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            disabled={disabled}
            className={errors.addressLine1 ? 'border-red-500' : ''}
          />
          {errors.addressLine1 && (
            <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>
          )}
        </div>

        {/* City, State, ZIP, Country in grid */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label className="text-sm">City {required && '*'}</Label>
            <Input
              placeholder="City"
              value={value.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={disabled}
              className={errors.city ? 'border-red-500' : ''}
            />
          </div>
          <div>
            <Label className="text-sm">State {required && '*'}</Label>
            <Select
              value={value.stateProvince || ''}
              onValueChange={(v) => handleChange('stateProvince', v)}
              disabled={disabled}
            >
              <SelectTrigger className={errors.stateProvince ? 'border-red-500' : ''}>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">ZIP</Label>
            <Input
              placeholder="ZIP"
              value={value.postalCode || ''}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              onBlur={handleZipBlur}
              disabled={disabled}
              maxLength={10}
              className={cn(postalCodeError && 'border-red-500')}
            />
            {postalCodeError && (
              <p className="text-xs text-red-500 mt-1">{postalCodeError}</p>
            )}
          </div>
          <div>
            <Label className="text-sm">Country</Label>
            <Select
              value={countryCode}
              onValueChange={handleCountryChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {OPERATING_COUNTRIES.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Address Line 1 */}
      <div>
        <Label>Street Address</Label>
        <Input
          placeholder="123 Main Street"
          value={value.addressLine1 || ''}
          onChange={(e) => handleChange('addressLine1', e.target.value)}
          disabled={disabled}
          className={errors.addressLine1 ? 'border-red-500' : ''}
        />
        {errors.addressLine1 && (
          <p className="text-sm text-red-500 mt-1">{errors.addressLine1}</p>
        )}
      </div>

      {/* Address Line 2 */}
      {showAddressLine2 && (
        <div>
          <Label>
            Address Line 2 <span className="text-charcoal-400">(Optional)</span>
          </Label>
          <Input
            placeholder="Suite, Apt, Floor..."
            value={value.addressLine2 || ''}
            onChange={(e) => handleChange('addressLine2', e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {/* City and State */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>City {required && <span className="text-red-500">*</span>}</Label>
          <Input
            placeholder="City"
            value={value.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            disabled={disabled}
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && (
            <p className="text-sm text-red-500 mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <Label>State/Province {required && <span className="text-red-500">*</span>}</Label>
          <Select
            value={value.stateProvince || ''}
            onValueChange={(v) => handleChange('stateProvince', v)}
            disabled={disabled}
          >
            <SelectTrigger className={errors.stateProvince ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {stateOptions.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.stateProvince && (
            <p className="text-sm text-red-500 mt-1">{errors.stateProvince}</p>
          )}
        </div>
      </div>

      {/* ZIP and Country */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>ZIP/Postal Code</Label>
          <Input
            placeholder={ZIP_PATTERNS[countryCode]?.example || '12345'}
            value={value.postalCode || ''}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            onBlur={handleZipBlur}
            disabled={disabled}
            maxLength={10}
            className={cn(postalCodeError && 'border-red-500')}
          />
          {postalCodeError && (
            <p className="text-sm text-red-500 mt-1">{postalCodeError}</p>
          )}
          {!postalCodeError && ZIP_PATTERNS[countryCode] && (
            <p className="text-xs text-charcoal-400 mt-1">
              Format: {ZIP_PATTERNS[countryCode].format}
            </p>
          )}
        </div>

        <div>
          <Label>Country</Label>
          <Select
            value={countryCode}
            onValueChange={handleCountryChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {OPERATING_COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* County (optional) */}
      {showCounty && (
        <div>
          <Label>
            County <span className="text-charcoal-400">(Optional)</span>
          </Label>
          <Input
            placeholder="County name"
            value={value.county || ''}
            onChange={(e) => handleChange('county', e.target.value)}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}
