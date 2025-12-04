/**
 * Candidate Interview Detail Screen
 *
 * Full interview details with preparation materials and calendar actions.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const talentInterviewDetailScreen: ScreenDefinition = {
  id: 'talent-interview-detail',
  type: 'detail',
  entityType: 'interview',
  title: { type: 'template', template: 'Interview at {{company}}' },
  subtitle: { type: 'field', path: 'jobTitle' },
  icon: 'Calendar',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getInterviewById',
      params: { id: { type: 'param', path: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',
    sidebar: {
      id: 'interview-card',
      type: 'info-card',
      title: 'Interview Details',
      fields: [
        { id: 'date', label: 'Date', type: 'date', path: 'scheduledAt' },
        { id: 'time', label: 'Time', type: 'time', path: 'scheduledAt' },
        { id: 'timezone', label: 'Timezone', type: 'text', path: 'timezone' },
        { id: 'duration', label: 'Duration', type: 'text', path: 'duration' },
        { id: 'type', label: 'Type', type: 'text', path: 'interviewType' },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
          config: {
            options: [
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ],
            badgeColors: { scheduled: 'blue', completed: 'green', cancelled: 'gray' },
          },
        },
      ],
      actions: [
        {
          id: 'join-meeting',
          label: 'Join Meeting',
          type: 'custom',
          icon: 'Video',
          variant: 'primary',
          config: { type: 'custom', handler: 'joinMeeting', params: { meetingUrl: { type: 'field', path: 'meetingLink' } } },
          visible: {
            type: 'condition',
            condition: {
              operator: 'and',
              conditions: [
                { field: 'status', operator: 'eq', value: 'scheduled' },
                { field: 'meetingLink', operator: 'is_not_empty' },
              ],
            },
          },
        },
        {
          id: 'add-to-google',
          label: 'Add to Google Calendar',
          type: 'custom',
          icon: 'Calendar',
          variant: 'outline',
          config: { type: 'custom', handler: 'addToGoogleCalendar' },
          visible: { field: 'status', operator: 'eq', value: 'scheduled' },
        },
        {
          id: 'add-to-outlook',
          label: 'Add to Outlook',
          type: 'custom',
          icon: 'Calendar',
          variant: 'outline',
          config: { type: 'custom', handler: 'addToOutlookCalendar' },
          visible: { field: 'status', operator: 'eq', value: 'scheduled' },
        },
      ],
    },
    sections: [
      // ===========================================
      // LOCATION / MEETING INFO
      // ===========================================
      {
        id: 'meeting-info',
        type: 'info-card',
        title: 'Meeting Information',
        fields: [
          { id: 'location', label: 'Location', type: 'text', path: 'location' },
          { id: 'meetingLink', label: 'Meeting Link', type: 'url', path: 'meetingLink' },
          { id: 'phone', label: 'Dial-in Number', type: 'phone', path: 'phoneNumber' },
          { id: 'meetingId', label: 'Meeting ID', type: 'text', path: 'meetingId' },
          { id: 'passcode', label: 'Passcode', type: 'text', path: 'passcode' },
        ],
      },

      // ===========================================
      // INTERVIEWERS
      // ===========================================
      {
        id: 'interviewers',
        type: 'custom',
        title: 'Interviewers',
        component: 'InterviewerCards',
        componentProps: {
          showLinkedIn: true,
          showTitle: true,
          showDepartment: true,
        },
      },

      // ===========================================
      // COMPANY RESEARCH
      // ===========================================
      {
        id: 'company-research',
        type: 'info-card',
        title: 'Company Information',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          { id: 'companyDescription', label: '', type: 'richtext', path: 'company.description' },
          { id: 'industry', label: 'Industry', type: 'text', path: 'company.industry' },
          { id: 'size', label: 'Size', type: 'text', path: 'company.size' },
          { id: 'website', label: 'Website', type: 'url', path: 'company.website' },
          { id: 'linkedin', label: 'LinkedIn', type: 'url', path: 'company.linkedIn' },
        ],
      },

      // ===========================================
      // PREPARATION TIPS
      // ===========================================
      {
        id: 'preparation',
        type: 'custom',
        title: 'Preparation Tips',
        component: 'InterviewPrepTips',
        componentProps: {
          interviewType: { type: 'field', path: 'interviewType' },
          jobTitle: { type: 'field', path: 'jobTitle' },
          skills: { type: 'field', path: 'requiredSkills' },
        },
      },

      // ===========================================
      // JOB DETAILS REMINDER
      // ===========================================
      {
        id: 'job-reminder',
        type: 'info-card',
        title: 'Position Details',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          { id: 'jobTitle', label: 'Position', type: 'text', path: 'jobTitle' },
          { id: 'location', label: 'Location', type: 'text', path: 'job.location' },
          { id: 'type', label: 'Type', type: 'text', path: 'job.jobType' },
          { id: 'skills', label: 'Key Skills', type: 'tags', path: 'job.skills' },
        ],
        actions: [
          {
            id: 'view-job',
            label: 'View Full Job Details',
            type: 'navigate',
            icon: 'ExternalLink',
            variant: 'ghost',
            config: { type: 'navigate', route: '/talent/jobs/{{jobId}}' },
          },
        ],
      },
    ],
  },

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'Interviews', route: '/talent/interviews' },
      { label: { type: 'field', path: 'company' }, active: true },
    ],
  },
};

export default talentInterviewDetailScreen;
