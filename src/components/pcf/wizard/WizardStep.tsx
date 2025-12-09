'use client'

import { FieldDefinition, WizardStepConfig } from '@/configs/entities/types'
import { FormFieldRenderer } from '@/components/pcf/form/FormFieldRenderer'
import { cn } from '@/lib/utils'

interface WizardStepProps<T> {
  step: WizardStepConfig<T>
  formData: Partial<T>
  setFormData: (data: Partial<T>) => void
  errors: Record<string, string>
}

export function WizardStep<T extends Record<string, unknown>>({
  step,
  formData,
  setFormData,
  errors,
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

  // Group fields by section if specified
  const fieldsBySection = step.fields.reduce<Record<string, FieldDefinition[]>>(
    (acc, field) => {
      const section = field.section || 'default'
      if (!acc[section]) acc[section] = []
      acc[section].push(field)
      return acc
    },
    {}
  )

  const sections = Object.entries(fieldsBySection)

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
              fields.some((f) => f.columns === 1)
                ? 'grid-cols-1'
                : 'grid-cols-1 md:grid-cols-2'
            )}
          >
            {fields.map((field) => (
              <div
                key={field.key}
                className={cn(field.columns === 1 && 'md:col-span-2')}
              >
                <FormFieldRenderer
                  field={field}
                  value={formData[field.key as keyof T]}
                  onChange={(value) =>
                    setFormData({ ...formData, [field.key]: value } as Partial<T>)
                  }
                  error={errors[field.key]}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
