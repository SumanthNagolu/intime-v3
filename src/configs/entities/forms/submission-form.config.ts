'use client'

import { z } from 'zod'
import {
  FileText,
  Target,
} from 'lucide-react'
import { FormConfig, FieldDefinition } from '../types'

// Submission form data type
export interface SubmissionFormData {
  jobId: string
  candidateId: string
  status?: 'sourced' | 'screening'
  rate?: number
  payRate?: number
  aiMatchScore?: number
  recruiterMatchScore?: number
  matchExplanation?: string
  internalNotes?: string
}

// Validation schema
export const submissionFormSchema = z.object({
  jobId: z.string().uuid('Please select a job'),
  candidateId: z.string().uuid('Please select a candidate'),
  status: z.enum(['sourced', 'screening']).default('sourced'),
  rate: z.number().min(0, 'Rate must be positive').optional(),
  payRate: z.number().min(0, 'Pay rate must be positive').optional(),
  aiMatchScore: z.number().min(0).max(100).optional(),
  recruiterMatchScore: z.number().min(0).max(100).optional(),
  matchExplanation: z.string().max(1000).optional(),
  internalNotes: z.string().max(1000).optional(),
}).refine((data) => {
  // Ensure pay rate is less than bill rate
  if (data.rate && data.payRate && data.payRate >= data.rate) {
    return false
  }
  return true
}, {
  message: 'Pay rate must be less than bill rate',
  path: ['payRate'],
})

// Field definitions
export const submissionFormFields: FieldDefinition[] = [
  // Selection
  {
    key: 'jobId',
    label: 'Job',
    type: 'select',
    placeholder: 'Select a job...',
    required: true,
    section: 'selection',
    options: [], // Populated dynamically
  },
  {
    key: 'candidateId',
    label: 'Candidate',
    type: 'select',
    placeholder: 'Select a candidate...',
    required: true,
    section: 'selection',
    options: [], // Populated dynamically
  },

  // Rates
  {
    key: 'rate',
    label: 'Bill Rate ($/hr)',
    type: 'currency',
    placeholder: '125',
    min: 0,
    section: 'rates',
    currency: 'USD',
  },
  {
    key: 'payRate',
    label: 'Pay Rate ($/hr)',
    type: 'currency',
    placeholder: '95',
    min: 0,
    section: 'rates',
    currency: 'USD',
  },

  // Match Scores
  {
    key: 'recruiterMatchScore',
    label: 'Recruiter Match Score (%)',
    type: 'number',
    placeholder: '85',
    min: 0,
    max: 100,
    section: 'scoring',
    description: 'Your assessment of the candidate-job fit',
  },
  {
    key: 'aiMatchScore',
    label: 'AI Match Score (%)',
    type: 'number',
    placeholder: 'Auto-calculated',
    min: 0,
    max: 100,
    section: 'scoring',
    readOnly: true,
    description: 'Automatically calculated based on skills match',
  },
  {
    key: 'matchExplanation',
    label: 'Match Explanation',
    type: 'textarea',
    placeholder: 'Why is this candidate a good fit for this role?',
    section: 'scoring',
    columns: 2,
  },

  // Status & Notes
  {
    key: 'status',
    label: 'Initial Status',
    type: 'select',
    section: 'notes',
    options: [
      { value: 'sourced', label: 'Sourced - Initial submission' },
      { value: 'screening', label: 'Screening - Ready for review' },
    ],
  },
  {
    key: 'internalNotes',
    label: 'Internal Notes',
    type: 'textarea',
    placeholder: 'Notes visible only to your team...',
    section: 'notes',
    columns: 2,
  },
]

// Form configuration factory
export function createSubmissionFormConfig(
  onSubmit: (data: SubmissionFormData) => Promise<unknown>,
  options?: {
    title?: string
    jobOptions?: Array<{ value: string; label: string }>
    candidateOptions?: Array<{ value: string; label: string }>
    defaultValues?: Partial<SubmissionFormData>
    onDelete?: (data: SubmissionFormData) => Promise<void>
  }
): FormConfig<SubmissionFormData> {
  // Clone fields and inject options
  const fields = submissionFormFields.map(field => {
    if (field.key === 'jobId' && options?.jobOptions) {
      return { ...field, options: options.jobOptions }
    }
    if (field.key === 'candidateId' && options?.candidateOptions) {
      return { ...field, options: options.candidateOptions }
    }
    return field
  })

  return {
    title: options?.title || 'Submit Candidate',
    description: 'Submit a candidate to a job requisition',
    entityName: 'Submission',
    variant: 'card',

    sections: [
      {
        id: 'selection',
        title: 'Job & Candidate',
        description: 'Select the job and candidate for this submission',
        columns: 2,
        fields: fields.filter(f => f.section === 'selection'),
      },
      {
        id: 'rates',
        title: 'Rates',
        description: 'Bill and pay rates for this submission',
        columns: 2,
        fields: fields.filter(f => f.section === 'rates'),
      },
      {
        id: 'scoring',
        title: 'Match Assessment',
        description: 'How well does this candidate match the job?',
        columns: 2,
        fields: fields.filter(f => f.section === 'scoring'),
        collapsible: true,
      },
      {
        id: 'notes',
        title: 'Status & Notes',
        columns: 2,
        fields: fields.filter(f => f.section === 'notes'),
        collapsible: true,
      },
    ],

    defaultValues: options?.defaultValues || {
      status: 'sourced',
    },

    validation: submissionFormSchema,

    submitLabel: 'Submit Candidate',
    cancelLabel: 'Cancel',
    successMessage: 'Candidate submitted successfully',
    actionsPosition: 'bottom',
    showDelete: !!options?.onDelete,

    onSubmit,
    onDelete: options?.onDelete,
  }
}

// Pre-built config
export const submissionFormConfig: Omit<FormConfig<SubmissionFormData>, 'onSubmit'> = {
  title: 'Submit Candidate',
  description: 'Submit a candidate to a job requisition',
  entityName: 'Submission',
  variant: 'card',

  sections: [
    {
      id: 'selection',
      title: 'Job & Candidate',
      description: 'Select the job and candidate for this submission',
      columns: 2,
      fields: submissionFormFields.filter(f => f.section === 'selection'),
    },
    {
      id: 'rates',
      title: 'Rates',
      description: 'Bill and pay rates for this submission',
      columns: 2,
      fields: submissionFormFields.filter(f => f.section === 'rates'),
    },
    {
      id: 'scoring',
      title: 'Match Assessment',
      description: 'How well does this candidate match the job?',
      columns: 2,
      fields: submissionFormFields.filter(f => f.section === 'scoring'),
      collapsible: true,
    },
    {
      id: 'notes',
      title: 'Status & Notes',
      columns: 2,
      fields: submissionFormFields.filter(f => f.section === 'notes'),
      collapsible: true,
    },
  ],

  defaultValues: {
    status: 'sourced',
  },

  validation: submissionFormSchema,

  submitLabel: 'Submit Candidate',
  cancelLabel: 'Cancel',
  successMessage: 'Candidate submitted successfully',
  actionsPosition: 'bottom',
}

