'use client'

import * as React from 'react'
import {
  Mail,
  Phone,
  Link as LinkIcon,
  ExternalLink,
  Linkedin,
  Copy,
  Check,
  Calendar,
  DollarSign,
  Percent,
  MapPin,
  User,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatPhone,
  formatEmail,
  formatUrl,
  formatLinkedIn,
  formatBoolean,
  formatSnakeCase,
  formatArray,
  formatRating,
  formatAddress,
  getEmptyText,
  isEmpty,
  type CurrencyCode,
  type DateFormat,
  type AddressFormat,
  type BooleanFormat,
  type PhoneValue,
  type AddressValue,
} from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ============================================
// VALUE DISPLAY TYPES
// ============================================

export type ValueDisplayType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'dateRange'
  | 'phone'
  | 'email'
  | 'url'
  | 'linkedin'
  | 'boolean'
  | 'status'
  | 'badge'
  | 'array'
  | 'tags'
  | 'rating'
  | 'address'
  | 'user'

export interface ValueDisplayProps {
  /** The value to display */
  value: unknown
  /** The type of value for formatting */
  type?: ValueDisplayType
  /** Custom empty text (defaults based on type) */
  emptyText?: string
  /** Show icon before value */
  showIcon?: boolean
  /** Custom icon override */
  icon?: LucideIcon
  /** Enable copy to clipboard */
  copyable?: boolean
  /** Make links clickable */
  clickable?: boolean
  /** Additional className */
  className?: string

  // Type-specific options
  /** Currency code for currency type */
  currency?: CurrencyCode
  /** Number of decimal places */
  decimals?: number
  /** Date format for date type */
  dateFormat?: DateFormat
  /** Boolean display format */
  booleanFormat?: BooleanFormat
  /** Address display format */
  addressFormat?: AddressFormat
  /** Max items for array display */
  maxItems?: number
  /** Max rating for rating type */
  maxRating?: number
  /** Use compact number format */
  compact?: boolean

  // Badge options
  /** Badge variant for status/badge type */
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'

  // User display options
  /** User avatar URL */
  avatarUrl?: string
  /** User subtitle (e.g., role) */
  subtitle?: string
}

// ============================================
// COPY BUTTON COMPONENT
// ============================================

function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity', className)}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 text-success-600" />
            ) : (
              <Copy className="h-3 w-3 text-charcoal-400" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copied!' : 'Copy'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================
// TYPE-SPECIFIC RENDERERS
// ============================================

function renderText(value: unknown, emptyText: string): React.ReactNode {
  if (isEmpty(value)) return <span className="text-charcoal-400">{emptyText}</span>
  const stringValue = typeof value === 'string' ? value : String(value)
  // Handle snake_case values
  if (stringValue.includes('_')) {
    return formatSnakeCase(stringValue)
  }
  return stringValue
}

function renderNumber(
  value: unknown,
  decimals: number,
  compact: boolean,
  emptyText: string
): React.ReactNode {
  const formatted = formatNumber(value as number, { decimals, compact })
  if (formatted === '—') return <span className="text-charcoal-400">{emptyText}</span>
  return <span className="tabular-nums">{formatted}</span>
}

function renderCurrency(
  value: unknown,
  currency: CurrencyCode,
  decimals: number,
  compact: boolean,
  emptyText: string
): React.ReactNode {
  const formatted = formatCurrency(value as number, { currency, decimals, compact })
  if (formatted === '—') return <span className="text-charcoal-400">{emptyText}</span>
  return <span className="tabular-nums font-medium">{formatted}</span>
}

function renderPercentage(value: unknown, decimals: number, emptyText: string): React.ReactNode {
  const formatted = formatPercentage(value as number, { decimals })
  if (formatted === '—') return <span className="text-charcoal-400">{emptyText}</span>
  return <span className="tabular-nums">{formatted}</span>
}

function renderDate(value: unknown, dateFormat: DateFormat, emptyText: string): React.ReactNode {
  const formatted = formatDate(value as Date | string, dateFormat)
  if (formatted === '—') return <span className="text-charcoal-400">{emptyText}</span>
  return formatted
}

function renderPhone(
  value: unknown,
  showIcon: boolean,
  clickable: boolean,
  copyable: boolean,
  emptyText: string
): React.ReactNode {
  const formatted = formatPhone(value as string | PhoneValue)
  if (formatted === '—') return <span className="text-charcoal-400">{emptyText}</span>

  const content = (
    <span className="inline-flex items-center gap-1.5 group">
      {showIcon && <Phone className="h-3.5 w-3.5 text-charcoal-400 flex-shrink-0" />}
      <span>{formatted}</span>
      {copyable && <CopyButton value={formatted.replace(/[^\d+]/g, '')} />}
    </span>
  )

  if (clickable) {
    const phoneNumber = typeof value === 'string' ? value : (value as PhoneValue)?.number
    return (
      <a
        href={`tel:${phoneNumber?.replace(/\D/g, '')}`}
        className="text-charcoal-700 hover:text-charcoal-900 hover:underline transition-colors"
      >
        {content}
      </a>
    )
  }

  return content
}

function renderEmail(
  value: unknown,
  showIcon: boolean,
  clickable: boolean,
  copyable: boolean,
  emptyText: string
): React.ReactNode {
  const formatted = formatEmail(value as string)
  if (formatted === '—') return <span className="text-charcoal-400">{emptyText}</span>

  const content = (
    <span className="inline-flex items-center gap-1.5 group">
      {showIcon && <Mail className="h-3.5 w-3.5 text-charcoal-400 flex-shrink-0" />}
      <span>{formatted}</span>
      {copyable && <CopyButton value={formatted} />}
    </span>
  )

  if (clickable) {
    return (
      <a
        href={`mailto:${formatted}`}
        className="text-charcoal-700 hover:text-charcoal-900 hover:underline transition-colors"
      >
        {content}
      </a>
    )
  }

  return content
}

function renderUrl(
  value: unknown,
  showIcon: boolean,
  clickable: boolean,
  emptyText: string
): React.ReactNode {
  const formatted = formatUrl(value as string)
  if (formatted === '—') return <span className="text-charcoal-400">{emptyText}</span>

  const content = (
    <span className="inline-flex items-center gap-1.5">
      {showIcon && <LinkIcon className="h-3.5 w-3.5 text-charcoal-400 flex-shrink-0" />}
      <span className="truncate max-w-[200px]">{formatted}</span>
      {clickable && <ExternalLink className="h-3 w-3 text-charcoal-400 flex-shrink-0" />}
    </span>
  )

  if (clickable) {
    const url = (value as string).startsWith('http') ? value as string : `https://${value}`
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-charcoal-700 hover:text-charcoal-900 hover:underline transition-colors"
      >
        {content}
      </a>
    )
  }

  return content
}

function renderLinkedIn(
  value: unknown,
  showIcon: boolean,
  clickable: boolean,
  emptyText: string
): React.ReactNode {
  const formatted = formatLinkedIn(value as string)
  if (formatted === '—') return <span className="text-charcoal-400">{emptyText}</span>

  const content = (
    <span className="inline-flex items-center gap-1.5">
      {showIcon && <Linkedin className="h-3.5 w-3.5 text-[#0A66C2] flex-shrink-0" />}
      <span>{formatted}</span>
    </span>
  )

  if (clickable) {
    const url = (value as string).includes('linkedin.com')
      ? value as string
      : `https://linkedin.com/in/${(value as string).replace(/^in\//, '')}`
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-charcoal-700 hover:text-charcoal-900 hover:underline transition-colors"
      >
        {content}
      </a>
    )
  }

  return content
}

function renderBoolean(
  value: unknown,
  booleanFormat: BooleanFormat,
  emptyText: string
): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-charcoal-400">{emptyText}</span>
  }

  const formatted = formatBoolean(value as boolean, booleanFormat)

  if (booleanFormat === 'check') {
    return (
      <span className={value ? 'text-success-600' : 'text-charcoal-400'}>
        {formatted}
      </span>
    )
  }

  return (
    <Badge variant={value ? 'success' : 'secondary'} className="font-normal">
      {formatted}
    </Badge>
  )
}

function renderBadge(
  value: unknown,
  variant: ValueDisplayProps['variant'],
  emptyText: string
): React.ReactNode {
  if (isEmpty(value)) return <span className="text-charcoal-400">{emptyText}</span>

  const stringValue = typeof value === 'string' ? value : String(value)
  const displayValue = stringValue.includes('_') ? formatSnakeCase(stringValue) : stringValue

  return (
    <Badge variant={variant || 'secondary'} className="font-normal">
      {displayValue}
    </Badge>
  )
}

function renderArray(
  value: unknown,
  maxItems: number,
  emptyText: string
): React.ReactNode {
  if (!Array.isArray(value) || value.length === 0) {
    return <span className="text-charcoal-400">{emptyText}</span>
  }

  const { visible, remaining } = formatArray(value, { maxItems, showCount: false })

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((item, index) => (
        <Badge key={index} variant="secondary" className="font-normal">
          {typeof item === 'string' && item.includes('_') ? formatSnakeCase(item) : item}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="font-normal text-charcoal-500">
          +{remaining}
        </Badge>
      )}
    </div>
  )
}

function renderRating(
  value: unknown,
  maxRating: number,
  emptyText: string
): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-charcoal-400">{emptyText}</span>
  }

  const { stars, display } = formatRating(value as number, maxRating)

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-gold-500 tracking-wider">{stars}</span>
      <span className="text-sm text-charcoal-500">({display})</span>
    </span>
  )
}

function renderAddress(
  value: unknown,
  addressFormat: AddressFormat,
  showIcon: boolean,
  emptyText: string
): React.ReactNode {
  const formatted = formatAddress(value as AddressValue, addressFormat)
  if (formatted === '—') return <span className="text-charcoal-400">{emptyText}</span>

  if (addressFormat === 'full') {
    return (
      <div className="inline-flex items-start gap-1.5">
        {showIcon && <MapPin className="h-3.5 w-3.5 text-charcoal-400 flex-shrink-0 mt-0.5" />}
        <span className="whitespace-pre-line">{formatted}</span>
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {showIcon && <MapPin className="h-3.5 w-3.5 text-charcoal-400 flex-shrink-0" />}
      <span>{formatted}</span>
    </span>
  )
}

function renderUser(
  value: unknown,
  avatarUrl: string | undefined,
  subtitle: string | undefined,
  showIcon: boolean,
  emptyText: string
): React.ReactNode {
  if (isEmpty(value)) return <span className="text-charcoal-400">{emptyText}</span>

  const name = typeof value === 'string' ? value : (value as { name?: string })?.name || '—'

  return (
    <div className="inline-flex items-center gap-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-6 w-6 rounded-full object-cover"
        />
      ) : showIcon ? (
        <div className="h-6 w-6 rounded-full bg-charcoal-100 flex items-center justify-center">
          <User className="h-3.5 w-3.5 text-charcoal-500" />
        </div>
      ) : null}
      <div className="flex flex-col">
        <span className="text-charcoal-900 font-medium">{name}</span>
        {subtitle && <span className="text-xs text-charcoal-500">{subtitle}</span>}
      </div>
    </div>
  )
}

// ============================================
// MAIN VALUE DISPLAY COMPONENT
// ============================================

export function ValueDisplay({
  value,
  type = 'text',
  emptyText,
  showIcon = false,
  icon: CustomIcon,
  copyable = false,
  clickable = false,
  className,
  currency = 'USD',
  decimals = 0,
  dateFormat = 'short',
  booleanFormat = 'yesNo',
  addressFormat = 'short',
  maxItems = 3,
  maxRating = 5,
  compact = false,
  variant,
  avatarUrl,
  subtitle,
}: ValueDisplayProps) {
  const resolvedEmptyText = emptyText || getEmptyText(type)

  let content: React.ReactNode

  switch (type) {
    case 'number':
      content = renderNumber(value, decimals, compact, resolvedEmptyText)
      break
    case 'currency':
      content = renderCurrency(value, currency, decimals, compact, resolvedEmptyText)
      break
    case 'percentage':
      content = renderPercentage(value, decimals, resolvedEmptyText)
      break
    case 'date':
    case 'dateRange':
      content = renderDate(value, dateFormat, resolvedEmptyText)
      break
    case 'phone':
      content = renderPhone(value, showIcon, clickable, copyable, resolvedEmptyText)
      break
    case 'email':
      content = renderEmail(value, showIcon, clickable, copyable, resolvedEmptyText)
      break
    case 'url':
      content = renderUrl(value, showIcon, clickable, resolvedEmptyText)
      break
    case 'linkedin':
      content = renderLinkedIn(value, showIcon, clickable, resolvedEmptyText)
      break
    case 'boolean':
      content = renderBoolean(value, booleanFormat, resolvedEmptyText)
      break
    case 'status':
    case 'badge':
      content = renderBadge(value, variant, resolvedEmptyText)
      break
    case 'array':
    case 'tags':
      content = renderArray(value, maxItems, resolvedEmptyText)
      break
    case 'rating':
      content = renderRating(value, maxRating, resolvedEmptyText)
      break
    case 'address':
      content = renderAddress(value, addressFormat, showIcon, resolvedEmptyText)
      break
    case 'user':
      content = renderUser(value, avatarUrl, subtitle, showIcon, resolvedEmptyText)
      break
    case 'text':
    default:
      content = renderText(value, resolvedEmptyText)
  }

  // Wrap with custom icon if provided
  if (CustomIcon && !['phone', 'email', 'url', 'linkedin', 'address', 'user'].includes(type)) {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <CustomIcon className="h-3.5 w-3.5 text-charcoal-400 flex-shrink-0" />
        {content}
      </span>
    )
  }

  return <span className={cn('text-charcoal-700', className)}>{content}</span>
}

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export function CurrencyDisplay({
  value,
  currency = 'USD',
  decimals = 0,
  compact = false,
  className,
}: {
  value: number | string | null | undefined
  currency?: CurrencyCode
  decimals?: number
  compact?: boolean
  className?: string
}) {
  return (
    <ValueDisplay
      value={value}
      type="currency"
      currency={currency}
      decimals={decimals}
      compact={compact}
      className={className}
    />
  )
}

export function DateDisplay({
  value,
  format = 'short',
  className,
}: {
  value: Date | string | null | undefined
  format?: DateFormat
  className?: string
}) {
  return (
    <ValueDisplay
      value={value}
      type="date"
      dateFormat={format}
      className={className}
    />
  )
}

export function PhoneDisplay({
  value,
  showIcon = true,
  clickable = true,
  copyable = true,
  className,
}: {
  value: string | PhoneValue | null | undefined
  showIcon?: boolean
  clickable?: boolean
  copyable?: boolean
  className?: string
}) {
  return (
    <ValueDisplay
      value={value}
      type="phone"
      showIcon={showIcon}
      clickable={clickable}
      copyable={copyable}
      className={className}
    />
  )
}

export function EmailDisplay({
  value,
  showIcon = true,
  clickable = true,
  copyable = true,
  className,
}: {
  value: string | null | undefined
  showIcon?: boolean
  clickable?: boolean
  copyable?: boolean
  className?: string
}) {
  return (
    <ValueDisplay
      value={value}
      type="email"
      showIcon={showIcon}
      clickable={clickable}
      copyable={copyable}
      className={className}
    />
  )
}

export function TagsDisplay({
  value,
  maxItems = 3,
  className,
}: {
  value: string[] | null | undefined
  maxItems?: number
  className?: string
}) {
  return (
    <ValueDisplay
      value={value}
      type="tags"
      maxItems={maxItems}
      className={className}
    />
  )
}

export function StatusDisplay({
  value,
  variant,
  className,
}: {
  value: string | null | undefined
  variant?: ValueDisplayProps['variant']
  className?: string
}) {
  return (
    <ValueDisplay
      value={value}
      type="status"
      variant={variant}
      className={className}
    />
  )
}
