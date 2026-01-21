'use client'

import * as React from 'react'
import { CompensationSection } from '../sections/CompensationSection'
import type { CompensationSectionData } from '@/lib/candidates/types'
import type { CreateCandidateFormData } from '@/stores/create-candidate-store'
import type { WizardStepComponentProps } from '@/configs/entities/types'

/**
 * CompensationStepWrapper - Bridges wizard props to CompensationSection
 *
 * Maps CreateCandidateFormData to CompensationSectionData format
 */
export function CompensationStepWrapper({
  formData,
  setFormData,
  errors = {},
}: WizardStepComponentProps<CreateCandidateFormData>) {
  // Map formData to section data format
  const sectionData: CompensationSectionData = React.useMemo(() => ({
    rateType: formData?.rateType || 'hourly',
    desiredRate: formData?.desiredRate ?? null,
    minimumRate: formData?.minimumRate ?? null,
    desiredSalary: null, // Not separate in wizard form
    rateCurrency: formData?.currency || 'USD',
    isNegotiable: formData?.isNegotiable ?? true,
    compensationNotes: formData?.compensationNotes || null,
    employmentTypes: formData?.employmentTypes || ['full_time'],
    workModes: formData?.workModes || ['on_site'],
  }), [formData])

  // Map section onChange to setFormData
  const handleChange = React.useCallback((field: string, value: unknown) => {
    if (!setFormData) return

    // Field mapping - most match directly
    const fieldMapping: Record<string, keyof CreateCandidateFormData> = {
      rateType: 'rateType',
      desiredRate: 'desiredRate',
      minimumRate: 'minimumRate',
      rateCurrency: 'currency',
      isNegotiable: 'isNegotiable',
      compensationNotes: 'compensationNotes',
      employmentTypes: 'employmentTypes',
      workModes: 'workModes',
    }

    const formField = fieldMapping[field]
    if (formField) {
      setFormData({ [formField]: value } as Partial<CreateCandidateFormData>)
    }
  }, [setFormData])

  // Map section error field names
  const sectionErrors = React.useMemo(() => {
    const mapped: Record<string, string> = {}
    if (errors.rateType) mapped.rateType = errors.rateType
    if (errors.desiredRate) mapped.desiredRate = errors.desiredRate
    if (errors.minimumRate) mapped.minimumRate = errors.minimumRate
    if (errors.currency) mapped.rateCurrency = errors.currency
    return mapped
  }, [errors])

  return (
    <CompensationSection
      mode="create"
      data={sectionData}
      onChange={handleChange}
      errors={sectionErrors}
    />
  )
}
