'use client'

import { z } from 'zod'
import {
  Upload,
  User,
  Briefcase,
  Shield,
  FileText,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig, FieldDefinition } from '../types'

// Candidate intake form data type
export interface CandidateIntakeFormData {
  // Step 1: Source
  sourceType: 'manual' | 'resume' | 'linkedin'
  resumeFile?: File
  linkedinUrl?: string

  // Step 2: Basic Info
  firstName: string
  lastName: string
  email: string
  phone?: string
  linkedinProfile?: string

  // Step 3: Professional
  professionalHeadline?: string
  professionalSummary?: string
  skills: string[]
  experienceYears: number

  // Step 4: Work Authorization
  visaStatus: 'us_citizen' | 'green_card' | 'h1b' | 'l1' | 'tn' | 'opt' | 'cpt' | 'ead' | 'other'
  availability: 'immediate' | '2_weeks' | '30_days' | 'not_available'
  location: string
  willingToRelocate: boolean
  isRemoteOk: boolean
  minimumHourlyRate?: number
  desiredHourlyRate?: number

  // Step 5: Source Tracking
  leadSource: 'linkedin' | 'indeed' | 'dice' | 'monster' | 'referral' | 'direct' | 'agency' | 'job_board' | 'other'
  sourceDetails?: string
  isOnHotlist: boolean
  hotlistNotes?: string
}

// Validation schemas per step
export const candidateStep1Schema = z.object({
  sourceType: z.enum(['manual', 'resume', 'linkedin']),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
})

export const candidateStep2Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  linkedinProfile: z.string().url().optional().or(z.literal('')),
})

export const candidateStep3Schema = z.object({
  professionalHeadline: z.string().max(200).optional(),
  professionalSummary: z.string().max(2000).optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experienceYears: z.number().min(0).max(50),
})

export const candidateStep4Schema = z.object({
  visaStatus: z.enum(['us_citizen', 'green_card', 'h1b', 'l1', 'tn', 'opt', 'cpt', 'ead', 'other']),
  availability: z.enum(['immediate', '2_weeks', '30_days', 'not_available']),
  location: z.string().min(1, 'Location is required'),
  willingToRelocate: z.boolean(),
  isRemoteOk: z.boolean(),
  minimumHourlyRate: z.number().min(0).optional(),
  desiredHourlyRate: z.number().min(0).optional(),
})

export const candidateStep5Schema = z.object({
  leadSource: z.enum(['linkedin', 'indeed', 'dice', 'monster', 'referral', 'direct', 'agency', 'job_board', 'other']),
  sourceDetails: z.string().max(500).optional(),
  isOnHotlist: z.boolean(),
  hotlistNotes: z.string().max(500).optional(),
})

// Full validation schema
export const candidateIntakeSchema = candidateStep1Schema
  .merge(candidateStep2Schema)
  .merge(candidateStep3Schema)
  .merge(candidateStep4Schema)
  .merge(candidateStep5Schema)

// Step 1: Source Selection Fields
const step1Fields: FieldDefinition[] = [
  {
    key: 'sourceType',
    label: 'How are you adding this candidate?',
    type: 'radio',
    required: true,
    options: [
      { value: 'manual', label: 'Manual Entry - Enter details manually' },
      { value: 'resume', label: 'Upload Resume - Parse from resume (coming soon)' },
      { value: 'linkedin', label: 'LinkedIn Import - Import from URL (coming soon)' },
    ],
  },
  {
    key: 'linkedinUrl',
    label: 'LinkedIn URL',
    type: 'url',
    placeholder: 'https://linkedin.com/in/username',
    dependsOn: { field: 'sourceType', value: 'linkedin' },
  },
]

// Step 2: Basic Info Fields
const step2Fields: FieldDefinition[] = [
  {
    key: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'John',
    required: true,
  },
  {
    key: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Smith',
    required: true,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
    required: true,
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'phone',
    placeholder: '(555) 123-4567',
  },
  {
    key: 'linkedinProfile',
    label: 'LinkedIn URL',
    type: 'url',
    placeholder: 'https://linkedin.com/in/username',
    columns: 2,
  },
]

// Step 3: Professional Fields
const step3Fields: FieldDefinition[] = [
  {
    key: 'professionalHeadline',
    label: 'Professional Headline',
    type: 'text',
    placeholder: 'Senior Software Engineer',
    columns: 2,
  },
  {
    key: 'professionalSummary',
    label: 'Professional Summary',
    type: 'textarea',
    placeholder: 'Brief overview of experience and expertise...',
    columns: 2,
  },
  {
    key: 'skills',
    label: 'Skills',
    type: 'skills',
    placeholder: 'Type a skill and press Enter',
    required: true,
    columns: 2,
  },
  {
    key: 'experienceYears',
    label: 'Years of Experience',
    type: 'number',
    min: 0,
    max: 50,
    required: true,
  },
]

// Step 4: Work Authorization Fields
const step4Fields: FieldDefinition[] = [
  {
    key: 'visaStatus',
    label: 'Visa Status',
    type: 'select',
    placeholder: 'Select visa status...',
    required: true,
    options: [
      { value: 'us_citizen', label: 'US Citizen' },
      { value: 'green_card', label: 'Green Card' },
      { value: 'h1b', label: 'H1B' },
      { value: 'l1', label: 'L1' },
      { value: 'tn', label: 'TN' },
      { value: 'opt', label: 'OPT' },
      { value: 'cpt', label: 'CPT' },
      { value: 'ead', label: 'EAD' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'availability',
    label: 'Availability',
    type: 'select',
    placeholder: 'Select availability...',
    required: true,
    options: [
      { value: 'immediate', label: 'Immediate' },
      { value: '2_weeks', label: '2 Weeks Notice' },
      { value: '30_days', label: '30 Days Notice' },
      { value: 'not_available', label: 'Not Available' },
    ],
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'San Francisco, CA',
    required: true,
  },
  {
    key: 'isRemoteOk',
    label: 'Open to Remote',
    type: 'checkbox',
    description: 'Willing to work remotely',
  },
  {
    key: 'willingToRelocate',
    label: 'Willing to Relocate',
    type: 'checkbox',
    description: 'Open to relocation for the right opportunity',
  },
  {
    key: 'minimumHourlyRate',
    label: 'Minimum Rate ($/hr)',
    type: 'currency',
    placeholder: '85',
    min: 0,
    currency: 'USD',
  },
  {
    key: 'desiredHourlyRate',
    label: 'Desired Rate ($/hr)',
    type: 'currency',
    placeholder: '110',
    min: 0,
    currency: 'USD',
  },
]

// Step 5: Source Tracking Fields
const step5Fields: FieldDefinition[] = [
  {
    key: 'leadSource',
    label: 'Lead Source',
    type: 'select',
    placeholder: 'Select source...',
    required: true,
    options: [
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'indeed', label: 'Indeed' },
      { value: 'dice', label: 'Dice' },
      { value: 'monster', label: 'Monster' },
      { value: 'referral', label: 'Employee Referral' },
      { value: 'direct', label: 'Direct Application' },
      { value: 'agency', label: 'Agency/Partner' },
      { value: 'job_board', label: 'Other Job Board' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'sourceDetails',
    label: 'Source Details',
    type: 'text',
    placeholder: 'e.g., Found via LinkedIn Recruiter search',
    columns: 2,
  },
  {
    key: 'isOnHotlist',
    label: 'Add to Hotlist',
    type: 'checkbox',
    description: 'Mark as high-priority candidate for immediate attention',
  },
  {
    key: 'hotlistNotes',
    label: 'Hotlist Notes',
    type: 'textarea',
    placeholder: 'Hotlist notes (visible to all recruiters)...',
    dependsOn: { field: 'isOnHotlist', value: true },
    columns: 2,
  },
]

// Step configurations
export const candidateIntakeSteps: WizardStepConfig<CandidateIntakeFormData>[] = [
  {
    id: 'source',
    number: 1,
    label: 'Source',
    description: 'How are you adding this candidate?',
    icon: Upload,
    fields: step1Fields,
    validation: candidateStep1Schema,
  },
  {
    id: 'basic',
    number: 2,
    label: 'Basic Info',
    description: 'Enter basic contact information',
    icon: User,
    fields: step2Fields,
    validation: candidateStep2Schema,
  },
  {
    id: 'professional',
    number: 3,
    label: 'Professional',
    description: 'Add professional details and skills',
    icon: Briefcase,
    fields: step3Fields,
    validation: candidateStep3Schema,
  },
  {
    id: 'authorization',
    number: 4,
    label: 'Authorization',
    description: 'Work authorization and availability',
    icon: Shield,
    fields: step4Fields,
    validation: candidateStep4Schema,
  },
  {
    id: 'tracking',
    number: 5,
    label: 'Source Tracking',
    description: 'Source information and notes',
    icon: FileText,
    fields: step5Fields,
    validation: candidateStep5Schema,
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
    cancelRoute: options?.cancelRoute || '/employee/recruiting/candidates',

    storeName: 'candidate-intake-form',
    defaultFormData: {
      sourceType: 'manual',
      firstName: '',
      lastName: '',
      email: '',
      skills: [],
      experienceYears: 0,
      visaStatus: 'us_citizen',
      availability: '2_weeks',
      location: '',
      willingToRelocate: false,
      isRemoteOk: false,
      leadSource: 'linkedin',
      isOnHotlist: false,
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
    skills: [],
    experienceYears: 0,
    visaStatus: 'us_citizen',
    availability: '2_weeks',
    location: '',
    willingToRelocate: false,
    isRemoteOk: false,
    leadSource: 'linkedin',
    isOnHotlist: false,
  },
}

