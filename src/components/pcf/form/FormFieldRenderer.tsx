'use client'

import { useState } from 'react'
import { DollarSign, X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LocationPicker } from '@/components/addresses'
import { FieldDefinition } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

// Skills/Tag Input component for array fields
function SkillsTagInput({
  value,
  onChange,
  placeholder,
  error,
  disabled,
}: {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  error?: boolean
  disabled?: boolean
}) {
  const [inputValue, setInputValue] = useState('')

  const addSkill = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (value.includes(trimmed)) {
      setInputValue('')
      return
    }
    onChange([...value, trimmed])
    setInputValue('')
  }

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter((s) => s !== skillToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type and press Enter to add'}
          disabled={disabled}
          className={cn('flex-1', error && 'border-red-500')}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addSkill}
          disabled={disabled || !inputValue.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-100 hover:bg-charcoal-200 rounded-full text-sm transition-colors group"
            >
              {skill}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-charcoal-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface FormFieldRendererProps {
  field: FieldDefinition
  value: unknown
  onChange: (value: unknown) => void
  error?: string
  disabled?: boolean
}

export function FormFieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled = false,
}: FormFieldRendererProps) {
  const renderInput = () => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={onChange}
            disabled={disabled || field.readOnly}
          >
            <SelectTrigger className={cn(error && 'border-red-500')}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multi-select':
        // Multi-select would need a custom component
        return (
          <Select
            value={(value as string[])?.join(',') || ''}
            onValueChange={(v) => onChange(v.split(',').filter(Boolean))}
            disabled={disabled || field.readOnly}
          >
            <SelectTrigger className={cn(error && 'border-red-500')}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'textarea':
      case 'rich-text':
        return (
          <Textarea
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled || field.readOnly}
            className={cn('min-h-[80px]', error && 'border-red-500')}
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.key}
              checked={Boolean(value)}
              onCheckedChange={onChange}
              disabled={disabled || field.readOnly}
            />
            {field.description && (
              <Label htmlFor={field.key} className="text-sm text-charcoal-600">
                {field.description}
              </Label>
            )}
          </div>
        )

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.key}
              checked={Boolean(value)}
              onCheckedChange={onChange}
              disabled={disabled || field.readOnly}
            />
            {field.description && (
              <Label htmlFor={field.key} className="text-sm text-charcoal-600">
                {field.description}
              </Label>
            )}
          </div>
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value as number ?? ''}
            onChange={(e) =>
              onChange(e.target.value === '' ? null : parseFloat(e.target.value))
            }
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )

      case 'currency':
        return (
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              type="number"
              value={value as number ?? ''}
              onChange={(e) =>
                onChange(e.target.value === '' ? null : parseFloat(e.target.value))
              }
              placeholder={field.placeholder || '0.00'}
              min={field.min || 0}
              step={field.step || 0.01}
              disabled={disabled || field.readOnly}
              className={cn('pl-10', error && 'border-red-500')}
            />
          </div>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={
              value
                ? new Date(value as string | number).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )

      case 'email':
        return (
          <Input
            type="email"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'email@example.com'}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )

      case 'phone':
        return (
          <Input
            type="tel"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || '(555) 123-4567'}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )

      case 'url':
        return (
          <Input
            type="url"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'https://example.com'}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )

      case 'location':
        // LocationPicker for structured city/state/country input
        // Value is expected to be the display string (e.g., "Austin, TX")
        // The parent form should also update locationCity, locationState, locationCountry fields
        return (
          <LocationPicker
            label=""
            value={{
              city: (value as string)?.split(',')[0]?.trim() || '',
              stateProvince: (value as string)?.split(',')[1]?.trim() || '',
              countryCode: 'US',
            }}
            onChange={(data) => {
              // Build display string from structured data
              const displayValue = data.city && data.stateProvince
                ? `${data.city}, ${data.stateProvince}`
                : data.city || ''
              onChange(displayValue)
            }}
            required={field.required}
            disabled={disabled || field.readOnly}
            showCountry={false}
          />
        )

      case 'skills':
        // Skills/tag input for array of strings
        return (
          <SkillsTagInput
            value={Array.isArray(value) ? value : []}
            onChange={onChange}
            placeholder={field.placeholder}
            error={!!error}
            disabled={disabled || field.readOnly}
          />
        )

      case 'radio':
        // Radio button group
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all',
                  value === option.value
                    ? 'border-gold-500 bg-gold-50'
                    : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50',
                  (disabled || field.readOnly) && 'cursor-not-allowed opacity-60'
                )}
              >
                <input
                  type="radio"
                  name={field.key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  disabled={disabled || field.readOnly}
                  className="w-4 h-4 text-gold-500 border-charcoal-300 focus:ring-gold-500"
                />
                <span className="text-sm text-charcoal-700">{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'text':
      default:
        return (
          <Input
            type="text"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )
    }
  }

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

  return (
    <div className="space-y-1">
      <Label htmlFor={field.key} className="text-sm font-medium text-charcoal-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {field.description && !error && (
        <p className="text-sm text-charcoal-500">{field.description}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
