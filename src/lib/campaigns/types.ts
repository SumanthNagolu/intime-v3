/**
 * Campaign Unified Section Types
 *
 * Enterprise-grade campaign types for staffing/recruiting industry.
 * Following the Account pattern where the same section components are used
 * in both wizard (create mode) and workspace (view/edit modes).
 */

// =============================================================================
// CORE TYPES
// =============================================================================

export type SectionMode = 'create' | 'view' | 'edit'

/**
 * Campaign Types - Staffing Industry Specific
 *
 * Categories:
 * - Client-focused: acquiring/retaining clients
 * - Candidate-focused: sourcing/engaging talent
 * - Marketing: brand and event promotion
 */
export type CampaignType =
  // Client Acquisition & Engagement
  | 'client_outreach'        // New client acquisition
  | 'account_expansion'      // Upsell to existing clients
  | 'client_reengagement'    // Reactivate dormant clients
  // Candidate Sourcing & Engagement
  | 'candidate_sourcing'     // Find new candidates
  | 'bench_marketing'        // Market available consultants
  | 'passive_sourcing'       // Engage passive candidates
  | 'talent_nurturing'       // Long-term candidate engagement
  | 'job_marketing'          // Promote specific job openings
  // Marketing & Events
  | 'referral_campaign'      // Generate referrals
  | 'event_promotion'        // Webinars, job fairs, conferences
  | 'brand_awareness'        // Thought leadership, brand building
  // Internal Operations
  | 'compliance_outreach'    // Compliance updates to consultants
  | 'training_campaign'      // Training announcements

/**
 * Campaign Goals - Measurable outcomes
 */
export type CampaignGoal =
  // Revenue Goals
  | 'generate_qualified_leads'
  | 'book_discovery_meetings'
  | 'acquire_new_clients'
  | 'expand_existing_accounts'
  // Recruiting Goals
  | 'fill_job_orders'
  | 'expand_candidate_pool'
  | 'market_bench_consultants'
  | 'increase_submissions'
  | 'generate_referrals'
  // Engagement Goals
  | 'reactivate_dormant_contacts'
  | 'drive_event_registrations'
  | 'build_brand_awareness'
  | 'improve_response_rates'
  // Compliance Goals
  | 'ensure_compliance_training'
  | 'collect_updated_documents'

/**
 * Audience Source - Where prospects come from
 */
export type AudienceSource =
  | 'new_prospects'          // Build from scratch with filters
  | 'existing_leads'         // Current leads in pipeline
  | 'dormant_accounts'       // Inactive accounts
  | 'bench_consultants'      // Available consultants on bench
  | 'candidate_pool'         // Existing candidate database
  | 'job_applicants'         // Applicants for specific jobs
  | 'saved_search'           // Saved search criteria
  | 'import_list'            // CSV import or integration

/**
 * Communication Channels
 */
export type CampaignChannel =
  | 'email'
  | 'linkedin'
  | 'phone'
  | 'sms'
  | 'event'
  | 'direct_mail'
  | 'job_board'              // Job board postings
  | 'referral'               // Referral requests

/**
 * Campaign Priority
 */
export type CampaignPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * Days of week for send windows
 */
export type SendDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/**
 * Work Authorization Types for candidate targeting
 */
export type WorkAuthorization =
  | 'us_citizen'
  | 'green_card'
  | 'h1b'
  | 'h1b_transfer'
  | 'opt'
  | 'cpt'
  | 'ead'
  | 'tn_visa'
  | 'l1_visa'
  | 'gc_ead'
  | 'other'

/**
 * Client Tier for targeting
 */
export type ClientTier = 'strategic' | 'key' | 'standard' | 'prospect' | 'vms_vendor'

/**
 * Service Type for client campaigns
 */
export type ServiceType = 'contract' | 'contract_to_hire' | 'permanent' | 'sow' | 'managed_services'

// =============================================================================
// SECTION DATA TYPES
// =============================================================================

/**
 * Setup Section - Campaign identity and goals (Step 1)
 */
export interface CampaignSetupSectionData {
  name: string
  campaignType: CampaignType | ''
  goal: CampaignGoal | ''
  priority: CampaignPriority
  description: string
  tags: string[]
}

export const DEFAULT_SETUP_DATA: CampaignSetupSectionData = {
  name: '',
  campaignType: '',
  goal: '',
  priority: 'normal',
  description: '',
  tags: [],
}

/**
 * Targeting Section - Audience criteria and filters (Step 2)
 * Supports both client and candidate targeting
 */
export interface CampaignTargetingSectionData {
  audienceSource: AudienceSource | ''
  // Client Targeting
  industries: string[]
  companySizes: string[]
  regions: string[]
  clientTiers: ClientTier[]
  serviceTypes: ServiceType[]
  // Candidate Targeting
  targetTitles: string[]
  targetSkills: string[]
  experienceLevels: string[]
  workAuthorizations: WorkAuthorization[]
  certifications: string[]
  // Bench-specific
  benchOnly: boolean
  availableWithinDays: number | null
  // Exclusions
  excludeExistingClients: boolean
  excludeRecentlyContacted: number
  excludeCompetitors: boolean
  excludeDncList: boolean
}

export const DEFAULT_TARGETING_DATA: CampaignTargetingSectionData = {
  audienceSource: '',
  industries: [],
  companySizes: [],
  regions: [],
  clientTiers: [],
  serviceTypes: [],
  targetTitles: [],
  targetSkills: [],
  experienceLevels: [],
  workAuthorizations: [],
  certifications: [],
  benchOnly: false,
  availableWithinDays: null,
  excludeExistingClients: false,
  excludeRecentlyContacted: 90,
  excludeCompetitors: true,
  excludeDncList: true,
}

/**
 * Channels Section - Communication channels and sequence config (Step 3)
 */
export interface CampaignChannelsSectionData {
  channels: CampaignChannel[]
  sequenceTemplateIds: string[]
  // Email sequence config
  emailSteps: number
  emailDaysBetween: number
  // LinkedIn sequence config
  linkedinSteps: number
  linkedinDaysBetween: number
  // Phone sequence config
  phoneSteps: number
  phoneDaysBetween: number
  // Automation settings
  stopOnReply: boolean
  stopOnBooking: boolean
  stopOnApplication: boolean
  dailyLimit: number
  // A/B Testing
  enableAbTesting: boolean
  abSplitPercentage: number
}

export const DEFAULT_CHANNELS_DATA: CampaignChannelsSectionData = {
  channels: [],
  sequenceTemplateIds: [],
  emailSteps: 3,
  emailDaysBetween: 3,
  linkedinSteps: 2,
  linkedinDaysBetween: 5,
  phoneSteps: 1,
  phoneDaysBetween: 7,
  stopOnReply: true,
  stopOnBooking: true,
  stopOnApplication: true,
  dailyLimit: 100,
  enableAbTesting: false,
  abSplitPercentage: 50,
}

/**
 * Schedule Section - Timing configuration (Step 4)
 */
export interface CampaignScheduleSectionData {
  startDate: string
  endDate: string
  launchImmediately: boolean
  // Send Window
  sendWindowStart: string  // HH:mm format
  sendWindowEnd: string    // HH:mm format
  sendDays: SendDay[]
  timezone: string
  // Recurring
  isRecurring: boolean
  recurringInterval: 'daily' | 'weekly' | 'monthly' | ''
}

export const DEFAULT_SCHEDULE_DATA: CampaignScheduleSectionData = {
  startDate: '',
  endDate: '',
  launchImmediately: false,
  sendWindowStart: '09:00',
  sendWindowEnd: '17:00',
  sendDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  timezone: 'America/New_York',
  isRecurring: false,
  recurringInterval: '',
}

/**
 * Budget & Targets Section - Financial and performance targets (Step 5)
 */
export interface CampaignBudgetSectionData {
  // Budget
  budgetTotal: string
  budgetCurrency: string
  // Standard Targets
  targetContacts: string
  targetResponses: string
  targetLeads: string
  targetMeetings: string
  targetRevenue: string
  // Staffing-Specific Targets
  targetSubmissions: string
  targetInterviews: string
  targetPlacements: string
  // Expected Rates
  expectedResponseRate: string
  expectedConversionRate: string
}

export const DEFAULT_BUDGET_DATA: CampaignBudgetSectionData = {
  budgetTotal: '',
  budgetCurrency: 'USD',
  targetContacts: '500',
  targetResponses: '50',
  targetLeads: '25',
  targetMeetings: '10',
  targetRevenue: '',
  targetSubmissions: '20',
  targetInterviews: '10',
  targetPlacements: '5',
  expectedResponseRate: '10',
  expectedConversionRate: '20',
}

/**
 * Team Assignment Section - Ownership and collaboration (Step 6)
 */
export interface CampaignTeamSectionData {
  ownerId: string
  teamId: string
  collaboratorIds: string[]
  // Approval
  requiresApproval: boolean
  approverIds: string[]
  // Notifications
  notifyOnResponse: boolean
  notifyOnConversion: boolean
  notifyOnCompletion: boolean
}

export const DEFAULT_TEAM_DATA: CampaignTeamSectionData = {
  ownerId: '',
  teamId: '',
  collaboratorIds: [],
  requiresApproval: false,
  approverIds: [],
  notifyOnResponse: true,
  notifyOnConversion: true,
  notifyOnCompletion: true,
}

/**
 * Compliance Section - Regulatory settings (Step 7)
 */
export interface CampaignComplianceSectionData {
  // Standard Compliance
  gdpr: boolean
  canSpam: boolean
  casl: boolean
  ccpa: boolean
  // Email Requirements
  includeUnsubscribe: boolean
  includePhysicalAddress: boolean
  // DNC Handling
  respectDncList: boolean
  respectPreviousOptOuts: boolean
  // Data Handling
  collectConsent: boolean
  dataRetentionDays: number
}

export const DEFAULT_COMPLIANCE_DATA: CampaignComplianceSectionData = {
  gdpr: true,
  canSpam: true,
  casl: true,
  ccpa: true,
  includeUnsubscribe: true,
  includePhysicalAddress: true,
  respectDncList: true,
  respectPreviousOptOuts: true,
  collectConsent: false,
  dataRetentionDays: 365,
}

// =============================================================================
// OPTION CONSTANTS
// =============================================================================

/**
 * Campaign Type Options - Grouped by category
 */
export const CAMPAIGN_TYPE_OPTIONS: Array<{
  value: CampaignType
  label: string
  description: string
  category: 'client' | 'candidate' | 'marketing' | 'internal'
}> = [
  // Client-focused
  {
    value: 'client_outreach',
    label: 'Client Outreach',
    description: 'Acquire new client accounts',
    category: 'client',
  },
  {
    value: 'account_expansion',
    label: 'Account Expansion',
    description: 'Upsell services to existing clients',
    category: 'client',
  },
  {
    value: 'client_reengagement',
    label: 'Client Re-engagement',
    description: 'Reactivate dormant client accounts',
    category: 'client',
  },
  // Candidate-focused
  {
    value: 'candidate_sourcing',
    label: 'Candidate Sourcing',
    description: 'Find and engage new candidates',
    category: 'candidate',
  },
  {
    value: 'bench_marketing',
    label: 'Bench Marketing',
    description: 'Market available consultants to clients',
    category: 'candidate',
  },
  {
    value: 'passive_sourcing',
    label: 'Passive Sourcing',
    description: 'Engage passive candidates not actively looking',
    category: 'candidate',
  },
  {
    value: 'talent_nurturing',
    label: 'Talent Nurturing',
    description: 'Long-term engagement with talent pool',
    category: 'candidate',
  },
  {
    value: 'job_marketing',
    label: 'Job Marketing',
    description: 'Promote specific job openings',
    category: 'candidate',
  },
  // Marketing
  {
    value: 'referral_campaign',
    label: 'Referral Campaign',
    description: 'Generate referrals from network',
    category: 'marketing',
  },
  {
    value: 'event_promotion',
    label: 'Event Promotion',
    description: 'Promote webinars, job fairs, conferences',
    category: 'marketing',
  },
  {
    value: 'brand_awareness',
    label: 'Brand Awareness',
    description: 'Build thought leadership and brand',
    category: 'marketing',
  },
  // Internal
  {
    value: 'compliance_outreach',
    label: 'Compliance Outreach',
    description: 'Send compliance updates to consultants',
    category: 'internal',
  },
  {
    value: 'training_campaign',
    label: 'Training Campaign',
    description: 'Training and certification announcements',
    category: 'internal',
  },
]

/**
 * Campaign Goal Options - Grouped by category
 */
export const CAMPAIGN_GOAL_OPTIONS: Array<{
  value: CampaignGoal
  label: string
  category: 'revenue' | 'recruiting' | 'engagement' | 'compliance'
}> = [
  // Revenue Goals
  { value: 'generate_qualified_leads', label: 'Generate Qualified Leads', category: 'revenue' },
  { value: 'book_discovery_meetings', label: 'Book Discovery Meetings', category: 'revenue' },
  { value: 'acquire_new_clients', label: 'Acquire New Clients', category: 'revenue' },
  { value: 'expand_existing_accounts', label: 'Expand Existing Accounts', category: 'revenue' },
  // Recruiting Goals
  { value: 'fill_job_orders', label: 'Fill Job Orders', category: 'recruiting' },
  { value: 'expand_candidate_pool', label: 'Expand Candidate Pool', category: 'recruiting' },
  { value: 'market_bench_consultants', label: 'Market Bench Consultants', category: 'recruiting' },
  { value: 'increase_submissions', label: 'Increase Submissions', category: 'recruiting' },
  { value: 'generate_referrals', label: 'Generate Referrals', category: 'recruiting' },
  // Engagement Goals
  { value: 'reactivate_dormant_contacts', label: 'Reactivate Dormant Contacts', category: 'engagement' },
  { value: 'drive_event_registrations', label: 'Drive Event Registrations', category: 'engagement' },
  { value: 'build_brand_awareness', label: 'Build Brand Awareness', category: 'engagement' },
  { value: 'improve_response_rates', label: 'Improve Response Rates', category: 'engagement' },
  // Compliance Goals
  { value: 'ensure_compliance_training', label: 'Ensure Compliance Training', category: 'compliance' },
  { value: 'collect_updated_documents', label: 'Collect Updated Documents', category: 'compliance' },
]

/**
 * Audience Source Options
 */
export const AUDIENCE_SOURCE_OPTIONS: Array<{
  value: AudienceSource
  label: string
  description: string
  forType: 'client' | 'candidate' | 'both'
}> = [
  {
    value: 'new_prospects',
    label: 'New Prospects',
    description: 'Build a new list from scratch using filters',
    forType: 'both',
  },
  {
    value: 'existing_leads',
    label: 'Existing Leads',
    description: 'Target leads already in your pipeline',
    forType: 'both',
  },
  {
    value: 'dormant_accounts',
    label: 'Dormant Accounts',
    description: 'Re-engage accounts with no recent activity',
    forType: 'client',
  },
  {
    value: 'bench_consultants',
    label: 'Bench Consultants',
    description: 'Available consultants ready for placement',
    forType: 'candidate',
  },
  {
    value: 'candidate_pool',
    label: 'Candidate Pool',
    description: 'Existing candidates in your database',
    forType: 'candidate',
  },
  {
    value: 'job_applicants',
    label: 'Job Applicants',
    description: 'Applicants for specific job openings',
    forType: 'candidate',
  },
  {
    value: 'saved_search',
    label: 'Saved Search',
    description: 'Use a previously saved search criteria',
    forType: 'both',
  },
  {
    value: 'import_list',
    label: 'Import List',
    description: 'Upload a CSV or connect to external source',
    forType: 'both',
  },
]

/**
 * Industry Options (expanded for staffing)
 */
export const INDUSTRY_OPTIONS = [
  'Technology & Software',
  'Financial Services',
  'Healthcare & Life Sciences',
  'Manufacturing',
  'Retail & E-commerce',
  'Professional Services',
  'Government & Public Sector',
  'Defense & Aerospace',
  'Telecommunications',
  'Energy & Utilities',
  'Education',
  'Transportation & Logistics',
  'Media & Entertainment',
  'Real Estate',
  'Insurance',
  'Pharmaceuticals',
  'Automotive',
  'Hospitality',
  'Non-Profit',
  'Other',
]

/**
 * Company Size Options
 */
export const COMPANY_SIZE_OPTIONS = [
  { value: 'startup', label: 'Startup (1-10)' },
  { value: 'small', label: 'Small (11-50)' },
  { value: 'medium', label: 'Medium (51-200)' },
  { value: 'mid_market', label: 'Mid-Market (201-1000)' },
  { value: 'enterprise', label: 'Enterprise (1001-5000)' },
  { value: 'large_enterprise', label: 'Large Enterprise (5000+)' },
]

/**
 * Region Options (expanded)
 */
export const REGION_OPTIONS = [
  { value: 'us_northeast', label: 'US - Northeast' },
  { value: 'us_southeast', label: 'US - Southeast' },
  { value: 'us_midwest', label: 'US - Midwest' },
  { value: 'us_southwest', label: 'US - Southwest' },
  { value: 'us_west', label: 'US - West' },
  { value: 'canada', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'europe_west', label: 'Western Europe' },
  { value: 'europe_east', label: 'Eastern Europe' },
  { value: 'india', label: 'India' },
  { value: 'asia_pacific', label: 'Asia Pacific' },
  { value: 'latam', label: 'Latin America' },
  { value: 'mea', label: 'Middle East & Africa' },
  { value: 'remote', label: 'Remote / Global' },
]

/**
 * Client Tier Options
 */
export const CLIENT_TIER_OPTIONS: Array<{
  value: ClientTier
  label: string
  description: string
}> = [
  { value: 'strategic', label: 'Strategic', description: 'Top-tier strategic accounts' },
  { value: 'key', label: 'Key', description: 'Key accounts with growth potential' },
  { value: 'standard', label: 'Standard', description: 'Standard active accounts' },
  { value: 'prospect', label: 'Prospect', description: 'Potential new clients' },
  { value: 'vms_vendor', label: 'VMS Vendor', description: 'Vendor management system partners' },
]

/**
 * Service Type Options
 */
export const SERVICE_TYPE_OPTIONS: Array<{
  value: ServiceType
  label: string
}> = [
  { value: 'contract', label: 'Contract (Temporary)' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire' },
  { value: 'permanent', label: 'Permanent (Direct Hire)' },
  { value: 'sow', label: 'Statement of Work' },
  { value: 'managed_services', label: 'Managed Services' },
]

/**
 * Experience Level Options
 */
export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'junior', label: 'Junior (2-4 years)' },
  { value: 'mid', label: 'Mid-Level (4-7 years)' },
  { value: 'senior', label: 'Senior (7-10 years)' },
  { value: 'lead', label: 'Lead/Principal (10-15 years)' },
  { value: 'executive', label: 'Executive (15+ years)' },
]

/**
 * Work Authorization Options
 */
export const WORK_AUTHORIZATION_OPTIONS: Array<{
  value: WorkAuthorization
  label: string
}> = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card (Permanent Resident)' },
  { value: 'h1b', label: 'H1B Visa' },
  { value: 'h1b_transfer', label: 'H1B Transfer' },
  { value: 'opt', label: 'OPT (F1 Student)' },
  { value: 'cpt', label: 'CPT (F1 Student)' },
  { value: 'ead', label: 'EAD' },
  { value: 'gc_ead', label: 'GC EAD' },
  { value: 'tn_visa', label: 'TN Visa (NAFTA)' },
  { value: 'l1_visa', label: 'L1 Visa' },
  { value: 'other', label: 'Other Work Authorization' },
]

/**
 * Channel Options
 */
export const CHANNEL_OPTIONS: Array<{
  value: CampaignChannel
  label: string
  description: string
  icon: string
}> = [
  {
    value: 'email',
    label: 'Email',
    description: 'Automated email sequences',
    icon: 'Mail',
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    description: 'LinkedIn outreach and InMail',
    icon: 'Linkedin',
  },
  {
    value: 'phone',
    label: 'Phone',
    description: 'Direct phone outreach with call scripts',
    icon: 'Phone',
  },
  {
    value: 'sms',
    label: 'SMS',
    description: 'Text message campaigns',
    icon: 'MessageSquare',
  },
  {
    value: 'event',
    label: 'Events',
    description: 'Event invitations and follow-ups',
    icon: 'Calendar',
  },
  {
    value: 'direct_mail',
    label: 'Direct Mail',
    description: 'Physical mail campaigns',
    icon: 'Send',
  },
  {
    value: 'job_board',
    label: 'Job Boards',
    description: 'Post to job boards',
    icon: 'Briefcase',
  },
  {
    value: 'referral',
    label: 'Referral',
    description: 'Request referrals from network',
    icon: 'Users',
  },
]

/**
 * Send Day Options
 */
export const SEND_DAY_OPTIONS: Array<{
  value: SendDay
  label: string
  shortLabel: string
}> = [
  { value: 'mon', label: 'Monday', shortLabel: 'Mon' },
  { value: 'tue', label: 'Tuesday', shortLabel: 'Tue' },
  { value: 'wed', label: 'Wednesday', shortLabel: 'Wed' },
  { value: 'thu', label: 'Thursday', shortLabel: 'Thu' },
  { value: 'fri', label: 'Friday', shortLabel: 'Fri' },
  { value: 'sat', label: 'Saturday', shortLabel: 'Sat' },
  { value: 'sun', label: 'Sunday', shortLabel: 'Sun' },
]

/**
 * Timezone Options (common US timezones)
 */
export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European Time' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
]

/**
 * Priority Options
 */
export const PRIORITY_OPTIONS: Array<{
  value: CampaignPriority
  label: string
  color: string
}> = [
  { value: 'low', label: 'Low', color: 'charcoal' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'high', label: 'High', color: 'amber' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
]

/**
 * Currency Options
 */
export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
]

/**
 * Common IT Skills for filtering
 */
export const COMMON_SKILLS = [
  'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js',
  '.NET', 'C#', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'DevOps', 'CI/CD',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'Machine Learning', 'AI', 'Data Science', 'Data Engineering', 'ETL',
  'SAP', 'Salesforce', 'ServiceNow', 'Workday', 'Oracle', 'PeopleSoft',
  'Agile', 'Scrum', 'Project Management', 'Business Analysis', 'Product Management',
  'Cybersecurity', 'Network Engineering', 'Cloud Architecture', 'Solution Architecture',
]

/**
 * Common Certifications for filtering
 */
export const COMMON_CERTIFICATIONS = [
  'AWS Certified Solutions Architect',
  'AWS Certified Developer',
  'Azure Administrator',
  'Azure Solutions Architect',
  'GCP Professional Cloud Architect',
  'Kubernetes Administrator (CKA)',
  'PMP',
  'Scrum Master (CSM)',
  'CISSP',
  'CompTIA Security+',
  'Salesforce Administrator',
  'Salesforce Developer',
  'SAP Certified',
  'ServiceNow Certified',
  'ITIL',
  'Six Sigma',
]
