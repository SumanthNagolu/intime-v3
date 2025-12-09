'use client'

import { useState, useCallback, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormConfig, FieldDefinition } from '@/configs/entities/types'
import { FormSection } from './FormSection'
import { FormActions } from './FormActions'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface EntityFormProps<T> {
  config: FormConfig<T>
  initialData?: Partial<T>
  mode?: 'create' | 'edit'
  onSuccess?: (result: unknown) => void
  onCancel?: () => void
  className?: string
}

export function EntityForm<T extends Record<string, unknown>>({
  config,
  initialData,
  mode = 'create',
  onSuccess,
  onCancel,
  className,
}: EntityFormProps<T>) {
  // Form state
  const [formData, setFormData] = useState<Partial<T>>(
    initialData || config.defaultValues || {}
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Track dirty state
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData || config.defaultValues || {})
    setIsDirty(hasChanges)
  }, [formData, initialData, config.defaultValues])

  // Handle field change
  const handleChange = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))

    // Clear field error on change
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }, [errors])

  // Collect all fields from sections
  const allFields: FieldDefinition[] = config.sections
    ? config.sections.flatMap((s) => s.fields)
    : config.fields || []

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    // Zod schema validation
    if (config.validation) {
      const result = config.validation.safeParse(formData)
      if (!result.success) {
        result.error.errors.forEach((err) => {
          const path = err.path.join('.')
          newErrors[path] = err.message
        })
      }
    }

    // Required field validation
    allFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.key as keyof T]
        if (value === null || value === undefined || value === '') {
          newErrors[field.key] = `${field.label} is required`
        }
        if (Array.isArray(value) && value.length === 0) {
          newErrors[field.key] = `${field.label} is required`
        }
      }
    })

    // Custom validation function
    if (config.validateFn) {
      const customErrors = config.validateFn(formData as T)
      Object.entries(customErrors).forEach(([key, message]) => {
        newErrors[key] = message
      })
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0]
      toast({
        title: 'Validation Error',
        description: firstError,
        variant: 'error',
      })
      return false
    }

    return true
  }, [formData, config.validation, config.validateFn, allFields])

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const result = await config.onSubmit(formData as T)

      toast({
        title: 'Success',
        description: config.successMessage || (mode === 'create' ? 'Created successfully' : 'Changes saved'),
      })

      onSuccess?.(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      toast({
        title: 'Error',
        description: message,
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (isDirty && !confirm('Discard unsaved changes?')) {
      return
    }
    onCancel?.()
  }

  // Handle delete
  const handleDelete = async () => {
    if (!config.onDelete) return
    if (!confirm(`Are you sure you want to delete this ${config.entityName}?`)) return

    setIsSubmitting(true)
    try {
      await config.onDelete(formData as T)
      toast({
        title: 'Deleted',
        description: `${config.entityName} has been deleted`,
      })
      onSuccess?.(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed'
      toast({
        title: 'Error',
        description: message,
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  // Render as card or bare form
  const formContent = (
    <>
      {/* Validation Error Summary */}
      {hasErrors && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="mt-2 list-disc list-inside text-sm text-red-600">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-6">
        {config.sections ? (
          // Section-based layout
          config.sections.map((section) => (
            <FormSection
              key={section.id || section.title || 'default'}
              title={section.title}
              description={section.description}
              fields={section.fields}
              formData={formData}
              onChange={handleChange}
              errors={errors}
              columns={section.columns || config.defaultColumns || 2}
              collapsible={section.collapsible}
              defaultCollapsed={section.defaultCollapsed}
              disabled={isSubmitting}
            />
          ))
        ) : (
          // Flat field layout
          <FormSection
            fields={config.fields || []}
            formData={formData}
            onChange={handleChange}
            errors={errors}
            columns={config.defaultColumns || 2}
            disabled={isSubmitting}
          />
        )}
      </div>

      {/* Actions */}
      {!config.hideActions && (
        <FormActions
          mode={mode}
          isSubmitting={isSubmitting}
          isDirty={isDirty}
          hasErrors={hasErrors}
          submitLabel={config.submitLabel}
          cancelLabel={config.cancelLabel}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDelete={config.onDelete ? handleDelete : undefined}
          showDelete={config.showDelete}
          position={config.actionsPosition}
        />
      )}
    </>
  )

  // Wrap in card if configured
  if (config.variant === 'card') {
    return (
      <Card className={cn('bg-white', className)}>
        {(config.title || config.description) && (
          <CardHeader>
            {config.title && <CardTitle>{config.title}</CardTitle>}
            {config.description && (
              <CardDescription>{config.description}</CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent>{formContent}</CardContent>
      </Card>
    )
  }

  // Bare form (for dialogs, inline panels)
  return <div className={className}>{formContent}</div>
}
