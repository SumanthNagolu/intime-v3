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
  jobType: z.enum(['contract', 'contract_to_hire', 'permanent', 'temp', 'fulltime']).default('contract'),

  // Requirements - using text array for skills (matching DB schema)
  requiredSkills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  minExperienceYears: z.number().int().min(0).max(50).optional(),
  maxExperienceYears: z.number().int().min(0).max(50).optional(),
  visaRequirements: z.array(z.string()).optional(),

  // Location
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  hybridDays: z.number().int().min(0).max(7).optional(),

  // Compensation (matching DB schema - rate_min, rate_max, rate_type)
  rateMin: z.number().min(0).optional(),
  rateMax: z.number().min(0).optional(),
  rateType: z.enum(['hourly', 'annual']).default('hourly'),
  currency: z.string().default('USD'),

  // Positions
  positionsCount: z.number().int().min(1).default(1),

  // Status and urgency (matching DB schema)
  status: z.enum(['draft', 'open', 'on_hold', 'filled', 'cancelled', 'closed']).default('draft'),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

  // Dates
  postedDate: z.coerce.date().optional(),
  targetFillDate: z.coerce.date().optional(),

  // Client interaction
  clientSubmissionInstructions: z.string().optional(),
  clientInterviewProcess: z.string().optional(),

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

// Complete submission status enum matching the database
export const submissionStatusEnum = z.enum([
  'sourced',
  'screening',
  'vendor_pending',
  'vendor_screening',
  'vendor_accepted',
  'vendor_rejected',
  'submitted_to_client',
  'client_review',
  'client_accepted',
  'client_rejected',
  'client_interview',
  'offer_stage',
  'placed',
  'rejected',
  'withdrawn',
]);

export const createSubmissionSchema = z.object({
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),

  // Submission workflow
  status: submissionStatusEnum.default('sourced'),

  // Submission details
  submittedBy: z.string().uuid().optional(),
  submissionNotes: z.string().optional(),
  clientSubmittedAt: z.coerce.date().optional(),

  // Rates
  candidateBillRate: z.number().min(0).optional(),
  candidatePayRate: z.number().min(0).optional(),
  submittedRate: z.number().min(0).optional(),
  submittedRateType: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']).optional(),

  // AI matching
  aiMatchScore: z.number().min(0).max(100).optional(),
  matchFactors: z.record(z.number()).optional(),

  // Vendor tracking
  vendorSubmittedAt: z.coerce.date().optional(),
  vendorDecision: z.enum(['pending', 'accepted', 'rejected']).optional(),
  vendorDecisionAt: z.coerce.date().optional(),
  vendorNotes: z.string().optional(),
  vendorScreeningNotes: z.string().optional(),
  vendorScreeningCompletedAt: z.coerce.date().optional(),

  // Client response
  clientFeedback: z.string().optional(),
  clientRating: z.number().int().min(1).max(5).optional(),
  clientDecision: z.enum(['pending', 'accepted', 'rejected']).optional(),
  clientDecisionAt: z.coerce.date().optional(),
  clientDecisionNotes: z.string().optional(),

  // Stage tracking
  screeningCompletedAt: z.coerce.date().optional(),
  screeningNotes: z.string().optional(),

  // Rejection
  rejectionReason: z.string().optional(),
  rejectionSource: z.enum(['recruiter', 'vendor', 'client', 'candidate']).optional(),
  rejectedAt: z.coerce.date().optional(),
  rejectedBy: z.string().uuid().optional(),
});

export const updateSubmissionSchema = createSubmissionSchema.partial().extend({
  id: z.string().uuid(),
});

export const updateSubmissionStatusSchema = z.object({
  submissionId: z.string().uuid(),
  status: submissionStatusEnum,
  notes: z.string().optional(),
  // Optional stage-specific data
  vendorDecision: z.enum(['pending', 'accepted', 'rejected']).optional(),
  vendorNotes: z.string().optional(),
  clientDecision: z.enum(['pending', 'accepted', 'rejected']).optional(),
  clientDecisionNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  rejectionSource: z.enum(['recruiter', 'vendor', 'client', 'candidate']).optional(),
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

// =====================================================
// ADDRESSES (Global Multi-Country Support)
// =====================================================

// ISO 3166-1 alpha-2 country codes (primary supported countries)
export const supportedCountries = [
  'US', 'CA', 'GB', 'IN', 'DE', 'AU', 'SG', 'AE', 'NL', 'FR', 'JP', 'BR', 'MX',
] as const;

// Country-specific postal code patterns
const postalCodePatterns: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/, // 12345 or 12345-6789
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, // A1A 1A1
  GB: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/, // SW1A 1AA
  IN: /^\d{6}$/, // 110001
  DE: /^\d{5}$/, // 10115
  AU: /^\d{4}$/, // 2000
  SG: /^\d{6}$/, // 018956
  AE: /^$/, // UAE doesn't use postal codes widely
  NL: /^\d{4}\s?[A-Za-z]{2}$/, // 1011 AB
  FR: /^\d{5}$/, // 75001
  JP: /^\d{3}-?\d{4}$/, // 100-0001
  BR: /^\d{5}-?\d{3}$/, // 01310-100
  MX: /^\d{5}$/, // 06600
};

// Country-aware postal code validator
const validatePostalCode = (postalCode: string | undefined, countryCode: string): boolean => {
  if (!postalCode) return true; // Optional field
  const pattern = postalCodePatterns[countryCode];
  if (!pattern) return true; // Unknown country, accept any
  return pattern.test(postalCode);
};

export const addressTypeEnum = z.enum(['current', 'permanent', 'mailing', 'work', 'billing', 'shipping']);
export const entityTypeEnum = z.enum(['candidate', 'account', 'contact', 'vendor']);

export const baseAddressSchema = z.object({
  entityType: entityTypeEnum,
  entityId: z.string().uuid(),
  addressType: addressTypeEnum,

  // Address lines
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  addressLine3: z.string().max(255).optional(),

  // Location
  city: z.string().max(100).optional(),
  stateProvince: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  countryCode: z.string().length(2).default('US'),
  county: z.string().max(100).optional(),

  // Geo coordinates
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Validation
  isVerified: z.boolean().default(false),
  verifiedAt: z.coerce.date().optional(),
  verifiedBy: z.string().uuid().optional(),
  verificationSource: z.string().optional(),

  // Dates
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),

  // Flags
  isPrimary: z.boolean().default(false),

  // Notes
  notes: z.string().optional(),
});

export const createAddressSchema = baseAddressSchema.refine(
  (data) => validatePostalCode(data.postalCode, data.countryCode),
  { message: 'Invalid postal code format for the selected country', path: ['postalCode'] }
);

export const updateAddressSchema = baseAddressSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// WORK AUTHORIZATIONS (Visa, I-9, EAD Tracking)
// =====================================================

export const authorizationTypeEnum = z.enum([
  'citizen', 'permanent_resident', 'work_permit', 'visa', 'refugee', 'asylum', 'other'
]);

export const visaTypeEnum = z.enum([
  'H1B', 'H1B1', 'H4_EAD', 'L1A', 'L1B', 'L2_EAD', 'O1', 'O3',
  'TN', 'TD', 'E1', 'E2', 'E3', 'F1_OPT', 'F1_CPT', 'F1_STEM_OPT',
  'J1', 'J2', 'B1', 'B2', 'R1', 'K1', 'GC_EAD', 'OTHER'
]);

export const workAuthStatusEnum = z.enum(['active', 'pending', 'expired', 'revoked', 'withdrawn']);
export const eVerifyStatusEnum = z.enum(['pending', 'verified', 'tentative_nonconfirmation', 'final_nonconfirmation', 'case_closed']);

export const createWorkAuthorizationSchema = z.object({
  candidateId: z.string().uuid(),
  authorizationType: authorizationTypeEnum,
  visaType: visaTypeEnum.optional(),
  countryCode: z.string().length(2),
  status: workAuthStatusEnum.default('active'),

  // Dates
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  issueDate: z.coerce.date().optional(),

  // I-9 Compliance
  i9Completed: z.boolean().default(false),
  i9CompletedAt: z.coerce.date().optional(),
  i9Section1CompletedAt: z.coerce.date().optional(),
  i9Section2CompletedAt: z.coerce.date().optional(),
  i9ExpiryDate: z.coerce.date().optional(),
  i9DocumentListA: z.string().optional(),
  i9DocumentListB: z.string().optional(),
  i9DocumentListC: z.string().optional(),

  // E-Verify
  eVerifyStatus: eVerifyStatusEnum.optional(),
  eVerifyCaseNumber: z.string().optional(),
  eVerifyCompletedAt: z.coerce.date().optional(),

  // Visa-specific fields
  visaNumber: z.string().optional(),
  visaSponsor: z.string().optional(),
  petitionNumber: z.string().optional(),
  receiptNumber: z.string().optional(),
  approvalNoticeNumber: z.string().optional(),

  // Transfer/Portability
  isTransferable: z.boolean().default(false),
  transferStatus: z.enum(['not_started', 'in_progress', 'approved', 'denied']).optional(),
  h1bTransferReceiptNumber: z.string().optional(),
  h1bCapExempt: z.boolean().default(false),

  // EAD
  eadCategory: z.string().optional(),
  eadCardNumber: z.string().optional(),
  eadIssueDate: z.coerce.date().optional(),
  eadExpiryDate: z.coerce.date().optional(),

  // Green Card
  gcCategory: z.string().optional(),
  gcPriorityDate: z.coerce.date().optional(),
  gcFilingDate: z.coerce.date().optional(),
  gcStatus: z.enum(['not_started', 'perm_pending', 'perm_approved', 'i140_pending', 'i140_approved', 'i485_pending', 'approved']).optional(),

  // Passport
  passportNumber: z.string().optional(),
  passportCountry: z.string().length(2).optional(),
  passportIssueDate: z.coerce.date().optional(),
  passportExpiryDate: z.coerce.date().optional(),

  // SSN/Tax
  ssnLastFour: z.string().regex(/^\d{4}$/).optional(),
  hasSsn: z.boolean().optional(),
  ssnVerifiedAt: z.coerce.date().optional(),

  // Documents
  documentFileIds: z.array(z.string().uuid()).default([]),

  // Notes
  notes: z.string().optional(),
  sponsorshipRequired: z.boolean().default(false),
  currentSponsorCompany: z.string().optional(),
});

export const updateWorkAuthorizationSchema = createWorkAuthorizationSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// EDUCATION
// =====================================================

export const degreeTypeEnum = z.enum([
  'high_school', 'ged', 'associate', 'bachelor', 'master', 'doctorate', 'professional',
  'certificate', 'diploma', 'bootcamp', 'other'
]);

export const createEducationSchema = z.object({
  candidateId: z.string().uuid(),

  // Institution
  institutionName: z.string().min(1, 'Institution name is required').max(255),
  institutionCity: z.string().max(100).optional(),
  institutionState: z.string().max(100).optional(),
  institutionCountry: z.string().length(2).default('US'),

  // Degree
  degreeType: degreeTypeEnum,
  degreeName: z.string().max(255).optional(),
  fieldOfStudy: z.string().max(255).optional(),
  major: z.string().max(255).optional(),
  minor: z.string().max(255).optional(),
  concentration: z.string().max(255).optional(),

  // Dates
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  expectedGraduation: z.coerce.date().optional(),
  isCurrent: z.boolean().default(false),

  // Achievement
  gpa: z.number().min(0).max(5).optional(),
  gpaScale: z.number().default(4),
  classRank: z.string().optional(),
  honors: z.string().optional(),
  achievements: z.array(z.string()).default([]),

  // Verification
  isVerified: z.boolean().default(false),
  verifiedAt: z.coerce.date().optional(),
  verifiedBy: z.string().uuid().optional(),
  verificationMethod: z.string().optional(),
  diplomaFileId: z.string().uuid().optional(),
  transcriptFileId: z.string().uuid().optional(),

  // Notes
  notes: z.string().optional(),
  verificationNotes: z.string().optional(),
  isHighestDegree: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

export const updateEducationSchema = createEducationSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// WORK HISTORY
// =====================================================

export const employmentTypeEnum = z.enum([
  'full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary', 'self_employed', 'other'
]);

export const employmentReasonLeftEnum = z.enum([
  'career_growth', 'better_opportunity', 'relocation', 'layoff', 'contract_end',
  'company_closure', 'personal', 'return_to_school', 'terminated', 'still_employed', 'other'
]);

export const createWorkHistorySchema = z.object({
  candidateId: z.string().uuid(),

  // Company
  companyName: z.string().min(1, 'Company name is required').max(255),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  companySize: z.string().optional(),
  companyIndustry: z.string().optional(),
  companyCity: z.string().max(100).optional(),
  companyState: z.string().max(100).optional(),
  companyCountry: z.string().length(2).default('US'),

  // Position
  title: z.string().min(1, 'Job title is required').max(255),
  department: z.string().max(255).optional(),
  employmentType: employmentTypeEnum,

  // Dates
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  isCurrent: z.boolean().default(false),

  // Details
  description: z.string().optional(),
  responsibilities: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),

  // Compensation
  salary: z.number().min(0).optional(),
  salaryCurrency: z.string().default('USD'),
  salaryPeriod: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']).optional(),

  // Manager
  supervisorName: z.string().optional(),
  supervisorTitle: z.string().optional(),
  supervisorPhone: z.string().optional(),
  supervisorEmail: z.string().email().optional().or(z.literal('')),
  canContactSupervisor: z.boolean().default(false),

  // Reason for leaving
  reasonForLeaving: employmentReasonLeftEnum.optional(),
  reasonForLeavingNotes: z.string().optional(),

  // Verification
  isVerified: z.boolean().default(false),
  verifiedAt: z.coerce.date().optional(),
  verifiedBy: z.string().uuid().optional(),
  verificationMethod: z.string().optional(),

  // Notes
  notes: z.string().optional(),
});

export const updateWorkHistorySchema = createWorkHistorySchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// CERTIFICATIONS
// =====================================================

export const certificationTypeEnum = z.enum([
  'professional', 'technical', 'vendor', 'government', 'academic', 'industry', 'other'
]);

export const createCertificationSchema = z.object({
  candidateId: z.string().uuid(),

  // Certification details
  name: z.string().min(1, 'Certification name is required').max(255),
  certificationNumber: z.string().optional(),
  type: certificationTypeEnum,
  issuingOrganization: z.string().max(255).optional(),
  issuingCountry: z.string().length(2).default('US'),

  // Dates
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  doesNotExpire: z.boolean().default(false),

  // Status
  status: z.enum(['active', 'expired', 'pending', 'revoked', 'suspended']).default('active'),

  // Verification
  credentialUrl: z.string().url().optional().or(z.literal('')),
  verificationUrl: z.string().url().optional().or(z.literal('')),
  isVerified: z.boolean().default(false),
  verifiedAt: z.coerce.date().optional(),
  verifiedBy: z.string().uuid().optional(),
  certificateFileId: z.string().uuid().optional(),

  // Notes
  notes: z.string().optional(),
  skills: z.array(z.string()).default([]),
});

export const updateCertificationSchema = createCertificationSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// REFERENCES
// =====================================================

export const referenceTypeEnum = z.enum([
  'professional', 'personal', 'academic', 'supervisor', 'peer', 'client', 'other'
]);

export const referenceStatusEnum = z.enum([
  'pending', 'contacted', 'received', 'verified', 'declined', 'unresponsive'
]);

export const createReferenceSchema = z.object({
  candidateId: z.string().uuid(),

  // Reference info
  name: z.string().min(1, 'Reference name is required').max(255),
  title: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  relationship: z.string().max(255).optional(),
  referenceType: referenceTypeEnum,
  yearsKnown: z.number().int().min(0).max(50).optional(),

  // Contact
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'either']).default('email'),

  // Status
  status: referenceStatusEnum.default('pending'),

  // Check details
  checkRequestedAt: z.coerce.date().optional(),
  checkRequestedBy: z.string().uuid().optional(),
  checkCompletedAt: z.coerce.date().optional(),
  checkCompletedBy: z.string().uuid().optional(),

  // Response
  rating: z.number().int().min(1).max(5).optional(),
  wouldRehire: z.boolean().optional(),
  feedback: z.string().optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),

  // Consent
  consentGiven: z.boolean().default(false),
  consentDate: z.coerce.date().optional(),

  // Notes
  notes: z.string().optional(),
});

export const updateReferenceSchema = createReferenceSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// BACKGROUND CHECKS
// =====================================================

export const backgroundCheckTypeEnum = z.enum([
  'criminal', 'employment', 'education', 'credit', 'drug_test', 'driving_record',
  'professional_license', 'identity', 'reference', 'social_media', 'comprehensive'
]);

export const backgroundCheckStatusEnum = z.enum([
  'not_started', 'consent_pending', 'ordered', 'in_progress', 'pending_review',
  'completed', 'failed', 'cancelled', 'expired'
]);

export const backgroundCheckResultEnum = z.enum([
  'clear', 'consider', 'adverse', 'incomplete', 'pending'
]);

export const createBackgroundCheckSchema = z.object({
  candidateId: z.string().uuid(),
  submissionId: z.string().uuid().optional(),
  placementId: z.string().uuid().optional(),

  // Check details
  checkType: backgroundCheckTypeEnum,
  provider: z.string().optional(),
  packageName: z.string().optional(),
  orderId: z.string().optional(),
  externalId: z.string().optional(),

  // Status
  status: backgroundCheckStatusEnum.default('not_started'),
  result: backgroundCheckResultEnum.optional(),

  // Dates
  orderedAt: z.coerce.date().optional(),
  orderedBy: z.string().uuid().optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),

  // Consent
  consentGiven: z.boolean().default(false),
  consentDate: z.coerce.date().optional(),
  consentFileId: z.string().uuid().optional(),

  // Results
  findingsSummary: z.string().optional(),
  findings: z.record(z.any()).optional(),
  reportFileId: z.string().uuid().optional(),

  // Adjudication
  adjudicationStatus: z.enum(['pending', 'approved', 'adverse_action', 'withdrawn']).optional(),
  adjudicatedBy: z.string().uuid().optional(),
  adjudicatedAt: z.coerce.date().optional(),
  adjudicationNotes: z.string().optional(),

  // Adverse action
  adverseActionInitiatedAt: z.coerce.date().optional(),
  adverseActionFinalAt: z.coerce.date().optional(),
  preAdverseLetterSentAt: z.coerce.date().optional(),
  finalAdverseLetterSentAt: z.coerce.date().optional(),

  // Cost
  cost: z.number().min(0).optional(),
  costCurrency: z.string().default('USD'),
  billedToClient: z.boolean().default(false),

  // Notes
  notes: z.string().optional(),
});

export const updateBackgroundCheckSchema = createBackgroundCheckSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// COMPLIANCE DOCUMENTS
// =====================================================

export const complianceDocumentTypeEnum = z.enum([
  'i9', 'w4', 'w9', 'direct_deposit', 'tax_form', 'nda', 'non_compete',
  'employee_handbook', 'drug_test_consent', 'background_check_consent',
  'offer_letter', 'contract', 'onboarding', 'policy', 'training', 'other'
]);

export const complianceDocumentStatusEnum = z.enum([
  'pending', 'submitted', 'approved', 'rejected', 'expired', 'not_applicable'
]);

export const createComplianceDocumentSchema = z.object({
  candidateId: z.string().uuid(),
  placementId: z.string().uuid().optional(),

  // Document details
  documentType: complianceDocumentTypeEnum,
  documentName: z.string().max(255).optional(),
  description: z.string().optional(),
  version: z.string().optional(),

  // Status
  status: complianceDocumentStatusEnum.default('pending'),
  isRequired: z.boolean().default(true),

  // Dates
  dueDate: z.coerce.date().optional(),
  submittedAt: z.coerce.date().optional(),
  submittedBy: z.string().uuid().optional(),
  approvedAt: z.coerce.date().optional(),
  approvedBy: z.string().uuid().optional(),
  rejectedAt: z.coerce.date().optional(),
  rejectedBy: z.string().uuid().optional(),
  expiresAt: z.coerce.date().optional(),

  // Rejection
  rejectionReason: z.string().optional(),

  // File
  fileId: z.string().uuid().optional(),
  fileUrl: z.string().url().optional().or(z.literal('')),

  // Electronic signature
  signedAt: z.coerce.date().optional(),
  signedBy: z.string().uuid().optional(),
  signatureIp: z.string().optional(),
  signatureMethod: z.enum(['electronic', 'physical', 'docusign', 'other']).optional(),

  // Notes
  notes: z.string().optional(),
});

export const updateComplianceDocumentSchema = createComplianceDocumentSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// CANDIDATE PROFILE (Enhanced Update Schema)
// =====================================================

export const updateCandidateProfileSchema = z.object({
  id: z.string().uuid(),

  // Personal Info
  firstName: z.string().min(1).max(255).optional(),
  middleName: z.string().max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  preferredName: z.string().max(255).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),

  // Primary Contact
  email: z.string().email().optional(),
  emailSecondary: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  phoneHome: z.string().optional(),
  phoneWork: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'text']).optional(),
  preferredCallTime: z.string().optional(),
  timezone: z.string().optional(),

  // Do Not Contact
  doNotContact: z.boolean().optional(),
  doNotEmail: z.boolean().optional(),
  doNotText: z.boolean().optional(),

  // Social
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  personalWebsite: z.string().url().optional().or(z.literal('')),

  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactEmail: z.string().email().optional().or(z.literal('')),

  // Professional
  professionalHeadline: z.string().max(500).optional(),
  professionalSummary: z.string().optional(),
  careerObjectives: z.string().optional(),
  candidateSkills: z.array(z.string()).optional(),
  candidateExperienceYears: z.number().int().min(0).max(50).optional(),

  // Candidate Status
  candidateStatus: z.enum(['active', 'placed', 'bench', 'inactive', 'blacklisted']).optional(),
  candidateAvailability: z.enum(['immediate', '2_weeks', '1_month']).optional(),
  candidateWillingToRelocate: z.boolean().optional(),
  currentEmploymentStatus: z.enum(['employed', 'unemployed', 'student', 'freelance']).optional(),
  noticePeriodDays: z.number().int().min(0).max(365).optional(),
  earliestStartDate: z.coerce.date().optional(),
  preferredEmploymentType: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  relocationAssistanceRequired: z.boolean().optional(),
  relocationNotes: z.string().optional(),

  // Compensation
  candidateHourlyRate: z.number().min(0).optional(),
  minimumHourlyRate: z.number().min(0).optional(),
  desiredSalaryAnnual: z.number().min(0).optional(),
  minimumAnnualSalary: z.number().min(0).optional(),
  desiredSalaryCurrency: z.string().optional(),
  benefitsRequired: z.array(z.string()).optional(),
  compensationNotes: z.string().optional(),

  // Source/Marketing
  leadSource: z.string().optional(),
  leadSourceDetail: z.string().optional(),
  marketingStatus: z.enum(['active', 'passive', 'do_not_contact']).optional(),
  isOnHotlist: z.boolean().optional(),
  hotlistNotes: z.string().optional(),

  // Languages
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.string(),
  })).optional(),

  // Rating
  recruiterRating: z.number().int().min(1).max(5).optional(),
  recruiterRatingNotes: z.string().optional(),

  // Tags
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),

  // Resume
  candidateResumeUrl: z.string().url().optional().or(z.literal('')),
});

// =====================================================
// NEW Type Exports
// =====================================================

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export type CreateWorkAuthorizationInput = z.infer<typeof createWorkAuthorizationSchema>;
export type UpdateWorkAuthorizationInput = z.infer<typeof updateWorkAuthorizationSchema>;

export type CreateEducationInput = z.infer<typeof createEducationSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;

export type CreateWorkHistoryInput = z.infer<typeof createWorkHistorySchema>;
export type UpdateWorkHistoryInput = z.infer<typeof updateWorkHistorySchema>;

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;

export type CreateReferenceInput = z.infer<typeof createReferenceSchema>;
export type UpdateReferenceInput = z.infer<typeof updateReferenceSchema>;

export type CreateBackgroundCheckInput = z.infer<typeof createBackgroundCheckSchema>;
export type UpdateBackgroundCheckInput = z.infer<typeof updateBackgroundCheckSchema>;

export type CreateComplianceDocumentInput = z.infer<typeof createComplianceDocumentSchema>;
export type UpdateComplianceDocumentInput = z.infer<typeof updateComplianceDocumentSchema>;

export type UpdateCandidateProfileInput = z.infer<typeof updateCandidateProfileSchema>;
