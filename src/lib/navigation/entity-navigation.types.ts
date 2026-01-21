import { LucideIcon } from 'lucide-react'
import { SectionDefinition, getSectionsByGroup as getSectionsByGroupInternal } from './entity-sections'

// Re-export section types for convenience
export type { SectionDefinition }
export { getSectionsByGroupInternal as getSectionsByGroup }

// Entity types supported in the system
export type EntityType =
  | 'job'
  | 'candidate'
  | 'account'
  | 'company'
  | 'contact'
  | 'submission'
  | 'interview'
  | 'offer'
  | 'placement'
  | 'lead'
  | 'deal'
  | 'campaign'
  | 'invoice'
  | 'pay_run'
  | 'timesheet'
  | 'team'

// Navigation style for entity types
// - 'journey': Sequential workflow steps (jobs, submissions)
// - 'sections': Section-based navigation (accounts, deals, leads)
export type NavigationStyle = 'journey' | 'sections'

// Map entity types to their navigation style
export const ENTITY_NAVIGATION_STYLES: Record<EntityType, NavigationStyle> = {
  job: 'sections',
  candidate: 'sections',
  submission: 'journey',
  interview: 'sections',
  offer: 'sections',
  placement: 'journey',
  account: 'sections',
  company: 'sections',
  contact: 'sections',
  deal: 'sections',
  lead: 'sections',
  campaign: 'sections',
  invoice: 'sections',
  pay_run: 'journey',
  timesheet: 'sections',
  team: 'sections',
}

// Entity journey step definition
export interface EntityJourneyStep {
  id: string
  label: string
  icon: LucideIcon
  description?: string
  // Which entity statuses map to this step being current/complete
  activeStatuses: string[]
  completedStatuses: string[]
  // Optional: tab to show when on this step
  defaultTab?: string
}

// Entity journey configuration
export interface EntityJourneyConfig {
  entityType: EntityType
  steps: EntityJourneyStep[]
  // Quick actions available in sidebar
  quickActions: EntityQuickAction[]
}

// Quick action in entity sidebar
export interface EntityQuickAction {
  id: string
  label: string
  icon: LucideIcon
  variant?: 'default' | 'destructive' | 'outline'
  // Action handler receives entity ID
  actionType: 'dialog' | 'navigate' | 'mutation'
  dialogId?: string  // For dialog actions
  href?: string      // For navigate actions (can include :id placeholder)
  // Optional: Only show when entity is in these statuses
  showForStatuses?: string[]
  // Optional: Hide when entity is in these statuses
  hideForStatuses?: string[]
}

// Top navigation entity tab
export interface EntityNavTab {
  id: string
  label: string
  entityType: EntityType
  icon: LucideIcon
  // Default href when clicking on the tab (used when no recent entity exists)
  defaultHref?: string
  dropdown: EntityNavDropdownItem[]
}

// Dropdown item in entity tab
export interface EntityNavDropdownItem {
  id: string
  label: string
  icon?: LucideIcon
  href?: string
  type: 'link' | 'recent' | 'divider' | 'search'
  badge?: string | number | boolean
  placeholder?: string  // For search type
}

// Current navigation context state
export interface EntityNavigationState {
  // Current entity being viewed (null if on list/dashboard)
  currentEntity: {
    type: EntityType
    id: string
    name: string
    status: string
    subtitle?: string
  } | null
  // Current journey step (derived from entity status)
  currentStep: string | null
  // Recent entities per type (for dropdowns)
  recentEntities: Record<EntityType, RecentEntity[]>
}

export interface RecentEntity {
  id: string
  name: string
  subtitle?: string
  viewedAt: Date
}

// Entity base paths for URL construction
export const ENTITY_BASE_PATHS: Record<EntityType, string> = {
  job: '/employee/recruiting/jobs',
  candidate: '/employee/recruiting/candidates',
  account: '/employee/recruiting/accounts',
  company: '/employee/companies',
  contact: '/employee/contacts',
  submission: '/employee/recruiting/submissions',
  interview: '/employee/recruiting/interviews',
  offer: '/employee/recruiting/offers',
  placement: '/employee/recruiting/placements',
  lead: '/employee/crm/leads',
  deal: '/employee/crm/deals',
  campaign: '/employee/crm/campaigns',
  invoice: '/employee/finance/invoices',
  pay_run: '/employee/finance/payroll',
  timesheet: '/employee/recruiting/timesheets',
  team: '/employee/settings/teams',
}

// Helper to get entity URL
export function getEntityUrl(type: EntityType, id: string): string {
  return `${ENTITY_BASE_PATHS[type]}/${id}`
}

// Helper to replace :id placeholder in href
export function resolveHref(href: string, entityId: string): string {
  return href.replace(':id', entityId)
}
