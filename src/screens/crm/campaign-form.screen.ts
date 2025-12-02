/**
 * Campaign Form Screen Definitions
 *
 * Metadata-driven screens for creating and editing Campaigns.
 * Uses the createFormScreen factory for standardized form patterns.
 */

import { createCreateFormScreen, createEditFormScreen } from '@/lib/metadata/factories';
import type { FormTemplateConfig } from '@/lib/metadata/templates';
import {
  campaignBasicInputSet,
  campaignScheduleInputSet,
  campaignTargetInputSet,
  campaignGoalsInputSet,
  campaignAssignmentInputSet,
  campaignNotesInputSet,
} from '@/lib/metadata/inputsets';

// ==========================================
// CAMPAIGN FORM CONFIG
// ==========================================

const campaignFormConfig: FormTemplateConfig = {
  entityId: 'campaign',
  entityName: 'Campaign',
  basePath: '/employee/crm/campaigns',

  // Data source for edit mode
  dataSource: {
    getProcedure: 'crm.campaigns.getById',
    createProcedure: 'crm.campaigns.create',
    updateProcedure: 'crm.campaigns.update',
    idParam: 'id',
  },

  // Form sections using InputSets
  sections: [
    {
      id: 'basic',
      title: 'Campaign Information',
      description: 'Basic campaign details including name, type, and status',
      inputSet: campaignBasicInputSet,
      collapsible: false,
    },
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'Campaign timing and schedule',
      inputSet: campaignScheduleInputSet,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: 'target',
      title: 'Target Audience',
      description: 'Define who this campaign targets',
      inputSet: campaignTargetInputSet,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: 'goals',
      title: 'Goals & Budget',
      description: 'Campaign objectives and budget allocation',
      inputSet: campaignGoalsInputSet,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: 'assignment',
      title: 'Assignment',
      description: 'Campaign owner',
      inputSet: campaignAssignmentInputSet,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Additional campaign notes',
      inputSet: campaignNotesInputSet,
      collapsible: true,
      defaultExpanded: false,
    },
  ],

  // Validation rules
  validation: {
    rules: [
      {
        type: 'required',
        field: 'name',
        message: 'Campaign name is required',
      },
      {
        type: 'required',
        field: 'campaignType',
        message: 'Campaign type is required',
      },
      {
        type: 'min',
        field: 'budget',
        value: 0,
        message: 'Budget cannot be negative',
      },
      {
        type: 'min',
        field: 'goalLeads',
        value: 0,
        message: 'Lead goal cannot be negative',
      },
      {
        type: 'min',
        field: 'goalResponses',
        value: 0,
        message: 'Response goal cannot be negative',
      },
      {
        type: 'min',
        field: 'goalMeetings',
        value: 0,
        message: 'Meeting goal cannot be negative',
      },
    ],
  },

  // Form actions
  actions: {
    submit: {
      label: 'Save Campaign',
      variant: 'primary',
      icon: 'Check',
    },
    cancel: {
      label: 'Cancel',
      variant: 'secondary',
      route: '/employee/crm/campaigns',
    },
    saveAndNew: {
      label: 'Save & Add Another',
      variant: 'secondary',
      showOnCreate: true,
      showOnEdit: false,
    },
  },

  // Success handlers
  onSuccess: {
    create: {
      redirect: '/employee/crm/campaigns/{{id}}',
      toast: { message: 'Campaign created successfully' },
    },
    update: {
      redirect: '/employee/crm/campaigns/{{id}}',
      toast: { message: 'Campaign updated successfully' },
    },
  },

  // Navigation
  navigation: {
    create: {
      breadcrumbs: [
        { label: 'CRM', route: '/employee/crm' },
        { label: 'Campaigns', route: '/employee/crm/campaigns' },
        { label: 'New Campaign' },
      ],
    },
    edit: {
      breadcrumbs: [
        { label: 'CRM', route: '/employee/crm' },
        { label: 'Campaigns', route: '/employee/crm/campaigns' },
        { label: '{{name}}', route: '/employee/crm/campaigns/{{id}}' },
        { label: 'Edit' },
      ],
    },
  },
};

// ==========================================
// GENERATE SCREENS
// ==========================================

export const campaignCreateScreen = createCreateFormScreen(campaignFormConfig);
export const campaignEditScreen = createEditFormScreen(campaignFormConfig);

export { campaignFormConfig };

export default campaignCreateScreen;
