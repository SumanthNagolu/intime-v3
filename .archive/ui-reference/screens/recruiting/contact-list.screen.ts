/**
 * Contact List Screen
 *
 * List of client contacts with filtering and quick actions.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const contactListScreen: ScreenDefinition = {
  id: 'contact-list',
  type: 'list',
  entityType: 'contact',
  title: 'Contacts',
  icon: 'Users',

  dataSource: {
    type: 'list',
    entityType: 'contact',
    pagination: true,
    pageSize: 25,
    sort: { field: 'lastName', direction: 'asc' },
    include: ['account', 'lastContactAt', 'activitiesCount'],
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
            placeholder: 'Search contacts...',
            config: { icon: 'Search' },
          },
          {
            id: 'account',
            type: 'select',
            path: 'filters.accountId',
            label: 'Account',
            placeholder: 'All Accounts',
            optionsSource: { type: 'entity', entityType: 'account' },
            config: { searchable: true },
          },
          {
            id: 'role',
            type: 'multiselect',
            path: 'filters.role',
            label: 'Role',
            options: [
              { value: 'hiring_manager', label: 'Hiring Manager' },
              { value: 'hr', label: 'HR' },
              { value: 'recruiter', label: 'Recruiter' },
              { value: 'executive', label: 'Executive' },
              { value: 'procurement', label: 'Procurement' },
              { value: 'technical', label: 'Technical' },
              { value: 'other', label: 'Other' },
            ],
          },
          {
            id: 'last-contacted',
            type: 'select',
            path: 'filters.lastContacted',
            label: 'Last Contacted',
            options: [
              { value: 'today', label: 'Today' },
              { value: 'this_week', label: 'This Week' },
              { value: 'this_month', label: 'This Month' },
              { value: 'over_30_days', label: '30+ Days Ago' },
              { value: 'never', label: 'Never Contacted' },
            ],
          },
          {
            id: 'is-primary',
            type: 'boolean',
            path: 'filters.isPrimary',
            label: 'Primary Only',
          },
        ],
      },

      // Contact Table
      {
        id: 'contact-table',
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
              linkPath: '/employee/workspace/contacts/{{id}}',
              avatar: true,
              avatarPath: 'avatarUrl',
            },
          },
          {
            id: 'title',
            header: 'Title',
            path: 'jobTitle',
            sortable: true,
          },
          {
            id: 'account',
            header: 'Account',
            path: 'account.name',
            sortable: true,
            config: {
              link: true,
              linkPath: '/employee/workspace/accounts/{{account.id}}',
            },
          },
          {
            id: 'email',
            header: 'Email',
            path: 'email',
            type: 'email',
          },
          {
            id: 'phone',
            header: 'Phone',
            path: 'phone',
            type: 'phone',
          },
          {
            id: 'department',
            header: 'Department',
            path: 'department',
          },
          {
            id: 'role',
            header: 'Role',
            path: 'role',
            type: 'contact-role-badge',
          },
          {
            id: 'is-primary',
            header: '',
            path: 'isPrimary',
            type: 'primary-badge',
            width: '40px',
          },
          {
            id: 'last-contact',
            header: 'Last Contact',
            path: 'lastContactAt',
            type: 'datetime',
            sortable: true,
            config: { relative: true, warnIfStale: 14 },
          },
        ],
        selectable: true,
        rowClick: { type: 'navigate', route: '/employee/workspace/contacts/{{id}}' },
        emptyState: {
          title: 'No contacts found',
          description: 'Add contacts from client accounts',
          action: {
            label: 'Add Contact',
            type: 'modal',
            config: { type: 'modal', modal: 'contact-create' },
          },
        },
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'Add Contact',
      type: 'modal',
      icon: 'UserPlus',
      variant: 'primary',
      config: { type: 'modal', modal: 'contact-create' },
    },
    {
      id: 'import',
      label: 'Import',
      type: 'modal',
      icon: 'Upload',
      variant: 'default',
      config: { type: 'modal', modal: 'contact-import' },
    },
    {
      id: 'bulk-email',
      label: 'Send Email',
      type: 'modal',
      icon: 'Mail',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-email' },
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
      config: { type: 'function', handler: 'exportContacts' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Contacts', active: true },
    ],
  },
};

export default contactListScreen;
