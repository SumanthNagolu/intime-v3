/**
 * Zod Validation Schemas
 *
 * Centralized validation schemas for the application.
 * Uses drizzle-zod for automatic schema generation from database.
 */

import { z } from 'zod';

// ============================================================================
// CORE VALIDATION PATTERNS
// ============================================================================

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address');

export const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const uuid = z.string().uuid('Invalid UUID');

export const phone = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

export const url = z.string().url('Invalid URL');

export const nonEmptyString = z.string().trim().min(1, 'This field is required');

export const positiveInt = z.number().int().positive('Must be a positive integer');

export const dateString = z.string().datetime('Invalid datetime format');

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const userProfileSchema = z.object({
  id: uuid,
  email: email,
  full_name: nonEmptyString.max(255, 'Name too long'),
  phone: phone,
  org_id: uuid,
  created_at: dateString,
  updated_at: dateString,
});

export const updateUserProfileSchema = userProfileSchema
  .partial()
  .extend({
    id: uuid,
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'Must provide at least one field to update',
  });

export const createUserProfileSchema = userProfileSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    password: password,
  });

// ============================================================================
// EVENT SCHEMAS
// ============================================================================

export const eventSchema = z.object({
  id: uuid,
  event_type: nonEmptyString.max(255),
  event_category: nonEmptyString.max(100).optional(),
  payload: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
  user_email: email.optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'dead_letter']),
  retry_count: z.number().int().min(0).default(0),
  max_retries: z.number().int().min(0).default(3),
  next_retry_at: dateString.optional(),
  error_message: z.string().optional(),
  created_at: dateString,
  processed_at: dateString.optional(),
  failed_at: dateString.optional(),
  org_id: uuid,
});

export const publishEventSchema = eventSchema
  .omit({
    id: true,
    status: true,
    retry_count: true,
    created_at: true,
    processed_at: true,
    failed_at: true,
  })
  .extend({
    max_retries: z.number().int().min(0).max(10).default(3),
  });

export const eventFiltersSchema = z.object({
  eventType: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'dead_letter']).optional(),
  startDate: dateString.optional(),
  endDate: dateString.optional(),
  limit: z.number().int().min(1).max(200).default(100),
  offset: z.number().int().min(0).default(0),
});

export const replayEventsSchema = z.object({
  eventIds: z.array(uuid).min(1, 'Must provide at least one event ID').max(100, 'Maximum 100 events at once'),
});

// ============================================================================
// EVENT SUBSCRIPTION SCHEMAS
// ============================================================================

export const eventSubscriptionSchema = z.object({
  id: uuid,
  subscriber_name: nonEmptyString.max(255),
  event_pattern: nonEmptyString.max(255),
  is_active: z.boolean().default(true),
  failure_count: z.number().int().min(0).default(0),
  consecutive_failures: z.number().int().min(0).default(0),
  last_failure_at: dateString.optional(),
  last_failure_message: z.string().optional(),
  last_triggered_at: dateString.optional(),
  auto_disabled_at: dateString.optional(),
  org_id: uuid,
  created_at: dateString,
  updated_at: dateString,
});

export const handlerActionSchema = z.object({
  handlerId: uuid,
  reason: z.string().min(10, 'Reason must be at least 10 characters').optional(),
});

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const signupSchema = z.object({
  email: email,
  password: password,
  full_name: nonEmptyString.max(255),
  phone: phone.optional(),
});

export const loginSchema = z.object({
  email: email,
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: email,
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: password,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================================================
// ROLE & PERMISSION SCHEMAS
// ============================================================================

export const roleSchema = z.object({
  id: uuid,
  name: nonEmptyString.max(100),
  description: z.string().optional(),
  created_at: dateString,
});

export const permissionSchema = z.object({
  id: uuid,
  resource: nonEmptyString.max(100),
  action: nonEmptyString.max(100),
  description: z.string().optional(),
  created_at: dateString,
});

export const grantRoleSchema = z.object({
  userId: uuid,
  roleName: nonEmptyString.max(100),
});

export const checkPermissionSchema = z.object({
  userId: uuid,
  resource: nonEmptyString.max(100),
  action: nonEmptyString.max(100),
});

// ============================================================================
// ORGANIZATION SCHEMAS
// ============================================================================

export const organizationSchema = z.object({
  id: uuid,
  name: nonEmptyString.max(255),
  subdomain: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Subdomain must contain only lowercase letters, numbers, and hyphens')
    .max(63),
  settings: z.record(z.any()).optional(),
  created_at: dateString,
  updated_at: dateString,
});

export const updateOrganizationSchema = organizationSchema
  .partial()
  .extend({
    id: uuid,
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'Must provide at least one field to update',
  });

// ============================================================================
// FORM HELPERS
// ============================================================================

/**
 * Create a partial schema (all fields optional except specified keys)
 */
export function createPartialSchema<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  required: (keyof T)[] = []
) {
  const partial = schema.partial();

  if (required.length === 0) {
    return partial;
  }

  const requiredFields = Object.fromEntries(
    required.map((key) => [key, schema.shape[key]])
  ) as Partial<T>;

  return partial.extend(requiredFields as any);
}

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Search schema
 */
export const searchSchema = paginationSchema.extend({
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
});

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const schemas = {
  // Core patterns
  email,
  password,
  uuid,
  phone,
  url,
  nonEmptyString,
  positiveInt,
  dateString,

  // User
  userProfile: userProfileSchema,
  updateUserProfile: updateUserProfileSchema,
  createUserProfile: createUserProfileSchema,

  // Event
  event: eventSchema,
  publishEvent: publishEventSchema,
  eventFilters: eventFiltersSchema,
  replayEvents: replayEventsSchema,

  // Event Subscription
  eventSubscription: eventSubscriptionSchema,
  handlerAction: handlerActionSchema,

  // Auth
  signup: signupSchema,
  login: loginSchema,
  resetPassword: resetPasswordSchema,
  updatePassword: updatePasswordSchema,

  // Role & Permission
  role: roleSchema,
  permission: permissionSchema,
  grantRole: grantRoleSchema,
  checkPermission: checkPermissionSchema,

  // Organization
  organization: organizationSchema,
  updateOrganization: updateOrganizationSchema,

  // Pagination & Search
  pagination: paginationSchema,
  search: searchSchema,
};

// Export types
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type CreateUserProfile = z.infer<typeof createUserProfileSchema>;
export type Event = z.infer<typeof eventSchema>;
export type PublishEvent = z.infer<typeof publishEventSchema>;
export type EventFilters = z.infer<typeof eventFiltersSchema>;
export type ReplayEvents = z.infer<typeof replayEventsSchema>;
export type EventSubscription = z.infer<typeof eventSubscriptionSchema>;
export type HandlerAction = z.infer<typeof handlerActionSchema>;
export type Signup = z.infer<typeof signupSchema>;
export type Login = z.infer<typeof loginSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Permission = z.infer<typeof permissionSchema>;
export type GrantRole = z.infer<typeof grantRoleSchema>;
export type CheckPermission = z.infer<typeof checkPermissionSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type Search = z.infer<typeof searchSchema>;
