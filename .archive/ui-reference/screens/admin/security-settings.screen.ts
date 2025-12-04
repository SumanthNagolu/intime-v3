/**
 * Security Settings Screen Definition
 *
 * Configure security policies, authentication, and access control.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const SESSION_TIMEOUT_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '240', label: '4 hours' },
  { value: '480', label: '8 hours' },
  { value: '1440', label: '24 hours' },
];

const PASSWORD_EXPIRY_OPTIONS = [
  { value: '0', label: 'Never expire' },
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '180 days' },
  { value: '365', label: '1 year' },
];

const LOCKOUT_THRESHOLD_OPTIONS = [
  { value: '3', label: '3 attempts' },
  { value: '5', label: '5 attempts' },
  { value: '10', label: '10 attempts' },
];

const LOCKOUT_DURATION_OPTIONS = [
  { value: '5', label: '5 minutes' },
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const securitySettingsScreen: ScreenDefinition = {
  id: 'security-settings',
  type: 'detail',
  // entityType: 'organization', // Admin entity

  title: 'Security Settings',
  subtitle: 'Configure authentication and access policies',
  icon: 'Shield',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.settings.getSecurity',
      params: {},
    },
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Password Policy
      {
        id: 'password-policy',
        type: 'form',
        title: 'Password Policy',
        description: 'Set requirements for user passwords',
        icon: 'Key',
        columns: 2,
        editable: true,
        fields: [
          {
            id: 'minLength',
            label: 'Minimum Length',
            type: 'number',
            path: 'password.minLength',
            config: { min: 8, max: 32, defaultValue: 12 },
          },
          {
            id: 'requireUppercase',
            label: 'Require Uppercase',
            type: 'checkbox',
            path: 'password.requireUppercase',
            config: { defaultValue: true },
          },
          {
            id: 'requireLowercase',
            label: 'Require Lowercase',
            type: 'checkbox',
            path: 'password.requireLowercase',
            config: { defaultValue: true },
          },
          {
            id: 'requireNumbers',
            label: 'Require Numbers',
            type: 'checkbox',
            path: 'password.requireNumbers',
            config: { defaultValue: true },
          },
          {
            id: 'requireSpecialChars',
            label: 'Require Special Characters',
            type: 'checkbox',
            path: 'password.requireSpecialChars',
            config: { defaultValue: true },
          },
          {
            id: 'preventReuse',
            label: 'Prevent Password Reuse (last N)',
            type: 'number',
            path: 'password.preventReuseCount',
            config: { min: 0, max: 24, defaultValue: 5, helpText: '0 = no restriction' },
          },
          {
            id: 'expiryDays',
            label: 'Password Expiry',
            type: 'select',
            path: 'password.expiryDays',
            options: [...PASSWORD_EXPIRY_OPTIONS],
          },
          {
            id: 'forceChangeOnFirstLogin',
            label: 'Force Change on First Login',
            type: 'checkbox',
            path: 'password.forceChangeOnFirstLogin',
            config: { defaultValue: true },
          },
        ],
        actions: [
          {
            id: 'save-password',
            type: 'mutation',
            label: 'Save Password Policy',
            variant: 'primary',
            icon: 'Save',
            config: { type: 'mutation', procedure: 'admin.settings.updatePasswordPolicy' },
          },
        ],
      },
      // Session Management
      {
        id: 'session-settings',
        type: 'form',
        title: 'Session Management',
        description: 'Configure session timeout and concurrent login settings',
        icon: 'Clock',
        columns: 2,
        editable: true,
        fields: [
          {
            id: 'sessionTimeout',
            label: 'Session Timeout (Inactivity)',
            type: 'select',
            path: 'session.timeoutMinutes',
            options: [...SESSION_TIMEOUT_OPTIONS],
          },
          {
            id: 'maxConcurrentSessions',
            label: 'Max Concurrent Sessions',
            type: 'number',
            path: 'session.maxConcurrent',
            config: { min: 1, max: 10, defaultValue: 3, helpText: 'Per user' },
          },
          {
            id: 'extendOnActivity',
            label: 'Extend Session on Activity',
            type: 'checkbox',
            path: 'session.extendOnActivity',
            config: { defaultValue: true },
          },
          {
            id: 'logoutOnBrowserClose',
            label: 'Logout on Browser Close',
            type: 'checkbox',
            path: 'session.logoutOnClose',
            config: { defaultValue: false },
          },
        ],
        actions: [
          {
            id: 'save-session',
            type: 'mutation',
            label: 'Save Session Settings',
            variant: 'primary',
            icon: 'Save',
            config: { type: 'mutation', procedure: 'admin.settings.updateSessionPolicy' },
          },
        ],
      },
      // Two-Factor Authentication
      {
        id: '2fa-settings',
        type: 'form',
        title: 'Two-Factor Authentication',
        description: 'Configure 2FA requirements',
        icon: 'Smartphone',
        columns: 2,
        editable: true,
        fields: [
          {
            id: 'require2FA',
            label: 'Require 2FA for All Users',
            type: 'checkbox',
            path: 'twoFactor.required',
            config: { defaultValue: false },
          },
          {
            id: 'require2FAAdmin',
            label: 'Require 2FA for Admins',
            type: 'checkbox',
            path: 'twoFactor.requiredForAdmins',
            config: { defaultValue: true },
          },
          {
            id: 'allowTOTP',
            label: 'Allow TOTP (Authenticator App)',
            type: 'checkbox',
            path: 'twoFactor.allowTOTP',
            config: { defaultValue: true },
          },
          {
            id: 'allowSMS',
            label: 'Allow SMS Verification',
            type: 'checkbox',
            path: 'twoFactor.allowSMS',
            config: { defaultValue: true, helpText: 'Requires SMS provider configuration' },
          },
          {
            id: 'allowEmail',
            label: 'Allow Email Verification',
            type: 'checkbox',
            path: 'twoFactor.allowEmail',
            config: { defaultValue: true },
          },
          {
            id: 'rememberDevice',
            label: 'Remember Device (Days)',
            type: 'number',
            path: 'twoFactor.rememberDeviceDays',
            config: { min: 0, max: 90, defaultValue: 30, helpText: '0 = always require 2FA' },
          },
        ],
        actions: [
          {
            id: 'save-2fa',
            type: 'mutation',
            label: 'Save 2FA Settings',
            variant: 'primary',
            icon: 'Save',
            config: { type: 'mutation', procedure: 'admin.settings.update2FAPolicy' },
          },
        ],
      },
      // Login Security
      {
        id: 'login-security',
        type: 'form',
        title: 'Login Security',
        description: 'Configure login attempt limits and lockout',
        icon: 'Lock',
        columns: 2,
        editable: true,
        fields: [
          {
            id: 'lockoutThreshold',
            label: 'Failed Attempts Before Lockout',
            type: 'select',
            path: 'login.lockoutThreshold',
            options: [...LOCKOUT_THRESHOLD_OPTIONS],
          },
          {
            id: 'lockoutDuration',
            label: 'Lockout Duration',
            type: 'select',
            path: 'login.lockoutDuration',
            options: [...LOCKOUT_DURATION_OPTIONS],
          },
          {
            id: 'captchaThreshold',
            label: 'Show CAPTCHA After Attempts',
            type: 'number',
            path: 'login.captchaThreshold',
            config: { min: 0, max: 10, defaultValue: 3, helpText: '0 = always show' },
          },
          {
            id: 'notifyOnLockout',
            label: 'Notify User on Lockout',
            type: 'checkbox',
            path: 'login.notifyOnLockout',
            config: { defaultValue: true },
          },
          {
            id: 'notifyAdminOnLockout',
            label: 'Notify Admin on Lockout',
            type: 'checkbox',
            path: 'login.notifyAdminOnLockout',
            config: { defaultValue: false },
          },
        ],
        actions: [
          {
            id: 'save-login',
            type: 'mutation',
            label: 'Save Login Security',
            variant: 'primary',
            icon: 'Save',
            config: { type: 'mutation', procedure: 'admin.settings.updateLoginPolicy' },
          },
        ],
      },
      // IP Allowlist
      {
        id: 'ip-allowlist',
        type: 'custom',
        title: 'IP Allowlist',
        description: 'Restrict access to specific IP addresses',
        icon: 'Globe',
        component: 'IPAllowlistEditor',
        componentProps: {
          helpText: 'Leave empty to allow all IPs. CIDR notation supported.',
        },
      },
      // Audit Settings
      {
        id: 'audit-settings',
        type: 'form',
        title: 'Audit & Logging',
        description: 'Configure security audit settings',
        icon: 'FileText',
        columns: 2,
        editable: true,
        fields: [
          {
            id: 'logLogins',
            label: 'Log All Login Attempts',
            type: 'checkbox',
            path: 'audit.logLogins',
            config: { defaultValue: true },
          },
          {
            id: 'logFailedLogins',
            label: 'Log Failed Login Details',
            type: 'checkbox',
            path: 'audit.logFailedLogins',
            config: { defaultValue: true },
          },
          {
            id: 'logDataAccess',
            label: 'Log Data Access',
            type: 'checkbox',
            path: 'audit.logDataAccess',
            config: { defaultValue: false, helpText: 'May impact performance' },
          },
          {
            id: 'retentionDays',
            label: 'Audit Log Retention (Days)',
            type: 'number',
            path: 'audit.retentionDays',
            config: { min: 30, max: 2555, defaultValue: 365 },
          },
        ],
        actions: [
          {
            id: 'save-audit',
            type: 'mutation',
            label: 'Save Audit Settings',
            variant: 'primary',
            icon: 'Save',
            config: { type: 'mutation', procedure: 'admin.settings.updateAuditPolicy' },
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
      { label: 'Security' },
    ],
  },
};

export default securitySettingsScreen;
