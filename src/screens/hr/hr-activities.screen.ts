/**
 * HR Activities Queue Screen Definition
 *
 * Metadata-driven screen for HR-specific activity management.
 * Implements Activity-Centric UI patterns for HR workflows.
 *
 * Per Activity-Centric UI requirements and HR skill patterns
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ACTIVITY_TYPE_OPTIONS = [
  { value: 'task', label: 'Task' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
];

const ACTIVITY_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ACTIVITY_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const HR_ACTIVITY_PATTERN_OPTIONS = [
  { value: 'onboard_employee', label: 'Onboard Employee' },
  { value: 'process_i9', label: 'Process I-9' },
  { value: 'verify_work_auth', label: 'Verify Work Authorization' },
  { value: 'enroll_benefits', label: 'Enroll in Benefits' },
  { value: 'review_timesheet', label: 'Review Timesheet' },
  { value: 'approve_pto', label: 'Approve PTO' },
  { value: 'conduct_exit_interview', label: 'Conduct Exit Interview' },
  { value: 'performance_review_followup', label: 'Performance Review Follow-up' },
  { value: 'terminate_employee', label: 'Terminate Employee' },
  { value: 'update_employee_info', label: 'Update Employee Info' },
];

const SLA_STATUS_OPTIONS = [
  { value: 'on_track', label: 'On Track' },
  { value: 'warning', label: 'Warning' },
  { value: 'breached', label: 'Breached' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const activityColumns: TableColumnDefinition[] = [
  {
    id: 'priority',
    label: '',
    path: 'priority',
    type: 'enum',
    width: '40px',
    config: {
      options: ACTIVITY_PRIORITY_OPTIONS,
      badgeColors: {
        low: 'gray',
        normal: 'blue',
        high: 'orange',
        urgent: 'red',
      },
      showDotOnly: true,
    },
  },
  {
    id: 'subject',
    label: 'Activity',
    path: 'subject',
    type: 'text',
    sortable: true,
    width: '250px',
    config: {
      subtitle: { path: 'description' },
    },
  },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    config: { options: ACTIVITY_TYPE_OPTIONS },
  },
  {
    id: 'pattern',
    label: 'Pattern',
    path: 'pattern',
    type: 'enum',
    config: { options: HR_ACTIVITY_PATTERN_OPTIONS },
  },
  {
    id: 'relatedTo',
    label: 'Related To',
    path: 'relatedEntity.displayName',
    type: 'text',
    config: {
      link: { path: 'relatedEntity.url' },
    },
  },
  {
    id: 'dueDate',
    label: 'Due Date',
    path: 'dueDate',
    type: 'date',
    sortable: true,
    config: {
      format: 'relative',
      overdueHighlight: true,
    },
  },
  {
    id: 'slaStatus',
    label: 'SLA',
    path: 'slaStatus',
    type: 'enum',
    config: {
      options: SLA_STATUS_OPTIONS,
      badgeColors: {
        on_track: 'green',
        warning: 'yellow',
        breached: 'red',
      },
    },
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: ACTIVITY_STATUS_OPTIONS,
      badgeColors: {
        open: 'yellow',
        in_progress: 'blue',
        completed: 'green',
        cancelled: 'gray',
      },
    },
  },
  {
    id: 'assignedTo',
    label: 'Assigned To',
    path: 'assignedTo.fullName',
    type: 'text',
    config: {
      avatar: { path: 'assignedTo.avatarUrl', fallback: 'initials' },
    },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const hrActivitiesScreen: ScreenDefinition = {
  id: 'hr-activities',
  type: 'list',
  entityType: 'activity',

  title: 'HR Activities',
  subtitle: 'Manage HR tasks and follow-ups',
  icon: 'Activity',

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'activities.getQueue',
      params: {
        category: 'hr',
      },
    },
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Progress Bar
      {
        id: 'progress',
        type: 'custom',
        component: 'ActivityProgressBar',
        componentProps: {
          showLabels: true,
          sections: ['overdue', 'dueToday', 'upcoming', 'completed'],
        },
        dataSource: {
          type: 'aggregate',
          entityType: 'activity',
          filter: { category: 'hr' },
        },
      },

      // Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 5,
        fields: [
          {
            id: 'overdue',
            label: 'Overdue',
            type: 'number',
            path: 'stats.overdue',
            config: { color: 'red' },
          },
          {
            id: 'dueToday',
            label: 'Due Today',
            type: 'number',
            path: 'stats.dueToday',
            config: { color: 'yellow' },
          },
          {
            id: 'upcoming',
            label: 'Upcoming',
            type: 'number',
            path: 'stats.upcoming',
            config: { color: 'blue' },
          },
          {
            id: 'completedToday',
            label: 'Completed Today',
            type: 'number',
            path: 'stats.completedToday',
            config: { color: 'green' },
          },
          {
            id: 'slaBreached',
            label: 'SLA Breached',
            type: 'number',
            path: 'stats.slaBreached',
            config: { color: 'red' },
          },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'activity',
          filter: { category: 'hr' },
        },
      },

      // Filters
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'dueDateFilter',
            label: 'Due Date',
            type: 'select',
            path: 'filters.dueDate',
            options: [
              { value: 'overdue', label: 'Overdue' },
              { value: 'today', label: 'Due Today' },
              { value: 'this_week', label: 'This Week' },
              { value: 'next_week', label: 'Next Week' },
              { value: 'all', label: 'All' },
            ],
            config: { default: 'all' },
          },
          {
            id: 'type',
            label: 'Type',
            type: 'multiselect',
            path: 'filters.type',
            options: ACTIVITY_TYPE_OPTIONS,
          },
          {
            id: 'pattern',
            label: 'Activity Pattern',
            type: 'multiselect',
            path: 'filters.pattern',
            options: HR_ACTIVITY_PATTERN_OPTIONS,
          },
          {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            path: 'filters.status',
            options: ACTIVITY_STATUS_OPTIONS,
          },
          {
            id: 'assignedTo',
            label: 'Assigned To',
            type: 'select',
            path: 'filters.assignedTo',
            config: { optionsSource: 'hrTeamMembers', placeholder: 'All HR' },
          },
        ],
      },

      // Activities Table
      {
        id: 'activities-table',
        type: 'table',
        columns_config: activityColumns,
        selectable: true,
        pagination: { enabled: true, defaultPageSize: 25 },
        emptyState: {
          title: 'No Activities',
          description: 'No HR activities match your filters',
          icon: 'CheckCircle',
        },
        rowClick: {
          type: 'modal',
          modal: 'ActivityDetailModal',
        },
        rowActions: [
          {
            id: 'complete',
            label: 'Complete',
            type: 'modal',
            variant: 'primary',
            icon: 'Check',
            config: {
              type: 'modal',
              modal: 'CompleteActivityModal',
              props: { activityId: { type: 'field', path: 'id' } },
            },
            visible: { field: 'status', operator: 'in', value: ['open', 'in_progress'] },
          },
          {
            id: 'reschedule',
            label: 'Reschedule',
            type: 'modal',
            variant: 'outline',
            icon: 'Calendar',
            config: {
              type: 'modal',
              modal: 'RescheduleActivityModal',
              props: { activityId: { type: 'field', path: 'id' } },
            },
            visible: { field: 'status', operator: 'in', value: ['open', 'in_progress'] },
          },
          {
            id: 'reassign',
            label: 'Reassign',
            type: 'modal',
            variant: 'outline',
            icon: 'UserPlus',
            config: {
              type: 'modal',
              modal: 'ReassignActivityModal',
              props: { activityId: { type: 'field', path: 'id' } },
            },
          },
          {
            id: 'view-related',
            label: 'View Related',
            type: 'navigate',
            icon: 'ExternalLink',
            config: {
              type: 'navigate',
              route: { type: 'field', path: 'relatedEntity.url' },
            },
            visible: { field: 'relatedEntity', operator: 'neq', value: null },
          },
        ],
      },
    ],
  },

  // Bulk actions
  bulkActions: [
    {
      id: 'bulk-complete',
      label: 'Complete Selected',
      type: 'mutation',
      variant: 'primary',
      icon: 'CheckCircle',
      config: {
        type: 'mutation',
        procedure: 'activities.bulkComplete',
        input: { ids: { type: 'selection', path: 'id' } },
      },
    },
    {
      id: 'bulk-reschedule',
      label: 'Reschedule Selected',
      type: 'modal',
      variant: 'outline',
      icon: 'Calendar',
      config: {
        type: 'modal',
        modal: 'BulkRescheduleModal',
        props: { ids: { type: 'selection', path: 'id' } },
      },
    },
    {
      id: 'bulk-reassign',
      label: 'Reassign Selected',
      type: 'modal',
      variant: 'outline',
      icon: 'UserPlus',
      config: {
        type: 'modal',
        modal: 'BulkReassignModal',
        props: { ids: { type: 'selection', path: 'id' } },
      },
    },
  ],

  // Header actions
  actions: [
    {
      id: 'create-activity',
      label: 'New Activity',
      type: 'modal',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'ActivityModal',
        props: { category: 'hr' },
      },
    },
    {
      id: 'quick-log-call',
      label: 'Log Call',
      type: 'modal',
      variant: 'secondary',
      icon: 'Phone',
      config: {
        type: 'modal',
        modal: 'ActivityModal',
        props: { category: 'hr', defaultType: 'call' },
      },
    },
    {
      id: 'quick-log-email',
      label: 'Log Email',
      type: 'modal',
      variant: 'secondary',
      icon: 'Mail',
      config: {
        type: 'modal',
        modal: 'ActivityModal',
        props: { category: 'hr', defaultType: 'email' },
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Activities' },
    ],
  },
};

export default hrActivitiesScreen;
