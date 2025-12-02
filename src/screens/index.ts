/**
 * Screens Index
 * 
 * Central export for all screen definitions.
 * Provides lazy-loading screen registry for code-splitting.
 * 
 * Usage:
 * ```typescript
 * import { screenRegistry, loadScreen } from '@/screens';
 * 
 * // Get screen definition
 * const screen = await loadScreen('recruiter-dashboard');
 * 
 * // Or use directly
 * import { recruiterDashboardScreen } from '@/screens/recruiting';
 * ```
 */

// ============================================
// RECRUITING SCREENS
// ============================================
export { recruitingScreens } from './recruiting';

// ============================================
// BENCH SALES SCREENS
// ============================================
export { benchSalesScreens } from './bench-sales';

// ============================================
// CRM SCREENS
// ============================================
export { crmScreens } from './crm';

// ============================================
// TA (TALENT ACQUISITION) SCREENS
// ============================================
export { taScreens } from './ta';

// ============================================
// OPERATIONS/MANAGER SCREENS
// ============================================
export { operationsScreens } from './operations';

// ============================================
// COMBINED SCREEN REGISTRY
// ============================================
import { recruitingScreens, type RecruitingScreenId } from './recruiting';
import { benchSalesScreens, type BenchSalesScreenId } from './bench-sales';
import { crmScreens, type CrmScreenId } from './crm';
import { taScreens, type TaScreenId } from './ta';
import { operationsScreens, type OperationsScreenId } from './operations';
import type { ScreenDefinition } from '@/lib/metadata/types';

export const screenRegistry = {
  ...recruitingScreens,
  ...benchSalesScreens,
  ...crmScreens,
  ...taScreens,
  ...operationsScreens,
} as const;

export type ScreenId = RecruitingScreenId | BenchSalesScreenId | CrmScreenId | TaScreenId | OperationsScreenId;

/**
 * Load a screen definition by ID
 * Uses code-splitting for lazy loading
 */
export async function loadScreen(screenId: ScreenId): Promise<ScreenDefinition> {
  const loader = screenRegistry[screenId];
  if (!loader) {
    throw new Error(`Screen not found: ${screenId}`);
  }
  return await loader();
}

/**
 * Get all screen IDs for a domain
 */
export function getScreenIdsByDomain(domain: 'recruiting' | 'bench-sales' | 'crm' | 'ta' | 'operations'): ScreenId[] {
  switch (domain) {
    case 'recruiting':
      return Object.keys(recruitingScreens) as RecruitingScreenId[];
    case 'bench-sales':
      return Object.keys(benchSalesScreens) as BenchSalesScreenId[];
    case 'crm':
      return Object.keys(crmScreens) as CrmScreenId[];
    case 'ta':
      return Object.keys(taScreens) as TaScreenId[];
    case 'operations':
      return Object.keys(operationsScreens) as OperationsScreenId[];
    default:
      return [];
  }
}

/**
 * Check if a screen exists
 */
export function hasScreen(screenId: string): screenId is ScreenId {
  return screenId in screenRegistry;
}
