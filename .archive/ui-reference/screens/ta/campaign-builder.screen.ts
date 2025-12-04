/**
 * Campaign Builder Screen Definition
 *
 * Multi-step wizard for creating campaigns:
 * 1. Campaign Details (name, type, dates)
 * 2. Target Selection (from leads, contacts, or import)
 * 3. Content Creation (template, message)
 * 4. Schedule & Review
 *
 * Routes: /employee/workspace/ta/campaigns/new
 *
 * @see docs/specs/20-USER-ROLES/03-ta/02-run-campaign.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import { TA_CAMPAIGN_TYPE_OPTIONS } from '@/lib/metadata/options/ta-options';
import { LEAD_SOURCE_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/metadata/options/crm-options';

// ==========================================
// CAMPAIGN BUILDER SCREEN
// ==========================================

export const campaignBuilderScreen: ScreenDefinition = {
  id: 'campaign-builder',
  type: 'wizard',
  entityType: 'campaign',
  title: 'Create Campaign',
  subtitle: 'Build an outreach campaign step by step',
  icon: 'Megaphone',

  steps: [
    // Step 1: Campaign Details
    {
      id: 'details',
      title: 'Campaign Details',
      description: 'Basic information about your campaign',
      icon: 'FileText',
      sections: [
        {
          id: 'basic-info',
          type: 'form',
          columns: 2,
          fields: [
            {
              id: 'name',
              label: 'Campaign Name',
              path: 'name',
              type: 'text',
              required: true,
              placeholder: 'e.g., Q1 Talent Sourcing Campaign',
              span: 2,
            },
            {
              id: 'campaignType',
              label: 'Campaign Type',
              path: 'campaignType',
              type: 'select',
              options: TA_CAMPAIGN_TYPE_OPTIONS,
              required: true,
            },
            {
              id: 'ownerId',
              label: 'Campaign Owner',
              path: 'ownerId',
              type: 'user-select',
              config: {
                procedure: 'users.listTASpecialists',
                currentUserDefault: true,
              },
              required: true,
            },
            {
              id: 'description',
              label: 'Description',
              path: 'description',
              type: 'textarea',
              config: { rows: 3 },
              placeholder: 'Describe the campaign goals and target audience...',
              span: 2,
            },
          ],
        },
        {
          id: 'schedule',
          type: 'form',
          title: 'Schedule',
          columns: 2,
          fields: [
            {
              id: 'startDate',
              label: 'Start Date',
              path: 'startDate',
              type: 'date',
              required: true,
            },
            {
              id: 'endDate',
              label: 'End Date',
              path: 'endDate',
              type: 'date',
            },
            {
              id: 'sendTime',
              label: 'Preferred Send Time',
              path: 'sendTime',
              type: 'time',
              config: { defaultValue: '09:00' },
            },
            {
              id: 'timezone',
              label: 'Timezone',
              path: 'timezone',
              type: 'timezone-select',
              config: { defaultValue: 'America/New_York' },
            },
          ],
        },
      ],
      validation: {
        required: ['name', 'campaignType', 'ownerId', 'startDate'],
      },
    },

    // Step 2: Target Selection
    {
      id: 'targets',
      title: 'Select Targets',
      description: 'Choose who to include in this campaign',
      icon: 'Users',
      sections: [
        // Target Source Selection
        {
          id: 'target-source',
          type: 'custom',
          component: 'TargetSourceSelector',
          componentProps: {
            sources: [
              { id: 'leads', label: 'From Leads', icon: 'Users', description: 'Select from existing leads' },
              { id: 'contacts', label: 'From Contacts', icon: 'Contact', description: 'Select from CRM contacts' },
              { id: 'import', label: 'Import List', icon: 'Upload', description: 'Import from CSV/Excel' },
              { id: 'previous', label: 'Previous Campaign', icon: 'History', description: 'Reuse targets from another campaign' },
            ],
          },
        },

        // Lead Selection (conditional)
        {
          id: 'lead-selection',
          type: 'custom',
          title: 'Select Leads',
          visible: { field: 'targetSource', operator: 'eq', value: 'leads' },
          component: 'LeadSelector',
          componentProps: {
            filters: [
              { id: 'stage', label: 'Stage', type: 'multi-select' },
              { id: 'source', label: 'Source', type: 'multi-select', options: LEAD_SOURCE_OPTIONS },
              { id: 'industry', label: 'Industry', type: 'multi-select', options: INDUSTRY_OPTIONS },
              { id: 'excludeCampaigns', label: 'Exclude from campaigns', type: 'async-multi-select' },
            ],
          },
        },

        // Contact Selection (conditional)
        {
          id: 'contact-selection',
          type: 'custom',
          title: 'Select Contacts',
          visible: { field: 'targetSource', operator: 'eq', value: 'contacts' },
          component: 'ContactSelector',
          componentProps: {
            filters: [
              { id: 'contactType', label: 'Type', type: 'multi-select' },
              { id: 'industry', label: 'Industry', type: 'multi-select', options: INDUSTRY_OPTIONS },
            ],
          },
        },

        // Import (conditional)
        {
          id: 'import-section',
          type: 'custom',
          title: 'Import Targets',
          visible: { field: 'targetSource', operator: 'eq', value: 'import' },
          component: 'CampaignTargetImporter',
          componentProps: {
            acceptedFormats: ['.csv', '.xlsx'],
            requiredColumns: ['email'],
            optionalColumns: ['name', 'company', 'title', 'phone'],
          },
        },

        // Previous Campaign Selection (conditional)
        {
          id: 'previous-campaign',
          type: 'form',
          title: 'Select Previous Campaign',
          visible: { field: 'targetSource', operator: 'eq', value: 'previous' },
          columns: 1,
          fields: [
            {
              id: 'sourceCampaignId',
              label: 'Campaign',
              path: 'sourceCampaignId',
              type: 'async-select',
              config: {
                procedure: 'ta.campaigns.listForSelect',
                labelPath: 'name',
                valuePath: 'id',
              },
            },
            {
              id: 'targetFilter',
              label: 'Include targets that',
              path: 'previousCampaignFilter',
              type: 'select',
              options: [
                { value: 'all', label: 'All targets' },
                { value: 'not_responded', label: 'Did not respond' },
                { value: 'responded', label: 'Responded' },
                { value: 'opened', label: 'Opened but did not respond' },
              ],
            },
          ],
        },

        // Target Summary
        {
          id: 'target-summary',
          type: 'info-card',
          title: 'Target Summary',
          widgets: [
            {
              id: 'target-count',
              type: 'metric',
              label: 'Selected Targets',
              path: 'selectedTargetCount',
              config: { icon: 'Users', size: 'lg' },
            },
          ],
        },
      ],
      validation: {
        custom: 'validateTargetsSelected',
      },
    },

    // Step 3: Content Creation
    {
      id: 'content',
      title: 'Create Content',
      description: 'Design your campaign message',
      icon: 'FileEdit',
      sections: [
        // Template Selection
        {
          id: 'template-selection',
          type: 'custom',
          title: 'Choose Template',
          component: 'CampaignTemplateSelector',
          componentProps: {
            categories: ['talent_sourcing', 'training_promotion', 'client_outreach', 'event_invitation'],
          },
        },

        // Content Editor
        {
          id: 'content-editor',
          type: 'custom',
          title: 'Edit Content',
          component: 'CampaignContentEditor',
          componentProps: {
            supportedVariables: [
              { key: '{{name}}', label: 'Recipient Name' },
              { key: '{{company}}', label: 'Company Name' },
              { key: '{{title}}', label: 'Job Title' },
              { key: '{{sender_name}}', label: 'Sender Name' },
              { key: '{{sender_title}}', label: 'Sender Title' },
            ],
            enablePreview: true,
          },
        },

        // Subject Line (for email campaigns)
        {
          id: 'email-fields',
          type: 'form',
          title: 'Email Settings',
          visible: { field: 'campaignType', operator: 'in', value: ['talent_sourcing', 'training_promotion', 'client_outreach'] },
          columns: 1,
          fields: [
            {
              id: 'subject',
              label: 'Subject Line',
              path: 'subject',
              type: 'text',
              required: true,
              placeholder: 'Enter email subject line',
              config: {
                maxLength: 100,
                showCount: true,
              },
            },
            {
              id: 'preheader',
              label: 'Preheader Text',
              path: 'preheader',
              type: 'text',
              placeholder: 'Preview text that appears after subject line',
              config: {
                maxLength: 150,
                showCount: true,
              },
            },
          ],
        },
      ],
      validation: {
        required: ['content'],
        custom: 'validateContent',
      },
    },

    // Step 4: Review & Launch
    {
      id: 'review',
      title: 'Review & Launch',
      description: 'Review your campaign before launching',
      icon: 'CheckCircle',
      sections: [
        // Campaign Summary
        {
          id: 'campaign-summary',
          type: 'custom',
          title: 'Campaign Summary',
          component: 'CampaignReviewSummary',
          componentProps: {
            sections: ['details', 'targets', 'content', 'schedule'],
          },
        },

        // Pre-launch Checklist
        {
          id: 'pre-launch-checklist',
          type: 'custom',
          title: 'Pre-launch Checklist',
          component: 'PreLaunchChecklist',
          componentProps: {
            checks: [
              { id: 'targets', label: 'Targets have been selected', path: 'selectedTargetCount', operator: 'gt', value: 0 },
              { id: 'content', label: 'Content has been created', path: 'content', operator: 'exists' },
              { id: 'subject', label: 'Subject line is set', path: 'subject', operator: 'exists' },
              { id: 'schedule', label: 'Start date is in the future', path: 'startDate', operator: 'future' },
            ],
          },
        },

        // Content Preview
        {
          id: 'content-preview',
          type: 'custom',
          title: 'Content Preview',
          component: 'CampaignContentPreviewCard',
          componentProps: {
            showSampleData: true,
          },
        },

        // Launch Options
        {
          id: 'launch-options',
          type: 'form',
          title: 'Launch Options',
          columns: 1,
          fields: [
            {
              id: 'launchOption',
              label: 'When to send',
              path: 'launchOption',
              type: 'radio-group',
              options: [
                { value: 'schedule', label: 'Schedule for start date', description: 'Campaign will start at the scheduled date and time' },
                { value: 'now', label: 'Send immediately', description: 'Campaign will start sending right away' },
                { value: 'draft', label: 'Save as draft', description: 'Save and launch later' },
              ],
              defaultValue: 'schedule',
            },
            {
              id: 'testEmail',
              label: 'Send test email to',
              path: 'testEmail',
              type: 'email',
              placeholder: 'your.email@company.com',
              config: {
                helperText: 'Send a test email before launching',
              },
            },
          ],
        },
      ],
    },
  ],

  navigation: {
    showProgress: true,
    showStepNumbers: true,
    allowSkip: false,
    saveDraft: true,
    allowResume: true,
  },

  onComplete: {
    action: 'create',
    entityType: 'campaign',
    successRedirect: '/employee/workspace/ta/campaigns/{id}',
    successMessage: 'Campaign created successfully',
    handler: 'ta.campaigns.createFromWizard',
  },

  actions: [
    {
      id: 'cancel',
      type: 'navigate',
      label: 'Cancel',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/ta/campaigns' },
    },
  ],

  breadcrumbs: [
    { label: 'Workspace', route: '/employee/workspace' },
    { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
    { label: 'Campaigns', route: '/employee/workspace/ta/campaigns' },
    { label: 'New Campaign' },
  ],
};

export default campaignBuilderScreen;
