/**
 * Drizzle ORM Schema: RBAC (Role-Based Access Control)
 *
 * Tables: roles, permissions, role_permissions, user_roles
 * Maps to SQL migration: 003_create_rbac_system.sql
 *
 * @module schema/rbac
 */

import { pgTable, uuid, text, timestamp, boolean, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';

// ============================================================================
// TABLE: system_roles (NEW - Predefined system roles)
// ============================================================================

/**
 * System Roles table
 *
 * Predefined roles from USER-ROLES documentation.
 * These are seeded at system initialization and rarely change.
 */
export const systemRoles = pgTable('system_roles', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Role identification
  code: text('code').notNull().unique(), // 'technical_recruiter', 'ceo', etc.
  name: text('name').notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),

  // Role category
  category: text('category').notNull(), // 'pod_ic', 'pod_manager', 'leadership', 'executive', 'portal'

  // Hierarchy level (for permission inheritance)
  hierarchyLevel: integer('hierarchy_level').default(0),
  // 0 = IC, 1 = Manager, 2 = Director, 3 = VP, 4 = C-Level, 5 = Admin

  // Role metadata
  isSystemRole: boolean('is_system_role').default(true),
  isActive: boolean('is_active').default(true),
  colorCode: text('color_code').default('#6366f1'),
  iconName: text('icon_name'), // e.g., 'user-tie', 'building', etc.

  // Pod association (for pod-based roles)
  podType: text('pod_type'), // 'recruiting', 'bench_sales', 'ta' or NULL for non-pod roles

  // Permissions summary
  defaultPermissions: text('default_permissions').array(), // Pre-defined permission codes

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SystemRole = typeof systemRoles.$inferSelect;
export type NewSystemRole = typeof systemRoles.$inferInsert;

// ============================================================================
// TABLE: roles (Custom org-specific roles)
// ============================================================================

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Role identification
  name: text('name').notNull().unique(), // 'student', 'trainer', 'recruiter', etc.
  displayName: text('display_name').notNull(),
  description: text('description'),

  // Role hierarchy
  parentRoleId: uuid('parent_role_id'), // Self-referencing FK
  hierarchyLevel: integer('hierarchy_level').default(0),

  // Role metadata
  isSystemRole: boolean('is_system_role').default(false),
  isActive: boolean('is_active').default(true),
  colorCode: text('color_code').default('#6366f1'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// ============================================================================
// TABLE: permissions
// ============================================================================

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Permission identification
  resource: text('resource').notNull(), // 'user', 'candidate', 'placement', etc.
  action: text('action').notNull(), // 'create', 'read', 'update', 'delete', etc.
  scope: text('scope').default('own'), // 'own', 'team', 'department', 'all'

  // Permission metadata
  displayName: text('display_name').notNull(),
  description: text('description'),
  isDangerous: boolean('is_dangerous').default(false),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// ============================================================================
// TABLE: role_permissions (Junction table)
// ============================================================================

export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),

  // Grant metadata
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  grantedBy: uuid('granted_by'),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));

// ============================================================================
// TABLE: user_roles (Junction table)
// ============================================================================

export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),

  // Assignment metadata
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  assignedBy: uuid('assigned_by'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isPrimary: boolean('is_primary').default(false),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));

// ============================================================================
// RELATIONS
// ============================================================================

export const systemRolesRelations = relations(systemRoles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  parentRole: one(roles, {
    fields: [roles.parentRoleId],
    references: [roles.id],
  }),
  childRoles: many(roles),
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(userProfiles, {
    fields: [userRoles.userId],
    references: [userProfiles.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

// ============================================================================
// ENUMS
// ============================================================================

export const PermissionAction = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  IMPORT: 'import',
  MANAGE: 'manage',
} as const;

export const PermissionScope = {
  OWN: 'own',
  TEAM: 'team',
  POD: 'pod',
  DEPARTMENT: 'department',
  ALL: 'all',
} as const;

/**
 * System Roles (All 12 roles from USER-ROLES spec)
 *
 * Internal Staff Roles (Pod-Based):
 * - technical_recruiter - Job fulfillment, candidate placement
 * - bench_sales_recruiter - Consultant marketing, bench reduction
 * - ta_specialist - Talent acquisition, internal hiring
 * - recruiting_manager - Manages recruiting pods
 * - bench_manager - Manages bench sales pods
 * - ta_manager - Manages TA pods
 *
 * Leadership/Executive Roles:
 * - hr_manager - HR operations
 * - regional_director - Regional operations
 * - cfo - Chief Financial Officer
 * - coo - Chief Operating Officer
 * - ceo - Chief Executive Officer
 * - admin - System administration
 *
 * External/Portal Roles:
 * - client_user - Client portal access
 * - candidate_user - Candidate portal access
 */
export const SystemRoles = {
  // Pod-Based Roles (IC level)
  TECHNICAL_RECRUITER: 'technical_recruiter',
  BENCH_SALES_RECRUITER: 'bench_sales_recruiter',
  TA_SPECIALIST: 'ta_specialist',

  // Pod-Based Roles (Manager level)
  RECRUITING_MANAGER: 'recruiting_manager',
  BENCH_MANAGER: 'bench_manager',
  TA_MANAGER: 'ta_manager',

  // Leadership/Executive Roles
  HR_MANAGER: 'hr_manager',
  REGIONAL_DIRECTOR: 'regional_director',
  CFO: 'cfo',
  COO: 'coo',
  CEO: 'ceo',
  ADMIN: 'admin',

  // External/Portal Roles
  CLIENT_USER: 'client_user',
  CANDIDATE_USER: 'candidate_user',

  // Legacy roles (for backward compatibility)
  SUPER_ADMIN: 'super_admin',
  RECRUITER: 'recruiter',
  BENCH_SALES: 'bench_sales',
  TRAINER: 'trainer',
  STUDENT: 'student',
  EMPLOYEE: 'employee',
  CANDIDATE: 'candidate',
  CLIENT: 'client',
} as const;

export type PermissionActionType = typeof PermissionAction[keyof typeof PermissionAction];
export type PermissionScopeType = typeof PermissionScope[keyof typeof PermissionScope];
export type SystemRoleType = typeof SystemRoles[keyof typeof SystemRoles];

// ============================================================================
// ROLE CATEGORIES
// ============================================================================

export const RoleCategory = {
  POD_IC: 'pod_ic',           // Individual contributors in pods
  POD_MANAGER: 'pod_manager', // Pod managers
  LEADERSHIP: 'leadership',   // HR, Regional Directors
  EXECUTIVE: 'executive',     // C-level executives
  PORTAL: 'portal',           // External portal users
  ADMIN: 'admin',             // System administrators
} as const;

export type RoleCategoryType = typeof RoleCategory[keyof typeof RoleCategory];

// ============================================================================
// ROLE HIERARCHY LEVELS
// ============================================================================

export const RoleHierarchyLevel = {
  IC: 0,          // Individual contributor
  MANAGER: 1,     // Manager
  DIRECTOR: 2,    // Director
  VP: 3,          // Vice President
  C_LEVEL: 4,     // C-Level executive
  ADMIN: 5,       // System admin
} as const;

export type RoleHierarchyLevelType = typeof RoleHierarchyLevel[keyof typeof RoleHierarchyLevel];

// ============================================================================
// PERMISSION ENTITIES (Resources that can be accessed)
// ============================================================================

export const PermissionEntity = {
  // Core entities
  JOB: 'job',
  CANDIDATE: 'candidate',
  SUBMISSION: 'submission',
  PLACEMENT: 'placement',
  INTERVIEW: 'interview',
  OFFER: 'offer',

  // CRM entities
  ACCOUNT: 'account',
  LEAD: 'lead',
  DEAL: 'deal',
  CONTACT: 'contact',
  CAMPAIGN: 'campaign',

  // Bench entities
  CONSULTANT: 'consultant',
  EXTERNAL_JOB: 'external_job',
  HOTLIST: 'hotlist',

  // Organization entities
  USER: 'user',
  POD: 'pod',
  REGION: 'region',
  ORGANIZATION: 'organization',

  // System entities
  ROLE: 'role',
  PERMISSION: 'permission',
  AUDIT_LOG: 'audit_log',
  REPORT: 'report',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
} as const;

export type PermissionEntityType = typeof PermissionEntity[keyof typeof PermissionEntity];

// ============================================================================
// SYSTEM ROLE DEFINITIONS (For seeding)
// ============================================================================

export const SystemRoleDefinitions: Array<{
  code: string;
  name: string;
  displayName: string;
  description: string;
  category: RoleCategoryType;
  hierarchyLevel: number;
  podType?: string;
  colorCode: string;
}> = [
  // Pod-Based IC Roles
  {
    code: 'technical_recruiter',
    name: 'Technical Recruiter',
    displayName: 'Recruiter',
    description: 'Job fulfillment, candidate sourcing and placement',
    category: 'pod_ic',
    hierarchyLevel: 0,
    podType: 'recruiting',
    colorCode: '#3b82f6',
  },
  {
    code: 'bench_sales_recruiter',
    name: 'Bench Sales Recruiter',
    displayName: 'Bench Sales',
    description: 'Consultant marketing and bench reduction',
    category: 'pod_ic',
    hierarchyLevel: 0,
    podType: 'bench_sales',
    colorCode: '#8b5cf6',
  },
  {
    code: 'ta_specialist',
    name: 'TA Specialist',
    displayName: 'TA Specialist',
    description: 'Talent acquisition and internal hiring',
    category: 'pod_ic',
    hierarchyLevel: 0,
    podType: 'ta',
    colorCode: '#06b6d4',
  },

  // Pod-Based Manager Roles
  {
    code: 'recruiting_manager',
    name: 'Recruiting Manager',
    displayName: 'Recruiting Manager',
    description: 'Manages recruiting pods, clears blockers',
    category: 'pod_manager',
    hierarchyLevel: 1,
    podType: 'recruiting',
    colorCode: '#2563eb',
  },
  {
    code: 'bench_manager',
    name: 'Bench Sales Manager',
    displayName: 'Bench Manager',
    description: 'Manages bench sales pods, clears blockers',
    category: 'pod_manager',
    hierarchyLevel: 1,
    podType: 'bench_sales',
    colorCode: '#7c3aed',
  },
  {
    code: 'ta_manager',
    name: 'TA Manager',
    displayName: 'TA Manager',
    description: 'Manages TA pods, clears blockers',
    category: 'pod_manager',
    hierarchyLevel: 1,
    podType: 'ta',
    colorCode: '#0891b2',
  },

  // Leadership Roles
  {
    code: 'hr_manager',
    name: 'HR Manager',
    displayName: 'HR Manager',
    description: 'Human resources operations',
    category: 'leadership',
    hierarchyLevel: 1,
    colorCode: '#ec4899',
  },
  {
    code: 'regional_director',
    name: 'Regional Director',
    displayName: 'Regional Director',
    description: 'Regional operations and pod oversight',
    category: 'leadership',
    hierarchyLevel: 2,
    colorCode: '#f97316',
  },

  // Executive Roles
  {
    code: 'cfo',
    name: 'Chief Financial Officer',
    displayName: 'CFO',
    description: 'Financial oversight and strategy',
    category: 'executive',
    hierarchyLevel: 4,
    colorCode: '#16a34a',
  },
  {
    code: 'coo',
    name: 'Chief Operating Officer',
    displayName: 'COO',
    description: 'Operations oversight and strategy',
    category: 'executive',
    hierarchyLevel: 4,
    colorCode: '#dc2626',
  },
  {
    code: 'ceo',
    name: 'Chief Executive Officer',
    displayName: 'CEO',
    description: 'Executive leadership',
    category: 'executive',
    hierarchyLevel: 4,
    colorCode: '#ca8a04',
  },

  // Admin Role
  {
    code: 'admin',
    name: 'System Administrator',
    displayName: 'Admin',
    description: 'System configuration and user management',
    category: 'admin',
    hierarchyLevel: 5,
    colorCode: '#64748b',
  },

  // Portal Roles
  {
    code: 'client_user',
    name: 'Client Portal User',
    displayName: 'Client',
    description: 'External client portal access',
    category: 'portal',
    hierarchyLevel: 0,
    colorCode: '#059669',
  },
  {
    code: 'candidate_user',
    name: 'Candidate Portal User',
    displayName: 'Candidate',
    description: 'External candidate portal access',
    category: 'portal',
    hierarchyLevel: 0,
    colorCode: '#0d9488',
  },
];
