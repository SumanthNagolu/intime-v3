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

// Unified Activity System (primary activities table)
export * from './activities';

// Workplan & Activity Pattern System (Guidewire-inspired)
// Note: workplan.ts has its own activities - we selectively export to avoid conflicts
export {
  activityPatterns,
  activityPatternsRelations,
  activityPatternSuccessors,
  activityPatternSuccessorsRelations,
  workplanTemplates,
  workplanTemplatesRelations,
  workplanTemplateActivities,
  workplanTemplateActivitiesRelations,
  workplanInstances,
  workplanInstancesRelations,
  activityHistory,
  activityHistoryRelations,
} from './workplan';

// Sales Strategy System
export * from './strategy';

// Unified Workspace System (RCAI, Contacts, Job Orders)
export * from './workspace';

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

export type {
  ActivityPattern,
  NewActivityPattern,
  ActivityPatternSuccessor,
  NewActivityPatternSuccessor,
  WorkplanTemplate,
  NewWorkplanTemplate,
  WorkplanTemplateActivity,
  NewWorkplanTemplateActivity,
  WorkplanInstance,
  NewWorkplanInstance,
  Activity,
  NewActivity,
  ActivityHistory,
  NewActivityHistory,
} from './workplan';
