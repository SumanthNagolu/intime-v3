/**
 * Candidate Detail Screen
 * 
 * Comprehensive candidate profile view with:
 * - Contact info sidebar
 * - Profile overview, skills, work history
 * - Submissions history
 * - Activity timeline
 * - Documents (resumes, certifications)
 * 
 * @see docs/specs/20-USER-ROLES/01-recruiter/03-source-candidates.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const candidateDetailScreen: ScreenDefinition = {
  id: 'candidate-detail',
  type: 'detail',
  entityType: 'candidate',
  title: { type: 'field', path: 'fullName' },
  subtitle: { type: 'field', path: 'professionalHeadline' },
  icon: 'User',

  dataSource: {
    type: 'entity',
    entityType: 'candidate',
    entityId: { type: 'param', path: 'id' },
    include: [
      'skills',
      'workHistory',
      'education',
      'submissions',
      'submissions.job',
      'activities',
      'documents',
      'objectOwners',
    ],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'contact-info',
      title: 'Contact Info',
      // Avatar at top
      header: {
        type: 'avatar',
        path: 'avatarUrl',
        fallbackPath: 'initials',
        size: 'lg',
      },
      fields: [
        { 
          id: 'status',
          type: 'field', 
          path: 'status', 
          label: 'Status', 
          widget: 'CandidateStatusBadge',
        },
        { 
          id: 'source',
          type: 'field', 
          path: 'source', 
          label: 'Source', 
          widget: 'SourceBadge',
        },
        {
          id: 'divider-1',
          type: 'divider',
        },
        { 
          id: 'email',
          type: 'field', 
          path: 'email', 
          label: 'Email', 
          widget: 'EmailDisplay',
          config: { copyable: true },
        },
        { 
          id: 'phone',
          type: 'field', 
          path: 'phone', 
          label: 'Phone', 
          widget: 'PhoneDisplay',
          config: { copyable: true, clickToCall: true },
        },
        { 
          id: 'location',
          type: 'field', 
          path: 'location', 
          label: 'Location',
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
          id: 'linkedin',
          type: 'field', 
          path: 'linkedinUrl', 
          label: 'LinkedIn', 
          widget: 'SocialLink',
          config: { platform: 'linkedin' },
        },
        { 
          id: 'github',
          type: 'field', 
          path: 'githubUrl', 
          label: 'GitHub', 
          widget: 'SocialLink',
          config: { platform: 'github' },
        },
        { 
          id: 'portfolio',
          type: 'field', 
          path: 'portfolioUrl', 
          label: 'Portfolio', 
          widget: 'LinkDisplay',
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
          id: 'added-at',
          type: 'field', 
          path: 'createdAt', 
          label: 'Added',
          widget: 'DateTimeDisplay',
          config: { relative: true },
        },
        { 
          id: 'last-activity',
          type: 'field', 
          path: 'lastActivityAt', 
          label: 'Last Activity',
          widget: 'DateTimeDisplay',
          config: { relative: true, warnIfStale: 7 },
        },
      ],
      // Quick Actions in Sidebar
      actions: [
        {
          id: 'call',
          label: 'Call',
          type: 'function',
          icon: 'Phone',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'function', handler: 'initiateCall', params: { phonePath: 'phone' } },
        },
        {
          id: 'email',
          label: 'Email',
          type: 'modal',
          icon: 'Mail',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'send-email', context: 'candidate' },
        },
        {
          id: 'log-activity',
          label: 'Log',
          type: 'modal',
          icon: 'Plus',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'log-activity' },
        },
      ],
    },
    tabs: [
      // ==========================================
      // OVERVIEW TAB
      // ==========================================
      {
        id: 'overview',
        label: 'Overview',
        icon: 'User',
        sections: [
          // Professional Summary
          {
            id: 'professional-summary',
            type: 'info-card',
            title: 'Professional Summary',
            fields: [
              { type: 'field', path: 'professionalHeadline', label: 'Headline' },
              { type: 'field', path: 'summary', label: 'Summary', widget: 'TextDisplay' },
              { type: 'field', path: 'yearsOfExperience', label: 'Experience', config: { suffix: ' years' } },
              { type: 'field', path: 'currentCompany', label: 'Current Company' },
              { type: 'field', path: 'currentTitle', label: 'Current Title' },
            ],
          },

          // Skills
          {
            id: 'skills',
            type: 'info-card',
            title: 'Skills',
            fields: [
              { 
                type: 'field', 
                path: 'primarySkills', 
                label: 'Primary Skills', 
                widget: 'SkillTagList',
                config: { variant: 'primary' },
              },
              { 
                type: 'field', 
                path: 'secondarySkills', 
                label: 'Secondary Skills', 
                widget: 'SkillTagList',
                config: { variant: 'secondary' },
              },
              { 
                type: 'field', 
                path: 'certifications', 
                label: 'Certifications', 
                widget: 'CertificationList',
              },
            ],
          },

          // Availability & Work Authorization
          {
            id: 'availability',
            type: 'info-card',
            title: 'Availability & Work Auth',
            columns: 2,
            fields: [
              { 
                type: 'field', 
                path: 'availableDate', 
                label: 'Available From', 
                widget: 'DateDisplay',
              },
              { 
                type: 'field', 
                path: 'noticePeriod', 
                label: 'Notice Period',
                config: { suffix: ' days' },
              },
              { 
                type: 'field', 
                path: 'visaStatus', 
                label: 'Visa Status', 
                widget: 'VisaStatusBadge',
              },
              { 
                type: 'field', 
                path: 'visaExpiry', 
                label: 'Visa Expiry', 
                widget: 'DateDisplay',
                config: { warnIfWithin: 90 },
              },
              { 
                type: 'field', 
                path: 'workAuthorization', 
                label: 'Work Authorization', 
                widget: 'WorkAuthBadge',
              },
              { 
                type: 'field', 
                path: 'sponsorshipRequired', 
                label: 'Needs Sponsorship', 
                widget: 'BooleanDisplay',
              },
            ],
          },

          // Compensation Expectations
          {
            id: 'compensation',
            type: 'input-set',
            title: 'Compensation Expectations',
            inputSet: 'CompensationInputSet',
            readOnly: true,
            visible: {
              type: 'permission',
              permission: 'candidate.compensation.view',
            },
          },

          // Preferences
          {
            id: 'preferences',
            type: 'info-card',
            title: 'Work Preferences',
            columns: 2,
            fields: [
              { type: 'field', path: 'preferredLocations', label: 'Preferred Locations', widget: 'TagList' },
              { type: 'field', path: 'remotePreference', label: 'Remote Preference', widget: 'RemoteTypeBadge' },
              { type: 'field', path: 'travelWillingness', label: 'Travel', config: { suffix: '%' } },
              { type: 'field', path: 'relocationWilling', label: 'Willing to Relocate', widget: 'BooleanDisplay' },
            ],
          },
        ],
      },

      // ==========================================
      // EXPERIENCE TAB
      // ==========================================
      {
        id: 'experience',
        label: 'Experience',
        icon: 'Briefcase',
        sections: [
          // Work History
          {
            id: 'work-history',
            type: 'custom',
            title: 'Work History',
            component: 'WorkHistoryTimeline',
            componentProps: {
              dataPath: 'workHistory',
              showDuration: true,
              showGaps: true,
            },
          },

          // Education
          {
            id: 'education',
            type: 'table',
            title: 'Education',
            dataSource: { type: 'related', relation: 'education' },
            columns_config: [
              { id: 'degree', header: 'Degree', path: 'degree' },
              { id: 'field', header: 'Field of Study', path: 'fieldOfStudy' },
              { id: 'institution', header: 'Institution', path: 'institution' },
              { id: 'year', header: 'Year', path: 'graduationYear' },
            ],
            emptyState: {
              title: 'No education records',
              action: {
                label: 'Add Education',
                type: 'modal',
                config: { type: 'modal', modal: 'add-education' },
              },
            },
          },
        ],
      },

      // ==========================================
      // SUBMISSIONS TAB
      // ==========================================
      {
        id: 'submissions',
        label: 'Submissions',
        icon: 'Send',
        badge: { type: 'count', path: 'submissions.length' },
        sections: [
          {
            id: 'submissions-list',
            type: 'table',
            title: 'Submission History',
            dataSource: { 
              type: 'related', 
              relation: 'submissions',
              sort: { field: 'submittedAt', direction: 'desc' },
            },
            columns_config: [
              { 
                id: 'job', 
                header: 'Job', 
                path: 'job.title',
                config: { link: true, linkPath: '/employee/workspace/jobs/{{job.id}}' },
              },
              { id: 'client', header: 'Client', path: 'job.account.name' },
              { id: 'status', header: 'Status', path: 'status', type: 'submission-status-badge' },
              { id: 'submittedAt', header: 'Submitted', path: 'submittedAt', type: 'date' },
              { id: 'lastUpdate', header: 'Last Update', path: 'updatedAt', type: 'datetime', config: { relative: true } },
              { id: 'outcome', header: 'Outcome', path: 'outcome', type: 'outcome-badge' },
            ],
            rowClick: { type: 'navigate', route: '/employee/workspace/submissions/{{id}}' },
            emptyState: {
              title: 'No submissions yet',
              description: 'Submit this candidate to a job to start tracking their progress',
            },
          },
        ],
        actions: [
          {
            id: 'submit-to-job',
            label: 'Submit to Job',
            type: 'modal',
            icon: 'Send',
            variant: 'primary',
            config: { type: 'modal', modal: 'submission-create' },
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
              quickLogTypes: ['call', 'email', 'meeting', 'note', 'screen'],
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
        badge: { type: 'count', path: 'documents.length' },
        sections: [
          // Resumes
          {
            id: 'resumes',
            type: 'list',
            title: 'Resumes',
            dataSource: { 
              type: 'related', 
              relation: 'documents',
              filter: { documentType: 'resume' },
            },
            columns_config: [
              { id: 'icon', header: '', path: 'fileType', type: 'file-icon', width: '40px' },
              { id: 'name', header: 'Name', path: 'fileName' },
              { id: 'version', header: 'Version', path: 'version', type: 'badge' },
              { id: 'uploadedAt', header: 'Uploaded', path: 'uploadedAt', type: 'datetime', config: { relative: true } },
              { id: 'isPrimary', header: '', path: 'isPrimary', type: 'primary-badge' },
            ],
            actions: [
              { id: 'download', label: 'Download', icon: 'Download', type: 'function', config: { handler: 'downloadDocument' } },
              { id: 'preview', label: 'Preview', icon: 'Eye', type: 'modal', config: { modal: 'document-preview' } },
              { id: 'set-primary', label: 'Set as Primary', icon: 'Star', type: 'function', config: { handler: 'setAsPrimary' } },
            ],
          },

          // Other Documents
          {
            id: 'other-docs',
            type: 'list',
            title: 'Other Documents',
            collapsible: true,
            dataSource: { 
              type: 'related', 
              relation: 'documents',
              filter: { documentType: { operator: 'ne', value: 'resume' } },
            },
            columns_config: [
              { id: 'icon', header: '', path: 'fileType', type: 'file-icon', width: '40px' },
              { id: 'name', header: 'Name', path: 'fileName' },
              { id: 'type', header: 'Type', path: 'documentType', type: 'document-type-badge' },
              { id: 'uploadedAt', header: 'Uploaded', path: 'uploadedAt', type: 'datetime', config: { relative: true } },
            ],
          },
        ],
        actions: [
          {
            id: 'upload-resume',
            label: 'Upload Resume',
            type: 'modal',
            icon: 'FileText',
            variant: 'default',
            config: { type: 'modal', modal: 'upload-resume' },
          },
          {
            id: 'upload-document',
            label: 'Upload Other',
            type: 'modal',
            icon: 'Upload',
            variant: 'ghost',
            config: { type: 'modal', modal: 'document-upload' },
          },
        ],
      },

      // ==========================================
      // OWNERSHIP TAB
      // ==========================================
      {
        id: 'ownership',
        label: 'Ownership',
        icon: 'Shield',
        sections: [
          {
            id: 'raci-assignments',
            type: 'input-set',
            title: 'RACI Assignments',
            inputSet: 'RACIInputSet',
            readOnly: true,
          },
          {
            id: 'ownership-history',
            type: 'timeline',
            title: 'Ownership History',
            collapsible: true,
            collapsed: true,
            dataSource: { type: 'related', relation: 'ownershipHistory' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'edit',
      label: 'Edit Profile',
      type: 'navigate',
      icon: 'Edit',
      variant: 'default',
      config: { 
        type: 'navigate', 
        route: '/employee/workspace/candidates/{{id}}/edit',
      },
    },
    {
      id: 'submit-to-job',
      label: 'Submit to Job',
      type: 'modal',
      icon: 'Send',
      variant: 'primary',
      config: { type: 'modal', modal: 'submission-create' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'in', value: ['active', 'available', 'sourced'] },
      },
    },
    {
      id: 'log-activity',
      label: 'Log Activity',
      type: 'modal',
      icon: 'Plus',
      variant: 'default',
      config: { type: 'modal', modal: 'log-activity' },
    },
    {
      id: 'add-to-hotlist',
      label: 'Add to Hotlist',
      type: 'modal',
      icon: 'Star',
      variant: 'ghost',
      config: { type: 'modal', modal: 'add-to-hotlist' },
    },
    {
      id: 'archive',
      label: 'Archive',
      type: 'workflow',
      icon: 'Archive',
      variant: 'ghost',
      config: { type: 'workflow', workflow: 'archive-candidate' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'ne', value: 'archived' },
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Candidates', route: '/employee/workspace/candidates' },
      { label: { type: 'field', path: 'fullName' }, active: true },
    ],
  },

  keyboard_shortcuts: [
    { key: 'e', action: 'edit', description: 'Edit profile' },
    { key: 's', action: 'submitToJob', description: 'Submit to job' },
    { key: 'l', action: 'logActivity', description: 'Log activity' },
    { key: 'c', action: 'call', description: 'Call candidate' },
  ],
};

export default candidateDetailScreen;
