/**
 * Zod Validation Schemas: ATS Module
 * Runtime validation for jobs, submissions, interviews, offers, and placements
 */

import { z } from 'zod';

// =====================================================
// SKILLS
// =====================================================

export const createSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(100),
  category: z.enum(['technical', 'soft_skill', 'certification', 'domain', 'language']),
  parentSkillId: z.string().uuid().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateSkillSchema = createSkillSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// CANDIDATE_SKILLS
// =====================================================

export const addCandidateSkillSchema = z.object({
  candidateId: z.string().uuid(),
  skillId: z.string().uuid(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  lastUsedDate: z.coerce.date().optional(),
  isCertified: z.boolean().default(false),
  certificationName: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCandidateSkillSchema = addCandidateSkillSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// JOBS
// =====================================================

export const createJobSchema = z.object({
  // Association
  accountId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),

  // Job details
  title: z.string().min(1, 'Job title is required').max(255),
  description: z.string().optional(),
  jobType: z.enum(['contract', 'contract_to_hire', 'permanent', 'temp']).default('contract'),

  // Requirements
  requiredSkillIds: z.array(z.string().uuid()).optional(),
  experienceYearsMin: z.number().int().min(0).max(50).optional(),
  experienceYearsMax: z.number().int().min(0).max(50).optional(),
  educationLevel: z.enum(['high_school', 'associate', 'bachelor', 'master', 'phd', 'none']).optional(),

  // Location
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  allowedWorkLocations: z.array(z.string()).optional(),

  // Compensation
  billRate: z.number().min(0).optional(),
  payRate: z.number().min(0).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.string().default('USD'),

  // Contract details
  contractDuration: z.number().int().min(1).max(120).optional(),
  extensionPossible: z.boolean().default(false),

  // Positions
  positionsCount: z.number().int().min(1).default(1),

  // Priority
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  targetStartDate: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),

  // Status
  status: z.enum(['draft', 'open', 'on_hold', 'filled', 'cancelled']).default('draft'),

  // Assignment (optional - router will use current user if not provided)
  ownerId: z.string().uuid().optional(),
  recruiterIds: z.array(z.string().uuid()).optional(),
});

export const updateJobSchema = createJobSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// SUBMISSIONS
// =====================================================

export const createSubmissionSchema = z.object({
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),

  // Submission workflow
  status: z.enum([
    'sourced',
    'screening',
    'submitted_to_client',
    'client_review',
    'client_interview',
    'offer_stage',
    'placed',
    'rejected',
    'withdrawn',
  ]).default('sourced'),

  // Submission details
  submittedBy: z.string().uuid().optional(),
  submissionNotes: z.string().optional(),
  clientSubmittedAt: z.coerce.date().optional(),

  // Rates
  candidateBillRate: z.number().min(0).optional(),
  candidatePayRate: z.number().min(0).optional(),

  // AI matching
  aiMatchScore: z.number().min(0).max(100).optional(),
  matchFactors: z.record(z.number()).optional(),

  // Client response
  clientFeedback: z.string().optional(),
  clientRating: z.number().int().min(1).max(5).optional(),

  // Stage tracking
  screeningCompletedAt: z.coerce.date().optional(),
  screeningNotes: z.string().optional(),
});

export const updateSubmissionSchema = createSubmissionSchema.partial().extend({
  id: z.string().uuid(),
});

export const updateSubmissionStatusSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum([
    'sourced',
    'screening',
    'submitted_to_client',
    'client_review',
    'client_interview',
    'offer_stage',
    'placed',
    'rejected',
    'withdrawn',
  ]),
  notes: z.string().optional(),
});

// =====================================================
// INTERVIEWS
// =====================================================

export const createInterviewSchema = z.object({
  submissionId: z.string().uuid(),
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),

  // Interview details
  interviewType: z.enum(['phone_screen', 'technical', 'behavioral', 'panel', 'final', 'client']),
  round: z.number().int().min(1).max(10).default(1),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.number().int().min(15).max(480).default(60),

  // Location
  location: z.string().optional(),
  meetingLink: z.string().url().optional(),

  // Participants
  interviewerNames: z.array(z.string()).optional(),
  interviewerEmails: z.array(z.string().email()).optional(),

  // Status
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).default('scheduled'),
});

export const updateInterviewSchema = createInterviewSchema.partial().extend({
  id: z.string().uuid(),
});

export const completeInterviewSchema = z.object({
  interviewId: z.string().uuid(),
  feedback: z.string().min(1, 'Feedback is required'),
  rating: z.number().int().min(1).max(5),
  technicalRating: z.number().int().min(1).max(5).optional(),
  cultureFitRating: z.number().int().min(1).max(5).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  recommendation: z.enum(['strong_no', 'no', 'maybe', 'yes', 'strong_yes']),
  strengths: z.string().optional(),
  concerns: z.string().optional(),
});

// =====================================================
// OFFERS
// =====================================================

export const createOfferSchema = z.object({
  submissionId: z.string().uuid(),
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),

  // Offer details
  offerType: z.enum(['verbal', 'written']).default('written'),
  status: z.enum(['draft', 'pending_approval', 'sent', 'accepted', 'declined', 'countered', 'expired']).default('draft'),

  // Compensation
  billRate: z.number().min(0).optional(),
  payRate: z.number().min(0).optional(),
  salary: z.number().min(0).optional(),
  bonusAmount: z.number().min(0).optional(),
  equityShares: z.number().int().min(0).optional(),

  // Benefits
  benefits: z.array(z.string()).optional(),
  ptosDays: z.number().min(0).max(365).optional(),

  // Dates
  startDate: z.coerce.date(),
  offerExpiryDate: z.coerce.date().optional(),

  // Documents
  offerLetterFileId: z.string().uuid().optional(),

  // Notes
  internalNotes: z.string().optional(),
  specialTerms: z.string().optional(),
});

export const updateOfferSchema = createOfferSchema.partial().extend({
  id: z.string().uuid(),
});

export const respondToOfferSchema = z.object({
  offerId: z.string().uuid(),
  response: z.enum(['accepted', 'declined', 'countered']),
  responseNotes: z.string().optional(),
  counterOffer: z.object({
    payRate: z.number().min(0).optional(),
    salary: z.number().min(0).optional(),
    startDate: z.coerce.date().optional(),
    counterNotes: z.string().optional(),
  }).optional(),
});

// =====================================================
// PLACEMENTS
// =====================================================

export const createPlacementSchema = z.object({
  submissionId: z.string().uuid(),
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  offerId: z.string().uuid().optional(),

  // Placement details
  status: z.enum(['pending_start', 'active', 'completed', 'terminated']).default('pending_start'),
  placementType: z.enum(['contract', 'contract_to_hire', 'permanent']),

  // Dates
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  actualEndDate: z.coerce.date().optional(),

  // Compensation
  billRate: z.number().min(0),
  payRate: z.number().min(0),
  currency: z.string().default('USD'),

  // Extension tracking
  isExtension: z.boolean().default(false),
  originalPlacementId: z.string().uuid().optional(),
  extensionCount: z.number().int().min(0).default(0),

  // Termination
  terminationReason: z.enum([
    'contract_ended',
    'candidate_resigned',
    'client_terminated',
    'performance_issues',
    'other',
  ]).optional(),
  terminationNotes: z.string().optional(),

  // Documents
  contractFileId: z.string().uuid().optional(),

  // Assignment
  accountManagerId: z.string().uuid().optional(),
});

export const updatePlacementSchema = createPlacementSchema.partial().extend({
  id: z.string().uuid(),
});

export const terminatePlacementSchema = z.object({
  placementId: z.string().uuid(),
  actualEndDate: z.coerce.date(),
  terminationReason: z.enum([
    'contract_ended',
    'candidate_resigned',
    'client_terminated',
    'performance_issues',
    'other',
  ]),
  terminationNotes: z.string(),
  isPermanent: z.boolean().default(false),
});

// =====================================================
// Type Exports
// =====================================================

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;

export type AddCandidateSkillInput = z.infer<typeof addCandidateSkillSchema>;
export type UpdateCandidateSkillInput = z.infer<typeof updateCandidateSkillSchema>;

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
export type UpdateSubmissionStatusInput = z.infer<typeof updateSubmissionStatusSchema>;

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type CompleteInterviewInput = z.infer<typeof completeInterviewSchema>;

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type RespondToOfferInput = z.infer<typeof respondToOfferSchema>;

export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;
export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;
export type TerminatePlacementInput = z.infer<typeof terminatePlacementSchema>;
