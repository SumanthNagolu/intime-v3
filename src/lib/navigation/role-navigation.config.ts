import type { RoleCategory } from '@/lib/auth/permission-types'

/**
 * Defines which top navigation tabs are visible for each role category.
 * Pod ICs and Managers see the same tabs (they do the same end-to-end work).
 */

// Tab IDs from top-navigation.ts
type TabId = 'workspace' | 'accounts' | 'contacts' | 'jobs' | 'candidates' | 'crm' | 'pipeline' | 'finance' | 'hr' | 'admin'

interface RoleNavigationConfig {
  visibleTabs: TabId[]
  defaultTab: TabId
  defaultPath: string
}

export const ROLE_NAVIGATION_CONFIG: Record<RoleCategory, RoleNavigationConfig> = {
  // Admin - full access, default to Administration
  admin: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline', 'finance', 'hr', 'admin'],
    defaultTab: 'admin',
    defaultPath: '/employee/admin/dashboard',
  },

  // Executive - full access, default to My Work (dashboard focus)
  executive: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline', 'finance', 'hr', 'admin'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Leadership - full access except some admin settings
  leadership: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline', 'finance', 'hr', 'admin'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Pod Manager - same as IC (end-to-end workflow) + team visibility
  pod_manager: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Pod IC (Recruiter, Bench Sales, TA) - full workflow access
  pod_ic: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Portal users (client, candidate) - not applicable for employee portal
  portal: {
    visibleTabs: ['workspace'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
}

// Role-specific overrides (role codes get different tabs than their category default)
export const ROLE_CODE_OVERRIDES: Record<string, RoleNavigationConfig> = {
  // ============================================================
  // RECRUITING ROLES - Full recruiting workflow access
  // ============================================================
  recruiter: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  senior_recruiter: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  recruiting_manager: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  
  // ============================================================
  // BENCH SALES ROLES - Same as recruiting workflow
  // ============================================================
  bench_sales: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  bench_sales_rep: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  bench_manager: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  
  // ============================================================
  // TA (TALENT ACQUISITION) ROLES - Same as recruiting workflow
  // ============================================================
  ta_specialist: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  ta_manager: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  
  // ============================================================
  // HR ROLES - HR-focused tabs (includes Finance for payroll/billing)
  // ============================================================
  hr_manager: {
    visibleTabs: ['workspace', 'contacts', 'finance', 'hr'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  hr_specialist: {
    visibleTabs: ['workspace', 'contacts', 'finance', 'hr'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  hr_admin: {
    visibleTabs: ['workspace', 'contacts', 'finance', 'hr'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  hr: {
    visibleTabs: ['workspace', 'contacts', 'finance', 'hr'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  
  // ============================================================
  // FINANCE ROLES - Finance-focused tabs
  // ============================================================
  finance_manager: {
    visibleTabs: ['workspace', 'accounts', 'pipeline', 'finance'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  finance_specialist: {
    visibleTabs: ['workspace', 'pipeline', 'finance'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  finance: {
    visibleTabs: ['workspace', 'pipeline', 'finance'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
  
  // ============================================================
  // ADMIN ROLES - Admin-focused tabs
  // ============================================================
  admin: {
    visibleTabs: ['workspace', 'hr', 'admin'],
    defaultTab: 'admin',
    defaultPath: '/employee/admin/dashboard',
  },
  super_admin: {
    visibleTabs: ['workspace', 'hr', 'admin'],
    defaultTab: 'admin',
    defaultPath: '/employee/admin/dashboard',
  },
  system_admin: {
    visibleTabs: ['workspace', 'hr', 'admin'],
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
