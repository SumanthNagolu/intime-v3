'use client'

import {
  Upload,
  User,
  Briefcase,
  Shield,
  FileText,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig } from '../types'
import { CreateCandidateFormData } from '@/stores/create-candidate-store'

// Step components
import { CandidateIntakeStep1Source } from '@/components/recruiting/candidates/intake/CandidateIntakeStep1Source'
import { CandidateIntakeStep2BasicInfo } from '@/components/recruiting/candidates/intake/CandidateIntakeStep2BasicInfo'
import { CandidateIntakeStep3Professional } from '@/components/recruiting/candidates/intake/CandidateIntakeStep3Professional'
import { CandidateIntakeStep4Authorization } from '@/components/recruiting/candidates/intake/CandidateIntakeStep4Authorization'
import { CandidateIntakeStep5SourceTracking } from '@/components/recruiting/candidates/intake/CandidateIntakeStep5SourceTracking'

// Step configurations
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
    id: 'basic',
    number: 2,
    label: 'Basic Info',
    description: 'Enter basic contact information',
    icon: User,
    component: CandidateIntakeStep2BasicInfo,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.firstName) {
        errors.push('Please enter first name.')
      }
      if (!formData.lastName) {
        errors.push('Please enter last name.')
      }
      if (!formData.email) {
        errors.push('Please enter email address.')
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push('Please enter a valid email address.')
      }
      return errors
    },
  },
  {
    id: 'professional',
    number: 3,
    label: 'Professional',
    description: 'Add professional details and skills',
    icon: Briefcase,
    component: CandidateIntakeStep3Professional,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.skills || formData.skills.length === 0) {
        errors.push('Please add at least one skill.')
      }
      return errors
    },
  },
  {
    id: 'authorization',
    number: 4,
    label: 'Authorization',
    description: 'Work authorization and availability',
    icon: Shield,
    component: CandidateIntakeStep4Authorization,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.location) {
        errors.push('Please select a location.')
      }
      return errors
    },
  },
  {
    id: 'tracking',
    number: 5,
    label: 'Source Tracking',
    description: 'Source information and notes',
    icon: FileText,
    component: CandidateIntakeStep5SourceTracking,
    validateFn: () => {
      // No required validations for this step
      return []
    },
  },
]

// Full wizard configuration
export const candidateCreateWizardConfig: WizardConfig<CreateCandidateFormData> = {
  title: 'Add Candidate',
  description: 'Add a new candidate to your talent database',
  entityType: 'candidate',

  steps: candidateCreateSteps,

  allowFreeNavigation: true, // Allow jumping between steps
  stepIndicatorStyle: 'icons',

  reviewStep: {
    title: 'Review & Create',
    sections: [
      {
        label: 'Basic Information',
        fields: ['firstName', 'lastName', 'email', 'phone', 'linkedinProfile'],
        stepNumber: 2,
      },
      {
        label: 'Professional',
        fields: ['professionalHeadline', 'skills', 'experienceYears'],
        stepNumber: 3,
      },
      {
        label: 'Work Authorization',
        fields: ['visaStatus', 'availability', 'location', 'isRemoteOk', 'willingToRelocate'],
        stepNumber: 4,
      },
      {
        label: 'Source & Notes',
        fields: ['leadSource', 'sourceDetails', 'isOnHotlist', 'hotlistNotes'],
        stepNumber: 5,
      },
    ],
  },

  submitLabel: 'Add Candidate',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/recruiting/candidates',

  storeName: 'create-candidate-form',
  defaultFormData: {} as CreateCandidateFormData,

  // These will be overridden in the page component
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
