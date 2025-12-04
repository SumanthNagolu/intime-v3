/**
 * Interview Detail Screen
 *
 * Detailed view of a single interview with feedback capture.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/05-schedule-interview.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const interviewDetailScreen: ScreenDefinition = {
  id: 'interview-detail',
  type: 'detail',
  entityType: 'interview',
  title: { type: 'template', template: 'Interview: {{submission.candidate.fullName}}' },
  subtitle: { type: 'template', template: 'Round {{roundNumber}} - {{type}}' },
  icon: 'Video',

  dataSource: {
    type: 'entity',
    entityType: 'interview',
    entityId: { type: 'param', path: 'id' },
    include: [
      'submission',
      'submission.candidate',
      'submission.job',
      'submission.job.account',
      'activities',
      'proposedTimes',
    ],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'interview-overview',
      title: 'Interview Details',
      fields: [
        {
          id: 'status',
          type: 'field',
          path: 'status',
          label: 'Status',
          widget: 'InterviewStatusBadge',
        },
        {
          id: 'type',
          type: 'field',
          path: 'type',
          label: 'Type',
          widget: 'InterviewTypeBadge',
        },
        {
          id: 'round',
          type: 'field',
          path: 'roundNumber',
          label: 'Round',
        },
        {
          id: 'divider-1',
          type: 'divider',
        },
        {
          id: 'scheduled-at',
          type: 'field',
          path: 'scheduledAt',
          label: 'Date/Time',
          widget: 'DateTimeDisplay',
          visible: { field: 'status', operator: 'in', value: ['scheduled', 'confirmed', 'completed'] },
        },
        {
          id: 'duration',
          type: 'field',
          path: 'durationMinutes',
          label: 'Duration',
          config: { suffix: ' minutes' },
        },
        {
          id: 'timezone',
          type: 'field',
          path: 'timezone',
          label: 'Timezone',
        },
        {
          id: 'divider-2',
          type: 'divider',
        },
        {
          id: 'meeting-link',
          type: 'field',
          path: 'meetingLink',
          label: 'Meeting Link',
          widget: 'MeetingLinkDisplay',
          visible: { field: 'meetingLink', operator: 'exists' },
        },
        {
          id: 'meeting-location',
          type: 'field',
          path: 'meetingLocation',
          label: 'Location',
          visible: { field: 'type', operator: 'eq', value: 'in_person' },
        },
        {
          id: 'divider-3',
          type: 'divider',
        },
        {
          id: 'scheduled-by',
          type: 'field',
          path: 'scheduledBy.name',
          label: 'Scheduled By',
          widget: 'UserAvatar',
        },
        {
          id: 'created-at',
          type: 'field',
          path: 'createdAt',
          label: 'Created',
          widget: 'DateTimeDisplay',
          config: { relative: true },
        },
      ],
      actions: [
        {
          id: 'join-meeting',
          label: 'Join Meeting',
          type: 'function',
          icon: 'Video',
          variant: 'primary',
          config: { type: 'function', handler: 'openMeetingLink' },
          visible: {
            type: 'condition',
            condition: {
              operator: 'and',
              conditions: [
                { field: 'meetingLink', operator: 'exists' },
                { field: 'status', operator: 'in', value: ['scheduled', 'confirmed'] },
              ],
            },
          },
        },
      ],
    },
    tabs: [
      // ==========================================
      // DETAILS TAB
      // ==========================================
      {
        id: 'details',
        label: 'Details',
        icon: 'Info',
        sections: [
          // Candidate Summary
          {
            id: 'candidate-summary',
            type: 'info-card',
            title: 'Candidate',
            fields: [
              {
                type: 'field',
                path: 'submission.candidate.fullName',
                label: 'Name',
                widget: 'EntityLink',
                config: { entityType: 'candidate', idPath: 'submission.candidate.id' },
              },
              { type: 'field', path: 'submission.candidate.professionalHeadline', label: 'Title' },
              { type: 'field', path: 'submission.candidate.email', label: 'Email', widget: 'EmailDisplay' },
              { type: 'field', path: 'submission.candidate.phone', label: 'Phone', widget: 'PhoneDisplay' },
              { type: 'field', path: 'submission.candidate.location', label: 'Location' },
              { type: 'field', path: 'submission.candidate.visaStatus', label: 'Visa', widget: 'VisaStatusBadge' },
            ],
            actions: [
              {
                id: 'view-candidate',
                label: 'View Profile',
                type: 'navigate',
                icon: 'ExternalLink',
                variant: 'ghost',
                size: 'sm',
                config: { type: 'navigate', route: '/employee/workspace/candidates/{{submission.candidate.id}}' },
              },
            ],
          },

          // Job Summary
          {
            id: 'job-summary',
            type: 'info-card',
            title: 'Job',
            fields: [
              {
                type: 'field',
                path: 'submission.job.title',
                label: 'Position',
                widget: 'EntityLink',
                config: { entityType: 'job', idPath: 'submission.job.id' },
              },
              {
                type: 'field',
                path: 'submission.job.account.name',
                label: 'Client',
                widget: 'EntityLink',
                config: { entityType: 'account', idPath: 'submission.job.account.id' },
              },
              { type: 'field', path: 'submission.job.location', label: 'Location' },
              { type: 'field', path: 'submission.job.remoteType', label: 'Work Type', widget: 'RemoteTypeBadge' },
            ],
          },

          // Interviewers
          {
            id: 'interviewers',
            type: 'info-card',
            title: 'Interviewers',
            fields: [
              {
                id: 'interviewer-list',
                type: 'custom',
                component: 'InterviewerList',
                componentProps: {
                  namesPath: 'interviewerNames',
                  emailsPath: 'interviewerEmails',
                  showContactActions: true,
                },
              },
            ],
          },

          // Description & Notes
          {
            id: 'notes-section',
            type: 'info-card',
            title: 'Description & Notes',
            fields: [
              { type: 'field', path: 'description', label: 'Description', widget: 'TextDisplay' },
              { type: 'field', path: 'internalNotes', label: 'Internal Notes', widget: 'TextDisplay' },
            ],
          },

          // Proposed Times (if status is proposed)
          {
            id: 'proposed-times',
            type: 'table',
            title: 'Proposed Times',
            visible: { field: 'status', operator: 'eq', value: 'proposed' },
            dataSource: { type: 'related', relation: 'proposedTimes' },
            columns_config: [
              { id: 'date', header: 'Date', path: 'proposedDate', type: 'date' },
              { id: 'time', header: 'Time', path: 'proposedTime', type: 'time' },
              { id: 'timezone', header: 'Timezone', path: 'timezone' },
              { id: 'status', header: 'Status', path: 'status', type: 'status-badge' },
            ],
            actions: [
              {
                id: 'confirm-time',
                label: 'Confirm',
                type: 'function',
                icon: 'Check',
                config: { type: 'function', handler: 'confirmProposedTime' },
              },
            ],
          },
        ],
      },

      // ==========================================
      // FEEDBACK TAB
      // ==========================================
      {
        id: 'feedback',
        label: 'Feedback',
        icon: 'MessageSquare',
        badge: {
          type: 'conditional',
          condition: { field: 'feedbackReceived', operator: 'eq', value: false },
          ifTrue: { value: '!', variant: 'warning' },
        },
        sections: [
          // Feedback Status
          {
            id: 'feedback-status',
            type: 'info-card',
            title: 'Feedback Status',
            visible: { field: 'status', operator: 'eq', value: 'completed' },
            fields: [
              { type: 'field', path: 'feedbackReceived', label: 'Feedback Received', widget: 'BooleanDisplay' },
              { type: 'field', path: 'feedbackSubmittedAt', label: 'Submitted At', widget: 'DateTimeDisplay' },
            ],
          },

          // Feedback Form (if interview completed and no feedback)
          {
            id: 'feedback-form',
            type: 'form',
            title: 'Submit Feedback',
            visible: {
              type: 'condition',
              condition: {
                operator: 'and',
                conditions: [
                  { field: 'status', operator: 'eq', value: 'completed' },
                  { field: 'feedbackReceived', operator: 'eq', value: false },
                ],
              },
            },
            fields: [
              {
                id: 'attendance-status',
                type: 'select',
                path: 'attendanceStatus',
                label: 'Attendance Status',
                required: true,
                options: [
                  { value: 'attended', label: 'Attended' },
                  { value: 'no_show', label: 'No Show' },
                  { value: 'cancelled', label: 'Cancelled' },
                ],
              },
              {
                id: 'rating',
                type: 'rating',
                path: 'rating',
                label: 'Overall Rating',
                required: true,
                config: { max: 5, showLabels: true },
              },
              {
                id: 'recommendation',
                type: 'select',
                path: 'recommendation',
                label: 'Recommendation',
                required: true,
                options: [
                  { value: 'strong_yes', label: 'Strong Yes', description: 'Highly recommend moving forward' },
                  { value: 'yes', label: 'Yes', description: 'Recommend with minor concerns' },
                  { value: 'maybe', label: 'Maybe', description: 'On the fence' },
                  { value: 'no', label: 'No', description: 'Do not recommend' },
                  { value: 'strong_no', label: 'Strong No', description: 'Definitely not a fit' },
                ],
              },
              {
                id: 'feedback-text',
                type: 'textarea',
                path: 'feedback',
                label: 'Detailed Feedback',
                required: true,
                config: { minLength: 50, placeholder: 'Provide detailed feedback on the candidate...' },
              },
              {
                id: 'strengths',
                type: 'tags',
                path: 'strengths',
                label: 'Key Strengths',
              },
              {
                id: 'concerns',
                type: 'tags',
                path: 'concerns',
                label: 'Areas of Concern',
              },
              {
                id: 'next-steps',
                type: 'select',
                path: 'nextSteps',
                label: 'Recommended Next Steps',
                required: true,
                options: [
                  { value: 'next_round', label: 'Schedule Next Round' },
                  { value: 'extend_offer', label: 'Extend Offer' },
                  { value: 'reject', label: 'Reject' },
                  { value: 'hold', label: 'Put on Hold' },
                ],
              },
            ],
            actions: [
              {
                id: 'submit-feedback',
                label: 'Submit Feedback',
                type: 'mutation',
                icon: 'Send',
                variant: 'primary',
                config: {
                  type: 'mutation',
                  procedure: 'ats.interviews.submitFeedback',
                  input: { type: 'form' },
                },
              },
            ],
          },

          // Feedback Display (if feedback exists)
          {
            id: 'feedback-display',
            type: 'info-card',
            title: 'Interview Feedback',
            visible: { field: 'feedbackReceived', operator: 'eq', value: true },
            fields: [
              { type: 'field', path: 'rating', label: 'Rating', widget: 'StarRating' },
              { type: 'field', path: 'recommendation', label: 'Recommendation', widget: 'RecommendationBadge' },
              { type: 'field', path: 'feedback', label: 'Feedback', widget: 'TextDisplay' },
              { type: 'field', path: 'strengths', label: 'Strengths', widget: 'TagList' },
              { type: 'field', path: 'concerns', label: 'Concerns', widget: 'TagList', config: { variant: 'warning' } },
              { type: 'field', path: 'nextSteps', label: 'Next Steps', widget: 'NextStepsBadge' },
            ],
          },
        ],
      },

      // ==========================================
      // ACTIVITY TAB
      // ==========================================
      {
        id: 'activity',
        label: 'Activity',
        icon: 'Activity',
        sections: [
          {
            id: 'activity-timeline',
            type: 'timeline',
            dataSource: { type: 'related', relation: 'activities' },
            config: {
              showEvents: true,
              showNotes: true,
              groupByDate: true,
            },
          },
        ],
        actions: [
          {
            id: 'log-activity',
            label: 'Log Activity',
            type: 'modal',
            icon: 'Plus',
            variant: 'default',
            config: { type: 'modal', modal: 'log-activity' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'confirm',
      label: 'Confirm Time',
      type: 'modal',
      icon: 'Check',
      variant: 'primary',
      config: { type: 'modal', modal: 'interview-confirm-time' },
      visible: { field: 'status', operator: 'eq', value: 'proposed' },
    },
    {
      id: 'reschedule',
      label: 'Reschedule',
      type: 'modal',
      icon: 'Clock',
      variant: 'default',
      config: { type: 'modal', modal: 'interview-reschedule' },
      visible: { field: 'status', operator: 'in', value: ['scheduled', 'confirmed', 'proposed'] },
    },
    {
      id: 'add-feedback',
      label: 'Add Feedback',
      type: 'modal',
      icon: 'MessageSquare',
      variant: 'default',
      config: { type: 'modal', modal: 'interview-feedback' },
      visible: {
        type: 'condition',
        condition: {
          operator: 'and',
          conditions: [
            { field: 'status', operator: 'eq', value: 'completed' },
            { field: 'feedbackReceived', operator: 'eq', value: false },
          ],
        },
      },
    },
    {
      id: 'cancel',
      label: 'Cancel Interview',
      type: 'modal',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'modal', modal: 'interview-cancel' },
      visible: { field: 'status', operator: 'in', value: ['scheduled', 'confirmed', 'proposed'] },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Interviews', route: '/employee/workspace/interviews' },
      { label: { type: 'field', path: 'submission.candidate.fullName' }, active: true },
    ],
  },
};

export default interviewDetailScreen;
