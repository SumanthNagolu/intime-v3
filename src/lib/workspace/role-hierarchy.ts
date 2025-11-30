/**
 * Role Hierarchy & Composite Dashboard Logic
 *
 * Maps system RBAC roles to specific roles and provides utilities
 * for building composite dashboards for users with multiple roles.
 */

import type { WorkspaceRole } from './role-config';
import {
  type SpecificRole,
  type WidgetSection,
  type HierarchyLevel,
  type DataScope,
  specificRoleConfigs,
  getDashboardSections,
} from './specific-role-config';

// =====================================================
// SYSTEM ROLE TO SPECIFIC ROLE MAPPING
// =====================================================

/**
 * Maps system RBAC roles to specific roles.
 * A user can have multiple specific roles based on their system roles.
 */
const SYSTEM_TO_SPECIFIC_ROLE: Record<string, SpecificRole[]> = {
  // Executive roles
  ceo: ['ceo'],
  coo: ['coo'],
  cfo: ['cfo'],
  super_admin: ['ceo', 'admin'],
  vp_recruiting: ['recruiting_manager'],
  vp_sales: ['ta_manager'],
  director: ['recruiting_manager'],
  executive: ['ceo'],

  // Manager roles
  recruiting_manager: ['recruiting_manager', 'technical_recruiter'],
  bench_manager: ['bench_manager', 'bench_sales_recruiter'],
  ta_director: ['ta_manager', 'ta_specialist'],
  ta_manager: ['ta_manager', 'ta_specialist'],
  hr_manager: ['hr'],
  hr_admin: ['hr'],
  team_lead: ['recruiting_manager'],
  operations_manager: ['coo'],
  admin: ['admin'],

  // TA/BD roles
  ta_specialist: ['ta_specialist'],
  talent_acquisition: ['ta_specialist'],
  ta_coordinator: ['ta_specialist'],
  bd_specialist: ['ta_specialist'],
  ta_sales: ['ta_specialist'],
  senior_ta: ['ta_manager', 'ta_specialist'], // Senior TA is a manager + IC
  junior_ta: ['ta_specialist'],

  // Bench Sales roles
  bench_sales: ['bench_sales_recruiter'],
  bench_sales_rep: ['bench_sales_recruiter'],
  senior_bench_sales: ['bench_manager', 'bench_sales_recruiter'], // Senior is manager + IC
  junior_bench_sales: ['bench_sales_recruiter'],
  account_executive: ['bench_sales_recruiter', 'ta_specialist'],

  // Recruiting roles
  recruiter: ['technical_recruiter'],
  senior_recruiter: ['recruiting_manager', 'technical_recruiter'], // Senior is manager + IC
  junior_recruiter: ['technical_recruiter'],
  sourcer: ['technical_recruiter'],
  recruiting_coordinator: ['technical_recruiter'],

  // HR roles
  hr_specialist: ['hr'],
  hr: ['hr'],
  people_ops: ['hr'],
};

// =====================================================
// ROLE DETECTION
// =====================================================

/**
 * Get all specific roles for a user based on their system roles.
 * Returns unique roles sorted by hierarchy level (highest first).
 */
export function getSpecificRolesForUser(systemRoles: string[]): SpecificRole[] {
  const lowerRoles = systemRoles.map((r) => r.toLowerCase());
  const specificRoles = new Set<SpecificRole>();

  for (const systemRole of lowerRoles) {
    const mappedRoles = SYSTEM_TO_SPECIFIC_ROLE[systemRole];
    if (mappedRoles) {
      mappedRoles.forEach((role) => specificRoles.add(role));
    }
  }

  // If no roles found, default to technical_recruiter
  if (specificRoles.size === 0) {
    specificRoles.add('technical_recruiter');
  }

  // Sort by hierarchy level (c_suite > director > manager > ic)
  const hierarchyOrder: Record<HierarchyLevel, number> = {
    c_suite: 4,
    director: 3,
    manager: 2,
    ic: 1,
  };

  return Array.from(specificRoles).sort((a, b) => {
    const levelA = specificRoleConfigs[a]?.hierarchyLevel || 'ic';
    const levelB = specificRoleConfigs[b]?.hierarchyLevel || 'ic';
    return hierarchyOrder[levelB] - hierarchyOrder[levelA];
  });
}

/**
 * Get the primary (highest hierarchy) specific role for a user.
 */
export function getPrimarySpecificRole(systemRoles: string[]): SpecificRole {
  const roles = getSpecificRolesForUser(systemRoles);
  return roles[0] || 'technical_recruiter';
}

/**
 * Get the highest data scope for a user based on all their roles.
 */
export function getEffectiveDataScope(systemRoles: string[]): DataScope {
  const roles = getSpecificRolesForUser(systemRoles);
  const scopeOrder: Record<DataScope, number> = {
    org: 4,
    department: 3,
    team: 2,
    own: 1,
  };

  let highestScope: DataScope = 'own';
  let highestOrder = 0;

  for (const role of roles) {
    const config = specificRoleConfigs[role];
    if (config) {
      const order = scopeOrder[config.dataScope];
      if (order > highestOrder) {
        highestOrder = order;
        highestScope = config.dataScope;
      }
    }
  }

  return highestScope;
}

/**
 * Check if user has manager-level access (manager, director, or c_suite).
 */
export function hasManagerAccess(systemRoles: string[]): boolean {
  const roles = getSpecificRolesForUser(systemRoles);
  return roles.some((role) => {
    const level = specificRoleConfigs[role]?.hierarchyLevel;
    return level === 'manager' || level === 'director' || level === 'c_suite';
  });
}

/**
 * Check if user has executive-level access (director or c_suite).
 */
export function hasExecutiveAccess(systemRoles: string[]): boolean {
  const roles = getSpecificRolesForUser(systemRoles);
  return roles.some((role) => {
    const level = specificRoleConfigs[role]?.hierarchyLevel;
    return level === 'director' || level === 'c_suite';
  });
}

// =====================================================
// COMPOSITE DASHBOARD LOGIC
// =====================================================

/**
 * Composite dashboard configuration for users with multiple roles.
 */
export interface CompositeDashboardConfig {
  primaryRole: SpecificRole;
  allRoles: SpecificRole[];
  sections: WidgetSection[];
  dataScope: DataScope;
  hierarchyLevel: HierarchyLevel;
}

/**
 * Build a composite dashboard configuration for a user with multiple roles.
 * Merges widgets from all roles, deduplicates by ID, and groups into sections.
 */
export function getCompositeDashboardConfig(
  systemRoles: string[]
): CompositeDashboardConfig {
  const specificRoles = getSpecificRolesForUser(systemRoles);
  const primaryRole = specificRoles[0] || 'technical_recruiter';
  const dataScope = getEffectiveDataScope(systemRoles);

  // Get hierarchy level from primary role
  const hierarchyLevel = specificRoleConfigs[primaryRole]?.hierarchyLevel || 'ic';

  // If only one role, return its sections directly
  if (specificRoles.length === 1) {
    return {
      primaryRole,
      allRoles: specificRoles,
      sections: getDashboardSections(primaryRole),
      dataScope,
      hierarchyLevel,
    };
  }

  // For multiple roles, merge sections intelligently
  const mergedSections = mergeRoleSections(specificRoles);

  return {
    primaryRole,
    allRoles: specificRoles,
    sections: mergedSections,
    dataScope,
    hierarchyLevel,
  };
}

/**
 * Merge dashboard sections from multiple roles.
 * - Manager sections come first
 * - Then IC sections as "My Work"
 * - Deduplicate widgets by ID
 */
function mergeRoleSections(roles: SpecificRole[]): WidgetSection[] {
  const mergedSections: WidgetSection[] = [];
  const seenWidgetIds = new Set<string>();

  // Separate roles by hierarchy
  const managerRoles = roles.filter((r) => {
    const level = specificRoleConfigs[r]?.hierarchyLevel;
    return level === 'manager' || level === 'director' || level === 'c_suite';
  });

  const icRoles = roles.filter((r) => {
    const level = specificRoleConfigs[r]?.hierarchyLevel;
    return level === 'ic';
  });

  // Add manager sections first
  for (const role of managerRoles) {
    const sections = getDashboardSections(role);
    for (const section of sections) {
      // Filter out already-seen widgets
      const uniqueWidgets = section.widgets.filter((w) => {
        if (seenWidgetIds.has(w.id)) return false;
        seenWidgetIds.add(w.id);
        return true;
      });

      if (uniqueWidgets.length > 0) {
        mergedSections.push({
          ...section,
          widgets: uniqueWidgets,
          order: mergedSections.length,
        });
      }
    }
  }

  // Add IC sections as "My Work" if there are IC roles
  if (icRoles.length > 0) {
    const myWorkWidgets: WidgetSection['widgets'] = [];

    for (const role of icRoles) {
      const sections = getDashboardSections(role);
      for (const section of sections) {
        for (const widget of section.widgets) {
          if (!seenWidgetIds.has(widget.id)) {
            seenWidgetIds.add(widget.id);
            myWorkWidgets.push(widget);
          }
        }
      }
    }

    if (myWorkWidgets.length > 0) {
      // Group into logical sections
      const metricWidgets = myWorkWidgets.filter((w) => w.type === 'metric');
      const pipelineWidgets = myWorkWidgets.filter((w) => w.type === 'pipeline');
      const listWidgets = myWorkWidgets.filter((w) => w.type === 'list');
      const chartWidgets = myWorkWidgets.filter((w) => w.type === 'chart');

      if (metricWidgets.length > 0) {
        mergedSections.push({
          id: 'my-metrics',
          title: 'My Metrics',
          order: mergedSections.length,
          visible: true,
          widgets: metricWidgets.slice(0, 3), // Max 3 metrics
        });
      }

      if (pipelineWidgets.length > 0) {
        mergedSections.push({
          id: 'my-pipeline',
          title: 'My Pipeline',
          order: mergedSections.length,
          visible: true,
          widgets: pipelineWidgets.slice(0, 1), // Max 1 pipeline
        });
      }

      if (listWidgets.length > 0 || chartWidgets.length > 0) {
        mergedSections.push({
          id: 'my-work',
          title: 'My Work',
          order: mergedSections.length,
          visible: true,
          widgets: [...listWidgets.slice(0, 2), ...chartWidgets.slice(0, 1)],
        });
      }
    }
  }

  return mergedSections;
}

// =====================================================
// WORKSPACE CATEGORY HELPERS
// =====================================================

/**
 * Get the primary workspace category for navigation.
 * Uses the highest-hierarchy role's workspace category.
 */
export function getPrimaryWorkspaceCategory(systemRoles: string[]): WorkspaceRole {
  const primaryRole = getPrimarySpecificRole(systemRoles);
  return specificRoleConfigs[primaryRole]?.workspaceCategory || 'recruiting';
}

/**
 * Get all workspace categories a user has access to.
 */
export function getAllWorkspaceCategories(systemRoles: string[]): WorkspaceRole[] {
  const specificRoles = getSpecificRolesForUser(systemRoles);
  const categories = new Set<WorkspaceRole>();

  for (const role of specificRoles) {
    const config = specificRoleConfigs[role];
    if (config) {
      categories.add(config.workspaceCategory);
    }
  }

  // Order: executive > manager > ta > bench > recruiting
  const categoryOrder: WorkspaceRole[] = ['executive', 'manager', 'ta', 'bench', 'recruiting'];
  return categoryOrder.filter((c) => categories.has(c));
}

// =====================================================
// ROLE LABEL UTILITIES
// =====================================================

/**
 * Get display label for a specific role.
 */
export function getSpecificRoleLabel(role: SpecificRole): string {
  return specificRoleConfigs[role]?.label || role;
}

/**
 * Get all role labels for a user.
 */
export function getUserRoleLabels(systemRoles: string[]): string[] {
  const specificRoles = getSpecificRolesForUser(systemRoles);
  return specificRoles.map((role) => getSpecificRoleLabel(role));
}

/**
 * Get a combined role title for display (e.g., "Recruiting Manager + Recruiter").
 */
export function getCombinedRoleTitle(systemRoles: string[]): string {
  const labels = getUserRoleLabels(systemRoles);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return labels.join(' + ');
  return `${labels[0]} + ${labels.length - 1} more`;
}

// =====================================================
// PERMISSION AGGREGATION
// =====================================================

import type { ExtendedPermissions } from './specific-role-config';

/**
 * Get aggregated permissions for a user across all their roles.
 * Uses OR logic - if any role has a permission, the user has it.
 */
export function getAggregatedPermissions(systemRoles: string[]): ExtendedPermissions {
  const specificRoles = getSpecificRolesForUser(systemRoles);

  const aggregated: ExtendedPermissions = {
    canCreateLeads: false,
    canCreateAccounts: false,
    canCreateDeals: false,
    canCreateJobs: false,
    canCreateSubmissions: false,
    canApproveSubmissions: false,
    canViewAnalytics: false,
    canExport: false,
    canManageEmployees: false,
    canApproveTimeOff: false,
    canRunPayroll: false,
    canViewSalaries: false,
    canCreatePerformanceReviews: false,
    canManageRoles: false,
    canViewAuditLogs: false,
    canManageOrganization: false,
    canManageIntegrations: false,
    canViewFinancials: false,
    canApproveExpenses: false,
    canManageBudgets: false,
    canViewCosts: false,
    canViewTeamData: false,
    canAssignWork: false,
    canApproveRates: false,
  };

  for (const role of specificRoles) {
    const config = specificRoleConfigs[role];
    if (config?.permissions) {
      for (const key of Object.keys(aggregated) as (keyof ExtendedPermissions)[]) {
        if (config.permissions[key]) {
          aggregated[key] = true;
        }
      }
    }
  }

  return aggregated;
}

/**
 * Check if user has a specific permission across any of their roles.
 */
export function hasAggregatedPermission(
  systemRoles: string[],
  permission: keyof ExtendedPermissions
): boolean {
  const specificRoles = getSpecificRolesForUser(systemRoles);
  return specificRoles.some((role) => {
    return specificRoleConfigs[role]?.permissions[permission] ?? false;
  });
}
