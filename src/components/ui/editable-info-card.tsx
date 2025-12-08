'use client'

import * as React from 'react'
import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Pencil, X, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'textarea'
  | 'checkbox'

export interface SelectOption {
  value: string
  label: string
}

export interface FieldDefinition {
  key: string
  label: string
  type: FieldType
  options?: SelectOption[]
  required?: boolean
  placeholder?: string
  description?: string
  readOnly?: boolean
  // For formatting display values
  formatValue?: (value: unknown) => string
  // For currency fields
  currencySymbol?: string
  // For number fields
  min?: number
  max?: number
  step?: number
}

export interface EditableInfoCardProps {
  title: string
  description?: string
  fields: FieldDefinition[]
  data: Record<string, unknown>
  onSave: (data: Record<string, unknown>) => Promise<void>
  editable?: boolean
  columns?: 1 | 2 | 3
  className?: string
  headerActions?: React.ReactNode
}

function formatDisplayValue(value: unknown, field: FieldDefinition): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  // Use custom formatter if provided
  if (field.formatValue) {
    return field.formatValue(value)
  }

  switch (field.type) {
    case 'currency':
      const num = typeof value === 'number' ? value : parseFloat(String(value))
      if (isNaN(num)) return '—'
      return `${field.currencySymbol || '$'}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    case 'date':
      try {
        const date = new Date(String(value))
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      } catch {
        return String(value)
      }

    case 'checkbox':
      return value ? 'Yes' : 'No'

    case 'select':
      const option = field.options?.find(opt => opt.value === value)
      return option?.label || String(value)

    case 'phone':
      // Basic phone formatting
      const phone = String(value).replace(/\D/g, '')
      if (phone.length === 10) {
        return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
      }
      return String(value)

    case 'url':
      return String(value).replace(/^https?:\/\//, '')

    default:
      return String(value)
  }
}

function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldDefinition
  value: unknown
  onChange: (value: unknown) => void
  error?: string
}) {
  const stringValue = value === null || value === undefined ? '' : String(value)

  switch (field.type) {
    case 'select':
      return (
        <Select
          value={stringValue}
          onValueChange={onChange}
          disabled={field.readOnly}
        >
          <SelectTrigger className={cn(error && 'border-error-500')}>
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
      return (
        <Textarea
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={field.readOnly}
          className={cn('min-h-[80px]', error && 'border-error-500')}
        />
      )

    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            id={field.key}
            checked={Boolean(value)}
            onCheckedChange={onChange}
            disabled={field.readOnly}
          />
          {field.description && (
            <Label htmlFor={field.key} className="text-sm text-charcoal-500">
              {field.description}
            </Label>
          )}
        </div>
      )

    case 'number':
    case 'currency':
      return (
        <Input
          type="number"
          value={stringValue}
          onChange={(e) => {
            const val = e.target.value === '' ? null : parseFloat(e.target.value)
            onChange(val)
          }}
          placeholder={field.placeholder}
          disabled={field.readOnly}
          min={field.min}
          max={field.max}
          step={field.step || (field.type === 'currency' ? 0.01 : 1)}
          error={!!error}
          leftIcon={field.type === 'currency' ? <span className="text-charcoal-400">{field.currencySymbol || '$'}</span> : undefined}
        />
      )

    case 'date':
      return (
        <Input
          type="date"
          value={stringValue ? new Date(stringValue).toISOString().split('T')[0] : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={field.readOnly}
          error={!!error}
        />
      )

    case 'email':
      return (
        <Input
          type="email"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'email@example.com'}
          disabled={field.readOnly}
          error={!!error}
        />
      )

    case 'phone':
      return (
        <Input
          type="tel"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || '(555) 123-4567'}
          disabled={field.readOnly}
          error={!!error}
        />
      )

    case 'url':
      return (
        <Input
          type="url"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'https://example.com'}
          disabled={field.readOnly}
          error={!!error}
        />
      )

    default:
      return (
        <Input
          type="text"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={field.readOnly}
          error={!!error}
        />
      )
  }
}

export function EditableInfoCard({
  title,
  description,
  fields,
  data,
  onSave,
  editable = true,
  columns = 2,
  className,
  headerActions,
}: EditableInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const startEditing = useCallback(() => {
    // Initialize edit data with current values
    const initialData: Record<string, unknown> = {}
    fields.forEach((field) => {
      initialData[field.key] = data[field.key]
    })
    setEditData(initialData)
    setErrors({})
    setIsEditing(true)
  }, [fields, data])

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setEditData({})
    setErrors({})
  }, [])

  const validateFields = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (field.required) {
        const value = editData[field.key]
        if (value === null || value === undefined || value === '') {
          newErrors[field.key] = `${field.label} is required`
        }
      }

      // Type-specific validation
      if (editData[field.key]) {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(String(editData[field.key]))) {
              newErrors[field.key] = 'Invalid email address'
            }
            break
          case 'url':
            try {
              new URL(String(editData[field.key]))
            } catch {
              newErrors[field.key] = 'Invalid URL'
            }
            break
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [fields, editData])

  const handleSave = useCallback(async () => {
    if (!validateFields()) return

    setIsSaving(true)
    try {
      await onSave(editData)
      setIsEditing(false)
      setEditData({})
    } catch (error) {
      console.error('Failed to save:', error)
      // Could add toast notification here
    } finally {
      setIsSaving(false)
    }
  }, [editData, onSave, validateFields])

  const updateField = useCallback((key: string, value: unknown) => {
    setEditData((prev) => ({ ...prev, [key]: value }))
    // Clear error when field is updated
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }, [errors])

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-charcoal-500 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          {editable && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={startEditing}
              className="text-charcoal-500 hover:text-charcoal-900"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Save
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('grid gap-4', gridCols[columns])}>
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label className="text-sm text-charcoal-500">
                {field.label}
                {field.required && isEditing && (
                  <span className="text-error-500 ml-0.5">*</span>
                )}
              </Label>
              {isEditing ? (
                <div>
                  <FieldInput
                    field={field}
                    value={editData[field.key]}
                    onChange={(value) => updateField(field.key, value)}
                    error={errors[field.key]}
                  />
                  {errors[field.key] && (
                    <p className="text-xs text-error-500 mt-1">{errors[field.key]}</p>
                  )}
                </div>
              ) : (
                <p className="text-charcoal-900 font-medium">
                  {formatDisplayValue(data[field.key], field)}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
