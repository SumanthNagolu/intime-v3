/**
 * Drizzle ORM Schema: Bench Sales Module
 * Tables: bench_metadata, external_jobs, job_sources, bench_submissions, hotlists, immigration_cases
 */

import { pgTable, uuid, text, timestamp, numeric, integer, boolean, date, jsonb, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { organizations } from './organizations';

// =====================================================
// BENCH_METADATA
// =====================================================

export const benchMetadata = pgTable('bench_metadata', {
  userId: uuid('user_id').primaryKey().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Bench tracking
  benchStartDate: date('bench_start_date').notNull(),

  // Days on bench (computed in database)
  daysOnBench: integer('days_on_bench'),

  // Alerts
  alert30DaySent: boolean('alert_30_day_sent').default(false),
  alert30DaySentAt: timestamp('alert_30_day_sent_at', { withTimezone: true }),
  alert60DaySent: boolean('alert_60_day_sent').default(false),
  alert60DaySentAt: timestamp('alert_60_day_sent_at', { withTimezone: true }),

  // Marketing
  lastHotlistSentAt: timestamp('last_hotlist_sent_at', { withTimezone: true }),
  hotlistSendCount: integer('hotlist_send_count').default(0),
  lastOutreachDate: timestamp('last_outreach_date', { withTimezone: true }),

  // Immigration
  hasActiveImmigrationCase: boolean('has_active_immigration_case').default(false),
  immigrationCaseId: uuid('immigration_case_id'),

  // Engagement
  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
  contactFrequencyDays: integer('contact_frequency_days').default(3),
  isResponsive: boolean('is_responsive').default(true),
  responsivenessScore: integer('responsiveness_score'),

  // Bench Sales assignment
  benchSalesRepId: uuid('bench_sales_rep_id').references(() => userProfiles.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const benchMetadataRelations = relations(benchMetadata, ({ one }) => ({
  user: one(userProfiles, {
    fields: [benchMetadata.userId],
    references: [userProfiles.id],
  }),
  benchSalesRep: one(userProfiles, {
    fields: [benchMetadata.benchSalesRepId],
    references: [userProfiles.id],
  }),
  immigrationCase: one(immigrationCases, {
    fields: [benchMetadata.immigrationCaseId],
    references: [immigrationCases.id],
  }),
}));

export type BenchMetadata = typeof benchMetadata.$inferSelect;
export type NewBenchMetadata = typeof benchMetadata.$inferInsert;

// =====================================================
// EXTERNAL_JOBS
// =====================================================

export const externalJobs = pgTable('external_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Source
  sourceName: text('source_name').notNull(),
  sourceJobId: text('source_job_id'),
  sourceUrl: text('source_url'),

  // Job details
  title: text('title').notNull(),
  description: text('description'),
  companyName: text('company_name'),

  // Location
  location: text('location'),
  isRemote: boolean('is_remote').default(false),

  // Compensation
  rateMin: numeric('rate_min', { precision: 10, scale: 2 }),
  rateMax: numeric('rate_max', { precision: 10, scale: 2 }),
  rateType: text('rate_type').default('hourly'),

  // Requirements
  requiredSkills: text('required_skills').array(),
  experienceYearsMin: integer('experience_years_min'),
  visaRequirements: text('visa_requirements').array(),

  // Status
  status: text('status').notNull().default('active'),

  // Scraping metadata
  scrapedAt: timestamp('scraped_at', { withTimezone: true }).notNull(),
  lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),

  // Deduplication
  contentHash: text('content_hash'),

  // Match tracking
  matchCount: integer('match_count').default(0),
  submissionCount: integer('submission_count').default(0),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Search
  searchVector: text('search_vector'),
});

export const externalJobsRelations = relations(externalJobs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [externalJobs.orgId],
    references: [organizations.id],
  }),
  benchSubmissions: many(benchSubmissions),
}));

export type ExternalJob = typeof externalJobs.$inferSelect;
export type NewExternalJob = typeof externalJobs.$inferInsert;

// =====================================================
// JOB_SOURCES
// =====================================================

export const jobSources = pgTable('job_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Source details
  name: text('name').notNull().unique(),
  sourceType: text('source_type').notNull().default('vendor_portal'),
  url: text('url'),

  // Scraping config
  scrapeFrequencyHours: integer('scrape_frequency_hours').default(24),
  lastScrapeAt: timestamp('last_scrape_at', { withTimezone: true }),
  nextScrapeAt: timestamp('next_scrape_at', { withTimezone: true }),

  // Authentication
  requiresAuth: boolean('requires_auth').default(false),
  authType: text('auth_type'),
  credentialsEncrypted: text('credentials_encrypted'),

  // Parsing config
  selectorConfig: jsonb('selector_config'),
  fieldMapping: jsonb('field_mapping'),

  // Status
  isActive: boolean('is_active').default(true),
  isHealthy: boolean('is_healthy').default(true),
  lastError: text('last_error'),
  errorCount: integer('error_count').default(0),
  lastSuccessAt: timestamp('last_success_at', { withTimezone: true }),

  // Stats
  totalJobsScraped: integer('total_jobs_scraped').default(0),
  successfulScrapes: integer('successful_scrapes').default(0),
  failedScrapes: integer('failed_scrapes').default(0),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const jobSourcesRelations = relations(jobSources, ({ one }) => ({
  organization: one(organizations, {
    fields: [jobSources.orgId],
    references: [organizations.id],
  }),
  creator: one(userProfiles, {
    fields: [jobSources.createdBy],
    references: [userProfiles.id],
  }),
}));

export type JobSource = typeof jobSources.$inferSelect;
export type NewJobSource = typeof jobSources.$inferInsert;

// =====================================================
// BENCH_SUBMISSIONS
// =====================================================

export const benchSubmissions = pgTable('bench_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Association
  externalJobId: uuid('external_job_id').notNull().references(() => externalJobs.id),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id),

  // Submission workflow
  status: text('status').notNull().default('identified'),

  // Submission details
  submittedBy: uuid('submitted_by').references(() => userProfiles.id),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  submissionNotes: text('submission_notes'),

  // Vendor interaction
  vendorName: text('vendor_name'),
  vendorContactName: text('vendor_contact_name'),
  vendorContactEmail: text('vendor_contact_email'),
  vendorSubmissionId: text('vendor_submission_id'),
  vendorFeedback: text('vendor_feedback'),

  // Interview
  interviewDate: timestamp('interview_date', { withTimezone: true }),
  interviewFeedback: text('interview_feedback'),

  // Outcome
  placedAt: timestamp('placed_at', { withTimezone: true }),
  placementStartDate: date('placement_start_date'),
  placementBillRate: numeric('placement_bill_rate', { precision: 10, scale: 2 }),

  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),

  // Assignment
  benchRepId: uuid('bench_rep_id').references(() => userProfiles.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueJobCandidate: unique().on(table.externalJobId, table.candidateId),
}));

export const benchSubmissionsRelations = relations(benchSubmissions, ({ one }) => ({
  organization: one(organizations, {
    fields: [benchSubmissions.orgId],
    references: [organizations.id],
  }),
  externalJob: one(externalJobs, {
    fields: [benchSubmissions.externalJobId],
    references: [externalJobs.id],
  }),
  candidate: one(userProfiles, {
    fields: [benchSubmissions.candidateId],
    references: [userProfiles.id],
  }),
  submitter: one(userProfiles, {
    fields: [benchSubmissions.submittedBy],
    references: [userProfiles.id],
  }),
  benchRep: one(userProfiles, {
    fields: [benchSubmissions.benchRepId],
    references: [userProfiles.id],
  }),
}));

export type BenchSubmission = typeof benchSubmissions.$inferSelect;
export type NewBenchSubmission = typeof benchSubmissions.$inferInsert;

// =====================================================
// HOTLISTS
// =====================================================

export const hotlists = pgTable('hotlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Hotlist details
  title: text('title').notNull(),
  description: text('description'),

  // Consultants included
  candidateIds: uuid('candidate_ids').array().notNull(),
  candidateCount: integer('candidate_count').notNull(),

  // Targeting
  targetAccounts: uuid('target_accounts').array(),
  targetSkills: text('target_skills').array(),
  targetRoles: text('target_roles').array(),

  // Status
  status: text('status').notNull().default('draft'),

  // Document (use existing file_uploads table)
  documentFileId: uuid('document_file_id'),

  // Distribution
  sentAt: timestamp('sent_at', { withTimezone: true }),
  sentBy: uuid('sent_by').references(() => userProfiles.id),
  sentToEmails: text('sent_to_emails').array(),
  sentToAccountIds: uuid('sent_to_account_ids').array(),

  // Engagement
  viewCount: integer('view_count').default(0),
  responseCount: integer('response_count').default(0),
  responsesText: text('responses_text').array(),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

export const hotlistsRelations = relations(hotlists, ({ one }) => ({
  organization: one(organizations, {
    fields: [hotlists.orgId],
    references: [organizations.id],
  }),
  sender: one(userProfiles, {
    fields: [hotlists.sentBy],
    references: [userProfiles.id],
  }),
  creator: one(userProfiles, {
    fields: [hotlists.createdBy],
    references: [userProfiles.id],
  }),
}));

export type Hotlist = typeof hotlists.$inferSelect;
export type NewHotlist = typeof hotlists.$inferInsert;

// =====================================================
// IMMIGRATION_CASES
// =====================================================

export const immigrationCases = pgTable('immigration_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Association
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id),

  // Case details
  caseType: text('case_type').notNull(),
  status: text('status').notNull().default('drafting'),

  // Current visa details
  currentVisaType: text('current_visa_type'),
  currentVisaExpiry: date('current_visa_expiry'),

  // New visa details
  newVisaType: text('new_visa_type'),
  newVisaStartDate: date('new_visa_start_date'),
  newVisaEndDate: date('new_visa_end_date'),

  // Processing
  petitionNumber: text('petition_number'),
  filedDate: date('filed_date'),
  approvedDate: date('approved_date'),
  deniedDate: date('denied_date'),
  denialReason: text('denial_reason'),

  // RFE
  rfeReceivedDate: date('rfe_received_date'),
  rfeResponseDueDate: date('rfe_response_due_date'),
  rfeResponseSubmittedDate: date('rfe_response_submitted_date'),

  // Costs
  filingFee: numeric('filing_fee', { precision: 10, scale: 2 }),
  attorneyFee: numeric('attorney_fee', { precision: 10, scale: 2 }),
  premiumProcessingFee: numeric('premium_processing_fee', { precision: 10, scale: 2 }),
  totalCost: numeric('total_cost', { precision: 10, scale: 2 }), // Computed in database
  paidBy: text('paid_by').default('employer'),

  // Documents (use existing file_uploads table)
  petitionDocumentFileId: uuid('petition_document_file_id'),
  approvalNoticeFileId: uuid('approval_notice_file_id'),
  i797FileId: uuid('i797_file_id'),

  // Timeline
  daysElapsed: integer('days_elapsed'), // Computed in database

  nextAction: text('next_action'),
  nextActionDate: date('next_action_date'),
  expectedDecisionDate: date('expected_decision_date'),

  // Assignment
  caseManagerId: uuid('case_manager_id').references(() => userProfiles.id),
  attorneyName: text('attorney_name'),
  attorneyFirm: text('attorney_firm'),
  attorneyEmail: text('attorney_email'),
  attorneyPhone: text('attorney_phone'),

  // Notes
  internalNotes: text('internal_notes'),
  timelineNotes: jsonb('timeline_notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const immigrationCasesRelations = relations(immigrationCases, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [immigrationCases.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [immigrationCases.candidateId],
    references: [userProfiles.id],
  }),
  caseManager: one(userProfiles, {
    fields: [immigrationCases.caseManagerId],
    references: [userProfiles.id],
  }),
  creator: one(userProfiles, {
    fields: [immigrationCases.createdBy],
    references: [userProfiles.id],
  }),
  benchMetadata: many(benchMetadata),
}));

export type ImmigrationCase = typeof immigrationCases.$inferSelect;
export type NewImmigrationCase = typeof immigrationCases.$inferInsert;

// =====================================================
// Enums for Type Safety
// =====================================================

export const ExternalJobStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  FILLED: 'filled',
  IGNORED: 'ignored',
} as const;

export const BenchSubmissionStatus = {
  IDENTIFIED: 'identified',
  CONTACTED_CANDIDATE: 'contacted_candidate',
  CANDIDATE_INTERESTED: 'candidate_interested',
  SUBMITTED_TO_VENDOR: 'submitted_to_vendor',
  VENDOR_REVIEW: 'vendor_review',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  PLACED: 'placed',
  REJECTED: 'rejected',
} as const;

export const HotlistStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  EXPIRED: 'expired',
} as const;

export const ImmigrationCaseType = {
  H1B: 'H1B',
  H1B_TRANSFER: 'H1B_transfer',
  H1B_EXTENSION: 'H1B_extension',
  L1: 'L1',
  GREEN_CARD: 'green_card',
  OPT_EXTENSION: 'OPT_extension',
  TN: 'TN',
} as const;

export const ImmigrationCaseStatus = {
  DRAFTING: 'drafting',
  SUBMITTED: 'submitted',
  RFE: 'rfe',
  APPROVED: 'approved',
  DENIED: 'denied',
  WITHDRAWN: 'withdrawn',
} as const;

export type ExternalJobStatusType = typeof ExternalJobStatus[keyof typeof ExternalJobStatus];
export type BenchSubmissionStatusType = typeof BenchSubmissionStatus[keyof typeof BenchSubmissionStatus];
export type HotlistStatusType = typeof HotlistStatus[keyof typeof HotlistStatus];
export type ImmigrationCaseTypeType = typeof ImmigrationCaseType[keyof typeof ImmigrationCaseType];
export type ImmigrationCaseStatusType = typeof ImmigrationCaseStatus[keyof typeof ImmigrationCaseStatus];
