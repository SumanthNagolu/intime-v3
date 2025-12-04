/**
 * Deal List Screen
 *
 * Pipeline view of sales deals for recruiters doing BD work.
 * Per 00-OVERVIEW.md: recruiters have "Partner Model" role combining BD + Recruiting.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const dealListScreen: ScreenDefinition = {
  id: 'deal-list',
  type: 'list',
  entityType: 'deal',
  title: 'Deals',
  icon: 'TrendingUp',

  dataSource: {
    type: 'list',
    entityType: 'deal',
    pagination: true,
    pageSize: 25,
    sort: { field: 'expected_close_date', direction: 'asc' },
    include: ['account', 'owner', 'lastActivityAt'],
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
            { id: 'pipeline', label: 'Pipeline', icon: 'Kanban' },
          ],
          activeView: 'table',
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
            placeholder: 'Search deals...',
            config: { icon: 'Search' },
          },
          {
            id: 'stage',
            type: 'multiselect',
            path: 'filters.stage',
            label: 'Stage',
            options: [
              { value: 'discovery', label: 'Discovery' },
              { value: 'proposal', label: 'Proposal' },
              { value: 'negotiation', label: 'Negotiation' },
              { value: 'closed_won', label: 'Closed Won' },
              { value: 'closed_lost', label: 'Closed Lost' },
            ],
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
            id: 'close-date',
            type: 'select',
            path: 'filters.closeDate',
            label: 'Expected Close',
            options: [
              { value: 'this_week', label: 'This Week' },
              { value: 'this_month', label: 'This Month' },
              { value: 'this_quarter', label: 'This Quarter' },
              { value: 'overdue', label: 'Overdue' },
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
            id: 'my-deals-only',
            type: 'boolean',
            path: 'filters.myDealsOnly',
            label: 'My Deals',
          },
        ],
      },

      // Pipeline Summary (always visible)
      {
        id: 'pipeline-summary',
        type: 'metrics-grid',
        columns: 5,
        fields: [
          {
            id: 'discovery',
            label: 'Discovery',
            type: 'currency',
            path: 'pipelineSummary.discovery',
            config: { count: { type: 'field', path: 'pipelineSummary.discoveryCount' } },
          },
          {
            id: 'proposal',
            label: 'Proposal',
            type: 'currency',
            path: 'pipelineSummary.proposal',
            config: { count: { type: 'field', path: 'pipelineSummary.proposalCount' } },
          },
          {
            id: 'negotiation',
            label: 'Negotiation',
            type: 'currency',
            path: 'pipelineSummary.negotiation',
            config: { count: { type: 'field', path: 'pipelineSummary.negotiationCount' } },
          },
          {
            id: 'total-pipeline',
            label: 'Total Pipeline',
            type: 'currency',
            path: 'pipelineSummary.totalValue',
          },
          {
            id: 'weighted',
            label: 'Weighted',
            type: 'currency',
            path: 'pipelineSummary.weightedValue',
          },
        ],
      },

      // Table View
      {
        id: 'deal-table',
        type: 'table',
        visible: { field: 'activeView', operator: 'neq', value: 'pipeline' },
        columns_config: [
          {
            id: 'name',
            header: 'Deal Name',
            path: 'name',
            sortable: true,
            width: '20%',
            config: {
              link: true,
              linkPath: '/employee/workspace/deals/{{id}}',
            },
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
            id: 'value',
            header: 'Value',
            path: 'value',
            type: 'currency',
            sortable: true,
          },
          {
            id: 'stage',
            header: 'Stage',
            path: 'stage',
            type: 'deal-stage-badge',
            sortable: true,
          },
          {
            id: 'probability',
            header: 'Probability',
            path: 'probability',
            type: 'percentage',
            sortable: true,
          },
          {
            id: 'expected-close',
            header: 'Expected Close',
            path: 'expectedCloseDate',
            type: 'date',
            sortable: true,
            config: { warnIfOverdue: true },
          },
          {
            id: 'days-in-stage',
            header: 'Days',
            path: 'daysInStage',
            type: 'number',
            config: { warnThreshold: 14 },
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
        ],
        selectable: true,
        rowClick: { type: 'navigate', route: '/employee/workspace/deals/{{id}}' },
        emptyState: {
          title: 'No deals found',
          description: 'Create deals from qualified leads',
          action: {
            label: 'Create Deal',
            type: 'modal',
            config: { type: 'modal', modal: 'deal-create' },
          },
        },
      },

      // Pipeline/Kanban View
      {
        id: 'deal-pipeline',
        type: 'custom',
        component: 'KanbanBoard',
        visible: { field: 'activeView', operator: 'eq', value: 'pipeline' },
        componentProps: {
          entityType: 'deal',
          statusField: 'stage',
          columns: [
            { id: 'discovery', title: 'Discovery', status: 'discovery', color: 'blue' },
            { id: 'proposal', title: 'Proposal', status: 'proposal', color: 'purple' },
            { id: 'negotiation', title: 'Negotiation', status: 'negotiation', color: 'amber' },
            { id: 'closed_won', title: 'Closed Won', status: 'closed_won', color: 'green' },
            { id: 'closed_lost', title: 'Closed Lost', status: 'closed_lost', color: 'red' },
          ],
          cardTemplate: {
            title: { type: 'field', path: 'name' },
            subtitle: { type: 'field', path: 'account.name' },
            fields: [
              { path: 'value', type: 'currency', icon: 'DollarSign' },
              { path: 'expectedCloseDate', type: 'date', icon: 'Calendar' },
            ],
            badges: [
              {
                type: 'probability',
                path: 'probability',
              },
            ],
          },
          dragEnabled: true,
          onDragEnd: 'updateDealStage',
          onCardClick: 'openDealDetail',
        },
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'Create Deal',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'deal-create' },
    },
    {
      id: 'bulk-update-stage',
      label: 'Update Stage',
      type: 'modal',
      icon: 'ArrowRight',
      variant: 'default',
      config: { type: 'modal', modal: 'deal-bulk-stage' },
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
      config: { type: 'function', handler: 'exportDeals' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Deals', active: true },
    ],
  },
};

export default dealListScreen;
