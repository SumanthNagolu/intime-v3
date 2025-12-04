/**
 * Activities Queue Screen
 *
 * Activity-centric view showing all pending activities grouped by priority.
 * Core to the "NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED" philosophy.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/01-daily-workflow.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const activitiesQueueScreen: ScreenDefinition = {
  id: 'activities-queue',
  type: 'list',
  entityType: 'activity',
  title: 'My Activities',
  icon: 'ListTodo',

  dataSource: {
    type: 'list',
    entityType: 'activity',
    pagination: true,
    pageSize: 50,
    filter: {
      assignee_id: { operator: 'eq', value: { type: 'context', path: 'user.id' } },
      status: { operator: 'in', value: ['open', 'in_progress'] },
    },
    sort: { field: 'due_at', direction: 'asc' },
    include: ['entity', 'createdBy', 'pattern'],
  },

  layout: {
    type: 'single-column',
    sections: [
      // Summary Stats
      {
        id: 'summary-stats',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'overdue',
            label: 'Overdue',
            type: 'number',
            path: 'stats.overdue',
            config: { icon: 'AlertTriangle', color: 'destructive' },
          },
          {
            id: 'due-today',
            label: 'Due Today',
            type: 'number',
            path: 'stats.dueToday',
            config: { icon: 'Clock', color: 'warning' },
          },
          {
            id: 'upcoming',
            label: 'Upcoming (7d)',
            type: 'number',
            path: 'stats.upcoming',
            config: { icon: 'Calendar' },
          },
          {
            id: 'completed-today',
            label: 'Completed Today',
            type: 'number',
            path: 'stats.completedToday',
            config: { icon: 'CheckCircle', color: 'success' },
          },
        ],
      },

      // Filters
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'search',
            type: 'text',
            path: 'filters.search',
            placeholder: 'Search activities...',
            config: { icon: 'Search' },
          },
          {
            id: 'status',
            type: 'multiselect',
            path: 'filters.status',
            label: 'Status',
            options: [
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'deferred', label: 'Deferred' },
              { value: 'cancelled', label: 'Cancelled' },
            ],
          },
          {
            id: 'type',
            type: 'multiselect',
            path: 'filters.type',
            label: 'Type',
            options: [
              { value: 'call', label: 'Call' },
              { value: 'email', label: 'Email' },
              { value: 'meeting', label: 'Meeting' },
              { value: 'task', label: 'Task' },
              { value: 'follow_up', label: 'Follow Up' },
              { value: 'note', label: 'Note' },
              { value: 'reminder', label: 'Reminder' },
            ],
          },
          {
            id: 'priority',
            type: 'multiselect',
            path: 'filters.priority',
            label: 'Priority',
            options: [
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ],
          },
          {
            id: 'entity-type',
            type: 'multiselect',
            path: 'filters.entityType',
            label: 'Related To',
            options: [
              { value: 'candidate', label: 'Candidates' },
              { value: 'job', label: 'Jobs' },
              { value: 'submission', label: 'Submissions' },
              { value: 'account', label: 'Accounts' },
              { value: 'contact', label: 'Contacts' },
              { value: 'deal', label: 'Deals' },
              { value: 'placement', label: 'Placements' },
            ],
          },
          {
            id: 'due-date',
            type: 'select',
            path: 'filters.dueDate',
            label: 'Due Date',
            options: [
              { value: 'overdue', label: 'Overdue' },
              { value: 'today', label: 'Today' },
              { value: 'tomorrow', label: 'Tomorrow' },
              { value: 'this_week', label: 'This Week' },
              { value: 'next_week', label: 'Next Week' },
              { value: 'no_due_date', label: 'No Due Date' },
            ],
          },
          {
            id: 'show-completed',
            type: 'boolean',
            path: 'filters.showCompleted',
            label: 'Show Completed',
          },
        ],
      },

      // Grouped Activity Queue
      {
        id: 'activity-queue',
        type: 'custom',
        component: 'ActivityQueueWidget',
        componentProps: {
          groupBy: 'urgency',
          groups: [
            {
              id: 'overdue',
              label: 'Overdue',
              filter: { overdue: true },
              color: 'red',
              icon: 'AlertTriangle',
              expanded: true,
            },
            {
              id: 'due-today',
              label: 'Due Today',
              filter: { dueToday: true },
              color: 'orange',
              icon: 'Clock',
              expanded: true,
            },
            {
              id: 'high-priority',
              label: 'High Priority',
              filter: { priority: ['urgent', 'high'], notOverdue: true, notDueToday: true },
              color: 'yellow',
              icon: 'Flag',
              expanded: true,
            },
            {
              id: 'upcoming',
              label: 'Upcoming',
              filter: { upcoming: true, priority: ['medium', 'low'] },
              color: 'blue',
              icon: 'Calendar',
              expanded: false,
            },
          ],
          showEntityBadge: true,
          showSLAIndicator: true,
          allowQuickComplete: true,
          allowQuickDefer: true,
          allowQuickReassign: true,
          onComplete: 'completeActivity',
          onDefer: 'deferActivity',
          onReassign: 'reassignActivity',
          onSelect: 'openActivityDetail',
        },
      },

      // Table View (alternative)
      {
        id: 'activity-table',
        type: 'table',
        visible: { field: 'viewMode', operator: 'eq', value: 'table' },
        columns_config: [
          {
            id: 'type-icon',
            header: '',
            path: 'type',
            type: 'activity-type-icon',
            width: '40px',
          },
          {
            id: 'subject',
            header: 'Activity',
            path: 'subject',
            sortable: true,
            width: '25%',
          },
          {
            id: 'entity',
            header: 'Related To',
            path: 'entity',
            type: 'entity-link',
            config: { showType: true },
          },
          {
            id: 'type',
            header: 'Type',
            path: 'type',
            type: 'activity-type-badge',
          },
          {
            id: 'priority',
            header: 'Priority',
            path: 'priority',
            type: 'priority-badge',
            sortable: true,
          },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'activity-status-badge',
          },
          {
            id: 'due-at',
            header: 'Due',
            path: 'dueAt',
            type: 'datetime',
            sortable: true,
            config: { relative: true, highlightOverdue: true },
          },
          {
            id: 'sla',
            header: 'SLA',
            path: 'slaStatus',
            type: 'sla-status-badge',
          },
          {
            id: 'pattern',
            header: 'Pattern',
            path: 'pattern.code',
            type: 'pattern-badge',
          },
        ],
        selectable: true,
        emptyState: {
          title: 'No activities',
          description: 'All caught up! Create a new activity or wait for system-generated ones.',
        },
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'Create Activity',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'activity-create' },
    },
    {
      id: 'bulk-complete',
      label: 'Complete',
      type: 'mutation',
      icon: 'CheckCircle',
      variant: 'default',
      config: {
        type: 'mutation',
        procedure: 'activities.bulkComplete',
        input: { ids: { type: 'selection' } },
      },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'bulk-defer',
      label: 'Defer',
      type: 'modal',
      icon: 'Clock',
      variant: 'default',
      config: { type: 'modal', modal: 'activity-bulk-defer' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'bulk-reassign',
      label: 'Reassign',
      type: 'modal',
      icon: 'Users',
      variant: 'default',
      config: { type: 'modal', modal: 'activity-bulk-reassign' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'toggle-view',
      label: 'Table View',
      type: 'function',
      icon: 'Table',
      variant: 'ghost',
      config: { type: 'function', handler: 'toggleViewMode' },
    },
    {
      id: 'refresh',
      label: 'Refresh',
      type: 'function',
      icon: 'RefreshCw',
      variant: 'ghost',
      config: { type: 'function', handler: 'refreshActivities' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Activities', active: true },
    ],
  },

  keyboard_shortcuts: [
    { key: 'n', action: 'createActivity', description: 'Create new activity' },
    { key: 'c', action: 'completeSelected', description: 'Complete selected' },
    { key: 'd', action: 'deferSelected', description: 'Defer selected' },
    { key: 'r', action: 'refresh', description: 'Refresh list' },
  ],
};

export default activitiesQueueScreen;
