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

// Hotlist Screens
export { hotlistListScreen } from './hotlist-list.screen';
export { hotlistDetailScreen } from './hotlist-detail.screen';

// Job Order Screens
export { jobOrderListScreen } from './job-order-list.screen';
export { jobOrderDetailScreen } from './job-order-detail.screen';

// Vendor Screens
export { vendorListScreen } from './vendor-list.screen';
export { vendorDetailScreen } from './vendor-detail.screen';

// Screen Registry Entry
export const benchSalesScreens = {
  'bench-dashboard': () => import('./bench-dashboard.screen').then(m => m.benchDashboardScreen),
  'consultant-list': () => import('./consultant-list.screen').then(m => m.consultantListScreen),
  'bench-consultant-detail': () => import('./consultant-detail.screen').then(m => m.consultantDetailScreen),
  'hotlist-list': () => import('./hotlist-list.screen').then(m => m.hotlistListScreen),
  'hotlist-detail': () => import('./hotlist-detail.screen').then(m => m.hotlistDetailScreen),
  'job-order-list': () => import('./job-order-list.screen').then(m => m.jobOrderListScreen),
  'job-order-detail': () => import('./job-order-detail.screen').then(m => m.jobOrderDetailScreen),
  'vendor-list': () => import('./vendor-list.screen').then(m => m.vendorListScreen),
  'vendor-detail': () => import('./vendor-detail.screen').then(m => m.vendorDetailScreen),
} as const;

export type BenchSalesScreenId = keyof typeof benchSalesScreens;

