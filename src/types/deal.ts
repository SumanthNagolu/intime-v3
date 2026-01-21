/**
 * Deal Workspace Types
 * Type definitions for deal workspace data structures.
 */

import type { HistoryEntry, WorkspaceWarning } from './workspace'

// Full deal data returned by getFullDeal
export interface FullDealData {
  deal: DealData
  account: DealAccountInfo | null
  lead: DealLeadInfo | null
  stakeholders: DealStakeholder[]
  stageHistory: DealStageHistoryEntry[]
  // Universal tools
  activities: DealActivity[]
  notes: DealNote[]
  documents: DealDocument[]
  history: HistoryEntry[]
  // Computed
  warnings: WorkspaceWarning[]
}

// Core deal data
export interface DealData {
  id: string
  title: string
  description: string | null

  // Value & Revenue
  value: number
  probability: number
  weightedValue: number
  valueBasis: string | null // 'one_time', 'annual', 'monthly'
  currency: string

  // Pipeline
  stage: DealStage
  expectedCloseDate: string | null
  actualCloseDate: string | null

  // Staffing-specific value fields
  estimatedPlacements: number | null
  avgBillRate: number | null
  contractLengthMonths: number | null
  hiringNeeds: string | null
  rolesBreakdown: DealRoleBreakdown[] | null
  servicesRequired: string[] | null

  // Competitive intelligence
  competitors: string[] | null
  competitiveAdvantage: string | null

  // Next steps
  nextStep: string | null
  nextStepDate: string | null

  // Health & Status
  healthStatus: string | null // 'on_track', 'slow', 'stale', 'urgent', 'at_risk'
  daysInStage: number

  // Related IDs
  companyId: string | null
  leadId: string | null
  leadContactId: string | null

  // Owner & Team
  owner: { id: string; fullName: string; avatarUrl: string | null } | null
  podManager: { id: string; fullName: string; avatarUrl: string | null } | null
  secondaryOwner: { id: string; fullName: string; avatarUrl: string | null } | null

  // Contract details (when closed_won)
  contractSignedDate: string | null
  contractStartDate: string | null
  contractDurationMonths: number | null
  contractType: string | null // 'msa', 'sow', 'po', 'email'
  paymentTerms: string | null // 'net_15', 'net_30', 'net_45', 'net_60'
  billingFrequency: string | null // 'weekly', 'biweekly', 'monthly'
  billingContact: DealBillingContact | null
  confirmedRoles: DealConfirmedRole[] | null

  // Win/Loss details
  winReason: string | null // 'price_value', 'expertise_speed', 'relationship_trust', etc.
  winDetails: string | null
  competitorsBeat: string[] | null
  lossReason: string | null
  lossReasonCategory: string | null // 'competitor', 'no_budget', 'project_cancelled', etc.
  lossDetails: string | null
  competitorWon: string | null
  competitorPrice: number | null

  // Future potential (for lost deals)
  futurePotential: string | null // 'yes', 'maybe', 'no'
  reengagementDate: string | null
  lessonsLearned: string | null

  // Timestamps
  createdAt: string
  updatedAt: string | null
  lastActivityAt: string | null
}

// Role breakdown for proposal
export interface DealRoleBreakdown {
  title: string
  count: number
  billRate: number | null
  startDate: string | null
}

// Confirmed roles after close
export interface DealConfirmedRole {
  title: string
  count: number
  billRate: number
  startDate: string | null
}

// Billing contact info
export interface DealBillingContact {
  name: string
  email: string
  phone: string | null
  address: string | null
}

export type DealStage =
  | 'discovery'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'verbal_commit'
  | 'closed_won'
  | 'closed_lost'

// Account linked to deal
export interface DealAccountInfo {
  id: string
  name: string
  industry: string | null
  employeeCount: number | null
  revenue: string | null
  website: string | null
  location: string | null
  category: string | null
}

// Source lead (if converted from lead)
export interface DealLeadInfo {
  id: string
  fullName: string
  email: string | null
  status: string
  source: string | null
  convertedAt: string | null
}

// Deal stakeholder (from junction table)
export interface DealStakeholder {
  id: string
  contactId: string | null
  name: string
  title: string | null
  email: string | null
  phone: string | null
  role: string | null // 'champion', 'decision_maker', 'influencer', 'blocker', 'end_user'
  influenceLevel: string | null // 'high', 'medium', 'low'
  sentiment: string | null // 'positive', 'neutral', 'negative'
  engagementNotes: string | null
  isPrimary: boolean
  isActive: boolean
}

// Stage history entry
export interface DealStageHistoryEntry {
  id: string
  stage: DealStage
  enteredAt: string
  exitedAt: string | null
  durationDays: number | null
  changedBy: string | null
}

// Universal tool types (reuse pattern from lead)
export interface DealActivity {
  id: string
  type: string
  subject: string
  description: string | null
  dueDate: string | null
  status: string
  assignedTo: string | null
  createdAt: string
}

export interface DealNote {
  id: string
  title: string | null
  content: string
  createdAt: string
  createdBy: string
  isPinned: boolean
}

export interface DealDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
  url: string
}

// Deal sections for navigation
export type DealSection =
  | 'overview'
  | 'details'
  | 'stakeholders'
  | 'timeline'
  | 'competitors'
  | 'proposal'
  | 'jobs'
  | 'meetings'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'
