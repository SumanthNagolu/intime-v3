/**
 * Settings Hub Screen Definition
 *
 * Central hub for all system settings in the admin panel.
 * Organized by category with quick access links.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const settingsHubScreen: ScreenDefinition = {
  id: 'settings-hub',
  type: 'dashboard',
  // entityType: 'organization', // Admin entity

  title: 'System Settings',
  subtitle: 'Configure organization and system preferences',
  icon: 'Settings',

  // Permissions
  permissions: [],

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Settings Categories Grid
      {
        id: 'settings-categories',
        type: 'custom',
        component: 'SettingsCategoryGrid',
        componentProps: {
          categories: [
            {
              id: 'organization',
              title: 'Organization Profile',
              description: 'Company info, branding, and timezone',
              icon: 'Building2',
              route: '/admin/settings/organization',
            },
            {
              id: 'security',
              title: 'Security',
              description: 'Password policy, 2FA, and session settings',
              icon: 'Shield',
              route: '/admin/settings/security',
            },
            {
              id: 'email',
              title: 'Email & Notifications',
              description: 'SMTP configuration and email templates',
              icon: 'Mail',
              route: '/admin/settings/email',
            },
            {
              id: 'integrations',
              title: 'Integrations',
              description: 'Connect job boards, calendars, and external services',
              icon: 'Plug',
              route: '/admin/integrations',
            },
            {
              id: 'features',
              title: 'Features & Modules',
              description: 'Enable or disable system features',
              icon: 'Puzzle',
              route: '/admin/features',
            },
            {
              id: 'data',
              title: 'Data & Privacy',
              description: 'Data retention, GDPR, and compliance',
              icon: 'Database',
              route: '/admin/settings/data',
            },
            {
              id: 'api',
              title: 'API & Webhooks',
              description: 'API keys, webhooks, and rate limits',
              icon: 'Code',
              route: '/admin/settings/api',
            },
            {
              id: 'workflows',
              title: 'Workflows',
              description: 'Configure workflow stages and transitions',
              icon: 'GitBranch',
              route: '/admin/workflows',
            },
          ],
          columns: 2,
        },
      },
      // Quick Settings
      {
        id: 'quick-settings',
        type: 'info-card',
        title: 'Quick Settings',
        description: 'Frequently accessed settings',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          {
            id: 'timezone',
            label: 'Default Timezone',
            type: 'text',
            path: 'settings.timezone',
          },
          {
            id: 'dateFormat',
            label: 'Date Format',
            type: 'text',
            path: 'settings.dateFormat',
          },
          {
            id: 'currencyCode',
            label: 'Currency',
            type: 'text',
            path: 'settings.currencyCode',
          },
          {
            id: 'sessionTimeout',
            label: 'Session Timeout',
            type: 'text',
            path: 'settings.sessionTimeout',
          },
        ],
        actions: [
          {
            id: 'edit-quick',
            type: 'navigate',
            label: 'Edit Settings',
            icon: 'Settings',
            config: { type: 'navigate', route: '/admin/settings/organization' },
          },
        ],
      },
      // Recent Settings Changes
      {
        id: 'recent-changes',
        type: 'table',
        title: 'Recent Settings Changes',
        icon: 'History',
        collapsible: true,
        defaultExpanded: false,
        columns_config: [
          { id: 'setting', label: 'Setting', path: 'settingName', type: 'text' },
          { id: 'oldValue', label: 'Old Value', path: 'oldValue', type: 'text' },
          { id: 'newValue', label: 'New Value', path: 'newValue', type: 'text' },
          { id: 'changedBy', label: 'Changed By', path: 'actor.fullName', type: 'text' },
          { id: 'changedAt', label: 'When', path: 'timestamp', type: 'date', config: { format: 'relative' } },
        ],
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'admin.settings.getRecentChanges',
            params: { limit: 10 },
          },
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'export-settings',
      type: 'custom',
      label: 'Export Settings',
      variant: 'secondary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExportSettings' },
    },
    {
      id: 'import-settings',
      type: 'modal',
      label: 'Import Settings',
      variant: 'secondary',
      icon: 'Upload',
      config: { type: 'modal', modal: 'ImportSettingsModal' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Admin', route: '/admin' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Settings' },
    ],
  },
};

export default settingsHubScreen;
