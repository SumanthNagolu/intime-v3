'use client'

import * as React from 'react'
import { IdentitySection } from '../sections/IdentitySection'
import type { IdentitySectionData } from '@/lib/candidates/types'
import type { CreateCandidateFormData } from '@/stores/create-candidate-store'
import type { WizardStepComponentProps } from '@/configs/entities/types'
import { DEFAULT_PHONE } from '@/lib/candidates/types'

/**
 * IdentityStepWrapper - Bridges wizard props to IdentitySection
 *
 * Maps CreateCandidateFormData to IdentitySectionData format
 */
export function IdentityStepWrapper({
  formData,
  setFormData,
  errors = {},
}: WizardStepComponentProps<CreateCandidateFormData>) {
  // Ensure phone has valid structure (countryCode is required by PhoneInput)
  const safePhone = React.useMemo(() => {
    const phone = formData?.phone
    if (phone && typeof phone === 'object' && 'countryCode' in phone) {
      return phone
    }
    return DEFAULT_PHONE
  }, [formData?.phone])

  // Map formData to section data format
  const sectionData: IdentitySectionData = React.useMemo(() => ({
    firstName: formData?.firstName || '',
    lastName: formData?.lastName || '',
    email: formData?.email || '',
    phone: safePhone,
    mobile: { countryCode: 'US', number: '' }, // Default empty phone for mobile
    linkedinUrl: formData?.linkedinProfile || '',
    city: formData?.locationCity || '',
    state: formData?.locationState || '',
    country: formData?.locationCountry || 'United States',
    title: '', // Professional title not separate in wizard
    headline: formData?.professionalHeadline || '',
    professionalSummary: formData?.professionalSummary || '',
    currentCompany: '', // Not in wizard form
    yearsExperience: formData?.experienceYears ?? null,
  }), [formData, safePhone])

  // Map section onChange to setFormData
  const handleChange = React.useCallback((field: string, value: unknown) => {
    if (!setFormData) return

    // Map section field names back to formData field names
    const fieldMapping: Record<string, string> = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      phone: 'phone',
      linkedinUrl: 'linkedinProfile',
      city: 'locationCity',
      state: 'locationState',
      country: 'locationCountry',
      headline: 'professionalHeadline',
      professionalSummary: 'professionalSummary',
      yearsExperience: 'experienceYears',
    }

    const formField = fieldMapping[field] || field
    setFormData({ [formField]: value } as Partial<CreateCandidateFormData>)
  }, [setFormData])

  // Map section error field names
  const sectionErrors = React.useMemo(() => {
    const mapped: Record<string, string> = {}
    if (errors.firstName) mapped.firstName = errors.firstName
    if (errors.lastName) mapped.lastName = errors.lastName
    if (errors.email) mapped.email = errors.email
    if (errors.phone) mapped.phone = errors.phone
    if (errors.location) mapped.city = errors.location
    if (errors.linkedinProfile) mapped.linkedinUrl = errors.linkedinProfile
    if (errors.professionalHeadline) mapped.headline = errors.professionalHeadline
    if (errors.professionalSummary) mapped.professionalSummary = errors.professionalSummary
    if (errors.experienceYears) mapped.yearsExperience = errors.experienceYears
    return mapped
  }, [errors])

  return (
    <IdentitySection
      mode="create"
      data={sectionData}
      onChange={handleChange}
      errors={sectionErrors}
    />
  )
}
