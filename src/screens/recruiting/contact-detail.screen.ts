/**
 * Contact Detail Screen
 *
 * Comprehensive contact view with communication history, related entities, and activities.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const contactDetailScreen: ScreenDefinition = {
  id: 'contact-detail',
  type: 'detail',
  entityType: 'contact',
  title: { type: 'template', template: '{{firstName}} {{lastName}}' },
  subtitle: { type: 'field', path: 'jobTitle' },
  icon: 'User',

  dataSource: {
    type: 'entity',
    entityType: 'contact',
    entityId: { type: 'param', path: 'id' },
    include: ['account', 'activities', 'deals', 'jobs', 'notes'],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'contact-info',
      title: 'Contact Info',
      header: {
        type: 'avatar',
        path: 'avatarUrl',
        fallbackPath: 'initials',
        size: 'lg',
      },
      fields: [
        {
          id: 'full-name',
          type: 'field',
          path: 'fullName',
          label: 'Name',
        },
        {
          id: 'job-title',
          type: 'field',
          path: 'jobTitle',
          label: 'Title',
        },
        {
          id: 'department',
          type: 'field',
          path: 'department',
          label: 'Department',
        },
        {
          id: 'divider-1',
          type: 'divider',
        },
        {
          id: 'account',
          type: 'field',
          path: 'account.name',
          label: 'Company',
          widget: 'EntityLink',
          config: { entityType: 'account', idPath: 'account.id' },
        },
        {
          id: 'role',
          type: 'field',
          path: 'role',
          label: 'Role',
          widget: 'ContactRoleBadge',
        },
        {
          id: 'is-primary',
          type: 'field',
          path: 'isPrimary',
          label: 'Primary Contact',
          widget: 'BooleanBadge',
        },
        {
          id: 'divider-2',
          type: 'divider',
        },
        {
          id: 'email',
          type: 'field',
          path: 'email',
          label: 'Email',
          widget: 'EmailDisplay',
        },
        {
          id: 'phone',
          type: 'field',
          path: 'phone',
          label: 'Phone',
          widget: 'PhoneDisplay',
        },
        {
          id: 'mobile',
          type: 'field',
          path: 'mobile',
          label: 'Mobile',
          widget: 'PhoneDisplay',
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
          id: 'divider-3',
          type: 'divider',
        },
        {
          id: 'last-contacted',
          type: 'field',
          path: 'lastContactedAt',
          label: 'Last Contacted',
          widget: 'RelativeTime',
        },
        {
          id: 'owner',
          type: 'field',
          path: 'owner.name',
          label: 'Owner',
          widget: 'UserAvatar',
        },
      ],
      footer: {
        type: 'metrics-row',
        metrics: [
          { label: 'Deals', value: { type: 'field', path: 'dealsCount' }, icon: 'DollarSign' },
          { label: 'Jobs', value: { type: 'field', path: 'jobsCount' }, icon: 'Briefcase' },
          { label: 'Activities', value: { type: 'field', path: 'activitiesCount' }, icon: 'Activity' },
        ],
      },
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
          config: { type: 'modal', modal: 'send-email', context: { contactId: { type: 'param', path: 'id' } } },
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
        icon: 'Info',
        sections: [
          // Contact Details
          {
            id: 'contact-details',
            type: 'info-card',
            title: 'Contact Details',
            columns: 2,
            fields: [
              { type: 'field', path: 'firstName', label: 'First Name' },
              { type: 'field', path: 'lastName', label: 'Last Name' },
              { type: 'field', path: 'jobTitle', label: 'Job Title' },
              { type: 'field', path: 'department', label: 'Department' },
              { type: 'field', path: 'reportsTo', label: 'Reports To' },
              { type: 'field', path: 'assistant', label: 'Assistant' },
            ],
          },

          // Communication Preferences
          {
            id: 'communication-preferences',
            type: 'info-card',
            title: 'Communication Preferences',
            columns: 2,
            fields: [
              { type: 'field', path: 'preferredContactMethod', label: 'Preferred Method' },
              { type: 'field', path: 'bestTimeToCall', label: 'Best Time to Call' },
              { type: 'field', path: 'timezone', label: 'Timezone' },
              { type: 'field', path: 'doNotCall', label: 'Do Not Call', widget: 'BooleanBadge' },
              { type: 'field', path: 'doNotEmail', label: 'Do Not Email', widget: 'BooleanBadge' },
            ],
          },

          // Address
          {
            id: 'address',
            type: 'info-card',
            title: 'Address',
            fields: [
              { type: 'field', path: 'mailingAddress', label: 'Mailing Address', widget: 'AddressDisplay' },
              { type: 'field', path: 'otherAddress', label: 'Other Address', widget: 'AddressDisplay' },
            ],
          },

          // Notes
          {
            id: 'notes',
            type: 'info-card',
            title: 'Notes',
            fields: [
              { type: 'field', path: 'notes', label: '', widget: 'RichTextDisplay' },
            ],
          },
        ],
      },

      // ==========================================
      // DEALS TAB
      // ==========================================
      {
        id: 'deals',
        label: 'Deals',
        icon: 'DollarSign',
        badge: { type: 'count', path: 'dealsCount' },
        sections: [
          {
            id: 'deals-list',
            type: 'table',
            title: 'Associated Deals',
            dataSource: { type: 'related', relation: 'deals' },
            columns_config: [
              { id: 'name', header: 'Deal', path: 'name' },
              { id: 'value', header: 'Value', path: 'value', type: 'currency' },
              { id: 'stage', header: 'Stage', path: 'stage', type: 'deal-stage-badge' },
              { id: 'expectedClose', header: 'Expected Close', path: 'expectedCloseDate', type: 'date' },
              { id: 'owner', header: 'Owner', path: 'owner.name', type: 'user-avatar' },
            ],
            rowClick: { type: 'navigate', route: '/employee/workspace/deals/{{id}}' },
            emptyState: {
              title: 'No deals',
              description: 'This contact is not associated with any deals',
            },
          },
        ],
        actions: [
          {
            id: 'create-deal',
            label: 'Create Deal',
            type: 'modal',
            icon: 'Plus',
            variant: 'primary',
            config: { type: 'modal', modal: 'deal-create', context: { contactId: { type: 'param', path: 'id' } } },
          },
        ],
      },

      // ==========================================
      // JOBS TAB
      // ==========================================
      {
        id: 'jobs',
        label: 'Jobs',
        icon: 'Briefcase',
        badge: { type: 'count', path: 'jobsCount' },
        sections: [
          {
            id: 'jobs-list',
            type: 'table',
            title: 'Associated Jobs',
            dataSource: { type: 'related', relation: 'jobs' },
            columns_config: [
              { id: 'title', header: 'Job Title', path: 'title' },
              { id: 'status', header: 'Status', path: 'status', type: 'job-status-badge' },
              { id: 'submissionsCount', header: 'Submissions', path: 'submissionsCount', type: 'number' },
              { id: 'createdAt', header: 'Created', path: 'createdAt', type: 'date' },
            ],
            rowClick: { type: 'navigate', route: '/employee/workspace/jobs/{{id}}' },
            emptyState: {
              title: 'No jobs',
              description: 'This contact is not associated with any jobs',
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
              showEmails: true,
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
            config: { type: 'modal', modal: 'log-activity', context: { contactId: { type: 'param', path: 'id' } } },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'edit',
      label: 'Edit Contact',
      type: 'navigate',
      icon: 'Edit',
      variant: 'default',
      config: { type: 'navigate', route: '/employee/workspace/contacts/{{id}}/edit' },
    },
    {
      id: 'send-email',
      label: 'Send Email',
      type: 'modal',
      icon: 'Mail',
      variant: 'primary',
      config: { type: 'modal', modal: 'send-email', context: { contactId: { type: 'param', path: 'id' } } },
    },
    {
      id: 'schedule-meeting',
      label: 'Schedule Meeting',
      type: 'modal',
      icon: 'Calendar',
      variant: 'default',
      config: { type: 'modal', modal: 'schedule-meeting', context: { contactId: { type: 'param', path: 'id' } } },
    },
    {
      id: 'delete',
      label: 'Delete',
      type: 'modal',
      icon: 'Trash2',
      variant: 'destructive',
      config: { type: 'modal', modal: 'contact-delete' },
      confirm: {
        title: 'Delete Contact',
        message: 'Are you sure you want to delete this contact? This action cannot be undone.',
        confirmLabel: 'Delete',
        destructive: true,
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Contacts', route: '/employee/workspace/contacts' },
      { label: { type: 'field', path: 'fullName' }, active: true },
    ],
  },
};

export default contactDetailScreen;
