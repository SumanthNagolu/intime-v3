/**
 * Drizzle ORM Schema: organizations
 *
 * Multi-tenant organizations table for SaaS business model.
 * Maps to SQL migration: 007_add_multi_tenancy.sql
 *
 * @module schema/organizations
 */

import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { auditLogs } from './audit';
import { events, eventDeliveryLog } from './events';
import { projectTimeline, sessionMetadata } from './timeline';

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
 * Relations
 */
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(userProfiles),
  auditLogs: many(auditLogs),
  events: many(events),
  eventDeliveryLogs: many(eventDeliveryLog),
  projectTimeline: many(projectTimeline),
  sessionMetadata: many(sessionMetadata),
}));
