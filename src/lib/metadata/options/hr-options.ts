/**
 * HR Options Registry
 *
 * Consolidated options for all HR domain enums.
 * Maps to hr.ts schema enums for consistency.
 */

// ==========================================
// EMPLOYEE STATUS & TYPE
// ==========================================

export const HR_EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'onboarding', label: 'Onboarding', color: 'yellow' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'on_leave', label: 'On Leave', color: 'orange' },
  { value: 'terminated', label: 'Terminated', color: 'red' },
] as const;

export const HR_EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'fte', label: 'Full-Time', color: 'blue' },
  { value: 'contractor', label: 'Contractor', color: 'purple' },
  { value: 'intern', label: 'Intern', color: 'cyan' },
  { value: 'part_time', label: 'Part-Time', color: 'gray' },
] as const;

export const HR_WORK_MODE_OPTIONS = [
  { value: 'on_site', label: 'On-Site', icon: 'Building2' },
  { value: 'remote', label: 'Remote', icon: 'Home' },
  { value: 'hybrid', label: 'Hybrid', icon: 'Building' },
] as const;

export const HR_SALARY_TYPE_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'annual', label: 'Annual' },
] as const;

// ==========================================
// DOCUMENT STATUS
// ==========================================

export const HR_DOCUMENT_TYPE_OPTIONS = [
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'contract', label: 'Contract' },
  { value: 'i9', label: 'I-9' },
  { value: 'w4', label: 'W-4' },
  { value: 'tax_form', label: 'Tax Form' },
  { value: 'nda', label: 'NDA' },
  { value: 'handbook_ack', label: 'Handbook Acknowledgment' },
  { value: 'performance_review', label: 'Performance Review' },
  { value: 'termination', label: 'Termination' },
  { value: 'other', label: 'Other' },
] as const;

export const HR_DOCUMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'expired', label: 'Expired', color: 'orange' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
] as const;

// ==========================================
// ONBOARDING
// ==========================================

export const HR_ONBOARDING_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'gray' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const HR_TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'skipped', label: 'Skipped', color: 'gray' },
] as const;

export const HR_TASK_CATEGORY_OPTIONS = [
  { value: 'paperwork', label: 'Paperwork', icon: 'FileText' },
  { value: 'it_setup', label: 'IT Setup', icon: 'Laptop' },
  { value: 'training', label: 'Training', icon: 'GraduationCap' },
  { value: 'orientation', label: 'Orientation', icon: 'Compass' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
] as const;

// ==========================================
// TIME OFF
// ==========================================

export const HR_TIME_OFF_TYPE_OPTIONS = [
  { value: 'pto', label: 'PTO', color: 'blue' },
  { value: 'sick', label: 'Sick Leave', color: 'orange' },
  { value: 'personal', label: 'Personal', color: 'purple' },
  { value: 'bereavement', label: 'Bereavement', color: 'gray' },
  { value: 'jury_duty', label: 'Jury Duty', color: 'cyan' },
  { value: 'parental', label: 'Parental Leave', color: 'pink' },
  { value: 'unpaid', label: 'Unpaid Leave', color: 'yellow' },
] as const;

export const HR_TIME_OFF_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'denied', label: 'Denied', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
] as const;

// ==========================================
// BENEFITS
// ==========================================

export const HR_BENEFIT_TYPE_OPTIONS = [
  { value: 'health', label: 'Health Insurance', icon: 'Heart' },
  { value: 'dental', label: 'Dental Insurance', icon: 'Smile' },
  { value: 'vision', label: 'Vision Insurance', icon: 'Eye' },
  { value: '401k', label: '401(k)', icon: 'PiggyBank' },
  { value: 'life', label: 'Life Insurance', icon: 'Shield' },
  { value: 'disability', label: 'Disability Insurance', icon: 'UserCheck' },
  { value: 'hsa', label: 'HSA', icon: 'Wallet' },
  { value: 'fsa', label: 'FSA', icon: 'CreditCard' },
] as const;

export const HR_COVERAGE_LEVEL_OPTIONS = [
  { value: 'employee', label: 'Employee Only' },
  { value: 'employee_spouse', label: 'Employee + Spouse' },
  { value: 'employee_children', label: 'Employee + Children' },
  { value: 'family', label: 'Family' },
] as const;

export const HR_BENEFIT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'terminated', label: 'Terminated', color: 'red' },
] as const;

export const HR_RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'domestic_partner', label: 'Domestic Partner' },
  { value: 'other', label: 'Other' },
] as const;

// ==========================================
// COMPLIANCE
// ==========================================

export const HR_COMPLIANCE_TYPE_OPTIONS = [
  { value: 'federal', label: 'Federal', color: 'blue' },
  { value: 'state', label: 'State', color: 'purple' },
  { value: 'local', label: 'Local', color: 'cyan' },
] as const;

export const HR_COMPLIANCE_FREQUENCY_OPTIONS = [
  { value: 'once', label: 'One-Time' },
  { value: 'annual', label: 'Annual' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

export const HR_COMPLIANCE_APPLIES_TO_OPTIONS = [
  { value: 'all', label: 'All Employees' },
  { value: 'fte', label: 'Full-Time Only' },
  { value: 'contractor', label: 'Contractors Only' },
] as const;

export const HR_COMPLIANCE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
  { value: 'exempt', label: 'Exempt', color: 'gray' },
] as const;

export const HR_I9_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'section1_complete', label: 'Section 1 Complete', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'expired', label: 'Expired', color: 'red' },
] as const;

// ==========================================
// PERFORMANCE
// ==========================================

export const HR_GOAL_CATEGORY_OPTIONS = [
  { value: 'business', label: 'Business Goals', color: 'blue' },
  { value: 'development', label: 'Development Goals', color: 'purple' },
  { value: 'behavioral', label: 'Behavioral Goals', color: 'cyan' },
] as const;

export const HR_GOAL_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'gray' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const HR_FEEDBACK_TYPE_OPTIONS = [
  { value: 'strength', label: 'Strength', color: 'green' },
  { value: 'improvement', label: 'Area for Improvement', color: 'orange' },
  { value: 'comment', label: 'General Comment', color: 'gray' },
] as const;

export const HR_RATING_OPTIONS = [
  { value: 1, label: '1 - Needs Improvement', color: 'red' },
  { value: 2, label: '2 - Below Expectations', color: 'orange' },
  { value: 3, label: '3 - Meets Expectations', color: 'yellow' },
  { value: 4, label: '4 - Exceeds Expectations', color: 'blue' },
  { value: 5, label: '5 - Outstanding', color: 'green' },
] as const;

// ==========================================
// CURRENCY
// ==========================================

export const HR_CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'CAD', label: 'CAD ($)', symbol: '$' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
] as const;

// ==========================================
// CITIZENSHIP (I-9)
// ==========================================

export const HR_CITIZENSHIP_STATUS_OPTIONS = [
  { value: 'citizen', label: 'U.S. Citizen' },
  { value: 'noncitizen_national', label: 'Noncitizen National' },
  { value: 'lpr', label: 'Lawful Permanent Resident' },
  { value: 'alien_authorized', label: 'Alien Authorized to Work' },
] as const;

// ==========================================
// PROMOTION READINESS
// ==========================================

export const HR_PROMOTION_READINESS_OPTIONS = [
  { value: 'ready_now', label: 'Ready Now', color: 'green' },
  { value: 'ready_in_1_year', label: 'Ready in 1 Year', color: 'blue' },
  { value: 'ready_in_2_years', label: 'Ready in 2+ Years', color: 'yellow' },
  { value: 'not_applicable', label: 'Not Applicable', color: 'gray' },
] as const;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get label for an option value
 */
export function getOptionLabel<T extends { value: unknown; label: string }>(
  options: readonly T[],
  value: T['value']
): string {
  const option = options.find((o) => o.value === value);
  return option?.label ?? String(value);
}

/**
 * Get color for an option value (if available)
 */
export function getOptionColor<T extends { value: unknown; color?: string }>(
  options: readonly T[],
  value: T['value']
): string | undefined {
  const option = options.find((o) => o.value === value);
  return option && 'color' in option ? option.color : undefined;
}

/**
 * Get icon for an option value (if available)
 */
export function getOptionIcon<T extends { value: unknown; icon?: string }>(
  options: readonly T[],
  value: T['value']
): string | undefined {
  const option = options.find((o) => o.value === value);
  return option && 'icon' in option ? option.icon : undefined;
}
