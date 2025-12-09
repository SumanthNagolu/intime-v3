'use client'

import { DollarSign } from 'lucide-react'
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
import { FieldDefinition } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

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
