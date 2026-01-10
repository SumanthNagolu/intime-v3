'use client'

import {
  Upload,
  User,
  Briefcase,
  GraduationCap,
  Shield,
  FileText,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig } from '../types'
import { CreateCandidateFormData } from '@/stores/create-candidate-store'

// Step components - 6 step consolidated wizard
import { CandidateIntakeStep1Source } from '@/components/recruiting/candidates/intake/CandidateIntakeStep1Source'
import { CandidateIntakeStep2BasicInfo } from '@/components/recruiting/candidates/intake/CandidateIntakeStep2BasicInfo'
import { CandidateIntakeStep3Experience } from '@/components/recruiting/candidates/intake/CandidateIntakeStep3Experience'
import { CandidateIntakeStep4Qualifications } from '@/components/recruiting/candidates/intake/CandidateIntakeStep4Qualifications'
import { CandidateIntakeStep5EmploymentTerms } from '@/components/recruiting/candidates/intake/CandidateIntakeStep5EmploymentTerms'
import { CandidateIntakeStep6Documents } from '@/components/recruiting/candidates/intake/CandidateIntakeStep6Documents'

// Step configurations - 6-step consolidated Bullhorn/Ceipal-style intake wizard
export const candidateCreateSteps: WizardStepConfig<CreateCandidateFormData>[] = [
  {
    id: 'source',
    number: 1,
    label: 'Source',
    description: 'How are you adding this candidate?',
    icon: Upload,
    component: CandidateIntakeStep1Source,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.sourceType) {
        errors.push('Please select how you are adding this candidate.')
      }
      return errors
    },
  },
  {
    id: 'contact',
    number: 2,
    label: 'Contact Info',
    description: 'Identity & reachability',
    icon: User,
    component: CandidateIntakeStep2BasicInfo,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.firstName?.trim()) {
        errors.push('First name is required.')
      }
      if (!formData.lastName?.trim()) {
        errors.push('Last name is required.')
      }
      if (!formData.email?.trim()) {
        errors.push('Email address is required.')
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push('Please enter a valid email address.')
      }
      if (!formData.location?.trim()) {
        errors.push('Location is required.')
      }
      return errors
    },
  },
  {
    id: 'experience',
    number: 3,
    label: 'Experience',
    description: 'Professional profile & work history',
    icon: Briefcase,
    component: CandidateIntakeStep3Experience,
    validateFn: (formData) => {
      const errors: string[] = []
      if (formData.experienceYears === undefined || formData.experienceYears < 0) {
        errors.push('Please enter years of experience.')
      }
      if (!formData.employmentTypes || formData.employmentTypes.length === 0) {
        errors.push('Please select at least one employment type preference.')
      }
      if (!formData.workHistory || formData.workHistory.length === 0) {
        errors.push('Please add at least one work history entry.')
      } else {
        // Validate each entry
        formData.workHistory.forEach((entry, index) => {
          if (!entry.companyName?.trim()) {
            errors.push(`Work history ${index + 1}: Company name is required.`)
          }
          if (!entry.jobTitle?.trim()) {
            errors.push(`Work history ${index + 1}: Job title is required.`)
          }
          if (!entry.startDate) {
            errors.push(`Work history ${index + 1}: Start date is required.`)
          }
          if (!entry.isCurrent && !entry.endDate) {
            errors.push(`Work history ${index + 1}: End date is required (or mark as current).`)
          }
        })
      }
      return errors
    },
  },
  {
    id: 'qualifications',
    number: 4,
    label: 'Qualifications',
    description: 'Education, skills & certifications',
    icon: GraduationCap,
    component: CandidateIntakeStep4Qualifications,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.skills || formData.skills.length === 0) {
        errors.push('Please add at least one skill.')
      }
      return errors
    },
  },
  {
    id: 'employment',
    number: 5,
    label: 'Employment',
    description: 'Authorization & compensation',
    icon: Shield,
    component: CandidateIntakeStep5EmploymentTerms,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.visaStatus) {
        errors.push('Please select work authorization status.')
      }
      if (!formData.availability) {
        errors.push('Please select availability.')
      }
      if (formData.minimumRate && formData.desiredRate && formData.minimumRate > formData.desiredRate) {
        errors.push('Minimum rate cannot exceed desired rate.')
      }
      return errors
    },
  },
  {
    id: 'documents',
    number: 6,
    label: 'Documents',
    description: 'Source tracking & compliance',
    icon: FileText,
    component: CandidateIntakeStep6Documents,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.leadSource) {
        errors.push('Please select a lead source.')
      }
      if (formData.leadSource === 'referral' && !formData.referredBy?.trim()) {
        errors.push('Please enter the name of the referrer.')
      }
      return errors
    },
  },
]

// Full wizard configuration
export const candidateCreateWizardConfig: WizardConfig<CreateCandidateFormData> = {
  title: 'Add Candidate',
  description: 'Add a new candidate to your talent database',
  entityType: 'candidate',

  steps: candidateCreateSteps,

  allowFreeNavigation: true,
  stepIndicatorStyle: 'icons',

  reviewStep: {
    title: 'Review & Create',
    sections: [
      {
        label: 'Contact Information',
        fields: ['firstName', 'lastName', 'email', 'phone', 'location', 'linkedinProfile'],
        stepNumber: 2,
      },
      {
        label: 'Experience',
        fields: ['professionalHeadline', 'professionalSummary', 'experienceYears', 'employmentTypes', 'workModes', 'workHistory'],
        stepNumber: 3,
      },
      {
        label: 'Qualifications',
        fields: ['education', 'skills', 'primarySkills', 'certifications'],
        stepNumber: 4,
      },
      {
        label: 'Employment Terms',
        fields: ['visaStatus', 'visaExpiryDate', 'requiresSponsorship', 'availability', 'availableFrom', 'noticePeriodDays', 'willingToRelocate', 'relocationPreferences', 'isRemoteOk', 'rateType', 'minimumRate', 'desiredRate', 'currency', 'isNegotiable', 'compensationNotes'],
        stepNumber: 5,
      },
      {
        label: 'Documents & Tracking',
        fields: ['leadSource', 'sourceDetails', 'referredBy', 'complianceDocuments', 'isOnHotlist', 'hotlistNotes', 'tags', 'internalNotes'],
        stepNumber: 6,
      },
    ],
  },

  submitLabel: 'Add Candidate',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/recruiting/candidates',

  storeName: 'create-candidate-form',
  defaultFormData: {} as CreateCandidateFormData,

  onSubmit: async () => {},
  onSuccess: () => {},
}

// Factory function to create config with custom handlers
export function createCandidateCreateConfig(
  onSubmit: (formData: CreateCandidateFormData) => Promise<unknown>,
  options?: {
    onSuccess?: (result: unknown) => void
    cancelRoute?: string
    title?: string
  }
): WizardConfig<CreateCandidateFormData> {
  return {
    ...candidateCreateWizardConfig,
    title: options?.title || candidateCreateWizardConfig.title,
    cancelRoute: options?.cancelRoute || candidateCreateWizardConfig.cancelRoute,
    onSubmit,
    onSuccess: options?.onSuccess,
  }
}
