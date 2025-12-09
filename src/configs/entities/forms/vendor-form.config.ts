'use client'

import { z } from 'zod'
import {
  Building2,
  Globe,
  Star,
  Package,
  Target,
  Settings,
  User,
  Mail,
  Phone,
} from 'lucide-react'
import { FormConfig, FieldDefinition } from '../types'

// Vendor form data type
export interface VendorFormData {
  name: string
  type: 'direct_client' | 'prime_vendor' | 'sub_vendor' | 'msp' | 'vms'
  tier?: 'preferred' | 'standard' | 'new'
  website?: string
  industryFocus?: string[]
  geographicFocus?: string[]
  notes?: string
  // Primary contact
  primaryContactName?: string
  primaryContactEmail?: string
  primaryContactPhone?: string
  primaryContactTitle?: string
}

// Validation schema
export const vendorFormSchema = z.object({
  name: z.string().min(2, 'Vendor name must be at least 2 characters').max(200),
  type: z.enum(['direct_client', 'prime_vendor', 'sub_vendor', 'msp', 'vms']),
  tier: z.enum(['preferred', 'standard', 'new']).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  industryFocus: z.array(z.string()).optional(),
  geographicFocus: z.array(z.string()).optional(),
  notes: z.string().optional(),
  primaryContactName: z.string().optional(),
  primaryContactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  primaryContactPhone: z.string().optional(),
  primaryContactTitle: z.string().optional(),
})

// Field definitions
export const vendorFormFields: FieldDefinition[] = [
  // Basic Info
  {
    key: 'name',
    label: 'Vendor Name',
    type: 'text',
    placeholder: 'Enter vendor name...',
    required: true,
    section: 'basic',
    columns: 2,
  },
  {
    key: 'type',
    label: 'Vendor Type',
    type: 'select',
    placeholder: 'Select vendor type...',
    required: true,
    section: 'basic',
    options: [
      { value: 'direct_client', label: 'Direct Client', icon: Building2 },
      { value: 'prime_vendor', label: 'Prime Vendor', icon: Star },
      { value: 'sub_vendor', label: 'Sub Vendor', icon: Package },
      { value: 'msp', label: 'MSP', icon: Target },
      { value: 'vms', label: 'VMS', icon: Settings },
    ],
  },
  {
    key: 'tier',
    label: 'Vendor Tier',
    type: 'select',
    placeholder: 'Select tier...',
    section: 'basic',
    options: [
      { value: 'preferred', label: 'Preferred', icon: Star },
      { value: 'standard', label: 'Standard' },
      { value: 'new', label: 'New' },
    ],
  },
  {
    key: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'https://vendor.com',
    section: 'basic',
  },

  // Focus Areas
  {
    key: 'industryFocus',
    label: 'Industry Focus',
    type: 'multi-select',
    placeholder: 'Select industries...',
    section: 'focus',
    columns: 2,
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
    ],
  },
  {
    key: 'geographicFocus',
    label: 'Geographic Focus',
    type: 'multi-select',
    placeholder: 'Select regions...',
    section: 'focus',
    columns: 2,
    options: [
      { value: 'northeast', label: 'Northeast US' },
      { value: 'southeast', label: 'Southeast US' },
      { value: 'midwest', label: 'Midwest US' },
      { value: 'southwest', label: 'Southwest US' },
      { value: 'west', label: 'West Coast US' },
      { value: 'canada', label: 'Canada' },
      { value: 'international', label: 'International' },
    ],
  },

  // Primary Contact
  {
    key: 'primaryContactName',
    label: 'Contact Name',
    type: 'text',
    placeholder: 'John Smith',
    section: 'contact',
  },
  {
    key: 'primaryContactTitle',
    label: 'Contact Title',
    type: 'text',
    placeholder: 'Account Manager',
    section: 'contact',
  },
  {
    key: 'primaryContactEmail',
    label: 'Contact Email',
    type: 'email',
    placeholder: 'john@vendor.com',
    section: 'contact',
  },
  {
    key: 'primaryContactPhone',
    label: 'Contact Phone',
    type: 'phone',
    placeholder: '(555) 123-4567',
    section: 'contact',
  },

  // Notes
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Additional notes about this vendor...',
    section: 'notes',
    columns: 2,
  },
]

// Form configuration factory
export function createVendorFormConfig(
  onSubmit: (data: VendorFormData) => Promise<unknown>,
  options?: {
    title?: string
    defaultValues?: Partial<VendorFormData>
    onDelete?: (data: VendorFormData) => Promise<void>
  }
): FormConfig<VendorFormData> {
  return {
    title: options?.title || 'Add Vendor',
    description: 'Create a new vendor relationship',
    entityName: 'Vendor',
    variant: 'card',

    sections: [
      {
        id: 'basic',
        title: 'Vendor Information',
        description: 'Basic vendor details',
        columns: 2,
        fields: vendorFormFields.filter(f => f.section === 'basic'),
      },
      {
        id: 'focus',
        title: 'Focus Areas',
        description: 'Industries and regions this vendor covers',
        columns: 2,
        fields: vendorFormFields.filter(f => f.section === 'focus'),
        collapsible: true,
      },
      {
        id: 'contact',
        title: 'Primary Contact',
        description: 'Main point of contact at this vendor',
        columns: 2,
        fields: vendorFormFields.filter(f => f.section === 'contact'),
      },
      {
        id: 'notes',
        title: 'Notes',
        fields: vendorFormFields.filter(f => f.section === 'notes'),
        collapsible: true,
        defaultCollapsed: true,
      },
    ],

    defaultValues: options?.defaultValues || {
      type: 'sub_vendor',
      tier: 'new',
    },

    validation: vendorFormSchema,

    submitLabel: 'Create Vendor',
    cancelLabel: 'Cancel',
    successMessage: 'Vendor created successfully',
    actionsPosition: 'bottom',
    showDelete: !!options?.onDelete,

    onSubmit,
    onDelete: options?.onDelete,
  }
}

// Pre-built config
export const vendorFormConfig: Omit<FormConfig<VendorFormData>, 'onSubmit'> = {
  title: 'Add Vendor',
  description: 'Create a new vendor relationship',
  entityName: 'Vendor',
  variant: 'card',

  sections: [
    {
      id: 'basic',
      title: 'Vendor Information',
      description: 'Basic vendor details',
      columns: 2,
      fields: vendorFormFields.filter(f => f.section === 'basic'),
    },
    {
      id: 'focus',
      title: 'Focus Areas',
      description: 'Industries and regions this vendor covers',
      columns: 2,
      fields: vendorFormFields.filter(f => f.section === 'focus'),
      collapsible: true,
    },
    {
      id: 'contact',
      title: 'Primary Contact',
      description: 'Main point of contact at this vendor',
      columns: 2,
      fields: vendorFormFields.filter(f => f.section === 'contact'),
    },
    {
      id: 'notes',
      title: 'Notes',
      fields: vendorFormFields.filter(f => f.section === 'notes'),
      collapsible: true,
      defaultCollapsed: true,
    },
  ],

  defaultValues: {
    type: 'sub_vendor',
    tier: 'new',
  },

  validation: vendorFormSchema,

  submitLabel: 'Create Vendor',
  cancelLabel: 'Cancel',
  successMessage: 'Vendor created successfully',
  actionsPosition: 'bottom',
}

