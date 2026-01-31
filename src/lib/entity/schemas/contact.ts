/**
 * Contact Entity Schema
 *
 * Defines the complete configuration for Contact entities in InTime.
 */

import {
  Building2,
  Calendar,
  FileText,
  Link2,
  Mail,
  MapPin,
  Phone,
  Settings,
  Star,
  User,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'
import type { EntitySchema, FieldDefinition } from '../schema'
import { registerSchema } from '../schema'

// ============================================
// Field Definitions
// ============================================

const contactFields: Record<string, FieldDefinition> = {
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
  mobilePhone: {
    key: 'mobilePhone',
    label: 'Mobile',
    type: 'phone',
  },
  status: {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  category: {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'person', label: 'Person' },
      { value: 'company', label: 'Company' },
    ],
    required: true,
  },
  contactType: {
    key: 'contactType',
    label: 'Contact Type',
    type: 'select',
    options: [
      { value: 'hiring_manager', label: 'Hiring Manager' },
      { value: 'hr', label: 'HR' },
      { value: 'procurement', label: 'Procurement' },
      { value: 'executive', label: 'Executive' },
      { value: 'recruiter', label: 'Recruiter' },
      { value: 'other', label: 'Other' },
    ],
  },
  title: {
    key: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g., Director of Engineering',
  },
  department: {
    key: 'department',
    label: 'Department',
    type: 'text',
  },
  accountId: {
    key: 'accountId',
    label: 'Account',
    type: 'relation',
    relationEntity: 'account',
    relationField: 'name',
  },
  linkedinUrl: {
    key: 'linkedinUrl',
    label: 'LinkedIn',
    type: 'url',
  },
  address: {
    key: 'address',
    label: 'Address',
    type: 'address',
  },
  city: {
    key: 'city',
    label: 'City',
    type: 'text',
  },
  state: {
    key: 'state',
    label: 'State',
    type: 'text',
  },
  country: {
    key: 'country',
    label: 'Country',
    type: 'text',
    defaultValue: 'United States',
  },
  isPrimary: {
    key: 'isPrimary',
    label: 'Primary Contact',
    type: 'boolean',
    description: 'This is the primary contact for the account',
  },
  preferredContactMethod: {
    key: 'preferredContactMethod',
    label: 'Preferred Contact Method',
    type: 'select',
    options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'text', label: 'Text' },
    ],
    defaultValue: 'email',
  },
  timezone: {
    key: 'timezone',
    label: 'Timezone',
    type: 'select',
    options: [
      { value: 'America/New_York', label: 'Eastern Time' },
      { value: 'America/Chicago', label: 'Central Time' },
      { value: 'America/Denver', label: 'Mountain Time' },
      { value: 'America/Los_Angeles', label: 'Pacific Time' },
    ],
  },
  notes: {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
  },
}

// ============================================
// Contact Schema
// ============================================

export const contactSchema: EntitySchema = {
  type: 'contact',
  label: {
    singular: 'Contact',
    plural: 'Contacts',
  },
  icon: User,
  basePath: '/contacts',

  // Display
  titleField: 'fullName', // Computed: firstName + lastName
  subtitleField: 'title',
  avatarField: 'avatarUrl',

  // Status configuration
  status: {
    field: 'status',
    values: [
      { value: 'active', label: 'Active', color: 'success', icon: UserCheck },
      { value: 'inactive', label: 'Inactive', color: 'neutral', icon: UserX },
    ],
    transitions: {
      active: ['inactive'],
      inactive: ['active'],
    },
  },

  // Quick info bar
  quickInfo: [
    { key: 'status', format: 'status' },
    { key: 'title', icon: Briefcase },
    { key: 'account.name', label: 'Account', icon: Building2, format: 'relation' },
    { key: 'email', icon: Mail },
    { key: 'phone', icon: Phone },
    { key: 'city', icon: MapPin },
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
        'mobilePhone',
        'status',
        'category',
        'contactType',
      ],
    },
    {
      id: 'details',
      label: 'Details',
      icon: FileText,
      fields: [
        'title',
        'department',
        'accountId',
        'linkedinUrl',
        'address',
        'city',
        'state',
        'country',
        'isPrimary',
        'preferredContactMethod',
        'timezone',
      ],
    },
    {
      id: 'relationships',
      label: 'Relationships',
      icon: Users,
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
      id: 'email',
      label: 'Send Email',
      icon: Mail,
      variant: 'primary',
      shortcut: 'M',
      type: 'modal',
    },
    secondary: [
      {
        id: 'call',
        label: 'Call',
        icon: Phone,
        variant: 'secondary',
        type: 'navigate',
        href: (entity) => `tel:${entity.phone}`,
      },
    ],
    dropdown: [
      {
        id: 'edit',
        label: 'Edit Contact',
        icon: Settings,
        type: 'navigate',
        href: (entity) => `/contacts/${entity.id}/edit`,
        shortcut: 'E',
      },
      {
        id: 'linkedin',
        label: 'View LinkedIn',
        icon: Link2,
        type: 'navigate',
        href: (entity) => entity.linkedinUrl as string,
      },
      {
        id: 'set-primary',
        label: 'Set as Primary',
        icon: Star,
        type: 'mutation',
        mutation: 'contacts.setPrimary',
      },
      {
        id: 'deactivate',
        label: 'Deactivate',
        icon: UserX,
        variant: 'destructive',
        type: 'mutation',
        mutation: 'contacts.deactivate',
        confirmMessage: 'Are you sure you want to deactivate this contact?',
        showForStatus: ['active'],
      },
    ],
  },

  // List view
  list: {
    columns: [
      { key: 'fullName', header: 'Name', sortable: true, format: 'avatar' },
      { key: 'title', header: 'Title', sortable: true },
      { key: 'account.name', header: 'Account', sortable: true, format: 'relation' },
      { key: 'status', header: 'Status', sortable: true, format: 'status', width: '100px' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone', width: '140px' },
      { key: 'contactType', header: 'Type', width: '120px' },
    ],
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
      {
        key: 'contactType',
        label: 'Type',
        type: 'multiselect',
        options: [
          { value: 'hiring_manager', label: 'Hiring Manager' },
          { value: 'hr', label: 'HR' },
          { value: 'procurement', label: 'Procurement' },
          { value: 'executive', label: 'Executive' },
          { value: 'recruiter', label: 'Recruiter' },
        ],
      },
      {
        key: 'accountId',
        label: 'Account',
        type: 'select',
      },
      {
        key: 'isPrimary',
        label: 'Primary Only',
        type: 'boolean',
      },
    ],
    defaultSort: { key: 'lastName', direction: 'asc' },
    searchableFields: ['firstName', 'lastName', 'email', 'title', 'account.name'],
  },

  // Fields
  fields: contactFields,

  // Relations
  relations: [
    { type: 'account', field: 'accountId', label: 'Account' },
    { type: 'job', field: 'contactId', label: 'Jobs' },
  ],

  // tRPC procedures
  procedures: {
    list: 'contacts.list',
    get: 'contacts.getFullContact',
    create: 'contacts.create',
    update: 'contacts.update',
    delete: 'contacts.delete',
  },
}

// Helper - need to import Briefcase for the icon
import { Briefcase } from 'lucide-react'

// Register the schema
registerSchema(contactSchema)
