import { LucideIcon } from 'lucide-react'
import { EntityType } from './entity-navigation.types'

/**
 * Types for the unified list view sidebar pattern.
 *
 * Structure for Entity List Pages:
 * 1. WorkspaceToggle (My Space / Team Space)
 * 2. Quick Create Button
 * 3. VIEWS section (always visible, max 3 items)
 * 4. STATUS/STAGE section (collapsible, entity-specific)
 * 5. RECENT section (grouped by time)
 *
 * Structure for Module Pages (Admin, HR, Finance):
 * 1. Module sections (collapsible groups)
 * 2. Navigation items within each section
 */

export interface ListViewItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  /** Query param to filter by (e.g., "status=active") */
  filterParam?: string
  badge?: number | 'new'
}

export interface StatusFilterItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  badge?: number
}

export interface StatusSectionConfig {
  /** Section label - "Status" or "Stage" */
  label: string
  /** Whether section is open by default */
  defaultOpen?: boolean
  /** Filter items in this section */
  items: StatusFilterItem[]
}

/**
 * Navigation item for module sidebars (Admin, HR, Finance)
 */
export interface ModuleNavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  badge?: number | 'new'
  /** For tree items (like Groups in Admin) */
  children?: ModuleNavItem[]
}

/**
 * Collapsible section for module sidebars
 */
export interface ModuleSectionConfig {
  id: string
  label: string
  defaultOpen?: boolean
  items: ModuleNavItem[]
}

/**
 * Configuration for module sidebars (Admin, HR, Finance)
 * These have a different structure than entity list pages
 */
export interface ModuleSidebarConfig {
  id: string
  title: string
  icon: LucideIcon
  basePath: string
  /** Quick links shown at top of dropdown (max 3) */
  quickLinks: ModuleNavItem[]
  /** Collapsible sections in sidebar */
  sections: ModuleSectionConfig[]
  /** Actions shown at bottom of dropdown */
  actions?: ModuleNavItem[]
}

export interface ListViewSidebarConfig {
  id: string
  title: string
  icon: LucideIcon
  entityType?: EntityType
  basePath: string
  createPath?: string
  createLabel?: string
  /** Main views (max 3): All, My, Key filter */
  views: ListViewItem[]
  /** Collapsible status/stage section */
  statusSection?: StatusSectionConfig
  /** Whether to show workspace toggle at top */
  showWorkspaceToggle?: boolean
  /** Legacy navigation links for non-entity sections */
  navLinks?: Array<{
    id: string
    label: string
    icon: LucideIcon
    href: string
  }>
  /** Search placeholder for dropdown */
  searchPlaceholder?: string
}

/**
 * Configuration for entity dropdown in top navigation.
 * Derived from ListViewSidebarConfig for consistency.
 */
export interface EntityDropdownConfig {
  /** Search placeholder */
  searchPlaceholder: string
  /** Quick view links (same as sidebar VIEWS) */
  views: ListViewItem[]
  /** Create action */
  createLabel: string
  createPath: string
}
