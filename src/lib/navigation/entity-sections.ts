import { LucideIcon } from 'lucide-react'
import {
  FileText,
  ListChecks,
  Users,
  Send,
  Calendar,
  Gift,
  Clock,
  MessageSquare,
  Building2,
  Briefcase,
  Award,
  AlertTriangle,
  UserCircle,
  Phone,
  Mail,
  Target,
  Activity,
  LayoutDashboard,
  StickyNote,
  History,
  Layers,
  TrendingDown,
  Workflow,
  BarChart3,
  MapPin,
  ClipboardList,
  ClipboardCheck,
  DollarSign,
  ShieldCheck,
  Link2,
  Files,
  CreditCard,
  Shield,
  UserCog,
  Gauge,
  UsersRound,
  Settings,
  SlidersHorizontal,
  Megaphone,
} from 'lucide-react'

/**
 * Section definition for entity detail pages
 * Sections provide Guidewire-style navigation where all info is accessible
 */
export interface SectionDefinition {
  id: string
  label: string
  icon: LucideIcon
  showCount?: boolean
  alertOnCount?: boolean // Show alert styling when count > 0
  isToolSection?: boolean // Marks section as part of the collapsible Tools group
  group?: 'main' | 'settings' | 'automation' | 'tools' | 'related' // For grouping in sidebar
  description?: string // Tooltip/description for the section
  number?: number // Step number for wizard-style navigation (1-based)
  isOverview?: boolean // True for summary/overview sections (no number)
  isRelatedData?: boolean // True for related data sections (separate group)
}

/**
 * Campaign sections - Enterprise-grade with 3 categories: Core, Related, Tools
 *
 * CORE: Campaign configuration and settings (matching wizard sections)
 *   - Overview: Campaign health dashboard with key metrics
 *   - Setup: Campaign name, type, goal, priority
 *   - Targeting: Audience source, filters, exclusions
 *   - Channels: Communication channels and sequence config
 *   - Schedule: Timing, send window, recurring settings
 *   - Budget: Budget allocation and performance targets
 *   - Team: Ownership, collaborators, approval workflow
 *   - Compliance: GDPR, CAN-SPAM, data handling
 *
 * RELATED: Campaign data and execution
 *   - Prospects: Audience management and prospect tracking
 *   - Leads: Converted prospects and lead tracking
 *   - Funnel: Visual pipeline progression visualization
 *   - Sequence: Email/LinkedIn/Phone automation workflow
 *   - Analytics: Deep performance metrics and ROI
 *
 * TOOLS: Supporting functions
 *   - Activities, Notes, Documents, History
 */
export const campaignSections: SectionDefinition[] = [
  // Core sections - Campaign configuration (matching wizard)
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    group: 'main',
    description: 'Campaign health and key metrics at a glance',
  },
  {
    id: 'setup',
    label: 'Setup',
    icon: Settings,
    group: 'main',
    description: 'Campaign name, type, goal, and priority',
  },
  {
    id: 'targeting',
    label: 'Targeting',
    icon: SlidersHorizontal,
    group: 'main',
    description: 'Audience source, filters, and exclusions',
  },
  {
    id: 'channels',
    label: 'Channels',
    icon: Megaphone,
    group: 'main',
    description: 'Communication channels and sequence configuration',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: Calendar,
    group: 'main',
    description: 'Timing, send window, and recurring settings',
  },
  {
    id: 'budget',
    label: 'Budget',
    icon: DollarSign,
    group: 'main',
    description: 'Budget allocation and performance targets',
  },
  {
    id: 'team',
    label: 'Team',
    icon: UserCog,
    group: 'main',
    description: 'Ownership, collaborators, and approval workflow',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: Shield,
    group: 'main',
    description: 'GDPR, CAN-SPAM, and data handling settings',
  },

  // Related sections - Campaign data and execution
  {
    id: 'prospects',
    label: 'Prospects',
    icon: Users,
    showCount: true,
    group: 'related',
    isRelatedData: true,
    description: 'Manage campaign audience and prospect list',
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: Target,
    showCount: true,
    group: 'related',
    isRelatedData: true,
    description: 'Track converted prospects and qualified leads',
  },
  {
    id: 'funnel',
    label: 'Funnel',
    icon: TrendingDown,
    group: 'related',
    isRelatedData: true,
    description: 'Visual pipeline showing prospect progression',
  },
  {
    id: 'sequence',
    label: 'Sequence',
    icon: Workflow,
    group: 'related',
    isRelatedData: true,
    description: 'Email, LinkedIn, and phone automation workflow',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    group: 'related',
    isRelatedData: true,
    description: 'Performance metrics, ROI, and channel analysis',
  },

  // Tool sections - Supporting functions
  {
    id: 'activities',
    label: 'Activities',
    icon: Activity,
    showCount: true,
    isToolSection: true,
    group: 'tools',
    description: 'All campaign touchpoints and interactions',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: StickyNote,
    showCount: true,
    isToolSection: true,
    group: 'tools',
    description: 'Campaign notes and observations',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    showCount: true,
    isToolSection: true,
    group: 'tools',
    description: 'Templates, reports, and attachments',
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    isToolSection: true,
    group: 'tools',
    description: 'Campaign changelog and audit trail',
  },
]

/**
 * Account sections - Wizard-matching design with numbered main sections
 *
 * MAIN SECTIONS (numbered 1-7, match wizard steps):
 *   - Summary: Dashboard overview (no number)
 *   - Identity & Classification: Company identity, registration, digital presence
 *   - Locations: Company addresses and locations
 *   - Billing & Terms: Billing entity, payment terms, PO configuration
 *   - Contacts: Company contacts and POCs
 *   - Contracts: MSA, SOW, and other agreements
 *   - Compliance: Insurance, background checks, certifications
 *   - Team: Account owner, manager, recruiter, sales lead
 *
 * RELATED DATA (unnumbered, separate group):
 *   - Jobs, Placements, Meetings, Escalations, Related Accounts
 *
 * TOOLS:
 *   - Activities, Notes, Documents, History
 */
export const accountSections: SectionDefinition[] = [
  // Summary section (overview dashboard)
  { id: 'summary', label: 'Summary', icon: LayoutDashboard, group: 'main', isOverview: true, description: 'Account health and key metrics at a glance' },

  // Main sections (numbered 1-7, match wizard steps)
  { id: 'identity', label: 'Identity & Classification', icon: Building2, group: 'main', number: 1, description: 'Company details, registration, and industry classification' },
  { id: 'locations', label: 'Locations', icon: MapPin, group: 'main', number: 2, showCount: true, description: 'Company addresses and work locations' },
  { id: 'billing', label: 'Billing & Terms', icon: CreditCard, group: 'main', number: 3, description: 'Billing entity, payment terms, and PO configuration' },
  { id: 'contacts', label: 'Contacts', icon: Users, group: 'main', number: 4, showCount: true, description: 'Company contacts and points of contact' },
  { id: 'contracts', label: 'Contracts', icon: FileText, group: 'main', number: 5, showCount: true, description: 'MSA, SOW, and other agreements' },
  { id: 'compliance', label: 'Compliance', icon: Shield, group: 'main', number: 6, description: 'Insurance, background checks, certifications' },
  { id: 'team', label: 'Team', icon: UserCog, group: 'main', number: 7, description: 'Account assignments and team members' },

  // Related data sections (unnumbered, separate group)
  { id: 'jobs', label: 'Jobs', icon: Briefcase, group: 'related', showCount: true, isRelatedData: true, description: 'Open positions at this account' },
  { id: 'placements', label: 'Placements', icon: Award, group: 'related', showCount: true, isRelatedData: true, description: 'Active and past placements' },
  { id: 'meetings', label: 'Meetings', icon: Calendar, group: 'related', showCount: true, isRelatedData: true, description: 'Scheduled and past meetings' },
  { id: 'escalations', label: 'Escalations', icon: AlertTriangle, group: 'related', showCount: true, alertOnCount: true, isRelatedData: true, description: 'Issues requiring attention' },
  { id: 'related_accounts', label: 'Related Accounts', icon: Link2, group: 'related', showCount: true, isRelatedData: true, description: 'Parent, subsidiary, and partner accounts' },

  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, group: 'tools', showCount: true, isToolSection: true, description: 'All account interactions' },
  { id: 'notes', label: 'Notes', icon: StickyNote, group: 'tools', showCount: true, isToolSection: true, description: 'Internal notes and observations' },
  { id: 'documents', label: 'Documents', icon: FileText, group: 'tools', showCount: true, isToolSection: true, description: 'Uploaded files and attachments' },
  { id: 'history', label: 'History', icon: History, group: 'tools', isToolSection: true, description: 'Audit trail and change history' },
]

/**
 * Account section groups - organized for wizard-style sidebar
 */
export const accountSectionGroups = {
  main: accountSections.filter(s => s.group === 'main' && !s.isOverview),
  overview: accountSections.filter(s => s.isOverview),
  related: accountSections.filter(s => s.isRelatedData),
  tools: accountSections.filter(s => s.isToolSection),
}

/**
 * Helper to get account sections organized by group for wizard-style sidebar
 */
export function getAccountSectionsByGroup(): {
  overviewSection: SectionDefinition | undefined
  mainSections: SectionDefinition[]
  relatedSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  return {
    overviewSection: accountSections.find(s => s.isOverview),
    mainSections: accountSections.filter(s => s.group === 'main' && !s.isOverview),
    relatedSections: accountSections.filter(s => s.isRelatedData),
    toolSections: accountSections.filter(s => s.isToolSection),
  }
}

/**
 * Job sections - Guidewire-style with main sections + tools
 * Main: Overview (consolidated), Pipeline, Submissions, Interviews, Offers
 * Tools: Activities, Notes, Documents, History
 *
 * Note: Overview now includes Requirements, Location, Hiring Team, and Client Details
 * as collapsible cards within the single Overview page.
 */
export const jobSections: SectionDefinition[] = [
  // Overview (consolidated from former Job Details, Requirements, Location, Hiring Team, Client Details)
  { id: 'overview', label: 'Overview', icon: FileText, group: 'main', description: 'Job details, requirements, location, team, and client info' },
  // Pipeline group
  { id: 'pipeline', label: 'Pipeline', icon: Layers, showCount: true, group: 'main' },
  { id: 'submissions', label: 'Submissions', icon: Send, showCount: true, group: 'main' },
  { id: 'interviews', label: 'Interviews', icon: Calendar, showCount: true, group: 'main' },
  { id: 'offers', label: 'Offers', icon: Gift, showCount: true, group: 'main' },
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true, group: 'tools' },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true, group: 'tools' },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true, group: 'tools' },
  { id: 'history', label: 'History', icon: History, isToolSection: true, group: 'tools' },
]

/**
 * Section Group definition for collapsible sidebar navigation
 */
export interface SectionGroup {
  id: string
  label: string
  sectionIds: string[]
  defaultOpen?: boolean
}

/**
 * Job section groups - organized for Guidewire-style collapsible sidebar
 * Overview is standalone at top, Pipeline has workflow sections
 */
export const jobSectionGroups: SectionGroup[] = [
  {
    id: 'overview-standalone',
    label: '', // Empty label = no group header, just the item
    sectionIds: ['overview'],
    defaultOpen: true,
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    sectionIds: ['pipeline', 'submissions', 'interviews', 'offers'],
    defaultOpen: true,
  },
]

/**
 * Tool sections for jobs - remain separate and collapsible
 */
export const jobToolSections = jobSections.filter(s => s.isToolSection)

/**
 * Helper to get job sections organized by group for sidebar rendering
 */
export function getJobSectionsByGroup(): {
  overviewSection: SectionDefinition | undefined
  mainSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  return {
    overviewSection: jobSections.find(s => s.id === 'overview'),
    mainSections: jobSections.filter(s => s.group === 'main' && s.id !== 'overview'),
    toolSections: jobSections.filter(s => s.isToolSection),
  }
}

/**
 * Contact sections - Guidewire-style with main sections + tools
 * Matches Account workspace pattern for consistency
 * Main: Summary, Accounts, Jobs, Placements, Submissions, Addresses, Meetings, Escalations, Related Contacts
 * Tools: Activities, Notes, Documents, History
 */
export const contactSections: SectionDefinition[] = [
  // Main sections
  { id: 'summary', label: 'Summary', icon: UserCircle },
  { id: 'related_contacts', label: 'Related Contacts', icon: Users, showCount: true },
  { id: 'accounts', label: 'Accounts', icon: Building2, showCount: true },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, showCount: true },
  { id: 'placements', label: 'Placements', icon: Award, showCount: true },
  { id: 'submissions', label: 'Submissions', icon: Send, showCount: true },
  { id: 'addresses', label: 'Addresses', icon: MapPin, showCount: true },
  { id: 'meetings', label: 'Meetings', icon: Calendar, showCount: true },
  { id: 'escalations', label: 'Escalations', icon: AlertTriangle, showCount: true, alertOnCount: true },
  // Tools section
  { id: 'campaigns', label: 'Campaigns', icon: Target, showCount: true, isToolSection: true },
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]

/**
 * Submission sections - Guidewire-style with main sections + tools
 * Main: Overview, Candidate (sub-object reference)
 * Tools: Interviews, Feedback, Activities, Documents, History
 */
export const submissionSections: SectionDefinition[] = [
  // Main sections
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'candidate', label: 'Candidate', icon: Users },
  // Tools section
  { id: 'interviews', label: 'Interviews', icon: Calendar, showCount: true, isToolSection: true },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, showCount: true, isToolSection: true },
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]

/**
 * Lead sections - Enterprise-grade staffing lead workspace
 *
 * 7 MAIN SECTIONS (numbered 1-7, match wizard steps):
 *   - Summary: Lead overview with KPIs (BANT Score, Engagement, Days in Pipeline, Last Contact)
 *   - 1. Identity: Contact profile and company information
 *   - 2. Classification: Lead type, opportunity type, business model, priority
 *   - 3. Requirements: Staffing requirements, rates, skills, positions
 *   - 4. Qualification: BANT scoring breakdown and staffing-specific criteria
 *   - 5. Client Profile: VMS/MSP, payment terms, insurance, compliance
 *   - 6. Source: Campaign, referral source, and channel tracking
 *   - 7. Team: Lead owner and assignment
 *
 * ADDITIONAL MAIN (unnumbered):
 *   - Engagement: Activity timeline and touchpoints
 *
 * RELATED DATA (unnumbered, collapsible):
 *   - Deals: Linked opportunities
 *   - Meetings: Scheduled and past meetings
 *
 * TOOLS (collapsible):
 *   - Activities, Notes, Documents, History
 */
export const leadSections: SectionDefinition[] = [
  // Summary section (overview dashboard) - no number
  { id: 'summary', label: 'Summary', icon: LayoutDashboard, group: 'main', isOverview: true, description: 'Lead KPIs and quick overview' },

  // Main sections (numbered 1-7, match wizard steps)
  { id: 'contact', label: 'Identity', icon: UserCircle, group: 'main', number: 1, description: 'Contact info, company, and location' },
  { id: 'classification', label: 'Classification', icon: Layers, group: 'main', number: 2, description: 'Lead type, opportunity, business model' },
  { id: 'requirements', label: 'Requirements', icon: ClipboardList, group: 'main', number: 3, description: 'Staffing requirements and rates' },
  { id: 'qualification', label: 'Qualification', icon: ClipboardCheck, group: 'main', number: 4, description: 'BANT scoring and staffing criteria' },
  { id: 'client-profile', label: 'Client Profile', icon: CreditCard, group: 'main', number: 5, description: 'VMS/MSP, payment terms, compliance' },
  { id: 'source', label: 'Source', icon: Target, group: 'main', number: 6, description: 'Lead source and attribution' },
  { id: 'team', label: 'Team', icon: UserCog, group: 'main', number: 7, description: 'Lead owner and assignment' },

  // Additional main sections (unnumbered)
  { id: 'engagement', label: 'Engagement', icon: BarChart3, showCount: true, group: 'main', description: 'Activity timeline and touchpoints' },

  // Related data sections (unnumbered, collapsible group)
  { id: 'deals', label: 'Deals', icon: DollarSign, showCount: true, group: 'related', isRelatedData: true, description: 'Associated opportunities' },
  { id: 'meetings', label: 'Meetings', icon: Calendar, showCount: true, group: 'related', isRelatedData: true, description: 'Scheduled and past meetings' },

  // Tool sections (collapsible group)
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true, group: 'tools', description: 'Lead-related activities' },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true, group: 'tools', description: 'Internal notes' },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true, group: 'tools', description: 'Attached documents' },
  { id: 'history', label: 'History', icon: History, isToolSection: true, group: 'tools', description: 'Audit trail' },
]

/**
 * Lead section groups - organized for Guidewire-style sidebar
 */
export function getLeadSectionsByGroup(): {
  overviewSection: SectionDefinition | undefined
  mainSections: SectionDefinition[]
  relatedSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  return {
    overviewSection: leadSections.find(s => s.isOverview),
    mainSections: leadSections.filter(s => s.group === 'main' && !s.isOverview),
    relatedSections: leadSections.filter(s => s.isRelatedData),
    toolSections: leadSections.filter(s => s.isToolSection),
  }
}

/**
 * Deal sections - Guidewire-style with main sections + related + tools
 *
 * MAIN: Core deal management
 *   - Overview: Deal health dashboard with KPIs
 *   - Details: Deal value, stage, probability
 *   - Stakeholders: Decision makers, influencers, blockers
 *   - Timeline: Key dates, milestones, next steps
 *   - Competitors: Competitive landscape
 *   - Proposal: Pricing, terms, scope
 *
 * RELATED DATA: Associated entities
 *   - Jobs: Associated job requisitions
 *   - Meetings: Scheduled meetings
 *
 * TOOLS: Supporting functions
 *   - Activities, Notes, Documents, History
 */
export const dealSections: SectionDefinition[] = [
  // Overview section (summary dashboard)
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'main', isOverview: true, description: 'Deal health and key metrics at a glance' },

  // Main sections
  { id: 'details', label: 'Deal Details', icon: Briefcase, group: 'main', number: 1, description: 'Value, stage, probability, and terms' },
  { id: 'stakeholders', label: 'Stakeholders', icon: Users, group: 'main', number: 2, showCount: true, description: 'Decision makers, influencers, and key contacts' },
  { id: 'timeline', label: 'Timeline', icon: Calendar, group: 'main', number: 3, description: 'Key dates, milestones, and next steps' },
  { id: 'competitors', label: 'Competitors', icon: Target, group: 'main', number: 4, description: 'Competitive landscape and positioning' },
  { id: 'proposal', label: 'Proposal', icon: FileText, group: 'main', number: 5, description: 'Pricing, terms, and scope of services' },

  // Related data sections (unnumbered, separate group)
  { id: 'jobs', label: 'Jobs', icon: Briefcase, group: 'related', showCount: true, isRelatedData: true, description: 'Associated job requisitions' },
  { id: 'meetings', label: 'Meetings', icon: Calendar, group: 'related', showCount: true, isRelatedData: true, description: 'Scheduled and past meetings' },

  // Tool sections
  { id: 'activities', label: 'Activities', icon: Activity, group: 'tools', showCount: true, isToolSection: true, description: 'All deal interactions and touchpoints' },
  { id: 'notes', label: 'Notes', icon: StickyNote, group: 'tools', showCount: true, isToolSection: true, description: 'Internal notes and observations' },
  { id: 'documents', label: 'Documents', icon: FileText, group: 'tools', showCount: true, isToolSection: true, description: 'Proposals, contracts, and attachments' },
  { id: 'history', label: 'History', icon: History, group: 'tools', isToolSection: true, description: 'Audit trail and stage history' },
]

/**
 * Deal section groups - organized for wizard-style sidebar
 */
export const dealSectionGroups = {
  main: dealSections.filter(s => s.group === 'main' && !s.isOverview),
  overview: dealSections.filter(s => s.isOverview),
  related: dealSections.filter(s => s.isRelatedData),
  tools: dealSections.filter(s => s.isToolSection),
}

/**
 * Helper to get deal sections organized by group for wizard-style sidebar
 */
export function getDealSectionsByGroup(): {
  overviewSection: SectionDefinition | undefined
  mainSections: SectionDefinition[]
  relatedSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  return {
    overviewSection: dealSections.find(s => s.isOverview),
    mainSections: dealSections.filter(s => s.group === 'main' && !s.isOverview),
    relatedSections: dealSections.filter(s => s.isRelatedData),
    toolSections: dealSections.filter(s => s.isToolSection),
  }
}

/**
 * Candidate sections - Guidewire PCF-style unified architecture
 *
 * UNIFIED PATTERN: Wizard steps (1-6) map directly to detail sections (numbered 1-6)
 * This ensures consistency between creation and editing experiences.
 *
 * MAIN SECTIONS (numbered, match wizard steps):
 *   1. Identity: Contact info, headline, summary, location
 *   2. Experience: Work history + Education
 *   3. Skills: Technical skills + Certifications
 *   4. Authorization: Visa, availability, relocation
 *   5. Compensation: Rates, employment types, work modes
 *   6. Resume: Resume upload, source tracking
 *
 * OVERVIEW (unnumbered):
 *   - Summary: Dashboard with KPIs and quick info
 *
 * RELATED DATA (unnumbered, collapsible):
 *   - Submissions, Placements, Interviews, Screening, Profiles
 *
 * TOOLS (unnumbered, collapsible):
 *   - Activities, Notes, Documents, History
 */
export const candidateSections: SectionDefinition[] = [
  // Summary section (overview dashboard, no number - detail only)
  { id: 'summary', label: 'Summary', icon: LayoutDashboard, group: 'main', isOverview: true, description: 'Candidate profile and key metrics at a glance' },

  // Main numbered sections (1-6, match wizard steps exactly)
  { id: 'identity', label: 'Identity', icon: UserCircle, group: 'main', number: 1, description: 'Contact info, headline, and professional summary' },
  { id: 'experience', label: 'Experience', icon: Briefcase, group: 'main', number: 2, description: 'Work history and education' },
  { id: 'skills', label: 'Skills', icon: Award, group: 'main', number: 3, description: 'Technical skills and certifications' },
  { id: 'authorization', label: 'Authorization', icon: Shield, group: 'main', number: 4, description: 'Work authorization, visa, and availability' },
  { id: 'compensation', label: 'Compensation', icon: DollarSign, group: 'main', number: 5, description: 'Rate preferences and employment types' },
  { id: 'resume', label: 'Resume', icon: Files, group: 'main', number: 6, showCount: true, description: 'Resume versions and source tracking' },

  // Related data sections (collapsible group, unnumbered)
  { id: 'submissions', label: 'Submissions', icon: Send, group: 'related', showCount: true, isRelatedData: true, description: 'Job submissions and pipeline' },
  { id: 'placements', label: 'Placements', icon: Award, group: 'related', showCount: true, isRelatedData: true, description: 'Placement history' },
  { id: 'interviews', label: 'Interviews', icon: Calendar, group: 'related', showCount: true, isRelatedData: true, description: 'Interview history' },
  { id: 'screening', label: 'Screening', icon: ClipboardCheck, group: 'related', showCount: true, isRelatedData: true, description: 'Screening assessments' },
  { id: 'profiles', label: 'Profiles', icon: FileText, group: 'related', showCount: true, isRelatedData: true, description: 'Marketing profiles' },

  // Tools section (collapsible group, unnumbered)
  { id: 'activities', label: 'Activities', icon: Activity, group: 'tools', showCount: true, isToolSection: true, description: 'All candidate interactions' },
  { id: 'notes', label: 'Notes', icon: StickyNote, group: 'tools', showCount: true, isToolSection: true, description: 'Internal notes and observations' },
  { id: 'documents', label: 'Documents', icon: FileText, group: 'tools', showCount: true, isToolSection: true, description: 'Uploaded files and attachments' },
  { id: 'history', label: 'History', icon: History, group: 'tools', isToolSection: true, description: 'Audit trail and change history' },
]

/**
 * Candidate section groups for sidebar rendering
 */
export const candidateSectionGroups = {
  overview: candidateSections.filter(s => s.isOverview),
  main: candidateSections.filter(s => s.group === 'main' && !s.isOverview),
  related: candidateSections.filter(s => s.isRelatedData),
  tools: candidateSections.filter(s => s.isToolSection),
}

/**
 * Helper to get candidate sections organized by group for sidebar rendering
 */
export function getCandidateSectionsByGroup(): {
  overviewSection: SectionDefinition | undefined
  mainSections: SectionDefinition[]
  relatedSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  return {
    overviewSection: candidateSections.find(s => s.isOverview),
    mainSections: candidateSections.filter(s => s.group === 'main' && !s.isOverview),
    relatedSections: candidateSections.filter(s => s.isRelatedData),
    toolSections: candidateSections.filter(s => s.isToolSection),
  }
}

/**
 * Placement sections - Guidewire-style with main sections + tools
 * Main: Overview, Timesheets, Billing
 * Tools: Activities, Notes, Documents, History
 */
export const placementSections: SectionDefinition[] = [
  // Main sections - Context-specific
  { id: 'overview', label: 'Overview', icon: Award, group: 'main', description: 'Placement summary and consultant info' },
  { id: 'location', label: 'Location', icon: MapPin, group: 'main', description: 'First day and work location' },
  { id: 'timesheets', label: 'Timesheets', icon: Clock, showCount: true, group: 'main', description: 'Weekly timesheets and hours' },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck, showCount: true, alertOnCount: true, group: 'main', description: 'Required documents and certifications' },
  // Tools section - Universal
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true, group: 'tools', description: 'Check-ins and activities' },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true, group: 'tools', description: 'Internal notes' },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true, group: 'tools', description: 'Contracts and attachments' },
  { id: 'history', label: 'History', icon: History, isToolSection: true, group: 'tools', description: 'Audit trail' },
]

/**
 * Timesheet sections - Guidewire-style with main sections + tools
 * Main: Overview, Entries, Expenses, Approvals
 * Tools: Notes, Documents, History
 */
export const timesheetSections: SectionDefinition[] = [
  // Main sections
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'entries', label: 'Entries', icon: Clock, showCount: true },
  { id: 'expenses', label: 'Expenses', icon: FileText, showCount: true },
  { id: 'approvals', label: 'Approvals', icon: ListChecks },
  // Tools section
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]

/**
 * Interview sections - Guidewire-style with main sections + tools (GW-041)
 * Main: Overview, Participants, Location, Feedback
 * Tools: Activities, Notes, Documents, History
 */
export const interviewSections: SectionDefinition[] = [
  // Main sections - Context-specific
  { id: 'overview', label: 'Overview', icon: FileText, group: 'main', description: 'Interview details and scheduling' },
  { id: 'participants', label: 'Participants', icon: Users, showCount: true, group: 'main', description: 'Interviewers and attendees' },
  { id: 'location', label: 'Location', icon: MapPin, group: 'main', description: 'Meeting location or virtual link' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, showCount: true, group: 'main', description: 'Interviewer feedback and scorecards' },
  // Tools section - Universal
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true, group: 'tools', description: 'Interview-related activities' },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true, group: 'tools', description: 'Internal notes' },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true, group: 'tools', description: 'Attached documents' },
  { id: 'history', label: 'History', icon: History, isToolSection: true, group: 'tools', description: 'Audit trail' },
]

/**
 * Offer sections - Guidewire-style with main sections + tools (GW-042)
 * Main: Overview, Terms, Negotiation, Approvals
 * Tools: Activities, Notes, Documents, History
 */
export const offerSections: SectionDefinition[] = [
  // Main sections - Context-specific
  { id: 'overview', label: 'Overview', icon: Gift, group: 'main', description: 'Offer summary and status' },
  { id: 'terms', label: 'Terms', icon: DollarSign, group: 'main', description: 'Compensation and benefits' },
  { id: 'negotiation', label: 'Negotiation', icon: MessageSquare, showCount: true, group: 'main', description: 'Counter-offers and discussions' },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck, showCount: true, alertOnCount: true, group: 'main', description: 'Rate and terms approvals' },
  // Tools section - Universal
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true, group: 'tools', description: 'Offer-related activities' },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true, group: 'tools', description: 'Internal notes' },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true, group: 'tools', description: 'Offer letters and attachments' },
  { id: 'history', label: 'History', icon: History, isToolSection: true, group: 'tools', description: 'Audit trail' },
]

/**
 * Team sections - Hublot-inspired workspace with main sections + related + tools
 *
 * MAIN SECTIONS (numbered 1-5):
 *   - Summary: Team dashboard overview (no number)
 *   - Details: Team name, description, department
 *   - Members: Team members with roles
 *   - Roles & Permissions: Access control configuration
 *   - Workload: Assignment distribution and capacity
 *   - Performance: Team metrics and KPIs
 *
 * RELATED DATA (unnumbered, collapsible):
 *   - Accounts: Assigned client accounts
 *   - Jobs: Assigned job requisitions
 *
 * TOOLS (collapsible, note: no documents for teams):
 *   - Activities, Notes, History
 */
export const teamSections: SectionDefinition[] = [
  // Summary section (overview dashboard) - no number
  { id: 'summary', label: 'Summary', icon: LayoutDashboard, group: 'main', isOverview: true, description: 'Team health and key metrics at a glance' },

  // Main sections (numbered 1-5)
  { id: 'details', label: 'Team Details', icon: UsersRound, group: 'main', number: 1, description: 'Team name, description, and department' },
  { id: 'members', label: 'Members', icon: Users, group: 'main', number: 2, showCount: true, description: 'Team members and their roles' },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield, group: 'main', number: 3, description: 'Access control and permission settings' },
  { id: 'workload', label: 'Workload', icon: Gauge, group: 'main', number: 4, description: 'Assignment distribution and capacity' },
  { id: 'performance', label: 'Performance', icon: BarChart3, group: 'main', number: 5, description: 'Team metrics and productivity KPIs' },

  // Related data sections (unnumbered, collapsible group)
  { id: 'accounts', label: 'Assigned Accounts', icon: Building2, group: 'related', showCount: true, isRelatedData: true, description: 'Client accounts assigned to this team' },
  { id: 'jobs', label: 'Assigned Jobs', icon: Briefcase, group: 'related', showCount: true, isRelatedData: true, description: 'Job requisitions assigned to this team' },

  // Tool sections (collapsible group - note: no documents for teams)
  { id: 'activities', label: 'Activities', icon: Activity, group: 'tools', showCount: true, isToolSection: true, description: 'Team activities and interactions' },
  { id: 'notes', label: 'Notes', icon: StickyNote, group: 'tools', showCount: true, isToolSection: true, description: 'Internal team notes' },
  { id: 'history', label: 'History', icon: History, group: 'tools', isToolSection: true, description: 'Team change history and audit trail' },
]

/**
 * Helper to get team sections organized by group for wizard-style sidebar
 */
export function getTeamSectionsByGroup(): {
  overviewSection: SectionDefinition | undefined
  mainSections: SectionDefinition[]
  relatedSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  return {
    overviewSection: teamSections.find(s => s.isOverview),
    mainSections: teamSections.filter(s => s.group === 'main' && !s.isOverview),
    relatedSections: teamSections.filter(s => s.isRelatedData),
    toolSections: teamSections.filter(s => s.isToolSection),
  }
}

/**
 * Helper to get sections by entity type
 */
export function getSectionsForEntity(entityType: string): SectionDefinition[] {
  switch (entityType) {
    case 'job':
      return jobSections
    case 'account':
      return accountSections
    case 'submission':
      return submissionSections
    case 'contact':
      return contactSections
    case 'campaign':
      return campaignSections
    case 'lead':
      return leadSections
    case 'deal':
      return dealSections
    case 'candidate':
      return candidateSections
    case 'placement':
      return placementSections
    case 'timesheet':
      return timesheetSections
    case 'interview':
      return interviewSections
    case 'offer':
      return offerSections
    case 'team':
      return teamSections
    default:
      return []
  }
}

/**
 * Helper to split sections into main sections and tool sections
 * Used by sidebar components to render the collapsible Tools group
 */
export function getSectionsByGroup(entityType: string): {
  mainSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  const sections = getSectionsForEntity(entityType)
  return {
    mainSections: sections.filter(s => !s.isToolSection),
    toolSections: sections.filter(s => s.isToolSection),
  }
}

/**
 * Helper to get campaign sections organized by group
 * Returns sections grouped for enterprise sidebar rendering: Core, Related, Tools
 */
export function getCampaignSectionsByGroup(): {
  coreSections: SectionDefinition[]
  relatedSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  return {
    coreSections: campaignSections.filter(s => s.group === 'main'),
    relatedSections: campaignSections.filter(s => s.group === 'related'),
    toolSections: campaignSections.filter(s => s.group === 'tools'),
  }
}

/**
 * Common tool sections used across journey entities
 * Journey entities show workflow steps in sidebar, with these tools below
 */
export const commonToolSections: SectionDefinition[] = [
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]

// ============================================================================
// HUBLOT-INSPIRED CONTACT SECTIONS (Category-Based Model)
// ============================================================================
// Contact sections vary by category (person or company) - Matches Account workspace patterns

/**
 * Contact category type - determines which sections are shown
 */
export type ContactCategory = 'person' | 'company'

/**
 * Universal tool sections - ALWAYS visible on ALL contacts
 */
export const universalContactToolSections: SectionDefinition[] = [
  { id: 'activities', label: 'Activities', icon: Activity, group: 'tools', showCount: true, isToolSection: true, description: 'All interactions and touchpoints' },
  { id: 'notes', label: 'Notes', icon: StickyNote, group: 'tools', showCount: true, isToolSection: true, description: 'Internal team notes' },
  { id: 'documents', label: 'Documents', icon: FileText, group: 'tools', showCount: true, isToolSection: true, description: 'Attached files and documents' },
  { id: 'history', label: 'History', icon: History, group: 'tools', isToolSection: true, description: 'Complete audit trail' },
]

// ============================================================================
// PERSON CONTACT SECTIONS (Hublot-inspired Workspace)
// ============================================================================
/**
 * Person contact sections - Matches Account workspace pattern with numbered main sections
 *
 * MAIN SECTIONS (numbered 1-5):
 *   - Summary: Dashboard overview (no number)
 *   - Profile: Personal details, photo, preferred contact method
 *   - Employment: Current employer, title, work history
 *   - Social: LinkedIn, GitHub, portfolio links
 *   - Skills: Skills, certifications, languages
 *   - Preferences: Work preferences, availability, rates
 *
 * RELATED DATA (unnumbered, collapsible):
 *   - Accounts, Submissions, Placements, Meetings
 *
 * TOOLS (collapsible):
 *   - Activities, Notes, Documents, History
 */
export const personContactSections: SectionDefinition[] = [
  // Summary section (overview dashboard) - no number
  { id: 'summary', label: 'Summary', icon: LayoutDashboard, group: 'main', isOverview: true, description: 'Contact profile and key metrics at a glance' },

  // Main sections (numbered 1-5)
  { id: 'profile', label: 'Profile', icon: UserCircle, group: 'main', number: 1, description: 'Personal details, photo, preferred contact method' },
  { id: 'employment', label: 'Employment', icon: Briefcase, group: 'main', number: 2, description: 'Current employer, title, work history' },
  { id: 'social', label: 'Social Profiles', icon: Link2, group: 'main', number: 3, description: 'LinkedIn, GitHub, portfolio links' },
  { id: 'skills', label: 'Skills & Expertise', icon: Award, group: 'main', number: 4, showCount: true, description: 'Skills, certifications, languages' },
  { id: 'preferences', label: 'Preferences', icon: ClipboardList, group: 'main', number: 5, description: 'Work preferences, availability, rates' },

  // Related data sections (unnumbered, collapsible group)
  { id: 'accounts', label: 'Accounts', icon: Building2, group: 'related', showCount: true, isRelatedData: true, description: 'Associated companies' },
  { id: 'submissions', label: 'Submissions', icon: Send, group: 'related', showCount: true, isRelatedData: true, description: 'Job applications' },
  { id: 'placements', label: 'Placements', icon: Award, group: 'related', showCount: true, isRelatedData: true, description: 'Work history' },
  { id: 'meetings', label: 'Meetings', icon: Calendar, group: 'related', showCount: true, isRelatedData: true, description: 'Scheduled meetings' },

  // Tool sections (collapsible group)
  ...universalContactToolSections,
]

// ============================================================================
// COMPANY CONTACT SECTIONS (Hublot-inspired Workspace)
// ============================================================================
/**
 * Company contact sections - Matches Account workspace pattern
 *
 * MAIN SECTIONS (numbered 1-5):
 *   - Summary: Dashboard overview (no number)
 *   - Profile: Legal name, DBA, founded year
 *   - Classification: Industry, segment, tier
 *   - Locations: Office addresses
 *   - People: Key contacts at this company
 *   - Hierarchy: Parent company, subsidiaries
 *
 * RELATED DATA (unnumbered, collapsible):
 *   - Jobs, Placements, Contracts
 *
 * TOOLS (collapsible):
 *   - Activities, Notes, Documents, History
 */
export const companyContactSections: SectionDefinition[] = [
  // Summary section (overview dashboard) - no number
  { id: 'summary', label: 'Summary', icon: LayoutDashboard, group: 'main', isOverview: true, description: 'Company profile and key metrics at a glance' },

  // Main sections (numbered 1-5)
  { id: 'profile', label: 'Company Profile', icon: Building2, group: 'main', number: 1, description: 'Legal name, DBA, founded year' },
  { id: 'classification', label: 'Classification', icon: Target, group: 'main', number: 2, description: 'Industry, segment, tier' },
  { id: 'locations', label: 'Locations', icon: MapPin, group: 'main', number: 3, showCount: true, description: 'Office addresses' },
  { id: 'people', label: 'Key People', icon: Users, group: 'main', number: 4, showCount: true, description: 'Contacts at this company' },
  { id: 'hierarchy', label: 'Corporate Hierarchy', icon: Layers, group: 'main', number: 5, description: 'Parent company, subsidiaries' },

  // Related data sections (unnumbered, collapsible group)
  { id: 'jobs', label: 'Jobs', icon: Briefcase, group: 'related', showCount: true, isRelatedData: true, description: 'Open positions' },
  { id: 'placements', label: 'Placements', icon: Award, group: 'related', showCount: true, isRelatedData: true, description: 'Active and past placements' },
  { id: 'contracts', label: 'Contracts', icon: FileText, group: 'related', showCount: true, isRelatedData: true, description: 'MSA and agreements' },

  // Tool sections (collapsible group)
  ...universalContactToolSections,
]

/**
 * Helper to get contact sections organized by group for Hublot-style sidebar
 * Matches getAccountSectionsByGroup() pattern
 */
export function getContactSectionsByCategory(category: ContactCategory): {
  overviewSection: SectionDefinition | undefined
  mainSections: SectionDefinition[]
  relatedSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  const sections = category === 'company' ? companyContactSections : personContactSections
  return {
    overviewSection: sections.find(s => s.isOverview),
    mainSections: sections.filter(s => s.group === 'main' && !s.isOverview),
    relatedSections: sections.filter(s => s.isRelatedData),
    toolSections: sections.filter(s => s.isToolSection),
  }
}

// ============================================================================
// LEGACY SUBTYPE-BASED CONTACT SECTIONS (Backward Compatibility)
// ============================================================================
// Contact sections vary by subtype: candidate, employee, client_poc, vendor_poc, prospect, lead

/**
 * Universal sections - ALWAYS visible on ALL contact subtypes
 * These are the Guidewire-style "tool sections" that every contact has
 */
export const universalContactSections: SectionDefinition[] = [
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true, description: 'All interactions and touchpoints' },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true, description: 'Internal team notes' },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true, description: 'Attached files and documents' },
  { id: 'history', label: 'History', icon: History, isToolSection: true, description: 'Complete audit trail' },
]

/**
 * Candidate subtype sections
 */
export const candidateContactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Overview', icon: UserCircle, group: 'main', description: 'Profile and professional details' },
  { id: 'experience', label: 'Experience', icon: Briefcase, group: 'main', description: 'Work history and skills' },
  { id: 'pipeline', label: 'Pipeline', icon: Layers, showCount: true, group: 'main', description: 'Active job submissions' },
  { id: 'placements', label: 'Placements', icon: Award, showCount: true, group: 'main', description: 'Completed placements' },
]

/**
 * Lead subtype sections
 */
export const leadContactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Overview', icon: Target, group: 'main', description: 'Lead profile and company info' },
  { id: 'qualification', label: 'Qualification', icon: ListChecks, group: 'main', description: 'BANT scoring and qualification' },
  { id: 'engagement', label: 'Engagement', icon: BarChart3, group: 'main', description: 'Engagement metrics and scoring' },
  { id: 'deals', label: 'Deals', icon: Briefcase, showCount: true, group: 'main', description: 'Associated deal opportunities' },
]

/**
 * Prospect subtype sections
 */
export const prospectContactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Overview', icon: UserCircle, group: 'main', description: 'Contact and company details' },
  { id: 'campaigns', label: 'Campaigns', icon: Layers, showCount: true, group: 'main', description: 'Campaign enrollments' },
  { id: 'qualification', label: 'Qualification', icon: ListChecks, group: 'main', description: 'Lead qualification checklist' },
  { id: 'engagement', label: 'Engagement', icon: BarChart3, group: 'main', description: 'Engagement score and signals' },
]

/**
 * Client POC subtype sections
 */
export const clientPocContactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Overview', icon: UserCircle, group: 'main', description: 'Contact details and role' },
  { id: 'account', label: 'Account', icon: Building2, group: 'main', description: 'Associated client account' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, showCount: true, group: 'main', description: 'Jobs they manage' },
  { id: 'communications', label: 'Communications', icon: Mail, showCount: true, group: 'main', description: 'Email and call history' },
]

/**
 * Vendor POC subtype sections
 */
export const vendorPocContactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Overview', icon: UserCircle, group: 'main', description: 'Contact details' },
  { id: 'vendor', label: 'Vendor', icon: Building2, group: 'main', description: 'Associated vendor company' },
  { id: 'consultants', label: 'Consultants', icon: Users, showCount: true, group: 'main', description: 'Managed consultants' },
  { id: 'communications', label: 'Communications', icon: Mail, showCount: true, group: 'main', description: 'Communication history' },
]

/**
 * Employee subtype sections
 */
export const employeeContactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Overview', icon: UserCircle, group: 'main', description: 'Employee profile' },
  { id: 'team', label: 'Team', icon: Users, group: 'main', description: 'Team and reporting' },
  { id: 'performance', label: 'Performance', icon: TrendingDown, group: 'main', description: 'Metrics and goals' },
]

/**
 * General contact sections (fallback)
 */
export const generalContactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Overview', icon: UserCircle, group: 'main', description: 'Contact details' },
  { id: 'accounts', label: 'Accounts', icon: Building2, showCount: true, group: 'main', description: 'Associated accounts' },
]

/**
 * Get sections for a contact based on subtype
 * Returns context-specific sections + universal tool sections
 */
export type ContactSubtype = 'candidate' | 'employee' | 'client_poc' | 'vendor_poc' | 'prospect' | 'lead' | 'general'

export function getContactSectionsBySubtype(subtype: ContactSubtype): SectionDefinition[] {
  let contextSections: SectionDefinition[] = []
  
  switch (subtype) {
    case 'candidate':
      contextSections = candidateContactSections
      break
    case 'employee':
      contextSections = employeeContactSections
      break
    case 'client_poc':
      contextSections = clientPocContactSections
      break
    case 'vendor_poc':
      contextSections = vendorPocContactSections
      break
    case 'prospect':
      contextSections = prospectContactSections
      break
    case 'lead':
      contextSections = leadContactSections
      break
    case 'general':
    default:
      contextSections = generalContactSections
      break
  }
  
  // Always append universal sections
  return [...contextSections, ...universalContactSections]
}

/**
 * Get contact sections organized by group for sidebar rendering
 */
export function getContactSectionsByGroup(subtype: ContactSubtype): {
  mainSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  const sections = getContactSectionsBySubtype(subtype)
  return {
    mainSections: sections.filter(s => !s.isToolSection),
    toolSections: sections.filter(s => s.isToolSection),
  }
}
