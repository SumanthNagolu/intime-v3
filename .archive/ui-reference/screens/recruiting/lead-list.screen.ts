/**
 * Lead List Screen
 *
 * List of business leads for recruiters doing BD work.
 * Per 00-OVERVIEW.md: recruiters have "Partner Model" role combining BD + Recruiting.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const leadListScreen: ScreenDefinition = {
  id: 'lead-list',
  type: 'list',
  entityType: 'lead',
  title: 'Leads',
  icon: 'Target',

  dataSource: {
    type: 'list',
    entityType: 'lead',
    pagination: true,
    pageSize: 25,
    sort: { field: 'created_at', direction: 'desc' },
    include: ['contact', 'owner', 'lastActivityAt'],
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
            placeholder: 'Search leads...',
            config: { icon: 'Search' },
          },
          {
            id: 'status',
            type: 'multiselect',
            path: 'filters.status',
            label: 'Status',
            options: [
              { value: 'new', label: 'New' },
              { value: 'contacted', label: 'Contacted' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'unqualified', label: 'Unqualified' },
              { value: 'converted', label: 'Converted' },
            ],
          },
          {
            id: 'source',
            type: 'multiselect',
            path: 'filters.source',
            label: 'Source',
            options: [
              { value: 'website', label: 'Website' },
              { value: 'linkedin', label: 'LinkedIn' },
              { value: 'referral', label: 'Referral' },
              { value: 'cold_outreach', label: 'Cold Outreach' },
              { value: 'event', label: 'Event' },
              { value: 'advertisement', label: 'Advertisement' },
              { value: 'other', label: 'Other' },
            ],
          },
          {
            id: 'industry',
            type: 'select',
            path: 'filters.industry',
            label: 'Industry',
            placeholder: 'All Industries',
            optionsSource: { type: 'static', source: 'industries' },
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
            id: 'my-leads-only',
            type: 'boolean',
            path: 'filters.myLeadsOnly',
            label: 'My Leads',
          },
        ],
      },

      // Lead Table
      {
        id: 'lead-table',
        type: 'table',
        columns_config: [
          {
            id: 'company-name',
            header: 'Company',
            path: 'companyName',
            sortable: true,
            width: '20%',
            config: {
              link: true,
              linkPath: '/employee/workspace/leads/{{id}}',
            },
          },
          {
            id: 'contact-name',
            header: 'Contact',
            path: 'contactName',
            sortable: true,
          },
          {
            id: 'title',
            header: 'Title',
            path: 'contactTitle',
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
            id: 'source',
            header: 'Source',
            path: 'source',
            type: 'source-badge',
          },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'lead-status-badge',
            sortable: true,
          },
          {
            id: 'qualification-score',
            header: 'Score',
            path: 'qualificationScore',
            type: 'score-indicator',
            config: { max: 100 },
          },
          {
            id: 'owner',
            header: 'Owner',
            path: 'owner.name',
            type: 'user-avatar',
          },
          {
            id: 'last-activity',
            header: 'Last Activity',
            path: 'lastActivityAt',
            type: 'datetime',
            sortable: true,
            config: { relative: true, warnIfStale: 7 },
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
        rowClick: { type: 'navigate', route: '/employee/workspace/leads/{{id}}' },
        emptyState: {
          title: 'No leads found',
          description: 'Create leads from prospecting or inbound inquiries',
          action: {
            label: 'Create Lead',
            type: 'modal',
            config: { type: 'modal', modal: 'lead-create' },
          },
        },
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'Create Lead',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'lead-create' },
    },
    {
      id: 'import',
      label: 'Import',
      type: 'modal',
      icon: 'Upload',
      variant: 'default',
      config: { type: 'modal', modal: 'lead-import' },
    },
    {
      id: 'bulk-qualify',
      label: 'Qualify',
      type: 'modal',
      icon: 'CheckCircle',
      variant: 'default',
      config: { type: 'modal', modal: 'lead-bulk-qualify' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'bulk-convert',
      label: 'Convert to Deal',
      type: 'modal',
      icon: 'ArrowRight',
      variant: 'default',
      config: { type: 'modal', modal: 'lead-convert' },
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
      config: { type: 'function', handler: 'exportLeads' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Leads', active: true },
    ],
  },
};

export default leadListScreen;
