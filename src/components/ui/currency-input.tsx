'use client'

import * as React from 'react'
import { DollarSign } from 'lucide-react'
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
import { type CurrencyCode, CURRENCY_CONFIG, formatCurrency, parseCurrencyInput } from '@/lib/formatters'

export interface CurrencyInputValue {
  amount: number | null
  currency: CurrencyCode
}

export interface CurrencyInputProps {
  /** Current value */
  value: CurrencyInputValue | number | null | undefined
  /** Change handler */
  onChange: (value: CurrencyInputValue) => void
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Default currency */
  defaultCurrency?: CurrencyCode
  /** Allow currency selection */
  showCurrencySelect?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Read-only state */
  readOnly?: boolean
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Required field */
  required?: boolean
  /** Additional className */
  className?: string
}

export function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = '0.00',
  min,
  max,
  defaultCurrency = 'USD',
  showCurrencySelect = false,
  disabled = false,
  readOnly = false,
  error,
  helperText,
  required = false,
  className,
}: CurrencyInputProps) {
  // Normalize value to CurrencyInputValue
  const normalizedValue: CurrencyInputValue = React.useMemo(() => {
    if (value === null || value === undefined) {
      return { amount: null, currency: defaultCurrency }
    }
    if (typeof value === 'number') {
      return { amount: value, currency: defaultCurrency }
    }
    return value
  }, [value, defaultCurrency])

  const [inputValue, setInputValue] = React.useState<string>('')

  // Sync internal state with prop value
  React.useEffect(() => {
    if (normalizedValue.amount !== null && normalizedValue.amount !== undefined) {
      setInputValue(formatInputValue(normalizedValue.amount))
    } else {
      setInputValue('')
    }
  }, [normalizedValue.amount])

  const formatInputValue = (num: number): string => {
    // Format with commas for display while editing
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value

    // Allow empty input
    if (raw === '') {
      setInputValue('')
      onChange({ ...normalizedValue, amount: null })
      return
    }

    // Remove currency symbols and commas for parsing
    const cleaned = raw.replace(/[,$]/g, '')

    // Allow partial input (e.g., "123." or just digits)
    if (/^[\d,]*\.?\d*$/.test(cleaned)) {
      setInputValue(raw)

      const num = parseCurrencyInput(cleaned)
      if (num !== null) {
        // Apply min/max constraints
        let constrainedNum = num
        if (min !== undefined) constrainedNum = Math.max(min, constrainedNum)
        if (max !== undefined) constrainedNum = Math.min(max, constrainedNum)
        onChange({ ...normalizedValue, amount: constrainedNum })
      }
    }
  }

  const handleBlur = () => {
    // Format on blur
    if (normalizedValue.amount !== null) {
      setInputValue(formatInputValue(normalizedValue.amount))
    }
  }

  const handleCurrencyChange = (newCurrency: string) => {
    onChange({ ...normalizedValue, currency: newCurrency as CurrencyCode })
  }

  const currencyConfig = CURRENCY_CONFIG[normalizedValue.currency]
  const hasError = !!error

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-charcoal-400" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="flex gap-2">
        {/* Currency Selector */}
        {showCurrencySelect && (
          <Select
            value={normalizedValue.currency}
            onValueChange={handleCurrencyChange}
            disabled={disabled || readOnly}
          >
            <SelectTrigger
              className={cn('w-[100px] shrink-0', hasError && 'border-red-500')}
            >
              <SelectValue>
                <span className="font-medium">{normalizedValue.currency}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CURRENCY_CONFIG) as CurrencyCode[]).map((code) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <span className="font-mono">{CURRENCY_CONFIG[code].symbol}</span>
                    <span>{code}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Amount Input */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 font-medium pointer-events-none">
            {currencyConfig.symbol}
          </span>
          <Input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              'pl-8 tabular-nums',
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
          />
        </div>
      </div>

      {helperText && !error && (
        <p className="text-sm text-charcoal-500">{helperText}</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// ============================================
// CURRENCY DISPLAY - Enhanced
// ============================================

export interface CurrencyDisplayProps {
  value: number | CurrencyInputValue | null | undefined
  currency?: CurrencyCode
  compact?: boolean
  showChange?: { value: number; direction: 'up' | 'down' }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CurrencyDisplay({
  value,
  currency = 'USD',
  compact = false,
  showChange,
  size = 'md',
  className,
}: CurrencyDisplayProps) {
  // Normalize value
  let amount: number | null = null
  let currencyCode: CurrencyCode = currency

  if (value !== null && value !== undefined) {
    if (typeof value === 'number') {
      amount = value
    } else {
      amount = value.amount
      currencyCode = value.currency
    }
  }

  if (amount === null) {
    return <span className={cn('text-charcoal-400', className)}>—</span>
  }

  const formatted = formatCurrency(amount, { currency: currencyCode, compact })

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-bold tracking-tight',
  }

  return (
    <span className={cn('tabular-nums', sizeClasses[size], className)}>
      {formatted}
      {showChange && (
        <span
          className={cn(
            'ml-2 text-xs font-medium',
            showChange.direction === 'up' ? 'text-success-600' : 'text-error-600'
          )}
        >
          {showChange.direction === 'up' ? '↑' : '↓'} {Math.abs(showChange.value)}%
        </span>
      )}
    </span>
  )
}

// ============================================
// CURRENCY RANGE INPUT
// ============================================

export interface CurrencyRangeInputProps {
  minValue: number | null | undefined
  maxValue: number | null | undefined
  onMinChange: (value: number | null) => void
  onMaxChange: (value: number | null) => void
  currency?: CurrencyCode
  label?: string
  minPlaceholder?: string
  maxPlaceholder?: string
  disabled?: boolean
  error?: string
  className?: string
}

export function CurrencyRangeInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  currency = 'USD',
  label,
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  disabled = false,
  error,
  className,
}: CurrencyRangeInputProps) {
  const currencyConfig = CURRENCY_CONFIG[currency]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-charcoal-400" />
          {label}
        </Label>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 font-medium pointer-events-none">
            {currencyConfig.symbol}
          </span>
          <Input
            type="number"
            value={minValue ?? ''}
            onChange={(e) =>
              onMinChange(e.target.value === '' ? null : parseFloat(e.target.value))
            }
            placeholder={minPlaceholder}
            disabled={disabled}
            className={cn('pl-8 tabular-nums', error && 'border-red-500')}
          />
        </div>

        <span className="text-charcoal-400">—</span>

        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 font-medium pointer-events-none">
            {currencyConfig.symbol}
          </span>
          <Input
            type="number"
            value={maxValue ?? ''}
            onChange={(e) =>
              onMaxChange(e.target.value === '' ? null : parseFloat(e.target.value))
            }
            placeholder={maxPlaceholder}
            disabled={disabled}
            className={cn('pl-8 tabular-nums', error && 'border-red-500')}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
