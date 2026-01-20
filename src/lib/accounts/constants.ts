/**
 * Account Constants - Single Source of Truth
 *
 * All account-related constants used across wizard, detail view, and edit panels.
 * Import from here instead of defining locally in components.
 */

// ============ INDUSTRIES ============
export const INDUSTRIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'fintech', label: 'FinTech', icon: '💳' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'finance', label: 'Finance & Banking', icon: '🏦' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'retail', label: 'Retail', icon: '🛒' },
  { value: 'professional_services', label: 'Professional Services', icon: '💼' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'government', label: 'Government', icon: '🏛️' },
  { value: 'energy', label: 'Energy & Utilities', icon: '⚡' },
  { value: 'telecommunications', label: 'Telecommunications', icon: '📡' },
  { value: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { value: 'consulting', label: 'Consulting', icon: '📊' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const

// ============ COMPANY CLASSIFICATION ============
export const COMPANY_TYPES = [
  { value: 'direct_client', label: 'Direct Client', description: 'End client with direct engagement' },
  { value: 'implementation_partner', label: 'Implementation Partner', description: 'SI or consulting firm' },
  { value: 'staffing_vendor', label: 'Staffing Vendor', description: 'Third-party staffing agency' },
] as const

export const PARTNERSHIP_TIERS = [
  { value: 'standard', label: 'Standard', color: 'gray' },
  { value: 'preferred', label: 'Preferred', color: 'blue' },
  { value: 'strategic', label: 'Strategic', color: 'gold' },
  { value: 'exclusive', label: 'Exclusive', color: 'purple' },
] as const

export const COMPANY_SEGMENTS = [
  { value: 'enterprise', label: 'Enterprise', description: 'Large corporations (1000+ employees)', icon: '🏢' },
  { value: 'mid_market', label: 'Mid-Market', description: 'Medium companies (100-1000 employees)', icon: '🏬' },
  { value: 'smb', label: 'SMB', description: 'Small/Medium businesses (10-100 employees)', icon: '🏪' },
  { value: 'startup', label: 'Startup', description: 'Early-stage companies (<10 employees)', icon: '🚀' },
] as const

export const ACCOUNT_STATUSES = [
  { value: 'prospect', label: 'Prospect', color: 'blue' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
] as const

// ============ BILLING & PAYMENT ============
export const BILLING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

export const PAYMENT_TERMS = [
  { value: '15', label: 'Net 15', days: 15 },
  { value: '30', label: 'Net 30', days: 30 },
  { value: '45', label: 'Net 45', days: 45 },
  { value: '60', label: 'Net 60', days: 60 },
  { value: '0', label: 'Due on Receipt', days: 0 },
] as const

export const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
] as const

export const INVOICE_FORMATS = [
  { value: 'standard', label: 'Standard Detailed' },
  { value: 'consolidated', label: 'Consolidated' },
  { value: 'summary', label: 'Summary Only' },
] as const

export const INVOICE_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'portal', label: 'Client Portal' },
  { value: 'mail', label: 'Physical Mail' },
  { value: 'edi', label: 'EDI' },
] as const

export const CREDIT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'suspended', label: 'Suspended', color: 'destructive' },
  { value: 'declined', label: 'Declined', color: 'destructive' },
] as const

// ============ CONTACTS ============
export const CONTACT_ROLES = [
  { value: 'primary', label: 'Primary Contact' },
  { value: 'billing', label: 'Billing Contact' },
  { value: 'executive_sponsor', label: 'Executive Sponsor' },
  { value: 'hiring_manager', label: 'Hiring Manager' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'procurement', label: 'Procurement / Legal' },
] as const

export const DECISION_AUTHORITY = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'champion', label: 'Champion' },
  { value: 'gatekeeper', label: 'Gatekeeper' },
] as const

export const INFLUENCE_LEVELS = [
  { value: 1, label: 'Very Low' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Very High' },
] as const

// ============ ADDRESSES ============
export const ADDRESS_TYPES = [
  { value: 'headquarters', label: 'Headquarters', icon: '🏢' },
  { value: 'billing', label: 'Billing Address', icon: '💳' },
  { value: 'mailing', label: 'Mailing Address', icon: '📬' },
  { value: 'office', label: 'Office / Branch', icon: '🏬' },
  { value: 'shipping', label: 'Shipping Address', icon: '📦' },
] as const

// ============ CONTRACTS ============
export const CONTRACT_TYPES = [
  { value: 'msa', label: 'Master Service Agreement' },
  { value: 'nda', label: 'Non-Disclosure Agreement' },
  { value: 'sow', label: 'Statement of Work' },
  { value: 'rate_agreement', label: 'Rate Agreement' },
  { value: 'subcontract', label: 'Subcontract' },
] as const

export const CONTRACT_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'pending_signature', label: 'Pending Signature', color: 'warning' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'expired', label: 'Expired', color: 'destructive' },
] as const

// ============ TEAM & ENGAGEMENT ============
export const CONTACT_METHODS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'slack', label: 'Slack', icon: '💬' },
  { value: 'teams', label: 'Microsoft Teams', icon: '🔷' },
  { value: 'in_person', label: 'In Person', icon: '🤝' },
] as const

export const MEETING_CADENCES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'as_needed', label: 'As Needed' },
] as const

export const SUBMISSION_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'ats', label: 'Client ATS/VMS' },
  { value: 'portal', label: 'Client Portal' },
  { value: 'direct', label: 'Direct to Hiring Manager' },
] as const

// ============ CORPORATE PROFILE ============
export const EMPLOYEE_RANGES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1001-5000', label: '1001-5000 employees' },
  { value: '5001+', label: '5001+ employees' },
] as const

export const REVENUE_RANGES = [
  { value: '<1M', label: 'Under $1M' },
  { value: '1M-10M', label: '$1M - $10M' },
  { value: '10M-50M', label: '$10M - $50M' },
  { value: '50M-100M', label: '$50M - $100M' },
  { value: '100M-500M', label: '$100M - $500M' },
  { value: '500M-1B', label: '$500M - $1B' },
  { value: '1B+', label: 'Over $1B' },
] as const

export const OWNERSHIP_TYPES = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'subsidiary', label: 'Subsidiary' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'government', label: 'Government' },
] as const

// ============ COMPLIANCE ============
export const INSURANCE_TYPES = [
  { value: 'general_liability', label: 'General Liability' },
  { value: 'professional_liability', label: 'Professional Liability (E&O)' },
  { value: 'workers_comp', label: "Workers' Compensation" },
  { value: 'cyber_liability', label: 'Cyber Liability' },
] as const

export const BACKGROUND_CHECK_LEVELS = [
  { value: 'basic', label: 'Basic (Identity + Criminal)' },
  { value: 'standard', label: 'Standard (+ Employment History)' },
  { value: 'enhanced', label: 'Enhanced (+ Education + Credit)' },
  { value: 'comprehensive', label: 'Comprehensive (Full Investigation)' },
] as const

// ============ TYPE EXPORTS ============
export type Industry = (typeof INDUSTRIES)[number]['value']
export type CompanyType = (typeof COMPANY_TYPES)[number]['value']
export type PartnershipTier = (typeof PARTNERSHIP_TIERS)[number]['value']
export type CompanySegment = (typeof COMPANY_SEGMENTS)[number]['value']
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]['value']
export type BillingFrequency = (typeof BILLING_FREQUENCIES)[number]['value']
export type PaymentTerm = (typeof PAYMENT_TERMS)[number]['value']
export type Currency = (typeof CURRENCIES)[number]['value']
export type InvoiceFormat = (typeof INVOICE_FORMATS)[number]['value']
export type InvoiceMethod = (typeof INVOICE_METHODS)[number]['value']
export type CreditStatus = (typeof CREDIT_STATUSES)[number]['value']
export type ContactRole = (typeof CONTACT_ROLES)[number]['value']
export type DecisionAuthority = (typeof DECISION_AUTHORITY)[number]['value']
export type AddressType = (typeof ADDRESS_TYPES)[number]['value']
export type ContractType = (typeof CONTRACT_TYPES)[number]['value']
export type ContractStatus = (typeof CONTRACT_STATUSES)[number]['value']
export type ContactMethod = (typeof CONTACT_METHODS)[number]['value']
export type MeetingCadence = (typeof MEETING_CADENCES)[number]['value']
export type SubmissionMethod = (typeof SUBMISSION_METHODS)[number]['value']
export type EmployeeRange = (typeof EMPLOYEE_RANGES)[number]['value']
export type RevenueRange = (typeof REVENUE_RANGES)[number]['value']
export type OwnershipType = (typeof OWNERSHIP_TYPES)[number]['value']
export type InsuranceType = (typeof INSURANCE_TYPES)[number]['value']
export type BackgroundCheckLevel = (typeof BACKGROUND_CHECK_LEVELS)[number]['value']

// ============ HELPER FUNCTIONS ============

/**
 * Get label for a constant value
 */
export function getLabel<T extends { value: string; label: string }>(
  constants: readonly T[],
  value: string | null | undefined
): string | null {
  if (!value) return null
  const found = constants.find((c) => c.value === value)
  return found?.label ?? value.replace(/_/g, ' ')
}

/**
 * Format snake_case to Title Case
 */
export function formatSnakeCase(value: string | null | undefined): string | null {
  if (!value) return null
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format currency value
 */
export function formatCurrency(
  value: string | number | null | undefined,
  currency: Currency = 'USD'
): string {
  if (value === null || value === undefined || value === '') return 'Not specified'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return 'Not specified'
  const symbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? '$'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Not specified'
  return `${value}%`
}

/**
 * Get badge variant based on status
 */
export function getStatusBadgeVariant(
  status: string | null | undefined
): 'secondary' | 'destructive' | 'success' | 'warning' {
  if (!status) return 'secondary'
  const statusLower = status.toLowerCase()

  if (['active', 'approved', 'completed'].includes(statusLower)) return 'success'
  if (['pending', 'draft', 'in_progress'].includes(statusLower)) return 'warning'
  if (['inactive', 'suspended', 'declined', 'expired', 'cancelled'].includes(statusLower))
    return 'destructive'
  return 'secondary'
}
