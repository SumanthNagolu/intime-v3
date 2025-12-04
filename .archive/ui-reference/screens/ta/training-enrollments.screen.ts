/**
 * Training Enrollments Screen Definition
 *
 * Active training enrollments with:
 * - Progress tracking
 * - Cohort management
 * - Completion status
 *
 * Routes: /employee/workspace/ta/training/enrollments
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import {
  ENROLLMENT_STATUS_OPTIONS,
  TRAINING_PROGRAM_OPTIONS,
} from '@/lib/metadata/options/ta-options';

// ==========================================
// TABLE COLUMNS
// ==========================================

const enrollmentTableColumns = [
  {
    id: 'trainee',
    header: 'Trainee',
    accessor: 'traineeName',
    type: 'composite',
    sortable: true,
    width: '200px',
    config: {
      primary: { path: 'traineeName' },
      secondary: { path: 'traineeEmail' },
      avatar: { path: 'traineeName', type: 'initials' },
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
    id: 'cohort',
    header: 'Cohort',
    accessor: 'cohortName',
    type: 'text',
    sortable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: ENROLLMENT_STATUS_OPTIONS,
      badgeColors: {
        pending: 'amber',
        active: 'blue',
        completed: 'green',
        dropped: 'red',
        on_hold: 'gray',
      },
    },
  },
  {
    id: 'progress',
    header: 'Progress',
    accessor: 'progress',
    type: 'progress',
    sortable: true,
    config: { max: 100, suffix: '%' },
  },
  {
    id: 'startDate',
    header: 'Start Date',
    accessor: 'startDate',
    type: 'date',
    sortable: true,
    config: { format: 'short' },
  },
  {
    id: 'expectedEndDate',
    header: 'Expected End',
    accessor: 'expectedEndDate',
    type: 'date',
    sortable: true,
    config: { format: 'short' },
  },
  {
    id: 'mentor',
    header: 'Mentor',
    accessor: 'mentorName',
    type: 'text',
  },
];

// ==========================================
// TRAINING ENROLLMENTS SCREEN
// ==========================================

export const trainingEnrollmentsScreen: ScreenDefinition = {
  id: 'training-enrollments',
  type: 'list',
  entityType: 'trainingEnrollment',
  title: 'Training Enrollments',
  subtitle: 'Track active training enrollments and progress',
  icon: 'GraduationCap',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.training.listEnrollments',
      params: {},
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Metrics Row
      {
        id: 'enrollment-metrics',
        type: 'metrics-grid',
        columns: 5,
        widgets: [
          {
            id: 'total-active',
            type: 'metric',
            label: 'Active Enrollments',
            path: 'stats.active',
            config: { icon: 'Users', variant: 'blue' },
          },
          {
            id: 'pending-start',
            type: 'metric',
            label: 'Pending Start',
            path: 'stats.pending',
            config: { icon: 'Clock', variant: 'amber' },
          },
          {
            id: 'completed-qtd',
            type: 'metric',
            label: 'Completed (QTD)',
            path: 'stats.completedQTD',
            config: { icon: 'CheckCircle', variant: 'green' },
          },
          {
            id: 'avg-progress',
            type: 'metric',
            label: 'Avg Progress',
            path: 'stats.avgProgress',
            config: { icon: 'TrendingUp', suffix: '%' },
          },
          {
            id: 'placement-rate',
            type: 'metric',
            label: 'Placement Rate',
            path: 'stats.placementRate',
            config: { icon: 'Briefcase', suffix: '%', variant: 'success' },
          },
        ],
      },

      // Cohort Summary
      {
        id: 'cohort-summary',
        type: 'custom',
        title: 'Active Cohorts',
        component: 'CohortSummaryCards',
        componentProps: {
          dataPath: 'cohorts',
        },
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
            placeholder: 'Search trainees...',
            config: { fields: ['traineeName', 'traineeEmail'] },
          },
          {
            id: 'status',
            type: 'multi-select',
            label: 'Status',
            options: ENROLLMENT_STATUS_OPTIONS,
          },
          {
            id: 'program',
            type: 'multi-select',
            label: 'Program',
            options: TRAINING_PROGRAM_OPTIONS,
          },
          {
            id: 'cohort',
            type: 'async-select',
            label: 'Cohort',
            config: {
              procedure: 'ta.training.listCohorts',
              labelPath: 'name',
              valuePath: 'id',
            },
          },
        ],
      },

      // Enrollments Table
      {
        id: 'enrollments-table',
        type: 'table',
        columns_config: enrollmentTableColumns,
        selectable: true,
        pagination: {
          enabled: true,
          pageSize: 20,
          showPageSizeSelector: true,
        },
        rowClick: {
          type: 'modal',
          modal: 'enrollment-detail',
        },
        emptyState: {
          title: 'No Enrollments',
          description: 'Training enrollments will appear here',
          icon: 'GraduationCap',
        },
        rowActions: [
          {
            id: 'view-progress',
            type: 'modal',
            label: 'View Progress',
            icon: 'BarChart',
            config: { type: 'modal', modal: 'enrollment-progress' },
          },
          {
            id: 'update-progress',
            type: 'modal',
            label: 'Update Progress',
            icon: 'Edit',
            visible: { field: 'status', operator: 'eq', value: 'active' },
            config: { type: 'modal', modal: 'update-enrollment-progress' },
          },
          {
            id: 'mark-complete',
            type: 'mutation',
            label: 'Mark Complete',
            icon: 'CheckCircle',
            visible: { field: 'status', operator: 'eq', value: 'active' },
            config: { type: 'mutation', procedure: 'ta.training.markComplete' },
          },
          {
            id: 'place-trainee',
            type: 'modal',
            label: 'Place Trainee',
            icon: 'Briefcase',
            visible: { field: 'status', operator: 'eq', value: 'completed' },
            config: { type: 'modal', modal: 'place-trainee' },
          },
          {
            id: 'put-on-hold',
            type: 'modal',
            label: 'Put on Hold',
            icon: 'Pause',
            visible: { field: 'status', operator: 'eq', value: 'active' },
            config: { type: 'modal', modal: 'enrollment-hold' },
          },
          {
            id: 'drop',
            type: 'modal',
            label: 'Drop',
            icon: 'UserMinus',
            variant: 'destructive',
            visible: { field: 'status', operator: 'in', value: ['active', 'pending', 'on_hold'] },
            config: { type: 'modal', modal: 'drop-enrollment' },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'new-enrollment',
      type: 'modal',
      label: 'New Enrollment',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'create-enrollment' },
    },
    {
      id: 'manage-cohorts',
      type: 'navigate',
      label: 'Manage Cohorts',
      icon: 'Users',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/workspace/ta/training/cohorts' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportEnrollments' },
    },
  ],

  // Bulk Actions
  bulkActions: [
    {
      id: 'bulk-update-progress',
      type: 'modal',
      label: 'Update Progress',
      icon: 'Edit',
      config: { type: 'modal', modal: 'bulk-update-progress' },
    },
    {
      id: 'bulk-complete',
      type: 'mutation',
      label: 'Mark Complete',
      icon: 'CheckCircle',
      config: { type: 'mutation', procedure: 'ta.training.bulkComplete' },
    },
    {
      id: 'bulk-assign-mentor',
      type: 'modal',
      label: 'Assign Mentor',
      icon: 'UserCheck',
      config: { type: 'modal', modal: 'bulk-assign-mentor' },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Training', route: '/employee/workspace/ta/training' },
      { label: 'Enrollments' },
    ],
  },
};

export default trainingEnrollmentsScreen;
