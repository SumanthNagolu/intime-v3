/**
 * Zod Validation Schemas: Bench Sales Module
 * Runtime validation for bench metadata, external jobs, hotlists, and immigration cases
 */

import { z } from 'zod';

// =====================================================
// BENCH_METADATA
// =====================================================

export const createBenchMetadataSchema = z.object({
  userId: z.string().uuid(),
  benchStartDate: z.coerce.date(),

  // Engagement
  contactFrequencyDays: z.number().int().min(1).max(30).default(3),
  isResponsive: z.boolean().default(true),
  responsivenessScore: z.number().int().min(0).max(100).optional(),

  // Bench Sales assignment
  benchSalesRepId: z.string().uuid().optional(),
});

export const updateBenchMetadataSchema = z.object({
  userId: z.string().uuid(),
  lastContactedAt: z.coerce.date().optional(),
  lastOutreachDate: z.coerce.date().optional(),
  contactFrequencyDays: z.number().int().min(1).max(30).optional(),
  isResponsive: z.boolean().optional(),
  responsivenessScore: z.number().int().min(0).max(100).optional(),
  benchSalesRepId: z.string().uuid().optional(),
});

// =====================================================
// EXTERNAL_JOBS
// =====================================================

export const createExternalJobSchema = z.object({
  // Source
  sourceName: z.string().min(1, 'Source name is required'),
  sourceJobId: z.string().optional(),
  sourceUrl: z.string().url().optional(),

  // Job details
  title: z.string().min(1, 'Job title is required').max(255),
  description: z.string().optional(),
  companyName: z.string().optional(),

  // Location
  location: z.string().optional(),
  isRemote: z.boolean().default(false),

  // Compensation
  rateMin: z.number().min(0).optional(),
  rateMax: z.number().min(0).optional(),
  rateType: z.enum(['hourly', 'daily', 'annual']).default('hourly'),

  // Requirements
  requiredSkills: z.array(z.string()).optional(),
  experienceYearsMin: z.number().int().min(0).max(50).optional(),
  visaRequirements: z.array(z.enum(['H1B', 'L1', 'GC', 'EAD', 'TN', 'USC', 'any'])).optional(),

  // Scraping metadata
  scrapedAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
});

export const updateExternalJobSchema = createExternalJobSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['active', 'expired', 'filled', 'ignored']).optional(),
});

// =====================================================
// JOB_SOURCES
// =====================================================

export const createJobSourceSchema = z.object({
  // Source details
  name: z.string().min(1, 'Source name is required').max(100),
  sourceType: z.enum(['vendor_portal', 'job_board', 'api', 'email']).default('vendor_portal'),
  url: z.string().url().optional(),

  // Scraping config
  scrapeFrequencyHours: z.number().int().min(1).max(168).default(24),

  // Authentication
  requiresAuth: z.boolean().default(false),
  authType: z.enum(['basic', 'oauth', 'cookie', 'api_key']).optional(),
  credentialsEncrypted: z.string().optional(),

  // Parsing config
  selectorConfig: z.record(z.unknown()).optional(),
  fieldMapping: z.record(z.string()).optional(),

  // Status
  isActive: z.boolean().default(true),
});

export const updateJobSourceSchema = createJobSourceSchema.partial().extend({
  id: z.string().uuid(),
  lastError: z.string().optional(),
  errorCount: z.number().int().min(0).optional(),
});

// =====================================================
// BENCH_SUBMISSIONS
// =====================================================

export const createBenchSubmissionSchema = z.object({
  externalJobId: z.string().uuid(),
  candidateId: z.string().uuid(),

  // Submission workflow
  status: z.enum([
    'identified',
    'contacted_candidate',
    'candidate_interested',
    'submitted_to_vendor',
    'vendor_review',
    'interview',
    'offered',
    'placed',
    'rejected',
  ]).default('identified'),

  // Vendor interaction
  vendorName: z.string().optional(),
  vendorContactName: z.string().optional(),
  vendorContactEmail: z.string().email().optional(),
  vendorSubmissionId: z.string().optional(),

  // Submission details
  submissionNotes: z.string().optional(),

  // Assignment
  benchRepId: z.string().uuid().optional(),
});

export const updateBenchSubmissionSchema = createBenchSubmissionSchema.partial().extend({
  id: z.string().uuid(),
  submittedAt: z.coerce.date().optional(),
  vendorFeedback: z.string().optional(),
  interviewDate: z.coerce.date().optional(),
  interviewFeedback: z.string().optional(),
  placementBillRate: z.number().min(0).optional(),
  placementStartDate: z.coerce.date().optional(),
  rejectionReason: z.string().optional(),
});

// =====================================================
// HOTLISTS
// =====================================================

export const createHotlistSchema = z.object({
  // Hotlist details
  title: z.string().min(1, 'Hotlist title is required').max(255),
  description: z.string().optional(),

  // Consultants included
  candidateIds: z.array(z.string().uuid()).min(1, 'At least one candidate is required'),

  // Targeting
  targetAccounts: z.array(z.string().uuid()).optional(),
  targetSkills: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),

  // Status
  status: z.enum(['draft', 'sent', 'expired']).default('draft'),

  // Document
  documentFileId: z.string().uuid().optional(),

  // Expiry
  expiresAt: z.coerce.date().optional(),
});

export const updateHotlistSchema = createHotlistSchema.partial().extend({
  id: z.string().uuid(),
});

export const sendHotlistSchema = z.object({
  hotlistId: z.string().uuid(),
  sentToEmails: z.array(z.string().email()).min(1, 'At least one recipient is required'),
  sentToAccountIds: z.array(z.string().uuid()).optional(),
  documentFileId: z.string().uuid().optional(),
});

// =====================================================
// IMMIGRATION_CASES
// =====================================================

export const createImmigrationCaseSchema = z.object({
  candidateId: z.string().uuid(),

  // Case details
  caseType: z.enum(['H1B', 'H1B_transfer', 'H1B_extension', 'L1', 'green_card', 'OPT_extension', 'TN']),
  status: z.enum(['drafting', 'submitted', 'rfe', 'approved', 'denied', 'withdrawn']).default('drafting'),

  // Current visa details
  currentVisaType: z.string().optional(),
  currentVisaExpiry: z.coerce.date().optional(),

  // New visa details
  newVisaType: z.string().optional(),
  newVisaStartDate: z.coerce.date().optional(),
  newVisaEndDate: z.coerce.date().optional(),

  // Processing
  petitionNumber: z.string().optional(),
  filedDate: z.coerce.date().optional(),

  // Costs
  filingFee: z.number().min(0).optional(),
  attorneyFee: z.number().min(0).optional(),
  premiumProcessingFee: z.number().min(0).optional(),
  paidBy: z.enum(['employer', 'candidate', 'shared']).default('employer'),

  // Attorney
  attorneyName: z.string().optional(),
  attorneyFirm: z.string().optional(),
  attorneyEmail: z.string().email().optional(),
  attorneyPhone: z.string().optional(),

  // Assignment
  caseManagerId: z.string().uuid().optional(),

  // Notes
  internalNotes: z.string().optional(),
});

export const updateImmigrationCaseSchema = createImmigrationCaseSchema.partial().extend({
  id: z.string().uuid(),
  approvedDate: z.coerce.date().optional(),
  deniedDate: z.coerce.date().optional(),
  denialReason: z.string().optional(),
  rfeReceivedDate: z.coerce.date().optional(),
  rfeResponseDueDate: z.coerce.date().optional(),
  rfeResponseSubmittedDate: z.coerce.date().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.coerce.date().optional(),
  expectedDecisionDate: z.coerce.date().optional(),
  petitionDocumentFileId: z.string().uuid().optional(),
  approvalNoticeFileId: z.string().uuid().optional(),
  i797FileId: z.string().uuid().optional(),
});

export const addImmigrationTimelineEventSchema = z.object({
  caseId: z.string().uuid(),
  eventType: z.enum(['filed', 'rfe_received', 'rfe_response_submitted', 'approved', 'denied', 'note']),
  eventDate: z.coerce.date(),
  notes: z.string(),
});

// =====================================================
// Type Exports
// =====================================================

export type CreateBenchMetadataInput = z.infer<typeof createBenchMetadataSchema>;
export type UpdateBenchMetadataInput = z.infer<typeof updateBenchMetadataSchema>;

export type CreateExternalJobInput = z.infer<typeof createExternalJobSchema>;
export type UpdateExternalJobInput = z.infer<typeof updateExternalJobSchema>;

export type CreateJobSourceInput = z.infer<typeof createJobSourceSchema>;
export type UpdateJobSourceInput = z.infer<typeof updateJobSourceSchema>;

export type CreateBenchSubmissionInput = z.infer<typeof createBenchSubmissionSchema>;
export type UpdateBenchSubmissionInput = z.infer<typeof updateBenchSubmissionSchema>;

export type CreateHotlistInput = z.infer<typeof createHotlistSchema>;
export type UpdateHotlistInput = z.infer<typeof updateHotlistSchema>;
export type SendHotlistInput = z.infer<typeof sendHotlistSchema>;

export type CreateImmigrationCaseInput = z.infer<typeof createImmigrationCaseSchema>;
export type UpdateImmigrationCaseInput = z.infer<typeof updateImmigrationCaseSchema>;
export type AddImmigrationTimelineEventInput = z.infer<typeof addImmigrationTimelineEventSchema>;
