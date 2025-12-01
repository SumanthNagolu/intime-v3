/**
 * Recruiting List Screens
 * 
 * List views for Jobs, Candidates, Submissions with:
 * - Advanced filtering
 * - Activity badges
 * - Bulk actions
 * - Quick actions
 * 
 * @see docs/specs/20-USER-ROLES/01-recruiter/
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

// =====================================================
// JOB LIST SCREEN
// =====================================================
export const jobListScreen: ScreenDefinition = {
  id: 'job-list',
  type: 'list',
  entityType: 'job',
  title: 'Jobs',
  icon: 'Briefcase',

  dataSource: {
    type: 'list',
    entityType: 'job',
    pagination: true,
    pageSize: 25,
    sort: { field: 'created_at', direction: 'desc' },
    include: ['account', 'owner', 'submissionsCount', 'overdueActivitiesCount'],
  },

  layout: {
    type: 'single-column',
    sections: [
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
            placeholder: 'Search jobs...',
            config: { icon: 'Search' },
          },
          {
            id: 'status',
            type: 'multiselect',
            path: 'filters.status',
            label: 'Status',
            options: [
              { value: 'draft', label: 'Draft' },
              { value: 'open', label: 'Open' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'filled', label: 'Filled' },
              { value: 'closed', label: 'Closed' },
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
            id: 'account',
            type: 'select',
            path: 'filters.accountId',
            label: 'Client',
            placeholder: 'All Clients',
            optionsSource: { type: 'entity', entityType: 'account' },
          },
          {
            id: 'owner',
            type: 'select',
            path: 'filters.ownerId',
            label: 'Owner',
            placeholder: 'All Owners',
            optionsSource: { type: 'entity', entityType: 'user', filter: { role: 'recruiter' } },
          },
          {
            id: 'my-jobs-only',
            type: 'boolean',
            path: 'filters.myJobsOnly',
            label: 'My Jobs Only',
          },
        ],
      },

      // Job Table
      {
        id: 'job-table',
        type: 'table',
        columns_config: [
          { 
            id: 'title', 
            header: 'Title', 
            path: 'title', 
            sortable: true, 
            width: '25%',
            config: { link: true, linkPath: '/employee/workspace/jobs/{{id}}' },
          },
          { 
            id: 'account', 
            header: 'Client', 
            path: 'account.name', 
            sortable: true,
            config: { link: true, linkPath: '/employee/workspace/accounts/{{account.id}}' },
          },
          { 
            id: 'status', 
            header: 'Status', 
            path: 'status', 
            type: 'job-status-badge',
            sortable: true,
          },
          { 
            id: 'priority', 
            header: 'Priority', 
            path: 'priority', 
            type: 'priority-badge',
            sortable: true,
          },
          { 
            id: 'location', 
            header: 'Location', 
            path: 'location',
          },
          { 
            id: 'type', 
            header: 'Type', 
            path: 'jobType',
          },
          { 
            id: 'submissions', 
            header: 'Subs', 
            path: 'submissionsCount',
            type: 'number',
            sortable: true,
          },
          { 
            id: 'activity-badge', 
            header: '', 
            path: 'overdueActivitiesCount',
            type: 'activity-overdue-badge',
            width: '40px',
          },
          { 
            id: 'days-open', 
            header: 'Days', 
            path: 'daysOpen',
            type: 'days-open-indicator',
            sortable: true,
          },
          { 
            id: 'owner', 
            header: 'Owner', 
            path: 'owner.name',
            type: 'user-avatar',
          },
          { 
            id: 'created', 
            header: 'Created', 
            path: 'createdAt', 
            type: 'date',
            sortable: true,
          },
        ],
        selectable: true,
        rowClick: { type: 'navigate', route: '/employee/workspace/jobs/{{id}}' },
        emptyState: {
          title: 'No jobs found',
          description: 'Create a new job to start recruiting',
          action: {
            label: 'Create Job',
            type: 'navigate',
            config: { type: 'navigate', route: '/employee/workspace/jobs/new' },
          },
        },
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'Create Job',
      type: 'navigate',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/jobs/new' },
    },
    {
      id: 'bulk-assign',
      label: 'Assign Owner',
      type: 'modal',
      icon: 'Users',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-assign' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'function',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'function', handler: 'exportJobs' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Jobs', active: true },
    ],
  },
};

// =====================================================
// CANDIDATE LIST SCREEN
// =====================================================
export const candidateListScreen: ScreenDefinition = {
  id: 'candidate-list',
  type: 'list',
  entityType: 'candidate',
  title: 'Candidates',
  icon: 'Users',

  dataSource: {
    type: 'list',
    entityType: 'candidate',
    pagination: true,
    pageSize: 25,
    searchFields: ['firstName', 'lastName', 'email', 'skills', 'professionalHeadline'],
    include: ['submissions', 'owner', 'lastActivityAt'],
  },

  layout: {
    type: 'single-column',
    sections: [
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
            placeholder: 'Search candidates...',
            config: { icon: 'Search' },
          },
          {
            id: 'status',
            type: 'multiselect',
            path: 'filters.status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'sourced', label: 'Sourced' },
              { value: 'screening', label: 'Screening' },
              { value: 'available', label: 'Available' },
              { value: 'placed', label: 'Placed' },
              { value: 'archived', label: 'Archived' },
            ],
          },
          {
            id: 'skills',
            type: 'tags',
            path: 'filters.skills',
            label: 'Skills',
            placeholder: 'Any skills',
            config: { suggestions: true },
          },
          {
            id: 'visa-status',
            type: 'multiselect',
            path: 'filters.visaStatus',
            label: 'Visa Status',
            options: [
              { value: 'us_citizen', label: 'US Citizen' },
              { value: 'green_card', label: 'Green Card' },
              { value: 'h1b', label: 'H-1B' },
              { value: 'opt', label: 'OPT' },
              { value: 'opt_stem', label: 'OPT STEM' },
              { value: 'tn_visa', label: 'TN Visa' },
              { value: 'l1_visa', label: 'L-1 Visa' },
              { value: 'other', label: 'Other' },
            ],
          },
          {
            id: 'location',
            type: 'text',
            path: 'filters.location',
            label: 'Location',
            placeholder: 'City or State',
          },
          {
            id: 'source',
            type: 'select',
            path: 'filters.source',
            label: 'Source',
            placeholder: 'All Sources',
            options: [
              { value: 'linkedin', label: 'LinkedIn' },
              { value: 'indeed', label: 'Indeed' },
              { value: 'dice', label: 'Dice' },
              { value: 'referral', label: 'Referral' },
              { value: 'website', label: 'Website' },
              { value: 'manual', label: 'Manual Entry' },
            ],
          },
          {
            id: 'owner',
            type: 'select',
            path: 'filters.ownerId',
            label: 'Owner',
            placeholder: 'All Owners',
            optionsSource: { type: 'entity', entityType: 'user', filter: { role: 'recruiter' } },
          },
          {
            id: 'stale-filter',
            type: 'boolean',
            path: 'filters.showStale',
            label: 'Show Stale Only',
            config: { helpText: 'No activity in 7+ days' },
          },
        ],
      },

      // Candidate Table
      {
        id: 'candidate-table',
        type: 'table',
        columns_config: [
          { 
            id: 'name', 
            header: 'Name', 
            path: 'fullName', 
            sortable: true,
            width: '20%',
            config: { 
              link: true, 
              linkPath: '/employee/workspace/candidates/{{id}}',
              avatar: true,
              avatarPath: 'avatarUrl',
            },
          },
          { 
            id: 'headline', 
            header: 'Title', 
            path: 'professionalHeadline',
            width: '20%',
          },
          { 
            id: 'status', 
            header: 'Status', 
            path: 'status', 
            type: 'candidate-status-badge',
            sortable: true,
          },
          { 
            id: 'location', 
            header: 'Location', 
            path: 'location',
          },
          { 
            id: 'visa', 
            header: 'Visa', 
            path: 'visaStatus', 
            type: 'visa-badge',
          },
          { 
            id: 'skills', 
            header: 'Skills', 
            path: 'primarySkills', 
            type: 'tags-preview',
            config: { maxTags: 3 },
          },
          { 
            id: 'submissions', 
            header: 'Subs', 
            path: 'submissionsCount',
            type: 'number',
            sortable: true,
          },
          { 
            id: 'last-activity', 
            header: 'Last Activity', 
            path: 'lastActivityAt',
            type: 'relative-time',
            sortable: true,
            config: { warnIfStale: 7 },
          },
          { 
            id: 'owner', 
            header: 'Owner', 
            path: 'owner.name',
            type: 'user-avatar',
          },
        ],
        selectable: true,
        rowClick: { type: 'navigate', route: '/employee/workspace/candidates/{{id}}' },
        emptyState: {
          title: 'No candidates found',
          description: 'Add candidates to build your talent pool',
          action: {
            label: 'Add Candidate',
            type: 'modal',
            config: { type: 'modal', modal: 'candidate-create' },
          },
        },
      },
    ],
  },

  actions: [
    {
      id: 'add',
      label: 'Add Candidate',
      type: 'modal',
      icon: 'UserPlus',
      variant: 'primary',
      config: { type: 'modal', modal: 'candidate-create' },
    },
    {
      id: 'import',
      label: 'Import',
      type: 'modal',
      icon: 'Upload',
      variant: 'default',
      config: { type: 'modal', modal: 'candidate-import' },
    },
    {
      id: 'bulk-submit',
      label: 'Submit to Job',
      type: 'modal',
      icon: 'Send',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-submit' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'bulk-assign',
      label: 'Assign Owner',
      type: 'modal',
      icon: 'Users',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-assign' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'function',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'function', handler: 'exportCandidates' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Candidates', active: true },
    ],
  },
};

// =====================================================
// SUBMISSION LIST SCREEN (Table View)
// =====================================================
export const submissionListScreen: ScreenDefinition = {
  id: 'submission-list',
  type: 'list',
  entityType: 'submission',
  title: 'Submissions',
  icon: 'Send',

  dataSource: {
    type: 'list',
    entityType: 'submission',
    pagination: true,
    pageSize: 25,
    sort: { field: 'submitted_at', direction: 'desc' },
    include: ['candidate', 'job', 'job.account', 'overdueActivitiesCount'],
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
            { id: 'table', label: 'Table', icon: 'Table' },
            { id: 'kanban', label: 'Pipeline', icon: 'Kanban' },
          ],
          activeView: 'table',
          onToggle: { type: 'navigate', routes: { table: '/employee/workspace/submissions', kanban: '/employee/workspace/submissions/pipeline' } },
        },
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
            placeholder: 'Search submissions...',
            config: { icon: 'Search' },
          },
          {
            id: 'status',
            type: 'multiselect',
            path: 'filters.status',
            label: 'Status',
            options: [
              { value: 'submitted', label: 'Submitted' },
              { value: 'client_review', label: 'Client Review' },
              { value: 'interview_scheduled', label: 'Interview Scheduled' },
              { value: 'interview_completed', label: 'Interview Completed' },
              { value: 'offer_pending', label: 'Offer Pending' },
              { value: 'placed', label: 'Placed' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'withdrawn', label: 'Withdrawn' },
            ],
          },
          {
            id: 'job',
            type: 'select',
            path: 'filters.jobId',
            label: 'Job',
            placeholder: 'All Jobs',
            optionsSource: { type: 'entity', entityType: 'job', filter: { status: { operator: 'in', value: ['open', 'urgent'] } } },
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
            id: 'date-range',
            type: 'date-range',
            path: 'filters.dateRange',
            label: 'Submitted',
            config: { presets: ['today', 'this_week', 'this_month', 'last_30_days'] },
          },
        ],
      },

      // Submission Table
      {
        id: 'submission-table',
        type: 'table',
        columns_config: [
          { 
            id: 'candidate', 
            header: 'Candidate', 
            path: 'candidate.fullName', 
            sortable: true,
            width: '18%',
            config: { 
              link: true, 
              linkPath: '/employee/workspace/candidates/{{candidate.id}}',
            },
          },
          { 
            id: 'job', 
            header: 'Job', 
            path: 'job.title', 
            sortable: true,
            width: '18%',
            config: { 
              link: true, 
              linkPath: '/employee/workspace/jobs/{{job.id}}',
            },
          },
          { 
            id: 'account', 
            header: 'Client', 
            path: 'job.account.name',
          },
          { 
            id: 'status', 
            header: 'Status', 
            path: 'status', 
            type: 'submission-status-badge',
            sortable: true,
          },
          { 
            id: 'priority', 
            header: 'Priority', 
            path: 'priority', 
            type: 'priority-badge',
          },
          { 
            id: 'submitted-at', 
            header: 'Submitted', 
            path: 'submittedAt', 
            type: 'date',
            sortable: true,
          },
          { 
            id: 'days-in-stage', 
            header: 'Days', 
            path: 'daysInCurrentStage',
            type: 'number',
            config: { warnThreshold: 3, criticalThreshold: 5 },
          },
          { 
            id: 'activity-badge', 
            header: '', 
            path: 'overdueActivitiesCount',
            type: 'activity-overdue-badge',
            width: '40px',
          },
          { 
            id: 'sla', 
            header: 'SLA', 
            path: 'slaStatus',
            type: 'sla-status-badge',
          },
        ],
        selectable: true,
        rowClick: { type: 'navigate', route: '/employee/workspace/submissions/{{id}}' },
        emptyState: {
          title: 'No submissions found',
          description: 'Submit candidates to jobs to track their progress',
        },
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'New Submission',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'submission-create' },
    },
    {
      id: 'bulk-update-status',
      label: 'Update Status',
      type: 'modal',
      icon: 'Edit',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-update-status' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'function',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'function', handler: 'exportSubmissions' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Submissions', active: true },
    ],
  },
};
