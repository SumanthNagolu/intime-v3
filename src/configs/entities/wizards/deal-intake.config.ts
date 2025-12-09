'use client'

import { z } from 'zod'
import {
  Building2,
  FileText,
  DollarSign,
  Users,
  Target,
  Handshake,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig, FieldDefinition } from '../types'

// Deal intake form data type
export interface DealIntakeFormData {
  // Step 1: Account/Lead Link
  sourceType: 'account' | 'lead' | 'new'
  accountId?: string
  leadId?: string
  newAccountName?: string
  newAccountIndustry?: string

  // Step 2: Deal Details
  name: string
  dealType: 'new_business' | 'expansion' | 'renewal' | 're_engagement'
  description?: string
  services?: string[]

  // Step 3: Value & Timeline
  value: number
  valueBasis: 'one_time' | 'annual' | 'monthly'
  probability: number
  expectedCloseDate: string
  estimatedPlacements?: number
  avgBillRate?: number
  contractLengthMonths?: number

  // Step 4: Stakeholders
  stakeholders: Array<{
    name: string
    title: string
    role: 'decision_maker' | 'influencer' | 'gatekeeper' | 'champion'
    email?: string
  }>
  nextAction?: string
  nextActionDate?: string
  notes?: string
}

// Validation schemas per step
export const dealStep1Schema = z.object({
  sourceType: z.enum(['account', 'lead', 'new']),
  accountId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  newAccountName: z.string().min(2).optional(),
  newAccountIndustry: z.string().optional(),
}).refine((data) => {
  if (data.sourceType === 'account' && !data.accountId) {
    return false
  }
  if (data.sourceType === 'lead' && !data.leadId) {
    return false
  }
  if (data.sourceType === 'new' && !data.newAccountName) {
    return false
  }
  return true
}, {
  message: 'Please select or enter the required information',
})

export const dealStep2Schema = z.object({
  name: z.string().min(1, 'Deal name is required').max(200),
  dealType: z.enum(['new_business', 'expansion', 'renewal', 're_engagement']),
  description: z.string().max(1000).optional(),
  services: z.array(z.string()).optional(),
})

export const dealStep3Schema = z.object({
  value: z.number().min(0, 'Value must be positive'),
  valueBasis: z.enum(['one_time', 'annual', 'monthly']),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.string().min(1, 'Expected close date is required'),
  estimatedPlacements: z.number().min(1).optional(),
  avgBillRate: z.number().min(0).optional(),
  contractLengthMonths: z.number().min(1).max(60).optional(),
})

export const dealStep4Schema = z.object({
  stakeholders: z.array(z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    role: z.enum(['decision_maker', 'influencer', 'gatekeeper', 'champion']),
    email: z.string().email().optional().or(z.literal('')),
  })).optional(),
  nextAction: z.string().max(200).optional(),
  nextActionDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

// Full validation schema
export const dealIntakeSchema = dealStep1Schema
  .merge(dealStep2Schema)
  .merge(dealStep3Schema)
  .merge(dealStep4Schema)

// Step 1: Account/Lead Link Fields
const step1Fields: FieldDefinition[] = [
  {
    key: 'sourceType',
    label: 'Deal Source',
    type: 'radio',
    required: true,
    columns: 1,
    options: [
      { value: 'account', label: 'Existing Account - Link to an existing account', icon: Building2 },
      { value: 'lead', label: 'Convert Lead - Convert a qualified lead to a deal', icon: Target },
      { value: 'new', label: 'New Account - Create a new account for this deal', icon: FileText },
    ],
  },
  {
    key: 'accountId',
    label: 'Select Account',
    type: 'select',
    placeholder: 'Search accounts...',
    dependsOn: { field: 'sourceType', value: 'account' },
    options: [], // Populated dynamically
  },
  {
    key: 'leadId',
    label: 'Select Lead',
    type: 'select',
    placeholder: 'Search qualified leads...',
    dependsOn: { field: 'sourceType', value: 'lead' },
    options: [], // Populated dynamically
  },
  {
    key: 'newAccountName',
    label: 'New Account Name',
    type: 'text',
    placeholder: 'Acme Corporation',
    dependsOn: { field: 'sourceType', value: 'new' },
    required: true,
  },
  {
    key: 'newAccountIndustry',
    label: 'Industry',
    type: 'select',
    placeholder: 'Select industry...',
    dependsOn: { field: 'sourceType', value: 'new' },
    options: [
      { value: 'technology', label: 'Technology' },
      { value: 'finance', label: 'Finance & Banking' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'retail', label: 'Retail' },
      { value: 'consulting', label: 'Consulting' },
      { value: 'energy', label: 'Energy & Utilities' },
      { value: 'government', label: 'Government' },
      { value: 'education', label: 'Education' },
      { value: 'other', label: 'Other' },
    ],
  },
]

// Step 2: Deal Details Fields
const step2Fields: FieldDefinition[] = [
  {
    key: 'name',
    label: 'Deal Name',
    type: 'text',
    placeholder: 'Q1 2024 Staff Augmentation',
    required: true,
    columns: 2,
  },
  {
    key: 'dealType',
    label: 'Deal Type',
    type: 'select',
    placeholder: 'Select deal type...',
    required: true,
    options: [
      { value: 'new_business', label: 'New Business - First engagement with client' },
      { value: 'expansion', label: 'Expansion - Growing existing relationship' },
      { value: 'renewal', label: 'Renewal - Contract renewal' },
      { value: 're_engagement', label: 'Re-engagement - Returning after dormant period' },
    ],
  },
  {
    key: 'services',
    label: 'Services',
    type: 'multi-select',
    placeholder: 'Select services...',
    columns: 2,
    options: [
      { value: 'staff_augmentation', label: 'Staff Augmentation' },
      { value: 'direct_hire', label: 'Direct Hire' },
      { value: 'contract_to_hire', label: 'Contract-to-Hire' },
      { value: 'sow_project', label: 'SOW/Project' },
      { value: 'msp', label: 'MSP Services' },
      { value: 'rpo', label: 'RPO' },
    ],
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe the opportunity, client needs, and scope...',
    columns: 2,
  },
]

// Step 3: Value & Timeline Fields
const step3Fields: FieldDefinition[] = [
  {
    key: 'value',
    label: 'Deal Value ($)',
    type: 'currency',
    placeholder: '500000',
    required: true,
    min: 0,
    currency: 'USD',
  },
  {
    key: 'valueBasis',
    label: 'Value Basis',
    type: 'select',
    required: true,
    options: [
      { value: 'one_time', label: 'One-Time' },
      { value: 'annual', label: 'Annual (recurring)' },
      { value: 'monthly', label: 'Monthly (recurring)' },
    ],
  },
  {
    key: 'probability',
    label: 'Win Probability (%)',
    type: 'number',
    placeholder: '50',
    required: true,
    min: 0,
    max: 100,
  },
  {
    key: 'expectedCloseDate',
    label: 'Expected Close Date',
    type: 'date',
    required: true,
  },
  {
    key: 'estimatedPlacements',
    label: 'Est. Placements',
    type: 'number',
    placeholder: '5',
    min: 1,
  },
  {
    key: 'avgBillRate',
    label: 'Avg Bill Rate ($/hr)',
    type: 'currency',
    placeholder: '125',
    min: 0,
    currency: 'USD',
  },
  {
    key: 'contractLengthMonths',
    label: 'Contract Length (months)',
    type: 'number',
    placeholder: '12',
    min: 1,
    max: 60,
  },
]

// Step 4: Stakeholders Fields
const step4Fields: FieldDefinition[] = [
  {
    key: 'nextAction',
    label: 'Next Action',
    type: 'text',
    placeholder: 'Schedule discovery call',
    columns: 2,
  },
  {
    key: 'nextActionDate',
    label: 'Next Action Date',
    type: 'date',
  },
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Additional notes about this deal...',
    columns: 2,
  },
]

// Step configurations
export const dealIntakeSteps: WizardStepConfig<DealIntakeFormData>[] = [
  {
    id: 'source',
    number: 1,
    label: 'Account/Lead',
    description: 'Link to an existing account or lead',
    icon: Building2,
    fields: step1Fields,
    validation: dealStep1Schema,
  },
  {
    id: 'details',
    number: 2,
    label: 'Deal Details',
    description: 'Basic deal information',
    icon: FileText,
    fields: step2Fields,
    validation: dealStep2Schema,
  },
  {
    id: 'value',
    number: 3,
    label: 'Value & Timeline',
    description: 'Deal value and expected close date',
    icon: DollarSign,
    fields: step3Fields,
    validation: dealStep3Schema,
  },
  {
    id: 'stakeholders',
    number: 4,
    label: 'Stakeholders',
    description: 'Key contacts and next steps',
    icon: Users,
    fields: step4Fields,
    validation: dealStep4Schema,
  },
]

// Full wizard configuration factory
export function createDealIntakeConfig(
  onSubmit: (formData: DealIntakeFormData) => Promise<unknown>,
  options?: {
    accountOptions?: Array<{ value: string; label: string }>
    leadOptions?: Array<{ value: string; label: string }>
    onSuccess?: (result: unknown) => void
    cancelRoute?: string
  }
): WizardConfig<DealIntakeFormData> {
  // Clone steps and inject options
  const steps = dealIntakeSteps.map(step => {
    if (step.id === 'source' && step.fields) {
      const fields = step.fields.map(field => {
        if (field.key === 'accountId' && options?.accountOptions) {
          return { ...field, options: options.accountOptions }
        }
        if (field.key === 'leadId' && options?.leadOptions) {
          return { ...field, options: options.leadOptions }
        }
        return field
      })
      return { ...step, fields }
    }
    return step
  })

  return {
    title: 'Create Deal',
    description: 'Create a new deal in your pipeline',
    entityType: 'deal',

    steps,

    allowFreeNavigation: false,
    stepIndicatorStyle: 'numbers',

    reviewStep: {
      title: 'Review & Submit',
      sections: [
        {
          label: 'Account/Lead',
          fields: ['sourceType', 'accountId', 'leadId', 'newAccountName'],
          stepNumber: 1,
        },
        {
          label: 'Deal Details',
          fields: ['name', 'dealType'],
          stepNumber: 2,
        },
        {
          label: 'Value & Timeline',
          fields: ['value', 'probability', 'expectedCloseDate'],
          stepNumber: 3,
        },
        {
          label: 'Next Steps',
          fields: ['nextAction', 'nextActionDate'],
          stepNumber: 4,
        },
      ],
    },

    submitLabel: 'Create Deal',
    saveDraftLabel: 'Save Draft',
    cancelRoute: options?.cancelRoute || '/employee/crm/deals',

    storeName: 'deal-intake-form',
    defaultFormData: {
      sourceType: 'account',
      name: '',
      dealType: 'new_business',
      value: 0,
      valueBasis: 'annual',
      probability: 20,
      expectedCloseDate: '',
      stakeholders: [],
    },

    onSubmit,
    onSuccess: options?.onSuccess,
  }
}

// Pre-built config
export const dealIntakeWizardConfig: Omit<WizardConfig<DealIntakeFormData>, 'onSubmit'> = {
  title: 'Create Deal',
  description: 'Create a new deal in your pipeline',
  entityType: 'deal',

  steps: dealIntakeSteps,

  allowFreeNavigation: false,
  stepIndicatorStyle: 'numbers',

  reviewStep: {
    title: 'Review & Submit',
    sections: [
      {
        label: 'Account/Lead',
        fields: ['sourceType', 'accountId', 'leadId', 'newAccountName'],
        stepNumber: 1,
      },
      {
        label: 'Deal Details',
        fields: ['name', 'dealType'],
        stepNumber: 2,
      },
      {
        label: 'Value & Timeline',
        fields: ['value', 'probability', 'expectedCloseDate'],
        stepNumber: 3,
      },
      {
        label: 'Next Steps',
        fields: ['nextAction', 'nextActionDate'],
        stepNumber: 4,
      },
    ],
  },

  submitLabel: 'Create Deal',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/crm/deals',

  storeName: 'deal-intake-form',
  defaultFormData: {
    sourceType: 'account',
    name: '',
    dealType: 'new_business',
    value: 0,
    valueBasis: 'annual',
    probability: 20,
    expectedCloseDate: '',
    stakeholders: [],
  },
}

