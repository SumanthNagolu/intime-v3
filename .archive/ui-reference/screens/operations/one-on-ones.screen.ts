/**
 * 1:1 Management Screen
 *
 * Shows list of ICs with 1:1 schedule status, allows scheduling
 * and viewing history of 1:1 meetings.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/05-conduct-1on1.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const oneOnOnesScreen: ScreenDefinition = {
  id: 'one-on-ones',
  type: 'list',
  entityType: 'one_on_one',
  title: '1:1 Meetings',
  subtitle: 'Schedule and track 1:1 meetings with your team',
  icon: 'MessageSquare',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'icSchedules', procedure: 'manager.getOneOnOneSchedules' },
      { key: 'upcoming', procedure: 'manager.getUpcomingOneOnOnes' },
      { key: 'overdue', procedure: 'manager.getOverdueOneOnOnes' },
      { key: 'completed', procedure: 'manager.getCompletedOneOnOnes' },
    ],
  },

  layout: {
    type: 'tabs',
    tabs: [
      // ===========================================
      // TAB 1: SCHEDULE OVERVIEW
      // ===========================================
      {
        id: 'schedule',
        label: 'Schedule',
        icon: 'Calendar',
        sections: [
          {
            id: 'schedule-summary',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              {
                id: 'total-ics',
                label: 'Team Members',
                type: 'number',
                path: 'icSchedules.length',
                config: { icon: 'Users', bgColor: 'bg-blue-50' },
              },
              {
                id: 'scheduled',
                label: 'Scheduled',
                type: 'number',
                path: 'summary.scheduled',
                config: { icon: 'Calendar', bgColor: 'bg-green-50' },
              },
              {
                id: 'overdue',
                label: 'Overdue',
                type: 'number',
                path: 'summary.overdue',
                config: { icon: 'Clock', bgColor: 'bg-red-50' },
              },
              {
                id: 'this-week',
                label: 'This Week',
                type: 'number',
                path: 'summary.thisWeek',
                config: { icon: 'CalendarDays', bgColor: 'bg-purple-50' },
              },
            ],
          },
          {
            id: 'ic-schedule-table',
            type: 'table',
            title: 'IC Schedule Status',
            dataSource: { type: 'field', path: 'icSchedules' },
            columns_config: [
              {
                id: 'status-indicator',
                header: '',
                path: 'scheduleStatus',
                type: 'status-indicator',
                width: '30px',
                config: {
                  colors: { scheduled: 'green', pending: 'yellow', overdue: 'red' },
                },
              },
              {
                id: 'ic',
                header: 'IC',
                path: 'fullName',
                type: 'user-with-avatar',
              },
              {
                id: 'last-1on1',
                header: 'Last 1:1',
                path: 'lastOneOnOne',
                type: 'date',
              },
              {
                id: 'days-since',
                header: 'Days Since',
                path: 'daysSinceLastOneOnOne',
                type: 'number',
                config: {
                  warnThreshold: 14,
                  criticalThreshold: 21,
                },
              },
              {
                id: 'next-1on1',
                header: 'Next 1:1',
                path: 'nextOneOnOne',
                type: 'datetime',
              },
              {
                id: 'frequency',
                header: 'Frequency',
                path: 'frequency',
                type: 'enum',
                config: {
                  options: [
                    { value: 'weekly', label: 'Weekly', color: 'blue' },
                    { value: 'biweekly', label: 'Bi-weekly', color: 'green' },
                    { value: 'monthly', label: 'Monthly', color: 'gray' },
                  ],
                },
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                width: '120px',
                config: {
                  actions: [
                    {
                      id: 'schedule',
                      label: 'Schedule',
                      icon: 'Calendar',
                      type: 'modal',
                    config: { type: 'modal', modal: 'schedule-one-on-one' },
                      visible: {
                        type: 'condition',
                        condition: { field: 'nextOneOnOne', operator: 'eq', value: null },
                      },
                    },
                    {
                      id: 'reschedule',
                      label: 'Reschedule',
                      icon: 'CalendarClock',
                      type: 'modal',
                    config: { type: 'modal', modal: 'reschedule-one-on-one' },
                      visible: {
                        type: 'condition',
                        condition: { field: 'nextOneOnOne', operator: 'neq', value: null },
                      },
                    },
                    {
                      id: 'view-history',
                      label: 'View History',
                      icon: 'History',
                      type: 'navigate',
                    config: { type: 'navigate', route: '/employee/manager/1on1/{{id}}' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      // ===========================================
      // TAB 2: UPCOMING
      // ===========================================
      {
        id: 'upcoming',
        label: 'Upcoming',
        icon: 'CalendarCheck',
        badge: { type: 'field', path: 'upcoming.length' },
        sections: [
          {
            id: 'upcoming-list',
            type: 'custom',
            component: 'UpcomingOneOnOnesList',
            componentProps: {
              dataPath: 'upcoming',
              daysAhead: 14,
              cardTemplate: {
                ic: { type: 'field', path: 'ic.fullName' },
                avatar: { type: 'field', path: 'ic.avatarUrl' },
                date: { type: 'field', path: 'scheduledAt' },
                location: { type: 'field', path: 'location' },
                agenda: { type: 'field', path: 'agenda' },
                status: { type: 'field', path: 'status' },
              },
            },
          },
        ],
      },

      // ===========================================
      // TAB 3: OVERDUE
      // ===========================================
      {
        id: 'overdue',
        label: 'Overdue',
        icon: 'AlertTriangle',
        badge: { type: 'field', path: 'overdue.length' },
        sections: [
          {
            id: 'overdue-alert',
            type: 'custom',
            component: 'AlertCard',
            componentProps: {
              type: 'warning',
              title: 'Overdue 1:1s',
              description: 'These team members are overdue for their 1:1 meetings. Schedule them soon.',
            },
            visible: {
              type: 'condition',
              condition: { field: 'overdue.length', operator: 'gt', value: 0 },
            },
          },
          {
            id: 'overdue-list',
            type: 'table',
            dataSource: { type: 'field', path: 'overdue' },
            columns_config: [
              {
                id: 'ic',
                header: 'IC',
                path: 'ic.fullName',
                type: 'user-with-avatar',
              },
              {
                id: 'last-1on1',
                header: 'Last 1:1',
                path: 'lastOneOnOne',
                type: 'date',
              },
              {
                id: 'days-overdue',
                header: 'Days Overdue',
                path: 'daysOverdue',
                type: 'number',
                config: { color: 'red' },
              },
              {
                id: 'expected-frequency',
                header: 'Expected Frequency',
                path: 'frequency',
                type: 'text',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                width: '100px',
                config: {
                  actions: [
                    {
                      id: 'schedule-now',
                      label: 'Schedule Now',
                      icon: 'Calendar',
                      type: 'modal',
                    config: { type: 'modal', modal: 'schedule-one-on-one' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      // ===========================================
      // TAB 4: COMPLETED
      // ===========================================
      {
        id: 'completed',
        label: 'Completed',
        icon: 'CheckCircle',
        sections: [
          {
            id: 'completed-list',
            type: 'table',
            title: 'Recent 1:1s',
            description: '1:1 meetings from the last 30 days',
            dataSource: { type: 'field', path: 'completed' },
            columns_config: [
              {
                id: 'ic',
                header: 'IC',
                path: 'ic.fullName',
                type: 'user-with-avatar',
              },
              {
                id: 'date',
                header: 'Date',
                path: 'scheduledAt',
                type: 'date',
                sortable: true,
              },
              {
                id: 'duration',
                header: 'Duration',
                path: 'durationMinutes',
                type: 'duration',
              },
              {
                id: 'topics',
                header: 'Topics',
                path: 'topicsSummary',
                type: 'text',
              },
              {
                id: 'action-items',
                header: 'Action Items',
                path: 'actionItemCount',
                type: 'badge',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                width: '80px',
                config: {
                  actions: [
                    {
                      id: 'view-notes',
                      label: 'View Notes',
                      icon: 'FileText',
                      type: 'modal',
                    config: { type: 'modal', modal: 'view-1on1-notes' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'schedule-1on1',
      label: 'Schedule 1:1',
      type: 'modal',
      icon: 'Calendar',
      variant: 'primary',
      config: { type: 'modal', modal: 'schedule-one-on-one' },
    },
    {
      id: 'bulk-schedule',
      label: 'Bulk Schedule',
      type: 'modal',
      icon: 'CalendarPlus',
      variant: 'secondary',
      config: { type: 'modal', modal: 'bulk-schedule-1on1s' },
    },
    {
      id: 'export',
      label: 'Export Report',
      type: 'modal',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'modal', modal: 'export-1on1-report' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: '1:1 Meetings', active: true },
    ],
  },
};

export default oneOnOnesScreen;
