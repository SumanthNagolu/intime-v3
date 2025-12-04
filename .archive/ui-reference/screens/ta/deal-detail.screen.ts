/**
 * Deal Detail Screen Definition
 *
 * Comprehensive deal view with:
 * - Deal summary sidebar
 * - Stage progression
 * - Stakeholder management
 * - Activity timeline
 * - Proposal and contract tracking
 *
 * Routes: /employee/workspace/ta/deals/:id
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import {
  TA_DEAL_TYPE_OPTIONS,
  TA_DEAL_STAGE_OPTIONS,
} from '@/lib/metadata/options/ta-options';
import {
  STAKEHOLDER_ROLE_OPTIONS,
  SENTIMENT_OPTIONS,
  ACTIVITY_TYPE_OPTIONS,
  ACTIVITY_OUTCOME_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// DEAL DETAIL SCREEN
// ==========================================

export const dealDetailScreen: ScreenDefinition = {
  id: 'deal-detail',
  type: 'detail',
  entityType: 'deal',
  title: { field: 'title' },
  subtitle: { field: 'accountName' },
  icon: 'Handshake',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.deals.getById',
      params: { id: { param: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',

    // Sidebar - Deal Summary
    sidebar: {
      id: 'deal-sidebar',
      type: 'info-card',
      header: {
        type: 'title',
        icon: 'Handshake',
        badge: {
          type: 'field',
          path: 'stage',
          variant: 'status',
        },
      },
      sections: [
        // Stage Progress
        {
          id: 'stage-progress',
          type: 'custom',
          component: 'DealStageProgress',
          componentProps: {
            stages: TA_DEAL_STAGE_OPTIONS,
            currentPath: 'stage',
            valuePath: 'value',
          },
        },

        // Value Summary
        {
          id: 'value-summary',
          type: 'metrics-grid',
          columns: 2,
          widgets: [
            {
              id: 'value',
              type: 'metric',
              label: 'Deal Value',
              path: 'value',
              config: { format: 'currency', prefix: '$', size: 'lg' },
            },
            {
              id: 'probability',
              type: 'metric',
              label: 'Probability',
              path: 'probability',
              config: { format: 'percentage', suffix: '%', size: 'lg' },
            },
          ],
        },

        // Deal Info
        {
          id: 'deal-info',
          type: 'field-grid',
          title: 'Deal Information',
          icon: 'Info',
          columns: 1,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { id: 'dealType', label: 'Deal Type', path: 'dealType', type: 'enum', config: { options: TA_DEAL_TYPE_OPTIONS } },
            { id: 'expectedCloseDate', label: 'Expected Close', path: 'expectedCloseDate', type: 'date', config: { format: 'medium' } },
            { id: 'weightedValue', label: 'Weighted Value', path: 'weightedValue', type: 'currency', config: { prefix: '$' } },
          ],
        },

        // Account Info
        {
          id: 'account-info',
          type: 'field-grid',
          title: 'Account',
          icon: 'Building2',
          columns: 1,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            {
              id: 'accountName',
              label: 'Account',
              path: 'accountName',
              type: 'link',
              config: { route: '/employee/workspace/ta/accounts/{accountId}' },
            },
            { id: 'contactName', label: 'Primary Contact', path: 'contactName', type: 'text' },
            { id: 'contactEmail', label: 'Contact Email', path: 'contactEmail', type: 'email' },
          ],
        },

        // Lead Source
        {
          id: 'source-info',
          type: 'field-grid',
          title: 'Source',
          icon: 'Tag',
          columns: 1,
          collapsible: true,
          fields: [
            {
              id: 'leadName',
              label: 'From Lead',
              path: 'leadName',
              type: 'link',
              config: { route: '/employee/workspace/ta/leads/{leadId}' },
              visible: { field: 'leadId', operator: 'exists' },
            },
            { id: 'owner', label: 'Owner', path: 'ownerName', type: 'user' },
            { id: 'createdAt', label: 'Created', path: 'createdAt', type: 'date', config: { format: 'full' } },
          ],
        },
      ],

      // Sidebar Footer
      footer: {
        type: 'metrics-row',
        metrics: [
          { label: 'Activities', value: { path: 'activityCount' }, icon: 'Activity' },
          { label: 'Days Open', value: { path: 'daysOpen' }, icon: 'Clock' },
        ],
      },
    },

    // Main Content - Tabs
    tabs: [
      // Overview Tab
      {
        id: 'overview',
        label: 'Overview',
        icon: 'LayoutDashboard',
        sections: [
          // Description
          {
            id: 'description',
            type: 'info-card',
            title: 'Description',
            icon: 'FileText',
            widgets: [
              {
                id: 'description-text',
                type: 'rich-text',
                path: 'description',
                config: { readOnly: true },
              },
            ],
          },

          // Key Dates
          {
            id: 'key-dates',
            type: 'field-grid',
            title: 'Key Dates',
            icon: 'Calendar',
            columns: 3,
            fields: [
              { id: 'createdAt', label: 'Created', path: 'createdAt', type: 'date', config: { format: 'medium' } },
              { id: 'expectedCloseDate', label: 'Expected Close', path: 'expectedCloseDate', type: 'date', config: { format: 'medium' } },
              { id: 'actualCloseDate', label: 'Actual Close', path: 'actualCloseDate', type: 'date', config: { format: 'medium' } },
              { id: 'lastActivityAt', label: 'Last Activity', path: 'lastActivityAt', type: 'date', config: { format: 'relative' } },
              { id: 'nextFollowUp', label: 'Next Follow-up', path: 'nextFollowUpDate', type: 'date', config: { format: 'medium' } },
            ],
          },

          // Win/Loss Analysis (for closed deals)
          {
            id: 'close-analysis',
            type: 'info-card',
            title: 'Close Analysis',
            icon: 'BarChart',
            visible: { field: 'stage', operator: 'in', value: ['closed_won', 'closed_lost'] },
            widgets: [
              {
                id: 'close-reason',
                type: 'field',
                label: 'Close Reason',
                path: 'closeReason',
              },
              {
                id: 'competitor',
                type: 'field',
                label: 'Competitor',
                path: 'competitor',
                visible: { field: 'stage', operator: 'eq', value: 'closed_lost' },
              },
              {
                id: 'lessons-learned',
                type: 'field',
                label: 'Lessons Learned',
                path: 'lessonsLearned',
              },
            ],
          },
        ],
      },

      // Stakeholders Tab
      {
        id: 'stakeholders',
        label: 'Stakeholders',
        icon: 'Users',
        badge: {
          type: 'count',
          path: 'stakeholderCount',
        },
        sections: [
          {
            id: 'stakeholders-table',
            type: 'table',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.deals.getStakeholders',
                params: { dealId: { param: 'id' } },
              },
            },
            columns_config: [
              { id: 'name', header: 'Name', accessor: 'contactName', type: 'text' },
              { id: 'title', header: 'Title', accessor: 'title', type: 'text' },
              { id: 'role', header: 'Role', accessor: 'role', type: 'enum', config: { options: STAKEHOLDER_ROLE_OPTIONS } },
              { id: 'sentiment', header: 'Sentiment', accessor: 'sentiment', type: 'enum', config: { options: SENTIMENT_OPTIONS } },
              { id: 'influence', header: 'Influence', accessor: 'influenceLevel', type: 'progress' },
            ],
            rowActions: [
              {
                id: 'edit-stakeholder',
                type: 'modal',
                label: 'Edit',
                icon: 'Pencil',
                config: { type: 'modal', modal: 'edit-stakeholder' },
              },
              {
                id: 'remove-stakeholder',
                type: 'mutation',
                label: 'Remove',
                icon: 'Trash',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'ta.deals.removeStakeholder' },
                confirm: {
                  title: 'Remove Stakeholder',
                  message: 'Are you sure you want to remove this stakeholder?',
                },
              },
            ],
            emptyState: {
              title: 'No Stakeholders',
              description: 'Add stakeholders to track decision makers',
              icon: 'Users',
            },
            actions: [
              {
                id: 'add-stakeholder',
                type: 'modal',
                label: 'Add Stakeholder',
                icon: 'Plus',
                variant: 'outline',
                config: {
                  type: 'modal',
                  modal: 'add-stakeholder',
                  props: { dealId: { param: 'id' } },
                },
              },
            ],
          },
        ],
      },

      // Activities Tab
      {
        id: 'activities',
        label: 'Activities',
        icon: 'Activity',
        badge: {
          type: 'count',
          path: 'activityCount',
        },
        sections: [
          // Quick Log Activity
          {
            id: 'quick-log',
            type: 'form',
            title: 'Log Activity',
            icon: 'Plus',
            inline: true,
            fields: [
              {
                id: 'activityType',
                label: 'Type',
                type: 'select',
                options: ACTIVITY_TYPE_OPTIONS,
                required: true,
              },
              {
                id: 'subject',
                label: 'Subject',
                type: 'text',
                required: true,
              },
              {
                id: 'outcome',
                label: 'Outcome',
                type: 'select',
                options: ACTIVITY_OUTCOME_OPTIONS,
              },
              {
                id: 'notes',
                label: 'Notes',
                type: 'textarea',
                config: { rows: 2 },
              },
            ],
            actions: [
              {
                id: 'log-activity',
                type: 'mutation',
                label: 'Log Activity',
                icon: 'Plus',
                variant: 'primary',
                config: {
                  type: 'mutation',
                  procedure: 'ta.activities.create',
                  input: { entityType: 'deal', entityId: { param: 'id' } },
                },
              },
            ],
          },

          // Activity Timeline
          {
            id: 'activity-timeline',
            type: 'timeline',
            title: 'Activity History',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.activities.listByEntity',
                params: { entityType: 'deal', entityId: { param: 'id' } },
              },
            },
            config: {
              timestampPath: 'createdAt',
              titlePath: 'subject',
              descriptionPath: 'notes',
              typePath: 'activityType',
              outcomePath: 'outcome',
              userPath: 'createdByName',
            },
          },
        ],
      },

      // Proposals Tab
      {
        id: 'proposals',
        label: 'Proposals',
        icon: 'FileText',
        badge: {
          type: 'count',
          path: 'proposalCount',
        },
        sections: [
          {
            id: 'proposals-table',
            type: 'table',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.deals.getProposals',
                params: { dealId: { param: 'id' } },
              },
            },
            columns_config: [
              { id: 'name', header: 'Proposal', accessor: 'name', type: 'text' },
              { id: 'version', header: 'Version', accessor: 'version', type: 'text' },
              { id: 'value', header: 'Value', accessor: 'value', type: 'currency', config: { prefix: '$' } },
              { id: 'status', header: 'Status', accessor: 'status', type: 'enum' },
              { id: 'sentAt', header: 'Sent', accessor: 'sentAt', type: 'date', config: { format: 'relative' } },
            ],
            rowActions: [
              {
                id: 'view-proposal',
                type: 'modal',
                label: 'View',
                icon: 'Eye',
                config: { type: 'modal', modal: 'view-proposal' },
              },
              {
                id: 'download-proposal',
                type: 'download',
                label: 'Download',
                icon: 'Download',
                config: { type: 'download', url: { field: 'downloadUrl' } },
              },
            ],
            emptyState: {
              title: 'No Proposals',
              description: 'Create a proposal for this deal',
              icon: 'FileText',
            },
            actions: [
              {
                id: 'create-proposal',
                type: 'modal',
                label: 'Create Proposal',
                icon: 'Plus',
                variant: 'outline',
                config: {
                  type: 'modal',
                  modal: 'create-proposal',
                  props: { dealId: { param: 'id' } },
                },
              },
            ],
          },
        ],
      },

      // Notes Tab
      {
        id: 'notes',
        label: 'Notes',
        icon: 'StickyNote',
        sections: [
          {
            id: 'notes-section',
            type: 'custom',
            component: 'NotesEditor',
            componentProps: {
              entityType: 'deal',
              entityIdParam: 'id',
            },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'advance-stage',
      type: 'modal',
      label: 'Advance Stage',
      icon: 'ArrowRight',
      variant: 'primary',
      visible: { field: 'stage', operator: 'nin', value: ['closed_won', 'closed_lost'] },
      config: {
        type: 'modal',
        modal: 'advance-deal-stage',
        props: { dealId: { param: 'id' } },
      },
    },
    {
      id: 'mark-won',
      type: 'modal',
      label: 'Mark as Won',
      icon: 'Trophy',
      variant: 'primary',
      visible: { field: 'stage', operator: 'eq', value: 'negotiation' },
      config: {
        type: 'modal',
        modal: 'close-deal-won',
        props: { dealId: { param: 'id' } },
      },
    },
    {
      id: 'log-activity',
      type: 'modal',
      label: 'Log Activity',
      icon: 'Plus',
      variant: 'outline',
      config: {
        type: 'modal',
        modal: 'quick-log-activity',
        props: { entityType: 'deal', entityId: { param: 'id' } },
      },
    },
    {
      id: 'edit-deal',
      type: 'navigate',
      label: 'Edit',
      icon: 'Pencil',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/ta/deals/{id}/edit' },
    },
    {
      id: 'mark-lost',
      type: 'modal',
      label: 'Mark as Lost',
      icon: 'X',
      variant: 'destructive',
      visible: { field: 'stage', operator: 'nin', value: ['closed_won', 'closed_lost'] },
      config: {
        type: 'modal',
        modal: 'close-deal-lost',
        props: { dealId: { param: 'id' } },
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Deals',
      route: '/employee/workspace/ta/deals',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Deals', route: '/employee/workspace/ta/deals' },
      { label: { field: 'title' } },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 's', action: 'advance-stage', description: 'Advance stage' },
    { key: 'a', action: 'log-activity', description: 'Log activity' },
    { key: 'e', action: 'edit-deal', description: 'Edit deal' },
  ],
};

export default dealDetailScreen;
