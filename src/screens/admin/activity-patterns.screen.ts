/**
 * Activity Patterns Screen Definition
 *
 * Configure auto-created activity rules triggered by system events.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const PATTERN_CATEGORY_OPTIONS = [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'bench_sales', label: 'Bench Sales' },
  { value: 'crm', label: 'CRM' },
  { value: 'hr', label: 'HR' },
  { value: 'general', label: 'General' },
];

const ACTIVITY_TYPE_OPTIONS = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' },
  { value: 'review', label: 'Review' },
  { value: 'follow_up', label: 'Follow Up' },
];

const ASSIGNEE_RULE_OPTIONS = [
  { value: 'owner', label: 'Entity Owner' },
  { value: 'creator', label: 'Record Creator' },
  { value: 'manager', label: 'Manager' },
  { value: 'responsible', label: 'RACI Responsible' },
  { value: 'accountable', label: 'RACI Accountable' },
];

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const patternsTableColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Pattern Name',
    path: 'name',
    type: 'text',
    sortable: true,
    config: {
      subtitle: { path: 'patternCode', style: 'monospace' },
    },
  },
  {
    id: 'category',
    label: 'Category',
    path: 'category',
    type: 'enum',
    sortable: true,
    config: {
      options: PATTERN_CATEGORY_OPTIONS,
      badgeColors: {
        recruiting: 'blue',
        bench_sales: 'purple',
        crm: 'green',
        hr: 'cyan',
        general: 'gray',
      },
    },
  },
  {
    id: 'triggerEvent',
    label: 'Trigger Event',
    path: 'triggerEvent',
    type: 'text',
    config: { monospace: true },
  },
  {
    id: 'activityType',
    label: 'Activity Type',
    path: 'activityType',
    type: 'enum',
    config: { options: ACTIVITY_TYPE_OPTIONS },
  },
  {
    id: 'assignTo',
    label: 'Assign To',
    path: 'assignTo.type',
    type: 'enum',
    config: { options: ASSIGNEE_RULE_OPTIONS },
  },
  {
    id: 'sla',
    label: 'SLA',
    path: 'slaHours',
    type: 'number',
    config: { suffix: 'h' },
  },
  {
    id: 'enabled',
    label: 'Enabled',
    path: 'isActive',
    type: 'boolean',
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const activityPatternsScreen: ScreenDefinition = {
  id: 'activity-patterns',
  type: 'list',
  // entityType: 'activityPattern', // Admin entity

  title: 'Activity Patterns',
  subtitle: 'Configure auto-created activities triggered by system events',
  icon: 'Workflow',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'list',
    // entityType: 'activityPattern', // Admin entity
    sort: { field: 'category', direction: 'asc' },
    pagination: false,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'total', label: 'Total Patterns', type: 'number', path: 'stats.total' },
          { id: 'active', label: 'Active', type: 'number', path: 'stats.active' },
          { id: 'triggered', label: 'Triggered (24h)', type: 'number', path: 'stats.triggered24h' },
          { id: 'activitiesCreated', label: 'Activities Created (24h)', type: 'number', path: 'stats.activitiesCreated24h' },
        ],
        dataSource: {
          type: 'aggregate',
          // entityType: 'activityPattern', // Admin entity
        },
      },
      // Category Tabs
      {
        id: 'category-tabs',
        type: 'custom',
        component: 'CategoryTabs',
        componentProps: {
          tabs: [
            { id: 'all', label: 'All', countPath: 'stats.total' },
            { id: 'recruiting', label: 'Recruiting', countPath: 'stats.recruiting' },
            { id: 'bench_sales', label: 'Bench Sales', countPath: 'stats.benchSales' },
            { id: 'crm', label: 'CRM', countPath: 'stats.crm' },
            { id: 'hr', label: 'HR', countPath: 'stats.hr' },
          ],
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
            label: 'Search',
            type: 'text',
            path: 'search',
            config: { placeholder: 'Search patterns...' },
          },
          {
            id: 'activityType',
            label: 'Activity Type',
            type: 'multiselect',
            path: 'filters.activityType',
            options: [...ACTIVITY_TYPE_OPTIONS],
          },
          {
            id: 'enabled',
            label: 'Status',
            type: 'select',
            path: 'filters.enabled',
            options: [
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active only' },
              { value: 'inactive', label: 'Inactive only' },
            ],
          },
        ],
      },
      // Patterns Table
      {
        id: 'patterns-table',
        type: 'table',
        columns_config: patternsTableColumns,
        rowClick: {
          type: 'modal',
          modal: 'EditActivityPatternModal',
        },
        rowActions: [
          {
            id: 'edit',
            type: 'modal',
            label: 'Edit',
            icon: 'Pencil',
            config: { type: 'modal', modal: 'EditActivityPatternModal' },
          },
          {
            id: 'toggle',
            type: 'mutation',
            label: 'Toggle',
            icon: 'ToggleRight',
            config: { type: 'mutation', procedure: 'admin.activityPatterns.toggle' },
          },
          {
            id: 'duplicate',
            type: 'mutation',
            label: 'Duplicate',
            icon: 'Copy',
            config: { type: 'mutation', procedure: 'admin.activityPatterns.duplicate' },
          },
          {
            id: 'test',
            type: 'modal',
            label: 'Test',
            icon: 'Play',
            config: { type: 'modal', modal: 'TestActivityPatternModal' },
          },
          {
            id: 'delete',
            type: 'mutation',
            label: 'Delete',
            icon: 'Trash2',
            variant: 'destructive',
            config: { type: 'mutation', procedure: 'admin.activityPatterns.delete' },
            confirm: {
              title: 'Delete Pattern',
              message: 'This pattern will no longer trigger. Are you sure?',
              destructive: true,
            },
          },
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create',
      type: 'modal',
      label: 'Create Pattern',
      variant: 'primary',
      icon: 'Plus',
      config: { type: 'modal', modal: 'CreateActivityPatternModal' },
    },
    {
      id: 'import',
      type: 'modal',
      label: 'Import',
      variant: 'secondary',
      icon: 'Upload',
      config: { type: 'modal', modal: 'ImportPatternsModal' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      variant: 'secondary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExportPatterns' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Workflows', route: '/admin/workflows' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Workflows', route: '/admin/workflows' },
      { label: 'Activity Patterns' },
    ],
  },
};

export default activityPatternsScreen;
