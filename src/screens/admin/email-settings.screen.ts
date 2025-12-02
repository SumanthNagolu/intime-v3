/**
 * Email Settings Screen Definition
 *
 * Configure email sending, templates, and notification preferences.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const EMAIL_PROVIDER_OPTIONS = [
  { value: 'smtp', label: 'Custom SMTP' },
  { value: 'sendgrid', label: 'SendGrid' },
  { value: 'mailgun', label: 'Mailgun' },
  { value: 'ses', label: 'Amazon SES' },
  { value: 'postmark', label: 'Postmark' },
];

const EMAIL_TEMPLATE_CATEGORY_OPTIONS = [
  { value: 'auth', label: 'Authentication' },
  { value: 'notification', label: 'Notifications' },
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'bench', label: 'Bench Sales' },
  { value: 'system', label: 'System' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const templatesTableColumns: TableColumnDefinition[] = [
  { id: 'name', label: 'Template Name', path: 'name', type: 'text', sortable: true },
  {
    id: 'category',
    label: 'Category',
    path: 'category',
    type: 'enum',
    sortable: true,
    config: {
      options: EMAIL_TEMPLATE_CATEGORY_OPTIONS,
      badgeColors: {
        auth: 'red',
        notification: 'blue',
        recruiting: 'green',
        bench: 'purple',
        system: 'gray',
      },
    },
  },
  { id: 'subject', label: 'Subject', path: 'subject', type: 'text' },
  { id: 'lastUpdated', label: 'Last Updated', path: 'updatedAt', type: 'date', sortable: true },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const emailSettingsScreen: ScreenDefinition = {
  id: 'email-settings',
  type: 'detail',
  // entityType: 'organization', // Admin entity

  title: 'Email & Notifications',
  subtitle: 'Configure email sending and notification templates',
  icon: 'Mail',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.settings.getEmail',
      params: {},
    },
  },

  // Layout
  layout: {
    type: 'tabs',
    defaultTab: 'configuration',
    tabs: [
      // Configuration Tab
      {
        id: 'configuration',
        label: 'Configuration',
        icon: 'Settings',
        sections: [
          // Email Provider
          {
            id: 'email-provider',
            type: 'form',
            title: 'Email Provider',
            description: 'Configure email delivery service',
            icon: 'Send',
            columns: 2,
            editable: true,
            fields: [
              {
                id: 'provider',
                label: 'Email Provider',
                type: 'select',
                path: 'provider',
                options: [...EMAIL_PROVIDER_OPTIONS],
                config: { required: true },
              },
              {
                id: 'fromName',
                label: 'Default Sender Name',
                type: 'text',
                path: 'fromName',
                config: { placeholder: 'InTime Staffing', required: true },
              },
              {
                id: 'fromEmail',
                label: 'Default Sender Email',
                type: 'email',
                path: 'fromEmail',
                config: { placeholder: 'noreply@company.com', required: true },
              },
              {
                id: 'replyToEmail',
                label: 'Reply-To Email',
                type: 'email',
                path: 'replyToEmail',
                config: { placeholder: 'support@company.com' },
              },
            ],
            actions: [
              {
                id: 'test-email',
                type: 'modal',
                label: 'Send Test Email',
                variant: 'outline',
                icon: 'Send',
                config: { type: 'modal', modal: 'TestEmailModal' },
              },
              {
                id: 'save-provider',
                type: 'mutation',
                label: 'Save',
                variant: 'primary',
                icon: 'Save',
                config: { type: 'mutation', procedure: 'admin.settings.updateEmailProvider' },
              },
            ],
          },
          // SMTP Settings (conditional)
          {
            id: 'smtp-settings',
            type: 'form',
            title: 'SMTP Configuration',
            icon: 'Server',
            columns: 2,
            editable: true,
            visible: { field: 'provider', operator: 'eq', value: 'smtp' },
            fields: [
              {
                id: 'smtpHost',
                label: 'SMTP Host',
                type: 'text',
                path: 'smtp.host',
                config: { placeholder: 'smtp.gmail.com' },
              },
              {
                id: 'smtpPort',
                label: 'SMTP Port',
                type: 'number',
                path: 'smtp.port',
                config: { min: 1, max: 65535, defaultValue: 587 },
              },
              {
                id: 'smtpUsername',
                label: 'Username',
                type: 'text',
                path: 'smtp.username',
              },
              {
                id: 'smtpPassword',
                label: 'Password',
                type: 'text',
                path: 'smtp.password',
              },
              {
                id: 'smtpSecure',
                label: 'Use TLS/SSL',
                type: 'checkbox',
                path: 'smtp.secure',
                config: { defaultValue: true },
              },
            ],
            actions: [
              {
                id: 'verify-smtp',
                type: 'custom',
                label: 'Verify Connection',
                variant: 'outline',
                icon: 'CheckCircle',
                config: { type: 'custom', handler: 'handleVerifySMTP' },
              },
            ],
          },
          // API Key Settings (conditional for services)
          {
            id: 'api-key-settings',
            type: 'form',
            title: 'API Configuration',
            icon: 'Key',
            columns: 1,
            editable: true,
            visible: { field: 'provider', operator: 'neq', value: 'smtp' },
            fields: [
              {
                id: 'apiKey',
                label: 'API Key',
                type: 'text',
                path: 'apiKey',
                config: { placeholder: 'Enter your API key...' },
              },
              {
                id: 'apiRegion',
                label: 'Region (if applicable)',
                type: 'text',
                path: 'apiRegion',
                config: { placeholder: 'us-east-1' },
              },
            ],
          },
        ],
      },
      // Templates Tab
      {
        id: 'templates',
        label: 'Templates',
        icon: 'FileText',
        sections: [
          {
            id: 'templates-filter',
            type: 'form',
            inline: true,
            fields: [
              {
                id: 'search',
                label: 'Search',
                type: 'text',
                path: 'search',
                config: { placeholder: 'Search templates...' },
              },
              {
                id: 'category',
                label: 'Category',
                type: 'multiselect',
                path: 'filters.category',
                options: [...EMAIL_TEMPLATE_CATEGORY_OPTIONS],
              },
            ],
          },
          {
            id: 'templates-table',
            type: 'table',
            columns_config: templatesTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.emailTemplates.list',
                params: {},
              },
            },
            rowClick: {
              type: 'modal',
              modal: 'EditEmailTemplateModal',
            },
            rowActions: [
              {
                id: 'edit',
                type: 'modal',
                label: 'Edit',
                icon: 'Pencil',
                config: { type: 'modal', modal: 'EditEmailTemplateModal' },
              },
              {
                id: 'preview',
                type: 'modal',
                label: 'Preview',
                icon: 'Eye',
                config: { type: 'modal', modal: 'PreviewEmailTemplateModal' },
              },
              {
                id: 'duplicate',
                type: 'mutation',
                label: 'Duplicate',
                icon: 'Copy',
                config: { type: 'mutation', procedure: 'admin.emailTemplates.duplicate' },
              },
            ],
            actions: [
              {
                id: 'create-template',
                type: 'modal',
                label: 'Create Template',
                icon: 'Plus',
                variant: 'secondary',
                config: { type: 'modal', modal: 'CreateEmailTemplateModal' },
              },
            ],
          },
        ],
      },
      // Notifications Tab
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'Bell',
        sections: [
          {
            id: 'notification-settings',
            type: 'custom',
            title: 'Notification Preferences',
            description: 'Configure which events trigger notifications',
            component: 'NotificationPreferencesEditor',
            componentProps: {
              categories: [
                {
                  id: 'recruiting',
                  label: 'Recruiting',
                  events: [
                    { id: 'new_submission', label: 'New Submission', defaultEmail: true, defaultPush: true },
                    { id: 'submission_status', label: 'Submission Status Change', defaultEmail: true, defaultPush: true },
                    { id: 'interview_scheduled', label: 'Interview Scheduled', defaultEmail: true, defaultPush: true },
                    { id: 'offer_extended', label: 'Offer Extended', defaultEmail: true, defaultPush: true },
                  ],
                },
                {
                  id: 'system',
                  label: 'System',
                  events: [
                    { id: 'task_assigned', label: 'Task Assigned', defaultEmail: true, defaultPush: true },
                    { id: 'task_due', label: 'Task Due Soon', defaultEmail: true, defaultPush: true },
                    { id: 'mention', label: 'Mentioned in Note', defaultEmail: true, defaultPush: true },
                  ],
                },
                {
                  id: 'admin',
                  label: 'Admin',
                  events: [
                    { id: 'new_user', label: 'New User Registered', defaultEmail: true, defaultPush: false },
                    { id: 'security_alert', label: 'Security Alert', defaultEmail: true, defaultPush: true },
                    { id: 'system_error', label: 'System Error', defaultEmail: true, defaultPush: true },
                  ],
                },
              ],
            },
          },
          {
            id: 'digest-settings',
            type: 'form',
            title: 'Email Digest Settings',
            columns: 2,
            editable: true,
            fields: [
              {
                id: 'enableDigest',
                label: 'Enable Email Digest',
                type: 'checkbox',
                path: 'digest.enabled',
                config: { defaultValue: true },
              },
              {
                id: 'digestFrequency',
                label: 'Digest Frequency',
                type: 'select',
                path: 'digest.frequency',
                options: [
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                ],
              },
              {
                id: 'digestTime',
                label: 'Send Time',
                type: 'time',
                path: 'digest.sendTime',
                config: { defaultValue: '08:00' },
              },
              {
                id: 'digestDay',
                label: 'Send Day (Weekly)',
                type: 'select',
                path: 'digest.sendDay',
                options: [
                  { value: 'monday', label: 'Monday' },
                  { value: 'friday', label: 'Friday' },
                ],
                visible: { field: 'digest.frequency', operator: 'eq', value: 'weekly' },
              },
            ],
            actions: [
              {
                id: 'save-digest',
                type: 'mutation',
                label: 'Save Digest Settings',
                variant: 'primary',
                icon: 'Save',
                config: { type: 'mutation', procedure: 'admin.settings.updateDigestSettings' },
              },
            ],
          },
        ],
      },
    ],
  },

  // Navigation
  navigation: {
    back: { label: 'Back to Settings', route: '/admin/settings' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Settings', route: '/admin/settings' },
      { label: 'Email' },
    ],
  },
};

export default emailSettingsScreen;
