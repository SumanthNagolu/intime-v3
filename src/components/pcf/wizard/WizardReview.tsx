'use client'

import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldDefinition } from '@/configs/entities/types'
import { formatDisplayValue } from '@/lib/pcf/field-renderer'

interface ReviewSection<T> {
  label: string
  fields: (keyof T)[]
  stepNumber?: number // For "Edit" link
}

interface WizardReviewProps<T> {
  title: string
  sections: ReviewSection<T>[]
  formData: T
  fieldDefinitions: FieldDefinition[]
  onEditStep: (step: number) => void
}

export function WizardReview<T>({
  title,
  sections,
  formData,
  fieldDefinitions,
  onEditStep,
}: WizardReviewProps<T>) {
  const getFieldDefinition = (key: keyof T) =>
    fieldDefinitions.find((f) => f.key === String(key))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-charcoal-900">
        {title}
      </h2>
      <p className="text-charcoal-600">
        Please review the information below before submitting.
      </p>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.label} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{section.label}</CardTitle>
              {section.stepNumber && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditStep(section.stepNumber!)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((fieldKey) => {
                  const fieldDef = getFieldDefinition(fieldKey)
                  const value = formData[fieldKey]
                  const displayValue = fieldDef
                    ? formatDisplayValue(value, fieldDef)
                    : String(value ?? '—')

                  return (
                    <div key={String(fieldKey)} className="space-y-1">
                      <dt className="text-sm text-charcoal-500">
                        {fieldDef?.label || String(fieldKey)}
                      </dt>
                      <dd className="text-sm font-medium text-charcoal-900">
                        {displayValue}
                      </dd>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
