import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import { checkBlockingActivities } from '@/lib/utils/activity-system'
import { historyService } from '@/lib/services'


// ============================================
// JOB LIFECYCLE ZOD SCHEMAS
// ============================================

const jobStatusEnum = z.enum(['draft', 'open', 'active', 'on_hold', 'filled', 'cancelled'])
const jobTypeEnum = z.enum(['contract', 'permanent', 'contract_to_hire', 'temp', 'sow'])
const rateTypeEnum = z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual'])
const priorityEnum = z.enum(['low', 'normal', 'high', 'urgent', 'critical'])
const urgencyEnum = z.enum(['low', 'medium', 'high', 'critical'])

const createJobInput = z.object({
  title: z.string().min(3).max(200),
  accountId: z.string().uuid(),
  dealId: z.string().uuid().optional(),
  jobType: jobTypeEnum.default('contract'),
  location: z.string().max(200).optional(),
  // Structured location fields for centralized addresses
  locationCity: z.string().max(100).optional(),
  locationState: z.string().max(100).optional(),
  locationCountry: z.string().max(3).default('US').optional(),
  isRemote: z.boolean().default(false),
  isHybrid: z.boolean().default(false),
  hybridDays: z.number().int().min(1).max(5).optional(),
  requiredSkills: z.array(z.string()).max(20).optional(),
  niceToHaveSkills: z.array(z.string()).max(20).optional(),
  minExperience: z.number().int().min(0).max(50).optional(),
  maxExperience: z.number().int().min(0).max(50).optional(),
  minExperienceYears: z.number().int().min(0).max(50).optional(),
  maxExperienceYears: z.number().int().min(0).max(50).optional(),
  visaRequirements: z.array(z.string()).optional(),
  description: z.string().max(5000).optional(),
  rateMin: z.number().positive().optional(),
  rateMax: z.number().positive().optional(),
  rateType: rateTypeEnum.default('hourly'),
  currency: z.string().default('USD'),
  positionsCount: z.number().int().min(1).max(100).default(1),
  priority: priorityEnum.default('normal'),
  urgency: urgencyEnum.default('medium'),
  targetFillDate: z.string().optional(),
  targetStartDate: z.string().optional(),
  targetEndDate: z.string().optional(),
  clientSubmissionInstructions: z.string().optional(),
  // JOBS-01: Unified company/contact references
  clientCompanyId: z.string().uuid().optional(),
  endClientCompanyId: z.string().uuid().optional(),
  vendorCompanyId: z.string().uuid().optional(),
  hiringManagerContactId: z.string().uuid().optional(),
  hrContactId: z.string().uuid().optional(),
  externalJobId: z.string().max(100).optional(),
  priorityRank: z.number().int().min(0).max(10).optional(),
  slaDays: z.number().int().min(1).max(365).default(30),
  feeType: z.enum(['percentage', 'flat', 'hourly_spread']).default('percentage'),
  feePercentage: z.number().min(0).max(100).optional(),
  feeFlatAmount: z.number().min(0).optional(),
  clientInterviewProcess: z.string().optional(),
  // Extended intake data from Job Intake Wizard (C07)
  intakeData: z.object({
    intakeMethod: z.string().optional(),
    hiringManagerId: z.string().uuid().optional(),
    targetStartDate: z.string().optional(),
    targetEndDate: z.string().optional(),
    experienceLevel: z.string().optional(),
    requiredSkillsDetailed: z.array(z.object({
      name: z.string(),
      years: z.string(),
      proficiency: z.enum(['beginner', 'proficient', 'expert']),
    })).optional(),
    preferredSkills: z.array(z.string()).optional(),
    education: z.string().optional(),
    certifications: z.array(z.string()).optional(), // Changed to array for multiple certifications
    industries: z.array(z.string()).optional(),
    roleOpenReason: z.string().optional(),
    teamName: z.string().optional(),
    teamSize: z.string().optional(),  // Stored as string like "4-6" to match dropdown values
    reportsTo: z.string().optional(),
    directReports: z.string().optional(),  // Stored as string like "1-2" to match dropdown values
    keyProjects: z.string().optional(),
    successMetrics: z.string().optional(),
    workArrangement: z.string().optional(),
    hybridDays: z.number().optional(),
    locationRestrictions: z.array(z.string()).optional(),
    // Full address for job location
    locationAddressLine1: z.string().optional(),
    locationAddressLine2: z.string().optional(),
    locationCity: z.string().optional(),
    locationState: z.string().optional(),
    locationPostalCode: z.string().optional(),
    locationCountry: z.string().optional(),
    workAuthorizations: z.array(z.string()).optional(),
    payRateMin: z.number().optional(),
    payRateMax: z.number().optional(),
    conversionSalaryMin: z.number().optional(),
    conversionSalaryMax: z.number().optional(),
    conversionFee: z.number().optional(),
    benefits: z.array(z.string()).optional(),
    weeklyHours: z.number().optional(),
    overtimeExpected: z.string().optional(),
    onCallRequired: z.boolean().optional(),
    onCallSchedule: z.string().optional(),
    interviewRounds: z.array(z.object({
      name: z.string(),
      format: z.string(),
      duration: z.number(),
      interviewer: z.string(),
      focus: z.string(),
    })).optional(),
    decisionDays: z.string().optional(),
    submissionRequirements: z.array(z.string()).optional(),
    submissionFormat: z.string().optional(),
    submissionNotes: z.string().optional(),
    candidatesPerWeek: z.string().optional(),
    feedbackTurnaround: z.number().optional(),
    screeningQuestions: z.string().optional(),
  }).optional(),
  // Draft support fields
  status: jobStatusEnum.optional(), // Allow setting status on create (defaults to 'draft')
  wizard_state: z.object({
    currentStep: z.number().int().min(1),
    totalSteps: z.number().int().min(1),
    lastSavedAt: z.string(),
    formData: z.unknown().optional(), // Store form data for draft restoration
  }).optional().nullable(),
})

const updateJobInput = z.object({
  id: z.string().uuid(),
  status: jobStatusEnum.optional(), // For finalizing drafts
  title: z.string().max(200).optional(), // No min for drafts
  jobType: jobTypeEnum.optional(),
  location: z.string().max(200).optional(),
  // Structured location fields
  locationCity: z.string().max(100).optional().nullable(),
  locationState: z.string().max(100).optional().nullable(),
  locationCountry: z.string().max(3).optional().nullable(),
  isRemote: z.boolean().optional(),
  isHybrid: z.boolean().optional(),
  hybridDays: z.number().int().min(1).max(5).optional().nullable(),
  requiredSkills: z.array(z.string()).max(20).optional(), // No min for drafts
  niceToHaveSkills: z.array(z.string()).max(20).optional(),
  minExperienceYears: z.number().int().min(0).max(50).optional().nullable(),
  maxExperienceYears: z.number().int().min(0).max(50).optional().nullable(),
  visaRequirements: z.array(z.string()).optional(),
  description: z.string().max(5000).optional(),
  rateMin: z.number().positive().optional(),
  rateMax: z.number().positive().optional(),
  rateType: rateTypeEnum.optional(),
  currency: z.string().optional(),
  positionsCount: z.number().int().min(1).max(100).optional(),
  priority: priorityEnum.optional(),
  urgency: urgencyEnum.optional(),
  targetFillDate: z.string().optional().nullable(),
  targetStartDate: z.string().optional().nullable(),
  targetEndDate: z.string().optional().nullable(),
  clientSubmissionInstructions: z.string().optional(),
  clientInterviewProcess: z.string().optional(),
  // Hiring team fields
  ownerId: z.string().uuid().optional().nullable(),
  recruiterIds: z.array(z.string().uuid()).optional(),
  hiringManagerContactId: z.string().uuid().optional().nullable(),
  hrContactId: z.string().uuid().optional().nullable(),
  // Client/Company fields
  accountId: z.string().uuid().optional().nullable(), // Primary account (company_id)
  clientCompanyId: z.string().uuid().optional().nullable(),
  endClientCompanyId: z.string().uuid().optional().nullable(),
  vendorCompanyId: z.string().uuid().optional().nullable(),
  externalJobId: z.string().max(100).optional().nullable(),
  // Fee structure fields
  feeType: z.enum(['percentage', 'flat', 'hourly_spread']).optional().nullable(),
  feePercentage: z.number().min(0).max(100).optional().nullable(),
  feeFlatAmount: z.number().positive().optional().nullable(),
  // Priority and SLA
  priorityRank: z.number().int().min(0).max(10).optional().nullable(),
  slaDays: z.number().int().min(1).max(365).optional().nullable(),
  // Requirements (text fields) for collapsible sections
  required_skills: z.string().max(2000).optional(),
  preferred_skills: z.string().max(2000).optional(),
  experience_level: z.string().max(1000).optional(),
  education: z.string().max(1000).optional(),
  certifications: z.string().max(1000).optional(),
  // Extended intake data (for full edit from wizard) - permissive for draft saving
  intakeData: z.record(z.unknown()).optional(),
  // Draft support - wizard state for tracking progress
  wizard_state: z.object({
    currentStep: z.number().int().min(1),
    totalSteps: z.number().int().min(1),
    lastSavedAt: z.string(),
    formData: z.unknown().optional(), // Store form data for draft restoration
  }).optional().nullable(),
})

const publishJobInput = z.object({
  jobId: z.string().uuid(),
  publishingNote: z.string().max(500).optional(),
})

const updateJobStatusInput = z.object({
  jobId: z.string().uuid(),
  newStatus: jobStatusEnum,
  reason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  expectedReactivationDate: z.string().optional(),
})

const closeJobInput = z.object({
  jobId: z.string().uuid(),
  closureReason: z.enum(['filled', 'cancelled', 'on_hold', 'client_cancelled', 'budget_cut', 'position_eliminated', 'other']),
  closureNote: z.string().max(2000).optional(),
  submissionAction: z.enum(['withdraw', 'transfer', 'keep']).default('withdraw'),
  transferToJobId: z.string().uuid().optional(),
  notifyCandidates: z.boolean().default(false),
})

// Valid status transitions matrix for Jobs
const validTransitions: Record<string, string[]> = {
  draft: ['open', 'cancelled'],
  open: ['active', 'on_hold', 'cancelled', 'filled'],
  active: ['on_hold', 'filled', 'cancelled'],
  on_hold: ['open', 'active', 'cancelled'],
  filled: ['open'], // Reopen requires approval
  cancelled: ['open'], // Reopen requires approval
}

// Valid status transitions for Submissions (F01-F02)
export const SUBMISSION_STATUS_TRANSITIONS: Record<string, string[]> = {
  'sourced': ['screening', 'withdrawn'],
  'screening': ['submission_ready', 'rejected', 'withdrawn'],
  'submission_ready': ['submitted_to_client', 'screening', 'withdrawn'],
  'submitted_to_client': ['client_review', 'rejected', 'withdrawn'],
  'client_review': ['client_interview', 'rejected', 'withdrawn'],
  'client_interview': ['offer_stage', 'rejected', 'withdrawn'],
  'offer_stage': ['placed', 'rejected', 'withdrawn'],
  'placed': [], // Terminal state
  'rejected': ['sourced'], // Allow re-submission
  'withdrawn': [], // Terminal state
}

// Helper function to validate submission status transitions
export function isValidSubmissionTransition(fromStatus: string, toStatus: string): boolean {
  const allowed = SUBMISSION_STATUS_TRANSITIONS[fromStatus] || []
  return allowed.includes(toStatus) || fromStatus === toStatus
}

// ============================================
// OFFER ZOD SCHEMAS (G01-G02)
// ============================================

const offerStatusEnum = z.enum(['draft', 'sent', 'pending_response', 'accepted', 'declined', 'withdrawn', 'expired', 'negotiating'])
const offerEmploymentTypeEnum = z.enum(['w2', 'c2c', '1099'])
const offerRateTypeEnum = z.enum(['hourly', 'daily', 'weekly', 'monthly'])
const offerWorkLocationEnum = z.enum(['remote', 'onsite', 'hybrid'])

const createOfferInput = z.object({
  submissionId: z.string().uuid(),
  // Rates
  payRate: z.number().positive('Pay rate must be positive'),
  billRate: z.number().positive('Bill rate must be positive'),
  rateType: offerRateTypeEnum.default('hourly'),
  overtimeRate: z.number().positive().optional(),
  // Dates
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string().optional(),
  durationMonths: z.number().int().min(1).max(60).optional(),
  expiresAt: z.string().optional(), // ISO timestamp
  // Employment
  employmentType: offerEmploymentTypeEnum.default('w2'),
  // Benefits (W2 only)
  ptoDays: z.number().int().min(0).max(30).optional(),
  sickDays: z.number().int().min(0).max(30).optional(),
  healthInsurance: z.boolean().optional(),
  has401k: z.boolean().optional(),
  // Work Details
  workLocation: offerWorkLocationEnum.default('remote'),
  standardHoursPerWeek: z.number().int().min(10).max(60).default(40),
  // Notes
  internalNotes: z.string().max(2000).optional(),
})

const sendOfferInput = z.object({
  offerId: z.string().uuid(),
  personalNote: z.string().max(1000).optional(),
  expiresAt: z.string().optional(), // Override expiration
  notifyHiringManager: z.boolean().default(true),
  notifyPodManager: z.boolean().default(true),
})

const updateOfferStatusInput = z.object({
  offerId: z.string().uuid(),
  newStatus: offerStatusEnum,
  reason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  // For acceptance
  confirmedStartDate: z.string().optional(),
})

const negotiateOfferInput = z.object({
  offerId: z.string().uuid(),
  initiatedBy: z.enum(['candidate', 'client', 'recruiter']),
  proposedPayRate: z.number().positive().optional(),
  proposedBillRate: z.number().positive().optional(),
  proposedStartDate: z.string().optional(),
  proposedPtoDays: z.number().int().optional(),
  counterMessage: z.string().max(2000),
})

const requestApprovalInput = z.object({
  offerId: z.string().uuid(),
  approvalType: z.enum(['rate_change', 'terms_change', 'low_margin', 'extension']),
  approverId: z.string().uuid(),
  requestNotes: z.string().max(2000),
  proposedChanges: z.record(z.unknown()).optional(),
})

// ============================================
// PLACEMENT ZOD SCHEMAS (G03-G04)
// ============================================

const placementHealthEnum = z.enum(['healthy', 'at_risk', 'critical'])

const createPlacementInput = z.object({
  offerId: z.string().uuid(),
  // Confirm start details
  confirmedStartDate: z.string(), // YYYY-MM-DD
  confirmedEndDate: z.string().optional(),
  workSchedule: z.string().max(100).optional(), // "Mon-Fri 9-5"
  timezone: z.string().default('America/New_York'),
  // First day logistics
  onboardingFormat: z.enum(['virtual', 'in_person', 'hybrid']).default('virtual'),
  firstDayMeetingLink: z.string().url().optional(),
  firstDayLocation: z.string().max(200).optional(),
  // Contacts
  hiringManagerName: z.string().max(100),
  hiringManagerEmail: z.string().email(),
  hiringManagerPhone: z.string().max(20).optional(),
  hrContactName: z.string().max(100).optional(),
  hrContactEmail: z.string().email().optional(),
  // Paperwork status
  paperworkComplete: z.boolean().default(false),
  backgroundCheckStatus: z.enum(['pending', 'passed', 'failed', 'waived']).optional(),
  i9Complete: z.boolean().optional(),
  ndaSigned: z.boolean().optional(),
  // Equipment
  equipmentOrdered: z.boolean().optional(),
  equipmentNotes: z.string().max(500).optional(),
  // Notes
  internalNotes: z.string().max(2000).optional(),
})

const recordCheckInInput = z.object({
  placementId: z.string().uuid(),
  checkinType: z.enum(['7_day', '30_day', '60_day', '90_day', 'ad_hoc']),
  checkinDate: z.string(), // YYYY-MM-DD
  // Candidate feedback
  candidateContactMethod: z.enum(['phone', 'video', 'in_person', 'email']).optional(),
  candidateResponseStatus: z.enum(['completed', 'scheduled', 'left_message', 'no_response']),
  candidateOverallSatisfaction: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  candidateRoleSatisfaction: z.enum(['very_satisfied', 'satisfied', 'neutral', 'unsatisfied']).optional(),
  candidateTeamRelationship: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  candidateWorkload: z.enum(['just_right', 'a_bit_much', 'too_much', 'too_little']).optional(),
  candidatePaymentStatus: z.enum(['no_issues', 'minor_delay', 'major_issue']).optional(),
  candidateExtensionInterest: z.enum(['definitely_interested', 'probably_interested', 'unsure', 'not_interested', 'too_early']).optional(),
  candidateSentiment: z.enum(['very_positive', 'positive', 'neutral', 'negative']).optional(),
  candidateConcerns: z.string().max(2000).optional(),
  candidateNotes: z.string().max(2000).optional(),
  // Client feedback
  clientContactMethod: z.enum(['phone', 'video', 'in_person', 'email']).optional(),
  clientContactId: z.string().uuid().optional(),
  clientPerformanceRating: z.enum(['exceeds', 'meets', 'below', 'not_meeting']).optional(),
  clientTeamIntegration: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  clientWorkQuality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  clientCommunication: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  clientExtensionInterest: z.enum(['definitely', 'probably', 'unsure', 'probably_not']).optional(),
  clientSatisfaction: z.enum(['very_satisfied', 'satisfied', 'neutral', 'unsatisfied']).optional(),
  clientConcerns: z.string().max(2000).optional(),
  clientNotes: z.string().max(2000).optional(),
  // Assessment
  overallHealth: placementHealthEnum,
  riskFactors: z.array(z.string()).optional(),
  actionItems: z.array(z.object({
    title: z.string().max(200),
    dueDate: z.string().optional(),
    assignedTo: z.string().uuid().optional(),
  })).optional(),
  // Follow-up
  nextCheckinDate: z.string().optional(),
  followUpRequired: z.enum(['none', 'scheduled', 'escalate']).default('none'),
  escalateTo: z.string().uuid().optional(),
})

const extendPlacementInput = z.object({
  placementId: z.string().uuid(),
  newEndDate: z.string(), // YYYY-MM-DD
  newPayRate: z.number().positive().optional(),
  newBillRate: z.number().positive().optional(),
  extensionReason: z.string().max(500).optional(),
  clientApproval: z.boolean().optional(),
  clientApprovalDate: z.string().optional(),
  clientApprovalBy: z.string().max(100).optional(),
  internalNotes: z.string().max(2000).optional(),
})

// ============================================
// CANDIDATE ZOD SCHEMAS (E01-E05)
// ============================================

const candidateStatusEnum = z.enum(['draft', 'active', 'sourced', 'screening', 'bench', 'placed', 'inactive', 'archived'])
const visaStatusEnum = z.enum(['us_citizen', 'green_card', 'h1b', 'l1', 'tn', 'opt', 'cpt', 'ead', 'other'])
const availabilityEnum = z.enum(['immediate', '2_weeks', '30_days', '60_days', 'not_available', '1_month', '90_days'])
const leadSourceEnum = z.enum(['linkedin', 'indeed', 'dice', 'monster', 'referral', 'direct', 'agency', 'job_board', 'website', 'event', 'other'])
const employmentTypeEnum = z.enum(['full_time', 'contract', 'contract_to_hire', 'part_time'])
const workModeEnum = z.enum(['on_site', 'remote', 'hybrid'])
const candidateRateTypeEnum = z.enum(['hourly', 'annual', 'per_diem'])
const candidateCurrencyEnum = z.enum(['USD', 'CAD', 'EUR', 'GBP', 'INR'])
const proficiencyEnum = z.enum(['beginner', 'intermediate', 'advanced', 'expert'])
const degreeTypeEnum = z.enum(['high_school', 'associate', 'bachelor', 'master', 'phd', 'other'])
const workHistoryEmploymentTypeEnum = z.enum(['full_time', 'contract', 'part_time', 'internship'])

// Skill entry with full metadata
const skillEntrySchema = z.object({
  name: z.string().min(1).max(100),
  proficiency: proficiencyEnum.default('intermediate'),
  yearsOfExperience: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return undefined
      const num = typeof val === 'number' ? val : Number(val)
      if (isNaN(num)) return undefined
      // Cap at 50 years
      return Math.min(Math.max(0, num), 50)
    },
    z.number().min(0).max(50).optional()
  ),
  isPrimary: z.boolean().default(false),
  isCertified: z.boolean().default(false),
  lastUsed: z.string().max(20).optional(),
})

// Work history entry
const workHistoryEntrySchema = z.object({
  companyName: z.string().min(1).max(200),
  jobTitle: z.string().min(1).max(200),
  employmentType: workHistoryEmploymentTypeEnum.optional(),
  startDate: z.string(), // YYYY-MM format
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  locationCity: z.string().max(100).optional(),
  locationState: z.string().max(100).optional(),
  locationCountry: z.string().max(100).optional(),
  isRemote: z.boolean().default(false),
  description: z.string().max(2000).optional(),
  responsibilities: z.array(z.string().max(500)).max(20).default([]),
  achievements: z.array(z.string().max(500)).max(10).default([]),
  skillsUsed: z.array(z.string().max(100)).max(30).default([]),
  toolsUsed: z.array(z.string().max(100)).max(30).default([]),
  notes: z.string().max(2000).optional(), // Internal notes
})

// Education entry
const educationEntrySchema = z.object({
  institutionName: z.string().min(1).max(200),
  degreeType: degreeTypeEnum.optional(),
  degreeName: z.string().max(200).optional(),
  fieldOfStudy: z.string().max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  gpa: z.number().min(0).max(5).optional(),
  honors: z.string().max(200).optional(),
  locationCity: z.string().max(100).optional(),
  locationState: z.string().max(100).optional(),
  locationCountry: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(), // Internal notes
})

// Helper to normalize URLs (add https:// if missing protocol)
const normalizeUrl = (val: unknown): string | null | undefined => {
  if (val === '' || val === null || val === undefined) return undefined
  const str = String(val).trim()
  if (!str) return undefined
  // If it looks like a URL but missing protocol, add https://
  if (str && !str.startsWith('http://') && !str.startsWith('https://')) {
    return `https://${str}`
  }
  return str
}

// Certification entry
const certificationEntrySchema = z.object({
  name: z.string().min(1).max(200),
  acronym: z.string().max(20).optional(),
  issuingOrganization: z.string().max(200).optional(),
  credentialId: z.string().max(100).optional(),
  credentialUrl: z.preprocess(normalizeUrl, z.string().url().optional()),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  isLifetime: z.boolean().default(false),
})

const createCandidateInput = z.object({
  // Personal
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email().max(100),
  phone: z.string().max(20).optional(),
  mobile: z.string().max(20).optional(),
  linkedinUrl: z.preprocess(normalizeUrl, z.string().url().optional().nullable()),

  // Professional
  professionalHeadline: z.string().max(200).optional(),
  professionalSummary: z.string().max(2000).optional(),
  experienceYears: z.number().int().min(0).max(50),

  // Employment preferences
  employmentTypes: z.array(employmentTypeEnum).default(['full_time', 'contract']),
  workModes: z.array(workModeEnum).default(['on_site', 'remote']),

  // Skills with full metadata
  skills: z.array(skillEntrySchema).min(1).max(50),

  // Work history
  workHistory: z.array(workHistoryEntrySchema).max(20).default([]),

  // Education
  education: z.array(educationEntrySchema).max(10).default([]),

  // Certifications
  certifications: z.array(certificationEntrySchema).max(20).default([]),

  // Work Authorization
  visaStatus: visaStatusEnum,
  visaExpiryDate: z.coerce.date().optional(),
  requiresSponsorship: z.boolean().default(false),
  currentSponsor: z.string().max(200).optional(),
  isTransferable: z.boolean().optional(),

  // Availability
  availability: availabilityEnum,
  availableFrom: z.string().optional(), // ISO date string
  noticePeriodDays: z.number().int().min(0).max(365).optional(),
  location: z.string().min(2).max(200),
  // Structured location fields for centralized addresses
  locationCity: z.string().max(100).optional(),
  locationState: z.string().max(100).optional(),
  locationCountry: z.string().max(3).default('US').optional(),
  willingToRelocate: z.boolean().default(false),
  relocationPreferences: z.string().max(500).optional(),
  isRemoteOk: z.boolean().default(false),

  // Compensation
  rateType: candidateRateTypeEnum.default('hourly'),
  minimumRate: z.number().min(0).optional(),
  desiredRate: z.number().min(0).optional(),
  currency: candidateCurrencyEnum.default('USD'),
  isNegotiable: z.boolean().default(true),
  compensationNotes: z.string().max(1000).optional(),

  // Source
  leadSource: leadSourceEnum,
  sourceDetails: z.string().max(500).optional(),
  referredBy: z.string().max(200).optional(),
  campaignId: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().uuid().optional()
  ),

  // Optional
  tags: z.array(z.string()).max(20).optional(),
  isOnHotlist: z.boolean().default(false),
  hotlistNotes: z.string().max(500).optional(),
  internalNotes: z.string().max(2000).optional(),

  // Job association
  associatedJobIds: z.array(z.string().uuid()).optional(),

  // Resume parsing data (optional - populated when created from parsed resume)
  resumeData: z.object({
    storagePath: z.string(), // Path in Supabase storage
    fileName: z.string(),
    fileSize: z.number(),
    mimeType: z.string().default('application/pdf'),
    parsedContent: z.string().optional(), // Raw text from resume
    parsedSkills: z.array(z.string()).optional(), // Skills extracted from resume
    parsedExperience: z.string().optional(), // Experience summary
    aiSummary: z.string().optional(), // AI-generated summary
    parsingConfidence: z.number().min(0).max(100).optional(), // Parsing confidence score
  }).optional(),
})

const updateCandidateInput = z.object({
  candidateId: z.string().uuid(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  mobile: z.string().max(20).optional().nullable(),
  linkedinUrl: z.preprocess(normalizeUrl, z.string().url().optional().nullable()),
  professionalHeadline: z.string().max(200).optional().nullable(),
  professionalSummary: z.string().max(2000).optional().nullable(),
  currentCompany: z.string().max(200).optional().nullable(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  // Skills with full metadata (same as create)
  skills: z.array(skillEntrySchema).max(50).optional(),
  // Work history (same as create)
  workHistory: z.array(workHistoryEntrySchema).max(20).optional(),
  // Education (same as create)
  education: z.array(educationEntrySchema).max(10).optional(),
  // Certifications (same as create)
  certifications: z.array(certificationEntrySchema).max(20).optional(),
  // Employment preferences
  employmentTypes: z.array(z.enum(['full_time', 'contract', 'contract_to_hire', 'part_time'])).optional(),
  workModes: z.array(z.enum(['on_site', 'remote', 'hybrid'])).optional(),
  // Work authorization
  visaStatus: visaStatusEnum.optional(),
  visaExpiryDate: z.coerce.date().optional().nullable(),
  workAuthorization: z.string().max(100).optional().nullable(),
  requiresSponsorship: z.boolean().optional(),
  currentSponsor: z.string().max(200).optional().nullable(),
  isTransferable: z.boolean().optional().nullable(),
  clearanceLevel: z.string().max(50).optional().nullable(),
  // Availability
  availability: availabilityEnum.optional(),
  availableFrom: z.string().optional().nullable(), // ISO date string
  noticePeriodDays: z.number().int().min(0).max(365).optional().nullable(),
  // Location
  location: z.string().max(200).optional(),
  locationCity: z.string().max(100).optional().nullable(),
  locationState: z.string().max(100).optional().nullable(),
  locationCountry: z.string().max(3).optional().nullable(),
  willingToRelocate: z.boolean().optional(),
  relocationPreferences: z.string().max(500).optional().nullable(),
  isRemoteOk: z.boolean().optional(),
  // Compensation
  minimumRate: z.number().min(0).optional().nullable(),
  desiredRate: z.number().min(0).optional().nullable(),
  rateType: candidateRateTypeEnum.optional(),
  currency: candidateCurrencyEnum.optional(),
  isNegotiable: z.boolean().optional(),
  compensationNotes: z.string().max(500).optional().nullable(),
  // Tracking
  tags: z.array(z.string()).max(20).optional(),
  isOnHotlist: z.boolean().optional(),
  hotlistNotes: z.string().max(500).optional().nullable(),
  profileStatus: candidateStatusEnum.optional(),
  leadSource: leadSourceEnum.optional(),
  sourceDetails: z.string().max(500).optional().nullable(),
  referredBy: z.string().max(200).optional().nullable(),
  campaignId: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().uuid().optional().nullable()
  ),
  // Internal notes
  internalNotes: z.string().max(5000).optional().nullable(),
  // Wizard state for draft persistence
  wizard_state: z.any().optional().nullable(),
  // Resume data for draft finalization (creates contact_resumes record)
  resumeData: z.object({
    storagePath: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    mimeType: z.string().default('application/pdf'),
    parsedContent: z.string().optional(),
    parsedSkills: z.array(z.string()).optional(),
    parsedExperience: z.string().optional(),
    aiSummary: z.string().optional(),
    parsingConfidence: z.number().min(0).max(100).optional(),
  }).optional(),
  // Compliance documents data for draft finalization (creates documents records)
  complianceDocumentsData: z.array(z.object({
    documentType: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    storagePath: z.string(),
    notes: z.string().optional(),
  })).optional(),
})

const searchCandidatesInput = z.object({
  // Text search
  search: z.string().optional(),
  booleanQuery: z.string().max(1000).optional(),

  // Filters
  skills: z.array(z.string()).optional(),
  skillsMatchMode: z.enum(['all', 'any']).default('all'),
  minExperience: z.number().int().min(0).optional(),
  maxExperience: z.number().int().max(50).optional(),
  locations: z.array(z.string()).optional(),
  remoteOk: z.boolean().optional(),
  visaStatuses: z.array(visaStatusEnum).optional(),
  availability: availabilityEnum.optional(),
  minRate: z.number().min(0).optional(),
  maxRate: z.number().min(0).optional(),
  statuses: z.array(candidateStatusEnum).optional(),
  tags: z.array(z.string()).optional(),
  ownerId: z.string().uuid().optional(),
  isOnHotlist: z.boolean().optional(),
  source: z.string().optional(), // Source filter (linkedin, referral, job_board, etc.)

  // Pagination
  limit: z.number().min(1).max(100).default(25),
  offset: z.number().min(0).default(0),

  // Sorting
  sortBy: z.enum([
    'match_score', 'experience', 'rate', 'availability',
    'last_updated', 'created_at', 'name',
    'first_name', 'title', 'location', 'status', 'years_experience',
    'lead_source', 'submissions_count', 'owner_id', 'last_activity_date'
  ]).default('last_updated'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================
// ATS ROUTER - Jobs, Submissions, Interviews, Placements, Candidates
// ============================================

export const atsRouter = router({
  // ============================================
  // JOBS
  // ============================================
  jobs: router({
    // List jobs with filtering and sorting
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(['draft', 'open', 'active', 'on_hold', 'filled', 'cancelled', 'closed', 'all']).default('all'),
        type: z.enum(['full_time', 'contract', 'contract_to_hire', 'part_time']).optional(),
        priority: z.string().optional(),
        // JOBS-01: Priority rank filter (numeric ranking)
        priorityRank: z.number().int().min(0).max(4).optional(),
        accountId: z.string().uuid().optional(),
        recruiterId: z.string().uuid().optional(),
        includeDrafts: z.boolean().optional(), // Include draft jobs in results
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['title', 'company_id', 'location', 'job_type', 'status', 'positions_available', 'submissions_count', 'interviews_count', 'owner_id', 'due_date', 'created_at', 'priority_rank', 'sla_days']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('jobs')
          .select(`
            *,
            company:companies!jobs_company_id_fkey(id, name),
            owner:user_profiles!jobs_owner_id_fkey(id, full_name, avatar_url),
            submissions!submissions_job_id_fkey(id, status),
            interviews!interviews_job_id_fkey(id, status)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.search) {
          query = query.or(`title.ilike.%${input.search}%,description.ilike.%${input.search}%`)
        }
        if (input.status && input.status !== 'all') {
          query = query.eq('status', input.status)
        } else if (!input.includeDrafts) {
          // By default, exclude drafts from the main list (they're shown in DraftsSection)
          query = query.neq('status', 'draft')
        }
        if (input.type) {
          query = query.eq('job_type', input.type)
        }
        if (input.priority) {
          query = query.eq('priority', input.priority)
        }
        // JOBS-01: Priority rank filter
        if (input.priorityRank !== undefined) {
          query = query.eq('priority_rank', input.priorityRank)
        }
        if (input.accountId) {
          // TODO: jobs table no longer has account_id or client_id column
          // Need to filter via company_id -> companies -> legacy_account_id
          // For now, filter by company_id directly (assuming accountId is actually companyId)
          query = query.eq('company_id', input.accountId)
        }
        if (input.recruiterId) {
          query = query.eq('owner_id', input.recruiterId)
        }

        // Apply sorting
        query = query.order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('[jobs.list] Error:', error.message, error.code, error.details, error.hint)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(j => ({
            id: j.id,
            title: j.title,
            status: j.status,
            job_type: j.job_type,
            type: j.job_type,
            location: j.location,
            billing_rate: j.billing_rate,
            bill_rate_min: j.bill_rate_min,
            bill_rate_max: j.bill_rate_max,
            salary_min: j.salary_min,
            salary_max: j.salary_max,
            positions_available: j.positions_available,
            openings: j.positions_available,
            positions_filled: j.positions_filled,
            due_date: j.due_date,
            dueDate: j.due_date,
            priority: j.priority,
            // JOBS-01: New unified reference fields
            priority_rank: j.priority_rank,
            sla_days: j.sla_days,
            client_company_id: j.client_company_id,
            end_client_company_id: j.end_client_company_id,
            vendor_company_id: j.vendor_company_id,
            hiring_manager_contact_id: j.hiring_manager_contact_id,
            hr_contact_id: j.hr_contact_id,
            external_job_id: j.external_job_id,
            fee_type: j.fee_type,
            fee_percentage: j.fee_percentage,
            fee_flat_amount: j.fee_flat_amount,
            company: j.company,
            owner: j.owner,
            submissions_count: (j.submissions as Array<{ status: string }> | null)?.length ?? 0,
            interviews_count: (j.interviews as Array<{ status: string }> | null)?.length ?? 0,
            createdAt: j.created_at,
            created_at: j.created_at,
          })) ?? [],
          total: count ?? 0,
        }
      }),

    // List current user's draft jobs (for DraftsSection in list views)
    listMyDrafts: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          return []
        }

        // Get user_profile.id from auth_id (same pattern as accounts.listMyDrafts)
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (!profile?.id) {
          return []
        }

        const { data, error } = await adminClient
          .from('jobs')
          .select('id, title, status, wizard_state, created_at, updated_at')
          .eq('org_id', orgId)
          .eq('created_by', profile.id)
          .eq('status', 'draft')
          .is('deleted_at', null)
          .order('updated_at', { ascending: false })
          .limit(10)

        if (error) {
          console.error('[jobs.listMyDrafts] Error:', error.message)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Delete a draft job (soft delete - verify ownership and draft status)
    deleteDraft: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get user_profile.id from auth_id (same pattern as accounts.deleteDraft)
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (!profile?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User profile not found' })
        }

        // Verify draft exists and user owns it
        const { data: job, error: fetchError } = await adminClient
          .from('jobs')
          .select('id, status, created_by')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (fetchError || !job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Draft not found' })
        }

        if (job.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only delete draft jobs' })
        }

        if (job.created_by !== profile.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own drafts' })
        }

        // Soft delete
        const { error: deleteError } = await adminClient
          .from('jobs')
          .update({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)

        if (deleteError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: deleteError.message })
        }

        return { success: true }
      }),

    // Get job by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('jobs')
          .select(`
            *,
            company:companies!jobs_company_id_fkey(id, name, industry),
            clientCompany:companies!client_company_id(id, name, industry),
            endClientCompany:companies!end_client_company_id(id, name, industry),
            vendorCompany:companies!vendor_company_id(id, name),
            hiringManagerContact:contacts!hiring_manager_contact_id(id, first_name, last_name, email, phone),
            hrContact:contacts!hr_contact_id(id, first_name, last_name, email, phone),
            intakeCompletedBy:user_profiles!intake_completed_by(id, full_name),
            owner:user_profiles!owner_id(id, full_name, avatar_url),
            submissions(id, status, candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name))
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          console.error('[getById] Error fetching job:', error.message, error.code, error.details)
          if (error.code === 'PGRST116') {
            // No rows returned - job doesn't exist or wrong org
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Calculate SLA progress
        let slaProgress = null
        if (data.sla_days && data.created_at) {
          const createdDate = new Date(data.created_at)
          const today = new Date()
          const daysSinceCreated = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
          slaProgress = {
            daysElapsed: daysSinceCreated,
            slaDays: data.sla_days,
            percentUsed: Math.round((daysSinceCreated / data.sla_days) * 100),
            isOverdue: daysSinceCreated > data.sla_days,
            daysRemaining: Math.max(0, data.sla_days - daysSinceCreated),
          }
        }

        return {
          ...data,
          slaProgress,
        }
      }),

    // Get full job with all section data (ONE database call pattern)
    getFullJob: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Parallel queries for all section data
        const [
          jobResult,
          submissionsResult,
          interviewsResult,
          offersResult,
          teamResult,
          activitiesResult,
          notesResult,
          documentsResult,
          historyResult,
          jobContactsResult,
        ] = await Promise.all([
          // Job with relations
          adminClient
            .from('jobs')
            .select(`
              *,
              company:companies!jobs_company_id_fkey(id, name, industry),
              clientCompany:companies!client_company_id(id, name, industry),
              endClientCompany:companies!end_client_company_id(id, name, industry),
              vendorCompany:companies!vendor_company_id(id, name),
              hiringManagerContact:contacts!hiring_manager_contact_id(id, first_name, last_name, email, phone),
              hrContact:contacts!hr_contact_id(id, first_name, last_name, email, phone),
              intakeCompletedBy:user_profiles!intake_completed_by(id, full_name),
              owner:user_profiles!owner_id(id, full_name, avatar_url),
              requirements:job_requirements(*),
              skills:job_skills(*, skill:skills(*))
            `)
            .eq('id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .single(),

          // Submissions with candidate details
          adminClient
            .from('submissions')
            .select(`
              *,
              candidate:contacts!candidate_id(id, first_name, last_name, email, phone, avatar_url),
              submittedBy:user_profiles!submitted_by(id, full_name, avatar_url)
            `)
            .eq('job_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(200),

          // Interviews for this job
          adminClient
            .from('interviews')
            .select(`
              *,
              submission:submissions!submission_id(id, candidate_id),
              interviewer:user_profiles!interviewer_id(id, full_name, avatar_url)
            `)
            .eq('job_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('scheduled_at', { ascending: true })
            .limit(100),

          // Offers for this job
          adminClient
            .from('offers')
            .select(`
              *,
              submission:submissions!submission_id(id, candidate_id),
              candidate:contacts!candidate_id(id, first_name, last_name)
            `)
            .eq('job_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Hiring team (job assignments)
          adminClient
            .from('job_assignments')
            .select(`
              *,
              user:user_profiles!user_id(id, full_name, avatar_url, email)
            `)
            .eq('job_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null),

          // Activities
          adminClient
            .from('activities')
            .select(`
              *,
              creator:user_profiles!created_by(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'job')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(100),

          // Notes
          adminClient
            .from('notes')
            .select(`
              *,
              creator:user_profiles!created_by(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'job')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Documents
          adminClient
            .from('documents')
            .select('*')
            .eq('entity_type', 'job')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Status history
          adminClient
            .from('job_status_history')
            .select(`
              *,
              changedBy:user_profiles!changed_by(id, full_name)
            `)
            .eq('job_id', input.id)
            .order('changed_at', { ascending: false })
            .limit(50),

          // Job contacts (many-to-many via junction table)
          adminClient
            .from('job_contacts')
            .select(`
              *,
              contact:contacts!contact_id(
                id, first_name, last_name, email, phone, title, avatar_url
              )
            `)
            .eq('job_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('is_primary', { ascending: false })
            .order('role'),
        ])

        if (jobResult.error) {
          if (jobResult.error.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: jobResult.error.message })
        }

        const job = jobResult.data
        const submissions = submissionsResult.data || []
        const interviews = interviewsResult.data || []
        const offers = offersResult.data || []

        // Calculate SLA progress
        let slaProgress = null
        if (job.sla_days && job.created_at) {
          const createdDate = new Date(job.created_at)
          const today = new Date()
          const daysSinceCreated = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
          slaProgress = {
            daysElapsed: daysSinceCreated,
            slaDays: job.sla_days,
            percentUsed: Math.round((daysSinceCreated / job.sla_days) * 100),
            isOverdue: daysSinceCreated > job.sla_days,
            daysRemaining: Math.max(0, job.sla_days - daysSinceCreated),
          }
        }

        // Calculate submission counts by status
        const submissionsByStatus: Record<string, number> = {}
        submissions.forEach((s) => {
          submissionsByStatus[s.status] = (submissionsByStatus[s.status] || 0) + 1
        })

        // Count upcoming interviews
        const upcomingInterviews = interviews.filter(
          (i) => i.scheduled_at && new Date(i.scheduled_at) > new Date()
        ).length

        // Count pending offers
        const pendingOffers = offers.filter((o) => o.status === 'pending').length

        return {
          ...job,
          slaProgress,
          sections: {
            requirements: {
              items: job.requirements || [],
              total: job.requirements?.length || 0,
            },
            skills: {
              items: job.skills || [],
              total: job.skills?.length || 0,
            },
            team: {
              items: teamResult.data || [],
              total: teamResult.data?.length || 0,
            },
            submissions: {
              items: submissions,
              total: submissions.length,
              byStatus: submissionsByStatus,
            },
            interviews: {
              items: interviews,
              total: interviews.length,
              upcoming: upcomingInterviews,
            },
            offers: {
              items: offers,
              total: offers.length,
              pending: pendingOffers,
            },
            activities: {
              items: activitiesResult.data || [],
              total: activitiesResult.data?.length || 0,
            },
            notes: {
              items: notesResult.data || [],
              total: notesResult.data?.length || 0,
            },
            documents: {
              items: documentsResult.data || [],
              total: documentsResult.data?.length || 0,
            },
            history: {
              items: historyResult.data || [],
              total: historyResult.data?.length || 0,
            },
            clientContacts: {
              items: (jobContactsResult.data || []).map((jc: Record<string, unknown>) => {
                const contact = jc.contact as Record<string, unknown> | null
                return {
                  id: jc.id as string,
                  jobId: jc.job_id as string,
                  contactId: jc.contact_id as string,
                  role: jc.role as string,
                  isPrimary: (jc.is_primary as boolean) ?? false,
                  notes: jc.notes as string | null,
                  createdAt: jc.created_at as string,
                  contact: contact ? {
                    id: contact.id as string,
                    firstName: contact.first_name as string,
                    lastName: contact.last_name as string,
                    fullName: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown',
                    email: contact.email as string | null,
                    phone: contact.phone as string | null,
                    title: contact.title as string | null,
                    avatarUrl: contact.avatar_url as string | null,
                  } : null,
                }
              }),
              total: jobContactsResult.data?.length || 0,
              byRole: (jobContactsResult.data || []).reduce((acc: Record<string, number>, jc: Record<string, unknown>) => {
                const role = jc.role as string
                acc[role] = (acc[role] || 0) + 1
                return acc
              }, {}),
            },
          },
        }
      }),

    // Get jobs by company ID
    getByCompany: orgProtectedProcedure
      .input(z.object({
        companyId: z.string().uuid(),
        status: z.enum(['open', 'active', 'closed', 'on_hold', 'all']).default('open'),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('jobs')
          .select(`
            id, title, status, job_type, location, priority, priority_rank,
            rate_min, rate_max, sla_days, positions_count, positions_filled,
            created_at, owner:user_profiles!owner_id(id, full_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .or(`client_company_id.eq.${input.companyId},company_id.eq.${input.companyId}`)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (input.status !== 'all') {
          if (input.status === 'open') {
            query = query.in('status', ['open', 'active'])
          } else {
            query = query.eq('status', input.status)
          }
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Get job pipeline stats
    getStats: orgProtectedProcedure
      .input(z.object({
        recruiterId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // recruiterId can be used to filter by owner in the future
        const _ownerId = input.recruiterId

        // Count jobs by status
        const { data: jobs } = await adminClient
          .from('jobs')
          .select('id, status, created_at, priority')
          .eq('org_id', orgId)
          .is('deleted_at', null)

        const byStatus: Record<string, number> = {}
        jobs?.forEach(j => {
          byStatus[j.status] = (byStatus[j.status] || 0) + 1
        })

        // Count urgent jobs (priority = urgent or critical)
        const urgentJobs = jobs?.filter(j =>
          (j as { priority?: string }).priority === 'urgent' ||
          (j as { priority?: string }).priority === 'critical'
        ).length ?? 0

        return {
          total: jobs?.length ?? 0,
          active: (byStatus['active'] ?? 0) + (byStatus['open'] ?? 0),
          onHold: byStatus['on_hold'] ?? 0,
          filled: byStatus['filled'] ?? 0,
          cancelled: byStatus['cancelled'] ?? 0,
          urgentJobs,
        }
      }),

    // Stats for jobs list view (aggregate metrics)
    stats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Get all jobs with their placements and submissions (excluding drafts)
        const { data: jobs } = await adminClient
          .from('jobs')
          .select(`
            id, status, created_at, filled_date,
            submissions(id),
            placements(id, created_at)
          `)
          .eq('org_id', orgId)
          .neq('status', 'draft')
          .is('deleted_at', null)

        const total = jobs?.length ?? 0

        // Count active jobs (active + open status)
        const active = jobs?.filter(j => j.status === 'active' || j.status === 'open').length ?? 0

        // Count filled this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        const filledThisMonth = jobs?.filter(j => {
          const filledDate = (j as { filled_date?: string }).filled_date
          return j.status === 'filled' && filledDate && new Date(filledDate) >= startOfMonth
        }).length ?? 0

        // Calculate average time to fill (for filled jobs)
        const filledJobs = jobs?.filter(j => {
          const filledDate = (j as { filled_date?: string }).filled_date
          return j.status === 'filled' && filledDate
        }) ?? []
        let avgTimeToFill = 0
        if (filledJobs.length > 0) {
          const totalDays = filledJobs.reduce((sum, j) => {
            const created = new Date(j.created_at)
            const filled = new Date((j as { filled_date?: string }).filled_date!)
            const days = Math.floor((filled.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
            return sum + days
          }, 0)
          avgTimeToFill = Math.round(totalDays / filledJobs.length)
        }

        // Calculate average submissions per job
        const totalSubmissions = jobs?.reduce((sum, j) => {
          return sum + ((j.submissions as Array<unknown> | null)?.length ?? 0)
        }, 0) ?? 0
        const avgSubmissions = total > 0 ? totalSubmissions / total : 0

        return {
          total,
          active,
          filledThisMonth,
          avgTimeToFill,
          avgSubmissions: Math.round(avgSubmissions * 10) / 10, // Round to 1 decimal
        }
      }),

    // Get my active jobs (for recruiter)
    getMy: orgProtectedProcedure
      .input(z.object({
        status: z.enum(['active', 'on_hold', 'all']).default('active'),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('jobs')
          .select(`
            id, title, status, job_type, location, billing_rate, created_at,
            company:companies!jobs_company_id_fkey(id, name),
            submissions(id, status)
          `)
          .eq('org_id', orgId)
          .eq('owner_id', user?.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (input.status !== 'all') {
          query = query.eq('status', input.status)
        } else {
          query = query.in('status', ['active', 'on_hold'])
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(j => ({
          id: j.id,
          title: j.title,
          status: j.status,
          jobType: j.job_type,
          location: j.location,
          billingRate: j.billing_rate,
          account: j.company,
          submissionCount: (j.submissions as Array<{ status: string }> | null)?.length ?? 0,
          activeSubmissions: (j.submissions as Array<{ status: string }> | null)?.filter(s =>
            ['submitted', 'interviewing', 'offered'].includes(s.status)
          ).length ?? 0,
          createdAt: j.created_at,
        })) ?? []
      }),

    // ============================================
    // JOB MUTATIONS - CREATE, UPDATE, PUBLISH, CLOSE
    // ============================================

    // Create empty draft - called when "New Job" button is clicked
    createDraft: orgProtectedProcedure
      .mutation(async ({ ctx }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get user profile ID for FK constraints
        const { data: userProfile, error: userProfileError } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (userProfileError || !userProfile) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User profile not found' })
        }

        const now = new Date().toISOString()
        const { data: draft, error: draftError } = await adminClient
          .from('jobs')
          .insert({
            org_id: orgId,
            title: '',
            status: 'draft',
            wizard_state: { currentStep: 1, totalSteps: 8, createdAt: now },
            owner_id: userProfile.id,
            created_by: userProfile.id,
            created_at: now,
            updated_at: now,
          })
          .select('id')
          .single()

        if (draftError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: draftError.message })
        }

        return { id: draft.id }
      }),

    // Create a new job in draft status
    create: orgProtectedProcedure
      .input(createJobInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Look up user_profiles.id from auth_id for FK constraints
        // The jobs table has FK constraints (owner_id, created_by) that reference user_profiles(id), not auth.users(id)
        const { data: userProfile, error: userProfileError } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (userProfileError || !userProfile) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User profile not found' })
        }

        const userProfileId = userProfile.id

        // Validate company exists
        const { data: company, error: companyError } = await adminClient
          .from('companies')
          .select('id, name')
          .eq('id', input.accountId)
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .single()

        if (companyError || !company) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid account' })
        }

        // Validate rate range
        if (input.rateMax && input.rateMin && input.rateMax < input.rateMin) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Max rate must be greater than or equal to min rate' })
        }

        // Validate experience range (support both naming conventions)
        const minExp = input.minExperience ?? input.minExperienceYears
        const maxExp = input.maxExperience ?? input.maxExperienceYears
        if (maxExp && minExp && maxExp < minExp) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Max experience must be greater than or equal to min experience' })
        }

        // Calculate priority_rank from priority if not provided
        const priorityRank = input.priorityRank ?? (() => {
          switch (input.priority) {
            case 'urgent': case 'critical': return 1
            case 'high': return 2
            case 'normal': return 3
            case 'low': return 4
            default: return 0
          }
        })()

        // Create job record
        const { data: job, error: jobError } = await adminClient
          .from('jobs')
          .insert({
            org_id: orgId,
            // Note: jobs table uses company_id, NOT client_id
            deal_id: input.dealId,
            title: input.title,
            description: input.description,
            job_type: input.jobType,
            location: input.location,
            is_remote: input.isRemote || input.intakeData?.workArrangement === 'remote',
            hybrid_days: input.hybridDays ?? input.intakeData?.hybridDays,
            rate_min: input.rateMin,
            rate_max: input.rateMax,
            rate_type: input.rateType,
            currency: input.currency,
            // Pay rate from intake wizard
            pay_rate_min: input.intakeData?.payRateMin,
            pay_rate_max: input.intakeData?.payRateMax,
            positions_count: input.positionsCount,
            positions_filled: 0,
            required_skills: input.requiredSkills || input.intakeData?.requiredSkillsDetailed?.map(s => s.name) || [],
            nice_to_have_skills: input.niceToHaveSkills || input.intakeData?.preferredSkills || [],
            min_experience_years: minExp,
            max_experience_years: maxExp,
            visa_requirements: input.visaRequirements || input.intakeData?.workAuthorizations || [],
            urgency: input.urgency,
            target_fill_date: input.targetFillDate,
            target_start_date: input.targetStartDate,
            target_end_date: input.targetEndDate,
            client_submission_instructions: input.clientSubmissionInstructions,
            client_interview_process: input.clientInterviewProcess || (input.intakeData?.interviewRounds ? JSON.stringify(input.intakeData.interviewRounds) : null),
            status: input.status ?? 'draft',
            wizard_state: input.wizard_state ?? null,
            intake_data: input.intakeData ?? null,
            owner_id: userProfileId,
            recruiter_ids: [userProfileId],
            created_by: userProfileId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // JOBS-01: Unified company/contact references
            company_id: input.accountId, // Keep company_id sync'd with account_id
            client_company_id: input.clientCompanyId || input.accountId,
            end_client_company_id: input.endClientCompanyId,
            vendor_company_id: input.vendorCompanyId,
            hiring_manager_contact_id: input.hiringManagerContactId || input.intakeData?.hiringManagerId,
            hr_contact_id: input.hrContactId,
            external_job_id: input.externalJobId,
            priority_rank: priorityRank,
            sla_days: input.slaDays,
            fee_type: input.feeType,
            fee_percentage: input.feePercentage,
            fee_flat_amount: input.feeFlatAmount,
          })
          .select('id, title, status, created_at')
          .single()

        if (jobError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: jobError.message })
        }

        // Log status history
        await adminClient
          .from('job_status_history')
          .insert({
            org_id: orgId,
            job_id: job.id,
            previous_status: null,
            new_status: 'draft',
            changed_by: userProfileId,
            changed_at: new Date().toISOString(),
            notes: 'Job created',
          })

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'job',
            entity_id: job.id,
            activity_type: 'note',
            subject: `Job created: ${job.title}`,
            description: `Created job "${job.title}" for ${company.name}`,
            outcome: 'positive',
            created_by: userProfileId,
            created_at: new Date().toISOString(),
          })

        // Create address record if structured location fields are provided
        if (input.locationCity || input.locationState) {
          await adminClient
            .from('addresses')
            .insert({
              org_id: orgId,
              entity_type: 'job',
              entity_id: job.id,
              address_type: 'job_location',
              city: input.locationCity || null,
              state_province: input.locationState || null,
              country_code: input.locationCountry || 'US',
              is_primary: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
        }

        // HISTORY: Record job creation (fire-and-forget)
        void historyService.recordEntityCreated(
          'job',
          job.id,
          { orgId, userId: user?.id ?? null },
          { entityName: job.title, initialStatus: 'draft' }
        ).catch(err => console.error('[History] Failed to record job creation:', err))

        // HISTORY: Record job added to parent account
        void historyService.recordRelatedObjectAdded(
          'account',
          input.accountId,
          {
            type: 'job',
            id: job.id,
            label: job.title,
            metadata: { status: job.status, jobType: input.jobType }
          },
          { orgId, userId: user?.id ?? null }
        ).catch(err => console.error('[History] Failed to record job on account:', err))

        return {
          jobId: job.id,
          title: job.title,
          status: job.status,
          createdAt: job.created_at,
        }
      }),

    // Update job details
    update: orgProtectedProcedure
      .input(updateJobInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get current job
        const { data: job, error: jobError } = await adminClient
          .from('jobs')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (jobError || !job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        // Check if job can be edited
        if (job.status === 'cancelled' || job.closed_at) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot edit a closed or cancelled job' })
        }

        // Build update object
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        // Status update (for finalizing drafts)
        if (input.status !== undefined) updateData.status = input.status
        if (input.title !== undefined) updateData.title = input.title
        if (input.jobType !== undefined) updateData.job_type = input.jobType
        if (input.location !== undefined) updateData.location = input.location
        // Note: location_city, location_state, location_country, is_hybrid are stored in addresses table
        // or can be inferred from location string and hybrid_days
        if (input.isRemote !== undefined) updateData.is_remote = input.isRemote
        if (input.hybridDays !== undefined) updateData.hybrid_days = input.hybridDays
        if (input.requiredSkills !== undefined) updateData.required_skills = input.requiredSkills
        if (input.niceToHaveSkills !== undefined) updateData.nice_to_have_skills = input.niceToHaveSkills
        if (input.minExperienceYears !== undefined) updateData.min_experience_years = input.minExperienceYears
        if (input.maxExperienceYears !== undefined) updateData.max_experience_years = input.maxExperienceYears
        if (input.visaRequirements !== undefined) updateData.visa_requirements = input.visaRequirements
        if (input.description !== undefined) updateData.description = input.description
        if (input.rateMin !== undefined) updateData.rate_min = input.rateMin
        if (input.rateMax !== undefined) updateData.rate_max = input.rateMax
        if (input.rateType !== undefined) updateData.rate_type = input.rateType
        if (input.currency !== undefined) updateData.currency = input.currency
        if (input.positionsCount !== undefined) updateData.positions_count = input.positionsCount
        if (input.priority !== undefined) updateData.priority = input.priority
        if (input.urgency !== undefined) updateData.urgency = input.urgency
        if (input.targetFillDate !== undefined) updateData.target_fill_date = input.targetFillDate
        if (input.targetStartDate !== undefined) updateData.target_start_date = input.targetStartDate
        if (input.targetEndDate !== undefined) updateData.target_end_date = input.targetEndDate
        if (input.clientSubmissionInstructions !== undefined) updateData.client_submission_instructions = input.clientSubmissionInstructions
        if (input.clientInterviewProcess !== undefined) updateData.client_interview_process = input.clientInterviewProcess
        // Hiring team fields
        if (input.ownerId !== undefined) updateData.owner_id = input.ownerId
        if (input.recruiterIds !== undefined) updateData.recruiter_ids = input.recruiterIds
        if (input.hiringManagerContactId !== undefined) updateData.hiring_manager_contact_id = input.hiringManagerContactId
        if (input.hrContactId !== undefined) updateData.hr_contact_id = input.hrContactId
        // Client/Company fields
        if (input.accountId !== undefined) {
          updateData.company_id = input.accountId
          // Also update client_company_id if not explicitly set
          if (input.clientCompanyId === undefined) {
            updateData.client_company_id = input.accountId
          }
        }
        if (input.clientCompanyId !== undefined) updateData.client_company_id = input.clientCompanyId
        if (input.endClientCompanyId !== undefined) updateData.end_client_company_id = input.endClientCompanyId
        if (input.vendorCompanyId !== undefined) updateData.vendor_company_id = input.vendorCompanyId
        if (input.externalJobId !== undefined) updateData.external_job_id = input.externalJobId
        // Fee structure fields
        if (input.feeType !== undefined) updateData.fee_type = input.feeType
        if (input.feePercentage !== undefined) updateData.fee_percentage = input.feePercentage
        if (input.feeFlatAmount !== undefined) updateData.fee_flat_amount = input.feeFlatAmount
        // Priority and SLA fields
        if (input.priorityRank !== undefined) updateData.priority_rank = input.priorityRank
        if (input.slaDays !== undefined) updateData.sla_days = input.slaDays
        // Extended intake data (JSONB field for all wizard fields)
        if (input.intakeData !== undefined) updateData.intake_data = input.intakeData
        // Draft support - wizard state for tracking progress
        if (input.wizard_state !== undefined) updateData.wizard_state = input.wizard_state

        // Update job record
        const { data: updatedJob, error: updateError } = await adminClient
          .from('jobs')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('id, title, status, updated_at')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Create/update address entry when location data is provided (especially on finalization)
        // This syncs location data from wizard intake to the addresses table
        const intakeData = input.intakeData as Record<string, unknown> | undefined
        if (intakeData) {
          const hasLocationData = intakeData.locationCity || intakeData.locationState || intakeData.locationAddressLine1

          if (hasLocationData && input.isRemote !== true) {
            // Check if address already exists for this job
            const { data: existingAddress } = await adminClient
              .from('addresses')
              .select('id')
              .eq('entity_type', 'job')
              .eq('entity_id', input.id)
              .eq('address_type', 'job_location')
              .eq('org_id', orgId)
              .maybeSingle()

            const addressData = {
              org_id: orgId,
              entity_type: 'job' as const,
              entity_id: input.id,
              address_type: 'job_location' as const,
              address_line_1: (intakeData.locationAddressLine1 as string) || null,
              address_line_2: (intakeData.locationAddressLine2 as string) || null,
              city: (intakeData.locationCity as string) || null,
              state_province: (intakeData.locationState as string) || null,
              postal_code: (intakeData.locationPostalCode as string) || null,
              country_code: (intakeData.locationCountry as string) || 'US',
              is_primary: true,
              updated_at: new Date().toISOString(),
              updated_by: user.id,
            }

            if (existingAddress) {
              // Update existing address
              await adminClient
                .from('addresses')
                .update(addressData)
                .eq('id', existingAddress.id)
            } else {
              // Create new address
              await adminClient
                .from('addresses')
                .insert({
                  ...addressData,
                  created_at: new Date().toISOString(),
                  created_by: user.id,
                })
            }
          }
        }

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'job',
            entity_id: input.id,
            activity_type: 'note',
            subject: `Job updated: ${updatedJob.title}`,
            description: `Updated job details`,
            outcome: 'neutral',
            created_by: user.id,
            created_at: new Date().toISOString(),
          })

        return {
          jobId: updatedJob.id,
          title: updatedJob.title,
          status: updatedJob.status,
          updatedAt: updatedJob.updated_at,
        }
      }),

    // Publish job (draft → open)
    publish: orgProtectedProcedure
      .input(publishJobInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get current job
        const { data: job, error: jobError } = await adminClient
          .from('jobs')
          .select('*, company:companies!jobs_company_id_fkey(id, name)')
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .single()

        if (jobError || !job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        // Validate current status
        if (job.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Only draft jobs can be published' })
        }

        // Validate required fields
        const validationErrors: string[] = []
        if (!job.title || job.title.length < 3) validationErrors.push('Job title is required')
        if (!job.required_skills || job.required_skills.length === 0) validationErrors.push('At least one required skill is needed')
        if (!job.company_id) validationErrors.push('Client account is required')

        if (validationErrors.length > 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: validationErrors.join(', ') })
        }

        const now = new Date().toISOString()

        // Update job status
        const { data: updatedJob, error: updateError } = await adminClient
          .from('jobs')
          .update({
            status: 'open',
            published_at: now,
            published_by: user.id,
            posted_date: now.split('T')[0],
            updated_at: now,
          })
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .select('id, title, status, published_at')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Log status history
        await adminClient
          .from('job_status_history')
          .insert({
            org_id: orgId,
            job_id: input.jobId,
            previous_status: 'draft',
            new_status: 'open',
            changed_by: user.id,
            changed_at: now,
            notes: input.publishingNote || 'Job published',
          })

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'job',
            entity_id: input.jobId,
            activity_type: 'note',
            subject: `Job published: ${updatedJob.title}`,
            description: input.publishingNote || 'Job published and ready for sourcing',
            outcome: 'positive',
            created_by: user.id,
            created_at: now,
          })

        return {
          jobId: updatedJob.id,
          title: updatedJob.title,
          status: updatedJob.status,
          publishedAt: updatedJob.published_at,
        }
      }),

    // Update job status with validation
    updateStatus: orgProtectedProcedure
      .input(updateJobStatusInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get current job
        const { data: job, error: jobError } = await adminClient
          .from('jobs')
          .select('*, submissions(id, status)')
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .single()

        if (jobError || !job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        const currentStatus = job.status
        const newStatus = input.newStatus

        // Check for blocking activities when moving to closing statuses
        const closingStatuses = ['closed', 'cancelled', 'filled', 'on_hold']
        if (closingStatuses.includes(newStatus)) {
          const blockCheck = await checkBlockingActivities({
            entityType: 'job',
            entityId: input.jobId,
            targetStatus: newStatus,
            orgId,
            supabase: adminClient,
          })
          if (blockCheck.blocked) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message: `Cannot change status to ${newStatus}: ${blockCheck.activities.length} blocking ${blockCheck.activities.length === 1 ? 'activity' : 'activities'} must be completed first`,
              cause: { blockingActivities: blockCheck.activities },
            })
          }
        }

        // Validate transition
        const allowed = validTransitions[currentStatus] || []
        if (!allowed.includes(newStatus)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot transition from ${currentStatus} to ${newStatus}`,
          })
        }

        // Additional validations
        if (newStatus === 'on_hold' && !input.reason) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Reason is required when putting job on hold' })
        }

        if (newStatus === 'cancelled' && !input.reason) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Reason is required when cancelling job' })
        }

        if (newStatus === 'filled') {
          // Check if all positions are filled
          if (job.positions_filled < job.positions_count) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Cannot mark as filled. ${job.positions_filled}/${job.positions_count} positions filled.`,
            })
          }
        }

        const now = new Date().toISOString()
        const updateData: Record<string, unknown> = {
          status: newStatus,
          updated_at: now,
        }

        // Status-specific fields
        if (newStatus === 'on_hold') {
          updateData.on_hold_reason = input.reason
          if (input.expectedReactivationDate) {
            updateData.expected_reactivation_date = input.expectedReactivationDate
          }
        }

        if (newStatus === 'filled') {
          updateData.filled_date = now.split('T')[0]
          // Calculate days to fill
          if (job.published_at) {
            const publishedDate = new Date(job.published_at)
            const filledDate = new Date()
            const daysToFill = Math.floor((filledDate.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24))
            updateData.days_to_fill = daysToFill
          }
        }

        if (newStatus === 'cancelled') {
          updateData.closed_at = now
          updateData.closed_by = user.id
          updateData.closure_reason = input.reason
        }

        // Clear on_hold fields when reactivating
        if (currentStatus === 'on_hold' && (newStatus === 'open' || newStatus === 'active')) {
          updateData.on_hold_reason = null
          updateData.expected_reactivation_date = null
        }

        // Update job
        const { data: updatedJob, error: updateError } = await adminClient
          .from('jobs')
          .update(updateData)
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .select('id, title, status')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Log status history
        const historyData: Record<string, unknown> = {
          org_id: orgId,
          job_id: input.jobId,
          previous_status: currentStatus,
          new_status: newStatus,
          changed_by: user.id,
          changed_at: now,
          reason: input.reason,
          notes: input.notes,
        }

        if (newStatus === 'on_hold' && input.expectedReactivationDate) {
          historyData.expected_reactivation_date = input.expectedReactivationDate
        }

        if (newStatus === 'filled' && updateData.days_to_fill) {
          historyData.days_to_fill = updateData.days_to_fill
          historyData.positions_filled_count = job.positions_filled
        }

        await adminClient.from('job_status_history').insert(historyData)

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'job',
            entity_id: input.jobId,
            activity_type: 'note',
            subject: `Job status changed: ${currentStatus} → ${newStatus}`,
            description: input.reason || `Status changed to ${newStatus}`,
            outcome: newStatus === 'filled' ? 'positive' : newStatus === 'cancelled' ? 'negative' : 'neutral',
            created_by: user.id,
            created_at: now,
          })

        return {
          jobId: updatedJob.id,
          title: updatedJob.title,
          previousStatus: currentStatus,
          newStatus: updatedJob.status,
        }
      }),

    // Close job with wizard
    close: orgProtectedProcedure
      .input(closeJobInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get current job with submissions
        const { data: job, error: jobError } = await adminClient
          .from('jobs')
          .select('*, submissions(id, status, candidate_id)')
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .single()

        if (jobError || !job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        if (job.closed_at) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Job is already closed' })
        }

        const now = new Date().toISOString()
        const finalStatus = input.closureReason === 'filled' ? 'filled' : 'cancelled'

        // Count active submissions
        const submissions = (job.submissions || []) as Array<{ id: string; status: string; candidate_id: string }>
        const activeSubmissions = submissions.filter(s =>
          !['rejected', 'withdrawn', 'placed'].includes(s.status)
        )

        // Handle submissions based on action
        if (activeSubmissions.length > 0) {
          if (input.submissionAction === 'withdraw') {
            // Withdraw all active submissions
            await adminClient
              .from('submissions')
              .update({
                status: 'withdrawn',
                updated_at: now,
                rejection_reason: `Job closed: ${input.closureReason}`,
              })
              .eq('job_id', input.jobId)
              .in('id', activeSubmissions.map(s => s.id))
          } else if (input.submissionAction === 'transfer' && input.transferToJobId) {
            // Transfer submissions to another job
            await adminClient
              .from('submissions')
              .update({
                job_id: input.transferToJobId,
                updated_at: now,
              })
              .eq('job_id', input.jobId)
              .in('id', activeSubmissions.map(s => s.id))
          }
          // 'keep' action leaves submissions unchanged
        }

        // Calculate metrics
        let daysToFill: number | null = null
        if (job.published_at && finalStatus === 'filled') {
          const publishedDate = new Date(job.published_at)
          const closedDate = new Date()
          daysToFill = Math.floor((closedDate.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24))
        }

        // Update job
        const { data: updatedJob, error: updateError } = await adminClient
          .from('jobs')
          .update({
            status: finalStatus,
            closed_at: now,
            closed_by: user.id,
            closure_reason: input.closureReason,
            closure_note: input.closureNote,
            days_to_fill: daysToFill,
            filled_date: finalStatus === 'filled' ? now.split('T')[0] : null,
            updated_at: now,
          })
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .select('id, title, status')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Log status history
        await adminClient.from('job_status_history').insert({
          org_id: orgId,
          job_id: input.jobId,
          previous_status: job.status,
          new_status: finalStatus,
          changed_by: user.id,
          changed_at: now,
          reason: input.closureReason,
          notes: input.closureNote,
          days_to_fill: daysToFill,
          positions_filled_count: job.positions_filled,
          candidates_affected_count: activeSubmissions.length,
        })

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'job',
            entity_id: input.jobId,
            activity_type: 'note',
            subject: `Job closed: ${updatedJob.title}`,
            description: `Closed as ${input.closureReason}. ${activeSubmissions.length} submissions affected.`,
            outcome: finalStatus === 'filled' ? 'positive' : 'negative',
            created_by: user.id,
            created_at: now,
          })

        return {
          jobId: updatedJob.id,
          title: updatedJob.title,
          status: updatedJob.status,
          submissionsAffected: activeSubmissions.length,
          daysToFill,
        }
      }),

    // Get status history for a job
    getStatusHistory: orgProtectedProcedure
      .input(z.object({ jobId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('job_status_history')
          .select(`
            id, previous_status, new_status, reason, notes, changed_at,
            is_system_triggered, expected_reactivation_date, days_to_fill,
            positions_filled_count, candidates_affected_count,
            changed_by_user:user_profiles!job_status_history_changed_by_fkey(id, full_name, avatar_url)
          `)
          .eq('job_id', input.jobId)
          .eq('org_id', orgId)
          .order('changed_at', { ascending: false })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Get similar active jobs (for transfer)
    getSimilar: orgProtectedProcedure
      .input(z.object({ jobId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Get current job to find similar ones
        const { data: currentJob, error: currentError } = await adminClient
          .from('jobs')
          .select('id, title, company_id, required_skills')
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .single()

        if (currentError || !currentJob) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        // Find similar jobs (same account or overlapping skills)
        const { data: similarJobs, error } = await adminClient
          .from('jobs')
          .select('id, title, status, company:companies!jobs_company_id_fkey(id, name)')
          .eq('org_id', orgId)
          .neq('id', input.jobId)
          .in('status', ['open', 'active'])
          .is('deleted_at', null)
          .limit(10)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return similarJobs ?? []
      }),

    // Delete (soft delete) a job
    delete: orgProtectedProcedure
      .input(z.object({ jobId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Check if job has active submissions
        const { data: job, error: jobError } = await adminClient
          .from('jobs')
          .select('id, title, status, submissions(id, status)')
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .single()

        if (jobError || !job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        const submissions = (job.submissions || []) as Array<{ id: string; status: string }>
        const activeSubmissions = submissions.filter(s =>
          !['rejected', 'withdrawn'].includes(s.status)
        )

        if (activeSubmissions.length > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot delete job with ${activeSubmissions.length} active submissions`,
          })
        }

        // Soft delete
        const { error: deleteError } = await adminClient
          .from('jobs')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.jobId)
          .eq('org_id', orgId)

        if (deleteError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: deleteError.message })
        }

        return { success: true, jobId: input.jobId }
      }),

    // Link job to account (update company_id)
    linkToAccount: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid(),
        accountId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Verify job exists and belongs to org
        const { data: job, error: jobError } = await adminClient
          .from('jobs')
          .select('id, title, company_id')
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (jobError || !job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        // Verify account exists and belongs to org
        const { data: account, error: accountError } = await adminClient
          .from('companies')
          .select('id, name')
          .eq('id', input.accountId)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (accountError || !account) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' })
        }

        // Check if job is already linked to this account
        if (job.company_id === input.accountId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Job is already linked to this account' })
        }

        const now = new Date().toISOString()

        // Update job with new company_id
        const { data: updatedJob, error: updateError } = await adminClient
          .from('jobs')
          .update({
            company_id: input.accountId,
            updated_at: now,
          })
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .select('id, title')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'job',
            entity_id: input.jobId,
            activity_type: 'note',
            subject: `Job linked to account: ${account.name}`,
            description: `Job "${updatedJob.title}" linked to account "${account.name}"`,
            outcome: 'neutral',
            created_by: user.id,
            created_at: now,
          })

        return {
          jobId: updatedJob.id,
          accountId: input.accountId,
          accountName: account.name,
        }
      }),

    // Unlink job from account (remove company_id)
    unlinkFromAccount: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid(),
        accountId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Verify job exists, belongs to org, and is linked to the specified account
        const { data: job, error: jobError } = await adminClient
          .from('jobs')
          .select('id, title, company_id, company:companies!jobs_company_id_fkey(id, name)')
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .eq('company_id', input.accountId)
          .is('deleted_at', null)
          .single()

        if (jobError || !job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found or not linked to this account' })
        }

        const company = job.company as unknown as { name: string } | null
        const accountName = company?.name || 'Unknown'
        const now = new Date().toISOString()

        // Remove company_id from job
        const { data: updatedJob, error: updateError } = await adminClient
          .from('jobs')
          .update({
            company_id: null,
            updated_at: now,
          })
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .select('id, title')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'job',
            entity_id: input.jobId,
            activity_type: 'note',
            subject: `Job unlinked from account: ${accountName}`,
            description: `Job "${updatedJob.title}" unlinked from account "${accountName}"`,
            outcome: 'neutral',
            created_by: user.id,
            created_at: now,
          })

        return {
          jobId: updatedJob.id,
          success: true,
        }
      }),
  }),

  // ============================================
  // SUBMISSIONS
  // ============================================
  submissions: router({
    // List submissions with filtering
    list: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid().optional(),
        candidateId: z.string().uuid().optional(),
        status: z.string().optional(),
        recruiterId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('submissions')
          .select(`
            *,
            job:jobs(id, title, company:companies!jobs_company_id_fkey(id, name)),
            candidate:user_profiles!submissions_candidate_id_fkey(id, full_name, first_name, last_name, email, avatar_url, candidate_skills),
            owner:user_profiles!owner_id(id, full_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (input.jobId) {
          query = query.eq('job_id', input.jobId)
        }
        if (input.candidateId) {
          query = query.eq('candidate_id', input.candidateId)
        }
        if (input.status) {
          query = query.eq('status', input.status)
        }
        if (input.recruiterId) {
          query = query.eq('owner_id', input.recruiterId)
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Get submission by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('submissions')
          .select(`
            *,
            job:jobs!submissions_job_id_fkey(
              *,
              company:companies!jobs_company_id_fkey(id, name),
              account:companies!client_company_id(id, name)
            ),
            candidate:user_profiles!submissions_candidate_id_fkey(
              id, first_name, last_name, full_name, email, phone, avatar_url
            ),
            owner:user_profiles!owner_id(id, full_name, avatar_url),
            interviews(*)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' })
        }

        return data
      }),

    // Get full submission with all section data (ONE database call pattern)
    getFullSubmission: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Parallel queries for all section data
        const [
          submissionResult,
          interviewsResult,
          feedbackResult,
          activitiesResult,
          notesResult,
          documentsResult,
          historyResult,
        ] = await Promise.all([
          // Submission with candidate, job, account relations
          adminClient
            .from('submissions')
            .select(`
              *,
              candidate:user_profiles!submissions_candidate_id_fkey(
                id, first_name, last_name, full_name, email, phone,
                avatar_url, title, linkedin_url, location_city, location_state,
                desired_rate, work_authorization, years_experience
              ),
              job:jobs!submissions_job_id_fkey(
                id, title, status, job_type, location_type,
                location_city, location_state, min_bill_rate, max_bill_rate,
                min_pay_rate, max_pay_rate, start_date, end_date,
                company:companies!jobs_company_id_fkey(id, name, industry),
                clientCompany:companies!client_company_id(id, name, industry, website),
                hiringManagerContact:contacts!hiring_manager_contact_id(id, first_name, last_name, email, phone),
                owner:user_profiles!owner_id(id, full_name, avatar_url)
              ),
              owner:user_profiles!owner_id(id, full_name, avatar_url, email),
              offer:offers!submissions_offer_id_fkey(id, status, offer_date, salary, bill_rate, pay_rate)
            `)
            .eq('id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .single(),

          // Interviews with participants
          adminClient
            .from('interviews')
            .select(`
              *,
              interviewer:user_profiles!interviewer_id(id, full_name, email, avatar_url),
              scheduledBy:user_profiles!scheduled_by(id, full_name)
            `)
            .eq('submission_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('scheduled_at', { ascending: false })
            .limit(20),

          // Submission feedback
          adminClient
            .from('submission_feedback')
            .select(`
              *,
              createdBy:user_profiles!created_by(id, full_name, avatar_url)
            `)
            .eq('submission_id', input.id)
            .order('created_at', { ascending: false })
            .limit(50),

          // Activities (polymorphic)
          adminClient
            .from('activities')
            .select(`
              *,
              creator:user_profiles!created_by(id, full_name, avatar_url),
              assignee:user_profiles!assignee_id(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'submission')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(100),

          // Notes (polymorphic)
          adminClient
            .from('notes')
            .select(`
              *,
              creator:user_profiles!created_by(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'submission')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Documents (polymorphic)
          adminClient
            .from('documents')
            .select('*')
            .eq('entity_type', 'submission')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Status history
          adminClient
            .from('submission_status_history')
            .select(`
              *,
              changedBy:user_profiles!changed_by(id, full_name, avatar_url)
            `)
            .eq('submission_id', input.id)
            .order('changed_at', { ascending: false })
            .limit(100),
        ])

        if (submissionResult.error) {
          console.error('[getFullSubmission] Error:', submissionResult.error)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Submission not found',
          })
        }

        const submission = submissionResult.data
        if (!submission) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Submission not found',
          })
        }

        // Extract account from job's clientCompany or company
        const account = submission.job?.clientCompany || submission.job?.company || null

        return {
          ...submission,
          account,
          sections: {
            interviews: {
              items: interviewsResult.data || [],
              total: interviewsResult.data?.length || 0,
            },
            feedback: {
              items: feedbackResult.data || [],
              total: feedbackResult.data?.length || 0,
            },
            activities: {
              items: activitiesResult.data || [],
              total: activitiesResult.data?.length || 0,
            },
            notes: {
              items: notesResult.data || [],
              total: notesResult.data?.length || 0,
            },
            documents: {
              items: documentsResult.data || [],
              total: documentsResult.data?.length || 0,
            },
            history: {
              items: historyResult.data || [],
              total: historyResult.data?.length || 0,
            },
          },
        }
      }),

    // Get submission stats
    getStats: orgProtectedProcedure
      .input(z.object({
        recruiterId: z.string().uuid().optional(),
        period: z.enum(['week', 'month', 'sprint', 'all']).default('month'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const recruiterId = input.recruiterId || user?.id

        let startDate: Date | null = null
        const now = new Date()

        if (input.period === 'week') {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 7)
        } else if (input.period === 'month') {
          startDate = new Date(now)
          startDate.setMonth(startDate.getMonth() - 1)
        } else if (input.period === 'sprint') {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 14)
        }

        let query = adminClient
          .from('submissions')
          .select('id, status, submitted_at')
          .eq('org_id', orgId)
          .eq('submitted_by', recruiterId)
          .is('deleted_at', null)

        if (startDate) {
          query = query.gte('submitted_at', startDate.toISOString())
        }

        const { data: submissions } = await query

        const byStatus: Record<string, number> = {}
        submissions?.forEach(s => {
          byStatus[s.status] = (byStatus[s.status] || 0) + 1
        })

        return {
          total: submissions?.length ?? 0,
          byStatus,
          pending: byStatus['submitted'] ?? 0,
          interviewing: byStatus['interviewing'] ?? 0,
          offered: byStatus['offered'] ?? 0,
          placed: byStatus['placed'] ?? 0,
          rejected: byStatus['rejected'] ?? 0,
        }
      }),

    // Get pending submissions (awaiting feedback)
    getPending: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('submissions')
          .select(`
            id, status, submitted_at, submitted_rate,
            job:jobs(id, title, company:companies!jobs_company_id_fkey(id, name)),
            candidate:user_profiles!submissions_candidate_id_fkey(id, full_name, email)
          `)
          .eq('org_id', orgId)
          .eq('submitted_by', user?.id)
          .eq('status', 'submitted')
          .is('deleted_at', null)
          .order('submitted_at', { ascending: true })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(s => {
          const submittedAt = new Date(s.submitted_at)
          const now = new Date()
          const daysPending = Math.floor((now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24))

          return {
            ...s,
            daysPending,
            isStale: daysPending > 3,
          }
        }) ?? []
      }),

    // ============================================
    // SUBMISSION MUTATIONS - CREATE, UPDATE, STATUS
    // ============================================

    // Valid submission status transitions
    // sourced -> screening -> submission_ready -> submitted_to_client -> client_review -> client_interview -> offer_stage -> placed
    // Any stage can go to: rejected, withdrawn

    // Create a new submission (add candidate to job pipeline)
    create: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid(),
        candidateId: z.string().uuid(),
        status: z.enum(['sourced', 'screening']).default('sourced'),
        aiMatchScore: z.number().min(0).max(100).optional(),
        recruiterMatchScore: z.number().min(0).max(100).optional(),
        matchExplanation: z.string().max(1000).optional(),
        submittedRate: z.number().positive().optional(),
        submittedRateType: z.enum(['hourly', 'daily', 'annual']).optional(),
        submissionNotes: z.string().max(2000).optional(),
        // Resume ID for tracking which version was submitted
        clientResumeFileId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Look up user_profiles.id from auth_id for FK constraints
        // The submissions table has FK constraints (owner_id, created_by) that reference user_profiles(id)
        const { data: userProfile, error: userProfileError } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (userProfileError || !userProfile) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User profile not found' })
        }

        const userProfileId = userProfile.id

        // Check for duplicate submission (same candidate to same job, not withdrawn)
        const { data: existing } = await adminClient
          .from('submissions')
          .select('id, status')
          .eq('org_id', orgId)
          .eq('job_id', input.jobId)
          .eq('candidate_id', input.candidateId)
          .neq('status', 'withdrawn')
          .is('deleted_at', null)
          .single()

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Candidate has already been submitted to this job'
          })
        }

        // Verify job exists
        const { data: job, error: jobError } = await adminClient
          .from('jobs')
          .select('id, title, status')
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .single()

        if (jobError || !job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        // Allow adding candidates to draft, open, and active jobs
        if (['closed', 'cancelled', 'filled'].includes(job.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot add candidates to job with status: ${job.status}`
          })
        }

        // Verify candidate exists
        const { data: candidate, error: candidateError } = await adminClient
          .from('user_profiles')
          .select('id, first_name, last_name')
          .eq('id', input.candidateId)
          .single()

        if (candidateError || !candidate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidate not found' })
        }

        // Create submission record
        const { data: submission, error: submissionError } = await adminClient
          .from('submissions')
          .insert({
            org_id: orgId,
            job_id: input.jobId,
            candidate_id: input.candidateId,
            status: input.status,
            ai_match_score: input.aiMatchScore,
            recruiter_match_score: input.recruiterMatchScore,
            match_explanation: input.matchExplanation,
            submitted_rate: input.submittedRate,
            submitted_rate_type: input.submittedRateType,
            submission_notes: input.submissionNotes,
            client_resume_file_id: input.clientResumeFileId,
            owner_id: userProfileId,
            created_by: userProfileId,
          })
          .select('id, status, created_at')
          .single()

        if (submissionError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: submissionError.message })
        }

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'submission',
            entity_id: submission.id,
            activity_type: 'created',
            description: `${candidate.first_name} ${candidate.last_name} added to pipeline for ${job.title}`,
            created_by: userProfileId,
            created_at: new Date().toISOString(),
            metadata: {
              job_id: input.jobId,
              candidate_id: input.candidateId,
              initial_status: input.status,
            },
          })

        return {
          id: submission.id,
          status: submission.status,
          createdAt: submission.created_at,
          candidate: { id: candidate.id, name: `${candidate.first_name} ${candidate.last_name}` },
          job: { id: job.id, title: job.title },
        }
      }),

    // Update submission details (rates, notes, scores)
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        submittedRate: z.number().positive().optional(),
        submittedRateType: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']).optional(),
        payRate: z.number().positive().optional(),
        submissionNotes: z.string().max(1000).optional(),
        internalNotes: z.string().max(500).optional(),
        recruiterMatchScore: z.number().min(0).max(100).optional(),
        matchExplanation: z.string().max(1000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Verify submission exists
        const { data: existing, error: existingError } = await adminClient
          .from('submissions')
          .select('id, status')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (existingError || !existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' })
        }

        // Build update object (only include provided fields)
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (input.submittedRate !== undefined) updateData.submitted_rate = input.submittedRate
        if (input.submittedRateType !== undefined) updateData.submitted_rate_type = input.submittedRateType
        if (input.payRate !== undefined) updateData.pay_rate = input.payRate
        if (input.submissionNotes !== undefined) updateData.submission_notes = input.submissionNotes
        if (input.internalNotes !== undefined) updateData.internal_notes = input.internalNotes
        if (input.recruiterMatchScore !== undefined) updateData.recruiter_match_score = input.recruiterMatchScore
        if (input.matchExplanation !== undefined) updateData.match_explanation = input.matchExplanation

        const { data: updated, error: updateError } = await adminClient
          .from('submissions')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('id, status, updated_at')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        return updated
      }),

    // Update submission status with validation
    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum([
          'sourced', 'screening', 'submission_ready', 'submitted_to_client',
          'client_review', 'client_interview', 'offer_stage', 'placed', 'rejected', 'withdrawn'
        ]),
        reason: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get current submission with job info
        const { data: submission, error: fetchError } = await adminClient
          .from('submissions')
          .select(`
            id, status, job_id, candidate_id,
            job:jobs(id, title),
            candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !submission) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' })
        }

        const oldStatus = submission.status

        // Check for blocking activities when moving to closing statuses
        const closingStatuses = ['rejected', 'withdrawn', 'declined']
        if (closingStatuses.includes(input.status)) {
          const blockCheck = await checkBlockingActivities({
            entityType: 'submission',
            entityId: input.id,
            targetStatus: input.status,
            orgId,
            supabase: adminClient,
          })
          if (blockCheck.blocked) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message: `Cannot change status to ${input.status}: ${blockCheck.activities.length} blocking ${blockCheck.activities.length === 1 ? 'activity' : 'activities'} must be completed first`,
              cause: { blockingActivities: blockCheck.activities },
            })
          }
        }

        // Validate status transition using exported constant
        if (!isValidSubmissionTransition(oldStatus, input.status)) {
          const allowedNextStatuses = SUBMISSION_STATUS_TRANSITIONS[oldStatus] || []
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot transition from '${oldStatus}' to '${input.status}'. Allowed: ${allowedNextStatuses.join(', ') || 'none'}`
          })
        }

        // Build update data with timestamps for specific transitions
        const updateData: Record<string, unknown> = {
          status: input.status,
          updated_at: new Date().toISOString(),
        }

        // Set timestamps based on status
        if (input.status === 'submitted_to_client' && oldStatus !== 'submitted_to_client') {
          updateData.submitted_to_client_at = new Date().toISOString()
          updateData.submitted_to_client_by = user.id
        }
        if (input.status === 'client_interview' && oldStatus !== 'client_interview') {
          updateData.interview_count = 1 // Will be updated by interview scheduling
        }
        if (input.status === 'rejected') {
          updateData.rejection_reason = input.reason
          updateData.rejected_at = new Date().toISOString()
          updateData.rejected_by = user.id
        }
        if (input.status === 'withdrawn') {
          updateData.withdrawn_at = new Date().toISOString()
          updateData.withdrawn_by = user.id
          updateData.withdrawal_reason = input.reason
        }

        // Update submission
        const { data: updated, error: updateError } = await adminClient
          .from('submissions')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('id, status, updated_at')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Record status history (ignore errors if table doesn't exist)
        await adminClient
          .from('submission_status_history')
          .insert({
            org_id: orgId,
            submission_id: input.id,
            from_status: oldStatus,
            to_status: input.status,
            changed_by: user.id,
            reason: input.reason,
          })

        // Log activity
        const jobArray = submission.job as Array<{ id: string; title: string }> | null
        const job = jobArray?.[0] ?? null
        const candidateArray = submission.candidate as Array<{ id: string; first_name: string; last_name: string }> | null
        const candidate = candidateArray?.[0] ?? null

        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'submission',
            entity_id: input.id,
            activity_type: 'status_changed',
            description: `Status changed from ${oldStatus} to ${input.status}${input.reason ? ': ' + input.reason : ''}`,
            created_by: user.id,
            created_at: new Date().toISOString(),
            metadata: {
              job_id: job?.id,
              candidate_name: candidate ? `${candidate.first_name} ${candidate.last_name}` : null,
              old_status: oldStatus,
              new_status: input.status,
              reason: input.reason,
            },
          })

        return updated
      }),

    // Submit candidate to client (F01 main flow)
    submitToClient: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        resumeVersionId: z.string().uuid().optional(),
        payRate: z.number().positive(),
        billRate: z.number().positive(),
        submissionNotes: z.string().min(50).max(1000),
        internalNotes: z.string().max(500).optional(),
        submissionMethod: z.enum(['email', 'vms', 'manual']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get submission with related data
        const { data: submission, error: fetchError } = await adminClient
          .from('submissions')
          .select(`
            id, status, job_id, candidate_id,
            job:jobs(id, title, rate_min, rate_max,
              company:companies!jobs_company_id_fkey(id, name)
            ),
            candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name, email)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !submission) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' })
        }

        // Validate status - must be in screening or submission_ready
        if (!['screening', 'submission_ready', 'sourced'].includes(submission.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot submit from status '${submission.status}'. Must be in screening or submission_ready.`
          })
        }

        // Validate rates - bill rate must be greater than pay rate for positive margin
        if (input.billRate <= input.payRate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Bill rate must be greater than pay rate to ensure positive margin.'
          })
        }

        const jobArray = submission.job as Array<{
          id: string;
          title: string;
          rate_min?: number;
          rate_max?: number;
          company: Array<{ id: string; name: string }> | null;
        }> | null
        const job = jobArray?.[0] ?? null
        const candidateArray = submission.candidate as Array<{
          id: string;
          first_name: string;
          last_name: string;
          email: string;
        }> | null
        const candidate = candidateArray?.[0] ?? null

        // Calculate margin
        const marginAmount = input.billRate - input.payRate
        const marginPercent = (marginAmount / input.billRate) * 100

        // Update submission
        const { data: updated, error: updateError } = await adminClient
          .from('submissions')
          .update({
            status: 'submitted_to_client',
            submitted_rate: input.billRate,
            submitted_rate_type: 'hourly',
            negotiated_pay_rate: input.payRate,
            negotiated_bill_rate: input.billRate,
            submission_notes: input.submissionNotes,
            submitted_to_client_at: new Date().toISOString(),
            submitted_to_client_by: user.id,
            rate_negotiation_notes: JSON.stringify({
              method: input.submissionMethod,
              internal_notes: input.internalNotes || null,
              margin_amount: marginAmount.toFixed(2),
              margin_percent: marginPercent.toFixed(2),
            }),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('id, status, submitted_to_client_at')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Record status history (ignore errors if table doesn't exist)
        await adminClient
          .from('submission_status_history')
          .insert({
            org_id: orgId,
            submission_id: input.id,
            from_status: submission.status,
            to_status: 'submitted_to_client',
            changed_by: user.id,
            reason: `Submitted via ${input.submissionMethod}`,
          })

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'submission',
            entity_id: input.id,
            activity_type: 'submitted_to_client',
            description: `${candidate?.first_name} ${candidate?.last_name} submitted to ${job?.company?.[0]?.name} for ${job?.title}`,
            created_by: user.id,
            created_at: new Date().toISOString(),
            metadata: {
              job_id: job?.id,
              job_title: job?.title,
              candidate_id: candidate?.id,
              candidate_name: candidate ? `${candidate.first_name} ${candidate.last_name}` : null,
              company_name: job?.company?.[0]?.name,
              bill_rate: input.billRate,
              pay_rate: input.payRate,
              margin_percent: marginPercent,
              submission_method: input.submissionMethod,
            },
          })

        // If manual submission, create follow-up task
        if (input.submissionMethod === 'manual') {
          const dueAt = new Date()
          dueAt.setHours(dueAt.getHours() + 4)

          await adminClient
            .from('tasks')
            .insert({
              org_id: orgId,
              title: `Confirm external submission: ${candidate?.first_name} ${candidate?.last_name} to ${job?.company?.[0]?.name}`,
              description: 'Please confirm you have submitted this candidate externally and update the submission status.',
              entity_type: 'submission',
              entity_id: input.id,
              assigned_to: user.id,
              due_at: dueAt.toISOString(),
              priority: 'high',
              status: 'pending',
              created_by: user.id,
              created_at: new Date().toISOString(),
            })
        }

        return {
          id: updated.id,
          status: updated.status,
          submittedAt: updated.submitted_to_client_at,
          method: input.submissionMethod,
          candidate: candidate ? { id: candidate.id, name: `${candidate.first_name} ${candidate.last_name}` } : null,
          job: job ? { id: job.id, title: job.title, account: job.company?.[0]?.name } : null,
        }
      }),

    // Record client feedback on submission (F02 Step 3)
    recordFeedback: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        feedbackType: z.enum(['move_forward', 'hold', 'reject']),
        feedbackSummary: z.string().min(10).max(1000),
        rejectionReason: z.string().max(500).optional(),
        nextSteps: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get current submission
        const { data: submission, error: fetchError } = await adminClient
          .from('submissions')
          .select(`
            id, status, job_id, candidate_id,
            job:jobs(id, title),
            candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !submission) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' })
        }

        const oldStatus = submission.status

        // Determine new status based on feedback type
        let newStatus = submission.status
        if (input.feedbackType === 'move_forward') {
          // Move to next stage
          if (oldStatus === 'submitted_to_client') newStatus = 'client_review'
          else if (oldStatus === 'client_review') newStatus = 'client_interview'
          else if (oldStatus === 'client_interview') newStatus = 'offer_stage'
        } else if (input.feedbackType === 'reject') {
          newStatus = 'rejected'
        }
        // 'hold' keeps the same status

        // Update submission
        const updateData: Record<string, unknown> = {
          client_feedback: input.feedbackSummary,
          client_feedback_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        if (newStatus !== oldStatus) {
          updateData.status = newStatus
        }

        if (input.feedbackType === 'reject' && input.rejectionReason) {
          updateData.rejection_reason = input.rejectionReason
          updateData.rejected_at = new Date().toISOString()
          updateData.rejected_by = user.id
        }

        const { data: updated, error: updateError } = await adminClient
          .from('submissions')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('id, status, updated_at')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Log activity
        const jobArray2 = submission.job as Array<{ id: string; title: string }> | null
        const job = jobArray2?.[0] ?? null
        const candidateArray2 = submission.candidate as Array<{ id: string; first_name: string; last_name: string }> | null
        const candidate = candidateArray2?.[0] ?? null

        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'submission',
            entity_id: input.id,
            activity_type: 'feedback_received',
            description: `Client feedback: ${input.feedbackType.replace('_', ' ')}${newStatus !== oldStatus ? ` - moved to ${newStatus}` : ''}`,
            created_by: user.id,
            created_at: new Date().toISOString(),
            metadata: {
              job_id: job?.id,
              candidate_name: candidate ? `${candidate.first_name} ${candidate.last_name}` : null,
              feedback_type: input.feedbackType,
              old_status: oldStatus,
              new_status: newStatus,
              feedback_summary: input.feedbackSummary,
            },
          })

        return {
          id: updated.id,
          status: updated.status,
          feedbackType: input.feedbackType,
          statusChanged: newStatus !== oldStatus,
        }
      }),

    // ============================================
    // SUBMISSIONS-01: UNIFIED FEEDBACK
    // ============================================

    // Get feedback for a submission
    getFeedback: orgProtectedProcedure
      .input(z.object({ submissionId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('submission_feedback')
          .select(`
            *,
            providedByUser:user_profiles!provided_by_user_id(id, full_name, avatar_url),
            providedByContact:contacts!provided_by_contact_id(id, full_name),
            interview:interviews!interview_id(id, interview_type, scheduled_start)
          `)
          .eq('org_id', orgId)
          .eq('submission_id', input.submissionId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Add feedback to a submission
    addFeedback: orgProtectedProcedure
      .input(z.object({
        submissionId: z.string().uuid(),
        feedbackType: z.enum(['screening', 'technical', 'client', 'reference', 'final']),
        feedbackSource: z.enum(['internal', 'client', 'vendor', 'reference']),
        providedByContactId: z.string().uuid().optional(),
        overallRating: z.number().int().min(1).max(5).optional(),
        recommendation: z.enum(['strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire']).optional(),
        feedbackText: z.string().max(5000).optional(),
        criteriaScores: z.record(z.number().min(1).max(5)).optional(),
        interviewId: z.string().uuid().optional(),
        interviewRound: z.number().int().optional(),
        isVisibleToClient: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { data: feedback, error } = await adminClient
          .from('submission_feedback')
          .insert({
            org_id: orgId,
            submission_id: input.submissionId,
            feedback_type: input.feedbackType,
            feedback_source: input.feedbackSource,
            provided_by_user_id: user.id,
            provided_by_contact_id: input.providedByContactId,
            overall_rating: input.overallRating,
            recommendation: input.recommendation,
            feedback_text: input.feedbackText,
            criteria_scores: input.criteriaScores,
            interview_id: input.interviewId,
            interview_round: input.interviewRound,
            is_visible_to_client: input.isVisibleToClient,
            created_at: now,
            updated_at: now,
          })
          .select('id, feedback_type, recommendation, overall_rating')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'submission',
          entity_id: input.submissionId,
          activity_type: 'feedback_added',
          subject: `${input.feedbackType} feedback added`,
          description: input.recommendation ? `Recommendation: ${input.recommendation.replace('_', ' ')}` : 'Feedback recorded',
          outcome: input.recommendation?.includes('hire') && !input.recommendation.includes('no_hire') ? 'positive' : input.recommendation?.includes('no_hire') ? 'negative' : 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: {
            feedback_id: feedback.id,
            feedback_type: input.feedbackType,
            feedback_source: input.feedbackSource,
            overall_rating: input.overallRating,
            recommendation: input.recommendation,
          },
        })

        return feedback
      }),

    // ============================================
    // SUBMISSIONS-01: RTR (Right to Represent) TRACKING
    // ============================================

    // Get RTR history for a submission
    getRtr: orgProtectedProcedure
      .input(z.object({ submissionId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('submission_rtr')
          .select(`
            *,
            contact:contacts!contact_id(id, full_name, primary_email),
            document:documents!document_id(id, file_name, file_url),
            createdBy:user_profiles!created_by(id, full_name)
          `)
          .eq('org_id', orgId)
          .eq('submission_id', input.submissionId)
          .order('created_at', { ascending: false })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Obtain RTR for a submission
    obtainRtr: orgProtectedProcedure
      .input(z.object({
        submissionId: z.string().uuid(),
        contactId: z.string().uuid(),
        rtrType: z.enum(['standard', 'exclusive', 'non_exclusive', 'verbal', 'written']).default('standard'),
        validityHours: z.number().int().min(1).max(720).default(72),
        documentId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date()
        const expiresAt = new Date(now.getTime() + input.validityHours * 60 * 60 * 1000)

        // Create RTR record
        const { data: rtr, error: rtrError } = await adminClient
          .from('submission_rtr')
          .insert({
            org_id: orgId,
            submission_id: input.submissionId,
            contact_id: input.contactId,
            rtr_type: input.rtrType,
            obtained_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            validity_hours: input.validityHours,
            document_id: input.documentId,
            status: 'active',
            created_at: now.toISOString(),
            created_by: user.id,
          })
          .select('id, rtr_type, expires_at')
          .single()

        if (rtrError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: rtrError.message })
        }

        // Update submission with RTR info
        await adminClient
          .from('submissions')
          .update({
            rtr_obtained: true,
            rtr_obtained_at: now.toISOString(),
            rtr_expires_at: expiresAt.toISOString(),
            rtr_document_id: input.documentId,
            updated_at: now.toISOString(),
          })
          .eq('id', input.submissionId)

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'submission',
          entity_id: input.submissionId,
          activity_type: 'rtr_obtained',
          subject: 'RTR obtained',
          description: `${input.rtrType.replace('_', ' ')} RTR obtained, valid for ${input.validityHours} hours`,
          outcome: 'positive',
          created_by: user.id,
          created_at: now.toISOString(),
          metadata: {
            rtr_id: rtr.id,
            rtr_type: input.rtrType,
            expires_at: expiresAt.toISOString(),
            validity_hours: input.validityHours,
          },
        })

        return {
          rtrId: rtr.id,
          rtrType: rtr.rtr_type,
          expiresAt: rtr.expires_at,
        }
      }),

    // Revoke RTR
    revokeRtr: orgProtectedProcedure
      .input(z.object({
        rtrId: z.string().uuid(),
        reason: z.string().max(500),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        // Fetch RTR first
        const { data: rtr, error: fetchError } = await adminClient
          .from('submission_rtr')
          .select('id, submission_id')
          .eq('id', input.rtrId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !rtr) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'RTR record not found' })
        }

        // Update RTR status
        const { error: updateError } = await adminClient
          .from('submission_rtr')
          .update({
            status: 'revoked',
            revoked_at: now,
            revoked_reason: input.reason,
          })
          .eq('id', input.rtrId)

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Update submission
        await adminClient
          .from('submissions')
          .update({
            rtr_obtained: false,
            updated_at: now,
          })
          .eq('id', rtr.submission_id)

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'submission',
          entity_id: rtr.submission_id,
          activity_type: 'rtr_revoked',
          subject: 'RTR revoked',
          description: input.reason,
          outcome: 'negative',
          created_by: user.id,
          created_at: now,
        })

        return { success: true }
      }),

    // Get by contact ID (replacing getByCandidate)
    getByContact: orgProtectedProcedure
      .input(z.object({
        contactId: z.string().uuid(),
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('submissions')
          .select(`
            id, status, submitted_at, submission_score, rtr_obtained,
            job:jobs(id, title, status, company:companies!jobs_company_id_fkey(id, name)),
            submittedBy:user_profiles!submitted_by(id, full_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .or(`contact_id.eq.${input.contactId},candidate_id.eq.${input.contactId}`)
          .is('deleted_at', null)
          .order('submitted_at', { ascending: false })

        if (input.status) {
          query = query.eq('status', input.status)
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),
  }),

  // ============================================
  // INTERVIEWS
  // ============================================
  interviews: router({
    // List interviews
    list: orgProtectedProcedure
      .input(z.object({
        submissionId: z.string().uuid().optional(),
        jobId: z.string().uuid().optional(),
        status: z.string().optional(),
        scheduledAfter: z.coerce.date().optional(),
        scheduledBefore: z.coerce.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // If filtering by jobId, we need to first get submission IDs for that job
        let submissionIds: string[] | null = null
        if (input.jobId) {
          const { data: submissions } = await adminClient
            .from('submissions')
            .select('id')
            .eq('job_id', input.jobId)
            .eq('org_id', orgId)
          submissionIds = submissions?.map(s => s.id) ?? []
        }

        let query = adminClient
          .from('interviews')
          .select(`
            *,
            submission:submissions(
              id,
              job_id,
              job:jobs(id, title, company:companies!jobs_company_id_fkey(id, name)),
              candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name)
            )
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .order('scheduled_at', { ascending: true })

        if (input.submissionId) {
          query = query.eq('submission_id', input.submissionId)
        }
        if (submissionIds !== null) {
          if (submissionIds.length === 0) {
            // No submissions for this job, return empty
            return { items: [], total: 0 }
          }
          query = query.in('submission_id', submissionIds)
        }
        if (input.status) {
          query = query.eq('status', input.status)
        }
        if (input.scheduledAfter) {
          query = query.gte('scheduled_at', input.scheduledAfter.toISOString())
        }
        if (input.scheduledBefore) {
          query = query.lt('scheduled_at', input.scheduledBefore.toISOString())
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Get upcoming interviews (for recruiter)
    getUpcoming: orgProtectedProcedure
      .input(z.object({
        days: z.number().min(1).max(30).default(7),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const now = new Date()
        const endDate = new Date(now)
        endDate.setDate(endDate.getDate() + input.days)

        const { data, error } = await adminClient
          .from('interviews')
          .select(`
            id, scheduled_at, interview_type, duration_minutes, status, location,
            submission:submissions!inner(
              id, owner_id,
              job:jobs(id, title, company:companies!jobs_company_id_fkey(id, name)),
              candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name, phone, email)
            )
          `)
          .eq('org_id', orgId)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', endDate.toISOString())
          .in('status', ['scheduled', 'confirmed'])
          .order('scheduled_at', { ascending: true })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Filter for this recruiter's submissions
        const filteredData = data?.filter(i => {
          const submissionArray = i.submission as Array<{ owner_id: string }> | null
          const submission = submissionArray?.[0]
          return submission?.owner_id === user?.id
        }) ?? []

        return filteredData.map(i => ({
          id: i.id,
          scheduledAt: i.scheduled_at,
          interviewType: i.interview_type,
          durationMinutes: i.duration_minutes,
          status: i.status,
          location: i.location,
          submission: i.submission,
        }))
      }),

    // Get this week's interviews count
    getThisWeekCount: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(endOfWeek.getDate() + 7)

        // First get submissions for this recruiter
        const { data: submissions } = await adminClient
          .from('submissions')
          .select('id')
          .eq('org_id', orgId)
          .eq('submitted_by', user?.id)

        const submissionIds = submissions?.map(s => s.id) ?? []

        if (submissionIds.length === 0) {
          return { total: 0, scheduled: 0, completed: 0 }
        }

        const { data: interviews } = await adminClient
          .from('interviews')
          .select('id, status')
          .eq('org_id', orgId)
          .in('submission_id', submissionIds)
          .gte('scheduled_at', startOfWeek.toISOString())
          .lt('scheduled_at', endOfWeek.toISOString())

        return {
          total: interviews?.length ?? 0,
          scheduled: interviews?.filter(i => i.status === 'scheduled' || i.status === 'confirmed').length ?? 0,
          completed: interviews?.filter(i => i.status === 'completed').length ?? 0,
        }
      }),

    // ============================================
    // INTERVIEW MUTATIONS - SCHEDULE, CONFIRM, CANCEL, FEEDBACK
    // ============================================

    // Get interview by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('interviews')
          .select(`
            *,
            submission:submissions(
              id, status,
              job:jobs(id, title, company:companies!jobs_company_id_fkey(id, name)),
              candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name, email, phone)
            ),
            scheduled_by_user:user_profiles!scheduled_by(id, full_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Interview not found' })
        }

        return data
      }),

    // Get full interview with all section data (ONE database call pattern)
    getFullInterview: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Parallel queries for all section data
        const [
          interviewResult,
          participantsResult,
          scorecardsResult,
          legacyFeedbackResult,
          activitiesResult,
          notesResult,
          documentsResult,
          historyResult,
        ] = await Promise.all([
          // Interview with submission, candidate, job, account relations
          adminClient
            .from('interviews')
            .select(`
              *,
              submission:submissions!submission_id(
                id, status, submitted_at, bill_rate, pay_rate, match_score,
                candidate:user_profiles!submissions_candidate_id_fkey(
                  id, first_name, last_name, full_name, email, phone,
                  avatar_url, title, linkedin_url, location_city, location_state
                ),
                job:jobs!submissions_job_id_fkey(
                  id, title, status, job_type, location_type,
                  location_city, location_state, min_bill_rate, max_bill_rate
                ),
                owner:user_profiles!owner_id(id, full_name, avatar_url)
              ),
              job:jobs!job_id(
                id, title, status,
                account:companies!jobs_company_id_fkey(id, name, industry, website),
                clientCompany:companies!client_company_id(id, name)
              ),
              scheduledBy:user_profiles!scheduled_by(id, full_name, avatar_url)
            `)
            .eq('id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .single(),

          // Participants (modern table)
          adminClient
            .from('interview_participants')
            .select(`
              *,
              user:user_profiles!interview_participants_user_id_fkey(id, full_name, email, avatar_url)
            `)
            .eq('interview_id', input.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: true }),

          // Scorecards (structured feedback)
          adminClient
            .from('interview_scorecards')
            .select(`
              *,
              submittedBy:user_profiles!interview_scorecards_submitted_by_fkey(id, full_name, avatar_url)
            `)
            .eq('interview_id', input.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false }),

          // Legacy feedback
          adminClient
            .from('interview_feedback')
            .select(`
              *,
              interviewer:user_profiles!interview_feedback_submitted_by_fkey(id, full_name, avatar_url)
            `)
            .eq('interview_id', input.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false }),

          // Activities (polymorphic)
          adminClient
            .from('activities')
            .select(`
              *,
              creator:user_profiles!created_by(id, full_name, avatar_url),
              assignee:user_profiles!assignee_id(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'interview')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Notes (polymorphic)
          adminClient
            .from('notes')
            .select(`
              *,
              creator:user_profiles!created_by(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'interview')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Documents (polymorphic)
          adminClient
            .from('documents')
            .select(`
              *,
              uploadedBy:user_profiles!uploaded_by(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'interview')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // History (activities filtered by system type)
          adminClient
            .from('activities')
            .select(`
              *,
              creator:user_profiles!created_by(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'interview')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .in('activity_type', ['status_change', 'created', 'updated', 'rescheduled', 'cancelled'])
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(100),
        ])

        if (interviewResult.error || !interviewResult.data) {
          console.error('[getFullInterview] Error:', interviewResult.error)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Interview not found',
          })
        }

        const interview = interviewResult.data

        // Merge participants: prefer modern table, fallback to legacy arrays
        const participants = participantsResult.data?.length
          ? participantsResult.data.map((p: any) => ({
              id: p.id,
              interview_id: p.interview_id,
              participant_type: p.participant_type || 'interviewer',
              name: p.user?.full_name || p.external_name || 'Unknown',
              email: p.user?.email || p.external_email || null,
              role: p.role || p.participant_type || 'interviewer',
              title: p.user?.title || null,
              is_required: p.is_required ?? true,
              response_status: p.is_confirmed ? 'accepted' : 'pending',
              responded_at: p.confirmed_at || null,
              avatar_url: p.user?.avatar_url || null,
              created_at: p.created_at,
            }))
          : (interview.interviewer_names || []).map((name: string, i: number) => ({
              id: `legacy-${i}`,
              interview_id: interview.id,
              participant_type: 'interviewer',
              name,
              email: interview.interviewer_emails?.[i] || null,
              role: 'interviewer',
              title: null,
              is_required: true,
              response_status: 'pending',
              responded_at: null,
              avatar_url: null,
              created_at: interview.created_at,
            }))

        // Unify feedback from both sources
        const feedback = [
          ...(scorecardsResult.data || []).map((sc: any) => ({
            id: sc.id,
            source: 'scorecard' as const,
            overall_rating: sc.overall_rating,
            recommendation: sc.recommendation,
            strengths: sc.strengths,
            concerns: sc.concerns,
            criteria_scores: sc.criteria_scores,
            feedback: sc.additional_notes,
            submittedBy: sc.submittedBy,
            created_at: sc.created_at,
          })),
          ...(legacyFeedbackResult.data || []).map((fb: any) => ({
            id: fb.id,
            source: 'legacy' as const,
            rating: fb.rating,
            recommendation: fb.recommendation,
            strengths: fb.strengths,
            concerns: fb.weaknesses,
            feedback: fb.notes,
            interviewer: fb.interviewer,
            created_at: fb.created_at,
          })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        // Extract account from job relation
        const account = interview.job?.account || interview.job?.clientCompany || null

        return {
          ...interview,
          account,
          sections: {
            participants: {
              items: participants,
              total: participants.length,
            },
            feedback: {
              items: feedback,
              total: feedback.length,
              hasScorecard: (scorecardsResult.data?.length || 0) > 0,
              hasLegacy: (legacyFeedbackResult.data?.length || 0) > 0,
            },
            activities: {
              items: activitiesResult.data || [],
              total: activitiesResult.data?.length || 0,
            },
            notes: {
              items: notesResult.data || [],
              total: notesResult.data?.length || 0,
            },
            documents: {
              items: documentsResult.data || [],
              total: documentsResult.data?.length || 0,
            },
            history: {
              items: historyResult.data || [],
              total: historyResult.data?.length || 0,
            },
          },
        }
      }),

    // Schedule a new interview (F03)
    schedule: orgProtectedProcedure
      .input(z.object({
        submissionId: z.string().uuid(),
        interviewType: z.enum([
          'phone_screen', 'video_call', 'in_person', 'panel',
          'technical', 'behavioral', 'final_round'
        ]),
        roundNumber: z.number().int().min(1).max(10),
        durationMinutes: z.number().int().min(15).max(480),
        timezone: z.string().default('America/New_York'),
        proposedTimes: z.array(z.object({
          date: z.string(), // YYYY-MM-DD
          time: z.string(), // HH:MM
        })).min(1).max(5),
        interviewers: z.array(z.object({
          name: z.string().max(100),
          email: z.string().email(),
          title: z.string().max(100).optional(),
        })).min(1).max(10),
        meetingLink: z.string().url().optional(),
        meetingLocation: z.string().max(200).optional(),
        // Structured location fields for centralized addresses (in-person interviews)
        locationCity: z.string().max(100).optional(),
        locationState: z.string().max(100).optional(),
        locationCountry: z.string().max(3).default('US').optional(),
        description: z.string().max(500).optional(),
        internalNotes: z.string().max(1000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get submission with job and candidate info
        const { data: submission, error: submissionError } = await adminClient
          .from('submissions')
          .select(`
            id, status, job_id, candidate_id,
            job:jobs(id, title, company:companies!jobs_company_id_fkey(id, name)),
            candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name, email)
          `)
          .eq('id', input.submissionId)
          .eq('org_id', orgId)
          .single()

        if (submissionError || !submission) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' })
        }

        // Check if interview already exists for this round
        const { data: existingInterview } = await adminClient
          .from('interviews')
          .select('id')
          .eq('org_id', orgId)
          .eq('submission_id', input.submissionId)
          .eq('round_number', input.roundNumber)
          .neq('status', 'cancelled')
          .single()

        if (existingInterview) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Round ${input.roundNumber} interview already exists for this submission`
          })
        }

        // Validate meeting link requirement for video calls
        if (['video_call', 'panel'].includes(input.interviewType) && !input.meetingLink) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Meeting link is required for video/panel interviews'
          })
        }

        // Validate meeting location for in-person
        if (input.interviewType === 'in_person' && !input.meetingLocation) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Meeting location is required for in-person interviews'
          })
        }

        // Parse proposed times and find the first one for scheduled_at
        const proposedTimesJson = input.proposedTimes.map((pt, idx) => ({
          id: `${Date.now()}-${idx}`,
          date: pt.date,
          time: pt.time,
          timezone: input.timezone,
          status: 'pending',
        }))

        // Use first proposed time as initial scheduled_at
        const firstTime = input.proposedTimes[0]
        const scheduledAt = new Date(`${firstTime.date}T${firstTime.time}:00`)

        // Create interview record
        const { data: interview, error: interviewError } = await adminClient
          .from('interviews')
          .insert({
            org_id: orgId,
            submission_id: input.submissionId,
            job_id: submission.job_id,
            candidate_id: submission.candidate_id,
            round_number: input.roundNumber,
            interview_type: input.interviewType,
            duration_minutes: input.durationMinutes,
            timezone: input.timezone,
            scheduled_at: scheduledAt.toISOString(),
            meeting_link: input.meetingLink,
            location: input.meetingLocation,
            description: input.description,
            internal_notes: input.internalNotes,
            interviewer_names: input.interviewers.map(i => i.name),
            interviewer_emails: input.interviewers.map(i => i.email),
            status: input.proposedTimes.length > 1 ? 'proposed' : 'scheduled',
            scheduled_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            proposed_times: proposedTimesJson,
          })
          .select('id, status, scheduled_at')
          .single()

        if (interviewError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: interviewError.message })
        }

        // Create address record for in-person interviews if structured location provided
        if (input.interviewType === 'in_person' && (input.locationCity || input.locationState)) {
          await adminClient
            .from('addresses')
            .insert({
              org_id: orgId,
              entity_type: 'interview',
              entity_id: interview.id,
              address_type: 'meeting',
              city: input.locationCity || null,
              state_province: input.locationState || null,
              country_code: input.locationCountry || 'US',
              is_primary: true,
              notes: `Interview location for ${input.interviewType.replace(/_/g, ' ')}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
        }

        // Update submission status if needed
        if (!['client_interview', 'interviewing'].includes(submission.status)) {
          await adminClient
            .from('submissions')
            .update({
              status: 'client_interview',
              interview_count: 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', input.submissionId)
            .eq('org_id', orgId)
        } else {
          // Just increment interview count
          const { data: currentSubmission } = await adminClient
            .from('submissions')
            .select('interview_count')
            .eq('id', input.submissionId)
            .single()

          await adminClient
            .from('submissions')
            .update({
              interview_count: (currentSubmission?.interview_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', input.submissionId)
            .eq('org_id', orgId)
        }

        // Log activity
        const jobArray3 = submission.job as Array<{ id: string; title: string; company?: Array<{ id: string; name: string }> }> | null
        const job = jobArray3?.[0] ?? null
        const candidateArray3 = submission.candidate as Array<{ id: string; first_name: string; last_name: string; email?: string }> | null
        const candidate = candidateArray3?.[0] ?? null

        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'interview',
            entity_id: interview.id,
            activity_type: 'scheduled',
            description: `Round ${input.roundNumber} ${input.interviewType.replace(/_/g, ' ')} scheduled for ${candidate?.first_name} ${candidate?.last_name}`,
            created_by: user.id,
            created_at: new Date().toISOString(),
            metadata: {
              job_id: job?.id,
              job_title: job?.title,
              candidate_name: candidate ? `${candidate.first_name} ${candidate.last_name}` : null,
              round_number: input.roundNumber,
              interview_type: input.interviewType,
              proposed_times_count: input.proposedTimes.length,
            },
          })

        return {
          id: interview.id,
          status: interview.status,
          scheduledAt: interview.scheduled_at,
          proposedTimesCount: input.proposedTimes.length,
        }
      }),

    // Confirm a proposed interview time
    confirm: orgProtectedProcedure
      .input(z.object({
        interviewId: z.string().uuid(),
        confirmedDate: z.string(), // YYYY-MM-DD
        confirmedTime: z.string(), // HH:MM
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get interview
        const { data: interview, error: fetchError } = await adminClient
          .from('interviews')
          .select('id, status, proposed_times, submission_id')
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !interview) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Interview not found' })
        }

        if (interview.status !== 'proposed') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot confirm interview with status: ${interview.status}`
          })
        }

        const confirmedAt = new Date(`${input.confirmedDate}T${input.confirmedTime}:00`)

        // Update interview
        const { data: updated, error: updateError } = await adminClient
          .from('interviews')
          .update({
            status: 'scheduled',
            scheduled_at: confirmedAt.toISOString(),
            confirmed_at: new Date().toISOString(),
            confirmed_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .select('id, status, scheduled_at')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'interview',
            entity_id: input.interviewId,
            activity_type: 'confirmed',
            description: `Interview confirmed for ${input.confirmedDate} at ${input.confirmedTime}`,
            created_by: user.id,
            created_at: new Date().toISOString(),
            metadata: {
              confirmed_date: input.confirmedDate,
              confirmed_time: input.confirmedTime,
            },
          })

        return updated
      }),

    // Reschedule an interview
    reschedule: orgProtectedProcedure
      .input(z.object({
        interviewId: z.string().uuid(),
        reason: z.string().max(500),
        newProposedTimes: z.array(z.object({
          date: z.string(),
          time: z.string(),
        })).min(1).max(5),
        timezone: z.string().default('America/New_York'),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get interview
        const { data: interview, error: fetchError } = await adminClient
          .from('interviews')
          .select('id, status, scheduled_at')
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !interview) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Interview not found' })
        }

        if (['completed', 'cancelled'].includes(interview.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot reschedule ${interview.status} interview`
          })
        }

        const proposedTimesJson = input.newProposedTimes.map((pt, idx) => ({
          id: `${Date.now()}-${idx}`,
          date: pt.date,
          time: pt.time,
          timezone: input.timezone,
          status: 'pending',
        }))

        // Use first proposed time as new scheduled_at
        const firstTime = input.newProposedTimes[0]
        const newScheduledAt = new Date(`${firstTime.date}T${firstTime.time}:00`)

        // Update interview
        const { data: updated, error: updateError } = await adminClient
          .from('interviews')
          .update({
            status: input.newProposedTimes.length > 1 ? 'proposed' : 'scheduled',
            scheduled_at: newScheduledAt.toISOString(),
            proposed_times: proposedTimesJson,
            reschedule_reason: input.reason,
            rescheduled_at: new Date().toISOString(),
            rescheduled_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .select('id, status, scheduled_at')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'interview',
            entity_id: input.interviewId,
            activity_type: 'rescheduled',
            description: `Interview rescheduled: ${input.reason}`,
            created_by: user.id,
            created_at: new Date().toISOString(),
            metadata: {
              reason: input.reason,
              previous_scheduled_at: interview.scheduled_at,
              new_proposed_times_count: input.newProposedTimes.length,
            },
          })

        return updated
      }),

    // Cancel an interview
    cancel: orgProtectedProcedure
      .input(z.object({
        interviewId: z.string().uuid(),
        reason: z.enum([
          'candidate_withdrew', 'client_cancelled', 'position_filled',
          'candidate_not_qualified', 'scheduling_conflict', 'other'
        ]),
        notes: z.string().max(500).optional(),
        notifyParticipants: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get interview
        const { data: interview, error: fetchError } = await adminClient
          .from('interviews')
          .select('id, status, submission_id')
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !interview) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Interview not found' })
        }

        if (interview.status === 'cancelled') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Interview already cancelled' })
        }

        // Update interview
        const { data: updated, error: updateError } = await adminClient
          .from('interviews')
          .update({
            status: 'cancelled',
            cancellation_reason: input.reason,
            cancellation_notes: input.notes,
            cancelled_at: new Date().toISOString(),
            cancelled_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .select('id, status')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Decrement interview count on submission
        const { data: submission } = await adminClient
          .from('submissions')
          .select('interview_count')
          .eq('id', interview.submission_id)
          .single()

        if (submission && submission.interview_count > 0) {
          await adminClient
            .from('submissions')
            .update({
              interview_count: submission.interview_count - 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', interview.submission_id)
        }

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'interview',
            entity_id: input.interviewId,
            activity_type: 'cancelled',
            description: `Interview cancelled: ${input.reason.replace(/_/g, ' ')}`,
            created_by: user.id,
            created_at: new Date().toISOString(),
            metadata: {
              reason: input.reason,
              notes: input.notes,
              notify_participants: input.notifyParticipants,
            },
          })

        return updated
      }),

    // Add feedback after interview (F06)
    addFeedback: orgProtectedProcedure
      .input(z.object({
        interviewId: z.string().uuid(),
        attendanceStatus: z.enum(['attended', 'no_show', 'rescheduled']),
        rating: z.number().int().min(1).max(5),
        recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no']),
        feedback: z.string().min(10).max(2000),
        technicalRating: z.number().int().min(1).max(5).optional(),
        communicationRating: z.number().int().min(1).max(5).optional(),
        cultureFitRating: z.number().int().min(1).max(5).optional(),
        strengths: z.string().max(500).optional(),
        concerns: z.string().max(500).optional(),
        nextSteps: z.enum(['schedule_next_round', 'extend_offer', 'reject', 'on_hold']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get interview
        const { data: interview, error: fetchError } = await adminClient
          .from('interviews')
          .select(`
            id, status, submission_id, round_number,
            submission:submissions(id, status, candidate_id,
              candidate:user_profiles!submissions_candidate_id_fkey(first_name, last_name)
            )
          `)
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !interview) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Interview not found' })
        }

        // Update interview with feedback
        const { data: updated, error: updateError } = await adminClient
          .from('interviews')
          .update({
            status: input.attendanceStatus === 'no_show' ? 'no_show' : 'completed',
            rating: input.rating,
            recommendation: input.recommendation,
            feedback: input.feedback,
            technical_rating: input.technicalRating,
            communication_rating: input.communicationRating,
            culture_fit_rating: input.cultureFitRating,
            strengths: input.strengths,
            concerns: input.concerns,
            feedback_submitted_at: new Date().toISOString(),
            feedback_submitted_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .select('id, status, rating, recommendation')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Update submission status based on next steps
        const submissionArray = interview.submission as Array<{
          id: string;
          status: string;
          candidate_id: string;
          candidate: Array<{ first_name: string; last_name: string }> | null;
        }> | null
        const submission = submissionArray?.[0] ?? null

        if (input.nextSteps && submission) {
          let newStatus = submission.status

          if (input.nextSteps === 'extend_offer') {
            newStatus = 'offer_stage'
          } else if (input.nextSteps === 'reject') {
            newStatus = 'rejected'
          }

          if (newStatus !== submission.status) {
            await adminClient
              .from('submissions')
              .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
              })
              .eq('id', submission.id)
          }
        }

        // Log activity
        const candidate = submission?.candidate?.[0]
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'interview',
            entity_id: input.interviewId,
            activity_type: 'feedback_submitted',
            description: `Round ${interview.round_number} feedback: ${input.recommendation.replace(/_/g, ' ')} (${input.rating}/5)`,
            created_by: user.id,
            created_at: new Date().toISOString(),
            metadata: {
              candidate_name: candidate ? `${candidate.first_name} ${candidate.last_name}` : null,
              round_number: interview.round_number,
              rating: input.rating,
              recommendation: input.recommendation,
              next_steps: input.nextSteps,
            },
          })

        return {
          id: updated.id,
          status: updated.status,
          rating: updated.rating,
          recommendation: updated.recommendation,
          nextSteps: input.nextSteps,
        }
      }),

    // Get pending feedback interviews
    getPendingFeedback: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const now = new Date()

        const { data, error } = await adminClient
          .from('interviews')
          .select(`
            id, scheduled_at, interview_type, round_number, status,
            submission:submissions!inner(
              id, submitted_by,
              job:jobs(id, title, company:companies!jobs_company_id_fkey(id, name)),
              candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name)
            )
          `)
          .eq('org_id', orgId)
          .in('status', ['scheduled', 'confirmed'])
          .lt('scheduled_at', now.toISOString())
          .is('feedback', null)
          .order('scheduled_at', { ascending: true })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Filter for this recruiter's submissions
        const filteredData = data?.filter(i => {
          const submissionArray = i.submission as Array<{ submitted_by: string }> | null
          const submission = submissionArray?.[0]
          return submission?.submitted_by === user?.id
        }) ?? []

        return filteredData.map(i => {
          const scheduledAt = new Date(i.scheduled_at)
          const daysSince = Math.floor((now.getTime() - scheduledAt.getTime()) / (1000 * 60 * 60 * 24))

          return {
            ...i,
            daysSinceInterview: daysSince,
            isOverdue: daysSince > 2,
          }
        })
      }),

    // Complete interview prep (F04)
    completePrep: orgProtectedProcedure
      .input(z.object({
        interviewId: z.string().uuid(),
        prepNotes: z.string().max(2000).optional(),
        checklistCompleted: z.array(z.string()).default([]),
        sendMaterials: z.boolean().default(false),
        materialTypes: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Get interview
        const { data: interview, error: fetchError } = await adminClient
          .from('interviews')
          .select(`
            id, status, submission_id,
            submission:submissions(id,
              candidate:user_profiles!submissions_candidate_id_fkey(first_name, last_name, email)
            )
          `)
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !interview) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Interview not found' })
        }

        if (!['scheduled', 'confirmed', 'proposed'].includes(interview.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Interview is not in a valid state for prep completion'
          })
        }

        // Update interview with prep info
        const { data: updated, error: updateError } = await adminClient
          .from('interviews')
          .update({
            prep_completed_at: new Date().toISOString(),
            prep_completed_by: user.id,
            prep_notes: input.prepNotes,
            prep_checklist: input.checklistCompleted,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .select('id, prep_completed_at')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Log activity
        const submissionArray2 = interview.submission as Array<{
          id: string
          candidate: Array<{ first_name: string; last_name: string; email: string }> | null
        }> | null
        const submission = submissionArray2?.[0] ?? null
        const candidate = submission?.candidate?.[0]

        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'interview',
            entity_id: input.interviewId,
            activity_type: 'prep_completed',
            description: `Interview prep completed${input.sendMaterials ? ' - materials sent' : ''}`,
            created_by: user.id,
            created_at: new Date().toISOString(),
            metadata: {
              candidate_name: candidate ? `${candidate.first_name} ${candidate.last_name}` : null,
              checklist_items: input.checklistCompleted.length,
              materials_sent: input.sendMaterials,
              material_types: input.materialTypes,
            },
          })

        return {
          id: updated.id,
          prepCompletedAt: updated.prep_completed_at,
          materialsSent: input.sendMaterials,
        }
      }),

    // ============================================
    // INTERVIEWS-01: PARTICIPANT MANAGEMENT
    // ============================================

    // Get participants for an interview
    getParticipants: orgProtectedProcedure
      .input(z.object({ interviewId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('interview_participants')
          .select(`
            *,
            user:user_profiles!user_id(id, full_name, email, avatar_url),
            contact:contacts!contact_id(id, full_name, primary_email, phone)
          `)
          .eq('org_id', orgId)
          .eq('interview_id', input.interviewId)
          .order('created_at', { ascending: true })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Add participant to an interview
    addParticipant: orgProtectedProcedure
      .input(z.object({
        interviewId: z.string().uuid(),
        userId: z.string().uuid().optional(),
        contactId: z.string().uuid().optional(),
        role: z.enum(['lead_interviewer', 'interviewer', 'shadow', 'observer', 'note_taker', 'hiring_manager']).default('interviewer'),
        isRequired: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        if (!input.userId && !input.contactId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Either userId or contactId is required' })
        }

        const now = new Date().toISOString()

        const { data: participant, error } = await adminClient
          .from('interview_participants')
          .insert({
            org_id: orgId,
            interview_id: input.interviewId,
            user_id: input.userId,
            contact_id: input.contactId,
            role: input.role,
            is_required: input.isRequired,
            created_at: now,
            updated_at: now,
          })
          .select('id, role, is_required')
          .single()

        if (error) {
          if (error.code === '23505') { // unique constraint violation
            throw new TRPCError({ code: 'CONFLICT', message: 'Participant already added to this interview' })
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update interview to mark as panel if multiple participants
        const { count } = await adminClient
          .from('interview_participants')
          .select('id', { count: 'exact' })
          .eq('interview_id', input.interviewId)

        if (count && count > 1) {
          await adminClient
            .from('interviews')
            .update({ is_panel: true, updated_at: now })
            .eq('id', input.interviewId)
        }

        return participant
      }),

    // Remove participant from an interview
    removeParticipant: orgProtectedProcedure
      .input(z.object({ participantId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const { error } = await adminClient
          .from('interview_participants')
          .delete()
          .eq('id', input.participantId)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Confirm participant attendance
    confirmParticipant: orgProtectedProcedure
      .input(z.object({ participantId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { data, error } = await adminClient
          .from('interview_participants')
          .update({
            is_confirmed: true,
            confirmed_at: now,
            updated_at: now,
          })
          .eq('id', input.participantId)
          .eq('org_id', orgId)
          .select('id, is_confirmed')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Decline participant attendance
    declineParticipant: orgProtectedProcedure
      .input(z.object({
        participantId: z.string().uuid(),
        reason: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { data, error } = await adminClient
          .from('interview_participants')
          .update({
            is_confirmed: false,
            declined_at: now,
            decline_reason: input.reason,
            updated_at: now,
          })
          .eq('id', input.participantId)
          .eq('org_id', orgId)
          .select('id, is_confirmed, declined_at')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // ============================================
    // INTERVIEWS-01: SCORECARD MANAGEMENT
    // ============================================

    // Get scorecards for an interview
    getScorecards: orgProtectedProcedure
      .input(z.object({ interviewId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('interview_scorecards')
          .select(`
            *,
            submittedBy:user_profiles!submitted_by(id, full_name, avatar_url),
            participant:interview_participants!participant_id(id, role, user_id, contact_id)
          `)
          .eq('org_id', orgId)
          .eq('interview_id', input.interviewId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Submit a scorecard
    submitScorecard: orgProtectedProcedure
      .input(z.object({
        interviewId: z.string().uuid(),
        participantId: z.string().uuid().optional(),
        overallRating: z.number().int().min(1).max(5),
        recommendation: z.enum(['strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire']),
        criteriaScores: z.record(z.number().min(1).max(5)).default({}),
        strengths: z.array(z.string().max(500)).max(10).optional(),
        concerns: z.array(z.string().max(500)).max(10).optional(),
        additionalNotes: z.string().max(5000).optional(),
        questionsAsked: z.array(z.object({
          question: z.string(),
          answerQuality: z.number().int().min(1).max(5).optional(),
          notes: z.string().optional(),
        })).optional(),
        wouldWorkWith: z.boolean().optional(),
        wouldRecommendForDifferentRole: z.boolean().default(false),
        alternativeRoleNotes: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { data: scorecard, error } = await adminClient
          .from('interview_scorecards')
          .insert({
            org_id: orgId,
            interview_id: input.interviewId,
            participant_id: input.participantId,
            submitted_by: user.id,
            overall_rating: input.overallRating,
            recommendation: input.recommendation,
            criteria_scores: input.criteriaScores,
            strengths: input.strengths,
            concerns: input.concerns,
            additional_notes: input.additionalNotes,
            questions_asked: input.questionsAsked,
            would_work_with: input.wouldWorkWith,
            would_recommend_for_different_role: input.wouldRecommendForDifferentRole,
            alternative_role_notes: input.alternativeRoleNotes,
            is_submitted: true,
            submitted_at: now,
            created_at: now,
            updated_at: now,
          })
          .select('id, recommendation, overall_rating')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update participant feedback status if participant_id provided
        if (input.participantId) {
          await adminClient
            .from('interview_participants')
            .update({
              feedback_submitted: true,
              feedback_submitted_at: now,
              overall_rating: input.overallRating,
              recommendation: input.recommendation,
              updated_at: now,
            })
            .eq('id', input.participantId)
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'interview',
          entity_id: input.interviewId,
          activity_type: 'scorecard_submitted',
          subject: 'Scorecard submitted',
          description: `Recommendation: ${input.recommendation.replace('_', ' ')}, Rating: ${input.overallRating}/5`,
          outcome: input.recommendation.includes('hire') && !input.recommendation.includes('no_hire') ? 'positive' : input.recommendation.includes('no_hire') ? 'negative' : 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: {
            scorecard_id: scorecard.id,
            recommendation: input.recommendation,
            overall_rating: input.overallRating,
          },
        })

        return scorecard
      }),

    // Record hiring decision
    recordHiringDecision: orgProtectedProcedure
      .input(z.object({
        interviewId: z.string().uuid(),
        decision: z.enum(['strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire']),
        notes: z.string().max(2000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { data, error } = await adminClient
          .from('interviews')
          .update({
            hiring_decision: input.decision,
            decision_notes: input.notes,
            scorecard_completed: true,
            scorecard_completed_at: now,
            updated_at: now,
          })
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .select('id, hiring_decision')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'interview',
          entity_id: input.interviewId,
          activity_type: 'hiring_decision',
          subject: `Hiring decision: ${input.decision.replace('_', ' ')}`,
          description: input.notes || `Decision recorded: ${input.decision.replace('_', ' ')}`,
          outcome: input.decision.includes('hire') && !input.decision.includes('no_hire') ? 'positive' : input.decision.includes('no_hire') ? 'negative' : 'neutral',
          created_by: user.id,
          created_at: now,
        })

        return data
      }),

    // ============================================
    // INTERVIEWS-01: SCORECARD TEMPLATES
    // ============================================

    // List scorecard templates
    listScorecardTemplates: orgProtectedProcedure
      .input(z.object({
        interviewType: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('scorecard_templates')
          .select('*')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .eq('is_active', input.isActive)
          .order('created_at', { ascending: false })

        if (input.interviewType) {
          query = query.eq('interview_type', input.interviewType)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Create scorecard template
    createScorecardTemplate: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(1000).optional(),
        interviewType: z.string().max(50).optional(),
        jobCategory: z.string().max(100).optional(),
        criteria: z.array(z.object({
          key: z.string(),
          name: z.string(),
          description: z.string().optional(),
          weight: z.number().int().min(1).max(5).default(1),
        })).min(1),
        ratingScale: z.enum(['3', '4', '5', '10']).default('5'),
        ratingLabels: z.record(z.string()).optional(),
        requiredQuestions: z.array(z.object({
          question: z.string(),
          category: z.string().optional(),
        })).optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        // If setting as default, unset other defaults for same interview type
        if (input.isDefault && input.interviewType) {
          await adminClient
            .from('scorecard_templates')
            .update({ is_default: false, updated_at: now })
            .eq('org_id', orgId)
            .eq('interview_type', input.interviewType)
            .eq('is_default', true)
        }

        const { data: template, error } = await adminClient
          .from('scorecard_templates')
          .insert({
            org_id: orgId,
            name: input.name,
            description: input.description,
            interview_type: input.interviewType,
            job_category: input.jobCategory,
            criteria: input.criteria,
            rating_scale: parseInt(input.ratingScale),
            rating_labels: input.ratingLabels,
            required_questions: input.requiredQuestions,
            is_default: input.isDefault,
            is_active: true,
            created_by: user.id,
            created_at: now,
            updated_at: now,
          })
          .select('id, name')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return template
      }),

    // Get applicable scorecard template for an interview
    getApplicableScorecard: orgProtectedProcedure
      .input(z.object({ interviewId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Get interview details with job
        const { data: interview, error: interviewError } = await adminClient
          .from('interviews')
          .select(`
            id,
            interview_type,
            submission:submissions!inner(
              id,
              job:jobs!inner(id, job_category)
            )
          `)
          .eq('id', input.interviewId)
          .eq('org_id', orgId)
          .single()

        if (interviewError || !interview) {
          return null
        }

        // Get all active templates
        const { data: templates, error: templateError } = await adminClient
          .from('scorecard_templates')
          .select('*')
          .eq('org_id', orgId)
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })

        if (templateError || !templates || templates.length === 0) {
          return null
        }

        // Priority matching: interview_type > job_category > is_default > any
        const byType = templates.find((t) =>
          t.interview_type === interview.interview_type
        )
        if (byType) return byType

        // Supabase returns nested relations as arrays
        const submission = Array.isArray(interview.submission)
          ? interview.submission[0]
          : interview.submission
        const job = submission?.job
          ? (Array.isArray(submission.job) ? submission.job[0] : submission.job)
          : null
        const jobCategory = job?.job_category
        if (jobCategory) {
          const byCategory = templates.find((t) =>
            t.job_category === jobCategory
          )
          if (byCategory) return byCategory
        }

        const defaultTemplate = templates.find((t) => t.is_default)
        if (defaultTemplate) return defaultTemplate

        return templates[0]
      }),
  }),

  // ============================================
  // OFFERS ROUTER (G01-G02)
  // ============================================
  offers: router({
    // Get offer by ID
    getById: orgProtectedProcedure
      .input(z.object({ offerId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data: offer, error } = await adminClient
          .from('offers')
          .select(`
            *,
            submission:submissions!offers_submission_id_fkey(
              id, status,
              job:jobs!submissions_job_id_fkey(id, title,
                company:companies!jobs_company_id_fkey(id, name)
              ),
              candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name, email, phone)
            ),
            negotiations:offer_negotiations(id, initiated_by, proposed_terms, status, created_at),
            approvals:offer_approvals(id, approval_type, status, approver_id, responded_at)
          `)
          .eq('id', input.offerId)
          .eq('org_id', orgId)
          .single()

        if (error || !offer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' })
        }

        // Calculate margin
        const marginAmount = (offer.bill_rate || 0) - (offer.pay_rate || 0)
        const marginPercent = offer.bill_rate && offer.bill_rate > 0 ? (marginAmount / offer.bill_rate) * 100 : 0

        return {
          ...offer,
          marginAmount,
          marginPercent,
        }
      }),

    // Get full offer with all section data (ONE database call pattern)
    getFullOffer: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Main offer with relationships
        const { data: offer, error } = await adminClient
          .from('offers')
          .select(`
            *,
            submission:submissions!offers_submission_id_fkey(
              id, status, submitted_at, bill_rate, pay_rate,
              candidate:user_profiles!submissions_candidate_id_fkey(
                id, first_name, last_name, email, phone, avatar_url, title
              ),
              job:jobs!submissions_job_id_fkey(id, title, status),
              owner:user_profiles!submissions_submitted_by_fkey(id, full_name, avatar_url)
            ),
            job:jobs!offers_job_id_fkey(
              id, title, status,
              account:companies!jobs_company_id_fkey(id, name, industry)
            ),
            createdByUser:user_profiles!offers_created_by_fkey(id, full_name, avatar_url)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error || !offer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' })
        }

        // Fetch all section data in parallel
        const [negotiations, approvals, activities, notes, documents, history] = await Promise.all([
          // Negotiations
          adminClient
            .from('offer_negotiations')
            .select('id, initiated_by, original_terms, proposed_terms, counter_message, status, created_at, updated_at')
            .eq('offer_id', input.id)
            .order('created_at', { ascending: false })
            .limit(50),

          // Approvals with user details
          adminClient
            .from('offer_approvals')
            .select(`
              id, approval_type, status, request_notes, proposed_changes, response_notes, responded_at, created_at,
              requester:user_profiles!offer_approvals_requested_by_fkey(id, full_name, avatar_url),
              approver:user_profiles!offer_approvals_approver_id_fkey(id, full_name, avatar_url)
            `)
            .eq('offer_id', input.id)
            .order('created_at', { ascending: false })
            .limit(50),

          // Activities
          adminClient
            .from('activities')
            .select(`
              id, activity_type, subject, description, status, outcome, created_at,
              creator:user_profiles!activities_created_by_fkey(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'offer')
            .eq('entity_id', input.id)
            .order('created_at', { ascending: false })
            .limit(100),

          // Notes
          adminClient
            .from('notes')
            .select(`
              id, content, is_pinned, is_private, created_at,
              creator:user_profiles!notes_created_by_fkey(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'offer')
            .eq('entity_id', input.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Documents
          adminClient
            .from('documents')
            .select(`
              id, name, file_type, file_url, file_size, document_type, created_at,
              uploader:user_profiles!documents_uploaded_by_fkey(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'offer')
            .eq('entity_id', input.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // History
          adminClient
            .from('entity_history')
            .select(`
              id, action, description, changes, created_at,
              changedBy:user_profiles!entity_history_changed_by_fkey(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'offer')
            .eq('entity_id', input.id)
            .order('created_at', { ascending: false })
            .limit(100),
        ])

        // Calculate margin
        const marginAmount = (offer.bill_rate || 0) - (offer.pay_rate || 0)
        const marginPercent = offer.bill_rate && offer.bill_rate > 0 ? (marginAmount / offer.bill_rate) * 100 : 0

        // Calculate days until expiry
        let daysUntilExpiry: number | null = null
        if (offer.expires_at) {
          const expires = new Date(offer.expires_at)
          const now = new Date()
          daysUntilExpiry = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }

        // Extract account from job relationship
        const jobData = offer.job as { id: string; title: string; status: string; account: { id: string; name: string; industry?: string } | null } | null
        const account = jobData?.account || null

        // Check for pending approvals
        const approvalsData = approvals.data || []
        const hasPendingApproval = approvalsData.some((a: { status: string }) => a.status === 'pending')

        return {
          ...offer,
          job: jobData ? { id: jobData.id, title: jobData.title, status: jobData.status } : null,
          account,
          marginAmount,
          marginPercent,
          daysUntilExpiry,
          sections: {
            negotiations: { items: negotiations.data || [], total: negotiations.data?.length || 0 },
            approvals: { items: approvalsData, total: approvalsData.length, hasPending: hasPendingApproval },
            activities: { items: activities.data || [], total: activities.data?.length || 0 },
            notes: { items: notes.data || [], total: notes.data?.length || 0 },
            documents: { items: documents.data || [], total: documents.data?.length || 0 },
            history: { items: history.data || [], total: history.data?.length || 0 },
          },
        }
      }),

    // List offers with filters
    list: orgProtectedProcedure
      .input(z.object({
        status: offerStatusEnum.optional(),
        submissionId: z.string().uuid().optional(),
        jobId: z.string().uuid().optional(),
        candidateId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('offers')
          .select(`
            id, status, pay_rate, bill_rate, start_date, expires_at, created_at,
            submission:submissions!offers_submission_id_fkey(
              id,
              job:jobs!submissions_job_id_fkey(id, title),
              candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name)
            )
          `)
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (input.status) query = query.eq('status', input.status)
        if (input.submissionId) query = query.eq('submission_id', input.submissionId)
        if (input.jobId) query = query.eq('job_id', input.jobId)
        if (input.candidateId) query = query.eq('candidate_id', input.candidateId)
        if (input.cursor) query = query.lt('id', input.cursor)

        const { data: offers, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch offers' })
        }

        return {
          offers: offers || [],
          nextCursor: offers && offers.length === input.limit ? offers[offers.length - 1].id : null,
        }
      }),

    // Create draft offer
    create: orgProtectedProcedure
      .input(createOfferInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Fetch submission with job and candidate
        const { data: submission, error: subError } = await adminClient
          .from('submissions')
          .select(`
            id, status, job_id, candidate_id,
            job:jobs!submissions_job_id_fkey(id, title),
            candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name, email)
          `)
          .eq('id', input.submissionId)
          .eq('org_id', orgId)
          .single()

        if (subError || !submission) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' })
        }

        // Validate submission is in correct status
        if (!['client_interview', 'offer_stage'].includes(submission.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot create offer for submission in ${submission.status} status. Must be in interview or offer stage.`,
          })
        }

        // Check for existing active offer
        const { data: existingOffer } = await adminClient
          .from('offers')
          .select('id, status')
          .eq('submission_id', input.submissionId)
          .not('status', 'in', '("withdrawn","declined","expired")')
          .single()

        if (existingOffer) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `An active offer already exists for this submission (status: ${existingOffer.status})`,
          })
        }

        // Validate margin
        const marginAmount = input.billRate - input.payRate
        const marginPercent = (marginAmount / input.billRate) * 100

        if (marginPercent < 10) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Margin ${marginPercent.toFixed(1)}% is below minimum 10%. Adjust rates or request approval.`,
          })
        }

        // Calculate end date if duration provided
        let endDate = input.endDate
        if (!endDate && input.durationMonths && input.startDate) {
          const start = new Date(input.startDate)
          start.setMonth(start.getMonth() + input.durationMonths)
          endDate = start.toISOString().split('T')[0]
        }

        // Default expiration: 7 days from now
        const expiresAt = input.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const now = new Date().toISOString()

        // Create offer
        const { data: offer, error: offerError } = await adminClient
          .from('offers')
          .insert({
            org_id: orgId,
            submission_id: input.submissionId,
            job_id: submission.job_id,
            candidate_id: submission.candidate_id,
            status: 'draft',
            pay_rate: input.payRate,
            bill_rate: input.billRate,
            rate_type: input.rateType,
            overtime_rate: input.overtimeRate,
            start_date: input.startDate,
            end_date: endDate,
            duration_months: input.durationMonths,
            expires_at: expiresAt,
            employment_type: input.employmentType,
            pto_days: input.ptoDays,
            sick_days: input.sickDays,
            health_insurance: input.healthInsurance,
            has_401k: input.has401k,
            work_location: input.workLocation,
            standard_hours_per_week: input.standardHoursPerWeek,
            internal_notes: input.internalNotes,
            created_by: user.id,
            created_at: now,
            updated_at: now,
          })
          .select('id, status, pay_rate, bill_rate, start_date')
          .single()

        if (offerError || !offer) {
          console.error('Offer creation error:', offerError)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create offer' })
        }

        // Update submission status to offer_stage if not already
        if (submission.status !== 'offer_stage') {
          await adminClient
            .from('submissions')
            .update({
              status: 'offer_stage',
              offer_id: offer.id,
              updated_at: now,
            })
            .eq('id', input.submissionId)
        } else {
          await adminClient
            .from('submissions')
            .update({ offer_id: offer.id, updated_at: now })
            .eq('id', input.submissionId)
        }

        // Log activity
        const candidateArray4 = submission.candidate as Array<{ id: string; first_name: string; last_name: string; email?: string }> | null
        const candidate = candidateArray4?.[0] ?? null
        const jobArray4 = submission.job as Array<{ id: string; title: string }> | null
        const job = jobArray4?.[0] ?? null
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'offer',
          entity_id: offer.id,
          activity_type: 'created',
          subject: 'Offer created',
          description: `Draft offer created for ${candidate?.first_name} ${candidate?.last_name} - ${job?.title}`,
          outcome: 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: {
            submission_id: input.submissionId,
            pay_rate: input.payRate,
            bill_rate: input.billRate,
            margin_percent: marginPercent.toFixed(1),
          },
        })

        return {
          offerId: offer.id,
          status: offer.status,
          payRate: offer.pay_rate,
          billRate: offer.bill_rate,
          marginPercent: marginPercent.toFixed(1),
          startDate: offer.start_date,
        }
      }),

    // Send offer to candidate
    send: orgProtectedProcedure
      .input(sendOfferInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Fetch offer
        const { data: offer, error: offerError } = await adminClient
          .from('offers')
          .select(`
            *,
            submission:submissions!offers_submission_id_fkey(
              id, status,
              job:jobs!submissions_job_id_fkey(id, title,
                company:companies!jobs_company_id_fkey(id, name)
              ),
              candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name, email)
            )
          `)
          .eq('id', input.offerId)
          .eq('org_id', orgId)
          .single()

        if (offerError || !offer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' })
        }

        if (offer.status !== 'draft') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot send offer in ${offer.status} status. Only draft offers can be sent.`,
          })
        }

        const now = new Date().toISOString()
        const expiresAt = input.expiresAt || offer.expires_at

        // Update offer status to sent
        const { data: updatedOffer, error: updateError } = await adminClient
          .from('offers')
          .update({
            status: 'sent',
            sent_at: now,
            sent_by: user.id,
            expires_at: expiresAt,
            updated_at: now,
          })
          .eq('id', input.offerId)
          .select('id, status, sent_at')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to send offer' })
        }

        // Update submission status
        await adminClient
          .from('submissions')
          .update({
            status: 'offer_stage',
            updated_at: now,
          })
          .eq('id', offer.submission_id)

        // Log activity
        const submission = offer.submission as {
          candidate: { first_name: string; last_name: string; email: string } | null
          job: { title: string } | null
        } | null
        const candidate = submission?.candidate
        const job = submission?.job

        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'offer',
          entity_id: input.offerId,
          activity_type: 'sent',
          subject: 'Offer sent',
          description: `Offer sent to ${candidate?.first_name} ${candidate?.last_name} for ${job?.title}`,
          outcome: 'positive',
          created_by: user.id,
          created_at: now,
          metadata: {
            candidate_email: candidate?.email,
            expires_at: expiresAt,
            personal_note: input.personalNote ? true : false,
          },
        })

        return {
          offerId: updatedOffer.id,
          status: updatedOffer.status,
          sentAt: updatedOffer.sent_at,
        }
      }),

    // Update offer status (accept, decline, withdraw)
    updateStatus: orgProtectedProcedure
      .input(updateOfferStatusInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Define valid transitions
        const validOfferTransitions: Record<string, string[]> = {
          draft: ['sent', 'withdrawn'],
          sent: ['pending_response', 'accepted', 'declined', 'withdrawn', 'expired', 'negotiating'],
          pending_response: ['accepted', 'declined', 'withdrawn', 'expired', 'negotiating'],
          negotiating: ['sent', 'accepted', 'declined', 'withdrawn'],
          accepted: [], // Terminal - use placement flow
          declined: ['draft'], // Can recreate as new draft
          withdrawn: ['draft'], // Can recreate as new draft
          expired: ['draft'], // Can recreate as new draft
        }

        // Fetch offer
        const { data: offer, error: offerError } = await adminClient
          .from('offers')
          .select('*, submission:submissions!offers_submission_id_fkey(id, status)')
          .eq('id', input.offerId)
          .eq('org_id', orgId)
          .single()

        if (offerError || !offer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' })
        }

        // Validate transition
        const allowed = validOfferTransitions[offer.status] || []
        if (!allowed.includes(input.newStatus)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot transition offer from ${offer.status} to ${input.newStatus}`,
          })
        }

        const now = new Date().toISOString()
        const updateData: Record<string, unknown> = {
          status: input.newStatus,
          updated_at: now,
        }

        // Status-specific updates
        if (input.newStatus === 'accepted') {
          updateData.accepted_at = now
          updateData.accepted_by = user.id
          if (input.confirmedStartDate) {
            updateData.start_date = input.confirmedStartDate
          }
        } else if (input.newStatus === 'declined') {
          updateData.declined_at = now
          updateData.decline_reason = input.reason
        } else if (input.newStatus === 'withdrawn') {
          updateData.withdrawn_at = now
          updateData.withdrawal_reason = input.reason
        }

        // Update offer
        const { data: updatedOffer, error: updateError } = await adminClient
          .from('offers')
          .update(updateData)
          .eq('id', input.offerId)
          .select('id, status')
          .single()

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update offer status' })
        }

        // Update submission status based on offer status
        const submission = offer.submission as { id: string; status: string } | null
        let submissionStatus = submission?.status
        if (input.newStatus === 'declined') {
          submissionStatus = 'rejected'
          await adminClient
            .from('submissions')
            .update({ status: 'rejected', updated_at: now })
            .eq('id', offer.submission_id)
        } else if (input.newStatus === 'withdrawn') {
          submissionStatus = 'withdrawn'
          await adminClient
            .from('submissions')
            .update({ status: 'withdrawn', updated_at: now })
            .eq('id', offer.submission_id)
        }

        // Log activity
        const outcomeMap: Record<string, string> = {
          accepted: 'positive',
          declined: 'negative',
          withdrawn: 'negative',
          expired: 'negative',
        }

        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'offer',
          entity_id: input.offerId,
          activity_type: 'status_changed',
          subject: `Offer ${input.newStatus}`,
          description: input.reason || `Offer status changed to ${input.newStatus}`,
          outcome: outcomeMap[input.newStatus] || 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: {
            previous_status: offer.status,
            new_status: input.newStatus,
            reason: input.reason,
          },
        })

        return {
          offerId: updatedOffer.id,
          status: updatedOffer.status,
          submissionStatus,
        }
      }),

    // Record counter-offer / negotiation
    negotiate: orgProtectedProcedure
      .input(negotiateOfferInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Fetch offer
        const { data: offer, error: offerError } = await adminClient
          .from('offers')
          .select('*')
          .eq('id', input.offerId)
          .eq('org_id', orgId)
          .single()

        if (offerError || !offer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' })
        }

        if (!['sent', 'pending_response', 'negotiating'].includes(offer.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot negotiate offer in ${offer.status} status`,
          })
        }

        const now = new Date().toISOString()

        // Store original terms
        const originalTerms = {
          pay_rate: offer.pay_rate,
          bill_rate: offer.bill_rate,
          start_date: offer.start_date,
          pto_days: offer.pto_days,
        }

        // Build proposed terms
        const proposedTerms: Record<string, unknown> = {}
        if (input.proposedPayRate) proposedTerms.pay_rate = input.proposedPayRate
        if (input.proposedBillRate) proposedTerms.bill_rate = input.proposedBillRate
        if (input.proposedStartDate) proposedTerms.start_date = input.proposedStartDate
        if (input.proposedPtoDays !== undefined) proposedTerms.pto_days = input.proposedPtoDays

        // Create negotiation record
        const { data: negotiation, error: negError } = await adminClient
          .from('offer_negotiations')
          .insert({
            org_id: orgId,
            offer_id: input.offerId,
            initiated_by: input.initiatedBy,
            original_terms: originalTerms,
            proposed_terms: proposedTerms,
            counter_message: input.counterMessage,
            status: 'pending',
            created_at: now,
            updated_at: now,
          })
          .select('id')
          .single()

        if (negError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to record negotiation' })
        }

        // Update offer status to negotiating
        await adminClient
          .from('offers')
          .update({ status: 'negotiating', updated_at: now })
          .eq('id', input.offerId)

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'offer',
          entity_id: input.offerId,
          activity_type: 'negotiation',
          subject: `Counter-offer from ${input.initiatedBy}`,
          description: input.counterMessage,
          outcome: 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: {
            negotiation_id: negotiation.id,
            initiated_by: input.initiatedBy,
            proposed_changes: proposedTerms,
          },
        })

        return {
          negotiationId: negotiation.id,
          offerStatus: 'negotiating',
        }
      }),

    // Request approval for rate/terms change
    requestApproval: orgProtectedProcedure
      .input(requestApprovalInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Fetch offer
        const { data: offer, error: offerError } = await adminClient
          .from('offers')
          .select('id, status')
          .eq('id', input.offerId)
          .eq('org_id', orgId)
          .single()

        if (offerError || !offer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' })
        }

        const now = new Date().toISOString()

        // Create approval request
        const { data: approval, error: approvalError } = await adminClient
          .from('offer_approvals')
          .insert({
            org_id: orgId,
            offer_id: input.offerId,
            approval_type: input.approvalType,
            requested_by: user.id,
            approver_id: input.approverId,
            status: 'pending',
            request_notes: input.requestNotes,
            proposed_changes: input.proposedChanges,
            created_at: now,
            updated_at: now,
          })
          .select('id')
          .single()

        if (approvalError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create approval request' })
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'offer',
          entity_id: input.offerId,
          activity_type: 'approval_requested',
          subject: `${input.approvalType} approval requested`,
          description: input.requestNotes,
          outcome: 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: {
            approval_id: approval.id,
            approval_type: input.approvalType,
            approver_id: input.approverId,
          },
        })

        return {
          approvalId: approval.id,
          status: 'pending',
        }
      }),

    // Respond to approval request (approve/reject)
    respondToApproval: orgProtectedProcedure
      .input(z.object({
        approvalId: z.string().uuid(),
        approved: z.boolean(),
        responseNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Fetch approval request
        const { data: approval, error: approvalError } = await adminClient
          .from('offer_approvals')
          .select('id, offer_id, approver_id, status, proposed_changes')
          .eq('id', input.approvalId)
          .eq('org_id', orgId)
          .single()

        if (approvalError || !approval) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Approval request not found' })
        }

        if (approval.status !== 'pending') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Approval request already ${approval.status}`,
          })
        }

        // Verify user is the approver
        if (approval.approver_id !== user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not authorized to respond to this approval request',
          })
        }

        const now = new Date().toISOString()
        const newStatus = input.approved ? 'approved' : 'rejected'

        // Update approval
        const { error: updateError } = await adminClient
          .from('offer_approvals')
          .update({
            status: newStatus,
            response_notes: input.responseNotes,
            responded_at: now,
            updated_at: now,
          })
          .eq('id', input.approvalId)

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update approval' })
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'offer',
          entity_id: approval.offer_id,
          activity_type: `approval_${newStatus}`,
          subject: `Approval ${newStatus}`,
          description: input.responseNotes || `Approval request was ${newStatus}`,
          outcome: input.approved ? 'positive' : 'negative',
          created_by: user.id,
          created_at: now,
          metadata: {
            approval_id: input.approvalId,
          },
        })

        return {
          approvalId: input.approvalId,
          status: newStatus,
        }
      }),
  }),

  // ============================================
  // PLACEMENTS
  // ============================================
  placements: router({
    // List placements with full details
    list: orgProtectedProcedure
      .input(z.object({
        status: z.enum(['pending_start', 'active', 'extended', 'completed', 'terminated', 'on_hold', 'all']).default('all'),
        healthStatus: z.enum(['healthy', 'at_risk', 'critical']).optional(),
        recruiterId: z.string().uuid().optional(),
        accountId: z.string().uuid().optional(), // Filter by account
        endingSoon: z.boolean().optional(), // Filter for placements ending within 30 days
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('placements')
          .select(`
            id,
            status,
            health_status,
            start_date,
            end_date,
            pay_rate,
            bill_rate,
            next_check_in_date,
            last_check_in_date,
            checkin_7_day_completed,
            checkin_30_day_completed,
            checkin_60_day_completed,
            checkin_90_day_completed,
            created_at,
            job:jobs!placements_job_id_fkey(id, title),
            candidate:user_profiles!placements_candidate_id_fkey(id, first_name, last_name),
            company:companies!jobs_company_id_fkey(id, name),
            submission:submissions(id, submitted_by)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .order('start_date', { ascending: false })

        if (input.status !== 'all') {
          query = query.eq('status', input.status)
        }

        if (input.healthStatus) {
          query = query.eq('health_status', input.healthStatus)
        }

        if (input.accountId) {
          // placements.company_id references companies (account_id column was removed)
          query = query.eq('company_id', input.accountId)
        }

        // Filter for placements ending within 30 days
        if (input.endingSoon) {
          const today = new Date()
          const thirtyDaysFromNow = new Date(today)
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
          query = query
            .gte('end_date', today.toISOString().split('T')[0])
            .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0])
            .in('status', ['active', 'extended'])
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Filter by recruiter if specified
        let filteredData = data ?? []
        if (input.recruiterId) {
          filteredData = filteredData.filter(p => {
            const submissionArray3 = p.submission as Array<{ id: string; submitted_by: string }> | null
            const submission = submissionArray3?.[0]
            return submission?.submitted_by === input.recruiterId
          })
        }

        return {
          items: filteredData,
          total: input.recruiterId ? filteredData.length : (count ?? 0),
        }
      }),

    // Get placement stats
    getStats: orgProtectedProcedure
      .input(z.object({
        recruiterId: z.string().uuid().optional(),
        period: z.enum(['week', 'month', 'sprint', 'quarter', 'year', 'all']).default('month'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const recruiterId = input.recruiterId || user?.id

        let startDate: Date | null = null
        const now = new Date()

        if (input.period === 'week') {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 7)
        } else if (input.period === 'month') {
          startDate = new Date(now)
          startDate.setMonth(startDate.getMonth() - 1)
        } else if (input.period === 'sprint') {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 14)
        } else if (input.period === 'quarter') {
          startDate = new Date(now)
          startDate.setMonth(startDate.getMonth() - 3)
        } else if (input.period === 'year') {
          startDate = new Date(now.getFullYear(), 0, 1)
        }

        // Get submissions for this recruiter
        const { data: submissions } = await adminClient
          .from('submissions')
          .select('id')
          .eq('org_id', orgId)
          .eq('submitted_by', recruiterId)

        const submissionIds = submissions?.map(s => s.id) ?? []

        if (submissionIds.length === 0) {
          return { total: 0, active: 0, revenue: 0, avgBillingRate: 0 }
        }

        let query = adminClient
          .from('placements')
          .select('id, status, billing_rate, hours_billed, start_date')
          .eq('org_id', orgId)
          .in('submission_id', submissionIds)

        if (startDate) {
          query = query.gte('start_date', startDate.toISOString())
        }

        const { data: placements } = await query

        const total = placements?.length ?? 0
        const active = placements?.filter(p => p.status === 'active').length ?? 0
        const revenue = placements?.reduce((sum, p) =>
          sum + ((p.billing_rate || 0) * (p.hours_billed || 0)), 0) ?? 0
        const avgBillingRate = total > 0
          ? placements!.reduce((sum, p) => sum + (p.billing_rate || 0), 0) / total
          : 0

        return {
          total,
          active,
          completed: placements?.filter(p => p.status === 'completed').length ?? 0,
          revenue,
          avgBillingRate: Math.round(avgBillingRate * 100) / 100,
        }
      }),

    // Get active placements needing check-in
    getNeedingCheckIn: orgProtectedProcedure
      .input(z.object({
        daysSinceLastCheckIn: z.number().default(30),
        limit: z.number().min(1).max(20).default(10),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - input.daysSinceLastCheckIn)

        // Get submissions for this recruiter
        const { data: submissions } = await adminClient
          .from('submissions')
          .select('id')
          .eq('org_id', orgId)
          .eq('submitted_by', user?.id)

        const submissionIds = submissions?.map(s => s.id) ?? []

        if (submissionIds.length === 0) {
          return []
        }

        const { data, error } = await adminClient
          .from('placements')
          .select(`
            id, start_date, last_check_in_date, status,
            submission:submissions(
              id,
              job:jobs(id, title, company:companies!jobs_company_id_fkey(id, name)),
              candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name)
            )
          `)
          .eq('org_id', orgId)
          .eq('status', 'active')
          .in('submission_id', submissionIds)
          .or(`last_check_in_date.is.null,last_check_in_date.lt.${cutoffDate.toISOString()}`)
          .order('last_check_in_date', { ascending: true, nullsFirst: true })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Get placement by ID with full details
    getById: orgProtectedProcedure
      .input(z.object({ placementId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data: placement, error } = await adminClient
          .from('placements')
          .select(`
            *,
            job:jobs!placements_job_id_fkey(id, title, description,
              company:companies!jobs_company_id_fkey(id, name)
            ),
            candidate:user_profiles!placements_candidate_id_fkey(id, first_name, last_name, email, phone),
            offer:offers!placements_offer_id_fkey(id, pay_rate, bill_rate, employment_type),
            checkins:placement_checkins(id, checkin_type, checkin_date, overall_health, created_at),
            milestones:placement_milestones(id, milestone_type, due_date, completed_date, status),
            extensions:placement_extensions(id, original_end_date, new_end_date, extension_months, approved_at)
          `)
          .eq('id', input.placementId)
          .eq('org_id', orgId)
          .single()

        if (error || !placement) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Placement not found' })
        }

        // Calculate metrics
        const startDate = new Date(placement.start_date)
        const today = new Date()
        const daysActive = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        const marginAmount = (placement.bill_rate || 0) - (placement.pay_rate || 0)
        const marginPercent = placement.bill_rate && placement.bill_rate > 0 ? (marginAmount / placement.bill_rate) * 100 : 0

        return {
          ...placement,
          daysActive,
          marginAmount,
          marginPercent,
        }
      }),

    // Get full placement with all section data (ONE database call pattern - GW-043)
    getFullPlacement: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Parallel queries for all section data
        const [
          placementResult,
          timesheetsResult,
          complianceResult,
          activitiesResult,
          notesResult,
          documentsResult,
          historyResult,
        ] = await Promise.all([
          // Main placement with relations
          adminClient
            .from('placements')
            .select(`
              *,
              job:jobs!placements_job_id_fkey(
                id, title, description, status, location_type, location_city, location_state,
                account:companies!jobs_company_id_fkey(id, name, industry, website)
              ),
              candidate:user_profiles!placements_candidate_id_fkey(
                id, first_name, last_name, full_name, email, phone, avatar_url, title, linkedin_url
              ),
              offer:offers!placements_offer_id_fkey(id, pay_rate, bill_rate, employment_type, start_date, end_date),
              recruiter:user_profiles!placements_recruiter_id_fkey(id, full_name, avatar_url),
              submission:submissions!placements_submission_id_fkey(id, status, submitted_at, match_score),
              checkins:placement_checkins(
                id, checkin_type, checkin_date, overall_health,
                candidate_overall_satisfaction, manager_overall_satisfaction, created_at
              ),
              milestones:placement_milestones(id, milestone_type, due_date, completed_date, status),
              extensions:placement_extensions(id, original_end_date, new_end_date, extension_months, approved_at, reason)
            `)
            .eq('id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .single(),

          // Timesheets
          adminClient
            .from('timesheets')
            .select(`
              id, status, period_start, period_end,
              total_regular_hours, total_overtime_hours, total_double_time_hours,
              total_billable_amount, total_payable_amount,
              submitted_at, approved_at, created_at
            `)
            .eq('placement_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('period_start', { ascending: false })
            .limit(50),

          // Compliance items (polymorphic)
          adminClient
            .from('compliance_items')
            .select(`
              id, name, status, due_date, completed_at, is_blocking, document_url, notes, created_at,
              requirement:compliance_requirements(id, name, category, description, is_mandatory)
            `)
            .eq('entity_type', 'placement')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('due_date', { ascending: true, nullsFirst: false })
            .limit(50),

          // Activities (polymorphic)
          adminClient
            .from('activities')
            .select(`
              *,
              creator:user_profiles!created_by(id, full_name, avatar_url),
              assignee:user_profiles!assignee_id(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'placement')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Notes (polymorphic)
          adminClient
            .from('notes')
            .select(`
              *,
              creator:user_profiles!created_by(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'placement')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Documents (polymorphic)
          adminClient
            .from('documents')
            .select(`
              *,
              uploadedBy:user_profiles!uploaded_by(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'placement')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // History (status changes and system activities)
          adminClient
            .from('activities')
            .select(`
              *,
              creator:user_profiles!created_by(id, full_name, avatar_url)
            `)
            .eq('entity_type', 'placement')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .in('activity_type', ['status_change', 'created', 'updated', 'extension', 'checkin'])
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(100),
        ])

        if (placementResult.error || !placementResult.data) {
          console.error('[getFullPlacement] Error:', placementResult.error)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Placement not found',
          })
        }

        const placement = placementResult.data

        // Extract account from job relation
        const account = placement.job?.account || null

        // Calculate derived metrics
        const startDate = new Date(placement.start_date)
        const today = new Date()
        const daysActive = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        const marginAmount = (placement.bill_rate || 0) - (placement.pay_rate || 0)
        const marginPercent = placement.bill_rate && placement.bill_rate > 0
          ? (marginAmount / placement.bill_rate) * 100
          : 0

        // Transform timesheets for component compatibility
        const timesheets = (timesheetsResult.data || []).map((ts: {
          id: string
          status: string
          period_start: string
          period_end: string
          total_regular_hours: number | null
          total_overtime_hours: number | null
          total_double_time_hours: number | null
          total_billable_amount: number | null
          total_payable_amount: number | null
          submitted_at: string | null
          approved_at: string | null
          created_at: string
        }) => ({
          id: ts.id,
          status: ts.status,
          periodStart: ts.period_start,
          periodEnd: ts.period_end,
          totalRegularHours: ts.total_regular_hours || 0,
          totalOvertimeHours: ts.total_overtime_hours || 0,
          totalDoubleTimeHours: ts.total_double_time_hours || 0,
          totalBillableAmount: ts.total_billable_amount || 0,
          totalPayableAmount: ts.total_payable_amount || 0,
          submittedAt: ts.submitted_at,
          approvedAt: ts.approved_at,
          createdAt: ts.created_at,
        }))

        return {
          ...placement,
          account,
          daysActive,
          marginAmount,
          marginPercent,
          sections: {
            timesheets: {
              items: timesheets,
              total: timesheets.length,
            },
            compliance: {
              items: complianceResult.data || [],
              total: complianceResult.data?.length || 0,
            },
            activities: {
              items: activitiesResult.data || [],
              total: activitiesResult.data?.length || 0,
            },
            notes: {
              items: notesResult.data || [],
              total: notesResult.data?.length || 0,
            },
            documents: {
              items: documentsResult.data || [],
              total: documentsResult.data?.length || 0,
            },
            history: {
              items: historyResult.data || [],
              total: historyResult.data?.length || 0,
            },
          },
        }
      }),

    // Create placement from accepted offer (G03)
    create: orgProtectedProcedure
      .input(createPlacementInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Fetch offer with all related data
        const { data: offer, error: offerError } = await adminClient
          .from('offers')
          .select(`
            *,
            submission:submissions!offers_submission_id_fkey(id, status, job_id, candidate_id),
            job:jobs!offers_job_id_fkey(id, title, company_id, positions_count, positions_filled)
          `)
          .eq('id', input.offerId)
          .eq('org_id', orgId)
          .single()

        if (offerError || !offer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' })
        }

        // Validate offer is accepted
        if (offer.status !== 'accepted') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot create placement from offer in ${offer.status} status. Offer must be accepted.`,
          })
        }

        // Check for existing placement
        const { data: existingPlacement } = await adminClient
          .from('placements')
          .select('id')
          .eq('offer_id', input.offerId)
          .single()

        if (existingPlacement) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A placement already exists for this offer',
          })
        }

        const now = new Date().toISOString()
        const startDate = input.confirmedStartDate
        const endDate = input.confirmedEndDate || offer.end_date

        // Calculate 30/60/90 day milestones
        const start = new Date(startDate)
        const day7 = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const day30 = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const day60 = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const day90 = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        // Get company_id from job
        const job = offer.job as { company_id: string; positions_count: number; positions_filled: number } | null

        // Create placement
        const { data: placement, error: placementError } = await adminClient
          .from('placements')
          .insert({
            org_id: orgId,
            offer_id: input.offerId,
            submission_id: offer.submission_id,
            job_id: offer.job_id,
            candidate_id: offer.candidate_id,
            company_id: job?.company_id,
            recruiter_id: user.id,
            status: 'pending_start',
            health_status: 'healthy',
            start_date: startDate,
            end_date: endDate,
            pay_rate: offer.pay_rate,
            bill_rate: offer.bill_rate,
            rate_type: offer.rate_type || 'hourly',
            employment_type: offer.employment_type || 'w2',
            work_location: offer.work_location || 'remote',
            work_schedule: input.workSchedule,
            timezone: input.timezone,
            onboarding_format: input.onboardingFormat,
            first_day_meeting_link: input.firstDayMeetingLink,
            first_day_location: input.firstDayLocation,
            hiring_manager_name: input.hiringManagerName,
            hiring_manager_email: input.hiringManagerEmail,
            hiring_manager_phone: input.hiringManagerPhone,
            hr_contact_name: input.hrContactName,
            hr_contact_email: input.hrContactEmail,
            paperwork_complete: input.paperworkComplete,
            background_check_status: input.backgroundCheckStatus,
            i9_complete: input.i9Complete,
            nda_signed: input.ndaSigned,
            equipment_ordered: input.equipmentOrdered,
            equipment_notes: input.equipmentNotes,
            next_check_in_date: day7, // First check-in at 7 days
            internal_notes: input.internalNotes,
            created_by: user.id,
            created_at: now,
            updated_at: now,
          })
          .select('id, status, start_date')
          .single()

        if (placementError || !placement) {
          console.error('Placement creation error:', placementError)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create placement' })
        }

        // Create milestones
        const milestones = [
          { type: '7_day', dueDate: day7 },
          { type: '30_day', dueDate: day30 },
          { type: '60_day', dueDate: day60 },
          { type: '90_day', dueDate: day90 },
        ]

        for (const milestone of milestones) {
          await adminClient.from('placement_milestones').insert({
            org_id: orgId,
            placement_id: placement.id,
            milestone_type: milestone.type,
            due_date: milestone.dueDate,
            status: 'pending',
            created_at: now,
            updated_at: now,
          })
        }

        // Update submission status to placed
        await adminClient
          .from('submissions')
          .update({
            status: 'placed',
            placement_id: placement.id,
            updated_at: now,
          })
          .eq('id', offer.submission_id)

        // Update job positions_filled
        if (job) {
          const newPositionsFilled = (job.positions_filled || 0) + 1
          const updateData: Record<string, unknown> = {
            positions_filled: newPositionsFilled,
            updated_at: now,
          }

          // If all positions filled, update job status
          if (newPositionsFilled >= job.positions_count) {
            updateData.status = 'filled'
            updateData.filled_date = now.split('T')[0]
          }

          await adminClient
            .from('jobs')
            .update(updateData)
            .eq('id', offer.job_id)
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'placement',
          entity_id: placement.id,
          activity_type: 'created',
          subject: 'Placement confirmed',
          description: `Placement confirmed for ${input.hiringManagerName}'s team, starting ${startDate}`,
          outcome: 'positive',
          created_by: user.id,
          created_at: now,
          metadata: {
            offer_id: input.offerId,
            start_date: startDate,
            end_date: endDate,
            onboarding_format: input.onboardingFormat,
          },
        })

        return {
          placementId: placement.id,
          status: placement.status,
          startDate: placement.start_date,
          nextCheckInDate: day7,
        }
      }),

    // Record check-in (G04)
    recordCheckIn: orgProtectedProcedure
      .input(recordCheckInInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Fetch placement
        const { data: placement, error: placementError } = await adminClient
          .from('placements')
          .select('id, status, start_date, candidate_id, job_id')
          .eq('id', input.placementId)
          .eq('org_id', orgId)
          .single()

        if (placementError || !placement) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Placement not found' })
        }

        if (!['active', 'pending_start', 'extended'].includes(placement.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot record check-in for placement in ${placement.status} status`,
          })
        }

        const now = new Date().toISOString()

        // Create check-in record
        const { data: checkin, error: checkinError } = await adminClient
          .from('placement_checkins')
          .insert({
            org_id: orgId,
            placement_id: input.placementId,
            checkin_type: input.checkinType,
            checkin_date: input.checkinDate,
            // Candidate
            candidate_contact_method: input.candidateContactMethod,
            candidate_response_status: input.candidateResponseStatus,
            candidate_overall_satisfaction: input.candidateOverallSatisfaction,
            candidate_role_satisfaction: input.candidateRoleSatisfaction,
            candidate_team_relationship: input.candidateTeamRelationship,
            candidate_workload: input.candidateWorkload,
            candidate_payment_status: input.candidatePaymentStatus,
            candidate_extension_interest: input.candidateExtensionInterest,
            candidate_sentiment: input.candidateSentiment,
            candidate_concerns: input.candidateConcerns,
            candidate_notes: input.candidateNotes,
            // Client
            client_contact_method: input.clientContactMethod,
            client_contact_id: input.clientContactId,
            client_performance_rating: input.clientPerformanceRating,
            client_team_integration: input.clientTeamIntegration,
            client_work_quality: input.clientWorkQuality,
            client_communication: input.clientCommunication,
            client_extension_interest: input.clientExtensionInterest,
            client_satisfaction: input.clientSatisfaction,
            client_concerns: input.clientConcerns,
            client_notes: input.clientNotes,
            // Assessment
            overall_health: input.overallHealth,
            risk_factors: input.riskFactors || [],
            action_items: input.actionItems || [],
            // Follow-up
            next_checkin_date: input.nextCheckinDate,
            follow_up_required: input.followUpRequired,
            escalated_to: input.escalateTo,
            conducted_by: user.id,
            created_at: now,
            updated_at: now,
          })
          .select('id')
          .single()

        if (checkinError) {
          console.error('Check-in creation error:', checkinError)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to record check-in' })
        }

        // Update placement health status and next check-in date
        // Also update status to active if it was pending_start
        const placementUpdate: Record<string, unknown> = {
          health_status: input.overallHealth,
          last_check_in_date: input.checkinDate,
          last_check_in_by: user.id,
          next_check_in_date: input.nextCheckinDate,
          updated_at: now,
        }

        if (placement.status === 'pending_start') {
          placementUpdate.status = 'active'
        }

        await adminClient
          .from('placements')
          .update(placementUpdate)
          .eq('id', input.placementId)

        // Update milestone if applicable
        if (input.checkinType !== 'ad_hoc') {
          await adminClient
            .from('placement_milestones')
            .update({
              completed_date: input.checkinDate,
              status: 'completed',
              notes: `Health: ${input.overallHealth}`,
              updated_at: now,
            })
            .eq('placement_id', input.placementId)
            .eq('milestone_type', input.checkinType)
        }

        // Log activity
        const outcomeMap: Record<string, string> = {
          healthy: 'positive',
          at_risk: 'negative',
          critical: 'negative',
        }

        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'placement',
          entity_id: input.placementId,
          activity_type: 'checkin',
          subject: `${input.checkinType.replace('_', '-')} check-in completed`,
          description: `Health status: ${input.overallHealth}`,
          outcome: outcomeMap[input.overallHealth] || 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: {
            checkin_id: checkin.id,
            checkin_type: input.checkinType,
            health_status: input.overallHealth,
            candidate_sentiment: input.candidateSentiment,
            client_satisfaction: input.clientSatisfaction,
            risk_factors: input.riskFactors,
          },
        })

        return {
          checkinId: checkin.id,
          healthStatus: input.overallHealth,
          nextCheckinDate: input.nextCheckinDate,
        }
      }),

    // Extend placement (G04)
    extend: orgProtectedProcedure
      .input(extendPlacementInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Fetch placement
        const { data: placement, error: placementError } = await adminClient
          .from('placements')
          .select('id, status, end_date, pay_rate, bill_rate, extension_count')
          .eq('id', input.placementId)
          .eq('org_id', orgId)
          .single()

        if (placementError || !placement) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Placement not found' })
        }

        if (!['active', 'extended'].includes(placement.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot extend placement in ${placement.status} status`,
          })
        }

        const now = new Date().toISOString()

        // Calculate extension months from dates
        const oldEnd = placement.end_date ? new Date(placement.end_date) : new Date()
        const newEnd = new Date(input.newEndDate)
        const extensionMonths = Math.max(1, Math.ceil((newEnd.getTime() - oldEnd.getTime()) / (30 * 24 * 60 * 60 * 1000)))

        // Create extension record
        const { data: extension, error: extError } = await adminClient
          .from('placement_extensions')
          .insert({
            org_id: orgId,
            placement_id: input.placementId,
            original_end_date: placement.end_date,
            previous_end_date: placement.end_date,
            new_end_date: input.newEndDate,
            extension_months: extensionMonths,
            new_pay_rate: input.newPayRate,
            new_bill_rate: input.newBillRate,
            notes: input.internalNotes,
            extension_reason: input.extensionReason,
            reason: input.extensionReason || input.internalNotes,
            client_approved: input.clientApproval,
            client_approved_date: input.clientApprovalDate,
            client_approved_by: input.clientApprovalBy,
            approved_by: user.id,
            approved_at: now,
            status: 'approved',
            created_at: now,
            updated_at: now,
          })
          .select('id')
          .single()

        if (extError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create extension' })
        }

        // Update placement
        const updateData: Record<string, unknown> = {
          status: 'extended',
          end_date: input.newEndDate,
          extension_count: (placement.extension_count || 0) + 1,
          updated_at: now,
        }

        if (input.newPayRate) updateData.pay_rate = input.newPayRate
        if (input.newBillRate) updateData.bill_rate = input.newBillRate

        await adminClient
          .from('placements')
          .update(updateData)
          .eq('id', input.placementId)

        // Create new rate record if rates changed
        if (input.newPayRate || input.newBillRate) {
          await adminClient.from('placement_rates').insert({
            org_id: orgId,
            placement_id: input.placementId,
            rate_type: 'regular',
            pay_rate: input.newPayRate || placement.pay_rate,
            bill_rate: input.newBillRate || placement.bill_rate,
            effective_from: now.split('T')[0],
            effective_date: now.split('T')[0],
            created_at: now,
            updated_at: now,
          })
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'placement',
          entity_id: input.placementId,
          activity_type: 'extended',
          subject: `Placement extended by ${extensionMonths} month${extensionMonths !== 1 ? 's' : ''}`,
          description: input.extensionReason || input.internalNotes || `Extended until ${input.newEndDate}`,
          outcome: 'positive',
          created_by: user.id,
          created_at: now,
          metadata: {
            extension_id: extension.id,
            original_end_date: placement.end_date,
            new_end_date: input.newEndDate,
            extension_months: extensionMonths,
            extension_reason: input.extensionReason,
            client_approval: input.clientApproval,
            rate_change: input.newPayRate || input.newBillRate ? true : false,
          },
        })

        return {
          extensionId: extension.id,
          newEndDate: input.newEndDate,
          newPayRate: input.newPayRate,
          newBillRate: input.newBillRate,
        }
      }),

    // Terminate placement early (G07)
    terminate: orgProtectedProcedure
      .input(z.object({
        placementId: z.string().uuid(),
        lastDay: z.string(), // YYYY-MM-DD
        initiatedBy: z.enum(['client', 'contractor', 'mutual', 'intime']),
        terminationReason: z.string().max(500),
        reasonDetails: z.string().max(2000).optional(),
        noticeCompliance: z.enum(['met', 'below_met', 'waived']).optional(),
        finalTimesheetSubmitted: z.boolean().optional(),
        equipmentReturnArranged: z.boolean().optional(),
        accessRevoked: z.boolean().optional(),
        exitInterviewScheduled: z.boolean().optional(),
        offerReplacement: z.boolean().optional(),
        internalNotes: z.string().max(2000).optional(),
        lessonsLearned: z.string().max(2000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Fetch placement
        const { data: placement, error: fetchError } = await adminClient
          .from('placements')
          .select('*, job:jobs!placements_job_id_fkey(id, title)')
          .eq('id', input.placementId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !placement) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Placement not found' })
        }

        if (!['active', 'extended', 'pending_start'].includes(placement.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot terminate placement in ${placement.status} status`,
          })
        }

        // Check for blocking activities before terminating placement
        const blockCheck = await checkBlockingActivities({
          entityType: 'placement',
          entityId: input.placementId,
          targetStatus: 'terminated',
          orgId,
          supabase: adminClient,
        })
        if (blockCheck.blocked) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Cannot terminate placement: ${blockCheck.activities.length} blocking ${blockCheck.activities.length === 1 ? 'activity' : 'activities'} must be completed first`,
            cause: { blockingActivities: blockCheck.activities },
          })
        }

        const now = new Date().toISOString()

        // Update placement to terminated
        const { error: updateError } = await adminClient
          .from('placements')
          .update({
            status: 'terminated',
            actual_end_date: input.lastDay,
            end_reason: input.terminationReason,
            termination_initiated_by: input.initiatedBy,
            termination_reason_details: input.reasonDetails,
            updated_at: now,
          })
          .eq('id', input.placementId)

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to terminate placement' })
        }

        // Update submission status to allow re-placement
        if (placement.submission_id) {
          await adminClient
            .from('submissions')
            .update({
              status: 'withdrawn',
              withdrawal_reason: `Placement terminated: ${input.terminationReason}`,
              updated_at: now,
            })
            .eq('id', placement.submission_id)
        }

        // Decrement job positions_filled
        if (placement.job_id) {
          const { data: job } = await adminClient
            .from('jobs')
            .select('positions_filled, status')
            .eq('id', placement.job_id)
            .single()

          if (job) {
            const updateData: Record<string, unknown> = {
              positions_filled: Math.max(0, (job.positions_filled || 1) - 1),
              updated_at: now,
            }

            // Reopen job if it was filled and client wants replacement
            if (input.offerReplacement && job.status === 'filled') {
              updateData.status = 'open'
            }

            await adminClient
              .from('jobs')
              .update(updateData)
              .eq('id', placement.job_id)
          }
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'placement',
          entity_id: input.placementId,
          activity_type: 'terminated',
          subject: `Placement terminated - ${input.initiatedBy}`,
          description: input.terminationReason,
          outcome: 'negative',
          created_by: user.id,
          created_at: now,
          metadata: {
            last_day: input.lastDay,
            initiated_by: input.initiatedBy,
            termination_reason: input.terminationReason,
            offer_replacement: input.offerReplacement,
            offboarding_status: {
              finalTimesheetSubmitted: input.finalTimesheetSubmitted,
              equipmentReturnArranged: input.equipmentReturnArranged,
              accessRevoked: input.accessRevoked,
              exitInterviewScheduled: input.exitInterviewScheduled,
            },
            lessons_learned: input.lessonsLearned,
          },
        })

        return {
          success: true,
          lastDay: input.lastDay,
          offerReplacement: input.offerReplacement,
        }
      }),

    // ============================================
    // PLACEMENTS-01: CHANGE ORDER MANAGEMENT
    // ============================================

    // Get change orders for a placement
    getChangeOrders: orgProtectedProcedure
      .input(z.object({ placementId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('placement_change_orders')
          .select(`
            *,
            requestedBy:user_profiles!requested_by(id, full_name),
            approvedBy:user_profiles!approved_by(id, full_name),
            document:documents!document_id(id, file_name, file_url)
          `)
          .eq('org_id', orgId)
          .eq('placement_id', input.placementId)
          .order('created_at', { ascending: false })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Create change order
    createChangeOrder: orgProtectedProcedure
      .input(z.object({
        placementId: z.string().uuid(),
        changeType: z.enum(['extension', 'rate_change', 'hours_change', 'role_change', 'location_change', 'other']),
        newEndDate: z.string().optional(),
        newBillRate: z.number().positive().optional(),
        newPayRate: z.number().positive().optional(),
        newHoursPerWeek: z.number().positive().max(60).optional(),
        effectiveDate: z.string(),
        reason: z.string().max(1000),
        notes: z.string().max(2000).optional(),
        documentId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Fetch current placement values
        const { data: placement, error: fetchError } = await adminClient
          .from('placements')
          .select('id, end_date, bill_rate, pay_rate, expected_hours_per_week, change_order_count')
          .eq('id', input.placementId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !placement) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Placement not found' })
        }

        const now = new Date().toISOString()

        const { data: changeOrder, error } = await adminClient
          .from('placement_change_orders')
          .insert({
            org_id: orgId,
            placement_id: input.placementId,
            change_type: input.changeType,
            original_end_date: placement.end_date,
            original_bill_rate: placement.bill_rate,
            original_pay_rate: placement.pay_rate,
            original_hours_per_week: placement.expected_hours_per_week,
            new_end_date: input.newEndDate,
            new_bill_rate: input.newBillRate,
            new_pay_rate: input.newPayRate,
            new_hours_per_week: input.newHoursPerWeek,
            effective_date: input.effectiveDate,
            reason: input.reason,
            notes: input.notes,
            document_id: input.documentId,
            status: 'pending',
            requested_by: user.id,
            requested_at: now,
            created_at: now,
            updated_at: now,
          })
          .select('id, change_type, status')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update placement to track change orders
        const currentCount = placement.change_order_count ?? 0
        await adminClient
          .from('placements')
          .update({
            has_change_orders: true,
            change_order_count: currentCount + 1,
            active_change_order_id: changeOrder.id,
            updated_at: now,
          })
          .eq('id', input.placementId)

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'placement',
          entity_id: input.placementId,
          activity_type: 'change_order_created',
          subject: `Change order: ${input.changeType.replace('_', ' ')}`,
          description: input.reason,
          outcome: 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: {
            change_order_id: changeOrder.id,
            change_type: input.changeType,
            effective_date: input.effectiveDate,
          },
        })

        return changeOrder
      }),

    // Approve change order
    approveChangeOrder: orgProtectedProcedure
      .input(z.object({
        changeOrderId: z.string().uuid(),
        applyImmediately: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        // Fetch change order
        const { data: changeOrder, error: fetchError } = await adminClient
          .from('placement_change_orders')
          .select('*')
          .eq('id', input.changeOrderId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !changeOrder) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Change order not found' })
        }

        if (changeOrder.status !== 'pending') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Cannot approve change order in ${changeOrder.status} status` })
        }

        // Update change order
        const updateData: Record<string, unknown> = {
          status: input.applyImmediately ? 'applied' : 'approved',
          approved_by: user.id,
          approved_at: now,
          updated_at: now,
        }

        if (input.applyImmediately) {
          updateData.applied_at = now
        }

        await adminClient
          .from('placement_change_orders')
          .update(updateData)
          .eq('id', input.changeOrderId)

        // Apply changes to placement if requested
        if (input.applyImmediately) {
          const placementUpdate: Record<string, unknown> = {
            updated_at: now,
            active_change_order_id: null,
          }

          if (changeOrder.new_end_date) {
            placementUpdate.end_date = changeOrder.new_end_date
          }
          if (changeOrder.new_bill_rate) {
            placementUpdate.bill_rate = changeOrder.new_bill_rate
          }
          if (changeOrder.new_pay_rate) {
            placementUpdate.pay_rate = changeOrder.new_pay_rate
          }
          if (changeOrder.new_hours_per_week) {
            placementUpdate.expected_hours_per_week = changeOrder.new_hours_per_week
          }

          await adminClient
            .from('placements')
            .update(placementUpdate)
            .eq('id', changeOrder.placement_id)
        }

        return { success: true, applied: input.applyImmediately }
      }),

    // ============================================
    // PLACEMENTS-01: ENHANCED CHECKIN MANAGEMENT
    // ============================================

    // Get checkins for a placement
    getCheckins: orgProtectedProcedure
      .input(z.object({
        placementId: z.string().uuid(),
        completed: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('placement_checkins')
          .select(`
            *,
            completedBy:user_profiles!completed_by(id, full_name)
          `)
          .eq('org_id', orgId)
          .eq('placement_id', input.placementId)
          .order('scheduled_date', { ascending: true })

        if (input.completed !== undefined) {
          if (input.completed) {
            query = query.not('completed_at', 'is', null)
          } else {
            query = query.is('completed_at', null)
          }
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Schedule checkin
    scheduleCheckin: orgProtectedProcedure
      .input(z.object({
        placementId: z.string().uuid(),
        checkinType: z.enum(['7_day', '30_day', '60_day', '90_day', 'quarterly', 'issue_followup', 'exit']),
        scheduledDate: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { data: checkin, error } = await adminClient
          .from('placement_checkins')
          .insert({
            org_id: orgId,
            placement_id: input.placementId,
            checkin_type: input.checkinType,
            scheduled_date: input.scheduledDate,
            created_at: now,
            updated_at: now,
          })
          .select('id, checkin_type, scheduled_date')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update placement next checkin date
        await adminClient
          .from('placements')
          .update({
            next_check_in_date: input.scheduledDate,
            updated_at: now,
          })
          .eq('id', input.placementId)

        return checkin
      }),

    // Complete checkin
    completeCheckin: orgProtectedProcedure
      .input(z.object({
        checkinId: z.string().uuid(),
        consultantSatisfaction: z.number().int().min(1).max(5).optional(),
        consultantFeedback: z.string().max(2000).optional(),
        consultantConcerns: z.array(z.string()).optional(),
        clientSatisfaction: z.number().int().min(1).max(5).optional(),
        clientFeedback: z.string().max(2000).optional(),
        clientConcerns: z.array(z.string()).optional(),
        actionItems: z.array(z.object({
          description: z.string(),
          assignee: z.string().optional(),
          dueDate: z.string().optional(),
        })).optional(),
        followUpRequired: z.boolean().default(false),
        followUpDate: z.string().optional(),
        healthScore: z.number().int().min(0).max(100).optional(),
        healthAssessment: z.enum(['healthy', 'minor_concerns', 'at_risk', 'critical']).optional(),
        notes: z.string().max(5000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        // Fetch checkin to get placement_id
        const { data: existingCheckin, error: fetchError } = await adminClient
          .from('placement_checkins')
          .select('id, placement_id')
          .eq('id', input.checkinId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !existingCheckin) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Checkin not found' })
        }

        const { data: checkin, error } = await adminClient
          .from('placement_checkins')
          .update({
            completed_at: now,
            completed_by: user.id,
            consultant_satisfaction: input.consultantSatisfaction,
            consultant_feedback: input.consultantFeedback,
            consultant_concerns: input.consultantConcerns,
            client_satisfaction: input.clientSatisfaction,
            client_feedback: input.clientFeedback,
            client_concerns: input.clientConcerns,
            action_items: input.actionItems,
            follow_up_required: input.followUpRequired,
            follow_up_date: input.followUpDate,
            health_score: input.healthScore,
            health_assessment: input.healthAssessment,
            notes: input.notes,
            updated_at: now,
          })
          .eq('id', input.checkinId)
          .select('id, health_assessment')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update placement health status
        if (input.healthAssessment) {
          const healthStatusMap: Record<string, string> = {
            healthy: 'healthy',
            minor_concerns: 'healthy',
            at_risk: 'at_risk',
            critical: 'critical',
          }

          await adminClient
            .from('placements')
            .update({
              health_status: healthStatusMap[input.healthAssessment],
              last_check_in_date: now,
              updated_at: now,
            })
            .eq('id', existingCheckin.placement_id)
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'placement',
          entity_id: existingCheckin.placement_id,
          activity_type: 'checkin_completed',
          subject: 'Checkin completed',
          description: input.healthAssessment ? `Health: ${input.healthAssessment.replace('_', ' ')}` : 'Checkin recorded',
          outcome: input.healthAssessment === 'healthy' || input.healthAssessment === 'minor_concerns' ? 'positive' : input.healthAssessment ? 'negative' : 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: {
            checkin_id: checkin.id,
            health_assessment: input.healthAssessment,
            consultant_satisfaction: input.consultantSatisfaction,
            client_satisfaction: input.clientSatisfaction,
            follow_up_required: input.followUpRequired,
          },
        })

        return checkin
      }),

    // Get by contact ID
    getByContact: orgProtectedProcedure
      .input(z.object({
        contactId: z.string().uuid(),
        status: z.enum(['active', 'completed', 'terminated', 'all']).default('all'),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('placements')
          .select(`
            id, status, start_date, end_date, pay_rate, bill_rate, health_status,
            job:jobs!placements_job_id_fkey(id, title),
            company:companies!client_company_id(id, name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .or(`contact_id.eq.${input.contactId},candidate_id.eq.${input.contactId}`)
          .is('deleted_at', null)
          .order('start_date', { ascending: false })

        if (input.status !== 'all') {
          query = query.eq('status', input.status)
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // ============================================
    // PLACEMENTS-01: VENDOR CHAIN MANAGEMENT
    // ============================================

    // Get vendor chain for a placement
    getVendors: orgProtectedProcedure
      .input(z.object({ placementId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('placement_vendors')
          .select(`
            *,
            vendorCompany:companies!vendor_company_id(id, name, category),
            vendorContact:contacts!vendor_contact_id(id, first_name, last_name, email, phone),
            vendorContract:contracts!vendor_contract_id(id, name, status)
          `)
          .eq('org_id', orgId)
          .eq('placement_id', input.placementId)
          .eq('is_active', true)
          .order('position_in_chain', { ascending: true })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Calculate margins for the chain
        const vendorChain = (data ?? []).map((vendor, index, arr) => {
          const nextVendor = arr[index + 1]
          const margin = vendor.bill_rate && vendor.pay_rate
            ? Number(vendor.bill_rate) - Number(vendor.pay_rate)
            : null
          const marginPercent = vendor.bill_rate && vendor.pay_rate && Number(vendor.bill_rate) > 0
            ? ((Number(vendor.bill_rate) - Number(vendor.pay_rate)) / Number(vendor.bill_rate)) * 100
            : null

          return {
            ...vendor,
            calculatedMargin: margin,
            calculatedMarginPercent: marginPercent ? Math.round(marginPercent * 100) / 100 : null,
            paysTo: nextVendor?.vendorCompany?.name || 'Consultant',
          }
        })

        return vendorChain
      }),

    // Add vendor to chain
    addVendor: orgProtectedProcedure
      .input(z.object({
        placementId: z.string().uuid(),
        vendorCompanyId: z.string().uuid(),
        vendorType: z.enum(['primary', 'sub_vendor', 'end_client', 'implementation_partner']),
        positionInChain: z.number().int().min(1).max(10),
        billRate: z.number().positive().optional(),
        payRate: z.number().positive().optional(),
        markupPercentage: z.number().min(0).max(100).optional(),
        vendorContactId: z.string().uuid().optional(),
        vendorContractId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        // Calculate margin if both rates provided
        const marginAmount = input.billRate && input.payRate
          ? input.billRate - input.payRate
          : null

        const { data: vendor, error } = await adminClient
          .from('placement_vendors')
          .insert({
            org_id: orgId,
            placement_id: input.placementId,
            vendor_company_id: input.vendorCompanyId,
            vendor_type: input.vendorType,
            position_in_chain: input.positionInChain,
            bill_rate: input.billRate,
            pay_rate: input.payRate,
            markup_percentage: input.markupPercentage,
            margin_amount: marginAmount,
            vendor_contact_id: input.vendorContactId,
            vendor_contract_id: input.vendorContractId,
            is_active: true,
            created_at: now,
            updated_at: now,
          })
          .select('id, vendor_type, position_in_chain')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'placement',
          entity_id: input.placementId,
          activity_type: 'vendor_added',
          subject: `Vendor added to chain`,
          description: `Added ${input.vendorType} vendor at position ${input.positionInChain}`,
          outcome: 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: {
            vendor_id: vendor.id,
            vendor_company_id: input.vendorCompanyId,
            vendor_type: input.vendorType,
            position_in_chain: input.positionInChain,
            bill_rate: input.billRate,
            pay_rate: input.payRate,
          },
        })

        return vendor
      }),

    // Update vendor in chain
    updateVendor: orgProtectedProcedure
      .input(z.object({
        vendorId: z.string().uuid(),
        positionInChain: z.number().int().min(1).max(10).optional(),
        billRate: z.number().positive().optional(),
        payRate: z.number().positive().optional(),
        markupPercentage: z.number().min(0).max(100).optional(),
        vendorContactId: z.string().uuid().optional().nullable(),
        vendorContractId: z.string().uuid().optional().nullable(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        // Build update data
        const updateData: Record<string, unknown> = {
          updated_at: now,
        }

        if (input.positionInChain !== undefined) updateData.position_in_chain = input.positionInChain
        if (input.billRate !== undefined) updateData.bill_rate = input.billRate
        if (input.payRate !== undefined) updateData.pay_rate = input.payRate
        if (input.markupPercentage !== undefined) updateData.markup_percentage = input.markupPercentage
        if (input.vendorContactId !== undefined) updateData.vendor_contact_id = input.vendorContactId
        if (input.vendorContractId !== undefined) updateData.vendor_contract_id = input.vendorContractId
        if (input.isActive !== undefined) updateData.is_active = input.isActive

        // Calculate margin if rates updated
        if (input.billRate !== undefined && input.payRate !== undefined) {
          updateData.margin_amount = input.billRate - input.payRate
        }

        const { data: vendor, error } = await adminClient
          .from('placement_vendors')
          .update(updateData)
          .eq('id', input.vendorId)
          .eq('org_id', orgId)
          .select('id, placement_id')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true, vendorId: vendor.id }
      }),

    // Remove vendor from chain (soft delete)
    removeVendor: orgProtectedProcedure
      .input(z.object({ vendorId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { data: vendor, error } = await adminClient
          .from('placement_vendors')
          .update({
            is_active: false,
            updated_at: now,
          })
          .eq('id', input.vendorId)
          .eq('org_id', orgId)
          .select('id, placement_id')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'placement',
          entity_id: vendor.placement_id,
          activity_type: 'vendor_removed',
          subject: 'Vendor removed from chain',
          description: 'Vendor deactivated from vendor chain',
          outcome: 'neutral',
          created_by: user.id,
          created_at: now,
          metadata: { vendor_id: input.vendorId },
        })

        return { success: true }
      }),

    // Calculate total margin for vendor chain
    getVendorChainMargin: orgProtectedProcedure
      .input(z.object({ placementId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data: vendors, error } = await adminClient
          .from('placement_vendors')
          .select('bill_rate, pay_rate, margin_amount, position_in_chain')
          .eq('org_id', orgId)
          .eq('placement_id', input.placementId)
          .eq('is_active', true)
          .order('position_in_chain', { ascending: true })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        if (!vendors || vendors.length === 0) {
          return {
            totalMargin: 0,
            totalMarginPercent: 0,
            topBillRate: 0,
            bottomPayRate: 0,
            vendorCount: 0,
          }
        }

        // Top of chain bills client, bottom pays consultant
        const topVendor = vendors[0]
        const bottomVendor = vendors[vendors.length - 1]

        const topBillRate = Number(topVendor.bill_rate) || 0
        const bottomPayRate = Number(bottomVendor.pay_rate) || 0
        const totalMargin = topBillRate - bottomPayRate
        const totalMarginPercent = topBillRate > 0
          ? (totalMargin / topBillRate) * 100
          : 0

        return {
          totalMargin: Math.round(totalMargin * 100) / 100,
          totalMarginPercent: Math.round(totalMarginPercent * 100) / 100,
          topBillRate,
          bottomPayRate,
          vendorCount: vendors.length,
        }
      }),
  }),

  // ============================================
  // COMMISSIONS (G05)
  // ============================================
  commissions: router({
    // Get commission summary for current user
    getSummary: orgProtectedProcedure
      .input(z.object({
        period: z.enum(['current', 'previous', 'ytd']).default('current'),
        year: z.number().default(new Date().getFullYear()),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED' })
        }

        // Calculate date range based on period
        const now = new Date()
        let startDate: Date
        let endDate: Date = now

        if (input.period === 'current') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        } else if (input.period === 'previous') {
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        } else {
          // YTD
          startDate = new Date(input.year, 0, 1)
          endDate = new Date(input.year, 11, 31)
        }

        // Fetch placements for this recruiter in date range
        const { data: placements } = await adminClient
          .from('placements')
          .select(`
            id, status, start_date, end_date,
            bill_rate, pay_rate,
            candidate:user_profiles!placements_candidate_id_fkey(first_name, last_name),
            company:companies!jobs_company_id_fkey(name)
          `)
          .eq('org_id', orgId)
          .eq('recruiter_id', user.id)
          .in('status', ['active', 'extended', 'completed'])
          .gte('start_date', startDate.toISOString().split('T')[0])
          .order('start_date', { ascending: false })

        // Calculate commissions (5% of gross billing)
        // Assume 160 hours/month for estimation
        const HOURS_PER_MONTH = 160
        const COMMISSION_RATE = 0.05

        type PlacementItem = {
          id: string
          status: string
          start_date: string
          end_date: string | null
          bill_rate: number | null
          pay_rate: number | null
          candidate: { first_name: string | null; last_name: string | null }[] | null
          company: { name: string | null }[] | null
        }

        const commissionsByPlacement = (placements as PlacementItem[] || []).map((p) => {
          const grossBilling = (p.bill_rate || 0) * HOURS_PER_MONTH
          const commission = grossBilling * COMMISSION_RATE
          const candidateData = Array.isArray(p.candidate) ? p.candidate[0] : p.candidate
          const companyData = Array.isArray(p.company) ? p.company[0] : p.company
          return {
            placementId: p.id,
            candidateName: `${candidateData?.first_name || ''} ${candidateData?.last_name || ''}`.trim() || 'Unknown',
            accountName: companyData?.name || 'Unknown',
            billRate: p.bill_rate || 0,
            grossBilling,
            commission,
            status: p.status,
          }
        })

        const totalGrossBilling = commissionsByPlacement.reduce((sum, c) => sum + c.grossBilling, 0)
        const totalCommission = commissionsByPlacement.reduce((sum, c) => sum + c.commission, 0)

        return {
          period: input.period,
          year: input.year,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalGrossBilling,
          totalCommission,
          commissionRate: COMMISSION_RATE,
          placementsCount: placements?.length || 0,
          commissionsByPlacement,
        }
      }),

    // Get monthly trend for past N months
    getTrend: orgProtectedProcedure
      .input(z.object({
        months: z.number().min(3).max(12).default(6),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED' })
        }

        const now = new Date()
        const startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - input.months)

        const { data: placements } = await adminClient
          .from('placements')
          .select('id, start_date, bill_rate')
          .eq('org_id', orgId)
          .eq('recruiter_id', user.id)
          .in('status', ['active', 'extended', 'completed'])
          .gte('start_date', startDate.toISOString().split('T')[0])

        // Group by month and calculate
        const monthlyData: Record<string, { grossBilling: number; commission: number }> = {}

        // Initialize all months with zero
        for (let i = input.months - 1; i >= 0; i--) {
          const monthDate = new Date(now)
          monthDate.setMonth(monthDate.getMonth() - i)
          const monthKey = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          monthlyData[monthKey] = { grossBilling: 0, commission: 0 }
        }

        const HOURS_PER_MONTH = 160
        const COMMISSION_RATE = 0.05

        ;(placements || []).forEach((p) => {
          const placementDate = new Date(p.start_date)
          const monthKey = placementDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          if (monthlyData[monthKey]) {
            const grossBilling = (p.bill_rate || 0) * HOURS_PER_MONTH
            monthlyData[monthKey].grossBilling += grossBilling
            monthlyData[monthKey].commission += grossBilling * COMMISSION_RATE
          }
        })

        // Convert to array preserving order
        const result: { month: string; grossBilling: number; commission: number }[] = []
        for (let i = input.months - 1; i >= 0; i--) {
          const monthDate = new Date(now)
          monthDate.setMonth(monthDate.getMonth() - i)
          const monthKey = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          result.push({
            month: monthKey,
            ...monthlyData[monthKey],
          })
        }

        return result
      }),
  }),

  // ============================================
  // CANDIDATES (E01-E05)
  // ============================================
  candidates: router({
    // Basic search candidates (legacy)
    search: orgProtectedProcedure
      .input(z.object({
        query: z.string().min(1),
        status: z.string().optional(),
        skills: z.array(z.string()).optional(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('candidates')
          .select('id, first_name, last_name, email, phone, status, skills, title, location')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .or(`first_name.ilike.%${input.query}%,last_name.ilike.%${input.query}%,email.ilike.%${input.query}%,skills.ilike.%${input.query}%`)
          .limit(input.limit)

        if (input.status) {
          query = query.eq('status', input.status)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(c => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`,
          email: c.email,
          phone: c.phone,
          status: c.status,
          skills: c.skills,
          title: c.title,
          location: c.location,
        })) ?? []
      }),

    // Get candidate by ID with related data (for edit mode)
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Fetch candidate and related data in parallel
        const [candidateResult, skillsResult, workHistoryResult, educationResult] = await Promise.all([
          adminClient
            .from('candidates')
            .select('*')
            .eq('id', input.id)
            .eq('org_id', orgId)
            .single(),
          adminClient
            .from('candidate_skills')
            .select('*')
            .eq('candidate_id', input.id)
            .order('created_at', { ascending: true }),
          adminClient
            .from('candidate_work_history')
            .select('*')
            .eq('candidate_id', input.id)
            .order('start_date', { ascending: false }),
          adminClient
            .from('candidate_education')
            .select('*')
            .eq('candidate_id', input.id)
            .order('start_date', { ascending: false }),
        ])

        if (candidateResult.error) {
          console.error('[candidates.getById] Error:', candidateResult.error.message, candidateResult.error.code)
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidate not found' })
        }

        return {
          ...candidateResult.data,
          skills: skillsResult.data ?? [],
          workHistory: workHistoryResult.data ?? [],
          education: educationResult.data ?? [],
        }
      }),

    // Get sourcing stats (enhanced)
    getSourcingStats: orgProtectedProcedure
      .input(z.object({
        period: z.enum(['week', 'month', 'sprint']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const now = new Date()
        let startDate: Date

        const period = input?.period ?? 'week'
        if (period === 'week') {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 7)
        } else if (period === 'month') {
          startDate = new Date(now)
          startDate.setMonth(startDate.getMonth() - 1)
        } else {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 14)
        }

        // Total candidates
        const { count: total } = await adminClient
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        // Active candidates
        const { count: active } = await adminClient
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'active')
          .is('deleted_at', null)

        // Hotlist candidates
        const { count: hotlist } = await adminClient
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('is_on_hotlist', true)
          .is('deleted_at', null)

        // Added this week
        const { count: addedThisWeek } = await adminClient
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .gte('created_at', startDate.toISOString())
          .is('deleted_at', null)

        return {
          total: total ?? 0,
          active: active ?? 0,
          hotlist: hotlist ?? 0,
          addedThisWeek: addedThisWeek ?? 0,
          period,
        }
      }),

    // Stats for candidates list view (aggregate metrics)
    stats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Total candidates
        const { count: total } = await adminClient
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        // Active candidates
        const { count: active } = await adminClient
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'active')
          .is('deleted_at', null)

        // Placed this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        const { count: placedThisMonth } = await adminClient
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'placed')
          .gte('updated_at', startOfMonth.toISOString())
          .is('deleted_at', null)

        // Calculate placement rate (placed / total submitted candidates)
        const { count: totalSubmitted } = await adminClient
          .from('submissions')
          .select('candidate_id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        const { count: placedTotal } = await adminClient
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'placed')
          .is('deleted_at', null)

        const avgPlacementRate = totalSubmitted && totalSubmitted > 0
          ? Math.round(((placedTotal ?? 0) / totalSubmitted) * 100)
          : 0

        // New this week
        const startOfWeek = new Date()
        startOfWeek.setDate(startOfWeek.getDate() - 7)
        const { count: newThisWeek } = await adminClient
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .gte('created_at', startOfWeek.toISOString())
          .is('deleted_at', null)

        return {
          total: total ?? 0,
          active: active ?? 0,
          placedThisMonth: placedThisMonth ?? 0,
          avgPlacementRate,
          newThisWeek: newThisWeek ?? 0,
        }
      }),

    // ============================================
    // CREATE CANDIDATE (E01)
    // ============================================
    create: orgProtectedProcedure
      .input(createCandidateInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Check for duplicate email
        const { data: existing } = await adminClient
          .from('candidates')
          .select('id, first_name, last_name')
          .eq('org_id', orgId)
          .eq('email', input.email.toLowerCase())
          .is('deleted_at', null)
          .maybeSingle()

        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Candidate with email ${input.email} already exists: ${existing.first_name} ${existing.last_name}`,
          })
        }

        const now = new Date().toISOString()

        // Create candidate record with all fields
        const { data: candidate, error: createError } = await adminClient
          .from('candidates')
          .insert({
            org_id: orgId,
            first_name: input.firstName,
            last_name: input.lastName,
            email: input.email.toLowerCase(),
            phone: input.phone,
            mobile: input.mobile,
            linkedin_url: input.linkedinUrl,
            title: input.professionalHeadline,
            professional_summary: input.professionalSummary,
            years_experience: input.experienceYears,
            // Employment preferences
            employment_types: input.employmentTypes,
            work_modes: input.workModes,
            // Work authorization
            visa_status: input.visaStatus,
            visa_expiry_date: input.visaExpiryDate?.toISOString(),
            requires_sponsorship: input.requiresSponsorship,
            current_sponsor: input.currentSponsor,
            is_transferable: input.isTransferable,
            // Availability
            availability: input.availability,
            available_from: input.availableFrom,
            notice_period_days: input.noticePeriodDays,
            // Location
            location: input.location,
            location_city: input.locationCity,
            location_state: input.locationState,
            location_country: input.locationCountry,
            willing_to_relocate: input.willingToRelocate,
            relocation_preferences: input.relocationPreferences,
            is_remote_ok: input.isRemoteOk,
            // Compensation
            rate_type: input.rateType,
            minimum_rate: input.minimumRate,
            desired_rate: input.desiredRate,
            currency: input.currency,
            is_negotiable: input.isNegotiable,
            compensation_notes: input.compensationNotes,
            // Source tracking
            lead_source: input.leadSource,
            lead_source_detail: input.sourceDetails,
            referred_by: input.referredBy,
            campaign_id: input.campaignId,
            // Metadata
            tags: input.tags ?? [],
            is_on_hotlist: input.isOnHotlist,
            hotlist_notes: input.hotlistNotes,
            hotlist_added_at: input.isOnHotlist ? now : null,
            hotlist_added_by: input.isOnHotlist ? user.id : null,
            internal_notes: input.internalNotes,
            status: 'active',
            sourced_by: user.id,
            created_by: user.id,
            created_at: now,
            updated_at: now,
          })
          .select('id')
          .single()

        if (createError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: createError.message })
        }

        // Add skills with full metadata
        if (input.skills.length > 0) {
          const skillsToInsert = input.skills.map(skill => ({
            org_id: orgId,
            candidate_id: candidate.id,
            skill_name: skill.name,
            proficiency_level: skill.proficiency,
            years_of_experience: skill.yearsOfExperience,
            is_primary: skill.isPrimary,
            is_certified: skill.isCertified,
            source: 'manual',
            created_at: now,
          }))

          await adminClient.from('candidate_skills').insert(skillsToInsert)
        }

        // Add work history
        if (input.workHistory.length > 0) {
          const workHistoryToInsert = input.workHistory.map((job, index) => ({
            org_id: orgId,
            candidate_id: candidate.id,
            company_name: job.companyName,
            job_title: job.jobTitle,
            employment_type: job.employmentType,
            start_date: job.startDate,
            end_date: job.endDate,
            is_current: job.isCurrent,
            location_city: job.locationCity,
            location_state: job.locationState,
            location_country: job.locationCountry || null,
            is_remote: job.isRemote,
            description: job.description,
            responsibilities: job.responsibilities || [],
            achievements: job.achievements || [],
            skills_used: job.skillsUsed || [],
            tools_used: job.toolsUsed || [],
            internal_notes: job.notes || null,
            display_order: index,
            created_at: now,
            updated_at: now,
          }))

          await adminClient.from('candidate_work_history').insert(workHistoryToInsert)
        }

        // Add education
        if (input.education.length > 0) {
          const educationToInsert = input.education.map((edu, index) => ({
            org_id: orgId,
            candidate_id: candidate.id,
            institution_name: edu.institutionName,
            degree_type: edu.degreeType,
            degree_name: edu.degreeName,
            field_of_study: edu.fieldOfStudy,
            start_date: edu.startDate,
            end_date: edu.endDate,
            is_current: edu.isCurrent,
            gpa: edu.gpa,
            honors: edu.honors,
            institution_city: edu.locationCity || null,
            institution_state: edu.locationState || null,
            institution_country: edu.locationCountry || null,
            internal_notes: edu.notes || null,
            display_order: index,
            created_at: now,
            updated_at: now,
          }))

          await adminClient.from('candidate_education').insert(educationToInsert)
        }

        // Add certifications
        if (input.certifications.length > 0) {
          const certificationsToInsert = input.certifications.map(cert => ({
            org_id: orgId,
            candidate_id: candidate.id,
            certification_type: 'professional', // Default type
            name: cert.name,
            acronym: cert.acronym,
            issuing_organization: cert.issuingOrganization,
            credential_id: cert.credentialId,
            credential_url: cert.credentialUrl,
            issue_date: cert.issueDate,
            expiry_date: cert.expiryDate,
            is_lifetime: cert.isLifetime,
            created_at: now,
            updated_at: now,
          }))

          await adminClient.from('candidate_certifications').insert(certificationsToInsert)
        }

        // Create address record if structured location fields are provided
        if (input.locationCity || input.locationState) {
          await adminClient
            .from('addresses')
            .insert({
              org_id: orgId,
              entity_type: 'candidate',
              entity_id: candidate.id,
              address_type: 'current',
              city: input.locationCity || null,
              state_province: input.locationState || null,
              country_code: input.locationCountry || 'US',
              is_primary: true,
              created_at: now,
              updated_at: now,
            })
        }

        // Create submissions for associated jobs
        if (input.associatedJobIds && input.associatedJobIds.length > 0) {
          const submissionsToInsert = input.associatedJobIds.map(jobId => ({
            org_id: orgId,
            job_id: jobId,
            candidate_id: candidate.id,
            status: 'sourced',
            source: 'manual',
            submitted_by: user.id,
            submitted_at: now,
            created_at: now,
            updated_at: now,
          }))

          await adminClient.from('submissions').insert(submissionsToInsert)
        }

        // Create resume record if resume data is provided
        if (input.resumeData) {
          await adminClient.from('contact_resumes').insert({
            org_id: orgId,
            candidate_id: candidate.id,
            file_name: input.resumeData.fileName,
            storage_path: input.resumeData.storagePath,
            file_size: input.resumeData.fileSize,
            mime_type: input.resumeData.mimeType,
            resume_type: 'master',
            parsed_content: input.resumeData.parsedContent,
            parsed_skills: input.resumeData.parsedSkills,
            parsed_experience: input.resumeData.parsedExperience,
            ai_summary: input.resumeData.aiSummary,
            uploaded_by: user.id,
            uploaded_at: now,
            created_at: now,
            updated_at: now,
          })
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'candidate',
          entity_id: candidate.id,
          activity_type: 'note',
          subject: `Candidate added: ${input.firstName} ${input.lastName}`,
          description: `Sourced from ${input.leadSource}${input.sourceDetails ? ` - ${input.sourceDetails}` : ''}${input.resumeData ? ' (resume parsed)' : ''}`,
          outcome: 'positive',
          created_by: user.id,
          created_at: now,
        })

        // HISTORY: Record candidate creation (fire-and-forget)
        void historyService.recordEntityCreated(
          'candidate',
          candidate.id,
          { orgId, userId: user.id },
          { entityName: `${input.firstName} ${input.lastName}`, initialStatus: 'active' }
        ).catch(err => console.error('[History] Failed to record candidate creation:', err))

        return { candidateId: candidate.id }
      }),

    // ============================================
    // UPDATE CANDIDATE
    // ============================================
    update: orgProtectedProcedure
      .input(updateCandidateInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        try {

        // Look up user_profiles.id from auth_id for FK constraints (resume/document uploads)
        const { data: userProfile, error: userProfileError } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (userProfileError || !userProfile) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User profile not found' })
        }

        const userProfileId = userProfile.id

        // Get current candidate
        const { data: candidate, error: fetchError } = await adminClient
          .from('candidates')
          .select('*')
          .eq('id', input.candidateId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !candidate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidate not found' })
        }

        const now = new Date().toISOString()
        const updateData: Record<string, unknown> = { updated_at: now }

        // Build update object - Personal info
        if (input.firstName !== undefined) updateData.first_name = input.firstName
        if (input.lastName !== undefined) updateData.last_name = input.lastName
        if (input.email !== undefined) updateData.email = input.email.toLowerCase()
        if (input.phone !== undefined) updateData.phone = input.phone
        if (input.mobile !== undefined) updateData.mobile = input.mobile
        if (input.linkedinUrl !== undefined) updateData.linkedin_url = input.linkedinUrl

        // Professional info
        if (input.professionalHeadline !== undefined) updateData.title = input.professionalHeadline
        if (input.professionalSummary !== undefined) updateData.professional_summary = input.professionalSummary
        if (input.currentCompany !== undefined) updateData.current_company = input.currentCompany
        if (input.experienceYears !== undefined) updateData.years_experience = input.experienceYears

        // Employment preferences
        if (input.employmentTypes !== undefined) updateData.employment_types = input.employmentTypes
        if (input.workModes !== undefined) updateData.work_modes = input.workModes

        // Work authorization
        if (input.visaStatus !== undefined) updateData.visa_status = input.visaStatus
        if (input.visaExpiryDate !== undefined) updateData.visa_expiry_date = input.visaExpiryDate?.toISOString()
        if (input.workAuthorization !== undefined) updateData.work_authorization = input.workAuthorization
        if (input.requiresSponsorship !== undefined) updateData.requires_sponsorship = input.requiresSponsorship
        if (input.currentSponsor !== undefined) updateData.current_sponsor = input.currentSponsor
        if (input.isTransferable !== undefined) updateData.is_transferable = input.isTransferable
        if (input.clearanceLevel !== undefined) updateData.clearance_level = input.clearanceLevel

        // Availability
        if (input.availability !== undefined) updateData.availability = input.availability
        if (input.availableFrom !== undefined) updateData.available_from = input.availableFrom
        if (input.noticePeriodDays !== undefined) updateData.notice_period_days = input.noticePeriodDays

        // Location
        if (input.location !== undefined) updateData.location = input.location
        if (input.locationCity !== undefined) updateData.location_city = input.locationCity
        if (input.locationState !== undefined) updateData.location_state = input.locationState
        if (input.locationCountry !== undefined) updateData.location_country = input.locationCountry
        if (input.willingToRelocate !== undefined) updateData.willing_to_relocate = input.willingToRelocate
        if (input.relocationPreferences !== undefined) updateData.relocation_preferences = input.relocationPreferences
        if (input.isRemoteOk !== undefined) updateData.is_remote_ok = input.isRemoteOk

        // Compensation
        if (input.minimumRate !== undefined) updateData.minimum_rate = input.minimumRate
        if (input.desiredRate !== undefined) updateData.desired_rate = input.desiredRate
        if (input.rateType !== undefined) updateData.rate_type = input.rateType
        if (input.currency !== undefined) updateData.currency = input.currency
        if (input.isNegotiable !== undefined) updateData.is_negotiable = input.isNegotiable
        if (input.compensationNotes !== undefined) updateData.compensation_notes = input.compensationNotes

        // Tags and status
        if (input.tags !== undefined) updateData.tags = input.tags
        if (input.profileStatus !== undefined) updateData.status = input.profileStatus

        // Handle hotlist changes
        if (input.isOnHotlist !== undefined) {
          updateData.is_on_hotlist = input.isOnHotlist
          if (input.isOnHotlist && !candidate.is_on_hotlist) {
            updateData.hotlist_added_at = now
            updateData.hotlist_added_by = user.id
          } else if (!input.isOnHotlist) {
            updateData.hotlist_added_at = null
            updateData.hotlist_added_by = null
          }
        }
        if (input.hotlistNotes !== undefined) updateData.hotlist_notes = input.hotlistNotes

        // Source tracking
        if (input.leadSource !== undefined) updateData.lead_source = input.leadSource
        if (input.sourceDetails !== undefined) updateData.lead_source_detail = input.sourceDetails
        if (input.referredBy !== undefined) updateData.referred_by = input.referredBy
        if (input.campaignId !== undefined) updateData.campaign_id = input.campaignId

        // Handle wizard_state for draft persistence
        if (input.wizard_state !== undefined) {
          updateData.wizard_state = input.wizard_state
        }

        // Update candidate
        const { error: updateError } = await adminClient
          .from('candidates')
          .update(updateData)
          .eq('id', input.candidateId)
          .eq('org_id', orgId)

        if (updateError) {
          // Handle duplicate email error with user-friendly message
          if (updateError.message?.includes('candidates_email_unique') || updateError.code === '23505') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'A candidate with this email already exists. Please use a different email address.',
            })
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Update skills if provided (now accepts full skill entries with metadata)
        if (input.skills !== undefined) {
          // Delete existing skills
          const { error: deleteSkillsError } = await adminClient
            .from('candidate_skills')
            .delete()
            .eq('candidate_id', input.candidateId)

          if (deleteSkillsError) {
            console.error('[Candidate Update] Failed to delete existing skills:', deleteSkillsError.message)
          }

          // Insert new skills with full metadata
          if (input.skills.length > 0) {
            const skillsToInsert = []

            for (const skillEntry of input.skills) {
              const skillName = skillEntry.name

              // Look up skill in master skills table (case-insensitive search)
              const { data: existingSkill } = await adminClient
                .from('skills')
                .select('id')
                .ilike('name', skillName)
                .limit(1)
                .single()

              let skillId: string

              if (existingSkill) {
                // Use existing skill ID
                skillId = existingSkill.id
              } else {
                // Create new skill in master table (org-specific)
                const { data: newSkill, error: createSkillError } = await adminClient
                  .from('skills')
                  .insert({
                    name: skillName,
                    org_id: orgId,
                    category: 'general',
                    is_verified: false,
                    created_at: now,
                    updated_at: now,
                  })
                  .select('id')
                  .single()

                if (createSkillError || !newSkill) {
                  console.error(`[Candidate Update] Failed to create skill '${skillName}':`, createSkillError?.message)
                  continue // Skip this skill
                }
                skillId = newSkill.id
              }

              // Map proficiency enum to number (1-5)
              const proficiencyMap: Record<string, number> = {
                beginner: 1,
                basic: 2,
                intermediate: 3,
                advanced: 4,
                expert: 5,
              }

              skillsToInsert.push({
                candidate_id: input.candidateId,
                skill_id: skillId,
                skill_name: skillName,
                proficiency_level: proficiencyMap[skillEntry.proficiency] || 3,
                years_of_experience: skillEntry.yearsOfExperience || null, // Fixed: column is years_of_experience not years_experience
                is_primary: skillEntry.isPrimary || false,
                is_certified: skillEntry.isCertified || false,
                last_used_date: skillEntry.lastUsed ? `${skillEntry.lastUsed}-01` : null, // Fixed: column is last_used_date (DATE type)
                source: 'manual',
                created_at: now,
                updated_at: now,
              })
            }

            if (skillsToInsert.length > 0) {
              const { error: insertSkillsError } = await adminClient.from('candidate_skills').insert(skillsToInsert)
              if (insertSkillsError) {
                console.error('[Candidate Update] Failed to insert skills:', insertSkillsError.message)
              }
            }
          }
        }

        // Update work history if provided
        if (input.workHistory !== undefined && input.workHistory.length > 0) {
          // Delete existing work history
          const { error: deleteWorkHistoryError } = await adminClient
            .from('candidate_work_history')
            .delete()
            .eq('candidate_id', input.candidateId)

          if (deleteWorkHistoryError) {
            console.error('[Candidate Update] Failed to delete existing work history:', deleteWorkHistoryError.message)
          }

          // Insert new work history
          // Helper to convert YYYY-MM to YYYY-MM-01 for PostgreSQL DATE type
          const formatDateForDb = (dateStr: string | undefined | null): string | null => {
            if (!dateStr) return null
            // If already in YYYY-MM-DD format, return as-is
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
            // If in YYYY-MM format, append -01
            if (/^\d{4}-\d{2}$/.test(dateStr)) return `${dateStr}-01`
            return dateStr
          }

          const workHistoryToInsert = input.workHistory.map((w, index) => ({
            org_id: orgId,
            candidate_id: input.candidateId,
            company_name: w.companyName,
            job_title: w.jobTitle,
            employment_type: w.employmentType || null,
            start_date: formatDateForDb(w.startDate), // Fixed: convert YYYY-MM to YYYY-MM-01 for DATE type
            end_date: formatDateForDb(w.endDate), // Fixed: convert YYYY-MM to YYYY-MM-01 for DATE type
            is_current: w.isCurrent || false,
            location_city: w.locationCity || null,
            location_state: w.locationState || null,
            location_country: w.locationCountry || null,
            is_remote: w.isRemote || false,
            description: w.description || null,
            responsibilities: w.responsibilities || [],
            achievements: w.achievements || [],
            skills_used: w.skillsUsed || [],
            tools_used: w.toolsUsed || [],
            internal_notes: w.notes || null,
            display_order: index,
            created_at: now,
            updated_at: now,
          }))

          const { error: insertWorkHistoryError } = await adminClient.from('candidate_work_history').insert(workHistoryToInsert)
          if (insertWorkHistoryError) {
            console.error('[Candidate Update] Failed to insert work history:', insertWorkHistoryError.message)
          }
        }

        // Update education if provided
        if (input.education !== undefined && input.education.length > 0) {
          // Delete existing education
          const { error: deleteEducationError } = await adminClient
            .from('candidate_education')
            .delete()
            .eq('candidate_id', input.candidateId)

          if (deleteEducationError) {
            console.error('[Candidate Update] Failed to delete existing education:', deleteEducationError.message)
          }

          // Insert new education
          // Helper to convert YYYY-MM to YYYY-MM-01 for PostgreSQL DATE type
          const formatDateForEducation = (dateStr: string | undefined | null): string | null => {
            if (!dateStr) return null
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
            if (/^\d{4}-\d{2}$/.test(dateStr)) return `${dateStr}-01`
            return dateStr
          }

          const educationToInsert = input.education.map((e, index) => ({
            org_id: orgId,
            candidate_id: input.candidateId,
            institution_name: e.institutionName,
            degree_type: e.degreeType || null,
            degree_name: e.degreeName || null,
            field_of_study: e.fieldOfStudy || null,
            start_date: formatDateForEducation(e.startDate), // Fixed: convert YYYY-MM to YYYY-MM-01 for DATE type
            end_date: formatDateForEducation(e.endDate), // Fixed: convert YYYY-MM to YYYY-MM-01 for DATE type
            is_current: e.isCurrent || false,
            gpa: e.gpa || null,
            honors: e.honors || null,
            institution_city: e.locationCity || null,
            institution_state: e.locationState || null,
            institution_country: e.locationCountry || null,
            internal_notes: e.notes || null,
            display_order: index,
            created_at: now,
            updated_at: now,
          }))

          const { error: insertEducationError } = await adminClient.from('candidate_education').insert(educationToInsert)
          if (insertEducationError) {
            console.error('[Candidate Update] Failed to insert education:', insertEducationError.message)
          }
        }

        // Update certifications if provided
        if (input.certifications !== undefined && input.certifications.length > 0) {
          // Delete existing certifications
          const { error: deleteCertificationsError } = await adminClient
            .from('candidate_certifications')
            .delete()
            .eq('candidate_id', input.candidateId)

          if (deleteCertificationsError) {
            console.error('[Candidate Update] Failed to delete existing certifications:', deleteCertificationsError.message)
          }

          // Insert new certifications
          // Helper to convert dates for PostgreSQL DATE type
          const formatDateForCert = (dateStr: string | undefined | null): string | null => {
            if (!dateStr) return null
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
            if (/^\d{4}-\d{2}$/.test(dateStr)) return `${dateStr}-01`
            return dateStr
          }

          const certificationsToInsert = input.certifications.map(cert => ({
            org_id: orgId,
            candidate_id: input.candidateId,
            certification_type: 'professional',
            name: cert.name,
            acronym: cert.acronym || null,
            issuing_organization: cert.issuingOrganization || null,
            credential_id: cert.credentialId || null,
            credential_url: cert.credentialUrl || null,
            issue_date: formatDateForCert(cert.issueDate), // Safe conversion for DATE type
            expiry_date: formatDateForCert(cert.expiryDate), // Safe conversion for DATE type
            is_lifetime: cert.isLifetime || false,
            created_at: now,
            updated_at: now,
          }))

          const { error: insertCertificationsError } = await adminClient.from('candidate_certifications').insert(certificationsToInsert)
          if (insertCertificationsError) {
            console.error('[Candidate Update] Failed to insert certifications:', insertCertificationsError.message)
          }
        }

        // Create resume record if resume data is provided (draft finalization)
        if (input.resumeData) {
          const { data: resumeRecord, error: resumeError } = await adminClient.from('candidate_resumes').insert({
            org_id: orgId,
            candidate_id: input.candidateId,
            // File info
            bucket: 'resumes',
            file_path: input.resumeData.storagePath,
            file_name: input.resumeData.fileName,
            file_size: input.resumeData.fileSize,
            mime_type: input.resumeData.mimeType,
            // Metadata
            resume_type: 'master',
            source: 'uploaded',
            is_primary: true, // First resume is primary by default
            is_latest: true,
            version: 1,
            // Parsed content from AI
            parsed_content: input.resumeData.parsedContent,
            parsed_skills: input.resumeData.parsedSkills,
            parsed_experience: input.resumeData.parsedExperience,
            ai_summary: input.resumeData.aiSummary,
            // Audit
            uploaded_by: userProfileId,
            uploaded_at: now,
            created_at: now,
            updated_at: now,
          }).select()
          if (resumeError) {
            console.error('[Candidate Update] Failed to insert resume record:', resumeError.message, resumeError)
            // Don't throw - resume is optional during update, just log the failure
          } else {
            console.log('[Candidate Update] Successfully inserted resume record:', resumeRecord?.[0]?.id)
          }
        } else {
          console.log('[Candidate Update] No resumeData provided, skipping resume insert')
        }

        // Create compliance document records if provided
        if (input.complianceDocumentsData && input.complianceDocumentsData.length > 0) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

          // Map document types to allowed CHECK constraint values
          // (Most types now directly allowed after DB migration)
          const mapDocumentType = (type: string): string => {
            const validTypes = [
              'resume', 'cover_letter', 'id_document', 'certification', 'reference_letter',
              'background_check', 'drug_test', 'i9', 'w4', 'direct_deposit', 'msa', 'nda',
              'sow', 'w9', 'coi', 'insurance', 'contract', 'job_description', 'requirements',
              'scorecard', 'other', 'note_attachment', 'email_attachment',
              // New compliance types
              'rtr', 'void_check', 'references', 'background_auth', 'offer_letter', 'employment_verification'
            ]
            return validTypes.includes(type) ? type : 'other'
          }

          const documentsToInsert = input.complianceDocumentsData.map(doc => ({
            org_id: orgId,
            entity_type: 'candidate',
            entity_id: input.candidateId,
            // File info (correct column names per schema)
            file_name: doc.fileName,
            file_size_bytes: doc.fileSize,
            storage_bucket: 'documents',
            storage_path: doc.storagePath,
            public_url: `${supabaseUrl}/storage/v1/object/public/documents/${doc.storagePath}`,
            // Document metadata - map to valid CHECK constraint value
            document_type: mapDocumentType(doc.documentType),
            document_category: 'compliance', // Use compliance category for these
            description: doc.notes || null, // Just use notes as description
            // Audit
            uploaded_by: userProfileId,
            created_at: now,
            updated_at: now,
          }))
          const { error: docsError } = await adminClient.from('documents').insert(documentsToInsert)
          if (docsError) {
            console.error('[Candidate Update] Failed to insert documents:', docsError.message, docsError)
            // Don't throw - documents are optional, just log the failure
          } else {
            console.log('[Candidate Update] Successfully inserted', documentsToInsert.length, 'compliance documents')
          }
        }

        // Create internal note if provided (during draft finalization)
        if (input.internalNotes && input.internalNotes.trim()) {
          console.log('[Candidate Update] Inserting internal note:', {
            content: input.internalNotes.trim().substring(0, 50) + '...',
            userProfileId,
          })
          const { data: noteData, error: noteError } = await adminClient.from('notes').insert({
            org_id: orgId,
            entity_type: 'candidate',
            entity_id: input.candidateId,
            content: input.internalNotes.trim(),
            is_pinned: false,
            created_by: userProfileId, // Use user_profile.id, NOT auth.users.id (FK constraint)
            created_at: now,
            updated_at: now,
          }).select()
          if (noteError) {
            console.error('[Candidate Update] Failed to insert internal note:', noteError.message, noteError)
            // Don't throw - notes are optional, just log the failure
          } else {
            console.log('[Candidate Update] Successfully inserted internal note:', noteData?.[0]?.id)
          }
        }

        // Log activity - customize message for draft finalization
        const isFinalizingDraft = input.profileStatus === 'active' && candidate.status === 'draft'
        const { error: activityError } = await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'candidate',
          entity_id: input.candidateId,
          activity_type: 'note',
          subject: isFinalizingDraft
            ? `Candidate added: ${input.firstName || candidate.first_name} ${input.lastName || candidate.last_name}`
            : `Candidate updated`,
          description: isFinalizingDraft
            ? `Sourced from ${input.leadSource || candidate.lead_source}${input.sourceDetails ? ` - ${input.sourceDetails}` : ''}${input.resumeData ? ' (resume parsed)' : ''}`
            : 'Profile information updated',
          outcome: isFinalizingDraft ? 'positive' : 'neutral',
          created_by: user.id,
          created_at: now,
        })
        if (activityError) {
          console.error('[Candidate Update] Failed to insert activity:', activityError.message)
          // Don't throw - activity logging is not critical
        }

        return { success: true, candidateId: input.candidateId }
        } catch (error) {
          console.error('[Candidate Update] Unhandled error:', error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'Failed to update candidate',
            cause: error,
          })
        }
      }),

    // ============================================
    // CREATE DRAFT CANDIDATE
    // ============================================
    createDraft: orgProtectedProcedure
      .mutation(async ({ ctx }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        // Create minimal draft candidate record
        const { data: draft, error: draftError } = await adminClient
          .from('candidates')
          .insert({
            org_id: orgId,
            first_name: '(Untitled)',
            last_name: 'Candidate',
            email: `draft-${Date.now()}@placeholder.local`, // Temporary placeholder
            status: 'draft',
            visa_status: 'us_citizen',
            availability: '2_weeks',
            location: '',
            lead_source: 'linkedin',
            sourced_by: user.id,
            created_by: user.id,
            created_at: now,
            updated_at: now,
          })
          .select('id')
          .single()

        if (draftError) {
          console.error('[candidates.createDraft] Error:', draftError)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: draftError.message })
        }

        return { id: draft.id }
      }),

    // ============================================
    // DELETE DRAFT CANDIDATE
    // ============================================
    deleteDraft: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Verify ownership and draft status
        const { data: draft, error: fetchError } = await adminClient
          .from('candidates')
          .select('status, created_by')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (fetchError || !draft) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Draft not found' })
        }

        if (draft.status !== 'draft') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Can only delete draft candidates',
          })
        }

        // Soft delete the draft
        const { error: deleteError } = await adminClient
          .from('candidates')
          .update({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (deleteError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: deleteError.message })
        }

        return { success: true }
      }),

    // ============================================
    // ADVANCED SEARCH (E02)
    // ============================================
    advancedSearch: orgProtectedProcedure
      .input(searchCandidatesInput)
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Note: submissions join removed because submissions.candidate_id references user_profiles, not candidates table
        // Note: candidate_skills join removed due to FK mismatch - skills stored separately
        let query = adminClient
          .from('candidates')
          .select('*', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        // Text search
        if (input.search) {
          const searchTerm = input.search.trim()
          query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        }

        // Status filter
        if (input.statuses && input.statuses.length > 0) {
          query = query.in('status', input.statuses)
        }

        // Visa filter
        if (input.visaStatuses && input.visaStatuses.length > 0) {
          query = query.in('visa_status', input.visaStatuses)
        }

        // Experience range
        if (input.minExperience !== undefined) {
          query = query.gte('years_experience', input.minExperience)
        }
        if (input.maxExperience !== undefined) {
          query = query.lte('years_experience', input.maxExperience)
        }

        // Rate range
        if (input.minRate !== undefined) {
          query = query.gte('desired_rate', input.minRate)
        }
        if (input.maxRate !== undefined) {
          query = query.lte('desired_rate', input.maxRate)
        }

        // Remote filter
        if (input.remoteOk === true) {
          query = query.eq('is_remote_ok', true)
        }

        // Hotlist filter
        if (input.isOnHotlist === true) {
          query = query.eq('is_on_hotlist', true)
        }

        // Availability filter
        if (input.availability) {
          query = query.eq('availability', input.availability)
        }

        // Owner filter
        if (input.ownerId) {
          query = query.eq('sourced_by', input.ownerId)
        }

        // Source filter
        if (input.source) {
          query = query.eq('lead_source', input.source)
        }

        // Sorting - map frontend keys to database columns
        const sortColumnMap: Record<string, string> = {
          match_score: 'created_at', // Placeholder
          experience: 'years_experience',
          rate: 'desired_rate',
          availability: 'availability',
          last_updated: 'updated_at',
          created_at: 'created_at',
          name: 'first_name',
          first_name: 'first_name',
          title: 'title',
          location: 'city',
          status: 'status',
          source: 'lead_source',
          lead_source: 'lead_source',
          years_experience: 'years_experience',
          submissions_count: 'created_at', // Related count, placeholder
          owner_id: 'sourced_by',
          last_activity_date: 'updated_at',
        }
        const sortColumn = sortColumnMap[input.sortBy] || 'updated_at'

        query = query.order(sortColumn, { ascending: input.sortOrder === 'asc' })

        // Pagination
        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Note: Skills filtering disabled - candidate_skills FK references different table
        // TODO: Re-enable skills filtering once candidate_skills FK is fixed
        const results = data ?? []

        return {
          items: results,
          total: count ?? 0,
        }
      }),

    // ============================================
    // CHECK DUPLICATE (E01)
    // ============================================
    checkDuplicate: orgProtectedProcedure
      .input(z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        linkedinUrl: z.preprocess(normalizeUrl, z.string().url().optional().nullable()),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        if (!input.email && !input.phone && !input.linkedinUrl) {
          return { duplicate: null }
        }

        const conditions: string[] = []
        if (input.email) conditions.push(`email.eq.${input.email.toLowerCase()}`)
        if (input.phone) conditions.push(`phone.eq.${input.phone}`)
        if (input.linkedinUrl) conditions.push(`linkedin_url.eq.${input.linkedinUrl}`)

        const { data } = await adminClient
          .from('candidates')
          .select('id, first_name, last_name, email, created_at')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .or(conditions.join(','))
          .maybeSingle()

        return { duplicate: data }
      }),

    // ============================================
    // SAVED SEARCHES (E02)
    // ============================================
    saveSearch: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        filters: searchCandidatesInput,
        isDefault: z.boolean().default(false),
        emailAlerts: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        // If setting as default, unset other defaults
        if (input.isDefault) {
          await adminClient
            .from('saved_searches')
            .update({ is_default: false, updated_at: now })
            .eq('org_id', orgId)
            .eq('user_id', user.id)
            .eq('entity_type', 'candidate')
        }

        const { data, error } = await adminClient
          .from('saved_searches')
          .insert({
            org_id: orgId,
            user_id: user.id,
            entity_type: 'candidate',
            name: input.name,
            description: input.description,
            filters: input.filters,
            is_default: input.isDefault,
            email_alerts: input.emailAlerts,
            created_at: now,
            updated_at: now,
          })
          .select('id')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { searchId: data.id }
      }),

    getSavedSearches: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          return []
        }

        const { data, error } = await adminClient
          .from('saved_searches')
          .select('*')
          .eq('org_id', orgId)
          .eq('user_id', user.id)
          .eq('entity_type', 'candidate')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    deleteSavedSearch: orgProtectedProcedure
      .input(z.object({ searchId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const { error } = await adminClient
          .from('saved_searches')
          .delete()
          .eq('id', input.searchId)
          .eq('org_id', orgId)
          .eq('user_id', user.id)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // ============================================
    // HOTLIST OPERATIONS (E04)
    // ============================================
    addToHotlist: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        notes: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { error } = await adminClient
          .from('candidates')
          .update({
            is_on_hotlist: true,
            hotlist_added_at: now,
            hotlist_added_by: user.id,
            hotlist_notes: input.notes,
            updated_at: now,
          })
          .eq('id', input.candidateId)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'candidate',
          entity_id: input.candidateId,
          activity_type: 'note',
          subject: 'Added to hotlist',
          description: input.notes || 'Candidate added to hotlist',
          outcome: 'positive',
          created_by: user.id,
          created_at: now,
        })

        return { success: true }
      }),

    removeFromHotlist: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        reason: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { error } = await adminClient
          .from('candidates')
          .update({
            is_on_hotlist: false,
            hotlist_added_at: null,
            hotlist_added_by: null,
            hotlist_notes: null,
            updated_at: now,
          })
          .eq('id', input.candidateId)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'candidate',
          entity_id: input.candidateId,
          activity_type: 'note',
          subject: 'Removed from hotlist',
          description: input.reason || 'Candidate removed from hotlist',
          outcome: 'neutral',
          created_by: user.id,
          created_at: now,
        })

        return { success: true }
      }),

    updateHotlistNotes: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        notes: z.string().max(500),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const { error } = await adminClient
          .from('candidates')
          .update({
            hotlist_notes: input.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('org_id', orgId)
          .eq('id', input.candidateId)
          .eq('is_on_hotlist', true)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    getHotlist: orgProtectedProcedure
      .input(z.object({
        skillCategory: z.string().optional(),
        sortBy: z.enum(['date_added', 'name', 'experience']).default('date_added'),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('candidates')
          .select(`
            *,
            skills:candidate_skills(skill_name),
            submissions(id, status)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .eq('is_on_hotlist', true)
          .is('deleted_at', null)

        // Sorting
        const sortColumn = {
          date_added: 'hotlist_added_at',
          name: 'first_name',
          experience: 'years_experience',
        }[input.sortBy] || 'hotlist_added_at'

        query = query.order(sortColumn, { ascending: input.sortBy === 'name' })

        // Pagination
        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // ============================================
    // BULK OPERATIONS
    // ============================================
    bulkAddTags: orgProtectedProcedure
      .input(z.object({
        candidateIds: z.array(z.string().uuid()).min(1).max(100),
        tags: z.array(z.string()).min(1).max(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const now = new Date().toISOString()

        // Fetch current tags for all candidates
        const { data: candidates } = await adminClient
          .from('candidates')
          .select('id, tags')
          .eq('org_id', orgId)
          .in('id', input.candidateIds)

        // Update each candidate with merged tags
        for (const candidate of candidates ?? []) {
          const existingTags = (candidate.tags as string[]) ?? []
          const newTags = [...new Set([...existingTags, ...input.tags])]

          await adminClient
            .from('candidates')
            .update({ tags: newTags, updated_at: now })
            .eq('id', candidate.id)
        }

        return { updatedCount: candidates?.length ?? 0 }
      }),

    bulkAddToHotlist: orgProtectedProcedure
      .input(z.object({
        candidateIds: z.array(z.string().uuid()).min(1).max(50),
        notes: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { error } = await adminClient
          .from('candidates')
          .update({
            is_on_hotlist: true,
            hotlist_added_at: now,
            hotlist_added_by: user.id,
            hotlist_notes: input.notes,
            updated_at: now,
          })
          .eq('org_id', orgId)
          .in('id', input.candidateIds)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { updatedCount: input.candidateIds.length }
      }),

    // Bulk import candidates from CSV
    bulkImportFromCsv: orgProtectedProcedure
      .input(z.object({
        candidates: z.array(z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          mobile: z.string().optional(),
          linkedinProfile: z.string().optional(),
          professionalHeadline: z.string().optional(),
          currentCompany: z.string().optional(),
          experienceYears: z.number().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          visaStatus: z.string().optional(),
          skills: z.array(z.string()).optional(),
          rateType: z.string().optional(),
          desiredRate: z.number().optional(),
          currency: z.string().optional(),
          leadSource: z.string().optional(),
          tags: z.array(z.string()).optional(),
          internalNotes: z.string().optional(),
        })).min(1).max(500),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()
        const results = {
          total: input.candidates.length,
          success: 0,
          failed: 0,
          errors: [] as string[],
        }

        // Process each candidate
        for (let i = 0; i < input.candidates.length; i++) {
          const candidate = input.candidates[i]
          try {
            // Check for duplicate email
            const { data: existing } = await adminClient
              .from('candidates')
              .select('id')
              .eq('org_id', orgId)
              .eq('email', candidate.email)
              .is('deleted_at', null)
              .single()

            if (existing) {
              results.failed++
              results.errors.push(`Row ${i + 2}: Email ${candidate.email} already exists`)
              continue
            }

            // Build location string from city/state/country
            const locationParts = [candidate.city, candidate.state, candidate.country].filter(Boolean)
            const location = locationParts.join(', ') || null

            // Create candidate record
            const { error: insertError } = await adminClient
              .from('candidates')
              .insert({
                org_id: orgId,
                first_name: candidate.firstName,
                last_name: candidate.lastName,
                email: candidate.email,
                phone: candidate.phone || null,
                mobile: candidate.mobile || null,
                linkedin_url: candidate.linkedinProfile || null,
                title: candidate.professionalHeadline || null,
                current_company: candidate.currentCompany || null,
                years_experience: candidate.experienceYears ?? null,
                location: location,
                city: candidate.city || null,
                state: candidate.state || null,
                country: candidate.country || null,
                visa_status: candidate.visaStatus || 'unknown',
                skills: candidate.skills || [],
                rate_type: candidate.rateType || 'hourly',
                desired_rate: candidate.desiredRate ?? null,
                currency: candidate.currency || 'USD',
                source: candidate.leadSource || 'csv_import',
                source_type: 'csv',
                tags: candidate.tags || [],
                internal_notes: candidate.internalNotes || null,
                status: 'active',
                created_by: user.id,
                updated_by: user.id,
                created_at: now,
                updated_at: now,
              })

            if (insertError) {
              results.failed++
              results.errors.push(`Row ${i + 2}: ${insertError.message}`)
            } else {
              results.success++
            }
          } catch (err) {
            results.failed++
            results.errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }

        return results
      }),

    // ============================================
    // SCREENING OPERATIONS (E03)
    // ============================================

    // Start a new screening session
    startScreening: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        jobId: z.string().uuid().optional(),
        submissionId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { data, error } = await adminClient
          .from('candidate_screenings')
          .insert({
            org_id: orgId,
            candidate_id: input.candidateId,
            job_id: input.jobId,
            submission_id: input.submissionId,
            screener_id: user.id,
            status: 'in_progress',
            started_at: now,
            created_at: now,
            updated_at: now,
          })
          .select('id')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update candidate status
        await adminClient
          .from('candidates')
          .update({ status: 'screening', updated_at: now })
          .eq('id', input.candidateId)

        return { screeningId: data.id }
      }),

    // Get screening session by ID
    getScreening: orgProtectedProcedure
      .input(z.object({ screeningId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('candidate_screenings')
          .select(`
            *,
            candidate:candidates(id, first_name, last_name, email, headline, location, visa_status),
            job:jobs(id, title, required_skills, rate_min, rate_max),
            screener:user_profiles!screener_id(id, first_name, last_name)
          `)
          .eq('id', input.screeningId)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Screening session not found' })
        }

        return data
      }),

    // Get job knockout questions
    getJobKnockoutQuestions: orgProtectedProcedure
      .input(z.object({ jobId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('job_screening_questions')
          .select('*')
          .eq('job_id', input.jobId)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('sequence', { ascending: true })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Save knockout answers
    saveKnockoutAnswers: orgProtectedProcedure
      .input(z.object({
        screeningId: z.string().uuid(),
        answers: z.array(z.object({
          questionId: z.string().uuid().optional(),
          question: z.string(),
          answer: z.string(),
          passed: z.boolean(),
          notes: z.string().optional(),
        })),
        knockoutPassed: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const now = new Date().toISOString()

        const { error } = await adminClient
          .from('candidate_screenings')
          .update({
            knockout_answers: input.answers,
            knockout_passed: input.knockoutPassed,
            updated_at: now,
          })
          .eq('id', input.screeningId)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Save technical assessment
    saveTechnicalAssessment: orgProtectedProcedure
      .input(z.object({
        screeningId: z.string().uuid(),
        scores: z.record(z.object({
          rating: z.number().min(1).max(5),
          notes: z.string().optional(),
        })),
        projectDiscussion: z.object({
          role: z.string().optional(),
          teamSize: z.number().optional(),
          duration: z.string().optional(),
          challenge: z.string().optional(),
          solution: z.string().optional(),
          outcome: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Calculate overall score
        const scores = Object.values(input.scores)
        const technicalOverall = scores.reduce((sum, s) => sum + s.rating, 0) / scores.length

        const now = new Date().toISOString()

        const { error } = await adminClient
          .from('candidate_screenings')
          .update({
            technical_scores: input.scores,
            technical_overall: technicalOverall,
            project_discussion: input.projectDiscussion,
            updated_at: now,
          })
          .eq('id', input.screeningId)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { technicalOverall }
      }),

    // Save soft skills assessment
    saveSoftSkillsAssessment: orgProtectedProcedure
      .input(z.object({
        screeningId: z.string().uuid(),
        scores: z.record(z.object({
          rating: z.number().min(1).max(5),
          notes: z.string().optional(),
        })),
        cultureFit: z.number().min(1).max(5),
        interestLevel: z.enum(['low', 'medium', 'high', 'very_high']),
        motivationNotes: z.object({
          whyLeaving: z.string().optional(),
          whyInterested: z.string().optional(),
          careerGoals: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Calculate overall score
        const scores = Object.values(input.scores)
        const softSkillsOverall = scores.reduce((sum, s) => sum + s.rating, 0) / scores.length

        const now = new Date().toISOString()

        const { error } = await adminClient
          .from('candidate_screenings')
          .update({
            soft_skills_scores: input.scores,
            soft_skills_overall: softSkillsOverall,
            culture_fit_score: input.cultureFit,
            interest_level: input.interestLevel,
            motivation_notes: input.motivationNotes,
            updated_at: now,
          })
          .eq('id', input.screeningId)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { softSkillsOverall }
      }),

    // Complete screening with final recommendation
    completeScreening: orgProtectedProcedure
      .input(z.object({
        screeningId: z.string().uuid(),
        recommendation: z.enum(['submit', 'submit_with_reservations', 'hold', 'reject']),
        strengths: z.array(z.string()),
        concerns: z.array(z.string()),
        interviewPrepNotes: z.string().optional(),
        compensationDiscussion: z.object({
          candidateExpectation: z.string().optional(),
          jobRange: z.string().optional(),
          recommendedOffer: z.string().optional(),
          marginPercent: z.number().optional(),
          notes: z.string().optional(),
        }).optional(),
        nextSteps: z.array(z.object({
          action: z.string(),
          completed: z.boolean().default(false),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        // Get current screening to calculate duration and overall score
        const { data: screening } = await adminClient
          .from('candidate_screenings')
          .select('started_at, technical_overall, soft_skills_overall, culture_fit_score')
          .eq('id', input.screeningId)
          .eq('org_id', orgId)
          .single()

        if (!screening) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Screening session not found' })
        }

        // Calculate duration
        const startTime = new Date(screening.started_at)
        const endTime = new Date()
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

        // Calculate overall score (weighted average)
        const technicalWeight = 0.40
        const softSkillsWeight = 0.30
        const cultureWeight = 0.30

        const overallScore = (
          (screening.technical_overall || 0) * technicalWeight +
          (screening.soft_skills_overall || 0) * softSkillsWeight +
          (screening.culture_fit_score || 0) * cultureWeight
        )

        const { error } = await adminClient
          .from('candidate_screenings')
          .update({
            status: 'completed',
            completed_at: now,
            duration_minutes: durationMinutes,
            overall_score: overallScore,
            recommendation: input.recommendation,
            strengths: input.strengths,
            concerns: input.concerns,
            interview_prep_notes: input.interviewPrepNotes,
            compensation_discussion: input.compensationDiscussion,
            next_steps: input.nextSteps,
            updated_at: now,
          })
          .eq('id', input.screeningId)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Get candidate ID for status update
        const { data: screeningData } = await adminClient
          .from('candidate_screenings')
          .select('candidate_id')
          .eq('id', input.screeningId)
          .single()

        // Update candidate status based on recommendation
        if (screeningData) {
          const newStatus = input.recommendation === 'reject' ? 'inactive' :
                           input.recommendation === 'hold' ? 'bench' : 'active'

          await adminClient
            .from('candidates')
            .update({ status: newStatus, updated_at: now })
            .eq('id', screeningData.candidate_id)
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'candidate',
          entity_id: screeningData?.candidate_id,
          activity_type: 'screening',
          subject: `Screening completed: ${input.recommendation.replace(/_/g, ' ')}`,
          description: `Overall score: ${overallScore.toFixed(1)}/5`,
          outcome: input.recommendation === 'submit' ? 'positive' :
                   input.recommendation === 'reject' ? 'negative' : 'neutral',
          created_by: user.id,
          created_at: now,
        })

        return {
          success: true,
          overallScore,
          durationMinutes,
        }
      }),

    // Get candidate's screening history
    getCandidateScreenings: orgProtectedProcedure
      .input(z.object({ candidateId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('candidate_screenings')
          .select(`
            id,
            job:jobs(id, title),
            status,
            started_at,
            completed_at,
            overall_score,
            recommendation,
            screener:user_profiles!screener_id(first_name, last_name)
          `)
          .eq('candidate_id', input.candidateId)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // ============================================
    // PROFILE BUILDER OPERATIONS (E05)
    // ============================================

    // Create or get draft profile
    createProfile: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        jobId: z.string().uuid().optional(),
        templateType: z.enum(['standard', 'client_custom', 'minimal']).default('standard'),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        // Check if draft profile already exists
        const { data: existing } = await adminClient
          .from('candidate_prepared_profiles')
          .select('id')
          .eq('candidate_id', input.candidateId)
          .eq('job_id', input.jobId ?? null)
          .eq('status', 'draft')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .maybeSingle()

        if (existing) {
          return { profileId: existing.id, isNew: false }
        }

        // Get candidate data to pre-populate
        const { data: candidate } = await adminClient
          .from('candidates')
          .select(`
            *,
            candidate_skills(skill_name, years_experience, proficiency_level)
          `)
          .eq('id', input.candidateId)
          .eq('org_id', orgId)
          .single()

        if (!candidate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidate not found' })
        }

        // Generate initial skills matrix
        const skillsMatrix = candidate.candidate_skills?.map((skill: { skill_name: string; years_experience?: number; proficiency_level?: string }) => ({
          skill: skill.skill_name,
          years: skill.years_experience || 0,
          level: skill.proficiency_level || 'intermediate',
          job_match: 'unknown',
        })) ?? []

        const { data, error } = await adminClient
          .from('candidate_prepared_profiles')
          .insert({
            org_id: orgId,
            candidate_id: input.candidateId,
            job_id: input.jobId,
            template_type: input.templateType,
            summary: candidate.summary || '',
            key_highlights: [],
            skills_matrix: skillsMatrix,
            experience_summary: [],
            status: 'draft',
            created_by: user.id,
            created_at: now,
            updated_at: now,
          })
          .select('id')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { profileId: data.id, isNew: true }
      }),

    // Get profile by ID
    getProfile: orgProtectedProcedure
      .input(z.object({ profileId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('candidate_prepared_profiles')
          .select(`
            *,
            candidate:candidates(id, first_name, last_name, email, headline),
            job:jobs(id, title, company:companies!jobs_company_id_fkey(name))
          `)
          .eq('id', input.profileId)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
        }

        return data
      }),

    // Update profile sections
    updateProfile: orgProtectedProcedure
      .input(z.object({
        profileId: z.string().uuid(),
        summary: z.string().optional(),
        keyHighlights: z.array(z.string()).optional(),
        skillsMatrix: z.array(z.object({
          skill: z.string(),
          years: z.number(),
          level: z.string(),
          jobMatch: z.string(),
        })).optional(),
        experienceSummary: z.array(z.object({
          company: z.string(),
          role: z.string(),
          duration: z.string(),
          achievements: z.array(z.string()),
        })).optional(),
        whyThisCandidate: z.string().optional(),
        education: z.array(z.object({
          institution: z.string(),
          degree: z.string(),
          field: z.string().optional(),
          year: z.number().optional(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const now = new Date().toISOString()

        const updates: Record<string, unknown> = { updated_at: now }
        if (input.summary !== undefined) updates.summary = input.summary
        if (input.keyHighlights !== undefined) updates.key_highlights = input.keyHighlights
        if (input.skillsMatrix !== undefined) updates.skills_matrix = input.skillsMatrix
        if (input.experienceSummary !== undefined) updates.experience_summary = input.experienceSummary
        if (input.whyThisCandidate !== undefined) updates.why_this_candidate = input.whyThisCandidate
        if (input.education !== undefined) updates.education = input.education

        const { error } = await adminClient
          .from('candidate_prepared_profiles')
          .update(updates)
          .eq('id', input.profileId)
          .eq('org_id', orgId)
          .eq('status', 'draft')

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Finalize profile
    finalizeProfile: orgProtectedProcedure
      .input(z.object({ profileId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        const now = new Date().toISOString()

        const { error } = await adminClient
          .from('candidate_prepared_profiles')
          .update({
            status: 'finalized',
            finalized_at: now,
            finalized_by: user.id,
            updated_at: now,
          })
          .eq('id', input.profileId)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Get candidate's profiles
    getCandidateProfiles: orgProtectedProcedure
      .input(z.object({ candidateId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('candidate_prepared_profiles')
          .select(`
            id,
            job:jobs(id, title, company:companies!jobs_company_id_fkey(name)),
            template_type,
            status,
            finalized_at,
            created_at
          `)
          .eq('candidate_id', input.candidateId)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // ============================================
    // DRAFTS OPERATIONS
    // ============================================

    // List current user's draft candidates (for Drafts tab)
    listMyDrafts: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          return []
        }

        // created_by references auth.users(id), so compare directly to user.id (auth_id)
        const { data, error } = await adminClient
          .from('candidates')
          .select('id, first_name, last_name, status, wizard_state, created_at, updated_at')
          .eq('org_id', orgId)
          .eq('created_by', user.id)
          .eq('status', 'draft')
          .is('deleted_at', null)
          .order('updated_at', { ascending: false })
          .limit(10)

        if (error) {
          console.error('[candidates.listMyDrafts] Error:', error.message)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),
  }),
})
