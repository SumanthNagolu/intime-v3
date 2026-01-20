'use client'

import * as React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput, type PhoneInputValue } from '@/components/ui/phone-input'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { SectionWrapper } from './SectionHeader'
import { FieldGrid } from './FieldGrid'
import type { FieldGroupDefinition, FieldDefinition, SectionMode } from '@/lib/accounts/types'
import { cn } from '@/lib/utils'

interface FormViewProps {
  /** Field group definition */
  group: FieldGroupDefinition
  /** Data object with values */
  data: Record<string, unknown>
  /** Change handler for field updates */
  onChange: (field: string, value: unknown) => void
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Rendering variant (wizard = larger inputs, panel = compact) */
  variant?: 'wizard' | 'panel'
  /** Additional context for conditional fields */
  context?: Record<string, unknown>
  /** Section mode (affects required indicators) */
  mode?: SectionMode
  /** Additional class name */
  className?: string
}

/**
 * FormView - Renders a field group as an editable form
 *
 * Used in create mode (wizard) and edit mode (inline panel).
 * Handles different field types, validation errors, and conditional visibility.
 */
export function FormView({
  group,
  data,
  onChange,
  errors = {},
  variant = 'wizard',
  context = {},
  mode = 'create',
  className,
}: FormViewProps) {
  // Filter visible fields
  const visibleFields = group.fields.filter((field) => {
    if (field.hideIn?.includes(mode)) return false
    if (field.showWhen && !field.showWhen({ ...data, ...context })) return false
    return true
  })

  if (visibleFields.length === 0) return null

  const isWizard = variant === 'wizard'

  return (
    <SectionWrapper
      icon={group.icon}
      title={group.title}
      subtitle={group.subtitle}
      variant={variant}
      className={className}
    >
      <FieldGrid cols={2} gap={isWizard ? 'md' : 'sm'}>
        {visibleFields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={data[field.name]}
            onChange={(value) => onChange(field.name, value)}
            error={errors[field.name]}
            variant={variant}
            mode={mode}
          />
        ))}
      </FieldGrid>
    </SectionWrapper>
  )
}

interface FieldInputProps {
  field: FieldDefinition
  value: unknown
  onChange: (value: unknown) => void
  error?: string
  variant: 'wizard' | 'panel'
  mode: SectionMode
}

/**
 * FieldInput - Renders the appropriate input for a field definition
 */
function FieldInput({ field, value, onChange, error, variant, mode }: FieldInputProps) {
  const isWizard = variant === 'wizard'
  const isRequired = field.required || (mode === 'create' && field.requiredCreate)
  const label = mode === 'create' && field.labelCreate ? field.labelCreate : field.label
  const placeholder =
    mode === 'create' && field.placeholderCreate ? field.placeholderCreate : field.placeholder

  // Input styling based on variant
  const inputClassName = isWizard
    ? 'h-12 rounded-xl border-charcoal-200 bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400'
    : 'h-11 rounded-sm'

  const wrapperClassName = cn(
    'space-y-2',
    field.colSpan === 2 && 'md:col-span-2'
  )

  // Render based on field type
  switch (field.type) {
    case 'select':
      return (
        <div className={wrapperClassName}>
          <FieldLabel label={label} required={isRequired} />
          <Select
            value={(value as string) || ''}
            onValueChange={onChange}
          >
            <SelectTrigger className={inputClassName}>
              <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError error={error} />
          {field.helpText && <p className="text-xs text-charcoal-500">{field.helpText}</p>}
        </div>
      )

    case 'multiSelect':
      return (
        <div className={wrapperClassName}>
          <FieldLabel label={label} required={isRequired} />
          <MultiSelectChips
            options={field.options || []}
            value={(value as string[]) || []}
            onChange={onChange}
            variant={variant}
          />
          <FieldError error={error} />
          {field.helpText && <p className="text-xs text-charcoal-500">{field.helpText}</p>}
        </div>
      )

    case 'textarea':
      return (
        <div className={wrapperClassName}>
          <FieldLabel label={label} required={isRequired} />
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={field.rows || 4}
            maxLength={field.maxLength}
            className={cn(
              'resize-none border-charcoal-200 bg-white',
              isWizard ? 'rounded-xl min-h-[120px]' : 'rounded-sm'
            )}
          />
          {field.maxLength && (
            <p className="text-xs text-charcoal-400 text-right">
              {((value as string) || '').length}/{field.maxLength} characters
            </p>
          )}
          <FieldError error={error} />
        </div>
      )

    case 'phone':
      const phoneValue: PhoneInputValue = (value as PhoneInputValue) || { countryCode: 'US', number: '' }
      return (
        <div className={wrapperClassName}>
          <FieldLabel label={label} required={isRequired} />
          <PhoneInput
            value={phoneValue}
            onChange={onChange}
          />
          <FieldError error={error} />
        </div>
      )

    case 'checkbox':
      return (
        <div className={cn(wrapperClassName, 'flex items-center gap-3')}>
          <Checkbox
            checked={(value as boolean) || false}
            onCheckedChange={onChange}
            id={field.name}
          />
          <Label htmlFor={field.name} className="cursor-pointer">
            {label}
            {field.helpText && (
              <span className="text-xs text-charcoal-500 block">{field.helpText}</span>
            )}
          </Label>
        </div>
      )

    case 'switch':
      return (
        <div className={cn(wrapperClassName, 'flex items-center justify-between')}>
          <div>
            <Label htmlFor={field.name}>{label}</Label>
            {field.helpText && (
              <p className="text-xs text-charcoal-500">{field.helpText}</p>
            )}
          </div>
          <Switch
            id={field.name}
            checked={(value as boolean) || false}
            onCheckedChange={onChange}
          />
        </div>
      )

    case 'number':
    case 'currency':
    case 'percentage':
      return (
        <div className={wrapperClassName}>
          <FieldLabel label={label} required={isRequired} />
          <Input
            type="number"
            value={(value as string | number) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className={inputClassName}
          />
          <FieldError error={error} />
        </div>
      )

    case 'taxId':
      return (
        <div className={wrapperClassName}>
          <FieldLabel label={label} required={isRequired} />
          <TaxIdInput
            value={(value as string) || ''}
            onChange={onChange}
            isPerson={(value as unknown as { accountType?: string })?.accountType === 'person'}
            placeholder={placeholder}
            className={inputClassName}
          />
          <FieldError error={error} />
        </div>
      )

    case 'email':
      return (
        <div className={wrapperClassName}>
          <FieldLabel label={label} required={isRequired} />
          <Input
            type="email"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'email@example.com'}
            className={inputClassName}
          />
          <FieldError error={error} />
        </div>
      )

    case 'url':
      return (
        <div className={wrapperClassName}>
          <FieldLabel label={label} required={isRequired} />
          <Input
            type="url"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'https://example.com'}
            className={inputClassName}
          />
          <FieldError error={error} />
        </div>
      )

    case 'date':
      return (
        <div className={wrapperClassName}>
          <FieldLabel label={label} required={isRequired} />
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClassName}
          />
          <FieldError error={error} />
        </div>
      )

    case 'text':
    default:
      return (
        <div className={wrapperClassName}>
          <FieldLabel label={label} required={isRequired} />
          <Input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={field.maxLength}
            className={inputClassName}
          />
          <FieldError error={error} />
        </div>
      )
  }
}

// ============ HELPER COMPONENTS ============

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Label className="text-charcoal-700 font-medium">
      {label}
      {required && <span className="text-gold-500 ml-1">*</span>}
    </Label>
  )
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="text-xs text-error-600 flex items-center gap-1.5">
      <AlertCircle className="w-3.5 h-3.5" />
      {error}
    </p>
  )
}

interface MultiSelectChipsProps {
  options: readonly { value: string; label: string; icon?: string }[] | { value: string; label: string; icon?: string }[]
  value: string[]
  onChange: (value: unknown) => void
  variant: 'wizard' | 'panel'
}

function MultiSelectChips({ options, value, onChange, variant }: MultiSelectChipsProps) {
  const toggleValue = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  const isWizard = variant === 'wizard'

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleValue(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 font-medium transition-all duration-200',
              isWizard ? 'px-3 py-1.5 rounded-full text-sm' : 'px-2 py-1 rounded-md text-xs',
              isSelected
                ? 'bg-gradient-to-r from-hublot-800 to-hublot-900 text-white shadow-sm'
                : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
            )}
          >
            {option.icon && <span>{option.icon}</span>}
            {option.label}
            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        )
      })}
    </div>
  )
}

interface TaxIdInputProps {
  value: string
  onChange: (value: string) => void
  isPerson?: boolean
  placeholder?: string
  className?: string
}

function TaxIdInput({ value, onChange, isPerson = false, placeholder, className }: TaxIdInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '')
    let formatted = input

    if (isPerson) {
      // SSN format: XXX-XX-XXXX
      if (input.length <= 3) formatted = input
      else if (input.length <= 5) formatted = `${input.slice(0, 3)}-${input.slice(3)}`
      else formatted = `${input.slice(0, 3)}-${input.slice(3, 5)}-${input.slice(5, 9)}`
    } else {
      // EIN format: XX-XXXXXXX
      if (input.length <= 2) formatted = input
      else formatted = `${input.slice(0, 2)}-${input.slice(2, 9)}`
    }

    onChange(formatted)
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder || (isPerson ? 'XXX-XX-XXXX' : 'XX-XXXXXXX')}
      className={className}
    />
  )
}

export default FormView
