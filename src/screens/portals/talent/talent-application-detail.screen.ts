/**
 * Application Detail Screen
 *
 * Application status, timeline, and details.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const talentApplicationDetailScreen: ScreenDefinition = {
  id: 'talent-application-detail',
  type: 'detail',
  title: { type: 'field', path: 'jobTitle' },
  subtitle: { type: 'field', path: 'company' },
  icon: 'FileText',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getApplicationById',
      params: { id: { type: 'param', path: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',
    sidebar: {
      id: 'status-card',
      type: 'info-card',
      title: 'Application Status',
      fields: [
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
          config: {
            options: [
              { value: 'submitted', label: 'Submitted' },
              { value: 'under_review', label: 'Under Review' },
              { value: 'interviewing', label: 'Interviewing' },
              { value: 'offered', label: 'Offered' },
              { value: 'placed', label: 'Placed' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'withdrawn', label: 'Withdrawn' },
            ],
            badgeColors: {
              submitted: 'blue',
              under_review: 'yellow',
              interviewing: 'purple',
              offered: 'green',
              placed: 'green',
              rejected: 'gray',
              withdrawn: 'gray',
            },
          },
        },
        { id: 'appliedAt', label: 'Applied', type: 'date', path: 'appliedAt' },
        { id: 'lastActivity', label: 'Last Update', type: 'datetime', path: 'lastActivityAt', config: { relative: true } },
      ],
      actions: [
        {
          id: 'withdraw',
          label: 'Withdraw Application',
          type: 'mutation',
          icon: 'X',
          variant: 'destructive',
          config: {
            type: 'mutation',
            procedure: 'portal.talent.withdrawApplication',
            input: { applicationId: { type: 'field', path: 'id' } },
          },
          visible: {
            type: 'condition',
            condition: {
              operator: 'and',
              conditions: [
                { field: 'status', operator: 'neq', value: 'withdrawn' },
                { field: 'status', operator: 'neq', value: 'rejected' },
                { field: 'status', operator: 'neq', value: 'placed' },
              ],
            },
          },
          confirm: {
            title: 'Withdraw Application?',
            message: 'Are you sure? This action cannot be undone.',
            confirmLabel: 'Withdraw',
            destructive: true,
          },
        },
        {
          id: 'update-availability',
          label: 'Update Availability',
          type: 'modal',
          icon: 'Calendar',
          variant: 'outline',
          config: { type: 'modal', modal: 'UpdateAvailability', props: { applicationId: { type: 'field', path: 'id' } } },
          visible: { field: 'status', operator: 'in', value: ['submitted', 'under_review', 'interviewing'] },
        },
      ],
    },
    sections: [
      // ===========================================
      // STATUS TIMELINE
      // ===========================================
      {
        id: 'status-timeline',
        type: 'custom',
        title: 'Application Timeline',
        component: 'ApplicationTimeline',
        componentProps: {
          steps: [
            { id: 'submitted', label: 'Submitted', icon: 'Send' },
            { id: 'under_review', label: 'Under Review', icon: 'Eye' },
            { id: 'interviewing', label: 'Interviewing', icon: 'Video' },
            { id: 'offered', label: 'Offered', icon: 'Gift' },
            { id: 'placed', label: 'Placed', icon: 'CheckCircle' },
          ],
          currentStatusPath: 'status',
          eventsPath: 'events',
        },
      },

      // ===========================================
      // JOB SUMMARY
      // ===========================================
      {
        id: 'job-summary',
        type: 'info-card',
        title: 'Job Details',
        fields: [
          { id: 'title', label: 'Title', type: 'text', path: 'jobTitle' },
          { id: 'company', label: 'Company', type: 'text', path: 'company' },
          { id: 'location', label: 'Location', type: 'text', path: 'location' },
          { id: 'jobType', label: 'Type', type: 'text', path: 'jobType' },
          { id: 'rate', label: 'Rate', type: 'text', path: 'rateRange' },
        ],
        actions: [
          {
            id: 'view-job',
            label: 'View Job Details',
            type: 'navigate',
            icon: 'ExternalLink',
            variant: 'ghost',
            config: { type: 'navigate', route: '/talent/jobs/{{jobId}}' },
          },
        ],
      },

      // ===========================================
      // UPCOMING INTERVIEW (if any)
      // ===========================================
      {
        id: 'upcoming-interview',
        type: 'info-card',
        title: 'Upcoming Interview',
        visible: { field: 'upcomingInterview', operator: 'is_not_empty' },
        fields: [
          { id: 'date', label: 'Date', type: 'date', path: 'upcomingInterview.scheduledAt' },
          { id: 'time', label: 'Time', type: 'time', path: 'upcomingInterview.scheduledAt' },
          { id: 'type', label: 'Type', type: 'text', path: 'upcomingInterview.interviewType' },
          { id: 'location', label: 'Location/Link', type: 'text', path: 'upcomingInterview.location' },
        ],
        actions: [
          {
            id: 'view-interview',
            label: 'View Interview Details',
            type: 'navigate',
            icon: 'Calendar',
            variant: 'primary',
            config: { type: 'navigate', route: '/talent/interviews/{{upcomingInterview.id}}' },
          },
        ],
      },

      // ===========================================
      // YOUR SUBMISSION
      // ===========================================
      {
        id: 'your-submission',
        type: 'info-card',
        title: 'Your Submission',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          { id: 'resume', label: 'Resume', type: 'text', path: 'submittedResume.name' },
          { id: 'availability', label: 'Availability', type: 'text', path: 'availability' },
          { id: 'rate', label: 'Rate Expectation', type: 'currency', path: 'rateExpectation' },
        ],
        actions: [
          {
            id: 'download-resume',
            label: 'Download Resume',
            type: 'download',
            icon: 'Download',
            variant: 'ghost',
            config: { type: 'download', url: { type: 'field', path: 'submittedResume.url' } },
          },
        ],
      },

      // ===========================================
      // MESSAGES FROM RECRUITER
      // ===========================================
      {
        id: 'recruiter-messages',
        type: 'list',
        title: 'Messages',
        visible: { field: 'messages.length', operator: 'gt', value: 0 },
        dataSource: { type: 'field', path: 'messages' },
        config: {
          layout: 'timeline',
          fields: [
            { id: 'from', path: 'fromName' },
            { id: 'message', path: 'content' },
            { id: 'date', path: 'sentAt', type: 'datetime' },
          ],
        },
        actions: [
          {
            id: 'reply',
            label: 'Reply',
            type: 'modal',
            icon: 'MessageCircle',
            variant: 'outline',
            config: { type: 'modal', modal: 'ReplyToRecruiter', props: { applicationId: { type: 'field', path: 'id' } } },
          },
        ],
      },
    ],
  },

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'Applications', route: '/talent/applications' },
      { label: { type: 'field', path: 'jobTitle' }, active: true },
    ],
  },
};

export default talentApplicationDetailScreen;
