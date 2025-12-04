/**
 * Data Import Screen Definition
 *
 * Multi-step wizard for importing data from CSV files.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ENTITY_TYPE_OPTIONS = [
  { value: 'candidate', label: 'Candidates', description: 'Import candidate profiles and resumes' },
  { value: 'job', label: 'Jobs', description: 'Import job requisitions' },
  { value: 'account', label: 'Accounts', description: 'Import client accounts' },
  { value: 'contact', label: 'Contacts', description: 'Import client contacts' },
  { value: 'lead', label: 'Leads', description: 'Import sales leads' },
];

const DUPLICATE_HANDLING_OPTIONS = [
  { value: 'skip', label: 'Skip duplicates (based on email)' },
  { value: 'update', label: 'Update existing records' },
  { value: 'create', label: 'Create all (even duplicates)' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const dataImportScreen: ScreenDefinition = {
  id: 'data-import',
  type: 'wizard',
  // entityType: 'import', // Admin entity

  title: 'Import Data',
  subtitle: 'Bulk import data from CSV files',
  icon: 'Upload',

  // Permissions
  permissions: [],

  // Layout (required for wizard type)
  layout: { type: 'wizard-steps', sections: [] },

  // Wizard Steps
  steps: [
    // Step 1: Select Data Type
    {
      id: 'select-type',
      title: 'Select Data Type',
      description: 'Choose what type of data to import',
      icon: 'FileType',
      sections: [
        {
          id: 'entity-selection',
          type: 'form',
          fields: [
            {
              id: 'entityType',
              label: 'What type of data are you importing?',
              type: 'select',
              path: 'entityType',
              config: {
                required: true,
                options: ENTITY_TYPE_OPTIONS,
                columns: 1,
              },
            },
          ],
        },
      ],
      validation: {
        required: ['entityType'],
      },
    },
    // Step 2: Download Template
    {
      id: 'template',
      title: 'Download Template',
      description: 'Get the CSV template for your data',
      icon: 'Download',
      sections: [
        {
          id: 'template-info',
          type: 'custom',
          component: 'ImportTemplateInfo',
          componentProps: {
            showRequiredFields: true,
            showOptionalFields: true,
          },
        },
        {
          id: 'template-actions',
          type: 'custom',
          component: 'TemplateDownloadButtons',
          componentProps: {
            buttons: [
              { id: 'template', label: 'Download Template (CSV)', icon: 'FileSpreadsheet' },
              { id: 'sample', label: 'Download Sample Data (CSV)', icon: 'FileText' },
            ],
          },
        },
      ],
      skippable: true,
    },
    // Step 3: Upload & Validate
    {
      id: 'upload',
      title: 'Upload & Validate',
      description: 'Upload your CSV file for validation',
      icon: 'Upload',
      sections: [
        {
          id: 'file-upload',
          type: 'form',
          fields: [
            {
              id: 'file',
              label: 'Upload CSV File',
              type: 'file',
              path: 'file',
              config: {
                accept: '.csv',
                maxSize: '25MB',
                dropzone: true,
                helpText: 'Drag & drop your CSV file here or click to browse',
              },
            },
          ],
        },
        {
          id: 'import-options',
          type: 'form',
          title: 'Import Options',
          columns: 1,
          fields: [
            {
              id: 'duplicateHandling',
              label: 'Duplicate Handling',
              type: 'radio',
              path: 'options.duplicateHandling',
              config: {
                options: DUPLICATE_HANDLING_OPTIONS,
                defaultValue: 'skip',
              },
            },
            {
              id: 'sendWelcomeEmail',
              label: 'Send welcome email to new candidates',
              type: 'checkbox',
              path: 'options.sendWelcomeEmail',
              config: { defaultValue: false },
              visible: { field: 'entityType', operator: 'eq', value: 'candidate' },
            },
            {
              id: 'addTag',
              label: 'Add "Imported" tag for tracking',
              type: 'checkbox',
              path: 'options.addImportedTag',
              config: { defaultValue: true },
            },
            {
              id: 'associateJob',
              label: 'Associate with specific job',
              type: 'select',
              path: 'options.jobId',
              config: {
                placeholder: 'Select a job (optional)...',
                dataSource: { procedure: 'jobs.listActive' },
              },
              visible: { field: 'entityType', operator: 'eq', value: 'candidate' },
            },
          ],
        },
      ],
      validation: {
        required: ['file'],
      },
    },
    // Step 4: Review & Import
    {
      id: 'review',
      title: 'Review & Import',
      description: 'Review validation results and start import',
      icon: 'CheckCircle',
      sections: [
        {
          id: 'validation-summary',
          type: 'custom',
          component: 'ImportValidationSummary',
          componentProps: {
            showStats: true,
            showErrors: true,
            showWarnings: true,
          },
        },
        {
          id: 'validation-details',
          type: 'table',
          title: 'Detailed Results',
          columns_config: [
            { id: 'row', label: 'Row', path: 'row', type: 'number', width: '60px' },
            { id: 'identifier', label: 'Identifier', path: 'identifier', type: 'text' },
            {
              id: 'status',
              label: 'Status',
              path: 'status',
              type: 'enum',
              config: {
                options: [
                  { value: 'ready', label: 'Ready' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'error', label: 'Error' },
                ],
                badgeColors: { ready: 'green', warning: 'yellow', error: 'red' },
              },
            },
            { id: 'issue', label: 'Issue', path: 'issue', type: 'text' },
          ],
          dataSource: {
            type: 'custom',
            query: {
              procedure: 'admin.import.getValidationResults',
              params: {},
            },
          },
          pagination: { enabled: true, pageSize: 20 },
        },
        {
          id: 'import-action',
          type: 'form',
          title: 'Import Options',
          fields: [
            {
              id: 'importMode',
              label: 'What to import?',
              type: 'radio',
              path: 'importMode',
              config: {
                options: [
                  { value: 'valid', label: 'Import only valid rows' },
                  { value: 'valid_warnings', label: 'Import valid + warning rows' },
                  { value: 'fix', label: 'Fix errors and re-upload' },
                ],
                defaultValue: 'valid',
              },
            },
          ],
        },
      ],
    },
  ],

  // Wizard Navigation
  navigation: {
    allowSkip: false,
    showProgress: true,
    showStepNumbers: true,
    saveDraft: false,
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Data Management', route: '/admin/data' },
      { label: 'Import Data' },
    ],
  },

  // On Complete
  onComplete: {
    action: 'custom',
    handler: 'handleDataImport',
    successRedirect: '/admin/data',
    successMessage: 'Import completed successfully',
  },
};

export default dataImportScreen;
