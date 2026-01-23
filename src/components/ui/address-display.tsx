'use client'

import * as React from 'react'
import { MapPin, Building2, Copy, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAddress, type AddressValue, type AddressFormat } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ============================================
// ADDRESS TYPES
// ============================================

export type AddressType =
  | 'headquarters'
  | 'billing'
  | 'mailing'
  | 'office'
  | 'shipping'
  | 'home'
  | 'work'
  | 'other'

export interface AddressDisplayValue extends AddressValue {
  id?: string
  type?: AddressType
  isPrimary?: boolean
}

const ADDRESS_TYPE_CONFIG: Record<AddressType, { label: string; icon: string }> = {
  headquarters: { label: 'Headquarters', icon: '🏢' },
  billing: { label: 'Billing', icon: '💳' },
  mailing: { label: 'Mailing', icon: '📬' },
  office: { label: 'Office', icon: '🏬' },
  shipping: { label: 'Shipping', icon: '📦' },
  home: { label: 'Home', icon: '🏠' },
  work: { label: 'Work', icon: '💼' },
  other: { label: 'Other', icon: '📍' },
}

// ============================================
// ADDRESS DISPLAY COMPONENT
// ============================================

export interface AddressDisplayProps {
  /** Address value */
  value: AddressDisplayValue | null | undefined
  /** Display format */
  format?: AddressFormat
  /** Show type badge */
  showType?: boolean
  /** Show primary badge */
  showPrimary?: boolean
  /** Show icon */
  showIcon?: boolean
  /** Show copy button */
  copyable?: boolean
  /** Show Google Maps link */
  showMapLink?: boolean
  /** Additional className */
  className?: string
}

export function AddressDisplay({
  value,
  format = 'full',
  showType = true,
  showPrimary = true,
  showIcon = true,
  copyable = false,
  showMapLink = false,
  className,
}: AddressDisplayProps) {
  const [copied, setCopied] = React.useState(false)

  if (!value) {
    return <span className={cn('text-charcoal-400', className)}>No address</span>
  }

  const formatted = formatAddress(value, format)
  if (formatted === '—') {
    return <span className={cn('text-charcoal-400', className)}>No address</span>
  }

  const typeConfig = value.type ? ADDRESS_TYPE_CONFIG[value.type] : null

  const handleCopy = async () => {
    const oneLine = formatAddress(value, 'oneLine')
    await navigator.clipboard.writeText(oneLine)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getMapUrl = () => {
    const query = encodeURIComponent(formatAddress(value, 'oneLine'))
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  // Full format - multi-line card view
  if (format === 'full') {
    return (
      <div className={cn('group', className)}>
        {/* Type and badges */}
        {(showType || showPrimary) && (
          <div className="flex items-center gap-2 mb-2">
            {showType && typeConfig && (
              <span className="text-xs text-charcoal-500">
                {typeConfig.icon} {typeConfig.label}
              </span>
            )}
            {showPrimary && value.isPrimary && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Primary
              </Badge>
            )}
          </div>
        )}

        {/* Address content */}
        <div className="flex items-start gap-2">
          {showIcon && (
            <MapPin className="h-4 w-4 text-charcoal-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-charcoal-700 whitespace-pre-line">{formatted}</div>

            {/* Action buttons */}
            {(copyable || showMapLink) && (
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {copyable && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={handleCopy}
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-success-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy address</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {showMapLink && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    asChild
                  >
                    <a
                      href={getMapUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Map
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Short/cityState/oneLine formats - inline view
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {showIcon && <MapPin className="h-3.5 w-3.5 text-charcoal-400 flex-shrink-0" />}
      <span className="text-charcoal-700">{formatted}</span>
      {showPrimary && value.isPrimary && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
          Primary
        </Badge>
      )}
    </span>
  )
}

// ============================================
// ADDRESS CARD COMPONENT
// ============================================

export interface AddressCardProps {
  address: AddressDisplayValue
  onEdit?: () => void
  onDelete?: () => void
  onSetPrimary?: () => void
  showActions?: boolean
  className?: string
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetPrimary,
  showActions = true,
  className,
}: AddressCardProps) {
  const typeConfig = address.type ? ADDRESS_TYPE_CONFIG[address.type] : null

  return (
    <div
      className={cn(
        'group relative p-4 rounded-lg border border-charcoal-200/60 bg-white',
        'hover:border-charcoal-300 hover:shadow-elevation-sm transition-all duration-200',
        address.isPrimary && 'ring-1 ring-gold-500/30 border-gold-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {typeConfig && (
            <span className="text-lg">{typeConfig.icon}</span>
          )}
          <div>
            <span className="font-medium text-charcoal-900">
              {typeConfig?.label || 'Address'}
            </span>
            {address.isPrimary && (
              <Badge variant="success" className="ml-2 text-[10px] px-1.5 py-0">
                Primary
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!address.isPrimary && onSetPrimary && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onSetPrimary}
              >
                Set Primary
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
            {onDelete && !address.isPrimary && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onDelete}
              >
                Remove
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Address content */}
      <div className="text-sm text-charcoal-600 whitespace-pre-line">
        {formatAddress(address, 'full')}
      </div>
    </div>
  )
}

// ============================================
// ADDRESS LIST COMPONENT
// ============================================

export interface AddressListProps {
  addresses: AddressDisplayValue[]
  onEdit?: (address: AddressDisplayValue) => void
  onDelete?: (address: AddressDisplayValue) => void
  onSetPrimary?: (address: AddressDisplayValue) => void
  onAdd?: () => void
  emptyMessage?: string
  showActions?: boolean
  className?: string
}

export function AddressList({
  addresses,
  onEdit,
  onDelete,
  onSetPrimary,
  onAdd,
  emptyMessage = 'No addresses added',
  showActions = true,
  className,
}: AddressListProps) {
  if (addresses.length === 0) {
    return (
      <div
        className={cn(
          'p-6 rounded-lg border border-dashed border-charcoal-200 text-center',
          className
        )}
      >
        <Building2 className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
        <p className="text-sm text-charcoal-500">{emptyMessage}</p>
        {onAdd && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onAdd}>
            Add Address
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {addresses.map((address, index) => (
        <AddressCard
          key={address.id || index}
          address={address}
          onEdit={onEdit ? () => onEdit(address) : undefined}
          onDelete={onDelete ? () => onDelete(address) : undefined}
          onSetPrimary={onSetPrimary ? () => onSetPrimary(address) : undefined}
          showActions={showActions}
        />
      ))}
    </div>
  )
}
