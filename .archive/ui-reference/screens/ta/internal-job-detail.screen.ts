/**
 * Internal Job Detail Screen Definition
 *
 * Detailed internal job view with:
 * - Job details and requirements
 * - Candidate pipeline
 * - Interview management
 * - Hiring workflow
 *
 * Routes: /employee/workspace/ta/internal-jobs/:id
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import {
  INTERNAL_JOB_STATUS_OPTIONS,
  INTERNAL_JOB_TYPE_OPTIONS,
  INTERNAL_CANDIDATE_STAGE_OPTIONS,
} from '@/lib/metadata/options/ta-options';

// ==========================================
// INTERNAL JOB DETAIL SCREEN
// ==========================================

export const internalJobDetailScreen: ScreenDefinition = {
  id: 'internal-job-detail',
  type: 'detail',
  entityType: 'internalJob',
  title: { field: 'title' },
  subtitle: { field: 'department' },
  icon: 'Building2',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.internalJobs.getById',
      params: { id: { param: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',

    // Sidebar
    sidebar: {
      id: 'job-sidebar',
      type: 'info-card',
      header: {
        type: 'icon',
        icon: 'Briefcase',
        badge: {
          type: 'field',
          path: 'status',
          variant: 'status',
        },
      },
      sections: [
        // Job Status
        {
          id: 'job-status',
          type: 'field-grid',
          columns: 1,
          fields: [
            { id: 'status', label: 'Status', path: 'status', type: 'enum', config: { options: INTERNAL_JOB_STATUS_OPTIONS } },
            { id: 'jobType', label: 'Type', path: 'jobType', type: 'enum', config: { options: INTERNAL_JOB_TYPE_OPTIONS } },
          ],
        },

        // Candidate Pipeline Summary
        {
          id: 'pipeline-summary',
          type: 'metrics-grid',
          title: 'Candidates',
          columns: 2,
          widgets: [
            {
              id: 'total-candidates',
              type: 'metric',
              label: 'Total',
              path: 'candidateCount',
              config: { icon: 'Users' },
            },
            {
              id: 'active-candidates',
              type: 'metric',
              label: 'Active',
              path: 'activeCandidateCount',
              config: { icon: 'UserCheck' },
            },
            {
              id: 'interviews',
              type: 'metric',
              label: 'In Interview',
              path: 'interviewingCount',
              config: { icon: 'Calendar' },
            },
            {
              id: 'offers',
              type: 'metric',
              label: 'Offers',
              path: 'offerCount',
              config: { icon: 'FileCheck' },
            },
          ],
        },

        // Job Details
        {
          id: 'job-details',
          type: 'field-grid',
          title: 'Details',
          icon: 'FileText',
          columns: 1,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { id: 'department', label: 'Department', path: 'department', type: 'text' },
            { id: 'location', label: 'Location', path: 'location', type: 'text' },
            { id: 'workMode', label: 'Work Mode', path: 'workMode', type: 'text' },
            { id: 'headcount', label: 'Headcount', path: 'headcount', type: 'number' },
          ],
        },

        // Compensation
        {
          id: 'compensation',
          type: 'field-grid',
          title: 'Compensation',
          icon: 'DollarSign',
          columns: 1,
          collapsible: true,
          fields: [
            { id: 'salaryMin', label: 'Min Salary', path: 'salaryMin', type: 'currency', config: { prefix: '$' } },
            { id: 'salaryMax', label: 'Max Salary', path: 'salaryMax', type: 'currency', config: { prefix: '$' } },
          ],
        },

        // Assignment
        {
          id: 'assignment',
          type: 'field-grid',
          title: 'Assignment',
          icon: 'UserCheck',
          columns: 1,
          collapsible: true,
          fields: [
            { id: 'hiringManager', label: 'Hiring Manager', path: 'hiringManagerName', type: 'user' },
            { id: 'recruiter', label: 'Recruiter', path: 'recruiterName', type: 'user' },
            { id: 'postedAt', label: 'Posted', path: 'postedAt', type: 'date', config: { format: 'medium' } },
          ],
        },
      ],
    },

    // Main Content - Tabs
    tabs: [
      // Description Tab
      {
        id: 'description',
        label: 'Description',
        icon: 'FileText',
        sections: [
          {
            id: 'job-description',
            type: 'info-card',
            title: 'Job Description',
            widgets: [
              {
                id: 'description-text',
                type: 'rich-text',
                path: 'description',
                config: { readOnly: true },
              },
            ],
          },
          {
            id: 'requirements',
            type: 'info-card',
            title: 'Requirements',
            widgets: [
              {
                id: 'requirements-text',
                type: 'rich-text',
                path: 'requirements',
                config: { readOnly: true },
              },
            ],
          },
          {
            id: 'skills',
            type: 'info-card',
            title: 'Required Skills',
            widgets: [
              {
                id: 'skills-list',
                type: 'tags',
                path: 'requiredSkills',
              },
            ],
          },
          {
            id: 'nice-to-have',
            type: 'info-card',
            title: 'Nice to Have',
            widgets: [
              {
                id: 'nice-to-have-list',
                type: 'tags',
                path: 'niceToHaveSkills',
              },
            ],
          },
        ],
      },

      // Candidates Tab
      {
        id: 'candidates',
        label: 'Candidates',
        icon: 'Users',
        badge: {
          type: 'count',
          path: 'candidateCount',
        },
        sections: [
          // Candidate Pipeline View
          {
            id: 'candidate-pipeline',
            type: 'custom',
            component: 'CandidatePipeline',
            componentProps: {
              jobIdParam: 'id',
              stages: INTERNAL_CANDIDATE_STAGE_OPTIONS,
              onDragEnd: {
                mutation: 'ta.internalCandidates.updateStage',
              },
            },
          },

          // Candidates Table (alternative view)
          {
            id: 'candidates-table',
            type: 'table',
            title: 'All Candidates',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.internalCandidates.listByJob',
                params: { jobId: { param: 'id' } },
              },
            },
            columns_config: [
              {
                id: 'name',
                header: 'Candidate',
                accessor: 'name',
                type: 'composite',
                config: {
                  primary: { path: 'name' },
                  secondary: { path: 'currentRole' },
                  avatar: { path: 'name', type: 'initials' },
                },
              },
              {
                id: 'stage',
                header: 'Stage',
                accessor: 'stage',
                type: 'enum',
                config: { options: INTERNAL_CANDIDATE_STAGE_OPTIONS },
              },
              { id: 'source', header: 'Source', accessor: 'source', type: 'text' },
              { id: 'appliedAt', header: 'Applied', accessor: 'appliedAt', type: 'date', config: { format: 'relative' } },
              { id: 'nextInterview', header: 'Next Interview', accessor: 'nextInterviewDate', type: 'date', config: { format: 'short' } },
            ],
            rowClick: {
              type: 'modal',
              modal: 'candidate-detail',
            },
            rowActions: [
              {
                id: 'schedule-interview',
                type: 'modal',
                label: 'Schedule Interview',
                icon: 'Calendar',
                visible: { field: 'stage', operator: 'in', value: ['applied', 'screening'] },
                config: { type: 'modal', modal: 'schedule-internal-interview' },
              },
              {
                id: 'advance',
                type: 'modal',
                label: 'Advance Stage',
                icon: 'ArrowRight',
                visible: { field: 'stage', operator: 'nin', value: ['hired', 'rejected'] },
                config: { type: 'modal', modal: 'advance-candidate-stage' },
              },
              {
                id: 'make-offer',
                type: 'modal',
                label: 'Make Offer',
                icon: 'FileCheck',
                visible: { field: 'stage', operator: 'eq', value: 'interview' },
                config: { type: 'modal', modal: 'make-internal-offer' },
              },
              {
                id: 'reject',
                type: 'modal',
                label: 'Reject',
                icon: 'X',
                variant: 'destructive',
                visible: { field: 'stage', operator: 'nin', value: ['hired', 'rejected'] },
                config: { type: 'modal', modal: 'reject-candidate' },
              },
            ],
            emptyState: {
              title: 'No Candidates',
              description: 'Candidates who apply will appear here',
              icon: 'Users',
            },
            actions: [
              {
                id: 'add-candidate',
                type: 'modal',
                label: 'Add Candidate',
                icon: 'Plus',
                variant: 'outline',
                config: {
                  type: 'modal',
                  modal: 'add-internal-candidate',
                  props: { jobId: { param: 'id' } },
                },
              },
            ],
          },
        ],
      },

      // Interviews Tab
      {
        id: 'interviews',
        label: 'Interviews',
        icon: 'Calendar',
        badge: {
          type: 'count',
          path: 'upcomingInterviewCount',
        },
        sections: [
          // Upcoming Interviews
          {
            id: 'upcoming-interviews',
            type: 'table',
            title: 'Upcoming Interviews',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.internalJobs.getUpcomingInterviews',
                params: { jobId: { param: 'id' } },
              },
            },
            columns_config: [
              { id: 'candidate', header: 'Candidate', accessor: 'candidateName', type: 'text' },
              { id: 'interviewType', header: 'Type', accessor: 'interviewType', type: 'text' },
              { id: 'dateTime', header: 'Date & Time', accessor: 'scheduledAt', type: 'datetime' },
              { id: 'interviewers', header: 'Interviewers', accessor: 'interviewerNames', type: 'text' },
              { id: 'location', header: 'Location', accessor: 'location', type: 'text' },
            ],
            rowActions: [
              {
                id: 'reschedule',
                type: 'modal',
                label: 'Reschedule',
                icon: 'RefreshCw',
                config: { type: 'modal', modal: 'reschedule-interview' },
              },
              {
                id: 'cancel',
                type: 'mutation',
                label: 'Cancel',
                icon: 'X',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'ta.interviews.cancel' },
              },
            ],
            emptyState: {
              title: 'No Upcoming Interviews',
              description: 'Schedule interviews with candidates',
              icon: 'Calendar',
            },
          },

          // Past Interviews
          {
            id: 'past-interviews',
            type: 'table',
            title: 'Past Interviews',
            collapsible: true,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.internalJobs.getPastInterviews',
                params: { jobId: { param: 'id' } },
              },
            },
            columns_config: [
              { id: 'candidate', header: 'Candidate', accessor: 'candidateName', type: 'text' },
              { id: 'interviewType', header: 'Type', accessor: 'interviewType', type: 'text' },
              { id: 'dateTime', header: 'Date', accessor: 'scheduledAt', type: 'date', config: { format: 'medium' } },
              { id: 'result', header: 'Result', accessor: 'result', type: 'enum' },
              { id: 'rating', header: 'Rating', accessor: 'overallRating', type: 'rating' },
            ],
            rowClick: {
              type: 'modal',
              modal: 'interview-feedback',
            },
          },
        ],
      },

      // Activity Tab
      {
        id: 'activity',
        label: 'Activity',
        icon: 'Activity',
        sections: [
          {
            id: 'activity-timeline',
            type: 'timeline',
            title: 'Job Activity',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.internalJobs.getActivity',
                params: { jobId: { param: 'id' } },
              },
            },
            config: {
              timestampPath: 'createdAt',
              titlePath: 'event',
              descriptionPath: 'details',
              typePath: 'eventType',
              userPath: 'userName',
            },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'publish',
      type: 'mutation',
      label: 'Publish',
      icon: 'Send',
      variant: 'primary',
      visible: { field: 'status', operator: 'eq', value: 'draft' },
      config: { type: 'mutation', procedure: 'ta.internalJobs.publish' },
    },
    {
      id: 'add-candidate',
      type: 'modal',
      label: 'Add Candidate',
      icon: 'UserPlus',
      variant: 'primary',
      visible: { field: 'status', operator: 'eq', value: 'open' },
      config: {
        type: 'modal',
        modal: 'add-internal-candidate',
        props: { jobId: { param: 'id' } },
      },
    },
    {
      id: 'edit',
      type: 'navigate',
      label: 'Edit',
      icon: 'Pencil',
      variant: 'outline',
      visible: { field: 'status', operator: 'in', value: ['draft', 'open', 'on_hold'] },
      config: { type: 'navigate', route: '/employee/workspace/ta/internal-jobs/{id}/edit' },
    },
    {
      id: 'put-on-hold',
      type: 'mutation',
      label: 'Put on Hold',
      icon: 'Pause',
      variant: 'outline',
      visible: { field: 'status', operator: 'eq', value: 'open' },
      config: { type: 'mutation', procedure: 'ta.internalJobs.putOnHold' },
    },
    {
      id: 'reopen',
      type: 'mutation',
      label: 'Reopen',
      icon: 'Play',
      variant: 'outline',
      visible: { field: 'status', operator: 'eq', value: 'on_hold' },
      config: { type: 'mutation', procedure: 'ta.internalJobs.reopen' },
    },
    {
      id: 'mark-filled',
      type: 'modal',
      label: 'Mark as Filled',
      icon: 'CheckCircle',
      variant: 'outline',
      visible: { field: 'status', operator: 'eq', value: 'open' },
      config: { type: 'modal', modal: 'mark-job-filled' },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Internal Jobs',
      route: '/employee/workspace/ta/internal-jobs',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Internal Jobs', route: '/employee/workspace/ta/internal-jobs' },
      { label: { field: 'title' } },
    ],
  },
};

export default internalJobDetailScreen;
