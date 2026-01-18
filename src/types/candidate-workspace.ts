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
  workHistory: CandidateWorkHistory[]
  education: CandidateEducation[]
  certifications: CandidateCertification[]
  screenings: CandidateScreening[]
  profiles: CandidateProfile[]
  submissions: CandidateSubmission[]
  // Universal tools
  activities: CandidateActivity[]
  notes: CandidateNote[]
  documents: CandidateDocument[]
  resumes: CandidateResume[]
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
  professionalSummary: string | null
  // Location
  city: string | null
  state: string | null
  country: string | null
  location: string | null // Computed: "City, State" or "City, Country"
  willingToRelocate: boolean
  relocationPreferences: string | null
  isRemoteOk: boolean
  // Professional
  currentCompany: string | null
  yearsExperience: number | null
  // Employment Preferences
  employmentTypes: string[] | null
  workModes: string[] | null
  // Rate/Compensation
  rateType: string | null
  desiredRate: number | null
  minimumRate: number | null
  desiredSalary: number | null
  rateCurrency: string
  isNegotiable: boolean | null
  compensationNotes: string | null
  // Work Authorization
  workAuthorization: string | null
  visaStatus: string | null
  visaExpiryDate: string | null
  requiresSponsorship: boolean | null
  currentSponsor: string | null
  isTransferable: boolean | null
  clearanceLevel: string | null
  // Availability
  availability: string | null
  availableDate: string | null
  availableFrom: string | null
  noticePeriod: string | null
  noticePeriodDays: number | null
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
  referredBy: string | null
  campaignId: string | null
  // Tags & Notes
  tags: string[] | null
  internalNotes: string | null
  hotlistNotes: string | null
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
// CANDIDATE WORK HISTORY
// =============================================================================

export interface CandidateWorkHistory {
  id: string
  companyName: string
  jobTitle: string
  employmentType: string | null
  employmentTypeLabel: string | null
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  location: string | null
  locationCity: string | null
  locationState: string | null
  isRemote: boolean
  description: string | null
  achievements: string[]
  createdAt: string
}

// Employment type labels
export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-Time',
  contract: 'Contract',
  part_time: 'Part-Time',
  internship: 'Internship',
  contract_to_hire: 'Contract-to-Hire',
}

// =============================================================================
// CANDIDATE EDUCATION
// =============================================================================

export interface CandidateEducation {
  id: string
  institutionName: string
  degreeType: string | null
  degreeTypeLabel: string | null
  degreeName: string | null
  fieldOfStudy: string | null
  degreeDisplay: string | null // Computed: "Bachelor's in Computer Science"
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  gpa: number | null
  honors: string | null
  createdAt: string
}

// Degree type labels
export const DEGREE_TYPE_LABELS: Record<string, string> = {
  high_school: 'High School / GED',
  associate: "Associate's Degree",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  phd: 'Doctorate / PhD',
  other: 'Other Credential',
}

// =============================================================================
// CANDIDATE CERTIFICATION
// =============================================================================

export interface CandidateCertification {
  id: string
  name: string
  acronym: string | null
  issuingOrganization: string | null
  credentialId: string | null
  credentialUrl: string | null
  issueDate: string | null
  expiryDate: string | null
  isLifetime: boolean
  expiryStatus: 'active' | 'expiring_soon' | 'expired' | 'lifetime'
  createdAt: string
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
// CANDIDATE RESUME (Versioned Resumes)
// =============================================================================

export type ResumeSource = 'uploaded' | 'parsed' | 'manual' | 'ai_generated'

export interface CandidateResume {
  id: string
  // Versioning
  version: number
  isLatest: boolean
  previousVersionId: string | null
  // File info
  filePath: string
  fileName: string
  fileSize: number
  mimeType: string
  bucket: string
  fileUrl: string // Computed from bucket/filePath
  // Metadata
  label: string | null // User-friendly name like "Full Stack Resume"
  targetRole: string | null // Job type this resume is optimized for
  source: ResumeSource
  notes: string | null
  isPrimary: boolean
  // Parsed content (from AI)
  resumeType: string // 'master' | 'tailored' | 'anonymized'
  parsedContent: string | null
  parsedSkills: string[] | null
  parsedExperience: string | null
  aiSummary: string | null
  // Audit
  uploadedAt: string
  uploadedBy: {
    id: string
    fullName: string
    avatarUrl?: string | null
  } | null
  // Archive status
  isArchived: boolean
  // Submission usage - computed from join
  submissionCount: number
  lastUsedAt: string | null
}

// Resume source options for forms
export const RESUME_SOURCE_OPTIONS = [
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'parsed', label: 'Parsed from Upload' },
  { value: 'manual', label: 'Manually Created' },
  { value: 'ai_generated', label: 'AI Generated' },
] as const

// Resume type options for forms
export const RESUME_TYPE_OPTIONS = [
  { value: 'master', label: 'Master Resume' },
  { value: 'tailored', label: 'Tailored Resume' },
  { value: 'anonymized', label: 'Anonymized Resume' },
] as const

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
  | 'resumes'
  | 'documents'
  | 'history'
