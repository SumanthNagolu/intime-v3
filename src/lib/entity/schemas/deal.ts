/**
 * Deal Entity Schema
 *
 * Defines the complete configuration for Deal entities in InTime.
 */

import {
  Award,
  Building2,
  Calendar,
  Check,
  DollarSign,
  FileText,
  Handshake,
  Pause,
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

const dealFields: Record<string, FieldDefinition> = {
  name: {
    key: 'name',
    label: 'Deal Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Acme Corp IT Staffing Contract',
  },
  accountId: {
    key: 'accountId',
    label: 'Account',
    type: 'relation',
    relationEntity: 'account',
    relationField: 'name',
    required: true,
  },
  contactId: {
    key: 'contactId',
    label: 'Primary Contact',
    type: 'relation',
    relationEntity: 'contact',
    relationField: 'fullName',
  },
  status: {
    key: 'status',
    label: 'Stage',
    type: 'select',
    options: [
      { value: 'prospecting', label: 'Prospecting' },
      { value: 'qualification', label: 'Qualification' },
      { value: 'proposal', label: 'Proposal' },
      { value: 'negotiation', label: 'Negotiation' },
      { value: 'closed_won', label: 'Closed Won' },
      { value: 'closed_lost', label: 'Closed Lost' },
    ],
  },
  amount: {
    key: 'amount',
    label: 'Amount',
    type: 'currency',
    required: true,
  },
  probability: {
    key: 'probability',
    label: 'Probability %',
    type: 'number',
    min: 0,
    max: 100,
  },
  expectedCloseDate: {
    key: 'expectedCloseDate',
    label: 'Expected Close',
    type: 'date',
  },
  actualCloseDate: {
    key: 'actualCloseDate',
    label: 'Actual Close',
    type: 'date',
  },
  dealType: {
    key: 'dealType',
    label: 'Deal Type',
    type: 'select',
    options: [
      { value: 'new_business', label: 'New Business' },
      { value: 'expansion', label: 'Expansion' },
      { value: 'renewal', label: 'Renewal' },
      { value: 'upsell', label: 'Upsell' },
    ],
  },
  source: {
    key: 'source',
    label: 'Source',
    type: 'select',
    options: [
      { value: 'inbound', label: 'Inbound' },
      { value: 'outbound', label: 'Outbound' },
      { value: 'referral', label: 'Referral' },
      { value: 'partner', label: 'Partner' },
      { value: 'event', label: 'Event' },
    ],
  },
  leadId: {
    key: 'leadId',
    label: 'Converted From Lead',
    type: 'relation',
    relationEntity: 'lead',
    relationField: 'fullName',
  },
  ownerId: {
    key: 'ownerId',
    label: 'Owner',
    type: 'relation',
    relationEntity: 'contact',
    relationField: 'fullName',
  },
  nextStep: {
    key: 'nextStep',
    label: 'Next Step',
    type: 'text',
    placeholder: 'e.g., Schedule demo call',
  },
  competitorName: {
    key: 'competitorName',
    label: 'Competitor',
    type: 'text',
  },
  lossReason: {
    key: 'lossReason',
    label: 'Loss Reason',
    type: 'select',
    options: [
      { value: 'price', label: 'Price' },
      { value: 'competitor', label: 'Competitor' },
      { value: 'timing', label: 'Timing' },
      { value: 'no_decision', label: 'No Decision' },
      { value: 'budget', label: 'Budget' },
      { value: 'other', label: 'Other' },
    ],
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
}

// ============================================
// Deal Schema
// ============================================

export const dealSchema: EntitySchema = {
  type: 'deal',
  label: {
    singular: 'Deal',
    plural: 'Deals',
  },
  icon: Handshake,
  basePath: '/deals',

  // Display
  titleField: 'name',
  subtitleField: 'account.name',

  // Status configuration
  status: {
    field: 'status',
    values: [
      { value: 'prospecting', label: 'Prospecting', color: 'info', icon: Target },
      { value: 'qualification', label: 'Qualification', color: 'info', icon: User },
      { value: 'proposal', label: 'Proposal', color: 'warning', icon: FileText },
      { value: 'negotiation', label: 'Negotiation', color: 'warning', icon: Handshake },
      { value: 'closed_won', label: 'Closed Won', color: 'success', icon: Award },
      { value: 'closed_lost', label: 'Closed Lost', color: 'error', icon: XCircle },
    ],
    transitions: {
      prospecting: ['qualification', 'closed_lost'],
      qualification: ['proposal', 'closed_lost'],
      proposal: ['negotiation', 'closed_lost'],
      negotiation: ['closed_won', 'closed_lost'],
      closed_won: [],
      closed_lost: ['prospecting'],
    },
  },

  // Quick info bar
  quickInfo: [
    { key: 'status', format: 'status' },
    { key: 'amount', format: 'currency', icon: DollarSign },
    { key: 'probability', label: 'Prob.' },
    { key: 'account.name', label: 'Account', icon: Building2, format: 'relation' },
    { key: 'expectedCloseDate', label: 'Close Date', format: 'date', icon: Calendar },
  ],

  // Tabs
  tabs: [
    {
      id: 'summary',
      label: 'Summary',
      icon: Handshake,
      fields: [
        'name',
        'accountId',
        'contactId',
        'status',
        'amount',
        'probability',
        'expectedCloseDate',
        'dealType',
      ],
    },
    {
      id: 'details',
      label: 'Details',
      icon: FileText,
      fields: [
        'source',
        'leadId',
        'ownerId',
        'nextStep',
        'competitorName',
        'lossReason',
        'actualCloseDate',
        'description',
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
      id: 'advance-stage',
      label: 'Advance Stage',
      icon: TrendingUp,
      variant: 'primary',
      shortcut: 'A',
      type: 'mutation',
      mutation: 'crm.deals.advanceStage',
      hideForStatus: ['closed_won', 'closed_lost'],
    },
    secondary: [
      {
        id: 'mark-won',
        label: 'Mark as Won',
        icon: Check,
        variant: 'secondary',
        type: 'mutation',
        mutation: 'crm.deals.markWon',
        showForStatus: ['negotiation'],
      },
      {
        id: 'reopen',
        label: 'Reopen',
        icon: TrendingUp,
        variant: 'secondary',
        type: 'mutation',
        mutation: 'crm.deals.reopen',
        showForStatus: ['closed_lost'],
      },
    ],
    dropdown: [
      {
        id: 'edit',
        label: 'Edit Deal',
        icon: Settings,
        type: 'navigate',
        href: (entity) => `/deals/${entity.id}/edit`,
        shortcut: 'E',
      },
      {
        id: 'create-job',
        label: 'Create Job',
        icon: Award,
        type: 'navigate',
        href: (entity) => `/jobs/new?accountId=${entity.accountId}&dealId=${entity.id}`,
        showForStatus: ['closed_won'],
      },
      {
        id: 'mark-lost',
        label: 'Mark as Lost',
        icon: XCircle,
        variant: 'destructive',
        type: 'modal',
        hideForStatus: ['closed_won', 'closed_lost'],
      },
    ],
  },

  // List view
  list: {
    columns: [
      { key: 'name', header: 'Deal', sortable: true },
      { key: 'account.name', header: 'Account', sortable: true, format: 'relation' },
      { key: 'status', header: 'Stage', sortable: true, format: 'status', width: '130px' },
      { key: 'amount', header: 'Amount', sortable: true, format: 'currency', width: '120px' },
      { key: 'probability', header: 'Prob.', sortable: true, width: '80px' },
      { key: 'expectedCloseDate', header: 'Close Date', sortable: true, format: 'date', width: '120px' },
      { key: 'owner.fullName', header: 'Owner', format: 'avatar', width: '140px' },
    ],
    filters: [
      {
        key: 'status',
        label: 'Stage',
        type: 'multiselect',
        options: [
          { value: 'prospecting', label: 'Prospecting' },
          { value: 'qualification', label: 'Qualification' },
          { value: 'proposal', label: 'Proposal' },
          { value: 'negotiation', label: 'Negotiation' },
          { value: 'closed_won', label: 'Closed Won' },
          { value: 'closed_lost', label: 'Closed Lost' },
        ],
      },
      {
        key: 'dealType',
        label: 'Type',
        type: 'select',
        options: [
          { value: 'new_business', label: 'New Business' },
          { value: 'expansion', label: 'Expansion' },
          { value: 'renewal', label: 'Renewal' },
          { value: 'upsell', label: 'Upsell' },
        ],
      },
      {
        key: 'accountId',
        label: 'Account',
        type: 'select',
      },
      {
        key: 'ownerId',
        label: 'Owner',
        type: 'select',
      },
      {
        key: 'expectedCloseDate',
        label: 'Close Date',
        type: 'daterange',
      },
    ],
    defaultSort: { key: 'expectedCloseDate', direction: 'asc' },
    searchableFields: ['name', 'account.name', 'contact.fullName', 'description'],
  },

  // Fields
  fields: dealFields,

  // Relations
  relations: [
    { type: 'account', field: 'accountId', label: 'Account' },
    { type: 'contact', field: 'contactId', label: 'Contact' },
    { type: 'lead', field: 'leadId', label: 'Lead' },
  ],

  // tRPC procedures
  procedures: {
    list: 'crm.deals.list',
    get: 'crm.deals.getFullDeal',
    create: 'crm.deals.create',
    update: 'crm.deals.update',
    delete: 'crm.deals.delete',
  },
}

// Register the schema
registerSchema(dealSchema)
