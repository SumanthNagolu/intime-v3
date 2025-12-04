/**
 * Client Job Detail Screen
 *
 * Detailed view of a job order with tabs for submissions, interviews, and placements.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const clientJobDetailScreen: ScreenDefinition = {
  id: 'client-job-detail',
  type: 'detail',
  entityType: 'job',
  title: { type: 'field', path: 'title' },
  subtitle: { type: 'template', template: 'Job #{{id}}' },
  icon: 'Briefcase',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.client.getJobById',
      params: { id: { type: 'param', path: 'id' } },
    },
  },

  layout: {
    type: 'tabs',
    defaultTab: 'details',
    tabs: [
      // ===========================================
      // DETAILS TAB
      // ===========================================
      {
        id: 'details',
        label: 'Details',
        icon: 'FileText',
        sections: [
          {
            id: 'job-info',
            type: 'info-card',
            title: 'Job Information',
            fields: [
              { id: 'title', label: 'Title', type: 'text', path: 'title' },
              {
                id: 'status',
                label: 'Status',
                type: 'enum',
                path: 'status',
                config: {
                  options: [
                    { value: 'open', label: 'Open' },
                    { value: 'filled', label: 'Filled' },
                    { value: 'on_hold', label: 'On Hold' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ],
                  badgeColors: { open: 'green', filled: 'blue', on_hold: 'yellow', cancelled: 'gray' },
                },
              },
              { id: 'department', label: 'Department', type: 'text', path: 'department' },
              { id: 'location', label: 'Location', type: 'text', path: 'location' },
              { id: 'workMode', label: 'Work Mode', type: 'text', path: 'workMode' },
              { id: 'positions', label: 'Positions', type: 'number', path: 'positionsCount' },
              { id: 'rateRange', label: 'Rate Range', type: 'text', path: 'rateRange' },
              { id: 'createdAt', label: 'Posted', type: 'date', path: 'createdAt' },
            ],
          },
          {
            id: 'description',
            type: 'info-card',
            title: 'Job Description',
            fields: [
              { id: 'description', label: '', type: 'richtext', path: 'description' },
            ],
          },
          {
            id: 'requirements',
            type: 'info-card',
            title: 'Requirements',
            fields: [
              { id: 'skills', label: 'Required Skills', type: 'tags', path: 'skills' },
              { id: 'experience', label: 'Experience', type: 'text', path: 'experienceRequired' },
              { id: 'education', label: 'Education', type: 'text', path: 'educationRequired' },
            ],
          },
        ],
      },

      // ===========================================
      // SUBMISSIONS TAB
      // ===========================================
      {
        id: 'submissions',
        label: 'Submissions',
        icon: 'Users',
        badge: { type: 'count', path: 'submissionsCount' },
        sections: [
          {
            id: 'submissions-table',
            type: 'table',
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.client.getJobSubmissions',
                params: { jobId: { type: 'param', path: 'id' } },
              },
            },
            columns_config: [
              { id: 'candidate', header: 'Candidate', path: 'candidateName', type: 'text' },
              { id: 'submittedAt', header: 'Submitted', path: 'submittedAt', type: 'date' },
              { id: 'matchScore', header: 'Match', path: 'matchScore', type: 'progress', config: { max: 100 } },
              {
                id: 'status',
                header: 'Status',
                path: 'status',
                type: 'enum',
                config: {
                  options: [
                    { value: 'pending', label: 'Pending Review' },
                    { value: 'shortlisted', label: 'Shortlisted' },
                    { value: 'interviewing', label: 'Interviewing' },
                    { value: 'offered', label: 'Offered' },
                    { value: 'rejected', label: 'Rejected' },
                  ],
                  badgeColors: {
                    pending: 'yellow',
                    shortlisted: 'blue',
                    interviewing: 'purple',
                    offered: 'green',
                    rejected: 'gray',
                  },
                },
              },
            ],
            rowClick: { type: 'navigate', route: '/client/submissions/{{id}}' },
            emptyState: {
              title: 'No submissions yet',
              description: 'Candidates will appear here once submitted for this job.',
              icon: 'Users',
            },
          },
        ],
      },

      // ===========================================
      // INTERVIEWS TAB
      // ===========================================
      {
        id: 'interviews',
        label: 'Interviews',
        icon: 'Calendar',
        badge: { type: 'count', path: 'interviewsCount' },
        sections: [
          {
            id: 'interviews-table',
            type: 'table',
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.client.getJobInterviews',
                params: { jobId: { type: 'param', path: 'id' } },
              },
            },
            columns_config: [
              { id: 'candidate', header: 'Candidate', path: 'candidateName', type: 'text' },
              { id: 'dateTime', header: 'Date & Time', path: 'scheduledAt', type: 'datetime' },
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
                    { value: 'rescheduled', label: 'Rescheduled' },
                  ],
                  badgeColors: {
                    scheduled: 'blue',
                    completed: 'green',
                    cancelled: 'gray',
                    rescheduled: 'orange',
                  },
                },
              },
              { id: 'feedbackStatus', header: 'Feedback', path: 'feedbackProvided', type: 'boolean' },
            ],
            rowClick: { type: 'navigate', route: '/client/interviews/{{id}}' },
            emptyState: {
              title: 'No interviews scheduled',
              description: 'Interviews will appear here once candidates are scheduled.',
              icon: 'Calendar',
            },
          },
        ],
      },

      // ===========================================
      // PLACEMENTS TAB
      // ===========================================
      {
        id: 'placements',
        label: 'Placements',
        icon: 'CheckCircle',
        badge: { type: 'count', path: 'placementsCount' },
        sections: [
          {
            id: 'placements-table',
            type: 'table',
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.client.getJobPlacements',
                params: { jobId: { type: 'param', path: 'id' } },
              },
            },
            columns_config: [
              { id: 'consultant', header: 'Consultant', path: 'consultantName', type: 'text' },
              { id: 'startDate', header: 'Start Date', path: 'startDate', type: 'date' },
              { id: 'endDate', header: 'End Date', path: 'endDate', type: 'date' },
              {
                id: 'status',
                header: 'Status',
                path: 'status',
                type: 'enum',
                config: {
                  options: [
                    { value: 'active', label: 'Active' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'terminated', label: 'Terminated' },
                  ],
                  badgeColors: { active: 'green', completed: 'blue', terminated: 'gray' },
                },
              },
            ],
            rowClick: { type: 'navigate', route: '/client/placements/{{id}}' },
            emptyState: {
              title: 'No placements yet',
              description: 'Hired candidates will appear here once they start.',
              icon: 'CheckCircle',
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'request-more-candidates',
      label: 'Request More Candidates',
      type: 'modal',
      icon: 'UserPlus',
      variant: 'primary',
      config: { type: 'modal', modal: 'RequestMoreCandidates', props: { jobId: { type: 'field', path: 'id' } } },
    },
    {
      id: 'edit-requirements',
      label: 'Edit Requirements',
      type: 'modal',
      icon: 'Edit',
      variant: 'outline',
      config: { type: 'modal', modal: 'EditJobRequirements', props: { jobId: { type: 'field', path: 'id' } } },
    },
    {
      id: 'put-on-hold',
      label: 'Put On Hold',
      type: 'mutation',
      icon: 'Pause',
      variant: 'outline',
      config: { type: 'mutation', procedure: 'portal.client.updateJobStatus', input: { id: { type: 'field', path: 'id' }, status: 'on_hold' } },
      visible: { field: 'status', operator: 'eq', value: 'open' },
      confirm: {
        title: 'Put Job On Hold?',
        message: 'This will pause candidate submissions for this job.',
        confirmLabel: 'Yes, Put On Hold',
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Jobs', route: '/client/jobs' },
      { label: { type: 'field', path: 'title' }, active: true },
    ],
  },
};

export default clientJobDetailScreen;
