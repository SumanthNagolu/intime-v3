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
  group?: 'main' | 'automation' | 'tools' // For grouping in sidebar
  description?: string // Tooltip/description for the section
}

/**
 * Campaign sections - Enterprise-grade with main sections + automation + tools
 *
 * MAIN: Core campaign management
 *   - Overview: Campaign health dashboard with key metrics
 *   - Prospects: Audience management and prospect tracking
 *   - Leads: Converted prospects and lead tracking
 *   - Funnel: Visual pipeline progression visualization
 *
 * AUTOMATION: Outreach execution and analysis
 *   - Sequence: Email/LinkedIn/Phone automation workflow
 *   - Analytics: Deep performance metrics and ROI
 *
 * TOOLS: Supporting functions
 *   - Activities, Notes, Documents, History
 */
export const campaignSections: SectionDefinition[] = [
  // Main sections - Core campaign management
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    group: 'main',
    description: 'Campaign health and key metrics at a glance',
  },
  {
    id: 'prospects',
    label: 'Prospects',
    icon: Users,
    showCount: true,
    group: 'main',
    description: 'Manage campaign audience and prospect list',
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: Target,
    showCount: true,
    group: 'main',
    description: 'Track converted prospects and qualified leads',
  },
  {
    id: 'funnel',
    label: 'Funnel',
    icon: TrendingDown,
    group: 'main',
    description: 'Visual pipeline showing prospect progression',
  },

  // Automation sections - Outreach execution
  {
    id: 'sequence',
    label: 'Sequence',
    icon: Workflow,
    group: 'automation',
    description: 'Email, LinkedIn, and phone automation workflow',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    group: 'automation',
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
 * Account sections - Guidewire-style with main sections + tools
 * Main: Overview, Contacts, Jobs, Placements (sub-object collections)
 * Tools: Activities, Notes, Documents, History
 */
export const accountSections: SectionDefinition[] = [
  // Main sections
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'contacts', label: 'Contacts', icon: Users, showCount: true },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, showCount: true },
  { id: 'placements', label: 'Placements', icon: Award, showCount: true },
  { id: 'addresses', label: 'Addresses', icon: MapPin, showCount: true },
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'meetings', label: 'Meetings', icon: Calendar, showCount: true, isToolSection: true },
  { id: 'escalations', label: 'Escalations', icon: AlertTriangle, showCount: true, alertOnCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]

/**
 * Job sections - Guidewire-style with main sections + tools
 * Main: Overview, Requirements, Pipeline, Submissions, Interviews, Offers (sub-object collections)
 * Tools: Activities, Notes, Documents, History
 */
export const jobSections: SectionDefinition[] = [
  // Main sections
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'requirements', label: 'Requirements', icon: ListChecks },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'pipeline', label: 'Pipeline', icon: Layers, showCount: true },
  { id: 'submissions', label: 'Submissions', icon: Send, showCount: true },
  { id: 'interviews', label: 'Interviews', icon: Calendar, showCount: true },
  { id: 'offers', label: 'Offers', icon: Gift, showCount: true },
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]

/**
 * Contact sections - Guidewire-style with main sections + tools
 * Main: Overview, Accounts, Submissions (sub-object collections)
 * Tools: Activities, Communications, Meetings, Notes, History
 */
export const contactSections: SectionDefinition[] = [
  // Main sections
  { id: 'overview', label: 'Overview', icon: UserCircle },
  { id: 'accounts', label: 'Accounts', icon: Building2, showCount: true },
  { id: 'submissions', label: 'Submissions', icon: Send, showCount: true },
  { id: 'addresses', label: 'Addresses', icon: MapPin, showCount: true },
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'communications', label: 'Communications', icon: Mail, showCount: true, isToolSection: true },
  { id: 'meetings', label: 'Meetings', icon: Calendar, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
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
 * Lead sections - Guidewire-style with main sections + tools
 * Main: Overview
 * Tools: Activities, Notes, Documents, History
 */
export const leadSections: SectionDefinition[] = [
  // Main sections
  { id: 'overview', label: 'Overview', icon: Target },
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]

/**
 * Deal sections - Guidewire-style with main sections + tools
 * Main: Overview, Contacts (stakeholders)
 * Tools: Activities, Notes, Documents, History
 */
export const dealSections: SectionDefinition[] = [
  // Main sections
  { id: 'overview', label: 'Overview', icon: Briefcase },
  { id: 'contacts', label: 'Contacts', icon: Users, showCount: true },
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]

/**
 * Candidate sections - Guidewire-style with main sections + tools
 * Main: Profile, Submissions, Placements
 * Tools: Activities, Notes, Documents, History
 */
export const candidateSections: SectionDefinition[] = [
  // Main sections
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'submissions', label: 'Submissions', icon: Send, showCount: true },
  { id: 'placements', label: 'Placements', icon: Award, showCount: true },
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]

/**
 * Placement sections - Guidewire-style with main sections + tools
 * Main: Overview, Timesheets, Billing
 * Tools: Activities, Notes, Documents, History
 */
export const placementSections: SectionDefinition[] = [
  // Main sections
  { id: 'overview', label: 'Overview', icon: Award },
  { id: 'timesheets', label: 'Timesheets', icon: Clock, showCount: true },
  { id: 'location', label: 'Location', icon: MapPin },
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
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
 * Returns sections grouped for enterprise sidebar rendering
 */
export function getCampaignSectionsByGroup(): {
  mainSections: SectionDefinition[]
  automationSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  return {
    mainSections: campaignSections.filter(s => s.group === 'main'),
    automationSections: campaignSections.filter(s => s.group === 'automation'),
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
// UNIFIED CONTACT SECTIONS (Guidewire-Inspired Subtype Model)
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
