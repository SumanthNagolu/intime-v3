/**
 * TA Activities Screen Definition
 *
 * Activity queue and management for Talent Acquisition with:
 * - Activity feed with filtering
 * - Due/Overdue tracking
 * - Quick activity logging
 * - Calendar view
 *
 * Routes: /employee/workspace/ta/activities
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import { TA_ACTIVITY_TYPE_OPTIONS } from '@/lib/metadata/options/ta-options';
import {
  ACTIVITY_PRIORITY_OPTIONS,
  ACTIVITY_STATUS_OPTIONS,
  ACTIVITY_OUTCOME_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// TABLE COLUMNS
// ==========================================

const activityTableColumns = [
  {
    id: 'subject',
    header: 'Activity',
    accessor: 'subject',
    type: 'composite',
    sortable: true,
    width: '250px',
    config: {
      primary: { path: 'subject' },
      secondary: { path: 'relatedEntityName' },
      icon: { path: 'activityType' },
    },
  },
  {
    id: 'activityType',
    header: 'Type',
    accessor: 'activityType',
    type: 'enum',
    sortable: true,
    config: {
      options: TA_ACTIVITY_TYPE_OPTIONS,
      badgeColors: {
        outreach: 'blue',
        follow_up: 'cyan',
        qualification_call: 'amber',
        discovery_meeting: 'purple',
        proposal_review: 'orange',
        contract_discussion: 'green',
        training_interview: 'teal',
        internal_interview: 'indigo',
      },
    },
  },
  {
    id: 'relatedTo',
    header: 'Related To',
    accessor: 'relatedEntityName',
    type: 'link',
    config: {
      route: { field: 'relatedEntityType', template: '/employee/workspace/ta/{entityType}s/{entityId}' },
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: ACTIVITY_STATUS_OPTIONS,
      badgeColors: {
        pending: 'amber',
        in_progress: 'blue',
        completed: 'green',
        cancelled: 'gray',
      },
    },
  },
  {
    id: 'priority',
    header: 'Priority',
    accessor: 'priority',
    type: 'enum',
    sortable: true,
    config: {
      options: ACTIVITY_PRIORITY_OPTIONS,
      badgeColors: {
        urgent: 'red',
        high: 'orange',
        normal: 'blue',
        low: 'gray',
      },
    },
  },
  {
    id: 'dueDate',
    header: 'Due',
    accessor: 'dueDate',
    type: 'date',
    sortable: true,
    config: {
      format: 'relative',
      highlightOverdue: true,
    },
  },
  {
    id: 'outcome',
    header: 'Outcome',
    accessor: 'outcome',
    type: 'enum',
    config: {
      options: ACTIVITY_OUTCOME_OPTIONS,
    },
  },
  {
    id: 'assignee',
    header: 'Assignee',
    accessor: 'assigneeName',
    type: 'text',
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessor: 'createdAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
];

// ==========================================
// TA ACTIVITIES SCREEN
// ==========================================

export const taActivitiesScreen: ScreenDefinition = {
  id: 'ta-activities',
  type: 'list',
  entityType: 'activity',
  title: 'Activities',
  subtitle: 'Manage your tasks and follow-ups',
  icon: 'Activity',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.activities.list',
      params: {},
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Activity Metrics
      {
        id: 'activity-metrics',
        type: 'metrics-grid',
        columns: 5,
        widgets: [
          {
            id: 'due-today',
            type: 'metric',
            label: 'Due Today',
            path: 'stats.dueToday',
            config: {
              icon: 'Calendar',
              variant: 'warning',
              action: {
                type: 'custom',
                handler: 'filterDueToday',
              },
            },
          },
          {
            id: 'overdue',
            type: 'metric',
            label: 'Overdue',
            path: 'stats.overdue',
            config: {
              icon: 'AlertTriangle',
              variant: 'destructive',
              action: {
                type: 'custom',
                handler: 'filterOverdue',
              },
            },
          },
          {
            id: 'pending',
            type: 'metric',
            label: 'Pending',
            path: 'stats.pending',
            config: { icon: 'Clock', variant: 'amber' },
          },
          {
            id: 'completed-today',
            type: 'metric',
            label: 'Completed Today',
            path: 'stats.completedToday',
            config: { icon: 'CheckCircle', variant: 'success' },
          },
          {
            id: 'total-week',
            type: 'metric',
            label: 'This Week',
            path: 'stats.thisWeek',
            config: { icon: 'CalendarDays' },
          },
        ],
      },

      // Quick Actions
      {
        id: 'quick-actions',
        type: 'custom',
        component: 'QuickActivityButtons',
        componentProps: {
          activities: [
            { type: 'outreach', label: 'Log Outreach', icon: 'Send' },
            { type: 'follow_up', label: 'Schedule Follow-up', icon: 'Phone' },
            { type: 'qualification_call', label: 'Log Qualification Call', icon: 'ClipboardCheck' },
            { type: 'discovery_meeting', label: 'Log Meeting', icon: 'Video' },
          ],
        },
      },

      // Filters
      {
        id: 'filters',
        type: 'field-grid',
        inline: true,
        columns: 5,
        fields: [
          {
            id: 'search',
            type: 'search',
            placeholder: 'Search activities...',
            config: { fields: ['subject', 'notes', 'relatedEntityName'] },
          },
          {
            id: 'activityType',
            type: 'multi-select',
            label: 'Type',
            options: TA_ACTIVITY_TYPE_OPTIONS,
          },
          {
            id: 'status',
            type: 'multi-select',
            label: 'Status',
            options: ACTIVITY_STATUS_OPTIONS,
          },
          {
            id: 'priority',
            type: 'multi-select',
            label: 'Priority',
            options: ACTIVITY_PRIORITY_OPTIONS,
          },
          {
            id: 'dueDate',
            type: 'date-range',
            label: 'Due Date',
          },
        ],
      },

      // View Toggle
      {
        id: 'activities-view',
        type: 'custom',
        component: 'ViewToggleContainer',
        componentProps: {
          views: ['list', 'calendar', 'timeline'],
          defaultView: 'list',
          listConfig: {
            columns: activityTableColumns,
            selectable: true,
            groupBy: {
              options: ['dueDate', 'activityType', 'status', 'relatedEntityType'],
              default: null,
            },
          },
          calendarConfig: {
            titlePath: 'subject',
            startPath: 'dueDate',
            endPath: 'dueDate',
            colorPath: 'activityType',
          },
          timelineConfig: {
            timestampPath: 'dueDate',
            titlePath: 'subject',
            typePath: 'activityType',
            statusPath: 'status',
          },
        },
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'log-activity',
      type: 'modal',
      label: 'Log Activity',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'log-activity' },
    },
    {
      id: 'schedule-activity',
      type: 'modal',
      label: 'Schedule',
      icon: 'Calendar',
      variant: 'outline',
      config: { type: 'modal', modal: 'schedule-activity' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportActivities' },
    },
  ],

  // Bulk Actions
  bulkActions: [
    {
      id: 'bulk-complete',
      type: 'mutation',
      label: 'Mark Complete',
      icon: 'CheckCircle',
      config: { type: 'mutation', procedure: 'ta.activities.bulkComplete' },
    },
    {
      id: 'bulk-reschedule',
      type: 'modal',
      label: 'Reschedule',
      icon: 'Calendar',
      config: { type: 'modal', modal: 'bulk-reschedule' },
    },
    {
      id: 'bulk-reassign',
      type: 'modal',
      label: 'Reassign',
      icon: 'UserCheck',
      config: { type: 'modal', modal: 'bulk-reassign' },
    },
    {
      id: 'bulk-cancel',
      type: 'mutation',
      label: 'Cancel',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'mutation', procedure: 'ta.activities.bulkCancel' },
      confirm: {
        title: 'Cancel Activities',
        message: 'Are you sure you want to cancel the selected activities?',
        destructive: true,
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Activities' },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'n', action: 'log-activity', description: 'Log new activity' },
    { key: 's', action: 'schedule-activity', description: 'Schedule activity' },
    { key: 'c', action: 'toggle-calendar', description: 'Toggle calendar view' },
    { key: '/', action: 'focus-search', description: 'Focus search' },
  ],
};

export default taActivitiesScreen;
