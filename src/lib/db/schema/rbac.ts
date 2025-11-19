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
// TABLE: roles
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

export const SystemRoles = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  BENCH_SALES: 'bench_sales',
  TRAINER: 'trainer',
  STUDENT: 'student',
  EMPLOYEE: 'employee',
  CANDIDATE: 'candidate',
  CLIENT: 'client',
  HR_MANAGER: 'hr_manager',
} as const;

export type PermissionActionType = typeof PermissionAction[keyof typeof PermissionAction];
export type PermissionScopeType = typeof PermissionScope[keyof typeof PermissionScope];
export type SystemRoleType = typeof SystemRoles[keyof typeof SystemRoles];
