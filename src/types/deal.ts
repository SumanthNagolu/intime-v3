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
  // Additional value fields
  estimatedPlacements: number | null
  avgBillRate: number | null
  contractLengthMonths: number | null
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
  // Owner
  owner: { id: string; fullName: string; avatarUrl: string | null } | null
  // Timestamps
  createdAt: string
  updatedAt: string | null
  lastActivityAt: string | null
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
  | 'summary'
  | 'pipeline'
  | 'account'
  | 'contacts'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'
