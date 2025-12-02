/**
 * Bench Consultant Detail Screen
 * 
 * Detailed consultant profile with:
 * - Profile overview, skills, rate
 * - Visa/Immigration status
 * - Submission history
 * - Marketing profile
 * - Activity timeline
 * 
 * @see docs/specs/20-USER-ROLES/02-bench-sales/07-update-consultant.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const consultantDetailScreen: ScreenDefinition = {
  id: 'bench-consultant-detail',
  type: 'detail',
  entityType: 'talent',
  title: { type: 'field', path: 'fullName' },
  subtitle: { type: 'field', path: 'title' },
  icon: 'User',

  dataSource: {
    type: 'entity',
    entityType: 'talent',
    entityId: { type: 'param', path: 'id' },
    include: [
      'skills',
      'visaDetails',
      'workHistory',
      'submissions',
      'submissions.vendor',
      'submissions.externalJob',
      'marketingProfiles',
      'hotlists',
      'activities',
      'documents',
      'objectOwners',
    ],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'consultant-overview',
      title: 'Overview',
      header: {
        type: 'avatar',
        path: 'avatarUrl',
        fallbackPath: 'initials',
        size: 'lg',
        badge: { type: 'field', path: 'benchStatus', variant: 'status' },
      },
      fields: [
        { 
          id: 'bench-status',
          type: 'field', 
          path: 'benchStatus', 
          label: 'Bench Status', 
          widget: 'BenchStatusBadge',
        },
        { 
          id: 'days-on-bench',
          type: 'field', 
          path: 'daysOnBench', 
          label: 'Days on Bench',
          widget: 'DaysOnBenchIndicator',
          config: { thresholds: [15, 30, 60, 90] },
        },
        { 
          id: 'priority',
          type: 'field', 
          path: 'priority', 
          label: 'Priority', 
          widget: 'PriorityBadge',
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
          id: 'visa-status',
          type: 'field', 
          path: 'visaStatus', 
          label: 'Visa Status', 
          widget: 'VisaStatusBadge',
        },
        { 
          id: 'visa-expiry',
          type: 'field', 
          path: 'visaExpiry', 
          label: 'Visa Expiry',
          widget: 'DateDisplay',
          config: { warnIfWithin: 90, criticalIfWithin: 30 },
        },
        {
          id: 'divider-3',
          type: 'divider',
        },
        { 
          id: 'rate',
          type: 'field', 
          path: 'rate', 
          label: 'Rate',
          widget: 'CurrencyDisplay',
          config: { suffix: '/hr' },
        },
        { 
          id: 'contract-type',
          type: 'field', 
          path: 'preferredContractType', 
          label: 'Contract Type',
          widget: 'ContractTypeBadge',
        },
        {
          id: 'divider-4',
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
          id: 'bench-start',
          type: 'field', 
          path: 'benchStartDate', 
          label: 'Bench Start',
          widget: 'DateDisplay',
        },
        { 
          id: 'last-contact',
          type: 'field', 
          path: 'lastContactAt', 
          label: 'Last Contact',
          widget: 'DateTimeDisplay',
          config: { relative: true, warnIfStale: 4 },
        },
      ],
      // Quick stats
      footer: {
        type: 'metrics-row',
        metrics: [
          { label: 'Active Subs', value: { type: 'field', path: 'activeSubmissionsCount' }, icon: 'Send' },
          { label: 'Interviews', value: { type: 'field', path: 'interviewsCount' }, icon: 'Video' },
          { label: 'Activities', value: { type: 'field', path: 'activitiesCount' }, icon: 'Activity' },
        ],
      },
      // Quick Actions
      actions: [
        {
          id: 'call',
          label: 'Call',
          type: 'custom',
          icon: 'Phone',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'custom', handler: 'initiateCall' },
        },
        {
          id: 'email',
          label: 'Email',
          type: 'modal',
          icon: 'Mail',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'send-email' },
        },
        {
          id: 'log',
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
      // PROFILE TAB
      // ==========================================
      {
        id: 'profile',
        label: 'Profile',
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
              { type: 'field', path: 'lastEmployer', label: 'Last Employer' },
              { type: 'field', path: 'lastProject', label: 'Last Project' },
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

          // Rate Card
          {
            id: 'rate-card',
            type: 'input-set',
            title: 'Rate Card',
            inputSet: 'RateCardInputSet',
            readOnly: true,
            fields: [
              { id: 'c2cRate', path: 'c2cRate', label: 'C2C Rate' },
              { id: 'w2Rate', path: 'w2Rate', label: 'W2 Rate' },
              { id: '1099Rate', path: '1099Rate', label: '1099 Rate' },
              { id: 'minimumRate', path: 'minimumRate', label: 'Minimum Acceptable' },
            ],
          },

          // Work Preferences
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
              { type: 'field', path: 'preferredContractTypes', label: 'Contract Types', widget: 'TagList' },
              { type: 'field', path: 'availableFrom', label: 'Available From', widget: 'DateDisplay' },
            ],
          },
        ],
      },

      // ==========================================
      // IMMIGRATION TAB
      // ==========================================
      {
        id: 'immigration',
        label: 'Immigration',
        icon: 'Globe',
        badge: { 
          type: 'visa-alert-level', 
          path: 'visaAlertLevel',
        },
        sections: [
          // Visa Status Overview
          {
            id: 'visa-status',
            type: 'custom',
            title: 'Visa Status',
            component: 'VisaStatusCard',
            componentProps: {
              visaType: { type: 'field', path: 'visaStatus' },
              expiryDate: { type: 'field', path: 'visaExpiry' },
              alertLevel: { type: 'field', path: 'visaAlertLevel' },
              daysUntilExpiry: { type: 'field', path: 'daysUntilVisaExpiry' },
              canWorkUS: { type: 'field', path: 'canWorkUS' },
              canWorkCanada: { type: 'field', path: 'canWorkCanada' },
              sponsorshipRequired: { type: 'field', path: 'sponsorshipRequired' },
            },
          },

          // Visa Details
          {
            id: 'visa-details',
            type: 'input-set',
            title: 'Visa Details',
            inputSet: 'VisaDetailsInputSet',
            readOnly: true,
          },

          // Immigration Case
          {
            id: 'immigration-case',
            type: 'custom',
            title: 'Immigration Case',
            component: 'ImmigrationCaseCard',
            componentProps: {
              caseId: { type: 'field', path: 'immigrationCase.id' },
              showTimeline: true,
              showDocuments: true,
            },
            visible: {
              type: 'condition',
              condition: { field: 'immigrationCase', operator: 'exists' },
            },
          },

          // Immigration History
          {
            id: 'immigration-history',
            type: 'timeline',
            title: 'Immigration History',
            collapsible: true,
            collapsed: true,
            dataSource: { type: 'related', relation: 'immigrationHistory' },
          },
        ],
        actions: [
          {
            id: 'contact-hr',
            label: 'Contact HR',
            type: 'modal',
            icon: 'Mail',
            variant: 'default',
            config: { type: 'modal', modal: 'contact-hr' },
          },
          {
            id: 'flag-unavailable',
            label: 'Flag as Unavailable',
            type: 'workflow',
            icon: 'AlertTriangle',
            variant: 'destructive',
            config: { type: 'workflow', workflow: 'flag-consultant-unavailable' },
            visible: {
              type: 'condition',
              condition: { field: 'visaAlertLevel', operator: 'in', value: ['red', 'black'] },
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
        badge: { type: 'count', path: 'activeSubmissionsCount' },
        sections: [
          {
            id: 'submission-pipeline',
            type: 'custom',
            title: 'Active Submissions',
            component: 'ConsultantSubmissionPipeline',
            componentProps: {
              consultantId: { type: 'param', path: 'id' },
              showVendorInfo: true,
              showRateInfo: true,
            },
          },
          {
            id: 'submission-history',
            type: 'table',
            title: 'Submission History',
            collapsible: true,
            dataSource: { 
              type: 'related', 
              relation: 'submissions',
              sort: { field: 'submittedAt', direction: 'desc' },
            },
            columns_config: [
              { id: 'vendor', header: 'Vendor', path: 'vendor.name' },
              { id: 'job', header: 'Job', path: 'externalJob.title' },
              { id: 'client', header: 'Client', path: 'externalJob.client' },
              { id: 'status', header: 'Status', path: 'status', type: 'submission-status-badge' },
              { id: 'rate', header: 'Rate', path: 'submittedRate', type: 'currency' },
              { id: 'submittedAt', header: 'Submitted', path: 'submittedAt', type: 'date' },
              { id: 'outcome', header: 'Outcome', path: 'outcome', type: 'outcome-badge' },
            ],
          },
        ],
        actions: [
          {
            id: 'new-submission',
            label: 'New Submission',
            type: 'modal',
            icon: 'Send',
            variant: 'primary',
            config: { type: 'modal', modal: 'bench-submission-create' },
          },
        ],
      },

      // ==========================================
      // MARKETING TAB
      // ==========================================
      {
        id: 'marketing',
        label: 'Marketing',
        icon: 'Megaphone',
        sections: [
          // Marketing Profile
          {
            id: 'marketing-profile',
            type: 'custom',
            title: 'Marketing Profile',
            component: 'MarketingProfileEditor',
            componentProps: {
              consultantId: { type: 'param', path: 'id' },
              showPreview: true,
              editMode: false,
            },
          },

          // Hotlist History
          {
            id: 'hotlist-history',
            type: 'table',
            title: 'Hotlist Appearances',
            dataSource: { type: 'related', relation: 'hotlists' },
            columns_config: [
              { id: 'name', header: 'Hotlist', path: 'name' },
              { id: 'sentAt', header: 'Sent', path: 'sentAt', type: 'date' },
              { id: 'recipients', header: 'Recipients', path: 'recipientCount', type: 'number' },
              { id: 'opened', header: 'Opened', path: 'openedPercent', config: { suffix: '%' } },
              { id: 'clicked', header: 'Clicked', path: 'clickedPercent', config: { suffix: '%' } },
              { id: 'submissions', header: 'Subs Generated', path: 'submissionsGenerated', type: 'number' },
            ],
            emptyState: {
              title: 'Not included in any hotlists yet',
              description: 'Add this consultant to a hotlist to start marketing',
            },
          },
        ],
        actions: [
          {
            id: 'add-to-hotlist',
            label: 'Add to Hotlist',
            type: 'modal',
            icon: 'Plus',
            variant: 'primary',
            config: { type: 'modal', modal: 'add-to-hotlist' },
          },
          {
            id: 'edit-marketing-profile',
            label: 'Edit Marketing Profile',
            type: 'modal',
            icon: 'Edit',
            variant: 'default',
            config: { type: 'modal', modal: 'edit-marketing-profile' },
          },
          {
            id: 'generate-one-pager',
            label: 'Generate One-Pager',
            type: 'custom',
            icon: 'FileText',
            variant: 'ghost',
            config: { type: 'custom', handler: 'generateOnePager' },
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
          {
            id: 'work-history',
            type: 'custom',
            title: 'Work History',
            component: 'WorkHistoryTimeline',
            componentProps: {
              dataPath: 'workHistory',
              showDuration: true,
              showSkills: true,
            },
          },
          {
            id: 'education',
            type: 'table',
            title: 'Education',
            collapsible: true,
            dataSource: { type: 'related', relation: 'education' },
            columns_config: [
              { id: 'degree', header: 'Degree', path: 'degree' },
              { id: 'field', header: 'Field', path: 'fieldOfStudy' },
              { id: 'institution', header: 'Institution', path: 'institution' },
              { id: 'year', header: 'Year', path: 'graduationYear' },
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
        badge: { type: 'count', path: 'documents.length' },
        sections: [
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
              { id: 'download', label: 'Download', icon: 'Download', type: 'custom', config: { handler: 'downloadDocument' } },
              { id: 'preview', label: 'Preview', icon: 'Eye', type: 'modal', config: { modal: 'document-preview' } },
            ],
          },
          {
            id: 'visa-docs',
            type: 'list',
            title: 'Visa Documents',
            dataSource: { 
              type: 'related', 
              relation: 'documents',
              filter: { documentType: { operator: 'in', value: ['visa', 'ead', 'i797', 'passport'] } },
            },
            columns_config: [
              { id: 'icon', header: '', path: 'fileType', type: 'file-icon', width: '40px' },
              { id: 'name', header: 'Name', path: 'fileName' },
              { id: 'type', header: 'Type', path: 'documentType', type: 'document-type-badge' },
              { id: 'expiry', header: 'Expiry', path: 'expiryDate', type: 'date', config: { warnIfWithin: 90 } },
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
            id: 'upload-visa-doc',
            label: 'Upload Visa Doc',
            type: 'modal',
            icon: 'Upload',
            variant: 'ghost',
            config: { type: 'modal', modal: 'upload-visa-document' },
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
        route: '/employee/workspace/bench/consultants/{{id}}/edit',
      },
    },
    {
      id: 'submit',
      label: 'Submit to Job',
      type: 'modal',
      icon: 'Send',
      variant: 'primary',
      config: { type: 'modal', modal: 'bench-submission-create' },
    },
    {
      id: 'add-to-hotlist',
      label: 'Add to Hotlist',
      type: 'modal',
      icon: 'FileText',
      variant: 'default',
      config: { type: 'modal', modal: 'add-to-hotlist' },
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
      id: 'mark-placed',
      label: 'Mark as Placed',
      type: 'workflow',
      icon: 'CheckCircle',
      variant: 'ghost',
      config: { type: 'workflow', workflow: 'mark-consultant-placed' },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'on_bench' },
      },
    },
    {
      id: 'archive',
      label: 'Archive',
      type: 'workflow',
      icon: 'Archive',
      variant: 'ghost',
      config: { type: 'workflow', workflow: 'archive-consultant' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/workspace/bench' },
      { label: 'Consultants', route: '/employee/workspace/bench/consultants' },
      { label: { type: 'field', path: 'fullName' }, active: true },
    ],
  },
};

export default consultantDetailScreen;

