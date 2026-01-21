'use client'

import * as React from 'react'
import { AuthorizationSection } from '../sections/AuthorizationSection'
import type { AuthorizationSectionData } from '@/lib/candidates/types'
import type { CreateCandidateFormData } from '@/stores/create-candidate-store'
import type { WizardStepComponentProps } from '@/configs/entities/types'

/**
 * AuthorizationStepWrapper - Bridges wizard props to AuthorizationSection
 *
 * Maps CreateCandidateFormData to AuthorizationSectionData format
 */
export function AuthorizationStepWrapper({
  formData,
  setFormData,
  errors = {},
}: WizardStepComponentProps<CreateCandidateFormData>) {
  // Map formData to section data format
  const sectionData: AuthorizationSectionData = React.useMemo(() => ({
    workAuthorization: null, // Not separate in wizard form
    visaStatus: formData?.visaStatus || 'us_citizen',
    visaExpiryDate: formData?.visaExpiryDate || null,
    requiresSponsorship: formData?.requiresSponsorship ?? false,
    currentSponsor: formData?.currentSponsor || null,
    isTransferable: formData?.isTransferable ?? false,
    clearanceLevel: null, // Not in wizard form
    availability: formData?.availability || '2_weeks',
    availableFrom: formData?.availableFrom || null,
    noticePeriod: null, // Not separate in wizard form
    noticePeriodDays: formData?.noticePeriodDays ?? null,
    willingToRelocate: formData?.willingToRelocate ?? false,
    relocationPreferences: formData?.relocationPreferences || null,
    isRemoteOk: formData?.isRemoteOk ?? false,
  }), [formData])

  // Map section onChange to setFormData
  const handleChange = React.useCallback((field: string, value: unknown) => {
    if (!setFormData) return

    // Direct mapping - field names match
    const fieldMapping: Record<string, keyof CreateCandidateFormData> = {
      visaStatus: 'visaStatus',
      visaExpiryDate: 'visaExpiryDate',
      requiresSponsorship: 'requiresSponsorship',
      currentSponsor: 'currentSponsor',
      isTransferable: 'isTransferable',
      availability: 'availability',
      availableFrom: 'availableFrom',
      noticePeriodDays: 'noticePeriodDays',
      willingToRelocate: 'willingToRelocate',
      relocationPreferences: 'relocationPreferences',
      isRemoteOk: 'isRemoteOk',
    }

    const formField = fieldMapping[field]
    if (formField) {
      setFormData({ [formField]: value } as Partial<CreateCandidateFormData>)
    }
  }, [setFormData])

  // Map section error field names
  const sectionErrors = React.useMemo(() => {
    const mapped: Record<string, string> = {}
    if (errors.visaStatus) mapped.visaStatus = errors.visaStatus
    if (errors.availability) mapped.availability = errors.availability
    if (errors.visaExpiryDate) mapped.visaExpiryDate = errors.visaExpiryDate
    return mapped
  }, [errors])

  return (
    <AuthorizationSection
      mode="create"
      data={sectionData}
      onChange={handleChange}
      errors={sectionErrors}
    />
  )
}
