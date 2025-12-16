'use client'

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

interface AddressFormProps {
  value: Partial<AddressFormData>
  onChange: (data: Partial<AddressFormData>) => void
  errors?: Record<string, string>
  required?: boolean
  showCounty?: boolean
  showAddressLine2?: boolean
  disabled?: boolean
  compact?: boolean
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
}: AddressFormProps) {
  // Get state/province options based on selected country
  const countryCode = value.countryCode || 'US'
  const stateOptions = getStatesByCountry(countryCode)

  const handleChange = (field: keyof AddressFormData, newValue: string) => {
    onChange({ [field]: newValue })
  }

  // Handle country change - reset state when country changes
  const handleCountryChange = (newCountryCode: string) => {
    onChange({
      countryCode: newCountryCode,
      stateProvince: '', // Reset state when country changes
    })
  }

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
              disabled={disabled}
              maxLength={10}
            />
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
            placeholder="12345"
            value={value.postalCode || ''}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            disabled={disabled}
            maxLength={10}
            className={errors.postalCode ? 'border-red-500' : ''}
          />
          {errors.postalCode && (
            <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>
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
