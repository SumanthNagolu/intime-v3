/**
 * Shared Server Action Type Definitions
 *
 * Provides common types and validation schemas used across all server actions.
 *
 * @module actions/types
 */

import { z } from 'zod';

// ============================================================================
// Core Action Result Types
// ============================================================================

/**
 * Standard result type for all server actions.
 * Provides consistent success/error handling across the application.
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Paginated result wrapper for list operations.
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

// ============================================================================
// User Context Types
// ============================================================================

/**
 * Current authenticated user context.
 */
export interface UserContext {
  id: string;
  authId: string;
  email: string;
  fullName: string;
  orgId: string;
}

/**
 * Extended user context with roles and permissions.
 */
export interface UserContextWithRoles extends UserContext {
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
    isPrimary: boolean;
  }>;
  permissions: Array<{
    resource: string;
    action: string;
    scope: string;
  }>;
}

// ============================================================================
// Audit Event Types
// ============================================================================

/**
 * Parameters for logging audit events.
 */
export interface AuditEventParams {
  tableName: string;
  action: string;
  recordId: string;
  userId: string;
  userEmail: string;
  orgId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  description?: string;
  category?: string;
}

/**
 * Audit log severity levels.
 */
export type AuditSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

// ============================================================================
// Common Validation Schemas
// ============================================================================

/**
 * Standard pagination schema for list operations.
 * Use: listUsersFiltersSchema.extend({ ...additionalFields })
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * UUID validation schema.
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Email validation schema.
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Password validation schema with strength requirements.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Date range filter schema.
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ============================================================================
// Permission Types
// ============================================================================

/**
 * Available permission actions.
 */
export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import'
  | 'manage'
  | 'assign'
  | 'send'
  | 'issue';

/**
 * Permission scope hierarchy (highest to lowest).
 */
export type PermissionScope = 'all' | 'department' | 'pod' | 'team' | 'own';

/**
 * Permission check parameters.
 */
export interface PermissionCheck {
  resource: string;
  action: PermissionAction;
  scope?: PermissionScope;
}

// ============================================================================
// Common Entity Types
// ============================================================================

/**
 * Base entity with common audit fields.
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Entity with organization isolation.
 */
export interface OrgEntity extends BaseEntity {
  orgId: string;
}

// ============================================================================
// Helper Type Utilities
// ============================================================================

/**
 * Make specified keys required.
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make all keys optional except specified ones.
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Extract the data type from an ActionResult.
 */
export type ExtractActionData<T> = T extends ActionResult<infer U> ? U : never;
