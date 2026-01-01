import type { Offer } from '@/configs/entities/offers.config'

// Offer-specific section types
export interface OfferNegotiation {
  id: string
  initiated_by: 'candidate' | 'client' | 'recruiter'
  original_terms: Record<string, unknown> | null
  proposed_terms: Record<string, unknown> | null
  counter_message?: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at?: string
}

export interface OfferApproval {
  id: string
  approval_type: 'rate_exception' | 'terms_change' | 'budget_override'
  status: 'pending' | 'approved' | 'rejected'
  requested_by: string
  approver_id: string
  request_notes?: string | null
  proposed_changes?: Record<string, unknown> | null
  response_notes?: string | null
  responded_at?: string | null
  created_at: string
  requester?: { id: string; full_name: string; avatar_url?: string | null } | null
  approver?: { id: string; full_name: string; avatar_url?: string | null } | null
}

export interface OfferActivity {
  id: string
  activity_type: string
  subject?: string
  description?: string
  status?: string
  outcome?: string
  created_at: string
  creator?: { id: string; full_name: string; avatar_url?: string | null }
}

export interface OfferNote {
  id: string
  content: string
  is_pinned?: boolean
  is_private?: boolean
  created_at: string
  creator?: { id: string; full_name: string; avatar_url?: string | null }
}

export interface OfferDocument {
  id: string
  name: string
  file_type?: string
  file_url?: string
  file_size?: number
  document_type?: string
  created_at: string
  uploader?: { id: string; full_name: string; avatar_url?: string | null }
}

export interface OfferHistoryEntry {
  id: string
  action?: string
  description?: string
  changes?: Record<string, unknown>
  created_at: string
  changedBy?: { id: string; full_name: string; avatar_url?: string | null }
}

export interface FullOffer extends Omit<Offer, 'submission'> {
  submission: {
    id: string
    status: string
    submitted_at?: string | null
    bill_rate?: number | null
    pay_rate?: number | null
    candidate: {
      id: string
      first_name: string
      last_name: string
      full_name?: string | null
      email?: string | null
      phone?: string | null
      avatar_url?: string | null
      title?: string | null
    } | null
    job: {
      id: string
      title: string
      status: string
    } | null
    owner?: { id: string; full_name: string; avatar_url?: string | null } | null
  } | null

  job: {
    id: string
    title: string
    status: string
    account?: { id: string; name: string; industry?: string | null } | null
  } | null

  account: { id: string; name: string; industry?: string | null } | null
  createdByUser?: { id: string; full_name: string; avatar_url?: string | null } | null

  // Calculated fields
  marginAmount: number
  marginPercent: number
  daysUntilExpiry: number | null

  sections: {
    negotiations: { items: OfferNegotiation[]; total: number }
    approvals: { items: OfferApproval[]; total: number; hasPending: boolean }
    activities: { items: OfferActivity[]; total: number }
    notes: { items: OfferNote[]; total: number }
    documents: { items: OfferDocument[]; total: number }
    history: { items: OfferHistoryEntry[]; total: number }
  }
}
