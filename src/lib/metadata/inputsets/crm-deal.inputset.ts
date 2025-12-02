/**
 * CRM Deal InputSets
 *
 * Reusable field groups for CRM deal forms.
 * Based on the deals, deal_stakeholders, deal_competitors, deal_products schema.
 */

import type { InputSetConfig, FieldDefinition } from '../types/widget.types';
import {
  DEAL_TYPE_OPTIONS,
  DEAL_STAGE_OPTIONS,
  DEAL_PROBABILITY_BY_STAGE,
  STAKEHOLDER_ROLE_OPTIONS,
  INFLUENCE_LEVEL_OPTIONS,
  SENTIMENT_OPTIONS,
  THREAT_LEVEL_OPTIONS,
  DEAL_PRODUCT_TYPE_OPTIONS,
} from '../options/crm-options';

// ==========================================
// DEAL BASIC INFO
// ==========================================

export const dealBasicFields: FieldDefinition[] = [
  {
    id: 'title',
    label: 'Deal Title',
    type: 'text',
    path: 'title',
    required: true,
    editable: true,
    placeholder: 'e.g., Java Developer Staffing - Q1 2025',
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    path: 'description',
    editable: true,
    placeholder: 'Describe the deal opportunity...',
    span: 2,
    config: { rows: 3 },
  },
  {
    id: 'dealType',
    label: 'Deal Type',
    type: 'select',
    path: 'dealType',
    required: true,
    editable: true,
    options: DEAL_TYPE_OPTIONS,
    defaultValue: 'new_business',
  },
  {
    id: 'accountId',
    label: 'Account',
    type: 'select',
    path: 'accountId',
    editable: true,
    optionsSource: {
      entityType: 'account',
      labelField: 'name',
      valueField: 'id',
      searchable: true,
    },
    placeholder: 'Select account',
  },
  {
    id: 'leadId',
    label: 'Source Lead',
    type: 'select',
    path: 'leadId',
    editable: true,
    optionsSource: {
      entityType: 'lead',
      labelField: 'companyName',
      valueField: 'id',
      searchable: true,
    },
    placeholder: 'Select lead (if converted)',
    helpText: 'The lead this deal was converted from',
  },
];

export const dealBasicInputSet: InputSetConfig = {
  id: 'deal-basic',
  name: 'Deal Basic Info',
  label: 'Basic Information',
  description: 'Core deal details including title, type, and associations',
  fields: dealBasicFields,
  columns: 2,
};

// ==========================================
// DEAL VALUE & STAGE
// ==========================================

export const dealValueFields: FieldDefinition[] = [
  {
    id: 'value',
    label: 'Deal Value',
    type: 'currency',
    path: 'value',
    required: true,
    editable: true,
    placeholder: '0.00',
    config: { prefix: '$' },
  },
  {
    id: 'currency',
    label: 'Currency',
    type: 'select',
    path: 'currency',
    editable: true,
    defaultValue: 'USD',
    options: [
      { value: 'USD', label: 'USD' },
      { value: 'EUR', label: 'EUR' },
      { value: 'GBP', label: 'GBP' },
      { value: 'CAD', label: 'CAD' },
      { value: 'INR', label: 'INR' },
    ],
  },
];

export const dealValueInputSet: InputSetConfig = {
  id: 'deal-value',
  name: 'Deal Value',
  label: 'Deal Value',
  description: 'Monetary value and currency',
  fields: dealValueFields,
  columns: 2,
};

// ==========================================
// DEAL STAGE & PIPELINE
// ==========================================

export const dealStageFields: FieldDefinition[] = [
  {
    id: 'stage',
    label: 'Pipeline Stage',
    type: 'select',
    path: 'stage',
    required: true,
    editable: true,
    options: DEAL_STAGE_OPTIONS,
    defaultValue: 'discovery',
    config: {
      badgeColors: {
        discovery: 'blue',
        qualification: 'cyan',
        proposal: 'amber',
        negotiation: 'orange',
        closed_won: 'green',
        closed_lost: 'red',
      },
    },
  },
  {
    id: 'probability',
    label: 'Win Probability',
    type: 'number',
    path: 'probability',
    editable: true,
    helpText: 'Automatically set based on stage',
    config: { suffix: '%', min: 0, max: 100 },
  },
  {
    id: 'expectedCloseDate',
    label: 'Expected Close Date',
    type: 'date',
    path: 'expectedCloseDate',
    editable: true,
    required: true,
  },
  {
    id: 'actualCloseDate',
    label: 'Actual Close Date',
    type: 'date',
    path: 'actualCloseDate',
    editable: true,
    helpText: 'Set when deal is won or lost',
  },
];

export const dealStageInputSet: InputSetConfig = {
  id: 'deal-stage',
  name: 'Deal Stage',
  label: 'Pipeline Stage',
  description: 'Deal stage, probability, and close dates',
  fields: dealStageFields,
  columns: 2,
};

// ==========================================
// DEAL ASSIGNMENT
// ==========================================

export const dealAssignmentFields: FieldDefinition[] = [
  {
    id: 'ownerId',
    label: 'Deal Owner',
    type: 'select',
    path: 'ownerId',
    required: true,
    editable: true,
    optionsSource: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
      searchable: true,
      filterRole: ['ta', 'sales', 'manager'],
    },
    placeholder: 'Select deal owner',
  },
];

export const dealAssignmentInputSet: InputSetConfig = {
  id: 'deal-assignment',
  name: 'Deal Assignment',
  label: 'Assignment',
  description: 'Deal owner assignment',
  fields: dealAssignmentFields,
  columns: 1,
};

// ==========================================
// DEAL OUTCOME (for closed deals)
// ==========================================

export const dealOutcomeFields: FieldDefinition[] = [
  {
    id: 'closeReason',
    label: 'Close Reason',
    type: 'text',
    path: 'closeReason',
    editable: true,
    placeholder: 'Why was this deal won?',
    helpText: 'For closed-won deals',
  },
  {
    id: 'lossReason',
    label: 'Loss Reason',
    type: 'select',
    path: 'lossReason',
    editable: true,
    options: [
      { value: 'price', label: 'Price Too High' },
      { value: 'competitor', label: 'Lost to Competitor' },
      { value: 'no_budget', label: 'No Budget' },
      { value: 'no_decision', label: 'No Decision Made' },
      { value: 'timing', label: 'Bad Timing' },
      { value: 'internal_solution', label: 'Internal Solution' },
      { value: 'relationship', label: 'Relationship Issues' },
      { value: 'requirements', label: "Couldn't Meet Requirements" },
      { value: 'other', label: 'Other' },
    ],
    helpText: 'For closed-lost deals',
  },
  {
    id: 'competitorWon',
    label: 'Competitor Won',
    type: 'text',
    path: 'competitorWon',
    editable: true,
    placeholder: 'Name of winning competitor',
    helpText: 'If lost to competitor',
  },
];

export const dealOutcomeInputSet: InputSetConfig = {
  id: 'deal-outcome',
  name: 'Deal Outcome',
  label: 'Deal Outcome',
  description: 'Outcome details for closed deals',
  fields: dealOutcomeFields,
  columns: 3,
};

// ==========================================
// DEAL NOTES
// ==========================================

export const dealNotesFields: FieldDefinition[] = [
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    path: 'notes',
    editable: true,
    placeholder: 'Add notes about this deal...',
    span: 2,
    config: { rows: 4 },
  },
];

export const dealNotesInputSet: InputSetConfig = {
  id: 'deal-notes',
  name: 'Deal Notes',
  label: 'Notes',
  description: 'Additional notes and comments',
  fields: dealNotesFields,
  columns: 1,
};

// ==========================================
// DEAL STAKEHOLDER (for deal_stakeholders table)
// ==========================================

export const dealStakeholderFields: FieldDefinition[] = [
  {
    id: 'contactId',
    label: 'Contact',
    type: 'select',
    path: 'contactId',
    editable: true,
    optionsSource: {
      entityType: 'contact',
      labelTemplate: '{{firstName}} {{lastName}}',
      valueField: 'id',
      searchable: true,
    },
    placeholder: 'Select existing contact',
    helpText: 'Or enter details manually below',
  },
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    path: 'name',
    editable: true,
    placeholder: 'Stakeholder name',
    helpText: 'If not linked to a contact',
  },
  {
    id: 'title',
    label: 'Title',
    type: 'text',
    path: 'title',
    editable: true,
    placeholder: 'e.g., VP of Engineering',
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    path: 'email',
    editable: true,
    placeholder: 'stakeholder@company.com',
  },
  {
    id: 'role',
    label: 'Role in Deal',
    type: 'select',
    path: 'role',
    required: true,
    editable: true,
    options: STAKEHOLDER_ROLE_OPTIONS,
    defaultValue: 'influencer',
  },
  {
    id: 'influenceLevel',
    label: 'Influence Level',
    type: 'select',
    path: 'influenceLevel',
    editable: true,
    options: INFLUENCE_LEVEL_OPTIONS,
    defaultValue: 'medium',
  },
  {
    id: 'sentiment',
    label: 'Sentiment',
    type: 'select',
    path: 'sentiment',
    editable: true,
    options: SENTIMENT_OPTIONS,
    defaultValue: 'neutral',
    config: {
      badgeColors: {
        positive: 'green',
        neutral: 'gray',
        negative: 'red',
        unknown: 'slate',
      },
    },
  },
  {
    id: 'isPrimary',
    label: 'Primary Contact',
    type: 'boolean',
    path: 'isPrimary',
    editable: true,
    defaultValue: false,
    helpText: 'Main point of contact for this deal',
  },
  {
    id: 'engagementNotes',
    label: 'Engagement Notes',
    type: 'textarea',
    path: 'engagementNotes',
    editable: true,
    placeholder: 'Notes about engagement with this stakeholder...',
    span: 2,
    config: { rows: 2 },
  },
];

export const dealStakeholderInputSet: InputSetConfig = {
  id: 'deal-stakeholder',
  name: 'Deal Stakeholder',
  label: 'Stakeholder',
  description: 'People involved in the deal decision',
  fields: dealStakeholderFields,
  columns: 2,
};

// ==========================================
// DEAL COMPETITOR (for deal_competitors table)
// ==========================================

export const dealCompetitorFields: FieldDefinition[] = [
  {
    id: 'competitorName',
    label: 'Competitor Name',
    type: 'text',
    path: 'competitorName',
    required: true,
    editable: true,
    placeholder: 'e.g., TechStaffing Inc.',
  },
  {
    id: 'competitorWebsite',
    label: 'Website',
    type: 'url',
    path: 'competitorWebsite',
    editable: true,
    placeholder: 'https://competitor.com',
  },
  {
    id: 'threatLevel',
    label: 'Threat Level',
    type: 'select',
    path: 'threatLevel',
    editable: true,
    options: THREAT_LEVEL_OPTIONS,
    defaultValue: 'medium',
    config: {
      badgeColors: {
        high: 'red',
        medium: 'amber',
        low: 'green',
      },
    },
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    path: 'status',
    editable: true,
    defaultValue: 'active',
    options: [
      { value: 'active', label: 'Active', color: 'blue' },
      { value: 'won_against', label: 'Won Against', color: 'green' },
      { value: 'lost_to', label: 'Lost To', color: 'red' },
      { value: 'unknown', label: 'Unknown', color: 'gray' },
    ],
  },
  {
    id: 'strengths',
    label: 'Their Strengths',
    type: 'textarea',
    path: 'strengths',
    editable: true,
    placeholder: 'What are they good at?',
    config: { rows: 2 },
  },
  {
    id: 'weaknesses',
    label: 'Their Weaknesses',
    type: 'textarea',
    path: 'weaknesses',
    editable: true,
    placeholder: 'Where do they fall short?',
    config: { rows: 2 },
  },
  {
    id: 'ourDifferentiators',
    label: 'Our Differentiators',
    type: 'textarea',
    path: 'ourDifferentiators',
    editable: true,
    placeholder: 'How we stand out against them...',
    config: { rows: 2 },
  },
  {
    id: 'pricing',
    label: 'Pricing Intel',
    type: 'text',
    path: 'pricing',
    editable: true,
    placeholder: 'Known pricing or range',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    path: 'notes',
    editable: true,
    placeholder: 'Additional competitor intel...',
    span: 2,
    config: { rows: 2 },
  },
];

export const dealCompetitorInputSet: InputSetConfig = {
  id: 'deal-competitor',
  name: 'Deal Competitor',
  label: 'Competitor',
  description: 'Competitive intelligence for this deal',
  fields: dealCompetitorFields,
  columns: 2,
};

// ==========================================
// DEAL PRODUCT (for deal_products table)
// ==========================================

export const dealProductFields: FieldDefinition[] = [
  {
    id: 'productType',
    label: 'Product/Service Type',
    type: 'select',
    path: 'productType',
    required: true,
    editable: true,
    options: DEAL_PRODUCT_TYPE_OPTIONS,
    defaultValue: 'staffing',
  },
  {
    id: 'productName',
    label: 'Product/Service Name',
    type: 'text',
    path: 'productName',
    editable: true,
    placeholder: 'e.g., Senior Java Developer',
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    path: 'description',
    editable: true,
    placeholder: 'Describe the product/service...',
    span: 2,
    config: { rows: 2 },
  },
  {
    id: 'quantity',
    label: 'Quantity',
    type: 'number',
    path: 'quantity',
    editable: true,
    defaultValue: 1,
    config: { min: 1 },
  },
  {
    id: 'unitPrice',
    label: 'Unit Price',
    type: 'currency',
    path: 'unitPrice',
    editable: true,
    config: { prefix: '$' },
  },
  {
    id: 'discount',
    label: 'Discount',
    type: 'number',
    path: 'discount',
    editable: true,
    config: { suffix: '%', min: 0, max: 100 },
  },
  {
    id: 'totalValue',
    label: 'Total Value',
    type: 'currency',
    path: 'totalValue',
    editable: true,
    helpText: 'Calculated: (quantity × unit price) - discount',
    config: { prefix: '$' },
  },
  {
    id: 'durationMonths',
    label: 'Duration (Months)',
    type: 'number',
    path: 'durationMonths',
    editable: true,
    placeholder: '12',
    helpText: 'For services/subscriptions',
    config: { min: 1 },
  },
  {
    id: 'startDate',
    label: 'Start Date',
    type: 'date',
    path: 'startDate',
    editable: true,
  },
  {
    id: 'endDate',
    label: 'End Date',
    type: 'date',
    path: 'endDate',
    editable: true,
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    path: 'notes',
    editable: true,
    placeholder: 'Additional details...',
    span: 2,
    config: { rows: 2 },
  },
];

export const dealProductInputSet: InputSetConfig = {
  id: 'deal-product',
  name: 'Deal Product',
  label: 'Product/Service',
  description: 'Products or services in this deal',
  fields: dealProductFields,
  columns: 2,
};

// ==========================================
// DEAL STAGE HISTORY (for display)
// ==========================================

export const dealStageHistoryFields: FieldDefinition[] = [
  {
    id: 'stage',
    label: 'Stage',
    type: 'text',
    path: 'stage',
    readonly: true,
  },
  {
    id: 'previousStage',
    label: 'Previous Stage',
    type: 'text',
    path: 'previousStage',
    readonly: true,
  },
  {
    id: 'enteredAt',
    label: 'Entered',
    type: 'datetime',
    path: 'enteredAt',
    readonly: true,
    config: { format: 'relative' },
  },
  {
    id: 'durationDays',
    label: 'Days in Stage',
    type: 'number',
    path: 'durationDays',
    readonly: true,
  },
  {
    id: 'reason',
    label: 'Reason',
    type: 'text',
    path: 'reason',
    readonly: true,
  },
];

export const dealStageHistoryInputSet: InputSetConfig = {
  id: 'deal-stage-history',
  name: 'Deal Stage History',
  label: 'Stage History',
  description: 'History of stage transitions',
  fields: dealStageHistoryFields,
  columns: 5,
};

// ==========================================
// FULL DEAL FORM INPUTSET
// ==========================================

export const dealFullFields: FieldDefinition[] = [
  ...dealBasicFields,
  ...dealValueFields,
  ...dealStageFields,
  ...dealAssignmentFields,
  ...dealNotesFields,
];

export const dealFullInputSet: InputSetConfig = {
  id: 'deal-full',
  name: 'Full Deal Form',
  label: 'Deal Information',
  description: 'Complete deal form with all fields',
  fields: dealFullFields,
  columns: 2,
};

// ==========================================
// QUICK ADD DEAL INPUTSET
// ==========================================

export const dealQuickAddFields: FieldDefinition[] = [
  {
    id: 'title',
    label: 'Deal Title',
    type: 'text',
    path: 'title',
    required: true,
    editable: true,
    placeholder: 'Deal title',
  },
  {
    id: 'accountId',
    label: 'Account',
    type: 'select',
    path: 'accountId',
    editable: true,
    optionsSource: {
      entityType: 'account',
      labelField: 'name',
      valueField: 'id',
      searchable: true,
    },
  },
  {
    id: 'value',
    label: 'Value',
    type: 'currency',
    path: 'value',
    required: true,
    editable: true,
    config: { prefix: '$' },
  },
  {
    id: 'stage',
    label: 'Stage',
    type: 'select',
    path: 'stage',
    required: true,
    editable: true,
    options: DEAL_STAGE_OPTIONS,
    defaultValue: 'discovery',
  },
  {
    id: 'expectedCloseDate',
    label: 'Expected Close',
    type: 'date',
    path: 'expectedCloseDate',
    required: true,
    editable: true,
  },
  {
    id: 'ownerId',
    label: 'Owner',
    type: 'select',
    path: 'ownerId',
    required: true,
    editable: true,
    optionsSource: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
      searchable: true,
    },
  },
];

export const dealQuickAddInputSet: InputSetConfig = {
  id: 'deal-quick-add',
  name: 'Quick Add Deal',
  label: 'Quick Add Deal',
  description: 'Minimal fields for quickly adding a deal',
  fields: dealQuickAddFields,
  columns: 2,
};
