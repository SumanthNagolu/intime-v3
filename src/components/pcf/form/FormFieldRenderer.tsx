'use client'

import * as React from 'react'
import { Mail, Link as LinkIcon, Linkedin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LocationPicker, AddressForm, type AddressFormData } from '@/components/addresses'
import { PhoneInput, type PhoneInputValue } from '@/components/ui/phone-input'
import { CurrencyInput, type CurrencyInputValue } from '@/components/ui/currency-input'
import { PercentageInput } from '@/components/ui/percentage-input'
import { DateInput, DateRangeInput, type DateRangeValue } from '@/components/ui/date-range-input'
import { TagsInput } from '@/components/ui/tags-display'
import { FieldDefinition } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

// ============================================
// FORM FIELD RENDERER PROPS
// ============================================

interface FormFieldRendererProps {
  field: FieldDefinition
  value: unknown
  onChange: (value: unknown) => void
  error?: string
  disabled?: boolean
}

// ============================================
// MAIN FORM FIELD RENDERER
// ============================================

export function FormFieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled = false,
}: FormFieldRendererProps) {
  const isDisabled = disabled || field.readOnly
  const hasError = !!error

  const renderInput = () => {
    switch (field.type) {
      // ============================================
      // SELECT FIELDS
      // ============================================
      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={onChange}
            disabled={isDisabled}
          >
            <SelectTrigger className={cn(hasError && 'border-red-500')}>
              <SelectValue
                placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
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

      case 'multi-select':
        return (
          <TagsInput
            value={Array.isArray(value) ? value : []}
            onChange={onChange as (value: string[]) => void}
            placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
            suggestions={field.options?.map((o) => o.value) || []}
            allowCustom={false}
            disabled={isDisabled}
            error={error}
          />
        )

      // ============================================
      // TEXT FIELDS
      // ============================================
      case 'textarea':
      case 'rich-text':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            className={cn('min-h-[100px] resize-y', hasError && 'border-red-500')}
          />
        )

      case 'email':
        return (
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" />
            <Input
              type="email"
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder || 'email@example.com'}
              disabled={isDisabled}
              className={cn('pl-10', hasError && 'border-red-500')}
            />
          </div>
        )

      case 'url':
        return (
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" />
            <Input
              type="url"
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder || 'https://example.com'}
              disabled={isDisabled}
              className={cn('pl-10', hasError && 'border-red-500')}
            />
          </div>
        )

      // ============================================
      // PHONE INPUT (Enhanced)
      // ============================================
      case 'phone':
        // Support both string and PhoneInputValue
        const phoneValue: PhoneInputValue =
          typeof value === 'object' && value !== null
            ? (value as PhoneInputValue)
            : { countryCode: 'US', number: (value as string) || '' }

        return (
          <PhoneInput
            value={phoneValue}
            onChange={(v) => onChange(v)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            error={error}
          />
        )

      // ============================================
      // NUMBER FIELDS
      // ============================================
      case 'number':
        return (
          <Input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) =>
              onChange(e.target.value === '' ? null : parseFloat(e.target.value))
            }
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            disabled={isDisabled}
            className={cn('tabular-nums', hasError && 'border-red-500')}
          />
        )

      // ============================================
      // CURRENCY INPUT (Enhanced)
      // ============================================
      case 'currency':
        // Support both number and CurrencyInputValue
        const currencyValue: CurrencyInputValue =
          typeof value === 'object' && value !== null
            ? (value as CurrencyInputValue)
            : {
                amount: typeof value === 'number' ? value : null,
                currency: (field.currency as 'USD' | 'CAD' | 'GBP' | 'EUR' | 'INR') || 'USD',
              }

        return (
          <CurrencyInput
            value={currencyValue}
            onChange={(v) => {
              // If field expects simple number, extract amount
              if (field.currency) {
                onChange(v.amount)
              } else {
                onChange(v)
              }
            }}
            placeholder={field.placeholder || '0.00'}
            min={field.min}
            max={field.max}
            defaultCurrency={(field.currency as 'USD' | 'CAD' | 'GBP' | 'EUR' | 'INR') || 'USD'}
            showCurrencySelect={!field.currency}
            disabled={isDisabled}
            error={error}
          />
        )

      // ============================================
      // PERCENTAGE INPUT (New)
      // ============================================
      // Note: Add 'percentage' to FieldType in types.ts to enable
      // For now, number fields with max=100 can be used

      // ============================================
      // DATE FIELDS (Enhanced)
      // ============================================
      case 'date':
        return (
          <DateInput
            value={value as Date | string | null}
            onChange={(v) => onChange(v?.toISOString() || null)}
            placeholder={field.placeholder || 'Select date'}
            disabled={isDisabled}
            error={error}
            useNative={true} // Use native for better mobile support
          />
        )

      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={
              value
                ? new Date(value as string | number).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
            disabled={isDisabled}
            className={cn(hasError && 'border-red-500')}
          />
        )

      case 'date-range':
        const rangeValue: DateRangeValue =
          typeof value === 'object' && value !== null
            ? (value as DateRangeValue)
            : { from: null, to: null }

        return (
          <DateRangeInput
            value={rangeValue}
            onChange={(v) => onChange(v)}
            disabled={isDisabled}
            error={error}
          />
        )

      // ============================================
      // BOOLEAN FIELDS
      // ============================================
      case 'checkbox':
        return (
          <div className="flex items-center space-x-3 py-1">
            <Checkbox
              id={field.key}
              checked={Boolean(value)}
              onCheckedChange={onChange}
              disabled={isDisabled}
            />
            {field.description && (
              <Label
                htmlFor={field.key}
                className="text-sm text-charcoal-600 cursor-pointer"
              >
                {field.description}
              </Label>
            )}
          </div>
        )

      case 'switch':
        return (
          <div className="flex items-center justify-between py-1">
            <div className="space-y-0.5">
              {field.description && (
                <Label
                  htmlFor={field.key}
                  className="text-sm text-charcoal-600 cursor-pointer"
                >
                  {field.description}
                </Label>
              )}
            </div>
            <Switch
              id={field.key}
              checked={Boolean(value)}
              onCheckedChange={onChange}
              disabled={isDisabled}
            />
          </div>
        )

      // ============================================
      // RADIO BUTTONS
      // ============================================
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200',
                  value === option.value
                    ? 'border-gold-500 bg-gold-50/50 ring-1 ring-gold-500/20'
                    : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50',
                  isDisabled && 'cursor-not-allowed opacity-60'
                )}
              >
                <input
                  type="radio"
                  name={field.key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  disabled={isDisabled}
                  className="w-4 h-4 text-gold-500 border-charcoal-300 focus:ring-gold-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-charcoal-800">
                    {option.label}
                  </span>
                  {option.color && (
                    <span
                      className="ml-2 inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                </div>
              </label>
            ))}
          </div>
        )

      // ============================================
      // TAGS/SKILLS INPUT (Enhanced)
      // ============================================
      case 'skills':
        return (
          <TagsInput
            value={Array.isArray(value) ? value : []}
            onChange={onChange as (value: string[]) => void}
            placeholder={field.placeholder || 'Type and press Enter to add'}
            suggestions={field.options?.map((o) => o.value) || []}
            allowCustom={true}
            disabled={isDisabled}
            error={error}
          />
        )

      // ============================================
      // LOCATION PICKER
      // ============================================
      case 'location':
        return (
          <LocationPicker
            label=""
            value={{
              city: (value as string)?.split(',')[0]?.trim() || '',
              stateProvince: (value as string)?.split(',')[1]?.trim() || '',
              countryCode: 'US',
            }}
            onChange={(data) => {
              const displayValue =
                data.city && data.stateProvince
                  ? `${data.city}, ${data.stateProvince}`
                  : data.city || ''
              onChange(displayValue)
            }}
            required={field.required}
            disabled={isDisabled}
            showCountry={false}
          />
        )

      // ============================================
      // ADDRESS FORM (Full structured)
      // ============================================
      case 'address':
        const addressValue: Partial<AddressFormData> =
          typeof value === 'object' && value !== null
            ? (value as Partial<AddressFormData>)
            : {}

        return (
          <AddressForm
            value={addressValue}
            onChange={(data) => onChange({ ...addressValue, ...data })}
            required={field.required}
            disabled={isDisabled}
            showCounty
            showAddressLine2
            compact={false}
          />
        )

      // ============================================
      // DEFAULT TEXT INPUT
      // ============================================
      case 'text':
      default:
        return (
          <Input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            className={cn(hasError && 'border-red-500')}
          />
        )
    }
  }

  // ============================================
  // FIELD WRAPPER
  // ============================================

  // Don't render label for checkbox/switch (label is inline)
  if (field.type === 'checkbox' || field.type === 'switch') {
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium text-charcoal-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {renderInput()}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // Skip label for fields that have built-in labels (phone, currency, etc.)
  const hasBuiltInLabel = ['phone'].includes(field.type)

  return (
    <div className="space-y-1.5">
      {!hasBuiltInLabel && (
        <Label
          htmlFor={field.key}
          className="text-sm font-medium text-charcoal-700"
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderInput()}
      {field.description && !error && (
        <p className="text-xs text-charcoal-500">{field.description}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// ============================================
// VIEW MODE FIELD RENDERER
// ============================================

import { ValueDisplay, type ValueDisplayType } from '@/components/ui/value-display'

interface ViewFieldRendererProps {
  field: FieldDefinition
  value: unknown
  className?: string
}

/**
 * Renders a field value in view/display mode (read-only)
 */
export function ViewFieldRenderer({ field, value, className }: ViewFieldRendererProps) {
  // Map field type to display type
  const getDisplayType = (): ValueDisplayType => {
    switch (field.type) {
      case 'email':
        return 'email'
      case 'phone':
        return 'phone'
      case 'url':
        return 'url'
      case 'currency':
        return 'currency'
      case 'date':
      case 'datetime':
        return 'date'
      case 'date-range':
        return 'dateRange'
      case 'checkbox':
      case 'switch':
        return 'boolean'
      case 'select':
        return 'badge'
      case 'multi-select':
      case 'skills':
        return 'tags'
      case 'number':
        return 'number'
      case 'address':
        return 'address'
      default:
        return 'text'
    }
  }

  return (
    <div className={cn('space-y-1', className)}>
      <Label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
        {field.label}
      </Label>
      <div className="text-charcoal-700">
        <ValueDisplay
          value={value}
          type={getDisplayType()}
          currency={(field.currency as 'USD' | 'CAD' | 'GBP' | 'EUR' | 'INR') || 'USD'}
          showIcon={true}
          clickable={['email', 'phone', 'url'].includes(field.type)}
          copyable={['email', 'phone'].includes(field.type)}
        />
      </div>
    </div>
  )
}
