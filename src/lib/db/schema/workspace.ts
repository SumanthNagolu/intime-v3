/**
 * Drizzle ORM Schema: Unified Workspace Module
 * Tables: contacts, job_orders, object_owners
 *
 * Part of the Unified Workspace Architecture for InTime v3
 */

import { pgTable, uuid, text, timestamp, numeric, integer, boolean, date, unique, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { organizations } from './organizations';
import { accounts } from './crm';
import { jobs } from './ats';
import { externalJobs } from './bench';
import { campaigns } from './ta-hr';

// =====================================================
// ENUMS
// =====================================================

export const contactTypeEnum = pgEnum('contact_type', [
  'client_poc',
  'candidate',
  'vendor',
  'partner',
  'internal',
  'general',
]);

export const contactStatusEnum = pgEnum('contact_status', [
  'active',
  'inactive',
  'do_not_contact',
  'bounced',
  'unsubscribed',
]);

export const jobOrderSourceTypeEnum = pgEnum('job_order_source_type', [
  'requisition',
  'external_job',
  'direct',
]);

export const jobOrderStatusEnum = pgEnum('job_order_status', [
  'pending',
  'active',
  'on_hold',
  'fulfilled',
  'cancelled',
  'expired',
]);

export const jobOrderPriorityEnum = pgEnum('job_order_priority', [
  'low',
  'normal',
  'high',
  'urgent',
  'critical',
]);

export const rcaiRoleEnum = pgEnum('rcai_role', [
  'responsible',
  'accountable',
  'consulted',
  'informed',
]);

export const rcaiPermissionEnum = pgEnum('rcai_permission', [
  'edit',
  'view',
]);

export const rcaiAssignmentTypeEnum = pgEnum('rcai_assignment_type', [
  'auto',
  'manual',
]);

// =====================================================
// CONTACTS - Universal Contacts Table
// =====================================================

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Contact Type
  contactType: text('contact_type').notNull().default('general'),
  // Values: 'client_poc', 'candidate', 'vendor', 'partner', 'internal', 'general'

  // Personal Information
  firstName: text('first_name'),
  lastName: text('last_name'),
  // full_name is GENERATED ALWAYS in database
  email: text('email'),
  phone: text('phone'),
  mobile: text('mobile'),
  linkedinUrl: text('linkedin_url'),

  // Avatar
  avatarUrl: text('avatar_url'),

  // Professional Information
  title: text('title'),
  companyName: text('company_name'),
  companyId: uuid('company_id').references(() => accounts.id),
  department: text('department'),

  // Work Location
  workLocation: text('work_location'),
  timezone: text('timezone').default('America/New_York'),

  // Communication Preferences
  preferredContactMethod: text('preferred_contact_method').default('email'),
  bestTimeToContact: text('best_time_to_contact'),
  doNotCallBefore: text('do_not_call_before'),
  doNotCallAfter: text('do_not_call_after'),

  // Status & Preferences
  status: text('status').notNull().default('active'),
  // Values: 'active', 'inactive', 'do_not_contact', 'bounced', 'unsubscribed'

  // Source Tracking
  source: text('source'),
  sourceDetail: text('source_detail'),
  sourceCampaignId: uuid('source_campaign_id').references(() => campaigns.id),

  // For candidates: link to user_profile
  userProfileId: uuid('user_profile_id').references(() => userProfiles.id),

  // Engagement Tracking
  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
  lastResponseAt: timestamp('last_response_at', { withTimezone: true }),
  totalInteractions: integer('total_interactions').default(0),
  engagementScore: integer('engagement_score').default(0),

  // Social Media
  twitterUrl: text('twitter_url'),
  githubUrl: text('github_url'),

  // Decision Making (for client POCs)
  decisionAuthority: text('decision_authority'),
  buyingRole: text('buying_role'),
  influenceLevel: text('influence_level'),

  // Tags & Notes
  tags: text('tags').array(),
  notes: text('notes'),
  internalNotes: text('internal_notes'),

  // Assignment - Primary owner
  ownerId: uuid('owner_id').references(() => userProfiles.id),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  updatedBy: uuid('updated_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Search (managed by database trigger)
  searchVector: text('search_vector'),
});

export const contactsRelations = relations(contacts, ({ one }) => ({
  organization: one(organizations, {
    fields: [contacts.orgId],
    references: [organizations.id],
  }),
  company: one(accounts, {
    fields: [contacts.companyId],
    references: [accounts.id],
  }),
  sourceCampaign: one(campaigns, {
    fields: [contacts.sourceCampaignId],
    references: [campaigns.id],
  }),
  userProfile: one(userProfiles, {
    fields: [contacts.userProfileId],
    references: [userProfiles.id],
  }),
  owner: one(userProfiles, {
    fields: [contacts.ownerId],
    references: [userProfiles.id],
    relationName: 'contactOwner',
  }),
  creator: one(userProfiles, {
    fields: [contacts.createdBy],
    references: [userProfiles.id],
    relationName: 'contactCreator',
  }),
}));

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

// =====================================================
// JOB_ORDERS - Confirmed Client Orders
// =====================================================

export const jobOrders = pgTable('job_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Order Identification (auto-generated: JO-2024-0001)
  orderNumber: text('order_number').unique(),

  // Source (where this order came from)
  sourceType: text('source_type').notNull().default('direct'),
  // Values: 'requisition', 'external_job', 'direct'
  sourceJobId: uuid('source_job_id').references(() => jobs.id),
  sourceExternalJobId: uuid('source_external_job_id').references(() => externalJobs.id),

  // Client Association (REQUIRED - must have paying client)
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  clientContactId: uuid('client_contact_id').references(() => contacts.id),

  // Order Details
  title: text('title').notNull(),
  description: text('description'),
  requirements: text('requirements'),
  responsibilities: text('responsibilities'),

  // Job Classification
  jobType: text('job_type').default('contract'),
  // Values: 'contract', 'permanent', 'contract_to_hire', 'temp', 'sow'
  employmentType: text('employment_type').default('w2'),
  // Values: 'w2', '1099', 'corp_to_corp', 'direct_hire'

  // Team/Department
  hiringManagerName: text('hiring_manager_name'),
  hiringManagerEmail: text('hiring_manager_email'),
  department: text('department'),

  // Location
  location: text('location'),
  city: text('city'),
  state: text('state'),
  country: text('country').default('USA'),
  zipCode: text('zip_code'),
  isRemote: boolean('is_remote').default(false),
  remoteType: text('remote_type'), // 'fully_remote', 'hybrid', 'onsite'
  hybridDays: integer('hybrid_days'),

  // Rates & Financials
  billRate: numeric('bill_rate', { precision: 10, scale: 2 }).notNull(),
  billRateMax: numeric('bill_rate_max', { precision: 10, scale: 2 }),
  payRateMin: numeric('pay_rate_min', { precision: 10, scale: 2 }),
  payRateMax: numeric('pay_rate_max', { precision: 10, scale: 2 }),
  markupPercentage: numeric('markup_percentage', { precision: 5, scale: 2 }),
  currency: text('currency').default('USD'),
  rateType: text('rate_type').default('hourly'),
  // Values: 'hourly', 'daily', 'weekly', 'monthly', 'annual'

  // Overtime
  overtimeBillRate: numeric('overtime_bill_rate', { precision: 10, scale: 2 }),
  overtimePayRate: numeric('overtime_pay_rate', { precision: 10, scale: 2 }),
  overtimeExpected: boolean('overtime_expected').default(false),

  // Fee Structure (for perm placements)
  placementFeePercentage: numeric('placement_fee_percentage', { precision: 5, scale: 2 }),
  placementFeeFlat: numeric('placement_fee_flat', { precision: 10, scale: 2 }),
  guaranteePeriodDays: integer('guarantee_period_days'),

  // Positions
  positionsCount: integer('positions_count').notNull().default(1),
  positionsFilled: integer('positions_filled').default(0),

  // Timing
  startDate: date('start_date'),
  endDate: date('end_date'),
  durationMonths: integer('duration_months'),
  extensionPossible: boolean('extension_possible').default(true),
  startDateFlexibility: text('start_date_flexibility'),

  // Priority & Status
  priority: text('priority').notNull().default('normal'),
  // Values: 'low', 'normal', 'high', 'urgent', 'critical'
  status: text('status').notNull().default('pending'),
  // Values: 'pending', 'active', 'on_hold', 'fulfilled', 'cancelled', 'expired'

  // Qualification Requirements
  requiredSkills: text('required_skills').array(),
  niceToHaveSkills: text('nice_to_have_skills').array(),
  minExperienceYears: integer('min_experience_years'),
  maxExperienceYears: integer('max_experience_years'),
  educationRequirement: text('education_requirement'),
  certificationsRequired: text('certifications_required').array(),

  // Work Authorization
  visaRequirements: text('visa_requirements').array(),
  citizenshipRequired: boolean('citizenship_required').default(false),
  securityClearanceRequired: text('security_clearance_required'),

  // Background/Drug
  backgroundCheckRequired: boolean('background_check_required').default(true),
  drugScreenRequired: boolean('drug_screen_required').default(false),

  // Interview Process
  interviewProcess: text('interview_process'),
  interviewRounds: integer('interview_rounds'),
  technicalAssessmentRequired: boolean('technical_assessment_required').default(false),

  // Submission Requirements
  submissionInstructions: text('submission_instructions'),
  submissionFormat: text('submission_format'),
  maxSubmissions: integer('max_submissions'),
  currentSubmissions: integer('current_submissions').default(0),

  // Notes
  internalNotes: text('internal_notes'),
  clientNotes: text('client_notes'),

  // VMS/MSP Information
  vmsJobId: text('vms_job_id'),
  vmsName: text('vms_name'),
  mspName: text('msp_name'),
  vendorTier: text('vendor_tier'),

  // RCAI Primary Owner
  accountableId: uuid('accountable_id').notNull().references(() => userProfiles.id),

  // Dates
  receivedDate: timestamp('received_date', { withTimezone: true }).defaultNow(),
  targetFillDate: date('target_fill_date'),
  filledDate: date('filled_date'),
  closedDate: date('closed_date'),
  closedReason: text('closed_reason'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  updatedBy: uuid('updated_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Search
  searchVector: text('search_vector'),
});

export const jobOrdersRelations = relations(jobOrders, ({ one }) => ({
  organization: one(organizations, {
    fields: [jobOrders.orgId],
    references: [organizations.id],
  }),
  sourceJob: one(jobs, {
    fields: [jobOrders.sourceJobId],
    references: [jobs.id],
  }),
  sourceExternalJob: one(externalJobs, {
    fields: [jobOrders.sourceExternalJobId],
    references: [externalJobs.id],
  }),
  account: one(accounts, {
    fields: [jobOrders.accountId],
    references: [accounts.id],
  }),
  clientContact: one(contacts, {
    fields: [jobOrders.clientContactId],
    references: [contacts.id],
  }),
  accountable: one(userProfiles, {
    fields: [jobOrders.accountableId],
    references: [userProfiles.id],
    relationName: 'jobOrderAccountable',
  }),
  creator: one(userProfiles, {
    fields: [jobOrders.createdBy],
    references: [userProfiles.id],
    relationName: 'jobOrderCreator',
  }),
}));

export type JobOrder = typeof jobOrders.$inferSelect;
export type NewJobOrder = typeof jobOrders.$inferInsert;

// =====================================================
// OBJECT_OWNERS - RCAI Assignments
// =====================================================

export const objectOwners = pgTable('object_owners', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Polymorphic Association
  entityType: text('entity_type').notNull(),
  // Values: 'campaign', 'lead', 'deal', 'account', 'job', 'job_order',
  //         'submission', 'contact', 'external_job'
  entityId: uuid('entity_id').notNull(),

  // Owner
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // RCAI Role
  role: text('role').notNull(),
  // Values: 'responsible', 'accountable', 'consulted', 'informed'

  // Permission (derived from role, but can be overridden)
  permission: text('permission').notNull().default('view'),
  // Values: 'edit', 'view'

  // Is this the primary owner (Accountable)?
  isPrimary: boolean('is_primary').default(false),

  // Assignment metadata
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  assignedBy: uuid('assigned_by').references(() => userProfiles.id),

  // Auto-assigned or manual?
  assignmentType: text('assignment_type').default('auto'),
  // Values: 'auto', 'manual'

  // Notes
  notes: text('notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Each user can only have one RCAI role per entity
  uniqueEntityUser: unique().on(table.entityType, table.entityId, table.userId),
}));

export const objectOwnersRelations = relations(objectOwners, ({ one }) => ({
  organization: one(organizations, {
    fields: [objectOwners.orgId],
    references: [organizations.id],
  }),
  user: one(userProfiles, {
    fields: [objectOwners.userId],
    references: [userProfiles.id],
    relationName: 'rcaiUser',
  }),
  assignedByUser: one(userProfiles, {
    fields: [objectOwners.assignedBy],
    references: [userProfiles.id],
    relationName: 'rcaiAssigner',
  }),
}));

export type ObjectOwner = typeof objectOwners.$inferSelect;
export type NewObjectOwner = typeof objectOwners.$inferInsert;

// =====================================================
// Enums for Type Safety
// =====================================================

export const ContactType = {
  CLIENT_POC: 'client_poc',
  CANDIDATE: 'candidate',
  VENDOR: 'vendor',
  PARTNER: 'partner',
  INTERNAL: 'internal',
  GENERAL: 'general',
} as const;

export const ContactStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DO_NOT_CONTACT: 'do_not_contact',
  BOUNCED: 'bounced',
  UNSUBSCRIBED: 'unsubscribed',
} as const;

export const JobOrderSourceType = {
  REQUISITION: 'requisition',
  EXTERNAL_JOB: 'external_job',
  DIRECT: 'direct',
} as const;

export const JobOrderStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const JobOrderPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
} as const;

export const JobOrderJobType = {
  CONTRACT: 'contract',
  PERMANENT: 'permanent',
  CONTRACT_TO_HIRE: 'contract_to_hire',
  TEMP: 'temp',
  SOW: 'sow',
} as const;

export const JobOrderEmploymentType = {
  W2: 'w2',
  CORP_TO_CORP: 'corp_to_corp',
  C2C: '1099',
  DIRECT_HIRE: 'direct_hire',
} as const;

export const RCAIRole = {
  RESPONSIBLE: 'responsible',
  ACCOUNTABLE: 'accountable',
  CONSULTED: 'consulted',
  INFORMED: 'informed',
} as const;

export const RCAIPermission = {
  EDIT: 'edit',
  VIEW: 'view',
} as const;

export const RCAIAssignmentType = {
  AUTO: 'auto',
  MANUAL: 'manual',
} as const;

// Entity types that support RCAI ownership
export const RCAIEntityType = {
  CAMPAIGN: 'campaign',
  LEAD: 'lead',
  DEAL: 'deal',
  ACCOUNT: 'account',
  JOB: 'job',
  JOB_ORDER: 'job_order',
  SUBMISSION: 'submission',
  CONTACT: 'contact',
  EXTERNAL_JOB: 'external_job',
  CANDIDATE: 'candidate',
  TALENT: 'talent',
} as const;

export type ContactTypeType = typeof ContactType[keyof typeof ContactType];
export type ContactStatusType = typeof ContactStatus[keyof typeof ContactStatus];
export type JobOrderSourceTypeType = typeof JobOrderSourceType[keyof typeof JobOrderSourceType];
export type JobOrderStatusType = typeof JobOrderStatus[keyof typeof JobOrderStatus];
export type JobOrderPriorityType = typeof JobOrderPriority[keyof typeof JobOrderPriority];
export type JobOrderJobTypeType = typeof JobOrderJobType[keyof typeof JobOrderJobType];
export type JobOrderEmploymentTypeType = typeof JobOrderEmploymentType[keyof typeof JobOrderEmploymentType];
export type RCAIRoleType = typeof RCAIRole[keyof typeof RCAIRole];
export type RCAIPermissionType = typeof RCAIPermission[keyof typeof RCAIPermission];
export type RCAIAssignmentTypeType = typeof RCAIAssignmentType[keyof typeof RCAIAssignmentType];
export type RCAIEntityTypeType = typeof RCAIEntityType[keyof typeof RCAIEntityType];

// =====================================================
// HELPER CONSTANTS
// =====================================================

export const RCAI_ROLE_LABELS: Record<RCAIRoleType, string> = {
  responsible: 'Responsible',
  accountable: 'Accountable',
  consulted: 'Consulted',
  informed: 'Informed',
};

export const RCAI_ROLE_DESCRIPTIONS: Record<RCAIRoleType, string> = {
  responsible: 'Does the work',
  accountable: 'Approves/owns outcome (exactly 1)',
  consulted: 'Provides input',
  informed: 'Kept updated',
};

export const RCAI_ROLE_COLORS: Record<RCAIRoleType, string> = {
  responsible: 'bg-blue-100 text-blue-700',
  accountable: 'bg-green-100 text-green-700',
  consulted: 'bg-amber-100 text-amber-700',
  informed: 'bg-stone-100 text-stone-600',
};

export const RCAI_DEFAULT_PERMISSIONS: Record<RCAIRoleType, RCAIPermissionType> = {
  responsible: 'edit',
  accountable: 'edit',
  consulted: 'view',
  informed: 'view',
};

export const JOB_ORDER_PRIORITY_COLORS: Record<JobOrderPriorityType, string> = {
  low: 'bg-stone-100 text-stone-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const JOB_ORDER_STATUS_COLORS: Record<JobOrderStatusType, string> = {
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  on_hold: 'bg-blue-100 text-blue-600',
  fulfilled: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-stone-100 text-stone-500',
};

export const CONTACT_TYPE_LABELS: Record<ContactTypeType, string> = {
  client_poc: 'Client POC',
  candidate: 'Candidate',
  vendor: 'Vendor',
  partner: 'Partner',
  internal: 'Internal',
  general: 'General',
};

export const CONTACT_STATUS_COLORS: Record<ContactStatusType, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-stone-100 text-stone-500',
  do_not_contact: 'bg-red-100 text-red-700',
  bounced: 'bg-amber-100 text-amber-700',
  unsubscribed: 'bg-purple-100 text-purple-700',
};
