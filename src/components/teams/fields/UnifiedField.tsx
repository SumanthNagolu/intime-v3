'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput, type PhoneInputValue } from '@/components/ui/phone-input'
import { cn } from '@/lib/utils'

type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'select'
  | 'multiSelect'
  | 'textarea'
  | 'date'
  | 'currency'
  | 'percentage'
  | 'switch'

interface Option {
  value: string
  label: string
  icon?: string
  description?: string
}

interface UnifiedFieldProps {
  label: string
  value: unknown
  onChange: (value: unknown) => void
  editable: boolean
  type?: FieldType
  options?: Option[]
  required?: boolean
  error?: string
  placeholder?: string
  badge?: boolean
  badgeVariant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'
  className?: string
  maxLength?: number
  min?: number
  max?: number
  step?: number
  helpText?: string
  rows?: number
}

export function UnifiedField({
  label,
  value,
  onChange,
  editable,
  type = 'text',
  options = [],
  required,
  error,
  placeholder,
  badge,
  badgeVariant = 'secondary',
  className,
  maxLength,
  min,
  max,
  step,
  helpText,
  rows = 3,
}: UnifiedFieldProps) {
  // Helper to get label from options
  const getOptionLabel = (val: string) => {
    const opt = options.find(o => o.value === val)
    return opt?.label ?? val?.replace(/_/g, ' ')
  }

  // Helper to format display value
  const formatDisplayValue = (val: unknown): string => {
    if (val === null || val === undefined || val === '') return '—'

    if (type === 'phone' && typeof val === 'object' && val !== null) {
      const phone = val as PhoneInputValue
      if (!phone.number) return '—'
      const code = phone.countryCode === 'US' ? '1' : phone.countryCode
      return `+${code} ${phone.number}`
    }

    if (type === 'date' && val) {
      return new Date(val as string).toLocaleDateString()
    }

    if (type === 'currency' && val) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        Number(val)
      )
    }

    if (type === 'percentage' && val) {
      return `${val}%`
    }

    if (type === 'switch') {
      return val ? 'Yes' : 'No'
    }

    if (type === 'select') {
      return getOptionLabel(String(val))
    }

    if (type === 'multiSelect' && Array.isArray(val)) {
      return val.map(v => getOptionLabel(String(v))).join(', ') || '—'
    }

    return String(val)
  }

  // View mode rendering
  if (!editable) {
    const displayValue = formatDisplayValue(value)

    return (
      <div className={cn('space-y-1', className)}>
        <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </p>
        {badge ? (
          <Badge variant={badgeVariant} className="capitalize">
            {displayValue}
          </Badge>
        ) : (
          <p className="text-sm text-charcoal-900">{displayValue}</p>
        )}
      </div>
    )
  }

  // Edit mode rendering
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-sm font-medium text-charcoal-700">
        {label}
        {required && <span className="text-error-500 ml-0.5">*</span>}
      </Label>

      {type === 'text' && (
        <Input
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(error && 'border-error-500')}
        />
      )}

      {type === 'email' && (
        <Input
          type="email"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'email@example.com'}
          className={cn(error && 'border-error-500')}
        />
      )}

      {type === 'url' && (
        <Input
          type="url"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'https://'}
          className={cn(error && 'border-error-500')}
        />
      )}

      {type === 'number' && (
        <Input
          type="number"
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={cn(error && 'border-error-500')}
        />
      )}

      {type === 'percentage' && (
        <div className="relative">
          <Input
            type="number"
            value={value !== undefined && value !== null ? String(value) : ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={placeholder || '0'}
            min={min ?? 0}
            max={max ?? 100}
            step={step ?? 1}
            className={cn('pr-8', error && 'border-error-500')}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">%</span>
        </div>
      )}

      {type === 'phone' && (
        <PhoneInput
          value={(value as PhoneInputValue) || { countryCode: 'US', number: '' }}
          onChange={(v) => onChange(v)}
          placeholder={placeholder || '(555) 123-4567'}
          className={cn(error && 'border-error-500')}
        />
      )}

      {type === 'textarea' && (
        <Textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={cn(error && 'border-error-500')}
        />
      )}

      {type === 'select' && (
        <Select value={(value as string) || ''} onValueChange={onChange}>
          <SelectTrigger className={cn(error && 'border-error-500')}>
            <SelectValue placeholder={placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.icon && <span className="mr-2">{opt.icon}</span>}
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {type === 'switch' && (
        <div className="flex items-center gap-3">
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <span className="text-sm text-charcoal-600">
            {value ? 'Yes' : 'No'}
          </span>
        </div>
      )}

      {error && <p className="text-xs text-error-500">{error}</p>}
      {helpText && !error && <p className="text-xs text-charcoal-500">{helpText}</p>}
    </div>
  )
}

export default UnifiedField
