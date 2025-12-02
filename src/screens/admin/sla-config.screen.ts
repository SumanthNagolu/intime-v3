/**
 * SLA Configuration Screen Definition
 *
 * Configure Service Level Agreement settings and priority mappings.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ENTITY_TYPE_OPTIONS = [
  { value: 'submission', label: 'Submissions' },
  { value: 'interview', label: 'Interviews' },
  { value: 'offer', label: 'Offers' },
  { value: 'activity', label: 'Activities' },
  { value: 'lead', label: 'Leads' },
  { value: 'deal', label: 'Deals' },
];

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const TIME_UNIT_OPTIONS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'business_hours', label: 'Business Hours' },
  { value: 'business_days', label: 'Business Days' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const slaDefinitionsColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'SLA Name',
    path: 'name',
    type: 'text',
    sortable: true,
  },
  {
    id: 'entityType',
    label: 'Entity Type',
    path: 'entityType',
    type: 'enum',
    sortable: true,
    config: { options: ENTITY_TYPE_OPTIONS },
  },
  {
    id: 'metric',
    label: 'Metric',
    path: 'metric',
    type: 'text',
  },
  {
    id: 'target',
    label: 'Target',
    path: 'targetDisplay',
    type: 'text',
  },
  {
    id: 'warning',
    label: 'Warning At',
    path: 'warningThresholdDisplay',
    type: 'text',
  },
  {
    id: 'critical',
    label: 'Critical At',
    path: 'criticalThresholdDisplay',
    type: 'text',
  },
  {
    id: 'businessHours',
    label: 'Business Hours',
    path: 'useBusinessHours',
    type: 'boolean',
  },
  {
    id: 'enabled',
    label: 'Enabled',
    path: 'isActive',
    type: 'boolean',
  },
];

const priorityMappingsColumns: TableColumnDefinition[] = [
  {
    id: 'priority',
    label: 'Priority',
    path: 'priority',
    type: 'enum',
    config: {
      options: PRIORITY_OPTIONS,
      badgeColors: {
        critical: 'red',
        high: 'orange',
        medium: 'yellow',
        low: 'gray',
      },
    },
  },
  {
    id: 'responseTime',
    label: 'Response Time',
    path: 'responseTimeDisplay',
    type: 'text',
  },
  {
    id: 'resolutionTime',
    label: 'Resolution Time',
    path: 'resolutionTimeDisplay',
    type: 'text',
  },
  {
    id: 'escalationTime',
    label: 'Escalation Time',
    path: 'escalationTimeDisplay',
    type: 'text',
  },
  {
    id: 'notifyManager',
    label: 'Notify Manager',
    path: 'notifyManager',
    type: 'boolean',
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const slaConfigScreen: ScreenDefinition = {
  id: 'sla-config',
  type: 'detail',
  // entityType: 'slaConfig', // Admin entity

  title: 'SLA Configuration',
  subtitle: 'Configure service level agreements and response times',
  icon: 'Clock',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.sla.getConfig',
      params: {},
    },
  },

  // Layout
  layout: {
    type: 'tabs',
    defaultTab: 'definitions',
    tabs: [
      // SLA Definitions Tab
      {
        id: 'definitions',
        label: 'SLA Definitions',
        icon: 'Target',
        sections: [
          {
            id: 'metrics',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              { id: 'total', label: 'Total SLAs', type: 'number', path: 'stats.totalSlas' },
              { id: 'active', label: 'Active', type: 'number', path: 'stats.activeSlas' },
              { id: 'breached24h', label: 'Breached (24h)', type: 'number', path: 'stats.breached24h' },
              { id: 'avgCompliance', label: 'Avg Compliance', type: 'progress', path: 'stats.avgCompliance', config: { max: 100 } },
            ],
          },
          {
            id: 'sla-definitions-table',
            type: 'table',
            title: 'SLA Definitions',
            columns_config: slaDefinitionsColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.sla.listDefinitions',
                params: {},
              },
            },
            rowClick: {
              type: 'modal',
              modal: 'EditSlaDefinitionModal',
            },
            rowActions: [
              {
                id: 'edit',
                type: 'modal',
                label: 'Edit',
                icon: 'Pencil',
                config: { type: 'modal', modal: 'EditSlaDefinitionModal' },
              },
              {
                id: 'toggle',
                type: 'mutation',
                label: 'Toggle',
                icon: 'ToggleRight',
                config: { type: 'mutation', procedure: 'admin.sla.toggleDefinition' },
              },
              {
                id: 'delete',
                type: 'mutation',
                label: 'Delete',
                icon: 'Trash2',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'admin.sla.deleteDefinition' },
                confirm: {
                  title: 'Delete SLA Definition',
                  message: 'Are you sure you want to delete this SLA definition?',
                  destructive: true,
                },
              },
            ],
            actions: [
              {
                id: 'create',
                type: 'modal',
                label: 'Create SLA',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'CreateSlaDefinitionModal' },
              },
            ],
          },
        ],
      },
      // Priority Mappings Tab
      {
        id: 'priorities',
        label: 'Priority Mappings',
        icon: 'Flag',
        sections: [
          {
            id: 'priority-table',
            type: 'table',
            title: 'Priority Time Targets',
            description: 'Configure response and resolution times by priority',
            columns_config: priorityMappingsColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.sla.getPriorityMappings',
                params: {},
              },
            },
            rowClick: {
              type: 'modal',
              modal: 'EditPriorityMappingModal',
            },
            rowActions: [
              {
                id: 'edit',
                type: 'modal',
                label: 'Edit',
                icon: 'Pencil',
                config: { type: 'modal', modal: 'EditPriorityMappingModal' },
              },
            ],
          },
          {
            id: 'auto-priority',
            type: 'custom',
            title: 'Auto-Priority Rules',
            description: 'Automatically set priority based on conditions',
            component: 'AutoPriorityRulesEditor',
            componentProps: {
              rules: [
                { condition: 'VIP client', priority: 'critical' },
                { condition: 'Hot job', priority: 'high' },
                { condition: 'Standard job', priority: 'medium' },
              ],
            },
          },
        ],
      },
      // Escalation Rules Tab
      {
        id: 'escalations',
        label: 'Escalation Rules',
        icon: 'ArrowUpRight',
        sections: [
          {
            id: 'escalation-rules',
            type: 'custom',
            title: 'Escalation Chain',
            description: 'Define who gets notified when SLAs are at risk',
            component: 'EscalationChainEditor',
            componentProps: {
              levels: [
                { level: 1, name: 'Warning', targetMinutes: 60, notifyOwner: true },
                { level: 2, name: 'Escalate to Manager', targetMinutes: 120, notifyManager: true },
                { level: 3, name: 'Critical', targetMinutes: 180, notifyDirector: true },
              ],
            },
          },
          {
            id: 'notification-settings',
            type: 'form',
            title: 'Notification Settings',
            columns: 2,
            editable: true,
            fields: [
              {
                id: 'emailOnWarning',
                label: 'Email on Warning',
                type: 'checkbox',
                path: 'notifications.emailOnWarning',
                config: { defaultValue: true },
              },
              {
                id: 'emailOnBreach',
                label: 'Email on Breach',
                type: 'checkbox',
                path: 'notifications.emailOnBreach',
                config: { defaultValue: true },
              },
              {
                id: 'pushOnWarning',
                label: 'Push on Warning',
                type: 'checkbox',
                path: 'notifications.pushOnWarning',
                config: { defaultValue: true },
              },
              {
                id: 'pushOnBreach',
                label: 'Push on Breach',
                type: 'checkbox',
                path: 'notifications.pushOnBreach',
                config: { defaultValue: true },
              },
              {
                id: 'digestFrequency',
                label: 'SLA Digest Frequency',
                type: 'select',
                path: 'notifications.digestFrequency',
                options: [
                  { value: 'never', label: 'Never' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                ],
              },
            ],
            actions: [
              {
                id: 'save-notifications',
                type: 'mutation',
                label: 'Save Settings',
                variant: 'primary',
                icon: 'Save',
                config: { type: 'mutation', procedure: 'admin.sla.updateNotificationSettings' },
              },
            ],
          },
        ],
      },
      // Business Hours Tab
      {
        id: 'business-hours',
        label: 'Business Hours',
        icon: 'Calendar',
        sections: [
          {
            id: 'business-hours-editor',
            type: 'custom',
            title: 'Business Hours Configuration',
            description: 'SLAs using business hours will only count time during these periods',
            component: 'BusinessHoursEditor',
            componentProps: {
              showHolidays: true,
            },
          },
          {
            id: 'holidays',
            type: 'table',
            title: 'Holidays & Exceptions',
            columns_config: [
              { id: 'date', label: 'Date', path: 'date', type: 'date' },
              { id: 'name', label: 'Name', path: 'name', type: 'text' },
              { id: 'type', label: 'Type', path: 'type', type: 'enum', config: { options: [{ value: 'holiday', label: 'Holiday' }, { value: 'exception', label: 'Exception' }] } },
              { id: 'recurring', label: 'Recurring', path: 'recurring', type: 'boolean' },
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.sla.getHolidays',
                params: {},
              },
            },
            actions: [
              {
                id: 'add-holiday',
                type: 'modal',
                label: 'Add Holiday',
                icon: 'Plus',
                variant: 'secondary',
                config: { type: 'modal', modal: 'AddHolidayModal' },
              },
            ],
          },
        ],
      },
    ],
  },

  // Navigation
  navigation: {
    back: { label: 'Back to Workflows', route: '/admin/workflows' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Workflows', route: '/admin/workflows' },
      { label: 'SLA Configuration' },
    ],
  },
};

export default slaConfigScreen;
