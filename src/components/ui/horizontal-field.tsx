'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput, type PhoneInputValue } from '@/components/ui/phone-input'
import { CurrencyInput, type CurrencyInputValue } from '@/components/ui/currency-input'
import { PercentageInput } from '@/components/ui/percentage-input'
import { DateInput, type DateRangeValue } from '@/components/ui/date-range-input'
import { ValueDisplay, type ValueDisplayType } from '@/components/ui/value-display'

// ============================================
// HORIZONTAL FIELD - Guidewire-style label:value
// Label on left, value/input on right
// ============================================

export interface FieldOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface HorizontalFieldProps {
  /** Field label */
  label: string
  /** Field value (for display or controlled input) */
  value?: unknown
  /** Change handler */
  onChange?: (value: unknown) => void
  /** Field type */
  type?:
    | 'text'
    | 'number'
    | 'email'
    | 'phone'
    | 'url'
    | 'currency'
    | 'percentage'
    | 'date'
    | 'datetime'
    | 'select'
    | 'textarea'
    | 'switch'
    | 'badge'
    | 'display'
  /** Whether field is editable (false = view mode) */
  editable?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Required field indicator */
  required?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Options for select fields */
  options?: FieldOption[]
  /** Number input min */
  min?: number
  /** Number input max */
  max?: number
  /** Number input step */
  step?: number
  /** Currency code for currency fields */
  currency?: 'USD' | 'CAD' | 'GBP' | 'EUR' | 'INR'
  /** Badge variant for display mode */
  badgeVariant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
  /** Display type for view mode */
  displayType?: ValueDisplayType
  /** Label width (default: 140px) */
  labelWidth?: number | string
  /** Additional className */
  className?: string
}

export function HorizontalField({
  label,
  value,
  onChange,
  type = 'text',
  editable = true,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  options,
  min,
  max,
  step,
  currency = 'USD',
  badgeVariant = 'secondary',
  displayType,
  labelWidth = 140,
  className,
}: HorizontalFieldProps) {
  const isDisabled = disabled || !editable
  const hasError = !!error

  // Infer display type from field type
  const resolvedDisplayType: ValueDisplayType = displayType || (() => {
    switch (type) {
      case 'email': return 'email'
      case 'phone': return 'phone'
      case 'url': return 'url'
      case 'currency': return 'currency'
      case 'percentage': return 'percentage'
      case 'date':
      case 'datetime': return 'date'
      case 'switch': return 'boolean'
      case 'badge':
      case 'select': return 'badge'
      default: return 'text'
    }
  })()

  // Render input based on type
  const renderInput = () => {
    // View mode - display value
    if (!editable || type === 'display') {
      if (type === 'badge' || type === 'select') {
        const selectedOption = options?.find(o => o.value === value)
        return selectedOption ? (
          <Badge variant={badgeVariant}>{selectedOption.label}</Badge>
        ) : (
          <span className="text-charcoal-400">—</span>
        )
      }

      return (
        <ValueDisplay
          value={value}
          type={resolvedDisplayType}
          currency={currency}
          emptyText="—"
        />
      )
    }

    // Edit mode - render input
    switch (type) {
      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={onChange}
            disabled={isDisabled}
          >
            <SelectTrigger
              className={cn('h-10', hasError && 'border-red-500')}
            >
              <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    {option.icon && <option.icon className="h-4 w-4 text-charcoal-500" />}
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'switch':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={onChange}
              disabled={isDisabled}
            />
            <span className="text-sm text-charcoal-600">
              {value ? 'Yes' : 'No'}
            </span>
          </div>
        )

      case 'textarea':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={isDisabled}
            className={cn('min-h-[80px] resize-y', hasError && 'border-red-500')}
          />
        )

      case 'phone':
        const phoneValue: PhoneInputValue =
          typeof value === 'object' && value !== null
            ? (value as PhoneInputValue)
            : { countryCode: 'US', number: (value as string) || '' }
        return (
          <PhoneInput
            value={phoneValue}
            onChange={onChange as (v: PhoneInputValue) => void}
            placeholder={placeholder}
            disabled={isDisabled}
            error={error}
          />
        )

      case 'currency':
        const currencyValue: CurrencyInputValue =
          typeof value === 'object' && value !== null
            ? (value as CurrencyInputValue)
            : { amount: typeof value === 'number' ? value : null, currency }
        return (
          <CurrencyInput
            value={currencyValue}
            onChange={onChange as (v: CurrencyInputValue) => void}
            placeholder={placeholder || '0.00'}
            min={min}
            max={max}
            defaultCurrency={currency}
            showCurrencySelect={false}
            disabled={isDisabled}
            error={error}
          />
        )

      case 'percentage':
        return (
          <PercentageInput
            value={typeof value === 'number' ? value : null}
            onChange={onChange as (v: number | null) => void}
            placeholder={placeholder || '0'}
            min={min ?? 0}
            max={max ?? 100}
            disabled={isDisabled}
            error={error}
          />
        )

      case 'date':
        return (
          <DateInput
            value={value as Date | string | null}
            onChange={(v) => onChange?.(v?.toISOString() || null)}
            placeholder={placeholder || 'Select date'}
            disabled={isDisabled}
            error={error}
            useNative={true}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) =>
              onChange?.(e.target.value === '' ? null : parseFloat(e.target.value))
            }
            placeholder={placeholder}
            min={min}
            max={max}
            step={step || 1}
            disabled={isDisabled}
            className={cn('h-10 tabular-nums', hasError && 'border-red-500')}
          />
        )

      case 'email':
        return (
          <Input
            type="email"
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || 'email@example.com'}
            disabled={isDisabled}
            className={cn('h-10', hasError && 'border-red-500')}
          />
        )

      case 'url':
        return (
          <Input
            type="url"
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || 'https://example.com'}
            disabled={isDisabled}
            className={cn('h-10', hasError && 'border-red-500')}
          />
        )

      case 'text':
      default:
        return (
          <Input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={isDisabled}
            className={cn('h-10', hasError && 'border-red-500')}
          />
        )
    }
  }

  return (
    <div className={cn('flex items-start gap-4', className)}>
      {/* Label */}
      <Label
        className={cn(
          'text-sm font-medium text-charcoal-700 pt-2.5 shrink-0 flex items-center gap-1',
          !editable && 'pt-0'
        )}
        style={{ width: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth }}
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Value / Input */}
      <div className="flex-1 min-w-0">
        {renderInput()}
        {helperText && !error && (
          <p className="text-xs text-charcoal-500 mt-1">{helperText}</p>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  )
}

// ============================================
// HORIZONTAL FIELD GROUP
// Container for multiple horizontal fields
// ============================================

export interface HorizontalFieldGroupProps {
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** Children (HorizontalField components) */
  children: React.ReactNode
  /** Gap between fields */
  gap?: 'sm' | 'md' | 'lg'
  /** Additional className */
  className?: string
}

export function HorizontalFieldGroup({
  title,
  description,
  children,
  gap = 'md',
  className,
}: HorizontalFieldGroupProps) {
  const gapClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  }

  return (
    <div className={cn('', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h4 className="text-sm font-semibold text-charcoal-800">{title}</h4>
          )}
          {description && (
            <p className="text-xs text-charcoal-500 mt-0.5">{description}</p>
          )}
        </div>
      )}
      <div className={gapClasses[gap]}>{children}</div>
    </div>
  )
}

// ============================================
// HORIZONTAL DIVIDER
// Divider with optional label
// ============================================

export interface HorizontalDividerProps {
  label?: string
  className?: string
}

export function HorizontalDivider({ label, className }: HorizontalDividerProps) {
  if (label) {
    return (
      <div className={cn('relative py-4', className)}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-200" />
        </div>
        <div className="relative flex justify-start">
          <span className="bg-white pr-3 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>
    )
  }

  return <div className={cn('border-t border-charcoal-200 my-4', className)} />
}
