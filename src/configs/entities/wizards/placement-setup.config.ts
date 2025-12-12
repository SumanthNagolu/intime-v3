'use client'

import { z } from 'zod'
import {
  FileText,
  DollarSign,
  Calendar,
  ClipboardList,
  Award,
  User,
  Building2,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig, FieldDefinition } from '../types'

// Placement setup form data type
export interface PlacementSetupFormData {
  // Step 1: Offer Selection
  offerId: string
  // Pre-populated from offer
  candidateName?: string
  jobTitle?: string
  accountName?: string

  // Step 2: Rates & Dates
  startDate: string
  endDate?: string
  billRate: number
  payRate: number
  overtimeBillRate?: number
  overtimePayRate?: number
  currency: string

  // Step 3: Contract Details
  contractType: 'w2' | '1099' | 'corp_to_corp'
  backgroundCheckRequired: boolean
  backgroundCheckStatus?: 'pending' | 'in_progress' | 'passed' | 'failed'
  drugTestRequired: boolean
  drugTestStatus?: 'pending' | 'in_progress' | 'passed' | 'failed'
  clientOnboardingRequired: boolean
  equipmentProvided: boolean
  equipmentNotes?: string
  workSchedule?: string
  workLocation?: string

  // Step 4: Onboarding
  schedule7DayCheckin: boolean
  checkin7DayDate?: string
  schedule30DayCheckin: boolean
  checkin30DayDate?: string
  sendWelcomeEmail: boolean
  welcomeEmailTemplate?: string
  internalNotes?: string
}

// Validation schemas per step
export const placementStep1Schema = z.object({
  offerId: z.string().uuid('Please select an offer'),
})

export const placementStep2Schema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  billRate: z.number().min(0, 'Bill rate must be positive'),
  payRate: z.number().min(0, 'Pay rate must be positive'),
  overtimeBillRate: z.number().min(0).optional(),
  overtimePayRate: z.number().min(0).optional(),
  currency: z.string().default('USD'),
}).refine((data) => {
  if (data.payRate >= data.billRate) {
    return false
  }
  return true
}, {
  message: 'Pay rate must be less than bill rate',
  path: ['payRate'],
})

export const placementStep3Schema = z.object({
  contractType: z.enum(['w2', '1099', 'corp_to_corp']),
  backgroundCheckRequired: z.boolean(),
  backgroundCheckStatus: z.enum(['pending', 'in_progress', 'passed', 'failed']).optional(),
  drugTestRequired: z.boolean(),
  drugTestStatus: z.enum(['pending', 'in_progress', 'passed', 'failed']).optional(),
  clientOnboardingRequired: z.boolean(),
  equipmentProvided: z.boolean(),
  equipmentNotes: z.string().max(500).optional(),
  workSchedule: z.string().optional(),
  workLocation: z.string().optional(),
})

export const placementStep4Schema = z.object({
  schedule7DayCheckin: z.boolean(),
  checkin7DayDate: z.string().optional(),
  schedule30DayCheckin: z.boolean(),
  checkin30DayDate: z.string().optional(),
  sendWelcomeEmail: z.boolean(),
  welcomeEmailTemplate: z.string().optional(),
  internalNotes: z.string().max(1000).optional(),
})

// Full validation schema
// Note: Using .and() since placementStep2Schema is ZodEffects (has .refine())
export const placementSetupSchema = placementStep1Schema
  .merge(placementStep3Schema)
  .merge(placementStep4Schema)
  .and(placementStep2Schema)

// Step 1: Offer Selection Fields
const step1Fields: FieldDefinition[] = [
  {
    key: 'offerId',
    label: 'Select Accepted Offer',
    type: 'select',
    placeholder: 'Search for accepted offers...',
    required: true,
    columns: 2,
    options: [], // Populated dynamically
  },
  {
    key: 'candidateName',
    label: 'Candidate',
    type: 'text',
    readOnly: true,
    description: 'Auto-populated from selected offer',
  },
  {
    key: 'jobTitle',
    label: 'Job Title',
    type: 'text',
    readOnly: true,
    description: 'Auto-populated from selected offer',
  },
  {
    key: 'accountName',
    label: 'Account',
    type: 'text',
    readOnly: true,
    description: 'Auto-populated from selected offer',
  },
]

// Step 2: Rates & Dates Fields
const step2Fields: FieldDefinition[] = [
  {
    key: 'startDate',
    label: 'Start Date',
    type: 'date',
    required: true,
  },
  {
    key: 'endDate',
    label: 'End Date',
    type: 'date',
    description: 'Leave blank for open-ended placements',
  },
  {
    key: 'billRate',
    label: 'Bill Rate ($/hr)',
    type: 'currency',
    placeholder: '125',
    required: true,
    min: 0,
    currency: 'USD',
  },
  {
    key: 'payRate',
    label: 'Pay Rate ($/hr)',
    type: 'currency',
    placeholder: '95',
    required: true,
    min: 0,
    currency: 'USD',
  },
  {
    key: 'overtimeBillRate',
    label: 'OT Bill Rate ($/hr)',
    type: 'currency',
    placeholder: '187.50',
    min: 0,
    currency: 'USD',
  },
  {
    key: 'overtimePayRate',
    label: 'OT Pay Rate ($/hr)',
    type: 'currency',
    placeholder: '142.50',
    min: 0,
    currency: 'USD',
  },
]

// Step 3: Contract Details Fields
const step3Fields: FieldDefinition[] = [
  {
    key: 'contractType',
    label: 'Contract Type',
    type: 'select',
    placeholder: 'Select contract type...',
    required: true,
    options: [
      { value: 'w2', label: 'W-2 Employee' },
      { value: '1099', label: '1099 Independent Contractor' },
      { value: 'corp_to_corp', label: 'Corp-to-Corp' },
    ],
  },
  {
    key: 'workLocation',
    label: 'Work Location',
    type: 'text',
    placeholder: 'Office, Remote, Hybrid...',
  },
  {
    key: 'workSchedule',
    label: 'Work Schedule',
    type: 'text',
    placeholder: 'M-F 9-5, Flexible...',
  },
  {
    key: 'backgroundCheckRequired',
    label: 'Background Check Required',
    type: 'checkbox',
    description: 'Client requires background check',
  },
  {
    key: 'backgroundCheckStatus',
    label: 'Background Check Status',
    type: 'select',
    placeholder: 'Select status...',
    dependsOn: { field: 'backgroundCheckRequired', value: true },
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'passed', label: 'Passed' },
      { value: 'failed', label: 'Failed' },
    ],
  },
  {
    key: 'drugTestRequired',
    label: 'Drug Test Required',
    type: 'checkbox',
    description: 'Client requires drug screening',
  },
  {
    key: 'drugTestStatus',
    label: 'Drug Test Status',
    type: 'select',
    placeholder: 'Select status...',
    dependsOn: { field: 'drugTestRequired', value: true },
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'passed', label: 'Passed' },
      { value: 'failed', label: 'Failed' },
    ],
  },
  {
    key: 'clientOnboardingRequired',
    label: 'Client Onboarding Required',
    type: 'checkbox',
    description: 'Consultant must complete client onboarding process',
  },
  {
    key: 'equipmentProvided',
    label: 'Equipment Provided',
    type: 'checkbox',
    description: 'Client provides equipment',
  },
  {
    key: 'equipmentNotes',
    label: 'Equipment Notes',
    type: 'textarea',
    placeholder: 'Laptop, monitors, etc...',
    dependsOn: { field: 'equipmentProvided', value: true },
    columns: 2,
  },
]

// Step 4: Onboarding Fields
const step4Fields: FieldDefinition[] = [
  {
    key: 'schedule7DayCheckin',
    label: 'Schedule 7-Day Check-in',
    type: 'checkbox',
    description: 'Automatically schedule a 7-day check-in call',
  },
  {
    key: 'checkin7DayDate',
    label: '7-Day Check-in Date',
    type: 'date',
    dependsOn: { field: 'schedule7DayCheckin', value: true },
  },
  {
    key: 'schedule30DayCheckin',
    label: 'Schedule 30-Day Check-in',
    type: 'checkbox',
    description: 'Automatically schedule a 30-day check-in call',
  },
  {
    key: 'checkin30DayDate',
    label: '30-Day Check-in Date',
    type: 'date',
    dependsOn: { field: 'schedule30DayCheckin', value: true },
  },
  {
    key: 'sendWelcomeEmail',
    label: 'Send Welcome Email',
    type: 'checkbox',
    description: 'Send a welcome email to the consultant',
  },
  {
    key: 'welcomeEmailTemplate',
    label: 'Email Template',
    type: 'select',
    placeholder: 'Select template...',
    dependsOn: { field: 'sendWelcomeEmail', value: true },
    options: [
      { value: 'default', label: 'Default Welcome' },
      { value: 'contractor', label: 'Contractor Welcome' },
      { value: 'remote', label: 'Remote Employee Welcome' },
    ],
  },
  {
    key: 'internalNotes',
    label: 'Internal Notes',
    type: 'textarea',
    placeholder: 'Notes for internal team...',
    columns: 2,
  },
]

// Step configurations
export const placementSetupSteps: WizardStepConfig<PlacementSetupFormData>[] = [
  {
    id: 'offer',
    number: 1,
    label: 'Offer Selection',
    description: 'Select the accepted offer to create a placement',
    icon: Award,
    fields: step1Fields,
    validation: placementStep1Schema,
  },
  {
    id: 'rates',
    number: 2,
    label: 'Rates & Dates',
    description: 'Set placement dates and billing rates',
    icon: DollarSign,
    fields: step2Fields,
    validation: placementStep2Schema,
  },
  {
    id: 'contract',
    number: 3,
    label: 'Contract Details',
    description: 'Contract type and compliance requirements',
    icon: FileText,
    fields: step3Fields,
    validation: placementStep3Schema,
  },
  {
    id: 'onboarding',
    number: 4,
    label: 'Onboarding',
    description: 'Set up check-ins and welcome communications',
    icon: ClipboardList,
    fields: step4Fields,
    validation: placementStep4Schema,
  },
]

// Full wizard configuration factory
export function createPlacementSetupConfig(
  onSubmit: (formData: PlacementSetupFormData) => Promise<unknown>,
  options?: {
    offerOptions?: Array<{ value: string; label: string; candidate?: string; job?: string; account?: string }>
    onSuccess?: (result: unknown) => void
    cancelRoute?: string
  }
): WizardConfig<PlacementSetupFormData> {
  // Clone steps and inject offer options
  const steps = placementSetupSteps.map(step => {
    if (step.id === 'offer' && step.fields) {
      const fields = step.fields.map(field => {
        if (field.key === 'offerId' && options?.offerOptions) {
          return { ...field, options: options.offerOptions }
        }
        return field
      })
      return { ...step, fields }
    }
    return step
  })

  return {
    title: 'Create Placement',
    description: 'Set up a new placement from an accepted offer',
    entityType: 'placement',

    steps,

    allowFreeNavigation: false,
    stepIndicatorStyle: 'numbers',

    reviewStep: {
      title: 'Review & Submit',
      sections: [
        {
          label: 'Offer',
          fields: ['candidateName', 'jobTitle', 'accountName'],
          stepNumber: 1,
        },
        {
          label: 'Rates & Dates',
          fields: ['startDate', 'endDate', 'billRate', 'payRate'],
          stepNumber: 2,
        },
        {
          label: 'Contract',
          fields: ['contractType', 'backgroundCheckRequired', 'drugTestRequired'],
          stepNumber: 3,
        },
        {
          label: 'Onboarding',
          fields: ['schedule7DayCheckin', 'sendWelcomeEmail'],
          stepNumber: 4,
        },
      ],
    },

    submitLabel: 'Create Placement',
    saveDraftLabel: 'Save Draft',
    cancelRoute: options?.cancelRoute || '/employee/recruiting/placements',

    storeName: 'placement-setup-form',
    defaultFormData: {
      offerId: '',
      startDate: '',
      billRate: 0,
      payRate: 0,
      currency: 'USD',
      contractType: 'w2',
      backgroundCheckRequired: false,
      drugTestRequired: false,
      clientOnboardingRequired: false,
      equipmentProvided: false,
      schedule7DayCheckin: true,
      schedule30DayCheckin: true,
      sendWelcomeEmail: true,
    },

    onSubmit,
    onSuccess: options?.onSuccess,
  }
}

// Pre-built config
export const placementSetupWizardConfig: Omit<WizardConfig<PlacementSetupFormData>, 'onSubmit'> = {
  title: 'Create Placement',
  description: 'Set up a new placement from an accepted offer',
  entityType: 'placement',

  steps: placementSetupSteps,

  allowFreeNavigation: false,
  stepIndicatorStyle: 'numbers',

  reviewStep: {
    title: 'Review & Submit',
    sections: [
      {
        label: 'Offer',
        fields: ['candidateName', 'jobTitle', 'accountName'],
        stepNumber: 1,
      },
      {
        label: 'Rates & Dates',
        fields: ['startDate', 'endDate', 'billRate', 'payRate'],
        stepNumber: 2,
      },
      {
        label: 'Contract',
        fields: ['contractType', 'backgroundCheckRequired', 'drugTestRequired'],
        stepNumber: 3,
      },
      {
        label: 'Onboarding',
        fields: ['schedule7DayCheckin', 'sendWelcomeEmail'],
        stepNumber: 4,
      },
    ],
  },

  submitLabel: 'Create Placement',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/recruiting/placements',

  storeName: 'placement-setup-form',
  defaultFormData: {
    offerId: '',
    startDate: '',
    billRate: 0,
    payRate: 0,
    currency: 'USD',
    contractType: 'w2',
    backgroundCheckRequired: false,
    drugTestRequired: false,
    clientOnboardingRequired: false,
    equipmentProvided: false,
    schedule7DayCheckin: true,
    schedule30DayCheckin: true,
    sendWelcomeEmail: true,
  },
}

