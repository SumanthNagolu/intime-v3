export interface FullSubmission {
  id: string
  status: string
  submitted_at?: string | null
  submitted_to_client_at?: string | null
  submission_rate?: number | null
  bill_rate?: number | null
  pay_rate?: number | null
  negotiated_bill_rate?: number | null
  negotiated_pay_rate?: number | null
  match_score?: number | null
  ai_match_score?: number | null
  recruiter_match_score?: number | null
  client_feedback?: string | null
  internal_notes?: string | null
  submission_notes?: string | null
  rtr_obtained?: boolean
  rtr_obtained_at?: string | null
  interview_count?: number
  last_interview_date?: string | null
  offer_extended_at?: string | null
  created_at: string
  updated_at?: string

  // Relations
  candidate?: {
    id: string
    first_name: string
    last_name: string
    full_name?: string
    email?: string
    phone?: string
    avatar_url?: string
    title?: string
    linkedin_url?: string
    location_city?: string
    location_state?: string
    desired_rate?: number
    work_authorization?: string
    years_experience?: number
  } | null

  job?: {
    id: string
    title: string
    status?: string
    job_type?: string
    location_type?: string
    location_city?: string
    location_state?: string
    min_bill_rate?: number
    max_bill_rate?: number
    min_pay_rate?: number
    max_pay_rate?: number
    start_date?: string
    end_date?: string
    company?: { id: string; name: string; industry?: string }
    clientCompany?: { id: string; name: string; industry?: string; website?: string }
    hiringManagerContact?: { id: string; first_name: string; last_name: string; email?: string; phone?: string }
    owner?: { id: string; full_name: string; avatar_url?: string }
  } | null

  account?: {
    id: string
    name: string
    industry?: string
    website?: string
  } | null

  owner?: {
    id: string
    full_name: string
    avatar_url?: string
    email?: string
  } | null

  offer?: {
    id: string
    status: string
    offer_date?: string
    salary?: number
    bill_rate?: number
    pay_rate?: number
  } | null

  // Sections
  sections?: {
    interviews?: { items: Interview[]; total: number }
    feedback?: { items: SubmissionFeedback[]; total: number }
    activities?: { items: Activity[]; total: number }
    notes?: { items: Note[]; total: number }
    documents?: { items: Document[]; total: number }
    history?: { items: StatusHistoryEntry[]; total: number }
  }
}

export interface Interview {
  id: string
  scheduled_at?: string
  interview_type?: string
  status?: string
  duration_minutes?: number
  location?: string
  meeting_link?: string
  notes?: string
  feedback?: string
  rating?: number
  interviewer?: { id: string; full_name: string; email?: string; avatar_url?: string }
  scheduledBy?: { id: string; full_name: string }
}

export interface SubmissionFeedback {
  id: string
  feedback_type?: string
  rating?: number
  recommendation?: string
  comments?: string
  created_at: string
  createdBy?: { id: string; full_name: string; avatar_url?: string }
}

export interface Activity {
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

export interface Note {
  id: string
  content: string
  is_pinned?: boolean
  created_at: string
  updated_at?: string
  creator?: { id: string; full_name: string; avatar_url?: string }
}

export interface Document {
  id: string
  name: string
  file_type?: string
  file_url?: string
  file_size?: number
  document_type?: string
  description?: string
  created_at: string
  uploader?: { id: string; full_name: string; avatar_url?: string }
}

export interface StatusHistoryEntry {
  id: string
  from_status?: string
  to_status: string
  reason?: string
  changed_at: string
  changedBy?: { id: string; full_name: string; avatar_url?: string }
}
