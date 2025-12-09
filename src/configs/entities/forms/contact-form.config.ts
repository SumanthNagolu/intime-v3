'use client'

import { z } from 'zod'
import {
  User,
  Mail,
  Phone,
  Building2,
  Linkedin,
  MessageSquare,
} from 'lucide-react'
import { FormConfig, FieldDefinition } from '../types'

// Contact form data type
export interface ContactFormData {
  accountId: string
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  mobile?: string
  title?: string
  department?: string
  linkedinUrl?: string
  preferredContactMethod?: string
  bestTimeToContact?: string
  timezone?: string
  decisionAuthority?: string
  isPrimary?: boolean
  isDecisionMaker?: boolean
  notes?: string
}

// Validation schema
export const contactFormSchema = z.object({
  accountId: z.string().uuid('Please select an account'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  preferredContactMethod: z.enum(['email', 'phone', 'linkedin', 'text', 'video_call']).optional(),
  bestTimeToContact: z.string().optional(),
  timezone: z.string().optional(),
  decisionAuthority: z.enum(['decision_maker', 'influencer', 'gatekeeper', 'end_user', 'champion']).optional(),
  isPrimary: z.boolean().optional(),
  isDecisionMaker: z.boolean().optional(),
  notes: z.string().optional(),
})

// Field definitions
export const contactFormFields: FieldDefinition[] = [
  // Basic Info Section
  {
    key: 'accountId',
    label: 'Account',
    type: 'select',
    placeholder: 'Select account...',
    required: true,
    section: 'basic',
    columns: 2,
    // Options populated dynamically from account list
    options: [],
  },
  {
    key: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'John',
    required: true,
    section: 'basic',
  },
  {
    key: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Smith',
    section: 'basic',
  },
  {
    key: 'title',
    label: 'Job Title',
    type: 'text',
    placeholder: 'VP of Engineering',
    section: 'basic',
  },
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    placeholder: 'Select department...',
    section: 'basic',
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'finance', label: 'Finance' },
      { value: 'operations', label: 'Operations' },
      { value: 'sales', label: 'Sales' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'it', label: 'IT' },
      { value: 'legal', label: 'Legal' },
      { value: 'executive', label: 'Executive' },
      { value: 'other', label: 'Other' },
    ],
  },

  // Contact Info Section
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@company.com',
    section: 'contact',
  },
  {
    key: 'phone',
    label: 'Work Phone',
    type: 'phone',
    placeholder: '(555) 123-4567',
    section: 'contact',
  },
  {
    key: 'mobile',
    label: 'Mobile',
    type: 'phone',
    placeholder: '(555) 987-6543',
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

  // Preferences Section
  {
    key: 'preferredContactMethod',
    label: 'Preferred Contact Method',
    type: 'select',
    placeholder: 'Select method...',
    section: 'preferences',
    options: [
      { value: 'email', label: 'Email', icon: Mail },
      { value: 'phone', label: 'Phone', icon: Phone },
      { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
      { value: 'text', label: 'Text Message', icon: MessageSquare },
      { value: 'video_call', label: 'Video Call' },
    ],
  },
  {
    key: 'bestTimeToContact',
    label: 'Best Time to Contact',
    type: 'text',
    placeholder: 'e.g., Mornings EST',
    section: 'preferences',
  },
  {
    key: 'timezone',
    label: 'Timezone',
    type: 'select',
    placeholder: 'Select timezone...',
    section: 'preferences',
    options: [
      { value: 'America/New_York', label: 'Eastern (ET)' },
      { value: 'America/Chicago', label: 'Central (CT)' },
      { value: 'America/Denver', label: 'Mountain (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
      { value: 'America/Phoenix', label: 'Arizona (AZ)' },
      { value: 'America/Anchorage', label: 'Alaska (AK)' },
      { value: 'Pacific/Honolulu', label: 'Hawaii (HI)' },
    ],
  },

  // Role Section
  {
    key: 'decisionAuthority',
    label: 'Decision Authority',
    type: 'select',
    placeholder: 'Select role...',
    section: 'role',
    options: [
      { value: 'decision_maker', label: 'Decision Maker' },
      { value: 'influencer', label: 'Influencer' },
      { value: 'gatekeeper', label: 'Gatekeeper' },
      { value: 'end_user', label: 'End User' },
      { value: 'champion', label: 'Champion' },
    ],
  },
  {
    key: 'isPrimary',
    label: 'Primary Contact',
    type: 'checkbox',
    description: 'Set as primary contact for this account',
    section: 'role',
  },
  {
    key: 'isDecisionMaker',
    label: 'Decision Maker',
    type: 'checkbox',
    description: 'Has budget/hiring authority',
    section: 'role',
  },

  // Notes Section
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Additional notes about this contact...',
    section: 'notes',
    columns: 2,
  },
]

// Form configuration factory - returns config with provided onSubmit handler
export function createContactFormConfig(
  onSubmit: (data: ContactFormData) => Promise<unknown>,
  options?: {
    title?: string
    accountOptions?: Array<{ value: string; label: string }>
    defaultValues?: Partial<ContactFormData>
    onDelete?: (data: ContactFormData) => Promise<void>
  }
): FormConfig<ContactFormData> {
  // Clone fields and inject account options if provided
  const fields = contactFormFields.map(field => {
    if (field.key === 'accountId' && options?.accountOptions) {
      return { ...field, options: options.accountOptions }
    }
    return field
  })

  return {
    title: options?.title || 'Add Contact',
    description: 'Create a new contact for an account',
    entityName: 'Contact',
    variant: 'card',

    sections: [
      {
        id: 'basic',
        title: 'Basic Information',
        description: 'Contact name and role',
        columns: 2,
        fields: fields.filter(f => f.section === 'basic'),
      },
      {
        id: 'contact',
        title: 'Contact Information',
        description: 'How to reach this contact',
        columns: 2,
        fields: fields.filter(f => f.section === 'contact'),
      },
      {
        id: 'preferences',
        title: 'Communication Preferences',
        columns: 2,
        fields: fields.filter(f => f.section === 'preferences'),
        collapsible: true,
      },
      {
        id: 'role',
        title: 'Role & Authority',
        columns: 2,
        fields: fields.filter(f => f.section === 'role'),
        collapsible: true,
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
      isPrimary: false,
      isDecisionMaker: false,
    },

    validation: contactFormSchema,

    submitLabel: 'Create Contact',
    cancelLabel: 'Cancel',
    successMessage: 'Contact created successfully',
    actionsPosition: 'bottom',
    showDelete: !!options?.onDelete,

    onSubmit,
    onDelete: options?.onDelete,
  }
}

// Pre-built config for quick use (requires onSubmit to be set)
export const contactFormConfig: Omit<FormConfig<ContactFormData>, 'onSubmit'> = {
  title: 'Add Contact',
  description: 'Create a new contact for an account',
  entityName: 'Contact',
  variant: 'card',

  sections: [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Contact name and role',
      columns: 2,
      fields: contactFormFields.filter(f => f.section === 'basic'),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'How to reach this contact',
      columns: 2,
      fields: contactFormFields.filter(f => f.section === 'contact'),
    },
    {
      id: 'preferences',
      title: 'Communication Preferences',
      columns: 2,
      fields: contactFormFields.filter(f => f.section === 'preferences'),
      collapsible: true,
    },
    {
      id: 'role',
      title: 'Role & Authority',
      columns: 2,
      fields: contactFormFields.filter(f => f.section === 'role'),
      collapsible: true,
    },
    {
      id: 'notes',
      title: 'Notes',
      fields: contactFormFields.filter(f => f.section === 'notes'),
      collapsible: true,
      defaultCollapsed: true,
    },
  ],

  defaultValues: {
    isPrimary: false,
    isDecisionMaker: false,
  },

  validation: contactFormSchema,

  submitLabel: 'Create Contact',
  cancelLabel: 'Cancel',
  successMessage: 'Contact created successfully',
  actionsPosition: 'bottom',
}

