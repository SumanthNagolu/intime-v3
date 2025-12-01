/**
 * RACI (Responsible, Accountable, Consulted, Informed) Schema
 * 
 * Implements: docs/specs/10-DATABASE/12-object-owners.md
 * 
 * This table provides RACI ownership assignments for ALL business objects.
 * Every entity (job, candidate, lead, deal, etc.) has RACI assignments.
 * 
 * Business Rules:
 * - Every entity MUST have exactly 1 Accountable user
 * - An entity can have 0-N Responsible users
 * - No limit on Consulted/Informed users
 * - Creator auto-assigned as Accountable on entity creation
 */

import { pgTable, uuid, text, timestamp, boolean, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { userProfiles } from './user-profiles';

// =====================================================
// ENUMS
// =====================================================

export const raciRoleEnum = pgEnum('raci_role', [
  'responsible',   // Does the work
  'accountable',   // Owns the outcome (exactly 1 per entity)
  'consulted',     // Provides input
  'informed',      // Kept updated
]);

export const raciPermissionEnum = pgEnum('raci_permission', [
  'edit',   // Full read/write
  'view',   // Read-only
]);

export const assignmentTypeEnum = pgEnum('assignment_type', [
  'auto',    // System-generated
  'manual',  // User-assigned
]);

// =====================================================
// OBJECT OWNERS TABLE
// =====================================================

/**
 * Object Owners - RACI Assignments
 * 
 * Polymorphic table that tracks RACI ownership for any entity.
 */
export const objectOwners = pgTable('object_owners', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // ─────────────────────────────────────────────────────
  // Polymorphic Association
  // Allows RACI to be linked to any entity type
  // ─────────────────────────────────────────────────────
  entityType: text('entity_type').notNull(),
  // 'job' | 'candidate' | 'submission' | 'account' | 'lead' | 'deal' | 
  // 'campaign' | 'contact' | 'placement' | 'job_order' | 'consultant' | etc.
  
  entityId: uuid('entity_id').notNull(),

  // ─────────────────────────────────────────────────────
  // Owner Assignment
  // ─────────────────────────────────────────────────────
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // ─────────────────────────────────────────────────────
  // RACI Role
  // ─────────────────────────────────────────────────────
  role: text('role').notNull(),
  // 'responsible' | 'accountable' | 'consulted' | 'informed'
  // Exactly 1 accountable per entity (enforced by trigger)

  // ─────────────────────────────────────────────────────
  // Permission
  // Derived from role but can be overridden
  // ─────────────────────────────────────────────────────
  permission: text('permission').notNull().default('view'),
  // 'edit' | 'view'
  // Default: accountable/responsible = edit, consulted/informed = view

  // ─────────────────────────────────────────────────────
  // Primary Owner Flag
  // ─────────────────────────────────────────────────────
  isPrimary: boolean('is_primary').default(false),
  // TRUE for the accountable owner (quick lookup)

  // ─────────────────────────────────────────────────────
  // Assignment Metadata
  // ─────────────────────────────────────────────────────
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  assignedBy: uuid('assigned_by').references(() => userProfiles.id),
  assignmentType: text('assignment_type').default('auto'),
  // 'auto' | 'manual'

  // ─────────────────────────────────────────────────────
  // Notes
  // ─────────────────────────────────────────────────────
  notes: text('notes'),

  // ─────────────────────────────────────────────────────
  // Audit Trail
  // ─────────────────────────────────────────────────────
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Unique constraint: one role per user per entity
  entityUserUnique: uniqueIndex('uq_object_owners_entity_user')
    .on(table.entityType, table.entityId, table.userId),
  
  // Indexes for common queries
  orgIdIdx: index('idx_object_owners_org_id').on(table.orgId),
  userIdIdx: index('idx_object_owners_user_id').on(table.userId),
  entityIdx: index('idx_object_owners_entity').on(table.entityType, table.entityId),
  roleIdx: index('idx_object_owners_role').on(table.role),
  permissionIdx: index('idx_object_owners_permission').on(table.permission),
}));

// =====================================================
// RACI CHANGE LOG
// =====================================================

/**
 * RACI Change Log - Audit trail for ownership changes
 */
export const raciChangeLog = pgTable('raci_change_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Reference to the assignment
  objectOwnerId: uuid('object_owner_id').references(() => objectOwners.id, { onDelete: 'set null' }),

  // Entity reference (for when assignment is deleted)
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),

  // Change details
  changeType: text('change_type').notNull(),
  // 'assigned' | 'role_changed' | 'permission_changed' | 'removed' | 'transferred'

  // Before/After
  previousRole: text('previous_role'),
  newRole: text('new_role'),
  previousUserId: uuid('previous_user_id'),
  newUserId: uuid('new_user_id'),
  previousPermission: text('previous_permission'),
  newPermission: text('new_permission'),

  // Who made the change
  changedBy: uuid('changed_by').references(() => userProfiles.id),
  reason: text('reason'),

  // Timestamp
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  entityIdx: index('idx_raci_change_log_entity').on(table.entityType, table.entityId),
  changedAtIdx: index('idx_raci_change_log_changed_at').on(table.changedAt),
}));

// =====================================================
// RELATIONS
// =====================================================

export const objectOwnersRelations = relations(objectOwners, ({ one }) => ({
  organization: one(organizations, {
    fields: [objectOwners.orgId],
    references: [organizations.id],
  }),
  user: one(userProfiles, {
    fields: [objectOwners.userId],
    references: [userProfiles.id],
    relationName: 'objectOwnerUser',
  }),
  assignedByUser: one(userProfiles, {
    fields: [objectOwners.assignedBy],
    references: [userProfiles.id],
    relationName: 'objectOwnerAssigner',
  }),
}));

export const raciChangeLogRelations = relations(raciChangeLog, ({ one }) => ({
  organization: one(organizations, {
    fields: [raciChangeLog.orgId],
    references: [organizations.id],
  }),
  objectOwner: one(objectOwners, {
    fields: [raciChangeLog.objectOwnerId],
    references: [objectOwners.id],
  }),
  changedByUser: one(userProfiles, {
    fields: [raciChangeLog.changedBy],
    references: [userProfiles.id],
  }),
}));

// =====================================================
// TYPES
// =====================================================

export type ObjectOwner = typeof objectOwners.$inferSelect;
export type NewObjectOwner = typeof objectOwners.$inferInsert;

export type RACIChangeLog = typeof raciChangeLog.$inferSelect;
export type NewRACIChangeLog = typeof raciChangeLog.$inferInsert;

// RACI Role type
export type RACIRole = 'responsible' | 'accountable' | 'consulted' | 'informed';

// Permission type
export type RACIPermission = 'edit' | 'view';

// Assignment type
export type AssignmentType = 'auto' | 'manual';

// =====================================================
// CONSTANTS
// =====================================================

/**
 * Default permissions by RACI role
 */
export const DEFAULT_RACI_PERMISSIONS: Record<RACIRole, RACIPermission> = {
  responsible: 'edit',
  accountable: 'edit',
  consulted: 'view',
  informed: 'view',
};

/**
 * RACI role labels for display
 */
export const RACI_ROLE_LABELS: Record<RACIRole, string> = {
  responsible: 'Responsible',
  accountable: 'Accountable',
  consulted: 'Consulted',
  informed: 'Informed',
};

/**
 * RACI role descriptions
 */
export const RACI_ROLE_DESCRIPTIONS: Record<RACIRole, string> = {
  responsible: 'Does the work to complete the task',
  accountable: 'Approves/owns the outcome (primary owner)',
  consulted: 'Provides input before decisions',
  informed: 'Kept updated on progress',
};

/**
 * RACI role colors for badges
 */
export const RACI_ROLE_COLORS: Record<RACIRole, { bg: string; text: string }> = {
  responsible: { bg: 'bg-blue-100', text: 'text-blue-700' },
  accountable: { bg: 'bg-green-100', text: 'text-green-700' },
  consulted: { bg: 'bg-amber-100', text: 'text-amber-700' },
  informed: { bg: 'bg-stone-100', text: 'text-stone-600' },
};

/**
 * Entity types that support RACI
 */
export const RACI_ENTITY_TYPES = [
  'job',
  'candidate',
  'submission',
  'account',
  'contact',
  'lead',
  'deal',
  'campaign',
  'placement',
  'job_order',
  'consultant',
  'hotlist',
] as const;

export type RACIEntityType = typeof RACI_ENTITY_TYPES[number];

// =====================================================
// BACKWARDS COMPATIBILITY TYPE ALIASES
// Used by legacy components (RCAIBar, WorkspaceLayout, etc.)
// =====================================================

export type RCAIRoleType = RACIRole;
export type RCAIPermissionType = RACIPermission;
export type RCAIEntityTypeType = RACIEntityType;
export type RCAIAssignmentTypeType = AssignmentType;

// Legacy constants
export const RCAIRole = {
  RESPONSIBLE: 'responsible' as const,
  ACCOUNTABLE: 'accountable' as const,
  CONSULTED: 'consulted' as const,
  INFORMED: 'informed' as const,
};

export const RCAIPermission = {
  EDIT: 'edit' as const,
  VIEW: 'view' as const,
};

export const RCAIAssignmentType = {
  AUTO: 'auto' as const,
  MANUAL: 'manual' as const,
};

export const RCAIEntityType = {
  JOB: 'job' as const,
  CANDIDATE: 'candidate' as const,
  SUBMISSION: 'submission' as const,
  ACCOUNT: 'account' as const,
  CONTACT: 'contact' as const,
  LEAD: 'lead' as const,
  DEAL: 'deal' as const,
  CAMPAIGN: 'campaign' as const,
  PLACEMENT: 'placement' as const,
  JOB_ORDER: 'job_order' as const,
  CONSULTANT: 'consultant' as const,
  HOTLIST: 'hotlist' as const,
};

// =====================================================
// SQL FOR MIGRATIONS
// =====================================================

/**
 * SQL to create RLS policies for object_owners
 * Run this after table creation
 */
export const OBJECT_OWNERS_RLS_SQL = `
-- Enable RLS
ALTER TABLE object_owners ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "object_owners_org_isolation" ON object_owners
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Users can see their own assignments
CREATE POLICY "object_owners_user_read" ON object_owners
  FOR SELECT
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND user_id = (auth.jwt() ->> 'user_id')::uuid
  );
`;

/**
 * SQL to create triggers for object_owners
 * Run this after table creation
 */
export const OBJECT_OWNERS_TRIGGERS_SQL = `
-- Trigger: Updated at
CREATE TRIGGER object_owners_updated_at
  BEFORE UPDATE ON object_owners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Enforce primary owner rules
CREATE OR REPLACE FUNCTION enforce_primary_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting isPrimary=true, ensure role=accountable
  IF NEW.is_primary = TRUE AND NEW.role != 'accountable' THEN
    RAISE EXCEPTION 'Only accountable role can be primary owner';
  END IF;

  -- If role=accountable, automatically set isPrimary=true
  IF NEW.role = 'accountable' THEN
    NEW.is_primary := TRUE;
    NEW.permission := 'edit'; -- Accountable always has edit
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER object_owners_enforce_primary
  BEFORE INSERT OR UPDATE ON object_owners
  FOR EACH ROW
  EXECUTE FUNCTION enforce_primary_owner();

-- Trigger: Validate single accountable
CREATE OR REPLACE FUNCTION validate_single_accountable()
RETURNS TRIGGER AS $$
DECLARE
  accountable_count INTEGER;
BEGIN
  -- Count existing accountable owners for this entity (excluding self on update)
  SELECT COUNT(*) INTO accountable_count
  FROM object_owners
  WHERE entity_type = NEW.entity_type
    AND entity_id = NEW.entity_id
    AND role = 'accountable'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF NEW.role = 'accountable' AND accountable_count > 0 THEN
    RAISE EXCEPTION 'Entity already has an accountable owner. Use transferOwnership instead.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER object_owners_validate_accountable
  BEFORE INSERT OR UPDATE ON object_owners
  FOR EACH ROW
  WHEN (NEW.role = 'accountable')
  EXECUTE FUNCTION validate_single_accountable();
`;

