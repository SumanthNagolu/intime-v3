/**
 * Deal Detail Screen Definition
 *
 * Metadata-driven screen for viewing Deal details with tabs for
 * stakeholders, competitors, products, and activity history.
 */

import { createDetailScreen } from '@/lib/metadata/factories';
import type { DetailTemplateConfig } from '@/lib/metadata/templates';
import {
  dealBasicInputSet,
  dealValueInputSet,
  dealStageInputSet,
  dealAssignmentInputSet,
  dealOutcomeInputSet,
  dealNotesInputSet,
} from '@/lib/metadata/inputsets';
import {
  DEAL_STAGE_OPTIONS,
  DEAL_TYPE_OPTIONS,
  STAKEHOLDER_ROLE_OPTIONS,
  INFLUENCE_LEVEL_OPTIONS,
  SENTIMENT_OPTIONS,
  THREAT_LEVEL_OPTIONS,
  DEAL_PRODUCT_TYPE_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// DEAL DETAIL SCREEN CONFIG
// ==========================================

const dealDetailConfig: DetailTemplateConfig = {
  entityId: 'deal',
  entityName: 'Deal',
  basePath: '/employee/crm/deals',

  // Data source
  dataSource: {
    getProcedure: 'crm.deals.getById',
    idParam: 'id',
  },

  // Title template
  titleTemplate: '{{title}}',
  subtitleTemplate: '{{accountName}} - {{stage}}',

  // Sidebar configuration
  sidebar: {
    position: 'left',
    width: 320,
    sections: [
      {
        id: 'value',
        type: 'stats',
        title: 'Deal Value',
        fields: [
          {
            id: 'value',
            label: 'Value',
            path: 'value',
            type: 'currency',
            config: { prefix: '$', size: 'large' },
          },
          {
            id: 'probability',
            label: 'Win Probability',
            path: 'probability',
            type: 'progress',
            config: { max: 100, suffix: '%' },
          },
        ],
      },
      {
        id: 'quickInfo',
        type: 'info-list',
        fields: [
          {
            id: 'stage',
            label: 'Stage',
            path: 'stage',
            type: 'enum',
            icon: 'TrendingUp',
            config: {
              options: DEAL_STAGE_OPTIONS,
              badgeColors: {
                discovery: 'blue',
                qualification: 'cyan',
                proposal: 'amber',
                negotiation: 'orange',
                closed_won: 'green',
                closed_lost: 'red',
              },
            },
          },
          {
            id: 'dealType',
            label: 'Type',
            path: 'dealType',
            type: 'enum',
            icon: 'Tag',
            config: { options: DEAL_TYPE_OPTIONS },
          },
          {
            id: 'account',
            label: 'Account',
            path: 'accountName',
            type: 'link',
            linkTemplate: '/employee/crm/accounts/{{accountId}}',
            icon: 'Building2',
          },
          {
            id: 'owner',
            label: 'Owner',
            path: 'ownerName',
            type: 'text',
            icon: 'User',
          },
          {
            id: 'expectedCloseDate',
            label: 'Expected Close',
            path: 'expectedCloseDate',
            type: 'date',
            icon: 'Calendar',
            config: { format: 'medium' },
          },
          {
            id: 'actualCloseDate',
            label: 'Actual Close',
            path: 'actualCloseDate',
            type: 'date',
            icon: 'CalendarCheck',
            config: { format: 'medium' },
          },
        ],
      },
      {
        id: 'quickActions',
        type: 'action-list',
        actions: [
          {
            id: 'updateStage',
            label: 'Update Stage',
            icon: 'ArrowRight',
            actionType: 'custom',
            handler: 'handleUpdateStage',
          },
          {
            id: 'addStakeholder',
            label: 'Add Stakeholder',
            icon: 'UserPlus',
            actionType: 'custom',
            handler: 'handleAddStakeholder',
          },
          {
            id: 'logActivity',
            label: 'Log Activity',
            icon: 'Activity',
            actionType: 'custom',
            handler: 'handleLogActivity',
          },
          {
            id: 'addNote',
            label: 'Add Note',
            icon: 'StickyNote',
            actionType: 'custom',
            handler: 'handleAddNote',
          },
        ],
      },
    ],
  },

  // Tabs configuration
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'FileText',
      sections: [
        {
          id: 'basicInfo',
          type: 'input-set',
          inputSet: dealBasicInputSet,
          title: 'Basic Information',
          readonly: true,
        },
        {
          id: 'value',
          type: 'input-set',
          inputSet: dealValueInputSet,
          title: 'Deal Value',
          readonly: true,
        },
        {
          id: 'stage',
          type: 'input-set',
          inputSet: dealStageInputSet,
          title: 'Pipeline Stage',
          readonly: true,
        },
        {
          id: 'assignment',
          type: 'input-set',
          inputSet: dealAssignmentInputSet,
          title: 'Assignment',
          readonly: true,
        },
        {
          id: 'notes',
          type: 'input-set',
          inputSet: dealNotesInputSet,
          title: 'Notes',
          readonly: true,
        },
      ],
    },
    {
      id: 'stakeholders',
      label: 'Stakeholders',
      icon: 'Users',
      badge: {
        path: 'stakeholders.length',
        variant: 'secondary',
      },
      sections: [
        {
          id: 'stakeholderList',
          type: 'related-table',
          title: 'Deal Stakeholders',
          dataPath: 'stakeholders',
          dataSource: {
            procedure: 'crm.deals.getStakeholders',
            params: { dealId: '{{id}}' },
          },
          columns: [
            { id: 'name', label: 'Name', path: 'name', type: 'text' },
            { id: 'title', label: 'Title', path: 'title', type: 'text' },
            { id: 'email', label: 'Email', path: 'email', type: 'email' },
            {
              id: 'role',
              label: 'Role',
              path: 'role',
              type: 'enum',
              config: { options: STAKEHOLDER_ROLE_OPTIONS },
            },
            {
              id: 'influenceLevel',
              label: 'Influence',
              path: 'influenceLevel',
              type: 'enum',
              config: {
                options: INFLUENCE_LEVEL_OPTIONS,
                badgeColors: { high: 'red', medium: 'amber', low: 'green' },
              },
            },
            {
              id: 'sentiment',
              label: 'Sentiment',
              path: 'sentiment',
              type: 'enum',
              config: {
                options: SENTIMENT_OPTIONS,
                badgeColors: { positive: 'green', neutral: 'gray', negative: 'red', unknown: 'slate' },
              },
            },
            { id: 'isPrimary', label: 'Primary', path: 'isPrimary', type: 'boolean' },
          ],
          actions: [
            {
              id: 'edit',
              label: 'Edit',
              icon: 'Pencil',
              actionType: 'custom',
              handler: 'handleEditStakeholder',
            },
            {
              id: 'remove',
              label: 'Remove',
              icon: 'Trash',
              variant: 'destructive',
              actionType: 'mutation',
              mutation: 'crm.deals.removeStakeholder',
            },
          ],
          emptyState: {
            title: 'No stakeholders',
            message: 'Add stakeholders to track decision makers involved in this deal.',
            action: {
              label: 'Add Stakeholder',
              handler: 'handleAddStakeholder',
            },
          },
        },
      ],
    },
    {
      id: 'competitors',
      label: 'Competitors',
      icon: 'Swords',
      badge: {
        path: 'competitors.length',
        variant: 'secondary',
      },
      sections: [
        {
          id: 'competitorList',
          type: 'related-table',
          title: 'Competitive Intelligence',
          dataPath: 'competitors',
          dataSource: {
            procedure: 'crm.deals.getCompetitors',
            params: { dealId: '{{id}}' },
          },
          columns: [
            { id: 'competitorName', label: 'Competitor', path: 'competitorName', type: 'text' },
            {
              id: 'threatLevel',
              label: 'Threat Level',
              path: 'threatLevel',
              type: 'enum',
              config: {
                options: THREAT_LEVEL_OPTIONS,
                badgeColors: { high: 'red', medium: 'amber', low: 'green' },
              },
            },
            { id: 'strengths', label: 'Strengths', path: 'strengths', type: 'text' },
            { id: 'weaknesses', label: 'Weaknesses', path: 'weaknesses', type: 'text' },
            { id: 'ourDifferentiators', label: 'Our Edge', path: 'ourDifferentiators', type: 'text' },
          ],
          actions: [
            {
              id: 'edit',
              label: 'Edit',
              icon: 'Pencil',
              actionType: 'custom',
              handler: 'handleEditCompetitor',
            },
          ],
          emptyState: {
            title: 'No competitors tracked',
            message: 'Add competitors to track competitive intelligence for this deal.',
            action: {
              label: 'Add Competitor',
              handler: 'handleAddCompetitor',
            },
          },
        },
      ],
    },
    {
      id: 'products',
      label: 'Products',
      icon: 'Package',
      badge: {
        path: 'products.length',
        variant: 'secondary',
      },
      sections: [
        {
          id: 'productList',
          type: 'related-table',
          title: 'Products & Services',
          dataPath: 'products',
          dataSource: {
            procedure: 'crm.deals.getProducts',
            params: { dealId: '{{id}}' },
          },
          columns: [
            {
              id: 'productType',
              label: 'Type',
              path: 'productType',
              type: 'enum',
              config: { options: DEAL_PRODUCT_TYPE_OPTIONS },
            },
            { id: 'productName', label: 'Name', path: 'productName', type: 'text' },
            { id: 'quantity', label: 'Qty', path: 'quantity', type: 'number' },
            { id: 'unitPrice', label: 'Unit Price', path: 'unitPrice', type: 'currency' },
            { id: 'discount', label: 'Discount', path: 'discount', type: 'number', config: { suffix: '%' } },
            { id: 'totalValue', label: 'Total', path: 'totalValue', type: 'currency' },
            { id: 'durationMonths', label: 'Duration', path: 'durationMonths', type: 'number', config: { suffix: ' mo' } },
          ],
          emptyState: {
            title: 'No products added',
            message: 'Add products or services to calculate deal value.',
            action: {
              label: 'Add Product',
              handler: 'handleAddProduct',
            },
          },
        },
      ],
    },
    {
      id: 'history',
      label: 'Stage History',
      icon: 'History',
      sections: [
        {
          id: 'stageHistory',
          type: 'timeline',
          title: 'Stage Transitions',
          dataPath: 'stageHistory',
          dataSource: {
            procedure: 'crm.deals.getStageHistory',
            params: { dealId: '{{id}}' },
          },
          config: {
            timelineType: 'stage-history',
            showDuration: true,
          },
          emptyState: {
            title: 'No stage changes',
            message: 'Stage history will appear as the deal progresses.',
          },
        },
      ],
    },
    {
      id: 'outcome',
      label: 'Outcome',
      icon: 'Target',
      showWhen: {
        field: 'stage',
        operator: 'in',
        value: ['closed_won', 'closed_lost'],
      },
      sections: [
        {
          id: 'outcomeDetails',
          type: 'input-set',
          inputSet: dealOutcomeInputSet,
          title: 'Deal Outcome',
          readonly: true,
        },
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: 'Activity',
      sections: [
        {
          id: 'activityTimeline',
          type: 'timeline',
          title: 'Activity Timeline',
          dataPath: 'activities',
          config: {
            activityTypes: ['call', 'email', 'meeting', 'note'],
            showAddButton: true,
            groupByDate: true,
          },
          emptyState: {
            title: 'No activity yet',
            message: 'Log a call, send an email, or add a note to get started.',
          },
        },
      ],
    },
  ],

  // Header actions
  headerActions: [
    {
      id: 'edit',
      label: 'Edit',
      variant: 'primary',
      icon: 'Pencil',
      actionType: 'navigate',
      routeTemplate: '/employee/crm/deals/{{id}}/edit',
    },
    {
      id: 'updateStage',
      label: 'Update Stage',
      variant: 'secondary',
      icon: 'ArrowRight',
      actionType: 'custom',
      handler: 'handleUpdateStage',
    },
    {
      id: 'delete',
      label: 'Delete',
      variant: 'destructive',
      icon: 'Trash',
      actionType: 'mutation',
      mutation: 'crm.deals.delete',
      confirm: {
        title: 'Delete Deal',
        message: 'Are you sure you want to delete this deal? This action cannot be undone.',
      },
      onSuccess: {
        redirect: '/employee/crm/deals',
        toast: { message: 'Deal deleted successfully' },
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'CRM', route: '/employee/crm' },
      { label: 'Deals', route: '/employee/crm/deals' },
      { label: '{{title}}' },
    ],
  },
};

// ==========================================
// GENERATE SCREEN
// ==========================================

export const dealDetailScreen = createDetailScreen(dealDetailConfig);

export default dealDetailScreen;
