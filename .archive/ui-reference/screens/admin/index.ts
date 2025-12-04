/**
 * Admin Screens Registry
 *
 * Central export for all admin role screen definitions.
 * These screens are only accessible to users with admin role.
 */

// Dashboard
export { adminDashboardScreen } from './admin-dashboard.screen';

// User Management
export { usersListScreen } from './users-list.screen';
export { userDetailScreen } from './user-detail.screen';
export { userInviteScreen } from './user-invite.screen';
export { pendingInvitationsScreen } from './pending-invitations.screen';

// Roles Management
export { rolesListScreen } from './roles-list.screen';
export { roleDetailScreen } from './role-detail.screen';
export { permissionsMatrixScreen } from './permissions-matrix.screen';

// Pod Configuration
export { adminPodsListScreen as podsListScreen } from './pods-list.screen';
export { adminPodDetailScreen as podDetailScreen } from './pod-detail.screen';
export { podCreateScreen } from './pod-create.screen';

// System Settings
export { settingsHubScreen } from './settings-hub.screen';
export { orgSettingsScreen } from './org-settings.screen';
export { securitySettingsScreen } from './security-settings.screen';
export { emailSettingsScreen } from './email-settings.screen';

// Integrations
export { integrationsHubScreen } from './integrations-hub.screen';
export { integrationDetailScreen } from './integration-detail.screen';
export { apiSettingsScreen } from './api-settings.screen';

// Data Management
export { dataHubScreen } from './data-hub.screen';
export { dataImportScreen } from './data-import.screen';
export { dataExportScreen } from './data-export.screen';
export { duplicateDetectionScreen } from './duplicate-detection.screen';
export { bulkReassignScreen } from './bulk-reassign.screen';

// Audit & Logs
export { auditLogsScreen } from './audit-logs.screen';
export { systemLogsScreen } from './system-logs.screen';
export { featureFlagsScreen } from './feature-flags.screen';

// Workflow Configuration
export { workflowsHubScreen } from './workflows-hub.screen';
export { workflowEditorScreen } from './workflow-editor.screen';
export { activityPatternsScreen } from './activity-patterns.screen';
export { slaConfigScreen } from './sla-config.screen';
export { notificationRulesScreen } from './notification-rules.screen';

// ==========================================
// SCREEN REGISTRY
// ==========================================

import { adminDashboardScreen } from './admin-dashboard.screen';
import { usersListScreen } from './users-list.screen';
import { userDetailScreen } from './user-detail.screen';
import { userInviteScreen } from './user-invite.screen';
import { pendingInvitationsScreen } from './pending-invitations.screen';
import { rolesListScreen } from './roles-list.screen';
import { roleDetailScreen } from './role-detail.screen';
import { permissionsMatrixScreen } from './permissions-matrix.screen';
import { adminPodsListScreen as podsListScreen } from './pods-list.screen';
import { adminPodDetailScreen as podDetailScreen } from './pod-detail.screen';
import { podCreateScreen } from './pod-create.screen';
import { settingsHubScreen } from './settings-hub.screen';
import { orgSettingsScreen } from './org-settings.screen';
import { securitySettingsScreen } from './security-settings.screen';
import { emailSettingsScreen } from './email-settings.screen';
import { integrationsHubScreen } from './integrations-hub.screen';
import { integrationDetailScreen } from './integration-detail.screen';
import { apiSettingsScreen } from './api-settings.screen';
import { dataHubScreen } from './data-hub.screen';
import { dataImportScreen } from './data-import.screen';
import { dataExportScreen } from './data-export.screen';
import { duplicateDetectionScreen } from './duplicate-detection.screen';
import { bulkReassignScreen } from './bulk-reassign.screen';
import { auditLogsScreen } from './audit-logs.screen';
import { systemLogsScreen } from './system-logs.screen';
import { featureFlagsScreen } from './feature-flags.screen';
import { workflowsHubScreen } from './workflows-hub.screen';
import { workflowEditorScreen } from './workflow-editor.screen';
import { activityPatternsScreen } from './activity-patterns.screen';
import { slaConfigScreen } from './sla-config.screen';
import { notificationRulesScreen } from './notification-rules.screen';

import type { ScreenDefinition } from '@/lib/metadata';

/**
 * Admin screens registry - maps screen IDs to definitions.
 * Used by ScreenRenderer to look up screen configurations.
 */
export const adminScreens: Record<string, ScreenDefinition> = {
  // Dashboard
  'admin-dashboard': adminDashboardScreen,

  // User Management
  'users-list': usersListScreen,
  'user-detail': userDetailScreen,
  'user-invite': userInviteScreen,
  'pending-invitations': pendingInvitationsScreen,

  // Roles Management
  'roles-list': rolesListScreen,
  'role-detail': roleDetailScreen,
  'permissions-matrix': permissionsMatrixScreen,

  // Pod Configuration
  'pods-list': podsListScreen,
  'pod-detail': podDetailScreen,
  'pod-create': podCreateScreen,

  // System Settings
  'settings-hub': settingsHubScreen,
  'org-settings': orgSettingsScreen,
  'security-settings': securitySettingsScreen,
  'email-settings': emailSettingsScreen,

  // Integrations
  'integrations-hub': integrationsHubScreen,
  'integration-detail': integrationDetailScreen,
  'api-settings': apiSettingsScreen,

  // Data Management
  'data-hub': dataHubScreen,
  'data-import': dataImportScreen,
  'data-export': dataExportScreen,
  'duplicate-detection': duplicateDetectionScreen,
  'bulk-reassign': bulkReassignScreen,

  // Audit & Logs
  'audit-logs': auditLogsScreen,
  'system-logs': systemLogsScreen,
  'feature-flags': featureFlagsScreen,

  // Workflow Configuration
  'workflows-hub': workflowsHubScreen,
  'workflow-editor': workflowEditorScreen,
  'activity-patterns': activityPatternsScreen,
  'sla-config': slaConfigScreen,
  'notification-rules': notificationRulesScreen,
};

/**
 * Get all admin screen definitions as an array.
 */
export const adminScreenList = Object.values(adminScreens);

/**
 * Admin navigation structure for sidebar/menu rendering.
 */
export const adminNavigation = {
  id: 'admin',
  label: 'Admin',
  icon: 'Settings',
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      route: '/admin',
      icon: 'LayoutDashboard',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: 'Users',
      items: [
        { id: 'users-list', label: 'All Users', route: '/admin/users' },
        { id: 'user-invite', label: 'Invite User', route: '/admin/users/invite' },
        { id: 'pending-invitations', label: 'Pending Invitations', route: '/admin/users/pending' },
      ],
    },
    {
      id: 'roles',
      label: 'Roles & Permissions',
      icon: 'Shield',
      items: [
        { id: 'roles-list', label: 'Roles', route: '/admin/roles' },
        { id: 'permissions-matrix', label: 'Permissions Matrix', route: '/admin/roles/permissions' },
      ],
    },
    {
      id: 'pods',
      label: 'Pod Configuration',
      icon: 'Users2',
      items: [
        { id: 'pods-list', label: 'All Pods', route: '/admin/pods' },
        { id: 'pod-create', label: 'Create Pod', route: '/admin/pods/create' },
      ],
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: 'Settings2',
      items: [
        { id: 'settings-hub', label: 'Settings Hub', route: '/admin/settings' },
        { id: 'org-settings', label: 'Organization', route: '/admin/settings/organization' },
        { id: 'security-settings', label: 'Security', route: '/admin/settings/security' },
        { id: 'email-settings', label: 'Email', route: '/admin/settings/email' },
      ],
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: 'Plug',
      items: [
        { id: 'integrations-hub', label: 'All Integrations', route: '/admin/integrations' },
        { id: 'api-settings', label: 'API Settings', route: '/admin/integrations/api' },
      ],
    },
    {
      id: 'data',
      label: 'Data Management',
      icon: 'Database',
      items: [
        { id: 'data-hub', label: 'Data Hub', route: '/admin/data' },
        { id: 'data-import', label: 'Import', route: '/admin/data/import' },
        { id: 'data-export', label: 'Export', route: '/admin/data/export' },
        { id: 'duplicate-detection', label: 'Duplicates', route: '/admin/data/duplicates' },
        { id: 'bulk-reassign', label: 'Bulk Reassign', route: '/admin/data/reassign' },
      ],
    },
    {
      id: 'audit',
      label: 'Audit & Logs',
      icon: 'FileText',
      items: [
        { id: 'audit-logs', label: 'Audit Logs', route: '/admin/audit' },
        { id: 'system-logs', label: 'System Logs', route: '/admin/logs' },
        { id: 'feature-flags', label: 'Feature Flags', route: '/admin/features' },
      ],
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: 'GitBranch',
      items: [
        { id: 'workflows-hub', label: 'Workflow Hub', route: '/admin/workflows' },
        { id: 'activity-patterns', label: 'Activity Patterns', route: '/admin/workflows/patterns' },
        { id: 'sla-config', label: 'SLA Configuration', route: '/admin/workflows/sla' },
        { id: 'notification-rules', label: 'Notification Rules', route: '/admin/workflows/notifications' },
      ],
    },
  ],
};

export default adminScreens;
