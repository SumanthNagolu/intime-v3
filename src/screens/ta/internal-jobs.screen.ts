/**
 * Internal Jobs Screen Definition
 *
 * Internal job postings management with:
 * - Job listings with status
 * - Candidate pipeline per job
 * - Quick posting workflow
 *
 * Routes: /employee/workspace/ta/internal-jobs
 *
 * @see docs/specs/20-USER-ROLES/03-ta/03-internal-hiring.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import {
  INTERNAL_JOB_STATUS_OPTIONS,
  INTERNAL_JOB_TYPE_OPTIONS,
} from '@/lib/metadata/options/ta-options';

// ==========================================
// TABLE COLUMNS
// ==========================================

const jobTableColumns = [
  {
    id: 'title',
    header: 'Position',
    accessor: 'title',
    type: 'composite',
    sortable: true,
    width: '250px',
    config: {
      primary: { path: 'title' },
      secondary: { path: 'department' },
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: INTERNAL_JOB_STATUS_OPTIONS,
      badgeColors: {
        draft: 'gray',
        open: 'green',
        on_hold: 'amber',
        filled: 'blue',
        cancelled: 'red',
      },
    },
  },
  {
    id: 'jobType',
    header: 'Type',
    accessor: 'jobType',
    type: 'enum',
    config: {
      options: INTERNAL_JOB_TYPE_OPTIONS,
    },
  },
  {
    id: 'location',
    header: 'Location',
    accessor: 'location',
    type: 'text',
  },
  {
    id: 'candidates',
    header: 'Candidates',
    accessor: 'candidateCount',
    type: 'number',
    sortable: true,
  },
  {
    id: 'interviews',
    header: 'Interviews',
    accessor: 'interviewCount',
    type: 'number',
  },
  {
    id: 'hiringManager',
    header: 'Hiring Manager',
    accessor: 'hiringManagerName',
    type: 'text',
  },
  {
    id: 'postedAt',
    header: 'Posted',
    accessor: 'postedAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
];

// ==========================================
// INTERNAL JOBS SCREEN
// ==========================================

export const internalJobsScreen: ScreenDefinition = {
  id: 'internal-jobs',
  type: 'list',
  entityType: 'internalJob',
  title: 'Internal Jobs',
  subtitle: 'Manage internal job postings and hiring',
  icon: 'Building2',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.internalJobs.list',
      params: {},
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Metrics Row
      {
        id: 'job-metrics',
        type: 'metrics-grid',
        columns: 5,
        widgets: [
          {
            id: 'total',
            type: 'metric',
            label: 'Total Jobs',
            path: 'stats.total',
            config: { icon: 'Briefcase' },
          },
          {
            id: 'open',
            type: 'metric',
            label: 'Open',
            path: 'stats.open',
            config: { icon: 'CircleDot', variant: 'green' },
          },
          {
            id: 'total-candidates',
            type: 'metric',
            label: 'Total Candidates',
            path: 'stats.totalCandidates',
            config: { icon: 'Users', variant: 'blue' },
          },
          {
            id: 'interviews-scheduled',
            type: 'metric',
            label: 'Interviews Scheduled',
            path: 'stats.interviewsScheduled',
            config: { icon: 'Calendar', variant: 'amber' },
          },
          {
            id: 'filled-qtd',
            type: 'metric',
            label: 'Filled (QTD)',
            path: 'stats.filledQTD',
            config: { icon: 'CheckCircle', variant: 'success' },
          },
        ],
      },

      // Filters
      {
        id: 'filters',
        type: 'field-grid',
        inline: true,
        columns: 4,
        fields: [
          {
            id: 'search',
            type: 'search',
            placeholder: 'Search jobs...',
            config: { fields: ['title', 'department'] },
          },
          {
            id: 'status',
            type: 'multi-select',
            label: 'Status',
            options: INTERNAL_JOB_STATUS_OPTIONS,
          },
          {
            id: 'jobType',
            type: 'multi-select',
            label: 'Type',
            options: INTERNAL_JOB_TYPE_OPTIONS,
          },
          {
            id: 'department',
            type: 'async-select',
            label: 'Department',
            config: {
              procedure: 'org.departments.list',
              labelPath: 'name',
              valuePath: 'id',
            },
          },
        ],
      },

      // Jobs Table
      {
        id: 'jobs-table',
        type: 'table',
        columns_config: jobTableColumns,
        selectable: true,
        pagination: {
          enabled: true,
          pageSize: 20,
          showPageSizeSelector: true,
        },
        rowClick: {
          type: 'navigate',
          route: { field: 'id', template: '/employee/workspace/ta/internal-jobs/{id}' },
        },
        emptyState: {
          title: 'No Internal Jobs',
          description: 'Create your first internal job posting',
          icon: 'Building2',
          action: {
            id: 'create-job',
            type: 'navigate',
            label: 'Create Job',
            icon: 'Plus',
            config: { type: 'navigate', route: '/employee/workspace/ta/internal-jobs/new' },
          },
        },
        rowActions: [
          {
            id: 'view',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/employee/workspace/ta/internal-jobs/{id}' },
          },
          {
            id: 'edit',
            type: 'navigate',
            label: 'Edit',
            icon: 'Pencil',
            config: { type: 'navigate', route: '/employee/workspace/ta/internal-jobs/{id}/edit' },
          },
          {
            id: 'view-candidates',
            type: 'navigate',
            label: 'View Candidates',
            icon: 'Users',
            config: { type: 'navigate', route: '/employee/workspace/ta/internal-jobs/{id}/candidates' },
          },
          {
            id: 'publish',
            type: 'mutation',
            label: 'Publish',
            icon: 'Send',
            visible: { field: 'status', operator: 'eq', value: 'draft' },
            config: { type: 'mutation', procedure: 'ta.internalJobs.publish' },
          },
          {
            id: 'put-on-hold',
            type: 'mutation',
            label: 'Put on Hold',
            icon: 'Pause',
            visible: { field: 'status', operator: 'eq', value: 'open' },
            config: { type: 'mutation', procedure: 'ta.internalJobs.putOnHold' },
          },
          {
            id: 'reopen',
            type: 'mutation',
            label: 'Reopen',
            icon: 'Play',
            visible: { field: 'status', operator: 'eq', value: 'on_hold' },
            config: { type: 'mutation', procedure: 'ta.internalJobs.reopen' },
          },
          {
            id: 'mark-filled',
            type: 'modal',
            label: 'Mark as Filled',
            icon: 'CheckCircle',
            visible: { field: 'status', operator: 'eq', value: 'open' },
            config: { type: 'modal', modal: 'mark-job-filled' },
          },
          {
            id: 'cancel',
            type: 'mutation',
            label: 'Cancel',
            icon: 'X',
            variant: 'destructive',
            visible: { field: 'status', operator: 'in', value: ['open', 'on_hold', 'draft'] },
            config: { type: 'mutation', procedure: 'ta.internalJobs.cancel' },
            confirm: {
              title: 'Cancel Job',
              message: 'Are you sure you want to cancel this job posting?',
              destructive: true,
            },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'create-job',
      type: 'navigate',
      label: 'New Job',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/ta/internal-jobs/new' },
    },
    {
      id: 'all-candidates',
      type: 'navigate',
      label: 'All Candidates',
      icon: 'Users',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/workspace/ta/internal-candidates' },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Internal Jobs' },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'n', action: 'create-job', description: 'Create new job' },
    { key: '/', action: 'focus-search', description: 'Focus search' },
  ],
};

export default internalJobsScreen;
