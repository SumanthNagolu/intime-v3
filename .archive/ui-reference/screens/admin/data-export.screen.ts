/**
 * Data Export Screen Definition
 *
 * Configure and generate data exports.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ENTITY_TYPE_OPTIONS = [
  { value: 'candidate', label: 'Candidates' },
  { value: 'job', label: 'Jobs' },
  { value: 'submission', label: 'Submissions' },
  { value: 'placement', label: 'Placements' },
  { value: 'account', label: 'Accounts' },
  { value: 'contact', label: 'Contacts' },
  { value: 'lead', label: 'Leads' },
  { value: 'deal', label: 'Deals' },
  { value: 'activity', label: 'Activities' },
];

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV (Excel-compatible)' },
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'json', label: 'JSON' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom range' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const dataExportScreen: ScreenDefinition = {
  id: 'data-export',
  type: 'detail',
  // entityType: 'export', // Admin entity

  title: 'Export Data',
  subtitle: 'Generate data exports for reporting or backup',
  icon: 'Download',

  // Permissions
  permissions: [],

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Entity Selection
      {
        id: 'entity-selection',
        type: 'form',
        title: 'What to Export',
        icon: 'FileType',
        columns: 1,
        fields: [
          {
            id: 'entityType',
            label: 'Data Type',
            type: 'select',
            path: 'entityType',
            options: [...ENTITY_TYPE_OPTIONS],
            config: { required: true },
          },
        ],
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        title: 'Filters',
        description: 'Narrow down the data to export',
        icon: 'Filter',
        columns: 2,
        fields: [
          {
            id: 'dateRange',
            label: 'Date Range',
            type: 'select',
            path: 'filters.dateRange',
            options: [...DATE_RANGE_OPTIONS],
            config: { defaultValue: 'all' },
          },
          {
            id: 'customDateFrom',
            label: 'From',
            type: 'date',
            path: 'filters.dateFrom',
            visible: { field: 'filters.dateRange', operator: 'eq', value: 'custom' },
          },
          {
            id: 'customDateTo',
            label: 'To',
            type: 'date',
            path: 'filters.dateTo',
            visible: { field: 'filters.dateRange', operator: 'eq', value: 'custom' },
          },
          {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            path: 'filters.status',
            config: {
              placeholder: 'All statuses',
              dynamicOptions: { procedure: 'admin.export.getStatusOptions' },
            },
          },
          {
            id: 'pod',
            label: 'Pod',
            type: 'multiselect',
            path: 'filters.podIds',
            config: {
              placeholder: 'All pods',
              dataSource: { procedure: 'admin.pods.listActive' },
            },
          },
          {
            id: 'owner',
            label: 'Owner',
            type: 'select',
            path: 'filters.ownerId',
            config: {
              placeholder: 'All owners',
              dataSource: { procedure: 'admin.users.listActive' },
            },
          },
        ],
      },
      // Field Selection
      {
        id: 'field-selection',
        type: 'form',
        title: 'Fields to Include',
        icon: 'List',
        columns: 1,
        fields: [
          {
            id: 'fieldSelection',
            label: 'Field Selection',
            type: 'radio',
            path: 'fieldSelection',
            config: {
              options: [
                { value: 'all', label: 'All fields (complete export)' },
                { value: 'standard', label: 'Standard fields (commonly used)' },
                { value: 'custom', label: 'Custom selection' },
              ],
              defaultValue: 'standard',
            },
          },
          {
            id: 'customFields',
            label: 'Select Fields',
            type: 'checkbox-group',
            path: 'customFields',
            config: {
              dynamicOptions: { procedure: 'admin.export.getFieldOptions' },
              columns: 3,
            },
            visible: { field: 'fieldSelection', operator: 'eq', value: 'custom' },
          },
        ],
      },
      // Export Options
      {
        id: 'export-options',
        type: 'form',
        title: 'Export Options',
        icon: 'Settings',
        columns: 2,
        fields: [
          {
            id: 'format',
            label: 'Format',
            type: 'radio',
            path: 'format',
            config: {
              options: FORMAT_OPTIONS,
              defaultValue: 'csv',
            },
          },
          {
            id: 'includeHeaders',
            label: 'Include column headers',
            type: 'checkbox',
            path: 'options.includeHeaders',
            config: { defaultValue: true },
          },
          {
            id: 'anonymize',
            label: 'Anonymize personal data (GDPR-friendly)',
            type: 'checkbox',
            path: 'options.anonymize',
            config: { defaultValue: false },
          },
          {
            id: 'includeArchived',
            label: 'Include archived records',
            type: 'checkbox',
            path: 'options.includeArchived',
            config: { defaultValue: false },
          },
        ],
      },
      // Export Preview
      {
        id: 'preview',
        type: 'custom',
        title: 'Export Preview',
        icon: 'Eye',
        component: 'ExportPreview',
        componentProps: {
          showEstimate: true,
          showSampleData: true,
          maxSampleRows: 5,
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'export',
      type: 'custom',
      label: 'Generate Export',
      variant: 'primary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleGenerateExport' },
    },
    {
      id: 'schedule',
      type: 'modal',
      label: 'Schedule Export',
      variant: 'secondary',
      icon: 'Calendar',
      config: { type: 'modal', modal: 'ScheduleExportModal' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Data Management', route: '/admin/data' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Data Management', route: '/admin/data' },
      { label: 'Export Data' },
    ],
  },
};

export default dataExportScreen;
