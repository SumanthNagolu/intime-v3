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
  TrendingUp,
  BarChart3,
  GitBranch,
  Activity,
  LayoutDashboard,
  StickyNote,
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
}

/**
 * Job sections - alternative to journey-based navigation
 * Used when user toggles to "Sections" view
 */
export const jobSections: SectionDefinition[] = [
  { id: 'overview', label: 'Job Overview', icon: FileText },
  { id: 'requirements', label: 'Requirements', icon: ListChecks },
  { id: 'pipeline', label: 'Pipeline', icon: Users, showCount: true },
  { id: 'submissions', label: 'Submissions', icon: Send, showCount: true },
  { id: 'interviews', label: 'Interviews', icon: Calendar, showCount: true },
  { id: 'offers', label: 'Offers', icon: Gift, showCount: true },
  { id: 'activities', label: 'Activities', icon: Clock },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'notes', label: 'Notes', icon: MessageSquare, showCount: true },
]

/**
 * Account sections - section-based navigation for accounts
 * (moved from AccountSectionSidebar for consistency)
 */
export const accountSections: SectionDefinition[] = [
  { id: 'overview', label: 'Account Overview', icon: Building2 },
  { id: 'contacts', label: 'Contacts', icon: Users, showCount: true },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, showCount: true },
  { id: 'placements', label: 'Placements', icon: Award, showCount: true },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'activities', label: 'Activities', icon: Clock },
  { id: 'notes', label: 'Notes', icon: MessageSquare, showCount: true },
  { id: 'meetings', label: 'Meetings', icon: Calendar, showCount: true },
  { id: 'escalations', label: 'Escalations', icon: AlertTriangle, showCount: true, alertOnCount: true },
]

/**
 * Submission sections - for future implementation
 */
export const submissionSections: SectionDefinition[] = [
  { id: 'overview', label: 'Submission Overview', icon: FileText },
  { id: 'candidate', label: 'Candidate', icon: Users },
  { id: 'interviews', label: 'Interviews', icon: Calendar, showCount: true },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, showCount: true },
  { id: 'activities', label: 'Activities', icon: Clock },
  { id: 'documents', label: 'Documents', icon: FileText },
]

/**
 * Contact sections - section-based navigation for contacts
 * Like Guidewire PolicyCenter contacts, centered on the person
 */
export const contactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Contact Overview', icon: UserCircle },
  { id: 'accounts', label: 'Accounts', icon: Building2, showCount: true },
  { id: 'submissions', label: 'Submissions', icon: Send, showCount: true },
  { id: 'activities', label: 'Activities', icon: Clock, showCount: true },
  { id: 'communications', label: 'Communications', icon: Mail, showCount: true },
  { id: 'meetings', label: 'Meetings', icon: Calendar, showCount: true },
  { id: 'notes', label: 'Notes', icon: MessageSquare, showCount: true },
]

/**
 * Campaign sections - complete 9-section navigation for campaigns
 * Guidewire-inspired workspace for campaign management from creation to completion
 */
export const campaignSections: SectionDefinition[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sequences', label: 'Sequences', icon: GitBranch, showCount: true },
  { id: 'prospects', label: 'Prospects', icon: Users, showCount: true },
  { id: 'leads', label: 'Leads', icon: Target, showCount: true },
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'history', label: 'History', icon: Clock },
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
    default:
      return []
  }
}
