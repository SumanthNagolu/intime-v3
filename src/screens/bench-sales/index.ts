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
export { consultantOnboardScreen } from './consultant-onboard.screen';

// Vendor Bench (Third-party consultants)
export { vendorBenchListScreen } from './vendor-bench-list.screen';

// Marketing Screens
export { marketingProfilesScreen } from './marketing-profiles.screen';
export { marketingProfileEditorScreen } from './marketing-profile-editor.screen';

// Hotlist Screens
export { hotlistListScreen } from './hotlist-list.screen';
export { hotlistDetailScreen } from './hotlist-detail.screen';

// Job Order Screens
export { jobOrderListScreen } from './job-order-list.screen';
export { jobOrderDetailScreen } from './job-order-detail.screen';
export { jobOrderSubmitScreen } from './job-order-submit.screen';

// Vendor Screens
export { vendorListScreen } from './vendor-list.screen';
export { vendorDetailScreen } from './vendor-detail.screen';
export { vendorOnboardScreen } from './vendor-onboard.screen';

// Immigration Screens
export { immigrationDashboardScreen } from './immigration-dashboard.screen';
export { immigrationCaseDetailScreen } from './immigration-case-detail.screen';

// Placement Screens
export { benchPlacementsListScreen } from './bench-placements-list.screen';
export { benchPlacementDetailScreen } from './bench-placement-detail.screen';

// Commission Screen
export { commissionDashboardScreen } from './commission-dashboard.screen';

// Activities Screen
export { benchActivitiesScreen } from './bench-activities.screen';

// Screen Registry Entry
export const benchSalesScreens = {
  // Dashboard
  'bench-dashboard': () => import('./bench-dashboard.screen').then(m => m.benchDashboardScreen),

  // Consultants
  'consultant-list': () => import('./consultant-list.screen').then(m => m.consultantListScreen),
  'bench-consultant-detail': () => import('./consultant-detail.screen').then(m => m.consultantDetailScreen),
  'consultant-onboard': () => import('./consultant-onboard.screen').then(m => m.consultantOnboardScreen),

  // Vendor Bench
  'vendor-bench-list': () => import('./vendor-bench-list.screen').then(m => m.vendorBenchListScreen),

  // Marketing
  'marketing-profiles': () => import('./marketing-profiles.screen').then(m => m.marketingProfilesScreen),
  'marketing-profile-editor': () => import('./marketing-profile-editor.screen').then(m => m.marketingProfileEditorScreen),

  // Hotlists
  'hotlist-list': () => import('./hotlist-list.screen').then(m => m.hotlistListScreen),
  'hotlist-detail': () => import('./hotlist-detail.screen').then(m => m.hotlistDetailScreen),

  // Job Orders
  'job-order-list': () => import('./job-order-list.screen').then(m => m.jobOrderListScreen),
  'job-order-detail': () => import('./job-order-detail.screen').then(m => m.jobOrderDetailScreen),
  'job-order-submit': () => import('./job-order-submit.screen').then(m => m.jobOrderSubmitScreen),

  // Vendors
  'vendor-list': () => import('./vendor-list.screen').then(m => m.vendorListScreen),
  'vendor-detail': () => import('./vendor-detail.screen').then(m => m.vendorDetailScreen),
  'vendor-onboard': () => import('./vendor-onboard.screen').then(m => m.vendorOnboardScreen),

  // Immigration
  'immigration-dashboard': () => import('./immigration-dashboard.screen').then(m => m.immigrationDashboardScreen),
  'immigration-case-detail': () => import('./immigration-case-detail.screen').then(m => m.immigrationCaseDetailScreen),

  // Placements
  'bench-placements-list': () => import('./bench-placements-list.screen').then(m => m.benchPlacementsListScreen),
  'bench-placement-detail': () => import('./bench-placement-detail.screen').then(m => m.benchPlacementDetailScreen),

  // Commission
  'commission-dashboard': () => import('./commission-dashboard.screen').then(m => m.commissionDashboardScreen),

  // Activities
  'bench-activities': () => import('./bench-activities.screen').then(m => m.benchActivitiesScreen),
} as const;

export type BenchSalesScreenId = keyof typeof benchSalesScreens;
