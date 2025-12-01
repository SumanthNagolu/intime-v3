/**
 * Drizzle ORM Schema: organizations
 *
 * Multi-tenant organizations table for SaaS business model.
 * Maps to SQL migration: 007_add_multi_tenancy.sql
 *
 * @module schema/organizations
 */

import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, numeric, date, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { auditLogs } from './audit';
import { events, eventDeliveryLog } from './events';
import { projectTimeline, sessionMetadata } from './timeline';
// Pods is imported for FK reference - the actual table is in ta-hr.ts
import { pods } from './ta-hr';

// ============================================================================
// ENUMS
// ============================================================================

export const organizationTierEnum = pgEnum('organization_tier', [
  'starter',
  'growth',
  'enterprise',
]);

export const podTypeEnum = pgEnum('pod_type', [
  'recruiting',
  'bench_sales',
  'ta',
]);

export const podMemberRoleEnum = pgEnum('pod_member_role', [
  'senior',
  'junior',
]);

/**
 * Organizations table
 *
 * Represents a staffing company using InTime as a SaaS platform.
 * Each organization is isolated via RLS policies.
 */
export const organizations = pgTable('organizations', {
  // Primary identification
  id: uuid('id').primaryKey().defaultRandom(),

  // Basic information
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  legalName: text('legal_name'),

  // Contact information
  email: text('email'),
  phone: text('phone'),
  website: text('website'),

  // Address
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  country: text('country').default('US'),

  // Billing
  billingEmail: text('billing_email'),
  taxId: text('tax_id'), // EIN, VAT, etc.

  // Subscription & limits
  subscriptionTier: text('subscription_tier').notNull().default('free'), // 'free', 'startup', 'business', 'enterprise'
  subscriptionStatus: text('subscription_status').notNull().default('active'), // 'active', 'suspended', 'cancelled'
  maxUsers: integer('max_users').default(5),
  maxCandidates: integer('max_candidates').default(100),
  maxStorageGb: integer('max_storage_gb').default(10),

  // Features & settings
  features: jsonb('features').$type<{
    aiMentoring?: boolean;
    crossPollination?: boolean;
    advancedAnalytics?: boolean;
    customBranding?: boolean;
    apiAccess?: boolean;
    ssoEnabled?: boolean;
  }>().default({}),

  settings: jsonb('settings').$type<{
    timezone?: string;
    locale?: string;
    branding?: {
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
    notifications?: {
      emailEnabled?: boolean;
      slackWebhook?: string;
    };
  }>().default({}),

  // Lifecycle
  status: text('status').notNull().default('active'), // 'active', 'suspended', 'deleted'
  onboardingCompleted: boolean('onboarding_completed').default(false),
  onboardingStep: text('onboarding_step'),

  // Localization (top-level for convenience)
  timezone: text('timezone').default('America/New_York'),
  locale: text('locale').default('en-US'),

  // Branding (top-level for convenience)
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),

  // Billing extras
  plan: text('plan').default('free'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  stripeCouponId: text('stripe_coupon_id'),
  stripeCustomerId: text('stripe_customer_id'),

  // NEW: Tier (from USER-ROLES spec)
  tier: text('tier').default('starter'), // 'starter', 'growth', 'enterprise'

  // NEW: Industry classification
  industry: text('industry'),

  // NEW: Health score (0-100, computed from various metrics)
  healthScore: integer('health_score'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // Soft delete
});

/**
 * Type: Organization record from database
 */
export type Organization = typeof organizations.$inferSelect;

/**
 * Type: New organization insertion
 */
export type NewOrganization = typeof organizations.$inferInsert;

/**
 * Type: Subscription tier
 */
export type SubscriptionTier = 'free' | 'startup' | 'business' | 'enterprise';

/**
 * Type: Organization status
 */
export type OrganizationStatus = 'active' | 'suspended' | 'deleted';

/**
 * Type: Organization tier
 */
export type OrganizationTier = 'starter' | 'growth' | 'enterprise';

// ============================================================================
// TABLE: regions
// ============================================================================

/**
 * Regions table
 *
 * Geographic regions for organizing pods and users.
 */
export const regions = pgTable('regions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Region details
  name: text('name').notNull(),
  code: text('code'), // e.g., 'US-EAST', 'APAC'
  country: text('country'),
  timezone: text('timezone').default('America/New_York'),

  // Manager
  managerId: uuid('manager_id').references(() => userProfiles.id),

  // Status
  isActive: boolean('is_active').default(true),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type Region = typeof regions.$inferSelect;
export type NewRegion = typeof regions.$inferInsert;

// ============================================================================
// NOTE: pods table is defined in ta-hr.ts
// This file only contains regions and pod_members to avoid duplication
// ============================================================================

// ============================================================================
// TABLE: pod_members
// ============================================================================

/**
 * Pod Members table
 *
 * Junction table for pod membership (supports multi-member pods).
 */
export const podMembers = pgTable('pod_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Pod reference
  podId: uuid('pod_id').notNull().references(() => pods.id, { onDelete: 'cascade' }),

  // User reference
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Role in pod
  role: text('role').notNull(), // 'senior', 'junior'

  // Membership dates
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  leftAt: timestamp('left_at', { withTimezone: true }),

  // Status
  isActive: boolean('is_active').default(true),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type PodMember = typeof podMembers.$inferSelect;
export type NewPodMember = typeof podMembers.$inferInsert;

// ============================================================================
// POD MEMBER ROLE CONSTANTS
// Note: PodType is defined in ta-hr.ts
// ============================================================================

export const PodMemberRole = {
  SENIOR: 'senior',
  JUNIOR: 'junior',
} as const;

export type PodMemberRoleValue = typeof PodMemberRole[keyof typeof PodMemberRole];

// ============================================================================
// RELATIONS
// ============================================================================

/**
 * Organizations Relations
 * Note: pods relation is defined in ta-hr.ts
 */
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(userProfiles),
  auditLogs: many(auditLogs),
  events: many(events),
  eventDeliveryLogs: many(eventDeliveryLog),
  projectTimeline: many(projectTimeline),
  sessionMetadata: many(sessionMetadata),
  regions: many(regions),
  podMembers: many(podMembers),
}));

/**
 * Regions Relations
 */
export const regionsRelations = relations(regions, ({ one }) => ({
  organization: one(organizations, {
    fields: [regions.orgId],
    references: [organizations.id],
  }),
  manager: one(userProfiles, {
    fields: [regions.managerId],
    references: [userProfiles.id],
  }),
}));

/**
 * Pod Members Relations
 * Note: Full pod table and relations are defined in ta-hr.ts
 */
export const podMembersRelations = relations(podMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [podMembers.orgId],
    references: [organizations.id],
  }),
  user: one(userProfiles, {
    fields: [podMembers.userId],
    references: [userProfiles.id],
  }),
}));
