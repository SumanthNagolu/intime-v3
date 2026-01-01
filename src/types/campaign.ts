/**
 * Campaign Workspace Types
 *
 * Type definitions for campaign workspace data structures.
 * These types define the shape of data returned by getFullCampaign server action.
 */

import type { WorkspaceWarning, HistoryEntry } from './workspace'

// =============================================================================
// FULL CAMPAIGN DATA
// =============================================================================

/**
 * Root data structure returned by getFullCampaign server action
 */
export interface FullCampaignData {
  campaign: CampaignData
  prospects: CampaignProspect[]
  leads: CampaignLead[]
  funnel: CampaignFunnel
  sequence: CampaignSequenceStep[]
  analytics: CampaignAnalytics
  // Universal tools
  activities: CampaignActivity[]
  notes: CampaignNote[]
  documents: CampaignDocument[]
  history: HistoryEntry[]
  // Computed
  warnings: WorkspaceWarning[]
  counts: CampaignSectionCounts
}

// =============================================================================
// CAMPAIGN CORE DATA
// =============================================================================

/**
 * Core campaign fields from campaigns table
 */
export interface CampaignData {
  id: string
  name: string
  description: string | null
  status: CampaignStatus
  campaignType: string | null
  goal: string | null
  channels: string[] | null
  // Targeting
  targetCriteria: Record<string, unknown> | null
  // Sequences
  sequences: Record<string, unknown> | null
  // Compliance
  complianceSettings: Record<string, unknown> | null
  // A/B Testing
  abTestConfig: Record<string, unknown> | null
  // Dates
  startDate: string | null
  endDate: string | null
  // Targets
  targetLeads: number | null
  targetMeetings: number | null
  targetRevenue: number | null
  // Budget
  budgetTotal: number | null
  budgetSpent: number | null
  // Metrics
  audienceSize: number
  prospectsContacted: number
  emailsOpened: number | null
  linksClicked: number | null
  prospectsResponded: number | null
  leadsGenerated: number
  meetingsBooked: number | null
  // Owner
  owner: {
    id: string
    full_name: string
    avatar_url: string | null
    email?: string
  } | null
  // Timestamps
  createdAt: string
  updatedAt: string | null
}

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'

// =============================================================================
// PROSPECT (Campaign Enrollment)
// =============================================================================

/**
 * Campaign prospect with engagement metrics
 * From campaign_enrollments table with contact join
 */
export interface CampaignProspect {
  id: string
  campaignId: string
  contactId: string
  status: ProspectStatus
  // Contact fields
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  companyName: string | null
  title: string | null
  // Engagement metrics
  engagementScore: number | null
  emailsSent: number | null
  emailsOpened: number | null
  linksClicked: number | null
  repliesReceived: number | null
  // Sequence position
  currentStep: number | null
  sequenceStatus: string | null
  nextStepAt: string | null
  // Engagement timeline
  enrolledAt: string
  firstContactedAt: string | null
  openedAt: string | null
  clickedAt: string | null
  respondedAt: string | null
  convertedAt: string | null
  // Conversion
  convertedLeadId: string | null
  // Raw contact object (from join)
  contact?: {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    company_name: string | null
    title: string | null
  }
}

export type ProspectStatus =
  | 'enrolled'
  | 'contacted'
  | 'engaged'
  | 'responded'
  | 'converted'
  | 'opted_out'
  | 'bounced'

// =============================================================================
// LEAD (Converted from Campaign)
// =============================================================================

/**
 * Lead with BANT scores, sourced from campaign
 * From leads table where campaign_id matches
 */
export interface CampaignLead {
  id: string
  contactId: string
  campaignId: string | null
  status: LeadStatus
  // Lead score
  score: number | null
  // Contact info
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  companyName: string | null
  title: string | null
  // BANT scores
  budgetScore: number | null
  authorityScore: number | null
  needScore: number | null
  timelineScore: number | null
  // Owner
  owner: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
  // Linked deal (if any)
  deal: {
    id: string
    name: string
    value: number | null
    stage: string
  } | null
  // Source tracking
  source: string | null
  campaignProspectId: string | null
  // Timestamps
  createdAt: string
  convertedAt: string | null
  // Raw contact (from join)
  contact?: {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    company_name: string | null
    title: string | null
  }
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'nurturing'
  | 'converted'
  | 'lost'
  | 'disqualified'

// =============================================================================
// FUNNEL
// =============================================================================

/**
 * Campaign funnel metrics
 * From get_campaign_funnel RPC
 */
export interface CampaignFunnel {
  totalProspects: number
  contacted: number
  opened: number
  clicked: number
  responded: number
  leads: number
  meetings: number
  // Rates
  openRate: number
  responseRate: number
  conversionRate: number
}

// =============================================================================
// SEQUENCE
// =============================================================================

/**
 * Sequence step definition
 * Parsed from campaigns.sequences JSONB column
 */
export interface CampaignSequenceStep {
  id: string
  stepNumber: number
  channel: SequenceChannel
  subject: string | null
  templateId: string | null
  templateName: string | null
  dayOffset: number | null
  status: SequenceStepStatus
  // Stats (when available)
  stats?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    replied: number
    bounced: number
  }
  // Timestamps
  scheduledAt?: string | null
  completedAt?: string | null
}

export type SequenceChannel = 'email' | 'linkedin' | 'phone' | 'sms'
export type SequenceStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'

// =============================================================================
// ANALYTICS
// =============================================================================

/**
 * Campaign analytics with weekly engagement data
 */
export interface CampaignAnalytics {
  // Summary metrics
  responseRate: number
  conversionRate: number
  costPerLead: number
  meetingsBooked: number
  // Weekly engagement for chart
  weeklyEngagement: WeeklyEngagement[]
  // Top performing content
  topContent: TopContent[]
}

export interface WeeklyEngagement {
  week: string // e.g., "Week 1", "Dec 16"
  opened: number
  clicked: number
  replied: number
}

export interface TopContent {
  subject: string
  openRate: number
  replyRate: number
}

// =============================================================================
// ACTIVITIES, NOTES, DOCUMENTS
// =============================================================================

export interface CampaignActivity {
  id: string
  activityType: string
  subject: string | null
  description: string | null
  status: string
  dueDate: string | null
  createdAt: string
  completedAt: string | null
  creator: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
}

export interface CampaignNote {
  id: string
  subject: string | null
  content: string | null
  createdAt: string
  creator: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
}

export interface CampaignDocument {
  id: string
  name: string
  documentType: string | null
  fileName: string | null
  fileUrl: string | null
  fileSize: number | null
  mimeType: string | null
  createdAt: string
  uploader: {
    id: string
    fullName: string
  } | null
}

// =============================================================================
// SECTION COUNTS
// =============================================================================

export interface CampaignSectionCounts {
  prospects: number
  leads: number
  sequence: number
  activities: number
  notes: number
  documents: number
}

// =============================================================================
// CAMPAIGN SECTIONS
// =============================================================================

export type CampaignSection =
  | 'overview'
  | 'prospects'
  | 'leads'
  | 'funnel'
  | 'sequence'
  | 'analytics'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'
