'use client'

import * as React from 'react'
import { Percent } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export interface PercentageInputProps {
  /** Current value (0-100) */
  value: number | null | undefined
  /** Change handler */
  onChange: (value: number | null) => void
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Number of decimal places */
  decimals?: number
  /** Show slider control */
  showSlider?: boolean
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

export function PercentageInput({
  value,
  onChange,
  label,
  placeholder = '0',
  min = 0,
  max = 100,
  step = 1,
  decimals = 0,
  showSlider = false,
  disabled = false,
  readOnly = false,
  error,
  helperText,
  required = false,
  className,
}: PercentageInputProps) {
  const [inputValue, setInputValue] = React.useState<string>('')

  // Sync internal state with prop value
  React.useEffect(() => {
    if (value !== null && value !== undefined) {
      setInputValue(value.toFixed(decimals))
    } else {
      setInputValue('')
    }
  }, [value, decimals])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value

    // Allow empty input
    if (raw === '') {
      setInputValue('')
      onChange(null)
      return
    }

    // Allow partial decimal input
    if (raw.endsWith('.') || raw === '-') {
      setInputValue(raw)
      return
    }

    const num = parseFloat(raw)
    if (!isNaN(num)) {
      // Clamp to min/max
      const clamped = Math.min(Math.max(num, min), max)
      setInputValue(raw)
      onChange(clamped)
    }
  }

  const handleBlur = () => {
    // Format on blur
    if (value !== null && value !== undefined) {
      setInputValue(value.toFixed(decimals))
    }
  }

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0]
    onChange(newValue)
    setInputValue(newValue.toFixed(decimals))
  }

  const hasError = !!error

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1.5">
          <Percent className="w-4 h-4 text-charcoal-400" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="space-y-3">
        <div className="relative">
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
              'pr-10',
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none">
            %
          </span>
        </div>

        {showSlider && !readOnly && (
          <Slider
            value={[value ?? 0]}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="py-2"
          />
        )}
      </div>

      {helperText && !error && (
        <p className="text-sm text-charcoal-500">{helperText}</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// ============================================
// PERCENTAGE DISPLAY
// ============================================

export interface PercentageDisplayProps {
  value: number | null | undefined
  decimals?: number
  showBar?: boolean
  barColor?: string
  className?: string
}

export function PercentageDisplay({
  value,
  decimals = 0,
  showBar = false,
  barColor = 'bg-gold-500',
  className,
}: PercentageDisplayProps) {
  if (value === null || value === undefined) {
    return <span className={cn('text-charcoal-400', className)}>—</span>
  }

  const displayValue = value.toFixed(decimals)

  if (showBar) {
    return (
      <div className={cn('space-y-1', className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-charcoal-900 tabular-nums">{displayValue}%</span>
        </div>
        <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <span className={cn('tabular-nums', className)}>
      {displayValue}%
    </span>
  )
}
