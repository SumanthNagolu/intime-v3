'use client'

import { z } from 'zod'
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Linkedin,
  DollarSign,
  Target,
  Briefcase,
} from 'lucide-react'
import { FormConfig, FieldDefinition } from '../types'

// Lead form data type
export interface LeadFormData {
  // Lead type
  leadType: 'company' | 'individual'
  // Company info
  companyName?: string
  industry?: string
  companySize?: string
  website?: string
  // Contact info
  firstName?: string
  lastName?: string
  title?: string
  email?: string
  phone?: string
  linkedinUrl?: string
  // Opportunity info
  source: string
  businessNeed?: string
  positionsCount?: number
  estimatedValue?: number
  skillsNeeded?: string[]
  urgency?: string
  notes?: string
}

// Validation schema
export const leadFormSchema = z.object({
  leadType: z.enum(['company', 'individual']),
  companyName: z.string().min(1, 'Company name is required').optional(),
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  source: z.string().min(1, 'Lead source is required'),
  businessNeed: z.string().optional(),
  positionsCount: z.number().min(1).optional(),
  estimatedValue: z.number().min(0).optional(),
  skillsNeeded: z.array(z.string()).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // Company leads require company name
  if (data.leadType === 'company' && !data.companyName) {
    return false
  }
  // Individual leads require first name
  if (data.leadType === 'individual' && !data.firstName) {
    return false
  }
  return true
}, {
  message: 'Company name is required for company leads, first name for individual leads',
})

// Field definitions
export const leadFormFields: FieldDefinition[] = [
  // Lead Type
  {
    key: 'leadType',
    label: 'Lead Type',
    type: 'radio',
    required: true,
    section: 'type',
    columns: 2,
    options: [
      { value: 'company', label: 'Company Lead', icon: Building2 },
      { value: 'individual', label: 'Individual Lead', icon: User },
    ],
  },

  // Company Info (shown when leadType === 'company')
  {
    key: 'companyName',
    label: 'Company Name',
    type: 'text',
    placeholder: 'Acme Corporation',
    required: true,
    section: 'company',
    columns: 2,
    dependsOn: { field: 'leadType', value: 'company' },
  },
  {
    key: 'industry',
    label: 'Industry',
    type: 'select',
    placeholder: 'Select industry...',
    section: 'company',
    dependsOn: { field: 'leadType', value: 'company' },
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
  {
    key: 'companySize',
    label: 'Company Size',
    type: 'select',
    placeholder: 'Select size...',
    section: 'company',
    dependsOn: { field: 'leadType', value: 'company' },
    options: [
      { value: '1-10', label: '1-10 employees' },
      { value: '11-50', label: '11-50 employees' },
      { value: '51-200', label: '51-200 employees' },
      { value: '201-500', label: '201-500 employees' },
      { value: '501-1000', label: '501-1000 employees' },
      { value: '1000+', label: '1000+ employees' },
    ],
  },
  {
    key: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'https://company.com',
    section: 'company',
    dependsOn: { field: 'leadType', value: 'company' },
  },

  // Contact Info
  {
    key: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'John',
    section: 'contact',
    required: true,
    dependsOn: { field: 'leadType', value: 'individual' },
  },
  {
    key: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Smith',
    section: 'contact',
  },
  {
    key: 'title',
    label: 'Job Title',
    type: 'text',
    placeholder: 'VP of Engineering',
    section: 'contact',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@company.com',
    section: 'contact',
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'phone',
    placeholder: '(555) 123-4567',
    section: 'contact',
  },
  {
    key: 'linkedinUrl',
    label: 'LinkedIn URL',
    type: 'url',
    placeholder: 'https://linkedin.com/in/username',
    section: 'contact',
    columns: 2,
  },

  // Source & Opportunity
  {
    key: 'source',
    label: 'Lead Source',
    type: 'select',
    placeholder: 'How did you find this lead?',
    required: true,
    section: 'opportunity',
    options: [
      { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
      { value: 'referral', label: 'Referral', icon: User },
      { value: 'cold_outreach', label: 'Cold Outreach', icon: Phone },
      { value: 'inbound', label: 'Inbound', icon: Mail },
      { value: 'event', label: 'Event' },
      { value: 'website', label: 'Website', icon: Globe },
      { value: 'campaign', label: 'Campaign', icon: Target },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'businessNeed',
    label: 'Business Need',
    type: 'textarea',
    placeholder: 'Describe the opportunity or need...',
    section: 'opportunity',
    columns: 2,
  },
  {
    key: 'positionsCount',
    label: 'Estimated Positions',
    type: 'number',
    placeholder: '5',
    min: 1,
    max: 100,
    section: 'opportunity',
  },
  {
    key: 'estimatedValue',
    label: 'Estimated Value ($)',
    type: 'currency',
    placeholder: '50000',
    min: 0,
    section: 'opportunity',
    currency: 'USD',
  },
  {
    key: 'urgency',
    label: 'Urgency',
    type: 'select',
    placeholder: 'Select urgency...',
    section: 'opportunity',
    options: [
      { value: 'low', label: 'Low - No rush' },
      { value: 'medium', label: 'Medium - Standard timeline' },
      { value: 'high', label: 'High - Fast track needed' },
      { value: 'critical', label: 'Critical - Urgent hire' },
    ],
  },

  // Notes
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Additional notes about this lead...',
    section: 'notes',
    columns: 2,
  },
]

// Form configuration factory
export function createLeadFormConfig(
  onSubmit: (data: LeadFormData) => Promise<unknown>,
  options?: {
    title?: string
    defaultValues?: Partial<LeadFormData>
    onDelete?: (data: LeadFormData) => Promise<void>
  }
): FormConfig<LeadFormData> {
  return {
    title: options?.title || 'Create Lead',
    description: 'Add a new lead to your pipeline',
    entityName: 'Lead',
    variant: 'card',

    sections: [
      {
        id: 'type',
        title: 'Lead Type',
        description: 'Is this a company or individual lead?',
        columns: 1,
        fields: leadFormFields.filter(f => f.section === 'type'),
      },
      {
        id: 'company',
        title: 'Company Information',
        description: 'Details about the company',
        columns: 2,
        fields: leadFormFields.filter(f => f.section === 'company'),
      },
      {
        id: 'contact',
        title: 'Contact Information',
        description: 'Primary contact details',
        columns: 2,
        fields: leadFormFields.filter(f => f.section === 'contact'),
      },
      {
        id: 'opportunity',
        title: 'Opportunity Details',
        description: 'Information about the potential opportunity',
        columns: 2,
        fields: leadFormFields.filter(f => f.section === 'opportunity'),
      },
      {
        id: 'notes',
        title: 'Notes',
        fields: leadFormFields.filter(f => f.section === 'notes'),
        collapsible: true,
        defaultCollapsed: true,
      },
    ],

    defaultValues: options?.defaultValues || {
      leadType: 'company',
      source: 'linkedin',
    },

    validation: leadFormSchema,

    submitLabel: 'Create Lead',
    cancelLabel: 'Cancel',
    successMessage: 'Lead created successfully',
    actionsPosition: 'bottom',
    showDelete: !!options?.onDelete,

    onSubmit,
    onDelete: options?.onDelete,
  }
}

// Pre-built config
export const leadFormConfig: Omit<FormConfig<LeadFormData>, 'onSubmit'> = {
  title: 'Create Lead',
  description: 'Add a new lead to your pipeline',
  entityName: 'Lead',
  variant: 'card',

  sections: [
    {
      id: 'type',
      title: 'Lead Type',
      description: 'Is this a company or individual lead?',
      columns: 1,
      fields: leadFormFields.filter(f => f.section === 'type'),
    },
    {
      id: 'company',
      title: 'Company Information',
      description: 'Details about the company',
      columns: 2,
      fields: leadFormFields.filter(f => f.section === 'company'),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Primary contact details',
      columns: 2,
      fields: leadFormFields.filter(f => f.section === 'contact'),
    },
    {
      id: 'opportunity',
      title: 'Opportunity Details',
      description: 'Information about the potential opportunity',
      columns: 2,
      fields: leadFormFields.filter(f => f.section === 'opportunity'),
    },
    {
      id: 'notes',
      title: 'Notes',
      fields: leadFormFields.filter(f => f.section === 'notes'),
      collapsible: true,
      defaultCollapsed: true,
    },
  ],

  defaultValues: {
    leadType: 'company',
    source: 'linkedin',
  },

  validation: leadFormSchema,

  submitLabel: 'Create Lead',
  cancelLabel: 'Cancel',
  successMessage: 'Lead created successfully',
  actionsPosition: 'bottom',
}

