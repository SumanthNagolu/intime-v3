/**
 * Job Entity Schema
 *
 * Defines the complete configuration for Job entities in InTime.
 */

import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  Pause,
  Play,
  Send,
  Settings,
  Users,
  XCircle,
} from 'lucide-react'
import type { EntitySchema, FieldDefinition } from '../schema'
import { registerSchema } from '../schema'

// ============================================
// Field Definitions
// ============================================

const jobFields: Record<string, FieldDefinition> = {
  title: {
    key: 'title',
    label: 'Job Title',
    type: 'text',
    required: true,
    placeholder: 'e.g., Senior Software Engineer',
  },
  accountId: {
    key: 'accountId',
    label: 'Account',
    type: 'relation',
    relationEntity: 'account',
    relationField: 'name',
    required: true,
  },
  status: {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'open', label: 'Open' },
      { value: 'on_hold', label: 'On Hold' },
      { value: 'filled', label: 'Filled' },
      { value: 'closed', label: 'Closed' },
    ],
  },
  priority: {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'urgent', label: 'Urgent' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
  jobType: {
    key: 'jobType',
    label: 'Job Type',
    type: 'select',
    options: [
      { value: 'full_time', label: 'Full Time' },
      { value: 'part_time', label: 'Part Time' },
      { value: 'contract', label: 'Contract' },
      { value: 'contract_to_hire', label: 'Contract to Hire' },
    ],
  },
  workType: {
    key: 'workType',
    label: 'Work Type',
    type: 'select',
    options: [
      { value: 'onsite', label: 'On-Site' },
      { value: 'remote', label: 'Remote' },
      { value: 'hybrid', label: 'Hybrid' },
    ],
  },
  location: {
    key: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'e.g., San Francisco, CA',
  },
  department: {
    key: 'department',
    label: 'Department',
    type: 'text',
  },
  positions: {
    key: 'positions',
    label: 'Positions',
    type: 'number',
    min: 1,
    defaultValue: 1,
  },
  minRate: {
    key: 'minRate',
    label: 'Min Rate',
    type: 'currency',
  },
  maxRate: {
    key: 'maxRate',
    label: 'Max Rate',
    type: 'currency',
  },
  rateType: {
    key: 'rateType',
    label: 'Rate Type',
    type: 'select',
    options: [
      { value: 'hourly', label: 'Hourly' },
      { value: 'daily', label: 'Daily' },
      { value: 'annual', label: 'Annual' },
    ],
  },
  startDate: {
    key: 'startDate',
    label: 'Start Date',
    type: 'date',
  },
  endDate: {
    key: 'endDate',
    label: 'End Date',
    type: 'date',
  },
  description: {
    key: 'description',
    label: 'Description',
    type: 'richtext',
  },
  requirements: {
    key: 'requirements',
    label: 'Requirements',
    type: 'richtext',
  },
  skills: {
    key: 'skills',
    label: 'Skills',
    type: 'tags',
  },
  contactId: {
    key: 'contactId',
    label: 'Hiring Manager',
    type: 'relation',
    relationEntity: 'contact',
    relationField: 'name',
  },
  notes: {
    key: 'notes',
    label: 'Internal Notes',
    type: 'textarea',
  },
}

// ============================================
// Job Schema
// ============================================

export const jobSchema: EntitySchema = {
  type: 'job',
  label: {
    singular: 'Job',
    plural: 'Jobs',
  },
  icon: Briefcase,
  basePath: '/jobs',

  // Display
  titleField: 'title',
  subtitleField: 'account.name',

  // Status configuration
  status: {
    field: 'status',
    values: [
      { value: 'draft', label: 'Draft', color: 'neutral', icon: FileText },
      { value: 'open', label: 'Open', color: 'success', icon: Play },
      { value: 'on_hold', label: 'On Hold', color: 'warning', icon: Pause },
      { value: 'filled', label: 'Filled', color: 'info', icon: Users },
      { value: 'closed', label: 'Closed', color: 'neutral', icon: XCircle },
    ],
    transitions: {
      draft: ['open', 'closed'],
      open: ['on_hold', 'filled', 'closed'],
      on_hold: ['open', 'closed'],
      filled: ['closed'],
      closed: [],
    },
  },

  // Quick info bar
  quickInfo: [
    { key: 'account.name', label: 'Account', icon: Building2 },
    { key: 'status', format: 'status' },
    { key: 'location', icon: MapPin },
    { key: 'minRate', label: 'Rate', format: 'currency', icon: DollarSign },
    { key: 'jobType', label: 'Type', icon: Clock },
  ],

  // Tabs
  tabs: [
    {
      id: 'summary',
      label: 'Summary',
      icon: Briefcase,
      fields: ['title', 'accountId', 'status', 'priority', 'jobType', 'location'],
    },
    {
      id: 'details',
      label: 'Details',
      icon: FileText,
      fields: [
        'description',
        'requirements',
        'skills',
        'department',
        'positions',
        'minRate',
        'maxRate',
        'rateType',
        'startDate',
        'endDate',
        'workType',
      ],
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: Users,
      relationEntity: 'submission',
      relationField: 'jobId',
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Calendar,
    },
  ],

  // Actions
  actions: {
    primary: {
      id: 'add-submission',
      label: 'Add Candidate',
      icon: Send,
      variant: 'primary',
      shortcut: 'C',
      type: 'navigate',
      href: (entity) => `/jobs/${entity.id}/add-candidate`,
      showForStatus: ['open'],
    },
    secondary: [
      {
        id: 'publish',
        label: 'Publish',
        icon: Play,
        variant: 'secondary',
        type: 'mutation',
        mutation: 'ats.jobs.publish',
        showForStatus: ['draft'],
      },
      {
        id: 'hold',
        label: 'Put On Hold',
        icon: Pause,
        variant: 'ghost',
        type: 'mutation',
        mutation: 'ats.jobs.hold',
        showForStatus: ['open'],
      },
      {
        id: 'reopen',
        label: 'Reopen',
        icon: Play,
        variant: 'secondary',
        type: 'mutation',
        mutation: 'ats.jobs.reopen',
        showForStatus: ['on_hold'],
      },
    ],
    dropdown: [
      {
        id: 'edit',
        label: 'Edit Job',
        icon: Settings,
        type: 'navigate',
        href: (entity) => `/jobs/${entity.id}/edit`,
        shortcut: 'E',
      },
      {
        id: 'close',
        label: 'Close Job',
        icon: XCircle,
        variant: 'destructive',
        type: 'mutation',
        mutation: 'ats.jobs.close',
        confirmMessage: 'Are you sure you want to close this job?',
        hideForStatus: ['closed'],
      },
    ],
  },

  // List view
  list: {
    columns: [
      { key: 'title', header: 'Title', sortable: true },
      { key: 'account.name', header: 'Account', sortable: true, format: 'relation' },
      { key: 'status', header: 'Status', sortable: true, format: 'status', width: '120px' },
      { key: 'location', header: 'Location', sortable: true },
      { key: 'submissionsCount', header: 'Pipeline', width: '100px' },
      { key: 'createdAt', header: 'Created', sortable: true, format: 'date', width: '120px' },
    ],
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'multiselect',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'open', label: 'Open' },
          { value: 'on_hold', label: 'On Hold' },
          { value: 'filled', label: 'Filled' },
          { value: 'closed', label: 'Closed' },
        ],
      },
      {
        key: 'jobType',
        label: 'Job Type',
        type: 'select',
        options: [
          { value: 'full_time', label: 'Full Time' },
          { value: 'part_time', label: 'Part Time' },
          { value: 'contract', label: 'Contract' },
          { value: 'contract_to_hire', label: 'Contract to Hire' },
        ],
      },
      {
        key: 'accountId',
        label: 'Account',
        type: 'select',
      },
      {
        key: 'createdAt',
        label: 'Created',
        type: 'daterange',
      },
    ],
    defaultSort: { key: 'createdAt', direction: 'desc' },
    searchableFields: ['title', 'account.name', 'location', 'description'],
  },

  // Fields
  fields: jobFields,

  // Relations
  relations: [
    { type: 'submission', field: 'jobId', label: 'Submissions' },
    { type: 'interview', field: 'jobId', label: 'Interviews' },
    { type: 'placement', field: 'jobId', label: 'Placements' },
  ],

  // tRPC procedures
  procedures: {
    list: 'ats.jobs.list',
    get: 'ats.jobs.getFullJob',
    create: 'ats.jobs.create',
    update: 'ats.jobs.update',
    delete: 'ats.jobs.delete',
  },
}

// Register the schema
registerSchema(jobSchema)
