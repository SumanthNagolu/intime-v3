/**
 * Workspace Types
 *
 * Type definitions for entity workspace data structures.
 * These types define the shape of data returned by getFullEntity server actions.
 */

// Warning item for WarningsBanner
export interface WorkspaceWarning {
  id: string
  message: string
  severity: 'error' | 'warning' | 'info'
  field?: string        // Field name to focus when clicked
  section?: string      // Section to navigate to when clicked
}

// Contact with account-specific data
export interface AccountContact {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  department: string | null
  isPrimary: boolean
  linkedinUrl: string | null
  decisionAuthority: string | null
  preferredContactMethod: string | null
  notes: string | null
  roles: ContactRole[]
  addresses: ContactAddress[]
}

export interface ContactRole {
  id: string
  role: string
  effectiveDate: string | null
  expirationDate: string | null
}

export interface ContactAddress {
  id: string
  type: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  isPrimary: boolean
}

// Full account data returned by getFullAccount
export interface FullAccountData {
  account: AccountData
  contacts: AccountContact[]
  jobs: AccountJob[]
  placements: AccountPlacement[]
  addresses: AccountAddress[]
  meetings: AccountMeeting[]
  escalations: AccountEscalation[]
  // Universal tools
  activities: AccountActivity[]
  notes: AccountNote[]
  documents: AccountDocument[]
  history: HistoryEntry[]
  // Computed
  warnings: WorkspaceWarning[]
}

// Account core data (from companies table)
export interface AccountData {
  id: string
  name: string
  industry: string | null
  industries: string[] | null
  status: string
  segment: string | null
  website: string | null
  phone: string | null
  fax: string | null
  description: string | null
  headquarters_city: string | null
  headquarters_state: string | null
  headquarters_country: string | null
  employee_count: number | null
  annual_revenue: string | null
  tier: string | null
  nps_score: number | null
  last_contacted_date: string | null
  created_at: string
  updated_at: string | null
  owner: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  client_details: Record<string, unknown> | null
  // Health and financial metrics (Phase 2)
  health_score: number | null
  health_status: string | null
  churn_risk: number | null
  account_score: number | null
  account_grade: string | null
  lifetime_revenue: number | null
  revenue_ytd: number | null
  revenue_last_12m: number | null
  avg_margin_percentage: number | null
  lifetime_placements: number | null
  placements_ytd: number | null
  active_jobs_count: number | null
  active_placements_count: number | null
}

// Simplified types for embedded data
export interface AccountJob {
  id: string
  title: string
  status: string
  submissionCount: number
  interviewCount: number
  postedDate: string | null
  // Extended fields for premium detail panel
  jobType: string | null
  location: string | null
  billingRate: number | null
  billRateMin: number | null
  billRateMax: number | null
  payRateMin: number | null
  payRateMax: number | null
  positionsAvailable: number | null
  positionsFilled: number | null
  priority: string | null
  priorityRank: number | null
  slaDays: number | null
  targetStartDate: string | null
  targetEndDate: string | null
  createdAt: string
  description: string | null
  owner: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
  hiringManager: {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
}

export interface AccountPlacement {
  id: string
  consultantName: string
  jobTitle: string
  startDate: string
  endDate: string | null
  status: string
  billRate: number | null
  payRate: number | null
  healthStatus?: string | null
  employmentType?: string | null
  workLocation?: string | null
  nextCheckInDate?: string | null
  recruiter?: {
    id: string
    name: string
    avatarUrl?: string | null
  } | null
}

export interface AccountAddress {
  id: string
  type: string
  street: string
  suite: string | null
  city: string
  state: string
  zip: string
  country: string
  isPrimary: boolean
}

// Meeting types for filter/display
export type MeetingType = 'check_in' | 'qbr' | 'kick_off' | 'project_review' | 'escalation_review' | 'sales_pitch' | 'other'
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
export type ClientSatisfaction = 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied'

export interface MeetingActionItem {
  id: string
  description: string
  assignedTo: string | null
  dueDate: string | null
  completed: boolean
}

export interface MeetingAttendee {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  isOrganizer: boolean
}

export interface AccountMeeting {
  id: string
  subject: string
  date: string
  time: string | null
  location: string | null
  locationType: 'video' | 'phone' | 'in_person' | 'other' | null
  attendees: string[]
  status: MeetingStatus
  organizer: string
  // Enhanced fields
  meetingType: MeetingType
  agenda: string | null
  discussionNotes: string | null
  keyTakeaways: string[] | null
  actionItems: MeetingActionItem[] | null
  clientSatisfaction: ClientSatisfaction | null
  clientFeedback: string | null
  contactIds: string[] | null
  relatedJobIds: string[] | null
  nextMeetingScheduled: string | null
  followUpNotes: string | null
  durationMinutes: number | null
  startedAt: string | null
  endedAt: string | null
  createdBy: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
  createdAt: string
}

// Escalation types for filter/display
export type EscalationSeverity = 'low' | 'medium' | 'high' | 'critical'
export type EscalationStatus = 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed'
export type EscalationType = 'service_issue' | 'billing_dispute' | 'quality_concern' | 'communication_breakdown' | 'contract_violation' | 'resource_issue' | 'timeline_delay' | 'other'

export interface AccountEscalation {
  id: string
  escalationNumber: string
  subject: string
  priority: 'low' | 'medium' | 'high' | 'critical'  // Keep for backwards compat
  severity: EscalationSeverity
  escalationType: EscalationType
  status: EscalationStatus
  createdAt: string
  createdBy: {
    id: string
    name: string
    avatarUrl: string | null
  }
  assignedTo: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
  escalatedTo: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
  description: string | null
  // Enhanced fields
  issueSummary: string
  detailedDescription: string | null
  clientImpact: string[] | null
  rootCause: string | null
  immediateActions: string | null
  resolutionPlan: string | null
  // SLA tracking
  slaResponseDue: string | null
  slaResolutionDue: string | null
  slaResponseMet: boolean | null
  slaResolutionMet: boolean | null
  // Resolution
  resolvedAt: string | null
  resolvedBy: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
  resolutionSummary: string | null
  resolutionActions: string | null
  timeToResolve: string | null  // interval as string
  clientSatisfaction: ClientSatisfaction | null
  lessonsLearned: string | null
  preventiveMeasures: string | null
  // Related entities
  relatedEntityIds: string[] | null
  updatedAt: string | null
}

export interface AccountActivity {
  id: string
  type: string
  subject: string
  dueDate: string | null
  assignedTo: string
  status: string
  createdAt: string
  priority: string | null
  patternCode: string | null
  checklist: Array<{ id: string; text: string }> | null
  checklistProgress: Record<string, boolean> | null
  description: string | null
}

export interface AccountNote {
  id: string
  title: string | null
  content: string
  noteType: 'general' | 'meeting' | 'call' | 'strategy' | 'warning' | 'opportunity' | 'competitive_intel' | 'internal' | 'important' | 'reminder'
  visibility: 'private' | 'team' | 'organization'
  createdAt: string
  updatedAt: string | null
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  isPinned: boolean
  isStarred: boolean
  replyCount: number
  tags: string[] | null
}

export interface AccountDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
  url: string
  // Phase 2 enhancement: document/contract tracking
  category?: string
  status?: string
  expirationDate?: string | null
  // Extended contract fields
  contractNumber?: string
  contractValue?: number
  currency?: string
  effectiveDate?: string
  autoRenew?: boolean
  renewalTermMonths?: number
  renewalNoticeDays?: number
  notes?: string
}

export interface HistoryEntry {
  id: string
  action: string
  field: string | null
  oldValue: string | null
  newValue: string | null
  changedAt: string
  changedBy: string
}

// Account sections for navigation
export type AccountSection =
  | 'summary'
  | 'contacts'
  | 'jobs'
  | 'placements'
  | 'addresses'
  | 'meetings'
  | 'escalations'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'

// Section counts for sidebar badges
export interface AccountSectionCounts {
  contacts: number
  jobs: number
  placements: number
  addresses: number
  meetings: number
  escalations: number
  activities: number
  notes: number
  documents: number
}

// My Workspace types (GW-010)

export interface MyWorkspaceStats {
  activities: { total: number; overdue: number; dueToday: number }
  submissions: { total: number; pending: number }
  jobs: { total: number; active: number }
  placements: { total: number; active: number }
}

export interface ActivityFilterCounts {
  all_open: number
  my_open: number
  overdue: number
  due_today: number
  due_week: number
  completed_today: number
  all: number
}

export interface SubmissionFilterCounts {
  pending_action: number
  client_review: number
  interview_scheduled: number
  offer_stage: number
  recent: number
  all: number
}

export interface MyWorkspaceActivity {
  id: string
  subject: string | null
  description: string | null
  activityType: string
  status: string
  priority: string | null
  dueDate: string | null
  entityType: string
  entityId: string
  accountName: string | null
  contact: { id: string; name: string } | null
  isOverdue: boolean
  isDueToday: boolean
  isDueThisWeek: boolean
  createdAt: string
  completedAt: string | null
  completedToday: boolean
}

export interface MyWorkspaceSubmission {
  id: string
  status: string
  stage: string
  submittedAt: string | null
  updatedAt: string | null
  candidate: {
    id: string
    name: string
    title: string | null
  } | null
  job: {
    id: string
    title: string
    company: { id: string; name: string } | null
  } | null
  hasUpcomingInterview: boolean
  isRecentlySubmitted: boolean
  needsAction: boolean
}

export interface MyWorkspaceData {
  stats: MyWorkspaceStats
  activities: MyWorkspaceActivity[]
  submissions: MyWorkspaceSubmission[]
  filterCounts: {
    activities: ActivityFilterCounts
    submissions: SubmissionFilterCounts
  }
}

// Team Workspace types (GW-015)

export interface TeamMember {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: 'manager' | 'senior' | 'junior'
}

export interface TeamMemberMetrics {
  memberId: string
  memberName: string
  activities: { open: number; priority: number; overdue: number }
  submissions: { open: number; priority: number; overdue: number }
  jobs: { open: number; priority: number }
}

export interface TeamWorkspaceStats {
  totalMembers: number
  totalActivities: number
  totalSubmissions: number
  totalJobs: number
  totalPlacements: number
  inQueue: number
}

export interface TeamWorkspaceActivity {
  id: string
  subject: string | null
  activityType: string
  status: string
  priority: string | null
  dueDate: string | null
  entityType: string
  entityId: string
  accountName: string | null
  contact: { id: string; name: string } | null
  assignedTo: { id: string; name: string } | null
  isOverdue: boolean
  isDueToday: boolean
  createdAt: string
}

export interface TeamWorkspaceSubmission {
  id: string
  status: string
  stage: string
  submittedAt: string | null
  updatedAt: string | null
  candidate: { id: string; name: string; title: string | null } | null
  job: { id: string; title: string; company: { id: string; name: string } | null } | null
  submittedBy: { id: string; name: string } | null
  hasUpcomingInterview: boolean
}

export interface TeamWorkspaceJob {
  id: string
  title: string
  status: string
  accountName: string | null
  submissionCount: number
  openDate: string | null
  owner: { id: string; name: string } | null
}

export interface TeamWorkspacePlacement {
  id: string
  candidateName: string
  accountName: string | null
  jobTitle: string
  startDate: string
  endDate: string | null
  status: string
  recruiter: { id: string; name: string } | null
  isEndingSoon: boolean
}

export interface TeamWorkspaceQueueItem {
  id: string
  type: 'activity' | 'submission' | 'job'
  title: string
  accountName: string | null
  createdAt: string
  priority: string | null
}

export interface TeamPerformanceMetrics {
  memberId: string
  memberName: string
  activitiesCompleted: number
  submissionsMade: number
  placementsClosed: number
  avgTimeToFill: number | null
}

export interface TeamWorkspaceData {
  team: {
    id: string
    name: string
    memberCount: number
    manager: { id: string; name: string }
  }
  members: TeamMember[]
  stats: TeamWorkspaceStats
  memberMetrics: TeamMemberMetrics[]
  activities: TeamWorkspaceActivity[]
  submissions: TeamWorkspaceSubmission[]
  jobs: TeamWorkspaceJob[]
  placements: TeamWorkspacePlacement[]
  queue: TeamWorkspaceQueueItem[]
  performance: TeamPerformanceMetrics[]
  filterCounts: {
    activities: ActivityFilterCounts
    submissions: SubmissionFilterCounts
  }
}

export type TeamSection =
  | 'summary'
  | 'activities'
  | 'submissions'
  | 'jobs'
  | 'placements'
  | 'queue'
  | 'performance'

// =============================================================================
// CONTACT WORKSPACE TYPES
// =============================================================================

// Full contact data returned by getFullContact
export interface FullContactData {
  contact: ContactData
  accounts: ContactAccount[]        // Linked accounts
  submissions: ContactSubmission[]  // Submissions (as candidate or POC)
  campaigns: ContactCampaign[]      // Campaign enrollments (for prospects/leads)
  // Universal tools
  activities: ContactActivity[]
  notes: ContactNote[]
  documents: ContactDocument[]
  history: HistoryEntry[]
  // Computed
  warnings: WorkspaceWarning[]
}

// Core contact data
export interface ContactData {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string | null
  phone: string | null
  mobile: string | null
  title: string | null
  department: string | null
  // Classification
  types: string[]                   // ['candidate', 'lead', 'prospect']
  category: string                  // 'person' or 'company'
  subtype: string                   // 'person_candidate', 'person_lead', etc.
  status: string
  // Address
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  // Contact preferences
  preferredContactMethod: string | null
  bestTimeToContact: string | null
  linkedinUrl: string | null
  // Candidate-specific (populated when types includes 'candidate')
  candidateStatus: string | null
  candidateResumeUrl: string | null
  candidateSkills: string[] | null
  candidateExperienceYears: number | null
  candidateCurrentVisa: string | null
  candidateHourlyRate: number | null
  // Lead-specific (populated when types includes 'lead')
  leadStatus: string | null
  leadScore: number | null
  leadSource: string | null
  // Timestamps
  createdAt: string
  updatedAt: string | null
  // Related
  owner: { id: string; fullName: string; avatarUrl: string | null } | null
  company: { id: string; name: string } | null
}

// Linked account
export interface ContactAccount {
  id: string
  name: string
  industry: string | null
  status: string
  role: string | null           // Contact's role at this account
  isPrimary: boolean
  sinceDate: string | null
}

// Submission (contact as candidate or POC)
export interface ContactSubmission {
  id: string
  jobTitle: string
  accountName: string
  stage: string
  status: string
  submittedAt: string
  role: 'candidate' | 'hiring_manager' | 'poc'
  candidateName: string | null  // If contact is POC, show candidate name
}

// Campaign enrollment
export interface ContactCampaign {
  id: string
  campaignName: string
  campaignStatus: string
  enrolledAt: string
  sequenceStep: number
  sequenceStatus: string
  engagementScore: number | null
  convertedAt: string | null
}

// Reuse universal types from Account
export type ContactActivity = AccountActivity
export type ContactNote = AccountNote
export type ContactDocument = AccountDocument

// Contact sections for navigation
export type ContactSection =
  | 'summary'
  | 'accounts'
  | 'submissions'
  | 'pipeline'
  | 'campaigns'
  | 'qualification'
  | 'deals'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'
