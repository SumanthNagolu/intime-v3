/**
 * Duplicate Detection Screen Definition
 *
 * Find and merge duplicate records across entities.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ENTITY_TYPE_OPTIONS = [
  { value: 'candidate', label: 'Candidates' },
  { value: 'contact', label: 'Contacts' },
  { value: 'account', label: 'Accounts' },
  { value: 'lead', label: 'Leads' },
];

const MATCH_METHOD_OPTIONS = [
  { value: 'email', label: 'Email (exact match)' },
  { value: 'phone', label: 'Phone (normalized match)' },
  { value: 'name_location', label: 'Name + Location (fuzzy match)' },
  { value: 'linkedin', label: 'LinkedIn URL (exact match)' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const duplicateGroupsColumns: TableColumnDefinition[] = [
  { id: 'groupId', label: 'Group', path: 'groupNumber', type: 'number', width: '80px' },
  { id: 'recordCount', label: 'Records', path: 'recordCount', type: 'number', width: '80px' },
  { id: 'matchType', label: 'Match Type', path: 'matchType', type: 'text' },
  { id: 'confidence', label: 'Confidence', path: 'confidence', type: 'progress', config: { max: 100 } },
  { id: 'primaryRecord', label: 'Primary Record', path: 'primaryRecord.displayName', type: 'text' },
  { id: 'email', label: 'Email', path: 'primaryRecord.email', type: 'email' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const duplicateDetectionScreen: ScreenDefinition = {
  id: 'duplicate-detection',
  type: 'detail',
  // entityType: 'duplicate', // Admin entity

  title: 'Merge Duplicates',
  subtitle: 'Find and merge duplicate records',
  icon: 'GitMerge',

  // Permissions
  permissions: [],

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Detection Configuration
      {
        id: 'detection-config',
        type: 'form',
        title: 'Duplicate Detection',
        description: 'Configure how to find duplicates',
        icon: 'Search',
        columns: 2,
        fields: [
          {
            id: 'entityType',
            label: 'Entity Type',
            type: 'radio',
            path: 'entityType',
            config: {
              options: ENTITY_TYPE_OPTIONS,
              defaultValue: 'candidate',
            },
          },
          {
            id: 'matchMethods',
            label: 'Detection Methods',
            type: 'checkbox-group',
            path: 'matchMethods',
            config: {
              options: MATCH_METHOD_OPTIONS,
              defaultValue: ['email', 'phone', 'name_location'],
            },
          },
          {
            id: 'fuzzyThreshold',
            label: 'Fuzzy Matching Threshold',
            type: 'number',
            path: 'fuzzyThreshold',
            config: {
              min: 50,
              max: 100,
              step: 5,
              defaultValue: 85,
              suffix: '% similarity',
              helpText: 'Higher = stricter matching',
            },
          },
        ],
        actions: [
          {
            id: 'scan',
            type: 'custom',
            label: 'Scan for Duplicates',
            variant: 'primary',
            icon: 'Search',
            config: { type: 'custom', handler: 'handleScanDuplicates' },
          },
        ],
      },
      // Scan Results Summary
      {
        id: 'scan-summary',
        type: 'metrics-grid',
        title: 'Scan Results',
        columns: 3,
        fields: [
          { id: 'totalGroups', label: 'Duplicate Groups', type: 'number', path: 'results.totalGroups' },
          { id: 'totalRecords', label: 'Total Records', type: 'number', path: 'results.totalRecords' },
          { id: 'potentialSavings', label: 'Records to Merge', type: 'number', path: 'results.recordsToMerge' },
        ],
        visible: { field: 'hasResults', operator: 'eq', value: true },
      },
      // Duplicate Groups Table
      {
        id: 'duplicate-groups',
        type: 'table',
        title: 'Duplicate Groups',
        columns_config: duplicateGroupsColumns,
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'admin.duplicates.getGroups',
            params: {},
          },
        },
        rowClick: {
          type: 'modal',
          modal: 'MergeDuplicatesModal',
        },
        rowActions: [
          {
            id: 'review',
            type: 'modal',
            label: 'Review & Merge',
            icon: 'GitMerge',
            config: { type: 'modal', modal: 'MergeDuplicatesModal' },
          },
          {
            id: 'ignore',
            type: 'mutation',
            label: 'Not Duplicates',
            icon: 'X',
            config: { type: 'mutation', procedure: 'admin.duplicates.markNotDuplicates' },
          },
        ],
        emptyState: {
          title: 'No duplicates found',
          description: 'Run a scan to find potential duplicate records',
          icon: 'CheckCircle',
        },
        visible: { field: 'hasResults', operator: 'eq', value: true },
      },
      // Merge Preview (shown when reviewing a group)
      {
        id: 'merge-preview',
        type: 'custom',
        title: 'Merge Preview',
        component: 'DuplicateMergePreview',
        componentProps: {
          showFieldComparison: true,
          showMergeStrategy: true,
          showAssociatedRecords: true,
        },
        visible: { field: 'selectedGroup', operator: 'neq', value: null },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'merge-all',
      type: 'custom',
      label: 'Auto-Merge All',
      variant: 'secondary',
      icon: 'GitMerge',
      config: { type: 'custom', handler: 'handleAutoMergeAll' },
      confirm: {
        title: 'Auto-Merge All Duplicates',
        message: 'This will automatically merge all duplicate groups using the default strategy. Review the results carefully.',
      },
      visible: { field: 'hasResults', operator: 'eq', value: true },
    },
    {
      id: 'export-report',
      type: 'custom',
      label: 'Export Report',
      variant: 'secondary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExportDuplicateReport' },
      visible: { field: 'hasResults', operator: 'eq', value: true },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Data Management', route: '/admin/data' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Data Management', route: '/admin/data' },
      { label: 'Merge Duplicates' },
    ],
  },
};

export default duplicateDetectionScreen;
