'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { FieldDefinition } from '@/configs/entities/types'
import { FormFieldRenderer } from './FormFieldRenderer'
import { cn } from '@/lib/utils'

interface FormSectionProps<T> {
  title?: string
  description?: string
  fields: FieldDefinition[]
  formData: T
  onChange: (key: string, value: unknown) => void
  errors: Record<string, string>
  columns?: 1 | 2 | 3
  collapsible?: boolean
  defaultCollapsed?: boolean
  disabled?: boolean
}

export function FormSection<T extends Record<string, unknown>>({
  title,
  description,
  fields,
  formData,
  onChange,
  errors,
  columns = 2,
  collapsible = false,
  defaultCollapsed = false,
  disabled = false,
}: FormSectionProps<T>) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  // Filter visible fields based on conditional visibility
  const visibleFields = fields.filter((field) => {
    if (!field.visibleWhen) return true
    return field.visibleWhen(formData)
  })

  if (visibleFields.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Section Header */}
      {title && (
        <div
          className={cn(
            'flex items-center justify-between border-b border-charcoal-100 pb-2',
            collapsible && 'cursor-pointer hover:text-charcoal-700'
          )}
          onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
          role={collapsible ? 'button' : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onKeyDown={(e) => {
            if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              setIsCollapsed(!isCollapsed)
            }
          }}
        >
          <div>
            <h3 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wider">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-charcoal-500 mt-0.5">{description}</p>
            )}
          </div>
          {collapsible && (
            <ChevronDown
              className={cn(
                'w-5 h-5 text-charcoal-400 transition-transform',
                isCollapsed && '-rotate-90'
              )}
            />
          )}
        </div>
      )}

      {/* Fields Grid */}
      {!isCollapsed && (
        <div
          className={cn(
            'grid gap-4',
            columns === 1 && 'grid-cols-1',
            columns === 2 && 'grid-cols-1 md:grid-cols-2',
            columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {visibleFields.map((field) => {
            // Handle field spanning
            const fieldSpan =
              field.columns === 1
                ? 'col-span-1'
                : field.columns === 2
                  ? 'md:col-span-2'
                  : field.columns === 3
                    ? 'md:col-span-2 lg:col-span-3'
                    : ''

            return (
              <div key={field.key} className={fieldSpan}>
                <FormFieldRenderer
                  field={field}
                  value={formData[field.key as keyof T]}
                  onChange={(value) => onChange(field.key, value)}
                  error={errors[field.key]}
                  disabled={disabled || field.readOnly}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
