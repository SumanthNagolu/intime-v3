'use client'

import { z } from 'zod'
import {
  Briefcase,
  Code,
  DollarSign,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig, FieldDefinition } from '../types'

// Form data type matching the create-job-store
export interface JobCreateFormData {
  // Step 1: Basic Info
  title: string
  accountId: string
  jobType: string
  location: string
  isRemote: boolean
  isHybrid: boolean
  hybridDays: number

  // Step 2: Requirements
  requiredSkills: string[]
  niceToHaveSkills: string[]
  minExperience: string
  maxExperience: string
  description: string

  // Step 3: Compensation
  rateMin: string
  rateMax: string
  rateType: string
  positionsCount: number
  priority: string
  targetFillDate: string
  targetStartDate: string
}

// Validation schemas per step
export const jobCreateStep1Schema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  accountId: z.string().uuid('Please select an account'),
  jobType: z.enum(['contract', 'permanent', 'contract_to_hire', 'temp', 'sow']),
  location: z.string().optional(),
  isRemote: z.boolean(),
  isHybrid: z.boolean(),
  hybridDays: z.number().min(1).max(5).optional(),
})

export const jobCreateStep2Schema = z.object({
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill is needed'),
  niceToHaveSkills: z.array(z.string()).optional(),
  minExperience: z.string().optional(),
  maxExperience: z.string().optional(),
  description: z.string().optional(),
}).refine((data) => {
  if (data.minExperience && data.maxExperience) {
    return parseInt(data.maxExperience) >= parseInt(data.minExperience)
  }
  return true
}, {
  message: 'Max experience must be greater than or equal to min experience',
  path: ['maxExperience'],
})

export const jobCreateStep3Schema = z.object({
  rateMin: z.string().optional(),
  rateMax: z.string().optional(),
  rateType: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']),
  positionsCount: z.number().min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'critical']),
  targetFillDate: z.string().optional(),
  targetStartDate: z.string().optional(),
})

// Full validation schema
export const jobCreateSchema = jobCreateStep1Schema
  .merge(jobCreateStep2Schema)
  .merge(jobCreateStep3Schema)

// Step 1: Basic Info Fields
const step1Fields: FieldDefinition[] = [
  {
    key: 'title',
    label: 'Job Title',
    type: 'text',
    placeholder: 'e.g., Senior Software Engineer',
    required: true,
    columns: 2,
  },
  {
    key: 'accountId',
    label: 'Client Account',
    type: 'select',
    placeholder: 'Select a client account...',
    required: true,
    options: [], // Populated dynamically
  },
  {
    key: 'jobType',
    label: 'Job Type',
    type: 'select',
    placeholder: 'Select job type...',
    required: true,
    options: [
      { value: 'contract', label: 'Contract' },
      { value: 'permanent', label: 'Permanent (Direct Hire)' },
      { value: 'contract_to_hire', label: 'Contract to Hire' },
      { value: 'temp', label: 'Temporary' },
      { value: 'sow', label: 'Statement of Work (SOW)' },
    ],
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'e.g., San Francisco, CA',
  },
  {
    key: 'isRemote',
    label: 'Remote',
    type: 'checkbox',
    description: 'This position is fully remote',
  },
  {
    key: 'isHybrid',
    label: 'Hybrid',
    type: 'checkbox',
    description: 'Hybrid work arrangement available',
  },
  {
    key: 'hybridDays',
    label: 'Days in Office',
    type: 'number',
    min: 1,
    max: 5,
    dependsOn: { field: 'isHybrid', value: true },
  },
]

// Step 2: Requirements Fields
const step2Fields: FieldDefinition[] = [
  {
    key: 'requiredSkills',
    label: 'Required Skills',
    type: 'skills',
    placeholder: 'Add required skills...',
    required: true,
    columns: 2,
    description: 'Press Enter to add each skill',
  },
  {
    key: 'niceToHaveSkills',
    label: 'Nice-to-Have Skills',
    type: 'skills',
    placeholder: 'Add nice-to-have skills...',
    columns: 2,
    description: 'Press Enter to add each skill',
  },
  {
    key: 'minExperience',
    label: 'Min Experience (years)',
    type: 'number',
    placeholder: '3',
    min: 0,
    max: 30,
  },
  {
    key: 'maxExperience',
    label: 'Max Experience (years)',
    type: 'number',
    placeholder: '8',
    min: 0,
    max: 30,
  },
  {
    key: 'description',
    label: 'Job Description',
    type: 'textarea',
    placeholder: 'Enter a detailed job description...',
    columns: 2,
  },
]

// Step 3: Compensation Fields
const step3Fields: FieldDefinition[] = [
  {
    key: 'rateType',
    label: 'Rate Type',
    type: 'select',
    required: true,
    options: [
      { value: 'hourly', label: 'Hourly' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'annual', label: 'Annual' },
    ],
  },
  {
    key: 'positionsCount',
    label: 'Positions to Fill',
    type: 'number',
    min: 1,
    max: 100,
    required: true,
  },
  {
    key: 'rateMin',
    label: 'Min Rate ($)',
    type: 'currency',
    placeholder: '100',
    min: 0,
    currency: 'USD',
  },
  {
    key: 'rateMax',
    label: 'Max Rate ($)',
    type: 'currency',
    placeholder: '150',
    min: 0,
    currency: 'USD',
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    required: true,
    options: [
      { value: 'low', label: 'Low' },
      { value: 'normal', label: 'Normal' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'critical', label: 'Critical' },
    ],
  },
  {
    key: 'targetFillDate',
    label: 'Target Fill Date',
    type: 'date',
  },
  {
    key: 'targetStartDate',
    label: 'Target Start Date',
    type: 'date',
  },
]

// Step configurations
export const jobCreateSteps: WizardStepConfig<JobCreateFormData>[] = [
  {
    id: 'basic',
    number: 1,
    label: 'Basic Info',
    description: 'Enter job title, client, and work arrangement',
    icon: Briefcase,
    fields: step1Fields,
    validation: jobCreateStep1Schema,
  },
  {
    id: 'requirements',
    number: 2,
    label: 'Requirements',
    description: 'Define skills and experience requirements',
    icon: Code,
    fields: step2Fields,
    validation: jobCreateStep2Schema,
  },
  {
    id: 'compensation',
    number: 3,
    label: 'Compensation',
    description: 'Set rates, priority, and timeline',
    icon: DollarSign,
    fields: step3Fields,
    validation: jobCreateStep3Schema,
  },
]

// Full wizard configuration factory
export function createJobCreateConfig(
  onSubmit: (formData: JobCreateFormData) => Promise<unknown>,
  options?: {
    accountOptions?: Array<{ value: string; label: string }>
    onSuccess?: (result: unknown) => void
    cancelRoute?: string
  }
): WizardConfig<JobCreateFormData> {
  // Clone steps and inject account options
  const steps = jobCreateSteps.map(step => {
    if (step.id === 'basic' && step.fields) {
      const fields = step.fields.map(field => {
        if (field.key === 'accountId' && options?.accountOptions) {
          return { ...field, options: options.accountOptions }
        }
        return field
      })
      return { ...step, fields }
    }
    return step
  })

  return {
    title: 'Create Job',
    description: 'Create a new job requisition',
    entityType: 'job',

    steps,

    allowFreeNavigation: false,
    stepIndicatorStyle: 'icons',

    reviewStep: {
      title: 'Review & Create',
      sections: [
        {
          label: 'Basic Information',
          fields: ['title', 'accountId', 'jobType', 'location'],
          stepNumber: 1,
        },
        {
          label: 'Requirements',
          fields: ['requiredSkills', 'minExperience', 'maxExperience'],
          stepNumber: 2,
        },
        {
          label: 'Compensation',
          fields: ['rateMin', 'rateMax', 'rateType', 'priority'],
          stepNumber: 3,
        },
      ],
    },

    submitLabel: 'Create Job',
    saveDraftLabel: 'Save Draft',
    cancelRoute: options?.cancelRoute || '/employee/recruiting/jobs',

    storeName: 'create-job-form',
    defaultFormData: {
      title: '',
      accountId: '',
      jobType: 'contract',
      location: '',
      isRemote: false,
      isHybrid: false,
      hybridDays: 3,
      requiredSkills: [],
      niceToHaveSkills: [],
      minExperience: '',
      maxExperience: '',
      description: '',
      rateMin: '',
      rateMax: '',
      rateType: 'hourly',
      positionsCount: 1,
      priority: 'normal',
      targetFillDate: '',
      targetStartDate: '',
    },

    onSubmit,
    onSuccess: options?.onSuccess,
  }
}

// Pre-built config
export const jobCreateWizardConfig: Omit<WizardConfig<JobCreateFormData>, 'onSubmit'> = {
  title: 'Create Job',
  description: 'Create a new job requisition',
  entityType: 'job',

  steps: jobCreateSteps,

  allowFreeNavigation: false,
  stepIndicatorStyle: 'icons',

  reviewStep: {
    title: 'Review & Create',
    sections: [
      {
        label: 'Basic Information',
        fields: ['title', 'accountId', 'jobType', 'location'],
        stepNumber: 1,
      },
      {
        label: 'Requirements',
        fields: ['requiredSkills', 'minExperience', 'maxExperience'],
        stepNumber: 2,
      },
      {
        label: 'Compensation',
        fields: ['rateMin', 'rateMax', 'rateType', 'priority'],
        stepNumber: 3,
      },
    ],
  },

  submitLabel: 'Create Job',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/recruiting/jobs',

  storeName: 'create-job-form',
  defaultFormData: {
    title: '',
    accountId: '',
    jobType: 'contract',
    location: '',
    isRemote: false,
    isHybrid: false,
    hybridDays: 3,
    requiredSkills: [],
    niceToHaveSkills: [],
    minExperience: '',
    maxExperience: '',
    description: '',
    rateMin: '',
    rateMax: '',
    rateType: 'hourly',
    positionsCount: 1,
    priority: 'normal',
    targetFillDate: '',
    targetStartDate: '',
  },
}

