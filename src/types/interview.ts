import type { Interview } from '@/configs/entities/interviews.config'

// Interview-specific section types with fields returned by getFullInterview
export interface InterviewNote {
  id: string
  content: string
  is_pinned?: boolean
  is_private?: boolean
  created_at: string
  updated_at?: string
  created_by_name?: string | null
  creator?: { id: string; full_name: string; avatar_url?: string }
}

export interface InterviewDocument {
  id: string
  name: string
  file_type?: string
  mime_type?: string
  file_url?: string
  file_size?: number
  document_type?: string
  description?: string
  uploaded_at?: string
  created_at: string
  uploader?: { id: string; full_name: string; avatar_url?: string }
}

export interface InterviewHistoryEntry {
  id: string
  action?: string
  description?: string
  changes?: Record<string, unknown>
  changed_by_name?: string | null
  created_at: string
  changedBy?: { id: string; full_name: string; avatar_url?: string }
}

export interface InterviewActivity {
  id: string
  activity_type: string
  subject?: string
  description?: string
  status?: string
  priority?: string
  due_date?: string
  completed_at?: string
  created_at: string
  creator?: { id: string; full_name: string; avatar_url?: string }
  assignee?: { id: string; full_name: string; avatar_url?: string }
  performedBy?: { id: string; full_name: string; avatar_url?: string }
}

export interface InterviewParticipant {
  id: string
  interview_id?: string
  participant_type: 'candidate' | 'interviewer' | 'recruiter' | 'hiring_manager' | 'observer' | 'lead_interviewer' | 'shadow' | 'note_taker'
  name: string
  email: string | null
  phone: string | null
  role: string
  title?: string | null
  is_required: boolean
  response_status: 'pending' | 'accepted' | 'declined' | 'tentative'
  // Alias for response_status for component compatibility
  status?: 'confirmed' | 'pending' | 'declined' | 'tentative' | null
  responded_at?: string | null
  avatar_url?: string | null
  created_at?: string
}

export interface InterviewFeedbackEntry {
  id: string
  source: 'scorecard' | 'legacy'
  overall_rating?: number | null
  rating?: number | null
  recommendation?: string | null
  feedback?: string | null
  // For display in components
  comments?: string | null
  strengths?: string[] | null
  concerns?: string[] | null
  areas_for_improvement?: string[] | null
  criteria_scores?: Record<string, number> | null
  submittedBy?: { id: string; full_name: string; avatar_url?: string | null } | null
  interviewer?: { id: string; full_name: string; avatar_url?: string | null } | null
  // Additional fields for component display
  submitted_by_name?: string | null
  submitted_at?: string | null
  created_at: string
}

// Extend Interview but override fields that have expanded types
export interface FullInterview extends Omit<Interview, 'submission' | 'job'> {
  submission: {
    id: string
    status: string
    submitted_at?: string | null
    bill_rate?: number | null
    pay_rate?: number | null
    match_score?: number | null
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
      location_city?: string | null
      location_state?: string | null
    } | null
    job: {
      id: string
      title: string
      status: string
      job_type?: string | null
      location_type?: string | null
      location_city?: string | null
      location_state?: string | null
      min_bill_rate?: number | null
      max_bill_rate?: number | null
    } | null
    owner?: { id: string; full_name: string; avatar_url?: string | null } | null
  } | null

  job: {
    id: string
    title: string
    status: string
    account?: { id: string; name: string; industry?: string | null; website?: string | null } | null
    clientCompany?: { id: string; name: string } | null
  } | null

  account: { id: string; name: string; industry?: string | null; website?: string | null } | null
  scheduledBy?: { id: string; full_name: string; avatar_url?: string | null } | null

  sections: {
    participants: { items: InterviewParticipant[]; total: number }
    feedback: { items: InterviewFeedbackEntry[]; total: number; hasScorecard: boolean; hasLegacy: boolean }
    activities: { items: InterviewActivity[]; total: number }
    notes: { items: InterviewNote[]; total: number }
    documents: { items: InterviewDocument[]; total: number }
    history: { items: InterviewHistoryEntry[]; total: number }
  }
}
