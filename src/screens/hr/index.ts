/**
 * HR Screens Index
 *
 * Exports all HR-related screen definitions.
 * These screens are used by the ScreenRenderer to create metadata-driven UIs.
 *
 * @see docs/specs/20-USER-ROLES/05-hr/
 */

// Dashboard
export { hrDashboardScreen } from './hr-dashboard.screen';

// Employee Screens
export { employeeListScreen } from './employee-list.screen';
export { employeeDetailScreen } from './employee-detail.screen';

// Onboarding Screens
export { onboardingListScreen } from './onboarding-list.screen';
export { onboardingDetailScreen } from './onboarding-detail.screen';

// Time Off Screens
export { timeoffListScreen } from './timeoff-list.screen';

// Payroll Screens
export { payrollDashboardScreen } from './payroll-dashboard.screen';

// Benefits Screens
export { benefitsListScreen } from './benefits-list.screen';

// Performance Screens
export { performanceListScreen } from './performance-list.screen';

// Compliance Screens
export { complianceDashboardScreen } from './compliance-dashboard.screen';

// Pod/Team Screens
export { podListScreen } from './pod-list.screen';

// Screen Registry Entry
export const hrScreens = {
  // Dashboard
  'hr-dashboard': () => import('./hr-dashboard.screen').then(m => m.hrDashboardScreen),

  // Employee
  'employee-list': () => import('./employee-list.screen').then(m => m.employeeListScreen),
  'employee-detail': () => import('./employee-detail.screen').then(m => m.employeeDetailScreen),

  // Onboarding
  'onboarding-list': () => import('./onboarding-list.screen').then(m => m.onboardingListScreen),
  'onboarding-detail': () => import('./onboarding-detail.screen').then(m => m.onboardingDetailScreen),

  // Time Off
  'timeoff-list': () => import('./timeoff-list.screen').then(m => m.timeoffListScreen),

  // Payroll
  'payroll-dashboard': () => import('./payroll-dashboard.screen').then(m => m.payrollDashboardScreen),

  // Benefits
  'benefits-list': () => import('./benefits-list.screen').then(m => m.benefitsListScreen),

  // Performance
  'performance-list': () => import('./performance-list.screen').then(m => m.performanceListScreen),

  // Compliance
  'compliance-dashboard': () => import('./compliance-dashboard.screen').then(m => m.complianceDashboardScreen),

  // Pods
  'pod-list': () => import('./pod-list.screen').then(m => m.podListScreen),
} as const;

export type HRScreenId = keyof typeof hrScreens;
