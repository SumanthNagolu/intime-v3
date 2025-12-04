/**
 * Deal Form Screen Definitions
 *
 * Metadata-driven screens for creating and editing Deals.
 * Uses the createFormScreen factory for standardized form patterns.
 */

import { createCreateFormScreen, createEditFormScreen } from '@/lib/metadata/factories';
import type { FormTemplateConfig } from '@/lib/metadata/templates';
import {
  dealBasicInputSet,
  dealValueInputSet,
  dealStageInputSet,
  dealAssignmentInputSet,
  dealNotesInputSet,
} from '@/lib/metadata/inputsets';

// ==========================================
// DEAL FORM CONFIG
// ==========================================

const dealFormConfig: Omit<FormTemplateConfig, 'mode' | 'submit'> = {
  entityType: 'deal',
  domain: 'crm',
  basePath: '/employee/crm/deals',
  procedures: {
    getById: 'crm.deals.getById',
    create: 'crm.deals.create',
    update: 'crm.deals.update',
  },


  // Form sections using InputSets
  sections: [
    {
      id: 'basic',
      title: 'Deal Information',
      description: 'Basic deal details including title, type, and account',
      inputSet: dealBasicInputSet,
      collapsible: false,
    },
    {
      id: 'value',
      title: 'Deal Value',
      description: 'Financial details of the deal',
      inputSet: dealValueInputSet,
      collapsible: false,
    },
    {
      id: 'stage',
      title: 'Pipeline Stage',
      description: 'Current stage and expected close date',
      inputSet: dealStageInputSet,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: 'assignment',
      title: 'Assignment',
      description: 'Deal ownership',
      inputSet: dealAssignmentInputSet,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Additional notes about this deal',
      inputSet: dealNotesInputSet,
      collapsible: true,
      defaultExpanded: false,
    },
  ],

  // Validation rules
  validation: {
    rules: [
      {
        type: 'required',
        field: 'title',
        message: 'Deal title is required',
      },
      {
        type: 'required',
        field: 'value',
        message: 'Deal value is required',
      },
      {
        type: 'required',
        field: 'stage',
        message: 'Pipeline stage is required',
      },
      {
        type: 'required',
        field: 'expectedCloseDate',
        message: 'Expected close date is required',
      },
      {
        type: 'min',
        field: 'value',
        value: 0,
        message: 'Deal value cannot be negative',
      },
    ],
  },


  // Success handlers
  onSuccess: {
    create: {
      redirect: '/employee/crm/deals/{{id}}',
      toast: { message: 'Deal created successfully' },
    },
    update: {
      redirect: '/employee/crm/deals/{{id}}',
      toast: { message: 'Deal updated successfully' },
    },
  },

  // Navigation
  navigation: {
    create: {
      breadcrumbs: [
        { label: 'CRM', route: '/employee/crm' },
        { label: 'Deals', route: '/employee/crm/deals' },
        { label: 'New Deal' },
      ],
    },
    edit: {
      breadcrumbs: [
        { label: 'CRM', route: '/employee/crm' },
        { label: 'Deals', route: '/employee/crm/deals' },
        { label: '{{title}}', route: '/employee/crm/deals/{{id}}' },
        { label: 'Edit' },
      ],
    },
  },
};

// ==========================================
// GENERATE SCREENS
// ==========================================

export const dealCreateScreen = createCreateFormScreen(dealFormConfig);
export const dealEditScreen = createEditFormScreen(dealFormConfig);

export { dealFormConfig };

export default dealCreateScreen;
