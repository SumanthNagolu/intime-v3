'use client'

import { z } from 'zod'
import {
  Upload,
  User,
  Briefcase,
  Building2,
  GraduationCap,
  Award,
  Shield,
  DollarSign,
  FileText,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig, FieldDefinition } from '../types'

// Candidate intake form data type
export interface CandidateIntakeFormData {
  // Step 1: Source
  sourceType: 'manual' | 'resume' | 'linkedin'
  resumeFile?: File
  resumeStoragePath?: string
  resumeParsed?: boolean
  linkedinUrl?: string

  // Step 2: Basic Info
  firstName: string
  lastName: string
  email: string
  phone?: string
  linkedinProfile?: string

  // Location parts
  location: string
  locationCity?: string
  locationState?: string
  locationCountry?: string

  // Step 3: Professional (Profile)
  professionalHeadline?: string
  professionalSummary?: string
  experienceYears: number
  employmentTypes: string[]
  workModes: string[]

  // Step 4: Work History - handled by store array
  // workHistory: WorkHistoryEntry[] 

  // Step 5: Education - handled by store array
  // education: EducationEntry[]

  // Step 6: Skills
  skills: any[] // Store handles type, validation checks length

  // Step 7: Work Authorization
  visaStatus: 'us_citizen' | 'green_card' | 'h1b' | 'l1' | 'tn' | 'opt' | 'cpt' | 'ead' | 'other'
  visaExpiryDate?: string
  requiresSponsorship: boolean
  availability: 'immediate' | '2_weeks' | '30_days' | '60_days' | 'not_available'
  availableFrom?: string
  noticePeriodDays?: number
  willingToRelocate: boolean
  relocationPreferences?: string
  isRemoteOk: boolean

  // Step 8: Compensation
  rateType: 'hourly' | 'annual' | 'per_diem'
  currency: string
  minimumRate?: number
  desiredRate?: number
  isNegotiable: boolean
  compensationNotes?: string

  // Step 9: Source Tracking & Docs
  leadSource: string
  sourceDetails?: string
  referredBy?: string
  isOnHotlist: boolean
  hotlistNotes?: string
  internalNotes?: string
  tags: string[]
}

// Validation schemas per step
// Source selection step - csv redirects to bulk import dialog
export const candidateSourceSelectionSchema = z.object({
  sourceType: z.enum(['manual', 'resume', 'csv']),
})

// Legacy schema kept for backwards compatibility
export const candidateStep1Schema = z.object({
  sourceType: z.enum(['manual', 'resume', 'csv']),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
})

// PhoneInputValue schema - matches the PhoneInput component value type
const phoneInputValueSchema = z.object({
  countryCode: z.string(),
  number: z.string(),
}).optional()

export const candidateStep2Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: phoneInputValueSchema,
  // Validate city instead of combined location since form uses individual fields
  locationCity: z.string().min(1, 'City is required'),
})

export const candidateStep3Schema = z.object({
  professionalHeadline: z.string().max(200).optional(),
  professionalSummary: z.string().max(2000).optional(),
  experienceYears: z.number().min(0).max(50),
  employmentTypes: z.array(z.string()).min(1, 'Select at least one employment type'),
  // workModes optional
})

export const candidateStep4Schema = z.object({
  // specific validation handled by component/store mostly, but we can check store state if needed
  // For wizard validation, we can just pass true if the component handles its own validation blocks
}).passthrough()

export const candidateStep5Schema = z.object({
  // Education is optional
}).passthrough()

export const candidateStep6Schema = z.object({
  // Skills validation handled by store check mostly, but we can enforce min length here if we sync to form data
  // For now, relies on component validation
}).passthrough()

export const candidateStep7Schema = z.object({
  visaStatus: z.string().min(1, 'Visa status is required'),
  availability: z.string().min(1, 'Availability is required'),
  // other fields optional/conditional
})

export const candidateStep8Schema = z.object({
  rateType: z.string(),
  // Rates validation handled in component (min <= desired)
})

export const candidateStep9Schema = z.object({
  leadSource: z.string().min(1, 'Lead source is required'),
  // referredBy handled conditionally in component
})

// Full validation schema (loose for now as steps handle specifics)
export const candidateIntakeSchema = z.any()

// Step configurations
export const candidateIntakeSteps: WizardStepConfig<CandidateIntakeFormData>[] = [
  {
    id: 'source',
    number: 1,
    label: 'Source',
    description: 'How are you adding this candidate?',
    icon: Upload,
    fields: [], // Fields defined in component
    validation: candidateStep1Schema,
  },
  {
    id: 'basic',
    number: 2,
    label: 'Basic Info',
    description: 'Contact details & location',
    icon: User,
    fields: [],
    validation: candidateStep2Schema,
  },
  {
    id: 'professional',
    number: 3,
    label: 'Professional',
    description: 'Headline, summary & experience',
    icon: FileText,
    fields: [],
    validation: candidateStep3Schema,
  },
  {
    id: 'history',
    number: 4,
    label: 'Work History',
    description: 'Employment timeline',
    icon: Briefcase,
    fields: [],
    validation: candidateStep4Schema,
  },
  {
    id: 'education',
    number: 5,
    label: 'Education',
    description: 'Degrees & certifications',
    icon: GraduationCap,
    fields: [],
    validation: candidateStep5Schema,
  },
  {
    id: 'skills',
    number: 6,
    label: 'Skills',
    description: 'Technical skills & expertise',
    icon: Award,
    fields: [],
    validation: candidateStep6Schema,
  },
  {
    id: 'authorization',
    number: 7,
    label: 'Authorization',
    description: 'Visa status & availability',
    icon: Shield,
    fields: [],
    validation: candidateStep7Schema,
  },
  {
    id: 'compensation',
    number: 8,
    label: 'Compensation',
    description: 'Pay rates & preferences',
    icon: DollarSign,
    fields: [],
    validation: candidateStep8Schema,
  },
  {
    id: 'documents',
    number: 9,
    label: 'Documents',
    description: 'Source tracking & files',
    icon: FileText,
    fields: [],
    validation: candidateStep9Schema,
  },
]

// Full wizard configuration factory
export function createCandidateIntakeConfig(
  onSubmit: (formData: CandidateIntakeFormData) => Promise<unknown>,
  options?: {
    onSuccess?: (result: unknown) => void
    cancelRoute?: string
  }
): WizardConfig<CandidateIntakeFormData> {
  return {
    title: 'Add Candidate',
    description: 'Add a new candidate to your talent database',
    entityType: 'candidate',

    steps: candidateIntakeSteps,

    allowFreeNavigation: false,
    stepIndicatorStyle: 'icons',

    reviewStep: {
      title: 'Review & Submit',
      sections: [
        {
          label: 'Basic Information',
          fields: ['firstName', 'lastName', 'email', 'phone', 'location'],
          stepNumber: 2,
        },
        {
          label: 'Professional',
          fields: ['professionalHeadline', 'experienceYears'],
          stepNumber: 3,
        },
        {
          label: 'Work Authorization',
          fields: ['visaStatus', 'availability'],
          stepNumber: 7,
        },
        {
          label: 'Compensation',
          fields: ['rateType', 'desiredRate', 'minimumRate'],
          stepNumber: 8,
        },
        {
          label: 'Source',
          fields: ['leadSource', 'isOnHotlist'],
          stepNumber: 9,
        },
      ],
    },

    submitLabel: 'Add Candidate',
    saveDraftLabel: 'Save Draft',
    cancelRoute: options?.cancelRoute || '/employee/recruiting/candidates',

    storeName: 'candidate-intake-form',
    defaultFormData: {
      sourceType: 'manual',
      firstName: '',
      lastName: '',
      email: '',
      location: '',
      // Professional
      professionalHeadline: '',
      professionalSummary: '',
      skills: [],
      experienceYears: 0,
      employmentTypes: ['full_time'],
      workModes: ['on_site'],
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
    },

    onSubmit,
    onSuccess: options?.onSuccess,
  }
}

// Pre-built config (requires onSubmit to be set)
export const candidateIntakeWizardConfig: Omit<WizardConfig<CandidateIntakeFormData>, 'onSubmit'> = {
  title: 'Add Candidate',
  description: 'Add a new candidate to your talent database',
  entityType: 'candidate',

  steps: candidateIntakeSteps,

  allowFreeNavigation: false,
  stepIndicatorStyle: 'icons',

  reviewStep: {
    title: 'Review & Submit',
    sections: [
      {
        label: 'Basic Information',
        fields: ['firstName', 'lastName', 'email', 'phone'],
        stepNumber: 2,
      },
      {
        label: 'Professional',
        fields: ['professionalHeadline', 'experienceYears'],
        stepNumber: 3,
      },
      {
        label: 'Work Authorization',
        fields: ['visaStatus', 'availability', 'location'],
        stepNumber: 4,
      },
      {
        label: 'Source',
        fields: ['leadSource', 'isOnHotlist'],
        stepNumber: 5,
      },
    ],
  },

  submitLabel: 'Add Candidate',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/recruiting/candidates',

  storeName: 'candidate-intake-form',
  defaultFormData: {
    sourceType: 'manual',
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    // Professional
    professionalHeadline: '',
    professionalSummary: '',
    skills: [],
    experienceYears: 0,
    employmentTypes: ['full_time'],
    workModes: ['on_site'],
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
  },
}

