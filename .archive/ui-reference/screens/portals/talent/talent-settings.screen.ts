/**
 * Candidate Settings Screen
 *
 * Account and notification preferences.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const talentSettingsScreen: ScreenDefinition = {
  id: 'talent-settings',
  type: 'detail',
  title: 'Settings',
  subtitle: 'Manage your account preferences',
  icon: 'Settings',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getSettings',
      params: {},
    },
  },

  layout: {
    type: 'tabs',
    defaultTab: 'notifications',
    tabs: [
      // ===========================================
      // NOTIFICATION PREFERENCES TAB
      // ===========================================
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'Bell',
        sections: [
          {
            id: 'notification-form',
            type: 'form',
            title: 'Email Notifications',
            fields: [
              {
                id: 'emailNotifications',
                type: 'checkbox',
                label: 'Enable email notifications',
                path: 'notifications.email',
              },
              {
                id: 'applicationUpdates',
                type: 'checkbox',
                label: 'Application status updates',
                path: 'notifications.applicationUpdates',
              },
              {
                id: 'interviewReminders',
                type: 'checkbox',
                label: 'Interview reminders',
                path: 'notifications.interviewReminders',
              },
              {
                id: 'newJobMatches',
                type: 'checkbox',
                label: 'New job matches',
                path: 'notifications.newJobMatches',
              },
              {
                id: 'recruiterMessages',
                type: 'checkbox',
                label: 'Messages from recruiters',
                path: 'notifications.recruiterMessages',
              },
              {
                id: 'frequency',
                type: 'select',
                label: 'Email frequency',
                path: 'notifications.frequency',
                config: {
                  options: [
                    { value: 'instant', label: 'Instant' },
                    { value: 'daily', label: 'Daily digest' },
                    { value: 'weekly', label: 'Weekly summary' },
                  ],
                },
              },
            ],
            actions: [
              {
                id: 'save-notifications',
                label: 'Save Preferences',
                type: 'mutation',
                variant: 'primary',
                config: {
                  type: 'mutation',
                  procedure: 'portal.talent.updateNotificationSettings',
                  input: { type: 'context', path: 'formState.values' },
                },
              },
            ],
          },
          {
            id: 'sms-form',
            type: 'form',
            title: 'SMS Notifications',
            fields: [
              {
                id: 'smsEnabled',
                type: 'checkbox',
                label: 'Enable SMS notifications',
                path: 'notifications.sms',
              },
              {
                id: 'smsInterviewReminders',
                type: 'checkbox',
                label: 'Interview reminders (24h before)',
                path: 'notifications.smsInterviewReminders',
                visible: { field: 'notifications.sms', operator: 'eq', value: true },
              },
              {
                id: 'smsUrgentUpdates',
                type: 'checkbox',
                label: 'Urgent application updates',
                path: 'notifications.smsUrgentUpdates',
                visible: { field: 'notifications.sms', operator: 'eq', value: true },
              },
            ],
          },
        ],
      },

      // ===========================================
      // PRIVACY TAB
      // ===========================================
      {
        id: 'privacy',
        label: 'Privacy',
        icon: 'Shield',
        sections: [
          {
            id: 'privacy-form',
            type: 'form',
            title: 'Profile Visibility',
            fields: [
              {
                id: 'profileVisibility',
                type: 'select',
                label: 'Profile visibility',
                path: 'privacy.profileVisibility',
                config: {
                  options: [
                    { value: 'visible', label: 'Visible to recruiters' },
                    { value: 'hidden', label: 'Hidden from search' },
                    { value: 'applied_only', label: 'Only visible for applied jobs' },
                  ],
                },
              },
              {
                id: 'showContactInfo',
                type: 'checkbox',
                label: 'Show contact information to recruiters',
                path: 'privacy.showContactInfo',
              },
              {
                id: 'showSalary',
                type: 'checkbox',
                label: 'Show salary expectations',
                path: 'privacy.showSalary',
              },
              {
                id: 'allowMessages',
                type: 'checkbox',
                label: 'Allow recruiters to message me',
                path: 'privacy.allowMessages',
              },
            ],
            actions: [
              {
                id: 'save-privacy',
                label: 'Save Privacy Settings',
                type: 'mutation',
                variant: 'primary',
                config: {
                  type: 'mutation',
                  procedure: 'portal.talent.updatePrivacySettings',
                  input: { type: 'context', path: 'formState.values' },
                },
              },
            ],
          },
        ],
      },

      // ===========================================
      // JOB ALERTS TAB
      // ===========================================
      {
        id: 'job-alerts',
        label: 'Job Alerts',
        icon: 'BellRing',
        sections: [
          {
            id: 'job-alerts-list',
            type: 'table',
            title: 'Active Job Alerts',
            dataSource: {
              type: 'custom',
              query: { procedure: 'portal.talent.getJobAlerts' },
            },
            columns_config: [
              { id: 'name', header: 'Alert Name', path: 'name', type: 'text' },
              { id: 'keywords', header: 'Keywords', path: 'keywords', type: 'text' },
              { id: 'frequency', header: 'Frequency', path: 'frequency', type: 'text' },
              { id: 'createdAt', header: 'Created', path: 'createdAt', type: 'date' },
            ],
            rowActions: [
              {
                id: 'edit-alert',
                label: 'Edit',
                type: 'modal',
                icon: 'Edit',
                config: { type: 'modal', modal: 'EditJobAlert', props: { alertId: { type: 'field', path: 'id' } } },
              },
              {
                id: 'delete-alert',
                label: 'Delete',
                type: 'mutation',
                icon: 'Trash2',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'portal.talent.deleteJobAlert', input: { alertId: { type: 'field', path: 'id' } } },
                confirm: {
                  title: 'Delete Job Alert?',
                  message: 'You will no longer receive notifications for this search.',
                  confirmLabel: 'Delete',
                  destructive: true,
                },
              },
            ],
            emptyState: {
              title: 'No job alerts',
              description: 'Create alerts to be notified when matching jobs are posted.',
              icon: 'BellRing',
            },
            actions: [
              {
                id: 'create-alert',
                label: 'Create Job Alert',
                type: 'modal',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'CreateJobAlert' },
              },
            ],
          },
        ],
      },

      // ===========================================
      // ACCOUNT TAB
      // ===========================================
      {
        id: 'account',
        label: 'Account',
        icon: 'User',
        sections: [
          {
            id: 'change-password',
            type: 'form',
            title: 'Change Password',
            fields: [
              {
                id: 'currentPassword',
                type: 'text',
                label: 'Current Password',
                path: 'password.current',
                config: { required: true },
              },
              {
                id: 'newPassword',
                type: 'text',
                label: 'New Password',
                path: 'password.new',
                config: { required: true, minLength: 8 },
              },
              {
                id: 'confirmPassword',
                type: 'text',
                label: 'Confirm New Password',
                path: 'password.confirm',
                config: { required: true },
              },
            ],
            actions: [
              {
                id: 'change-password',
                label: 'Change Password',
                type: 'mutation',
                variant: 'primary',
                config: {
                  type: 'mutation',
                  procedure: 'portal.talent.changePassword',
                  input: { type: 'context', path: 'formState.values' },
                },
              },
            ],
          },
          {
            id: 'danger-zone',
            type: 'info-card',
            title: 'Danger Zone',
            collapsible: true,
            defaultExpanded: false,
            fields: [
              {
                id: 'delete-warning',
                type: 'custom',
                label: '',
                path: '',
                config: {
                  template: 'Deleting your account will permanently remove all your data including applications, interviews, and profile information. This action cannot be undone.',
                },
              },
            ],
            actions: [
              {
                id: 'delete-account',
                label: 'Delete My Account',
                type: 'modal',
                icon: 'Trash2',
                variant: 'destructive',
                config: { type: 'modal', modal: 'DeleteAccount' },
              },
            ],
          },
        ],
      },
    ],
  },

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'Settings', active: true },
    ],
  },
};

export default talentSettingsScreen;
