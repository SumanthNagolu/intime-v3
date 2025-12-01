/**
 * RACI Ownership Type Definitions
 * 
 * Implements: docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md (Section 3)
 * 
 * Every business object in InTime OS has mandatory RACI assignments:
 * R - Responsible: Does the work, primary owner
 * A - Accountable: Approves/owns outcome, secondary owner  
 * C - Consulted: Provides input before decisions
 * I - Informed: Kept updated on progress
 */

import type { EntityType } from './entity.types';

// ==========================================
// RACI ENUMS
// ==========================================

/**
 * RACI Role - The role a user has on an entity
 */
export type RACIRole = 'R' | 'A' | 'C' | 'I';

/**
 * RACI Role Labels
 */
export const RACI_ROLE_LABELS: Record<RACIRole, string> = {
  R: 'Responsible',
  A: 'Accountable',
  C: 'Consulted',
  I: 'Informed',
};

/**
 * RACI Role Descriptions
 */
export const RACI_ROLE_DESCRIPTIONS: Record<RACIRole, string> = {
  R: 'Does the work, primary owner. Has full edit and delete draft permissions.',
  A: 'Approves/owns outcome, secondary owner. Has full edit and approve permissions.',
  C: 'Provides input before decisions. Has view and comment permissions.',
  I: 'Kept updated on progress. Has view only permissions.',
};

// ==========================================
// RACI INTERFACES
// ==========================================

/**
 * Single RACI Assignment
 */
export interface RACIAssignment {
  entityType: EntityType;
  entityId: string;
  userId: string;
  role: RACIRole;
  assignedAt: Date;
  assignedBy: string;
}

/**
 * Complete RACI matrix for an entity
 */
export interface RACIMatrix {
  responsible: string;    // User ID (exactly 1)
  accountable: string;    // User ID (exactly 1)
  consulted: string[];    // User IDs (0 or more)
  informed: string[];     // User IDs (0 or more)
}

/**
 * RACI Matrix with user details
 */
export interface RACIMatrixExpanded {
  responsible: RACIUser;
  accountable: RACIUser;
  consulted: RACIUser[];
  informed: RACIUser[];
}

/**
 * User info for RACI display
 */
export interface RACIUser {
  id: string;
  name: string;
  email: string;
  role: string;  // Job title/role
  avatarUrl?: string;
  assignedAt: Date;
}

/**
 * RACI Transfer Request
 */
export interface RACITransferInput {
  entityType: EntityType;
  entityId: string;
  transferType: 'R' | 'A' | 'both';
  newResponsible?: string;  // User ID
  newAccountable?: string;  // User ID
  reason: string;
  effectiveDate?: Date;
  notifyStakeholders: boolean;
}

/**
 * RACI Assignment Change Record
 */
export interface RACIChangeRecord {
  id: string;
  entityType: EntityType;
  entityId: string;
  role: RACIRole;
  previousUserId: string | null;
  newUserId: string;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

// ==========================================
// RACI PERMISSION HELPERS
// ==========================================

/**
 * Permissions by RACI role
 */
export const RACI_PERMISSIONS: Record<RACIRole, string[]> = {
  R: ['view', 'edit', 'delete_draft', 'comment', 'create_activity'],
  A: ['view', 'edit', 'approve', 'reject', 'comment', 'create_activity'],
  C: ['view', 'comment'],
  I: ['view'],
};

/**
 * Check if RACI role has permission
 */
export function raciRoleHasPermission(role: RACIRole, permission: string): boolean {
  return RACI_PERMISSIONS[role].includes(permission);
}

/**
 * Get all permissions for a user's RACI roles
 */
export function getRACIPermissions(roles: RACIRole[]): string[] {
  const permissions = new Set<string>();
  for (const role of roles) {
    for (const perm of RACI_PERMISSIONS[role]) {
      permissions.add(perm);
    }
  }
  return Array.from(permissions);
}

// ==========================================
// DEFAULT RACI ASSIGNMENTS
// ==========================================

/**
 * Assignment rule type
 */
export type AssignmentRuleType =
  | 'owner'          // Entity owner
  | 'creator'        // User who created
  | 'raci_role'      // Specific RACI role from parent
  | 'specific_user'  // Specific user ID
  | 'specific_role'  // Users with specific job role
  | 'round_robin'    // Round robin assignment
  | 'least_busy'     // Assign to least busy user
  | 'pod_manager';   // Pod manager of the owner

/**
 * Assignment Rule
 */
export type AssignmentRule =
  | { type: 'owner' }
  | { type: 'creator' }
  | { type: 'raci_role'; role: RACIRole }
  | { type: 'specific_user'; userId: string }
  | { type: 'specific_role'; role: string }
  | { type: 'round_robin'; groupId: string }
  | { type: 'least_busy' }
  | { type: 'pod_manager' };

/**
 * Default RACI configuration by entity type
 */
export interface DefaultRACIConfig {
  entityType: EntityType;
  defaultResponsible: AssignmentRule;
  defaultAccountable: AssignmentRule;
  defaultConsulted: AssignmentRule[];
  defaultInformed: AssignmentRule[];
}

/**
 * Standard default RACI configurations
 */
export const DEFAULT_RACI_CONFIGS: DefaultRACIConfig[] = [
  {
    entityType: 'job',
    defaultResponsible: { type: 'creator' },
    defaultAccountable: { type: 'pod_manager' },
    defaultConsulted: [{ type: 'specific_role', role: 'secondary_recruiter' }],
    defaultInformed: [{ type: 'specific_role', role: 'coo' }],
  },
  {
    entityType: 'candidate',
    defaultResponsible: { type: 'creator' },
    defaultAccountable: { type: 'pod_manager' },
    defaultConsulted: [],
    defaultInformed: [{ type: 'specific_role', role: 'coo' }],
  },
  {
    entityType: 'submission',
    defaultResponsible: { type: 'creator' },
    defaultAccountable: { type: 'pod_manager' },
    defaultConsulted: [{ type: 'raci_role', role: 'R' }], // R of the job
    defaultInformed: [{ type: 'specific_role', role: 'coo' }],
  },
  {
    entityType: 'account',
    defaultResponsible: { type: 'creator' },
    defaultAccountable: { type: 'pod_manager' },
    defaultConsulted: [],
    defaultInformed: [
      { type: 'specific_role', role: 'regional_director' },
      { type: 'specific_role', role: 'coo' },
    ],
  },
  {
    entityType: 'lead',
    defaultResponsible: { type: 'creator' },
    defaultAccountable: { type: 'pod_manager' },
    defaultConsulted: [],
    defaultInformed: [{ type: 'specific_role', role: 'coo' }],
  },
  {
    entityType: 'deal',
    defaultResponsible: { type: 'creator' },
    defaultAccountable: { type: 'pod_manager' },
    defaultConsulted: [{ type: 'specific_role', role: 'finance' }],
    defaultInformed: [
      { type: 'specific_role', role: 'coo' },
      { type: 'specific_role', role: 'ceo' },
    ],
  },
];

