/**
 * Drizzle ORM Schema: Audit Logs
 *
 * Tables: audit_logs (partitioned), audit_log_retention_policy
 * Maps to SQL migration: 004_create_audit_tables.sql
 *
 * @module schema/audit
 */

import { pgTable, uuid, text, timestamp, jsonb, inet, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { organizations } from './organizations';

// ============================================================================
// TABLE: audit_logs (Partitioned by month)
// ============================================================================

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom(),

  // Temporal data (partition key)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

  // Multi-tenancy
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Action metadata
  tableName: text('table_name').notNull(),
  action: text('action').notNull(), // 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', etc.
  recordId: uuid('record_id'),

  // Actor information
  userId: uuid('user_id'),
  userEmail: text('user_email'),
  userIpAddress: inet('user_ip_address'),
  userAgent: text('user_agent'),

  // Change details
  oldValues: jsonb('old_values').$type<Record<string, unknown>>(),
  newValues: jsonb('new_values').$type<Record<string, unknown>>(),
  changedFields: text('changed_fields').array(),

  // Context
  requestId: text('request_id'),
  sessionId: text('session_id'),
  requestPath: text('request_path'),
  requestMethod: text('request_method'),

  // Metadata
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),

  // Severity
  severity: text('severity').default('info'), // 'debug', 'info', 'warning', 'error', 'critical'
});

// ============================================================================
// TABLE: audit_log_retention_policy
// ============================================================================

export const auditLogRetentionPolicy = pgTable('audit_log_retention_policy', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Policy details
  tableName: text('table_name').notNull().unique(),
  retentionMonths: integer('retention_months').notNull().default(6),
  archiveAfterMonths: integer('archive_after_months'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(userProfiles, {
    fields: [auditLogs.userId],
    references: [userProfiles.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type AuditLogRetentionPolicy = typeof auditLogRetentionPolicy.$inferSelect;
export type NewAuditLogRetentionPolicy = typeof auditLogRetentionPolicy.$inferInsert;

// ============================================================================
// ENUMS
// ============================================================================

export const AuditAction = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  CUSTOM: 'CUSTOM',
} as const;

export const AuditSeverity = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

export type AuditActionType = typeof AuditAction[keyof typeof AuditAction];
export type AuditSeverityType = typeof AuditSeverity[keyof typeof AuditSeverity];

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface AuditLogEntry {
  tableName: string;
  action: AuditActionType;
  recordId?: string;
  userId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverityType;
}
