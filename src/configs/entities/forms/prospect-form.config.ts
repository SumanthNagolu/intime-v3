'use client'

import { z } from 'zod'
import {
  Mail,
  Phone,
  Linkedin,
} from 'lucide-react'
import { FormConfig, FieldDefinition } from '../types'

// Prospect form data type
export interface ProspectFormData {
  campaignId: string
  name: string
  email?: string
  company?: string
  title?: string
  phone?: string
  linkedinUrl?: string
  channel?: 'email' | 'linkedin' | 'phone'
  notes?: string
}

// Validation schema
export const prospectFormSchema = z.object({
  campaignId: z.string().uuid('Please select a campaign'),
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  company: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  channel: z.enum(['email', 'linkedin', 'phone']).optional(),
  notes: z.string().optional(),
})

// Field definitions
export const prospectFormFields: FieldDefinition[] = [
  // Campaign Selection
  {
    key: 'campaignId',
    label: 'Campaign',
    type: 'select',
    placeholder: 'Select campaign...',
    required: true,
    section: 'campaign',
    columns: 2,
    options: [], // Populated dynamically
  },

  // Basic Info
  {
    key: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'John Smith',
    required: true,
    section: 'basic',
  },
  {
    key: 'company',
    label: 'Company',
    type: 'text',
    placeholder: 'Acme Corporation',
    section: 'basic',
  },
  {
    key: 'title',
    label: 'Job Title',
    type: 'text',
    placeholder: 'VP of Engineering',
    section: 'basic',
  },

  // Contact Info
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

  // Outreach
  {
    key: 'channel',
    label: 'Preferred Channel',
    type: 'select',
    placeholder: 'Select channel...',
    section: 'outreach',
    options: [
      { value: 'email', label: 'Email', icon: Mail },
      { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
      { value: 'phone', label: 'Phone', icon: Phone },
    ],
  },

  // Notes
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Additional notes about this prospect...',
    section: 'notes',
    columns: 2,
  },
]

// Form configuration factory
export function createProspectFormConfig(
  onSubmit: (data: ProspectFormData) => Promise<unknown>,
  options?: {
    title?: string
    campaignOptions?: Array<{ value: string; label: string }>
    defaultValues?: Partial<ProspectFormData>
    onDelete?: (data: ProspectFormData) => Promise<void>
  }
): FormConfig<ProspectFormData> {
  // Clone fields and inject options
  const fields = prospectFormFields.map(field => {
    if (field.key === 'campaignId' && options?.campaignOptions) {
      return { ...field, options: options.campaignOptions }
    }
    return field
  })

  return {
    title: options?.title || 'Add Prospect',
    description: 'Add a new prospect to a campaign',
    entityName: 'Prospect',
    variant: 'card',

    sections: [
      {
        id: 'campaign',
        title: 'Campaign',
        description: 'Select the campaign for this prospect',
        columns: 1,
        fields: fields.filter(f => f.section === 'campaign'),
      },
      {
        id: 'basic',
        title: 'Basic Information',
        description: 'Prospect name and company',
        columns: 2,
        fields: fields.filter(f => f.section === 'basic'),
      },
      {
        id: 'contact',
        title: 'Contact Information',
        description: 'How to reach this prospect',
        columns: 2,
        fields: fields.filter(f => f.section === 'contact'),
      },
      {
        id: 'outreach',
        title: 'Outreach Preferences',
        columns: 2,
        fields: fields.filter(f => f.section === 'outreach'),
      },
      {
        id: 'notes',
        title: 'Notes',
        fields: fields.filter(f => f.section === 'notes'),
        collapsible: true,
        defaultCollapsed: true,
      },
    ],

    defaultValues: options?.defaultValues || {
      channel: 'email',
    },

    validation: prospectFormSchema,

    submitLabel: 'Add Prospect',
    cancelLabel: 'Cancel',
    successMessage: 'Prospect added successfully',
    actionsPosition: 'bottom',
    showDelete: !!options?.onDelete,

    onSubmit,
    onDelete: options?.onDelete,
  }
}

// Pre-built config
export const prospectFormConfig: Omit<FormConfig<ProspectFormData>, 'onSubmit'> = {
  title: 'Add Prospect',
  description: 'Add a new prospect to a campaign',
  entityName: 'Prospect',
  variant: 'card',

  sections: [
    {
      id: 'campaign',
      title: 'Campaign',
      description: 'Select the campaign for this prospect',
      columns: 1,
      fields: prospectFormFields.filter(f => f.section === 'campaign'),
    },
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Prospect name and company',
      columns: 2,
      fields: prospectFormFields.filter(f => f.section === 'basic'),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'How to reach this prospect',
      columns: 2,
      fields: prospectFormFields.filter(f => f.section === 'contact'),
    },
    {
      id: 'outreach',
      title: 'Outreach Preferences',
      columns: 2,
      fields: prospectFormFields.filter(f => f.section === 'outreach'),
    },
    {
      id: 'notes',
      title: 'Notes',
      fields: prospectFormFields.filter(f => f.section === 'notes'),
      collapsible: true,
      defaultCollapsed: true,
    },
  ],

  defaultValues: {
    channel: 'email',
  },

  validation: prospectFormSchema,

  submitLabel: 'Add Prospect',
  cancelLabel: 'Cancel',
  successMessage: 'Prospect added successfully',
  actionsPosition: 'bottom',
}

