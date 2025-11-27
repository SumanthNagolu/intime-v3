/**
 * Aligned Types Index
 *
 * Re-exports all aligned types for easy importing.
 */

// Common types first (includes PaginatedResponse)
export * from './common';

// ATS types (exclude PaginatedResponse duplicate)
export {
  // Database types
  type AlignedJob,
  type AlignedCandidate,
  type AlignedSubmission,
  type AlignedInterview,
  type AlignedOffer,
  type AlignedPlacement,
  // Display types
  type DisplayJob,
  type DisplayCandidate,
  type DisplaySubmission,
  type DisplayInterview,
  type DisplayOffer,
  type DisplayPlacement,
  // Enums
  type JobStatus,
  type JobType,
  type JobUrgency,
  type RateType,
  type CandidateStatus,
  type CandidateAvailability,
  type SubmissionStatus,
  type InterviewStatus,
  type InterviewType,
  type OfferStatus,
  type PlacementStatus,
  // List responses
  type JobListResponse,
  type CandidateListResponse,
  type SubmissionListResponse,
  type InterviewListResponse,
  type OfferListResponse,
  type PlacementListResponse,
} from './ats';

// CRM types (exclude PaginatedResponse duplicate)
export {
  // Database types
  type AlignedAccount,
  type AlignedPointOfContact,
  type AlignedLead,
  type AlignedDeal,
  type AlignedActivityLog,
  // Display types
  type DisplayAccount,
  type DisplayPointOfContact,
  type DisplayLead,
  type DisplayDeal,
  // Enums
  type AccountStatus,
  type AccountType,
  type Responsiveness,
  type PreferredQuality,
  type POCRole,
  type DecisionAuthority,
  type ContactMethod,
  type LeadStatus,
  type LeadSource,
  type DealStage,
  type ActivityType,
  // List responses
  type AccountListResponse,
  type LeadListResponse,
  type DealListResponse,
  type POCListResponse,
  type ActivityListResponse,
} from './crm';
