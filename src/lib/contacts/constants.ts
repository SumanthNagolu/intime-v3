/**
 * Contact Constants
 *
 * Centralized constants for contact section components.
 * Used for dropdowns, validation, and display formatting.
 */

// ============ CONTACT CATEGORY ============

export const CONTACT_CATEGORIES = [
  { value: 'person', label: 'Person', icon: '👤', description: 'Individual contact' },
  { value: 'company', label: 'Company', icon: '🏢', description: 'Organization or business' },
] as const

// ============ CONTACT TYPES ============

export const CONTACT_TYPES = [
  { value: 'candidate', label: 'Candidate', icon: '📋', description: 'Job seeker or consultant' },
  { value: 'lead', label: 'Lead', icon: '🎯', description: 'Sales lead or prospect' },
  { value: 'client_contact', label: 'Client Contact', icon: '🤝', description: 'Contact at a client company' },
  { value: 'vendor_contact', label: 'Vendor Contact', icon: '📦', description: 'Contact at a vendor company' },
  { value: 'employee', label: 'Employee', icon: '👔', description: 'Internal employee' },
  { value: 'reference', label: 'Reference', icon: '📞', description: 'Professional reference' },
] as const

// ============ CONTACT STATUS ============

export const CONTACT_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'secondary' },
  { value: 'do_not_contact', label: 'Do Not Contact', color: 'destructive' },
] as const

// ============ CANDIDATE STATUS ============

export const CANDIDATE_STATUSES = [
  { value: 'available', label: 'Available', color: 'success' },
  { value: 'placed', label: 'Placed', color: 'info' },
  { value: 'on_assignment', label: 'On Assignment', color: 'warning' },
  { value: 'interviewing', label: 'Interviewing', color: 'info' },
  { value: 'not_looking', label: 'Not Looking', color: 'secondary' },
  { value: 'unavailable', label: 'Unavailable', color: 'secondary' },
] as const

// ============ LEAD STATUS ============

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'info' },
  { value: 'contacted', label: 'Contacted', color: 'warning' },
  { value: 'qualified', label: 'Qualified', color: 'success' },
  { value: 'unqualified', label: 'Unqualified', color: 'secondary' },
  { value: 'converted', label: 'Converted', color: 'success' },
  { value: 'lost', label: 'Lost', color: 'destructive' },
] as const

// ============ COMMUNICATION PREFERENCES ============

export const CONTACT_METHODS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '📱' },
  { value: 'text', label: 'Text/SMS', icon: '💬' },
  { value: 'linkedin', label: 'LinkedIn', icon: '🔗' },
] as const

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
] as const

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'hi', label: 'Hindi' },
] as const

// ============ EMPLOYMENT ============

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'intern', label: 'Intern' },
] as const

export const EMPLOYMENT_STATUSES = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
] as const

// ============ VISA TYPES ============

export const VISA_TYPES = [
  { value: 'citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b', label: 'H-1B' },
  { value: 'l1', label: 'L-1' },
  { value: 'opt', label: 'OPT' },
  { value: 'cpt', label: 'CPT' },
  { value: 'tn', label: 'TN' },
  { value: 'e1_e2', label: 'E-1/E-2' },
  { value: 'other', label: 'Other' },
] as const

// ============ AVAILABILITY ============

export const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Immediately' },
  { value: '1_week', label: '1 Week' },
  { value: '2_weeks', label: '2 Weeks' },
  { value: '1_month', label: '1 Month' },
  { value: '2_months', label: '2 Months' },
  { value: 'negotiable', label: 'Negotiable' },
] as const

// ============ PRONOUNS ============

export const PRONOUN_OPTIONS = [
  { value: 'he/him', label: 'He/Him' },
  { value: 'she/her', label: 'She/Her' },
  { value: 'they/them', label: 'They/Them' },
  { value: 'other', label: 'Other' },
] as const

// ============ ADDRESS TYPES ============

export const ADDRESS_TYPES = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'mailing', label: 'Mailing' },
  { value: 'other', label: 'Other' },
] as const

// ============ BANT SCORING ============

export const BANT_LEVELS = [
  { value: 0, label: 'Unknown' },
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
] as const

export const LEAD_URGENCY = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

export const BUDGET_STATUSES = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'no_budget', label: 'No Budget' },
] as const

export const AUTHORITY_LEVELS = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'champion', label: 'Champion' },
  { value: 'gatekeeper', label: 'Gatekeeper' },
  { value: 'end_user', label: 'End User' },
] as const

// ============ SKILL PROFICIENCY ============

export const SKILL_PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner', years: '< 1 year' },
  { value: 'intermediate', label: 'Intermediate', years: '1-3 years' },
  { value: 'advanced', label: 'Advanced', years: '3-5 years' },
  { value: 'expert', label: 'Expert', years: '5+ years' },
] as const

// ============ MEETING PLATFORMS ============

export const MEETING_PLATFORMS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'meet', label: 'Google Meet' },
  { value: 'webex', label: 'Webex' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'in_person', label: 'In Person' },
] as const

// ============ COMPANY TYPES (for company contacts) ============

export const COMPANY_TYPES = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'staffing_vendor', label: 'Staffing Vendor' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
  { value: 'msp_vms', label: 'MSP/VMS' },
  { value: 'recruitment_agency', label: 'Recruitment Agency' },
  { value: 'consulting_firm', label: 'Consulting Firm' },
  { value: 'other', label: 'Other' },
] as const

// ============ INDUSTRIES ============

export const INDUSTRIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'retail', label: 'Retail', icon: '🛒' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'government', label: 'Government', icon: '🏛️' },
  { value: 'energy', label: 'Energy', icon: '⚡' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
  { value: 'transportation', label: 'Transportation', icon: '🚚' },
  { value: 'hospitality', label: 'Hospitality', icon: '🏨' },
  { value: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { value: 'other', label: 'Other', icon: '📁' },
] as const

// ============ HELPER FUNCTIONS ============

export function getContactStatusBadgeVariant(status: string): 'secondary' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'do_not_contact':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function getCandidateStatusBadgeVariant(status: string): 'secondary' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'available':
      return 'success'
    case 'placed':
    case 'interviewing':
      return 'warning'
    case 'on_assignment':
      return 'warning'
    case 'not_looking':
    case 'unavailable':
      return 'secondary'
    default:
      return 'secondary'
  }
}

export function getLeadStatusBadgeVariant(status: string): 'secondary' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'new':
      return 'warning'
    case 'contacted':
      return 'warning'
    case 'qualified':
    case 'converted':
      return 'success'
    case 'unqualified':
      return 'secondary'
    case 'lost':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '-'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

export function formatPercentage(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '-'
  return `${num}%`
}
