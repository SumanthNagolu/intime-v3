/**
 * Workspace Library
 *
 * Export all workspace utilities and configurations.
 */

// Entity Registry
export {
  entityRegistry,
  getEntityConfig,
  getEntityTypes,
  getEntityIcon,
  getEntityColor,
  getEntityBgColor,
  getRelatedEntityTypes,
  type EntityType,
  type EntityConfig,
  type EntityStatus,
} from './entity-registry';

// Role Configuration
export {
  roleConfigs,
  getRoleConfig,
  getVisibleEntities,
  getDefaultTabs,
  getQuickActions,
  getDashboardWidgets,
  hasPermission,
  type WorkspaceRole,
  type RoleConfig,
  type QuickAction,
  type DashboardWidget,
  type TabConfig,
} from './role-config';
