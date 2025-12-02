/**
 * CRM Campaign InputSets
 *
 * Reusable field groups for CRM campaign forms.
 * Based on the crm_campaigns, crm_campaign_targets, crm_campaign_content, crm_campaign_metrics schema.
 */

import type { InputSetConfig, FieldDefinition } from '../types/widget.types';
import {
  CAMPAIGN_TYPE_OPTIONS,
  CAMPAIGN_STATUS_OPTIONS,
  CAMPAIGN_TARGET_STATUS_OPTIONS,
  CAMPAIGN_CONTENT_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
} from '../options/crm-options';

// ==========================================
// CAMPAIGN BASIC INFO
// ==========================================

export const campaignBasicFields: FieldDefinition[] = [
  {
    id: 'name',
    label: 'Campaign Name',
    type: 'text',
    path: 'name',
    required: true,
    editable: true,
    placeholder: 'e.g., Q1 2025 Tech Staffing Outreach',
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    path: 'description',
    editable: true,
    placeholder: 'Describe the campaign objectives and strategy...',
    span: 2,
    config: { rows: 3 },
  },
  {
    id: 'campaignType',
    label: 'Campaign Type',
    type: 'select',
    path: 'campaignType',
    required: true,
    editable: true,
    options: CAMPAIGN_TYPE_OPTIONS,
    defaultValue: 'email',
    config: {
      badgeColors: {
        email: 'blue',
        linkedin: 'cyan',
        event: 'purple',
        webinar: 'green',
        content: 'amber',
        outbound_call: 'red',
      },
    },
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    path: 'status',
    required: true,
    editable: true,
    options: CAMPAIGN_STATUS_OPTIONS,
    defaultValue: 'draft',
    config: {
      badgeColors: {
        draft: 'gray',
        scheduled: 'blue',
        active: 'green',
        paused: 'amber',
        completed: 'purple',
        cancelled: 'red',
      },
    },
  },
];

export const campaignBasicInputSet: InputSetConfig = {
  id: 'campaign-basic',
  name: 'Campaign Basic Info',
  label: 'Basic Information',
  description: 'Core campaign details including name, type, and status',
  fields: campaignBasicFields,
  columns: 2,
};

// ==========================================
// CAMPAIGN SCHEDULE
// ==========================================

export const campaignScheduleFields: FieldDefinition[] = [
  {
    id: 'startDate',
    label: 'Start Date',
    type: 'date',
    path: 'startDate',
    editable: true,
    required: true,
  },
  {
    id: 'endDate',
    label: 'End Date',
    type: 'date',
    path: 'endDate',
    editable: true,
    helpText: 'Leave empty for ongoing campaigns',
  },
  {
    id: 'scheduledAt',
    label: 'Scheduled Launch',
    type: 'datetime',
    path: 'scheduledAt',
    editable: true,
    helpText: 'When the campaign will automatically start',
  },
];

export const campaignScheduleInputSet: InputSetConfig = {
  id: 'campaign-schedule',
  name: 'Campaign Schedule',
  label: 'Schedule',
  description: 'Campaign timing and schedule',
  fields: campaignScheduleFields,
  columns: 3,
};

// ==========================================
// CAMPAIGN TARGET AUDIENCE
// ==========================================

export const campaignTargetFields: FieldDefinition[] = [
  {
    id: 'targetAudience',
    label: 'Target Audience',
    type: 'textarea',
    path: 'targetAudience',
    editable: true,
    placeholder: 'Describe your target audience...',
    span: 2,
    config: { rows: 2 },
  },
  {
    id: 'targetIndustries',
    label: 'Target Industries',
    type: 'multi-select',
    path: 'targetIndustries',
    editable: true,
    options: INDUSTRY_OPTIONS,
    placeholder: 'Select industries',
  },
  {
    id: 'targetCompanySizes',
    label: 'Company Sizes',
    type: 'multi-select',
    path: 'targetCompanySizes',
    editable: true,
    options: COMPANY_SIZE_OPTIONS,
    placeholder: 'Select company sizes',
  },
  {
    id: 'targetTitles',
    label: 'Target Titles',
    type: 'tags',
    path: 'targetTitles',
    editable: true,
    placeholder: 'Add job titles (e.g., VP Engineering, CTO)',
    span: 2,
  },
];

export const campaignTargetInputSet: InputSetConfig = {
  id: 'campaign-target',
  name: 'Campaign Target Audience',
  label: 'Target Audience',
  description: 'Define who this campaign targets',
  fields: campaignTargetFields,
  columns: 2,
};

// ==========================================
// CAMPAIGN GOALS & BUDGET
// ==========================================

export const campaignGoalsFields: FieldDefinition[] = [
  {
    id: 'goalLeads',
    label: 'Lead Goal',
    type: 'number',
    path: 'goalLeads',
    editable: true,
    placeholder: '100',
    helpText: 'Target number of leads to generate',
    config: { min: 0 },
  },
  {
    id: 'goalResponses',
    label: 'Response Goal',
    type: 'number',
    path: 'goalResponses',
    editable: true,
    placeholder: '50',
    helpText: 'Target number of responses',
    config: { min: 0 },
  },
  {
    id: 'goalMeetings',
    label: 'Meeting Goal',
    type: 'number',
    path: 'goalMeetings',
    editable: true,
    placeholder: '20',
    helpText: 'Target number of meetings booked',
    config: { min: 0 },
  },
  {
    id: 'budget',
    label: 'Budget',
    type: 'currency',
    path: 'budget',
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
    ],
  },
];

export const campaignGoalsInputSet: InputSetConfig = {
  id: 'campaign-goals',
  name: 'Campaign Goals',
  label: 'Goals & Budget',
  description: 'Campaign objectives and budget allocation',
  fields: campaignGoalsFields,
  columns: 5,
};

// ==========================================
// CAMPAIGN ASSIGNMENT
// ==========================================

export const campaignAssignmentFields: FieldDefinition[] = [
  {
    id: 'ownerId',
    label: 'Campaign Owner',
    type: 'select',
    path: 'ownerId',
    editable: true,
    optionsSource: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
      searchable: true,
      filterRole: ['ta', 'marketing', 'manager'],
    },
    placeholder: 'Select campaign owner',
  },
];

export const campaignAssignmentInputSet: InputSetConfig = {
  id: 'campaign-assignment',
  name: 'Campaign Assignment',
  label: 'Assignment',
  description: 'Campaign owner assignment',
  fields: campaignAssignmentFields,
  columns: 1,
};

// ==========================================
// CAMPAIGN NOTES
// ==========================================

export const campaignNotesFields: FieldDefinition[] = [
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    path: 'notes',
    editable: true,
    placeholder: 'Additional campaign notes...',
    span: 2,
    config: { rows: 4 },
  },
];

export const campaignNotesInputSet: InputSetConfig = {
  id: 'campaign-notes',
  name: 'Campaign Notes',
  label: 'Notes',
  description: 'Additional campaign notes',
  fields: campaignNotesFields,
  columns: 1,
};

// ==========================================
// CAMPAIGN CONTENT (for crm_campaign_content table)
// ==========================================

export const campaignContentFields: FieldDefinition[] = [
  {
    id: 'contentType',
    label: 'Content Type',
    type: 'select',
    path: 'contentType',
    required: true,
    editable: true,
    options: CAMPAIGN_CONTENT_TYPE_OPTIONS,
    defaultValue: 'email',
  },
  {
    id: 'name',
    label: 'Content Name',
    type: 'text',
    path: 'name',
    editable: true,
    placeholder: 'e.g., Initial Outreach Email',
  },
  {
    id: 'variant',
    label: 'A/B Variant',
    type: 'select',
    path: 'variant',
    editable: true,
    options: [
      { value: 'A', label: 'Variant A' },
      { value: 'B', label: 'Variant B' },
      { value: 'C', label: 'Variant C' },
    ],
    helpText: 'For A/B testing',
  },
  {
    id: 'isActive',
    label: 'Active',
    type: 'boolean',
    path: 'isActive',
    editable: true,
    defaultValue: true,
  },
  {
    id: 'subject',
    label: 'Subject Line',
    type: 'text',
    path: 'subject',
    editable: true,
    placeholder: 'Enter email subject line',
    span: 2,
  },
  {
    id: 'body',
    label: 'Content Body',
    type: 'textarea',
    path: 'body',
    editable: true,
    placeholder: 'Write your content here...',
    span: 2,
    config: { rows: 6 },
  },
  {
    id: 'assetUrl',
    label: 'Asset URL',
    type: 'url',
    path: 'assetUrl',
    editable: true,
    placeholder: 'https://...',
    helpText: 'Link to attached file or resource',
  },
];

export const campaignContentInputSet: InputSetConfig = {
  id: 'campaign-content',
  name: 'Campaign Content',
  label: 'Content',
  description: 'Email templates, scripts, and assets',
  fields: campaignContentFields,
  columns: 2,
};

// ==========================================
// CAMPAIGN TARGET RECORD (for crm_campaign_targets table)
// ==========================================

export const campaignTargetRecordFields: FieldDefinition[] = [
  {
    id: 'targetType',
    label: 'Target Type',
    type: 'select',
    path: 'targetType',
    required: true,
    editable: true,
    options: [
      { value: 'lead', label: 'Lead' },
      { value: 'contact', label: 'Contact' },
      { value: 'account', label: 'Account' },
    ],
  },
  {
    id: 'targetId',
    label: 'Target',
    type: 'select',
    path: 'targetId',
    required: true,
    editable: true,
    optionsSource: {
      // Dynamic based on targetType
      entityType: 'dynamic',
      labelField: 'name',
      valueField: 'id',
      searchable: true,
    },
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    path: 'status',
    editable: true,
    options: CAMPAIGN_TARGET_STATUS_OPTIONS,
    defaultValue: 'pending',
    config: {
      badgeColors: {
        pending: 'gray',
        sent: 'blue',
        opened: 'cyan',
        clicked: 'amber',
        responded: 'green',
        converted: 'purple',
        bounced: 'red',
        unsubscribed: 'orange',
      },
    },
  },
  {
    id: 'resultNotes',
    label: 'Result Notes',
    type: 'textarea',
    path: 'resultNotes',
    editable: true,
    placeholder: 'Notes about this target...',
    config: { rows: 2 },
  },
];

export const campaignTargetRecordInputSet: InputSetConfig = {
  id: 'campaign-target-record',
  name: 'Campaign Target Record',
  label: 'Target',
  description: 'Individual campaign target',
  fields: campaignTargetRecordFields,
  columns: 2,
};

// ==========================================
// CAMPAIGN METRICS (for display, readonly)
// ==========================================

export const campaignMetricsFields: FieldDefinition[] = [
  {
    id: 'totalTargets',
    label: 'Total Targets',
    type: 'number',
    path: 'totalTargets',
    readonly: true,
  },
  {
    id: 'totalSent',
    label: 'Sent',
    type: 'number',
    path: 'totalSent',
    readonly: true,
  },
  {
    id: 'totalDelivered',
    label: 'Delivered',
    type: 'number',
    path: 'totalDelivered',
    readonly: true,
  },
  {
    id: 'uniqueOpens',
    label: 'Opens',
    type: 'number',
    path: 'uniqueOpens',
    readonly: true,
  },
  {
    id: 'uniqueClicks',
    label: 'Clicks',
    type: 'number',
    path: 'uniqueClicks',
    readonly: true,
  },
  {
    id: 'totalResponses',
    label: 'Responses',
    type: 'number',
    path: 'totalResponses',
    readonly: true,
  },
  {
    id: 'totalConversions',
    label: 'Conversions',
    type: 'number',
    path: 'totalConversions',
    readonly: true,
  },
  {
    id: 'totalLeadsGenerated',
    label: 'Leads Generated',
    type: 'number',
    path: 'totalLeadsGenerated',
    readonly: true,
  },
];

export const campaignMetricsInputSet: InputSetConfig = {
  id: 'campaign-metrics',
  name: 'Campaign Metrics',
  label: 'Performance Metrics',
  description: 'Campaign performance tracking',
  fields: campaignMetricsFields,
  columns: 4,
};

// ==========================================
// CAMPAIGN RATES (calculated, readonly)
// ==========================================

export const campaignRatesFields: FieldDefinition[] = [
  {
    id: 'openRate',
    label: 'Open Rate',
    type: 'number',
    path: 'openRate',
    readonly: true,
    config: { suffix: '%' },
  },
  {
    id: 'clickRate',
    label: 'Click Rate',
    type: 'number',
    path: 'clickRate',
    readonly: true,
    config: { suffix: '%' },
  },
  {
    id: 'responseRate',
    label: 'Response Rate',
    type: 'number',
    path: 'responseRate',
    readonly: true,
    config: { suffix: '%' },
  },
  {
    id: 'conversionRate',
    label: 'Conversion Rate',
    type: 'number',
    path: 'conversionRate',
    readonly: true,
    config: { suffix: '%' },
  },
  {
    id: 'bounceRate',
    label: 'Bounce Rate',
    type: 'number',
    path: 'bounceRate',
    readonly: true,
    config: { suffix: '%' },
  },
];

export const campaignRatesInputSet: InputSetConfig = {
  id: 'campaign-rates',
  name: 'Campaign Rates',
  label: 'Performance Rates',
  description: 'Calculated campaign performance rates',
  fields: campaignRatesFields,
  columns: 5,
};

// ==========================================
// CAMPAIGN COST METRICS (readonly)
// ==========================================

export const campaignCostFields: FieldDefinition[] = [
  {
    id: 'totalSpend',
    label: 'Total Spend',
    type: 'currency',
    path: 'totalSpend',
    readonly: true,
    config: { prefix: '$' },
  },
  {
    id: 'costPerSend',
    label: 'Cost Per Send',
    type: 'currency',
    path: 'costPerSend',
    readonly: true,
    config: { prefix: '$' },
  },
  {
    id: 'costPerClick',
    label: 'Cost Per Click',
    type: 'currency',
    path: 'costPerClick',
    readonly: true,
    config: { prefix: '$' },
  },
  {
    id: 'costPerConversion',
    label: 'Cost Per Conversion',
    type: 'currency',
    path: 'costPerConversion',
    readonly: true,
    config: { prefix: '$' },
  },
  {
    id: 'roi',
    label: 'ROI',
    type: 'number',
    path: 'roi',
    readonly: true,
    config: { suffix: '%' },
  },
  {
    id: 'attributedRevenue',
    label: 'Attributed Revenue',
    type: 'currency',
    path: 'attributedRevenue',
    readonly: true,
    config: { prefix: '$' },
  },
];

export const campaignCostInputSet: InputSetConfig = {
  id: 'campaign-cost',
  name: 'Campaign Cost Metrics',
  label: 'Cost & ROI',
  description: 'Campaign cost and return on investment',
  fields: campaignCostFields,
  columns: 3,
};

// ==========================================
// FULL CAMPAIGN FORM INPUTSET
// ==========================================

export const campaignFullFields: FieldDefinition[] = [
  ...campaignBasicFields,
  ...campaignScheduleFields,
  ...campaignTargetFields,
  ...campaignGoalsFields,
  ...campaignAssignmentFields,
  ...campaignNotesFields,
];

export const campaignFullInputSet: InputSetConfig = {
  id: 'campaign-full',
  name: 'Full Campaign Form',
  label: 'Campaign Information',
  description: 'Complete campaign form with all fields',
  fields: campaignFullFields,
  columns: 2,
};

// ==========================================
// QUICK ADD CAMPAIGN INPUTSET
// ==========================================

export const campaignQuickAddFields: FieldDefinition[] = [
  {
    id: 'name',
    label: 'Campaign Name',
    type: 'text',
    path: 'name',
    required: true,
    editable: true,
    placeholder: 'Campaign name',
  },
  {
    id: 'campaignType',
    label: 'Type',
    type: 'select',
    path: 'campaignType',
    required: true,
    editable: true,
    options: CAMPAIGN_TYPE_OPTIONS,
    defaultValue: 'email',
  },
  {
    id: 'startDate',
    label: 'Start Date',
    type: 'date',
    path: 'startDate',
    required: true,
    editable: true,
  },
  {
    id: 'goalLeads',
    label: 'Lead Goal',
    type: 'number',
    path: 'goalLeads',
    editable: true,
    placeholder: '100',
  },
  {
    id: 'ownerId',
    label: 'Owner',
    type: 'select',
    path: 'ownerId',
    editable: true,
    optionsSource: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
      searchable: true,
    },
  },
];

export const campaignQuickAddInputSet: InputSetConfig = {
  id: 'campaign-quick-add',
  name: 'Quick Add Campaign',
  label: 'Quick Add Campaign',
  description: 'Minimal fields for quickly creating a campaign',
  fields: campaignQuickAddFields,
  columns: 2,
};
