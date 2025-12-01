/**
 * Drizzle ORM Schema: Bench Sales Module (Complete)
 * Modules: Bench Consultants, Marketing, Vendors, Job Orders, Immigration
 * Version: 2.0 (Complete redesign)
 * Last Updated: 2025-11-30
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  date,
  jsonb,
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { organizations } from './organizations';
import { accounts } from './crm';

// =====================================================
// ENUMS
// =====================================================

export const visaTypeEnum = pgEnum('visa_type', [
  // US Visas
  'usc',
  'green_card',
  'gc_ead',
  'h1b',
  'h1b_transfer',
  'h4_ead',
  'l1a',
  'l1b',
  'l2_ead',
  'opt',
  'opt_stem',
  'cpt',
  'tn',
  'e3',
  'o1',
  // Canada
  'canada_citizen',
  'canada_pr',
  'canada_owp',
  'canada_cwp',
  'canada_pgwp',
  'canada_lmia',
]);

export const visaAlertLevelEnum = pgEnum('visa_alert_level', [
  'green',   // > 180 days
  'yellow',  // 90-180 days
  'orange',  // 30-90 days
  'red',     // < 30 days
  'black',   // Expired
]);

export const benchStatusEnum = pgEnum('bench_status', [
  'onboarding',
  'available',
  'marketing',
  'interviewing',
  'placed',
  'inactive',
]);

export const marketingStatusEnum = pgEnum('marketing_status', [
  'draft',
  'active',
  'paused',
  'archived',
]);

export const vendorTypeEnum = pgEnum('vendor_type', [
  'direct_client',
  'prime_vendor',
  'sub_vendor',
  'msp',
  'vms',
]);

export const vendorTierEnum = pgEnum('vendor_tier', [
  'preferred',
  'standard',
  'new',
]);

export const jobOrderStatusEnum = pgEnum('job_order_status', [
  'new',
  'working',
  'filled',
  'closed',
  'on_hold',
]);

export const jobOrderPriorityEnum = pgEnum('job_order_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const jobOrderSourceEnum = pgEnum('job_order_source', [
  'email',
  'portal',
  'call',
  'referral',
]);

export const immigrationCaseTypeEnum = pgEnum('immigration_case_type', [
  'h1b_transfer',
  'h1b_extension',
  'h1b_amendment',
  'gc_perm',
  'gc_i140',
  'gc_i485',
  'opt_extension',
  'tn_renewal',
  'l1_extension',
]);

export const immigrationCaseStatusEnum = pgEnum('immigration_case_status', [
  'not_started',
  'in_progress',
  'rfe',
  'approved',
  'denied',
  'withdrawn',
]);

// =====================================================
// MODULE 1: BENCH CONSULTANTS (6 tables)
// =====================================================

/**
 * BENCH_CONSULTANTS
 * Main table for consultants on bench (extends user_profiles)
 */
export const benchConsultants = pgTable('bench_consultants', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Status
  status: benchStatusEnum('status').notNull().default('available'),
  benchStartDate: date('bench_start_date').notNull(),

  // Work Authorization
  visaType: visaTypeEnum('visa_type'),
  visaExpiryDate: date('visa_expiry_date'),
  workAuthStatus: text('work_auth_status'), // 'valid', 'expiring', 'expired', 'pending'

  // Rates
  minAcceptableRate: numeric('min_acceptable_rate', { precision: 10, scale: 2 }),
  targetRate: numeric('target_rate', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),

  // Location Preferences
  willingRelocate: boolean('willing_relocate').default(false),
  preferredLocations: text('preferred_locations').array(),

  // Marketing
  marketingStatus: marketingStatusEnum('marketing_status').default('draft'),

  // Assignment
  benchSalesRepId: uuid('bench_sales_rep_id').references(() => userProfiles.id),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  uniqueCandidate: unique().on(table.candidateId),
}));

/**
 * CONSULTANT_VISA_DETAILS
 * Detailed visa information and tracking
 */
export const consultantVisaDetails = pgTable('consultant_visa_details', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Visa Information
  visaType: visaTypeEnum('visa_type').notNull(),
  visaStartDate: date('visa_start_date'),
  visaExpiryDate: date('visa_expiry_date'),

  // LCA (for H1B)
  lcaStatus: text('lca_status'), // 'active', 'expired', 'pending'
  employerOfRecord: text('employer_of_record'),

  // Grace Period
  gracePeriodEnds: date('grace_period_ends'),

  // Alert
  alertLevel: visaAlertLevelEnum('alert_level').default('green'),

  // Notes
  notes: text('notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * CONSULTANT_WORK_AUTHORIZATION
 * Work authorization documents and verification
 */
export const consultantWorkAuthorization = pgTable('consultant_work_authorization', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Authorization
  authType: text('auth_type').notNull(), // 'ead', 'visa', 'passport', 'i94', 'gc'
  startDate: date('start_date'),
  endDate: date('end_date'),

  // Document
  documentUrl: text('document_url'),
  documentFileId: uuid('document_file_id'), // Reference to file_uploads table

  // Verification
  verifiedBy: uuid('verified_by').references(() => userProfiles.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * CONSULTANT_AVAILABILITY
 * Availability and scheduling constraints
 */
export const consultantAvailability = pgTable('consultant_availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Availability
  availableFrom: date('available_from').notNull(),
  noticePeriodDays: integer('notice_period_days').default(0),

  // Blackout dates (JSONB array of {start, end, reason})
  blackoutDates: jsonb('blackout_dates'), // [{start: '2024-12-20', end: '2024-12-30', reason: 'Holiday'}]

  // Restrictions
  travelRestrictions: text('travel_restrictions'),
  relocationAssistanceNeeded: boolean('relocation_assistance_needed').default(false),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * CONSULTANT_RATES
 * Rate history and expectations
 */
export const consultantRates = pgTable('consultant_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Rate
  rateType: text('rate_type').notNull().default('hourly'), // 'hourly', 'daily', 'monthly', 'annual'
  minRate: numeric('min_rate', { precision: 10, scale: 2 }).notNull(),
  targetRate: numeric('target_rate', { precision: 10, scale: 2 }).notNull(),
  maxRate: numeric('max_rate', { precision: 10, scale: 2 }),
  currency: text('currency').notNull().default('USD'),

  // Effective dates
  effectiveFrom: date('effective_from').notNull(),
  effectiveTo: date('effective_to'),

  // Notes
  notes: text('notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

/**
 * CONSULTANT_SKILLS_MATRIX
 * Skills with proficiency and experience tracking
 */
export const consultantSkillsMatrix = pgTable('consultant_skills_matrix', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Skill (reference to skills table)
  skillId: uuid('skill_id').notNull(), // References skills.id
  skillName: text('skill_name').notNull(), // Denormalized for performance

  // Proficiency
  proficiencyLevel: integer('proficiency_level').notNull(), // 1-5
  yearsExperience: numeric('years_experience', { precision: 4, scale: 1 }),
  lastUsedDate: date('last_used_date'),

  // Certification
  isCertified: boolean('is_certified').default(false),
  certificationName: text('certification_name'),
  certificationExpiry: date('certification_expiry'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueConsultantSkill: unique().on(table.consultantId, table.skillId),
}));

// =====================================================
// MODULE 2: MARKETING (6 tables)
// =====================================================

/**
 * MARKETING_PROFILES
 * Consultant marketing profiles (resumes, bios, highlights)
 */
export const marketingProfiles = pgTable('marketing_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Profile content
  headline: text('headline').notNull(), // Max 100 chars
  summary: text('summary'),
  highlights: text('highlights').array(), // Key accomplishments

  // Targeting
  targetRoles: text('target_roles').array(),
  targetIndustries: text('target_industries').array(),

  // Version
  version: integer('version').notNull().default(1),
  status: marketingStatusEnum('status').notNull().default('draft'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

/**
 * MARKETING_FORMATS
 * Different format versions of marketing profiles
 */
export const marketingFormats = pgTable('marketing_formats', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => marketingProfiles.id, { onDelete: 'cascade' }),

  // Format
  formatType: text('format_type').notNull(), // 'standard', 'detailed', 'one_pager', 'client_specific'
  content: text('content'), // Text content
  fileUrl: text('file_url'), // Generated file URL
  fileId: uuid('file_id'), // Reference to file_uploads table

  // Version
  version: integer('version').notNull().default(1),
  isDefault: boolean('is_default').default(false),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * MARKETING_TEMPLATES
 * Reusable marketing templates
 */
export const marketingTemplates = pgTable('marketing_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Template
  name: text('name').notNull(),
  formatType: text('format_type').notNull(),
  templateContent: text('template_content').notNull(),

  // Placeholders (JSONB)
  placeholders: jsonb('placeholders'), // {name, type, required, default}

  // Status
  isActive: boolean('is_active').default(true),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

/**
 * HOTLISTS
 * Marketing hotlists (enhanced from existing)
 */
export const hotlists = pgTable('hotlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Hotlist details
  name: text('name').notNull(),
  description: text('description'),

  // Purpose
  purpose: text('purpose').notNull(), // 'general', 'client_specific', 'skill_specific'
  clientId: uuid('client_id').references(() => accounts.id),

  // Status
  status: text('status').notNull().default('active'), // 'active', 'archived'

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

/**
 * HOTLIST_CONSULTANTS
 * Junction table for hotlists and consultants
 */
export const hotlistConsultants = pgTable('hotlist_consultants', {
  id: uuid('id').primaryKey().defaultRandom(),
  hotlistId: uuid('hotlist_id').notNull().references(() => hotlists.id, { onDelete: 'cascade' }),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Ordering
  positionOrder: integer('position_order'),

  // Notes
  notes: text('notes'),

  // Audit
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  addedBy: uuid('added_by').references(() => userProfiles.id),
}, (table) => ({
  uniqueHotlistConsultant: unique().on(table.hotlistId, table.consultantId),
}));

/**
 * MARKETING_ACTIVITIES
 * Marketing activity tracking (emails, calls, submissions)
 */
export const marketingActivities = pgTable('marketing_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Activity
  activityType: text('activity_type').notNull(), // 'email_blast', 'linkedin', 'call', 'submission'
  targetType: text('target_type').notNull(), // 'vendor', 'client', 'job_board'
  targetId: uuid('target_id'), // vendor_id, account_id, etc.
  targetName: text('target_name'),

  // Sent
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull(),

  // Response
  responseType: text('response_type'), // 'no_response', 'interested', 'not_interested', 'interview'
  responseAt: timestamp('response_at', { withTimezone: true }),

  // Notes
  notes: text('notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

// =====================================================
// MODULE 3: VENDORS (6 tables)
// =====================================================

/**
 * VENDORS
 * Vendor/partner companies
 */
export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Basic info
  name: text('name').notNull(),
  type: vendorTypeEnum('type').notNull(),
  status: text('status').notNull().default('active'), // 'active', 'inactive', 'blacklisted'
  tier: vendorTierEnum('tier').default('standard'),

  // Details
  website: text('website'),
  industryFocus: text('industry_focus').array(),
  geographicFocus: text('geographic_focus').array(),

  // Notes
  notes: text('notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/**
 * VENDOR_CONTACTS
 * Points of contact at vendors
 */
export const vendorContacts = pgTable('vendor_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),

  // Contact info
  name: text('name').notNull(),
  title: text('title'),
  email: text('email'),
  phone: text('phone'),

  // Primary contact
  isPrimary: boolean('is_primary').default(false),

  // Department
  department: text('department'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * VENDOR_TERMS
 * Custom negotiated financial terms with vendors
 */
export const vendorTerms = pgTable('vendor_terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),

  // Payment
  paymentTermsDays: integer('payment_terms_days').default(30), // Net 30, 45, 60
  markupMinPercent: numeric('markup_min_percent', { precision: 5, scale: 2 }),
  markupMaxPercent: numeric('markup_max_percent', { precision: 5, scale: 2 }),

  // Rate range
  preferredRateRangeMin: numeric('preferred_rate_range_min', { precision: 10, scale: 2 }),
  preferredRateRangeMax: numeric('preferred_rate_range_max', { precision: 10, scale: 2 }),

  // Contract
  contractType: text('contract_type'), // 'msa', 'sow', 'one_time'
  contractExpiry: date('contract_expiry'),
  msaOnFile: boolean('msa_on_file').default(false),

  // Notes
  notes: text('notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

/**
 * VENDOR_RELATIONSHIPS
 * Relationships between vendors and other entities
 */
export const vendorRelationships = pgTable('vendor_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),

  // Related entity (polymorphic)
  relatedEntityType: text('related_entity_type').notNull(), // 'account', 'vendor'
  relatedEntityId: uuid('related_entity_id').notNull(),

  // Relationship
  relationshipType: text('relationship_type').notNull(), // 'partner', 'subcontractor', 'preferred'
  strength: text('strength'), // 'strong', 'moderate', 'weak'

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

/**
 * VENDOR_PERFORMANCE
 * Monthly performance metrics for vendors
 */
export const vendorPerformance = pgTable('vendor_performance', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),

  // Period
  period: text('period').notNull(), // 'YYYY-MM'

  // Metrics
  submissionsCount: integer('submissions_count').default(0),
  interviewsCount: integer('interviews_count').default(0),
  placementsCount: integer('placements_count').default(0),
  avgMarginPercent: numeric('avg_margin_percent', { precision: 5, scale: 2 }),

  // Scores (1-5)
  paymentTimelinessScore: integer('payment_timeliness_score'),
  responsivenessScore: integer('responsiveness_score'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueVendorPeriod: unique().on(table.vendorId, table.period),
}));

/**
 * VENDOR_BLACKLIST
 * Blacklisted vendors
 */
export const vendorBlacklist = pgTable('vendor_blacklist', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),

  // Blacklist reason
  reason: text('reason').notNull(),

  // Review
  reviewDate: date('review_date'), // When to review for removal

  // Audit
  blacklistedAt: timestamp('blacklisted_at', { withTimezone: true }).defaultNow().notNull(),
  blacklistedBy: uuid('blacklisted_by').references(() => userProfiles.id),
});

// =====================================================
// MODULE 4: JOB ORDERS (4 tables)
// =====================================================

/**
 * JOB_ORDERS
 * Job requirements from vendors
 */
export const jobOrders = pgTable('job_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Vendor
  vendorId: uuid('vendor_id').references(() => vendors.id),
  clientName: text('client_name'), // End client (may not be in accounts)

  // Job details
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  workMode: text('work_mode'), // 'remote', 'hybrid', 'onsite'

  // Rates
  rateType: text('rate_type').default('hourly'),
  billRate: numeric('bill_rate', { precision: 10, scale: 2 }),
  durationMonths: integer('duration_months'),

  // Positions
  positions: integer('positions').default(1),

  // Status
  status: jobOrderStatusEnum('status').notNull().default('new'),
  priority: jobOrderPriorityEnum('priority').default('medium'),

  // Source
  receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
  responseDueAt: timestamp('response_due_at', { withTimezone: true }),
  source: jobOrderSourceEnum('source').default('email'),
  originalSourceUrl: text('original_source_url'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/**
 * JOB_ORDER_REQUIREMENTS
 * Detailed requirements for job orders
 */
export const jobOrderRequirements = pgTable('job_order_requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => jobOrders.id, { onDelete: 'cascade' }),

  // Requirement
  requirement: text('requirement').notNull(),
  type: text('type').notNull(), // 'must_have', 'nice_to_have'
  priority: integer('priority').default(1), // 1=highest

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * JOB_ORDER_SKILLS
 * Skills required for job orders
 */
export const jobOrderSkills = pgTable('job_order_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => jobOrders.id, { onDelete: 'cascade' }),

  // Skill
  skillName: text('skill_name').notNull(),
  yearsRequired: numeric('years_required', { precision: 4, scale: 1 }),
  proficiencyRequired: integer('proficiency_required'), // 1-5

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * JOB_ORDER_SUBMISSIONS
 * Submissions to job orders
 */
export const jobOrderSubmissions = pgTable('job_order_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => jobOrders.id, { onDelete: 'cascade' }),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Submission
  status: text('status').notNull().default('submitted'), // 'submitted', 'shortlisted', 'rejected', 'interview', 'placed'
  submittedRate: numeric('submitted_rate', { precision: 10, scale: 2 }),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),

  // Response
  clientResponseAt: timestamp('client_response_at', { withTimezone: true }),

  // Notes
  notes: text('notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
}, (table) => ({
  uniqueOrderConsultant: unique().on(table.orderId, table.consultantId),
}));

/**
 * JOB_ORDER_NOTES
 * Notes on job orders
 */
export const jobOrderNotes = pgTable('job_order_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => jobOrders.id, { onDelete: 'cascade' }),

  // Note
  note: text('note').notNull(),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

// =====================================================
// MODULE 5: IMMIGRATION (5 tables)
// =====================================================

/**
 * IMMIGRATION_CASES
 * Immigration petitions and cases (enhanced)
 */
export const immigrationCases = pgTable('immigration_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Case
  caseType: immigrationCaseTypeEnum('case_type').notNull(),
  status: immigrationCaseStatusEnum('status').notNull().default('not_started'),

  // Priority date (for GC)
  priorityDate: date('priority_date'),

  // Receipt
  receiptNumber: text('receipt_number'),

  // Attorney
  attorneyId: uuid('attorney_id'), // References immigration_attorneys.id

  // Employer
  employerId: uuid('employer_id').references(() => organizations.id),

  // Dates
  startDate: date('start_date'),
  expectedCompletion: date('expected_completion'),
  actualCompletion: date('actual_completion'),

  // Notes
  notes: text('notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

/**
 * IMMIGRATION_ATTORNEYS
 * Immigration attorney directory
 */
export const immigrationAttorneys = pgTable('immigration_attorneys', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Attorney info
  name: text('name').notNull(),
  firm: text('firm'),
  email: text('email'),
  phone: text('phone'),

  // Specialization
  specialization: text('specialization').array(), // ['h1b', 'green_card', 'tn', 'opt']

  // Rating
  rating: numeric('rating', { precision: 3, scale: 1 }), // 1.0 - 5.0

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * IMMIGRATION_DOCUMENTS
 * Immigration case documents
 */
export const immigrationDocuments = pgTable('immigration_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => immigrationCases.id, { onDelete: 'cascade' }),

  // Document
  documentType: text('document_type').notNull(), // 'passport', 'visa', 'i94', 'lca', 'approval_notice', 'ead', 'other'
  fileUrl: text('file_url'),
  fileId: uuid('file_id'), // Reference to file_uploads table
  fileName: text('file_name'),

  // Dates
  issueDate: date('issue_date'),
  expiryDate: date('expiry_date'),

  // Verification
  verifiedBy: uuid('verified_by').references(() => userProfiles.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * IMMIGRATION_TIMELINES
 * Case milestone tracking
 */
export const immigrationTimelines = pgTable('immigration_timelines', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => immigrationCases.id, { onDelete: 'cascade' }),

  // Milestone
  milestone: text('milestone').notNull(), // 'filing', 'receipt', 'rfe_response', 'decision'
  targetDate: date('target_date'),
  actualDate: date('actual_date'),

  // Status
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'overdue'

  // Notes
  notes: text('notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * IMMIGRATION_ALERTS
 * Automated alerts for visa expiry and deadlines
 */
export const immigrationAlerts = pgTable('immigration_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultantId: uuid('consultant_id').notNull().references(() => benchConsultants.id, { onDelete: 'cascade' }),

  // Alert
  alertType: text('alert_type').notNull(), // 'visa_expiry', 'lca_expiry', 'gc_priority_date', 'document_expiry'
  entityId: uuid('entity_id'), // visa_details_id, case_id, document_id
  alertDate: date('alert_date').notNull(),

  // Severity
  severity: text('severity').notNull(), // 'info', 'warning', 'critical'
  message: text('message').notNull(),

  // Acknowledgment
  acknowledgedBy: uuid('acknowledged_by').references(() => userProfiles.id),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// =====================================================
// RELATIONS
// =====================================================

export const benchConsultantsRelations = relations(benchConsultants, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [benchConsultants.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [benchConsultants.candidateId],
    references: [userProfiles.id],
  }),
  benchSalesRep: one(userProfiles, {
    fields: [benchConsultants.benchSalesRepId],
    references: [userProfiles.id],
  }),
  visaDetails: many(consultantVisaDetails),
  workAuthorizations: many(consultantWorkAuthorization),
  availability: many(consultantAvailability),
  rates: many(consultantRates),
  skillsMatrix: many(consultantSkillsMatrix),
  marketingProfiles: many(marketingProfiles),
  hotlistEntries: many(hotlistConsultants),
  marketingActivities: many(marketingActivities),
  jobOrderSubmissions: many(jobOrderSubmissions),
  immigrationCases: many(immigrationCases),
  immigrationAlerts: many(immigrationAlerts),
}));

export const consultantVisaDetailsRelations = relations(consultantVisaDetails, ({ one }) => ({
  consultant: one(benchConsultants, {
    fields: [consultantVisaDetails.consultantId],
    references: [benchConsultants.id],
  }),
}));

export const consultantWorkAuthorizationRelations = relations(consultantWorkAuthorization, ({ one }) => ({
  consultant: one(benchConsultants, {
    fields: [consultantWorkAuthorization.consultantId],
    references: [benchConsultants.id],
  }),
  verifier: one(userProfiles, {
    fields: [consultantWorkAuthorization.verifiedBy],
    references: [userProfiles.id],
  }),
}));

export const consultantAvailabilityRelations = relations(consultantAvailability, ({ one }) => ({
  consultant: one(benchConsultants, {
    fields: [consultantAvailability.consultantId],
    references: [benchConsultants.id],
  }),
}));

export const consultantRatesRelations = relations(consultantRates, ({ one }) => ({
  consultant: one(benchConsultants, {
    fields: [consultantRates.consultantId],
    references: [benchConsultants.id],
  }),
  creator: one(userProfiles, {
    fields: [consultantRates.createdBy],
    references: [userProfiles.id],
  }),
}));

export const consultantSkillsMatrixRelations = relations(consultantSkillsMatrix, ({ one }) => ({
  consultant: one(benchConsultants, {
    fields: [consultantSkillsMatrix.consultantId],
    references: [benchConsultants.id],
  }),
}));

export const marketingProfilesRelations = relations(marketingProfiles, ({ one, many }) => ({
  consultant: one(benchConsultants, {
    fields: [marketingProfiles.consultantId],
    references: [benchConsultants.id],
  }),
  creator: one(userProfiles, {
    fields: [marketingProfiles.createdBy],
    references: [userProfiles.id],
  }),
  formats: many(marketingFormats),
}));

export const marketingFormatsRelations = relations(marketingFormats, ({ one }) => ({
  profile: one(marketingProfiles, {
    fields: [marketingFormats.profileId],
    references: [marketingProfiles.id],
  }),
}));

export const marketingTemplatesRelations = relations(marketingTemplates, ({ one }) => ({
  organization: one(organizations, {
    fields: [marketingTemplates.orgId],
    references: [organizations.id],
  }),
  creator: one(userProfiles, {
    fields: [marketingTemplates.createdBy],
    references: [userProfiles.id],
  }),
}));

export const hotlistsRelations = relations(hotlists, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [hotlists.orgId],
    references: [organizations.id],
  }),
  client: one(accounts, {
    fields: [hotlists.clientId],
    references: [accounts.id],
  }),
  creator: one(userProfiles, {
    fields: [hotlists.createdBy],
    references: [userProfiles.id],
  }),
  consultants: many(hotlistConsultants),
}));

export const hotlistConsultantsRelations = relations(hotlistConsultants, ({ one }) => ({
  hotlist: one(hotlists, {
    fields: [hotlistConsultants.hotlistId],
    references: [hotlists.id],
  }),
  consultant: one(benchConsultants, {
    fields: [hotlistConsultants.consultantId],
    references: [benchConsultants.id],
  }),
  addedByUser: one(userProfiles, {
    fields: [hotlistConsultants.addedBy],
    references: [userProfiles.id],
  }),
}));

export const marketingActivitiesRelations = relations(marketingActivities, ({ one }) => ({
  consultant: one(benchConsultants, {
    fields: [marketingActivities.consultantId],
    references: [benchConsultants.id],
  }),
  creator: one(userProfiles, {
    fields: [marketingActivities.createdBy],
    references: [userProfiles.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [vendors.orgId],
    references: [organizations.id],
  }),
  creator: one(userProfiles, {
    fields: [vendors.createdBy],
    references: [userProfiles.id],
  }),
  contacts: many(vendorContacts),
  terms: many(vendorTerms),
  relationships: many(vendorRelationships),
  performance: many(vendorPerformance),
  blacklist: many(vendorBlacklist),
  jobOrders: many(jobOrders),
}));

export const vendorContactsRelations = relations(vendorContacts, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorContacts.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorTermsRelations = relations(vendorTerms, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorTerms.vendorId],
    references: [vendors.id],
  }),
  creator: one(userProfiles, {
    fields: [vendorTerms.createdBy],
    references: [userProfiles.id],
  }),
}));

export const vendorRelationshipsRelations = relations(vendorRelationships, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorRelationships.vendorId],
    references: [vendors.id],
  }),
  creator: one(userProfiles, {
    fields: [vendorRelationships.createdBy],
    references: [userProfiles.id],
  }),
}));

export const vendorPerformanceRelations = relations(vendorPerformance, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorPerformance.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorBlacklistRelations = relations(vendorBlacklist, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorBlacklist.vendorId],
    references: [vendors.id],
  }),
  blacklistedByUser: one(userProfiles, {
    fields: [vendorBlacklist.blacklistedBy],
    references: [userProfiles.id],
  }),
}));

export const jobOrdersRelations = relations(jobOrders, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [jobOrders.orgId],
    references: [organizations.id],
  }),
  vendor: one(vendors, {
    fields: [jobOrders.vendorId],
    references: [vendors.id],
  }),
  creator: one(userProfiles, {
    fields: [jobOrders.createdBy],
    references: [userProfiles.id],
  }),
  requirements: many(jobOrderRequirements),
  skills: many(jobOrderSkills),
  submissions: many(jobOrderSubmissions),
  notes: many(jobOrderNotes),
}));

export const jobOrderRequirementsRelations = relations(jobOrderRequirements, ({ one }) => ({
  order: one(jobOrders, {
    fields: [jobOrderRequirements.orderId],
    references: [jobOrders.id],
  }),
}));

export const jobOrderSkillsRelations = relations(jobOrderSkills, ({ one }) => ({
  order: one(jobOrders, {
    fields: [jobOrderSkills.orderId],
    references: [jobOrders.id],
  }),
}));

export const jobOrderSubmissionsRelations = relations(jobOrderSubmissions, ({ one }) => ({
  order: one(jobOrders, {
    fields: [jobOrderSubmissions.orderId],
    references: [jobOrders.id],
  }),
  consultant: one(benchConsultants, {
    fields: [jobOrderSubmissions.consultantId],
    references: [benchConsultants.id],
  }),
  creator: one(userProfiles, {
    fields: [jobOrderSubmissions.createdBy],
    references: [userProfiles.id],
  }),
}));

export const jobOrderNotesRelations = relations(jobOrderNotes, ({ one }) => ({
  order: one(jobOrders, {
    fields: [jobOrderNotes.orderId],
    references: [jobOrders.id],
  }),
  creator: one(userProfiles, {
    fields: [jobOrderNotes.createdBy],
    references: [userProfiles.id],
  }),
}));

export const immigrationCasesRelations = relations(immigrationCases, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [immigrationCases.orgId],
    references: [organizations.id],
  }),
  consultant: one(benchConsultants, {
    fields: [immigrationCases.consultantId],
    references: [benchConsultants.id],
  }),
  attorney: one(immigrationAttorneys, {
    fields: [immigrationCases.attorneyId],
    references: [immigrationAttorneys.id],
  }),
  creator: one(userProfiles, {
    fields: [immigrationCases.createdBy],
    references: [userProfiles.id],
  }),
  documents: many(immigrationDocuments),
  timelines: many(immigrationTimelines),
}));

export const immigrationAttorneysRelations = relations(immigrationAttorneys, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [immigrationAttorneys.orgId],
    references: [organizations.id],
  }),
  cases: many(immigrationCases),
}));

export const immigrationDocumentsRelations = relations(immigrationDocuments, ({ one }) => ({
  case: one(immigrationCases, {
    fields: [immigrationDocuments.caseId],
    references: [immigrationCases.id],
  }),
  verifier: one(userProfiles, {
    fields: [immigrationDocuments.verifiedBy],
    references: [userProfiles.id],
  }),
}));

export const immigrationTimelinesRelations = relations(immigrationTimelines, ({ one }) => ({
  case: one(immigrationCases, {
    fields: [immigrationTimelines.caseId],
    references: [immigrationCases.id],
  }),
}));

export const immigrationAlertsRelations = relations(immigrationAlerts, ({ one }) => ({
  consultant: one(benchConsultants, {
    fields: [immigrationAlerts.consultantId],
    references: [benchConsultants.id],
  }),
  acknowledger: one(userProfiles, {
    fields: [immigrationAlerts.acknowledgedBy],
    references: [userProfiles.id],
  }),
}));

// =====================================================
// TYPE EXPORTS
// =====================================================

export type BenchConsultant = typeof benchConsultants.$inferSelect;
export type NewBenchConsultant = typeof benchConsultants.$inferInsert;

export type ConsultantVisaDetails = typeof consultantVisaDetails.$inferSelect;
export type NewConsultantVisaDetails = typeof consultantVisaDetails.$inferInsert;

export type ConsultantWorkAuthorization = typeof consultantWorkAuthorization.$inferSelect;
export type NewConsultantWorkAuthorization = typeof consultantWorkAuthorization.$inferInsert;

export type ConsultantAvailability = typeof consultantAvailability.$inferSelect;
export type NewConsultantAvailability = typeof consultantAvailability.$inferInsert;

export type ConsultantRates = typeof consultantRates.$inferSelect;
export type NewConsultantRates = typeof consultantRates.$inferInsert;

export type ConsultantSkillsMatrix = typeof consultantSkillsMatrix.$inferSelect;
export type NewConsultantSkillsMatrix = typeof consultantSkillsMatrix.$inferInsert;

export type MarketingProfile = typeof marketingProfiles.$inferSelect;
export type NewMarketingProfile = typeof marketingProfiles.$inferInsert;

export type MarketingFormat = typeof marketingFormats.$inferSelect;
export type NewMarketingFormat = typeof marketingFormats.$inferInsert;

export type MarketingTemplate = typeof marketingTemplates.$inferSelect;
export type NewMarketingTemplate = typeof marketingTemplates.$inferInsert;

export type Hotlist = typeof hotlists.$inferSelect;
export type NewHotlist = typeof hotlists.$inferInsert;

export type HotlistConsultant = typeof hotlistConsultants.$inferSelect;
export type NewHotlistConsultant = typeof hotlistConsultants.$inferInsert;

export type MarketingActivity = typeof marketingActivities.$inferSelect;
export type NewMarketingActivity = typeof marketingActivities.$inferInsert;

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;

export type VendorContact = typeof vendorContacts.$inferSelect;
export type NewVendorContact = typeof vendorContacts.$inferInsert;

export type VendorTerms = typeof vendorTerms.$inferSelect;
export type NewVendorTerms = typeof vendorTerms.$inferInsert;

export type VendorRelationship = typeof vendorRelationships.$inferSelect;
export type NewVendorRelationship = typeof vendorRelationships.$inferInsert;

export type VendorPerformance = typeof vendorPerformance.$inferSelect;
export type NewVendorPerformance = typeof vendorPerformance.$inferInsert;

export type VendorBlacklist = typeof vendorBlacklist.$inferSelect;
export type NewVendorBlacklist = typeof vendorBlacklist.$inferInsert;

export type JobOrder = typeof jobOrders.$inferSelect;
export type NewJobOrder = typeof jobOrders.$inferInsert;

export type JobOrderRequirement = typeof jobOrderRequirements.$inferSelect;
export type NewJobOrderRequirement = typeof jobOrderRequirements.$inferInsert;

export type JobOrderSkill = typeof jobOrderSkills.$inferSelect;
export type NewJobOrderSkill = typeof jobOrderSkills.$inferInsert;

export type JobOrderSubmission = typeof jobOrderSubmissions.$inferSelect;
export type NewJobOrderSubmission = typeof jobOrderSubmissions.$inferInsert;

export type JobOrderNote = typeof jobOrderNotes.$inferSelect;
export type NewJobOrderNote = typeof jobOrderNotes.$inferInsert;

export type ImmigrationCase = typeof immigrationCases.$inferSelect;
export type NewImmigrationCase = typeof immigrationCases.$inferInsert;

export type ImmigrationAttorney = typeof immigrationAttorneys.$inferSelect;
export type NewImmigrationAttorney = typeof immigrationAttorneys.$inferInsert;

export type ImmigrationDocument = typeof immigrationDocuments.$inferSelect;
export type NewImmigrationDocument = typeof immigrationDocuments.$inferInsert;

export type ImmigrationTimeline = typeof immigrationTimelines.$inferSelect;
export type NewImmigrationTimeline = typeof immigrationTimelines.$inferInsert;

export type ImmigrationAlert = typeof immigrationAlerts.$inferSelect;
export type NewImmigrationAlert = typeof immigrationAlerts.$inferInsert;
