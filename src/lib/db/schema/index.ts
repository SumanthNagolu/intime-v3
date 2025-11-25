/**
 * Drizzle ORM Schema - Central Export
 *
 * All database tables, relations, and types for InTime v3.
 * Type-safe database access with Drizzle ORM.
 *
 * @module schema
 */

// Export all schemas
export * from './academy';
export * from './organizations';
export * from './user-profiles';
export * from './rbac';
export * from './audit';
export * from './events';
export * from './timeline'; // Existing timeline schema

// Business modules
export * from './crm';
export * from './ats';
export * from './bench';
export * from './ta-hr';
export * from './shared';

// Re-export commonly used types
export type {
  Organization,
  NewOrganization,
  SubscriptionTier,
  OrganizationStatus,
} from './organizations';

export type {
  UserProfile,
  NewUserProfile,
} from './user-profiles';

export type {
  Role,
  NewRole,
  Permission,
  NewPermission,
  UserRole,
  NewUserRole,
} from './rbac';

export type {
  AuditLog,
  NewAuditLog,
} from './audit';

export type {
  Event,
  NewEvent,
  EventSubscription,
  NewEventSubscription,
} from './events';
