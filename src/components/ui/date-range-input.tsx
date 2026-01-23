'use client'

import * as React from 'react'
import { format, parseISO, isValid, isBefore, isAfter } from 'date-fns'
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// ============================================
// DATE RANGE VALUE TYPE
// ============================================

export interface DateRangeValue {
  from: Date | string | null
  to: Date | string | null
}

// ============================================
// DATE RANGE INPUT COMPONENT
// ============================================

export interface DateRangeInputProps {
  /** Current value */
  value: DateRangeValue
  /** Change handler */
  onChange: (value: DateRangeValue) => void
  /** Field label */
  label?: string
  /** From date placeholder */
  fromPlaceholder?: string
  /** To date placeholder */
  toPlaceholder?: string
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Disabled state */
  disabled?: boolean
  /** Required field */
  required?: boolean
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Additional className */
  className?: string
  /** Date display format */
  displayFormat?: string
}

export function DateRangeInput({
  value,
  onChange,
  label,
  fromPlaceholder = 'Start date',
  toPlaceholder = 'End date',
  minDate,
  maxDate,
  disabled = false,
  required = false,
  error,
  helperText,
  className,
  displayFormat = 'MMM d, yyyy',
}: DateRangeInputProps) {
  // Parse dates
  const fromDate = React.useMemo(() => {
    if (!value.from) return undefined
    if (typeof value.from === 'string') {
      const parsed = parseISO(value.from)
      return isValid(parsed) ? parsed : undefined
    }
    return value.from
  }, [value.from])

  const toDate = React.useMemo(() => {
    if (!value.to) return undefined
    if (typeof value.to === 'string') {
      const parsed = parseISO(value.to)
      return isValid(parsed) ? parsed : undefined
    }
    return value.to
  }, [value.to])

  const handleFromChange = (date: Date | undefined) => {
    onChange({
      ...value,
      from: date || null,
      // Clear "to" if it's before new "from"
      to: date && toDate && isBefore(toDate, date) ? null : value.to,
    })
  }

  const handleToChange = (date: Date | undefined) => {
    onChange({
      ...value,
      to: date || null,
    })
  }

  const hasError = !!error

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-charcoal-400" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="flex items-center gap-2">
        {/* From Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                'flex-1 justify-start text-left font-normal h-11',
                !fromDate && 'text-charcoal-400',
                hasError && 'border-red-500'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, displayFormat) : fromPlaceholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={handleFromChange}
              disabled={(date) => {
                if (minDate && isBefore(date, minDate)) return true
                if (maxDate && isAfter(date, maxDate)) return true
                return false
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <ArrowRight className="h-4 w-4 text-charcoal-400 flex-shrink-0" />

        {/* To Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                'flex-1 justify-start text-left font-normal h-11',
                !toDate && 'text-charcoal-400',
                hasError && 'border-red-500'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, displayFormat) : toPlaceholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={handleToChange}
              disabled={(date) => {
                if (fromDate && isBefore(date, fromDate)) return true
                if (minDate && isBefore(date, minDate)) return true
                if (maxDate && isAfter(date, maxDate)) return true
                return false
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {helperText && !error && (
        <p className="text-sm text-charcoal-500">{helperText}</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// ============================================
// SIMPLE DATE INPUT (Enhanced)
// ============================================

export interface DateInputProps {
  /** Current value */
  value: Date | string | null | undefined
  /** Change handler */
  onChange: (value: Date | null) => void
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Disabled state */
  disabled?: boolean
  /** Required field */
  required?: boolean
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Additional className */
  className?: string
  /** Date display format */
  displayFormat?: string
  /** Use native input instead of calendar popover */
  useNative?: boolean
}

export function DateInput({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  required = false,
  error,
  helperText,
  className,
  displayFormat = 'MMM d, yyyy',
  useNative = false,
}: DateInputProps) {
  // Parse date
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    if (typeof value === 'string') {
      const parsed = parseISO(value)
      return isValid(parsed) ? parsed : undefined
    }
    return value
  }, [value])

  const handleChange = (date: Date | undefined) => {
    onChange(date || null)
  }

  const hasError = !!error

  // Native date input
  if (useNative) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-charcoal-400" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
        )}

        <Input
          type="date"
          value={dateValue ? format(dateValue, 'yyyy-MM-dd') : ''}
          onChange={(e) => {
            if (e.target.value) {
              const parsed = parseISO(e.target.value)
              onChange(isValid(parsed) ? parsed : null)
            } else {
              onChange(null)
            }
          }}
          min={minDate ? format(minDate, 'yyyy-MM-dd') : undefined}
          max={maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined}
          disabled={disabled}
          className={cn(hasError && 'border-red-500')}
        />

        {helperText && !error && (
          <p className="text-sm text-charcoal-500">{helperText}</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  // Calendar popover
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-charcoal-400" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal h-11',
              !dateValue && 'text-charcoal-400',
              hasError && 'border-red-500'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? format(dateValue, displayFormat) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleChange}
            disabled={(date) => {
              if (minDate && isBefore(date, minDate)) return true
              if (maxDate && isAfter(date, maxDate)) return true
              return false
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {helperText && !error && (
        <p className="text-sm text-charcoal-500">{helperText}</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// ============================================
// DATE RANGE DISPLAY
// ============================================

export interface DateRangeDisplayProps {
  from: Date | string | null | undefined
  to: Date | string | null | undefined
  format?: string
  separator?: string
  emptyText?: string
  className?: string
}

export function DateRangeDisplay({
  from,
  to,
  format: dateFormat = 'MMM d, yyyy',
  separator = ' → ',
  emptyText = '—',
  className,
}: DateRangeDisplayProps) {
  const formatDateValue = (value: Date | string | null | undefined): string | null => {
    if (!value) return null
    const date = typeof value === 'string' ? parseISO(value) : value
    return isValid(date) ? format(date, dateFormat) : null
  }

  const fromFormatted = formatDateValue(from)
  const toFormatted = formatDateValue(to)

  if (!fromFormatted && !toFormatted) {
    return <span className={cn('text-charcoal-400', className)}>{emptyText}</span>
  }

  if (!toFormatted) {
    return <span className={className}>From {fromFormatted}</span>
  }

  if (!fromFormatted) {
    return <span className={className}>Until {toFormatted}</span>
  }

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span>{fromFormatted}</span>
      <span className="text-charcoal-400">{separator}</span>
      <span>{toFormatted}</span>
    </span>
  )
}
