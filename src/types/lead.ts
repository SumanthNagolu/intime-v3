/**
 * Lead Workspace Types
 * Type definitions for lead workspace data structures.
 */

import type { HistoryEntry, WorkspaceWarning } from './workspace'

// Full lead data returned by getFullLead
export interface FullLeadData {
  lead: LeadData
  contact: LeadContactInfo
  engagement: LeadEngagement[]
  deal: LeadDeal | null
  campaigns: LeadCampaign[]
  // Universal tools
  activities: LeadActivity[]
  notes: LeadNote[]
  documents: LeadDocument[]
  history: HistoryEntry[]
  // Computed
  warnings: WorkspaceWarning[]
}

// Core lead data (from contacts table with lead fields)
export interface LeadData {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string | null
  phone: string | null
  title: string | null
  companyName: string | null
  industry: string | null
  // Lead-specific
  status: string
  source: string | null
  score: number | null
  estimatedValue: number | null
  estimatedCloseDate: string | null
  probability: number | null
  // BANT scoring
  bantBudget: number | null
  bantAuthority: number | null
  bantNeed: number | null
  bantTimeline: number | null
  bantTotalScore: number | null
  bantBudgetNotes: string | null
  bantAuthorityNotes: string | null
  bantNeedNotes: string | null
  bantTimelineNotes: string | null
  // Qualification
  qualificationResult: string | null
  qualificationNotes: string | null
  qualifiedAt: string | null
  qualifiedBy: string | null
  // Timestamps
  createdAt: string
  updatedAt: string | null
  lastContactedAt: string | null
  // Related
  owner: { id: string; fullName: string; avatarUrl: string | null } | null
  convertedToDealId: string | null
  convertedAt: string | null
}

// Contact information for the lead
export interface LeadContactInfo {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string | null
  phone: string | null
  mobile: string | null
  title: string | null
  department: string | null
  linkedinUrl: string | null
  // Company info
  companyId: string | null
  companyName: string | null
  companyIndustry: string | null
  companySize: number | null
  companyRevenue: string | null
  companyWebsite: string | null
  companyLocation: string | null
}

// Engagement timeline item (activities presented as timeline)
export interface LeadEngagement {
  id: string
  type: string          // 'email', 'call', 'meeting', 'linkedin', etc.
  subject: string
  description: string | null
  outcome: string | null
  createdAt: string
  createdBy: string
}

// Linked deal
export interface LeadDeal {
  id: string
  name: string
  stage: string
  value: number | null
  probability: number | null
  expectedCloseDate: string | null
  owner: { id: string; fullName: string } | null
  nextStep: string | null
}

// Campaign the lead came from
export interface LeadCampaign {
  id: string
  name: string
  status: string
  enrolledAt: string
  convertedAt: string | null
}

// Reuse universal types
export interface LeadActivity {
  id: string
  type: string
  subject: string
  description: string | null
  dueDate: string | null
  status: string
  assignedTo: string | null
  createdAt: string
}

export interface LeadNote {
  id: string
  content: string
  createdAt: string
  createdBy: string
  isPinned: boolean
}

export interface LeadDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
  url: string
}

// Lead sections for navigation
export type LeadSection =
  | 'summary'
  | 'contact'
  | 'engagement'
  | 'deal'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'
