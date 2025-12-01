/**
 * Bench Sales Screens Index
 * 
 * Exports all bench sales-related screen definitions.
 * These screens are used by the ScreenRenderer to create metadata-driven UIs.
 * 
 * @see docs/specs/20-USER-ROLES/02-bench-sales/
 */

// Dashboard
export { benchDashboardScreen } from './bench-dashboard.screen';

// Consultant Screens
export { consultantListScreen } from './consultant-list.screen';
export { consultantDetailScreen } from './consultant-detail.screen';

// Screen Registry Entry
export const benchSalesScreens = {
  'bench-dashboard': () => import('./bench-dashboard.screen').then(m => m.benchDashboardScreen),
  'consultant-list': () => import('./consultant-list.screen').then(m => m.consultantListScreen),
  'bench-consultant-detail': () => import('./consultant-detail.screen').then(m => m.consultantDetailScreen),
} as const;

export type BenchSalesScreenId = keyof typeof benchSalesScreens;

