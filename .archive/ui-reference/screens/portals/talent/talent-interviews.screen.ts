/**
 * Candidate Interviews Screen
 *
 * Upcoming and past interviews for the candidate.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata/types';

const columns: TableColumnDefinition[] = [
  { id: 'company', header: 'Company', path: 'company', type: 'text', width: '20%' },
  { id: 'position', header: 'Position', path: 'jobTitle', type: 'text', width: '20%' },
  { id: 'dateTime', header: 'Date & Time', path: 'scheduledAt', type: 'datetime', sortable: true },
  { id: 'type', header: 'Type', path: 'interviewType', type: 'text' },
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
      ],
      badgeColors: { scheduled: 'blue', completed: 'green', cancelled: 'gray' },
    },
  },
];

export const talentInterviewsScreen: ScreenDefinition = {
  id: 'talent-interviews',
  type: 'list',
  entityType: 'interview',
  title: 'My Interviews',
  subtitle: 'Upcoming and past interviews',
  icon: 'Calendar',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getInterviews',
      params: {},
    },
    pagination: true,
    pageSize: 20,
  },

  layout: {
    type: 'tabs',
    defaultTab: 'upcoming',
    tabs: [
      // ===========================================
      // UPCOMING TAB
      // ===========================================
      {
        id: 'upcoming',
        label: 'Upcoming',
        badge: { type: 'count', path: 'stats.upcomingCount' },
        sections: [
          {
            id: 'upcoming-table',
            type: 'table',
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.talent.getInterviews',
                params: { status: 'upcoming' },
              },
            },
            columns_config: columns,
            rowClick: { type: 'navigate', route: '/talent/interviews/{{id}}' },
            rowActions: [
              {
                id: 'add-to-calendar',
                label: 'Add to Calendar',
                type: 'custom',
                icon: 'CalendarPlus',
                config: { type: 'custom', handler: 'addToCalendar' },
              },
            ],
            emptyState: {
              title: 'No upcoming interviews',
              description: 'Interviews will appear here once scheduled.',
              icon: 'Calendar',
            },
          },
        ],
      },

      // ===========================================
      // PAST TAB
      // ===========================================
      {
        id: 'past',
        label: 'Past',
        sections: [
          {
            id: 'past-table',
            type: 'table',
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.talent.getInterviews',
                params: { status: 'past' },
              },
            },
            columns_config: columns,
            rowClick: { type: 'navigate', route: '/talent/interviews/{{id}}' },
            emptyState: {
              title: 'No past interviews',
              description: 'Past interviews will appear here.',
              icon: 'Calendar',
            },
          },
        ],
      },

      // ===========================================
      // CALENDAR VIEW TAB
      // ===========================================
      {
        id: 'calendar',
        label: 'Calendar',
        icon: 'CalendarDays',
        sections: [
          {
            id: 'calendar-widget',
            type: 'custom',
            component: 'InterviewCalendar',
            componentProps: {
              view: 'month',
              allowViewChange: true,
              showEventDetails: true,
              onEventClick: { type: 'navigate', route: '/talent/interviews/{{id}}' },
            },
          },
        ],
      },
    ],
  },

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'Interviews', active: true },
    ],
  },
};

export default talentInterviewsScreen;
