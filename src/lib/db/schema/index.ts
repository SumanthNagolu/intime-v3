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
export * from './hr';
export * from './shared';

// Unified Activity System (primary activities table)
// export * from './activities'; // Deprecated: merged into workplan.ts

// Workplan & Activity Pattern System (Guidewire-inspired)
// Note: workplan.ts now contains the unified 'activities' table
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
  activities, // The unified activities table
  activitiesRelations,
  activityHistory,
  activityHistoryRelations,
} from './workplan';

// RCAI Assignments (legacy)
export * from './assignments';

// RACI Ownership System (new Guidewire-inspired)
export * from './raci';

// SLA System
export * from './sla';

// Sales Strategy System
export * from './strategy';

// Unified Workspace System (RCAI, Contacts, Job Orders)
// MOVED TO: tmp/old-conflicting-code/schema/workspace.ts (had conflicting exports)
// export * from './workspace';

// Re-export commonly used types
export type {
  Organization,
  NewOrganization,
  SubscriptionTier,
  OrganizationStatus,
  OrganizationTier,
  Region,
  NewRegion,
  PodMember,
  NewPodMember,
  PodMemberRoleValue,
} from './organizations';

// Pod types are exported from ta-hr.ts via the export * from './ta-hr'

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
  SystemRole,
  NewSystemRole,
  SystemRoleType,
  PermissionActionType,
  PermissionScopeType,
  RoleCategoryType,
  PermissionEntityType,
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

// RACI Types
export type {
  ObjectOwner,
  NewObjectOwner,
  RACIChangeLog,
  NewRACIChangeLog,
  RACIRole,
  RACIPermission,
  AssignmentType,
  RACIEntityType,
} from './raci';

// SLA Types
export type {
  SLADefinition,
  NewSLADefinition,
  SLATracking,
  NewSLATracking,
  SLAViolation,
  NewSLAViolation,
  SLAStatus,
  SLAMetric,
  SLARecipient,
  ViolationType,
} from './sla';
