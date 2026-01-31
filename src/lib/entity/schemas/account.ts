/**
 * Account Entity Schema
 *
 * Defines the complete configuration for Account/Company entities in InTime.
 */

import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  Heart,
  MapPin,
  Phone,
  Settings,
  Shield,
  Star,
  Users,
  XCircle,
} from 'lucide-react'
import type { EntitySchema, FieldDefinition } from '../schema'
import { registerSchema } from '../schema'

// ============================================
// Field Definitions
// ============================================

const accountFields: Record<string, FieldDefinition> = {
  name: {
    key: 'name',
    label: 'Company Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Acme Corporation',
  },
  status: {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'prospect', label: 'Prospect' },
      { value: 'active', label: 'Active' },
      { value: 'on_hold', label: 'On Hold' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  tier: {
    key: 'tier',
    label: 'Tier',
    type: 'select',
    options: [
      { value: 'enterprise', label: 'Enterprise' },
      { value: 'premium', label: 'Premium' },
      { value: 'standard', label: 'Standard' },
    ],
  },
  category: {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'client', label: 'Client' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'partner', label: 'Partner' },
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
  website: {
    key: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'https://example.com',
  },
  phone: {
    key: 'phone',
    label: 'Phone',
    type: 'phone',
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
  employeeCount: {
    key: 'employeeCount',
    label: 'Employee Count',
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
  annualRevenue: {
    key: 'annualRevenue',
    label: 'Annual Revenue',
    type: 'currency',
  },
  paymentTerms: {
    key: 'paymentTerms',
    label: 'Payment Terms',
    type: 'select',
    options: [
      { value: 'net_15', label: 'Net 15' },
      { value: 'net_30', label: 'Net 30' },
      { value: 'net_45', label: 'Net 45' },
      { value: 'net_60', label: 'Net 60' },
    ],
    defaultValue: 'net_30',
  },
  defaultMarkup: {
    key: 'defaultMarkup',
    label: 'Default Markup %',
    type: 'number',
    min: 0,
    max: 100,
  },
  healthScore: {
    key: 'healthScore',
    label: 'Health Score',
    type: 'number',
    min: 0,
    max: 100,
    readOnly: true,
  },
  primaryContactId: {
    key: 'primaryContactId',
    label: 'Primary Contact',
    type: 'relation',
    relationEntity: 'contact',
    relationField: 'fullName',
  },
  ownerId: {
    key: 'ownerId',
    label: 'Account Owner',
    type: 'relation',
    relationEntity: 'contact',
    relationField: 'fullName',
  },
  description: {
    key: 'description',
    label: 'Description',
    type: 'textarea',
  },
  notes: {
    key: 'notes',
    label: 'Internal Notes',
    type: 'textarea',
  },
}

// ============================================
// Account Schema
// ============================================

export const accountSchema: EntitySchema = {
  type: 'account',
  label: {
    singular: 'Account',
    plural: 'Accounts',
  },
  icon: Building2,
  basePath: '/accounts',

  // Display
  titleField: 'name',
  subtitleField: 'industry',

  // Status configuration
  status: {
    field: 'status',
    values: [
      { value: 'prospect', label: 'Prospect', color: 'info', icon: Star },
      { value: 'active', label: 'Active', color: 'success', icon: Building2 },
      { value: 'on_hold', label: 'On Hold', color: 'warning' },
      { value: 'inactive', label: 'Inactive', color: 'neutral', icon: XCircle },
    ],
    transitions: {
      prospect: ['active', 'inactive'],
      active: ['on_hold', 'inactive'],
      on_hold: ['active', 'inactive'],
      inactive: ['active', 'prospect'],
    },
  },

  // Quick info bar
  quickInfo: [
    { key: 'status', format: 'status' },
    { key: 'tier' },
    { key: 'industry', icon: Briefcase },
    { key: 'city', icon: MapPin },
    { key: 'healthScore', label: 'Health', icon: Heart },
    { key: 'activeJobsCount', label: 'Jobs', icon: Briefcase },
  ],

  // Tabs
  tabs: [
    {
      id: 'summary',
      label: 'Summary',
      icon: Building2,
      fields: ['name', 'status', 'tier', 'category', 'industry', 'website', 'description'],
    },
    {
      id: 'details',
      label: 'Details',
      icon: FileText,
      fields: ['phone', 'address', 'city', 'state', 'country', 'employeeCount', 'annualRevenue'],
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      relationEntity: 'contact',
      relationField: 'accountId',
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: CreditCard,
      fields: ['paymentTerms', 'defaultMarkup'],
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      relationEntity: 'job',
      relationField: 'accountId',
    },
    {
      id: 'placements',
      label: 'Placements',
      icon: Award,
      relationEntity: 'placement',
      relationField: 'accountId',
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
      id: 'new-job',
      label: 'New Job',
      icon: Briefcase,
      variant: 'primary',
      shortcut: 'J',
      type: 'navigate',
      href: (entity) => `/jobs/new?accountId=${entity.id}`,
      showForStatus: ['active'],
    },
    secondary: [
      {
        id: 'add-contact',
        label: 'Add Contact',
        icon: Users,
        variant: 'secondary',
        type: 'modal',
      },
      {
        id: 'activate',
        label: 'Activate',
        icon: Building2,
        variant: 'secondary',
        type: 'mutation',
        mutation: 'accounts.activate',
        showForStatus: ['prospect', 'on_hold'],
      },
    ],
    dropdown: [
      {
        id: 'edit',
        label: 'Edit Account',
        icon: Settings,
        type: 'navigate',
        href: (entity) => `/accounts/${entity.id}/edit`,
        shortcut: 'E',
      },
      {
        id: 'website',
        label: 'Visit Website',
        icon: Globe,
        type: 'navigate',
        href: (entity) => entity.website as string,
      },
      {
        id: 'deactivate',
        label: 'Deactivate',
        icon: XCircle,
        variant: 'destructive',
        type: 'mutation',
        mutation: 'accounts.deactivate',
        confirmMessage: 'Are you sure you want to deactivate this account?',
        showForStatus: ['active'],
      },
    ],
  },

  // List view
  list: {
    columns: [
      { key: 'name', header: 'Account', sortable: true },
      { key: 'status', header: 'Status', sortable: true, format: 'status', width: '120px' },
      { key: 'tier', header: 'Tier', sortable: true, width: '100px' },
      { key: 'industry', header: 'Industry', sortable: true },
      { key: 'city', header: 'Location', sortable: true },
      { key: 'activeJobsCount', header: 'Active Jobs', width: '100px' },
      { key: 'healthScore', header: 'Health', width: '80px' },
      { key: 'createdAt', header: 'Created', sortable: true, format: 'date', width: '100px' },
    ],
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'multiselect',
        options: [
          { value: 'prospect', label: 'Prospect' },
          { value: 'active', label: 'Active' },
          { value: 'on_hold', label: 'On Hold' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
      {
        key: 'tier',
        label: 'Tier',
        type: 'select',
        options: [
          { value: 'enterprise', label: 'Enterprise' },
          { value: 'premium', label: 'Premium' },
          { value: 'standard', label: 'Standard' },
        ],
      },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { value: 'client', label: 'Client' },
          { value: 'vendor', label: 'Vendor' },
          { value: 'partner', label: 'Partner' },
        ],
      },
      {
        key: 'industry',
        label: 'Industry',
        type: 'select',
      },
    ],
    defaultSort: { key: 'name', direction: 'asc' },
    searchableFields: ['name', 'website', 'city', 'description'],
  },

  // Fields
  fields: accountFields,

  // Relations
  relations: [
    { type: 'contact', field: 'accountId', label: 'Contacts' },
    { type: 'job', field: 'accountId', label: 'Jobs' },
    { type: 'placement', field: 'accountId', label: 'Placements' },
    { type: 'deal', field: 'accountId', label: 'Deals' },
  ],

  // tRPC procedures
  procedures: {
    list: 'accounts.list',
    get: 'accounts.getFullAccount',
    create: 'accounts.create',
    update: 'accounts.update',
    delete: 'accounts.delete',
  },
}

// Register the schema
registerSchema(accountSchema)
