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
}

/**
 * Campaign sections - Guidewire-style with main sections + tools
 * Main: Dashboard, Prospects, Leads (sub-object collections)
 * Tools: Activities, Notes, Documents, History
 */
export const campaignSections: SectionDefinition[] = [
  // Main sections
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'prospects', label: 'Prospects', icon: Users, showCount: true },
  { id: 'leads', label: 'Leads', icon: Target, showCount: true },
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
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
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
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
 * Common tool sections used across journey entities
 * Journey entities show workflow steps in sidebar, with these tools below
 */
export const commonToolSections: SectionDefinition[] = [
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]
