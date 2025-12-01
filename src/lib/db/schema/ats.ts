/**
 * Drizzle ORM Schema: ATS (Applicant Tracking System) Module
 * Tables: skills, candidate_skills, jobs, submissions, interviews, offers, placements
 */

import { pgTable, uuid, text, timestamp, numeric, integer, boolean, unique, jsonb, date, index } from 'drizzle-orm/pg-core';
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
  skillAliases: many(skillAliases),
  jobSkills: many(jobSkills),
}));

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

// =====================================================
// SKILL ALIASES
// =====================================================

export const skillAliases = pgTable(
  'skill_aliases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),

    alias: text('alias').notNull(), // Alternative name for the skill

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    skillIdIdx: index('idx_skill_aliases_skill_id').on(table.skillId),
  })
);

export const skillAliasesRelations = relations(skillAliases, ({ one }) => ({
  organization: one(organizations, {
    fields: [skillAliases.orgId],
    references: [organizations.id],
  }),
  skill: one(skills, {
    fields: [skillAliases.skillId],
    references: [skills.id],
  }),
}));

export type SkillAlias = typeof skillAliases.$inferSelect;
export type NewSkillAlias = typeof skillAliases.$inferInsert;

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
  clientId: uuid('client_id').references(() => accounts.id), // Alias for accountId
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
  priority: text('priority').default('medium'),
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
  targetStartDate: timestamp('target_start_date', { withTimezone: true }),
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
  jobRequirements: many(jobRequirements),
  jobSkills: many(jobSkills),
  jobRates: many(jobRates),
  jobAssignments: many(jobAssignments),
  jobScreeningQuestions: many(jobScreeningQuestions),
}));

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

// =====================================================
// JOB REQUIREMENTS
// =====================================================

export const jobRequirements = pgTable(
  'job_requirements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    jobId: uuid('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),

    requirement: text('requirement').notNull(),
    type: text('type').notNull().default('must_have'), // must_have, nice_to_have
    sequence: integer('sequence').default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    jobIdIdx: index('idx_job_requirements_job_id').on(table.jobId),
  })
);

export const jobRequirementsRelations = relations(jobRequirements, ({ one }) => ({
  organization: one(organizations, {
    fields: [jobRequirements.orgId],
    references: [organizations.id],
  }),
  job: one(jobs, {
    fields: [jobRequirements.jobId],
    references: [jobs.id],
  }),
}));

export type JobRequirement = typeof jobRequirements.$inferSelect;
export type NewJobRequirement = typeof jobRequirements.$inferInsert;

// =====================================================
// JOB SKILLS
// =====================================================

export const jobSkills = pgTable(
  'job_skills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    jobId: uuid('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),

    importance: text('importance').notNull().default('required'), // required, preferred
    minYears: numeric('min_years', { precision: 4, scale: 1 }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    jobIdIdx: index('idx_job_skills_job_id').on(table.jobId),
    skillIdIdx: index('idx_job_skills_skill_id').on(table.skillId),
    uniqueJobSkill: unique().on(table.jobId, table.skillId),
  })
);

export const jobSkillsRelations = relations(jobSkills, ({ one }) => ({
  organization: one(organizations, {
    fields: [jobSkills.orgId],
    references: [organizations.id],
  }),
  job: one(jobs, {
    fields: [jobSkills.jobId],
    references: [jobs.id],
  }),
  skill: one(skills, {
    fields: [jobSkills.skillId],
    references: [skills.id],
  }),
}));

export type JobSkill = typeof jobSkills.$inferSelect;
export type NewJobSkill = typeof jobSkills.$inferInsert;

// =====================================================
// JOB RATES
// =====================================================

export const jobRates = pgTable(
  'job_rates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    jobId: uuid('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),

    billRateMin: numeric('bill_rate_min', { precision: 10, scale: 2 }),
    billRateMax: numeric('bill_rate_max', { precision: 10, scale: 2 }),
    payRateMin: numeric('pay_rate_min', { precision: 10, scale: 2 }),
    payRateMax: numeric('pay_rate_max', { precision: 10, scale: 2 }),
    currency: text('currency').default('USD'),
    rateType: text('rate_type').default('hourly'), // hourly, daily, annual

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    jobIdIdx: index('idx_job_rates_job_id').on(table.jobId),
  })
);

export const jobRatesRelations = relations(jobRates, ({ one }) => ({
  organization: one(organizations, {
    fields: [jobRates.orgId],
    references: [organizations.id],
  }),
  job: one(jobs, {
    fields: [jobRates.jobId],
    references: [jobs.id],
  }),
}));

export type JobRate = typeof jobRates.$inferSelect;
export type NewJobRate = typeof jobRates.$inferInsert;

// =====================================================
// JOB ASSIGNMENTS
// =====================================================

export const jobAssignments = pgTable(
  'job_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    jobId: uuid('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade' }),

    role: text('role').notNull().default('secondary'), // primary, secondary, sourcer

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    jobIdIdx: index('idx_job_assignments_job_id').on(table.jobId),
    userIdIdx: index('idx_job_assignments_user_id').on(table.userId),
    uniqueJobUser: unique().on(table.jobId, table.userId),
  })
);

export const jobAssignmentsRelations = relations(jobAssignments, ({ one }) => ({
  organization: one(organizations, {
    fields: [jobAssignments.orgId],
    references: [organizations.id],
  }),
  job: one(jobs, {
    fields: [jobAssignments.jobId],
    references: [jobs.id],
  }),
  user: one(userProfiles, {
    fields: [jobAssignments.userId],
    references: [userProfiles.id],
  }),
}));

export type JobAssignment = typeof jobAssignments.$inferSelect;
export type NewJobAssignment = typeof jobAssignments.$inferInsert;

// =====================================================
// JOB SCREENING QUESTIONS
// =====================================================

export const jobScreeningQuestions = pgTable(
  'job_screening_questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    jobId: uuid('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),

    question: text('question').notNull(),
    type: text('type').notNull().default('text'), // text, select, boolean
    options: jsonb('options'), // For select type questions
    isRequired: boolean('is_required').default(false),
    sequence: integer('sequence').default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    jobIdIdx: index('idx_job_screening_questions_job_id').on(table.jobId),
  })
);

export const jobScreeningQuestionsRelations = relations(jobScreeningQuestions, ({ one }) => ({
  organization: one(organizations, {
    fields: [jobScreeningQuestions.orgId],
    references: [organizations.id],
  }),
  job: one(jobs, {
    fields: [jobScreeningQuestions.jobId],
    references: [jobs.id],
  }),
}));

export type JobScreeningQuestion = typeof jobScreeningQuestions.$inferSelect;
export type NewJobScreeningQuestion = typeof jobScreeningQuestions.$inferInsert;

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

  // Vendor submission tracking (internal approval before client submission)
  vendorSubmittedAt: timestamp('vendor_submitted_at', { withTimezone: true }),
  vendorSubmittedBy: uuid('vendor_submitted_by').references(() => userProfiles.id),
  vendorDecision: text('vendor_decision'), // 'pending' | 'accepted' | 'rejected'
  vendorDecisionAt: timestamp('vendor_decision_at', { withTimezone: true }),
  vendorDecisionBy: uuid('vendor_decision_by').references(() => userProfiles.id),
  vendorNotes: text('vendor_notes'),
  vendorScreeningNotes: text('vendor_screening_notes'),
  vendorScreeningCompletedAt: timestamp('vendor_screening_completed_at', { withTimezone: true }),

  // Client submission tracking
  submittedToClientAt: timestamp('submitted_to_client_at', { withTimezone: true }),
  submittedToClientBy: uuid('submitted_to_client_by').references(() => userProfiles.id),
  clientResumeFileId: uuid('client_resume_file_id'),
  clientProfileUrl: text('client_profile_url'),
  clientDecision: text('client_decision'), // 'pending' | 'accepted' | 'rejected'
  clientDecisionAt: timestamp('client_decision_at', { withTimezone: true }),
  clientDecisionNotes: text('client_decision_notes'),

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
  submissionRates: many(submissionRates),
  submissionScreeningAnswers: many(submissionScreeningAnswers),
  submissionNotes: many(submissionNotes),
  submissionStatusHistory: many(submissionStatusHistory),
}));

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

// =====================================================
// INTERVIEWS
// =====================================================

export const interviews = pgTable('interviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
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

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [interviews.orgId],
    references: [organizations.id],
  }),
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
  interviewParticipants: many(interviewParticipants),
  interviewFeedback: many(interviewFeedback),
  interviewReminders: many(interviewReminders),
}));

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;

// =====================================================
// OFFERS
// =====================================================

export const offers = pgTable('offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
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
  organization: one(organizations, {
    fields: [offers.orgId],
    references: [organizations.id],
  }),
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
  offerTerms: many(offerTerms),
  offerNegotiations: many(offerNegotiations),
  offerApprovals: many(offerApprovals),
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

export const placementsRelations = relations(placements, ({ one, many }) => ({
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
  placementRates: many(placementRates),
  placementExtensions: many(placementExtensions),
  placementTimesheets: many(placementTimesheets),
  placementMilestones: many(placementMilestones),
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
  // Initial stages
  SOURCED: 'sourced',
  SCREENING: 'screening',
  // Vendor stages (staffing company internal approval)
  VENDOR_PENDING: 'vendor_pending',
  VENDOR_SCREENING: 'vendor_screening',
  VENDOR_ACCEPTED: 'vendor_accepted',
  VENDOR_REJECTED: 'vendor_rejected',
  // Client stages
  SUBMITTED_TO_CLIENT: 'submitted_to_client',
  CLIENT_REVIEW: 'client_review',
  CLIENT_ACCEPTED: 'client_accepted',
  CLIENT_REJECTED: 'client_rejected',
  CLIENT_INTERVIEW: 'client_interview',
  // Final stages
  OFFER_STAGE: 'offer_stage',
  PLACED: 'placed',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
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

// =====================================================
// ACTIVITIES - Constants for ATS module
// Note: The activities table is defined in ./activities.ts (unified system)
// =====================================================

export const ATSActivityType = {
  TASK: 'task',
  FOLLOW_UP: 'follow_up',
  CALL: 'call',
  MEETING: 'meeting',
  REMINDER: 'reminder',
} as const;

export const ATSActivityStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type ATSActivityTypeType = typeof ATSActivityType[keyof typeof ATSActivityType];
export type ATSActivityStatusType = typeof ATSActivityStatus[keyof typeof ATSActivityStatus];

// =====================================================
// CANDIDATE_RESUMES - Resume Versioning System
// =====================================================

export const candidateResumes = pgTable('candidate_resumes', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Version tracking
  version: integer('version').notNull().default(1),
  isLatest: boolean('is_latest').notNull().default(true),
  previousVersionId: uuid('previous_version_id'),

  // File storage
  bucket: text('bucket').notNull().default('resumes'),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),

  // Resume metadata
  resumeType: text('resume_type').default('master'), // 'master', 'formatted', 'client_specific'
  title: text('title'), // e.g., "Master Resume", "Client-Formatted - ABC Corp"
  notes: text('notes'),

  // Parsed content (for AI features)
  parsedContent: text('parsed_content'), // Raw text extracted from resume
  parsedSkills: text('parsed_skills').array(),
  parsedExperience: text('parsed_experience'), // JSON summary
  aiSummary: text('ai_summary'), // AI-generated professional summary

  // Submission tracking
  submissionWriteUp: text('submission_write_up'), // Pre-formatted submission text

  // Upload info
  uploadedBy: uuid('uploaded_by').notNull().references(() => userProfiles.id),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),

  // Soft delete (never truly delete, just archive)
  isArchived: boolean('is_archived').default(false),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  archivedBy: uuid('archived_by').references(() => userProfiles.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const candidateResumesRelations = relations(candidateResumes, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateResumes.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateResumes.candidateId],
    references: [userProfiles.id],
  }),
  uploader: one(userProfiles, {
    fields: [candidateResumes.uploadedBy],
    references: [userProfiles.id],
  }),
  previousVersion: one(candidateResumes, {
    fields: [candidateResumes.previousVersionId],
    references: [candidateResumes.id],
  }),
}));

export type CandidateResume = typeof candidateResumes.$inferSelect;
export type NewCandidateResume = typeof candidateResumes.$inferInsert;

export const ResumeType = {
  MASTER: 'master',
  FORMATTED: 'formatted',
  CLIENT_SPECIFIC: 'client_specific',
} as const;

export type ResumeTypeType = typeof ResumeType[keyof typeof ResumeType];

// =====================================================
// ADDRESSES - Polymorphic, Multi-Country Support
// =====================================================

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Polymorphic reference
  entityType: text('entity_type').notNull(), // 'candidate', 'account', 'contact', 'vendor'
  entityId: uuid('entity_id').notNull(),
  addressType: text('address_type').notNull(), // 'current', 'permanent', 'mailing', 'work', 'billing', 'shipping'

  // International address fields
  addressLine1: text('address_line_1'),
  addressLine2: text('address_line_2'),
  addressLine3: text('address_line_3'),
  city: text('city'),
  stateProvince: text('state_province'),
  postalCode: text('postal_code'),
  countryCode: text('country_code').notNull().default('US'), // ISO 3166-1 alpha-2
  county: text('county'),

  // Geo-location
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),

  // Validation
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verificationSource: text('verification_source'),

  // Metadata
  isPrimary: boolean('is_primary').default(false),
  effectiveFrom: date('effective_from'),
  effectiveTo: date('effective_to'),
  notes: text('notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
}, (table) => ({
  uniqueAddressPerEntityType: unique().on(table.entityType, table.entityId, table.addressType),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  organization: one(organizations, {
    fields: [addresses.orgId],
    references: [organizations.id],
  }),
}));

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;

export const AddressType = {
  CURRENT: 'current',
  PERMANENT: 'permanent',
  MAILING: 'mailing',
  WORK: 'work',
  BILLING: 'billing',
  SHIPPING: 'shipping',
} as const;

export const EntityType = {
  CANDIDATE: 'candidate',
  ACCOUNT: 'account',
  CONTACT: 'contact',
  VENDOR: 'vendor',
} as const;

// =====================================================
// CANDIDATE WORK AUTHORIZATIONS
// =====================================================

export const candidateWorkAuthorizations = pgTable('candidate_work_authorizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Work Authorization Type
  authorizationType: text('authorization_type').notNull(), // 'citizen', 'permanent_resident', 'work_visa', 'student_visa', 'ead', 'asylum', 'refugee', 'other'
  visaType: text('visa_type'), // H1B, L1, O1, TN, E2, F1_OPT, etc.
  countryCode: text('country_code').notNull(),

  // Status & Validity
  status: text('status').notNull().default('active'), // 'active', 'expired', 'pending', 'revoked', 'denied'
  issueDate: date('issue_date'),
  expiryDate: date('expiry_date'),
  receiptNumber: text('receipt_number'),

  // Sponsorship
  requiresSponsorship: boolean('requires_sponsorship').default(false),
  currentSponsor: text('current_sponsor'),
  isTransferable: boolean('is_transferable').default(true),
  transferInProgress: boolean('transfer_in_progress').default(false),

  // Cap/Lottery Status (for H1B)
  capExempt: boolean('cap_exempt').default(false),
  lotterySelected: boolean('lottery_selected'),
  lotteryYear: integer('lottery_year'),

  // EAD Specific
  eadCategory: text('ead_category'),
  eadCardNumber: text('ead_card_number'),
  eadExpiry: date('ead_expiry'),

  // I-9 Compliance
  i9Completed: boolean('i9_completed').default(false),
  i9CompletedAt: timestamp('i9_completed_at', { withTimezone: true }),
  i9ExpiryDate: date('i9_expiry_date'),
  i9Section2Completed: boolean('i9_section_2_completed').default(false),
  i9DocumentList: text('i9_document_list'), // 'A', 'B+C', 'B', 'C'
  i9DocumentDetails: jsonb('i9_document_details'),
  eVerifyStatus: text('e_verify_status'), // 'not_started', 'pending', 'verified', 'tnc', 'fnc', 'failed', 'closed'
  eVerifyCaseNumber: text('e_verify_case_number'),
  eVerifyCompletionDate: date('e_verify_completion_date'),

  // Passport Information
  passportCountry: text('passport_country'),
  passportNumberEncrypted: text('passport_number_encrypted'),
  passportIssueDate: date('passport_issue_date'),
  passportExpiryDate: date('passport_expiry_date'),
  hasValidVisaStamp: boolean('has_valid_visa_stamp').default(false),
  visaStampExpiry: date('visa_stamp_expiry'),

  // Documents
  documents: jsonb('documents').default([]),

  // Metadata
  notes: text('notes'),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const candidateWorkAuthorizationsRelations = relations(candidateWorkAuthorizations, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateWorkAuthorizations.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateWorkAuthorizations.candidateId],
    references: [userProfiles.id],
  }),
}));

export type CandidateWorkAuthorization = typeof candidateWorkAuthorizations.$inferSelect;
export type NewCandidateWorkAuthorization = typeof candidateWorkAuthorizations.$inferInsert;

export const AuthorizationType = {
  CITIZEN: 'citizen',
  PERMANENT_RESIDENT: 'permanent_resident',
  WORK_VISA: 'work_visa',
  STUDENT_VISA: 'student_visa',
  EAD: 'ead',
  ASYLUM: 'asylum',
  REFUGEE: 'refugee',
  OTHER: 'other',
} as const;

export const VisaType = {
  H1B: 'H1B',
  H1B1: 'H1B1',
  L1A: 'L1A',
  L1B: 'L1B',
  O1: 'O1',
  TN: 'TN',
  E2: 'E2',
  E3: 'E3',
  F1_OPT: 'F1_OPT',
  F1_CPT: 'F1_CPT',
  J1: 'J1',
  H4_EAD: 'H4_EAD',
  L2_EAD: 'L2_EAD',
  OTHER: 'Other',
} as const;

// =====================================================
// CANDIDATE EDUCATION
// =====================================================

export const candidateEducation = pgTable('candidate_education', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Education Details
  degreeType: text('degree_type'),
  degreeName: text('degree_name'),
  fieldOfStudy: text('field_of_study'),
  minor: text('minor'),
  concentration: text('concentration'),

  // Institution
  institutionName: text('institution_name').notNull(),
  institutionType: text('institution_type'),
  institutionCity: text('institution_city'),
  institutionState: text('institution_state'),
  institutionCountry: text('institution_country'),
  countryCode: text('country_code'),

  // Dates
  startDate: date('start_date'),
  endDate: date('end_date'),
  expectedGraduation: date('expected_graduation'),
  isCurrent: boolean('is_current').default(false),

  // Academic Performance
  gpa: numeric('gpa', { precision: 4, scale: 2 }),
  gpaScale: numeric('gpa_scale', { precision: 3, scale: 1 }).default('4.0'),
  classRank: text('class_rank'),
  honors: text('honors'),
  thesisTitle: text('thesis_title'),
  dissertationTitle: text('dissertation_title'),

  // Verification
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedBy: uuid('verified_by'),
  verificationMethod: text('verification_method'),
  verificationNotes: text('verification_notes'),
  transcriptFileId: uuid('transcript_file_id'),
  diplomaFileId: uuid('diploma_file_id'),

  // Display
  displayOrder: integer('display_order').default(0),
  isHighestDegree: boolean('is_highest_degree').default(false),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const candidateEducationRelations = relations(candidateEducation, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateEducation.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateEducation.candidateId],
    references: [userProfiles.id],
  }),
}));

export type CandidateEducationRecord = typeof candidateEducation.$inferSelect;
export type NewCandidateEducation = typeof candidateEducation.$inferInsert;

export const DegreeType = {
  HIGH_SCHOOL: 'high_school',
  GED: 'ged',
  VOCATIONAL: 'vocational',
  ASSOCIATE: 'associate',
  BACHELOR: 'bachelor',
  MASTER: 'master',
  MBA: 'mba',
  DOCTORATE: 'doctorate',
  PHD: 'phd',
  POSTDOC: 'postdoc',
  CERTIFICATE: 'certificate',
  DIPLOMA: 'diploma',
  PROFESSIONAL_DEGREE: 'professional_degree',
  OTHER: 'other',
} as const;

// =====================================================
// CANDIDATE WORK HISTORY
// =====================================================

export const candidateWorkHistory = pgTable('candidate_work_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Company & Role
  companyName: text('company_name').notNull(),
  companyIndustry: text('company_industry'),
  companySize: text('company_size'),
  jobTitle: text('job_title').notNull(),
  department: text('department'),

  // Employment Details
  employmentType: text('employment_type'),
  employmentBasis: text('employment_basis'), // 'w2', '1099', 'corp_to_corp', 'direct'

  // Location
  locationCity: text('location_city'),
  locationState: text('location_state'),
  locationCountry: text('location_country'),
  countryCode: text('country_code'),
  isRemote: boolean('is_remote').default(false),
  remoteType: text('remote_type'),

  // Dates
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  isCurrent: boolean('is_current').default(false),

  // Job Details
  description: text('description'),
  responsibilities: text('responsibilities').array(),
  achievements: text('achievements').array(),
  skillsUsed: text('skills_used').array(),
  toolsUsed: text('tools_used').array(),
  projects: text('projects').array(),

  // Salary
  salaryAmount: numeric('salary_amount', { precision: 12, scale: 2 }),
  salaryCurrency: text('salary_currency').default('USD'),
  salaryType: text('salary_type'),

  // Verification
  supervisorName: text('supervisor_name'),
  supervisorTitle: text('supervisor_title'),
  supervisorEmail: text('supervisor_email'),
  supervisorPhone: text('supervisor_phone'),
  hrContactName: text('hr_contact_name'),
  hrContactEmail: text('hr_contact_email'),
  hrContactPhone: text('hr_contact_phone'),
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedBy: uuid('verified_by'),
  verificationMethod: text('verification_method'),
  verificationNotes: text('verification_notes'),

  // Exit Details
  reasonForLeaving: text('reason_for_leaving'),
  isRehireEligible: boolean('is_rehire_eligible'),
  rehireNotes: text('rehire_notes'),

  // Display
  displayOrder: integer('display_order').default(0),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const candidateWorkHistoryRelations = relations(candidateWorkHistory, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateWorkHistory.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateWorkHistory.candidateId],
    references: [userProfiles.id],
  }),
}));

export type CandidateWorkHistoryRecord = typeof candidateWorkHistory.$inferSelect;
export type NewCandidateWorkHistory = typeof candidateWorkHistory.$inferInsert;

export const EmploymentType = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  TEMP: 'temp',
  FREELANCE: 'freelance',
  INTERNSHIP: 'internship',
  APPRENTICESHIP: 'apprenticeship',
  VOLUNTEER: 'volunteer',
  SELF_EMPLOYED: 'self_employed',
} as const;

// =====================================================
// CANDIDATE CERTIFICATIONS
// =====================================================

export const candidateCertifications = pgTable('candidate_certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Certification Type
  certificationType: text('certification_type').notNull(),

  // Certification Details
  name: text('name').notNull(),
  acronym: text('acronym'),
  issuingOrganization: text('issuing_organization'),
  credentialId: text('credential_id'),
  credentialUrl: text('credential_url'),

  // Validity
  issueDate: date('issue_date'),
  expiryDate: date('expiry_date'),
  isLifetime: boolean('is_lifetime').default(false),
  requiresRenewal: boolean('requires_renewal').default(false),
  renewalPeriodMonths: integer('renewal_period_months'),
  cpeCreditsRequired: integer('cpe_credits_required'),

  // For Licenses
  licenseType: text('license_type'),
  licenseNumber: text('license_number'),
  licenseState: text('license_state'),
  licenseCountry: text('license_country'),
  licenseJurisdiction: text('license_jurisdiction'),

  // For Security Clearances
  clearanceLevel: text('clearance_level'),
  clearanceStatus: text('clearance_status'),
  clearanceGrantedDate: date('clearance_granted_date'),
  investigationType: text('investigation_type'),
  polygraphType: text('polygraph_type'),
  polygraphDate: date('polygraph_date'),
  sapAccess: boolean('sap_access').default(false),
  sciAccess: boolean('sci_access').default(false),

  // Verification
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedBy: uuid('verified_by'),
  verificationMethod: text('verification_method'),
  verificationNotes: text('verification_notes'),
  documentFileId: uuid('document_file_id'),

  // Display
  displayOrder: integer('display_order').default(0),
  isFeatured: boolean('is_featured').default(false),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const candidateCertificationsRelations = relations(candidateCertifications, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateCertifications.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateCertifications.candidateId],
    references: [userProfiles.id],
  }),
}));

export type CandidateCertification = typeof candidateCertifications.$inferSelect;
export type NewCandidateCertification = typeof candidateCertifications.$inferInsert;

export const CertificationType = {
  PROFESSIONAL: 'professional',
  TECHNICAL: 'technical',
  VENDOR: 'vendor',
  INDUSTRY: 'industry',
  LICENSE: 'license',
  CLEARANCE: 'clearance',
  TRAINING: 'training',
  OTHER: 'other',
} as const;

export const ClearanceLevel = {
  PUBLIC_TRUST: 'public_trust',
  CONFIDENTIAL: 'confidential',
  SECRET: 'secret',
  TOP_SECRET: 'top_secret',
  TOP_SECRET_SCI: 'top_secret_sci',
  Q_CLEARANCE: 'q_clearance',
  L_CLEARANCE: 'l_clearance',
} as const;

// =====================================================
// CANDIDATE REFERENCES
// =====================================================

export const candidateReferences = pgTable('candidate_references', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Reference Person Info
  referenceName: text('reference_name').notNull(),
  referenceTitle: text('reference_title'),
  referenceCompany: text('reference_company'),
  relationshipType: text('relationship_type'),
  relationshipDescription: text('relationship_description'),
  yearsKnown: integer('years_known'),
  workedTogetherFrom: date('worked_together_from'),
  workedTogetherTo: date('worked_together_to'),

  // Contact Information
  email: text('email'),
  phone: text('phone'),
  linkedinUrl: text('linkedin_url'),
  preferredContactMethod: text('preferred_contact_method'),
  bestTimeToContact: text('best_time_to_contact'),

  // Verification Status
  status: text('status').default('pending'),
  contactAttempts: integer('contact_attempts').default(0),
  lastContactAttempt: timestamp('last_contact_attempt', { withTimezone: true }),
  contactedAt: timestamp('contacted_at', { withTimezone: true }),
  contactedBy: uuid('contacted_by'),
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // Reference Feedback
  rating: integer('rating'),
  overallImpression: text('overall_impression'),
  wouldRehire: boolean('would_rehire'),
  wouldWorkWithAgain: boolean('would_work_with_again'),

  // Structured Feedback
  feedbackSummary: text('feedback_summary'),
  strengths: text('strengths').array(),
  areasForImprovement: text('areas_for_improvement').array(),
  questionnaireResponses: jsonb('questionnaire_responses'),

  // Notes
  verificationNotes: text('verification_notes'),
  internalNotes: text('internal_notes'),

  // Consent
  referenceConsentGiven: boolean('reference_consent_given').default(false),
  consentDate: timestamp('consent_date', { withTimezone: true }),

  // Display
  displayOrder: integer('display_order').default(0),
  isPrimary: boolean('is_primary').default(false),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const candidateReferencesRelations = relations(candidateReferences, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateReferences.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateReferences.candidateId],
    references: [userProfiles.id],
  }),
}));

export type CandidateReference = typeof candidateReferences.$inferSelect;
export type NewCandidateReference = typeof candidateReferences.$inferInsert;

export const ReferenceRelationshipType = {
  DIRECT_SUPERVISOR: 'direct_supervisor',
  INDIRECT_SUPERVISOR: 'indirect_supervisor',
  COLLEAGUE: 'colleague',
  DIRECT_REPORT: 'direct_report',
  CLIENT: 'client',
  VENDOR: 'vendor',
  PROFESSOR: 'professor',
  MENTOR: 'mentor',
  PERSONAL: 'personal',
  OTHER: 'other',
} as const;

// =====================================================
// CANDIDATE BACKGROUND CHECKS
// =====================================================

export const candidateBackgroundChecks = pgTable('candidate_background_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  submissionId: uuid('submission_id').references(() => submissions.id, { onDelete: 'set null' }),
  placementId: uuid('placement_id').references(() => placements.id, { onDelete: 'set null' }),

  // Provider Information
  provider: text('provider'),
  providerReferenceId: text('provider_reference_id'),
  providerOrderId: text('provider_order_id'),
  packageName: text('package_name'),
  packageType: text('package_type'),

  // Overall Status
  status: text('status').notNull().default('not_started'),
  overallResult: text('overall_result'),

  // Dates
  requestedAt: timestamp('requested_at', { withTimezone: true }),
  requestedBy: uuid('requested_by'),
  initiatedAt: timestamp('initiated_at', { withTimezone: true }),
  estimatedCompletion: date('estimated_completion'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  validForMonths: integer('valid_for_months').default(12),

  // Component Checks
  checks: jsonb('checks').default({}),

  // Adjudication
  adjudicationStatus: text('adjudication_status'),
  adjudicationNotes: text('adjudication_notes'),
  adjudicatedBy: uuid('adjudicated_by'),
  adjudicatedAt: timestamp('adjudicated_at', { withTimezone: true }),

  // Adverse Action
  adverseActionRequired: boolean('adverse_action_required').default(false),
  preAdverseSentAt: timestamp('pre_adverse_sent_at', { withTimezone: true }),
  preAdverseResponseDeadline: date('pre_adverse_response_deadline'),
  finalAdverseSentAt: timestamp('final_adverse_sent_at', { withTimezone: true }),
  adverseActionNotes: text('adverse_action_notes'),

  // Consent & Documents
  consentFormFileId: uuid('consent_form_file_id'),
  consentSignedAt: timestamp('consent_signed_at', { withTimezone: true }),
  consentIpAddress: text('consent_ip_address'),
  consentUserAgent: text('consent_user_agent'),
  authorizationFormFileId: uuid('authorization_form_file_id'),
  reportFileId: uuid('report_file_id'),
  reportReceivedAt: timestamp('report_received_at', { withTimezone: true }),

  // Cost Tracking
  cost: numeric('cost', { precision: 10, scale: 2 }),
  costCurrency: text('cost_currency').default('USD'),
  billedTo: text('billed_to'),

  // Notes
  notes: text('notes'),
  internalNotes: text('internal_notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const candidateBackgroundChecksRelations = relations(candidateBackgroundChecks, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateBackgroundChecks.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateBackgroundChecks.candidateId],
    references: [userProfiles.id],
  }),
  submission: one(submissions, {
    fields: [candidateBackgroundChecks.submissionId],
    references: [submissions.id],
  }),
  placement: one(placements, {
    fields: [candidateBackgroundChecks.placementId],
    references: [placements.id],
  }),
}));

export type CandidateBackgroundCheck = typeof candidateBackgroundChecks.$inferSelect;
export type NewCandidateBackgroundCheck = typeof candidateBackgroundChecks.$inferInsert;

export const BGCProvider = {
  STERLING: 'sterling',
  HIRERIGHT: 'hireright',
  CHECKR: 'checkr',
  ACCURATE: 'accurate',
  GOODHIRE: 'goodhire',
  FIRST_ADVANTAGE: 'first_advantage',
  FADV: 'fadv',
  ORANGE_TREE: 'orange_tree',
  INFO_CUBIC: 'info_cubic',
  INTERNAL: 'internal',
  CLIENT_CONDUCTED: 'client_conducted',
  OTHER: 'other',
} as const;

export const BGCStatus = {
  NOT_STARTED: 'not_started',
  CONSENT_PENDING: 'consent_pending',
  CONSENT_RECEIVED: 'consent_received',
  INITIATED: 'initiated',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const BGCResult = {
  CLEAR: 'clear',
  CONSIDER: 'consider',
  ADVERSE: 'adverse',
  PENDING: 'pending',
  INCOMPLETE: 'incomplete',
} as const;

// =====================================================
// CANDIDATE COMPLIANCE DOCUMENTS
// =====================================================

export const candidateComplianceDocuments = pgTable('candidate_compliance_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  placementId: uuid('placement_id').references(() => placements.id, { onDelete: 'set null' }),
  submissionId: uuid('submission_id').references(() => submissions.id, { onDelete: 'set null' }),

  // Document Classification
  documentType: text('document_type').notNull(),
  documentName: text('document_name').notNull(),
  documentDescription: text('document_description'),
  documentCategory: text('document_category'),

  // Status Tracking
  status: text('status').notNull().default('required'),

  // Dates
  requiredBy: date('required_by'),
  requestedAt: timestamp('requested_at', { withTimezone: true }),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewedBy: uuid('reviewed_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  approvedBy: uuid('approved_by'),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  rejectedBy: uuid('rejected_by'),
  rejectionReason: text('rejection_reason'),
  effectiveDate: date('effective_date'),
  expiresAt: date('expires_at'),

  // File Storage
  fileId: uuid('file_id'),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  fileMimeType: text('file_mime_type'),

  // E-Signature
  requiresSignature: boolean('requires_signature').default(true),
  isSigned: boolean('is_signed').default(false),
  signedAt: timestamp('signed_at', { withTimezone: true }),
  signerName: text('signer_name'),
  signerEmail: text('signer_email'),
  signatureIp: text('signature_ip'),
  signatureUserAgent: text('signature_user_agent'),
  signatureMethod: text('signature_method'),
  signatureEnvelopeId: text('signature_envelope_id'),

  // Version Control
  version: integer('version').default(1),
  previousVersionId: uuid('previous_version_id'),
  isCurrentVersion: boolean('is_current_version').default(true),

  // Client-Specific
  clientId: uuid('client_id'),
  clientName: text('client_name'),

  // Notes
  notes: text('notes'),
  internalNotes: text('internal_notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const candidateComplianceDocumentsRelations = relations(candidateComplianceDocuments, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateComplianceDocuments.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateComplianceDocuments.candidateId],
    references: [userProfiles.id],
  }),
  submission: one(submissions, {
    fields: [candidateComplianceDocuments.submissionId],
    references: [submissions.id],
  }),
  placement: one(placements, {
    fields: [candidateComplianceDocuments.placementId],
    references: [placements.id],
  }),
  previousVersion: one(candidateComplianceDocuments, {
    fields: [candidateComplianceDocuments.previousVersionId],
    references: [candidateComplianceDocuments.id],
  }),
}));

export type CandidateComplianceDocument = typeof candidateComplianceDocuments.$inferSelect;
export type NewCandidateComplianceDocument = typeof candidateComplianceDocuments.$inferInsert;

export const ComplianceDocumentType = {
  I9: 'i9',
  W4: 'w4',
  W9: 'w9',
  STATE_TAX: 'state_tax',
  DIRECT_DEPOSIT: 'direct_deposit',
  OFFER_LETTER: 'offer_letter',
  EMPLOYMENT_AGREEMENT: 'employment_agreement',
  CONTRACTOR_AGREEMENT: 'contractor_agreement',
  NDA: 'nda',
  NON_COMPETE: 'non_compete',
  NON_SOLICITATION: 'non_solicitation',
  IP_ASSIGNMENT: 'ip_assignment',
  EMPLOYEE_HANDBOOK_ACK: 'employee_handbook_ack',
  POLICY_ACKNOWLEDGMENT: 'policy_acknowledgment',
  CODE_OF_CONDUCT: 'code_of_conduct',
  BENEFITS_ENROLLMENT: 'benefits_enrollment',
  EMERGENCY_CONTACT_FORM: 'emergency_contact_form',
  BACKGROUND_CHECK_CONSENT: 'background_check_consent',
  DRUG_TEST_CONSENT: 'drug_test_consent',
  EQUIPMENT_AGREEMENT: 'equipment_agreement',
  EXPENSE_POLICY: 'expense_policy',
  CLIENT_SPECIFIC: 'client_specific',
  OTHER: 'other',
} as const;

export const ComplianceDocumentStatus = {
  NOT_REQUIRED: 'not_required',
  REQUIRED: 'required',
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  SUPERSEDED: 'superseded',
} as const;

// =====================================================
// CANDIDATE PROFILES
// =====================================================

export const candidateProfiles = pgTable('candidate_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' })
    .unique(),

  summary: text('summary'),
  totalExperienceYears: numeric('total_experience_years', { precision: 4, scale: 1 }),
  highestEducation: text('highest_education'),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const candidateProfilesRelations = relations(candidateProfiles, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateProfiles.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateProfiles.candidateId],
    references: [userProfiles.id],
  }),
}));

export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type NewCandidateProfile = typeof candidateProfiles.$inferInsert;

// =====================================================
// CANDIDATE DOCUMENTS
// =====================================================

export const candidateDocuments = pgTable(
  'candidate_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    candidateId: uuid('candidate_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade' }),

    type: text('type').notNull(), // resume, cover_letter, portfolio, certification
    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    version: integer('version').default(1),
    isPrimary: boolean('is_primary').default(false),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    candidateIdIdx: index('idx_candidate_documents_candidate_id').on(table.candidateId),
  })
);

export const candidateDocumentsRelations = relations(candidateDocuments, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateDocuments.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateDocuments.candidateId],
    references: [userProfiles.id],
  }),
}));

export type CandidateDocument = typeof candidateDocuments.$inferSelect;
export type NewCandidateDocument = typeof candidateDocuments.$inferInsert;

// =====================================================
// CANDIDATE AVAILABILITY
// =====================================================

export const candidateAvailability = pgTable('candidate_availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' })
    .unique(),

  availableFrom: date('available_from'),
  noticePeriodDays: integer('notice_period_days'),
  preferredRateMin: numeric('preferred_rate_min', { precision: 10, scale: 2 }),
  preferredRateMax: numeric('preferred_rate_max', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const candidateAvailabilityRelations = relations(candidateAvailability, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateAvailability.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidateAvailability.candidateId],
    references: [userProfiles.id],
  }),
}));

export type CandidateAvailabilityRecord = typeof candidateAvailability.$inferSelect;
export type NewCandidateAvailability = typeof candidateAvailability.$inferInsert;

// =====================================================
// CANDIDATE PREFERENCES
// =====================================================

export const candidatePreferences = pgTable('candidate_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' })
    .unique(),

  preferredJobTypes: text('preferred_job_types').array(),
  preferredWorkModes: text('preferred_work_modes').array(),
  preferredIndustries: text('preferred_industries').array(),
  minRate: numeric('min_rate', { precision: 10, scale: 2 }),
  maxCommuteMiles: integer('max_commute_miles'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const candidatePreferencesRelations = relations(candidatePreferences, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidatePreferences.orgId],
    references: [organizations.id],
  }),
  candidate: one(userProfiles, {
    fields: [candidatePreferences.candidateId],
    references: [userProfiles.id],
  }),
}));

export type CandidatePreferencesRecord = typeof candidatePreferences.$inferSelect;
export type NewCandidatePreferences = typeof candidatePreferences.$inferInsert;

// =====================================================
// SUBMISSION RATES
// =====================================================

export const submissionRates = pgTable('submission_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => submissions.id, { onDelete: 'cascade' })
    .unique(),

  billRate: numeric('bill_rate', { precision: 10, scale: 2 }),
  payRate: numeric('pay_rate', { precision: 10, scale: 2 }),
  marginPercent: numeric('margin_percent', { precision: 5, scale: 2 }),
  marginAmount: numeric('margin_amount', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const submissionRatesRelations = relations(submissionRates, ({ one }) => ({
  organization: one(organizations, {
    fields: [submissionRates.orgId],
    references: [organizations.id],
  }),
  submission: one(submissions, {
    fields: [submissionRates.submissionId],
    references: [submissions.id],
  }),
}));

export type SubmissionRate = typeof submissionRates.$inferSelect;
export type NewSubmissionRate = typeof submissionRates.$inferInsert;

// =====================================================
// SUBMISSION SCREENING ANSWERS
// =====================================================

export const submissionScreeningAnswers = pgTable(
  'submission_screening_answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => jobScreeningQuestions.id, { onDelete: 'cascade' }),

    answer: text('answer'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    submissionIdIdx: index('idx_submission_screening_answers_submission_id').on(table.submissionId),
    uniqueSubmissionQuestion: unique().on(table.submissionId, table.questionId),
  })
);

export const submissionScreeningAnswersRelations = relations(submissionScreeningAnswers, ({ one }) => ({
  organization: one(organizations, {
    fields: [submissionScreeningAnswers.orgId],
    references: [organizations.id],
  }),
  submission: one(submissions, {
    fields: [submissionScreeningAnswers.submissionId],
    references: [submissions.id],
  }),
  question: one(jobScreeningQuestions, {
    fields: [submissionScreeningAnswers.questionId],
    references: [jobScreeningQuestions.id],
  }),
}));

export type SubmissionScreeningAnswer = typeof submissionScreeningAnswers.$inferSelect;
export type NewSubmissionScreeningAnswer = typeof submissionScreeningAnswers.$inferInsert;

// =====================================================
// SUBMISSION NOTES
// =====================================================

export const submissionNotes = pgTable(
  'submission_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),

    note: text('note').notNull(),
    isClientVisible: boolean('is_client_visible').default(false),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => userProfiles.id),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    submissionIdIdx: index('idx_submission_notes_submission_id').on(table.submissionId),
  })
);

export const submissionNotesRelations = relations(submissionNotes, ({ one }) => ({
  organization: one(organizations, {
    fields: [submissionNotes.orgId],
    references: [organizations.id],
  }),
  submission: one(submissions, {
    fields: [submissionNotes.submissionId],
    references: [submissions.id],
  }),
  creator: one(userProfiles, {
    fields: [submissionNotes.createdBy],
    references: [userProfiles.id],
  }),
}));

export type SubmissionNote = typeof submissionNotes.$inferSelect;
export type NewSubmissionNote = typeof submissionNotes.$inferInsert;

// =====================================================
// SUBMISSION STATUS HISTORY
// =====================================================

export const submissionStatusHistory = pgTable(
  'submission_status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),

    fromStatus: text('from_status'),
    toStatus: text('to_status').notNull(),
    reason: text('reason'),
    changedBy: uuid('changed_by')
      .notNull()
      .references(() => userProfiles.id),
    changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    submissionIdIdx: index('idx_submission_status_history_submission_id').on(table.submissionId),
  })
);

export const submissionStatusHistoryRelations = relations(submissionStatusHistory, ({ one }) => ({
  organization: one(organizations, {
    fields: [submissionStatusHistory.orgId],
    references: [organizations.id],
  }),
  submission: one(submissions, {
    fields: [submissionStatusHistory.submissionId],
    references: [submissions.id],
  }),
  changer: one(userProfiles, {
    fields: [submissionStatusHistory.changedBy],
    references: [userProfiles.id],
  }),
}));

export type SubmissionStatusHistory = typeof submissionStatusHistory.$inferSelect;
export type NewSubmissionStatusHistory = typeof submissionStatusHistory.$inferInsert;

// =====================================================
// INTERVIEW PARTICIPANTS
// =====================================================

export const interviewParticipants = pgTable(
  'interview_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    interviewId: uuid('interview_id')
      .notNull()
      .references(() => interviews.id, { onDelete: 'cascade' }),

    participantType: text('participant_type').notNull(), // interviewer, candidate, recruiter
    userId: uuid('user_id').references(() => userProfiles.id),
    externalName: text('external_name'),
    externalEmail: text('external_email'),
    isRequired: boolean('is_required').default(true),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    interviewIdIdx: index('idx_interview_participants_interview_id').on(table.interviewId),
  })
);

export const interviewParticipantsRelations = relations(interviewParticipants, ({ one }) => ({
  organization: one(organizations, {
    fields: [interviewParticipants.orgId],
    references: [organizations.id],
  }),
  interview: one(interviews, {
    fields: [interviewParticipants.interviewId],
    references: [interviews.id],
  }),
  user: one(userProfiles, {
    fields: [interviewParticipants.userId],
    references: [userProfiles.id],
  }),
}));

export type InterviewParticipant = typeof interviewParticipants.$inferSelect;
export type NewInterviewParticipant = typeof interviewParticipants.$inferInsert;

// =====================================================
// INTERVIEW FEEDBACK
// =====================================================

export const interviewFeedback = pgTable(
  'interview_feedback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    interviewId: uuid('interview_id')
      .notNull()
      .references(() => interviews.id, { onDelete: 'cascade' }),

    submittedBy: uuid('submitted_by')
      .notNull()
      .references(() => userProfiles.id),
    rating: integer('rating'), // 1-5
    recommendation: text('recommendation'), // strong_yes, yes, maybe, no, strong_no
    strengths: text('strengths'),
    weaknesses: text('weaknesses'),
    notes: text('notes'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    interviewIdIdx: index('idx_interview_feedback_interview_id').on(table.interviewId),
  })
);

export const interviewFeedbackRelations = relations(interviewFeedback, ({ one }) => ({
  organization: one(organizations, {
    fields: [interviewFeedback.orgId],
    references: [organizations.id],
  }),
  interview: one(interviews, {
    fields: [interviewFeedback.interviewId],
    references: [interviews.id],
  }),
  submitter: one(userProfiles, {
    fields: [interviewFeedback.submittedBy],
    references: [userProfiles.id],
  }),
}));

export type InterviewFeedbackRecord = typeof interviewFeedback.$inferSelect;
export type NewInterviewFeedback = typeof interviewFeedback.$inferInsert;

// =====================================================
// INTERVIEW REMINDERS
// =====================================================

export const interviewReminders = pgTable(
  'interview_reminders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    interviewId: uuid('interview_id')
      .notNull()
      .references(() => interviews.id, { onDelete: 'cascade' }),

    reminderType: text('reminder_type').notNull(), // 24h, 1h, 15m
    sentAt: timestamp('sent_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    interviewIdIdx: index('idx_interview_reminders_interview_id').on(table.interviewId),
  })
);

export const interviewRemindersRelations = relations(interviewReminders, ({ one }) => ({
  organization: one(organizations, {
    fields: [interviewReminders.orgId],
    references: [organizations.id],
  }),
  interview: one(interviews, {
    fields: [interviewReminders.interviewId],
    references: [interviews.id],
  }),
}));

export type InterviewReminder = typeof interviewReminders.$inferSelect;
export type NewInterviewReminder = typeof interviewReminders.$inferInsert;

// =====================================================
// OFFER TERMS
// =====================================================

export const offerTerms = pgTable(
  'offer_terms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    offerId: uuid('offer_id')
      .notNull()
      .references(() => offers.id, { onDelete: 'cascade' }),

    termType: text('term_type').notNull(), // signing_bonus, relocation, pto, benefits, other
    value: text('value'),
    description: text('description'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    offerIdIdx: index('idx_offer_terms_offer_id').on(table.offerId),
  })
);

export const offerTermsRelations = relations(offerTerms, ({ one }) => ({
  organization: one(organizations, {
    fields: [offerTerms.orgId],
    references: [organizations.id],
  }),
  offer: one(offers, {
    fields: [offerTerms.offerId],
    references: [offers.id],
  }),
}));

export type OfferTerm = typeof offerTerms.$inferSelect;
export type NewOfferTerm = typeof offerTerms.$inferInsert;

// =====================================================
// OFFER NEGOTIATIONS
// =====================================================

export const offerNegotiations = pgTable(
  'offer_negotiations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    offerId: uuid('offer_id')
      .notNull()
      .references(() => offers.id, { onDelete: 'cascade' }),

    requestedBy: text('requested_by').notNull(), // candidate, client
    requestedChanges: text('requested_changes'),
    status: text('status').notNull().default('pending'), // pending, accepted, rejected
    notes: text('notes'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    offerIdIdx: index('idx_offer_negotiations_offer_id').on(table.offerId),
  })
);

export const offerNegotiationsRelations = relations(offerNegotiations, ({ one }) => ({
  organization: one(organizations, {
    fields: [offerNegotiations.orgId],
    references: [organizations.id],
  }),
  offer: one(offers, {
    fields: [offerNegotiations.offerId],
    references: [offers.id],
  }),
}));

export type OfferNegotiation = typeof offerNegotiations.$inferSelect;
export type NewOfferNegotiation = typeof offerNegotiations.$inferInsert;

// =====================================================
// OFFER APPROVALS
// =====================================================

export const offerApprovals = pgTable(
  'offer_approvals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    offerId: uuid('offer_id')
      .notNull()
      .references(() => offers.id, { onDelete: 'cascade' }),

    approverId: uuid('approver_id')
      .notNull()
      .references(() => userProfiles.id),
    status: text('status').notNull().default('pending'), // pending, approved, rejected
    notes: text('notes'),
    decidedAt: timestamp('decided_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    offerIdIdx: index('idx_offer_approvals_offer_id').on(table.offerId),
    approverIdIdx: index('idx_offer_approvals_approver_id').on(table.approverId),
  })
);

export const offerApprovalsRelations = relations(offerApprovals, ({ one }) => ({
  organization: one(organizations, {
    fields: [offerApprovals.orgId],
    references: [organizations.id],
  }),
  offer: one(offers, {
    fields: [offerApprovals.offerId],
    references: [offers.id],
  }),
  approver: one(userProfiles, {
    fields: [offerApprovals.approverId],
    references: [userProfiles.id],
  }),
}));

export type OfferApproval = typeof offerApprovals.$inferSelect;
export type NewOfferApproval = typeof offerApprovals.$inferInsert;

// =====================================================
// PLACEMENT RATES
// =====================================================

export const placementRates = pgTable(
  'placement_rates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    placementId: uuid('placement_id')
      .notNull()
      .references(() => placements.id, { onDelete: 'cascade' }),

    billRate: numeric('bill_rate', { precision: 10, scale: 2 }).notNull(),
    payRate: numeric('pay_rate', { precision: 10, scale: 2 }).notNull(),
    marginPercent: numeric('margin_percent', { precision: 5, scale: 2 }),
    effectiveFrom: date('effective_from').notNull(),
    effectiveTo: date('effective_to'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    placementIdIdx: index('idx_placement_rates_placement_id').on(table.placementId),
  })
);

export const placementRatesRelations = relations(placementRates, ({ one }) => ({
  organization: one(organizations, {
    fields: [placementRates.orgId],
    references: [organizations.id],
  }),
  placement: one(placements, {
    fields: [placementRates.placementId],
    references: [placements.id],
  }),
}));

export type PlacementRate = typeof placementRates.$inferSelect;
export type NewPlacementRate = typeof placementRates.$inferInsert;

// =====================================================
// PLACEMENT EXTENSIONS
// =====================================================

export const placementExtensions = pgTable(
  'placement_extensions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    placementId: uuid('placement_id')
      .notNull()
      .references(() => placements.id, { onDelete: 'cascade' }),

    previousEndDate: date('previous_end_date').notNull(),
    newEndDate: date('new_end_date').notNull(),
    reason: text('reason'),
    approvedBy: uuid('approved_by').references(() => userProfiles.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    placementIdIdx: index('idx_placement_extensions_placement_id').on(table.placementId),
  })
);

export const placementExtensionsRelations = relations(placementExtensions, ({ one }) => ({
  organization: one(organizations, {
    fields: [placementExtensions.orgId],
    references: [organizations.id],
  }),
  placement: one(placements, {
    fields: [placementExtensions.placementId],
    references: [placements.id],
  }),
  approver: one(userProfiles, {
    fields: [placementExtensions.approvedBy],
    references: [userProfiles.id],
  }),
}));

export type PlacementExtension = typeof placementExtensions.$inferSelect;
export type NewPlacementExtension = typeof placementExtensions.$inferInsert;

// =====================================================
// PLACEMENT TIMESHEETS
// =====================================================

export const placementTimesheets = pgTable(
  'placement_timesheets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    placementId: uuid('placement_id')
      .notNull()
      .references(() => placements.id, { onDelete: 'cascade' }),

    weekEnding: date('week_ending').notNull(),
    regularHours: numeric('regular_hours', { precision: 5, scale: 2 }).default('0'),
    overtimeHours: numeric('overtime_hours', { precision: 5, scale: 2 }).default('0'),
    status: text('status').notNull().default('draft'), // draft, submitted, approved, rejected
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    approvedBy: uuid('approved_by').references(() => userProfiles.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    placementIdIdx: index('idx_placement_timesheets_placement_id').on(table.placementId),
    weekEndingIdx: index('idx_placement_timesheets_week_ending').on(table.weekEnding),
  })
);

export const placementTimesheetsRelations = relations(placementTimesheets, ({ one }) => ({
  organization: one(organizations, {
    fields: [placementTimesheets.orgId],
    references: [organizations.id],
  }),
  placement: one(placements, {
    fields: [placementTimesheets.placementId],
    references: [placements.id],
  }),
  approver: one(userProfiles, {
    fields: [placementTimesheets.approvedBy],
    references: [userProfiles.id],
  }),
}));

export type PlacementTimesheet = typeof placementTimesheets.$inferSelect;
export type NewPlacementTimesheet = typeof placementTimesheets.$inferInsert;

// =====================================================
// PLACEMENT MILESTONES
// =====================================================

export const placementMilestones = pgTable(
  'placement_milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    placementId: uuid('placement_id')
      .notNull()
      .references(() => placements.id, { onDelete: 'cascade' }),

    milestoneType: text('milestone_type').notNull(), // day1, week1, day30, day60, day90, end
    dueDate: date('due_date'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    notes: text('notes'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    placementIdIdx: index('idx_placement_milestones_placement_id').on(table.placementId),
    dueDateIdx: index('idx_placement_milestones_due_date').on(table.dueDate),
  })
);

export const placementMilestonesRelations = relations(placementMilestones, ({ one }) => ({
  organization: one(organizations, {
    fields: [placementMilestones.orgId],
    references: [organizations.id],
  }),
  placement: one(placements, {
    fields: [placementMilestones.placementId],
    references: [placements.id],
  }),
}));

export type PlacementMilestone = typeof placementMilestones.$inferSelect;
export type NewPlacementMilestone = typeof placementMilestones.$inferInsert;
