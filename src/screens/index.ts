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
// HR SCREENS
// ============================================
export { hrScreens } from './hr';

// ============================================
// ADMIN SCREENS
// ============================================
// Admin screens are exported directly from the combined section below

// ============================================
// PORTAL SCREENS
// ============================================
export * from './portals';

// ============================================
// COMBINED SCREEN REGISTRY
// ============================================
import { recruitingScreens, type RecruitingScreenId } from './recruiting';
import { benchSalesScreens, type BenchSalesScreenId } from './bench-sales';
import { crmScreens, type CrmScreenId } from './crm';
import { taScreens, type TaScreenId } from './ta';
import { operationsScreens, type OperationsScreenId } from './operations';
import { hrScreens, type HRScreenId } from './hr';
import { adminScreens } from './admin';
import {
  clientPortalScreens,
  talentPortalScreens,
  academyPortalScreens,
} from './portals';
import type { ScreenDefinition } from '@/lib/metadata/types';

/**
 * Combined screen registry for all domains.
 * Includes lazy-loading screens and direct screen definitions.
 */
export const screenRegistry = {
  // Employee modules (lazy-loaded)
  ...recruitingScreens,
  ...benchSalesScreens,
  ...crmScreens,
  ...taScreens,
  ...operationsScreens,
  ...hrScreens,
} as const;

/**
 * Admin screens registry (direct definitions).
 * Import separately for admin pages.
 */
export { adminScreens };

/**
 * Portal screen ID maps for external portals.
 */
export const portalScreenIds = {
  client: clientPortalScreens,
  talent: talentPortalScreens,
  academy: academyPortalScreens,
} as const;

export type ScreenId =
  | RecruitingScreenId
  | BenchSalesScreenId
  | CrmScreenId
  | TaScreenId
  | OperationsScreenId
  | HRScreenId;

export type AdminScreenId = keyof typeof adminScreens;

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
 * Get admin screen by ID (synchronous, no lazy loading)
 */
export function getAdminScreen(screenId: AdminScreenId): ScreenDefinition {
  const screen = adminScreens[screenId];
  if (!screen) {
    throw new Error(`Admin screen not found: ${screenId}`);
  }
  return screen;
}

/**
 * Get all screen IDs for a domain
 */
export function getScreenIdsByDomain(
  domain: 'recruiting' | 'bench-sales' | 'crm' | 'ta' | 'operations' | 'hr' | 'admin'
): string[] {
  switch (domain) {
    case 'recruiting':
      return Object.keys(recruitingScreens);
    case 'bench-sales':
      return Object.keys(benchSalesScreens);
    case 'crm':
      return Object.keys(crmScreens);
    case 'ta':
      return Object.keys(taScreens);
    case 'operations':
      return Object.keys(operationsScreens);
    case 'hr':
      return Object.keys(hrScreens);
    case 'admin':
      return Object.keys(adminScreens);
    default:
      return [];
  }
}

/**
 * Check if a screen exists in the lazy-loading registry
 */
export function hasScreen(screenId: string): screenId is ScreenId {
  return screenId in screenRegistry;
}

/**
 * Check if an admin screen exists
 */
export function hasAdminScreen(screenId: string): screenId is AdminScreenId {
  return screenId in adminScreens;
}
