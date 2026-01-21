/**
 * Lead Constants - Enterprise-grade staffing lead field options
 *
 * Single source of truth for all lead-related dropdown options, status values,
 * and field configurations. Matches the 7-section architecture in types.ts.
 */

// ============ SECTION 1: IDENTITY ============

/**
 * Lead statuses - aligned with database CHECK constraint
 * Values: new, contacted, warm, hot, cold, qualified, unqualified, converted, lost, nurture
 */
export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'blue', description: 'Fresh lead, not yet contacted' },
  { value: 'contacted', label: 'Contacted', color: 'purple', description: 'Initial outreach made' },
  { value: 'warm', label: 'Warm', color: 'amber', description: 'Engaged, showing interest' },
  { value: 'hot', label: 'Hot', color: 'orange', description: 'High interest, ready to convert' },
  { value: 'cold', label: 'Cold', color: 'gray', description: 'Low engagement, needs nurturing' },
  { value: 'qualified', label: 'Qualified', color: 'green', description: 'Meets BANT criteria' },
  { value: 'unqualified', label: 'Unqualified', color: 'red', description: 'Does not meet criteria' },
  { value: 'converted', label: 'Converted', color: 'success', description: 'Converted to opportunity/deal' },
  { value: 'lost', label: 'Lost', color: 'destructive', description: 'No longer pursuing' },
  { value: 'nurture', label: 'Nurture', color: 'teal', description: 'Long-term nurturing track' },
] as const

export const INDUSTRIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'fintech', label: 'FinTech', icon: '💳' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'finance', label: 'Finance & Banking', icon: '🏦' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'retail', label: 'Retail & E-commerce', icon: '🛒' },
  { value: 'professional_services', label: 'Professional Services', icon: '💼' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'government', label: 'Government & Public Sector', icon: '🏛️' },
  { value: 'defense', label: 'Defense & Aerospace', icon: '🛩️' },
  { value: 'energy', label: 'Energy & Utilities', icon: '⚡' },
  { value: 'telecommunications', label: 'Telecommunications', icon: '📡' },
  { value: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { value: 'consulting', label: 'Consulting', icon: '📊' },
  { value: 'logistics', label: 'Logistics & Supply Chain', icon: '🚚' },
  { value: 'life_sciences', label: 'Life Sciences & Pharma', icon: '🔬' },
  { value: 'automotive', label: 'Automotive', icon: '🚗' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees', segment: 'startup' },
  { value: '11-50', label: '11-50 employees', segment: 'small' },
  { value: '51-200', label: '51-200 employees', segment: 'small' },
  { value: '201-500', label: '201-500 employees', segment: 'mid_market' },
  { value: '501-1000', label: '501-1000 employees', segment: 'mid_market' },
  { value: '1001-5000', label: '1,001-5,000 employees', segment: 'enterprise' },
  { value: '5001-10000', label: '5,001-10,000 employees', segment: 'enterprise' },
  { value: '10001+', label: '10,000+ employees', segment: 'enterprise' },
] as const

// ============ SECTION 2: CLASSIFICATION ============

/**
 * Lead types - Staffing-specific lead categories
 */
export const LEAD_TYPES = [
  { value: 'client', label: 'Client Lead', description: 'Potential client seeking staffing services', icon: '🏢' },
  { value: 'bench_marketing', label: 'Bench Marketing', description: 'Lead from consultant marketing efforts', icon: '👤' },
  { value: 'vendor_partnership', label: 'Vendor Partnership', description: 'Potential vendor/subcontracting relationship', icon: '🤝' },
  { value: 'subcontracting', label: 'Subcontracting', description: 'Opportunity to subcontract from another vendor', icon: '📋' },
  { value: 'direct_hire', label: 'Direct Hire', description: 'Permanent placement opportunity', icon: '👔' },
  { value: 'rpo_sow', label: 'RPO/SOW', description: 'Recruitment process outsourcing or SOW project', icon: '📑' },
] as const

export const LEAD_CATEGORIES = [
  { value: 'new_business', label: 'New Business', description: 'Net new client relationship' },
  { value: 'expansion', label: 'Expansion', description: 'Expand existing relationship' },
  { value: 'reactivation', label: 'Reactivation', description: 'Re-engage dormant client' },
  { value: 'referral', label: 'Referral', description: 'Referred by existing network' },
] as const

export const OPPORTUNITY_TYPES = [
  { value: 'contract_staffing', label: 'Contract Staffing', description: 'Time & materials contractor placement' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire', description: 'Contractor with conversion option' },
  { value: 'direct_hire', label: 'Direct Hire', description: 'Permanent placement (contingency/retained)' },
  { value: 'sow_project', label: 'SOW Project', description: 'Statement of work / managed delivery' },
  { value: 'msp_enrollment', label: 'MSP Enrollment', description: 'Become approved MSP vendor' },
  { value: 'vendor_partnership', label: 'Vendor Partnership', description: 'Strategic vendor relationship' },
] as const

export const BUSINESS_MODELS = [
  { value: 'staff_augmentation', label: 'Staff Augmentation', description: 'Traditional contractor staffing' },
  { value: 'managed_services', label: 'Managed Services', description: 'Outcome-based managed teams' },
  { value: 'rpo', label: 'RPO', description: 'Recruitment process outsourcing' },
  { value: 'payrolling', label: 'Payrolling / EOR', description: 'Employer of record services' },
  { value: 'direct_sourcing', label: 'Direct Sourcing', description: 'Talent pool curation' },
] as const

export const ENGAGEMENT_TYPES = [
  { value: 'single_role', label: 'Single Role', description: 'One-off position fill' },
  { value: 'multiple_roles', label: 'Multiple Roles', description: 'Multiple positions, same time' },
  { value: 'ongoing_relationship', label: 'Ongoing Relationship', description: 'Continuous staffing needs' },
  { value: 'project_based', label: 'Project Based', description: 'Tied to specific project' },
  { value: 'msa_blanket', label: 'MSA/Blanket', description: 'Master agreement with ongoing orders' },
] as const

export const RELATIONSHIP_TYPES = [
  { value: 'direct_client', label: 'Direct Client', description: 'End client, direct relationship' },
  { value: 'prime_vendor', label: 'Prime Vendor', description: 'We are prime, they are client' },
  { value: 'subcontractor', label: 'Subcontractor', description: 'We sub to another vendor' },
  { value: 'msp_supplier', label: 'MSP Supplier', description: 'We supply through MSP' },
  { value: 'implementation_partner', label: 'Implementation Partner', description: 'SI/consulting partnership' },
] as const

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'gray', description: 'Low priority, work when time permits' },
  { value: 'medium', label: 'Medium', color: 'blue', description: 'Standard priority' },
  { value: 'high', label: 'High', color: 'amber', description: 'Prioritize above standard work' },
  { value: 'critical', label: 'Critical', color: 'red', description: 'Urgent, requires immediate attention' },
] as const

export const TEMPERATURE_LEVELS = [
  { value: 'cold', label: 'Cold', color: 'blue', description: 'Little to no engagement' },
  { value: 'warm', label: 'Warm', color: 'amber', description: 'Engaged, moderate interest' },
  { value: 'hot', label: 'Hot', color: 'red', description: 'High interest, ready to act' },
] as const

// ============ SECTION 3: REQUIREMENTS ============

/**
 * Contract types accepted for placements
 */
export const CONTRACT_TYPES = [
  { value: 'w2', label: 'W-2', description: 'Employee on our payroll' },
  { value: 'c2c', label: 'Corp-to-Corp (C2C)', description: 'Contractor via their corporation' },
  { value: '1099', label: '1099', description: 'Independent contractor' },
  { value: 'w2_benefits', label: 'W-2 with Benefits', description: 'Full benefits package' },
] as const

export const POSITION_URGENCY = [
  { value: 'immediate', label: 'Immediate', description: 'Start ASAP', color: 'red' },
  { value: 'within_30_days', label: 'Within 30 Days', description: 'Standard urgency', color: 'amber' },
  { value: 'within_60_days', label: 'Within 60 Days', description: 'Normal timeline', color: 'blue' },
  { value: 'within_90_days', label: 'Within 90 Days', description: 'Long timeline', color: 'gray' },
  { value: 'flexible', label: 'Flexible', description: 'No hard deadline', color: 'gray' },
] as const

export const ESTIMATED_DURATIONS = [
  { value: '3_months', label: '3 Months', months: 3 },
  { value: '6_months', label: '6 Months', months: 6 },
  { value: '12_months', label: '12 Months', months: 12 },
  { value: '18_months', label: '18 Months', months: 18 },
  { value: '24_months', label: '24+ Months', months: 24 },
  { value: 'indefinite', label: 'Indefinite', months: null },
] as const

export const REMOTE_POLICIES = [
  { value: 'onsite', label: 'Onsite', description: '100% in office', icon: '🏢' },
  { value: 'hybrid', label: 'Hybrid', description: 'Mix of remote and onsite', icon: '🔀' },
  { value: 'remote', label: 'Remote', description: '100% remote', icon: '🏠' },
  { value: 'flexible', label: 'Flexible', description: 'Employee choice', icon: '✨' },
] as const

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level', years: '0-2', description: '0-2 years experience' },
  { value: 'mid', label: 'Mid Level', years: '3-5', description: '3-5 years experience' },
  { value: 'senior', label: 'Senior', years: '5-8', description: '5-8 years experience' },
  { value: 'lead', label: 'Lead', years: '8-10', description: '8-10 years, leadership exp' },
  { value: 'principal', label: 'Principal/Staff', years: '10-15', description: '10-15 years, deep expertise' },
  { value: 'executive', label: 'Executive', years: '15+', description: '15+ years, C-level/VP' },
] as const

export const SECURITY_CLEARANCE_LEVELS = [
  { value: 'none', label: 'None Required', description: 'No clearance needed' },
  { value: 'public_trust', label: 'Public Trust', description: 'Basic government clearance' },
  { value: 'secret', label: 'Secret', description: 'Secret security clearance' },
  { value: 'top_secret', label: 'Top Secret', description: 'Top Secret clearance' },
  { value: 'ts_sci', label: 'TS/SCI', description: 'Top Secret/SCI clearance' },
] as const

export const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
] as const

// ============ SECTION 4: QUALIFICATION ============

/**
 * BANT scoring configuration
 */
export const BANT_COMPONENTS = [
  { key: 'budget', label: 'Budget', maxScore: 25, description: 'Has budget allocated?' },
  { key: 'authority', label: 'Authority', maxScore: 25, description: 'Decision-making authority?' },
  { key: 'need', label: 'Need', maxScore: 25, description: 'Clear business need?' },
  { key: 'timeline', label: 'Timeline', maxScore: 25, description: 'Defined timeline?' },
] as const

export const BANT_SCORE_RANGES = [
  { min: 0, max: 24, label: 'Low', color: 'red', description: 'Not ready, needs nurturing' },
  { min: 25, max: 49, label: 'Medium-Low', color: 'orange', description: 'Some potential, needs development' },
  { min: 50, max: 74, label: 'Medium-High', color: 'amber', description: 'Good potential, continue qualifying' },
  { min: 75, max: 100, label: 'High', color: 'green', description: 'Highly qualified, ready to pursue' },
] as const

export const BUDGET_RANGES = [
  { value: 'under_50k', label: 'Under $50K', minValue: 0, maxValue: 50000 },
  { value: '50k_100k', label: '$50K - $100K', minValue: 50000, maxValue: 100000 },
  { value: '100k_250k', label: '$100K - $250K', minValue: 100000, maxValue: 250000 },
  { value: '250k_500k', label: '$250K - $500K', minValue: 250000, maxValue: 500000 },
  { value: '500k_1m', label: '$500K - $1M', minValue: 500000, maxValue: 1000000 },
  { value: '1m_5m', label: '$1M - $5M', minValue: 1000000, maxValue: 5000000 },
  { value: 'over_5m', label: 'Over $5M', minValue: 5000000, maxValue: null },
] as const

export const VOLUME_POTENTIAL = [
  { value: 'single_role', label: 'Single Role', description: 'One position', placements: 1 },
  { value: 'small_volume', label: 'Small Volume', description: '2-5 positions', placements: 5 },
  { value: 'medium_volume', label: 'Medium Volume', description: '6-15 positions', placements: 15 },
  { value: 'high_volume', label: 'High Volume', description: '16-50 positions', placements: 50 },
  { value: 'enterprise', label: 'Enterprise', description: '50+ positions', placements: 100 },
] as const

export const QUALIFICATION_RESULTS = [
  { value: 'pending', label: 'Pending Review', color: 'gray', description: 'Not yet evaluated' },
  { value: 'qualified', label: 'Qualified', color: 'green', description: 'Meets qualification criteria' },
  { value: 'nurture', label: 'Nurture', color: 'amber', description: 'Not ready now, nurture long-term' },
  { value: 'disqualified', label: 'Disqualified', color: 'red', description: 'Does not meet criteria' },
] as const

export const DISQUALIFICATION_REASONS = [
  { value: 'no_budget', label: 'No Budget', description: 'Cannot afford our services' },
  { value: 'no_authority', label: 'No Authority', description: 'Not the decision maker' },
  { value: 'no_need', label: 'No Need', description: 'No actual staffing requirement' },
  { value: 'bad_timing', label: 'Bad Timing', description: 'Timeline too far out' },
  { value: 'competitor_chosen', label: 'Competitor Chosen', description: 'Went with another vendor' },
  { value: 'internal_hire', label: 'Internal Hire', description: 'Filled position internally' },
  { value: 'project_cancelled', label: 'Project Cancelled', description: 'Initiative cancelled' },
  { value: 'rate_mismatch', label: 'Rate Mismatch', description: 'Rate expectations too low' },
  { value: 'geographic_mismatch', label: 'Geographic Mismatch', description: 'Cannot service location' },
  { value: 'skill_mismatch', label: 'Skill Mismatch', description: 'Outside our expertise' },
  { value: 'compliance_issue', label: 'Compliance Issue', description: 'Cannot meet compliance requirements' },
  { value: 'other', label: 'Other', description: 'Other reason' },
] as const

export const PROBABILITY_OPTIONS = [
  { value: '10', label: '10%', description: 'Very unlikely' },
  { value: '25', label: '25%', description: 'Unlikely' },
  { value: '50', label: '50%', description: 'Possible' },
  { value: '75', label: '75%', description: 'Likely' },
  { value: '90', label: '90%', description: 'Very likely' },
] as const

// ============ SECTION 5: CLIENT PROFILE ============

/**
 * VMS (Vendor Management System) platforms
 */
export const VMS_PLATFORMS = [
  { value: 'fieldglass', label: 'SAP Fieldglass', icon: '🔷' },
  { value: 'beeline', label: 'Beeline', icon: '🐝' },
  { value: 'iqnavigator', label: 'IQNavigator (Beeline)', icon: '🧭' },
  { value: 'wand', label: 'WAND (Beeline)', icon: '✨' },
  { value: 'pontoon', label: 'Pontoon', icon: '⚓' },
  { value: 'prounlimited', label: 'PRO Unlimited', icon: '🔓' },
  { value: 'magnit', label: 'Magnit (formerly PRO Unlimited)', icon: '🧲' },
  { value: 'allegis_agile', label: 'Allegis Agile-1', icon: '🏃' },
  { value: 'vms_complete', label: 'VMS Complete', icon: '✅' },
  { value: 'emplifi', label: 'Emplifi', icon: '📊' },
  { value: 'hireright', label: 'HireRight', icon: '✓' },
  { value: 'workday', label: 'Workday', icon: '☀️' },
  { value: 'other', label: 'Other VMS', icon: '📋' },
] as const

export const VMS_ACCESS_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'gray' },
  { value: 'in_progress', label: 'In Progress', color: 'amber' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'pending_renewal', label: 'Pending Renewal', color: 'orange' },
  { value: 'suspended', label: 'Suspended', color: 'red' },
] as const

export const PROGRAM_TYPES = [
  { value: 'direct', label: 'Direct', description: 'Direct relationship with client' },
  { value: 'tier1', label: 'Tier 1', description: 'Primary vendor tier' },
  { value: 'tier2', label: 'Tier 2', description: 'Secondary vendor tier' },
  { value: 'preferred_vendor', label: 'Preferred Vendor', description: 'Preferred vendor list' },
] as const

export const MSA_STATUSES = [
  { value: 'none', label: 'No MSA', color: 'gray' },
  { value: 'draft', label: 'Draft', color: 'blue' },
  { value: 'in_negotiation', label: 'In Negotiation', color: 'amber' },
  { value: 'pending_signature', label: 'Pending Signature', color: 'orange' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'expired', label: 'Expired', color: 'red' },
] as const

export const NDA_STATUSES = [
  { value: 'none', label: 'No NDA', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'signed', label: 'Signed', color: 'green' },
] as const

export const PAYMENT_TERMS = [
  { value: 'net_15', label: 'Net 15', days: 15 },
  { value: 'net_30', label: 'Net 30', days: 30 },
  { value: 'net_45', label: 'Net 45', days: 45 },
  { value: 'net_60', label: 'Net 60', days: 60 },
  { value: 'net_90', label: 'Net 90', days: 90 },
  { value: 'due_on_receipt', label: 'Due on Receipt', days: 0 },
] as const

export const INVOICE_FORMATS = [
  { value: 'standard', label: 'Standard Detailed' },
  { value: 'consolidated', label: 'Consolidated' },
  { value: 'per_placement', label: 'Per Placement' },
  { value: 'custom', label: 'Custom Format' },
] as const

export const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'semi_monthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
] as const

export const INSURANCE_TYPES = [
  { value: 'general_liability', label: 'General Liability' },
  { value: 'professional_liability', label: 'Professional Liability (E&O)' },
  { value: 'workers_comp', label: "Workers' Compensation" },
  { value: 'cyber', label: 'Cyber Liability' },
  { value: 'umbrella', label: 'Umbrella/Excess' },
] as const

export const ACCOUNT_TIERS = [
  { value: 'standard', label: 'Standard', color: 'gray', description: 'Standard account' },
  { value: 'preferred', label: 'Preferred', color: 'blue', description: 'Preferred client' },
  { value: 'strategic', label: 'Strategic', color: 'gold', description: 'Strategic account' },
  { value: 'enterprise', label: 'Enterprise', color: 'purple', description: 'Enterprise partnership' },
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

// ============ SECTION 6: SOURCE ============

/**
 * Lead sources for attribution
 */
export const LEAD_SOURCES = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼', channel: 'social' },
  { value: 'referral', label: 'Referral', icon: '👥', channel: 'referral' },
  { value: 'cold_outreach', label: 'Cold Outreach', icon: '📞', channel: 'outbound' },
  { value: 'inbound', label: 'Inbound Inquiry', icon: '📥', channel: 'inbound' },
  { value: 'event', label: 'Event/Conference', icon: '🎤', channel: 'event' },
  { value: 'website', label: 'Website', icon: '🌐', channel: 'inbound' },
  { value: 'campaign', label: 'Marketing Campaign', icon: '📢', channel: 'marketing' },
  { value: 'job_board', label: 'Job Board', icon: '📋', channel: 'job_boards' },
  { value: 'partner', label: 'Partner', icon: '🤝', channel: 'partnership' },
  { value: 'bench_marketing', label: 'Bench Marketing', icon: '👤', channel: 'outbound' },
  { value: 'vms_rfq', label: 'VMS/RFQ', icon: '📄', channel: 'vms' },
  { value: 'other', label: 'Other', icon: '📦', channel: 'other' },
] as const

export const REFERRAL_TYPES = [
  { value: 'employee', label: 'Employee Referral' },
  { value: 'client', label: 'Client Referral' },
  { value: 'candidate', label: 'Candidate Referral' },
  { value: 'partner', label: 'Partner Referral' },
  { value: 'other', label: 'Other' },
] as const

export const REFERRAL_REWARD_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'qualified', label: 'Qualified', color: 'amber' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'not_applicable', label: 'N/A', color: 'gray' },
] as const

export const FIRST_CONTACT_METHODS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'in_person', label: 'In Person', icon: '🤝' },
  { value: 'website', label: 'Website Form', icon: '🌐' },
] as const

// ============ SECTION 7: TEAM ============

export const PREFERRED_CONTACT_METHODS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'text', label: 'Text/SMS', icon: '💬' },
] as const

export const BEST_TIMES_TO_CONTACT = [
  { value: 'morning', label: 'Morning (9am-12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm-5pm)' },
  { value: 'evening', label: 'Evening (5pm-8pm)' },
  { value: 'any', label: 'Anytime' },
] as const

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (no DST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Europe/London', label: 'GMT/BST' },
  { value: 'Europe/Paris', label: 'Central European Time' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
] as const

export const US_REGIONS = [
  { value: 'northeast', label: 'Northeast' },
  { value: 'southeast', label: 'Southeast' },
  { value: 'midwest', label: 'Midwest' },
  { value: 'southwest', label: 'Southwest' },
  { value: 'west', label: 'West' },
  { value: 'pacific', label: 'Pacific' },
] as const

// ============ TYPE EXPORTS ============

export type LeadStatus = (typeof LEAD_STATUSES)[number]['value']
export type Industry = (typeof INDUSTRIES)[number]['value']
export type CompanySize = (typeof COMPANY_SIZES)[number]['value']
export type LeadType = (typeof LEAD_TYPES)[number]['value']
export type LeadCategory = (typeof LEAD_CATEGORIES)[number]['value']
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number]['value']
export type BusinessModel = (typeof BUSINESS_MODELS)[number]['value']
export type EngagementType = (typeof ENGAGEMENT_TYPES)[number]['value']
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number]['value']
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number]['value']
export type TemperatureLevel = (typeof TEMPERATURE_LEVELS)[number]['value']
export type ContractType = (typeof CONTRACT_TYPES)[number]['value']
export type PositionUrgency = (typeof POSITION_URGENCY)[number]['value']
export type EstimatedDuration = (typeof ESTIMATED_DURATIONS)[number]['value']
export type RemotePolicy = (typeof REMOTE_POLICIES)[number]['value']
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]['value']
export type SecurityClearanceLevel = (typeof SECURITY_CLEARANCE_LEVELS)[number]['value']
export type Currency = (typeof CURRENCIES)[number]['value']
export type BudgetRange = (typeof BUDGET_RANGES)[number]['value']
export type VolumePotential = (typeof VOLUME_POTENTIAL)[number]['value']
export type QualificationResult = (typeof QUALIFICATION_RESULTS)[number]['value']
export type DisqualificationReason = (typeof DISQUALIFICATION_REASONS)[number]['value']
export type VmsPlatform = (typeof VMS_PLATFORMS)[number]['value']
export type VmsAccessStatus = (typeof VMS_ACCESS_STATUSES)[number]['value']
export type ProgramType = (typeof PROGRAM_TYPES)[number]['value']
export type MsaStatus = (typeof MSA_STATUSES)[number]['value']
export type NdaStatus = (typeof NDA_STATUSES)[number]['value']
export type PaymentTerm = (typeof PAYMENT_TERMS)[number]['value']
export type InvoiceFormat = (typeof INVOICE_FORMATS)[number]['value']
export type BillingCycle = (typeof BILLING_CYCLES)[number]['value']
export type InsuranceType = (typeof INSURANCE_TYPES)[number]['value']
export type AccountTier = (typeof ACCOUNT_TIERS)[number]['value']
export type RevenueRange = (typeof REVENUE_RANGES)[number]['value']
export type LeadSource = (typeof LEAD_SOURCES)[number]['value']
export type ReferralType = (typeof REFERRAL_TYPES)[number]['value']
export type ReferralRewardStatus = (typeof REFERRAL_REWARD_STATUSES)[number]['value']
export type FirstContactMethod = (typeof FIRST_CONTACT_METHODS)[number]['value']
export type PreferredContactMethod = (typeof PREFERRED_CONTACT_METHODS)[number]['value']
export type BestTimeToContact = (typeof BEST_TIMES_TO_CONTACT)[number]['value']
export type Timezone = (typeof TIMEZONES)[number]['value']
export type UsRegion = (typeof US_REGIONS)[number]['value']

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
  return found?.label ?? formatSnakeCase(value)
}

/**
 * Get color for a status value
 */
export function getStatusColor<T extends { value: string; color: string }>(
  constants: readonly T[],
  value: string | null | undefined
): string {
  if (!value) return 'gray'
  const found = constants.find((c) => c.value === value)
  return found?.color ?? 'gray'
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
 * Get BANT score label based on total score
 */
export function getBANTScoreLabel(score: number | null): string {
  if (score === null) return 'Not Scored'
  const range = BANT_SCORE_RANGES.find((r) => score >= r.min && score <= r.max)
  return range?.label ?? 'Unknown'
}

/**
 * Get BANT score color based on total score
 */
export function getBANTScoreColor(score: number | null): string {
  if (score === null) return 'gray'
  const range = BANT_SCORE_RANGES.find((r) => score >= r.min && score <= r.max)
  return range?.color ?? 'gray'
}

/**
 * Get status badge variant for UI
 */
export function getStatusBadgeVariant(
  status: string | null | undefined
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  if (!status) return 'default'
  const statusLower = status.toLowerCase()

  if (['qualified', 'converted', 'active', 'signed', 'approved'].includes(statusLower)) return 'success'
  if (['warm', 'engaged', 'pending', 'in_progress', 'in_negotiation', 'nurture'].includes(statusLower)) return 'warning'
  if (['unqualified', 'lost', 'disqualified', 'expired', 'suspended', 'cold'].includes(statusLower)) return 'error'
  if (['contacted', 'new'].includes(statusLower)) return 'info'
  return 'default'
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format rate as hourly/annual
 */
export function formatRate(
  min: string | null | undefined,
  max: string | null | undefined,
  currency: Currency = 'USD'
): string {
  if (!min && !max) return 'Not specified'
  const symbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? '$'
  if (min && max) return `${symbol}${min} - ${symbol}${max}/hr`
  if (min) return `${symbol}${min}+/hr`
  if (max) return `Up to ${symbol}${max}/hr`
  return 'Not specified'
}

/**
 * Get temperature from BANT score
 */
export function getTemperatureFromScore(score: number | null): TemperatureLevel {
  if (score === null || score < 40) return 'cold'
  if (score < 70) return 'warm'
  return 'hot'
}
