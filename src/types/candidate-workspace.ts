/**
 * Candidate Workspace Types (GW-031)
 *
 * Type definitions for candidate workspace data structures.
 * These types define the shape of data returned by getFullCandidate server action.
 */

import type { WorkspaceWarning, HistoryEntry } from './workspace'

// =============================================================================
// FULL CANDIDATE DATA (returned by getFullCandidate)
// =============================================================================

export interface FullCandidateData {
  candidate: CandidateData
  skills: CandidateSkill[]
  screenings: CandidateScreening[]
  profiles: CandidateProfile[]
  submissions: CandidateSubmission[]
  // Universal tools
  activities: CandidateActivity[]
  notes: CandidateNote[]
  documents: CandidateDocument[]
  history: HistoryEntry[]
  // Computed
  warnings: WorkspaceWarning[]
  stats: CandidateStats
}

// =============================================================================
// CORE CANDIDATE DATA
// =============================================================================

export interface CandidateData {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string | null
  phone: string | null
  mobile: string | null
  title: string | null
  headline: string | null
  // Location
  city: string | null
  state: string | null
  country: string | null
  location: string | null // Computed: "City, State" or "City, Country"
  willingToRelocate: boolean
  // Professional
  currentCompany: string | null
  yearsExperience: number | null
  // Rate/Compensation
  desiredRate: number | null
  desiredSalary: number | null
  rateCurrency: string
  // Work Authorization
  workAuthorization: string | null
  visaStatus: string | null
  visaExpiryDate: string | null
  clearanceLevel: string | null
  // Availability
  availability: string | null
  availableDate: string | null
  noticePeriod: string | null
  // Status
  status: string
  candidateStatus: string | null
  isOnHotlist: boolean
  hotlistAddedAt: string | null
  // Resume
  resumeUrl: string | null
  resumeUpdatedAt: string | null
  // LinkedIn
  linkedinUrl: string | null
  // Source
  source: string | null
  sourceDetails: string | null
  // Timestamps
  createdAt: string
  updatedAt: string | null
  // Related
  owner: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
  company: {
    id: string
    name: string
  } | null
}

// =============================================================================
// CANDIDATE SKILL
// =============================================================================

export interface CandidateSkill {
  id: string
  skillId: string
  skillName: string
  skillCategory: string | null
  proficiencyLevel: number // 1-5
  yearsExperience: number | null
  isPrimary: boolean
  isRequired: boolean
  isVerified: boolean
  verifiedBy: string | null
  verifiedAt: string | null
  source: string | null // 'manual' | 'resume_parsed' | 'linkedin_sync' | 'assessment'
  createdAt: string
}

// Proficiency level labels
export const PROFICIENCY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Beginner', color: 'bg-charcoal-100 text-charcoal-700' },
  2: { label: 'Basic', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Intermediate', color: 'bg-green-100 text-green-700' },
  4: { label: 'Advanced', color: 'bg-purple-100 text-purple-700' },
  5: { label: 'Expert', color: 'bg-gold-100 text-gold-700' },
}

// =============================================================================
// CANDIDATE SCREENING
// =============================================================================

export interface CandidateScreening {
  id: string
  screeningType: string // 'technical' | 'background' | 'phone' | 'general'
  status: string // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  result: string | null // 'pass' | 'fail' | 'conditional' | null
  overallScore: number | null // 0-100
  startedAt: string | null
  completedAt: string | null
  // Job context (if screening was for a specific job)
  job: {
    id: string
    title: string
  } | null
  // Screener
  screener: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
  // Scorecard
  scorecard: ScreeningScorecard | null
  notes: string | null
  createdAt: string
}

export interface ScreeningScorecard {
  categories: ScreeningScoreCategory[]
  overallNotes: string | null
  recommendation: string | null // 'hire' | 'no_hire' | 'consider'
}

export interface ScreeningScoreCategory {
  name: string
  score: number // 0-100
  weight: number // 0-1
  notes: string | null
}

// =============================================================================
// CANDIDATE PROFILE (Marketing Profile)
// =============================================================================

export interface CandidateProfile {
  id: string
  name: string
  templateType: string | null // 'technical' | 'leadership' | 'executive' | 'general'
  content: string | null // JSON or markdown content
  usageCount: number
  lastUsedAt: string | null
  // Creator
  createdBy: {
    id: string
    fullName: string
  } | null
  createdAt: string
  updatedAt: string | null
}

// =============================================================================
// CANDIDATE SUBMISSION (Pipeline)
// =============================================================================

export interface CandidateSubmission {
  id: string
  status: string
  stage: string // Pipeline stage (sourced, screening, submitted, etc.)
  submittedAt: string | null
  updatedAt: string | null
  // Job info
  job: {
    id: string
    title: string
  } | null
  // Account/Client info
  account: {
    id: string
    name: string
  } | null
  // Recruiter
  recruiter: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
  // Rate
  submittedRate: number | null
  billRate: number | null
  // Match
  aiMatchScore: number | null
  recruiterMatchScore: number | null
  // Interviews
  interviews: SubmissionInterview[]
  interviewCount: number
  // Feedback
  feedbackCount: number
  averageRating: number | null
  // Outcome
  outcome: string | null // 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  outcomeReason: string | null
}

export interface SubmissionInterview {
  id: string
  interviewType: string
  scheduledAt: string | null
  status: string
  interviewer: string | null
  rating: number | null
  feedback: string | null
}

// =============================================================================
// UNIVERSAL TOOL TYPES
// =============================================================================

export interface CandidateActivity {
  id: string
  type: string // 'call' | 'email' | 'meeting' | 'note' | 'task' | 'linkedin_message'
  subject: string | null
  description: string | null
  dueDate: string | null
  status: string // 'pending' | 'completed' | 'cancelled'
  priority: string | null
  assignedTo: {
    id: string
    fullName: string
  } | null
  createdAt: string
  completedAt: string | null
}

export interface CandidateNote {
  id: string
  content: string
  isPinned: boolean
  createdAt: string
  createdBy: {
    id: string
    fullName: string
  } | null
}

export interface CandidateDocument {
  id: string
  name: string
  documentType: string // 'resume' | 'certification' | 'portfolio' | 'cover_letter' | 'other'
  fileSize: number
  fileUrl: string
  uploadedAt: string
  uploadedBy: {
    id: string
    fullName: string
  } | null
}

// =============================================================================
// STATS
// =============================================================================

export interface CandidateStats {
  totalSubmissions: number
  activeSubmissions: number
  interviews: number
  offers: number
  placements: number
  screeningsCompleted: number
  profilesCreated: number
  // Computed metrics
  conversionRate: number | null // Submissions that became placements
  averageTimeInPipeline: number | null // Days
}

// =============================================================================
// SECTION TYPE
// =============================================================================

export type CandidateSection =
  | 'summary'
  | 'screening'
  | 'profiles'
  | 'submissions'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'
