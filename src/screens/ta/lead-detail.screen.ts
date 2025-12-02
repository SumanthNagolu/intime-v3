/**
 * Lead Detail Screen Definition
 *
 * Comprehensive lead view with:
 * - Lead info sidebar (contact details, company info)
 * - BANT qualification tabs (Budget, Authority, Need, Timeline)
 * - Activity timeline
 * - Related deals and campaigns
 * - Quick actions for qualification workflow
 *
 * Routes: /employee/workspace/ta/leads/:id
 *
 * @see docs/specs/20-USER-ROLES/03-ta/06-qualify-lead.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import {
  TA_LEAD_STAGE_OPTIONS,
  BANT_BUDGET_OPTIONS,
  BANT_AUTHORITY_OPTIONS,
  BANT_NEED_OPTIONS,
  BANT_TIMELINE_OPTIONS,
} from '@/lib/metadata/options/ta-options';
import {
  LEAD_SOURCE_OPTIONS,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  ACTIVITY_TYPE_OPTIONS,
  ACTIVITY_OUTCOME_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// LEAD DETAIL SCREEN
// ==========================================

export const leadDetailScreen: ScreenDefinition = {
  id: 'lead-detail',
  type: 'detail',
  entityType: 'lead',
  title: { field: 'name' },
  subtitle: { field: 'company' },
  icon: 'User',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.leads.getById',
      params: { id: { param: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',

    // Sidebar - Lead Info
    sidebar: {
      id: 'lead-sidebar',
      type: 'info-card',
      header: {
        type: 'avatar',
        path: 'name',
        size: 'lg',
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
          component: 'StageProgress',
          componentProps: {
            stages: TA_LEAD_STAGE_OPTIONS.filter(s => s.value !== 'disqualified'),
            currentPath: 'stage',
          },
        },

        // Contact Info
        {
          id: 'contact-info',
          type: 'field-grid',
          title: 'Contact Information',
          icon: 'Contact',
          columns: 1,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { id: 'email', label: 'Email', path: 'email', type: 'email' },
            { id: 'phone', label: 'Phone', path: 'phone', type: 'phone' },
            { id: 'linkedin', label: 'LinkedIn', path: 'linkedinUrl', type: 'link' },
            { id: 'title', label: 'Title', path: 'title', type: 'text' },
          ],
        },

        // Company Info
        {
          id: 'company-info',
          type: 'field-grid',
          title: 'Company',
          icon: 'Building2',
          columns: 1,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { id: 'company', label: 'Company', path: 'company', type: 'text' },
            { id: 'industry', label: 'Industry', path: 'industry', type: 'enum', config: { options: INDUSTRY_OPTIONS } },
            { id: 'companySize', label: 'Size', path: 'companySize', type: 'enum', config: { options: COMPANY_SIZE_OPTIONS } },
            { id: 'website', label: 'Website', path: 'website', type: 'link' },
          ],
        },

        // Source & Assignment
        {
          id: 'source-assignment',
          type: 'field-grid',
          title: 'Source & Assignment',
          icon: 'Tag',
          columns: 1,
          collapsible: true,
          fields: [
            { id: 'source', label: 'Lead Source', path: 'leadSource', type: 'enum', config: { options: LEAD_SOURCE_OPTIONS } },
            { id: 'campaign', label: 'Campaign', path: 'campaignName', type: 'link', config: { route: '/employee/workspace/ta/campaigns/{campaignId}' } },
            { id: 'owner', label: 'Owner', path: 'ownerName', type: 'user' },
            { id: 'createdAt', label: 'Created', path: 'createdAt', type: 'date', config: { format: 'full' } },
          ],
        },

        // Estimated Value
        {
          id: 'value-info',
          type: 'field-grid',
          title: 'Value',
          icon: 'DollarSign',
          columns: 1,
          collapsible: true,
          fields: [
            { id: 'estimatedValue', label: 'Estimated Value', path: 'estimatedValue', type: 'currency', config: { prefix: '$' } },
            { id: 'probability', label: 'Probability', path: 'probability', type: 'number', config: { suffix: '%' } },
            { id: 'weightedValue', label: 'Weighted Value', path: 'weightedValue', type: 'currency', config: { prefix: '$' } },
          ],
        },
      ],

      // Sidebar Footer - Quick Stats
      footer: {
        type: 'metrics-row',
        metrics: [
          { label: 'Activities', value: { path: 'activityCount' }, icon: 'Activity' },
          { label: 'Days in Stage', value: { path: 'daysInStage' }, icon: 'Clock' },
        ],
      },
    },

    // Main Content - Tabs
    tabs: [
      // BANT Qualification Tab
      {
        id: 'bant',
        label: 'BANT Qualification',
        icon: 'ClipboardCheck',
        badge: {
          type: 'conditional',
          condition: { field: 'bantComplete', operator: 'eq', value: true },
          ifTrue: { value: 'Complete', variant: 'success' },
          ifFalse: { value: 'Incomplete', variant: 'warning' },
        },
        sections: [
          // BANT Overview
          {
            id: 'bant-overview',
            type: 'custom',
            component: 'BANTScoreCard',
            componentProps: {
              budgetPath: 'bantBudget',
              authorityPath: 'bantAuthority',
              needPath: 'bantNeed',
              timelinePath: 'bantTimeline',
              overallScorePath: 'bantScore',
            },
          },

          // Budget Section
          {
            id: 'bant-budget',
            type: 'form',
            title: 'Budget',
            icon: 'DollarSign',
            collapsible: true,
            defaultExpanded: true,
            fields: [
              {
                id: 'bantBudget',
                label: 'Budget Status',
                path: 'bantBudget',
                type: 'select',
                options: BANT_BUDGET_OPTIONS,
                required: true,
              },
              {
                id: 'budgetAmount',
                label: 'Budget Amount',
                path: 'budgetAmount',
                type: 'currency',
                config: { prefix: '$' },
              },
              {
                id: 'budgetNotes',
                label: 'Budget Notes',
                path: 'budgetNotes',
                type: 'textarea',
                config: { rows: 3 },
              },
            ],
          },

          // Authority Section
          {
            id: 'bant-authority',
            type: 'form',
            title: 'Authority',
            icon: 'UserCheck',
            collapsible: true,
            defaultExpanded: true,
            fields: [
              {
                id: 'bantAuthority',
                label: 'Authority Level',
                path: 'bantAuthority',
                type: 'select',
                options: BANT_AUTHORITY_OPTIONS,
                required: true,
              },
              {
                id: 'decisionMaker',
                label: 'Decision Maker',
                path: 'decisionMakerName',
                type: 'text',
              },
              {
                id: 'decisionProcess',
                label: 'Decision Process',
                path: 'decisionProcess',
                type: 'textarea',
                config: { rows: 3, placeholder: 'Describe the decision-making process...' },
              },
            ],
          },

          // Need Section
          {
            id: 'bant-need',
            type: 'form',
            title: 'Need',
            icon: 'Target',
            collapsible: true,
            defaultExpanded: true,
            fields: [
              {
                id: 'bantNeed',
                label: 'Need Level',
                path: 'bantNeed',
                type: 'select',
                options: BANT_NEED_OPTIONS,
                required: true,
              },
              {
                id: 'painPoints',
                label: 'Pain Points',
                path: 'painPoints',
                type: 'textarea',
                config: { rows: 3, placeholder: 'What challenges are they facing?' },
              },
              {
                id: 'requirements',
                label: 'Requirements',
                path: 'requirements',
                type: 'textarea',
                config: { rows: 3, placeholder: 'Specific requirements or needs...' },
              },
            ],
          },

          // Timeline Section
          {
            id: 'bant-timeline',
            type: 'form',
            title: 'Timeline',
            icon: 'Calendar',
            collapsible: true,
            defaultExpanded: true,
            fields: [
              {
                id: 'bantTimeline',
                label: 'Timeline',
                path: 'bantTimeline',
                type: 'select',
                options: BANT_TIMELINE_OPTIONS,
                required: true,
              },
              {
                id: 'expectedStartDate',
                label: 'Expected Start Date',
                path: 'expectedStartDate',
                type: 'date',
              },
              {
                id: 'timelineNotes',
                label: 'Timeline Notes',
                path: 'timelineNotes',
                type: 'textarea',
                config: { rows: 3, placeholder: 'Any timeline constraints or considerations...' },
              },
            ],
          },
        ],
        actions: [
          {
            id: 'save-bant',
            type: 'mutation',
            label: 'Save Qualification',
            icon: 'Save',
            variant: 'primary',
            config: { type: 'mutation', procedure: 'ta.leads.updateBANT' },
          },
        ],
      },

      // Activity Tab
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
              {
                id: 'nextFollowUp',
                label: 'Next Follow-up',
                type: 'datetime',
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
                  input: { entityType: 'lead', entityId: { param: 'id' } },
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
                params: { entityType: 'lead', entityId: { param: 'id' } },
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

      // Deals Tab
      {
        id: 'deals',
        label: 'Deals',
        icon: 'Handshake',
        badge: {
          type: 'count',
          path: 'dealCount',
        },
        sections: [
          {
            id: 'deals-table',
            type: 'table',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.deals.listByLead',
                params: { leadId: { param: 'id' } },
              },
            },
            columns_config: [
              { id: 'title', header: 'Deal', accessor: 'title', type: 'text' },
              { id: 'value', header: 'Value', accessor: 'value', type: 'currency', config: { prefix: '$' } },
              { id: 'stage', header: 'Stage', accessor: 'stage', type: 'enum' },
              { id: 'probability', header: 'Prob.', accessor: 'probability', type: 'number', config: { suffix: '%' } },
              { id: 'expectedClose', header: 'Expected Close', accessor: 'expectedCloseDate', type: 'date' },
            ],
            rowClick: {
              type: 'navigate',
              route: { field: 'id', template: '/employee/workspace/ta/deals/{id}' },
            },
            emptyState: {
              title: 'No Deals Yet',
              description: 'Convert this lead to create a deal',
              icon: 'Handshake',
            },
            actions: [
              {
                id: 'create-deal',
                type: 'modal',
                label: 'Create Deal',
                icon: 'Plus',
                variant: 'outline',
                config: {
                  type: 'modal',
                  modal: 'create-deal',
                  props: { leadId: { param: 'id' } },
                },
              },
            ],
          },
        ],
      },

      // Campaigns Tab
      {
        id: 'campaigns',
        label: 'Campaigns',
        icon: 'Megaphone',
        badge: {
          type: 'count',
          path: 'campaignCount',
        },
        sections: [
          {
            id: 'campaigns-table',
            type: 'table',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.campaigns.listByLead',
                params: { leadId: { param: 'id' } },
              },
            },
            columns_config: [
              { id: 'name', header: 'Campaign', accessor: 'name', type: 'text' },
              { id: 'type', header: 'Type', accessor: 'campaignType', type: 'enum' },
              { id: 'status', header: 'Status', accessor: 'targetStatus', type: 'enum' },
              { id: 'sentAt', header: 'Sent', accessor: 'sentAt', type: 'date', config: { format: 'relative' } },
              { id: 'openedAt', header: 'Opened', accessor: 'openedAt', type: 'date', config: { format: 'relative' } },
              { id: 'respondedAt', header: 'Responded', accessor: 'respondedAt', type: 'date', config: { format: 'relative' } },
            ],
            rowClick: {
              type: 'navigate',
              route: { field: 'campaignId', template: '/employee/workspace/ta/campaigns/{campaignId}' },
            },
            emptyState: {
              title: 'Not in Any Campaigns',
              description: 'Add this lead to a campaign',
              icon: 'Megaphone',
            },
            actions: [
              {
                id: 'add-to-campaign',
                type: 'modal',
                label: 'Add to Campaign',
                icon: 'Plus',
                variant: 'outline',
                config: {
                  type: 'modal',
                  modal: 'add-to-campaign',
                  props: { leadId: { param: 'id' } },
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
        icon: 'FileText',
        sections: [
          {
            id: 'notes-section',
            type: 'custom',
            component: 'NotesEditor',
            componentProps: {
              entityType: 'lead',
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
      id: 'qualify-lead',
      type: 'modal',
      label: 'Qualify',
      icon: 'CheckCircle',
      variant: 'primary',
      visible: { field: 'stage', operator: 'neq', value: 'qualified' },
      config: {
        type: 'modal',
        modal: 'qualify-lead',
        props: { leadId: { param: 'id' } },
      },
    },
    {
      id: 'convert-to-deal',
      type: 'modal',
      label: 'Convert to Deal',
      icon: 'ArrowRight',
      variant: 'primary',
      visible: { field: 'stage', operator: 'eq', value: 'qualified' },
      config: {
        type: 'modal',
        modal: 'convert-lead-to-deal',
        props: { leadId: { param: 'id' } },
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
        props: { entityType: 'lead', entityId: { param: 'id' } },
      },
    },
    {
      id: 'schedule-follow-up',
      type: 'modal',
      label: 'Schedule Follow-up',
      icon: 'Calendar',
      variant: 'outline',
      config: {
        type: 'modal',
        modal: 'schedule-activity',
        props: { entityType: 'lead', entityId: { param: 'id' } },
      },
    },
    {
      id: 'edit-lead',
      type: 'navigate',
      label: 'Edit',
      icon: 'Pencil',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/ta/leads/{id}/edit' },
    },
    {
      id: 'disqualify-lead',
      type: 'modal',
      label: 'Disqualify',
      icon: 'X',
      variant: 'destructive',
      visible: { field: 'stage', operator: 'neq', value: 'disqualified' },
      config: {
        type: 'modal',
        modal: 'disqualify-lead',
        props: { leadId: { param: 'id' } },
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Leads',
      route: '/employee/workspace/ta/leads',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Leads', route: '/employee/workspace/ta/leads' },
      { label: { field: 'name' } },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'q', action: 'qualify-lead', description: 'Qualify lead' },
    { key: 'c', action: 'convert-to-deal', description: 'Convert to deal' },
    { key: 'a', action: 'log-activity', description: 'Log activity' },
    { key: 'e', action: 'edit-lead', description: 'Edit lead' },
  ],
};

export default leadDetailScreen;
