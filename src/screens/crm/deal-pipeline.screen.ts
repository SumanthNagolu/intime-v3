/**
 * Deal Pipeline Screen
 * 
 * Kanban-style pipeline view of deals with:
 * - Stage columns (Discovery, Proposal, Negotiation, Closed)
 * - Deal cards with value, probability, age
 * - Pipeline metrics and forecasting
 * - Quick actions for advancing deals
 * 
 * @see docs/specs/20-USER-ROLES/03-ta/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const dealPipelineScreen: ScreenDefinition = {
  id: 'deal-pipeline',
  type: 'list-detail',
  entityType: 'deal',
  title: 'Deal Pipeline',
  icon: 'Kanban',

  dataSource: {
    type: 'list',
    entityType: 'deal',
    filter: {
      status: { operator: 'nin', value: ['lost', 'abandoned'] },
      owner_id: { operator: 'eq', value: { type: 'context', path: 'user.id' } },
    },
    include: ['account', 'contacts', 'activities', 'owner'],
    sort: { field: 'updated_at', direction: 'desc' },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Pipeline Summary Metrics
      {
        id: 'pipeline-summary',
        type: 'metrics-grid',
        columns: 5,
        fields: [
          {
            id: 'total-deals',
            label: 'Total Deals',
            type: 'number',
            path: 'summary.totalDeals',
            config: { icon: 'Briefcase' },
          },
          {
            id: 'pipeline-value',
            label: 'Pipeline Value',
            type: 'currency',
            path: 'summary.totalValue',
            config: { icon: 'DollarSign' },
          },
          {
            id: 'weighted-value',
            label: 'Weighted Value',
            type: 'currency',
            path: 'summary.weightedValue',
            config: { 
              icon: 'Target',
              helpText: 'Value × probability',
            },
          },
          {
            id: 'avg-deal-size',
            label: 'Avg Deal Size',
            type: 'currency',
            path: 'summary.avgDealSize',
            config: { icon: 'BarChart' },
          },
          {
            id: 'closing-this-month',
            label: 'Closing This Month',
            type: 'currency',
            path: 'summary.closingThisMonth',
            config: { icon: 'Calendar' },
          },
        ],
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
            id: 'deal-type',
            type: 'multiselect',
            path: 'filters.dealType',
            label: 'Deal Type',
            options: [
              { value: 'training', label: 'Training' },
              { value: 'staffing', label: 'Staffing' },
              { value: 'partnership', label: 'Partnership' },
            ],
          },
          {
            id: 'value-range',
            type: 'select',
            path: 'filters.valueRange',
            label: 'Value Range',
            placeholder: 'All Values',
            options: [
              { value: '<10k', label: 'Under $10K' },
              { value: '10k-25k', label: '$10K - $25K' },
              { value: '25k-50k', label: '$25K - $50K' },
              { value: '50k-100k', label: '$50K - $100K' },
              { value: '>100k', label: 'Over $100K' },
            ],
          },
          {
            id: 'close-date',
            type: 'select',
            path: 'filters.closeDate',
            label: 'Expected Close',
            placeholder: 'All Time',
            options: [
              { value: 'this-month', label: 'This Month' },
              { value: 'next-month', label: 'Next Month' },
              { value: 'this-quarter', label: 'This Quarter' },
              { value: 'overdue', label: 'Overdue' },
            ],
          },
          {
            id: 'owner',
            type: 'select',
            path: 'filters.ownerId',
            label: 'Owner',
            placeholder: 'All Owners',
            optionsSource: { type: 'entity', entityType: 'user', filter: { role: 'ta_specialist' } },
          },
        ],
      },

      // Kanban Board
      {
        id: 'kanban',
        type: 'custom',
        component: 'KanbanBoard',
        componentProps: {
          entityType: 'deal',
          statusField: 'stage',
          columns: [
            {
              id: 'discovery',
              title: 'Discovery',
              stage: 'discovery',
              color: 'blue',
              probability: 10,
            },
            {
              id: 'qualification',
              title: 'Qualification',
              stage: 'qualification',
              color: 'indigo',
              probability: 25,
            },
            {
              id: 'proposal',
              title: 'Proposal',
              stage: 'proposal',
              color: 'purple',
              probability: 50,
            },
            {
              id: 'negotiation',
              title: 'Negotiation',
              stage: 'negotiation',
              color: 'amber',
              probability: 75,
            },
            {
              id: 'closed_won',
              title: 'Closed Won',
              stage: 'closed_won',
              color: 'green',
              probability: 100,
            },
          ],
          cardTemplate: {
            title: { type: 'field', path: 'name' },
            subtitle: { type: 'field', path: 'account.name' },
            fields: [
              { path: 'value', type: 'currency', icon: 'DollarSign' },
              { path: 'expectedCloseDate', type: 'date', icon: 'Calendar', label: 'Close' },
              { path: 'daysInStage', type: 'number', icon: 'Clock', label: 'Days' },
            ],
            badges: [
              { 
                type: 'deal-type', 
                path: 'dealType',
              },
              {
                type: 'probability',
                path: 'probability',
              },
              {
                type: 'activity-overdue',
                path: 'hasOverdueActivities',
                visible: { field: 'hasOverdueActivities', operator: 'eq', value: true },
              },
            ],
            progress: {
              current: { type: 'field', path: 'completedSteps' },
              total: { type: 'field', path: 'totalSteps' },
            },
          },
          columnFooter: {
            type: 'summary',
            fields: [
              { label: 'Total', path: 'columnTotalValue', format: 'currency' },
              { label: 'Weighted', path: 'columnWeightedValue', format: 'currency' },
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
      id: 'create-deal',
      label: 'New Deal',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'deal-create' },
    },
    {
      id: 'view-forecast',
      label: 'View Forecast',
      type: 'navigate',
      icon: 'TrendingUp',
      variant: 'default',
      config: { type: 'navigate', route: '/employee/crm/deals/forecast' },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'function',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'function', handler: 'exportDeals' },
    },
    {
      id: 'toggle-view',
      label: 'Table View',
      type: 'navigate',
      icon: 'Table',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/crm/deals?view=table' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'CRM', route: '/employee/crm' },
      { label: 'Deal Pipeline', active: true },
    ],
  },
};

export default dealPipelineScreen;

