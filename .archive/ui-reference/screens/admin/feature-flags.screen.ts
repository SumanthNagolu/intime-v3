/**
 * Feature Flags Screen Definition
 *
 * Manage feature flags and rollout settings.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const FLAG_STATUS_OPTIONS = [
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'partial', label: 'Partial Rollout' },
];

const FLAG_CATEGORY_OPTIONS = [
  { value: 'features', label: 'Features' },
  { value: 'ui', label: 'UI/UX' },
  { value: 'beta', label: 'Beta' },
  { value: 'experimental', label: 'Experimental' },
  { value: 'deprecated', label: 'Deprecated' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const featureFlagsColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Feature',
    path: 'name',
    type: 'text',
    sortable: true,
    config: {
      icon: { path: 'icon' },
      subtitle: { path: 'key', style: 'monospace' },
    },
  },
  {
    id: 'description',
    label: 'Description',
    path: 'description',
    type: 'text',
  },
  {
    id: 'category',
    label: 'Category',
    path: 'category',
    type: 'enum',
    sortable: true,
    config: {
      options: FLAG_CATEGORY_OPTIONS,
      badgeColors: {
        features: 'blue',
        ui: 'cyan',
        beta: 'purple',
        experimental: 'orange',
        deprecated: 'gray',
      },
    },
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: FLAG_STATUS_OPTIONS,
      badgeColors: {
        enabled: 'green',
        disabled: 'gray',
        partial: 'yellow',
      },
    },
  },
  {
    id: 'rollout',
    label: 'Rollout',
    path: 'rolloutPercentage',
    type: 'progress',
    config: { max: 100 },
  },
  {
    id: 'users',
    label: 'Users',
    path: 'affectedUsersCount',
    type: 'number',
  },
  {
    id: 'updatedAt',
    label: 'Last Changed',
    path: 'updatedAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const featureFlagsScreen: ScreenDefinition = {
  id: 'feature-flags',
  type: 'list',
  // entityType: 'featureFlag', // Admin entity

  title: 'Feature Flags',
  subtitle: 'Control feature availability and rollout',
  icon: 'Flag',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'list',
    // entityType: 'featureFlag', // Admin entity
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
          { id: 'total', label: 'Total Flags', type: 'number', path: 'stats.total' },
          { id: 'enabled', label: 'Enabled', type: 'number', path: 'stats.enabled' },
          { id: 'partial', label: 'Partial Rollout', type: 'number', path: 'stats.partial' },
          { id: 'disabled', label: 'Disabled', type: 'number', path: 'stats.disabled' },
        ],
        dataSource: {
          type: 'aggregate',
          // entityType: 'featureFlag', // Admin entity
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
            config: { placeholder: 'Search flags...' },
          },
          {
            id: 'category',
            label: 'Category',
            type: 'multiselect',
            path: 'filters.category',
            options: [...FLAG_CATEGORY_OPTIONS],
          },
          {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            path: 'filters.status',
            options: [...FLAG_STATUS_OPTIONS],
          },
        ],
      },
      // Feature Flags Table
      {
        id: 'feature-flags-table',
        type: 'table',
        columns_config: featureFlagsColumns,
        rowClick: {
          type: 'modal',
          modal: 'EditFeatureFlagModal',
        },
        rowActions: [
          {
            id: 'toggle',
            type: 'mutation',
            label: 'Toggle',
            icon: 'ToggleRight',
            config: { type: 'mutation', procedure: 'admin.featureFlags.toggle' },
          },
          {
            id: 'edit',
            type: 'modal',
            label: 'Edit',
            icon: 'Pencil',
            config: { type: 'modal', modal: 'EditFeatureFlagModal' },
          },
          {
            id: 'set-rollout',
            type: 'modal',
            label: 'Set Rollout',
            icon: 'Sliders',
            config: { type: 'modal', modal: 'SetRolloutModal' },
          },
          {
            id: 'view-users',
            type: 'modal',
            label: 'View Affected Users',
            icon: 'Users',
            config: { type: 'modal', modal: 'AffectedUsersModal' },
            visible: { field: 'status', operator: 'neq', value: 'disabled' },
          },
        ],
      },
      // Quick Actions
      {
        id: 'quick-toggles',
        type: 'custom',
        title: 'Quick Actions',
        component: 'FeatureFlagQuickToggles',
        componentProps: {
          showCategories: ['beta', 'experimental'],
        },
        collapsible: true,
        defaultExpanded: false,
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create',
      type: 'modal',
      label: 'Create Flag',
      variant: 'primary',
      icon: 'Plus',
      config: { type: 'modal', modal: 'CreateFeatureFlagModal' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      variant: 'secondary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExportFlags' },
    },
    {
      id: 'import',
      type: 'modal',
      label: 'Import',
      variant: 'secondary',
      icon: 'Upload',
      config: { type: 'modal', modal: 'ImportFeatureFlagsModal' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Admin', route: '/admin' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Feature Flags' },
    ],
  },
};

export default featureFlagsScreen;
