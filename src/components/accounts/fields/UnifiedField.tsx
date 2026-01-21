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
import { CheckCircle2, XCircle } from 'lucide-react'

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
}: UnifiedFieldProps) {
  // Helper to get label from options
  const getOptionLabel = (val: string) => {
    const opt = options.find(o => o.value === val)
    return opt?.label ?? val?.replace(/_/g, ' ')
  }

  // Helper to format display value
  const formatDisplayValue = (val: unknown): string => {
    if (val === null || val === undefined || val === '') return ''

    if (type === 'phone' && typeof val === 'object' && val !== null) {
      const phone = val as PhoneInputValue
      if (!phone.number) return ''
      const code = phone.countryCode === 'US' ? '1' : phone.countryCode
      return `+${code} ${phone.number}`
    }

    if (type === 'date' && val) {
      return new Date(val as string).toLocaleDateString()
    }

    if (type === 'currency' && val) {
      const num = parseFloat(String(val))
      if (isNaN(num)) return ''
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
    }

    if (type === 'percentage' && val) {
      const num = parseFloat(String(val))
      if (isNaN(num)) return ''
      return `${num}%`
    }

    return String(val)
  }

  // ========== VIEW MODE ==========
  if (!editable) {
    const displayValue = formatDisplayValue(value)
    const isEmpty = !displayValue

    // Switch type in view mode
    if (type === 'switch') {
      const isOn = Boolean(value)
      return (
        <div className={cn('space-y-1', className)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                {label}
              </p>
              {helpText && <p className="text-xs text-charcoal-400 mt-0.5">{helpText}</p>}
            </div>
            <Badge variant={isOn ? 'success' : 'secondary'} className="gap-1">
              {isOn ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Yes
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  No
                </>
              )}
            </Badge>
          </div>
        </div>
      )
    }

    return (
      <div className={cn('space-y-1', className)}>
        <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
          {label}
        </p>

        {badge ? (
          <Badge variant={badgeVariant}>
            {type === 'select' ? getOptionLabel(value as string) : displayValue || 'Not specified'}
          </Badge>
        ) : type === 'multiSelect' ? (
          <div className="flex flex-wrap gap-1">
            {Array.isArray(value) && value.length > 0 ? (
              value.map((v: string) => (
                <Badge key={v} variant="outline">
                  {getOptionLabel(v)}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-charcoal-400">Not specified</span>
            )}
          </div>
        ) : type === 'select' ? (
          <p className="text-sm text-charcoal-900">
            {isEmpty ? (
              <span className="text-charcoal-400">Not specified</span>
            ) : (
              getOptionLabel(value as string)
            )}
          </p>
        ) : type === 'textarea' ? (
          <p className="text-sm text-charcoal-900 whitespace-pre-wrap">
            {isEmpty ? (
              <span className="text-charcoal-400">Not specified</span>
            ) : (
              displayValue
            )}
          </p>
        ) : type === 'url' && !isEmpty ? (
          <a
            href={displayValue.startsWith('http') ? displayValue : `https://${displayValue}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {displayValue}
          </a>
        ) : (
          <p className="text-sm text-charcoal-900">
            {isEmpty ? (
              <span className="text-charcoal-400">Not specified</span>
            ) : (
              displayValue
            )}
          </p>
        )}
      </div>
    )
  }

  // ========== EDIT MODE ==========

  // Switch type in edit mode
  if (type === 'switch') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <div>
          <Label className="text-charcoal-700 font-medium">
            {label}
            {required && <span className="text-gold-500 ml-1">*</span>}
          </Label>
          {helpText && <p className="text-xs text-charcoal-400 mt-0.5">{helpText}</p>}
        </div>
        <Switch
          checked={Boolean(value)}
          onCheckedChange={onChange}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-charcoal-700 font-medium">
        {label}
        {required && <span className="text-gold-500 ml-1">*</span>}
      </Label>

      {type === 'select' ? (
        <Select value={value as string} onValueChange={onChange}>
          <SelectTrigger className="h-11 rounded-lg border-charcoal-200">
            <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.icon && <span className="mr-2">{opt.icon}</span>}
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'multiSelect' ? (
        <MultiSelectChips
          options={options}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      ) : type === 'textarea' ? (
        <Textarea
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="rounded-lg border-charcoal-200 resize-none"
        />
      ) : type === 'phone' ? (
        <PhoneInput
          value={(value as PhoneInputValue) || { countryCode: 'US', number: '' }}
          onChange={onChange}
        />
      ) : type === 'currency' ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500">$</span>
          <Input
            type="number"
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || '0.00'}
            min={min}
            max={max}
            step={step || 0.01}
            className="h-11 rounded-lg border-charcoal-200 pl-7"
          />
        </div>
      ) : type === 'percentage' ? (
        <div className="relative">
          <Input
            type="number"
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || '0'}
            min={min ?? 0}
            max={max ?? 100}
            step={step || 0.1}
            className="h-11 rounded-lg border-charcoal-200 pr-7"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500">%</span>
        </div>
      ) : (
        <Input
          type={type === 'url' ? 'text' : type}
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          maxLength={maxLength}
          className="h-11 rounded-lg border-charcoal-200"
        />
      )}

      {helpText && <p className="text-xs text-charcoal-400">{helpText}</p>}
      {error && <p className="text-xs text-error-500">{error}</p>}
    </div>
  )
}

// ========== MULTI-SELECT CHIPS ==========
interface MultiSelectChipsProps {
  options: Option[]
  value: string[]
  onChange: (value: unknown) => void
}

function MultiSelectChips({ options, value, onChange }: MultiSelectChipsProps) {
  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isSelected = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              isSelected
                ? 'bg-gradient-to-r from-hublot-800 to-hublot-900 text-white'
                : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
            )}
          >
            {opt.icon && <span>{opt.icon}</span>}
            {opt.label}
            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        )
      })}
    </div>
  )
}

export default UnifiedField
