/**
 * Candidate Entity Schema
 *
 * Defines the complete configuration for Candidate entities in InTime.
 */

import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  FileText,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Phone,
  Send,
  Settings,
  Star,
  User,
  UserCheck,
  UserX,
} from 'lucide-react'
import type { EntitySchema, FieldDefinition } from '../schema'
import { registerSchema } from '../schema'

// ============================================
// Field Definitions
// ============================================

const candidateFields: Record<string, FieldDefinition> = {
  firstName: {
    key: 'firstName',
    label: 'First Name',
    type: 'text',
    required: true,
  },
  lastName: {
    key: 'lastName',
    label: 'Last Name',
    type: 'text',
    required: true,
  },
  email: {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
  },
  phone: {
    key: 'phone',
    label: 'Phone',
    type: 'phone',
  },
  linkedinUrl: {
    key: 'linkedinUrl',
    label: 'LinkedIn',
    type: 'url',
  },
  status: {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'new', label: 'New' },
      { value: 'active', label: 'Active' },
      { value: 'placed', label: 'Placed' },
      { value: 'on_hold', label: 'On Hold' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  source: {
    key: 'source',
    label: 'Source',
    type: 'select',
    options: [
      { value: 'referral', label: 'Referral' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'job_board', label: 'Job Board' },
      { value: 'website', label: 'Website' },
      { value: 'agency', label: 'Agency' },
      { value: 'other', label: 'Other' },
    ],
  },
  currentTitle: {
    key: 'currentTitle',
    label: 'Current Title',
    type: 'text',
  },
  currentCompany: {
    key: 'currentCompany',
    label: 'Current Company',
    type: 'text',
  },
  location: {
    key: 'location',
    label: 'Location',
    type: 'text',
  },
  workAuthorization: {
    key: 'workAuthorization',
    label: 'Work Authorization',
    type: 'select',
    options: [
      { value: 'us_citizen', label: 'US Citizen' },
      { value: 'green_card', label: 'Green Card' },
      { value: 'h1b', label: 'H1B' },
      { value: 'opt', label: 'OPT' },
      { value: 'cpt', label: 'CPT' },
      { value: 'tn', label: 'TN' },
      { value: 'other', label: 'Other' },
    ],
  },
  desiredRate: {
    key: 'desiredRate',
    label: 'Desired Rate',
    type: 'currency',
  },
  rateType: {
    key: 'rateType',
    label: 'Rate Type',
    type: 'select',
    options: [
      { value: 'hourly', label: 'Hourly' },
      { value: 'annual', label: 'Annual' },
    ],
  },
  availableDate: {
    key: 'availableDate',
    label: 'Available Date',
    type: 'date',
  },
  willingToRelocate: {
    key: 'willingToRelocate',
    label: 'Willing to Relocate',
    type: 'boolean',
  },
  preferredWorkType: {
    key: 'preferredWorkType',
    label: 'Preferred Work Type',
    type: 'select',
    options: [
      { value: 'onsite', label: 'On-Site' },
      { value: 'remote', label: 'Remote' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'any', label: 'Any' },
    ],
  },
  skills: {
    key: 'skills',
    label: 'Skills',
    type: 'tags',
  },
  yearsOfExperience: {
    key: 'yearsOfExperience',
    label: 'Years of Experience',
    type: 'number',
    min: 0,
  },
  summary: {
    key: 'summary',
    label: 'Summary',
    type: 'richtext',
  },
  notes: {
    key: 'notes',
    label: 'Internal Notes',
    type: 'textarea',
  },
  resumeUrl: {
    key: 'resumeUrl',
    label: 'Resume',
    type: 'file',
  },
  rating: {
    key: 'rating',
    label: 'Rating',
    type: 'number',
    min: 0,
    max: 5,
  },
}

// ============================================
// Candidate Schema
// ============================================

export const candidateSchema: EntitySchema = {
  type: 'candidate',
  label: {
    singular: 'Candidate',
    plural: 'Candidates',
  },
  icon: User,
  basePath: '/candidates',

  // Display
  titleField: 'fullName', // Computed field: firstName + lastName
  subtitleField: 'currentTitle',
  avatarField: 'avatarUrl',

  // Status configuration
  status: {
    field: 'status',
    values: [
      { value: 'new', label: 'New', color: 'info', icon: User },
      { value: 'active', label: 'Active', color: 'success', icon: UserCheck },
      { value: 'placed', label: 'Placed', color: 'success', icon: Award },
      { value: 'on_hold', label: 'On Hold', color: 'warning' },
      { value: 'inactive', label: 'Inactive', color: 'neutral', icon: UserX },
    ],
    transitions: {
      new: ['active', 'on_hold', 'inactive'],
      active: ['placed', 'on_hold', 'inactive'],
      placed: ['active', 'inactive'],
      on_hold: ['active', 'inactive'],
      inactive: ['active'],
    },
  },

  // Quick info bar
  quickInfo: [
    { key: 'status', format: 'status' },
    { key: 'currentTitle' },
    { key: 'currentCompany', icon: Briefcase },
    { key: 'location', icon: MapPin },
    { key: 'email', icon: Mail },
    { key: 'phone', icon: Phone },
  ],

  // Tabs
  tabs: [
    {
      id: 'summary',
      label: 'Summary',
      icon: User,
      fields: [
        'firstName',
        'lastName',
        'email',
        'phone',
        'linkedinUrl',
        'status',
        'source',
        'currentTitle',
        'currentCompany',
        'location',
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: FileText,
      fields: [
        'workAuthorization',
        'desiredRate',
        'rateType',
        'availableDate',
        'willingToRelocate',
        'preferredWorkType',
        'yearsOfExperience',
        'summary',
        'skills',
      ],
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: Briefcase,
    },
    {
      id: 'education',
      label: 'Education',
      icon: GraduationCap,
    },
    {
      id: 'submissions',
      label: 'Submissions',
      icon: Send,
      relationEntity: 'submission',
      relationField: 'candidateId',
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
      id: 'submit-to-job',
      label: 'Submit to Job',
      icon: Send,
      variant: 'primary',
      shortcut: 'S',
      type: 'modal',
      showForStatus: ['active', 'new'],
    },
    secondary: [
      {
        id: 'contact',
        label: 'Contact',
        icon: Mail,
        variant: 'secondary',
        type: 'modal',
      },
      {
        id: 'rate',
        label: 'Rate',
        icon: Star,
        variant: 'ghost',
        type: 'modal',
      },
    ],
    dropdown: [
      {
        id: 'edit',
        label: 'Edit Candidate',
        icon: Settings,
        type: 'navigate',
        href: (entity) => `/candidates/${entity.id}/edit`,
        shortcut: 'E',
      },
      {
        id: 'view-resume',
        label: 'View Resume',
        icon: FileText,
        type: 'navigate',
        href: (entity) => entity.resumeUrl as string,
      },
      {
        id: 'linkedin',
        label: 'View LinkedIn',
        icon: Link2,
        type: 'navigate',
        href: (entity) => entity.linkedinUrl as string,
      },
    ],
  },

  // List view
  list: {
    columns: [
      { key: 'fullName', header: 'Name', sortable: true, format: 'avatar' },
      { key: 'currentTitle', header: 'Title', sortable: true },
      { key: 'status', header: 'Status', sortable: true, format: 'status', width: '120px' },
      { key: 'location', header: 'Location', sortable: true },
      { key: 'skills', header: 'Skills', width: '200px' },
      { key: 'submissionsCount', header: 'Submissions', width: '100px' },
      { key: 'rating', header: 'Rating', width: '80px' },
      { key: 'createdAt', header: 'Added', sortable: true, format: 'date', width: '100px' },
    ],
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'multiselect',
        options: [
          { value: 'new', label: 'New' },
          { value: 'active', label: 'Active' },
          { value: 'placed', label: 'Placed' },
          { value: 'on_hold', label: 'On Hold' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
      {
        key: 'source',
        label: 'Source',
        type: 'select',
        options: [
          { value: 'referral', label: 'Referral' },
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'job_board', label: 'Job Board' },
          { value: 'website', label: 'Website' },
          { value: 'agency', label: 'Agency' },
        ],
      },
      {
        key: 'workAuthorization',
        label: 'Work Authorization',
        type: 'select',
        options: [
          { value: 'us_citizen', label: 'US Citizen' },
          { value: 'green_card', label: 'Green Card' },
          { value: 'h1b', label: 'H1B' },
          { value: 'opt', label: 'OPT' },
        ],
      },
      {
        key: 'skills',
        label: 'Skills',
        type: 'multiselect',
      },
    ],
    defaultSort: { key: 'createdAt', direction: 'desc' },
    searchableFields: ['firstName', 'lastName', 'email', 'currentTitle', 'currentCompany', 'skills'],
  },

  // Fields
  fields: candidateFields,

  // Relations
  relations: [
    { type: 'submission', field: 'candidateId', label: 'Submissions' },
    { type: 'interview', field: 'candidateId', label: 'Interviews' },
    { type: 'placement', field: 'candidateId', label: 'Placements' },
  ],

  // tRPC procedures
  procedures: {
    list: 'ats.candidates.list',
    get: 'ats.candidates.getFullCandidate',
    create: 'ats.candidates.create',
    update: 'ats.candidates.update',
    delete: 'ats.candidates.delete',
  },
}

// Register the schema
registerSchema(candidateSchema)
