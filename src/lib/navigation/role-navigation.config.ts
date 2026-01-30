import type { RoleCategory } from '@/lib/auth/permission-types'

/**
 * Defines which top navigation tabs are visible for each role category.
 * Pod ICs and Managers see the same tabs (they do the same end-to-end work).
 */

// Tab IDs from top-navigation.ts
// Note: 'workspace' and 'team' merged into 'workspaces' dropdown
// Note: 'hr' and 'finance' merged into 'operations'
type TabId = 'workspaces' | 'accounts' | 'contacts' | 'jobs' | 'candidates' | 'crm' | 'operations' | 'admin'

interface RoleNavigationConfig {
  visibleTabs: TabId[]
  defaultTab: TabId
  defaultPath: string
}

export const ROLE_NAVIGATION_CONFIG: Record<RoleCategory, RoleNavigationConfig> = {
  // Admin - full access, default to Administration
  admin: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'operations', 'admin'],
    defaultTab: 'admin',
    defaultPath: '/employee/admin/dashboard',
  },

  // Executive - full access, default to My Work (dashboard focus)
  executive: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'operations', 'admin'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Leadership - full access except some admin settings
  leadership: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'operations', 'admin'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Pod Manager - same as IC (end-to-end workflow) + team visibility
  pod_manager: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Pod IC (Recruiter, Bench Sales, TA) - full workflow access
  pod_ic: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Portal users (client, candidate) - not applicable for employee portal
  portal: {
    visibleTabs: ['workspaces'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },
}

// Role-specific overrides (role codes get different tabs than their category default)
export const ROLE_CODE_OVERRIDES: Record<string, RoleNavigationConfig> = {
  // ============================================================
  // RECRUITING ROLES - Full recruiting workflow access
  // ============================================================
  recruiter: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },
  senior_recruiter: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },
  recruiting_manager: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },

  // ============================================================
  // BENCH SALES ROLES - Same as recruiting workflow
  // ============================================================
  bench_sales: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },
  bench_sales_rep: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },
  bench_manager: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },

  // ============================================================
  // TA (TALENT ACQUISITION) ROLES - Same as recruiting workflow
  // ============================================================
  ta_specialist: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },
  ta_manager: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm'],
    defaultTab: 'workspaces',
    defaultPath: '/employee/workspace/dashboard',
  },

  // ============================================================
  // HR ROLES - Operations-focused tabs (HR + Finance merged)
  // ============================================================
  hr_manager: {
    visibleTabs: ['workspaces', 'contacts', 'operations'],
    defaultTab: 'operations',
    defaultPath: '/employee/operations/employees',
  },
  hr_specialist: {
    visibleTabs: ['workspaces', 'contacts', 'operations'],
    defaultTab: 'operations',
    defaultPath: '/employee/operations/employees',
  },
  hr_admin: {
    visibleTabs: ['workspaces', 'contacts', 'operations'],
    defaultTab: 'operations',
    defaultPath: '/employee/operations/employees',
  },
  hr: {
    visibleTabs: ['workspaces', 'contacts', 'operations'],
    defaultTab: 'operations',
    defaultPath: '/employee/operations/employees',
  },

  // ============================================================
  // FINANCE ROLES - Operations-focused tabs (HR + Finance merged)
  // ============================================================
  finance_manager: {
    visibleTabs: ['workspaces', 'accounts', 'operations'],
    defaultTab: 'operations',
    defaultPath: '/employee/operations/invoices',
  },
  finance_specialist: {
    visibleTabs: ['workspaces', 'operations'],
    defaultTab: 'operations',
    defaultPath: '/employee/operations/invoices',
  },
  finance: {
    visibleTabs: ['workspaces', 'operations'],
    defaultTab: 'operations',
    defaultPath: '/employee/operations/invoices',
  },

  // ============================================================
  // ADMIN ROLES - Full access including admin tabs
  // ============================================================
  admin: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'operations', 'admin'],
    defaultTab: 'admin',
    defaultPath: '/employee/admin/dashboard',
  },
  super_admin: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'operations', 'admin'],
    defaultTab: 'admin',
    defaultPath: '/employee/admin/dashboard',
  },
  system_admin: {
    visibleTabs: ['workspaces', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'operations', 'admin'],
    defaultTab: 'admin',
    defaultPath: '/employee/admin/dashboard',
  },
}

/**
 * Get navigation config for a user based on their role
 */
export function getNavigationConfig(roleCode: string, roleCategory: RoleCategory | string): RoleNavigationConfig {
  // Check for role-specific override first
  if (ROLE_CODE_OVERRIDES[roleCode]) {
    return ROLE_CODE_OVERRIDES[roleCode]
  }

  // Fall back to category-based config
  const category = roleCategory as RoleCategory
  if (ROLE_NAVIGATION_CONFIG[category]) {
    return ROLE_NAVIGATION_CONFIG[category]
  }

  // Ultimate fallback - default to pod_ic config
  return ROLE_NAVIGATION_CONFIG.pod_ic
}

/**
 * Check if a tab is visible for a given role
 */
export function isTabVisible(tabId: string, roleCode: string, roleCategory: RoleCategory | string): boolean {
  const config = getNavigationConfig(roleCode, roleCategory)
  return config.visibleTabs.includes(tabId as TabId)
}
