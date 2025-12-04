/**
 * Submission Detail Screen
 * 
 * Detailed view of a candidate submission to a job.
 * Shows submission status, candidate info, rate details, activities, and interviews.
 * 
 * @see docs/specs/20-USER-ROLES/01-recruiter/04-submit-candidate.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const submissionDetailScreen: ScreenDefinition = {
  id: 'submission-detail',
  type: 'detail',
  entityType: 'submission',
  title: { type: 'template', template: '{{candidate.fullName}} → {{job.title}}' },
  subtitle: { type: 'field', path: 'job.account.name' },
  icon: 'Send',

  dataSource: {
    type: 'entity',
    entityType: 'submission',
    entityId: { type: 'param', path: 'id' },
    include: [
      'candidate',
      'candidate.skills',
      'job',
      'job.account',
      'interviews',
      'offers',
      'activities',
      'notes',
      'objectOwners',
    ],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'submission-overview',
      title: 'Overview',
      fields: [
        { 
          id: 'status',
          type: 'field', 
          path: 'status', 
          label: 'Status', 
          widget: 'SubmissionStatusBadge',
        },
        { 
          id: 'priority',
          type: 'field', 
          path: 'priority', 
          label: 'Priority', 
          widget: 'PriorityBadge',
        },
        { 
          id: 'submitted-at',
          type: 'field', 
          path: 'submittedAt', 
          label: 'Submitted',
          widget: 'DateTimeDisplay',
          config: { relative: true },
        },
        { 
          id: 'submitted-by',
          type: 'field', 
          path: 'submittedBy.name', 
          label: 'Submitted By',
          widget: 'UserAvatar',
        },
        {
          id: 'divider-1',
          type: 'divider',
        },
        { 
          id: 'candidate-name',
          type: 'field', 
          path: 'candidate.fullName', 
          label: 'Candidate',
          widget: 'EntityLink',
          config: { entityType: 'candidate', idPath: 'candidate.id' },
        },
        { 
          id: 'job-title',
          type: 'field', 
          path: 'job.title', 
          label: 'Job',
          widget: 'EntityLink',
          config: { entityType: 'job', idPath: 'job.id' },
        },
        { 
          id: 'account-name',
          type: 'field', 
          path: 'job.account.name', 
          label: 'Client',
          widget: 'EntityLink',
          config: { entityType: 'account', idPath: 'job.account.id' },
        },
        {
          id: 'divider-2',
          type: 'divider',
        },
        { 
          id: 'sla-status',
          type: 'field', 
          path: 'slaStatus', 
          label: 'SLA Status',
          widget: 'SLAStatusBadge',
        },
        { 
          id: 'days-in-stage',
          type: 'field', 
          path: 'daysInCurrentStage', 
          label: 'Days in Stage',
          widget: 'NumberDisplay',
        },
      ],
      // Quick Actions in Sidebar
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
          id: 'send-email',
          label: 'Send Email',
          type: 'modal',
          icon: 'Mail',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'send-email', context: 'submission' },
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
            title: 'Candidate Summary',
            collapsible: true,
            fields: [
              { type: 'field', path: 'candidate.professionalHeadline', label: 'Headline' },
              { type: 'field', path: 'candidate.email', label: 'Email', widget: 'EmailDisplay' },
              { type: 'field', path: 'candidate.phone', label: 'Phone', widget: 'PhoneDisplay' },
              { type: 'field', path: 'candidate.location', label: 'Location' },
              { type: 'field', path: 'candidate.skills', label: 'Skills', widget: 'TagList' },
              { type: 'field', path: 'candidate.yearsOfExperience', label: 'Experience', config: { suffix: ' years' } },
              { type: 'field', path: 'candidate.visaStatus', label: 'Visa Status', widget: 'VisaStatusBadge' },
            ],
            actions: [
              {
                id: 'view-candidate',
                label: 'View Full Profile',
                type: 'navigate',
                icon: 'ExternalLink',
                variant: 'ghost',
                size: 'sm',
                config: { 
                  type: 'navigate', 
                  route: '/employee/workspace/candidates/{{candidate.id}}',
                },
              },
            ],
          },

          // Rate Information
          {
            id: 'rate-info',
            type: 'input-set',
            title: 'Rate Information',
            inputSet: 'RateCardInputSet',
            readOnly: true,
            fields: [
              { id: 'billRate', path: 'billRate', label: 'Bill Rate' },
              { id: 'payRate', path: 'payRate', label: 'Pay Rate' },
              { id: 'margin', path: 'margin', label: 'Margin', format: 'percentage' },
              { id: 'overtimeRate', path: 'overtimeRate', label: 'OT Rate' },
            ],
            visible: {
              type: 'permission',
              permission: 'submission.rates.view',
            },
          },

          // Submission Notes
          {
            id: 'submission-notes',
            type: 'info-card',
            title: 'Submission Notes',
            fields: [
              { type: 'field', path: 'writeUp', label: 'Write-up', widget: 'RichTextDisplay' },
              { type: 'field', path: 'strengthsHighlight', label: 'Key Strengths', widget: 'TagList' },
              { type: 'field', path: 'concerns', label: 'Concerns', widget: 'TextDisplay' },
            ],
          },

          // Client Feedback
          {
            id: 'client-feedback',
            type: 'info-card',
            title: 'Client Feedback',
            fields: [
              { type: 'field', path: 'clientFeedback.status', label: 'Feedback Status', widget: 'StatusBadge' },
              { type: 'field', path: 'clientFeedback.rating', label: 'Rating', widget: 'StarRating' },
              { type: 'field', path: 'clientFeedback.comments', label: 'Comments', widget: 'TextDisplay' },
              { type: 'field', path: 'clientFeedback.receivedAt', label: 'Received', widget: 'DateTimeDisplay' },
            ],
            visible: {
              type: 'condition',
              condition: { field: 'clientFeedback', operator: 'exists' },
            },
          },

          // RACI Assignment
          {
            id: 'raci-section',
            type: 'input-set',
            title: 'Ownership (RACI)',
            inputSet: 'RACIInputSet',
            readOnly: true,
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
        badge: { type: 'count', path: 'interviews.length' },
        sections: [
          {
            id: 'interview-list',
            type: 'table',
            title: 'Scheduled Interviews',
            dataSource: { type: 'related', relation: 'interviews' },
            columns_config: [
              { id: 'type', header: 'Type', path: 'type', type: 'interview-type-badge' },
              { id: 'scheduledAt', header: 'Date/Time', path: 'scheduledAt', type: 'datetime' },
              { id: 'interviewers', header: 'Interviewers', path: 'interviewers', type: 'user-list' },
              { id: 'location', header: 'Location', path: 'location' },
              { id: 'status', header: 'Status', path: 'status', type: 'status-badge' },
              { id: 'feedback', header: 'Feedback', path: 'feedbackReceived', type: 'boolean-indicator' },
            ],
            actions: [
              {
                id: 'add-feedback',
                label: 'Add Feedback',
                type: 'modal',
                icon: 'MessageSquare',
                config: { type: 'modal', modal: 'interview-feedback' },
              },
            ],
            emptyState: {
              title: 'No interviews scheduled',
              description: 'Schedule an interview when the client is ready',
              action: {
                label: 'Schedule Interview',
                type: 'modal',
                config: { type: 'modal', modal: 'interview-schedule' },
              },
            },
          },
        ],
        actions: [
          {
            id: 'schedule-interview',
            label: 'Schedule Interview',
            type: 'modal',
            icon: 'Calendar',
            variant: 'default',
            config: { type: 'modal', modal: 'interview-schedule' },
          },
        ],
      },

      // ==========================================
      // OFFERS TAB
      // ==========================================
      {
        id: 'offers',
        label: 'Offers',
        icon: 'FileText',
        badge: { type: 'count', path: 'offers.length' },
        sections: [
          {
            id: 'offer-list',
            type: 'table',
            title: 'Offers',
            dataSource: { type: 'related', relation: 'offers' },
            columns_config: [
              { id: 'offerNumber', header: 'Offer #', path: 'offerNumber' },
              { id: 'createdAt', header: 'Date', path: 'createdAt', type: 'date' },
              { id: 'salary', header: 'Rate/Salary', path: 'compensationSummary' },
              { id: 'startDate', header: 'Start Date', path: 'startDate', type: 'date' },
              { id: 'status', header: 'Status', path: 'status', type: 'offer-status-badge' },
              { id: 'expiresAt', header: 'Expires', path: 'expiresAt', type: 'datetime', config: { relative: true } },
            ],
            emptyState: {
              title: 'No offers yet',
              description: 'Create an offer after successful interviews',
              action: {
                label: 'Create Offer',
                type: 'modal',
                config: { type: 'modal', modal: 'offer-create' },
                visible: {
                  type: 'condition',
                  condition: { field: 'status', operator: 'in', value: ['interview_completed', 'offer_pending'] },
                },
              },
            },
          },
        ],
        actions: [
          {
            id: 'create-offer',
            label: 'Create Offer',
            type: 'modal',
            icon: 'FilePlus',
            variant: 'default',
            config: { type: 'modal', modal: 'offer-create' },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'in', value: ['interview_completed', 'offer_pending'] },
            },
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
        badge: { type: 'count', path: 'activities.length' },
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
              { id: 'uploadedBy', header: 'By', path: 'uploadedBy.name' },
            ],
            actions: [
              { id: 'download', label: 'Download', icon: 'Download', type: 'function', config: { handler: 'downloadDocument' } },
              { id: 'preview', label: 'Preview', icon: 'Eye', type: 'modal', config: { modal: 'document-preview' } },
            ],
          },
        ],
        actions: [
          {
            id: 'upload-document',
            label: 'Upload Document',
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
      label: 'Edit Submission',
      type: 'navigate',
      icon: 'Edit',
      variant: 'default',
      config: { 
        type: 'navigate', 
        route: '/employee/workspace/submissions/{{id}}/edit',
      },
    },
    {
      id: 'advance-status',
      label: 'Advance Status',
      type: 'modal',
      icon: 'ArrowRight',
      variant: 'primary',
      config: { type: 'modal', modal: 'submission-advance-status' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'nin', value: ['placed', 'rejected', 'withdrawn'] },
      },
    },
    {
      id: 'schedule-interview',
      label: 'Schedule Interview',
      type: 'modal',
      icon: 'Calendar',
      variant: 'default',
      config: { type: 'modal', modal: 'interview-schedule' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'in', value: ['client_review', 'submitted'] },
      },
    },
    {
      id: 'create-offer',
      label: 'Create Offer',
      type: 'modal',
      icon: 'FileText',
      variant: 'default',
      config: { type: 'modal', modal: 'offer-create' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'interview_completed' },
      },
    },
    {
      id: 'reject',
      label: 'Reject',
      type: 'modal',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'modal', modal: 'submission-reject' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'nin', value: ['placed', 'rejected', 'withdrawn'] },
      },
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      type: 'modal',
      icon: 'Undo',
      variant: 'ghost',
      config: { type: 'modal', modal: 'submission-withdraw' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'nin', value: ['placed', 'rejected', 'withdrawn'] },
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Submissions', route: '/employee/workspace/submissions' },
      { label: { type: 'field', path: 'candidate.fullName' }, active: true },
    ],
  },
};

export default submissionDetailScreen;

