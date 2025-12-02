/**
 * Client Settings Screen
 *
 * Client portal settings and preferences.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const clientSettingsScreen: ScreenDefinition = {
  id: 'client-settings',
  type: 'detail',
  title: 'Settings',
  subtitle: 'Manage your portal preferences',
  icon: 'Settings',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.client.getSettings',
      params: {},
    },
  },

  layout: {
    type: 'tabs',
    defaultTab: 'preferences',
    tabs: [
      // ===========================================
      // ACCOUNT PREFERENCES TAB
      // ===========================================
      {
        id: 'preferences',
        label: 'Preferences',
        icon: 'Sliders',
        sections: [
          {
            id: 'notification-settings',
            type: 'form',
            title: 'Notification Preferences',
            fields: [
              {
                id: 'email-notifications',
                type: 'checkbox',
                label: 'Email Notifications',
                path: 'preferences.emailNotifications',
              },
              {
                id: 'submission-alerts',
                type: 'checkbox',
                label: 'New Submission Alerts',
                path: 'preferences.submissionAlerts',
              },
              {
                id: 'interview-reminders',
                type: 'checkbox',
                label: 'Interview Reminders',
                path: 'preferences.interviewReminders',
              },
              {
                id: 'timesheet-reminders',
                type: 'checkbox',
                label: 'Timesheet Approval Reminders',
                path: 'preferences.timesheetReminders',
              },
              {
                id: 'notification-frequency',
                type: 'select',
                label: 'Email Frequency',
                path: 'preferences.notificationFrequency',
                config: {
                  options: [
                    { value: 'instant', label: 'Instant' },
                    { value: 'daily', label: 'Daily Digest' },
                    { value: 'weekly', label: 'Weekly Summary' },
                  ],
                },
              },
            ],
            actions: [
              {
                id: 'save-preferences',
                label: 'Save Preferences',
                type: 'mutation',
                variant: 'primary',
                config: {
                  type: 'mutation',
                  procedure: 'portal.client.updatePreferences',
                  input: { preferences: { type: 'context', path: 'formState.values' } },
                },
              },
            ],
          },
          {
            id: 'communication-settings',
            type: 'form',
            title: 'Communication Preferences',
            fields: [
              {
                id: 'preferred-contact',
                type: 'select',
                label: 'Preferred Contact Method',
                path: 'preferences.preferredContact',
                config: {
                  options: [
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'both', label: 'Both' },
                  ],
                },
              },
              {
                id: 'timezone',
                type: 'select',
                label: 'Timezone',
                path: 'preferences.timezone',
                config: {
                  placeholder: 'Select timezone',
                  dataSource: { type: 'static', data: [] }, // Would be populated with timezones
                },
              },
            ],
          },
        ],
      },

      // ===========================================
      // TEAM MEMBERS TAB
      // ===========================================
      {
        id: 'team',
        label: 'Team Members',
        icon: 'Users',
        sections: [
          {
            id: 'team-members-table',
            type: 'table',
            title: 'Team Members',
            dataSource: {
              type: 'custom',
              query: { procedure: 'portal.client.getTeamMembers' },
            },
            columns_config: [
              { id: 'name', header: 'Name', path: 'name', type: 'text' },
              { id: 'email', header: 'Email', path: 'email', type: 'email' },
              { id: 'role', header: 'Role', path: 'role', type: 'text' },
              {
                id: 'status',
                header: 'Status',
                path: 'status',
                type: 'enum',
                config: {
                  options: [
                    { value: 'active', label: 'Active' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'inactive', label: 'Inactive' },
                  ],
                  badgeColors: { active: 'green', pending: 'yellow', inactive: 'gray' },
                },
              },
              { id: 'lastLogin', header: 'Last Login', path: 'lastLoginAt', type: 'datetime' },
            ],
            rowActions: [
              {
                id: 'edit',
                label: 'Edit',
                type: 'modal',
                icon: 'Edit',
                config: { type: 'modal', modal: 'EditTeamMember', props: { userId: { type: 'field', path: 'id' } } },
              },
              {
                id: 'deactivate',
                label: 'Deactivate',
                type: 'mutation',
                icon: 'UserX',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'portal.client.deactivateUser', input: { userId: { type: 'field', path: 'id' } } },
                visible: { field: 'status', operator: 'eq', value: 'active' },
                confirm: {
                  title: 'Deactivate User?',
                  message: 'This user will no longer be able to access the portal.',
                  confirmLabel: 'Deactivate',
                  destructive: true,
                },
              },
            ],
            emptyState: {
              title: 'No team members',
              description: 'Invite colleagues to join your portal.',
              icon: 'Users',
            },
            actions: [
              {
                id: 'invite-member',
                label: 'Invite Team Member',
                type: 'modal',
                icon: 'UserPlus',
                variant: 'primary',
                config: { type: 'modal', modal: 'InviteTeamMember' },
              },
            ],
          },
        ],
      },

      // ===========================================
      // BILLING TAB
      // ===========================================
      {
        id: 'billing',
        label: 'Billing',
        icon: 'CreditCard',
        sections: [
          {
            id: 'billing-info',
            type: 'info-card',
            title: 'Billing Information',
            fields: [
              { id: 'billingContact', label: 'Billing Contact', type: 'text', path: 'billing.contactName' },
              { id: 'billingEmail', label: 'Billing Email', type: 'email', path: 'billing.email' },
              { id: 'billingAddress', label: 'Billing Address', type: 'text', path: 'billing.address' },
              { id: 'paymentTerms', label: 'Payment Terms', type: 'text', path: 'billing.paymentTerms' },
            ],
          },
          {
            id: 'recent-invoices',
            type: 'table',
            title: 'Recent Invoices',
            dataSource: {
              type: 'custom',
              query: { procedure: 'portal.client.getRecentInvoices' },
            },
            columns_config: [
              { id: 'number', header: 'Invoice #', path: 'invoiceNumber', type: 'text' },
              { id: 'date', header: 'Date', path: 'date', type: 'date' },
              { id: 'amount', header: 'Amount', path: 'amount', type: 'currency' },
              {
                id: 'status',
                header: 'Status',
                path: 'status',
                type: 'enum',
                config: {
                  options: [
                    { value: 'paid', label: 'Paid' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'overdue', label: 'Overdue' },
                  ],
                  badgeColors: { paid: 'green', pending: 'yellow', overdue: 'red' },
                },
              },
            ],
            rowActions: [
              {
                id: 'download',
                label: 'Download',
                type: 'download',
                icon: 'Download',
                config: { type: 'download', url: { type: 'field', path: 'downloadUrl' } },
              },
            ],
            emptyState: {
              title: 'No invoices yet',
              description: 'Your invoices will appear here.',
              icon: 'FileText',
            },
          },
        ],
      },

      // ===========================================
      // INTEGRATIONS TAB
      // ===========================================
      {
        id: 'integrations',
        label: 'Integrations',
        icon: 'Puzzle',
        sections: [
          {
            id: 'calendar-integration',
            type: 'custom',
            title: 'Calendar Integration',
            component: 'CalendarIntegrationSettings',
            componentProps: {
              providers: ['google', 'microsoft'],
            },
          },
          {
            id: 'sso-settings',
            type: 'info-card',
            title: 'Single Sign-On (SSO)',
            visible: { field: 'features.sso', operator: 'eq', value: true },
            fields: [
              { id: 'ssoEnabled', label: 'SSO Enabled', type: 'boolean', path: 'sso.enabled' },
              { id: 'provider', label: 'Provider', type: 'text', path: 'sso.provider' },
            ],
            actions: [
              {
                id: 'configure-sso',
                label: 'Configure SSO',
                type: 'modal',
                icon: 'Settings',
                variant: 'outline',
                config: { type: 'modal', modal: 'ConfigureSSO' },
              },
            ],
          },
        ],
      },
    ],
  },

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Settings', active: true },
    ],
  },
};

export default clientSettingsScreen;
