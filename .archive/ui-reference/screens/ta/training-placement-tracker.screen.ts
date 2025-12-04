/**
 * Training Placement Tracker Screen Definition
 *
 * Track training graduates for 90 days post-completion:
 * - Placement status tracking
 * - 70% placement rate target within 90 days
 * - Graduate pipeline management
 *
 * Routes: /employee/workspace/ta/training/placements
 *
 * @see docs/specs/20-USER-ROLES/03-ta/07-manage-training-pipeline.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import { TRAINING_PROGRAM_OPTIONS } from '@/lib/metadata/options/ta-options';

// ==========================================
// PLACEMENT STATUS OPTIONS
// ==========================================

const PLACEMENT_STATUS_OPTIONS = [
  { value: 'seeking', label: 'Job Seeking', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'interviewing', label: 'Interviewing', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'offer_pending', label: 'Offer Pending', color: 'purple', bgColor: 'bg-purple-100' },
  { value: 'placed', label: 'Placed', color: 'green', bgColor: 'bg-green-100' },
  { value: 'not_placed', label: 'Not Placed', color: 'red', bgColor: 'bg-red-100' },
];

// ==========================================
// TABLE COLUMNS
// ==========================================

const placementTableColumns = [
  {
    id: 'graduate',
    header: 'Graduate',
    accessor: 'graduateName',
    type: 'composite',
    sortable: true,
    width: '200px',
    config: {
      primary: { path: 'graduateName' },
      secondary: { path: 'graduateEmail' },
      avatar: { path: 'graduateName', type: 'initials' },
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
    id: 'completedAt',
    header: 'Completed',
    accessor: 'completedAt',
    type: 'date',
    sortable: true,
    config: { format: 'medium' },
  },
  {
    id: 'daysPostGrad',
    header: 'Days Post-Grad',
    accessor: 'daysPostGraduation',
    type: 'custom',
    config: {
      component: 'DaysCounter',
      props: {
        warningThreshold: 60,
        dangerThreshold: 90,
      },
    },
  },
  {
    id: 'status',
    header: 'Placement Status',
    accessor: 'placementStatus',
    type: 'enum',
    sortable: true,
    config: {
      options: PLACEMENT_STATUS_OPTIONS,
      badgeColors: {
        seeking: 'blue',
        interviewing: 'amber',
        offer_pending: 'purple',
        placed: 'green',
        not_placed: 'red',
      },
    },
  },
  {
    id: 'employer',
    header: 'Employer',
    accessor: 'employerName',
    type: 'text',
  },
  {
    id: 'placedAt',
    header: 'Placed Date',
    accessor: 'placedAt',
    type: 'date',
    sortable: true,
    config: { format: 'medium' },
  },
  {
    id: 'jobTitle',
    header: 'Position',
    accessor: 'jobTitle',
    type: 'text',
  },
  {
    id: 'salary',
    header: 'Salary',
    accessor: 'salary',
    type: 'currency',
    config: { prefix: '$' },
  },
];

// ==========================================
// TRAINING PLACEMENT TRACKER SCREEN
// ==========================================

export const trainingPlacementTrackerScreen: ScreenDefinition = {
  id: 'training-placement-tracker',
  type: 'list',
  entityType: 'trainingPlacement',
  title: 'Training Placements',
  subtitle: 'Track graduate placements within 90 days (Target: 70%)',
  icon: 'Briefcase',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.training.listPlacements',
      params: {},
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Placement Metrics
      {
        id: 'placement-metrics',
        type: 'metrics-grid',
        columns: 5,
        widgets: [
          {
            id: 'total-graduates',
            type: 'metric',
            label: 'Total Graduates (90d)',
            path: 'stats.totalGraduates',
            config: { icon: 'GraduationCap' },
          },
          {
            id: 'placed',
            type: 'metric',
            label: 'Placed',
            path: 'stats.placed',
            config: { icon: 'CheckCircle', variant: 'success' },
          },
          {
            id: 'placement-rate',
            type: 'metric',
            label: 'Placement Rate',
            path: 'stats.placementRate',
            config: {
              icon: 'TrendingUp',
              suffix: '%',
              target: 70,
              showTarget: true,
            },
          },
          {
            id: 'interviewing',
            type: 'metric',
            label: 'Interviewing',
            path: 'stats.interviewing',
            config: { icon: 'Users', variant: 'amber' },
          },
          {
            id: 'avg-time-to-place',
            type: 'metric',
            label: 'Avg Time to Place',
            path: 'stats.avgTimeToPlace',
            config: {
              icon: 'Clock',
              suffix: ' days',
              lowerIsBetter: true,
            },
          },
        ],
      },

      // Placement Rate by Program
      {
        id: 'by-program',
        type: 'custom',
        title: 'Placement Rate by Program',
        component: 'ProgramPlacementChart',
        componentProps: {
          dataPath: 'stats.byProgram',
          targetRate: 70,
        },
      },

      // 90-Day Window Warning
      {
        id: 'at-risk',
        type: 'info-card',
        title: 'At Risk (60+ Days)',
        icon: 'AlertTriangle',
        visible: { path: 'stats.atRiskCount', operator: 'gt', value: 0 },
        widgets: [
          {
            id: 'at-risk-count',
            type: 'stat-card',
            label: 'Graduates approaching 90-day window',
            path: 'stats.atRiskCount',
            config: {
              variant: 'warning',
              action: {
                type: 'custom',
                handler: 'filterAtRisk',
              },
            },
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
            placeholder: 'Search graduates...',
            config: { fields: ['graduateName', 'graduateEmail', 'employerName'] },
          },
          {
            id: 'status',
            type: 'multi-select',
            label: 'Status',
            options: PLACEMENT_STATUS_OPTIONS,
          },
          {
            id: 'program',
            type: 'multi-select',
            label: 'Program',
            options: TRAINING_PROGRAM_OPTIONS,
          },
          {
            id: 'completionDate',
            type: 'date-range',
            label: 'Completed',
          },
        ],
      },

      // Placements Table
      {
        id: 'placements-table',
        type: 'table',
        columns_config: placementTableColumns,
        selectable: true,
        pagination: {
          enabled: true,
          pageSize: 20,
          showPageSizeSelector: true,
        },
        rowClick: {
          type: 'modal',
          modal: 'placement-detail',
        },
        emptyState: {
          title: 'No Placements',
          description: 'Training graduates will appear here after completion',
          icon: 'Briefcase',
        },
        rowActions: [
          {
            id: 'update-status',
            type: 'modal',
            label: 'Update Status',
            icon: 'RefreshCw',
            config: { type: 'modal', modal: 'update-placement-status' },
          },
          {
            id: 'record-placement',
            type: 'modal',
            label: 'Record Placement',
            icon: 'CheckCircle',
            visible: { field: 'placementStatus', operator: 'in', value: ['seeking', 'interviewing', 'offer_pending'] },
            config: { type: 'modal', modal: 'record-placement' },
          },
          {
            id: 'log-activity',
            type: 'modal',
            label: 'Log Activity',
            icon: 'Activity',
            config: {
              type: 'modal',
              modal: 'log-placement-activity',
            },
          },
          {
            id: 'view-graduate',
            type: 'navigate',
            label: 'View Graduate',
            icon: 'User',
            config: { type: 'navigate', route: '/employee/workspace/ta/training/graduates/{graduateId}' },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'export',
      type: 'custom',
      label: 'Export Report',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportPlacements' },
    },
    {
      id: 'bulk-outreach',
      type: 'modal',
      label: 'Bulk Outreach',
      icon: 'Send',
      variant: 'outline',
      config: { type: 'modal', modal: 'bulk-placement-outreach' },
    },
  ],

  // Bulk Actions
  bulkActions: [
    {
      id: 'bulk-update-status',
      type: 'modal',
      label: 'Update Status',
      icon: 'RefreshCw',
      config: { type: 'modal', modal: 'bulk-update-placement-status' },
    },
    {
      id: 'bulk-send-reminder',
      type: 'mutation',
      label: 'Send Reminder',
      icon: 'Bell',
      config: { type: 'mutation', procedure: 'ta.training.sendPlacementReminders' },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Training', route: '/employee/workspace/ta/training' },
      { label: 'Placements' },
    ],
  },
};

export default trainingPlacementTrackerScreen;
