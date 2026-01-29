import {
  User,
  Tags,
  Shield,
  ShieldCheck,
  UserCog,
  MapPin,
  Award,
  Lock,
  type LucideIcon,
} from 'lucide-react'

/**
 * User Workspace Tab Definitions
 *
 * 8-tab structure for user management:
 * 1. Basics - Name, email, phone, avatar
 * 2. Attributes - Custom attributes
 * 3. Access - Role, pod, group, manager
 * 4. Roles - System role details/permissions
 * 5. Profile - Extended profile data
 * 6. Region - Geographic assignments
 * 7. Authority - Approval/spending limits
 * 8. Security - 2FA, password, sessions, login history
 */

export interface UserTab {
  id: string
  label: string
  icon: LucideIcon
  description: string
  /** Fields required for this tab to be considered complete in wizard mode */
  requiredFields?: string[]
}

export const USER_TABS: UserTab[] = [
  {
    id: 'basics',
    label: 'Basics',
    icon: User,
    description: 'Name, email, phone, avatar',
    requiredFields: ['email', 'first_name', 'last_name'],
  },
  {
    id: 'attributes',
    label: 'Attributes',
    icon: Tags,
    description: 'Custom attributes',
  },
  {
    id: 'access',
    label: 'Access',
    icon: Shield,
    description: 'Role, pod, group, manager',
    requiredFields: ['role_id'],
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: ShieldCheck,
    description: 'System role details and permissions',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserCog,
    description: 'Extended profile data',
  },
  {
    id: 'region',
    label: 'Region',
    icon: MapPin,
    description: 'Geographic assignments',
  },
  {
    id: 'authority',
    label: 'Authority',
    icon: Award,
    description: 'Approval and spending limits',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Lock,
    description: '2FA, password, sessions',
  },
] as const

export type UserTabId = (typeof USER_TABS)[number]['id']

/**
 * Get tab by ID
 */
export function getTabById(id: string): UserTab | undefined {
  return USER_TABS.find((tab) => tab.id === id)
}

/**
 * Get tab index
 */
export function getTabIndex(id: string): number {
  return USER_TABS.findIndex((tab) => tab.id === id)
}

/**
 * Get next tab (for wizard navigation)
 */
export function getNextTab(currentId: string): UserTab | undefined {
  const index = getTabIndex(currentId)
  if (index === -1 || index >= USER_TABS.length - 1) return undefined
  return USER_TABS[index + 1]
}

/**
 * Get previous tab (for wizard navigation)
 */
export function getPrevTab(currentId: string): UserTab | undefined {
  const index = getTabIndex(currentId)
  if (index <= 0) return undefined
  return USER_TABS[index - 1]
}

/**
 * Check if tab is the first tab
 */
export function isFirstTab(id: string): boolean {
  return getTabIndex(id) === 0
}

/**
 * Check if tab is the last tab
 */
export function isLastTab(id: string): boolean {
  return getTabIndex(id) === USER_TABS.length - 1
}

/**
 * Get tab number (1-indexed for display)
 */
export function getTabNumber(id: string): number {
  return getTabIndex(id) + 1
}

/**
 * URL param names by mode
 */
export const TAB_URL_PARAMS = {
  create: 'step',
  view: 'tab',
  edit: 'tab',
} as const

export type UserWorkspaceMode = 'create' | 'view' | 'edit'

/**
 * Get default tab for a mode
 */
export function getDefaultTab(): UserTabId {
  return 'basics'
}
