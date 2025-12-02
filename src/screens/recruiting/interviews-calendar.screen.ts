/**
 * Interviews Calendar Screen
 *
 * Calendar and list views of scheduled interviews.
 * Features week/day views, filtering, and quick actions.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/05-schedule-interview.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const interviewsCalendarScreen: ScreenDefinition = {
  id: 'interviews-calendar',
  type: 'list',
  entityType: 'interview',
  title: 'Interviews',
  icon: 'Calendar',

  dataSource: {
    type: 'list',
    entityType: 'interview',
    pagination: true,
    pageSize: 50,
    sort: { field: 'scheduled_at', direction: 'asc' },
    include: ['submission', 'submission.candidate', 'submission.job', 'submission.job.account'],
  },

  layout: {
    type: 'single-column',
    sections: [
      // View Toggle
      {
        id: 'view-toggle',
        type: 'custom',
        component: 'ViewToggle',
        componentProps: {
          views: [
            { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
            { id: 'list', label: 'List', icon: 'List' },
          ],
          activeView: 'calendar',
        },
      },

      // Filters
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'date-range',
            type: 'date-range',
            path: 'filters.dateRange',
            label: 'Date Range',
            config: {
              presets: ['today', 'this_week', 'next_week', 'this_month'],
              defaultPreset: 'this_week',
            },
          },
          {
            id: 'status',
            type: 'multiselect',
            path: 'filters.status',
            label: 'Status',
            options: [
              { value: 'proposed', label: 'Proposed' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'no_show', label: 'No Show' },
            ],
          },
          {
            id: 'type',
            type: 'multiselect',
            path: 'filters.type',
            label: 'Type',
            options: [
              { value: 'phone_screen', label: 'Phone Screen' },
              { value: 'video_call', label: 'Video Call' },
              { value: 'in_person', label: 'In-Person' },
              { value: 'panel', label: 'Panel' },
              { value: 'technical', label: 'Technical' },
              { value: 'behavioral', label: 'Behavioral' },
              { value: 'final_round', label: 'Final Round' },
            ],
          },
          {
            id: 'account',
            type: 'select',
            path: 'filters.accountId',
            label: 'Client',
            placeholder: 'All Clients',
            optionsSource: { type: 'entity', entityType: 'account' },
          },
          {
            id: 'feedback-needed',
            type: 'boolean',
            path: 'filters.feedbackNeeded',
            label: 'Needs Feedback',
          },
        ],
      },

      // Calendar View
      {
        id: 'calendar-view',
        type: 'custom',
        component: 'InterviewCalendar',
        componentProps: {
          views: ['day', 'week'],
          defaultView: 'week',
          showSidebar: true,
          sidebarContent: 'upcoming',
          eventTemplate: {
            title: { type: 'template', template: '{{submission.candidate.fullName}} - {{type}}' },
            subtitle: { type: 'field', path: 'submission.job.title' },
            color: { type: 'field', path: 'typeColor' },
            status: { type: 'field', path: 'status' },
          },
          onEventClick: 'openInterviewDetail',
          onSlotSelect: 'openScheduleModal',
        },
        visible: { field: 'activeView', operator: 'eq', value: 'calendar' },
      },

      // List View
      {
        id: 'list-view',
        type: 'table',
        visible: { field: 'activeView', operator: 'eq', value: 'list' },
        columns_config: [
          {
            id: 'candidate',
            header: 'Candidate',
            path: 'submission.candidate.fullName',
            sortable: true,
            width: '18%',
            config: {
              link: true,
              linkPath: '/employee/workspace/candidates/{{submission.candidate.id}}',
              avatar: true,
              avatarPath: 'submission.candidate.avatarUrl',
            },
          },
          {
            id: 'job',
            header: 'Job',
            path: 'submission.job.title',
            sortable: true,
            config: {
              link: true,
              linkPath: '/employee/workspace/jobs/{{submission.job.id}}',
            },
          },
          {
            id: 'client',
            header: 'Client',
            path: 'submission.job.account.name',
          },
          {
            id: 'type',
            header: 'Type',
            path: 'type',
            type: 'interview-type-badge',
            sortable: true,
          },
          {
            id: 'round',
            header: 'Round',
            path: 'roundNumber',
            type: 'number',
          },
          {
            id: 'scheduled-at',
            header: 'Date/Time',
            path: 'scheduledAt',
            type: 'datetime',
            sortable: true,
          },
          {
            id: 'duration',
            header: 'Duration',
            path: 'durationMinutes',
            config: { suffix: ' min' },
          },
          {
            id: 'interviewers',
            header: 'Interviewers',
            path: 'interviewerNames',
            type: 'string-list',
            config: { maxItems: 2 },
          },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'interview-status-badge',
            sortable: true,
          },
          {
            id: 'feedback',
            header: 'Feedback',
            path: 'feedbackReceived',
            type: 'boolean-indicator',
            config: { trueIcon: 'Check', falseIcon: 'AlertCircle', falseColor: 'warning' },
          },
        ],
        rowClick: { type: 'navigate', route: '/employee/workspace/interviews/{{id}}' },
        emptyState: {
          title: 'No interviews scheduled',
          description: 'Schedule interviews from candidate submissions',
        },
      },

      // Upcoming Interviews Summary (sidebar for calendar)
      {
        id: 'upcoming-summary',
        type: 'custom',
        title: 'Upcoming Today',
        component: 'UpcomingInterviewsList',
        componentProps: {
          filter: 'today',
          maxItems: 5,
          showCountdown: true,
          showQuickActions: true,
        },
        visible: { field: 'activeView', operator: 'eq', value: 'calendar' },
      },
    ],
  },

  actions: [
    {
      id: 'schedule',
      label: 'Schedule Interview',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'interview-schedule' },
    },
    {
      id: 'bulk-reschedule',
      label: 'Bulk Reschedule',
      type: 'modal',
      icon: 'Clock',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-reschedule' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'sync-calendar',
      label: 'Sync Calendar',
      type: 'function',
      icon: 'RefreshCw',
      variant: 'ghost',
      config: { type: 'function', handler: 'syncCalendar' },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'function',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'function', handler: 'exportInterviews' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Interviews', active: true },
    ],
  },

  keyboard_shortcuts: [
    { key: 'n', action: 'scheduleInterview', description: 'Schedule new interview' },
    { key: 't', action: 'goToToday', description: 'Go to today' },
    { key: 'left', action: 'previousPeriod', description: 'Previous week/day' },
    { key: 'right', action: 'nextPeriod', description: 'Next week/day' },
  ],
};

export default interviewsCalendarScreen;
