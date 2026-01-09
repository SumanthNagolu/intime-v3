'use client'

import { FieldDefinition, WizardStepConfig } from '@/configs/entities/types'
import { FormFieldRenderer } from '@/components/pcf/form/FormFieldRenderer'
import { cn } from '@/lib/utils'

interface WizardStepProps<T> {
  step: WizardStepConfig<T>
  formData: Partial<T>
  setFormData: (data: Partial<T>) => void
  errors: Record<string, string>
  /** Custom components for fields with type='custom' and customComponentKey */
  customComponents?: Record<string, React.ComponentType<{
    formData: Partial<T>
    setFormData: (data: Partial<T>) => void
    errors: Record<string, string>
  }>>
}

export function WizardStep<T>({
  step,
  formData,
  setFormData,
  errors,
  customComponents,
}: WizardStepProps<T>) {
  // If step has a custom component, render it
  if (step.component) {
    const CustomComponent = step.component
    return <CustomComponent formData={formData} setFormData={setFormData} errors={errors} />
  }

  // Otherwise, render fields from step.fields
  if (!step.fields || step.fields.length === 0) {
    return (
      <div className="text-center py-12 text-charcoal-500">
        No fields configured for this step
      </div>
    )
  }

  // Check if any field should be visible based on dependsOn conditions
  const isFieldVisible = (field: FieldDefinition): boolean => {
    if (!field.dependsOn) return true
    const dependentValue = formData[field.dependsOn.field as keyof T]
    const operator = field.dependsOn.operator || 'eq'

    switch (operator) {
      case 'eq':
        return dependentValue === field.dependsOn.value
      case 'neq':
        return dependentValue !== field.dependsOn.value
      case 'in':
        return Array.isArray(field.dependsOn.value) && field.dependsOn.value.includes(dependentValue)
      default:
        return dependentValue === field.dependsOn.value
    }
  }

  // Filter visible fields
  const visibleFields = step.fields.filter(isFieldVisible)

  // Group fields by section if specified
  const fieldsBySection = visibleFields.reduce<Record<string, FieldDefinition[]>>(
    (acc, field) => {
      const section = field.section || 'default'
      if (!acc[section]) acc[section] = []
      acc[section].push(field)
      return acc
    },
    {}
  )

  const sections = Object.entries(fieldsBySection)

  // Helper to render a field (either custom or standard)
  const renderField = (field: FieldDefinition) => {
    // Check if this is a custom field type with a registered component
    if (field.type === 'custom' && field.customComponentKey && customComponents?.[field.customComponentKey]) {
      const CustomFieldComponent = customComponents[field.customComponentKey]
      return (
        <CustomFieldComponent
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />
      )
    }

    // Standard field rendering
    return (
      <FormFieldRenderer
        field={field}
        value={formData[field.key as keyof T]}
        onChange={(value) =>
          setFormData({ ...formData, [field.key]: value } as Partial<T>)
        }
        error={errors[field.key]}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Step Description */}
      {step.description && (
        <p className="text-charcoal-600 mb-6">{step.description}</p>
      )}

      {/* Fields */}
      {sections.map(([sectionName, fields]) => (
        <div key={sectionName} className="space-y-4">
          {sectionName !== 'default' && (
            <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider pt-4 border-t">
              {sectionName}
            </h3>
          )}
          <div
            className={cn(
              'grid gap-4',
              fields.some((f) => f.columns === 1 || f.type === 'custom')
                ? 'grid-cols-1'
                : 'grid-cols-1 md:grid-cols-2'
            )}
          >
            {fields.map((field) => (
              <div
                key={field.key}
                className={cn(
                  (field.columns === 1 || field.type === 'custom') && 'md:col-span-2'
                )}
              >
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
