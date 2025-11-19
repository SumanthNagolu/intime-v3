/**
 * Drizzle ORM Schema - Central Export
 *
 * All database tables, relations, and types for InTime v3.
 * Type-safe database access with Drizzle ORM.
 *
 * @module schema
 */

// Export all schemas
export * from './user-profiles';
export * from './rbac';
export * from './audit';
export * from './events';
export * from './timeline'; // Existing timeline schema

// Re-export commonly used types
export type {
  UserProfile,
  NewUserProfile,
  Role,
  NewRole,
  Permission,
  NewPermission,
  UserRole,
  NewUserRole,
  AuditLog,
  NewAuditLog,
  Event,
  NewEvent,
  EventSubscription,
  NewEventSubscription,
} from './user-profiles';
