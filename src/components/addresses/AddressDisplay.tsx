'use client'

import { MapPin, Check, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AddressData } from './index'

interface AddressDisplayProps {
  address: AddressData & {
    id?: string
    addressType?: string
    isPrimary?: boolean
    isVerified?: boolean
    notes?: string | null
  }
  variant?: 'full' | 'compact' | 'inline' | 'city-state'
  showVerified?: boolean
  showPrimary?: boolean
  showIcon?: boolean
  className?: string
  onClick?: () => void
}

/**
 * AddressDisplay - Display address in various formats
 *
 * Variants:
 * - full: All address lines stacked vertically
 * - compact: City, State on one line with optional street
 * - inline: Single line "City, ST 12345"
 * - city-state: Just "City, ST"
 *
 * Usage:
 * ```tsx
 * <AddressDisplay
 *   address={address}
 *   variant="compact"
 *   showPrimary
 *   showVerified
 * />
 * ```
 */
export function AddressDisplay({
  address,
  variant = 'compact',
  showVerified = false,
  showPrimary = false,
  showIcon = true,
  className,
  onClick,
}: AddressDisplayProps) {
  // Build location string
  const cityState = [address.city, address.stateProvince]
    .filter(Boolean)
    .join(', ')

  const cityStateZip = [cityState, address.postalCode]
    .filter(Boolean)
    .join(' ')

  const fullLine = [address.addressLine1, cityStateZip, address.countryCode !== 'US' ? address.countryCode : null]
    .filter(Boolean)
    .join(', ')

  // Inline variant - single line
  if (variant === 'inline') {
    return (
      <span className={cn('text-charcoal-600', className)}>
        {showIcon && <MapPin className="w-3 h-3 inline mr-1" />}
        {fullLine || 'No address'}
      </span>
    )
  }

  // City-State only
  if (variant === 'city-state') {
    return (
      <span className={cn('text-charcoal-600', className)}>
        {showIcon && <MapPin className="w-3 h-3 inline mr-1" />}
        {cityState || 'No location'}
      </span>
    )
  }

  // Full variant - all details
  if (variant === 'full') {
    return (
      <div
        className={cn('space-y-1', onClick && 'cursor-pointer hover:bg-charcoal-50 rounded-md p-2 -m-2', className)}
        onClick={onClick}
      >
        {/* Badges */}
        <div className="flex items-center gap-2 mb-2">
          {showPrimary && address.isPrimary && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-800">
              <Star className="w-3 h-3" />
              Primary
            </span>
          )}
          {showVerified && address.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Check className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Address lines */}
        <div className="flex items-start gap-2">
          {showIcon && (
            <MapPin className="w-4 h-4 text-charcoal-400 mt-0.5 flex-shrink-0" />
          )}
          <div className="text-sm">
            {address.addressLine1 && (
              <p className="text-charcoal-900">{address.addressLine1}</p>
            )}
            {address.addressLine2 && (
              <p className="text-charcoal-600">{address.addressLine2}</p>
            )}
            {address.addressLine3 && (
              <p className="text-charcoal-600">{address.addressLine3}</p>
            )}
            <p className="text-charcoal-900">{cityStateZip}</p>
            {address.countryCode && address.countryCode !== 'US' && (
              <p className="text-charcoal-500">{address.countryCode}</p>
            )}
            {address.county && (
              <p className="text-charcoal-500 text-xs">{address.county} County</p>
            )}
          </div>
        </div>

        {/* Notes */}
        {address.notes && (
          <p className="text-xs text-charcoal-500 mt-2 pl-6">{address.notes}</p>
        )}
      </div>
    )
  }

  // Compact variant (default)
  return (
    <div
      className={cn(
        'flex items-start gap-2',
        onClick && 'cursor-pointer hover:bg-charcoal-50 rounded-md p-2 -m-2',
        className
      )}
      onClick={onClick}
    >
      {showIcon && (
        <MapPin className="w-4 h-4 text-charcoal-400 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-charcoal-900 truncate">
            {cityState || 'No location'}
          </p>
          {showPrimary && address.isPrimary && (
            <Star className="w-3 h-3 text-gold-500 flex-shrink-0" />
          )}
          {showVerified && address.isVerified && (
            <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
          )}
        </div>
        {address.addressLine1 && (
          <p className="text-xs text-charcoal-500 truncate">
            {address.addressLine1}
          </p>
        )}
      </div>
    </div>
  )
}
