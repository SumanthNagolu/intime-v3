'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import type { FieldGroupDefinition, FieldDefinition } from '@/lib/accounts/types'
import { formatCurrency, formatPercentage, getStatusBadgeVariant } from '@/lib/accounts/constants'
import { cn } from '@/lib/utils'

interface CardViewProps {
  /** Field group definition */
  group: FieldGroupDefinition
  /** Data object with values */
  data: Record<string, unknown>
  /** Additional context for conditional fields */
  context?: Record<string, unknown>
  /** Additional class name */
  className?: string
}

/**
 * CardView - Renders a field group as a read-only card
 *
 * Used in detail view mode to display account data in card format.
 * Handles different field types and custom renderers.
 */
export function CardView({ group, data, context = {}, className }: CardViewProps) {
  const IconComponent = group.icon

  // Filter visible fields
  const visibleFields = group.fields.filter((field) => {
    if (field.hideIn?.includes('view')) return false
    if (field.showWhen && !field.showWhen({ ...data, ...context })) return false
    return true
  })

  if (visibleFields.length === 0) return null

  return (
    <Card className={cn('shadow-elevation-sm hover:shadow-elevation-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {IconComponent && (
            <div className={cn('p-2 rounded-lg', group.cardColor || 'bg-gold-50')}>
              <IconComponent className="w-4 h-4 text-gold-600" />
            </div>
          )}
          <CardTitle className="text-base font-heading">{group.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleFields.map((field) => (
          <FieldDisplay key={field.name} field={field} data={data} />
        ))}
      </CardContent>
    </Card>
  )
}

interface FieldDisplayProps {
  field: FieldDefinition
  data: Record<string, unknown>
}

/**
 * FieldDisplay - Renders a single field value in view mode
 */
function FieldDisplay({ field, data }: FieldDisplayProps) {
  const value = data[field.name]

  // Handle array values (like industries)
  if (field.viewRenderer === 'array' && Array.isArray(value)) {
    return (
      <div>
        <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
          {field.label}
        </p>
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="capitalize">
                {String(item).replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-charcoal-400 text-sm">Not specified</span>
        )}
      </div>
    )
  }

  // Handle link values (website, LinkedIn)
  if (field.viewRenderer === 'link' && value) {
    const href = String(value).startsWith('http') ? String(value) : `https://${value}`
    const displayText = field.name === 'linkedinUrl' ? 'View Profile' : String(value)

    return (
      <div>
        <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
          {field.label}
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
        >
          {displayText}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    )
  }

  // Handle badge values (status, tier)
  if (field.viewRenderer === 'badge' && value) {
    const variant = getStatusBadgeVariant(String(value))
    return (
      <div>
        <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
          {field.label}
        </p>
        <Badge variant={variant} className="mt-1 capitalize">
          {String(value).replace(/_/g, ' ')}
        </Badge>
      </div>
    )
  }

  // Handle currency values
  if (field.viewRenderer === 'currency') {
    return (
      <InfoRow label={field.label} value={formatCurrency(value as number | string | null)} />
    )
  }

  // Handle percentage values
  if (field.viewRenderer === 'percentage') {
    return (
      <InfoRow label={field.label} value={formatPercentage(value as number | null)} />
    )
  }

  // Handle phone values
  if (field.viewRenderer === 'phone' && value && typeof value === 'object') {
    const phone = value as { countryCode?: string; number?: string }
    const formatted = phone.number
      ? `+${phone.countryCode === 'US' ? '1' : phone.countryCode} ${phone.number}`
      : null
    return <InfoRow label={field.label} value={formatted} />
  }

  // Handle user values
  if (field.viewRenderer === 'user' && value && typeof value === 'object') {
    const user = value as { name?: string; full_name?: string }
    return <InfoRow label={field.label} value={user.name || user.full_name || null} />
  }

  // Custom format function
  if (field.viewFormat && value !== undefined && value !== null) {
    return <InfoRow label={field.label} value={field.viewFormat(value)} />
  }

  // Default text display
  const displayValue =
    value !== undefined && value !== null && value !== ''
      ? String(value).replace(/_/g, ' ')
      : null

  return <InfoRow label={field.label} value={displayValue} />
}

interface InfoRowProps {
  label: string
  value: string | null | undefined
  badge?: boolean
  badgeVariant?: 'secondary' | 'success' | 'warning' | 'destructive'
}

/**
 * InfoRow - Label/value pair for card content
 */
export function InfoRow({
  label,
  value,
  badge = false,
  badgeVariant = 'secondary',
}: InfoRowProps) {
  return (
    <div>
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      {badge && value ? (
        <Badge variant={badgeVariant} className="mt-1 capitalize">
          {value}
        </Badge>
      ) : (
        <p className={cn('text-sm mt-0.5', value ? 'text-charcoal-900' : 'text-charcoal-400')}>
          {value || 'Not specified'}
        </p>
      )}
    </div>
  )
}

export default CardView
