/**
 * Data Management Hub Screen Definition
 *
 * Central hub for data operations: import, export, merge, reassign, archive.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const dataHubScreen: ScreenDefinition = {
  id: 'data-hub',
  type: 'dashboard',
  // entityType: 'organization', // Admin entity

  title: 'Data Management',
  subtitle: 'Import, export, and maintain your data',
  icon: 'Database',

  // Permissions
  permissions: [],

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Data Operations Grid
      {
        id: 'data-operations',
        type: 'custom',
        component: 'DataOperationsGrid',
        componentProps: {
          operations: [
            {
              id: 'import',
              title: 'Import Data',
              description: 'Bulk import candidates, jobs, or other records from CSV',
              icon: 'Upload',
              route: '/admin/data/import',
              color: 'blue',
            },
            {
              id: 'export',
              title: 'Export Data',
              description: 'Export data for reporting or backup',
              icon: 'Download',
              route: '/admin/data/export',
              color: 'green',
            },
            {
              id: 'duplicates',
              title: 'Merge Duplicates',
              description: 'Find and merge duplicate records',
              icon: 'GitMerge',
              route: '/admin/data/duplicates',
              color: 'purple',
              badge: { path: 'stats.potentialDuplicates', variant: 'warning' },
            },
            {
              id: 'reassign',
              title: 'Bulk Reassign',
              description: 'Transfer ownership of records between users',
              icon: 'UserPlus',
              route: '/admin/data/reassign',
              color: 'orange',
            },
            {
              id: 'archive',
              title: 'Archive Data',
              description: 'Move inactive records to archive',
              icon: 'Archive',
              route: '/admin/data/archive',
              color: 'gray',
            },
            {
              id: 'quality',
              title: 'Data Quality Report',
              description: 'View data quality metrics and issues',
              icon: 'CheckCircle2',
              route: '/admin/data/quality',
              color: 'cyan',
            },
          ],
          columns: 2,
        },
      },
      // Data Stats
      {
        id: 'data-stats',
        type: 'metrics-grid',
        title: 'Data Overview',
        columns: 4,
        fields: [
          { id: 'candidates', label: 'Candidates', type: 'number', path: 'stats.candidates' },
          { id: 'jobs', label: 'Jobs', type: 'number', path: 'stats.jobs' },
          { id: 'submissions', label: 'Submissions', type: 'number', path: 'stats.submissions' },
          { id: 'placements', label: 'Placements', type: 'number', path: 'stats.placements' },
        ],
        dataSource: {
          type: 'aggregate',
          // entityType: 'organization', // Admin entity
        },
      },
      // Recent Operations
      {
        id: 'recent-operations',
        type: 'table',
        title: 'Recent Data Operations',
        icon: 'History',
        collapsible: true,
        defaultExpanded: false,
        columns_config: [
          { id: 'operation', label: 'Operation', path: 'operationType', type: 'text' },
          { id: 'entityType', label: 'Entity', path: 'entityType', type: 'text' },
          { id: 'recordCount', label: 'Records', path: 'recordCount', type: 'number' },
          { id: 'performedBy', label: 'By', path: 'actor.fullName', type: 'text' },
          { id: 'performedAt', label: 'When', path: 'performedAt', type: 'date', config: { format: 'relative' } },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: [
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
                { value: 'in_progress', label: 'In Progress' },
              ],
              badgeColors: { completed: 'green', failed: 'red', in_progress: 'blue' },
            },
          },
        ],
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'admin.dataOperations.getRecent',
            params: { limit: 10 },
          },
        },
      },
      // Data Quality Summary
      {
        id: 'data-quality',
        type: 'info-card',
        title: 'Data Quality Summary',
        icon: 'CheckCircle2',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          { id: 'overallScore', label: 'Overall Score', type: 'progress', path: 'quality.overallScore', config: { max: 100 } },
          { id: 'missingData', label: 'Records with Missing Data', type: 'number', path: 'quality.missingDataCount' },
          { id: 'duplicates', label: 'Potential Duplicates', type: 'number', path: 'quality.duplicateCount' },
          { id: 'staleRecords', label: 'Stale Records', type: 'number', path: 'quality.staleCount' },
        ],
        actions: [
          {
            id: 'view-report',
            type: 'navigate',
            label: 'View Full Report',
            icon: 'ExternalLink',
            config: { type: 'navigate', route: '/admin/data/quality' },
          },
        ],
      },
    ],
  },

  // Navigation
  navigation: {
    back: { label: 'Back to Admin', route: '/admin' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Data Management' },
    ],
  },
};

export default dataHubScreen;
