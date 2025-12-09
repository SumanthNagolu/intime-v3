import { LucideIcon } from 'lucide-react'

// ============================================
// ENTITY SIDEBAR CONFIGURATION
// ============================================

export interface SidebarSectionConfig {
  id: string
  label: string
  icon: LucideIcon
  showCount?: boolean
  alertOnCount?: boolean
  isToolSection?: boolean // Part of collapsible Tools group
}

export interface SidebarJourneyStepConfig {
  id: string
  label: string
  icon?: LucideIcon
  description?: string
  completedStatuses: string[]
  activeStatuses: string[]
  defaultTab?: string
}

export interface SidebarActionConfig {
  id: string
  label: string
  icon: LucideIcon
  actionType: 'navigate' | 'dialog' | 'mutation'
  href?: string // For navigate - supports :id placeholder
  dialogId?: string // For dialog
  variant?: 'default' | 'destructive'
  visibleStatuses?: string[] // Only show for these statuses
  hiddenStatuses?: string[] // Hide for these statuses
}

export interface EntitySidebarConfig {
  // Entity info
  entityType: string
  basePath: string // e.g., '/employee/recruiting/accounts'
  backLabel?: string // e.g., 'All Accounts'
  
  // Navigation mode
  navigationMode: 'sections' | 'journey'
  
  // For section-based navigation
  sections?: SidebarSectionConfig[]
  
  // For journey-based navigation  
  journeySteps?: SidebarJourneyStepConfig[]
  
  // Quick actions (shown at bottom)
  quickActions?: SidebarActionConfig[]
  
  // Status config for badges
  statusConfig?: Record<string, {
    label: string
    color: string
  }>
}

