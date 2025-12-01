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
export * from './recruiting';
export { recruitingScreens } from './recruiting';

// ============================================
// BENCH SALES SCREENS
// ============================================
export * from './bench-sales';
export { benchSalesScreens } from './bench-sales';

// ============================================
// CRM/TA SCREENS
// ============================================
export * from './crm';
export { crmScreens } from './crm';

// ============================================
// OPERATIONS/MANAGER SCREENS
// ============================================
export * from './operations';
export { operationsScreens } from './operations';

// ============================================
// COMBINED SCREEN REGISTRY
// ============================================
import { recruitingScreens, type RecruitingScreenId } from './recruiting';
import { benchSalesScreens, type BenchSalesScreenId } from './bench-sales';
import { crmScreens, type CrmScreenId } from './crm';
import { operationsScreens, type OperationsScreenId } from './operations';
import type { ScreenDefinition } from '@/lib/metadata/types';

export const screenRegistry = {
  ...recruitingScreens,
  ...benchSalesScreens,
  ...crmScreens,
  ...operationsScreens,
} as const;

export type ScreenId = RecruitingScreenId | BenchSalesScreenId | CrmScreenId | OperationsScreenId;

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
export function getScreenIdsByDomain(domain: 'recruiting' | 'bench-sales' | 'crm'): ScreenId[] {
  switch (domain) {
    case 'recruiting':
      return Object.keys(recruitingScreens) as RecruitingScreenId[];
    case 'bench-sales':
      return Object.keys(benchSalesScreens) as BenchSalesScreenId[];
    case 'crm':
      return Object.keys(crmScreens) as CrmScreenId[];
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
