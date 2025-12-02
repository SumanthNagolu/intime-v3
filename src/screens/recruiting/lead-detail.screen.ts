/**
 * Lead Detail Screen
 *
 * Comprehensive lead view with qualification tracking, conversion options, and activities.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const leadDetailScreen: ScreenDefinition = {
  id: 'lead-detail',
  type: 'detail',
  entityType: 'lead',
  title: { type: 'template', template: '{{company}} - {{contactName}}' },
  subtitle: { type: 'field', path: 'status' },
  icon: 'UserPlus',

  dataSource: {
    type: 'entity',
    entityType: 'lead',
    entityId: { type: 'param', path: 'id' },
    include: ['activities', 'notes', 'owner'],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'lead-info',
      title: 'Lead Info',
      header: {
        type: 'icon',
        icon: 'UserPlus',
        size: 'lg',
      },
      fields: [
        {
          id: 'company',
          type: 'field',
          path: 'company',
          label: 'Company',
        },
        {
          id: 'contact-name',
          type: 'field',
          path: 'contactName',
          label: 'Contact',
        },
        {
          id: 'title',
          type: 'field',
          path: 'title',
          label: 'Title',
        },
        {
          id: 'divider-1',
          type: 'divider',
        },
        {
          id: 'status',
          type: 'field',
          path: 'status',
          label: 'Status',
          widget: 'LeadStatusBadge',
        },
        {
          id: 'source',
          type: 'field',
          path: 'source',
          label: 'Lead Source',
          widget: 'LeadSourceBadge',
        },
        {
          id: 'rating',
          type: 'field',
          path: 'rating',
          label: 'Rating',
          widget: 'StarRating',
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
          id: 'website',
          type: 'field',
          path: 'website',
          label: 'Website',
          widget: 'UrlDisplay',
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
          widget: 'RelativeTime',
        },
      ],
      footer: {
        type: 'quality-score',
        label: 'Lead Score',
        path: 'leadScore',
        maxValue: 100,
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
          config: { type: 'modal', modal: 'send-email', context: { leadId: { type: 'param', path: 'id' } } },
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
          // Lead Details
          {
            id: 'lead-details',
            type: 'info-card',
            title: 'Lead Details',
            columns: 2,
            fields: [
              { type: 'field', path: 'company', label: 'Company' },
              { type: 'field', path: 'contactName', label: 'Contact Name' },
              { type: 'field', path: 'title', label: 'Title' },
              { type: 'field', path: 'industry', label: 'Industry' },
              { type: 'field', path: 'numberOfEmployees', label: 'Employees' },
              { type: 'field', path: 'annualRevenue', label: 'Annual Revenue', widget: 'CurrencyDisplay' },
            ],
          },

          // Qualification Info
          {
            id: 'qualification',
            type: 'info-card',
            title: 'Qualification',
            columns: 2,
            fields: [
              { type: 'field', path: 'status', label: 'Status', widget: 'LeadStatusBadge' },
              { type: 'field', path: 'source', label: 'Source', widget: 'LeadSourceBadge' },
              { type: 'field', path: 'rating', label: 'Rating', widget: 'StarRating' },
              { type: 'field', path: 'leadScore', label: 'Lead Score' },
              { type: 'field', path: 'isConverted', label: 'Converted', widget: 'BooleanBadge' },
              { type: 'field', path: 'convertedDate', label: 'Converted Date', widget: 'DateDisplay' },
            ],
          },

          // Address
          {
            id: 'address',
            type: 'info-card',
            title: 'Address',
            fields: [
              { type: 'field', path: 'address', label: 'Address', widget: 'AddressDisplay' },
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
            config: { type: 'modal', modal: 'log-activity', context: { leadId: { type: 'param', path: 'id' } } },
          },
        ],
      },

      // ==========================================
      // NOTES TAB
      // ==========================================
      {
        id: 'notes',
        label: 'Notes',
        icon: 'StickyNote',
        badge: { type: 'count', path: 'notesCount' },
        sections: [
          {
            id: 'notes-list',
            type: 'list',
            dataSource: { type: 'related', relation: 'notes' },
            config: {
              itemComponent: 'NoteCard',
              sortBy: 'createdAt',
              sortOrder: 'desc',
            },
            emptyState: {
              title: 'No notes',
              description: 'Add notes to keep track of important information',
            },
          },
        ],
        actions: [
          {
            id: 'add-note',
            label: 'Add Note',
            type: 'modal',
            icon: 'Plus',
            variant: 'default',
            config: { type: 'modal', modal: 'add-note', context: { leadId: { type: 'param', path: 'id' } } },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'convert',
      label: 'Convert Lead',
      type: 'modal',
      icon: 'ArrowRightCircle',
      variant: 'primary',
      config: { type: 'modal', modal: 'convert-lead', context: { leadId: { type: 'param', path: 'id' } } },
      visible: {
        field: 'isConverted',
        operator: 'is_false',
      },
    },
    {
      id: 'edit',
      label: 'Edit Lead',
      type: 'navigate',
      icon: 'Edit',
      variant: 'default',
      config: { type: 'navigate', route: '/employee/workspace/leads/{{id}}/edit' },
    },
    {
      id: 'send-email',
      label: 'Send Email',
      type: 'modal',
      icon: 'Mail',
      variant: 'default',
      config: { type: 'modal', modal: 'send-email', context: { leadId: { type: 'param', path: 'id' } } },
    },
    {
      id: 'schedule-meeting',
      label: 'Schedule Meeting',
      type: 'modal',
      icon: 'Calendar',
      variant: 'default',
      config: { type: 'modal', modal: 'schedule-meeting', context: { leadId: { type: 'param', path: 'id' } } },
    },
    {
      id: 'delete',
      label: 'Delete',
      type: 'modal',
      icon: 'Trash2',
      variant: 'destructive',
      config: { type: 'modal', modal: 'lead-delete' },
      confirm: {
        title: 'Delete Lead',
        message: 'Are you sure you want to delete this lead? This action cannot be undone.',
        confirmLabel: 'Delete',
        destructive: true,
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Leads', route: '/employee/workspace/leads' },
      { label: { type: 'field', path: 'company' }, active: true },
    ],
  },
};

export default leadDetailScreen;
