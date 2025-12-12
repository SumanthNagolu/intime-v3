import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

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
    experienceLevel: z.string().optional(),
    requiredSkillsDetailed: z.array(z.object({
      name: z.string(),
      years: z.string(),
      proficiency: z.enum(['beginner', 'proficient', 'expert']),
    })).optional(),
    preferredSkills: z.array(z.string()).optional(),
    education: z.string().optional(),
    certifications: z.string().optional(),
    industries: z.array(z.string()).optional(),
    roleOpenReason: z.string().optional(),
    teamName: z.string().optional(),
    teamSize: z.number().optional(),
    reportsTo: z.string().optional(),
    directReports: z.number().optional(),
    keyProjects: z.string().optional(),
    successMetrics: z.string().optional(),
    workArrangement: z.string().optional(),
    hybridDays: z.number().optional(),
    locationRestrictions: z.array(z.string()).optional(),
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
})

const updateJobInput = z.object({
  jobId: z.string().uuid(),
  title: z.string().min(3).max(200).optional(),
  location: z.string().max(200).optional(),
  isRemote: z.boolean().optional(),
  hybridDays: z.number().int().min(1).max(5).optional().nullable(),
  requiredSkills: z.array(z.string()).min(1).max(20).optional(),
  niceToHaveSkills: z.array(z.string()).max(20).optional(),
  minExperienceYears: z.number().int().min(0).max(50).optional().nullable(),
  maxExperienceYears: z.number().int().min(0).max(50).optional().nullable(),
  visaRequirements: z.array(z.string()).optional(),
  description: z.string().max(5000).optional(),
  rateMin: z.number().positive().optional(),
  rateMax: z.number().positive().optional(),
  rateType: rateTypeEnum.optional(),
  positionsCount: z.number().int().min(1).max(100).optional(),
  priority: priorityEnum.optional(),
  urgency: urgencyEnum.optional(),
  targetFillDate: z.string().optional().nullable(),
  targetStartDate: z.string().optional().nullable(),
  clientSubmissionInstructions: z.string().optional(),
  clientInterviewProcess: z.string().optional(),
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
const placementStatusEnum = z.enum(['pending_start', 'active', 'extended', 'ended', 'cancelled'])

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

const candidateStatusEnum = z.enum(['active', 'sourced', 'screening', 'bench', 'placed', 'inactive', 'archived'])
const visaStatusEnum = z.enum(['us_citizen', 'green_card', 'h1b', 'l1', 'tn', 'opt', 'cpt', 'ead', 'other'])
const availabilityEnum = z.enum(['immediate', '2_weeks', '30_days', 'not_available'])
const leadSourceEnum = z.enum(['linkedin', 'indeed', 'dice', 'monster', 'referral', 'direct', 'agency', 'job_board', 'other'])

const createCandidateInput = z.object({
  // Personal
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email().max(100),
  phone: z.string().max(20).optional(),
  linkedinUrl: z.string().url().optional(),

  // Professional
  professionalHeadline: z.string().max(200).optional(),
  professionalSummary: z.string().max(2000).optional(),
  skills: z.array(z.string()).min(1).max(50),
  experienceYears: z.number().int().min(0).max(50),

  // Work Authorization
  visaStatus: visaStatusEnum,
  visaExpiryDate: z.coerce.date().optional(),

  // Availability
  availability: availabilityEnum,
  location: z.string().min(2).max(200),
  // Structured location fields for centralized addresses
  locationCity: z.string().max(100).optional(),
  locationState: z.string().max(100).optional(),
  locationCountry: z.string().max(3).default('US').optional(),
  willingToRelocate: z.boolean().default(false),
  isRemoteOk: z.boolean().default(false),

  // Compensation
  minimumHourlyRate: z.number().min(0).optional(),
  desiredHourlyRate: z.number().min(0).optional(),

  // Source
  leadSource: leadSourceEnum,
  sourceDetails: z.string().max(500).optional(),

  // Optional
  tags: z.array(z.string()).max(20).optional(),
  isOnHotlist: z.boolean().default(false),
  hotlistNotes: z.string().max(500).optional(),

  // Job association
  associatedJobIds: z.array(z.string().uuid()).optional(),
})

const updateCandidateInput = z.object({
  candidateId: z.string().uuid(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  professionalHeadline: z.string().max(200).optional().nullable(),
  professionalSummary: z.string().max(2000).optional().nullable(),
  skills: z.array(z.string()).min(1).max(50).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  visaStatus: visaStatusEnum.optional(),
  visaExpiryDate: z.coerce.date().optional().nullable(),
  availability: availabilityEnum.optional(),
  location: z.string().min(2).max(200).optional(),
  // Structured location fields for centralized addresses
  locationCity: z.string().max(100).optional().nullable(),
  locationState: z.string().max(100).optional().nullable(),
  locationCountry: z.string().max(3).optional().nullable(),
  willingToRelocate: z.boolean().optional(),
  isRemoteOk: z.boolean().optional(),
  minimumHourlyRate: z.number().min(0).optional().nullable(),
  desiredHourlyRate: z.number().min(0).optional().nullable(),
  tags: z.array(z.string()).max(20).optional(),
  isOnHotlist: z.boolean().optional(),
  hotlistNotes: z.string().max(500).optional().nullable(),
  profileStatus: candidateStatusEnum.optional(),
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
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['title', 'account_id', 'location', 'job_type', 'status', 'positions_available', 'submissions_count', 'interviews_count', 'owner_id', 'due_date', 'created_at', 'priority_rank', 'sla_days']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('jobs')
          .select(`
            *,
            company:companies!company_id(id, name),
            owner:user_profiles!owner_id(id, full_name, avatar_url),
            submissions(id, status),
            interviews(id, status)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.search) {
          query = query.or(`title.ilike.%${input.search}%,description.ilike.%${input.search}%`)
        }
        if (input.status && input.status !== 'all') {
          query = query.eq('status', input.status)
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
          query = query.eq('account_id', input.accountId)
        }
        if (input.recruiterId) {
          query = query.eq('owner_id', input.recruiterId)
        }

        // Apply sorting
        query = query.order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
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
            account: j.account,
            owner: j.owner,
            submissions_count: (j.submissions as Array<{ status: string }> | null)?.length ?? 0,
            interviews_count: (j.interviews as Array<{ status: string }> | null)?.length ?? 0,
            createdAt: j.created_at,
            created_at: j.created_at,
          })) ?? [],
          total: count ?? 0,
        }
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
            company:companies!company_id(id, name, industry),
            clientCompany:companies!client_company_id(id, name, industry),
            endClientCompany:companies!end_client_company_id(id, name, industry),
            vendorCompany:companies!vendor_company_id(id, name),
            hiringManagerContact:contacts!hiring_manager_contact_id(id, full_name, primary_email, phone),
            hrContact:contacts!hr_contact_id(id, full_name, primary_email, phone),
            intakeCompletedBy:user_profiles!intake_completed_by(id, full_name),
            owner:user_profiles!owner_id(id, full_name, avatar_url),
            submissions(id, status, candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name))
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
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
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const ownerId = input.recruiterId || user?.id

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

        // Get all jobs with their placements and submissions
        const { data: jobs } = await adminClient
          .from('jobs')
          .select(`
            id, status, created_at, filled_date,
            submissions(id),
            placements(id, created_at)
          `)
          .eq('org_id', orgId)
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
            company:companies!company_id(id, name),
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

    // Create a new job in draft status
    create: orgProtectedProcedure
      .input(createJobInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

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
            account_id: input.accountId,
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
            positions_count: input.positionsCount,
            positions_filled: 0,
            required_skills: input.requiredSkills || input.intakeData?.requiredSkillsDetailed?.map(s => s.name) || [],
            nice_to_have_skills: input.niceToHaveSkills || input.intakeData?.preferredSkills || [],
            min_experience_years: minExp,
            max_experience_years: maxExp,
            visa_requirements: input.visaRequirements || input.intakeData?.workAuthorizations || [],
            urgency: input.urgency,
            target_fill_date: input.targetFillDate || input.targetStartDate,
            client_submission_instructions: input.clientSubmissionInstructions,
            client_interview_process: input.clientInterviewProcess || (input.intakeData?.interviewRounds ? JSON.stringify(input.intakeData.interviewRounds) : null),
            status: 'draft',
            owner_id: user.id,
            recruiter_ids: [user.id],
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // JOBS-01: Unified company/contact references
            company_id: input.accountId, // Keep company_id sync'd with account_id
            client_company_id: input.clientCompanyId || input.accountId,
            end_client_company_id: input.endClientCompanyId,
            vendor_company_id: input.vendorCompanyId,
            hiring_manager_contact_id: input.hiringManagerContactId,
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
            changed_by: user.id,
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
            created_by: user.id,
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
          .eq('id', input.jobId)
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

        if (input.title !== undefined) updateData.title = input.title
        if (input.location !== undefined) updateData.location = input.location
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
        if (input.positionsCount !== undefined) updateData.positions_count = input.positionsCount
        if (input.priority !== undefined) updateData.priority = input.priority
        if (input.urgency !== undefined) updateData.urgency = input.urgency
        if (input.targetFillDate !== undefined) updateData.target_fill_date = input.targetFillDate
        if (input.targetStartDate !== undefined) updateData.target_start_date = input.targetStartDate
        if (input.clientSubmissionInstructions !== undefined) updateData.client_submission_instructions = input.clientSubmissionInstructions
        if (input.clientInterviewProcess !== undefined) updateData.client_interview_process = input.clientInterviewProcess

        // Update job record
        const { data: updatedJob, error: updateError } = await adminClient
          .from('jobs')
          .update(updateData)
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .select('id, title, status, updated_at')
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
          .select('*, company:companies!company_id(id, name)')
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
        if (!job.account_id) validationErrors.push('Client account is required')

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
          .select('id, title, account_id, required_skills')
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .single()

        if (currentError || !currentJob) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        // Find similar jobs (same account or overlapping skills)
        const { data: similarJobs, error } = await adminClient
          .from('jobs')
          .select('id, title, status, company:companies!company_id(id, name)')
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
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('submissions')
          .select(`
            *,
            job:jobs(id, title, company:companies!company_id(id, name)),
            candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name, email),
            submitted_by:user_profiles!submitted_by(id, full_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('submitted_at', { ascending: false })

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
          query = query.eq('submitted_by', input.recruiterId)
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
            job:jobs(*),
            candidate:user_profiles!submissions_candidate_id_fkey(*),
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
            id, status, submitted_at, submission_rate,
            job:jobs(id, title, company:companies!company_id(id, name)),
            candidate:user_profiles!submissions_candidate_id_fkey(id, first_name, last_name)
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
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

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

        // Verify job exists and is open
        const { data: job, error: jobError } = await adminClient
          .from('jobs')
          .select('id, title, status, account_id')
          .eq('id', input.jobId)
          .eq('org_id', orgId)
          .single()

        if (jobError || !job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        if (!['open', 'active'].includes(job.status)) {
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
            submitted_by: user.id,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
            created_by: user.id,
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
            previous_status: oldStatus,
            new_status: input.status,
            changed_by: user.id,
            changed_at: new Date().toISOString(),
            reason: input.reason,
          })

        // Log activity
        const job = submission.job as { id: string; title: string } | null
        const candidate = submission.candidate as { id: string; first_name: string; last_name: string } | null

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
            job:jobs(id, title, account_id, rate_min, rate_max,
              company:companies!company_id(id, name)
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

        const job = submission.job as {
          id: string;
          title: string;
          account_id: string;
          rate_min?: number;
          rate_max?: number;
          company: { id: string; name: string } | null;
        } | null
        const candidate = submission.candidate as {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
        } | null

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
            pay_rate: input.payRate,
            bill_rate: input.billRate,
            margin_amount: marginAmount,
            margin_percent: marginPercent,
            submission_notes: input.submissionNotes,
            internal_notes: input.internalNotes,
            submission_method: input.submissionMethod,
            resume_version_id: input.resumeVersionId,
            submitted_to_client_at: new Date().toISOString(),
            submitted_to_client_by: user.id,
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('id, status, submitted_at')
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
            previous_status: submission.status,
            new_status: 'submitted_to_client',
            changed_by: user.id,
            changed_at: new Date().toISOString(),
            notes: `Submitted via ${input.submissionMethod}`,
          })

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'submission',
            entity_id: input.id,
            activity_type: 'submitted_to_client',
            description: `${candidate?.first_name} ${candidate?.last_name} submitted to ${job?.company?.name} for ${job?.title}`,
            created_by: user.id,
            created_at: new Date().toISOString(),
            metadata: {
              job_id: job?.id,
              job_title: job?.title,
              candidate_id: candidate?.id,
              candidate_name: candidate ? `${candidate.first_name} ${candidate.last_name}` : null,
              company_name: job?.company?.name,
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
              title: `Confirm external submission: ${candidate?.first_name} ${candidate?.last_name} to ${job?.company?.name}`,
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
          submittedAt: updated.submitted_at,
          method: input.submissionMethod,
          candidate: candidate ? { id: candidate.id, name: `${candidate.first_name} ${candidate.last_name}` } : null,
          job: job ? { id: job.id, title: job.title, account: job.company?.name } : null,
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
        const job = submission.job as { id: string; title: string } | null
        const candidate = submission.candidate as { id: string; first_name: string; last_name: string } | null

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
            job:jobs(id, title, status, company:companies!company_id(id, name)),
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
              job:jobs(id, title, company:companies!company_id(id, name)),
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
              id, submitted_by,
              job:jobs(id, title, company:companies!company_id(id, name)),
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
          const submission = i.submission as { submitted_by: string } | null
          return submission?.submitted_by === user?.id
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
              job:jobs(id, title, company:companies!company_id(id, name)),
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
            job:jobs(id, title, company:companies!company_id(id, name)),
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
        const job = submission.job as { id: string; title: string } | null
        const candidate = submission.candidate as { id: string; first_name: string; last_name: string } | null

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
        const submission = interview.submission as {
          id: string;
          status: string;
          candidate: { first_name: string; last_name: string } | null;
        } | null

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
        const candidate = submission?.candidate
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
              job:jobs(id, title, company:companies!company_id(id, name)),
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
          const submission = i.submission as { submitted_by: string } | null
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
        const submission = interview.submission as {
          id: string
          candidate: { first_name: string; last_name: string; email: string } | null
        } | null
        const candidate = submission?.candidate

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
              job:jobs!submissions_job_id_fkey(id, title, account_id,
                company:companies!company_id(id, name)
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
            job:jobs!submissions_job_id_fkey(id, title, account_id),
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
        const candidate = submission.candidate as { first_name: string; last_name: string } | null
        const job = submission.job as { title: string } | null
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
              job:jobs!submissions_job_id_fkey(id, title, account_id,
                company:companies!company_id(id, name)
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
            company:companies!company_id(id, name),
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
          query = query.eq('account_id', input.accountId)
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
            const submission = p.submission as { submitted_by: string } | null
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
              job:jobs(id, title, company:companies!company_id(id, name)),
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
              company:companies!company_id(id, name)
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
            job:jobs!offers_job_id_fkey(id, title, account_id, positions_count, positions_filled)
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

        // Get account_id from job
        const job = offer.job as { account_id: string; positions_count: number; positions_filled: number } | null

        // Create placement
        const { data: placement, error: placementError } = await adminClient
          .from('placements')
          .insert({
            org_id: orgId,
            offer_id: input.offerId,
            submission_id: offer.submission_id,
            job_id: offer.job_id,
            candidate_id: offer.candidate_id,
            account_id: job?.account_id,
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
          .select('*, job:jobs!placements_job_id_fkey(id, title, account_id)')
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
            company:companies!company_id(name)
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

    // Get candidate by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('candidates')
          .select(`
            *,
            candidate_skills(id, skill_name, years_experience, proficiency_level),
            submissions(id, status, job:jobs(id, title))
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidate not found' })
        }

        return data
      }),

    // Get sourcing stats (enhanced)
    getSourcingStats: orgProtectedProcedure
      .input(z.object({
        period: z.enum(['week', 'month', 'sprint']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
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

        // Create candidate record
        const { data: candidate, error: createError } = await adminClient
          .from('candidates')
          .insert({
            org_id: orgId,
            first_name: input.firstName,
            last_name: input.lastName,
            email: input.email.toLowerCase(),
            phone: input.phone,
            linkedin_url: input.linkedinUrl,
            title: input.professionalHeadline,
            professional_summary: input.professionalSummary,
            years_experience: input.experienceYears,
            visa_status: input.visaStatus,
            visa_expiry_date: input.visaExpiryDate?.toISOString(),
            availability: input.availability,
            location: input.location,
            willing_to_relocate: input.willingToRelocate,
            is_remote_ok: input.isRemoteOk,
            minimum_rate: input.minimumHourlyRate,
            desired_rate: input.desiredHourlyRate,
            lead_source: input.leadSource,
            lead_source_detail: input.sourceDetails,
            tags: input.tags ?? [],
            is_on_hotlist: input.isOnHotlist,
            hotlist_notes: input.hotlistNotes,
            hotlist_added_at: input.isOnHotlist ? now : null,
            hotlist_added_by: input.isOnHotlist ? user.id : null,
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

        // Add skills
        if (input.skills.length > 0) {
          const skillsToInsert = input.skills.map(skill => ({
            org_id: orgId,
            candidate_id: candidate.id,
            skill_name: skill,
            created_at: now,
          }))

          await adminClient.from('candidate_skills').insert(skillsToInsert)
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

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'candidate',
          entity_id: candidate.id,
          activity_type: 'note',
          subject: `Candidate added: ${input.firstName} ${input.lastName}`,
          description: `Sourced from ${input.leadSource}${input.sourceDetails ? ` - ${input.sourceDetails}` : ''}`,
          outcome: 'positive',
          created_by: user.id,
          created_at: now,
        })

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

        // Build update object
        if (input.firstName !== undefined) updateData.first_name = input.firstName
        if (input.lastName !== undefined) updateData.last_name = input.lastName
        if (input.email !== undefined) updateData.email = input.email.toLowerCase()
        if (input.phone !== undefined) updateData.phone = input.phone
        if (input.linkedinUrl !== undefined) updateData.linkedin_url = input.linkedinUrl
        if (input.professionalHeadline !== undefined) updateData.title = input.professionalHeadline
        if (input.professionalSummary !== undefined) updateData.professional_summary = input.professionalSummary
        if (input.experienceYears !== undefined) updateData.years_experience = input.experienceYears
        if (input.visaStatus !== undefined) updateData.visa_status = input.visaStatus
        if (input.visaExpiryDate !== undefined) updateData.visa_expiry_date = input.visaExpiryDate?.toISOString()
        if (input.availability !== undefined) updateData.availability = input.availability
        if (input.location !== undefined) updateData.location = input.location
        if (input.willingToRelocate !== undefined) updateData.willing_to_relocate = input.willingToRelocate
        if (input.isRemoteOk !== undefined) updateData.is_remote_ok = input.isRemoteOk
        if (input.minimumHourlyRate !== undefined) updateData.minimum_rate = input.minimumHourlyRate
        if (input.desiredHourlyRate !== undefined) updateData.desired_rate = input.desiredHourlyRate
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

        // Update candidate
        const { error: updateError } = await adminClient
          .from('candidates')
          .update(updateData)
          .eq('id', input.candidateId)
          .eq('org_id', orgId)

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
        }

        // Update skills if provided
        if (input.skills !== undefined) {
          // Delete existing skills
          await adminClient
            .from('candidate_skills')
            .delete()
            .eq('candidate_id', input.candidateId)

          // Insert new skills
          if (input.skills.length > 0) {
            const skillsToInsert = input.skills.map(skill => ({
              org_id: orgId,
              candidate_id: input.candidateId,
              skill_name: skill,
              created_at: now,
            }))
            await adminClient.from('candidate_skills').insert(skillsToInsert)
          }
        }

        // Log activity
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'candidate',
          entity_id: input.candidateId,
          activity_type: 'note',
          subject: `Candidate updated`,
          description: 'Profile information updated',
          outcome: 'neutral',
          created_by: user.id,
          created_at: now,
        })

        return { success: true, candidateId: input.candidateId }
      }),

    // ============================================
    // ADVANCED SEARCH (E02)
    // ============================================
    advancedSearch: orgProtectedProcedure
      .input(searchCandidatesInput)
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('candidates')
          .select(`
            *,
            skills:candidate_skills(skill_name, years_experience, proficiency_level),
            submissions(id, job_id, status)
          `, { count: 'exact' })
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

        // Post-process for skills filtering
        let results = data ?? []
        if (input.skills && input.skills.length > 0) {
          results = results.filter(candidate => {
            const candidateSkills = (candidate.skills as Array<{ skill_name: string }> | null)?.map(s => s.skill_name.toLowerCase()) ?? []
            const searchSkills = input.skills!.map(s => s.toLowerCase())

            if (input.skillsMatchMode === 'all') {
              return searchSkills.every(skill => candidateSkills.includes(skill))
            } else {
              return searchSkills.some(skill => candidateSkills.includes(skill))
            }
          })
        }

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
        linkedinUrl: z.string().url().optional(),
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
            job:jobs(id, title, company:companies!company_id(name))
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
            job:jobs(id, title, company:companies!company_id(name)),
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
  }),
})
