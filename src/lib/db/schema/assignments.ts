/**
 * Drizzle ORM Schema: Assignments (RCAI Model)
 * 
 * Implements the Responsible, Accountable, Consulted, Informed (RACI) matrix
 * for generic entity assignments across the platform.
 */

import { pgTable, uuid, text, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { organizations } from './organizations';

export const assignmentRoleEnum = ['responsible', 'accountable', 'consulted', 'informed'] as const;

export const entityAssignments = pgTable('entity_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Polymorphic entity reference
  entityType: text('entity_type').notNull(), // 'job', 'candidate', 'submission', 'account', etc.
  entityId: uuid('entity_id').notNull(),

  // User assignment
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  // RACI Role
  role: text('role', { enum: assignmentRoleEnum }).notNull(), // 'responsible', 'accountable', 'consulted', 'informed'

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
}, (table) => ({
  // Index for quick lookups of a user's assignments
  userIdIdx: index('idx_entity_assignments_user_id').on(table.userId),
  // Index for quick lookups of an entity's assignments
  entityIdIdx: index('idx_entity_assignments_entity').on(table.entityType, table.entityId),
  // Ensure a user has only one role per entity (optional, but usually good practice)
  uniqueUserEntity: unique().on(table.entityType, table.entityId, table.userId),
}));

export const entityAssignmentsRelations = relations(entityAssignments, ({ one }) => ({
  organization: one(organizations, {
    fields: [entityAssignments.orgId],
    references: [organizations.id],
  }),
  user: one(userProfiles, {
    fields: [entityAssignments.userId],
    references: [userProfiles.id],
  }),
  creator: one(userProfiles, {
    fields: [entityAssignments.createdBy],
    references: [userProfiles.id],
  }),
}));

export type EntityAssignment = typeof entityAssignments.$inferSelect;
export type NewEntityAssignment = typeof entityAssignments.$inferInsert;

