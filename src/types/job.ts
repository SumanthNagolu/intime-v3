/**
 * Type definitions for Job entity with full section data
 * Used by the ONE Database Call pattern in Job Workspace
 */

// Generic section data structure
export interface JobSectionData<T> {
  items: T[]
  total: number
}

// Submission section with status breakdown
export interface SubmissionSectionData {
  items: SubmissionItem[]
  total: number
  byStatus: Record<string, number>
}

// Interview section with upcoming count
export interface InterviewSectionData {
  items: InterviewItem[]
  total: number
  upcoming: number
}

// Offer section with pending count
export interface OfferSectionData {
  items: OfferItem[]
  total: number
  pending: number
}

// SLA Progress calculation
export interface SlaProgress {
  daysElapsed: number
  slaDays: number
  percentUsed: number
  isOverdue: boolean
  daysRemaining: number
}

// Submission item from getFullJob
export interface SubmissionItem {
  id: string
  job_id: string
  status: string
  created_at: string
  stage_changed_at?: string
  ai_match_score?: number
  candidate?: {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
    avatar_url?: string
  }
  submittedBy?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  [key: string]: unknown
}

// Interview item from getFullJob
export interface InterviewItem {
  id: string
  submission_id: string
  job_id: string
  scheduled_at?: string
  status: string
  submission?: {
    id: string
    candidate_id: string
  }
  interviewer?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  [key: string]: unknown
}

// Offer item from getFullJob
export interface OfferItem {
  id: string
  submission_id: string
  job_id: string
  status: string
  created_at: string
  submission?: {
    id: string
    candidate_id: string
  }
  candidate?: {
    id: string
    first_name: string
    last_name: string
  }
  [key: string]: unknown
}

// Team member (job assignment)
export interface TeamMemberItem {
  id: string
  job_id: string
  user_id: string
  role?: string
  user?: {
    id: string
    full_name: string
    avatar_url?: string
    email?: string
  }
  [key: string]: unknown
}

// Activity item
export interface ActivityItem {
  id: string
  entity_type: string
  entity_id: string
  activity_type: string
  subject?: string
  description?: string
  created_at: string
  creator?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  [key: string]: unknown
}

// Note item
export interface NoteItem {
  id: string
  entity_type: string
  entity_id: string
  content: string
  created_at: string
  creator?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  [key: string]: unknown
}

// Document item
export interface DocumentItem {
  id: string
  entity_type: string
  entity_id: string
  file_name: string
  file_url?: string
  file_type?: string
  created_at: string
  [key: string]: unknown
}

// Status history item
export interface StatusHistoryItem {
  id: string
  job_id: string
  from_status?: string
  to_status: string
  changed_at: string
  reason?: string
  changedBy?: {
    id: string
    full_name: string
  }
  [key: string]: unknown
}

// Job requirement
export interface JobRequirementItem {
  id: string
  job_id: string
  requirement_type?: string
  description?: string
  is_required?: boolean
  [key: string]: unknown
}

// Job skill
export interface JobSkillItem {
  id: string
  job_id: string
  skill_id: string
  years_required?: number
  proficiency_level?: string
  is_required?: boolean
  skill?: {
    id: string
    name: string
    category?: string
  }
  [key: string]: unknown
}

// Full Job with all section data
export interface FullJob {
  // Core job fields
  id: string
  org_id: string
  title: string
  status: string
  job_type?: string
  description?: string
  location?: string
  is_remote?: boolean
  is_hybrid?: boolean

  // Rate/compensation
  rate_min?: number
  rate_max?: number
  bill_rate_min?: number
  bill_rate_max?: number
  salary_min?: number
  salary_max?: number

  // Positions
  positions_count?: number
  positions_filled?: number

  // SLA and priority
  sla_days?: number
  priority?: string
  priority_rank?: number

  // Requirements (text fields)
  required_skills?: string
  preferred_skills?: string
  certifications?: string
  experience_level?: string
  education?: string

  // Dates
  created_at: string
  updated_at?: string
  target_start_date?: string
  target_fill_date?: string

  // References
  account_id?: string
  client_company_id?: string
  end_client_company_id?: string
  vendor_company_id?: string
  hiring_manager_contact_id?: string
  hr_contact_id?: string
  owner_id?: string

  // Related entities (from select joins)
  company?: {
    id: string
    name: string
    industry?: string
  }
  clientCompany?: {
    id: string
    name: string
    industry?: string
  }
  endClientCompany?: {
    id: string
    name: string
    industry?: string
  }
  vendorCompany?: {
    id: string
    name: string
  }
  hiringManagerContact?: {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  hrContact?: {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  account?: {
    id: string
    name: string
    status?: string
  }

  // Inline relations from job query
  requirements?: JobRequirementItem[]
  skills?: JobSkillItem[]

  // SLA progress (calculated)
  slaProgress: SlaProgress | null

  // Section data (from parallel queries)
  sections: {
    requirements: JobSectionData<JobRequirementItem>
    skills: JobSectionData<JobSkillItem>
    team: JobSectionData<TeamMemberItem>
    submissions: SubmissionSectionData
    interviews: InterviewSectionData
    offers: OfferSectionData
    activities: JobSectionData<ActivityItem>
    notes: JobSectionData<NoteItem>
    documents: JobSectionData<DocumentItem>
    history: JobSectionData<StatusHistoryItem>
  }

  // Allow additional properties
  [key: string]: unknown
}
