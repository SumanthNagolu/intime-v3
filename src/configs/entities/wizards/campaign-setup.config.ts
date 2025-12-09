'use client'

import { z } from 'zod'
import {
  Megaphone,
  Target,
  MessageSquare,
  FileText,
  Calendar,
  Users,
  Mail,
  Linkedin,
  Phone,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig, FieldDefinition } from '../types'

// Campaign setup form data type
export interface CampaignSetupFormData {
  // Step 1: Campaign Setup
  name: string
  campaignType: 'lead_generation' | 're_engagement' | 'event_promotion' | 'brand_awareness' | 'candidate_sourcing'
  goal: 'generate_qualified_leads' | 'book_discovery_meetings' | 'drive_event_registrations' | 'build_brand_awareness' | 'expand_candidate_pool'
  description?: string

  // Step 2: Target Audience
  audienceSource: 'new_prospects' | 'existing_leads' | 'dormant_accounts' | 'import_list'
  industries?: string[]
  companySizes?: string[]
  regions?: string[]
  targetTitles?: string[]
  exclusions?: string[]

  // Step 3: Channel Strategy
  channels: ('email' | 'linkedin' | 'phone' | 'social')[]
  primaryChannel: 'email' | 'linkedin' | 'phone' | 'social'
  sequenceSteps: number
  stepInterval: number // days between steps

  // Step 4: Content
  emailSubjectLine?: string
  emailTemplate?: string
  linkedinMessageTemplate?: string
  callScript?: string

  // Step 5: Schedule & Goals
  startDate: string
  endDate?: string
  targetLeads: number
  targetMeetings?: number
  budgetTotal?: number
  budgetSpent?: number
}

// Validation schemas per step
export const campaignStep1Schema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters').max(100),
  campaignType: z.enum(['lead_generation', 're_engagement', 'event_promotion', 'brand_awareness', 'candidate_sourcing']),
  goal: z.enum(['generate_qualified_leads', 'book_discovery_meetings', 'drive_event_registrations', 'build_brand_awareness', 'expand_candidate_pool']),
  description: z.string().max(500).optional(),
})

export const campaignStep2Schema = z.object({
  audienceSource: z.enum(['new_prospects', 'existing_leads', 'dormant_accounts', 'import_list']),
  industries: z.array(z.string()).optional(),
  companySizes: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  targetTitles: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
})

export const campaignStep3Schema = z.object({
  channels: z.array(z.enum(['email', 'linkedin', 'phone', 'social'])).min(1, 'Select at least one channel'),
  primaryChannel: z.enum(['email', 'linkedin', 'phone', 'social']),
  sequenceSteps: z.number().min(1).max(10),
  stepInterval: z.number().min(1).max(30),
})

export const campaignStep4Schema = z.object({
  emailSubjectLine: z.string().max(200).optional(),
  emailTemplate: z.string().max(5000).optional(),
  linkedinMessageTemplate: z.string().max(2000).optional(),
  callScript: z.string().max(5000).optional(),
})

export const campaignStep5Schema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  targetLeads: z.number().min(1, 'Target at least 1 lead'),
  targetMeetings: z.number().min(0).optional(),
  budgetTotal: z.number().min(0).optional(),
})

// Full validation schema
export const campaignSetupSchema = campaignStep1Schema
  .merge(campaignStep2Schema)
  .merge(campaignStep3Schema)
  .merge(campaignStep4Schema)
  .merge(campaignStep5Schema)

// Step 1: Campaign Setup Fields
const step1Fields: FieldDefinition[] = [
  {
    key: 'name',
    label: 'Campaign Name',
    type: 'text',
    placeholder: 'Q1 2024 Tech Leads Campaign',
    required: true,
    columns: 2,
  },
  {
    key: 'campaignType',
    label: 'Campaign Type',
    type: 'select',
    placeholder: 'Select type...',
    required: true,
    options: [
      { value: 'lead_generation', label: 'Lead Generation', icon: Target },
      { value: 're_engagement', label: 'Re-engagement', icon: MessageSquare },
      { value: 'event_promotion', label: 'Event Promotion', icon: Calendar },
      { value: 'brand_awareness', label: 'Brand Awareness', icon: Megaphone },
      { value: 'candidate_sourcing', label: 'Candidate Sourcing', icon: Users },
    ],
  },
  {
    key: 'goal',
    label: 'Primary Goal',
    type: 'select',
    placeholder: 'Select goal...',
    required: true,
    options: [
      { value: 'generate_qualified_leads', label: 'Generate Qualified Leads' },
      { value: 'book_discovery_meetings', label: 'Book Discovery Meetings' },
      { value: 'drive_event_registrations', label: 'Drive Event Registrations' },
      { value: 'build_brand_awareness', label: 'Build Brand Awareness' },
      { value: 'expand_candidate_pool', label: 'Expand Candidate Pool' },
    ],
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe the campaign objectives and strategy...',
    columns: 2,
  },
]

// Step 2: Target Audience Fields
const step2Fields: FieldDefinition[] = [
  {
    key: 'audienceSource',
    label: 'Audience Source',
    type: 'radio',
    required: true,
    columns: 1,
    options: [
      { value: 'new_prospects', label: 'New Prospects - Build a new list' },
      { value: 'existing_leads', label: 'Existing Leads - Target existing leads' },
      { value: 'dormant_accounts', label: 'Dormant Accounts - Re-engage inactive accounts' },
      { value: 'import_list', label: 'Import List - Upload a contact list' },
    ],
  },
  {
    key: 'industries',
    label: 'Target Industries',
    type: 'multi-select',
    placeholder: 'Select industries...',
    options: [
      { value: 'technology', label: 'Technology' },
      { value: 'finance', label: 'Finance & Banking' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'retail', label: 'Retail' },
      { value: 'consulting', label: 'Consulting' },
      { value: 'energy', label: 'Energy & Utilities' },
      { value: 'government', label: 'Government' },
    ],
  },
  {
    key: 'companySizes',
    label: 'Company Sizes',
    type: 'multi-select',
    placeholder: 'Select sizes...',
    options: [
      { value: '1-50', label: '1-50 employees' },
      { value: '51-200', label: '51-200 employees' },
      { value: '201-500', label: '201-500 employees' },
      { value: '501-1000', label: '501-1000 employees' },
      { value: '1000+', label: '1000+ employees' },
    ],
  },
  {
    key: 'regions',
    label: 'Geographic Regions',
    type: 'multi-select',
    placeholder: 'Select regions...',
    options: [
      { value: 'northeast', label: 'Northeast US' },
      { value: 'southeast', label: 'Southeast US' },
      { value: 'midwest', label: 'Midwest US' },
      { value: 'southwest', label: 'Southwest US' },
      { value: 'west', label: 'West Coast US' },
      { value: 'canada', label: 'Canada' },
    ],
  },
  {
    key: 'targetTitles',
    label: 'Target Job Titles',
    type: 'multi-select',
    placeholder: 'Select titles...',
    options: [
      { value: 'cto', label: 'CTO' },
      { value: 'vp_engineering', label: 'VP Engineering' },
      { value: 'director_engineering', label: 'Director of Engineering' },
      { value: 'vp_hr', label: 'VP HR' },
      { value: 'director_hr', label: 'Director of HR' },
      { value: 'hiring_manager', label: 'Hiring Manager' },
      { value: 'recruiter', label: 'Recruiter' },
    ],
  },
]

// Step 3: Channel Strategy Fields
const step3Fields: FieldDefinition[] = [
  {
    key: 'channels',
    label: 'Outreach Channels',
    type: 'multi-select',
    placeholder: 'Select channels...',
    required: true,
    columns: 2,
    options: [
      { value: 'email', label: 'Email', icon: Mail },
      { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
      { value: 'phone', label: 'Phone', icon: Phone },
      { value: 'social', label: 'Social Media', icon: MessageSquare },
    ],
  },
  {
    key: 'primaryChannel',
    label: 'Primary Channel',
    type: 'select',
    placeholder: 'Select primary...',
    required: true,
    options: [
      { value: 'email', label: 'Email' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'phone', label: 'Phone' },
      { value: 'social', label: 'Social Media' },
    ],
  },
  {
    key: 'sequenceSteps',
    label: 'Sequence Steps',
    type: 'number',
    placeholder: '5',
    required: true,
    min: 1,
    max: 10,
    description: 'Number of touchpoints in the outreach sequence',
  },
  {
    key: 'stepInterval',
    label: 'Days Between Steps',
    type: 'number',
    placeholder: '3',
    required: true,
    min: 1,
    max: 30,
    description: 'Days to wait between each outreach step',
  },
]

// Step 4: Content Fields
const step4Fields: FieldDefinition[] = [
  {
    key: 'emailSubjectLine',
    label: 'Email Subject Line',
    type: 'text',
    placeholder: 'Quick question about your team',
    columns: 2,
  },
  {
    key: 'emailTemplate',
    label: 'Email Template',
    type: 'rich-text',
    placeholder: 'Write your email template here...',
    columns: 2,
    description: 'Use {{firstName}}, {{company}}, etc. for personalization',
  },
  {
    key: 'linkedinMessageTemplate',
    label: 'LinkedIn Message Template',
    type: 'textarea',
    placeholder: 'Write your LinkedIn message here...',
    columns: 2,
    description: 'Keep under 300 characters for connection requests',
  },
  {
    key: 'callScript',
    label: 'Call Script',
    type: 'textarea',
    placeholder: 'Outline your call script here...',
    columns: 2,
  },
]

// Step 5: Schedule & Goals Fields
const step5Fields: FieldDefinition[] = [
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
    description: 'Leave blank for ongoing campaigns',
  },
  {
    key: 'targetLeads',
    label: 'Target Leads',
    type: 'number',
    placeholder: '100',
    required: true,
    min: 1,
    description: 'Number of leads to generate',
  },
  {
    key: 'targetMeetings',
    label: 'Target Meetings',
    type: 'number',
    placeholder: '20',
    min: 0,
    description: 'Number of meetings to book',
  },
  {
    key: 'budgetTotal',
    label: 'Total Budget ($)',
    type: 'currency',
    placeholder: '5000',
    min: 0,
    currency: 'USD',
  },
]

// Step configurations
export const campaignSetupSteps: WizardStepConfig<CampaignSetupFormData>[] = [
  {
    id: 'setup',
    number: 1,
    label: 'Setup',
    description: 'Campaign name, type, and goal',
    icon: Megaphone,
    fields: step1Fields,
    validation: campaignStep1Schema,
  },
  {
    id: 'audience',
    number: 2,
    label: 'Target Audience',
    description: 'Define your target audience',
    icon: Target,
    fields: step2Fields,
    validation: campaignStep2Schema,
  },
  {
    id: 'channels',
    number: 3,
    label: 'Channel Strategy',
    description: 'Choose outreach channels',
    icon: MessageSquare,
    fields: step3Fields,
    validation: campaignStep3Schema,
  },
  {
    id: 'content',
    number: 4,
    label: 'Content',
    description: 'Create message templates',
    icon: FileText,
    fields: step4Fields,
    validation: campaignStep4Schema,
  },
  {
    id: 'schedule',
    number: 5,
    label: 'Schedule & Goals',
    description: 'Set dates and targets',
    icon: Calendar,
    fields: step5Fields,
    validation: campaignStep5Schema,
  },
]

// Full wizard configuration factory
export function createCampaignSetupConfig(
  onSubmit: (formData: CampaignSetupFormData) => Promise<unknown>,
  options?: {
    onSuccess?: (result: unknown) => void
    cancelRoute?: string
  }
): WizardConfig<CampaignSetupFormData> {
  return {
    title: 'Create Campaign',
    description: 'Set up a new outreach campaign',
    entityType: 'campaign',

    steps: campaignSetupSteps,

    allowFreeNavigation: true,
    stepIndicatorStyle: 'icons',

    reviewStep: {
      title: 'Review & Launch',
      sections: [
        {
          label: 'Campaign Setup',
          fields: ['name', 'campaignType', 'goal'],
          stepNumber: 1,
        },
        {
          label: 'Target Audience',
          fields: ['audienceSource', 'industries'],
          stepNumber: 2,
        },
        {
          label: 'Channels',
          fields: ['channels', 'primaryChannel', 'sequenceSteps'],
          stepNumber: 3,
        },
        {
          label: 'Schedule',
          fields: ['startDate', 'targetLeads', 'targetMeetings'],
          stepNumber: 5,
        },
      ],
    },

    submitLabel: 'Create Campaign',
    saveDraftLabel: 'Save as Draft',
    cancelRoute: options?.cancelRoute || '/employee/crm/campaigns',

    storeName: 'campaign-setup-form',
    defaultFormData: {
      name: '',
      campaignType: 'lead_generation',
      goal: 'generate_qualified_leads',
      audienceSource: 'new_prospects',
      channels: ['email'],
      primaryChannel: 'email',
      sequenceSteps: 5,
      stepInterval: 3,
      startDate: '',
      targetLeads: 100,
    },

    onSubmit,
    onSuccess: options?.onSuccess,
  }
}

// Pre-built config
export const campaignSetupWizardConfig: Omit<WizardConfig<CampaignSetupFormData>, 'onSubmit'> = {
  title: 'Create Campaign',
  description: 'Set up a new outreach campaign',
  entityType: 'campaign',

  steps: campaignSetupSteps,

  allowFreeNavigation: true,
  stepIndicatorStyle: 'icons',

  reviewStep: {
    title: 'Review & Launch',
    sections: [
      {
        label: 'Campaign Setup',
        fields: ['name', 'campaignType', 'goal'],
        stepNumber: 1,
      },
      {
        label: 'Target Audience',
        fields: ['audienceSource', 'industries'],
        stepNumber: 2,
      },
      {
        label: 'Channels',
        fields: ['channels', 'primaryChannel', 'sequenceSteps'],
        stepNumber: 3,
      },
      {
        label: 'Schedule',
        fields: ['startDate', 'targetLeads', 'targetMeetings'],
        stepNumber: 5,
      },
    ],
  },

  submitLabel: 'Create Campaign',
  saveDraftLabel: 'Save as Draft',
  cancelRoute: '/employee/crm/campaigns',

  storeName: 'campaign-setup-form',
  defaultFormData: {
    name: '',
    campaignType: 'lead_generation',
    goal: 'generate_qualified_leads',
    audienceSource: 'new_prospects',
    channels: ['email'],
    primaryChannel: 'email',
    sequenceSteps: 5,
    stepInterval: 3,
    startDate: '',
    targetLeads: 100,
  },
}

