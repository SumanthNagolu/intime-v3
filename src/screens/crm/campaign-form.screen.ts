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

const campaignFormConfig: Omit<FormTemplateConfig, 'mode' | 'submit'> = {
  entityType: 'campaign',
  domain: 'crm',
  displayName: 'Campaign',
  basePath: '/employee/crm/campaigns',

  // Data source for edit mode
  procedures: {
    getById: 'crm.campaigns.getById',
    create: 'crm.campaigns.create',
    update: 'crm.campaigns.update',
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
