/**
 * Drizzle ORM Schema: ATS (Applicant Tracking System) Module
 * Tables: skills, candidate_skills, jobs, submissions, interviews, offers, placements
 */

import { pgTable, uuid, text, timestamp, numeric, integer, boolean, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { organizations } from './organizations';
import { accounts, deals } from './crm';

// =====================================================
// SKILLS
// =====================================================

export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Skill details
  name: text('name').notNull().unique(),
  category: text('category'),
  parentSkillId: uuid('parent_skill_id'),

  // Metadata
  description: text('description'),
  isVerified: boolean('is_verified').default(false),
  usageCount: integer('usage_count').default(0),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const skillsRelations = relations(skills, ({ one, many }) => ({
  parentSkill: one(skills, {
    fields: [skills.parentSkillId],
    references: [skills.id],
  }),
  candidateSkills: many(candidateSkills),
}));

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

// =====================================================
// CANDIDATE_SKILLS
// =====================================================

export const candidateSkills = pgTable('candidate_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id),

  // Proficiency
  proficiencyLevel: text('proficiency_level').default('intermediate'),
  yearsOfExperience: numeric('years_of_experience', { precision: 4, scale: 1 }),

  // Validation
  isCertified: boolean('is_certified').default(false),
  certificationName: text('certification_name'),
  lastUsedDate: timestamp('last_used_date', { mode: 'date' }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueCandidateSkill: unique().on(table.candidateId, table.skillId),
}));

export const candidateSkillsRelations = relations(candidateSkills, ({ one }) => ({
  candidate: one(userProfiles, {
    fields: [candidateSkills.candidateId],
    references: [userProfiles.id],
  }),
  skill: one(skills, {
    fields: [candidateSkills.skillId],
    references: [skills.id],
  }),
}));

export type CandidateSkill = typeof candidateSkills.$inferSelect;
export type NewCandidateSkill = typeof candidateSkills.$inferInsert;

// =====================================================
// JOBS
// =====================================================

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Association
  accountId: uuid('account_id').references(() => accounts.id),
  dealId: uuid('deal_id').references(() => deals.id),

  // Job details
  title: text('title').notNull(),
  description: text('description'),
  jobType: text('job_type').default('contract'),

  // Location
  location: text('location'),
  isRemote: boolean('is_remote').default(false),
  hybridDays: integer('hybrid_days'),

  // Compensation
  rateMin: numeric('rate_min', { precision: 10, scale: 2 }),
  rateMax: numeric('rate_max', { precision: 10, scale: 2 }),
  rateType: text('rate_type').default('hourly'),
  currency: text('currency').default('USD'),

  // Status
  status: text('status').notNull().default('draft'),
  urgency: text('urgency').default('medium'),
  positionsCount: integer('positions_count').default(1),
  positionsFilled: integer('positions_filled').default(0),

  // Requirements
  requiredSkills: text('required_skills').array(),
  niceToHaveSkills: text('nice_to_have_skills').array(),
  minExperienceYears: integer('min_experience_years'),
  maxExperienceYears: integer('max_experience_years'),
  visaRequirements: text('visa_requirements').array(),

  // Assignment
  ownerId: uuid('owner_id').notNull().references(() => userProfiles.id),
  recruiterIds: uuid('recruiter_ids').array(),

  // Dates
  postedDate: timestamp('posted_date', { mode: 'date' }),
  targetFillDate: timestamp('target_fill_date', { mode: 'date' }),
  filledDate: timestamp('filled_date', { mode: 'date' }),

  // Client interaction
  clientSubmissionInstructions: text('client_submission_instructions'),
  clientInterviewProcess: text('client_interview_process'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Search
  searchVector: text('search_vector'),
});

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [jobs.orgId],
    references: [organizations.id],
  }),
  account: one(accounts, {
    fields: [jobs.accountId],
    references: [accounts.id],
  }),
  deal: one(deals, {
    fields: [jobs.dealId],
    references: [deals.id],
  }),
  owner: one(userProfiles, {
    fields: [jobs.ownerId],
    references: [userProfiles.id],
  }),
  submissions: many(submissions),
  interviews: many(interviews),
  offers: many(offers),
  placements: many(placements),
}));

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

// =====================================================
// SUBMISSIONS
// =====================================================

export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Association
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id),
  accountId: uuid('account_id').references(() => accounts.id),

  // Submission workflow stage
  status: text('status').notNull().default('sourced'),

  // Match scoring
  aiMatchScore: integer('ai_match_score'),
  recruiterMatchScore: integer('recruiter_match_score'),
  matchExplanation: text('match_explanation'),

  // Submission details
  submittedRate: numeric('submitted_rate', { precision: 10, scale: 2 }),
  submittedRateType: text('submitted_rate_type').default('hourly'),
  submissionNotes: text('submission_notes'),

  // Client interaction
  submittedToClientAt: timestamp('submitted_to_client_at', { withTimezone: true }),
  submittedToClientBy: uuid('submitted_to_client_by').references(() => userProfiles.id),
  clientResumeFileId: uuid('client_resume_file_id'),
  clientProfileUrl: text('client_profile_url'),

  // Interview tracking
  interviewCount: integer('interview_count').default(0),
  lastInterviewDate: timestamp('last_interview_date', { withTimezone: true }),
  interviewFeedback: text('interview_feedback'),

  // Offer tracking
  offerExtendedAt: timestamp('offer_extended_at', { withTimezone: true }),
  offerAcceptedAt: timestamp('offer_accepted_at', { withTimezone: true }),
  offerDeclinedAt: timestamp('offer_declined_at', { withTimezone: true }),
  offerDeclineReason: text('offer_decline_reason'),

  // Rejection
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  rejectionSource: text('rejection_source'),

  // Assignment
  ownerId: uuid('owner_id').notNull().references(() => userProfiles.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  uniqueJobCandidate: unique().on(table.jobId, table.candidateId),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [submissions.orgId],
    references: [organizations.id],
  }),
  job: one(jobs, {
    fields: [submissions.jobId],
    references: [jobs.id],
  }),
  candidate: one(userProfiles, {
    fields: [submissions.candidateId],
    references: [userProfiles.id],
  }),
  account: one(accounts, {
    fields: [submissions.accountId],
    references: [accounts.id],
  }),
  owner: one(userProfiles, {
    fields: [submissions.ownerId],
    references: [userProfiles.id],
  }),
  interviews: many(interviews),
  offers: many(offers),
}));

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

// =====================================================
// INTERVIEWS
// =====================================================

export const interviews = pgTable('interviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id),

  // Interview details
  roundNumber: integer('round_number').notNull().default(1),
  interviewType: text('interview_type').default('technical'),

  // Scheduling
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  durationMinutes: integer('duration_minutes').default(60),
  timezone: text('timezone').default('America/New_York'),
  meetingLink: text('meeting_link'),
  meetingLocation: text('meeting_location'),

  // Participants
  interviewerNames: text('interviewer_names').array(),
  interviewerEmails: text('interviewer_emails').array(),
  scheduledBy: uuid('scheduled_by').references(() => userProfiles.id),

  // Status
  status: text('status').notNull().default('scheduled'),
  cancellationReason: text('cancellation_reason'),

  // Feedback
  feedback: text('feedback'),
  rating: integer('rating'),
  recommendation: text('recommendation'),
  submittedBy: uuid('submitted_by').references(() => userProfiles.id),
  feedbackSubmittedAt: timestamp('feedback_submitted_at', { withTimezone: true }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const interviewsRelations = relations(interviews, ({ one }) => ({
  submission: one(submissions, {
    fields: [interviews.submissionId],
    references: [submissions.id],
  }),
  job: one(jobs, {
    fields: [interviews.jobId],
    references: [jobs.id],
  }),
  candidate: one(userProfiles, {
    fields: [interviews.candidateId],
    references: [userProfiles.id],
  }),
}));

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;

// =====================================================
// OFFERS
// =====================================================

export const offers = pgTable('offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id),

  // Offer terms
  offerType: text('offer_type').default('contract'),
  rate: numeric('rate', { precision: 10, scale: 2 }).notNull(),
  rateType: text('rate_type').default('hourly'),
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),

  // Additional terms
  bonus: numeric('bonus', { precision: 10, scale: 2 }),
  benefits: text('benefits'),
  relocationAssistance: boolean('relocation_assistance').default(false),
  signOnBonus: numeric('sign_on_bonus', { precision: 10, scale: 2 }),

  // Status
  status: text('status').notNull().default('draft'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),

  // Negotiation
  candidateCounterOffer: numeric('candidate_counter_offer', { precision: 10, scale: 2 }),
  negotiationNotes: text('negotiation_notes'),

  // Acceptance
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  declinedAt: timestamp('declined_at', { withTimezone: true }),
  declineReason: text('decline_reason'),

  // Documents
  offerLetterFileId: uuid('offer_letter_file_id'),
  signedOfferFileId: uuid('signed_offer_file_id'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const offersRelations = relations(offers, ({ one, many }) => ({
  submission: one(submissions, {
    fields: [offers.submissionId],
    references: [submissions.id],
  }),
  job: one(jobs, {
    fields: [offers.jobId],
    references: [jobs.id],
  }),
  candidate: one(userProfiles, {
    fields: [offers.candidateId],
    references: [userProfiles.id],
  }),
  placements: many(placements),
}));

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;

// =====================================================
// PLACEMENTS
// =====================================================

export const placements = pgTable('placements', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Association
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  offerId: uuid('offer_id').references(() => offers.id),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id),
  accountId: uuid('account_id').notNull().references(() => accounts.id),

  // Placement details
  placementType: text('placement_type').default('contract'),
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { mode: 'date' }),

  // Compensation
  billRate: numeric('bill_rate', { precision: 10, scale: 2 }).notNull(),
  payRate: numeric('pay_rate', { precision: 10, scale: 2 }).notNull(),
  markupPercentage: numeric('markup_percentage', { precision: 5, scale: 2 }),

  // Status
  status: text('status').notNull().default('active'),
  endReason: text('end_reason'),
  actualEndDate: timestamp('actual_end_date', { mode: 'date' }),

  // Financials
  totalRevenue: numeric('total_revenue', { precision: 12, scale: 2 }),
  totalPaid: numeric('total_paid', { precision: 12, scale: 2 }),

  // Onboarding
  onboardingStatus: text('onboarding_status').default('pending'),
  onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),

  // Performance
  performanceRating: integer('performance_rating'),
  extensionCount: integer('extension_count').default(0),

  // Assignment
  recruiterId: uuid('recruiter_id').notNull().references(() => userProfiles.id),
  accountManagerId: uuid('account_manager_id').references(() => userProfiles.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const placementsRelations = relations(placements, ({ one }) => ({
  organization: one(organizations, {
    fields: [placements.orgId],
    references: [organizations.id],
  }),
  submission: one(submissions, {
    fields: [placements.submissionId],
    references: [submissions.id],
  }),
  offer: one(offers, {
    fields: [placements.offerId],
    references: [offers.id],
  }),
  job: one(jobs, {
    fields: [placements.jobId],
    references: [jobs.id],
  }),
  candidate: one(userProfiles, {
    fields: [placements.candidateId],
    references: [userProfiles.id],
  }),
  account: one(accounts, {
    fields: [placements.accountId],
    references: [accounts.id],
  }),
  recruiter: one(userProfiles, {
    fields: [placements.recruiterId],
    references: [userProfiles.id],
  }),
}));

export type Placement = typeof placements.$inferSelect;
export type NewPlacement = typeof placements.$inferInsert;

// =====================================================
// Enums for Type Safety
// =====================================================

export const JobStatus = {
  DRAFT: 'draft',
  OPEN: 'open',
  URGENT: 'urgent',
  ON_HOLD: 'on_hold',
  FILLED: 'filled',
  CANCELLED: 'cancelled',
} as const;

export const SubmissionStatus = {
  SOURCED: 'sourced',
  SCREENING: 'screening',
  SUBMISSION_READY: 'submission_ready',
  SUBMITTED_TO_CLIENT: 'submitted_to_client',
  CLIENT_REVIEW: 'client_review',
  CLIENT_INTERVIEW: 'client_interview',
  OFFER_STAGE: 'offer_stage',
  PLACED: 'placed',
  REJECTED: 'rejected',
} as const;

export const InterviewStatus = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export const OfferStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  NEGOTIATING: 'negotiating',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn',
} as const;

export const PlacementStatus = {
  ACTIVE: 'active',
  EXTENDED: 'extended',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
} as const;

export type JobStatusType = typeof JobStatus[keyof typeof JobStatus];
export type SubmissionStatusType = typeof SubmissionStatus[keyof typeof SubmissionStatus];
export type InterviewStatusType = typeof InterviewStatus[keyof typeof InterviewStatus];
export type OfferStatusType = typeof OfferStatus[keyof typeof OfferStatus];
export type PlacementStatusType = typeof PlacementStatus[keyof typeof PlacementStatus];
