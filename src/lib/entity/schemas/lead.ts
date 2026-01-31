/**
 * Lead Entity Schema
 *
 * Defines the complete configuration for Lead entities in InTime.
 */

import {
  Building2,
  Calendar,
  Check,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Phone,
  Settings,
  Target,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react'
import type { EntitySchema, FieldDefinition } from '../schema'
import { registerSchema } from '../schema'

// ============================================
// Field Definitions
// ============================================

const leadFields: Record<string, FieldDefinition> = {
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
  company: {
    key: 'company',
    label: 'Company',
    type: 'text',
  },
  title: {
    key: 'title',
    label: 'Title',
    type: 'text',
  },
  status: {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'new', label: 'New' },
      { value: 'contacted', label: 'Contacted' },
      { value: 'qualified', label: 'Qualified' },
      { value: 'unqualified', label: 'Unqualified' },
      { value: 'converted', label: 'Converted' },
    ],
  },
  source: {
    key: 'source',
    label: 'Source',
    type: 'select',
    options: [
      { value: 'website', label: 'Website' },
      { value: 'referral', label: 'Referral' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'cold_call', label: 'Cold Call' },
      { value: 'event', label: 'Event' },
      { value: 'advertisement', label: 'Advertisement' },
      { value: 'other', label: 'Other' },
    ],
  },
  rating: {
    key: 'rating',
    label: 'Rating',
    type: 'select',
    options: [
      { value: 'hot', label: 'Hot' },
      { value: 'warm', label: 'Warm' },
      { value: 'cold', label: 'Cold' },
    ],
  },
  industry: {
    key: 'industry',
    label: 'Industry',
    type: 'select',
    options: [
      { value: 'technology', label: 'Technology' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'finance', label: 'Finance' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'retail', label: 'Retail' },
      { value: 'other', label: 'Other' },
    ],
  },
  companySize: {
    key: 'companySize',
    label: 'Company Size',
    type: 'select',
    options: [
      { value: '1-10', label: '1-10' },
      { value: '11-50', label: '11-50' },
      { value: '51-200', label: '51-200' },
      { value: '201-500', label: '201-500' },
      { value: '501-1000', label: '501-1000' },
      { value: '1001+', label: '1001+' },
    ],
  },
  estimatedValue: {
    key: 'estimatedValue',
    label: 'Estimated Value',
    type: 'currency',
  },
  location: {
    key: 'location',
    label: 'Location',
    type: 'text',
  },
  website: {
    key: 'website',
    label: 'Website',
    type: 'url',
  },
  linkedinUrl: {
    key: 'linkedinUrl',
    label: 'LinkedIn',
    type: 'url',
  },
  description: {
    key: 'description',
    label: 'Description',
    type: 'textarea',
  },
  notes: {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
  },
  ownerId: {
    key: 'ownerId',
    label: 'Owner',
    type: 'relation',
    relationEntity: 'contact',
    relationField: 'fullName',
  },
  campaignId: {
    key: 'campaignId',
    label: 'Campaign',
    type: 'relation',
    relationEntity: 'campaign',
    relationField: 'name',
  },
}

// ============================================
// Lead Schema
// ============================================

export const leadSchema: EntitySchema = {
  type: 'lead',
  label: {
    singular: 'Lead',
    plural: 'Leads',
  },
  icon: Target,
  basePath: '/leads',

  // Display
  titleField: 'fullName', // Computed: firstName + lastName
  subtitleField: 'company',

  // Status configuration
  status: {
    field: 'status',
    values: [
      { value: 'new', label: 'New', color: 'info', icon: Target },
      { value: 'contacted', label: 'Contacted', color: 'warning', icon: Mail },
      { value: 'qualified', label: 'Qualified', color: 'success', icon: Check },
      { value: 'unqualified', label: 'Unqualified', color: 'neutral', icon: XCircle },
      { value: 'converted', label: 'Converted', color: 'success', icon: TrendingUp },
    ],
    transitions: {
      new: ['contacted', 'unqualified'],
      contacted: ['qualified', 'unqualified'],
      qualified: ['converted', 'unqualified'],
      unqualified: ['new', 'contacted'],
      converted: [],
    },
  },

  // Quick info bar
  quickInfo: [
    { key: 'status', format: 'status' },
    { key: 'rating' },
    { key: 'company', icon: Building2 },
    { key: 'title', icon: User },
    { key: 'email', icon: Mail },
    { key: 'estimatedValue', label: 'Value', format: 'currency', icon: DollarSign },
  ],

  // Tabs
  tabs: [
    {
      id: 'summary',
      label: 'Summary',
      icon: Target,
      fields: [
        'firstName',
        'lastName',
        'email',
        'phone',
        'company',
        'title',
        'status',
        'source',
        'rating',
      ],
    },
    {
      id: 'details',
      label: 'Details',
      icon: FileText,
      fields: [
        'industry',
        'companySize',
        'estimatedValue',
        'location',
        'website',
        'linkedinUrl',
        'description',
        'ownerId',
        'campaignId',
      ],
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
      id: 'convert',
      label: 'Convert to Deal',
      icon: TrendingUp,
      variant: 'primary',
      shortcut: 'C',
      type: 'modal',
      showForStatus: ['qualified'],
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
        id: 'qualify',
        label: 'Qualify',
        icon: Check,
        variant: 'secondary',
        type: 'mutation',
        mutation: 'crm.leads.qualify',
        showForStatus: ['contacted'],
      },
    ],
    dropdown: [
      {
        id: 'edit',
        label: 'Edit Lead',
        icon: Settings,
        type: 'navigate',
        href: (entity) => `/leads/${entity.id}/edit`,
        shortcut: 'E',
      },
      {
        id: 'call',
        label: 'Call',
        icon: Phone,
        type: 'navigate',
        href: (entity) => `tel:${entity.phone}`,
      },
      {
        id: 'disqualify',
        label: 'Disqualify',
        icon: XCircle,
        variant: 'destructive',
        type: 'mutation',
        mutation: 'crm.leads.disqualify',
        confirmMessage: 'Are you sure you want to disqualify this lead?',
        hideForStatus: ['converted', 'unqualified'],
      },
    ],
  },

  // List view
  list: {
    columns: [
      { key: 'fullName', header: 'Name', sortable: true, format: 'avatar' },
      { key: 'company', header: 'Company', sortable: true },
      { key: 'status', header: 'Status', sortable: true, format: 'status', width: '120px' },
      { key: 'rating', header: 'Rating', width: '100px' },
      { key: 'source', header: 'Source', width: '120px' },
      { key: 'estimatedValue', header: 'Est. Value', format: 'currency', width: '120px' },
      { key: 'createdAt', header: 'Created', sortable: true, format: 'date', width: '100px' },
    ],
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'multiselect',
        options: [
          { value: 'new', label: 'New' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'qualified', label: 'Qualified' },
          { value: 'unqualified', label: 'Unqualified' },
          { value: 'converted', label: 'Converted' },
        ],
      },
      {
        key: 'rating',
        label: 'Rating',
        type: 'select',
        options: [
          { value: 'hot', label: 'Hot' },
          { value: 'warm', label: 'Warm' },
          { value: 'cold', label: 'Cold' },
        ],
      },
      {
        key: 'source',
        label: 'Source',
        type: 'select',
        options: [
          { value: 'website', label: 'Website' },
          { value: 'referral', label: 'Referral' },
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'cold_call', label: 'Cold Call' },
          { value: 'event', label: 'Event' },
        ],
      },
      {
        key: 'ownerId',
        label: 'Owner',
        type: 'select',
      },
    ],
    defaultSort: { key: 'createdAt', direction: 'desc' },
    searchableFields: ['firstName', 'lastName', 'email', 'company', 'title'],
  },

  // Fields
  fields: leadFields,

  // Relations
  relations: [
    { type: 'deal', field: 'leadId', label: 'Deals' },
  ],

  // tRPC procedures
  procedures: {
    list: 'crm.leads.list',
    get: 'crm.leads.getFullLead',
    create: 'crm.leads.create',
    update: 'crm.leads.update',
    delete: 'crm.leads.delete',
  },
}

// Register the schema
registerSchema(leadSchema)
