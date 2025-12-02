/**
 * Bench Activities Queue Screen
 *
 * Bench-specific activity patterns and queue.
 * Activity patterns per bench-sales skill:
 * - Source consultant
 * - Update consultant profile
 * - Market consultant (hotlist)
 * - Submit to requirement
 * - Update availability
 * - Immigration status check
 * - Vendor follow up
 * - Close placement
 *
 * @see .claude/skills/bench-sales
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

// ==========================================
// OPTIONS
// ==========================================

const ACTIVITY_TYPE_OPTIONS = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'submission', label: 'Submission' },
  { value: 'review', label: 'Review' },
  { value: 'escalation', label: 'Escalation' },
  { value: 'note', label: 'Note' },
];

const ACTIVITY_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ACTIVITY_PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: 'bench_consultant', label: 'Consultant' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'job_order', label: 'Job Order' },
  { value: 'submission', label: 'Submission' },
  { value: 'placement', label: 'Placement' },
  { value: 'hotlist', label: 'Hotlist' },
  { value: 'immigration_case', label: 'Immigration Case' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const activityQueueColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'priority',
    label: '',
    path: 'priority',
    type: 'custom',
    width: '40px',
    config: { component: 'PriorityIndicator' },
  },
  {
    id: 'slaStatus',
    label: '',
    path: 'slaStatus',
    type: 'custom',
    width: '40px',
    config: { component: 'SlaStatusIndicator' },
  },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    sortable: true,
    width: '100px',
    config: {
      options: ACTIVITY_TYPE_OPTIONS,
      badgeColors: {
        call: 'green',
        email: 'blue',
        meeting: 'purple',
        task: 'gray',
        follow_up: 'yellow',
        submission: 'cyan',
        review: 'orange',
        escalation: 'red',
        note: 'gray',
      },
    },
  },
  {
    id: 'subject',
    label: 'Subject',
    path: 'subject',
    type: 'text',
    sortable: true,
    width: '250px',
  },
  {
    id: 'entityType',
    label: 'Related To',
    path: 'entityType',
    type: 'enum',
    config: {
      options: ENTITY_TYPE_OPTIONS,
    },
  },
  {
    id: 'entityName',
    label: 'Entity',
    path: 'entityName',
    type: 'text',
    config: {
      link: true,
      linkPath: '{{entityLink}}',
    },
  },
  {
    id: 'dueDate',
    label: 'Due',
    path: 'dueDate',
    type: 'datetime',
    sortable: true,
    config: {
      format: 'relative',
      warnIfPast: true,
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
        open: 'blue',
        in_progress: 'yellow',
        completed: 'green',
        cancelled: 'gray',
      },
    },
  },
  {
    id: 'assignedTo',
    label: 'Assigned To',
    path: 'assignedTo.fullName',
    type: 'user-avatar',
  },
  {
    id: 'createdAt',
    label: 'Created',
    path: 'createdAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const benchActivitiesScreen: ScreenDefinition = {
  id: 'bench-activities',
  type: 'list',
  entityType: 'activity',

  title: 'My Activities',
  subtitle: 'Track and manage bench sales activities',
  icon: 'Activity',

  dataSource: {
    type: 'list',
    entityType: 'activity',
    filter: { context: 'bench_sales' },
    sort: { field: 'dueDate', direction: 'asc' },
    pageSize: 25,
  },

  layout: {
    type: 'single-column',
    sections: [
      // Activity Summary
      {
        id: 'activity-summary',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'overdue',
            label: 'Overdue',
            type: 'number',
            path: 'stats.overdue',
            config: { variant: 'danger', icon: 'AlertTriangle' },
          },
          {
            id: 'dueToday',
            label: 'Due Today',
            type: 'number',
            path: 'stats.dueToday',
            config: { variant: 'warning', icon: 'Clock' },
          },
          {
            id: 'inProgress',
            label: 'In Progress',
            type: 'number',
            path: 'stats.inProgress',
          },
          {
            id: 'completedToday',
            label: 'Completed Today',
            type: 'number',
            path: 'stats.completedToday',
            config: { variant: 'success', icon: 'CheckCircle' },
          },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'activity',
          filter: { context: 'bench_sales' },
        },
      },

      // Quick Activity Patterns
      {
        id: 'quick-patterns',
        type: 'custom',
        title: 'Quick Create',
        component: 'QuickActivityPatterns',
        componentProps: {
          patterns: [
            { id: 'source_consultant', label: 'Source Consultant', icon: 'UserSearch', activityType: 'task' },
            { id: 'update_profile', label: 'Update Profile', icon: 'UserCog', activityType: 'task' },
            { id: 'market_consultant', label: 'Market Consultant', icon: 'Megaphone', activityType: 'task' },
            { id: 'submit_requirement', label: 'Submit to Requirement', icon: 'Send', activityType: 'submission' },
            { id: 'update_availability', label: 'Update Availability', icon: 'Calendar', activityType: 'task' },
            { id: 'immigration_check', label: 'Immigration Check', icon: 'Globe', activityType: 'review' },
            { id: 'vendor_followup', label: 'Vendor Follow-up', icon: 'Building2', activityType: 'follow_up' },
            { id: 'close_placement', label: 'Close Placement', icon: 'CheckCircle', activityType: 'task' },
          ],
        },
      },

      // Filters
      {
        id: 'filters',
        type: 'form',
        fields: [
          {
            id: 'search',
            type: 'text',
            path: 'filters.search',
            placeholder: 'Search activities...',
            config: { icon: 'Search' },
          },
          {
            id: 'type',
            label: 'Type',
            type: 'multiselect',
            path: 'filters.type',
            options: ACTIVITY_TYPE_OPTIONS,
          },
          {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            path: 'filters.status',
            options: ACTIVITY_STATUS_OPTIONS,
          },
          {
            id: 'priority',
            label: 'Priority',
            type: 'multiselect',
            path: 'filters.priority',
            options: ACTIVITY_PRIORITY_OPTIONS,
          },
          {
            id: 'entityType',
            label: 'Related To',
            type: 'multiselect',
            path: 'filters.entityType',
            options: ENTITY_TYPE_OPTIONS,
          },
          {
            id: 'dueFrom',
            label: 'Due From',
            type: 'date',
            path: 'filters.dueFrom',
          },
          {
            id: 'dueTo',
            label: 'Due To',
            type: 'date',
            path: 'filters.dueTo',
          },
          {
            id: 'showCompleted',
            label: 'Show Completed',
            type: 'boolean',
            path: 'filters.showCompleted',
          },
        ],
      },

      // Activity Queue Table
      {
        id: 'activity-queue',
        type: 'table',
        columns_config: activityQueueColumns,
        actions: [
          {
            id: 'complete',
            label: 'Complete',
            icon: 'CheckCircle',
            type: 'modal',
            config: { type: 'modal', modal: 'complete-activity', props: { activityId: { type: 'field', path: 'id' } } },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'in', value: ['open', 'in_progress'] },
            },
          },
          {
            id: 'start',
            label: 'Start',
            icon: 'Play',
            type: 'mutation',
            config: {
              type: 'mutation',
              procedure: 'activities.start',
              input: { id: { type: 'field', path: 'id' } },
            },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'eq', value: 'open' },
            },
          },
          {
            id: 'reschedule',
            label: 'Reschedule',
            icon: 'Calendar',
            type: 'modal',
            config: { type: 'modal', modal: 'reschedule-activity', props: { activityId: { type: 'field', path: 'id' } } },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'in', value: ['open', 'in_progress'] },
            },
          },
          {
            id: 'delegate',
            label: 'Delegate',
            icon: 'UserPlus',
            type: 'modal',
            config: { type: 'modal', modal: 'delegate-activity', props: { activityId: { type: 'field', path: 'id' } } },
          },
          {
            id: 'view-entity',
            label: 'View Related',
            icon: 'ExternalLink',
            type: 'navigate',
            config: { type: 'navigate', route: { type: 'field', path: 'entityLink' } },
          },
          {
            id: 'cancel',
            label: 'Cancel',
            icon: 'X',
            type: 'mutation',
            variant: 'destructive',
            config: {
              type: 'mutation',
              procedure: 'activities.cancel',
              input: { id: { type: 'field', path: 'id' } },
            },
            confirm: {
              title: 'Cancel Activity',
              message: 'Are you sure you want to cancel this activity?',
              confirmLabel: 'Cancel Activity',
              destructive: true,
            },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'in', value: ['open', 'in_progress'] },
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'New Activity',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'create-activity', props: { context: { type: 'static', default: 'bench_sales' } } },
    },
    {
      id: 'bulk-complete',
      label: 'Complete Selected',
      type: 'modal',
      icon: 'CheckCircle',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-complete-activities', props: { activityIds: { type: 'selection' } } },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'custom', handler: 'exportActivities' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/workspace/bench' },
      { label: 'Activities', active: true },
    ],
  },
};

export default benchActivitiesScreen;
