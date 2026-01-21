/**
 * Job Constants - Shared option lists for forms and display
 *
 * Single source of truth for job-related options used in:
 * - Wizard (create mode)
 * - Detail view (view mode)
 * - Edit panels (edit mode)
 */

// ============ INTAKE METHODS ============

export const INTAKE_METHODS = [
  { value: 'phone_video', label: 'Phone/Video Call (Live intake)' },
  { value: 'email', label: 'Email (Client sent requirements)' },
  { value: 'client_portal', label: 'Client Portal (Self-service submission)' },
  { value: 'in_person', label: 'In-Person Meeting' },
] as const

// ============ JOB TYPES ============

export const JOB_TYPES = [
  { value: 'contract', label: 'Contract (W2)', icon: '📋' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire', icon: '🔄' },
  { value: 'permanent', label: 'Direct Hire (Permanent)', icon: '🏠' },
  { value: 'c2c', label: '1099 / C2C', icon: '🤝' },
  { value: 'temp', label: 'Temporary', icon: '⏱️' },
  { value: 'sow', label: 'Statement of Work (SOW)', icon: '📄' },
] as const

// ============ PRIORITY ============

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', description: '60+ days, pipeline building', color: 'text-charcoal-500', bgColor: 'bg-charcoal-100' },
  { value: 'normal', label: 'Normal', description: '30-60 days', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'high', label: 'High', description: 'Within 30 days', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { value: 'urgent', label: 'Urgent', description: 'ASAP, <2 weeks', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'critical', label: 'Critical', description: 'Immediate need', color: 'text-red-600', bgColor: 'bg-red-100' },
] as const

export const PRIORITY_RANKS = [
  { value: 0, label: 'Unset', color: 'text-charcoal-400' },
  { value: 1, label: 'Critical (P1)', color: 'text-red-600' },
  { value: 2, label: 'High (P2)', color: 'text-amber-600' },
  { value: 3, label: 'Medium (P3)', color: 'text-blue-600' },
  { value: 4, label: 'Low (P4)', color: 'text-charcoal-500' },
] as const

// ============ JOB STATUS ============

export const JOB_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'text-charcoal-500', bgColor: 'bg-charcoal-100' },
  { value: 'open', label: 'Open', color: 'text-success-700', bgColor: 'bg-success-50' },
  { value: 'on_hold', label: 'On Hold', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  { value: 'filled', label: 'Filled', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  { value: 'closed', label: 'Closed', color: 'text-charcoal-600', bgColor: 'bg-charcoal-100' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-error-700', bgColor: 'bg-error-50' },
] as const

// ============ EXPERIENCE ============

export const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5-8 years)' },
  { value: 'staff', label: 'Staff (8-12 years)' },
  { value: 'principal', label: 'Principal (12+ years)' },
  { value: 'director', label: 'Director / Lead' },
] as const

export const EDUCATION_LEVELS = [
  { value: 'none', label: 'No requirement' },
  { value: 'high_school', label: 'High School' },
  { value: 'associates', label: "Associate's Degree" },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'bachelors_cs', label: "Bachelor's in CS or equivalent" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'masters_preferred', label: "Master's preferred" },
  { value: 'phd', label: 'PhD required' },
] as const

// ============ ROLE DETAILS ============

export const ROLE_OPEN_REASONS = [
  { value: 'growth', label: 'Team growth / Expansion', icon: '📈' },
  { value: 'backfill', label: 'Backfill (someone left)', icon: '🔄' },
  { value: 'new_project', label: 'New project / Initiative', icon: '🚀' },
  { value: 'restructuring', label: 'Restructuring', icon: '🏗️' },
] as const

// ============ LOCATION & WORK ============

export const WORK_ARRANGEMENTS = [
  { value: 'remote', label: 'Remote (100%)', icon: '🏠', description: 'Work from anywhere' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔀', description: 'Mix of remote and on-site' },
  { value: 'onsite', label: 'On-site', icon: '🏢', description: 'Full-time in office' },
] as const

export const WORK_AUTHORIZATIONS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b_transfer', label: 'H1B (Transfer)' },
  { value: 'h1b_new', label: 'H1B (New sponsorship)' },
  { value: 'opt', label: 'OPT' },
  { value: 'cpt', label: 'CPT' },
  { value: 'tn_visa', label: 'TN Visa' },
  { value: 'l1_visa', label: 'L1 Visa' },
  { value: 'e3_visa', label: 'E3 Visa' },
  { value: 'any', label: 'Any Work Authorization' },
] as const

// ============ COMPENSATION ============

export const RATE_TYPES = [
  { value: 'hourly', label: 'Hourly', suffix: '/hr' },
  { value: 'daily', label: 'Daily', suffix: '/day' },
  { value: 'weekly', label: 'Weekly', suffix: '/week' },
  { value: 'monthly', label: 'Monthly', suffix: '/mo' },
  { value: 'annual', label: 'Annual', suffix: '/yr' },
] as const

export const FEE_TYPES = [
  { value: 'percentage', label: 'Percentage of Salary/Rate', description: 'Standard fee structure' },
  { value: 'flat', label: 'Flat Fee', description: 'Fixed amount per placement' },
  { value: 'hourly_spread', label: 'Hourly Spread', description: 'Difference between bill and pay rate' },
] as const

export const BENEFITS = [
  { value: 'health', label: 'Health Insurance' },
  { value: 'dental', label: 'Dental Insurance' },
  { value: 'vision', label: 'Vision Insurance' },
  { value: '401k', label: '401(k)' },
  { value: '401k_match', label: '401(k) with Match' },
  { value: 'pto', label: 'Paid Time Off' },
  { value: 'unlimited_pto', label: 'Unlimited PTO' },
  { value: 'sick_leave', label: 'Sick Leave' },
  { value: 'parental', label: 'Parental Leave' },
  { value: 'remote_stipend', label: 'Remote Work Stipend' },
  { value: 'education', label: 'Education Reimbursement' },
  { value: 'stock', label: 'Stock Options / Equity' },
  { value: 'bonus', label: 'Performance Bonus' },
  { value: 'relocation', label: 'Relocation Assistance' },
] as const

export const OVERTIME_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely (a few times per year)' },
  { value: 'sometimes', label: 'Sometimes (1-2 times per month)' },
  { value: 'often', label: 'Often (weekly)' },
] as const

// ============ INTERVIEW PROCESS ============

export const INTERVIEW_FORMATS = [
  { value: 'phone', label: 'Phone' },
  { value: 'video', label: 'Video Call' },
  { value: 'onsite', label: 'On-site' },
  { value: 'panel', label: 'Panel Interview' },
  { value: 'technical', label: 'Technical Assessment' },
  { value: 'behavioral', label: 'Behavioral' },
] as const

export const SUBMISSION_REQUIREMENTS = [
  { value: 'resume', label: 'Resume' },
  { value: 'cover_letter', label: 'Cover Letter' },
  { value: 'portfolio', label: 'Portfolio / Work Samples' },
  { value: 'references', label: 'References' },
  { value: 'linkedin', label: 'LinkedIn Profile' },
  { value: 'github', label: 'GitHub / Code Samples' },
  { value: 'certifications', label: 'Certifications' },
  { value: 'salary_expectations', label: 'Salary Expectations' },
  { value: 'availability', label: 'Start Date / Availability' },
  { value: 'visa_status', label: 'Work Authorization Status' },
] as const

export const SUBMISSION_FORMATS = [
  { value: 'standard', label: 'Standard Resume Format' },
  { value: 'client_template', label: 'Client-Specific Template' },
  { value: 'blind', label: 'Blind Resume (No identifying info)' },
  { value: 'detailed', label: 'Detailed with Writeup' },
] as const

// ============ INDUSTRIES ============

export const INDUSTRIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'fintech', label: 'FinTech', icon: '💳' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'finance', label: 'Finance & Banking', icon: '🏦' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'retail', label: 'Retail', icon: '🛒' },
  { value: 'ecommerce', label: 'E-Commerce', icon: '🛍️' },
  { value: 'professional_services', label: 'Professional Services', icon: '💼' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'government', label: 'Government', icon: '🏛️' },
  { value: 'energy', label: 'Energy & Utilities', icon: '⚡' },
  { value: 'telecommunications', label: 'Telecommunications', icon: '📡' },
  { value: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { value: 'automotive', label: 'Automotive', icon: '🚗' },
  { value: 'aerospace', label: 'Aerospace & Defense', icon: '✈️' },
  { value: 'pharma', label: 'Pharmaceuticals', icon: '💊' },
  { value: 'logistics', label: 'Logistics & Supply Chain', icon: '📦' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏘️' },
  { value: 'other', label: 'Other', icon: '📋' },
] as const

// ============ SKILLS ============

export const SKILL_PROFICIENCIES = [
  { value: 'beginner', label: 'Beginner', description: '< 1 year' },
  { value: 'proficient', label: 'Proficient', description: '1-3 years' },
  { value: 'expert', label: 'Expert', description: '3+ years' },
] as const

export const COMMON_CERTIFICATIONS = {
  cloud: ['AWS Solutions Architect', 'AWS Developer', 'Azure Administrator', 'GCP Professional', 'Kubernetes (CKA/CKAD)'],
  security: ['CISSP', 'CISM', 'Security+', 'CEH', 'OSCP'],
  agile: ['PMP', 'CSM', 'PSM', 'SAFe Agilist'],
  data: ['Google Data Engineer', 'Databricks', 'Snowflake'],
  development: ['Java Certified', 'Microsoft Certified', 'Salesforce Certified'],
} as const

// ============ CURRENCIES ============

export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
] as const

// ============ LOCATIONS ============

export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
] as const

export const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'AU', label: 'Australia' },
  { value: 'IN', label: 'India' },
  { value: 'JP', label: 'Japan' },
  { value: 'SG', label: 'Singapore' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'IE', label: 'Ireland' },
  { value: 'CH', label: 'Switzerland' },
] as const

// ============ VISA / WORK AUTHORIZATION ============

export const VISA_TYPES = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b', label: 'H1B' },
  { value: 'h1b_transfer', label: 'H1B (Transfer)' },
  { value: 'h1b_sponsor', label: 'H1B (Sponsorship Required)' },
  { value: 'opt', label: 'OPT' },
  { value: 'opt_stem', label: 'OPT STEM Extension' },
  { value: 'cpt', label: 'CPT' },
  { value: 'tn_visa', label: 'TN Visa' },
  { value: 'l1_visa', label: 'L1 Visa' },
  { value: 'e3_visa', label: 'E3 Visa' },
  { value: 'any', label: 'Any Work Authorization' },
] as const

// ============ PROFICIENCY LEVELS ============

export const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Limited experience, learning' },
  { value: 'intermediate', label: 'Intermediate', description: '1-3 years experience' },
  { value: 'advanced', label: 'Advanced', description: '3-5 years experience' },
  { value: 'expert', label: 'Expert', description: '5+ years, deep expertise' },
] as const

// ============ HELPER FUNCTIONS ============

export function getJobTypeLabel(value: string): string {
  return JOB_TYPES.find(t => t.value === value)?.label || value
}

export function getPriorityConfig(value: string) {
  return PRIORITY_LEVELS.find(p => p.value === value) || PRIORITY_LEVELS[1]
}

export function getStatusConfig(value: string) {
  return JOB_STATUSES.find(s => s.value === value) || JOB_STATUSES[0]
}

export function getStatusBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' {
  switch (status) {
    case 'open': return 'success'
    case 'active': return 'success'
    case 'on_hold': return 'warning'
    case 'filled': return 'secondary'
    case 'closed': return 'default'
    case 'cancelled': return 'destructive'
    default: return 'default'
  }
}

export function getPriorityBadgeVariant(priority: string): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' {
  switch (priority) {
    case 'critical': return 'destructive'
    case 'urgent': return 'warning'
    case 'high': return 'warning'
    case 'normal': return 'secondary'
    case 'low': return 'default'
    default: return 'default'
  }
}
