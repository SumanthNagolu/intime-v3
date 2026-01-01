import type { Placement } from '@/configs/entities/placements.config'

// Placement-specific section types

export interface PlacementTimesheet {
  id: string
  status: string
  periodStart: string
  periodEnd: string
  totalRegularHours: number
  totalOvertimeHours: number
  totalDoubleTimeHours: number
  totalBillableAmount: number
  totalPayableAmount: number
  submittedAt?: string | null
  approvedAt?: string | null
  createdAt: string
}

export interface PlacementCheckin {
  id: string
  checkin_type: '7_day' | '30_day' | '60_day' | '90_day'
  checkin_date: string
  overall_health: 'healthy' | 'at_risk' | 'critical'
  candidate_overall_satisfaction?: number | null
  manager_overall_satisfaction?: number | null
  created_at: string
  completedBy?: { id: string; full_name: string; avatar_url?: string | null } | null
}

export interface PlacementMilestone {
  id: string
  milestone_type: string
  due_date: string
  completed_date?: string | null
  status: 'pending' | 'completed' | 'overdue' | 'skipped'
  notes?: string | null
  created_at: string
}

export interface PlacementExtension {
  id: string
  original_end_date: string
  new_end_date: string
  extension_months: number
  approved_at?: string | null
  reason?: string | null
  created_at: string
}

export interface PlacementComplianceItem {
  id: string
  name: string
  status: 'pending' | 'received' | 'under_review' | 'verified' | 'approved' | 'rejected' | 'expiring' | 'expired' | 'waived'
  due_date?: string | null
  completed_at?: string | null
  is_blocking: boolean
  document_url?: string | null
  notes?: string | null
  created_at: string
  requirement?: {
    id: string
    name: string
    category: string
    description?: string | null
    is_mandatory: boolean
  } | null
}

export interface PlacementActivity {
  id: string
  activity_type: string
  subject?: string
  description?: string
  status?: string
  outcome?: string
  created_at: string
  creator?: { id: string; full_name: string; avatar_url?: string | null }
  assignee?: { id: string; full_name: string; avatar_url?: string | null }
}

export interface PlacementNote {
  id: string
  content: string
  is_pinned?: boolean
  is_private?: boolean
  created_at: string
  creator?: { id: string; full_name: string; avatar_url?: string | null }
}

export interface PlacementDocument {
  id: string
  name: string
  file_type?: string
  file_url?: string
  file_size?: number
  document_type?: string
  created_at: string
  uploadedBy?: { id: string; full_name: string; avatar_url?: string | null }
}

export interface PlacementHistoryEntry {
  id: string
  activity_type: string
  subject?: string
  description?: string
  created_at: string
  creator?: { id: string; full_name: string; avatar_url?: string | null }
}

// Full placement with all section data from getFullPlacement
export interface FullPlacement extends Omit<Placement, 'job' | 'candidate' | 'account'> {
  job: {
    id: string
    title: string
    description?: string | null
    status: string
    location_type?: string | null
    location_city?: string | null
    location_state?: string | null
    account?: { id: string; name: string; industry?: string | null; website?: string | null } | null
  } | null

  candidate: {
    id: string
    first_name: string
    last_name: string
    full_name?: string | null
    email?: string | null
    phone?: string | null
    avatar_url?: string | null
    title?: string | null
    linkedin_url?: string | null
  } | null

  account: { id: string; name: string; industry?: string | null; website?: string | null } | null

  offer?: {
    id: string
    status: string
    pay_rate?: number | null
    bill_rate?: number | null
    employment_type?: string | null
    start_date?: string | null
    end_date?: string | null
  } | null

  submission?: {
    id: string
    status: string
    submitted_at?: string | null
    match_score?: number | null
  } | null

  recruiter?: { id: string; full_name: string; avatar_url?: string | null } | null

  // Embedded relations from placement query
  checkins?: PlacementCheckin[]
  milestones?: PlacementMilestone[]
  extensions?: PlacementExtension[]

  // Calculated fields
  daysActive: number
  marginAmount: number
  marginPercent: number

  sections: {
    timesheets: { items: PlacementTimesheet[]; total: number }
    compliance: { items: PlacementComplianceItem[]; total: number }
    activities: { items: PlacementActivity[]; total: number }
    notes: { items: PlacementNote[]; total: number }
    documents: { items: PlacementDocument[]; total: number }
    history: { items: PlacementHistoryEntry[]; total: number }
  }
}
