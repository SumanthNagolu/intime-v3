/**
 * Job Detail Screen
 * 
 * Comprehensive job view with:
 * - Key info sidebar
 * - Job details, requirements, compensation
 * - Candidate pipeline (Kanban)
 * - Team/RACI assignments
 * - Activity timeline
 * - Documents
 * 
 * @see docs/specs/20-USER-ROLES/01-recruiter/02-create-job.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const jobDetailScreen: ScreenDefinition = {
  id: 'job-detail',
  type: 'detail',
  entityType: 'job',
  title: { type: 'field', path: 'title' },
  subtitle: { type: 'field', path: 'account.name' },
  icon: 'Briefcase',

  dataSource: {
    type: 'entity',
    entityType: 'job',
    entityId: { type: 'param', path: 'id' },
    include: [
      'account',
      'account.contacts',
      'submissions',
      'interviews',
      'activities',
      'objectOwners',
      'requirements',
    ],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'key-info',
      title: 'Key Info',
      fields: [
        { 
          id: 'status',
          type: 'field', 
          path: 'status', 
          label: 'Status', 
          widget: 'JobStatusBadge',
        },
        { 
          id: 'priority',
          type: 'field', 
          path: 'priority', 
          label: 'Priority', 
          widget: 'PriorityBadge',
        },
        { 
          id: 'job-number',
          type: 'field', 
          path: 'jobNumber', 
          label: 'Job #',
        },
        {
          id: 'divider-1',
          type: 'divider',
        },
        { 
          id: 'account',
          type: 'field', 
          path: 'account.name', 
          label: 'Client',
          widget: 'EntityLink',
          config: { entityType: 'account', idPath: 'account.id' },
        },
        { 
          id: 'hiring-manager',
          type: 'field', 
          path: 'hiringManager.name', 
          label: 'Hiring Manager',
        },
        { 
          id: 'location',
          type: 'field', 
          path: 'location', 
          label: 'Location',
        },
        { 
          id: 'remote-type',
          type: 'field', 
          path: 'remoteType', 
          label: 'Work Type',
          widget: 'RemoteTypeBadge',
        },
        {
          id: 'divider-2',
          type: 'divider',
        },
        { 
          id: 'job-type',
          type: 'field', 
          path: 'jobType', 
          label: 'Type',
        },
        { 
          id: 'rate-range',
          type: 'field', 
          path: 'rateRange', 
          label: 'Rate Range',
          widget: 'CurrencyRange',
        },
        { 
          id: 'duration',
          type: 'field', 
          path: 'duration', 
          label: 'Duration',
        },
        {
          id: 'divider-3',
          type: 'divider',
        },
        { 
          id: 'owner',
          type: 'field', 
          path: 'owner.name', 
          label: 'Owner',
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
        { 
          id: 'days-open',
          type: 'field', 
          path: 'daysOpen', 
          label: 'Days Open',
          widget: 'DaysOpenIndicator',
          config: { warningThreshold: 14, criticalThreshold: 30 },
        },
      ],
      // Quick stats
      footer: {
        type: 'metrics-row',
        metrics: [
          { label: 'Submissions', value: { type: 'field', path: 'submissionsCount' }, icon: 'Send' },
          { label: 'Interviews', value: { type: 'field', path: 'interviewsCount' }, icon: 'Video' },
          { label: 'Activities', value: { type: 'field', path: 'activitiesCount' }, icon: 'Activity' },
        ],
      },
      // Quick Actions
      actions: [
        {
          id: 'log-call',
          label: 'Log Call',
          type: 'modal',
          icon: 'Phone',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'log-activity', preset: { activityType: 'call' } },
        },
        {
          id: 'log-email',
          label: 'Log Email',
          type: 'modal',
          icon: 'Mail',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'log-activity', preset: { activityType: 'email' } },
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
          // Job Summary
          {
            id: 'job-summary',
            type: 'info-card',
            title: 'Job Summary',
            fields: [
              { type: 'field', path: 'title', label: 'Title' },
              { type: 'field', path: 'department', label: 'Department' },
              { type: 'field', path: 'level', label: 'Level' },
              { type: 'field', path: 'headcount', label: 'Headcount' },
              { type: 'field', path: 'targetStartDate', label: 'Target Start', widget: 'DateDisplay' },
            ],
          },

          // Requirements
          {
            id: 'requirements',
            type: 'info-card',
            title: 'Requirements',
            fields: [
              { 
                type: 'field', 
                path: 'requiredSkills', 
                label: 'Required Skills', 
                widget: 'TagList',
                config: { variant: 'required' },
              },
              { 
                type: 'field', 
                path: 'niceToHaveSkills', 
                label: 'Nice to Have', 
                widget: 'TagList',
                config: { variant: 'optional' },
              },
              { type: 'field', path: 'yearsExperienceMin', label: 'Min Experience', config: { suffix: ' years' } },
              { type: 'field', path: 'educationRequired', label: 'Education' },
              { type: 'field', path: 'visaRequirements', label: 'Visa Requirements', widget: 'VisaRequirementsList' },
            ],
          },

          // Description
          {
            id: 'description',
            type: 'info-card',
            title: 'Description',
            fields: [
              { type: 'field', path: 'description', label: '', widget: 'RichTextDisplay' },
            ],
          },

          // Compensation (permission-gated)
          {
            id: 'compensation',
            type: 'input-set',
            title: 'Compensation',
            inputSet: 'CompensationInputSet',
            readOnly: true,
            visible: {
              type: 'permission',
              permission: 'job.compensation.view',
            },
          },
        ],
      },

      // ==========================================
      // PIPELINE TAB
      // ==========================================
      {
        id: 'pipeline',
        label: 'Pipeline',
        icon: 'Kanban',
        badge: { type: 'count', path: 'submissionsCount' },
        sections: [
          {
            id: 'pipeline-kanban',
            type: 'custom',
            component: 'JobPipelineBoard',
            componentProps: {
              jobId: { type: 'param', path: 'id' },
              showQuickSubmit: true,
              allowDragDrop: true,
            },
          },
        ],
        actions: [
          {
            id: 'submit-candidate',
            label: 'Submit Candidate',
            type: 'modal',
            icon: 'UserPlus',
            variant: 'primary',
            config: { type: 'modal', modal: 'candidate-quick-submit', context: { jobId: { type: 'param', path: 'id' } } },
          },
        ],
      },

      // ==========================================
      // INTERVIEWS TAB
      // ==========================================
      {
        id: 'interviews',
        label: 'Interviews',
        icon: 'Video',
        badge: { type: 'count', path: 'upcomingInterviewsCount' },
        sections: [
          {
            id: 'upcoming-interviews',
            type: 'table',
            title: 'Upcoming Interviews',
            dataSource: { 
              type: 'related', 
              relation: 'interviews',
              filter: { status: { operator: 'in', value: ['scheduled', 'confirmed'] } },
              sort: { field: 'scheduledAt', direction: 'asc' },
            },
            columns_config: [
              { id: 'candidate', header: 'Candidate', path: 'submission.candidate.fullName' },
              { id: 'type', header: 'Type', path: 'type', type: 'interview-type-badge' },
              { id: 'scheduledAt', header: 'Date/Time', path: 'scheduledAt', type: 'datetime' },
              { id: 'interviewers', header: 'Interviewers', path: 'interviewers', type: 'user-list' },
              { id: 'status', header: 'Status', path: 'status', type: 'status-badge' },
            ],
            emptyState: {
              title: 'No upcoming interviews',
              description: 'Interviews will appear here when scheduled',
            },
          },
          {
            id: 'past-interviews',
            type: 'table',
            title: 'Past Interviews',
            collapsible: true,
            collapsed: true,
            dataSource: { 
              type: 'related', 
              relation: 'interviews',
              filter: { status: { operator: 'in', value: ['completed', 'no_show', 'cancelled'] } },
              sort: { field: 'scheduledAt', direction: 'desc' },
            },
            columns_config: [
              { id: 'candidate', header: 'Candidate', path: 'submission.candidate.fullName' },
              { id: 'type', header: 'Type', path: 'type', type: 'interview-type-badge' },
              { id: 'scheduledAt', header: 'Date', path: 'scheduledAt', type: 'date' },
              { id: 'status', header: 'Status', path: 'status', type: 'status-badge' },
              { id: 'feedback', header: 'Feedback', path: 'feedbackSummary', type: 'truncated-text' },
            ],
          },
        ],
      },

      // ==========================================
      // TEAM TAB
      // ==========================================
      {
        id: 'team',
        label: 'Team',
        icon: 'Users',
        sections: [
          // RACI Assignments
          {
            id: 'raci-assignments',
            type: 'input-set',
            title: 'Ownership (RACI)',
            inputSet: 'RACIInputSet',
            readOnly: true,
          },

          // Client Contacts
          {
            id: 'client-contacts',
            type: 'table',
            title: 'Client Contacts',
            dataSource: { type: 'related', relation: 'account.contacts' },
            columns_config: [
              { id: 'name', header: 'Name', path: 'fullName' },
              { id: 'title', header: 'Title', path: 'jobTitle' },
              { id: 'email', header: 'Email', path: 'email', type: 'email' },
              { id: 'phone', header: 'Phone', path: 'phone', type: 'phone' },
              { id: 'isPrimary', header: '', path: 'isPrimary', type: 'primary-badge' },
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
        badge: { 
          type: 'overdue-count', 
          path: 'overdueActivitiesCount',
          variant: 'warning',
        },
        sections: [
          {
            id: 'activity-timeline',
            type: 'timeline',
            dataSource: { type: 'related', relation: 'activities' },
            config: {
              showEvents: true,
              showNotes: true,
              groupByDate: true,
              allowQuickLog: true,
              quickLogTypes: ['call', 'email', 'meeting', 'note'],
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

      // ==========================================
      // DOCUMENTS TAB
      // ==========================================
      {
        id: 'documents',
        label: 'Documents',
        icon: 'Files',
        sections: [
          {
            id: 'document-list',
            type: 'list',
            dataSource: { type: 'related', relation: 'documents' },
            columns_config: [
              { id: 'icon', header: '', path: 'fileType', type: 'file-icon', width: '40px' },
              { id: 'name', header: 'Name', path: 'fileName' },
              { id: 'type', header: 'Type', path: 'documentType', type: 'document-type-badge' },
              { id: 'uploadedAt', header: 'Uploaded', path: 'uploadedAt', type: 'datetime', config: { relative: true } },
            ],
            emptyState: {
              title: 'No documents',
              description: 'Upload job descriptions, requirements docs, etc.',
            },
          },
        ],
        actions: [
          {
            id: 'upload-document',
            label: 'Upload',
            type: 'modal',
            icon: 'Upload',
            variant: 'default',
            config: { type: 'modal', modal: 'document-upload' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'edit',
      label: 'Edit Job',
      type: 'navigate',
      icon: 'Edit',
      variant: 'default',
      config: { 
        type: 'navigate', 
        route: '/employee/workspace/jobs/{{id}}/edit',
      },
    },
    {
      id: 'submit-candidate',
      label: 'Submit Candidate',
      type: 'modal',
      icon: 'UserPlus',
      variant: 'primary',
      config: { type: 'modal', modal: 'candidate-quick-submit' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'in', value: ['open', 'urgent'] },
      },
    },
    {
      id: 'publish',
      label: 'Publish',
      type: 'workflow',
      icon: 'Globe',
      variant: 'default',
      config: { type: 'workflow', workflow: 'publish-job' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'draft' },
      },
    },
    {
      id: 'put-on-hold',
      label: 'Put on Hold',
      type: 'workflow',
      icon: 'Pause',
      variant: 'ghost',
      config: { type: 'workflow', workflow: 'hold-job' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'in', value: ['open', 'urgent'] },
      },
    },
    {
      id: 'close-job',
      label: 'Close Job',
      type: 'modal',
      icon: 'XCircle',
      variant: 'destructive',
      config: { type: 'modal', modal: 'close-job' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'nin', value: ['closed', 'filled', 'cancelled'] },
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Jobs', route: '/employee/workspace/jobs' },
      { label: { type: 'field', path: 'title' }, active: true },
    ],
  },

  keyboard_shortcuts: [
    { key: 'e', action: 'edit', description: 'Edit job' },
    { key: 's', action: 'submitCandidate', description: 'Submit candidate' },
    { key: 'l', action: 'logActivity', description: 'Log activity' },
  ],
};

export default jobDetailScreen;
