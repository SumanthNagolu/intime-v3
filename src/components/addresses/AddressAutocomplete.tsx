'use client'

import { useState, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AddressFormData } from './index'

interface AddressAutocompleteProps {
  label?: string
  value: Partial<AddressFormData>
  onChange: (data: Partial<AddressFormData>) => void
  onSelect?: (fullAddress: AddressFormData) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  error?: string
  className?: string
}

// Simulated address suggestions (in production, this would call Google Places API)
interface AddressSuggestion {
  id: string
  description: string
  addressLine1: string
  city: string
  stateProvince: string
  postalCode: string
  countryCode: string
}

// Mock suggestions for demonstration
const MOCK_SUGGESTIONS: AddressSuggestion[] = [
  {
    id: '1',
    description: '123 Main Street, Austin, TX 78701',
    addressLine1: '123 Main Street',
    city: 'Austin',
    stateProvince: 'TX',
    postalCode: '78701',
    countryCode: 'US',
  },
  {
    id: '2',
    description: '456 Congress Ave, Austin, TX 78701',
    addressLine1: '456 Congress Ave',
    city: 'Austin',
    stateProvince: 'TX',
    postalCode: '78701',
    countryCode: 'US',
  },
  {
    id: '3',
    description: '789 Sixth Street, Austin, TX 78702',
    addressLine1: '789 Sixth Street',
    city: 'Austin',
    stateProvince: 'TX',
    postalCode: '78702',
    countryCode: 'US',
  },
]

/**
 * AddressAutocomplete - Type-ahead address input with suggestions
 *
 * Note: This is a simplified implementation. In production, integrate with
 * Google Places API, Smarty Streets, or similar geocoding service.
 *
 * Usage:
 * ```tsx
 * <AddressAutocomplete
 *   label="Meeting Location"
 *   value={formData}
 *   onChange={setFormData}
 *   onSelect={(address) => setFormData({ ...formData, ...address })}
 *   required
 * />
 * ```
 */
export function AddressAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  required = false,
  disabled = false,
  placeholder = 'Start typing an address...',
  error,
  className,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Simulated search - in production, debounce and call API
  const searchAddresses = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Filter mock suggestions (in production, call Google Places API)
    const filtered = MOCK_SUGGESTIONS.filter((s) =>
      s.description.toLowerCase().includes(query.toLowerCase())
    )

    setSuggestions(filtered)
    setIsLoading(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setShowSuggestions(true)
    onChange({ addressLine1: newValue })
    searchAddresses(newValue)
  }

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const addressData: AddressFormData = {
      addressLine1: suggestion.addressLine1,
      addressLine2: '',
      city: suggestion.city,
      stateProvince: suggestion.stateProvince,
      postalCode: suggestion.postalCode,
      countryCode: suggestion.countryCode,
      county: '',
    }

    setInputValue(suggestion.description)
    setSuggestions([])
    setShowSuggestions(false)
    onChange(addressData)
    onSelect?.(addressData)
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 200)
  }

  // Build display value from address parts
  const displayValue =
    inputValue ||
    [value.addressLine1, value.city, value.stateProvince]
      .filter(Boolean)
      .join(', ')

  return (
    <div className={cn('relative', className)}>
      {label && (
        <Label className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-4 h-4 text-charcoal-400" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn('pr-8', error ? 'border-red-500' : '')}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 animate-spin" />
        )}
        {!isLoading && (
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-charcoal-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-charcoal-50 flex items-center gap-2"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <MapPin className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
              <span className="truncate">{suggestion.description}</span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {/* Hint text */}
      <p className="text-xs text-charcoal-400 mt-1">
        Start typing to search for addresses
      </p>
    </div>
  )
}
