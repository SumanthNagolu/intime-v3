/**
 * Aligned Types: ATS Module
 *
 * These types bridge the gap between frontend prototype types and database schema.
 * Use these for all ATS-related data in the production application.
 */

// ============================================
// JOB TYPES
// ============================================

export type JobStatus = 'draft' | 'open' | 'on_hold' | 'filled' | 'cancelled';
export type JobUrgency = 'low' | 'medium' | 'high' | 'urgent';
export type JobType = 'contract' | 'contract_to_hire' | 'permanent' | 'temp';
export type RateType = 'hourly' | 'daily' | 'annual';

export interface AlignedJob {
  id: string;
  orgId: string;
  accountId: string | null;
  dealId: string | null;

  // Core fields
  title: string;
  description: string | null;
  jobType: JobType;
  status: JobStatus;
  urgency: JobUrgency;

  // Location
  location: string | null;
  isRemote: boolean;
  hybridDays: number | null;

  // Compensation
  rateMin: number | null;
  rateMax: number | null;
  rateType: RateType;
  currency: string;

  // Requirements
  requiredSkills: string[];
  niceToHaveSkills: string[];
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  visaRequirements: string[];

  // Positions
  positionsCount: number;
  positionsFilled: number;

  // Dates
  postedDate: Date | null;
  targetFillDate: Date | null;
  filledDate: Date | null;

  // Assignment
  ownerId: string;
  recruiterIds: string[];

  // Client instructions
  clientSubmissionInstructions: string | null;
  clientInterviewProcess: string | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  deletedAt: Date | null;

  // Relations (optional, from joins)
  account?: {
    id: string;
    name: string;
    industry: string | null;
  };
  owner?: {
    id: string;
    fullName: string;
  };
  _count?: {
    submissions: number;
  };
}

// Frontend-compatible job (for display)
export interface DisplayJob {
  id: string;
  accountId: string;
  title: string;
  status: 'open' | 'filled' | 'urgent' | 'hold' | 'draft';
  type: 'Contract' | 'Full-time' | 'C2H';
  rate: string;
  location: string;
  ownerId: string;
  description?: string;
  client: string;
  // Extended fields
  positionsCount: number;
  positionsFilled: number;
  isRemote: boolean;
  requiredSkills: string[];
  createdAt: string;
}

// ============================================
// CANDIDATE TYPES
// ============================================

export type CandidateStatus = 'active' | 'placed' | 'bench' | 'inactive' | 'blacklisted';
export type CandidateAvailability = 'immediate' | '2_weeks' | '1_month';
export type VisaType = 'H1B' | 'GC' | 'USC' | 'OPT' | 'CPT' | 'TN' | 'L1' | 'EAD' | null;

export interface AlignedCandidate {
  id: string;
  orgId: string;

  // Core fields
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;

  // Candidate-specific
  candidateStatus: CandidateStatus | null;
  candidateResumeUrl: string | null;
  candidateSkills: string[];
  candidateExperienceYears: number | null;
  candidateCurrentVisa: VisaType;
  candidateVisaExpiry: Date | null;
  candidateHourlyRate: number | null;
  candidateBenchStartDate: Date | null;
  candidateAvailability: CandidateAvailability | null;
  candidateLocation: string | null;
  candidateWillingToRelocate: boolean;

  // Employee position (if internal)
  employeePosition: string | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isActive: boolean;

  // Relations (optional)
  skills?: AlignedCandidateSkill[];
  submissions?: AlignedSubmission[];
  placements?: AlignedPlacement[];
  benchMetadata?: AlignedBenchMetadata;
}

// Frontend-compatible candidate
export interface DisplayCandidate {
  id: string;
  name: string;
  role: string;
  status: 'new' | 'active' | 'placed' | 'bench' | 'student' | 'alumni' | 'blacklisted';
  type: 'external' | 'internal_bench' | 'student';
  skills: string[];
  experience: string;
  location: string;
  rate: string;
  email: string;
  score: number;
  notes?: string;
  source?: 'Academy' | 'LinkedIn' | 'Referral' | 'Recruiting' | 'Academy Sales';
  ownerId?: string;
  // Extended
  phone?: string;
  resumeUrl?: string;
  visaStatus?: string;
  visaExpiry?: string;
  availability?: string;
  willingToRelocate: boolean;
}

// ============================================
// SUBMISSION TYPES
// ============================================

export type SubmissionStatus =
  | 'sourced'
  | 'screening'
  | 'submission_ready'
  | 'submitted_to_client'
  | 'client_review'
  | 'client_interview'
  | 'offer_stage'
  | 'placed'
  | 'rejected'
  | 'withdrawn';

export interface AlignedSubmission {
  id: string;
  orgId: string;
  jobId: string;
  candidateId: string;
  accountId: string | null;
  ownerId: string;

  // Status
  submissionStatus: SubmissionStatus;

  // Matching
  aiMatchScore: number | null;
  recruiterMatchScore: number | null;
  matchExplanation: string | null;

  // Rates
  submittedRate: number | null;
  submittedRateType: RateType;

  // Notes
  submissionNotes: string | null;
  internalNotes: string | null;

  // Timeline
  submittedAt: Date | null;
  submittedToClientAt: Date | null;
  submittedToClientBy: string | null;

  // Interview tracking
  interviewCount: number;
  lastInterviewDate: Date | null;
  interviewFeedback: string | null;

  // Offer tracking
  offerExtendedAt: Date | null;
  offerAcceptedAt: Date | null;
  offerDeclinedAt: Date | null;
  offerDeclineReason: string | null;

  // Rejection
  rejectedAt: Date | null;
  rejectionReason: string | null;
  rejectionSource: string | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  deletedAt: Date | null;

  // Relations (optional)
  job?: AlignedJob;
  candidate?: AlignedCandidate;
  account?: { id: string; name: string };
  owner?: { id: string; fullName: string };
  interviews?: AlignedInterview[];
  offers?: AlignedOffer[];
}

// Frontend-compatible submission
export interface DisplaySubmission {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'sourced' | 'screening' | 'submission_ready' | 'submitted_to_client' |
          'client_interview' | 'offer' | 'placed' | 'rejected';
  createdAt: string;
  lastActivity: string;
  notes?: string;
  matchScore: number;
  // Extended
  candidateName?: string;
  jobTitle?: string;
  clientName?: string;
  submittedRate?: string;
  interviewCount?: number;
}

// ============================================
// INTERVIEW TYPES
// ============================================

export type InterviewType = 'phone_screen' | 'technical' | 'behavioral' | 'panel' | 'final' | 'client';
export type InterviewStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type InterviewRecommendation = 'strong_no' | 'no' | 'maybe' | 'yes' | 'strong_yes';

export interface AlignedInterview {
  id: string;
  orgId: string;
  submissionId: string;
  jobId: string;
  candidateId: string;

  // Details
  interviewType: InterviewType;
  round: number;
  scheduledTime: Date;
  durationMinutes: number;

  // Location
  location: string | null;
  meetingLink: string | null;

  // Participants
  interviewerNames: string[];
  interviewerEmails: string[];

  // Status
  interviewStatus: InterviewStatus;

  // Feedback (after completion)
  feedback: string | null;
  rating: number | null;
  technicalRating: number | null;
  cultureFitRating: number | null;
  communicationRating: number | null;
  recommendation: InterviewRecommendation | null;
  strengths: string | null;
  concerns: string | null;

  // Cancellation
  cancellationReason: string | null;

  // Audit
  scheduledBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// OFFER TYPES
// ============================================

export type OfferStatus = 'draft' | 'pending_approval' | 'sent' | 'accepted' | 'declined' | 'countered' | 'withdrawn' | 'expired';
export type OfferType = 'verbal' | 'written';

export interface AlignedOffer {
  id: string;
  orgId: string;
  submissionId: string;
  jobId: string;
  candidateId: string;

  // Type & Status
  offerType: OfferType;
  offerStatus: OfferStatus;

  // Compensation
  billRate: number | null;
  payRate: number | null;
  salary: number | null;
  bonusAmount: number | null;
  equityShares: number | null;

  // Benefits
  benefits: string[];
  ptoDays: number | null;

  // Dates
  startDate: Date;
  offerExpiryDate: Date | null;
  sentAt: Date | null;
  acceptedDeclinedAt: Date | null;

  // Response
  responseNotes: string | null;

  // Counter offer
  counterPayRate: number | null;
  counterStartDate: Date | null;
  counterNotes: string | null;

  // Documents
  offerLetterFileId: string | null;

  // Notes
  internalNotes: string | null;
  specialTerms: string | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}

// ============================================
// PLACEMENT TYPES
// ============================================

export type PlacementStatus = 'pending_start' | 'active' | 'extended' | 'completed' | 'terminated';
export type PlacementType = 'contract' | 'contract_to_hire' | 'permanent';
export type TerminationReason = 'contract_ended' | 'candidate_resigned' | 'client_terminated' | 'performance_issues' | 'other';

export interface AlignedPlacement {
  id: string;
  orgId: string;
  submissionId: string;
  jobId: string;
  candidateId: string;
  offerId: string | null;
  accountId: string | null;

  // Details
  placementStatus: PlacementStatus;
  placementType: PlacementType;

  // Dates
  startDate: Date;
  endDate: Date | null;
  actualEndDate: Date | null;

  // Compensation
  billRate: number;
  payRate: number;
  currency: string;

  // Extension tracking
  isExtension: boolean;
  originalPlacementId: string | null;
  extensionCount: number;

  // Termination
  terminationReason: TerminationReason | null;
  terminationNotes: string | null;

  // Documents
  contractFileId: string | null;

  // Assignment
  accountManagerId: string | null;

  // Notes
  internalNotes: string | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}

// ============================================
// SKILL TYPES
// ============================================

export type SkillCategory = 'technical' | 'soft_skill' | 'certification' | 'domain' | 'language';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface AlignedSkill {
  id: string;
  name: string;
  category: SkillCategory;
  parentSkillId: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlignedCandidateSkill {
  id: string;
  candidateId: string;
  skillId: string;
  orgId: string;
  proficiencyLevel: ProficiencyLevel;
  yearsOfExperience: number | null;
  lastUsedDate: Date | null;
  isCertified: boolean;
  certificationName: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relation
  skill?: AlignedSkill;
}

// ============================================
// BENCH METADATA (for Bench module integration)
// ============================================

export type BenchStatus = 'bench' | 'marketing' | 'interview_process' | 'offer_stage';

export interface AlignedBenchMetadata {
  id: string;
  candidateId: string;
  orgId: string;

  benchStatus: BenchStatus;
  benchStartDate: Date;
  daysOnBench: number;

  benchSalesRepId: string | null;
  lastContactedAt: Date | null;
  lastContactMethod: string | null;

  hasActiveImmigrationCase: boolean;
  immigrationCaseId: string | null;

  hotlistSendCount: number;
  lastHotlistSentAt: Date | null;

  alert30DaySent: boolean;
  alert60DaySent: boolean;

  marketingNotes: string | null;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// LIST RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface JobListResponse extends PaginatedResponse<AlignedJob> {}
export interface CandidateListResponse extends PaginatedResponse<AlignedCandidate> {}
export interface SubmissionListResponse extends PaginatedResponse<AlignedSubmission> {}
export interface InterviewListResponse extends PaginatedResponse<AlignedInterview> {}
export interface OfferListResponse extends PaginatedResponse<AlignedOffer> {}
export interface PlacementListResponse extends PaginatedResponse<AlignedPlacement> {}

// ============================================
// METRICS TYPES
// ============================================

export interface JobMetrics {
  submissions: { status: string; count: number }[];
  interviews: number;
  offers: number;
  timeToFill?: number;
}

export interface RecruiterMetrics {
  openJobs: number;
  pendingSubmissions: number;
  interviewsToday: number;
  activePlacements: number;
  placementsThisMonth: number;
  pipelineValue: number;
}
