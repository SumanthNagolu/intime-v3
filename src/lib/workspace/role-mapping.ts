/**
 * Role Mapping Utility
 *
 * Maps system RBAC roles (from user_roles table) to workspace roles.
 * Used for auto-detecting which workspace view a user should see.
 */

import type { WorkspaceRole } from './role-config';

/**
 * Priority-ordered mapping from system roles to workspace roles.
 * First match wins - higher priority roles checked first.
 */
const SYSTEM_TO_WORKSPACE: [string[], WorkspaceRole][] = [
  // Executive (highest priority)
  [
    ['ceo', 'coo', 'cfo', 'super_admin', 'vp_recruiting', 'vp_sales', 'director', 'executive'],
    'executive',
  ],

  // Manager
  [
    [
      'recruiting_manager',
      'bench_manager',
      'ta_director',
      'hr_manager',
      'hr_admin',
      'team_lead',
      'operations_manager',
      'admin',
    ],
    'manager',
  ],

  // TA/BD (Talent Acquisition / Business Development)
  [
    ['ta_specialist', 'talent_acquisition', 'ta_coordinator', 'bd_specialist', 'senior_ta', 'junior_ta'],
    'ta',
  ],

  // Bench Sales
  [
    ['bench_manager', 'bench_sales', 'bench_sales_rep', 'senior_bench_sales', 'junior_bench_sales', 'account_executive'],
    'bench',
  ],

  // Recruiting (default for most employees)
  [
    ['recruiter', 'senior_recruiter', 'junior_recruiter', 'sourcer', 'recruiting_coordinator'],
    'recruiting',
  ],
];

/**
 * Get the appropriate workspace role for a user based on their system roles.
 *
 * @param systemRoles - Array of system role names from user_roles table
 * @returns The workspace role to use for this user
 *
 * @example
 * getWorkspaceRole(['recruiter', 'employee']) // returns 'recruiting'
 * getWorkspaceRole(['ceo', 'admin']) // returns 'executive'
 * getWorkspaceRole(['bench_sales']) // returns 'bench'
 */
export function getWorkspaceRole(systemRoles: string[]): WorkspaceRole {
  const lowerRoles = systemRoles.map((r) => r.toLowerCase());

  for (const [roleGroup, workspaceRole] of SYSTEM_TO_WORKSPACE) {
    if (roleGroup.some((role) => lowerRoles.includes(role))) {
      return workspaceRole;
    }
  }

  // Default to recruiting for unknown roles
  return 'recruiting';
}

/**
 * Check if a user has manager-level access based on their system roles.
 * Managers and executives can see team data and have elevated permissions.
 */
export function hasManagerAccess(systemRoles: string[]): boolean {
  const wsRole = getWorkspaceRole(systemRoles);
  return wsRole === 'manager' || wsRole === 'executive';
}

/**
 * Check if a user has executive-level access based on their system roles.
 * Executives can see all org data and have full permissions.
 */
export function hasExecutiveAccess(systemRoles: string[]): boolean {
  return getWorkspaceRole(systemRoles) === 'executive';
}

/**
 * Get all system roles that map to a specific workspace role.
 * Useful for role-based UI filtering.
 */
export function getSystemRolesForWorkspace(workspaceRole: WorkspaceRole): string[] {
  for (const [roleGroup, wsRole] of SYSTEM_TO_WORKSPACE) {
    if (wsRole === workspaceRole) {
      return roleGroup;
    }
  }
  return [];
}
