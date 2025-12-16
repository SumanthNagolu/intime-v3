'use client'

import { z } from 'zod'
import {
  Calendar,
  Video,
  Phone,
  MapPin,
  User,
  FileText,
} from 'lucide-react'
import { FormConfig, FieldDefinition } from '../types'

// Interview form data type
export interface InterviewFormData {
  submissionId: string
  interviewType: 'phone_screen' | 'video_call' | 'in_person' | 'panel' | 'technical' | 'behavioral' | 'final_round'
  roundNumber: number
  durationMinutes: number
  timezone: string
  scheduledDate: string
  scheduledTime: string
  interviewers: Array<{
    name: string
    email: string
    title?: string
  }>
  meetingLink?: string
  meetingLocation?: string
  description?: string
  internalNotes?: string
}

// Validation schema
export const interviewFormSchema = z.object({
  submissionId: z.string().uuid('Please select a submission'),
  interviewType: z.enum(['phone_screen', 'video_call', 'in_person', 'panel', 'technical', 'behavioral', 'final_round']),
  roundNumber: z.number().int().min(1).max(10),
  durationMinutes: z.number().int().min(15).max(480),
  timezone: z.string().min(1, 'Timezone is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  interviewers: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    title: z.string().optional(),
  })).min(1, 'At least one interviewer is required'),
  meetingLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  meetingLocation: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  internalNotes: z.string().max(1000).optional(),
})

// Field definitions
export const interviewFormFields: FieldDefinition[] = [
  // Basic Info
  {
    key: 'submissionId',
    label: 'Submission',
    type: 'select',
    placeholder: 'Select submission...',
    required: true,
    section: 'basic',
    columns: 2,
    options: [], // Populated dynamically
  },
  {
    key: 'interviewType',
    label: 'Interview Type',
    type: 'select',
    placeholder: 'Select type...',
    required: true,
    section: 'basic',
    options: [
      { value: 'phone_screen', label: 'Phone Screen', icon: Phone },
      { value: 'video_call', label: 'Video Interview', icon: Video },
      { value: 'in_person', label: 'On-Site', icon: MapPin },
      { value: 'panel', label: 'Panel Interview', icon: User },
      { value: 'technical', label: 'Technical', icon: FileText },
      { value: 'behavioral', label: 'Behavioral', icon: User },
      { value: 'final_round', label: 'Final Round', icon: Calendar },
    ],
  },
  {
    key: 'roundNumber',
    label: 'Round Number',
    type: 'number',
    placeholder: '1',
    required: true,
    min: 1,
    max: 10,
    section: 'basic',
  },

  // Schedule
  {
    key: 'scheduledDate',
    label: 'Date',
    type: 'date',
    required: true,
    section: 'schedule',
  },
  {
    key: 'scheduledTime',
    label: 'Time',
    type: 'text',
    placeholder: '10:00 AM',
    required: true,
    section: 'schedule',
  },
  {
    key: 'durationMinutes',
    label: 'Duration (minutes)',
    type: 'select',
    required: true,
    section: 'schedule',
    options: [
      { value: '15', label: '15 minutes' },
      { value: '30', label: '30 minutes' },
      { value: '45', label: '45 minutes' },
      { value: '60', label: '1 hour' },
      { value: '90', label: '1.5 hours' },
      { value: '120', label: '2 hours' },
      { value: '180', label: '3 hours' },
      { value: '240', label: '4 hours' },
    ],
  },
  {
    key: 'timezone',
    label: 'Timezone',
    type: 'select',
    required: true,
    section: 'schedule',
    options: [
      { value: 'America/New_York', label: 'Eastern (ET)' },
      { value: 'America/Chicago', label: 'Central (CT)' },
      { value: 'America/Denver', label: 'Mountain (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
      { value: 'America/Phoenix', label: 'Arizona (AZ)' },
      { value: 'UTC', label: 'UTC' },
    ],
  },

  // Location
  {
    key: 'meetingLink',
    label: 'Meeting Link',
    type: 'url',
    placeholder: 'https://zoom.us/j/...',
    section: 'location',
    columns: 2,
  },
  {
    key: 'meetingLocation',
    label: 'Physical Location',
    type: 'text',
    placeholder: '123 Main St, Suite 100',
    section: 'location',
    columns: 2,
  },

  // Notes
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Interview focus areas, topics to cover...',
    section: 'notes',
    columns: 2,
  },
  {
    key: 'internalNotes',
    label: 'Internal Notes',
    type: 'textarea',
    placeholder: 'Notes for internal team only...',
    section: 'notes',
    columns: 2,
  },
]

// Form configuration factory
export function createInterviewFormConfig(
  onSubmit: (data: InterviewFormData) => Promise<unknown>,
  options?: {
    title?: string
    submissionOptions?: Array<{ value: string; label: string }>
    defaultValues?: Partial<InterviewFormData>
    onDelete?: (data: InterviewFormData) => Promise<void>
  }
): FormConfig<InterviewFormData> {
  // Clone fields and inject options
  const fields = interviewFormFields.map(field => {
    if (field.key === 'submissionId' && options?.submissionOptions) {
      return { ...field, options: options.submissionOptions }
    }
    return field
  })

  return {
    title: options?.title || 'Schedule Interview',
    description: 'Schedule an interview with a candidate',
    entityName: 'Interview',
    variant: 'card',

    sections: [
      {
        id: 'basic',
        title: 'Interview Details',
        description: 'Type and round information',
        columns: 2,
        fields: fields.filter(f => f.section === 'basic'),
      },
      {
        id: 'schedule',
        title: 'Schedule',
        description: 'Date, time, and duration',
        columns: 2,
        fields: fields.filter(f => f.section === 'schedule'),
      },
      {
        id: 'location',
        title: 'Location',
        description: 'Meeting link or physical address',
        columns: 1,
        fields: fields.filter(f => f.section === 'location'),
      },
      {
        id: 'notes',
        title: 'Notes',
        fields: fields.filter(f => f.section === 'notes'),
        collapsible: true,
      },
    ],

    defaultValues: options?.defaultValues || {
      roundNumber: 1,
      durationMinutes: 60,
      timezone: 'America/New_York',
      interviewType: 'video_call',
      interviewers: [],
    },

    validation: interviewFormSchema,

    submitLabel: 'Schedule Interview',
    cancelLabel: 'Cancel',
    successMessage: 'Interview scheduled successfully',
    actionsPosition: 'bottom',
    showDelete: !!options?.onDelete,

    onSubmit,
    onDelete: options?.onDelete,
  }
}

// Pre-built config
export const interviewFormConfig: Omit<FormConfig<InterviewFormData>, 'onSubmit'> = {
  title: 'Schedule Interview',
  description: 'Schedule an interview with a candidate',
  entityName: 'Interview',
  variant: 'card',

  sections: [
    {
      id: 'basic',
      title: 'Interview Details',
      description: 'Type and round information',
      columns: 2,
      fields: interviewFormFields.filter(f => f.section === 'basic'),
    },
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'Date, time, and duration',
      columns: 2,
      fields: interviewFormFields.filter(f => f.section === 'schedule'),
    },
    {
      id: 'location',
      title: 'Location',
      description: 'Meeting link or physical address',
      columns: 1,
      fields: interviewFormFields.filter(f => f.section === 'location'),
    },
    {
      id: 'notes',
      title: 'Notes',
      fields: interviewFormFields.filter(f => f.section === 'notes'),
      collapsible: true,
    },
  ],

  defaultValues: {
    roundNumber: 1,
    durationMinutes: 60,
    timezone: 'America/New_York',
    interviewType: 'video_call',
    interviewers: [],
  },

  validation: interviewFormSchema,

  submitLabel: 'Schedule Interview',
  cancelLabel: 'Cancel',
  successMessage: 'Interview scheduled successfully',
  actionsPosition: 'bottom',
}

