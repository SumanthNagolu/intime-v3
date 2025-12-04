/**
 * TA Leads Screen Definition
 *
 * Lead management screen for Talent Acquisition with:
 * - Kanban view by stage (New → Contacted → Engaged → Qualifying → Qualified)
 * - Table view with filtering and sorting
 * - BANT qualification indicators
 * - Quick actions for stage progression
 *
 * Routes: /employee/workspace/ta/leads
 *
 * @see docs/specs/20-USER-ROLES/03-ta/05-generate-leads.md
 * @see docs/specs/20-USER-ROLES/03-ta/06-qualify-lead.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import {
  TA_LEAD_STAGE_OPTIONS,
  BANT_SCORE_OPTIONS,
} from '@/lib/metadata/options/ta-options';
import {
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  INDUSTRY_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// TABLE COLUMNS
// ==========================================

const leadTableColumns = [
  {
    id: 'name',
    header: 'Lead',
    accessor: 'name',
    type: 'composite',
    sortable: true,
    width: '250px',
    config: {
      primary: { path: 'name' },
      secondary: { path: 'company' },
      avatar: { path: 'name', type: 'initials' },
    },
  },
  {
    id: 'stage',
    header: 'Stage',
    accessor: 'stage',
    type: 'enum',
    sortable: true,
    config: {
      options: TA_LEAD_STAGE_OPTIONS,
      badgeColors: {
        new: 'blue',
        contacted: 'cyan',
        engaged: 'amber',
        qualifying: 'orange',
        qualified: 'green',
        disqualified: 'red',
      },
    },
  },
  {
    id: 'bantScore',
    header: 'BANT Score',
    accessor: 'bantScore',
    type: 'custom',
    config: {
      component: 'BANTScoreIndicator',
      props: {
        budgetPath: 'bantBudget',
        authorityPath: 'bantAuthority',
        needPath: 'bantNeed',
        timelinePath: 'bantTimeline',
      },
    },
  },
  {
    id: 'source',
    header: 'Source',
    accessor: 'leadSource',
    type: 'enum',
    config: {
      options: LEAD_SOURCE_OPTIONS,
    },
  },
  {
    id: 'industry',
    header: 'Industry',
    accessor: 'industry',
    type: 'enum',
    config: {
      options: INDUSTRY_OPTIONS,
    },
  },
  {
    id: 'estimatedValue',
    header: 'Est. Value',
    accessor: 'estimatedValue',
    type: 'currency',
    sortable: true,
    config: { prefix: '$' },
  },
  {
    id: 'lastActivity',
    header: 'Last Activity',
    accessor: 'lastActivityAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
  {
    id: 'owner',
    header: 'Owner',
    accessor: 'ownerName',
    type: 'text',
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessor: 'createdAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
];

// ==========================================
// KANBAN CONFIGURATION
// ==========================================

const kanbanConfig = {
  stages: TA_LEAD_STAGE_OPTIONS.filter(s => s.value !== 'disqualified'),
  cardConfig: {
    titlePath: 'name',
    subtitlePath: 'company',
    avatarPath: 'name',
    badges: [
      { path: 'leadSource', type: 'enum', options: LEAD_SOURCE_OPTIONS },
    ],
    metrics: [
      { label: 'Est. Value', path: 'estimatedValue', format: 'currency' },
    ],
    footer: {
      leftPath: 'lastActivityAt',
      leftFormat: 'relative',
      rightPath: 'ownerName',
    },
    bantIndicator: {
      budgetPath: 'bantBudget',
      authorityPath: 'bantAuthority',
      needPath: 'bantNeed',
      timelinePath: 'bantTimeline',
    },
  },
  onDragEnd: {
    mutation: 'ta.leads.updateStage',
    inputMapping: {
      leadId: 'id',
      stage: 'newStage',
    },
  },
};

// ==========================================
// TA LEADS SCREEN
// ==========================================

export const taLeadsScreen: ScreenDefinition = {
  id: 'ta-leads',
  type: 'list',
  entityType: 'lead',
  title: 'Leads',
  subtitle: 'Manage and qualify your sales leads',
  icon: 'Users',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.leads.list',
      params: {},
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Metrics Row
      {
        id: 'lead-metrics',
        type: 'metrics-grid',
        columns: 6,
        widgets: [
          {
            id: 'total',
            type: 'metric',
            label: 'Total Leads',
            path: 'stats.total',
            config: { icon: 'Users' },
          },
          {
            id: 'new',
            type: 'metric',
            label: 'New',
            path: 'stats.byStage.new',
            config: { icon: 'UserPlus', variant: 'blue' },
          },
          {
            id: 'contacted',
            type: 'metric',
            label: 'Contacted',
            path: 'stats.byStage.contacted',
            config: { icon: 'Phone', variant: 'cyan' },
          },
          {
            id: 'engaged',
            type: 'metric',
            label: 'Engaged',
            path: 'stats.byStage.engaged',
            config: { icon: 'MessageCircle', variant: 'amber' },
          },
          {
            id: 'qualifying',
            type: 'metric',
            label: 'Qualifying',
            path: 'stats.byStage.qualifying',
            config: { icon: 'ClipboardCheck', variant: 'orange' },
          },
          {
            id: 'qualified',
            type: 'metric',
            label: 'Qualified',
            path: 'stats.byStage.qualified',
            config: { icon: 'CheckCircle', variant: 'green' },
          },
        ],
      },

      // Filters Section
      {
        id: 'filters',
        type: 'field-grid',
        inline: true,
        columns: 5,
        fields: [
          {
            id: 'search',
            type: 'search',
            placeholder: 'Search leads...',
            config: { fields: ['name', 'company', 'email'] },
          },
          {
            id: 'stage',
            type: 'multi-select',
            label: 'Stage',
            options: TA_LEAD_STAGE_OPTIONS,
          },
          {
            id: 'source',
            type: 'multi-select',
            label: 'Source',
            options: LEAD_SOURCE_OPTIONS,
          },
          {
            id: 'industry',
            type: 'multi-select',
            label: 'Industry',
            options: INDUSTRY_OPTIONS,
          },
          {
            id: 'bantScore',
            type: 'multi-select',
            label: 'BANT Score',
            options: BANT_SCORE_OPTIONS,
          },
        ],
      },

      // View Toggle & Table/Kanban
      {
        id: 'leads-view',
        type: 'custom',
        component: 'ViewToggleContainer',
        componentProps: {
          views: ['kanban', 'table'],
          defaultView: 'kanban',
          kanbanConfig,
          tableConfig: {
            columns: leadTableColumns,
            selectable: true,
            rowClick: {
              type: 'navigate',
              route: { field: 'id', template: '/employee/workspace/ta/leads/{id}' },
            },
          },
        },
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'create-lead',
      type: 'navigate',
      label: 'New Lead',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/ta/leads/new' },
    },
    {
      id: 'import-leads',
      type: 'modal',
      label: 'Import',
      icon: 'Upload',
      variant: 'outline',
      config: { type: 'modal', modal: 'import-leads' },
    },
    {
      id: 'export-leads',
      type: 'custom',
      label: 'Export',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportLeads' },
    },
  ],

  // Bulk Actions
  bulkActions: [
    {
      id: 'bulk-assign',
      type: 'modal',
      label: 'Assign Owner',
      icon: 'UserCheck',
      config: { type: 'modal', modal: 'bulk-assign-owner' },
    },
    {
      id: 'bulk-stage',
      type: 'modal',
      label: 'Update Stage',
      icon: 'ArrowRight',
      config: { type: 'modal', modal: 'bulk-update-stage' },
    },
    {
      id: 'bulk-add-to-campaign',
      type: 'modal',
      label: 'Add to Campaign',
      icon: 'Megaphone',
      config: { type: 'modal', modal: 'add-to-campaign' },
    },
    {
      id: 'bulk-delete',
      type: 'mutation',
      label: 'Delete',
      icon: 'Trash',
      variant: 'destructive',
      config: { type: 'mutation', procedure: 'ta.leads.bulkDelete' },
      confirm: {
        title: 'Delete Selected Leads',
        message: 'Are you sure you want to delete the selected leads? This action cannot be undone.',
        destructive: true,
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Leads' },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'n', action: 'create-lead', description: 'Create new lead' },
    { key: 'k', action: 'toggle-kanban', description: 'Toggle kanban view' },
    { key: 't', action: 'toggle-table', description: 'Toggle table view' },
    { key: '/', action: 'focus-search', description: 'Focus search' },
  ],
};

export default taLeadsScreen;
