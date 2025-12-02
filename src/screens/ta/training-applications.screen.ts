/**
 * Training Applications Screen Definition
 *
 * Queue of training program applications with:
 * - Application status tracking
 * - Interview scheduling
 * - Approval workflow
 *
 * Routes: /employee/workspace/ta/training/applications
 *
 * @see docs/specs/20-USER-ROLES/03-ta/07-manage-training-pipeline.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import {
  TRAINING_APPLICATION_STATUS_OPTIONS,
  TRAINING_PROGRAM_OPTIONS,
} from '@/lib/metadata/options/ta-options';

// ==========================================
// TABLE COLUMNS
// ==========================================

const applicationTableColumns = [
  {
    id: 'applicant',
    header: 'Applicant',
    accessor: 'applicantName',
    type: 'composite',
    sortable: true,
    width: '200px',
    config: {
      primary: { path: 'applicantName' },
      secondary: { path: 'applicantEmail' },
      avatar: { path: 'applicantName', type: 'initials' },
    },
  },
  {
    id: 'program',
    header: 'Program',
    accessor: 'programName',
    type: 'enum',
    sortable: true,
    config: {
      options: TRAINING_PROGRAM_OPTIONS,
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: TRAINING_APPLICATION_STATUS_OPTIONS,
      badgeColors: {
        new: 'blue',
        reviewing: 'amber',
        interview_scheduled: 'cyan',
        interviewed: 'purple',
        approved: 'green',
        enrolled: 'emerald',
        rejected: 'red',
        withdrawn: 'gray',
      },
    },
  },
  {
    id: 'submittedAt',
    header: 'Submitted',
    accessor: 'submittedAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
  {
    id: 'interviewDate',
    header: 'Interview',
    accessor: 'interviewDate',
    type: 'date',
    sortable: true,
    config: { format: 'medium' },
  },
  {
    id: 'source',
    header: 'Source',
    accessor: 'source',
    type: 'text',
  },
  {
    id: 'reviewer',
    header: 'Reviewer',
    accessor: 'reviewerName',
    type: 'text',
  },
];

// ==========================================
// TRAINING APPLICATIONS SCREEN
// ==========================================

export const trainingApplicationsScreen: ScreenDefinition = {
  id: 'training-applications',
  type: 'list',
  entityType: 'trainingApplication',
  title: 'Training Applications',
  subtitle: 'Review and process training program applications',
  icon: 'GraduationCap',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.training.listApplications',
      params: {},
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Metrics Row
      {
        id: 'application-metrics',
        type: 'metrics-grid',
        columns: 6,
        widgets: [
          {
            id: 'total',
            type: 'metric',
            label: 'Total',
            path: 'stats.total',
            config: { icon: 'FileText' },
          },
          {
            id: 'new',
            type: 'metric',
            label: 'New',
            path: 'stats.new',
            config: { icon: 'Plus', variant: 'blue' },
          },
          {
            id: 'reviewing',
            type: 'metric',
            label: 'Reviewing',
            path: 'stats.reviewing',
            config: { icon: 'Eye', variant: 'amber' },
          },
          {
            id: 'interview-scheduled',
            type: 'metric',
            label: 'Interviews Scheduled',
            path: 'stats.interviewScheduled',
            config: { icon: 'Calendar', variant: 'cyan' },
          },
          {
            id: 'approved',
            type: 'metric',
            label: 'Approved',
            path: 'stats.approved',
            config: { icon: 'CheckCircle', variant: 'green' },
          },
          {
            id: 'enrolled-qtd',
            type: 'metric',
            label: 'Enrolled (QTD)',
            path: 'stats.enrolledQTD',
            config: { icon: 'UserCheck', variant: 'emerald' },
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
            placeholder: 'Search applicants...',
            config: { fields: ['applicantName', 'applicantEmail'] },
          },
          {
            id: 'status',
            type: 'multi-select',
            label: 'Status',
            options: TRAINING_APPLICATION_STATUS_OPTIONS,
          },
          {
            id: 'program',
            type: 'multi-select',
            label: 'Program',
            options: TRAINING_PROGRAM_OPTIONS,
          },
          {
            id: 'dateRange',
            type: 'date-range',
            label: 'Submitted',
          },
        ],
      },

      // Applications Table
      {
        id: 'applications-table',
        type: 'table',
        columns_config: applicationTableColumns,
        selectable: true,
        pagination: {
          enabled: true,
          pageSize: 20,
          showPageSizeSelector: true,
        },
        rowClick: {
          type: 'navigate',
          route: { field: 'id', template: '/employee/workspace/ta/training/applications/{id}' },
        },
        emptyState: {
          title: 'No Applications',
          description: 'Training applications will appear here',
          icon: 'GraduationCap',
        },
        rowActions: [
          {
            id: 'view',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/employee/workspace/ta/training/applications/{id}' },
          },
          {
            id: 'start-review',
            type: 'mutation',
            label: 'Start Review',
            icon: 'ClipboardCheck',
            visible: { field: 'status', operator: 'eq', value: 'new' },
            config: { type: 'mutation', procedure: 'ta.training.startReview' },
          },
          {
            id: 'schedule-interview',
            type: 'modal',
            label: 'Schedule Interview',
            icon: 'Calendar',
            visible: { field: 'status', operator: 'in', value: ['reviewing', 'new'] },
            config: { type: 'modal', modal: 'schedule-training-interview' },
          },
          {
            id: 'approve',
            type: 'mutation',
            label: 'Approve',
            icon: 'CheckCircle',
            visible: { field: 'status', operator: 'eq', value: 'interviewed' },
            config: { type: 'mutation', procedure: 'ta.training.approve' },
          },
          {
            id: 'reject',
            type: 'modal',
            label: 'Reject',
            icon: 'X',
            variant: 'destructive',
            visible: { field: 'status', operator: 'nin', value: ['enrolled', 'rejected', 'withdrawn'] },
            config: { type: 'modal', modal: 'reject-application' },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'add-application',
      type: 'modal',
      label: 'Add Application',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'create-training-application' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportApplications' },
    },
  ],

  // Bulk Actions
  bulkActions: [
    {
      id: 'bulk-approve',
      type: 'mutation',
      label: 'Approve Selected',
      icon: 'CheckCircle',
      config: { type: 'mutation', procedure: 'ta.training.bulkApprove' },
    },
    {
      id: 'bulk-reject',
      type: 'modal',
      label: 'Reject Selected',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'modal', modal: 'bulk-reject-applications' },
    },
    {
      id: 'bulk-assign',
      type: 'modal',
      label: 'Assign Reviewer',
      icon: 'UserCheck',
      config: { type: 'modal', modal: 'bulk-assign-reviewer' },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Training', route: '/employee/workspace/ta/training' },
      { label: 'Applications' },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'n', action: 'add-application', description: 'Add application' },
    { key: '/', action: 'focus-search', description: 'Focus search' },
  ],
};

export default trainingApplicationsScreen;
