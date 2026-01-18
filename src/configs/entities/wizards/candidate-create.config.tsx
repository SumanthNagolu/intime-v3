'use client'

import {
  Upload,
  User,
  Briefcase,
  GraduationCap,
  Shield,
  FileText,
  Award,
  DollarSign,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig } from '../types'
import { CreateCandidateFormData } from '@/stores/create-candidate-store'

// Step components - 9 step consolidated wizard
import { CandidateIntakeStep1Source } from '@/components/recruiting/candidates/intake/CandidateIntakeStep1Source'
import { CandidateIntakeStep2BasicInfo } from '@/components/recruiting/candidates/intake/CandidateIntakeStep2BasicInfo'
import { CandidateIntakeStep3Professional } from '@/components/recruiting/candidates/intake/CandidateIntakeStep3Professional'
import { CandidateIntakeStep4WorkHistory } from '@/components/recruiting/candidates/intake/CandidateIntakeStep4WorkHistory'
import { CandidateIntakeStep5Education } from '@/components/recruiting/candidates/intake/CandidateIntakeStep5Education'
import { CandidateIntakeStep6Skills } from '@/components/recruiting/candidates/intake/CandidateIntakeStep6Skills'
import { CandidateIntakeStep7Authorization } from '@/components/recruiting/candidates/intake/CandidateIntakeStep7Authorization'
import { CandidateIntakeStep8Compensation } from '@/components/recruiting/candidates/intake/CandidateIntakeStep8Compensation'
import { CandidateIntakeStep9Documents } from '@/components/recruiting/candidates/intake/CandidateIntakeStep9Documents'

import {
  candidateStep1Schema,
  candidateStep2Schema,
  candidateStep3Schema,
  candidateStep4Schema,
  candidateStep5Schema,
  candidateStep6Schema,
  candidateStep7Schema,
  candidateStep8Schema,
  candidateStep9Schema,
} from './candidate-intake.config'

// Step configurations - 9-step consolidated Bullhorn/Ceipal-style intake wizard
export const candidateCreateSteps: WizardStepConfig<CreateCandidateFormData>[] = [
  {
    id: 'source',
    number: 1,
    label: 'Source',
    description: 'How are you adding this candidate?',
    icon: Upload,
    component: CandidateIntakeStep1Source,
    fields: [],
    validation: candidateStep1Schema,
  },
  {
    id: 'basic',
    number: 2,
    label: 'Basic Info',
    description: 'Contact details & location',
    icon: User,
    component: CandidateIntakeStep2BasicInfo,
    fields: [],
    validation: candidateStep2Schema,
  },
  {
    id: 'professional',
    number: 3,
    label: 'Professional',
    description: 'Headline, summary & experience',
    icon: Briefcase,
    component: CandidateIntakeStep3Professional,
    fields: [],
    validation: candidateStep3Schema,
  },
  {
    id: 'history',
    number: 4,
    label: 'Work History',
    description: 'Employment timeline',
    icon: FileText,
    component: CandidateIntakeStep4WorkHistory,
    fields: [],
    validation: candidateStep4Schema,
  },
  {
    id: 'education',
    number: 5,
    label: 'Education',
    description: 'Degrees & certifications',
    icon: GraduationCap,
    component: CandidateIntakeStep5Education,
    fields: [],
    validation: candidateStep5Schema,
  },
  {
    id: 'skills',
    number: 6,
    label: 'Skills',
    description: 'Technical skills & expertise',
    icon: Award,
    component: CandidateIntakeStep6Skills,
    fields: [],
    validation: candidateStep6Schema,
  },
  {
    id: 'authorization',
    number: 7,
    label: 'Authorization',
    description: 'Visa status & availability',
    icon: Shield,
    component: CandidateIntakeStep7Authorization,
    fields: [],
    validation: candidateStep7Schema,
  },
  {
    id: 'compensation',
    number: 8,
    label: 'Compensation',
    description: 'Pay rates & preferences',
    icon: DollarSign,
    component: CandidateIntakeStep8Compensation,
    fields: [],
    validation: candidateStep8Schema,
  },
  {
    id: 'documents',
    number: 9,
    label: 'Documents',
    description: 'Source tracking & files',
    icon: FileText,
    component: CandidateIntakeStep9Documents,
    fields: [],
    validation: candidateStep9Schema,
  },
]

// Full wizard configuration
export const candidateCreateWizardConfig: WizardConfig<CreateCandidateFormData> = {
  title: 'Add Candidate',
  description: 'Add a new candidate to your talent database',
  entityType: 'candidate',

  steps: candidateCreateSteps,

  allowFreeNavigation: false,
  stepIndicatorStyle: 'icons',

  reviewStep: {
    title: 'Review & Create',
    sections: [
      {
        label: 'Source',
        fields: ['sourceType', 'resumeFileName', 'resumeFileSize'],
        stepNumber: 1,
      },
      {
        label: 'Profile Details',
        fields: ['firstName', 'lastName', 'email', 'phone', 'linkedinProfile', 'location', 'professionalHeadline'],
        stepNumber: 2,
      },
      {
        label: 'Professional Experience',
        fields: ['experienceYears', 'employmentTypes', 'workModes', 'professionalSummary', 'workHistory'],
        stepNumber: 3,
      },
      {
        label: 'Qualifications',
        fields: ['skills', 'certifications', 'education'],
        stepNumber: 6,
      },
      {
        label: 'Work Authorization',
        fields: ['visaStatus', 'visaExpiryDate', 'requiresSponsorship', 'currentSponsor', 'isTransferable'],
        stepNumber: 7,
      },
      {
        label: 'Availability & Preferences',
        fields: ['availability', 'availableFrom', 'noticePeriodDays', 'willingToRelocate', 'relocationPreferences', 'isRemoteOk'],
        stepNumber: 7,
      },
      {
        label: 'Compensation',
        fields: ['rateType', 'currency', 'minimumRate', 'desiredRate', 'isNegotiable', 'compensationNotes'],
        stepNumber: 8,
      },
      {
        label: 'Source & Tracking',
        fields: ['leadSource', 'sourceDetails', 'referredBy', 'campaignId', 'isOnHotlist', 'hotlistNotes', 'tags'],
        stepNumber: 9,
      },
      {
        label: 'Documents',
        fields: ['complianceDocuments', 'internalNotes'],
        stepNumber: 9,
      },
    ],
  },

  submitLabel: 'Add Candidate',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/recruiting/candidates',

  storeName: 'create-candidate-form',
  defaultFormData: {
    sourceType: 'manual',
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    phone: { countryCode: 'US', number: '' },
    // Professional
    professionalHeadline: '',
    professionalSummary: '',
    skills: [],
    experienceYears: 0,
    employmentTypes: ['full_time'],
    workModes: ['on_site'],
    // Lists
    workHistory: [],
    education: [],
    primarySkills: [],
    certifications: [],
    // Auth
    visaStatus: 'us_citizen',
    requiresSponsorship: false,
    availability: '2_weeks',
    willingToRelocate: false,
    isRemoteOk: false,
    // Compensation
    rateType: 'hourly',
    currency: 'USD',
    isNegotiable: true,
    // Docs
    leadSource: 'linkedin',
    isOnHotlist: false,
    tags: [],
    complianceDocuments: [],
  } as CreateCandidateFormData,

  onSubmit: async () => { },
  onSuccess: () => { },
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
