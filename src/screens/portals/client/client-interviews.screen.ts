/**
 * Client Interviews Screen
 *
 * Client view of interviews with calendar and list views.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata/types';

const columns: TableColumnDefinition[] = [
  { id: 'candidate', header: 'Candidate', path: 'candidateName', type: 'text', width: '20%' },
  { id: 'job', header: 'Job', path: 'jobTitle', type: 'text', width: '20%' },
  { id: 'dateTime', header: 'Date & Time', path: 'scheduledAt', type: 'datetime', sortable: true },
  { id: 'type', header: 'Type', path: 'interviewType', type: 'text' },
  { id: 'interviewers', header: 'Interviewers', path: 'interviewersCount', type: 'number' },
  {
    id: 'status',
    header: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'needs_feedback', label: 'Needs Feedback' },
      ],
      badgeColors: {
        scheduled: 'blue',
        completed: 'green',
        cancelled: 'gray',
        needs_feedback: 'orange',
      },
    },
  },
];

export const clientInterviewsScreen: ScreenDefinition = {
  id: 'client-interviews',
  type: 'list',
  entityType: 'interview',
  title: 'Interviews',
  subtitle: 'Manage scheduled and past interviews',
  icon: 'Calendar',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.client.getInterviews',
      params: {},
    },
    pagination: true,
    pageSize: 20,
  },

  layout: {
    type: 'tabs',
    defaultTab: 'list',
    tabs: [
      // ===========================================
      // LIST VIEW TAB
      // ===========================================
      {
        id: 'list',
        label: 'List View',
        icon: 'List',
        sections: [
          {
            id: 'filters',
            type: 'field-grid',
            columns: 4,
            inline: true,
            fields: [
              {
                id: 'status-filter',
                type: 'select',
                label: 'Status',
                path: 'filter.status',
                config: {
                  options: [
                    { value: 'all', label: 'All Statuses' },
                    { value: 'upcoming', label: 'Upcoming' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'needs_feedback', label: 'Needs Feedback' },
                  ],
                },
              },
              {
                id: 'date-range',
                type: 'date-range',
                label: 'Date Range',
                path: 'filter.dateRange',
              },
            ],
          },
          {
            id: 'interviews-table',
            type: 'table',
            columns_config: columns,
            rowClick: { type: 'navigate', route: '/client/interviews/{{id}}' },
            rowActions: [
              {
                id: 'provide-feedback',
                label: 'Provide Feedback',
                type: 'modal',
                icon: 'MessageSquare',
                config: { type: 'modal', modal: 'InterviewFeedback', props: { interviewId: { type: 'field', path: 'id' } } },
                visible: { field: 'status', operator: 'eq', value: 'needs_feedback' },
              },
              {
                id: 'reschedule',
                label: 'Reschedule',
                type: 'modal',
                icon: 'Calendar',
                config: { type: 'modal', modal: 'RescheduleInterview', props: { interviewId: { type: 'field', path: 'id' } } },
                visible: { field: 'status', operator: 'eq', value: 'scheduled' },
              },
            ],
            emptyState: {
              title: 'No interviews',
              description: 'Scheduled interviews will appear here.',
              icon: 'Calendar',
            },
            pagination: { enabled: true, pageSize: 20 },
          },
        ],
      },

      // ===========================================
      // CALENDAR VIEW TAB
      // ===========================================
      {
        id: 'calendar',
        label: 'Calendar View',
        icon: 'CalendarDays',
        sections: [
          {
            id: 'calendar-widget',
            type: 'custom',
            component: 'InterviewCalendar',
            componentProps: {
              view: 'week',
              allowViewChange: true,
              showEventDetails: true,
              onEventClick: { type: 'navigate', route: '/client/interviews/{{id}}' },
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportInterviews' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Interviews', active: true },
    ],
  },
};

export default clientInterviewsScreen;
